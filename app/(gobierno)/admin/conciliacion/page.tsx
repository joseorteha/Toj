import Link from 'next/link';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { ConciliarBtn } from './ConciliarBtn';
import { isDemoAdmin, MOCK_PAGOS_ADMIN } from '@/lib/mock-data';

type PagoReal = {
  id: string;
  monto_transferido: number;
  estado_conciliacion: string;
  clave_rastreo_stp: string | null;
  created_at: string;
  fecha_conciliacion: string | null;
  obligaciones: {
    tipo_tramite: string;
    identificador_externo: string;
  } | null;
  ciudadanos: {
    nombre_completo: string;
    email: string;
  } | null;
};

export default async function ConciliacionPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE ADMIN DEMO
  // ═══════════════════════════════════════════════════════════════════════════
  const isDemo = isDemoAdmin(user?.email);

  let pagosConciliados: any[] = [];
  let pagosPendientes: any[] = [];
  let pagosObservados: any[] = [];
  let montoConciliado = 0;
  let montoPendiente = 0;
  let pagos: PagoReal[] = [];

  if (isDemo) {
    // MODO DEMO: Usar datos mock
    const mockPagos = MOCK_PAGOS_ADMIN;
    pagosConciliados = mockPagos.filter(p => p.estado_conciliacion === 'Conciliado');
    pagosPendientes = mockPagos.filter(p => p.estado_conciliacion === 'Pendiente');
    pagosObservados = mockPagos.filter(p => p.estado_conciliacion === 'Observado');

    montoConciliado = pagosConciliados.reduce((s, p) => s + p.monto, 0);
    montoPendiente = pagosPendientes.reduce((s, p) => s + p.monto, 0);

    // Convertir mock a formato esperado
    pagos = mockPagos.map(p => ({
      id: p.id,
      monto_transferido: p.monto,
      estado_conciliacion: p.estado_conciliacion,
      clave_rastreo_stp: p.clave_rastreo,
      created_at: p.created_at,
      fecha_conciliacion: null,
      obligaciones: { tipo_tramite: p.concepto, identificador_externo: '' },
      ciudadanos: { nombre_completo: p.ciudadano_nombre, email: p.ciudadano_email },
    }));
  } else {
    // MODO REAL: Obtener estadísticas de Supabase
    const { data: stats } = await admin
      .from('pagos')
      .select('estado_conciliacion, monto_transferido');

    pagosConciliados = stats?.filter(p => p.estado_conciliacion === 'Conciliado') ?? [];
    pagosPendientes = stats?.filter(p => p.estado_conciliacion === 'Pendiente') ?? [];
    pagosObservados = stats?.filter(p => p.estado_conciliacion === 'Observado') ?? [];

    montoConciliado = pagosConciliados.reduce((s, p) => s + Number(p.monto_transferido), 0);
    montoPendiente = pagosPendientes.reduce((s, p) => s + Number(p.monto_transferido), 0);

    const { data: pagosData } = await admin
      .from('pagos')
      .select(`
        id,
        monto_transferido,
        estado_conciliacion,
        clave_rastreo_stp,
        created_at,
        fecha_conciliacion,
        obligaciones ( tipo_tramite, identificador_externo ),
        ciudadanos ( nombre_completo, email )
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    pagos = (pagosData as any[] ?? []) as PagoReal[];
  }

  const resumen = [
    { 
      label: 'Conciliados', 
      value: pagosConciliados.length.toString(), 
      subvalue: `$${montoConciliado.toLocaleString('es-MX')}`,
      color: 'text-emerald-400',
      icon: 'check_circle'
    },
    { 
      label: 'Pendientes', 
      value: pagosPendientes.length.toString(), 
      subvalue: `$${montoPendiente.toLocaleString('es-MX')}`,
      color: 'text-amber-400',
      icon: 'pending'
    },
    { 
      label: 'Observados', 
      value: pagosObservados.length.toString(), 
      subvalue: 'Requieren revisión',
      color: 'text-sky-400',
      icon: 'visibility'
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-toj-terracotta-light/80">Conciliación STP</p>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold md:text-4xl">Pagos y trazabilidad</h1>
          <p className="mt-1 text-sm text-white/50">Diagrama 3: Máquina de estados de pagos</p>
        </div>
        <Link href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5">
          ← Volver al panel
        </Link>
      </div>

      {/* KPIs de Conciliación */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {resumen.map((item) => (
          <article key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/65">{item.label}</p>
              <span className={`material-symbols-outlined text-[24px] ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {item.icon}
              </span>
            </div>
            <p className={`mt-3 text-4xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs text-white/40">{item.subvalue}</p>
          </article>
        ))}
      </section>

      {/* Tabla de Pagos */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Movimientos recientes</h2>
          <span className="text-xs text-white/40">{pagos.length} registros</span>
        </div>
        <div className="divide-y divide-white/10">
          {pagos.length > 0 ? (
            pagos.map((pago) => (
              <article key={pago.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.5fr_0.8fr_1.2fr] md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Folio</p>
                  <p className="mt-1 font-mono font-semibold text-white">{pago.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] font-mono text-white/30 truncate" title={pago.clave_rastreo_stp || ''}>
                    {pago.clave_rastreo_stp || 'Sin clave STP'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Obligación / Ciudadano</p>
                  <p className="mt-1 text-sm text-white font-medium">
                    {pago.obligaciones?.tipo_tramite ?? 'N/A'}
                    {pago.obligaciones?.identificador_externo && (
                      <span className="ml-2 text-white/40 text-xs">({pago.obligaciones.identificador_externo})</span>
                    )}
                  </p>
                  <p className="text-sm text-white/55">{pago.ciudadanos?.nombre_completo ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Monto</p>
                  <p className="mt-1 font-bold text-white tabular-nums">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pago.monto_transferido)}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {new Date(pago.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="md:text-right">
                  <ConciliarBtn pagoId={pago.id} estadoActual={pago.estado_conciliacion} />
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-white/10">payments</span>
              <p className="text-white/40">No hay pagos registrados aún.</p>
              <p className="text-white/25 text-sm">Los pagos aparecerán aquí cuando los ciudadanos realicen transferencias.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
