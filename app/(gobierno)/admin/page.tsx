import Link from 'next/link';
import type { Route } from 'next';
import { KpiCard } from '@/components/gobierno/KpiCard';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { isDemoAdmin, MOCK_ADMIN_KPIS, MOCK_EVENTOS } from '@/lib/mock-data';

const accesos = [
  {
    href: '/admin/conciliacion',
    title: 'Conciliación STP',
    description: 'Revisa pagos, estatus y confirmaciones de transferencia.',
    icon: 'currency_exchange',
  },
  {
    href: '/admin/etl',
    title: 'ETL Masivo',
    description: 'Carga CSV, procesa errores y controla la ingesta histórica.',
    icon: 'database_upload',
  },
  {
    href: '/admin/kyc',
    title: 'Auditoría KYC',
    description: 'Consulta validaciones, rechazos y bitácora biométrica.',
    icon: 'verified_user',
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function GobiernoAdminPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE ADMIN DEMO
  // ═══════════════════════════════════════════════════════════════════════════
  const isDemo = isDemoAdmin(user?.email);

  let recaudacionTotal = 0;
  let pagosConciliados: any[] = [];
  let pagosPendientes: any[] = [];
  let obligacionesPendientes: any[] = [];
  let montoPorCobrar = 0;
  let totalCiudadanos = 0;
  let kycVerificados = 0;
  let kycPendientes = 0;
  let totalCargas = 0;
  let eventosRecientes: any[] = [];

  if (isDemo) {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO DEMO: Usar datos mock
    // ═══════════════════════════════════════════════════════════════════════
    recaudacionTotal = MOCK_ADMIN_KPIS.recaudacionTotal;
    pagosConciliados = Array(18).fill({});
    pagosPendientes = Array(MOCK_ADMIN_KPIS.pagosPendientes).fill({});
    obligacionesPendientes = Array(42).fill({});
    montoPorCobrar = MOCK_ADMIN_KPIS.montoPorCobrar;
    totalCiudadanos = MOCK_ADMIN_KPIS.totalCiudadanos;
    kycVerificados = MOCK_ADMIN_KPIS.kycVerificados;
    kycPendientes = MOCK_ADMIN_KPIS.kycPendientes;
    totalCargas = MOCK_ADMIN_KPIS.totalCargas;
    eventosRecientes = MOCK_EVENTOS;
  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO REAL: KPIs desde Supabase
    // ═══════════════════════════════════════════════════════════════════════
    const { data: pagosData } = await admin
      .from('pagos')
      .select('monto_transferido, estado_conciliacion, created_at');

    pagosConciliados = pagosData?.filter(p => p.estado_conciliacion === 'Conciliado') ?? [];
    pagosPendientes = pagosData?.filter(p => p.estado_conciliacion === 'Pendiente') ?? [];
    recaudacionTotal = pagosConciliados.reduce((sum, p) => sum + Number(p.monto_transferido), 0);

    const { data: obligacionesData } = await admin
      .from('obligaciones')
      .select('estado_cumplimiento, monto_pendiente');

    obligacionesPendientes = obligacionesData?.filter(o => 
      o.estado_cumplimiento !== 'Pagado'
    ) ?? [];
    montoPorCobrar = obligacionesPendientes.reduce((sum, o) => sum + Number(o.monto_pendiente || 0), 0);

    const { data: ciudadanosData } = await admin
      .from('ciudadanos')
      .select('estado_kyc');

    totalCiudadanos = ciudadanosData?.length ?? 0;
    kycVerificados = ciudadanosData?.filter(c => c.estado_kyc === 'Verificado').length ?? 0;
    kycPendientes = ciudadanosData?.filter(c => c.estado_kyc === 'Pendiente' || c.estado_kyc === 'EnProceso').length ?? 0;

    const { data: cargasData } = await admin
      .from('cargas_masivas')
      .select('estado');

    totalCargas = cargasData?.length ?? 0;

    const { data: eventosData } = await admin
      .from('eventos_dominio')
      .select('id, tipo_evento, aggregate_type, payload, created_at, estado_proceso')
      .order('created_at', { ascending: false })
      .limit(5);

    eventosRecientes = eventosData ?? [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Indicadores para mostrar
  // ═══════════════════════════════════════════════════════════════════════════
  const indicadores = [
    { 
      title: 'Recaudación Total', 
      value: formatCurrency(recaudacionTotal), 
      note: `${pagosConciliados.length} pagos conciliados`,
      icon: 'payments',
      color: 'text-emerald-400'
    },
    { 
      title: 'Por Cobrar', 
      value: formatCurrency(montoPorCobrar), 
      note: `${obligacionesPendientes.length} obligaciones pendientes`,
      icon: 'account_balance',
      color: 'text-amber-400'
    },
    { 
      title: 'Pagos Pendientes', 
      value: pagosPendientes.length.toString(), 
      note: 'Esperando conciliación STP',
      icon: 'pending_actions',
      color: 'text-sky-400'
    },
  ];

  const indicadores2 = [
    { 
      title: 'Ciudadanos', 
      value: totalCiudadanos.toString(), 
      note: `${kycVerificados} verificados`,
      icon: 'group',
      color: 'text-toj-jade'
    },
    { 
      title: 'KYC Pendientes', 
      value: kycPendientes.toString(), 
      note: 'Requieren revisión',
      icon: 'badge',
      color: 'text-amber-400'
    },
    { 
      title: 'Cargas ETL', 
      value: totalCargas.toString(), 
      note: 'Padrones importados',
      icon: 'upload_file',
      color: 'text-violet-400'
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <section className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-toj-terracotta-light/80">Panel de gobierno</p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold md:text-5xl">
          Control operativo de recaudación
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/70 md:text-base">
          KPIs en tiempo real conectados a Supabase. Conciliación, auditoría KYC y carga masiva de padrones.
        </p>
      </section>

      {/* KPIs Principales - Recaudación */}
      <section className="grid gap-4 md:grid-cols-3">
        {indicadores.map((kpi) => (
          <article key={kpi.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/65">{kpi.title}</p>
              <span className={`material-symbols-outlined text-[24px] ${kpi.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {kpi.icon}
              </span>
            </div>
            <p className={`mt-3 text-3xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-white/40">{kpi.note}</p>
          </article>
        ))}
      </section>

      {/* KPIs Secundarios - Operativos */}
      <section className="mt-4 grid gap-4 md:grid-cols-3">
        {indicadores2.map((kpi) => (
          <article key={kpi.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/65">{kpi.title}</p>
              <span className={`material-symbols-outlined text-[24px] ${kpi.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {kpi.icon}
              </span>
            </div>
            <p className={`mt-3 text-3xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-white/40">{kpi.note}</p>
          </article>
        ))}
      </section>

      {/* Accesos Operativos */}
      <section className="mt-10 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold md:text-2xl">Accesos operativos</h2>
            <p className="mt-1 text-sm text-white/60">Módulos especializados para cada flujo de trabajo.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {accesos.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-toj-terracotta/15 text-toj-terracotta">
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-toj-terracotta-light">
                Abrir módulo
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Eventos Recientes (Diagrama 6 — eventos para n8n) */}
      <section className="mt-10 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold md:text-2xl">
              Eventos del Sistema
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Últimos eventos emitidos para n8n y automatizaciones
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          {eventosRecientes.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-white/20 mb-2">cloud_off</span>
              <p className="text-white/50">No hay eventos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {eventosRecientes.map((evento: any) => {
                const iconMap: Record<string, { icon: string; color: string }> = {
                  PAGO_CONFIRMADO: { icon: 'payments', color: 'text-emerald-400 bg-emerald-500/20' },
                  KYC_COMPLETADO: { icon: 'verified_user', color: 'text-sky-400 bg-sky-500/20' },
                  KYC_RECHAZADO: { icon: 'person_off', color: 'text-red-400 bg-red-500/20' },
                  CARGA_MASIVA_TERMINADA: { icon: 'upload_file', color: 'text-violet-400 bg-violet-500/20' },
                  OBLIGACION_CREADA: { icon: 'receipt_long', color: 'text-amber-400 bg-amber-500/20' },
                };
                const config = iconMap[evento.tipo_evento] || { icon: 'bolt', color: 'text-white/60 bg-white/10' };

                return (
                  <div key={evento.id} className="px-6 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{evento.tipo_evento}</p>
                      <p className="text-white/40 text-xs truncate">
                        {evento.aggregate_type} • {new Date(evento.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      evento.estado_proceso === 'PROCESADO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {evento.estado_proceso === 'PROCESADO' ? 'Procesado' : 'Pendiente'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
