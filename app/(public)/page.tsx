'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Animated counter ───────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = Math.ceil(to / 60)
        const t = setInterval(() => {
          start += step
          if (start >= to) { setVal(to); clearInterval(t) } else setVal(start)
        }, 16)
        obs.disconnect()
      }
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ─── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <defs>
                <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c0392b"/>
                  <stop offset="100%" stopColor="#e67e22"/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#ng)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">PropBlaze</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/listings" className="hover:text-white transition-colors">Listings</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors hidden md:block">Sign in</Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 0 20px rgba(192,57,43,0.3)' }}>
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Floating Particles ────────────────────────────────────────────────────────
function Particles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; dur: number; size: number }>>([])
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 8 + Math.random() * 8,
        size: 1 + Math.random() * 2,
      }))
    )
  }, [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.x % 3 === 0 ? '#e67e22' : 'rgba(255,255,255,0.4)',
            animation: `floatUp ${p.dur}s ease-in ${p.delay}s infinite`,
            opacity: 0,
          }} />
      ))}
    </div>
  )
}

// ─── Scan Line ─────────────────────────────────────────────────────────────────
function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute left-0 right-0 h-[1px] opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(230,126,34,0.6) 30%, rgba(192,57,43,0.8) 50%, rgba(230,126,34,0.6) 70%, transparent 100%)',
          animation: 'scanSweep 6s ease-in-out 1s infinite',
        }} />
    </div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const properties = [
    { type: 'Penthouse', city: 'Monaco', price: '€4.2M', status: 'Matching agencies...', match: 94 },
    { type: 'Villa', city: 'Budva, Montenegro', price: '€890K', status: '18 agencies matched', match: 87 },
    { type: 'Apartment', city: 'Belgrade', price: '€340K', status: 'Wave 1 sent', match: 91 },
  ]
  useEffect(() => {
    setVisible(true)
    const t = setInterval(() => setActive(a => (a + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#070708' }}>
      {/* ── Cinematic background layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base dark gradient */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 80% at 60% 40%, #0d0808 0%, #070708 60%, #050505 100%)' }} />

        {/* Ambient glow 1 — red, breathing, drifting */}
        <div className="absolute animate-breathe"
          style={{ top: '-10%', left: '20%', width: 900, height: 900, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,57,43,1) 0%, transparent 65%)',
            filter: 'blur(100px)', animation: 'ambientDrift 14s ease-in-out infinite, breathe 8s ease-in-out infinite',
          }} />

        {/* Ambient glow 2 — orange, opposite corner */}
        <div className="absolute"
          style={{ bottom: '-10%', right: '15%', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(230,126,34,0.8) 0%, transparent 65%)',
            filter: 'blur(120px)',
            animation: 'ambientDrift 18s ease-in-out 3s infinite reverse, breathe 10s ease-in-out 4s infinite',
          }} />

        {/* Ambient glow 3 — subtle center warm */}
        <div className="absolute"
          style={{ top: '30%', left: '45%', width: 600, height: 400, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(180,50,20,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'breathe 12s ease-in-out 2s infinite',
          }} />

        {/* Film grain */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '200px' }} />
      </div>

      {/* ── Moving grid ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          animation: 'slowPanRight 20s ease-in-out infinite alternate',
        }} />

      {/* ── Floating particles ── */}
      <Particles />

      {/* ── Scan line ── */}
      <ScanLine />

      {/* ── Horizontal drifting lines ── */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute pointer-events-none h-[1px]"
          style={{
            top: `${25 + i * 20}%`,
            left: 0,
            right: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(192,57,43,0.12) 50%, transparent 100%)',
            animation: `lineDrift ${12 + i * 4}s ease-in-out ${i * 3}s infinite`,
          }} />
      ))}

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.9s ease' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs text-white/50 mb-10"
              style={{ background: 'rgba(255,255,255,0.03)', animationDelay: '0.1s' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              847 verified agencies · 31 markets
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-[1.02] tracking-tight mb-8"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 1s ease 0.2s' }}>
              Your property.<br />
              <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                background: 'linear-gradient(135deg, #f0f0f0 0%, #c0392b 40%, #e67e22 100%)',
                display: 'inline-block' }}>
                Right agencies.
              </span><br />
              Sold.
            </h1>

            <p className="text-white/50 text-xl leading-relaxed mb-12 max-w-md">
              AI identifies the agencies most likely to sell your property.
              You approve. We distribute. Leads come to you.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/register?role=owner"
                className="group flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">I own a property</div>
                  <div className="text-white/40 text-xs mt-0.5">List & distribute to agencies →</div>
                </div>
              </Link>

              <Link href="/agencies"
                className="group flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">I'm an agency</div>
                  <div className="text-white/40 text-xs mt-0.5">Receive matched listings →</div>
                </div>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8">
              {[
                { n: 847, suf: '+', label: 'Verified agencies' },
                { n: 31, suf: '', label: 'EU markets' },
                { n: 24, suf: 'h', label: 'To first lead' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-white">
                    <Counter to={s.n} suffix={s.suf} />
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Property Card Stack */}
          <div className="relative h-[520px] hidden lg:block">
            {properties.map((p, i) => (
              <div key={i}
                className="absolute inset-0 rounded-3xl overflow-hidden transition-all duration-700"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: active === i ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(20px)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}>
                {/* Property visualization */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.img} opacity-60`} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)' }} />

                {/* Architectural lines */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 480 520" fill="none">
                    <rect x="80" y="120" width="320" height="240" rx="4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
                    <rect x="110" y="150" width="80" height="120" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    <rect x="210" y="150" width="80" height="120" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    <rect x="310" y="150" width="60" height="120" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    <rect x="180" y="270" width="60" height="90" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    <line x1="80" y1="360" x2="400" y2="360" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                    <rect x="120" y="170" width="30" height="30" fill="rgba(255,255,255,0.05)"/>
                    <rect x="220" y="170" width="30" height="30" fill="rgba(255,255,255,0.05)"/>
                    <rect x="320" y="170" width="20" height="20" fill="rgba(255,255,255,0.05)"/>
                  </svg>
                </div>

                {/* Data overlays */}
                <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">{p.type}</div>
                    <div className="text-white text-2xl font-bold">{p.price}</div>
                    <div className="text-white/60 text-sm mt-0.5">{p.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/40 text-xs mb-1">AI Match Score</div>
                    <div className="text-4xl font-bold" style={{
                      background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{p.match}%</div>
                  </div>
                </div>

                {/* Animated scan line */}
                <div className="absolute left-0 right-0 h-px opacity-30 animate-pulse"
                  style={{ top: '40%', background: 'linear-gradient(90deg, transparent, #e67e22, transparent)' }} />

                {/* Bottom info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">{p.status}</span>
                  </div>
                  {/* Agency bubbles */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/60"
                        style={{ background: `hsl(${j * 40 + 200},30%,15%)` }}>
                        {String.fromCharCode(65 + j)}
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs text-white/30"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      +12
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Card indicators */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {properties.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{ width: active === i ? 24 : 6, height: 6, background: active === i ? '#e67e22' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="text-white/20 text-xs tracking-widest uppercase">Scroll</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'List your property', desc: 'Upload photos, documents, and key details in under 10 minutes. Our wizard adapts to your property type.', icon: '🏠' },
    { n: '02', title: 'AI builds your package', desc: 'Cover letter, property description, and pitch deck — generated in 3 languages, tailored for agency audiences.', icon: '✦' },
    { n: '03', title: 'Match & approve', desc: 'Review your matched agencies with AI reasoning. You see every agency, their score, and why they were chosen.', icon: '◎' },
    { n: '04', title: 'Distribution fires', desc: 'Wave 1 reaches top 10 agencies. Wave 2 fires automatically after 48h. Every reply is forwarded to you instantly.', icon: '⟶' },
  ]

  return (
    <section id="how" className="py-32 relative" style={{ background: '#070708' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-4">How it works</div>
          <h2 className="text-5xl font-bold text-white max-w-xl leading-tight">
            From listing<br />to leads in <span style={{ color: '#e67e22' }}>24 hours</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {steps.map((s, i) => (
            <div key={i} className="p-8" style={{ background: '#070708' }}>
              <div className="text-white/15 text-xs font-mono mb-8">{s.n}</div>
              <div className="text-3xl mb-6 opacity-70">{s.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-3">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AI Matching Demo ─────────────────────────────────────────────────────────
function AIMatchingDemo() {
  const agencies = [
    { name: 'Engel & Völkers', city: 'Adriatic', score: 97, tags: ['Cross-border', 'Luxury', 'Russian buyers'], response: '87% response rate', wave: 1 },
    { name: "Sotheby's Realty", city: 'Montenegro', score: 94, tags: ['HNWI', 'Luxury', 'International'], response: '94% response rate', wave: 1 },
    { name: 'Savills International', city: 'London', score: 91, tags: ['UK investors', 'Cross-border'], response: '91% response rate', wave: 1 },
    { name: 'Knight Frank Serbia', city: 'Belgrade', score: 88, tags: ['Balkans', 'Premium'], response: '79% response rate', wave: 1 },
    { name: 'Tranio Partners', city: 'Berlin', score: 85, tags: ['German buyers', 'Expats'], response: '82% response rate', wave: 1 },
    { name: 'RE/MAX Adriatic', city: 'Croatia', score: 82, tags: ['Adriatic', 'Mid-market'], response: '76% response rate', wave: 2 },
  ]
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="py-32" style={{ background: '#070708' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-white/30 text-xs uppercase tracking-widest mb-4">AI Matching Engine</div>
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Why each agency.<br /><span style={{ color: '#e67e22' }}>Not just which.</span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed mb-10">
              Our engine scores agencies across 8 dimensions. Every match comes with a transparent explanation. You see the reasoning — not just the result.
            </p>

            {/* Scoring dimensions */}
            {[
              { label: 'Geographic fit', val: 97 },
              { label: 'Property type match', val: 92 },
              { label: 'Buyer profile overlap', val: 89 },
              { label: 'Historical response rate', val: 87 },
            ].map((d, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">{d.label}</span>
                  <span className="text-white/70 font-mono">{d.val}%</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-px transition-all duration-1000"
                    style={{ width: `${d.val}%`, background: 'linear-gradient(90deg,#c0392b,#e67e22)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Agency list */}
          <div className="space-y-2">
            {agencies.map((a, i) => (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-default"
                style={{
                  background: hovered === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hovered === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                {/* Rank */}
                <div className="w-8 text-center text-white/20 text-xs font-mono flex-shrink-0">{String(i + 1).padStart(2, '0')}</div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {a.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{a.name}</div>
                  <div className="text-white/30 text-xs mt-0.5">{a.city} · {a.response}</div>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                  {a.tags.slice(0, 2).map((t, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full text-white/40"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>{t}</span>
                  ))}
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold" style={{
                    background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>{a.score}</div>
                  <div className={`text-xs ${a.wave === 1 ? 'text-emerald-400' : 'text-white/30'}`}>Wave {a.wave}</div>
                </div>
              </div>
            ))}

            {/* More agencies indicator */}
            <div className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div className="text-white/20 text-xs font-mono w-8 text-center">—</div>
              <div className="text-white/20 text-sm">+{25} more agencies in pool</div>
              <div className="ml-auto text-white/20 text-xs">Waves 2–3</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features Grid ────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
      title: 'AI Sales Package',
      desc: 'Professional cover letter, property brief, and pitch deck — generated in 3 languages, formatted for agency audiences.',
      tag: 'Automated',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
      title: 'Wave Distribution',
      desc: 'Wave 1 fires to top-scored agencies. Wave 2 follows automatically at 48h if no reply. Fully autonomous.',
      tag: 'Smart timing',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      title: 'Owner Approval',
      desc: 'Nothing goes out without your explicit sign-off. Review every agency, the full pitch, and the send list — always.',
      tag: 'Your control',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      title: 'Multi-channel Replies',
      desc: 'Agency responses forwarded to your Email, Telegram, and WhatsApp in real time. No platform lock-in.',
      tag: 'Live forwarding',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
      title: 'Distribution Reports',
      desc: 'Real-time reports showing which agencies were contacted, response status, and campaign performance.',
      tag: 'Full visibility',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      title: 'GDPR by design',
      desc: 'Owner contacts are never shared. Documents encrypted. Consent tracked. EU-hosted. Agency ID system protects you.',
      tag: 'EU compliant',
    },
  ]

  return (
    <section id="features" className="py-32" style={{ background: '#070708' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-4">Platform Features</div>
          <h2 className="text-5xl font-bold text-white">Everything you need.<br /><span className="text-white/40">Nothing you don't.</span></h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {features.map((f, i) => (
            <div key={i} className="p-8 group hover:bg-white/[0.02] transition-colors" style={{ background: '#070708' }}>
              <div className="text-white/40 group-hover:text-white/70 mb-6 transition-colors">{f.icon}</div>
              <div className="inline-block text-xs px-2.5 py-1 rounded-full mb-4 text-white/30"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {f.tag}
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '€49',
      period: '/month',
      desc: 'Individual sellers',
      features: ['1 active property', '20 agencies per wave', 'Email + Telegram', '3-language AI package', 'Distribution reports'],
      cta: 'Start free trial',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '€149',
      period: '/month',
      desc: 'Serious sellers',
      features: ['5 active properties', '50 agencies per wave', 'Email + WhatsApp + Telegram', 'Priority AI matching', 'Full analytics', 'Dedicated support'],
      cta: 'Start Pro trial',
      highlighted: true,
    },
    {
      name: 'Agency',
      price: '€499',
      period: '/month',
      desc: 'Real estate professionals',
      features: ['Unlimited properties', 'Full agency database', 'API access', 'White-label options', 'Custom matching rules', 'SLA guarantee'],
      cta: 'Contact sales',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-32" style={{ background: '#070708' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-4">Pricing</div>
          <h2 className="text-5xl font-bold text-white">Simple, transparent.<br /><span className="text-white/40">Billing stops when you sell.</span></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <div key={i} className="rounded-3xl p-8 relative"
              style={{
                background: p.highlighted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: p.highlighted ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}>
                  Most popular
                </div>
              )}
              <div className="text-white/40 text-sm mb-2">{p.name}</div>
              <div className="flex items-end gap-1 mb-1">
                <div className="text-4xl font-bold text-white">{p.price}</div>
                <div className="text-white/30 text-sm mb-1">{p.period}</div>
              </div>
              <div className="text-white/30 text-xs mb-8">{p.desc}</div>
              <div className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-white/60 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#e67e22' }} />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="block text-center py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
                style={p.highlighted
                  ? { background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }
                }>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          14-day free trial · No credit card required · Billing pauses automatically when property is marked as Sold
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#070708', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
                <defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c0392b"/><stop offset="100%" stopColor="#e67e22"/></linearGradient></defs>
                <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#fg)"/>
              </svg>
              <span className="text-white font-semibold">PropBlaze</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">AI-powered property distribution to real estate agencies across 31 EU markets.</p>
          </div>
          {[
            { title: 'Platform', links: ['How it works', 'Features', 'Pricing', 'For agencies'] },
            { title: 'Markets', links: ['Montenegro', 'Serbia', 'Croatia', 'Germany', 'All markets'] },
            { title: 'Company', links: ['About', 'Privacy', 'Terms', 'Contact'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="text-white/30 text-xs uppercase tracking-widest mb-4">{col.title}</div>
              <div className="space-y-2">
                {col.links.map((l, j) => (
                  <div key={j}><a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{l}</a></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-white/20 text-xs">© 2026 PropBlaze. All rights reserved.</div>
          <div className="text-white/20 text-xs">GDPR Compliant · EU Hosted</div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: '#070708', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <AIMatchingDemo />
      <Features />
      <Pricing />
      <Footer />
    </div>
  )
}
