// Pasarela de pago STP — Server Component dinámico
import Link from 'next/link';
import type { Route } from 'next';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SimularPagoBtn } from './SimularPagoBtn';
import { isDemoCiudadano, MOCK_OBLIGACIONES, MOCK_CIUDADANO } from '@/lib/mock-data';

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(n);
}

export default async function PagarPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isDemo = isDemoCiudadano(user.email);

  let concepto = '';
  let monto = 0;
  let clabe = '646180500001110003';
  let obligacionId = params.id;

  if (isDemo) {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO DEMO: Buscar en datos mock
    // ═══════════════════════════════════════════════════════════════════════
    const ob = MOCK_OBLIGACIONES.find(o => o.id === params.id) ?? MOCK_OBLIGACIONES[0];

    if (ob.estado_cumplimiento === 'Pagado') {
      redirect('/dashboard');
    }

    concepto = ob.tipo_tramite;
    monto = ob.monto_pendiente ?? ob.monto_total;
    clabe = MOCK_CIUDADANO.cuenta_stp_clabe;
    obligacionId = ob.id;
  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // MODO REAL: Buscar en Supabase
    // ═══════════════════════════════════════════════════════════════════════
    const admin = createSupabaseServiceClient();

    const { data: ob, error } = await admin
      .from('obligaciones')
      .select('id, tipo_tramite, monto_total, monto_pendiente, ciudadano_id, estado_cumplimiento')
      .eq('id', params.id)
      .maybeSingle();

    if (error || !ob) {
      // Si no se encuentra, redirigir al dashboard en lugar de 404
      redirect('/dashboard');
    }

    if (ob.estado_cumplimiento === 'Pagado') {
      redirect('/dashboard');
    }

    const { data: ciudadano } = await admin
      .from('ciudadanos')
      .select('cuenta_stp_clabe')
      .eq('id', ob.ciudadano_id)
      .maybeSingle();

    concepto = ob.tipo_tramite;
    monto = ob.monto_pendiente ?? ob.monto_total;
    clabe = ciudadano?.cuenta_stp_clabe || '646180500001234567';
    obligacionId = ob.id;
  }

  const referencia = `TOJ ${obligacionId.slice(0, 8).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-surface">
      <header className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-outline-variant">
        <Link href={'/dashboard' as Route} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors" aria-label="Regresar">
          <span className="material-symbols-outlined text-on-surface-variant text-[24px]">arrow_back</span>
        </Link>
        <span className="text-primary font-bold text-[18px]">TOJ Platform</span>
        <div className="w-10 h-10" />
      </header>

      <div className="px-5 py-6 space-y-5 pb-10">
        <div>
          <p className="text-secondary text-label-caps font-bold tracking-widest uppercase">Resumen de Pago</p>
          <h1 className="text-h2 font-bold text-on-surface mt-1">{concepto}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Ref: {referencia}</p>
        </div>

        <div className="bg-surface-container-low rounded-2xl px-5 py-4 flex items-center justify-between">
          <span className="text-on-surface-variant text-body-md">Monto Total</span>
          <span className="text-primary text-h3 font-bold tabular-nums">{fmt(monto)}</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-on-surface font-semibold text-body-md">Transferencia via STP</p>
            <p className="text-on-surface-variant text-body-sm">Escanea el código QR desde tu app bancaria</p>
          </div>
          <div className="mx-auto w-44 h-44 bg-surface-container rounded-xl border-2 border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 0" }}>qr_code_2</span>
          </div>
          <p className="text-center text-label-caps text-on-surface-variant font-semibold tracking-wide">O realiza transferencia manual</p>
        </div>

        <div className="space-y-2">
          <p className="text-label-caps text-on-surface-variant font-bold tracking-widest uppercase">CLABE Única de Pago</p>
          <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="font-mono text-body-sm text-on-surface tracking-wider flex-1">{clabe}</span>
            <button aria-label="Copiar CLABE" className="text-primary hover:bg-primary/10 rounded-lg p-1 transition-colors">
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl px-4 py-3 space-y-2">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Referencia / Concepto</span>
            <span className="font-mono text-on-surface font-medium uppercase">{referencia}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Banco receptor</span>
            <span className="text-on-surface font-medium">STP (646)</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Beneficiario</span>
            <span className="text-on-surface font-medium">TOJ Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
          <p className="text-on-surface-variant text-body-sm italic">Esperando confirmación de transferencia via STP...</p>
        </div>

        {/* Botón de simulación (Client Component) */}
        <SimularPagoBtn
          isDemo={isDemo}
          pagoData={{
            obligacion_id: obligacionId,
            monto: monto,
            referencia: referencia,
            clave_rastreo: `TOJ${Date.now().toString().slice(-8)}`,
          }}
        />

        <p className="text-center text-[11px] text-on-surface-variant leading-relaxed">
          Los pagos son procesados de forma segura a través de STP. El saldo se refleja en tiempo real tras la confirmación bancaria.
        </p>
      </div>
    </main>
  );
}
