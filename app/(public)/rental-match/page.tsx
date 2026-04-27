'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type RentalIntent = 'find' | 'list'
type Step = 1 | 2 | 3 | 4 | 5

interface Agency {
  name: string; city: string; country: string; flag: string
  website: string; spec: string; reasons: string[]
  langs: string[]; score: number; wave: 1 | 2 | 3
  email?: string; phone?: string
}

type RankSlot = 1 | 2 | 3
interface SavedAgency { agency: Agency; rank: RankSlot }

// ─── Config ───────────────────────────────────────────────────────────────────
const RENTAL_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢' },
  { id: 'house', label: 'House', icon: '🏡' },
  { id: 'villa', label: 'Villa', icon: '🌴' },
  { id: 'room', label: 'Room', icon: '🛏️' },
  { id: 'studio', label: 'Studio', icon: '🏠' },
  { id: 'commercial', label: 'Commercial', icon: '🏗️' },
]

const COUNTRIES = [
  'Montenegro', 'Serbia', 'Croatia', 'Greece', 'Spain', 'Portugal',
  'Italy', 'Germany', 'Austria', 'France', 'UK', 'UAE', 'Bulgaria', 'Cyprus', 'Turkey',
]

const PRICE_PRESETS = ['300', '500', '800', '1,200', '2,000', '3,500', '5,000', '10,000+']

const RANK_MEDALS: Record<RankSlot, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const RANK_LABELS: Record<RankSlot, string> = { 1: '1st Priority', 2: '2nd Priority', 3: '3rd Priority' }

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setCount(start)
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{count.toLocaleString()}</>
}

// ─── AgencyCard ───────────────────────────────────────────────────────────────
function AgencyCard({
  agency, index, saved, onSave,
}: {
  agency: Agency
  index: number
  saved: SavedAgency[]
  onSave: (a: Agency, rank: RankSlot) => void
}) {
  const savedEntry = saved.find(s => s.agency.name === agency.name)
  const isSaved = !!savedEntry

  return (
    <div className={`agency-card${isSaved ? ' saved' : ''}`}>
      <div className="card-top">
        <div className="agency-rank-num">#{index + 1}</div>
        <div className="agency-info">
          <div className="agency-name">{agency.flag} {agency.name}</div>
          <div className="agency-meta">{agency.city}, {agency.country}</div>
        </div>
        <div className="score-block">
          <div className="agency-score">{agency.score}/99</div>
          <div className={`wave-badge wave-${agency.wave}`}>Wave {agency.wave}</div>
        </div>
      </div>

      <div className="agency-spec">{agency.spec}</div>

      {agency.phone && (
        <div className="agency-contact">
          <span className="contact-icon">📞</span>
          <a href={`tel:${agency.phone}`} className="contact-link">{agency.phone}</a>
        </div>
      )}
      {agency.website && (
        <div className="agency-contact">
          <span className="contact-icon">🌐</span>
          <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
            target="_blank" rel="noopener noreferrer" className="contact-link">
            {agency.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}

      {agency.langs?.length > 0 && (
        <div className="langs-row">
          {agency.langs.map(l => <span key={l} className="lang-tag">{l}</span>)}
        </div>
      )}

      {/* Save / Rank buttons */}
      <div className="rank-row">
        {([1, 2, 3] as RankSlot[]).map(rank => {
          const isThisRank = isSaved && savedEntry?.rank === rank
          const slotTaken = saved.find(s => s.rank === rank && s.agency.name !== agency.name)
          return (
            <button
              key={rank}
              className={`rank-btn${isThisRank ? ' rank-active' : ''}${slotTaken ? ' rank-taken' : ''}`}
              onClick={() => !slotTaken && onSave(agency, rank)}
              title={slotTaken ? `${RANK_LABELS[rank]} already assigned` : RANK_LABELS[rank]}
            >
              {RANK_MEDALS[rank]} {isThisRank ? RANK_LABELS[rank] : rank}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RentalMatchPage() {
  const [step, setStep] = useState<Step>(1)
  const [rentalIntent, setRentalIntent] = useState<RentalIntent | null>(null)
  const [propType, setPropType] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [saved, setSaved] = useState<SavedAgency[]>([])
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('Connecting to rental database...')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const LOAD_MSGS = [
    'Scanning rental agency database...',
    'Matching your property requirements...',
    'Checking agency rental portfolios...',
    'Ranking by market coverage...',
    'Preparing your personalised list...',
  ]
  useEffect(() => {
    if (!loading) return
    let i = 0
    const t = setInterval(() => { i = (i + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[i]) }, 1800)
    return () => clearInterval(t)
  }, [loading])

  async function runMatch() {
    if (!propType || !country || !price) return
    setLoading(true)
    setStep(3)
    try {
      const priceNum = Number(price.replace(/[^0-9]/g, '')) || 0
      const res = await fetch('/api/match-rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propType, country, city, price: priceNum }),
      })
      const data = await res.json()
      setAgencies(data.agencies || [])
    } catch {
      setAgencies([])
    } finally {
      setLoading(false)
    }
  }

  function handleSave(agency: Agency, rank: RankSlot) {
    setSaved(prev => {
      const withoutThis = prev.filter(s => s.agency.name !== agency.name)
      const withoutRank = withoutThis.filter(s => s.rank !== rank)
      return [...withoutRank, { agency, rank }]
    })
  }

  function downloadCSV() {
    const rows = [
      ['#', 'Agency', 'City', 'Country', 'Website', 'Phone', 'Score', 'Wave', 'Specialisation'],
      ...agencies.map((a, i) => [
        String(i + 1), a.name, a.city, a.country,
        a.website, a.phone || '', String(a.score), String(a.wave), a.spec,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propblaze-rental-agencies-${propType}-${country.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !consent) return
    setSubmitting(true)
    // Download CSV immediately — no subscription required
    if (agencies.length > 0) downloadCSV()
    try {
      // 1. Save lead + Telegram
      fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, phone,
          intent: rentalIntent === 'find' ? 'find_rental' : 'list_rental',
          source: 'rental-match',
          prop_type: propType, country, city,
          price: Number(price.replace(/[^0-9]/g, '')) || undefined,
          agencies_count: agencies.length,
          saved_agencies: saved.sort((a, b) => a.rank - b.rank).map(s => s.agency.name),
        }),
      }).catch(() => null)

      // 2. Send email
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Your PropBlaze Rental Agency List — ${propType} in ${city || country}`,
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
    const savedSection = saved.length > 0
      ? `<h3>Your Ranked Agencies</h3><ul>${saved.sort((a, b) => a.rank - b.rank).map(s =>
          `<li>${RANK_MEDALS[s.rank]} <b>${s.agency.name}</b> — ${s.agency.website}</li>`
        ).join('')}</ul>`
      : ''
    const rows = top10.map(a =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${a.flag} <b>${a.name}</b></td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.city}, ${a.country}</td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.score}/99</td>
       <td style="padding:8px;border-bottom:1px solid #eee">${a.website}</td></tr>`
    ).join('')
    return `<h2>Your PropBlaze Rental Agency List</h2>
<p>${propType} in ${city || country} · €${price}/month · ${rentalIntent === 'find' ? 'Looking to rent' : 'Listing for rent'}</p>
${savedSection}
<table style="border-collapse:collapse;width:100%">
  <thead><tr style="background:#0F172A;color:white">
    <th style="padding:8px">Agency</th><th style="padding:8px">Location</th>
    <th style="padding:8px">Score</th><th style="padding:8px">Website</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`
  }

  const PREVIEW_VISIBLE = 3
  const visibleAgencies = agencies.slice(0, PREVIEW_VISIBLE)
  const blurredAgencies = agencies.slice(PREVIEW_VISIBLE, PREVIEW_VISIBLE + 2)
  const hiddenCount = Math.max(0, agencies.length - PREVIEW_VISIBLE)

  const sortedSaved = [...saved].sort((a, b) => a.rank - b.rank)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        .rm-page { min-height: 100vh; background: linear-gradient(135deg, #080810 0%, #0F172A 50%, #0c1526 100%); color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 580px; margin: 0 auto; padding: 20px 16px 80px; }
        .logo { text-align: center; padding: 20px 0 8px; }
        .logo span { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #F5C200; }
        .logo small { display: block; font-size: 11px; color: #64748B; letter-spacing: 1px; margin-top: 2px; }
        .logo .engine-tag { display: inline-block; background: rgba(245,194,0,0.12); color: #F5C200; border-radius: 6px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-top: 6px; text-transform: uppercase; }
        .progress { display: flex; gap: 4px; margin: 16px 0 28px; }
        .progress-dot { flex: 1; height: 3px; border-radius: 99px; background: #1E293B; transition: background 0.4s; }
        .progress-dot.active { background: #F5C200; }
        .progress-dot.done { background: #34D399; }
        h1 { font-size: 26px; font-weight: 700; line-height: 1.25; margin-bottom: 8px; }
        h1 span { color: #F5C200; }
        .subtitle { font-size: 14px; color: #94A3B8; margin-bottom: 28px; line-height: 1.5; }
        .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.8px; color: #64748B; text-transform: uppercase; margin-bottom: 10px; margin-top: 20px; }
        /* Intent cards */
        .intent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .intent-btn { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 24px 16px; cursor: pointer; text-align: center; transition: all 0.2s; color: #E2E8F0; }
        .intent-btn:hover, .intent-btn.selected { border-color: #F5C200; background: rgba(245,194,0,0.08); }
        .intent-btn .icon { font-size: 36px; margin-bottom: 12px; }
        .intent-btn .label { font-size: 15px; font-weight: 600; }
        .intent-btn .desc { font-size: 12px; color: #64748B; margin-top: 4px; }
        /* Type grid */
        .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .type-btn { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 8px; cursor: pointer; text-align: center; transition: all 0.2s; color: #E2E8F0; font-size: 13px; }
        .type-btn .ticon { font-size: 20px; margin-bottom: 4px; }
        .type-btn:hover, .type-btn.selected { border-color: #F5C200; background: rgba(245,194,0,0.08); }
        /* Inputs */
        .input-group { margin-bottom: 16px; }
        .input-group label { display: block; font-size: 12px; font-weight: 600; color: #94A3B8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-group select, .input-group input { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px; color: #E2E8F0; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .input-group select:focus, .input-group input:focus { border-color: #F5C200; }
        .input-group select option { background: #0F172A; color: #E2E8F0; }
        .price-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .price-preset { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; color: #94A3B8; transition: all 0.15s; }
        .price-preset:hover, .price-preset.selected { background: rgba(245,194,0,0.1); border-color: #F5C200; color: #F5C200; }
        /* Buttons */
        .btn-primary { width: 100%; background: linear-gradient(135deg, #F5C200, #D4A800); border: none; border-radius: 12px; padding: 16px; color: #000; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.15s, opacity 0.15s; margin-top: 24px; }
        .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .trust-row { display: flex; justify-content: center; gap: 20px; margin-top: 16px; flex-wrap: wrap; }
        .trust-item { font-size: 12px; color: #475569; }
        .trust-item span { color: #34D399; margin-right: 4px; }
        /* Loading */
        .loading-wrap { text-align: center; padding: 40px 0; }
        .spinner { width: 48px; height: 48px; border: 3px solid rgba(245,194,0,0.2); border-top-color: #F5C200; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-msg { font-size: 14px; color: #94A3B8; margin-top: 8px; min-height: 20px; }
        .load-counter { font-size: 44px; font-weight: 800; color: #F5C200; margin-bottom: 4px; }
        .load-counter-label { font-size: 13px; color: #64748B; }
        /* Results */
        .results-header { text-align: center; margin-bottom: 24px; }
        .results-count { font-size: 36px; font-weight: 800; color: #F5C200; }
        .results-label { font-size: 14px; color: #94A3B8; margin-top: 4px; }
        /* Agency card */
        .agency-card { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom: 12px; transition: border-color 0.2s, background 0.2s; }
        .agency-card:hover { border-color: rgba(245,194,0,0.3); background: rgba(245,194,0,0.03); }
        .agency-card.saved { border-color: #F5C200; background: rgba(245,194,0,0.05); }
        .agency-card.blurred { filter: blur(5px); user-select: none; pointer-events: none; opacity: 0.5; }
        .card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
        .agency-rank-num { font-size: 13px; font-weight: 700; color: #475569; min-width: 24px; padding-top: 2px; }
        .agency-info { flex: 1; }
        .agency-name { font-size: 15px; font-weight: 600; color: #F1F5F9; margin-bottom: 2px; }
        .agency-meta { font-size: 12px; color: #64748B; }
        .score-block { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .agency-score { background: rgba(245,194,0,0.15); color: #F5C200; border-radius: 6px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
        .wave-badge { border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
        .wave-1 { background: rgba(52,211,153,0.15); color: #34D399; }
        .wave-2 { background: rgba(96,165,250,0.15); color: #60A5FA; }
        .wave-3 { background: rgba(148,163,184,0.1); color: #94A3B8; }
        .agency-spec { font-size: 13px; color: #94A3B8; margin-bottom: 10px; line-height: 1.5; }
        .agency-contact { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .contact-icon { font-size: 12px; }
        .contact-link { font-size: 13px; color: #60A5FA; text-decoration: none; word-break: break-all; }
        .contact-link:hover { color: #F5C200; }
        .langs-row { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
        .lang-tag { background: rgba(255,255,255,0.06); border-radius: 4px; padding: 2px 7px; font-size: 11px; color: #64748B; }
        /* Rank buttons */
        .rank-row { display: flex; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .rank-btn { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 4px; font-size: 11px; font-weight: 600; color: #64748B; cursor: pointer; transition: all 0.15s; text-align: center; }
        .rank-btn:hover:not(.rank-taken) { border-color: rgba(245,194,0,0.4); color: #F5C200; background: rgba(245,194,0,0.06); }
        .rank-btn.rank-active { border-color: #F5C200; background: rgba(245,194,0,0.15); color: #F5C200; }
        .rank-btn.rank-taken { opacity: 0.35; cursor: not-allowed; }
        /* Gate */
        .gate-box { background: rgba(245,194,0,0.06); border: 1px solid rgba(245,194,0,0.2); border-radius: 16px; padding: 22px; margin: 20px 0; text-align: center; }
        .gate-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .gate-subtitle { font-size: 13px; color: #94A3B8; margin-bottom: 20px; }
        .more-count { font-size: 30px; font-weight: 800; color: #F5C200; }
        /* Saved summary */
        .saved-summary { background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
        .saved-summary-title { font-size: 13px; font-weight: 600; color: #34D399; margin-bottom: 8px; }
        .saved-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94A3B8; padding: 3px 0; }
        .saved-item strong { color: #E2E8F0; }
        /* Lead form */
        .form-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
        .form-subtitle { font-size: 14px; color: #94A3B8; margin-bottom: 24px; line-height: 1.55; }
        .form-field { margin-bottom: 16px; }
        .form-field label { display: block; font-size: 12px; color: #64748B; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-field input { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 13px 14px; color: #E2E8F0; font-size: 15px; outline: none; transition: border 0.2s; }
        .form-field input:focus { border-color: #F5C200; }
        .optional-tag { font-size: 10px; color: #475569; font-weight: 400; margin-left: 6px; text-transform: none; letter-spacing: 0; }
        .consent-row { display: flex; gap: 10px; align-items: flex-start; margin: 16px 0; cursor: pointer; }
        .consent-row input[type=checkbox] { margin-top: 2px; flex-shrink: 0; cursor: pointer; accent-color: #F5C200; width: 16px; height: 16px; }
        .consent-text { font-size: 12px; color: #64748B; line-height: 1.5; }
        .summary-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border-radius: 8px; padding: 6px 12px; font-size: 13px; color: #94A3B8; margin-bottom: 4px; margin-right: 4px; }
        /* Success */
        .success-icon { font-size: 64px; text-align: center; margin-bottom: 16px; }
        .success-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
        .success-sub { font-size: 14px; color: #94A3B8; text-align: center; margin-bottom: 32px; line-height: 1.6; }
        .offer-box { background: linear-gradient(135deg, rgba(245,194,0,0.1), rgba(212,168,0,0.05)); border: 1px solid rgba(245,194,0,0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .offer-tag { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #F5C200; text-transform: uppercase; margin-bottom: 10px; }
        .offer-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .offer-desc { font-size: 14px; color: #94A3B8; margin-bottom: 16px; line-height: 1.6; }
        .offer-price { font-size: 38px; font-weight: 800; color: #F5C200; }
        .offer-price-orig { font-size: 16px; color: #475569; text-decoration: line-through; margin-left: 8px; }
        .offer-period { font-size: 14px; color: #64748B; margin-top: 2px; }
        .offer-features { list-style: none; margin: 16px 0; }
        .offer-features li { font-size: 14px; color: #94A3B8; padding: 4px 0; }
        .offer-features li::before { content: '✓ '; color: #34D399; }
        .btn-offer { width: 100%; background: linear-gradient(135deg, #F5C200, #D4A800); border: none; border-radius: 12px; padding: 16px; color: #000; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 0.15s; }
        .btn-offer:hover { opacity: 0.9; }
        .btn-secondary { width: 100%; background: transparent; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; color: #94A3B8; font-size: 14px; cursor: pointer; margin-top: 8px; transition: border-color 0.2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.25); color: #E2E8F0; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0; }
        .full-list-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #E2E8F0; }
        @media (max-width: 400px) { h1 { font-size: 22px; } .intent-grid { grid-template-columns: 1fr; } .rank-btn { font-size: 10px; } }
      `}</style>

      <div className="rm-page">
        <div className="container" ref={containerRef}>

          {/* Logo */}
          <div className="logo">
            <span>PROPBLAZE</span>
            <small>AI PROPERTY DISTRIBUTION</small>
            <div className="engine-tag">🏠 Rental Engine</div>
          </div>

          {/* Progress */}
          <div className="progress">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`progress-dot ${step > s ? 'done' : step === s ? 'active' : ''}`} />
            ))}
          </div>

          {/* ─── STEP 1: Rental Intent ─────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1>Find the best <span>rental agencies</span> in 30 seconds</h1>
              <p className="subtitle">AI matches your rental request to verified agencies across Europe and beyond</p>

              <div className="section-label">What would you like to do?</div>
              <div className="intent-grid">
                <button
                  className={`intent-btn ${rentalIntent === 'find' ? 'selected' : ''}`}
                  onClick={() => { setRentalIntent('find'); setTimeout(() => setStep(2), 220) }}
                >
                  <div className="icon">🔍</div>
                  <div className="label">Find a Rental</div>
                  <div className="desc">Match agencies that can find your ideal rental property</div>
                </button>
                <button
                  className={`intent-btn ${rentalIntent === 'list' ? 'selected' : ''}`}
                  onClick={() => { setRentalIntent('list'); setTimeout(() => setStep(2), 220) }}
                >
                  <div className="icon">📋</div>
                  <div className="label">List for Rent</div>
                  <div className="desc">Find agencies to manage and rent out your property</div>
                </button>
              </div>

              <div className="trust-row">
                <div className="trust-item"><span>✓</span>1,200+ rental agencies</div>
                <div className="trust-item"><span>✓</span>25+ countries</div>
                <div className="trust-item"><span>✓</span>Free matching</div>
              </div>
            </>
          )}

          {/* ─── STEP 2: Property Details ──────────────────────────────────── */}
          {step === 2 && (
            <>
              <h1>Tell us about <span>your property</span></h1>
              <p className="subtitle">
                {rentalIntent === 'find' ? 'What kind of rental are you looking for?' : 'What property do you want to rent out?'}
              </p>

              <div className="section-label">Property type</div>
              <div className="type-grid">
                {RENTAL_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`type-btn ${propType === t.id ? 'selected' : ''}`}
                    onClick={() => setPropType(t.id)}
                  >
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
                <label>City / Area <span className="optional-tag">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Kotor, Split, Barcelona..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Monthly rent budget (€/month)</label>
                <input
                  type="text"
                  placeholder="e.g. 1,200"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
                <div className="price-presets">
                  {PRICE_PRESETS.map(p => (
                    <button
                      key={p}
                      className={`price-preset ${price === p ? 'selected' : ''}`}
                      onClick={() => setPrice(p)}
                    >
                      €{p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                disabled={!propType || !country || !price}
                onClick={runMatch}
              >
                🔍 Match Rental Agencies
              </button>

              <div className="trust-row" style={{ marginTop: 16 }}>
                <div className="trust-item"><span>✓</span>AI-powered matching</div>
                <div className="trust-item"><span>✓</span>Takes under 30 seconds</div>
              </div>
            </>
          )}

          {/* ─── STEP 3: Results preview ───────────────────────────────────── */}
          {step === 3 && (
            <>
              {loading ? (
                <div className="loading-wrap">
                  <div className="load-counter">
                    <AnimatedCounter target={1247} />
                  </div>
                  <div className="load-counter-label">rental agencies scanned</div>
                  <div className="spinner" style={{ marginTop: 24 }} />
                  <p className="load-msg">{loadMsg}</p>
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <div className="results-count">{agencies.length || 18}</div>
                    <div className="results-label">rental agencies matched for your request</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
                      {propType} · {city || country} · €{price}/mo
                    </div>
                  </div>

                  {/* Visible agency cards */}
                  {visibleAgencies.map((agency, i) => (
                    <AgencyCard
                      key={agency.name + i}
                      agency={agency}
                      index={i}
                      saved={saved}
                      onSave={handleSave}
                    />
                  ))}

                  {/* Blurred previews */}
                  {blurredAgencies.map((agency, i) => (
                    <div key={`blur-${i}`} className="agency-card blurred">
                      <div className="card-top">
                        <div className="agency-rank-num">#{PREVIEW_VISIBLE + i + 1}</div>
                        <div className="agency-info">
                          <div className="agency-name">{agency.flag} {agency.name}</div>
                          <div className="agency-meta">{agency.city}, {agency.country}</div>
                        </div>
                        <div className="score-block">
                          <div className="agency-score">{agency.score}/99</div>
                        </div>
                      </div>
                      <div className="agency-spec">{agency.spec}</div>
                    </div>
                  ))}

                  {/* Gate */}
                  <div className="gate-box">
                    <div className="more-count">+{hiddenCount || 15} more agencies</div>
                    <div className="gate-title" style={{ marginTop: 8 }}>Unlock your full agency list</div>
                    <div className="gate-subtitle">Enter your email to download the complete ranked list with contacts</div>
                    <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => setStep(4)}>
                      📥 Get Full List — Free
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ─── STEP 4: Lead capture ──────────────────────────────────────── */}
          {step === 4 && (
            <>
              <p className="form-title">Almost there — get your <span style={{ color: '#F5C200' }}>full agency list</span></p>
              <p className="form-subtitle">
                We'll send you the complete list of {agencies.length || 18} rental agencies with full contact details, rankings, and specialisations.
              </p>

              {/* Search summary */}
              <div style={{ marginBottom: 20 }}>
                <span className="summary-pill">🏠 {propType}</span>
                <span className="summary-pill">📍 {city || country}</span>
                <span className="summary-pill">💶 €{price}/mo</span>
              </div>

              {/* Saved agencies summary */}
              {saved.length > 0 && (
                <div className="saved-summary">
                  <div className="saved-summary-title">Your ranked agencies will be highlighted in the email</div>
                  {sortedSaved.map(s => (
                    <div key={s.agency.name} className="saved-item">
                      {RANK_MEDALS[s.rank]} <strong>{s.agency.name}</strong> — {s.agency.website}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Phone <span className="optional-tag">(optional — for agency callbacks)</span></label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  />
                </div>

                <label className="consent-row">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                  <span className="consent-text">
                    I agree to receive my agency list and relevant property market updates from PropBlaze.
                    You can unsubscribe at any time. We never sell your data.
                  </span>
                </label>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!email || !consent || submitting}
                >
                  {submitting ? 'Sending...' : '📬 Send Me the Full List'}
                </button>
              </form>

              <div className="trust-row" style={{ marginTop: 16 }}>
                <div className="trust-item"><span>🔒</span>Data encrypted</div>
                <div className="trust-item"><span>✓</span>No spam, ever</div>
                <div className="trust-item"><span>✓</span>GDPR compliant</div>
              </div>
            </>
          )}

          {/* ─── STEP 5: Success + Subscription offer ─────────────────────── */}
          {step === 5 && (
            <>
              <div className="success-icon">🎉</div>
              <p className="success-title">Your list is on its way!</p>
              <p className="success-sub">
                We've sent {agencies.length || 18} rental agencies to <strong>{email}</strong>.
                Check your inbox (and spam folder just in case).
              </p>

              {/* Subscription offer */}
              <div className="offer-box">
                <div className="offer-tag">⚡ Limited Launch Offer</div>
                <div className="offer-title">PropBlaze Pro — 12 Months Access</div>
                <div className="offer-desc">
                  Get unlimited agency searches, live market data, and priority matching for any property type across 50+ countries — at the price of just 3 months.
                </div>
                <div>
                  <span className="offer-price">€50</span>
                  <span className="offer-price-orig">€197</span>
                </div>
                <div className="offer-period">12 months · one payment · cancel anytime</div>
                <ul className="offer-features">
                  <li>Unlimited rental & sales agency searches</li>
                  <li>Full contact database (email + phone)</li>
                  <li>Priority AI matching (Wave 1 agencies first)</li>
                  <li>Market price reports for 50+ countries</li>
                  <li>New property listings alerts</li>
                  <li>Dedicated account manager</li>
                </ul>
                <button className="btn-offer">🚀 Claim 12 Months for €50</button>
                <button className="btn-secondary">Maybe later — keep free access</button>
              </div>

              <hr className="divider" />

              {/* Show full list */}
              {submitted && agencies.length > 0 && (
                <>
                  <div className="full-list-title">Your top rental agencies</div>
                  {agencies.map((agency, i) => (
                    <AgencyCard
                      key={agency.name + i}
                      agency={agency}
                      index={i}
                      saved={saved}
                      onSave={handleSave}
                    />
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}
