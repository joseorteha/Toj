import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const admin = createSupabaseServiceClient();

  // Verificar rol de gobierno
  const { data: profile } = await admin
    .from('usuarios_plataforma')
    .select('tipo_usuario')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profile?.tipo_usuario !== 'ADMIN_GOBIERNO' && profile?.tipo_usuario !== 'OPERADOR_GOBIERNO') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Obtener historial de cargas
  const { data: cargas, error } = await admin
    .from('cargas_masivas')
    .select('id, nombre_archivo, registros_total, registros_exitosos, registros_error, estado, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Error obteniendo historial' }, { status: 500 });
  }

  return NextResponse.json({ cargas });
}
