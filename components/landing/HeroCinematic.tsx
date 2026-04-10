'use client'

import { useEffect, useState } from 'react'

// ─── Data ──────────────────────────────────────────────────────────────────────

const AGENCIES = [
  { initials: 'E&', name: 'Engel & Völkers',     city: 'Budva',            score: 97, status: 'replied',   statusColor: '#22C55E' },
  { initials: 'SR', name: "Sotheby's Realty",    city: 'Porto Montenegro', score: 94, status: 'opened',    statusColor: '#F5C200' },
  { initials: 'SI', name: 'Savills International',city: 'London',           score: 91, status: 'sent',      statusColor: '#3B5BDB' },
  { initials: 'KF', name: 'Knight Frank Serbia', city: 'Belgrade',         score: 88, status: 'sending…',  statusColor: '#6B7280' },
]

const STAGES = ['matching', 'offer', 'signing', 'sent'] as const
type Stage = (typeof STAGES)[number]
const DURATIONS: Record<Stage, number> = { matching: 3500, offer: 3500, signing: 3200, sent: 3000 }

// ─── Stage: Matching ───────────────────────────────────────────────────────────

function StageMatching() {
  const [revealed, setRevealed] = useState(0)
  useEffect(() => {
    setRevealed(0)
    const timers = AGENCIES.map((_, i) =>
      setTimeout(() => setRevealed(i + 1), 200 + i * 350)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ padding: '0 0 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#F5C200', opacity: 0.9 }}>
          AI MATCHING · WAVE 1
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>4 / 18 agencies</span>
      </div>

      {/* Agency rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {AGENCIES.map((ag, i) => (
          <div
            key={ag.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: i === 0 ? 'rgba(245,194,0,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'rgba(245,194,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
              opacity: revealed > i ? 1 : 0,
              transform: revealed > i ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0,
            }}>
              {ag.initials}
            </div>
            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ag.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{ag.city}</div>
            </div>
            {/* Score */}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F5C200', flexShrink: 0 }}>{ag.score}</span>
            {/* Status badge */}
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
              background: `${ag.statusColor}22`, color: ag.statusColor, flexShrink: 0, letterSpacing: '0.04em',
            }}>
              {ag.status}
            </span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Distribution progress</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Wave 1 of 3</span>
      </div>
      <div style={{ marginTop: 4, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
        <div style={{ height: '100%', width: '32%', background: '#F5C200', borderRadius: 1 }} />
      </div>
    </div>
  )
}

// ─── Stage: Offer ──────────────────────────────────────────────────────────────

function StageOffer() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px 8px', gap: 14,
      opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'rgba(245,194,0,0.12)', border: '1px solid rgba(245,194,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        📋
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>
          Exclusive Offer Ready
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          AI prepared a personalised offer for<br />
          <span style={{ color: '#F5C200' }}>18 top agencies</span> in 3 waves
        </div>
      </div>

      {/* Contract preview */}
      <div style={{
        width: '100%', padding: '10px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.06em' }}>OFFER PREVIEW</div>
        {['Villa Sveti Stefan, Budva', '€485,000 · 210 m²', 'Exclusive mandate · 90 days'].map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5C200', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{line}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        width: '100%', padding: '9px 0', borderRadius: 8, textAlign: 'center',
        background: 'linear-gradient(135deg, #F5C200, #F09000)',
        fontSize: 11, fontWeight: 700, color: '#0a0a0a',
      }}>
        Review &amp; Approve →
      </div>
    </div>
  )
}

// ─── Stage: Signing ─────────────────────────────────────────────────────────────

function StageSigning() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setProgress(p => Math.min(p + 4, 100)), 80)
    return () => clearInterval(t)
  }, [])

  const done = progress >= 100

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px 8px', gap: 14,
    }}>
      {/* Doc icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: done ? 'rgba(34,197,94,0.12)' : 'rgba(59,91,219,0.12)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(59,91,219,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        transition: 'all 0.4s ease',
      }}>
        {done ? '✅' : '✍️'}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>
          {done ? 'Contract Signed!' : 'Owner Signing…'}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
          {done ? 'Distribution starts in 3 sec' : 'Exclusive agency mandate'}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Signing progress</span>
          <span style={{ fontSize: 9, color: done ? '#22C55E' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${progress}%`,
            background: done ? '#22C55E' : 'linear-gradient(90deg, #3B5BDB, #7C3AED)',
            transition: 'width 0.08s linear, background 0.4s ease',
          }} />
        </div>
      </div>

      {/* Signature lines */}
      <div style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width="100%" height="36" viewBox="0 0 200 36">
          <path
            d={`M 10 28 C 30 10, 50 32, 70 18 C 90 4, 110 30, 130 16 C 150 2, 170 24, 190 20`}
            fill="none"
            stroke={done ? '#22C55E' : '#F5C200'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 0.08s linear, stroke 0.4s ease' }}
          />
        </svg>
      </div>
    </div>
  )
}

// ─── Stage: Sent ────────────────────────────────────────────────────────────────

function StageSent() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (count < 18) {
      const t = setTimeout(() => setCount(c => c + 1), 120)
      return () => clearTimeout(t)
    }
  }, [count])

  const waves = [
    { label: 'Wave 1', sent: Math.min(count, 10), total: 10, color: '#22C55E' },
    { label: 'Wave 2', sent: Math.max(0, Math.min(count - 10, 5)), total: 5, color: '#F5C200' },
    { label: 'Wave 3', sent: Math.max(0, Math.min(count - 15, 3)), total: 3, color: '#3B5BDB' },
  ]

  return (
    <div style={{ padding: '0 0 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#22C55E' }}>
          ✓ SENT · {count} AGENCIES
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>3 waves</span>
      </div>

      {/* Wave breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {waves.map(w => (
          <div key={w.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{w.label}</span>
              <span style={{ fontSize: 10, color: w.color, fontWeight: 600 }}>{w.sent}/{w.total} sent</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2, background: w.color,
                width: `${w.total > 0 ? (w.sent / w.total) * 100 : 0}%`,
                transition: 'width 0.12s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Inbox toast */}
      <div style={{
        marginTop: 14, padding: '8px 10px', borderRadius: 8,
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>New lead received!</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Engel &amp; Völkers · 2m ago</div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo Panel ────────────────────────────────────────────────────────────────

function DemoPanel() {
  const [stageIdx, setStageIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const stage = STAGES[stageIdx]

  useEffect(() => {
    const duration = DURATIONS[stage]
    const t = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setStageIdx(i => (i + 1) % STAGES.length)
        setFading(false)
      }, 250)
    }, duration)
    return () => clearTimeout(t)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  const stageLabel: Record<Stage, string> = {
    matching: 'AI Matching',
    offer: 'Offer Ready',
    signing: 'Signing',
    sent: 'Sent',
  }

  return (
    <div style={{
      width: 260,
      background: 'linear-gradient(145deg, #111118, #0d0d14)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {['#FF5F57','#FFBD2E','#28C840'].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          PropBlaze AI
        </span>
        {/* Stage tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {STAGES.map((s, i) => (
            <div key={s} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === stageIdx ? '#F5C200' : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Property header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #1a2a3a, #0d1a2a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🏠</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#F5C200', fontWeight: 700, letterSpacing: '0.08em' }}>VILLA · BUDVA</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Sveti Stefan</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>€485,000 · 210 m²</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>AI Score</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#F5C200', lineHeight: 1 }}>97</div>
        </div>
      </div>

      {/* Stage content */}
      <div style={{
        padding: '12px 14px',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(4px)' : 'translateY(0)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        minHeight: 200,
      }}>
        {stage === 'matching' && <StageMatching key={stageIdx} />}
        {stage === 'offer'    && <StageOffer    key={stageIdx} />}
        {stage === 'signing'  && <StageSigning  key={stageIdx} />}
        {stage === 'sent'     && <StageSent     key={stageIdx} />}
      </div>

      {/* Bottom stage indicator */}
      <div style={{
        padding: '6px 14px 10px',
        display: 'flex', justifyContent: 'center', gap: 4,
      }}>
        {STAGES.map((s, i) => (
          <div key={s} style={{
            height: 2, borderRadius: 1,
            flex: i === stageIdx ? 2 : 1,
            background: i === stageIdx ? '#F5C200' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

export default function HeroCinematic() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Ambient gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(245,194,0,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '80px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 48, width: '100%',
      }}>
        {/* Left: copy */}
        <div style={{ flex: 1, maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 20,
            background: 'rgba(245,194,0,0.1)', border: '1px solid rgba(245,194,0,0.2)',
            marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C200' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F5C200', letterSpacing: '0.04em' }}>
              AI-Powered Property Distribution
            </span>
          </div>

          <h1 style={{ margin: 0, lineHeight: 1.1, fontSize: 'clamp(36px, 5vw, 56px)' }}>
            <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, display: 'block' }}>Your property.</span>
            <span style={{ color: '#F5C200', fontWeight: 800, display: 'block' }}>Every agency.</span>
            <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, display: 'block' }}>Zero hassle.</span>
          </h1>

          <p style={{ marginTop: 24, fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 440 }}>
            Upload your property once. Our AI matches it with the top 10–30
            agencies across Europe, sends personalised offers, and forwards
            every reply directly to you.
          </p>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #F5C200, #F09000)',
              color: '#0a0a0a', fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
            }}>
              List your property →
            </a>
            <a href="#demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
            }}>
              View live demo
            </a>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 40, display: 'flex', gap: 32 }}>
            {[['500+','Agencies in DB'],['10 min','Time to publish'],['3 waves','Distribution strategy']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Demo panel */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {/* Match score badge */}
          <div style={{
            position: 'absolute', top: -18, left: -10, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 20,
            background: '#F5C200', boxShadow: '0 4px 16px rgba(245,194,0,0.35)',
          }}>
            <span style={{ fontSize: 10 }}>★</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>97% Match Score</span>
          </div>

          <DemoPanel />
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)',
      }}>
        SCROLL
      </div>
    </section>
  )
}
