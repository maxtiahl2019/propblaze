'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = 'matching' | 'offer' | 'signing' | 'sent'

// ─── Constants ────────────────────────────────────────────────────────────────
const STATS = [
  { value: 847, suffix: '+', label: 'Verified agencies' },
  { value: 24, suffix: 'h', label: 'Average first response' },
  { value: 94, suffix: '%', label: 'Match accuracy' },
  { value: 31, suffix: '', label: 'EU markets covered' },
]

const DEMO_AGENCIES = [
  { name: 'DiasporaHome Serbia', flag: '🇷🇸', score: 94, wave: 1 },
  { name: 'BelgradeProperties Pro', flag: '🇷🇸', score: 88, wave: 1 },
  { name: 'EastEurope Invest', flag: '🇦🇹', score: 81, wave: 1 },
  { name: 'Moskovskaya Realty', flag: '🇷🇺', score: 78, wave: 2 },
  { name: 'Balkans Realty Group', flag: '🇷🇸', score: 74, wave: 2 },
]

const STAGE_DURATIONS: Record<Stage, number> = {
  matching: 3200,
  offer: 3600,
  signing: 3200,
  sent: 3000,
}

const STAGE_ORDER: Stage[] = ['matching', 'offer', 'signing', 'sent']

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function StatCard({ value, suffix, label, animate }: { value: number; suffix: string; label: string; animate: boolean }) {
  const count = useCountUp(value, 1800, animate)
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
        {count}<span className="text-orange-400">{suffix}</span>
      </span>
      <span className="text-sm text-white/50 mt-1 font-medium uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ─── Stage: AI Matching ───────────────────────────────────────────────────────
function StageMatching({ visible }: { visible: boolean }) {
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    if (!visible) { setRevealedCount(0); return }
    const timers: ReturnType<typeof setTimeout>[] = []
    DEMO_AGENCIES.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedCount(i + 1), 300 + i * 420))
    })
    return () => timers.forEach(clearTimeout)
  }, [visible])

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }}
        />
        <span className="text-xs font-semibold text-white/60 tracking-wide uppercase">
          AI scanning 847 agencies…
        </span>
      </div>

      {DEMO_AGENCIES.map((a, i) => (
        <div
          key={a.name}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500"
          style={{
            opacity: revealedCount > i ? 1 : 0,
            transform: revealedCount > i ? 'translateX(0)' : 'translateX(-12px)',
            background: revealedCount > i
              ? 'rgba(255,255,255,0.04)'
              : 'transparent',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span className="text-base">{a.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{a.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: revealedCount > i ? `${a.score}%` : '0%',
                    background: a.score >= 88
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : a.score >= 78
                        ? 'linear-gradient(90deg, #f97316, #ea580c)'
                        : 'linear-gradient(90deg, #a78bfa, #7c3aed)',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums" style={{
                color: a.score >= 88 ? '#22c55e' : a.score >= 78 ? '#f97316' : '#a78bfa'
              }}>
                {a.score}%
              </span>
            </div>
          </div>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
            style={{
              background: a.wave === 1 ? 'rgba(249,115,22,0.15)' : 'rgba(167,139,250,0.12)',
              color: a.wave === 1 ? '#fb923c' : '#a78bfa',
              border: `1px solid ${a.wave === 1 ? 'rgba(249,115,22,0.25)' : 'rgba(167,139,250,0.2)'}`,
            }}
          >
            W{a.wave}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Stage: Exclusive Offer Arrives ──────────────────────────────────────────
function StageOffer({ visible }: { visible: boolean }) {
  const [slide, setSlide] = useState(false)
  const [ping, setPing] = useState(false)

  useEffect(() => {
    if (!visible) { setSlide(false); setPing(false); return }
    const t1 = setTimeout(() => setSlide(true), 100)
    const t2 = setTimeout(() => setPing(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible])

  return (
    <div className="space-y-3">
      {/* Notification pill */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500"
        style={{
          background: 'rgba(249,115,22,0.10)',
          border: '1px solid rgba(249,115,22,0.25)',
          opacity: slide ? 1 : 0,
          transform: slide ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        <span className="relative flex h-2 w-2">
          {ping && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
        </span>
        <span className="text-xs font-semibold text-orange-300">Exclusive offer received</span>
        <span className="ml-auto text-[10px] text-white/30">just now</span>
      </div>

      {/* Offer document card */}
      <div
        className="rounded-2xl p-5 transition-all duration-700"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(220,38,38,0.08))',
          border: '1px solid rgba(249,115,22,0.25)',
          boxShadow: slide ? '0 0 40px rgba(249,115,22,0.12)' : 'none',
          opacity: slide ? 1 : 0,
          transform: slide ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
          transitionDelay: '150ms',
        }}
      >
        {/* Document top bar */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📄</span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Exclusive Agency Agreement</span>
            </div>
            <p className="text-sm font-bold text-white">DiasporaHome Serbia</p>
            <p className="text-xs text-white/40 mt-0.5">Belgrade · 🇷🇸 · Diaspora specialist</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">94<span className="text-orange-400 text-sm">%</span></div>
            <div className="text-[10px] text-white/30 uppercase tracking-wide">AI Score</div>
          </div>
        </div>

        {/* Terms preview */}
        <div className="space-y-2 mb-4">
          {[
            ['Commission', '3%'],
            ['Duration', '90 days exclusive'],
            ['Buyer segment', 'CIS diaspora + EU investors'],
            ['Languages', 'RU · SR · EN'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-xs">
              <span className="text-white/35">{k}</span>
              <span className="font-medium text-white/70">{v}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #ea580c)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.30)',
          }}
        >
          Review &amp; Sign →
        </div>
      </div>
    </div>
  )
}

// ─── Stage: Owner Signing ─────────────────────────────────────────────────────
function StageSigning({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)

  useEffect(() => {
    if (!visible) { setPhase(0); return }
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 1100)
    const t3 = setTimeout(() => setPhase(3), 2100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [visible])

  return (
    <div className="space-y-3">
      {/* Status label */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: phase >= 3 ? '#22c55e' : '#f97316',
            boxShadow: `0 0 8px ${phase >= 3 ? '#22c55e' : '#f97316'}`,
            transition: 'all 0.4s',
          }}
        />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {phase === 0 ? 'Loading agreement…' : phase < 3 ? 'Reviewing terms…' : 'Document signed ✓'}
        </span>
      </div>

      {/* Contract mockup */}
      <div
        className="rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          border: `1px solid ${phase >= 3 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        {/* Doc header */}
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📄</span>
            <span className="text-xs font-semibold text-white/60">Exclusive_Agency_Agreement_DiasporaHome.pdf</span>
          </div>
        </div>

        {/* Simulated text lines */}
        <div className="px-5 py-4 space-y-2">
          {[100, 90, 75, 90, 60].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${w}%`,
                background: 'rgba(255,255,255,0.08)',
                opacity: phase >= 2 ? 1 : 0,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}

          {/* Highlight clause */}
          <div
            className="mt-3 px-3 py-2 rounded-lg transition-all duration-500"
            style={{
              background: phase >= 2 ? 'rgba(249,115,22,0.10)' : 'transparent',
              border: `1px solid ${phase >= 2 ? 'rgba(249,115,22,0.20)' : 'transparent'}`,
            }}
          >
            <p className="text-[10px] text-orange-300/80 font-medium">§3 · Commission: 3% upon successful transaction</p>
          </div>

          {/* Signature line */}
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="h-px w-full mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <p className="text-[10px] text-white/30">Owner signature</p>
              </div>
              <div className="flex-1">
                <div
                  className="h-px w-full mb-1 transition-all duration-600"
                  style={{
                    background: phase >= 3
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: phase >= 3 ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
                  }}
                />
                <p className="text-[10px] text-white/30">Date</p>
              </div>
            </div>

            {/* Animated signature */}
            {phase >= 2 && (
              <div className="mt-2 flex items-center gap-2">
                <svg
                  viewBox="0 0 120 36"
                  className="h-9 transition-all duration-700"
                  style={{
                    width: phase >= 3 ? 120 : 0,
                    overflow: 'hidden',
                  }}
                >
                  <path
                    d="M8 24 C18 10, 28 8, 38 18 C46 26, 52 8, 62 14 C72 20, 76 10, 86 16 C96 22, 104 14, 112 18"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 200,
                      strokeDashoffset: phase >= 3 ? 0 : 200,
                      transition: 'stroke-dashoffset 0.8s ease-in-out',
                    }}
                  />
                </svg>
                {phase >= 3 && (
                  <span className="text-[10px] font-bold text-green-400">✓ Signed</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stage: Sent / Distribution Live ─────────────────────────────────────────
function StageSent({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false)
  const [wavesDone, setWavesDone] = useState(0)

  useEffect(() => {
    if (!visible) { setShow(false); setWavesDone(0); return }
    const t1 = setTimeout(() => setShow(true), 150)
    const t2 = setTimeout(() => setWavesDone(1), 900)
    const t3 = setTimeout(() => setWavesDone(2), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [visible])

  const waves = [
    { label: 'Wave 1', count: 3, status: wavesDone >= 1 ? 'sent' : 'queued' },
    { label: 'Wave 2', count: 4, status: wavesDone >= 2 ? 'sending' : 'scheduled' },
    { label: 'Wave 3', count: 3, status: wavesDone >= 2 ? 'scheduled' : 'pending' },
  ]

  return (
    <div className="space-y-3">
      {/* Success banner */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-600"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(22,163,74,0.08))',
          border: '1px solid rgba(34,197,94,0.28)',
          boxShadow: show ? '0 0 40px rgba(34,197,94,0.10)' : 'none',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <span className="text-xl">🚀</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Distribution live!</p>
          <p className="text-xs text-white/40 mt-0.5">
            Agreement signed · 10 agencies notified
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-black text-green-400">10</div>
          <div className="text-[10px] text-white/30 uppercase">agencies</div>
        </div>
      </div>

      {/* Wave breakdown */}
      <div
        className="space-y-2 transition-all duration-500"
        style={{ opacity: show ? 1 : 0, transitionDelay: '200ms' }}
      >
        {waves.map((w, i) => (
          <div
            key={w.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500"
            style={{
              background: w.status === 'sent'
                ? 'rgba(34,197,94,0.06)'
                : w.status === 'sending'
                  ? 'rgba(249,115,22,0.06)'
                  : 'rgba(255,255,255,0.02)',
              border: `1px solid ${
                w.status === 'sent'
                  ? 'rgba(34,197,94,0.15)'
                  : w.status === 'sending'
                    ? 'rgba(249,115,22,0.15)'
                    : 'rgba(255,255,255,0.05)'
              }`,
              opacity: show ? 1 : 0,
              transitionDelay: `${200 + i * 150}ms`,
            }}
          >
            <span
              className="text-xs font-bold w-14"
              style={{
                color: w.status === 'sent' ? '#22c55e' : w.status === 'sending' ? '#f97316' : '#ffffff40',
              }}
            >
              {w.label}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: w.count }).map((_, j) => (
                <div
                  key={j}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-all duration-300"
                  style={{
                    background: w.status === 'sent'
                      ? 'rgba(34,197,94,0.20)'
                      : w.status === 'sending'
                        ? 'rgba(249,115,22,0.15)'
                        : 'rgba(255,255,255,0.06)',
                    transitionDelay: `${j * 80}ms`,
                  }}
                >
                  {w.status === 'sent' ? '✓' : w.status === 'sending' ? '↗' : '·'}
                </div>
              ))}
            </div>
            <span
              className="ml-auto text-[10px] font-semibold uppercase tracking-wide"
              style={{
                color: w.status === 'sent' ? '#22c55e' : w.status === 'sending' ? '#fb923c' : '#ffffff25',
              }}
            >
              {w.status}
            </span>
          </div>
        ))}
      </div>

      {/* Channel icons */}
      <div
        className="flex items-center justify-center gap-3 pt-1 transition-all duration-500"
        style={{ opacity: show ? 1 : 0, transitionDelay: '600ms' }}
      >
        {[
          { icon: '✉️', label: 'Email' },
          { icon: '💬', label: 'WhatsApp' },
          { icon: '📱', label: 'Telegram' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span className="text-sm">{c.icon}</span>
            <span className="text-[10px] text-white/30">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Demo Panel (cycles through all stages) ───────────────────────────────────
function DemoPanel() {
  const [stage, setStage] = useState<Stage>('matching')
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const advance = () => {
      setTransitioning(true)
      setTimeout(() => {
        setStage((s) => {
          const idx = STAGE_ORDER.indexOf(s)
          return STAGE_ORDER[(idx + 1) % STAGE_ORDER.length]
        })
        setTransitioning(false)
      }, 300)
    }

    const duration = STAGE_DURATIONS[stage]
    const t = setTimeout(advance, duration)
    return () => clearTimeout(t)
  }, [stage])

  const stageLabels: Record<Stage, string> = {
    matching: '🔍 Matching agencies',
    offer: '📄 Offer received',
    signing: '✍️ Signing',
    sent: '🚀 Distributed',
  }

  const stageColors: Record<Stage, string> = {
    matching: '#f97316',
    offer: '#dc2626',
    signing: '#a855f7',
    sent: '#22c55e',
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* macOS-style title bar */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#eab308', opacity: 0.7 }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e', opacity: 0.7 }} />
        <span className="ml-3 text-xs text-white/25 font-mono">PropBlaze · Owner Dashboard</span>
      </div>

      {/* Stage indicator tabs */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {STAGE_ORDER.map((s) => (
          <div
            key={s}
            className="flex-1 py-1 px-1.5 rounded-md text-center transition-all duration-400"
            style={{
              background: s === stage ? `${stageColors[s]}18` : 'transparent',
              border: `1px solid ${s === stage ? `${stageColors[s]}30` : 'transparent'}`,
            }}
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-wide transition-colors duration-300 whitespace-nowrap"
              style={{ color: s === stage ? stageColors[s] : 'rgba(255,255,255,0.2)' }}
            >
              {s === stage ? stageLabels[s] : s}
            </span>
          </div>
        ))}
      </div>

      {/* Stage content */}
      <div
        className="p-5 min-h-[280px] transition-all duration-300"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
        }}
      >
        {stage === 'matching' && <StageMatching visible={!transitioning && stage === 'matching'} />}
        {stage === 'offer' && <StageOffer visible={!transitioning && stage === 'offer'} />}
        {stage === 'signing' && <StageSigning visible={!transitioning && stage === 'signing'} />}
        {stage === 'sent' && <StageSent visible={!transitioning && stage === 'sent'} />}
      </div>

      {/* Bottom progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 flex-1">
            {STAGE_ORDER.map((s) => (
              <div
                key={s}
                className="flex-1 h-0.5 rounded-full transition-all duration-500"
                style={{
                  background: s === stage
                    ? stageColors[stage]
                    : STAGE_ORDER.indexOf(s) < STAGE_ORDER.indexOf(stage)
                      ? 'rgba(255,255,255,0.20)'
                      : 'rgba(255,255,255,0.06)',
                  boxShadow: s === stage ? `0 0 6px ${stageColors[stage]}` : 'none',
                }}
              />
            ))}
          </div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300"
            style={{ color: stageColors[stage] }}
          >
            {stageLabels[stage].split(' ').slice(1).join(' ')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HeroCinematic() {
  const [statsVisible, setStatsVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setTextVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

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
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #dc2626 0%, #ea580c 40%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />
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

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
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
          <a href="/auth/login" className="hidden md:inline text-sm text-white/60 hover:text-white transition-colors">
            Sign in
          </a>
          <a
            href="/auth/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: '0 0 20px rgba(220,38,38,0.4)' }}
          >
            Start free →
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
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

          {/* Right: Live demo panel */}
          <div
            className="transition-all duration-1000 delay-300"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(40px)',
            }}
          >
            <DemoPanel />
          </div>
        </div>

        {/* ── Stats bar ───────────────────────────────────── */}
        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/8 pt-12"
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} animate={statsVisible} />
          ))}
        </div>
      </div>

      {/* ── Scroll cue ──────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-xs text-white uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </div>
  )
}
