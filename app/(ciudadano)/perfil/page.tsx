// Perfil del ciudadano — Datos reales + Vincular Telegram
import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/login/actions';
import { VincularTelegramBtn } from './VincularTelegramBtn';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

export default async function PerfilPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener datos del perfil
  const { data: usuario } = await admin
    .from('usuarios_plataforma')
    .select('ciudadano_id, nombre_mostrar')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  const ciudadanoId = usuario?.ciudadano_id ?? user.id;

  // Datos del ciudadano
  const { data: ciudadano } = await admin
    .from('ciudadanos')
    .select('nombre_completo, email, telefono, estado_kyc, saldo_wallet, chat_id_telegram, curp')
    .eq('id', ciudadanoId)
    .maybeSingle();

  // Contar pagos
  const { data: obligaciones } = await admin
    .from('obligaciones')
    .select('id')
    .eq('ciudadano_id', ciudadanoId);

  const obligacionIds = obligaciones?.map(o => o.id) ?? [];
  
  const { count: totalPagos } = obligacionIds.length > 0
    ? await admin
        .from('pagos')
        .select('*', { count: 'exact', head: true })
        .in('obligacion_id', obligacionIds)
    : { count: 0 };

  // Contar documentos
  const { count: totalDocs } = await admin
    .from('expedientes')
    .select('*', { count: 'exact', head: true })
    .eq('ciudadano_id', ciudadanoId);

  const nombreCompleto = ciudadano?.nombre_completo || usuario?.nombre_mostrar || user.email?.split('@')[0] || 'Usuario';
  const email = ciudadano?.email || user.email || '';
  const estadoKyc = ciudadano?.estado_kyc || 'Pendiente';
  const saldo = Number(ciudadano?.saldo_wallet) || 0;
  const iniciales = nombreCompleto.slice(0, 2).toUpperCase();
  const telegramVinculado = !!ciudadano?.chat_id_telegram;

  const kycConfig: Record<string, { label: string; icon: string; color: string }> = {
    Verificado: { label: 'KYC Verificado', icon: 'verified', color: 'bg-primary-fixed/40 text-primary' },
    EnProceso: { label: 'En Revisión', icon: 'pending', color: 'bg-amber-500/20 text-amber-500' },
    Rechazado: { label: 'Rechazado', icon: 'error', color: 'bg-red-500/20 text-red-500' },
    Pendiente: { label: 'Verificación Pendiente', icon: 'hourglass_empty', color: 'bg-surface-container text-on-surface-variant' },
  };
  const kyc = kycConfig[estadoKyc] || kycConfig.Pendiente;

  const STATS = [
    { label: 'Pagos', valor: String(totalPagos ?? 0), icon: 'payments' },
    { label: 'Docs', valor: String(totalDocs ?? 0), icon: 'badge' },
    { label: 'Saldo', valor: fmt(saldo), icon: 'account_balance_wallet' },
  ];

  return (
    <main className="min-h-screen bg-surface">
      <header className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-outline-variant">
        <Link
          href={'/dashboard' as Route}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          aria-label="Regresar"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <span className="text-primary font-bold text-[18px]">Mi Perfil</span>
        <div className="w-10" />
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Card perfil */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-wallet">
              <span className="text-on-primary font-bold text-[28px]">{iniciales}</span>
            </div>
            {estadoKyc === 'Verificado' && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary border-2 border-surface rounded-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-primary text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-h3 font-bold text-on-surface">{nombreCompleto}</h1>
            <p className="text-body-sm text-on-surface-variant mt-0.5">{email}</p>
            {ciudadano?.curp && (
              <p className="text-[11px] text-on-surface-variant/60 font-mono mt-1">{ciudadano.curp}</p>
            )}
          </div>
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${kyc.color}`}>
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {kyc.icon}
            </span>
            <span className="text-label-caps font-bold tracking-widest uppercase">{kyc.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className="material-symbols-outlined text-primary text-[24px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                {s.icon}
              </span>
              <p className="text-body-sm font-bold text-on-surface tabular-nums">{s.valor}</p>
              <p className="text-[11px] text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Telegram */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${telegramVinculado ? 'bg-sky-500/20' : 'bg-surface-container'}`}>
              <span className={`material-symbols-outlined text-[22px] ${telegramVinculado ? 'text-sky-500' : 'text-on-surface-variant'}`}>
                send
              </span>
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-semibold text-on-surface">Notificaciones Telegram</p>
              <p className="text-[12px] text-on-surface-variant">
                {telegramVinculado ? 'Cuenta vinculada - Recibirás alertas' : 'Vincula tu cuenta para recibir alertas'}
              </p>
            </div>
            {telegramVinculado && (
              <span className="material-symbols-outlined text-sky-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            )}
          </div>
          {!telegramVinculado && <VincularTelegramBtn ciudadanoId={ciudadanoId} />}
        </div>

        {/* Menu */}
        <div className="space-y-1">
          <p className="text-label-caps font-bold text-on-surface-variant tracking-widest uppercase mb-3 px-1">
            Mi Cuenta
          </p>

          <Link
            href={'/kyc' as Route}
            className="flex items-center gap-4 px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-surface-container-low transition-colors mb-1.5"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                fingerprint
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface">Verificación de Identidad</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">{kyc.label}</p>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </Link>

          <Link
            href={'/pagos' as Route}
            className="flex items-center gap-4 px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-surface-container-low transition-colors mb-1.5"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                receipt_long
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface">Historial de Pagos</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">{totalPagos ?? 0} pagos registrados</p>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </Link>

          <Link
            href={'/ia' as Route}
            className="flex items-center gap-4 px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-surface-container-low transition-colors mb-1.5"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                smart_toy
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface">Asistente IA</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">Consulta tus dudas</p>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </Link>

          {/* Logout */}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-4 px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-red-500/5 transition-colors mt-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10">
                <span className="material-symbols-outlined text-red-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  logout
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-body-sm font-semibold text-red-500">Cerrar sesión</p>
              </div>
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-on-surface-variant pb-2">
          TOJ Platform v0.1.0 — GovTech/Fintech Mexico
        </p>
      </div>
    </main>
  );
}
