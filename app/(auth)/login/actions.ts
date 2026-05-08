'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/** Login con email y contraseña */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string } | { success: true; redirect: string }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Determinar destino según el email (evitar redirect() en Server Action con useTransition)
  const email_lower = data.user?.email?.toLowerCase() ?? '';
  const isAdmin = ['admin@toj.gob.mx', 'contacto@toj.gob.mx', '226w0702@zongolica.tecnm.mx'].includes(email_lower);

  return { success: true, redirect: isAdmin ? '/admin' : '/dashboard' };
}

/** Magic Link — envía email con link de acceso */
export async function signInWithMagicLink(
  email: string
): Promise<{ error: string } | { success: true }> {
  const supabase = createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}

/** Cerrar sesión */
export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
