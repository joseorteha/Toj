import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/gobierno/carga-masiva
 * Diagrama 9 — Fase 2-3: Procesa CSV y hace bulk insert de obligaciones.
 *
 * CSV esperado (columnas):
 *   curp, tipo_tramite, clave_catastral, monto, fecha_vencimiento
 *
 * Ejemplo:
 *   ORHJ001003HVZRXS03,Predial,PRED-NUEVO-001,1500.00,2026-12-31
 */
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const admin = createSupabaseServiceClient();

    // Verificar que el usuario tiene rol gobierno
    const { data: userProfile } = await admin
      .from('usuarios_plataforma')
      .select('tipo_usuario')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!userProfile || (userProfile.tipo_usuario !== 'ADMIN_GOBIERNO' && userProfile.tipo_usuario !== 'OPERADOR_GOBIERNO')) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Archivo CSV requerido' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.trim().split('\n').filter(l => l.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'El CSV debe tener al menos una fila de datos' }, { status: 400 });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const rows = lines.slice(1);

    // Validar columnas requeridas
    const requiredCols = ['curp'];
    const missingCols = requiredCols.filter(c => !headers.includes(c));
    if (missingCols.length > 0) {
      return NextResponse.json({ 
        error: `Columnas requeridas faltantes: ${missingCols.join(', ')}. Columnas encontradas: ${headers.join(', ')}` 
      }, { status: 400 });
    }

    let exitosos = 0;
    let errores = 0;
    const erroresDetalle: { fila: number; motivo: string }[] = [];

    // Institución por defecto (Zongolica)
    const institucionId = 'aaaaaaaa-0000-0000-0000-000000000001';

    // Registrar la carga masiva
    const { data: carga } = await admin
      .from('cargas_masivas')
      .insert({
        institucion_id: institucionId,
        nombre_archivo: file.name,
        tipo_datos: 'Padrón Municipal',
        registros_total: rows.length,
        registros_exitosos: 0,
        registros_error: 0,
        estado: 'Procesando',
        fecha_inicio: new Date().toISOString(),
      })
      .select('id')
      .single();

    const cargaId = carga?.id;

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      // Parsear CSV respetando comillas
      const cols = rows[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });

      // Saltar filas vacías
      if (!row['curp'] || row['curp'].length < 10) {
        errores++;
        erroresDetalle.push({ fila: i + 2, motivo: 'CURP vacío o inválido' });
        continue;
      }

      try {
        // Buscar ciudadano por CURP
        const { data: ciudadano } = await admin
          .from('ciudadanos')
          .select('id')
          .eq('curp', row['curp'].toUpperCase())
          .maybeSingle();

        if (!ciudadano) {
          errores++;
          erroresDetalle.push({ fila: i + 2, motivo: `CURP "${row['curp']}" no encontrado en el sistema` });
          
          // Registrar error en tabla de errores
          if (cargaId) {
            await admin.from('carga_masiva_errores').insert({
              carga_masiva_id: cargaId,
              row_number: i + 2,
              curp: row['curp'],
              error_code: 'CURP_NOT_FOUND',
              error_message: `CURP no encontrado: ${row['curp']}`,
              raw_row: row,
            });
          }
          continue;
        }

        // Parsear monto
        const montoStr = row['monto'] || row['monto_total'] || '0';
        const monto = parseFloat(montoStr.replace(/[$,]/g, '')) || 0;

        // Parsear fecha
        let fechaVenc = row['fecha_vencimiento'] || row['vencimiento'] || null;
        if (fechaVenc && !/^\d{4}-\d{2}-\d{2}$/.test(fechaVenc)) {
          // Intentar parsear otros formatos
          const parsed = new Date(fechaVenc);
          if (!isNaN(parsed.getTime())) {
            fechaVenc = parsed.toISOString().split('T')[0];
          } else {
            fechaVenc = null;
          }
        }

        // Verificar si ya existe esta obligación
        const idExterno = row['clave_catastral'] || row['id_externo'] || row['identificador'] || null;
        if (idExterno) {
          const { data: existing } = await admin
            .from('obligaciones')
            .select('id')
            .eq('ciudadano_id', ciudadano.id)
            .eq('identificador_externo', idExterno)
            .maybeSingle();

          if (existing) {
            errores++;
            erroresDetalle.push({ fila: i + 2, motivo: `Obligación ${idExterno} ya existe` });
            continue;
          }
        }

        // Insertar obligación
        await admin.from('obligaciones').insert({
          ciudadano_id: ciudadano.id,
          institucion_id: institucionId,
          carga_masiva_id: cargaId,
          tipo_tramite: row['tipo_tramite'] || row['tipo'] || 'Predial',
          identificador_externo: idExterno,
          monto_original: monto,
          monto_recargos: parseFloat(row['recargos'] || '0'),
          monto_total: monto + parseFloat(row['recargos'] || '0'),
          monto_pendiente: monto + parseFloat(row['recargos'] || '0'),
          fecha_vencimiento: fechaVenc,
          estado_cumplimiento: 'Al corriente',
          ejercicio: parseInt(row['ejercicio'] || new Date().getFullYear().toString()),
          periodo_referencia: row['periodo'] || `Anual ${new Date().getFullYear()}`,
          origen_registro: 'carga_masiva',
        });

        exitosos++;
      } catch (err) {
        errores++;
        const errMsg = err instanceof Error ? err.message : 'Error desconocido';
        erroresDetalle.push({ fila: i + 2, motivo: `Error de inserción: ${errMsg.slice(0, 50)}` });
      }
    }

    // Actualizar resumen de carga
    const estadoFinal = errores === rows.length ? 'Fallida' : errores > 0 ? 'CompletadaConErrores' : 'Completada';
    
    await admin
      .from('cargas_masivas')
      .update({
        registros_exitosos: exitosos,
        registros_error: errores,
        estado: estadoFinal,
        fecha_fin: new Date().toISOString(),
      })
      .eq('id', cargaId);

    // Emitir evento CARGA_MASIVA_TERMINADA → n8n (Diagrama 9, paso 14-15)
    await admin.from('eventos_dominio').insert({
      aggregate_type: 'carga_masiva',
      aggregate_id: cargaId,
      tipo_evento: 'CARGA_MASIVA_TERMINADA',
      payload: {
        archivo: file.name,
        total: rows.length,
        exitosos,
        errores,
        estado: estadoFinal,
      },
      origen: 'nextjs',
    });

    return NextResponse.json({
      success: true,
      total: rows.length,
      exitosos,
      errores,
      erroresDetalle: erroresDetalle.slice(0, 20),
    });
  } catch (err) {
    console.error('[carga-masiva]', err);
    return NextResponse.json({ error: 'Error procesando CSV' }, { status: 500 });
  }
}
