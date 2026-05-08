'use server';

import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Conciliar un pago pendiente manualmente
 * Diagrama 3: Transición STP_PENDIENTE → STP_CONFIRMADO → BD_ACTUALIZADA
 */
export async function conciliarPago(pagoId: string) {
  const admin = createSupabaseServiceClient();

  // 1. Obtener el pago y su obligación
  const { data: pago, error: pagoError } = await admin
    .from('pagos')
    .select('id, obligacion_id, ciudadano_id, monto_transferido, estado_conciliacion')
    .eq('id', pagoId)
    .single();

  if (pagoError || !pago) {
    return { success: false, error: 'Pago no encontrado' };
  }

  if (pago.estado_conciliacion === 'Conciliado') {
    return { success: false, error: 'El pago ya está conciliado' };
  }

  // 2. Actualizar estado del pago a Conciliado
  const { error: updateError } = await admin
    .from('pagos')
    .update({
      estado_conciliacion: 'Conciliado',
      fecha_conciliacion: new Date().toISOString(),
    })
    .eq('id', pagoId);

  if (updateError) {
    return { success: false, error: 'Error actualizando pago' };
  }

  // 3. Actualizar la obligación como Pagada
  if (pago.obligacion_id) {
    await admin
      .from('obligaciones')
      .update({
        estado_cumplimiento: 'Pagado',
        monto_pendiente: 0,
      })
      .eq('id', pago.obligacion_id);
  }

  // 4. Registrar evento PAGO_CONFIRMADO para n8n (Diagrama 6)
  await admin.from('eventos_dominio').insert({
    aggregate_type: 'pago',
    aggregate_id: pagoId,
    tipo_evento: 'PAGO_CONFIRMADO',
    payload: {
      ciudadano_id: pago.ciudadano_id,
      monto: pago.monto_transferido,
      conciliado_manualmente: true,
    },
    origen: 'admin_conciliacion',
  });

  // 5. Registrar en historial de estados
  await admin.from('historial_estado_pagos').insert({
    pago_id: pagoId,
    estado_anterior: pago.estado_conciliacion,
    estado_nuevo: 'Conciliado',
    fuente_evento: 'conciliacion_manual',
    payload_evento: { admin_action: true },
  });

  revalidatePath('/admin/conciliacion');
  revalidatePath('/admin');

  return { success: true };
}

/**
 * Marcar un pago como Observado (requiere revisión)
 */
export async function marcarObservado(pagoId: string, motivo: string) {
  const admin = createSupabaseServiceClient();

  const { data: pago } = await admin
    .from('pagos')
    .select('estado_conciliacion')
    .eq('id', pagoId)
    .single();

  if (!pago) {
    return { success: false, error: 'Pago no encontrado' };
  }

  await admin
    .from('pagos')
    .update({ estado_conciliacion: 'Observado' })
    .eq('id', pagoId);

  await admin.from('historial_estado_pagos').insert({
    pago_id: pagoId,
    estado_anterior: pago.estado_conciliacion,
    estado_nuevo: 'Observado',
    fuente_evento: 'observacion_manual',
    payload_evento: { motivo },
  });

  revalidatePath('/admin/conciliacion');
  return { success: true };
}

/**
 * Rechazar un pago
 */
export async function rechazarPago(pagoId: string, motivo: string) {
  const admin = createSupabaseServiceClient();

  const { data: pago } = await admin
    .from('pagos')
    .select('estado_conciliacion, obligacion_id')
    .eq('id', pagoId)
    .single();

  if (!pago) {
    return { success: false, error: 'Pago no encontrado' };
  }

  await admin
    .from('pagos')
    .update({ estado_conciliacion: 'Rechazado' })
    .eq('id', pagoId);

  await admin.from('historial_estado_pagos').insert({
    pago_id: pagoId,
    estado_anterior: pago.estado_conciliacion,
    estado_nuevo: 'Rechazado',
    fuente_evento: 'rechazo_manual',
    payload_evento: { motivo },
  });

  revalidatePath('/admin/conciliacion');
  return { success: true };
}
