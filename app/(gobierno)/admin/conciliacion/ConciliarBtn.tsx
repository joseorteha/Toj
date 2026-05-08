'use client';

import { useState } from 'react';
import { conciliarPago, marcarObservado, rechazarPago } from './actions';

type Props = {
  pagoId: string;
  estadoActual: string;
};

export function ConciliarBtn({ pagoId, estadoActual }: Props) {
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  if (estadoActual === 'Conciliado') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Conciliado
      </span>
    );
  }

  if (estadoActual === 'Rechazado') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
        Rechazado
      </span>
    );
  }

  async function handleConciliar() {
    setLoading(true);
    const result = await conciliarPago(pagoId);
    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
    setShowActions(false);
  }

  async function handleObservar() {
    const motivo = prompt('Motivo de observación:');
    if (!motivo) return;
    setLoading(true);
    await marcarObservado(pagoId, motivo);
    setLoading(false);
    setShowActions(false);
  }

  async function handleRechazar() {
    const motivo = prompt('Motivo de rechazo:');
    if (!motivo) return;
    if (!confirm('¿Estás seguro de rechazar este pago?')) return;
    setLoading(true);
    await rechazarPago(pagoId, motivo);
    setLoading(false);
    setShowActions(false);
  }

  if (estadoActual === 'Observado') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400">
          <span className="material-symbols-outlined text-[14px]">visibility</span>
          Observado
        </span>
        <button
          onClick={handleConciliar}
          disabled={loading}
          className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {loading ? '...' : 'Conciliar'}
        </button>
      </div>
    );
  }

  // Pendiente - mostrar acciones
  return (
    <div className="relative">
      {!showActions ? (
        <button
          onClick={() => setShowActions(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20"
        >
          <span className="material-symbols-outlined text-[14px]">pending</span>
          Pendiente
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleConciliar}
            disabled={loading}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? '...' : '✓ Conciliar'}
          </button>
          <button
            onClick={handleObservar}
            disabled={loading}
            className="rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/30 disabled:opacity-50"
          >
            Observar
          </button>
          <button
            onClick={handleRechazar}
            disabled={loading}
            className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
          >
            Rechazar
          </button>
          <button
            onClick={() => setShowActions(false)}
            className="rounded-full p-1 text-white/40 transition hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
