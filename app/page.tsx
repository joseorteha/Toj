import Link from 'next/link';

// ─── Datos ─────────────────────────────────────────────────────────────────

const SERVICIOS = [
  { icon: 'folder_managed',    titulo: 'Carpeta ciudadana digital',  desc: 'Documentos, pagos y comprobantes organizados en un solo lugar seguro.' },
  { icon: 'checklist_rtl',     titulo: 'Motor de obligaciones',      desc: 'Detecta fechas, requisitos y pendientes antes de que venzan.' },
  { icon: 'payments',          titulo: 'Pagos y conciliación',       desc: 'Pago seguro vía STP con comprobación automática en tiempo real.' },
  { icon: 'smart_toy',         titulo: 'Asistente con IA',           desc: 'Explica qué sigue y qué documento necesitas en lenguaje simple.' },
  { icon: 'dashboard',         titulo: 'Panel institucional',        desc: 'Monitorea, valida y da seguimiento claro a cada operación.' },
  { icon: 'savings',           titulo: 'Bienestar financiero',       desc: 'Planea pagos, evita recargos y vive con más tranquilidad.' },
];

const PASOS = [
  { num: '01', titulo: 'Consulta tus obligaciones.',   desc: 'TOJ te muestra lo importante primero.',               icon: 'search' },
  { num: '02', titulo: 'Recibe recordatorios.',         desc: 'Avisos claros antes de cada fecha límite.',           icon: 'notifications_active' },
  { num: '03', titulo: 'Paga y guarda comprobantes.',  desc: 'Todo queda listo en tu carpeta digital.',             icon: 'receipt_long' },
  { num: '04', titulo: 'La institución concilia.',      desc: 'Menos trabajo manual, más trazabilidad.',             icon: 'verified' },
];

const SEGURIDAD = [
  { icon: 'payments',         label: 'Pagos seguros' },
  { icon: 'receipt_long',     label: 'Comprobantes digitales' },
  { icon: 'manage_history',   label: 'Historial auditable' },
  { icon: 'privacy_tip',      label: 'Protección de datos' },
  { icon: 'key',              label: 'Control de accesos' },
];

// ─── Componentes pequeños ──────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(13,27,42,0.85)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)' }}>
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white tracking-tight">TOJ</span>
        </Link>

        {/* Links (desktop) */}
        <div className="hidden items-center gap-7 md:flex">
          {['Ciudadanos', 'Instituciones', 'Servicios', 'Seguridad'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-white/60 transition hover:text-white">
              {item}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-white/70 transition hover:text-white md:block">
            Entrar
          </Link>
          <Link href="/registro" className="rounded-full px-4 py-2 text-sm font-bold text-white transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)' }}>
            Ver demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[280px] rounded-3xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-xs font-bold text-white/40 tracking-widest uppercase">TOJ Platform</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#009B8D]/20">
          <span className="material-symbols-outlined text-[#009B8D] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </span>
      </div>
      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Próximo vencimiento</p>
          <p className="mt-1 font-bold text-white text-base">Predial 2026</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#009B8D] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
            <span className="text-xs text-white/60">30 sep 2026</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 p-4 flex items-center justify-between" style={{ background: 'rgba(0,155,141,0.08)' }}>
          <div>
            <p className="text-xs text-white/40">Total</p>
            <p className="text-xl font-bold text-[#009B8D] tabular-nums">$3,200.00</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            Pagar
          </button>
        </div>
        {/* Mini wallet */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'linear-gradient(135deg,rgba(0,155,141,0.2),rgba(0,123,112,0.1))' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#009B8D] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            <span className="text-xs font-semibold text-white/70">Recordatorio</span>
          </div>
          <p className="text-xs text-white/50">Te avisamos antes de que venza para evitar recargos.</p>
        </div>
        {/* Paid item */}
        <div className="rounded-xl border border-white/10 p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#009B8D]/15">
            <span className="material-symbols-outlined text-[#009B8D] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Predial 2025 pagado</p>
            <p className="text-[10px] text-white/40">Folio TOJ-8421 · PDF</p>
          </div>
          <span className="text-[10px] font-bold text-[#009B8D] bg-[#009B8D]/10 px-2 py-0.5 rounded-full">✓</span>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0D1B2A' }}>
      <Navbar />

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section id="inicio" className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-32">
        {/* Gradientes de fondo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #009B8D, transparent 70%)' }} />
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #E26D4A, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #009B8D, transparent)' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Texto */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#009B8D]/30 px-4 py-2 text-sm font-semibold text-[#009B8D]" style={{ background: 'rgba(0,155,141,0.08)' }}>
                <span className="h-2 w-2 rounded-full bg-[#009B8D] animate-pulse" />
                Tecnología pública para estar al corriente
              </div>

              <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Cumple fácil,{' '}
                <span className="relative">
                  <span className="relative z-10 text-[#009B8D]">vive mejor.</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 rounded-full opacity-20" style={{ background: '#009B8D' }} />
                </span>
              </h1>

              <p className="max-w-xl text-lg leading-8 text-white/60">
                TOJ ayuda a ciudadanos a consultar trámites, recibir recordatorios, pagar en línea y guardar comprobantes — mientras las instituciones automatizan procesos y mejoran la atención.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/registro"
                  className="flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #009B8D, #007B70)' }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  Ver demo
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-2xl border border-white/15 px-7 py-4 text-base font-bold text-white/80 transition hover:border-white/30 hover:text-white hover:-translate-y-0.5"
                >
                  Entrar a la plataforma
                  <span className="material-symbols-outlined text-[20px]">north_east</span>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-2">
                {[
                  { num: '12,480', label: 'Pagos procesados' },
                  { num: '3,214', label: 'Trámites activos' },
                  { num: '96%', label: 'Satisfacción' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-white">{stat.num}</p>
                    <p className="text-xs text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow detrás del mockup */}
                <div className="absolute inset-0 scale-90 rounded-3xl blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0,155,141,0.25), transparent 70%)' }} />
                <HeroMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EL PROBLEMA ════════════════════════════════════════════════════ */}
      <section id="ciudadanos" className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E26D4A]">El problema</p>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
              Hoy cumplir con el gobierno sigue siendo complicado.
            </h2>
            <p className="mx-auto max-w-xl text-base text-white/50 leading-7">
              La información no siempre está clara y eso afecta tanto a personas como a instituciones.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: 'layers',         titulo: 'Información dispersa',                desc: 'Fechas, requisitos y pasos viven en lugares distintos, sin orden ni claridad.' },
              { icon: 'receipt_long',   titulo: 'Pagos difíciles de rastrear',         desc: 'Pagar es solo una parte; comprobar el pago suele ser lo más difícil.' },
              { icon: 'sync_alt',       titulo: 'Procesos manuales',                   desc: 'Validar y conciliar sigue consumiendo tiempo operativo valioso.' },
            ].map(item => (
              <article key={item.titulo} className="rounded-3xl border border-white/8 p-7 transition hover:border-[#E26D4A]/30 hover:bg-white/3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E26D4A]/20" style={{ background: 'rgba(226,109,74,0.1)' }}>
                  <span className="material-symbols-outlined text-[#E26D4A] text-[24px]">{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.titulo}</h3>
                <p className="text-sm leading-6 text-white/50">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LA SOLUCIÓN ════════════════════════════════════════════════════ */}
      <section id="instituciones" className="py-20 md:py-28 border-t border-white/5" style={{ background: 'rgba(0,155,141,0.04)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#009B8D]">La solución</p>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
              Una plataforma para ordenar la relación<br className="hidden md:block" /> entre ciudadanos y gobierno.
            </h2>
            <p className="mx-auto max-w-xl text-base text-white/50 leading-7">
              Clara para las personas, útil para las instituciones y pensada para avanzar con más tranquilidad.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: 'person',     titulo: 'Ciudadanos',    desc: 'Consulta obligaciones, paga en línea y recibe recordatorios sin esfuerzo.',     color: '#009B8D' },
              { icon: 'apartment',  titulo: 'Instituciones', desc: 'Valida, concilia y genera reportes con trazabilidad completa.',                  color: '#009B8D' },
              { icon: 'favorite',   titulo: 'Bienestar',     desc: 'Planea pagos, evita recargos y vive con más tranquilidad financiera.',           color: '#E26D4A' },
            ].map(item => (
              <article key={item.titulo} className="rounded-3xl border border-white/8 p-8 text-center transition hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10" style={{ background: `${item.color}22` }}>
                  <span className="material-symbols-outlined text-[32px]" style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.titulo}</h3>
                <p className="text-sm leading-6 text-white/50">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICIOS ══════════════════════════════════════════════════════ */}
      <section id="servicios" className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#009B8D]">Servicios</p>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
              Lo esencial para consultar, pagar,<br className="hidden md:block" /> comprobar y operar mejor.
            </h2>
            <p className="mx-auto max-w-xl text-base text-white/50 leading-7">
              Seis capacidades conectadas para una experiencia pública más clara.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICIOS.map((s, i) => (
              <article key={s.titulo} className="group rounded-3xl border border-white/8 p-6 transition hover:border-[#009B8D]/30 hover:-translate-y-1 cursor-default" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ background: 'rgba(0,155,141,0.12)' }}>
                  <span className="material-symbols-outlined text-[#009B8D] text-[22px]">{s.icon}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{s.titulo}</h3>
                <p className="text-sm leading-6 text-white/45">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#009B8D]">Cómo funciona</p>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
              Un flujo visual, claro y continuo.
            </h2>
            <p className="mx-auto max-w-lg text-base text-white/50 leading-7">
              Cuatro pasos para consultar, pagar y dar seguimiento sin perder el orden.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((paso, i) => (
              <article key={paso.num} className="relative">
                {/* Conector */}
                {i < PASOS.length - 1 && (
                  <div className="absolute top-6 left-full hidden lg:block w-full h-px z-10" style={{ background: 'linear-gradient(90deg, rgba(0,155,141,0.4), rgba(0,155,141,0.1))' }} />
                )}
                <div className="rounded-3xl border border-white/8 p-6 h-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black text-white/10">{paso.num}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(0,155,141,0.15)' }}>
                      <span className="material-symbols-outlined text-[#009B8D] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{paso.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{paso.titulo}</h3>
                  <p className="text-sm text-white/45 leading-6">{paso.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PANEL INSTITUCIONAL (Dashboard demo) ══════════════════════════ */}
      <section id="instituciones2" className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="space-y-7">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#009B8D]">Instituciones</p>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
                Tecnología pública para operar con menos fricción.
              </h2>
              <p className="text-base leading-7 text-white/55">
                Beneficios concretos para pagos, seguimiento y atención ciudadana. Todo con trazabilidad completa y reportes automáticos.
              </p>
              <ul className="space-y-3">
                {['Menos filas presenciales', 'Conciliación automática STP', 'Reportes claros y exportables', 'Trazabilidad por operación', 'Mejor atención ciudadana'].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#009B8D]/15">
                      <span className="material-symbols-outlined text-[#009B8D] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                    </span>
                    <span className="text-sm font-medium text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)' }}
              >
                Acceder al panel
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* Mini Dashboard Mockup */}
            <div className="rounded-3xl border border-white/10 p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Panel institucional</span>
                <span className="text-xs text-white/30">En tiempo real</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pagos conciliados', value: '12,480', color: '#009B8D' },
                  { label: 'Trámites activos',  value: '3,214',  color: '#009B8D' },
                  { label: 'Reportes',          value: '96',     color: '#E26D4A' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-2xl border border-white/8 p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                    <p className="mt-1 text-[10px] text-white/40 leading-tight">{kpi.label}</p>
                  </div>
                ))}
              </div>
              {/* Mini chart placeholder */}
              <div className="rounded-2xl border border-white/8 p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/60">Seguimiento de cumplimiento</span>
                  <span className="text-[10px] font-bold text-[#009B8D] bg-[#009B8D]/10 px-2 py-0.5 rounded-full">Activo</span>
                </div>
                <div className="flex items-end gap-1.5 h-14">
                  {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${h}%`, background: `rgba(0,155,141,${0.3 + i * 0.1})` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-white/25">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
              <div className="rounded-2xl border border-[#E26D4A]/20 p-3 flex items-center gap-3" style={{ background: 'rgba(226,109,74,0.06)' }}>
                <span className="material-symbols-outlined text-[#E26D4A] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                <div>
                  <p className="text-xs font-semibold text-white/80">Próximos vencimientos</p>
                  <p className="text-[10px] text-white/40">842 obligaciones por atender</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEGURIDAD ══════════════════════════════════════════════════════ */}
      <section id="seguridad" className="py-20 md:py-28 border-t border-white/5" style={{ background: 'rgba(0,155,141,0.03)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Chips de seguridad */}
            <div className="flex flex-wrap gap-3">
              {SEGURIDAD.map(s => (
                <div key={s.label} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-[#009B8D]/40 hover:text-white" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="material-symbols-outlined text-[#009B8D] text-[18px]">{s.icon}</span>
                  {s.label}
                </div>
              ))}
              {/* Glow badge */}
              <div className="flex items-center gap-2 rounded-full border border-[#009B8D]/40 px-4 py-2.5 text-sm font-bold text-[#009B8D]" style={{ background: 'rgba(0,155,141,0.08)' }}>
                <span className="h-2 w-2 rounded-full bg-[#009B8D] animate-pulse" />
                Verificación biométrica KYC
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#009B8D]">Seguridad</p>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold md:text-4xl">
                Seguridad y trazabilidad desde el primer pago.
              </h2>
              <p className="text-base leading-7 text-white/55">
                Cada comprobante, cada movimiento y cada acceso quedan registrados con trazabilidad completa para personas e instituciones.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'shield',          label: 'Cifrado end-to-end' },
                  { icon: 'verified_user',   label: 'KYC biométrico' },
                  { icon: 'lock',            label: 'Autenticación 2FA' },
                  { icon: 'policy',          label: 'Auditoría completa' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/8 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="material-symbols-outlined text-[#009B8D] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <span className="text-sm font-medium text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#009B8D]/30 px-4 py-2 text-sm font-semibold text-[#009B8D]" style={{ background: 'rgba(0,155,141,0.08)' }}>
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            Tecnología pública para estar al corriente
          </div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold md:text-5xl leading-tight">
            Haz que cumplir sea más fácil{' '}
            <span className="text-[#009B8D]">para todos.</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-7 text-white/55">
            Moderniza trámites, pagos y atención ciudadana con una plataforma clara, segura y humana.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-xl transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)', boxShadow: '0 20px 40px rgba(0,155,141,0.3)' }}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>north_east</span>
              Entrar a la plataforma
            </Link>
            <Link
              href="/registro"
              className="flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-base font-bold text-white/80 transition hover:border-white/30 hover:text-white hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/8 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#009B8D,#007B70)' }}>
                <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
              <div>
                <p className="font-[family-name:var(--font-space-grotesk)] font-bold text-white">TOJ</p>
                <p className="text-[11px] text-white/30">Cumple fácil, vive mejor.</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
              {['Plataforma', 'Servicios', 'Seguridad', 'Privacidad', 'Términos'].map(item => (
                <a key={item} href="#" className="transition hover:text-white/70">{item}</a>
              ))}
            </div>

            <p className="text-xs text-white/25">
              © 2026 TOJ Platform. Tecnología pública.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
