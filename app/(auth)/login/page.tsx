'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithPassword, signInWithMagicLink } from './actions';

type Tab = 'password' | 'magic';

function LoginContent() {
  const searchParams = useSearchParams();
  const paramMessage = searchParams.get('message');
  const paramError = searchParams.get('error');
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(
    paramError === 'auth_error' ? 'El enlace expiró. Intenta de nuevo.' : ''
  );
  const [magicSent, setMagicSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePasswordLogin = () => {
    setError('');
    startTransition(async () => {
      try {
        const res = await signInWithPassword(email, password);
        if ('error' in res) {
          setError(res.error);
        } else if ('redirect' in res) {
          router.push(res.redirect);
          router.refresh();
        }
      } catch (e: any) {
        // Ignorar errores NEXT_REDIRECT (no deberían llegar aquí)
        if (!e?.digest?.includes?.('NEXT_REDIRECT')) {
          setError('Error al iniciar sesión. Intenta de nuevo.');
        }
      }
    });
  };

  const handleMagicLink = () => {
    setError('');
    startTransition(async () => {
      const res = await signInWithMagicLink(email);
      if ('error' in res) setError(res.error);
      else setMagicSent(true);
    });
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #009B8D 0%, #007B70 100%)' }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}
          >
            account_balance
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">TOJ Platform</h1>
          <p className="mt-1 text-sm text-white/50">Servicios municipales digitales</p>
        </div>
      </div>

      {/* Aviso de email confirmado */}
      {paramMessage === 'confirm_email' && (
        <div className="mb-4 rounded-2xl border border-toj-jade/30 bg-toj-jade/10 px-4 py-3 text-sm text-toj-jade">
          <span className="material-symbols-outlined align-middle text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {' '}Revisa tu correo para confirmar tu cuenta.
        </div>
      )}

      {/* Card glassmorphism */}
      <div
        className="rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.25)' }}>
          {(['password', 'magic'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setMagicSent(false); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-toj-jade text-white shadow-md'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t === 'password' ? 'Contraseña' : '✨ Magic Link'}
            </button>
          ))}
        </div>

        {/* Magic Link enviado */}
        {magicSent ? (
          <div className="py-6 text-center">
            <span className="material-symbols-outlined text-toj-jade" style={{ fontSize: 56, fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            <p className="mt-3 font-semibold text-white">¡Revisa tu correo!</p>
            <p className="mt-1 text-sm text-white/50">Te enviamos un enlace a <span className="text-white/80">{email}</span></p>
            <button onClick={() => setMagicSent(false)} className="mt-5 text-sm text-toj-jade hover:underline">
              Intentar con otro correo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Correo electrónico</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-toj-jade transition-colors">
                <span className="material-symbols-outlined text-white/30 text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password (solo en tab password) */}
            {tab === 'password' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Contraseña</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-toj-jade transition-colors">
                  <span className="material-symbols-outlined text-white/30 text-[20px]">lock</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    autoComplete="current-password"
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={tab === 'password' ? handlePasswordLogin : handleMagicLink}
              disabled={isPending || !email || (tab === 'password' && !password)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #009B8D 0%, #007B70 100%)' }}
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Verificando...
                </>
              ) : tab === 'password' ? (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                  Entrar a TOJ
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  Enviar Magic Link
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-white/40">
        ¿Primera vez aquí?{' '}
        <Link href="/registro" className="font-semibold text-toj-jade hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><span className="material-symbols-outlined animate-spin text-[32px] text-toj-jade">progress_activity</span></div>}>
      <LoginContent />
    </Suspense>
  );
}
