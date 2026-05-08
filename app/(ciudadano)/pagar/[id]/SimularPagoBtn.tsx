'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  isDemo?: boolean;
  pagoData: {
    obligacion_id: string;
    monto: number;
    referencia: string;
    clave_rastreo: string;
  };
}

export function SimularPagoBtn({ pagoData, isDemo = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'simulating' | 'success' | 'error'>('idle');
  const [claveRastreo, setClaveRastreo] = useState('');
  const router = useRouter();

  const handleSimulacionDemo = async () => {
    setLoading(true);
    setStatus('generating');

    // Paso 1: Simular "generando pago" (1.2s)
    await new Promise(r => setTimeout(r, 1200));
    const clave = `TOJ${Date.now().toString().slice(-10)}`;
    setClaveRastreo(clave);
    setStatus('simulating');

    // Paso 2: Simular "confirmación STP" (1.5s)
    await new Promise(r => setTimeout(r, 1500));

    setStatus('success');

    // Volver al dashboard
    setTimeout(() => {
      router.push('/pagos');
      router.refresh();
    }, 2500);
  };

  const handleSimulacionReal = async () => {
    setLoading(true);
    setStatus('generating');

    try {
      const resGen = await fetch(`/api/obligaciones/${pagoData.obligacion_id}/generar-pago`, {
        method: 'POST',
      });
      const dataGen = await resGen.json();

      if (!resGen.ok) throw new Error(dataGen.error || 'Error generando intención de pago');

      const { clave_rastreo, pago_id } = dataGen;
      setClaveRastreo(clave_rastreo);
      setStatus('simulating');

      await new Promise(r => setTimeout(r, 1500));

      const resWeb = await fetch('/api/webhooks/stp/confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clave_rastreo,
          monto: pagoData.monto,
          referencia: pagoData.referencia,
          estado: 'EXITOSO',
          pago_id,
        }),
      });

      if (!resWeb.ok) {
        const errData = await resWeb.json();
        throw new Error(errData.error || 'Error simulando confirmación STP');
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2500);
    } catch (err) {
      console.error('[SimularPago]', err);
      setStatus('error');
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full bg-primary/10 border-2 border-primary/30 rounded-2xl p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <p className="text-xl font-bold text-primary">¡Pago Confirmado!</p>
        <p className="text-on-surface-variant text-sm">
          Clave de rastreo:
        </p>
        <p className="font-mono font-bold text-on-surface text-sm bg-surface-container rounded-lg px-3 py-2">
          {claveRastreo}
        </p>
        <p className="text-primary/70 text-xs animate-pulse">
          Redirigiendo a historial de pagos...
        </p>
      </div>
    );
  }

  const labelGenerating = status === 'generating' ? 'Creando pago...' : 'Confirmando con STP...';

  return (
    <div className="space-y-3">
      {/* Paso visual del flujo */}
      {loading && (
        <div className="bg-surface-container rounded-2xl p-4 space-y-3">
          <div className={`flex items-center gap-3 ${status === 'generating' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className={`material-symbols-outlined text-[20px] ${status === 'generating' ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {status === 'generating' ? 'progress_activity' : 'check_circle'}
            </span>
            <span className="text-body-sm font-medium">Generando intención de pago</span>
          </div>
          <div className={`flex items-center gap-3 ${status === 'simulating' ? 'text-primary' : 'text-on-surface-variant/40'}`}>
            <span className={`material-symbols-outlined text-[20px] ${status === 'simulating' ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {status === 'simulating' ? 'progress_activity' : 'radio_button_unchecked'}
            </span>
            <span className="text-body-sm font-medium">Confirmando transferencia STP</span>
          </div>
        </div>
      )}

      <button
        onClick={isDemo ? handleSimulacionDemo : handleSimulacionReal}
        disabled={loading}
        className="w-full bg-primary text-on-primary rounded-2xl py-4 font-bold text-body-md shadow-card hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            {labelGenerating}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send_to_mobile</span>
            Simular Pago SPEI (Demo)
          </>
        )}
      </button>

      <p className="text-center text-on-surface-variant/60 text-[11px]">
        Simula el flujo completo: SPEI → Webhook STP → Conciliación automática
      </p>

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-red-500 text-sm font-semibold">
            Error en el proceso. Intenta de nuevo.
          </p>
        </div>
      )}
    </div>
  );
}
