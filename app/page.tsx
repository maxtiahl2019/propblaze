'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const HeroCinematic = dynamic(() => import('@/components/landing/HeroCinematic'), { ssr: false })
const DemoMatchingSection = dynamic(() => import('@/components/landing/DemoMatchingSection'), { ssr: false })

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Sales Package',
    desc: 'Cover letter, property description, and pitch deck generated in 3 languages — instantly.',
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    desc: 'Agencies scored across 8 dimensions: location, specialisation, cross-border history, buyer profiles.',
  },
  {
    icon: '📡',
    title: 'Wave Distribution',
    desc: 'Send Wave 1 (10 agencies). If no reply in 48h, Wave 2 fires automatically.',
  },
  {
    icon: '📱',
    title: 'Multi-channel',
    desc: 'Email + WhatsApp Business + Telegram. Every reply forwarded to you in real time.',
  },
  {
    icon: '✅',
    title: 'Owner Approval',
    desc: "You see every agency and the full pitch before anything goes out. Nothing without your OK.",
  },
  {
    icon: '🔒',
    title: 'GDPR Ready',
    desc: 'EU-hosted, encrypted documents, consent management. Built for the European market.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: '€49',
    period: '/month',
    desc: 'Perfect for individual sellers',
    features: [
      '1 active property',
      'Up to 20 agencies per wave',
      'Email + Telegram notifications',
      'AI sales package (3 languages)',
      'Basic analytics',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€149',
    period: '/month',
    desc: 'For serious sellers & brokers',
    features: [
      '5 active properties',
      'Up to 50 agencies per wave',
      'Email + WhatsApp + Telegram',
      'AI sales package (6 languages)',
      'Full analytics + lead tracking',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '€499',
    period: '/month',
    desc: 'Agencies & developers',
    features: [
      'Unlimited properties',
      'Full agency database access',
      'White-label option',
      'Custom AI matching rules',
      'Dedicated account manager',
      'API access',
    ],
    cta: 'Contact sales',
    highlight: false,
  },
]

const LOGOS = [
  'Tranio', 'Realting', 'Properstar', 'Nestoria', 'Homegate', 'ImmoScout',
]

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0a]">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <HeroCinematic />

      {/* ── Trust bar ──────────────────────────────────────── */}
      <section className="border-y border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs text-white/25 uppercase tracking-widest mb-6 font-medium">
            Trusted by sellers across Europe
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {['🇩🇪 Germany', '🇷🇸 Serbia', '🇲🇪 Montenegro', '🇭🇷 Croatia', '🇦🇹 Austria', '🇨🇭 Switzerland', '🇳🇱 Netherlands', '🇬🇧 UK'].map((m) => (
              <span key={m} className="text-sm text-white/30 font-medium whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Matching Demo ────────────────────────────────── */}
      <DemoMatchingSection />

      {/* ── Features grid ──────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-orange-500" />
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
              Platform
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Everything you need.
            <br />
            <span className="text-white/30">Nothing you don't.</span>
          </h2>
          <p className="text-white/40 text-lg mb-14 max-w-xl">
            Built for EU property owners who want serious buyers — not another listing portal.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-3xl border border-white/8 hover:border-white/15 transition-all group"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.15)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-orange-500" />
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
              Pricing
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Simple pricing.
            <br />
            <span className="text-white/30">Stops when you sell.</span>
          </h2>
          <p className="text-white/40 text-lg mb-14 max-w-xl">
            Mark your property as sold and billing stops automatically. No hidden fees.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className="relative rounded-3xl p-8 border flex flex-col transition-all"
                style={{
                  background: p.highlight
                    ? 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(234,88,12,0.05))'
                    : 'rgba(255,255,255,0.02)',
                  borderColor: p.highlight ? 'rgba(220,38,38,0.35)' : 'rgba(255,255,255,0.08)',
                  boxShadow: p.highlight ? '0 0 60px rgba(220,38,38,0.1)' : 'none',
                }}
              >
                {p.highlight && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}
                  >
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-white/50 text-sm font-semibold mb-1">{p.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{p.price}</span>
                    <span className="text-white/30 text-sm">{p.period}</span>
                  </div>
                  <p className="text-white/30 text-sm mt-1">{p.desc}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7.5" stroke="rgba(220,38,38,0.4)"/>
                        <path d="M5 8l2 2 4-4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className="block text-center py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={
                    p.highlight
                      ? {
                          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }
                  }
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/25 mt-8">
            All plans include 14-day free trial · Billing auto-stops on "Mark as Sold" · No long-term contracts
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: '0 0 60px rgba(220,38,38,0.3)' }}
          >
            {/* Inline SVG logo mark */}
            <svg width="44" height="44" viewBox="0 0 200 200" fill="none">
              <path d="M100 22 L62 108 L76 104 L64 148 L100 132 L136 148 L124 104 L138 108 Z" fill="white"/>
              <path d="M100 44 L84 102 L100 96 L116 102 Z" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Your property deserves
            <br />
            <span style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              the right audience.
            </span>
          </h2>

          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
            Stop listing and waiting. Start distributing to 847+ verified agencies across 31 European markets — today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                boxShadow: '0 8px 40px rgba(220,38,38,0.35)',
              }}
            >
              List your property free →
            </Link>
          </div>

          <p className="mt-5 text-xs text-white/25">
            First property free · No credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 200 200" fill="none">
              <defs>
                <linearGradient id="footerFlame" x1="100" y1="180" x2="100" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#dc2626"/>
                </linearGradient>
              </defs>
              <path d="M100 22 L62 108 L76 104 L64 148 L100 132 L136 148 L124 104 L138 108 Z" fill="url(#footerFlame)"/>
              <rect x="56" y="148" width="88" height="10" rx="5" fill="url(#footerFlame)"/>
            </svg>
            <span className="text-white font-bold">Prop<span className="text-orange-500">Blaze</span></span>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/30">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <a href="mailto:hello@propblaze.com" className="hover:text-white/60 transition-colors">Contact</a>
          </div>

          <p className="text-xs text-white/20">
            © 2026 PropBlaze. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
