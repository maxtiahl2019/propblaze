'use client'

import { useEffect, useRef, useState } from 'react'

const PROPERTY = {
  title: 'Villa · Budva, Montenegro',
  price: '€485,000',
  type: 'Residential',
  size: '240 m²',
  rooms: '4 bed / 3 bath',
  target: 'Cross-border investor',
}

const AGENCIES = [
  {
    name: 'Engel & Völkers Adriatic',
    country: '🇲🇪 Montenegro',
    markets: ['DE', 'AT', 'CH', 'RU'],
    score: 96,
    specialty: 'Luxury residential',
    crossBorder: true,
    responseRate: 94,
    wave: 1,
  },
  {
    name: 'Savills International',
    country: '🇬🇧 UK',
    markets: ['UK', 'AE', 'SG', 'HK'],
    score: 93,
    specialty: 'High-net-worth buyers',
    crossBorder: true,
    responseRate: 91,
    wave: 1,
  },
  {
    name: 'RE/MAX Adriatic Coast',
    country: '🇭🇷 Croatia',
    markets: ['DE', 'NL', 'BE', 'HR'],
    score: 89,
    specialty: 'EU residential',
    crossBorder: true,
    responseRate: 88,
    wave: 1,
  },
  {
    name: 'Knight Frank Serbia',
    country: '🇷🇸 Serbia',
    markets: ['RS', 'RU', 'UA', 'KZ'],
    score: 86,
    specialty: 'Investment properties',
    crossBorder: true,
    responseRate: 85,
    wave: 2,
  },
  {
    name: 'Tranio Partners Network',
    country: '🇩🇪 Germany',
    markets: ['DE', 'FR', 'IT', 'ES'],
    score: 84,
    specialty: 'EU investment',
    crossBorder: true,
    responseRate: 82,
    wave: 2,
  },
  {
    name: 'Remax Montenegro',
    country: '🇲🇪 Montenegro',
    markets: ['ME', 'RS', 'MK', 'BA'],
    score: 81,
    specialty: 'Local residential',
    crossBorder: false,
    responseRate: 79,
    wave: 2,
  },
]

const SCORE_DIMENSIONS = [
  { label: 'Geographic fit', value: 98 },
  { label: 'Buyer profile match', value: 95 },
  { label: 'Cross-border capability', value: 100 },
  { label: 'Response rate', value: 91 },
  { label: 'Conversion history', value: 88 },
  { label: 'Language coverage', value: 94 },
]

function ScoreBar({ label, value, animate }: { label: string; value: number; animate: boolean }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setWidth(value), 100)
    return () => clearTimeout(t)
  }, [animate, value])

  const color = value >= 95 ? '#22c55e' : value >= 85 ? '#f97316' : '#dc2626'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono font-bold w-8 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

function AgencyCard({
  agency,
  index,
  visible,
  selected,
  onSelect,
}: {
  agency: typeof AGENCIES[0]
  index: number
  visible: boolean
  selected: boolean
  onSelect: () => void
}) {
  const delay = index * 120

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 border transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
        background: selected
          ? 'linear-gradient(135deg, rgba(220,38,38,0.12), rgba(234,88,12,0.06))'
          : 'rgba(255,255,255,0.03)',
        borderColor: selected ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 24px rgba(220,38,38,0.1)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white truncate">{agency.name}</span>
            {agency.crossBorder && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20">
                Cross-border
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{agency.country}</span>
            <span>·</span>
            <span>{agency.specialty}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {agency.markets.map((m) => (
              <span
                key={m}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className="text-2xl font-black"
            style={{
              color: agency.score >= 90 ? '#22c55e' : '#f97316',
            }}
          >
            {agency.score}
          </div>
          <div className="text-[10px] text-white/30 font-medium">AI score</div>
          <div className="mt-1.5">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: agency.wave === 1 ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.06)',
                color: agency.wave === 1 ? '#f87171' : 'rgba(255,255,255,0.3)',
                border: agency.wave === 1 ? '1px solid rgba(220,38,38,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Wave {agency.wave}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function DemoMatchingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [phase, setPhase] = useState<'scanning' | 'matching' | 'done'>('scanning')
  const [scanPct, setScanPct] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    // Scanning phase
    const interval = setInterval(() => {
      setScanPct((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setPhase('matching')
          setTimeout(() => setPhase('done'), 1200)
          return 100
        }
        return p + 4
      })
    }, 60)
    return () => clearInterval(interval)
  }, [visible])

  const selected = AGENCIES[selectedIdx]

  return (
    <section ref={ref} id="how" className="bg-[#0a0a0a] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
            AI Matching Engine
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Your property. The right agencies.
          <br />
          <span className="text-white/30">No guesswork.</span>
        </h2>
        <p className="text-white/40 text-lg mb-12 max-w-xl">
          The algorithm analyses 8 dimensions — geography, buyer profiles, cross-border history,
          response rate — and returns a ranked list in seconds.
        </p>

        {/* Demo grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Property card */}
          <div
            className="rounded-3xl border border-white/8 p-6"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-4">
              Your property
            </div>
            <div
              className="w-full h-40 rounded-2xl mb-5 flex items-end p-4"
              style={{
                background:
                  'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
                boxShadow: 'inset 0 0 60px rgba(220,38,38,0.08)',
              }}
            >
              {/* Placeholder property visual */}
              <div className="w-full">
                <div className="text-xs text-white/20 mb-1">📍 Budva, Montenegro</div>
                <div className="text-white font-bold">{PROPERTY.title}</div>
                <div className="text-orange-500 font-black text-xl">{PROPERTY.price}</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Type', value: PROPERTY.type },
                { label: 'Size', value: PROPERTY.size },
                { label: 'Rooms', value: PROPERTY.rooms },
                { label: 'Target buyer', value: PROPERTY.target },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-white/30">{row.label}</span>
                  <span className="text-white/80 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Scan animation */}
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/30">
                  {phase === 'scanning' ? 'Scanning agency database…' : phase === 'matching' ? 'Ranking matches…' : 'Analysis complete'}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: phase === 'done' ? '#22c55e' : '#f97316' }}
                >
                  {phase === 'done' ? '✓ Done' : `${scanPct}%`}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${scanPct}%`,
                    background:
                      phase === 'done'
                        ? '#22c55e'
                        : 'linear-gradient(90deg, #dc2626, #f97316)',
                  }}
                />
              </div>
              <div className="text-xs text-white/20 mt-2">
                {phase === 'done'
                  ? `${AGENCIES.length} agencies matched · 2 waves ready`
                  : 'Analysing 847 agencies across 31 markets…'}
              </div>
            </div>
          </div>

          {/* Agency list */}
          <div className="space-y-3">
            <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-4">
              Matched agencies · {AGENCIES.length} selected
            </div>
            {AGENCIES.map((a, i) => (
              <AgencyCard
                key={a.name}
                agency={a}
                index={i}
                visible={phase === 'done'}
                selected={selectedIdx === i}
                onSelect={() => setSelectedIdx(i)}
              />
            ))}
          </div>

          {/* Score breakdown */}
          <div
            className="rounded-3xl border border-white/8 p-6 h-fit"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-5">
              Why this agency?
            </div>

            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22c55e',
                }}
              >
                {selected.score}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{selected.name}</div>
                <div className="text-white/40 text-xs mt-0.5">{selected.country}</div>
                <div className="text-xs text-white/30 mt-1">
                  Response rate: {selected.responseRate}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {SCORE_DIMENSIONS.map((d) => (
                <ScoreBar
                  key={d.label}
                  label={d.label}
                  value={d.value}
                  animate={phase === 'done'}
                />
              ))}
            </div>

            <div
              className="mt-6 p-4 rounded-2xl text-sm"
              style={{
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.15)',
              }}
            >
              <div className="text-orange-400 font-semibold text-xs mb-1">AI Explanation</div>
              <p className="text-white/50 text-xs leading-relaxed">
                {selected.name} has a strong track record with Montenegrin residential properties
                sold to {selected.markets.slice(0, 2).join(' and ')} buyers.
                Cross-border pipeline active. Responds within 6–12 hours on average.
              </p>
            </div>

            <button
              className="mt-4 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
              }}
            >
              Approve & send distribution →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
