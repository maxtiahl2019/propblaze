'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Intent = 'sell' | 'buy' | 'rent'
type Step = 1 | 2 | 3 | 4 | 5

interface Agency {
  name: string; city: string; country: string; flag: string
  website: string; spec: string; reasons: string[]
  langs: string[]; score: number; wave: 1 | 2 | 3
  email?: string; phone?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢' },
  { id: 'villa', label: 'Villa', icon: '🏖️' },
  { id: 'house', label: 'House', icon: '🏡' },
  { id: 'land', label: 'Land / Plot', icon: '🌍' },
  { id: 'commercial', label: 'Commercial', icon: '🏗️' },
]

const RENTAL_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢' },
  { id: 'house', label: 'House / Villa', icon: '🏡' },
  { id: 'room', label: 'Room', icon: '🛏️' },
]

const COUNTRIES = [
  'Montenegro', 'Serbia', 'Croatia', 'Greece', 'Spain', 'Portugal',
  'Italy', 'Germany', 'Austria', 'France', 'UK', 'UAE', 'Bulgaria', 'Cyprus', 'Turkey',
]

const PRICE_PRESETS_SELL = ['50,000', '150,000', '300,000', '500,000', '800,000', '1,500,000', '3,000,000+']
const PRICE_PRESETS_BUY  = ['100,000', '200,000', '350,000', '500,000', '800,000', '1,500,000', '3,000,000+']
const PRICE_PRESETS_RENT = ['500', '800', '1,200', '2,000', '3,500', '5,000', '10,000+']

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeadPage() {
  const [step, setStep] = useState<Step>(1)
  const [intent, setIntent] = useState<Intent | null>(null)
  const [propType, setPropType] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('Connecting to agency database...')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to top on step change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // Loading messages animation
  const LOAD_MSGS = [
    'Scanning 2,800+ verified agencies...',
    'Running AI matching algorithm...',
    'Checking agency specialisations...',
    'Ranking by relevance score...',
    'Finalising your top-30 list...',
  ]
  useEffect(() => {
    if (!loading) return
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % LOAD_MSGS.length
      setLoadMsg(LOAD_MSGS[i])
    }, 1800)
    return () => clearInterval(t)
  }, [loading])

  // ── Step 2 → 3: run matching engine
  async function runMatch() {
    if (!propType || !country || !price) return
    setLoading(true)
    setStep(3)
    try {
      const endpoint = intent === 'sell' ? '/api/apex-demo'
        : intent === 'buy' ? '/api/match-buyers'
        : '/api/match-rentals'

      const priceNum = Number(price.replace(/[^0-9]/g, '')) || 0

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propType, country, city, price: priceNum }),
      })
      const data = await res.json()
      setAgencies(data.agencies || data.data?.agencies || [])
    } catch (e) {
      // fallback with empty list — gate still shows
      setAgencies([])
    } finally {
      setLoading(false)
    }
  }

  // ── Download agency list as CSV (instant, no server needed) ─────────────
  function downloadCSV() {
    const rows = [
      ['#', 'Agency', 'City', 'Country', 'Website', 'Phone', 'Score', 'Wave', 'Specialisation'],
      ...agencies.map((a, i) => [
        String(i + 1), a.name, a.city, a.country,
        a.website, a.phone || '', String(a.score), String(a.wave), a.spec,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propblaze-agencies-${propType}-${country.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Step 4 submit: capture lead
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !consent) return
    setSubmitting(true)
    try {
      // 1. Instant file download
      downloadCSV()

      // 2. Save lead + fire Telegram notification (background)
      fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, phone, intent, source: 'lead',
          prop_type: propType, country, city,
          price: Number(price.replace(/[^0-9]/g, '')) || undefined,
          agencies_count: agencies.length,
        }),
      }).catch(() => null)

      // 3. Send email copy
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Your PropBlaze Agency List — ${propType} in ${city || country}`,
          html: buildEmailBody(),
        }),
      }).catch(() => null)
    } catch {}
    setSubmitting(false)
    setSubmitted(true)
    setStep(5)
  }

  function buildEmailBody(): string {
    const top10 = agencies.slice(0, 10)
    const rows = top10.map(a =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${a.flag} <b>${a.name}</b></td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.city}, ${a.country}</td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.score}/99</td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.website}</td></tr>`
    ).join('')
    return `<h2>Your PropBlaze Agency List</h2>
<p>${propType} · ${city || country} · ${intent === 'rent' ? `€${price}/mo` : `€${price}`}</p>
<table style="border-collapse:collapse;width:100%">
  <thead><tr style="background:#0F172A;color:white">
    <th style="padding:8px;text-align:left">Agency</th>
    <th style="padding:8px;text-align:left">Location</th>
    <th style="padding:8px;text-align:left">Score</th>
    <th style="padding:8px;text-align:left">Website</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p style="margin-top:24px">Full list of ${agencies.length} agencies available at <a href="https://propblaze.com">propblaze.com</a></p>`
  }

  const intentLabel = intent === 'sell' ? 'Sell' : intent === 'buy' ? 'Buy' : 'Rent'
  const priceLabel = intent === 'rent' ? `€${price}/month` : `€${price}`
  const typeOptions = intent === 'rent' ? RENTAL_TYPES : PROPERTY_TYPES
  const pricePresets = intent === 'sell' ? PRICE_PRESETS_SELL : intent === 'buy' ? PRICE_PRESETS_BUY : PRICE_PRESETS_RENT

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        .lead-page { min-height: 100vh; background: linear-gradient(135deg, #080810 0%, #0F172A 50%, #0c1526 100%); color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 560px; margin: 0 auto; padding: 20px 16px 80px; }
        .logo { text-align: center; padding: 20px 0 8px; }
        .logo span { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #F59E0B; }
        .logo small { display: block; font-size: 11px; color: #64748B; letter-spacing: 1px; margin-top: 2px; }
        .progress { display: flex; gap: 4px; margin: 16px 0 28px; }
        .progress-dot { flex: 1; height: 3px; border-radius: 99px; background: #1E293B; transition: background 0.4s; }
        .progress-dot.active { background: #F59E0B; }
        .progress-dot.done { background: #34D399; }
        h1 { font-size: 26px; font-weight: 700; line-height: 1.25; margin-bottom: 8px; }
        h1 span { color: #F59E0B; }
        .subtitle { font-size: 14px; color: #94A3B8; margin-bottom: 28px; line-height: 1.5; }
        .intent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .intent-btn { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px 16px; cursor: pointer; text-align: center; transition: all 0.2s; color: #E2E8F0; }
        .intent-btn:hover, .intent-btn.selected { border-color: #F59E0B; background: rgba(245,158,11,0.08); }
        .intent-btn .icon { font-size: 32px; margin-bottom: 10px; }
        .intent-btn .label { font-size: 15px; font-weight: 600; }
        .intent-btn .desc { font-size: 12px; color: #64748B; margin-top: 4px; }
        .intent-btn.rent-btn { grid-column: 1 / -1; max-width: 200px; margin: 0 auto; }
        .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.8px; color: #64748B; text-transform: uppercase; margin-bottom: 10px; margin-top: 20px; }
        .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .type-btn { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 8px; cursor: pointer; text-align: center; transition: all 0.2s; color: #E2E8F0; font-size: 13px; }
        .type-btn .ticon { font-size: 20px; margin-bottom: 4px; }
        .type-btn:hover, .type-btn.selected { border-color: #F59E0B; background: rgba(245,158,11,0.08); }
        .input-group { margin-bottom: 16px; }
        .input-group label { display: block; font-size: 12px; font-weight: 600; color: #94A3B8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-group select, .input-group input { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px; color: #E2E8F0; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .input-group select:focus, .input-group input:focus { border-color: #F59E0B; }
        .input-group select option { background: #0F172A; color: #E2E8F0; }
        .price-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .price-preset { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; color: #94A3B8; transition: all 0.15s; }
        .price-preset:hover, .price-preset.selected { background: rgba(245,158,11,0.1); border-color: #F59E0B; color: #F59E0B; }
        .btn-primary { width: 100%; background: linear-gradient(135deg, #F59E0B, #D97706); border: none; border-radius: 12px; padding: 16px; color: #000; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.15s, opacity 0.15s; margin-top: 24px; }
        .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .trust-row { display: flex; justify-content: center; gap: 20px; margin-top: 16px; }
        .trust-item { font-size: 12px; color: #475569; }
        .trust-item span { color: #34D399; margin-right: 4px; }
        /* Loading */
        .loading-wrap { text-align: center; padding: 40px 0; }
        .spinner { width: 48px; height: 48px; border: 3px solid rgba(245,158,11,0.2); border-top-color: #F59E0B; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-msg { font-size: 14px; color: #94A3B8; margin-top: 8px; min-height: 20px; transition: opacity 0.3s; }
        .load-counter { font-size: 40px; font-weight: 800; color: #F59E0B; margin-bottom: 4px; }
        /* Results preview */
        .results-header { text-align: center; margin-bottom: 24px; }
        .results-count { font-size: 32px; font-weight: 800; color: #F59E0B; }
        .results-label { font-size: 14px; color: #94A3B8; margin-top: 4px; }
        .agency-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
        .agency-card.blurred { filter: blur(5px); user-select: none; pointer-events: none; opacity: 0.6; }
        .agency-name { font-size: 15px; font-weight: 600; color: #F1F5F9; margin-bottom: 2px; }
        .agency-meta { font-size: 12px; color: #64748B; margin-bottom: 6px; }
        .agency-spec { font-size: 13px; color: #94A3B8; margin-bottom: 8px; }
        .agency-score { display: inline-block; background: rgba(245,158,11,0.15); color: #F59E0B; border-radius: 6px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
        .wave-badge { display: inline-block; background: rgba(52,211,153,0.15); color: #34D399; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; margin-left: 6px; }
        .gate-box { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 16px; padding: 20px; margin: 20px 0; text-align: center; }
        .gate-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .gate-subtitle { font-size: 13px; color: #94A3B8; margin-bottom: 20px; }
        .more-count { font-size: 28px; font-weight: 800; color: #F59E0B; }
        /* Lead form */
        .form-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
        .form-subtitle { font-size: 14px; color: #94A3B8; margin-bottom: 24px; }
        .form-field { margin-bottom: 16px; }
        .form-field label { display: block; font-size: 12px; color: #64748B; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-field input { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 13px 14px; color: #E2E8F0; font-size: 15px; outline: none; transition: border 0.2s; }
        .form-field input:focus { border-color: #F59E0B; }
        .form-field input.optional { border-color: rgba(255,255,255,0.06); }
        .optional-tag { font-size: 10px; color: #475569; font-weight: 400; margin-left: 6px; text-transform: none; letter-spacing: 0; }
        .consent-row { display: flex; gap: 10px; align-items: flex-start; margin: 16px 0; cursor: pointer; }
        .consent-row input[type=checkbox] { margin-top: 2px; flex-shrink: 0; cursor: pointer; accent-color: #F59E0B; width: 16px; height: 16px; }
        .consent-text { font-size: 12px; color: #64748B; line-height: 1.5; }
        .summary-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border-radius: 8px; padding: 6px 12px; font-size: 13px; color: #94A3B8; margin-bottom: 4px; margin-right: 4px; }
        /* Success */
        .success-icon { font-size: 64px; text-align: center; margin-bottom: 16px; }
        .success-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
        .success-sub { font-size: 14px; color: #94A3B8; text-align: center; margin-bottom: 32px; }
        .offer-box { background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.05)); border: 1px solid rgba(245,158,11,0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .offer-tag { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #F59E0B; text-transform: uppercase; margin-bottom: 10px; }
        .offer-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .offer-desc { font-size: 14px; color: #94A3B8; margin-bottom: 16px; line-height: 1.6; }
        .offer-price { font-size: 36px; font-weight: 800; color: #F59E0B; }
        .offer-price-orig { font-size: 16px; color: #475569; text-decoration: line-through; margin-left: 8px; }
        .offer-price-period { font-size: 14px; color: #64748B; margin-top: 2px; }
        .offer-features { list-style: none; margin: 16px 0; }
        .offer-features li { font-size: 14px; color: #94A3B8; padding: 4px 0; }
        .offer-features li::before { content: '✓ '; color: #34D399; }
        .btn-offer { width: 100%; background: linear-gradient(135deg, #F59E0B, #D97706); border: none; border-radius: 12px; padding: 16px; color: #000; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .btn-offer:hover { opacity: 0.9; }
        .btn-secondary { width: 100%; background: transparent; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; color: #94A3B8; font-size: 14px; cursor: pointer; margin-top: 8px; transition: border-color 0.2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.25); color: #E2E8F0; }
        .full-list { margin-top: 32px; }
        .full-list-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #E2E8F0; }
        @media (max-width: 400px) { h1 { font-size: 22px; } .intent-grid { grid-template-columns: 1fr; } .intent-btn.rent-btn { max-width: 100%; } }
      `}</style>

      <div className="lead-page">
        <div className="container" ref={containerRef}>

          {/* Logo */}
          <div className="logo">
            <span>PROPBLAZE</span>
            <small>AI PROPERTY DISTRIBUTION</small>
          </div>

          {/* Progress bar */}
          <div className="progress">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`progress-dot ${step > s ? 'done' : step === s ? 'active' : ''}`} />
            ))}
          </div>

          {/* ─── STEP 1: Intent ───────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1>Find the best <span>real estate agencies</span> in 30 seconds</h1>
              <p className="subtitle">AI matches your request to 2,800+ verified agencies across Europe and beyond</p>

              <div className="section-label">What would you like to do?</div>
              <div className="intent-grid">
                <button
                  className={`intent-btn ${intent === 'sell' ? 'selected' : ''}`}
                  onClick={() => { setIntent('sell'); setTimeout(() => setStep(2), 220) }}
                >
                  <div className="icon">🏠</div>
                  <div className="label">Sell Property</div>
                  <div className="desc">Find agencies to sell your property</div>
                </button>
                <button
                  className={`intent-btn ${intent === 'buy' ? 'selected' : ''}`}
                  onClick={() => { setIntent('buy'); setTimeout(() => setStep(2), 220) }}
                >
                  <div className="icon">🔍</div>
                  <div className="label">Buy Property</div>
                  <div className="desc">Find agencies & developers</div>
                </button>
                <button
                  className={`intent-btn rent-btn ${intent === 'rent' ? 'selected' : ''}`}
                  onClick={() => { setIntent('rent'); setTimeout(() => setStep(2), 220) }}
                >
                  <div className="icon">🏡</div>
                  <div className="label">Rent a Home</div>
                  <div className="desc">Find rental agencies & property managers</div>
                </button>
              </div>

              <div className="trust-row" style={{ marginTop: 32 }}>
                <div className="trust-item"><span>✓</span> 2,800+ agencies</div>
                <div className="trust-item"><span>✓</span> 30+ countries</div>
                <div className="trust-item"><span>✓</span> AI-ranked results</div>
              </div>
            </>
          )}

          {/* ─── STEP 2: Details form ─────────────────────────────────────── */}
          {step === 2 && intent && (
            <>
              <h1>
                {intent === 'sell' && <>Tell us about <span>your property</span></>}
                {intent === 'buy' && <>What are you <span>looking for?</span></>}
                {intent === 'rent' && <>What home are you <span>looking for?</span></>}
              </h1>
              <p className="subtitle">
                {intent === 'sell' && 'We\'ll find agencies most likely to close a deal for your property'}
                {intent === 'buy' && 'We\'ll match agencies and developers with available inventory'}
                {intent === 'rent' && 'We\'ll find rental agencies with properties matching your needs'}
              </p>

              <div className="section-label">Property type</div>
              <div className="type-grid">
                {typeOptions.map(t => (
                  <button key={t.id} className={`type-btn ${propType === t.id ? 'selected' : ''}`}
                    onClick={() => setPropType(t.id)}>
                    <div className="ticon">{t.icon}</div>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="input-group" style={{ marginTop: 20 }}>
                <label>Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>City / Region <span style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>optional</span></label>
                <input
                  type="text" value={city} placeholder="e.g. Kotor, Barcelona, Dubai..."
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>
                  {intent === 'sell' ? 'Asking price (€)' : intent === 'buy' ? 'Max budget (€)' : 'Monthly budget (€/month)'}
                </label>
                <input
                  type="text" value={price} placeholder={intent === 'rent' ? 'e.g. 1,200' : 'e.g. 350,000'}
                  onChange={e => setPrice(e.target.value.replace(/[^0-9,+]/g, ''))}
                />
                <div className="price-presets">
                  {pricePresets.map(p => (
                    <button key={p}
                      className={`price-preset ${price === p.replace('+', '') || price === p ? 'selected' : ''}`}
                      onClick={() => setPrice(p.replace('+', '').replace(/,/g, ''))}>
                      {intent === 'rent' ? `€${p}/mo` : `€${p}`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                disabled={!propType || !country || !price}
                onClick={runMatch}
              >
                Find Matching Agencies →
              </button>

              <div className="trust-row">
                <div className="trust-item"><span>🔒</span> No spam</div>
                <div className="trust-item"><span>⚡</span> Results in ~20 sec</div>
                <div className="trust-item"><span>✓</span> Free</div>
              </div>
            </>
          )}

          {/* ─── STEP 3: Loading + Preview ────────────────────────────────── */}
          {step === 3 && (
            <>
              {loading ? (
                <div className="loading-wrap">
                  <div className="load-counter">
                    <AnimatedCounter target={agencies.length || 2847} />
                  </div>
                  <div style={{ color: '#64748B', fontSize: 13, marginBottom: 24 }}>agencies in database</div>
                  <div className="spinner" />
                  <div className="load-msg">{loadMsg}</div>
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <div className="results-count">{agencies.length || 28}</div>
                    <div className="results-label">
                      agencies found for {propType} {city ? `in ${city}, ${country}` : `in ${country}`}
                    </div>
                  </div>

                  {/* Show first 3 visible */}
                  {(agencies.length > 0 ? agencies.slice(0, 3) : MOCK_AGENCIES.slice(0, 3)).map((a, i) => (
                    <AgencyCard key={i} agency={a} blurred={false} />
                  ))}

                  {/* Gate */}
                  <div className="gate-box">
                    <div className="more-count">+{Math.max(0, (agencies.length || 28) - 3)} more agencies</div>
                    <div className="gate-title" style={{ marginTop: 8 }}>Get the full list</div>
                    <div className="gate-subtitle">Enter your email to receive all {agencies.length || 28} matched agencies with contact details</div>
                    <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => setStep(4)}>
                      Get Full Agency List →
                    </button>
                  </div>

                  {/* Show 2 blurred cards below */}
                  {(agencies.length > 0 ? agencies.slice(3, 5) : MOCK_AGENCIES.slice(3, 5)).map((a, i) => (
                    <AgencyCard key={i} agency={a} blurred={true} />
                  ))}
                </>
              )}
            </>
          )}

          {/* ─── STEP 4: Lead capture ─────────────────────────────────────── */}
          {step === 4 && (
            <>
              <div className="form-title">One last step</div>
              <div className="form-subtitle">Enter your contact details to get the full agency list with emails and phone numbers</div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <span className="summary-pill">
                  {intent === 'sell' ? '🏠 Sell' : intent === 'buy' ? '🔍 Buy' : '🏡 Rent'}
                </span>
                {propType && <span className="summary-pill">📋 {propType}</span>}
                {country && <span className="summary-pill">📍 {city ? `${city}, ` : ''}{country}</span>}
                {price && <span className="summary-pill">💶 {intent === 'rent' ? `€${price}/mo` : `€${price}`}</span>}
                <span className="summary-pill">🏢 {agencies.length || 28} agencies found</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label>Email address <span style={{ color: '#EF4444', fontSize: 11 }}>*</span></label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-field">
                  <label>Phone number <span className="optional-tag">optional</span></label>
                  <input type="tel" className="optional" placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <label className="consent-row">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                  <span className="consent-text">
                    I agree to receive the agency list and updates from PropBlaze.
                    No spam — unsubscribe anytime. <a href="/privacy" style={{ color: '#F59E0B', textDecoration: 'none' }}>Privacy Policy</a>
                  </span>
                </label>

                <button type="submit" className="btn-primary" disabled={!email || !consent || submitting}>
                  {submitting ? 'Sending...' : `Download Full List (${agencies.length || 28} agencies) →`}
                </button>
              </form>

              <div className="trust-row" style={{ marginTop: 20 }}>
                <div className="trust-item"><span>🔒</span> GDPR compliant</div>
                <div className="trust-item"><span>📧</span> List sent instantly</div>
                <div className="trust-item"><span>🚫</span> No spam</div>
              </div>
            </>
          )}

          {/* ─── STEP 5: Success + Subscription offer ─────────────────────── */}
          {step === 5 && (
            <>
              <div className="success-icon">✅</div>
              <div className="success-title">Your list is ready!</div>
              <div className="success-sub">
                Sent to <strong style={{ color: '#F59E0B' }}>{email}</strong><br />
                {agencies.length || 28} agencies with full contact details
              </div>

              {/* Subscription offer */}
              <div className="offer-box">
                <div className="offer-tag">🎁 Special offer — Limited time</div>
                <div className="offer-title">Get 12 months of PropBlaze at the price of 3</div>
                <div className="offer-desc">
                  Automate your property distribution. Send your listing to all {agencies.length || 28} agencies with one click,
                  track responses, and manage inquiries from a single dashboard.
                </div>
                <div>
                  <span className="offer-price">€50</span>
                  <span className="offer-price-orig">€197</span>
                </div>
                <div className="offer-price-period">12 months · Early bird price · Cancel anytime</div>
                <ul className="offer-features">
                  <li>Unlimited property listings</li>
                  <li>AI-matched agencies — updated weekly</li>
                  <li>Automated outreach to all matched agencies</li>
                  <li>Real-time response tracking dashboard</li>
                  <li>Priority support</li>
                </ul>
                <button className="btn-offer" onClick={() => window.location.href = '/register?plan=annual-promo'}>
                  Get 12 Months for €50 →
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/register'}>
                  Start with free account instead
                </button>
              </div>

              {/* Show the actual full list */}
              {agencies.length > 0 && (
                <div className="full-list">
                  <div className="full-list-title">Your matched agencies (Wave 1 — Top picks)</div>
                  {agencies.filter(a => a.wave === 1).slice(0, 10).map((a, i) => (
                    <AgencyCard key={i} agency={a} blurred={false} showContact />
                  ))}
                  {agencies.filter(a => a.wave === 2).length > 0 && (
                    <>
                      <div className="full-list-title" style={{ marginTop: 24 }}>Wave 2 — Strong matches</div>
                      {agencies.filter(a => a.wave === 2).slice(0, 10).map((a, i) => (
                        <AgencyCard key={i} agency={a} blurred={false} showContact />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}

// ─── Agency Card component ────────────────────────────────────────────────────
function AgencyCard({ agency: a, blurred, showContact }: { agency: Agency; blurred: boolean; showContact?: boolean }) {
  return (
    <div className={`agency-card ${blurred ? 'blurred' : ''}`}>
      <div className="agency-name">{a.flag} {a.name}</div>
      <div className="agency-meta">{a.city}{a.city ? ', ' : ''}{a.country} · {a.website}</div>
      <div className="agency-spec">{a.spec}</div>
      <div>
        <span className="agency-score">Score {a.score}/99</span>
        <span className="wave-badge">Wave {a.wave}</span>
        {a.langs && <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{a.langs.slice(0, 3).join(' · ')}</span>}
      </div>
      {showContact && (a.email || a.phone) && (
        <div style={{ marginTop: 10, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {a.email && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 3 }}>📧 {a.email}</div>}
          {a.phone && <div style={{ fontSize: 12, color: '#64748B' }}>📞 {a.phone}</div>}
        </div>
      )}
      {!blurred && a.reasons && a.reasons.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {a.reasons.slice(0, 2).map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>✓ {r}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const end = Math.min(target, 2847)
    const dur = 1200
    const step = end / (dur / 16)
    const t = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return <>{val.toLocaleString()}</>
}

// ─── Mock agencies for when API is slow / not yet loaded ──────────────────────
const MOCK_AGENCIES: Agency[] = [
  { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegroprospects.com', spec: 'Coastal luxury, Adriatic specialist — top performer', reasons: ['Local market expert', 'Active buyer network'], langs: ['EN','RU','SR'], score: 94, wave: 1 },
  { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'leoestate.me', spec: 'Bay of Kotor & Tivat premium properties', reasons: ['Bay of Kotor specialist', 'German buyer network'], langs: ['EN','RU','DE'], score: 91, wave: 1 },
  { name: 'Dream Estate Montenegro', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'dream-estate.me', spec: 'Kotor Bay boutique — apartments, villas, land', reasons: ['Kotor city specialist', 'Boutique service'], langs: ['EN','RU','IT'], score: 87, wave: 1 },
  { name: 'Adriatic Properties', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'adriatic-properties.me', spec: 'Investor land & development plots specialist', reasons: ['Land specialist'], langs: ['EN','RU'], score: 85, wave: 2 },
  { name: 'Riviera Home Montenegro', city: 'Herceg Novi', country: 'Montenegro', flag: '🇲🇪', website: 'rivierahome.me', spec: 'Western Montenegro coast properties', reasons: ['Coast coverage'], langs: ['EN','RU'], score: 83, wave: 2 },
]
