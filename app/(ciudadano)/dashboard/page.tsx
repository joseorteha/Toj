// Dashboard principal del ciudadano TOJ — Server Component async
import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { WalletCard } from '@/components/ciudadano/WalletCard';
import { ObligacionCard } from '@/components/ciudadano/ObligacionCard';
import { CarpetaDigital, type Expediente } from '@/components/ciudadano/CarpetaDigital';
import type { Obligacion } from '@/components/ciudadano/ObligacionCard';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/login/actions';
import { isDemoCiudadano, MOCK_CIUDADANO, MOCK_OBLIGACIONES, MOCK_EXPEDIENTES } from '@/lib/mock-data';


export default async function CiudadanoDashboardPage() {
  // ── Sesión real desde Supabase ──────────────────────────────
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE USUARIO DEMO - Usar datos mock si es ciudadano de prueba
  // ═══════════════════════════════════════════════════════════════════════════
  const isDemo = isDemoCiudadano(user.email);

  let nombreMostrar = user?.user_metadata?.nombre_completo ?? user?.email?.split('@')[0] ?? 'Ciudadano';
  let obligaciones: Obligacion[] = [];
  let saldo = 0;
  let clabe = 'Generando CLABE...';
  let estadoKyc = 'Verificado'; // Por defecto verificado para demo
  let expedientes: Expediente[] = [];

  if (isDemo) {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO DEMO: Usar datos mock
    // ═══════════════════════════════════════════════════════════════════════
    nombreMostrar = MOCK_CIUDADANO.nombre_completo;
    estadoKyc = MOCK_CIUDADANO.estado_kyc;
    saldo = MOCK_CIUDADANO.saldo_wallet;
    clabe = MOCK_CIUDADANO.cuenta_stp_clabe;
    obligaciones = MOCK_OBLIGACIONES as Obligacion[];
    expedientes = MOCK_EXPEDIENTES as Expediente[];
  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO REAL: Obtener datos de Supabase
    // ═══════════════════════════════════════════════════════════════════════
    const { data: usuario } = await admin
      .from('usuarios_plataforma')
      .select('ciudadano_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const ciudadanoId = usuario?.ciudadano_id ?? user.id;

    const { data: ciudadano } = await admin
      .from('ciudadanos')
      .select('estado_kyc, saldo_wallet, cuenta_stp_clabe, nombre_completo')
      .eq('id', ciudadanoId)
      .maybeSingle();

    if (ciudadano) {
      estadoKyc = ciudadano.estado_kyc ?? 'Pendiente';
      saldo = Number(ciudadano.saldo_wallet) || 0;
      clabe = ciudadano.cuenta_stp_clabe || 'No asignada';
      nombreMostrar = ciudadano.nombre_completo || nombreMostrar;
    }

    // Verificar KYC solo para usuarios reales
    if (estadoKyc === 'Pendiente' || estadoKyc === 'Rechazado') {
      redirect('/kyc');
    }

    const { data: obligacionesData } = await admin
      .from('obligaciones')
      .select('id, tipo_tramite, monto_total, fecha_vencimiento, estado_cumplimiento')
      .eq('ciudadano_id', ciudadanoId)
      .order('fecha_vencimiento', { ascending: true });
    
    if (obligacionesData) obligaciones = obligacionesData as Obligacion[];

    const { data: expedientesData } = await admin
      .from('expedientes')
      .select('id, tipo_documento, estado_ocr, url_archivo_s3, created_at')
      .eq('ciudadano_id', ciudadanoId)
      .order('created_at', { ascending: false })
      .limit(6);

    expedientes = (expedientesData ?? []) as Expediente[];
  }

  const iniciales = nombreMostrar.slice(0, 2).toUpperCase();

  // Separar obligaciones por estado
  const obligacionesPendientes = obligaciones.filter(o => o.estado_cumplimiento !== 'Pagado');
  const obligacionesPagadas = obligaciones.filter(o => o.estado_cumplimiento === 'Pagado');

  // Mapeo de estados KYC para la UI
  const kycConfig: Record<string, { label: string; icon: string; color: string }> = {
    Verificado: { label: 'KYC Verificado', icon: 'verified', color: 'text-primary bg-primary-fixed/40' },
    EnProceso:  { label: 'KYC en Revisión', icon: 'pending', color: 'text-amber-500 bg-amber-500/10' },
    Rechazado:  { label: 'KYC Rechazado', icon: 'error', color: 'text-red-500 bg-red-500/10' },
    Pendiente:  { label: 'Verificación Pendiente', icon: 'hourglass_empty', color: 'text-toj-text-secondary bg-surface-container' },
  };

  const currentKyc = kycConfig[estadoKyc] || kycConfig.Pendiente;

  return (
    <>
      <main className="px-5 pt-5 space-y-6">
        {/* TopAppBar */}
        <header className="sticky top-0 bg-surface z-10 flex items-center justify-between py-4 border-b border-outline-variant -mx-5 px-5">
          <span className="text-primary font-bold text-[18px] tracking-tight">TOJ Platform</span>
          <div className="flex items-center gap-3">
            <button aria-label="Notificaciones" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
            </button>
            {/* Avatar + logout */}
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="relative group"
                title="Cerrar sesión"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                  <span className="text-on-primary font-bold text-[14px]">{iniciales}</span>
                </div>
                <span className={`absolute -top-1 -right-1 border-2 border-surface rounded-full px-1 py-0.5 text-[8px] font-bold leading-none ${estadoKyc === 'Verificado' ? 'bg-primary text-on-primary' : 'bg-toj-terracotta text-white'}`}>
                  {estadoKyc === 'Verificado' ? 'OK' : '!'}
                </span>
              </button>
            </form>
          </div>
        </header>

        {/* Saludo */}
        <section className="space-y-2">
          <h1 className="text-h3 font-bold text-on-surface">
            Hola, {nombreMostrar.split(' ')[0]} 👋
          </h1>
          <Link href="/kyc" className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit transition-opacity hover:opacity-80 ${currentKyc.color}`}>
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{currentKyc.icon}</span>
            <span className="text-label-caps font-bold tracking-widest uppercase">{currentKyc.label}</span>
          </Link>
        </section>

        {/* Wallet */}
        <section>
          <WalletCard saldo={saldo} clabe={clabe} />
        </section>

        {/* Obligaciones Pendientes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-body-md font-bold text-on-surface">
              Obligaciones Pendientes
              {obligacionesPendientes.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-toj-terracotta text-white">
                  {obligacionesPendientes.length}
                </span>
              )}
            </h2>
            <Link href={'/pagos' as Route} className="text-body-sm font-semibold text-primary hover:underline">Ver historial</Link>
          </div>
          <div className="space-y-3">
            {obligacionesPendientes.length > 0 ? (
              obligacionesPendientes.map((ob) => (
                <ObligacionCard key={ob.id} obligacion={ob} />
              ))
            ) : (
              <div className="p-8 text-center bg-primary/5 rounded-3xl border border-primary/20">
                <span className="material-symbols-outlined text-[48px] text-primary/40 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-primary font-semibold">¡Estás al corriente!</p>
                <p className="text-on-surface-variant text-body-sm mt-1">No tienes obligaciones pendientes.</p>
              </div>
            )}
          </div>
        </section>

        {/* Obligaciones Pagadas (si hay) */}
        {obligacionesPagadas.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-body-md font-bold text-on-surface/70">Pagadas recientemente</h2>
            <div className="space-y-2 opacity-70">
              {obligacionesPagadas.slice(0, 3).map((ob) => (
                <ObligacionCard key={ob.id} obligacion={ob} />
              ))}
            </div>
          </section>
        )}

        {/* Carpeta Digital */}
        <section className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-md font-bold text-on-surface">Carpeta Digital</h2>
            <button className="text-body-sm font-semibold text-primary">Gestionar</button>
          </div>
          <CarpetaDigital expedientes={expedientes} />
        </section>
      </main>

      {/* FAB IA */}
      <Link
        href={'/ia' as Route}
        aria-label="Abrir asistente IA"
        className="fixed bottom-20 right-5 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-primary/80 transition-colors"
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
      </Link>
    </>
  );
}