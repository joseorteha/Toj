'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { finalizarKyc } from './actions';

interface Props {
  estadoKyc: string;
  nombreCompleto: string;
  tieneSelfie: boolean;
  tieneComprobante: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// STEPPER
// ══════════════════════════════════════════════════════════════════════════════
type Paso = { numero: number; label: string; sublabel: string };
const PASOS: Paso[] = [
  { numero: 1, label: 'Identidad', sublabel: 'Selfie' },
  { numero: 2, label: 'Domicilio', sublabel: 'Comprobante' },
  { numero: 3, label: 'Finalizar', sublabel: 'Revisión' },
];

function Stepper({ pasoActual }: { pasoActual: number }) {
  return (
    <div className="flex items-start justify-between mb-8 px-4">
      {PASOS.map((paso, idx) => (
        <div key={paso.numero} className="flex items-start flex-1">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] ${pasoActual >= paso.numero ? 'bg-primary text-on-primary' : 'bg-surface-container border-2 border-outline-variant text-on-surface-variant'}`}>
              {pasoActual > paso.numero ? <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : paso.numero}
            </div>
            <div className="text-center">
              <p className={`text-label-caps font-bold tracking-widest leading-tight ${pasoActual >= paso.numero ? 'text-primary' : 'text-on-surface-variant'}`}>{paso.label}</p>
              <p className="text-[10px] text-on-surface-variant leading-tight">{paso.sublabel}</p>
            </div>
          </div>
          {idx < PASOS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mt-4 ${pasoActual > paso.numero ? 'bg-primary' : 'bg-outline-variant'}`} />}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1: SELFIE
// ══════════════════════════════════════════════════════════════════════════════
function StepIdentidad({
  selfieFile,
  onSelect,
  onNext,
}: {
  selfieFile: File | null;
  onSelect: (file: File) => void;
  onNext: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);

  const [camState, setCamState] = useState<'idle' | 'active' | 'captured' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [camError, setCamError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    stopCamera();
    setCamState('active');
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setCamState('error');
      if (err.name === 'NotAllowedError') {
        setCamError('Permiso de cámara denegado. Habilítalo en tu navegador o usa el botón para subir una imagen.');
      } else {
        setCamError(`No se pudo acceder a la cámara: ${err.message || err.name}`);
      }
    }
  };

  const capturarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewUrl(dataUrl);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onSelect(file);
      }
    }, 'image/jpeg', 0.92);
    stopCamera();
    setCamState('captured');
  };

  const reintentar = () => {
    setPreviewUrl(null);
    setCamState('idle');
  };

  const voltear = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await startCamera(next);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div>
      <h1 className="text-h2 font-bold text-on-surface text-center">Verifica tu identidad</h1>
      <p className="text-body-md text-on-surface-variant mt-2 text-center">Toma una selfie para confirmar que eres tú</p>

      <div className="relative mt-6 w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '4/5', maxHeight: '380px' }}>
        {camState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d1f1c]">
            <div className="relative w-36 h-36">
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse opacity-60" />
              <div className="w-full h-full rounded-full bg-[#0d2420] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '64px', fontVariationSettings: "'FILL' 0, 'wght' 200" }}>face</span>
              </div>
            </div>
            <p className="text-white/60 text-body-sm">Presiona "Activar cámara" para comenzar</p>
          </div>
        )}

        {camState === 'active' && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === 'user' ? '[transform:scaleX(-1)]' : ''}`} />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-primary rounded-br-sm" />
              </div>
            </div>
            <button onClick={voltear} className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2.5 text-white hover:bg-black/70 transition-colors">
              <span className="material-symbols-outlined text-[22px]">flip_camera_ios</span>
            </button>
          </>
        )}

        {camState === 'captured' && previewUrl && (
          <img src={previewUrl} alt="Selfie capturada" className="w-full h-full object-cover" />
        )}

        {camState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a0a0a] px-6">
            <span className="material-symbols-outlined text-red-400 text-[48px]">no_photography</span>
            <p className="text-red-300 text-body-sm text-center leading-relaxed">{camError}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-4 space-y-3">
        {camState === 'idle' && (
          <button type="button" onClick={() => startCamera(facingMode)}
            className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>camera_alt</span>
            Activar cámara
          </button>
        )}

        {camState === 'active' && (
          <button type="button" onClick={capturarFoto}
            className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-all shadow-lg">
            <span className="w-6 h-6 rounded-full border-4 border-on-primary/80 bg-on-primary/20 inline-block" />
            Tomar Foto
          </button>
        )}

        {camState === 'captured' && (
          <div className="flex gap-3">
            <button type="button" onClick={reintentar}
              className="flex-1 bg-surface-container text-on-surface rounded-2xl py-3.5 text-body-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Repetir
            </button>
            <button type="button" onClick={onNext}
              className="flex-1 bg-primary text-on-primary rounded-2xl py-3.5 text-body-md font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              ¡Usar ésta!
            </button>
          </div>
        )}

        {camState === 'error' && (
          <>
            <input ref={fallbackInputRef} type="file" accept="image/*" capture="user"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onSelect(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  setCamState('captured');
                }
              }}
              className="hidden"
            />
            <button type="button" onClick={() => fallbackInputRef.current?.click()}
              className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span>
              Subir foto desde galería
            </button>
          </>
        )}
      </div>

      <ul className="mt-5 space-y-1.5">
        {['Buena iluminación', 'Sin lentes oscuros', 'Mira de frente'].map((tip) => (
          <li key={tip} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2: COMPROBANTE
// ══════════════════════════════════════════════════════════════════════════════
function StepDomicilio({
  comprobanteFile,
  onSelect,
  onNext,
}: {
  comprobanteFile: File | null;
  onSelect: (file: File) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="text-center space-y-4">
      <h1 className="text-h2 font-bold text-on-surface">Comprobante de domicilio</h1>
      <p className="text-body-md text-on-surface-variant">Sube o fotografía tu comprobante reciente (menos de 3 meses).</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-[48px]">upload_file</span>
        <p className="text-body-sm text-on-surface-variant">Toca para subir archivo</p>
        <span className="text-label-caps text-outline font-bold tracking-wide">PDF, JPG o PNG — Máx. 5 MB</span>
      </div>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onSelect(file);
      }} className="hidden" />
      {comprobanteFile && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left text-body-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <span className="flex-1 truncate">{comprobanteFile.name}</span>
          <button onClick={() => inputRef.current?.click()} className="text-primary text-body-sm font-semibold hover:underline shrink-0">Cambiar</button>
        </div>
      )}
      <button type="button" onClick={onNext} disabled={!comprobanteFile}
        className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        Continuar
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3: FINALIZAR / EN PROCESO
// ══════════════════════════════════════════════════════════════════════════════
function StepFinalizar({
  enRevision,
  selfieFile,
  comprobanteFile,
}: {
  enRevision: boolean;
  selfieFile: File | null;
  comprobanteFile: File | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEnviar = () => {
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      if (selfieFile) formData.append('selfie', selfieFile);
      if (comprobanteFile) formData.append('comprobante', comprobanteFile);
      const result = await finalizarKyc(formData);
      if (result?.error) setError(result.error);
    });
  };

  const handleVerificarEstado = () => {
    router.refresh();
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-primary text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {enRevision ? 'hourglass_top' : 'verified'}
        </span>
      </div>
      <div>
        <h1 className="text-h2 font-bold text-on-surface">
          {enRevision ? 'Verificación en proceso' : '¡Casi listo!'}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          {enRevision 
            ? 'Tus documentos están siendo revisados. Cuando el administrador apruebe tu identidad, podrás acceder a todas las funcionalidades.'
            : 'Tu información está lista para enviar a revisión.'}
        </p>
      </div>
      
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left space-y-2">
        {['Selfie capturada', 'Comprobante subido', enRevision ? 'Esperando aprobación' : 'Listo para enviar'].map((item, i) => (
          <div key={item} className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${i < 2 ? 'text-primary' : enRevision ? 'text-amber-500' : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {i < 2 ? 'check_circle' : enRevision ? 'pending' : 'radio_button_unchecked'}
            </span>
            <span className={`text-body-sm ${i < 2 ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>{item}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-400">{error}</div>
      )}

      {enRevision ? (
        <div className="space-y-3">
          <button 
            onClick={handleVerificarEstado}
            className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Verificar estado
          </button>
          <p className="text-on-surface-variant/60 text-xs">
            Si ya fuiste aprobado, presiona el botón para actualizar
          </p>
        </div>
      ) : (
        <button type="button" onClick={handleEnviar}
          disabled={isPending || !selfieFile || !comprobanteFile}
          className="w-full bg-primary text-on-primary rounded-2xl py-4 text-body-md font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending ? (
            <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Subiendo archivos...</>
          ) : (
            <><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span> Enviar documentos</>
          )}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function KycFlow({ estadoKyc, nombreCompleto, tieneSelfie, tieneComprobante }: Props) {
  const [pasoActual, setPasoActual] = useState(() => {
    // Si ya envió documentos (EnProceso), ir directo al paso 3
    if (estadoKyc === 'EnProceso' && tieneSelfie && tieneComprobante) return 3;
    return 1;
  });
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  
  const enRevision = estadoKyc === 'EnProceso';
  const avanzar = () => setPasoActual((p) => Math.min(p + 1, 3));

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-outline-variant">
        <span className="text-primary font-bold text-[18px]">TOJ Platform</span>
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant text-body-sm">Hola, {nombreCompleto.split(' ')[0]}</span>
          <button aria-label="Ayuda">
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">help_outline</span>
          </button>
        </div>
      </header>
      
      <div className="px-5 py-6">
        <Stepper pasoActual={pasoActual} />
        
        {pasoActual === 1 && (
          <StepIdentidad selfieFile={selfieFile} onSelect={setSelfieFile} onNext={avanzar} />
        )}
        {pasoActual === 2 && (
          <StepDomicilio comprobanteFile={comprobanteFile} onSelect={setComprobanteFile} onNext={avanzar} />
        )}
        {pasoActual === 3 && (
          <StepFinalizar enRevision={enRevision} selfieFile={selfieFile} comprobanteFile={comprobanteFile} />
        )}
      </div>
    </div>
  );
}
