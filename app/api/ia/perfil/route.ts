import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isDemoCiudadano, MOCK_CIUDADANO, MOCK_OBLIGACIONES, MOCK_PAGOS_CIUDADANO } from '@/lib/mock-data';

/**
 * GET /api/ia/perfil
 * Devuelve el resumen financiero del usuario para mostrar en la UI del asistente.
 */
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    // MODO DEMO
    if (isDemoCiudadano(user.email)) {
      const pendientes = MOCK_OBLIGACIONES.filter(o => o.estado_cumplimiento !== 'Pagado');
      const vencidas   = pendientes.filter(o => o.estado_cumplimiento === 'Vencido');
      const porVencer  = pendientes.filter(o => o.estado_cumplimiento === 'Por vencer');
      const totalDeuda = pendientes.reduce((s, o) => s + (o.monto_pendiente ?? o.monto_total), 0);
      let score = 100 - vencidas.length * 25 - porVencer.length * 10;
      score = Math.max(0, score);

      return NextResponse.json({
        nombre: MOCK_CIUDADANO.nombre_completo.split(' ')[0],
        score,
        totalDeuda,
        totalPagado: MOCK_PAGOS_CIUDADANO.reduce((s, p) => s + p.monto, 0),
        vencidas: vencidas.length,
        porVencer: porVencer.length,
        alCorriente: pendientes.filter(o => o.estado_cumplimiento === 'Al corriente').length,
        saldo: MOCK_CIUDADANO.saldo_wallet,
        obligacionesUrgentes: [...vencidas, ...porVencer].slice(0, 3),
      });
    }

    // MODO REAL
    const admin = createSupabaseServiceClient();
    const { data: usuario } = await admin
      .from('usuarios_plataforma').select('ciudadano_id')
      .eq('auth_user_id', user.id).maybeSingle();
    const ciudadanoId = usuario?.ciudadano_id ?? user.id;

    const [ciudadano, obligaciones, pagos] = await Promise.all([
      admin.from('ciudadanos').select('nombre_completo, saldo_wallet').eq('id', ciudadanoId).maybeSingle(),
      admin.from('obligaciones')
        .select('tipo_tramite, monto_pendiente, monto_total, estado_cumplimiento, fecha_vencimiento')
        .eq('ciudadano_id', ciudadanoId),
      admin.from('pagos')
        .select('monto_transferido, estado_conciliacion')
        .in('obligacion_id',
          (await admin.from('obligaciones').select('id').eq('ciudadano_id', ciudadanoId)).data?.map(o => o.id) ?? []
        ),
    ]);

    const obs = obligaciones.data ?? [];
    const vencidas   = obs.filter((o: any) => o.estado_cumplimiento === 'Vencido');
    const porVencer  = obs.filter((o: any) => o.estado_cumplimiento === 'Por vencer');
    const pendientes = obs.filter((o: any) => o.estado_cumplimiento !== 'Pagado');
    const totalDeuda = pendientes.reduce((s: number, o: any) => s + Number(o.monto_pendiente ?? o.monto_total), 0);
    const totalPagado = (pagos.data ?? [])
      .filter((p: any) => p.estado_conciliacion === 'Conciliado')
      .reduce((s: number, p: any) => s + Number(p.monto_transferido), 0);
    let score = 100 - vencidas.length * 25 - porVencer.length * 10;
    score = Math.max(0, score);

    return NextResponse.json({
      nombre: ciudadano.data?.nombre_completo?.split(' ')[0] ?? 'Ciudadano',
      score,
      totalDeuda,
      totalPagado,
      vencidas: vencidas.length,
      porVencer: porVencer.length,
      alCorriente: obs.filter((o: any) => o.estado_cumplimiento === 'Al corriente').length,
      saldo: Number(ciudadano.data?.saldo_wallet ?? 0),
      obligacionesUrgentes: [...vencidas, ...porVencer].slice(0, 3),
    });
  } catch (err) {
    console.error('[IA Perfil]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
