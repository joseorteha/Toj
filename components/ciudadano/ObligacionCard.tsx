'use client';
// ObligacionCard -- dos variantes segun estado_cumplimiento
import Link from 'next/link';
import type { Route } from 'next';

export type EstadoCumplimiento = 'Pagado' | 'Al corriente' | 'Por vencer' | 'Vencido';

export type Obligacion = {
  id: string;
  tipo_tramite: string;
  monto_total: number;
  fecha_vencimiento: string;
  estado_cumplimiento: EstadoCumplimiento;
};

type ObligacionCardProps = {
  obligacion: Obligacion;
  onPagar?: (id: string) => void;
};

function formatMonto(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(monto);
}

function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return parseInt(day) + ' ' + meses[parseInt(month) - 1] + ' ' + year;
}

// Tarjeta para Vencido / Por vencer (urgente, borde llamativo)
function ObligacionUrgente({ obligacion, onPagar }: ObligacionCardProps) {
  const esVencido = obligacion.estado_cumplimiento === 'Vencido';
  return (
    <article className="border-2 border-secondary/30 bg-surface-container-lowest rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        <span className="text-label-caps font-bold text-secondary tracking-widest uppercase">{obligacion.estado_cumplimiento}</span>
      </div>
      <h3 className="text-body-md font-bold text-on-surface mb-2">{obligacion.tipo_tramite}</h3>
      <p className="text-h3 font-bold text-secondary tabular-nums">{formatMonto(obligacion.monto_total)}</p>
      <div className="flex items-center justify-between mt-4 gap-3">
        <p className="text-body-sm text-secondary">
          {esVencido ? 'Venció el' : 'Vence el'}{' '}
          <span className="font-semibold">{formatFecha(obligacion.fecha_vencimiento)}</span>
        </p>
        <Link
          href={('/pagar/' + obligacion.id) as Route}
          onClick={() => onPagar?.(obligacion.id)}
          className="bg-primary text-on-primary rounded-xl px-5 py-2.5 text-body-sm font-bold whitespace-nowrap hover:bg-primary/90 transition-colors"
        >
          Pagar ahora
        </Link>
      </div>
    </article>
  );
}

// Tarjeta para Al corriente (pendiente pero no urgente, también se puede pagar)
function ObligacionNormal({ obligacion, onPagar }: ObligacionCardProps) {
  return (
    <article className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>receipt_long</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-on-surface truncate">{obligacion.tipo_tramite}</p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Vence: {formatFecha(obligacion.fecha_vencimiento)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-body-sm font-bold text-on-surface tabular-nums">{formatMonto(obligacion.monto_total)}</p>
          <Link
            href={('/pagar/' + obligacion.id) as Route}
            onClick={() => onPagar?.(obligacion.id)}
            className="text-primary text-body-sm font-semibold hover:underline"
          >
            Pagar
          </Link>
        </div>
      </div>
    </article>
  );
}

// Tarjeta para Pagado (solo informativa)
function ObligacionPagada({ obligacion }: ObligacionCardProps) {
  return (
    <article className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex items-center gap-3 opacity-70">
      <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-on-surface truncate">{obligacion.tipo_tramite}</p>
        <p className="text-body-sm text-primary mt-0.5">Pagado</p>
      </div>
      <span className="text-body-sm font-bold text-on-surface-variant tabular-nums">{formatMonto(obligacion.monto_total)}</span>
    </article>
  );
}

export function ObligacionCard({ obligacion, onPagar }: ObligacionCardProps) {
  if (obligacion.estado_cumplimiento === 'Pagado') {
    return <ObligacionPagada obligacion={obligacion} onPagar={onPagar} />;
  }
  if (obligacion.estado_cumplimiento === 'Vencido' || obligacion.estado_cumplimiento === 'Por vencer') {
    return <ObligacionUrgente obligacion={obligacion} onPagar={onPagar} />;
  }
  return <ObligacionNormal obligacion={obligacion} onPagar={onPagar} />;
}