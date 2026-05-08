// Mis Pagos — historial de pagos del ciudadano (datos reales + mock)
import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { isDemoCiudadano, MOCK_PAGOS_CIUDADANO } from '@/lib/mock-data';

type Pago = {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  estado: 'Conciliado' | 'Pendiente' | 'Rechazado' | 'Observado';
  clave_rastreo: string | null;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

const ESTADO_META: Record<string, { icon: string; cls: string }> = {
  Conciliado: { icon: 'check_circle', cls: 'bg-primary/10 text-primary' },
  Pendiente: { icon: 'schedule', cls: 'bg-amber-500/10 text-amber-500' },
  Rechazado: { icon: 'cancel', cls: 'bg-red-500/10 text-red-500' },
  Observado: { icon: 'visibility', cls: 'bg-orange-500/10 text-orange-500' },
};

const iconoConcepto = (c: string) =>
  c.toLowerCase().includes('predial')
    ? 'home'
    : c.toLowerCase().includes('agua')
    ? 'water_drop'
    : c.toLowerCase().includes('licencia')
    ? 'badge'
    : 'receipt_long';

export default async function PagosPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE USUARIO DEMO
  // ═══════════════════════════════════════════════════════════════════════════
  const isDemo = isDemoCiudadano(user.email);
  let pagos: Pago[] = [];

  if (isDemo) {
    // MODO DEMO: Usar datos mock
    pagos = MOCK_PAGOS_CIUDADANO.map(p => ({
      id: p.id,
      concepto: p.concepto,
      monto: p.monto,
      fecha: p.fecha,
      estado: p.estado,
      clave_rastreo: p.clave_rastreo,
    }));
  } else {
    // MODO REAL: Obtener de Supabase
    const { data: usuario } = await admin
      .from('usuarios_plataforma')
      .select('ciudadano_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const ciudadanoId = usuario?.ciudadano_id ?? user.id;

    const { data: obligaciones } = await admin
      .from('obligaciones')
      .select('id')
      .eq('ciudadano_id', ciudadanoId);

    const obligacionIds = obligaciones?.map(o => o.id) ?? [];

    const { data: pagosReales } = obligacionIds.length > 0
      ? await admin
          .from('pagos')
          .select(`
            id,
            monto_transferido,
            estado_conciliacion,
            clave_rastreo,
            created_at,
            obligacion_id,
            obligaciones!inner (
              tipo_tramite
            )
          `)
          .in('obligacion_id', obligacionIds)
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [] };

    pagos = (pagosReales ?? []).map((p: any) => ({
      id: p.id,
      concepto: p.obligaciones?.tipo_tramite || 'Pago',
      monto: Number(p.monto_transferido) || 0,
      fecha: new Date(p.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      estado: p.estado_conciliacion as Pago['estado'],
      clave_rastreo: p.clave_rastreo,
    }));
  }

  const totalPagado = pagos
    .filter((p) => p.estado === 'Conciliado')
    .reduce((a, p) => a + p.monto, 0);

  const pagosConciliados = pagos.filter((p) => p.estado === 'Conciliado').length;

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
        <span className="text-primary font-bold text-[18px]">Mis Pagos</span>
        <div className="w-10" />
      </header>

      <div className="px-5 py-6 space-y-5">
        {/* Resumen */}
        <div className="bg-wallet-gradient rounded-2xl p-5 shadow-wallet">
          <p className="text-label-caps font-bold text-white/70 tracking-widest uppercase mb-1">
            Total Pagado
          </p>
          <p className="text-h2 font-bold text-white tabular-nums">{fmt(totalPagado)}</p>
          <p className="text-body-sm text-white/60 mt-1">
            {pagosConciliados} pago{pagosConciliados !== 1 ? 's' : ''} conciliado{pagosConciliados !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de pagos */}
        <div className="space-y-1.5">
          <p className="text-label-caps font-bold text-on-surface-variant tracking-widest uppercase mb-3">
            Historial de Pagos
          </p>

          {pagos.length === 0 ? (
            <div className="text-center py-12">
              <span
                className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-3"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                payments
              </span>
              <p className="text-on-surface-variant font-medium">No tienes pagos registrados</p>
              <p className="text-on-surface-variant/60 text-sm mt-1">
                Cuando realices un pago, aparecerá aquí
              </p>
            </div>
          ) : (
            pagos.map((pago) => {
              const m = ESTADO_META[pago.estado] || ESTADO_META.Pendiente;
              return (
                <div
                  key={pago.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-3.5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-primary text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                    >
                      {iconoConcepto(pago.concepto)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-on-surface truncate">{pago.concepto}</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{pago.fecha}</p>
                    {pago.clave_rastreo && (
                      <p className="text-[10px] text-on-surface-variant/60 font-mono truncate">
                        {pago.clave_rastreo}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-sm font-bold text-on-surface tabular-nums">{fmt(pago.monto)}</p>
                    <span
                      className={
                        'inline-flex items-center gap-0.5 mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ' +
                        m.cls
                      }
                    >
                      <span
                        className="material-symbols-outlined text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {m.icon}
                      </span>
                      {pago.estado}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pagos.length > 0 && (
          <p className="text-center text-on-surface-variant/50 text-xs">
            Mostrando los últimos {pagos.length} pagos
          </p>
        )}
      </div>
    </main>
  );
}
