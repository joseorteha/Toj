import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isDemoCiudadano, MOCK_CIUDADANO, MOCK_OBLIGACIONES, MOCK_PAGOS_CIUDADANO } from '@/lib/mock-data';

// ═══════════════════════════════════════════════════════════════════════════
// OBTENER CONTEXTO FINANCIERO DEL USUARIO DESDE LA BD
// ═══════════════════════════════════════════════════════════════════════════
async function obtenerContextoUsuario(userId: string, userEmail: string) {
  // Modo demo: retornar datos mock
  if (isDemoCiudadano(userEmail)) {
    const obligacionesPendientes = MOCK_OBLIGACIONES.filter(o => o.estado_cumplimiento !== 'Pagado');
    const vencidas     = MOCK_OBLIGACIONES.filter(o => o.estado_cumplimiento === 'Vencido');
    const porVencer    = MOCK_OBLIGACIONES.filter(o => o.estado_cumplimiento === 'Por vencer');
    const alCorriente  = MOCK_OBLIGACIONES.filter(o => o.estado_cumplimiento === 'Al corriente');
    const totalDeuda   = obligacionesPendientes.reduce((s, o) => s + (o.monto_pendiente ?? o.monto_total), 0);
    const totalPagado  = MOCK_PAGOS_CIUDADANO.reduce((s, p) => s + p.monto, 0);

    // Score de salud financiera (0-100)
    let score = 100;
    score -= vencidas.length * 25;
    score -= porVencer.length * 10;
    score = Math.max(0, score);

    return {
      nombre: MOCK_CIUDADANO.nombre_completo,
      estadoKyc: MOCK_CIUDADANO.estado_kyc,
      saldo: MOCK_CIUDADANO.saldo_wallet,
      clabe: MOCK_CIUDADANO.cuenta_stp_clabe,
      obligaciones: MOCK_OBLIGACIONES,
      pagosRecientes: MOCK_PAGOS_CIUDADANO,
      totalDeuda,
      totalPagado,
      vencidas: vencidas.length,
      porVencer: porVencer.length,
      alCorriente: alCorriente.length,
      score,
    };
  }

  // Modo real: consultar Supabase
  try {
    const admin = createSupabaseServiceClient();

    const { data: usuario } = await admin
      .from('usuarios_plataforma')
      .select('ciudadano_id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    const ciudadanoId = usuario?.ciudadano_id ?? userId;

    const [ciudadanoRes, obligacionesRes, pagosRes] = await Promise.all([
      admin.from('ciudadanos')
        .select('nombre_completo, estado_kyc, saldo_wallet, cuenta_stp_clabe')
        .eq('id', ciudadanoId).maybeSingle(),
      admin.from('obligaciones')
        .select('tipo_tramite, monto_total, monto_pendiente, fecha_vencimiento, estado_cumplimiento')
        .eq('ciudadano_id', ciudadanoId)
        .order('fecha_vencimiento', { ascending: true })
        .limit(10),
      admin.from('pagos')
        .select('monto_transferido, estado_conciliacion, created_at, obligaciones(tipo_tramite)')
        .in('obligacion_id',
          (await admin.from('obligaciones').select('id').eq('ciudadano_id', ciudadanoId)).data?.map(o => o.id) ?? []
        )
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const obligaciones = obligacionesRes.data ?? [];
    const pagos = pagosRes.data ?? [];

    const vencidas    = obligaciones.filter((o: any) => o.estado_cumplimiento === 'Vencido').length;
    const porVencer   = obligaciones.filter((o: any) => o.estado_cumplimiento === 'Por vencer').length;
    const alCorriente = obligaciones.filter((o: any) => o.estado_cumplimiento === 'Al corriente').length;
    const totalDeuda  = obligaciones
      .filter((o: any) => o.estado_cumplimiento !== 'Pagado')
      .reduce((s: number, o: any) => s + Number(o.monto_pendiente ?? o.monto_total), 0);
    const totalPagado = pagos
      .filter((p: any) => p.estado_conciliacion === 'Conciliado')
      .reduce((s: number, p: any) => s + Number(p.monto_transferido), 0);

    let score = 100;
    score -= vencidas * 25;
    score -= porVencer * 10;
    score = Math.max(0, score);

    return {
      nombre: ciudadanoRes.data?.nombre_completo ?? 'Ciudadano',
      estadoKyc: ciudadanoRes.data?.estado_kyc ?? 'Pendiente',
      saldo: Number(ciudadanoRes.data?.saldo_wallet ?? 0),
      clabe: ciudadanoRes.data?.cuenta_stp_clabe ?? 'No asignada',
      obligaciones,
      pagosRecientes: pagos,
      totalDeuda,
      totalPagado,
      vencidas,
      porVencer,
      alCorriente,
      score,
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUIR SYSTEM PROMPT CON CONTEXTO REAL
// ═══════════════════════════════════════════════════════════════════════════
function construirSystemPrompt(ctx: Awaited<ReturnType<typeof obtenerContextoUsuario>>) {
  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  let perfilSeccion = '';
  if (ctx) {
    const nivelSalud = ctx.score >= 80 ? '🟢 Buena' : ctx.score >= 50 ? '🟡 Regular' : '🔴 Crítica';
    const scoreBar = '█'.repeat(Math.round(ctx.score / 10)) + '░'.repeat(10 - Math.round(ctx.score / 10));

    const obligacionesTexto = ctx.obligaciones.map((o: any) => {
      const estado = o.estado_cumplimiento;
      const emoji = estado === 'Vencido' ? '❌' : estado === 'Por vencer' ? '⚠️' : estado === 'Pagado' ? '✅' : '📋';
      const monto = fmt(Number(o.monto_pendiente ?? o.monto_total));
      return `  ${emoji} ${o.tipo_tramite}: ${monto} — ${estado} (vence: ${o.fecha_vencimiento})`;
    }).join('\n');

    const pagosTexto = ctx.pagosRecientes.length > 0
      ? ctx.pagosRecientes.map((p: any) => {
          const concepto = (p as any).obligaciones?.tipo_tramite ?? 'Pago';
          const monto = fmt(Number(p.monto_transferido ?? p.monto));
          return `  ✅ ${concepto}: ${monto}`;
        }).join('\n')
      : '  (Sin pagos recientes registrados)';

    perfilSeccion = `
## 🧾 PERFIL FINANCIERO ACTUAL DEL USUARIO
Nombre: ${ctx.nombre}
KYC: ${ctx.estadoKyc}
Saldo wallet: ${fmt(ctx.saldo)}
CLABE personal: ${ctx.clabe}

### 📊 Salud Financiera: ${nivelSalud} — Score: ${ctx.score}/100
${scoreBar} ${ctx.score}pts
- Obligaciones vencidas: ${ctx.vencidas} (−25pts c/u)
- Por vencer pronto: ${ctx.porVencer} (−10pts c/u)
- Al corriente: ${ctx.alCorriente}

### 💸 Deuda total pendiente: ${fmt(ctx.totalDeuda)}
### ✅ Total pagado (histórico): ${fmt(ctx.totalPagado)}

### 📋 Obligaciones activas:
${obligacionesTexto || '  (Sin obligaciones registradas)'}

### 🕐 Pagos recientes:
${pagosTexto}

### 💡 Análisis automático:
${ctx.vencidas > 0 ? `⚠️ ALERTA: Tiene ${ctx.vencidas} obligación(es) VENCIDA(S). Generan recargos del 5% mensual.` : ''}
${ctx.porVencer > 0 ? `⏰ ATENCIÓN: ${ctx.porVencer} obligación(es) por vencer pronto. Si paga antes, aplica 20% de descuento.` : ''}
${ctx.vencidas === 0 && ctx.porVencer === 0 ? '✅ ¡Todo en orden! No hay obligaciones urgentes.' : ''}
`;
  }

  return `Eres TOJ Assistant, el asesor financiero personal e inteligente del municipio de Zongolica, Veracruz.

## Tu identidad
- Nombre: TOJ Assistant  
- Tono: Amigable, empático, claro. Usa emojis. Habla en español mexicano natural.
- Especialidad: Salud financiera municipal, obligaciones fiscales, pagos via STP/SPEI

## ¿Qué es TOJ?
Plataforma GovTech para que ciudadanos de Zongolica, Veracruz gestionen sus obligaciones municipales:
predial, agua potable, licencias comerciales, permisos. Pagos via SPEI/STP.
${perfilSeccion}
## Reglas clave
- USA SIEMPRE los datos reales del perfil arriba para responder. No los inventes.
- Si alguien pregunta "¿cuánto debo?", usa el total de deuda de su perfil.
- Si pregunta por su "salud financiera", explica su score y qué significa.
- Si tiene obligaciones vencidas, ALÉRTALO con empatía y explica los recargos.
- Si está al corriente, felicítalo 🎉
- Para pagar: dile que vaya a "Obligaciones" en el dashboard y haga clic en "Pagar".
- Descuento por pronto pago: 20% si paga antes de vencer.
- Recargo por mora: 5% mensual acumulado.
- Sé conciso: máximo 3-4 párrafos. Usa listas cuando sea útil.
- Si la pregunta no tiene que ver con finanzas/TOJ, redirige amablemente.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
    }

    // Obtener contexto financiero real del usuario
    const contexto = await obtenerContextoUsuario(user.id, user.email ?? '');
    const systemPrompt = construirSystemPrompt(contexto);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        max_tokens: 600,
        temperature: 0.65,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-12),
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('[OpenAI]', errText);
      return NextResponse.json({ error: 'Error de OpenAI' }, { status: 500 });
    }

    return new Response(openaiResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[IA Chat]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
