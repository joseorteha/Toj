'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { vincularTelegram } from './actions';

export function VincularTelegramBtn({ ciudadanoId }: { ciudadanoId: string }) {
  const [showInput, setShowInput] = useState(false);
  const [chatId, setChatId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleVincular = () => {
    if (!chatId.trim()) {
      setError('Ingresa tu Chat ID de Telegram');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await vincularTelegram(ciudadanoId, chatId.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-primary text-sm font-medium">
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        ¡Telegram vinculado correctamente!
      </div>
    );
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="w-full bg-sky-500/20 text-sky-500 rounded-xl py-3 text-sm font-bold hover:bg-sky-500/30 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">link</span>
        Vincular Telegram
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-surface-container rounded-xl p-3 text-xs text-on-surface-variant space-y-2">
        <p className="font-semibold text-on-surface">¿Cómo obtener tu Chat ID?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Abre Telegram y busca <strong>@userinfobot</strong></li>
          <li>Escríbele cualquier mensaje</li>
          <li>Te responderá con tu <strong>Chat ID</strong> (número)</li>
          <li>Pega ese número aquí abajo</li>
        </ol>
      </div>

      <input
        type="text"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        placeholder="Ej: 123456789"
        className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
      />

      {error && (
        <p className="text-red-500 text-xs font-medium">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { setShowInput(false); setChatId(''); setError(''); }}
          className="flex-1 border border-outline-variant rounded-xl py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleVincular}
          disabled={isPending}
          className="flex-1 bg-sky-500 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              Vinculando...
            </>
          ) : (
            'Vincular'
          )}
        </button>
      </div>
    </div>
  );
}
