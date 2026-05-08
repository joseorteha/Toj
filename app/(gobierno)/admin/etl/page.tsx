'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface CargaResult {
  success: boolean;
  total: number;
  exitosos: number;
  errores: number;
  erroresDetalle: { fila: number; motivo: string }[];
  carga_id?: string;
}

interface CargaHistorial {
  id: string;
  nombre_archivo: string;
  registros_total: number;
  registros_exitosos: number;
  registros_error: number;
  estado: string;
  created_at: string;
}

export default function EtlPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CargaResult | null>(null);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<CargaHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/gobierno/cargas-historial');
      if (res.ok) {
        const data = await res.json();
        setHistorial(data.cargas || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/gobierno/carga-masiva', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el archivo');
      }

      setResult(data);
      fetchHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadErrorsCSV = () => {
    if (!result || result.errores === 0) return;

    const headers = ['Fila', 'Motivo'];
    const rows = result.erroresDetalle.map((e) => [e.fila.toString(), e.motivo]);
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `errores_carga_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalProcesados = historial.reduce((acc, c) => acc + (c.registros_total || 0), 0);
  const totalExitosos = historial.reduce((acc, c) => acc + (c.registros_exitosos || 0), 0);
  const tasaExito = totalProcesados > 0 ? ((totalExitosos / totalProcesados) * 100).toFixed(1) : '0';

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-toj-terracotta-light/80">ETL masivo</p>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold md:text-4xl">
            Carga de padrones
          </h1>
          <p className="text-sm text-white/50 mt-1">Importa obligaciones desde archivos CSV</p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5"
        >
          ← Volver al panel
        </Link>
      </div>

      {/* Stats Cards */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50 font-medium">Total procesados</p>
          <p className="text-4xl font-bold text-toj-terracotta mt-2">{totalProcesados.toLocaleString()}</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50 font-medium">Tasa de éxito</p>
          <p className="text-4xl font-bold text-green-500 mt-2">{tasaExito}%</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50 font-medium">Cargas realizadas</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">{historial.length}</p>
        </article>
      </section>

      {/* Upload Area */}
      <section className="mt-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center text-center ${
            loading
              ? 'border-toj-terracotta/50 bg-toj-terracotta/5'
              : 'border-white/10 hover:border-toj-terracotta/40 hover:bg-white/5'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <div className="w-20 h-20 bg-toj-terracotta/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span
              className={`material-symbols-outlined text-toj-terracotta text-[40px] ${loading ? 'animate-spin' : ''}`}
            >
              {loading ? 'sync' : 'upload_file'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {loading ? 'Procesando archivo...' : 'Sube tu padrón municipal'}
          </h2>
          <p className="text-white/50 max-w-md">
            Arrastra tu archivo CSV o haz clic para seleccionarlo. El sistema mapeará automáticamente los CURPs y
            generará las obligaciones.
          </p>

          {loading && (
            <div className="mt-8 w-64 bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="bg-toj-terracotta h-full animate-progress-bar" />
            </div>
          )}
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden">
            <div
              className={`border-b border-white/10 px-8 py-5 flex items-center justify-between ${
                result.errores > 0 ? 'bg-amber-500/10' : 'bg-green-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined ${result.errores > 0 ? 'text-amber-500' : 'text-green-500'}`}
                >
                  {result.errores > 0 ? 'warning' : 'check_circle'}
                </span>
                <h3 className="font-bold text-white">
                  {result.errores > 0 ? 'Carga completada con errores' : 'Carga completada exitosamente'}
                </h3>
              </div>
            </div>

            <div className="p-8 grid gap-6 md:grid-cols-3">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">Total procesado</p>
                <p className="text-4xl font-bold text-white">{result.total}</p>
              </div>
              <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/10">
                <p className="text-green-500/60 text-xs uppercase tracking-widest font-bold mb-2">Exitosos</p>
                <p className="text-4xl font-bold text-green-500">{result.exitosos}</p>
              </div>
              <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/10">
                <p className="text-red-500/60 text-xs uppercase tracking-widest font-bold mb-2">Errores</p>
                <p className="text-4xl font-bold text-red-500">{result.errores}</p>
              </div>
            </div>

            {result.errores > 0 && (
              <div className="px-8 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">report</span>
                    Detalle de errores ({result.errores})
                  </h4>
                  <button
                    onClick={downloadErrorsCSV}
                    className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Descargar CSV
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {result.erroresDetalle.slice(0, 10).map((err, i) => (
                    <div
                      key={i}
                      className="bg-red-500/10 rounded-xl px-4 py-3 flex items-center justify-between text-sm"
                    >
                      <span className="text-red-300/80 font-mono">Fila {err.fila}</span>
                      <span className="text-white/70">{err.motivo}</span>
                    </div>
                  ))}
                  {result.erroresDetalle.length > 10 && (
                    <p className="text-white/40 text-xs text-center py-2">
                      ... y {result.erroresDetalle.length - 10} errores más (descarga el CSV para ver todos)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {error && (
        <section className="mt-8">
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
            <div>
              <h3 className="font-bold text-white text-lg">Error en la carga</h3>
              <p className="text-red-300/80">{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* Historial de Cargas */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px]">history</span>
          Historial de Cargas
        </h2>

        {loadingHistorial ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[32px] text-white/30">progress_activity</span>
          </div>
        ) : historial.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/20 mb-2">folder_open</span>
            <p className="text-white/50">No hay cargas registradas</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden divide-y divide-white/10">
            {historial.slice(0, 5).map((carga) => (
              <div key={carga.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      carga.estado === 'Completada'
                        ? 'bg-green-500/20'
                        : carga.estado === 'CompletadaConErrores'
                        ? 'bg-amber-500/20'
                        : 'bg-red-500/20'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        carga.estado === 'Completada'
                          ? 'text-green-500'
                          : carga.estado === 'CompletadaConErrores'
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      {carga.estado === 'Completada'
                        ? 'check_circle'
                        : carga.estado === 'CompletadaConErrores'
                        ? 'warning'
                        : 'error'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{carga.nombre_archivo || 'Archivo CSV'}</p>
                    <p className="text-white/40 text-xs">
                      {new Date(carga.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Exitosos</p>
                    <p className="text-green-500 font-bold">{carga.registros_exitosos ?? 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Errores</p>
                    <p className="text-red-500 font-bold">{carga.registros_error ?? 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes progress-bar {
          0% {
            width: 0;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
