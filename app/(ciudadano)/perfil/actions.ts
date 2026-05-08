'use server';

import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Vincular cuenta de Telegram al ciudadano
 * Guarda el chat_id para recibir notificaciones vía n8n
 */
export async function vincularTelegram(
  ciudadanoId: string,
  chatId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!ciudadanoId || !chatId) {
    return { error: 'Datos incompletos' };
  }

  // Validar que el chatId sea numérico
  if (!/^\d+$/.test(chatId)) {
    return { error: 'El Chat ID debe ser un número' };
  }

  const admin = createSupabaseServiceClient();

  const { error } = await admin
    .from('ciudadanos')
    .update({ chat_id_telegram: chatId })
    .eq('id', ciudadanoId);

  if (error) {
    console.error('Error vinculando Telegram:', error);
    return { error: 'Error al vincular Telegram' };
  }

  // Registrar en bitácora
  await admin.from('bitacora_auditoria').insert({
    ciudadano_id: ciudadanoId,
    accion: 'Telegram vinculado',
    detalles: JSON.stringify({ chat_id: chatId }),
    entity_type: 'ciudadanos',
    entity_id: ciudadanoId,
  });

  revalidatePath('/perfil');
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * Desvincular Telegram
 */
export async function desvincularTelegram(
  ciudadanoId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!ciudadanoId) {
    return { error: 'Ciudadano no identificado' };
  }

  const admin = createSupabaseServiceClient();

  const { error } = await admin
    .from('ciudadanos')
    .update({ chat_id_telegram: null })
    .eq('id', ciudadanoId);

  if (error) {
    return { error: 'Error al desvincular Telegram' };
  }

  revalidatePath('/perfil');

  return { success: true };
}
