'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

// ── Tipos ─────────────────────────────────────────────────────────────────
type Rol = 'user' | 'assistant';
interface Mensaje {
  id: string;
  rol: Rol;
  texto: string;
  hora: string;
  loading?: boolean;
}
interface PerfilFinanciero {
  nombre: string;
  score: number;
  totalDeuda: number;
  totalPagado: number;
  vencidas: number;
  porVencer: number;
  alCorriente: number;
  saldo: number;
  obligacionesUrgentes: { tipo_tramite: string; monto_pendiente: number; monto_total: number; estado_cumplimiento: string }[];
}

// ── Formateo ──────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);
const hora = () => new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

// ── Widget: Salud Financiera ───────────────────────────────────────────────
function SaludFinancieraCard({ perfil, onPregunta }: { perfil: PerfilFinanciero; onPregunta: (q: string) => void }) {
  const score = perfil.score;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Buena' : score >= 50 ? 'Regular' : 'Crítica';
  const circunf = 2 * Math.PI * 26; // radio 26
  const progreso = (score / 100) * circunf;

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card">
      <div className="flex items-center gap-4">
        {/* Score circular */}
        <div className="relative shrink-0">
          <svg width="68" height="68" className="-rotate-90">
            <circle cx="34" cy="34" r="26" fill="none" stroke="#EDF4F3" strokeWidth="6" />
            <circle cx="34" cy="34" r="26" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={`${progreso} ${circunf}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[17px] font-black text-on-surface leading-none">{score}</span>
            <span className="text-[8px] font-bold text-on-surface-variant leading-none">pts</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Salud financiera</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: color }}>{label}</span>
          </div>
          <p className="text-body-md font-bold text-on-surface">{fmt(perfil.totalDeuda)} pendiente</p>
          <div className="flex items-center gap-3 mt-1.5">
            {perfil.vencidas > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                {perfil.vencidas} vencida{perfil.vencidas > 1 ? 's' : ''}
              </span>
            )}
            {perfil.porVencer > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                {perfil.porVencer} por vencer
              </span>
            )}
            {perfil.vencidas === 0 && perfil.porVencer === 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-green-500">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Al corriente ✨
              </span>
            )}
          </div>
        </div>

        {/* Saldo */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-on-surface-variant font-semibold">Saldo</p>
          <p className="text-body-sm font-bold text-primary">{fmt(perfil.saldo)}</p>
        </div>
      </div>

      {/* Chips de pregunta rápida personalizados */}
      <div className="mt-3 flex flex-wrap gap-2">
        {perfil.vencidas > 0 && (
          <button onClick={() => onPregunta('¿Qué pasa si no pago mis deudas vencidas?')}
            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-600">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            ¿Qué pasa con mis vencidas?
          </button>
        )}
        {perfil.porVencer > 0 && (
          <button onClick={() => onPregunta('¿Tengo descuento por pronto pago?')}
            className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
            ¿Hay descuento?
          </button>
        )}
        <button onClick={() => onPregunta('Analiza mi salud financiera completa')}
          className="flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-[11px] font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
          Ver análisis completo
        </button>
        <button onClick={() => onPregunta('¿Cuánto pagaré si pago todo hoy?')}
          className="flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-[11px] font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
          ¿Cuánto pago hoy?
        </button>
      </div>
    </div>
  );
}

// ── Burbujas ──────────────────────────────────────────────────────────────
function BurbujaBot({ mensaje }: { mensaje: Mensaje }) {
  // Renderizar markdown básico: **texto** → bold, listas, saltos de línea
  const renderTexto = (texto: string) => {
    const partes = texto.split(/(\*\*[^*]+\*\*)/g);
    return partes.map((parte, i) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return <strong key={i}>{parte.slice(2, -2)}</strong>;
      }
      return <span key={i}>{parte}</span>;
    });
  };

  return (
    <div className="flex items-end gap-2.5">
      <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 mb-1">
        <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
        {mensaje.loading ? (
          <div className="flex items-center gap-1.5 py-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <>
            <p className="text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {renderTexto(mensaje.texto)}
            </p>
            <p className="text-on-surface-variant text-[11px] mt-2">{mensaje.hora}</p>
          </>
        )}
      </div>
    </div>
  );
}

function BurbujaUser({ mensaje }: { mensaje: Mensaje }) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm p-4 max-w-[80%]">
        <p className="text-body-sm leading-relaxed">{mensaje.texto}</p>
        <div className="flex items-center justify-end gap-1 mt-2">
          <p className="text-on-primary/70 text-[11px]">{mensaje.hora}</p>
          <span className="text-on-primary/70 text-[11px]">✓✓</span>
        </div>
      </div>
    </div>
  );
}

// ── Chips de preguntas generales ──────────────────────────────────────────
const CHIPS_GENERALES = [
  { texto: '¿Cómo mejoro mi salud financiera?', icono: 'trending_up' },
  { texto: '¿Cómo pago con STP?', icono: 'payments' },
  { texto: '¿Qué pasa si pago tarde?', icono: 'schedule' },
  { texto: 'Explícame el descuento por pronto pago', icono: 'local_offer' },
];

// ── Página Principal ──────────────────────────────────────────────────────
export default function IAPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'welcome',
      rol: 'assistant',
      texto: '¡Hola! 👋 Soy tu asesor financiero de TOJ.\n\nConozco tu situación actual: tus obligaciones, pagos pendientes y tu salud financiera. Puedes preguntarme lo que quieras. 🏛️\n\n¿Empezamos viendo cómo estás?',
      hora: 'Ahora',
    },
  ]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showChips, setShowChips]     = useState(true);
  const [perfil, setPerfil]           = useState<PerfilFinanciero | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Cargar perfil financiero
  useEffect(() => {
    fetch('/api/ia/perfil')
      .then(r => r.json())
      .then(data => { if (!data.error) setPerfil(data); })
      .catch(() => {})
      .finally(() => setCargandoPerfil(false));
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [mensajes, scrollToBottom]);

  const enviarMensaje = async (texto: string) => {
    if (!texto.trim() || isLoading) return;
    setShowChips(false);
    setInput('');
    setIsLoading(true);

    const userMsg: Mensaje    = { id: Date.now().toString(), rol: 'user', texto: texto.trim(), hora: hora() };
    const loadingId           = `loading-${Date.now()}`;
    const loadingMsg: Mensaje = { id: loadingId, rol: 'assistant', texto: '', hora: hora(), loading: true };

    setMensajes(prev => [...prev, userMsg, loadingMsg]);

    try {
      const historial = mensajes
        .filter(m => !m.loading && m.id !== 'welcome')
        .map(m => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.texto }));
      historial.push({ role: 'user', content: texto.trim() });

      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial }),
      });

      if (!res.ok) throw new Error('Error en el servidor');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let respuestaCompleta = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            try {
              const delta = JSON.parse(jsonStr).choices?.[0]?.delta?.content ?? '';
              if (delta) {
                respuestaCompleta += delta;
                setMensajes(prev =>
                  prev.map(m => m.id === loadingId ? { ...m, texto: respuestaCompleta, loading: false } : m)
                );
              }
            } catch { /* ignorar líneas malformadas */ }
          }
        }
      }

      if (!respuestaCompleta) {
        setMensajes(prev =>
          prev.map(m => m.id === loadingId ? { ...m, texto: 'Lo siento, ocurrió un error. Intenta de nuevo.', loading: false } : m)
        );
      }
    } catch {
      setMensajes(prev =>
        prev.map(m => m.id === loadingId
          ? { ...m, texto: 'No pude conectarme. Verifica tu conexión. 🔌', loading: false }
          : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-surface z-10 px-5 py-3 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <Link href={'/dashboard' as Route} aria-label="Regresar">
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">arrow_back</span>
          </Link>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-body-md leading-tight">TOJ Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-bold tracking-widest text-green-500 uppercase">
                Tu asesor financiero personal • GPT-4o
              </p>
            </div>
          </div>
          {perfil && (
            <div className="shrink-0 flex flex-col items-center">
              <span className="text-[15px] font-black text-primary">{perfil.score}</span>
              <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-wide">Score</span>
            </div>
          )}
        </div>
      </header>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 py-4 space-y-4 overflow-y-auto" style={{ paddingBottom: 'calc(68px + 100px)' }}>

        {/* Widget Salud Financiera */}
        {cargandoPerfil ? (
          <div className="mx-4 mb-2 h-24 rounded-2xl border border-outline-variant bg-surface-container animate-pulse" />
        ) : perfil ? (
          <SaludFinancieraCard perfil={perfil} onPregunta={enviarMensaje} />
        ) : null}

        <div className="px-4 text-label-caps text-on-surface-variant bg-surface-container rounded-full mx-auto w-fit tracking-widest">
          HOY
        </div>

        <div className="px-4 space-y-4">
          {mensajes.map(msg =>
            msg.rol === 'assistant'
              ? <BurbujaBot key={msg.id} mensaje={msg} />
              : <BurbujaUser key={msg.id} mensaje={msg} />
          )}

          {/* Chips generales (inicio) */}
          {showChips && (
            <div className="ml-12 space-y-2">
              <p className="text-label-caps text-on-surface-variant font-bold tracking-widest">TAMBIÉN PUEDES PREGUNTAR</p>
              <div className="flex flex-wrap gap-2">
                {CHIPS_GENERALES.map(chip => (
                  <button key={chip.texto} onClick={() => enviarMensaje(chip.texto)} disabled={isLoading}
                    className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 text-[12px] text-on-surface hover:bg-surface-container hover:border-primary transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>{chip.icono}</span>
                    {chip.texto}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-[68px] left-0 right-0 max-w-[430px] mx-auto bg-surface border-t border-outline-variant px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-2.5 focus-within:border-primary transition-colors gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(input); } }}
              placeholder="Pregunta sobre tus finanzas..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none disabled:opacity-50"
            />
            {input && (
              <button onClick={() => setInput('')} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <button onClick={() => enviarMensaje(input)} disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shrink-0 hover:bg-primary/80 transition-all disabled:opacity-40">
            {isLoading
              ? <span className="material-symbols-outlined text-on-primary text-[18px] animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            }
          </button>
        </div>
        <p className="text-center text-[10px] text-on-surface-variant/50 mt-1.5">
          Respuestas basadas en tu perfil real • GPT-4o mini
        </p>
      </div>
    </div>
  );
}
