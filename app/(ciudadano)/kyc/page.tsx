import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { KycFlow } from './KycFlow';
import { isDemoCiudadano, isDemoAdmin } from '@/lib/mock-data';

/**
 * Página de KYC - Server Component
 * Verifica el estado actual del KYC y muestra el flujo correspondiente
 */
export default async function KycPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Demo: ciudadano demo siempre verificado → directo al dashboard
  if (isDemoCiudadano(user.email)) {
    redirect('/dashboard');
  }
  // Demo: admin demo → directo al panel admin
  if (isDemoAdmin(user.email)) {
    redirect('/admin');
  }

  const admin = createSupabaseServiceClient();

  // Obtener el ciudadano_id
  const { data: usuario } = await admin
    .from('usuarios_plataforma')
    .select('ciudadano_id, tipo_usuario')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  // Si es admin/operador, redirigir al panel de gobierno
  if (usuario?.tipo_usuario === 'ADMIN_GOBIERNO' || usuario?.tipo_usuario === 'OPERADOR_GOBIERNO') {
    redirect('/admin');
  }

  const ciudadanoId = usuario?.ciudadano_id ?? user.id;

  // Obtener estado actual del KYC
  const { data: ciudadano } = await admin
    .from('ciudadanos')
    .select('estado_kyc, nombre_completo, url_selfie_liveness, url_ine_frente')
    .eq('id', ciudadanoId)
    .maybeSingle();

  const estadoKyc = ciudadano?.estado_kyc ?? 'Pendiente';
  const nombreCompleto = ciudadano?.nombre_completo ?? user.email?.split('@')[0] ?? 'Usuario';

  // ═══════════════════════════════════════════════════════════════════════════
  // Si YA está verificado → Mostrar pantalla de éxito con link al dashboard
  // (NO redirect para evitar bucles)
  // ═══════════════════════════════════════════════════════════════════════════
  if (estadoKyc === 'Verificado') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <header className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <span className="text-primary font-bold text-[18px]">TOJ Platform</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-28 h-28 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-[72px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
          <h1 className="text-h1 font-bold text-on-surface mb-2">¡Identidad Verificada!</h1>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-sm">
            Hola <strong>{nombreCompleto.split(' ')[0]}</strong>, tu cuenta está completamente verificada. 
            Ya puedes acceder a todas las funcionalidades.
          </p>
          <Link 
            href="/dashboard"
            className="bg-primary text-on-primary rounded-2xl px-8 py-4 text-body-md font-bold hover:bg-primary/80 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Pasar el estado al componente cliente para el flujo de KYC
  return (
    <KycFlow 
      estadoKyc={estadoKyc}
      nombreCompleto={nombreCompleto}
      tieneSelfie={!!ciudadano?.url_selfie_liveness}
      tieneComprobante={!!ciudadano?.url_ine_frente}
    />
  );
}
