'use server';

import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Aprobar una solicitud KYC
 * Diagrama 8: Flujo KYC - FASE 4: REGISTRO EN BD
 * Acepta FormData para compatibilidad con el componente existente
 */
export async function aprobarKyc(formData: FormData) {
  const solicitudId = formData.get('solicitud_id') as string;
  const ciudadanoId = formData.get('ciudadano_id') as string;

  if (!solicitudId || !ciudadanoId) {
    return { error: 'Datos incompletos' };
  }

  const admin = createSupabaseServiceClient();

  // 1. Actualizar la solicitud KYC
  const { error: kycError } = await admin
    .from('kyc_solicitudes')
    .update({
      estado: 'Verificado',
      completed_at: new Date().toISOString(),
    })
    .eq('id', solicitudId);

  if (kycError) {
    return { error: 'Error actualizando solicitud KYC' };
  }

  // 2. Actualizar el ciudadano a Verificado
  await admin
    .from('ciudadanos')
    .update({
      estado_kyc: 'Verificado',
      timestamp_kyc_verificado: new Date().toISOString(),
    })
    .eq('id', ciudadanoId);

  // 3. Emitir evento KYC_COMPLETADO para n8n (Diagrama 6)
  await admin.from('eventos_dominio').insert({
    aggregate_type: 'ciudadano',
    aggregate_id: ciudadanoId,
    tipo_evento: 'KYC_COMPLETADO',
    payload: {
      solicitud_id: solicitudId,
      resultado: 'APROBADO',
      aprobado_por: 'admin_manual',
    },
    origen: 'admin_kyc',
  });

  // 4. Registrar en bitácora de auditoría
  await admin.from('bitacora_auditoria').insert({
    ciudadano_id: ciudadanoId,
    accion: 'KYC Aprobado manualmente',
    detalles: JSON.stringify({ solicitud_id: solicitudId }),
    entity_type: 'kyc_solicitudes',
    entity_id: solicitudId,
  });

  revalidatePath('/admin/kyc');
  revalidatePath('/admin');

  return { success: true };
}

/**
 * Rechazar una solicitud KYC
 * Acepta FormData para compatibilidad con el componente existente
 */
export async function rechazarKyc(formData: FormData) {
  const solicitudId = formData.get('solicitud_id') as string;
  const ciudadanoId = formData.get('ciudadano_id') as string;
  const motivo = formData.get('motivo') as string || 'Documentos no válidos';

  if (!solicitudId || !ciudadanoId) {
    return { error: 'Datos incompletos' };
  }

  const admin = createSupabaseServiceClient();

  // 1. Actualizar la solicitud KYC
  await admin
    .from('kyc_solicitudes')
    .update({
      estado: 'Rechazado',
      motivo_rechazo: motivo,
      completed_at: new Date().toISOString(),
    })
    .eq('id', solicitudId);

  // 2. Actualizar el ciudadano a Rechazado
  await admin
    .from('ciudadanos')
    .update({ estado_kyc: 'Rechazado' })
    .eq('id', ciudadanoId);

  // 3. Emitir evento para n8n
  await admin.from('eventos_dominio').insert({
    aggregate_type: 'ciudadano',
    aggregate_id: ciudadanoId,
    tipo_evento: 'KYC_RECHAZADO',
    payload: {
      solicitud_id: solicitudId,
      motivo,
    },
    origen: 'admin_kyc',
  });

  // 4. Registrar en bitácora
  await admin.from('bitacora_auditoria').insert({
    ciudadano_id: ciudadanoId,
    accion: 'KYC Rechazado',
    detalles: JSON.stringify({ solicitud_id: solicitudId, motivo }),
    entity_type: 'kyc_solicitudes',
    entity_id: solicitudId,
  });

  revalidatePath('/admin/kyc');
  revalidatePath('/admin');

  return { success: true };
}

/**
 * Solicitar más información (volver a EnProceso)
 */
export async function solicitarMasInfo(formData: FormData) {
  const solicitudId = formData.get('solicitud_id') as string;
  const ciudadanoId = formData.get('ciudadano_id') as string;
  const comentario = formData.get('comentario') as string || 'Se requiere información adicional';

  if (!solicitudId || !ciudadanoId) {
    return { error: 'Datos incompletos' };
  }

  const admin = createSupabaseServiceClient();

  await admin
    .from('kyc_solicitudes')
    .update({
      estado: 'EnProceso',
      motivo_rechazo: `Información adicional requerida: ${comentario}`,
    })
    .eq('id', solicitudId);

  await admin
    .from('ciudadanos')
    .update({ estado_kyc: 'EnProceso' })
    .eq('id', ciudadanoId);

  await admin.from('bitacora_auditoria').insert({
    ciudadano_id: ciudadanoId,
    accion: 'KYC - Información adicional solicitada',
    detalles: JSON.stringify({ solicitud_id: solicitudId, comentario }),
    entity_type: 'kyc_solicitudes',
    entity_id: solicitudId,
  });

  revalidatePath('/admin/kyc');

  return { success: true };
}
