'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 847, suffix: '+', label: 'Verified agencies' },
  { value: 24, suffix: 'h', label: 'Average first response' },
  { value: 94, suffix: '%', label: 'Match accuracy' },
  { value: 31, suffix: '', label: 'EU markets covered' },
]

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Upload your property',
    desc: 'Documents, photos, price — 5 minutes.',
    color: '#dc2626',
  },
  {
    step: '02',
    title: 'AI builds your package',
    desc: 'Sales letter, cover, translations — instantly.',
    color: '#ea580c',
  },
  {
    step: '03',
    title: 'Agencies are matched',
    desc: 'Cross-border specialists selected by AI.',
    color: '#f97316',
  },
  {
    step: '04',
    title: 'Distribution goes live',
    desc: 'Email + WhatsApp + Telegram — wave by wave.',
    color: '#dc2626',
  },
  {
    step: '05',
    title: 'Leads come to you',
    desc: 'Every response forwarded to your inbox.',
    color: '#b91c1c',
  },
]

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function StatCard({
  value,
  suffix,
  label,
  animate,
}: {
  value: number
  suffix: string
  label: string
  animate: boolean
}) {
  const count = useCountUp(value, 1800, animate)
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
        {count}
        <span className="text-orange-400">{suffix}</span>
      </span>
      <span className="text-sm text-white/50 mt-1 font-medium uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

export default function HeroCinematic() {
  const [activeStep, setActiveStep] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  // Text reveal on mount
  useEffect(() => {
    const t = setTimeout(() => setTextVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance workflow steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % WORKFLOW_STEPS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Intersection observer for stats
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* ── Ambient gradient orbs ──────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {/* Top-left warm orb */}
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.12]"
          style={{
            background:
              'radial-gradient(circle, #dc2626 0%, #ea580c 40%, transparent 70%)',
          }}
        />
        {/* Bottom-right cool orb */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{
            background:
              'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          {/* Inline SVG mark */}
          <svg width="36" height="36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navFlame" x1="100" y1="180" x2="100" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ea580c"/>
                <stop offset="100%" stopColor="#dc2626"/>
              </linearGradient>
            </defs>
            <path d="M100 22 L62 108 L76 104 L64 148 L100 132 L136 148 L124 104 L138 108 Z" fill="url(#navFlame)"/>
            <path d="M100 44 L84 102 L100 96 L116 102 Z" fill="white" fillOpacity="0.25"/>
            <rect x="56" y="148" width="88" height="10" rx="5" fill="url(#navFlame)"/>
          </svg>
          <span className="text-white font-bold text-xl tracking-tight">
            Prop<span className="text-orange-500">Blaze</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#agencies" className="hover:text-white transition-colors">Agencies</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/auth/login"
            className="hidden md:inline text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </a>
          <a
            href="/auth/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              boxShadow: '0 0 20px rgba(220,38,38,0.4)',
            }}
          >
            Start free →
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div
            className="transition-all duration-1000"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(32px)',
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              847 agencies live across 31 EU markets
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
              Sell smarter.
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Close faster.
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/50 max-w-md leading-relaxed">
              Upload your property. Our AI matches it with the right agencies across Europe and sends a personalised pitch — in 24 hours.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                  boxShadow: '0 8px 32px rgba(220,38,38,0.35)',
                }}
              >
                List your property free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white/80 font-semibold text-base border border-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 6.5L12 9 7 11.5V6.5Z" fill="currentColor"/>
                </svg>
                See how it works
              </a>
            </div>

            <p className="mt-5 text-xs text-white/30">
              No credit card · First property free · Cancel anytime
            </p>
          </div>

          {/* Right: Live workflow demo card */}
          <div
            className="transition-all duration-1000 delay-300"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(40px)',
            }}
          >
            <div
              className="relative rounded-3xl overflow-hidden border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-white/30 font-mono">PropBlaze Distribution Engine</span>
              </div>

              {/* Workflow steps */}
              <div className="p-6 space-y-3">
                {WORKFLOW_STEPS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-500"
                    style={{
                      background:
                        i === activeStep
                          ? `linear-gradient(135deg, ${s.color}18, ${s.color}08)`
                          : 'transparent',
                      borderLeft:
                        i === activeStep
                          ? `2px solid ${s.color}`
                          : '2px solid transparent',
                      opacity: i === activeStep ? 1 : i < activeStep ? 0.4 : 0.25,
                      transform: i === activeStep ? 'translateX(4px)' : 'translateX(0)',
                    }}
                  >
                    <span
                      className="text-xs font-black font-mono mt-0.5 shrink-0"
                      style={{ color: i <= activeStep ? s.color : 'rgba(255,255,255,0.2)' }}
                    >
                      {i < activeStep ? '✓' : s.step}
                    </span>
                    <div>
                      <p
                        className="text-sm font-semibold transition-colors"
                        style={{ color: i === activeStep ? 'white' : 'rgba(255,255,255,0.4)' }}
                      >
                        {s.title}
                      </p>
                      {i === activeStep && (
                        <p className="text-xs text-white/40 mt-0.5">{s.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="px-6 pb-6">
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${((activeStep + 1) / WORKFLOW_STEPS.length) * 100}%`,
                      background: 'linear-gradient(90deg, #dc2626, #f97316)',
                      boxShadow: '0 0 8px rgba(220,38,38,0.6)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/25">Processing</span>
                  <span className="text-xs font-mono" style={{ color: '#f97316' }}>
                    {Math.round(((activeStep + 1) / WORKFLOW_STEPS.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 pb-5">
                {WORKFLOW_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === activeStep ? 20 : 6,
                      height: 6,
                      background:
                        i === activeStep
                          ? 'linear-gradient(90deg, #dc2626, #f97316)'
                          : i < activeStep
                          ? 'rgba(220,38,38,0.4)'
                          : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ──────────────────────────────────────── */}
        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/8 pt-12"
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} animate={statsVisible} />
          ))}
        </div>
      </div>

      {/* ── Scroll cue ───────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-xs text-white uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </div>
  )
}
