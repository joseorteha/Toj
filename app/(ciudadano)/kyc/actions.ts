"use server";

import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { isDemoCiudadano } from '@/lib/mock-data';

/**
 * finalizarKyc — Sube selfie y comprobante a Supabase Storage,
 * actualiza el estado_kyc del ciudadano y registra el evento KYC_COMPLETADO.
 *
 * Diagrama 8 — Fase 4: Registro en BD
 * Diagrama 6 — Evento: KYC_COMPLETADO → dispara n8n
 */
export async function finalizarKyc(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // MODO DEMO: no hacer nada en la BD, retornar éxito
  if (isDemoCiudadano(user.email)) {
    return { success: true };
  }

  const admin = createSupabaseServiceClient();

  // Obtener el ciudadano_id desde la tabla de plataforma (o usar auth.user.id como fallback)
  const { data: usuario } = await admin
    .from('usuarios_plataforma')
    .select('ciudadano_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  const ciudadanoId = usuario?.ciudadano_id ?? user.id;

  // ── Subir archivos a Supabase Storage ─────────────────────────
  let urlSelfie: string | null = null;
  let urlComprobante: string | null = null;

  const selfieFile = formData.get('selfie') as File | null;
  const comprobanteFile = formData.get('comprobante') as File | null;

  if (selfieFile && selfieFile.size > 0) {
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const selfieExt = selfieFile.name.split('.').pop() ?? 'jpg';
    const selfiePath = `${ciudadanoId}/selfie.${selfieExt}`;

    const { error: selfieError } = await admin.storage
      .from('kyc-selfies')
      .upload(selfiePath, selfieBuffer, {
        contentType: selfieFile.type,
        upsert: true,
      });

    if (!selfieError) {
      const { data: publicUrl } = admin.storage
        .from('kyc-selfies')
        .getPublicUrl(selfiePath);
      urlSelfie = publicUrl.publicUrl;
    }
  }

  if (comprobanteFile && comprobanteFile.size > 0) {
    const compBuffer = Buffer.from(await comprobanteFile.arrayBuffer());
    const compExt = comprobanteFile.name.split('.').pop() ?? 'pdf';
    const compPath = `${ciudadanoId}/comprobante.${compExt}`;

    const { error: compError } = await admin.storage
      .from('kyc-documentos')
      .upload(compPath, compBuffer, {
        contentType: comprobanteFile.type,
        upsert: true,
      });

    if (!compError) {
      const { data: publicUrl } = admin.storage
        .from('kyc-documentos')
        .getPublicUrl(compPath);
      urlComprobante = publicUrl.publicUrl;
    }
  }

  // ── Actualizar estado KYC del ciudadano ───────────────────────
  await admin
    .from('ciudadanos')
    .update({
      estado_kyc: 'EnProceso',
      ...(urlSelfie && { url_selfie_liveness: urlSelfie }),
      ...(urlComprobante && { url_ine_frente: urlComprobante }),
    })
    .eq('id', ciudadanoId);

  // ── Registrar solicitud KYC (demo — score hardcodeado) ────────
  await admin
    .from('kyc_solicitudes')
    .insert({
      ciudadano_id: ciudadanoId,
      proveedor: 'demo',
      tipo_validacion: 'selfie_ine',
      estado: 'EnProceso',
      score_confianza: 96,
      request_payload: {},
      response_payload: { aprobado: true },
      motivo_rechazo: null,
      correlation_id: null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  // ── Registrar validación RENAPO (demo) ────────────────────────
  await admin
    .from('renapo_validaciones')
    .insert({
      ciudadano_id: ciudadanoId,
      resultado: 'VALIDO',
      score_confianza: '96',
    });

  // ── Registrar expedientes ────────────────────────────────────
  await admin
    .from('expedientes')
    .insert([
      {
        ciudadano_id: ciudadanoId,
        tipo_documento: 'INE',
        estado_ocr: 'Pendiente',
        url_archivo_s3: urlComprobante,
      },
      {
        ciudadano_id: ciudadanoId,
        tipo_documento: 'Selfie',
        estado_ocr: 'Pendiente',
        url_archivo_s3: urlSelfie,
      },
    ]);

  // ── Emitir evento KYC_COMPLETADO (Diagrama 6 → dispara n8n) ──
  await admin
    .from('eventos_dominio')
    .insert({
      aggregate_type: 'ciudadano',
      aggregate_id: ciudadanoId,
      tipo_evento: 'KYC_COMPLETADO',
      payload: {
        selfie_url: urlSelfie,
        comprobante_url: urlComprobante,
        score_confianza: 96,
        proveedor: 'demo',
      },
      origen: 'nextjs',
    });

  return { success: true };
}