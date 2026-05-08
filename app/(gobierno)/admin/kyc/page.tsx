// app/(gobierno)/admin/kyc/page.tsx — Server Component con datos reales + mock
import Link from 'next/link';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { KycAuditRow } from './KycAuditRow';
import { isDemoAdmin, MOCK_KYC_SOLICITUDES, MOCK_ADMIN_KPIS } from '@/lib/mock-data';

type KycSolicitud = {
  id: string;
  ciudadano_id: string;
  estado: string;
  score_confianza: number;
  proveedor: string;
  created_at: string;
  motivo_rechazo: string | null;
  ciudadanos: {
    nombre_completo: string;
    email: string;
    curp: string | null;
    url_selfie_liveness: string | null;
    url_ine_frente: string | null;
    estado_kyc: string;
    chat_id_telegram: string | null;
  } | null;
};

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { color: string; label: string }> = {
    Verificado:  { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',  label: 'Verificado'  },
    Aprobado:    { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',  label: 'Aprobado'    },
    EnProceso:   { color: 'bg-amber-500/15  text-amber-400  border-amber-500/20',      label: 'En revisión' },
    Pendiente:   { color: 'bg-sky-500/15    text-sky-400    border-sky-500/20',        label: 'Pendiente'   },
    Rechazado:   { color: 'bg-red-500/15    text-red-400    border-red-500/20',        label: 'Rechazado'   },
  };
  const style = map[estado] ?? { color: 'bg-white/10 text-white/70', label: estado };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${style.color}`}>
      {style.label}
    </span>
  );
}

export default async function KycAdminPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE ADMIN DEMO
  // ═══════════════════════════════════════════════════════════════════════════
  const isDemo = isDemoAdmin(user?.email);

  let totalVerificados = 0;
  let totalEnProceso = 0;
  let totalRechazados = 0;
  let totalPendientes = 0;
  let rows: KycSolicitud[] = [];
  let error = null;

  if (isDemo) {
    // MODO DEMO: Usar datos mock
    totalVerificados = MOCK_ADMIN_KPIS.kycVerificados;
    totalEnProceso = 2; // Las 2 solicitudes mock en proceso
    totalRechazados = 8;
    totalPendientes = MOCK_ADMIN_KPIS.kycPendientes - 2;
    rows = MOCK_KYC_SOLICITUDES as KycSolicitud[];
  } else {
    // MODO REAL: Métricas desde Supabase
    const { data: stats } = await admin
      .from('ciudadanos')
      .select('estado_kyc');

    totalVerificados = stats?.filter((c) => c.estado_kyc === 'Verificado').length ?? 0;
    totalEnProceso = stats?.filter((c) => c.estado_kyc === 'EnProceso').length ?? 0;
    totalRechazados = stats?.filter((c) => c.estado_kyc === 'Rechazado').length ?? 0;
    totalPendientes = stats?.filter((c) => c.estado_kyc === 'Pendiente').length ?? 0;

    const { data: solicitudes, error: err } = await admin
      .from('kyc_solicitudes')
      .select(`
        id,
        ciudadano_id,
        estado,
        score_confianza,
        proveedor,
        created_at,
        motivo_rechazo,
        ciudadanos (
          nombre_completo,
          email,
          curp,
          url_selfie_liveness,
          url_ine_frente,
          estado_kyc,
          chat_id_telegram
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    error = err;
    rows = (solicitudes as KycSolicitud[] | null) ?? [];
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-toj-terracotta-light/80">Auditoría KYC</p>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold md:text-4xl mt-1">
            Validaciones biométricas
          </h1>
          <p className="text-sm text-white/50 mt-1">Aprueba o rechaza la identidad de los ciudadanos</p>
        </div>
        <Link href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5 self-start">
          ← Volver al panel
        </Link>
      </div>

      {/* KPIs */}
      <section className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Verificados', value: totalVerificados, color: 'text-emerald-400', icon: 'verified_user' },
          { label: 'En revisión', value: totalEnProceso,   color: 'text-amber-400',   icon: 'pending' },
          { label: 'Pendientes',  value: totalPendientes,  color: 'text-sky-400',     icon: 'hourglass_empty' },
          { label: 'Rechazados',  value: totalRechazados,  color: 'text-red-400',     icon: 'block' },
        ].map((kpi) => (
          <article key={kpi.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50 font-medium">{kpi.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${kpi.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {kpi.icon}
              </span>
            </div>
            <p className={`text-4xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
          </article>
        ))}
      </section>

      {/* Tabla de solicitudes */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-semibold text-white text-lg">Solicitudes recientes</h2>
          {error && <p className="text-red-400 text-xs">Error cargando datos</p>}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-white/15">manage_accounts</span>
            <p className="text-white/40 text-body-md">No hay solicitudes KYC aún.</p>
            <p className="text-white/25 text-body-sm">Aparecerán aquí cuando los ciudadanos completen el proceso de verificación.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((sol) => (
              <KycAuditRow key={sol.id} solicitud={sol} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}