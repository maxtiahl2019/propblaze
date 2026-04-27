'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Intent = 'sell' | 'buy' | 'rent_out' | 'rent_in'
type Step = 1 | 2 | 3 | 4 | 5

interface Agency {
  name: string; city: string; country: string; flag: string
  website: string; spec: string; reasons: string[]
  langs: string[]; score: number; wave: 1 | 2 | 3
  email?: string; phone?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const RESIDENTIAL_TYPES = [
  { id: 'apartment', label: 'Apartment',  icon: '🏢' },
  { id: 'villa',     label: 'Villa',      icon: '🌴' },
  { id: 'house',     label: 'House',      icon: '🏡' },
  { id: 'land',      label: 'Land / Plot',icon: '🌍' },
]

const COMMERCIAL_TYPES = [
  { id: 'office',    label: 'Office',     icon: '💼' },
  { id: 'retail',    label: 'Retail / Shop', icon: '🏪' },
  { id: 'mall',      label: 'Mall / SC',  icon: '🏬' },
  { id: 'warehouse', label: 'Warehouse',  icon: '🏭' },
  { id: 'hotel',     label: 'Hotel',      icon: '🏨' },
  { id: 'land',      label: 'Land / Plot',icon: '🌍' },
]

const PROPERTY_TYPES = [...RESIDENTIAL_TYPES, { id: 'commercial', label: 'Commercial', icon: '🏗️' }]

const RENTAL_TYPES = [
  { id: 'apartment', label: 'Apartment',  icon: '🏢' },
  { id: 'house',     label: 'House / Villa', icon: '🏡' },
  { id: 'room',      label: 'Room',       icon: '🛏️' },
  { id: 'office',    label: 'Office',     icon: '💼' },
  { id: 'retail',    label: 'Retail',     icon: '🏪' },
  { id: 'warehouse', label: 'Warehouse',  icon: '🏭' },
]

const COUNTRIES = [
  'Montenegro','Serbia','Croatia','Greece','Spain','Portugal',
  'Italy','Germany','Austria','France','UK','UAE','Bulgaria','Cyprus','Turkey',
]

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Montenegro':  ['Podgorica','Budva','Kotor','Bar','Herceg Novi','Tivat','Ulcinj','Nikšić','Bečići','Petrovac'],
  'Serbia':      ['Belgrade','Novi Sad','Niš','Kragujevac','Subotica','Čačak','Novi Pazar','Vranje'],
  'Croatia':     ['Zagreb','Split','Dubrovnik','Rijeka','Zadar','Osijek','Pula','Makarska','Rovinj','Hvar'],
  'Greece':      ['Athens','Thessaloniki','Mykonos','Santorini','Rhodes','Corfu','Crete','Heraklion','Patras','Volos'],
  'Spain':       ['Barcelona','Madrid','Valencia','Seville','Málaga','Marbella','Alicante','Tenerife','Ibiza','Costa Brava'],
  'Portugal':    ['Lisbon','Porto','Algarve','Faro','Lagos','Cascais','Sintra','Braga','Madeira','Funchal'],
  'Italy':       ['Rome','Milan','Florence','Venice','Naples','Turin','Bologna','Palermo','Sardinia','Amalfi'],
  'Germany':     ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Düsseldorf','Dresden','Leipzig'],
  'Austria':     ['Vienna','Salzburg','Innsbruck','Graz','Linz','Bregenz','Klagenfurt'],
  'France':      ['Paris','Nice','Lyon','Marseille','Bordeaux','Cannes','Monaco','Strasbourg','Toulouse','Nantes'],
  'UK':          ['London','Manchester','Birmingham','Edinburgh','Bristol','Leeds','Liverpool','Glasgow'],
  'UAE':         ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah'],
  'Bulgaria':    ['Sofia','Plovdiv','Varna','Burgas','Nessebar','Sunny Beach','Bansko','Borovets'],
  'Cyprus':      ['Limassol','Paphos','Nicosia','Larnaca','Ayia Napa','Protaras','Kyrenia'],
  'Turkey':      ['Istanbul','Ankara','Izmir','Antalya','Bodrum','Alanya','Fethiye','Marmaris','Side','Kalkan'],
}

const PRICE_PRESETS_SELL = ['50,000','100,000','200,000','350,000','500,000','800,000','1,500,000','3,000,000+']
const PRICE_PRESETS_BUY  = ['100,000','200,000','350,000','500,000','800,000','1,500,000','3,000,000+']
const PRICE_PRESETS_RENT = ['400','700','1,000','1,500','2,500','4,000','7,000','10,000+']

const INTENT_CONFIG: Record<Intent, {
  icon: string; label: string; verb: string; role: string; roleColor: string
  desc: string; color: string; bg: string
}> = {
  sell:    { icon: '🏷️', label: 'Sell',     verb: 'SELL',     role: 'Seller',   roleColor: '#F59E0B', desc: 'Find agencies to sell your property faster',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  buy:     { icon: '🔑', label: 'Buy',      verb: 'BUY',      role: 'Buyer',    roleColor: '#3B82F6', desc: 'Find agencies & developers with listings',     color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  rent_out:{ icon: '📋', label: 'Rent Out', verb: 'RENT OUT', role: 'Landlord', roleColor: '#10B981', desc: 'Find tenants & property managers',             color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  rent_in: { icon: '🏡', label: 'Rent In',  verb: 'RENT IN',  role: 'Tenant',   roleColor: '#A78BFA', desc: 'Find rental agencies near you',               color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
}

const WAVE_CONFIG = {
  1: { label: 'Wave 1 — Best Match',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  medal: '🥇' },
  2: { label: 'Wave 2 — Strong Match', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', medal: '🥈' },
  3: { label: 'Wave 3 — Good Match',   color: '#78716C', bg: 'rgba(120,113,108,0.08)', border: 'rgba(120,113,108,0.2)', medal: '🥉' },
}

// ─── AgencyCard ───────────────────────────────────────────────────────────────
function AgencyCard({ agency: a, index, blurred, showContact }: {
  agency: Agency; index: number; blurred?: boolean; showContact?: boolean
}) {
  const wc = WAVE_CONFIG[a.wave]
  const href = a.website
    ? (a.website.startsWith('http') ? a.website : `https://${a.website}`)
    : null

  return (
    <div className={`agency-card wave-${a.wave}${blurred ? ' blurred' : ''}`}>
      <div className="ac-top">
        <div className="ac-rank">#{index + 1}</div>
        <div className="ac-main">
          <div className="ac-name">{a.flag || '🏢'} {a.name}</div>
          <div className="ac-location">
            📍 {a.city}{a.city && a.country ? ', ' : ''}{a.country}
          </div>
        </div>
        <div className="ac-score-block">
          <div className="ac-score" style={{ color: wc.color }}>{a.score}<span>/99</span></div>
          <div className="ac-wave" style={{ background: wc.bg, color: wc.color, border: `1px solid ${wc.border}` }}>
            {wc.medal} W{a.wave}
          </div>
        </div>
      </div>

      <div className="ac-spec">{a.spec}</div>

      {showContact && (
        <div className="ac-contacts">
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="ac-link">
              <span>🌐</span>
              <span>{a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </a>
          )}
          {a.phone && (
            <a href={`tel:${a.phone}`} className="ac-link phone">
              <span>📞</span><span>{a.phone}</span>
            </a>
          )}
          {a.email && (
            <a href={`mailto:${a.email}`} className="ac-link email">
              <span>✉️</span><span>{a.email}</span>
            </a>
          )}
        </div>
      )}

      {!blurred && a.reasons?.length > 0 && (
        <div className="ac-reasons">
          {a.reasons.slice(0, 2).map((r, i) => (
            <div key={i} className="ac-reason">✓ {r}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const end = Math.min(target, 2847)
    const step = end / (1200 / 16)
    let cur = 0
    const t = setInterval(() => {
      cur = Math.min(cur + step, end)
      setVal(Math.floor(cur))
      if (cur >= end) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return <>{val.toLocaleString()}</>
}

// ─── CityAutocomplete ─────────────────────────────────────────────────────────
function CityAutocomplete({ country, value, onChange }: {
  country: string; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState<string[]>([])
  const cities = CITIES_BY_COUNTRY[country] || []
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value.trim()) {
      setFiltered(cities.slice(0, 8))
    } else {
      const q = value.toLowerCase()
      setFiltered(cities.filter(c => c.toLowerCase().includes(q)).slice(0, 8))
    }
  }, [value, country])

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!inputRef.current?.contains(e.target as Node) &&
          !listRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={country ? `e.g. ${cities[0] || 'City name...'}` : 'Select country first...'}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10,
          padding: '12px 14px', color: '#E2E8F0', fontSize: 15, outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => {}}
      />
      {open && filtered.length > 0 && (
        <div ref={listRef} style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#1E293B', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, marginTop: 4, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {filtered.map(c => (
            <button
              key={c}
              type="button"
              style={{
                display: 'block', width: '100%', padding: '10px 14px',
                textAlign: 'left', background: 'none', border: 'none',
                color: '#E2E8F0', fontSize: 14, cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              onClick={() => { onChange(c); setOpen(false) }}
            >
              📍 {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadPage() {
  const [step, setStep]         = useState<Step>(1)
  const [intent, setIntent]     = useState<Intent | null>(null)
  const [propType, setPropType] = useState('')
  const [country, setCountry]   = useState('')
  const [city, setCity]         = useState('')
  const [price, setPrice]       = useState('')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading]   = useState(false)
  const [loadMsg, setLoadMsg]   = useState('Connecting to agency database...')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [consent, setConsent]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // Reset city when country changes
  useEffect(() => { setCity('') }, [country])

  const LOAD_MSGS = [
    'Scanning 2,800+ verified agencies...',
    'Running AI matching algorithm...',
    'Checking specialisations & availability...',
    'Ranking by relevance score...',
    'Finalising your shortlist...',
  ]
  useEffect(() => {
    if (!loading) return
    let i = 0
    const t = setInterval(() => { i = (i + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[i]) }, 1800)
    return () => clearInterval(t)
  }, [loading])

  async function runMatch() {
    if (!propType || !country || !price) return
    setLoading(true); setStep(3)
    try {
      const endpoint = (intent === 'sell') ? '/api/apex-demo'
        : (intent === 'buy') ? '/api/match-buyers'
        : '/api/match-rentals'
      const priceNum = Number(price.replace(/[^0-9]/g, '')) || 0
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propType, country, city, price: priceNum, intent }),
      })
      const data = await res.json()
      setAgencies(data.agencies || data.data?.agencies || [])
    } catch { setAgencies([]) }
    finally { setLoading(false) }
  }

  function downloadCSV() {
    const rows = [
      ['#', 'Agency', 'City', 'Country', 'Website', 'Phone', 'Email', 'Score', 'Wave', 'Specialisation'],
      ...agencies.map((a, i) => [
        String(i + 1), a.name, a.city, a.country,
        a.website, a.phone || '', a.email || '',
        String(a.score), String(a.wave), a.spec,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propblaze-${intent}-${propType}-${country.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !consent) return
    setSubmitting(true)
    if (agencies.length > 0) downloadCSV()
    fetch('/api/save-lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, phone, intent, source: 'lead',
        prop_type: propType, country, city,
        price: Number(price.replace(/[^0-9]/g, '')) || undefined,
        agencies_count: agencies.length,
      }),
    }).catch(() => null)
    fetch('/api/send-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Your PropBlaze Agency List — ${propType} in ${city || country}`,
        html: buildEmailBody(),
      }),
    }).catch(() => null)
    setSubmitting(false)
    setStep(5)
  }

  function buildEmailBody() {
    const ic = intent ? INTENT_CONFIG[intent] : INTENT_CONFIG.sell
    const wave1 = agencies.filter(a => a.wave === 1).slice(0, 10)
    const allRows = (wave1.length > 0 ? wave1 : agencies.slice(0, 10)).map(a => {
      const site = a.website
        ? `<a href="https://${a.website}" style="color:#2563EB">${a.website}</a>`
        : '—'
      const phone = a.phone
        ? `<a href="tel:${a.phone}" style="color:#059669">${a.phone}</a>`
        : '—'
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;vertical-align:top">
          <b style="color:#0F172A">${a.flag || ''} ${a.name}</b>
          <div style="font-size:12px;color:#94A3B8;margin-top:2px">${a.city || ''}${a.city && a.country ? ', ' : ''}${a.country}</div>
          <div style="font-size:11px;color:#64748B;margin-top:3px">${a.spec || ''}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;text-align:center;vertical-align:top">
          <span style="background:#FFFBEB;color:#D97706;font-weight:700;font-size:14px;padding:3px 8px;border-radius:6px">${a.score}/99</span>
          <div style="font-size:10px;color:#94A3B8;margin-top:4px">Wave ${a.wave}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;font-size:13px;vertical-align:top">${site}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;font-size:13px;vertical-align:top;white-space:nowrap">${phone}</td>
      </tr>`
    }).join('')

    const promoUrl = 'https://propblaze.com/register?plan=annual-promo'

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:640px;margin:0 auto;padding:24px 16px">

  <!-- Header -->
  <div style="background:#0F172A;border-radius:16px 16px 0 0;padding:32px 28px;text-align:center">
    <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#F59E0B">PROPBLAZE</div>
    <div style="font-size:12px;color:#64748B;letter-spacing:2px;margin-top:4px">AI PROPERTY DISTRIBUTION</div>
    <div style="margin-top:16px;display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:6px 16px;color:#F59E0B;font-size:14px;font-weight:600">
      ${ic.icon} ${ic.label} — Your Agency Shortlist
    </div>
  </div>

  <!-- Summary bar -->
  <div style="background:#1E293B;padding:14px 28px;display:flex;gap:8px;flex-wrap:wrap">
    <span style="background:rgba(255,255,255,0.08);border-radius:6px;padding:4px 12px;font-size:12px;color:#94A3B8">🏠 ${propType}</span>
    <span style="background:rgba(255,255,255,0.08);border-radius:6px;padding:4px 12px;font-size:12px;color:#94A3B8">📍 ${city ? `${city}, ` : ''}${country}</span>
    <span style="background:rgba(255,255,255,0.08);border-radius:6px;padding:4px 12px;font-size:12px;color:#94A3B8">💶 ${intent?.includes('rent') ? `€${price}/mo` : `€${price}`}</span>
    <span style="background:rgba(245,158,11,0.15);border-radius:6px;padding:4px 12px;font-size:12px;color:#F59E0B;font-weight:600">🏢 ${agencies.length} agencies found</span>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:28px">

    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0F172A">Your Wave 1 — Best Matches</p>
    <p style="margin:0 0 20px;font-size:13px;color:#64748B">Top ${wave1.length || agencies.slice(0,10).length} agencies by score. Full list of ${agencies.length} agencies in the CSV file attached.</p>

    <!-- Agency table -->
    <table style="border-collapse:collapse;width:100%;border-radius:10px;overflow:hidden;border:1px solid #F1F5F9">
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Agency</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Score</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Website</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Phone</th>
        </tr>
      </thead>
      <tbody>${allRows}</tbody>
    </table>

    <!-- CSV note -->
    <div style="margin-top:16px;padding:14px 16px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px">
      <p style="margin:0;font-size:13px;color:#15803D">
        📎 <b>Full CSV attached</b> — open in Excel or Google Sheets. Contains all ${agencies.length} agencies with websites, phones, emails, wave rating, and specialisation.
      </p>
    </div>

    <!-- Promo block -->
    <div style="margin-top:28px;padding:24px;background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:12px;border:1px solid rgba(245,158,11,0.3)">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#F59E0B;text-transform:uppercase;margin-bottom:10px">⚡ Early Bird — Limited Offer</div>
      <div style="font-size:18px;font-weight:800;color:#F1F5F9;margin-bottom:8px">Send your listing to all ${agencies.length} agencies with 1 click</div>
      <div style="font-size:13px;color:#94A3B8;margin-bottom:16px;line-height:1.6">
        PropBlaze Pro automates outreach, tracks responses, and refreshes your agency list weekly — all from one dashboard.
      </div>
      <div style="margin-bottom:16px">
        <span style="font-size:36px;font-weight:900;color:#F59E0B">€50</span>
        <span style="font-size:16px;color:#475569;text-decoration:line-through;margin-left:8px">€197</span>
        <div style="font-size:12px;color:#475569;margin-top:2px">12 months · one payment · cancel anytime</div>
      </div>
      <a href="${promoUrl}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#000;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.2px">
        🚀 Get PropBlaze Pro — €50/year →
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#F8FAFC;border-radius:0 0 16px 16px;padding:16px 28px;text-align:center;border-top:1px solid #E2E8F0">
    <p style="margin:0;font-size:12px;color:#94A3B8">
      PropBlaze · AI Property Distribution ·
      <a href="https://propblaze.com" style="color:#F59E0B;text-decoration:none">propblaze.com</a>
    </p>
    <p style="margin:6px 0 0;font-size:11px;color:#CBD5E1">
      You received this because you requested an agency list.
      <a href="https://propblaze.com/unsubscribe" style="color:#CBD5E1">Unsubscribe</a>
    </p>
  </div>

</div>
</body>
</html>`
  }

  const [propCategory, setPropCategory] = useState<'residential' | 'commercial'>('residential')

  const ic = intent ? INTENT_CONFIG[intent] : null
  const isRental = intent === 'rent_in' || intent === 'rent_out'
  const typeOptions = isRental
    ? RENTAL_TYPES
    : (propCategory === 'commercial' ? COMMERCIAL_TYPES : RESIDENTIAL_TYPES)
  const pricePresets = (intent === 'sell') ? PRICE_PRESETS_SELL
    : (intent === 'buy') ? PRICE_PRESETS_BUY
    : PRICE_PRESETS_RENT

  const wave1 = agencies.filter(a => a.wave === 1)
  const wave2 = agencies.filter(a => a.wave === 2)
  const wave3 = agencies.filter(a => a.wave === 3)
  const PREVIEW_COUNT = 3
  const visibleAgencies = agencies.slice(0, PREVIEW_COUNT)
  const blurredAgencies = agencies.slice(PREVIEW_COUNT, PREVIEW_COUNT + 2)
  const hiddenCount = Math.max(0, agencies.length - PREVIEW_COUNT)

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060912; }

        .lp { min-height: 100vh; background: linear-gradient(150deg, #060912 0%, #0B1120 40%, #0d1830 100%); color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 680px; margin: 0 auto; padding: 24px 16px 100px; }

        /* Logo */
        .logo { text-align: center; padding: 24px 0 12px; }
        .logo-name { font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #F59E0B; }
        .logo-sub { font-size: 10px; color: #475569; letter-spacing: 2px; margin-top: 3px; }

        /* Progress */
        .progress { display: flex; gap: 5px; margin: 16px 0 32px; }
        .pd { flex: 1; height: 3px; border-radius: 99px; background: #1E293B; transition: background 0.4s; }
        .pd.active { background: #F59E0B; }
        .pd.done { background: #34D399; }

        /* Headings */
        .page-title { font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 8px; }
        .page-title .hl { color: #F59E0B; }
        .page-sub { font-size: 14px; color: #94A3B8; margin-bottom: 28px; line-height: 1.55; }

        /* Quiz step 1 */
        .quiz-q { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #475569; text-transform: uppercase; text-align: center; margin-bottom: 24px; }
        .intent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
        .intent-btn {
          background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 28px 18px 22px; cursor: pointer; text-align: center;
          transition: all 0.22s; color: #E2E8F0; position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center;
        }
        .intent-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .ib-icon { font-size: 40px; margin-bottom: 12px; display: block; line-height: 1; }
        .ib-verb { font-size: 18px; font-weight: 900; letter-spacing: 1px; display: block; margin-bottom: 6px; }
        .ib-role { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }
        .ib-desc { font-size: 12px; color: #64748B; line-height: 1.4; display: block; }
        .ib-check { position: absolute; top: 12px; right: 14px; width: 20px; height: 20px; border-radius: 50%; background: #34D399; display: flex; align-items: center; justify-content: center; font-size: 11px; opacity: 0; transition: opacity 0.2s; }
        .intent-btn.sel .ib-check { opacity: 1; }
        /* Role badge (persistent) */
        .role-badge { display: inline-flex; align-items: center; gap: 8px; border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }

        /* Section labels */
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #475569; text-transform: uppercase; margin: 20px 0 10px; }

        /* Type grid */
        .type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        @media(max-width: 420px) { .type-grid { grid-template-columns: repeat(2, 1fr); } }
        .type-btn {
          background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 6px; cursor: pointer; text-align: center;
          transition: all 0.18s; color: #CBD5E1; font-size: 12px; font-weight: 500;
        }
        .type-btn .ti { font-size: 20px; display: block; margin-bottom: 5px; }
        .type-btn:hover, .type-btn.sel { border-color: #F59E0B; background: rgba(245,158,11,0.08); color: #F59E0B; }

        /* Inputs */
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.6px; }
        .field select, .field input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 13px 14px; color: #E2E8F0; font-size: 15px; outline: none;
          transition: border-color 0.2s;
        }
        .field select:focus, .field input:focus { border-color: #F59E0B; background: rgba(255,255,255,0.07); }
        .field select option { background: #1E293B; color: #E2E8F0; }

        /* Price presets */
        .presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .preset-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 5px 11px; font-size: 12px; cursor: pointer; color: #94A3B8;
          transition: all 0.15s;
        }
        .preset-btn:hover, .preset-btn.sel { background: rgba(245,158,11,0.1); border-color: #F59E0B; color: #F59E0B; }

        /* CTA buttons */
        .btn-cta {
          width: 100%; background: linear-gradient(135deg, #F59E0B, #D97706); border: none;
          border-radius: 12px; padding: 17px; color: #000; font-size: 16px; font-weight: 800;
          cursor: pointer; transition: transform 0.15s, opacity 0.15s; margin-top: 24px;
          letter-spacing: 0.2px;
        }
        .btn-cta:hover { opacity: 0.92; transform: translateY(-2px); }
        .btn-cta:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .btn-secondary {
          width: 100%; background: transparent; border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px; padding: 14px; color: #64748B; font-size: 14px; cursor: pointer;
          margin-top: 8px; transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.25); color: #E2E8F0; }

        /* Trust row */
        .trust { display: flex; justify-content: center; gap: 20px; margin-top: 18px; flex-wrap: wrap; }
        .trust-item { font-size: 12px; color: #334155; }
        .trust-item b { color: #475569; }

        /* Loading */
        .loading-wrap { text-align: center; padding: 48px 0; }
        .spinner {
          width: 52px; height: 52px; border: 3px solid rgba(245,158,11,0.15);
          border-top-color: #F59E0B; border-radius: 50%; animation: spin 0.75s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-count { font-size: 48px; font-weight: 900; color: #F59E0B; line-height: 1; }
        .load-label { font-size: 13px; color: #475569; margin-top: 4px; margin-bottom: 24px; }
        .load-msg { font-size: 14px; color: #64748B; min-height: 22px; }

        /* Results header */
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .results-count-big { font-size: 36px; font-weight: 900; color: #F59E0B; line-height: 1; }
        .results-count-label { font-size: 13px; color: #64748B; margin-top: 4px; }
        .results-meta { font-size: 12px; color: #475569; text-align: right; }

        /* Wave section header */
        .wave-header {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; margin: 20px 0 12px; font-size: 13px; font-weight: 700;
        }

        /* Agency card */
        .agency-card {
          background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 16px 18px; margin-bottom: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .agency-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(245,158,11,0.2); }
        .agency-card.wave-1 { border-color: rgba(245,158,11,0.2); }
        .agency-card.blurred { filter: blur(6px); user-select: none; pointer-events: none; opacity: 0.5; }
        .ac-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; }
        .ac-rank { font-size: 12px; font-weight: 700; color: #475569; min-width: 28px; margin-top: 3px; }
        .ac-main { flex: 1; min-width: 0; }
        .ac-name { font-size: 15px; font-weight: 700; color: #F1F5F9; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ac-location { font-size: 12px; color: #475569; }
        .ac-score-block { text-align: right; flex-shrink: 0; }
        .ac-score { font-size: 20px; font-weight: 900; line-height: 1; }
        .ac-score span { font-size: 12px; font-weight: 400; color: #475569; }
        .ac-wave { font-size: 11px; font-weight: 700; border-radius: 6px; padding: 2px 7px; margin-top: 4px; display: inline-block; letter-spacing: 0.3px; }
        .ac-spec { font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 10px; }
        .ac-contacts { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        .ac-link {
          display: inline-flex; align-items: center; gap: 5px; font-size: 12px;
          color: #60A5FA; text-decoration: none; background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.15); border-radius: 6px; padding: 4px 10px;
          transition: all 0.15s; white-space: nowrap;
        }
        .ac-link:hover { background: rgba(96,165,250,0.15); }
        .ac-link.phone { color: #34D399; background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.15); }
        .ac-link.phone:hover { background: rgba(52,211,153,0.15); }
        .ac-link.email { color: #A78BFA; background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.15); }
        .ac-reasons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .ac-reason { font-size: 11px; color: #475569; }

        /* Gate */
        .gate-box {
          background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2);
          border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center;
        }
        .gate-count { font-size: 32px; font-weight: 900; color: #F59E0B; }
        .gate-title { font-size: 18px; font-weight: 700; margin: 8px 0 6px; }
        .gate-sub { font-size: 13px; color: #64748B; margin-bottom: 20px; line-height: 1.5; }

        /* Lead form */
        .form-title { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
        .form-sub { font-size: 14px; color: #94A3B8; margin-bottom: 24px; line-height: 1.5; }
        .pill-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .pill { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.06); border-radius: 8px; padding: 5px 11px; font-size: 12px; color: #94A3B8; }
        .consent-wrap { display: flex; gap: 10px; align-items: flex-start; margin: 16px 0; cursor: pointer; }
        .consent-wrap input[type=checkbox] { margin-top: 2px; flex-shrink: 0; accent-color: #F59E0B; width: 16px; height: 16px; cursor: pointer; }
        .consent-text { font-size: 12px; color: #475569; line-height: 1.6; }

        /* Success */
        .success-hero { text-align: center; padding: 8px 0 32px; }
        .success-emoji { font-size: 64px; display: block; margin-bottom: 16px; }
        .success-title { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
        .success-sub { font-size: 14px; color: #94A3B8; line-height: 1.6; }
        .success-sub strong { color: #F59E0B; }

        /* Offer box */
        .offer-box {
          background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04));
          border: 1px solid rgba(245,158,11,0.25); border-radius: 16px; padding: 24px; margin-bottom: 28px;
        }
        .offer-tag { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #F59E0B; text-transform: uppercase; margin-bottom: 12px; }
        .offer-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .offer-desc { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 16px; }
        .offer-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
        .offer-price { font-size: 42px; font-weight: 900; color: #F59E0B; line-height: 1; }
        .offer-orig { font-size: 18px; color: #334155; text-decoration: line-through; }
        .offer-period { font-size: 13px; color: #475569; margin-bottom: 16px; }
        .offer-feats { list-style: none; margin: 0 0 16px; }
        .offer-feats li { font-size: 13px; color: #94A3B8; padding: 4px 0; }
        .offer-feats li::before { content: '✓ '; color: #34D399; font-weight: 700; }

        /* Category tabs */
        .cat-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .cat-tab {
          flex: 1; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 11px 8px; font-size: 13px; font-weight: 600;
          color: #64748B; cursor: pointer; transition: all 0.18s; text-align: center;
        }
        .cat-tab:hover { border-color: rgba(255,255,255,0.2); color: #94A3B8; }
        .cat-tab.sel { border-color: #F59E0B; background: rgba(245,158,11,0.1); color: #F59E0B; }

        /* Full list */
        .section-title { font-size: 16px; font-weight: 700; color: #E2E8F0; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        hr.divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 28px 0; }

        @media (max-width: 420px) {
          .page-title { font-size: 22px; }
          .intent-grid { grid-template-columns: 1fr; }
          .ac-name { font-size: 14px; }
          .results-header { flex-direction: column; align-items: flex-start; gap: 4px; }
        }
      `}</style>

      <div className="lp">
        <div className="container" ref={containerRef}>

          {/* Logo */}
          <div className="logo">
            <div className="logo-name">PROPBLAZE</div>
            <div className="logo-sub">AI PROPERTY DISTRIBUTION</div>
          </div>

          {/* Progress */}
          <div className="progress">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`pd ${step > s ? 'done' : step === s ? 'active' : ''}`} />
            ))}
          </div>

          {/* ─── STEP 1: Quiz ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h1 className="page-title" style={{ textAlign: 'center', marginBottom: 8 }}>
                  Find the best <span className="hl">real estate agencies</span> in 30 sec
                </h1>
                <p className="page-sub" style={{ textAlign: 'center', maxWidth: 420, margin: '0 auto' }}>
                  AI matches your request to 2,800+ verified agencies. Free, instant, no registration.
                </p>
              </div>

              <p className="quiz-q">— Who are you? —</p>

              <div className="intent-grid">
                {(Object.entries(INTENT_CONFIG) as [Intent, typeof INTENT_CONFIG[Intent]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    className={`intent-btn${intent === key ? ' sel' : ''}`}
                    style={{
                      borderColor: intent === key ? cfg.color : 'rgba(255,255,255,0.07)',
                      background: intent === key ? cfg.bg : 'rgba(255,255,255,0.03)',
                      boxShadow: intent === key ? `0 0 0 1px ${cfg.color}40, 0 8px 24px rgba(0,0,0,0.3)` : 'none',
                    }}
                    onClick={() => { setIntent(key); setTimeout(() => setStep(2), 280) }}
                  >
                    <div className="ib-check">✓</div>
                    <span className="ib-icon">{cfg.icon}</span>
                    <span className="ib-verb" style={{ color: cfg.color }}>{cfg.verb}</span>
                    <span
                      className="ib-role"
                      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                    >
                      I am a {cfg.role}
                    </span>
                    <span className="ib-desc">{cfg.desc}</span>
                  </button>
                ))}
              </div>

              <div className="trust">
                <div className="trust-item"><b>2,800+</b> agencies</div>
                <div className="trust-item"><b>30+</b> countries</div>
                <div className="trust-item"><b>Free</b></div>
                <div className="trust-item"><b>AI</b>-ranked</div>
              </div>
            </>
          )}

          {/* ─── STEP 2: Details ───────────────────────────────────────── */}
          {step === 2 && intent && ic && (
            <>
              {/* Role badge */}
              <div className="role-badge" style={{ background: ic.bg, color: ic.color, border: `1px solid ${ic.color}30` }}>
                {ic.icon} You are a <b style={{ marginLeft: 3 }}>{ic.role}</b>
              </div>

              <h1 className="page-title">
                {intent === 'sell'    && <>Tell us about <span className="hl">your property</span></>}
                {intent === 'buy'     && <>What are you <span className="hl">looking to buy?</span></>}
                {intent === 'rent_out'&& <>What property <span className="hl">do you want to rent out?</span></>}
                {intent === 'rent_in' && <>What home are you <span className="hl">looking to rent?</span></>}
              </h1>
              <p className="page-sub">
                {intent === 'sell'    && "We'll find agencies most likely to close a deal for your property."}
                {intent === 'buy'     && "We'll match agencies and developers with available inventory."}
                {intent === 'rent_out'&& "We'll find rental agencies and property managers in your area."}
                {intent === 'rent_in' && "We'll find rental agencies with properties matching your criteria."}
              </p>

              <div className="section-label">Property type</div>

              {/* Residential / Commercial tabs — only for sell & buy */}
              {!isRental && (
                <div className="cat-tabs">
                  <button
                    type="button"
                    className={`cat-tab${propCategory === 'residential' ? ' sel' : ''}`}
                    onClick={() => { setPropCategory('residential'); setPropType('') }}
                  >
                    🏠 Residential
                  </button>
                  <button
                    type="button"
                    className={`cat-tab${propCategory === 'commercial' ? ' sel' : ''}`}
                    onClick={() => { setPropCategory('commercial'); setPropType('') }}
                  >
                    🏢 Commercial
                  </button>
                </div>
              )}

              <div className="type-grid">
                {typeOptions.map(t => (
                  <button key={t.id} className={`type-btn${propType === t.id ? ' sel' : ''}`}
                    onClick={() => setPropType(t.id)}>
                    <span className="ti">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              <div className="field" style={{ marginTop: 20 }}>
                <label>Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="field">
                <label>City / Region <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>— optional</span></label>
                <CityAutocomplete country={country} value={city} onChange={setCity} />
              </div>

              <div className="field">
                <label>
                  {intent === 'sell'     ? 'Asking price (€)' :
                   intent === 'buy'      ? 'Max budget (€)' :
                   intent === 'rent_out' ? 'Expected monthly rent (€/mo)' :
                                           'Monthly budget (€/mo)'}
                </label>
                <input
                  type="text" value={price}
                  placeholder={intent?.includes('rent') ? 'e.g. 1,200' : 'e.g. 350,000'}
                  onChange={e => setPrice(e.target.value.replace(/[^0-9,+]/g, ''))}
                />
                <div className="presets">
                  {pricePresets.map(p => (
                    <button key={p}
                      className={`preset-btn${price === p.replace('+','').replace(/,/g,'') ? ' sel' : ''}`}
                      onClick={() => setPrice(p.replace('+','').replace(/,/g,''))}>
                      {intent?.includes('rent') ? `€${p}/mo` : `€${p}`}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-cta" disabled={!propType || !country || !price} onClick={runMatch}>
                {ic.icon} Find Matching Agencies →
              </button>

              <div className="trust" style={{ marginTop: 12 }}>
                <div className="trust-item"><b>~20 sec</b> results</div>
                <div className="trust-item"><b>Free</b></div>
                <div className="trust-item"><b>No spam</b></div>
              </div>
            </>
          )}

          {/* ─── STEP 3: Loading + Preview ─────────────────────────────── */}
          {step === 3 && (
            <>
              {loading ? (
                <div className="loading-wrap">
                  <div className="load-count"><AnimatedCounter target={2847} /></div>
                  <div className="load-label">agencies in database</div>
                  <div className="spinner" />
                  <div className="load-msg">{loadMsg}</div>
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <div>
                      <div className="results-count-big">{agencies.length || 28}</div>
                      <div className="results-count-label">agencies found · {propType} in {city ? `${city}, ` : ''}{country}</div>
                    </div>
                    <div className="results-meta">
                      {wave1.length > 0 && <div>🥇 {wave1.length} Wave 1</div>}
                      {wave2.length > 0 && <div>🥈 {wave2.length} Wave 2</div>}
                      {wave3.length > 0 && <div>🥉 {wave3.length} Wave 3</div>}
                    </div>
                  </div>

                  {/* Wave 1 header + first visible cards */}
                  {wave1.length > 0 && (
                    <div className="wave-header" style={{ background: WAVE_CONFIG[1].bg, color: WAVE_CONFIG[1].color, border: `1px solid ${WAVE_CONFIG[1].border}` }}>
                      🥇 Wave 1 — Best Matches
                      <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 'auto', opacity: 0.8 }}>{wave1.length} agencies</span>
                    </div>
                  )}

                  {/* First 3 visible cards */}
                  {visibleAgencies.map((a, i) => (
                    <AgencyCard key={i} agency={a} index={i} blurred={false} showContact />
                  ))}

                  {/* Gate */}
                  <div className="gate-box">
                    <div className="gate-count">+{hiddenCount} more</div>
                    <div className="gate-title">Unlock the full agency list</div>
                    <div className="gate-sub">
                      Get all {agencies.length || 28} agencies with clickable websites, phone numbers, and wave ratings.
                      {wave2.length > 0 && ` Includes ${wave2.length} Wave 2 and ${wave3.length} Wave 3 agencies.`}
                    </div>
                    <button className="btn-cta" style={{ marginTop: 0 }} onClick={() => setStep(4)}>
                      📥 Get Full List — Free
                    </button>
                  </div>

                  {/* 2 blurred below gate */}
                  {blurredAgencies.map((a, i) => (
                    <AgencyCard key={`b${i}`} agency={a} index={PREVIEW_COUNT + i} blurred />
                  ))}
                </>
              )}
            </>
          )}

          {/* ─── STEP 4: Lead capture ──────────────────────────────────── */}
          {step === 4 && intent && (
            <>
              <div className="form-title">
                Almost there — get your list 📬
              </div>
              <div className="form-sub">
                We'll email you all {agencies.length || 28} agencies with websites, phones, and wave ranking. Your file downloads instantly.
              </div>

              <div className="pill-row">
                {ic && <span className="pill">{ic.icon} {ic.label}</span>}
                {propType && <span className="pill">🏠 {propType}</span>}
                <span className="pill">📍 {city ? `${city}, ` : ''}{country}</span>
                <span className="pill">💶 {intent.includes('rent') ? `€${price}/mo` : `€${price}`}</span>
                <span className="pill">🏢 {agencies.length || 28} agencies</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Email address <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Phone <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', fontSize: 11, letterSpacing: 0 }}>optional — for agency callbacks</span></label>
                  <input type="tel" placeholder="+1 234 567 890" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                </div>

                <label className="consent-wrap">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                  <span className="consent-text">
                    I agree to receive the agency list and market updates from PropBlaze.
                    Unsubscribe anytime. No spam. <a href="/privacy" style={{ color: '#F59E0B', textDecoration: 'none' }}>Privacy policy</a>
                  </span>
                </label>

                <button type="submit" className="btn-cta" disabled={!email || !consent || submitting}>
                  {submitting ? 'Preparing...' : `⬇️ Download ${agencies.length || 28} Agencies (CSV + Email)`}
                </button>
              </form>

              <div className="trust" style={{ marginTop: 16 }}>
                <div className="trust-item">🔒 GDPR compliant</div>
                <div className="trust-item">📧 Instant delivery</div>
                <div className="trust-item">🚫 No spam</div>
              </div>
            </>
          )}

          {/* ─── STEP 5: Success + Full List ───────────────────────────── */}
          {step === 5 && (
            <>
              <div className="success-hero">
                <span className="success-emoji">✅</span>
                <div className="success-title">Your list is ready!</div>
                <div className="success-sub">
                  File downloaded to your device.<br />
                  Copy also sent to <strong>{email}</strong>
                  {agencies.length > 0 && <><br />{agencies.length} agencies with full contact details.</>}
                </div>
              </div>

              <div className="offer-box">
                <div className="offer-tag">⚡ Early Bird — Limited Spots</div>
                <div className="offer-title">PropBlaze Pro — 12 Months Access</div>
                <div className="offer-desc">
                  Automate outreach to all {agencies.length || 28} agencies with one click. Track responses, manage inquiries from a dashboard. Refresh your list weekly.
                </div>
                <div className="offer-price-row">
                  <span className="offer-price">€50</span>
                  <span className="offer-orig">€197</span>
                </div>
                <div className="offer-period">12 months · one payment · cancel anytime</div>
                <ul className="offer-feats">
                  <li>Unlimited agency searches across 30+ countries</li>
                  <li>AI outreach to all matched agencies (1-click)</li>
                  <li>Response tracking dashboard</li>
                  <li>Weekly list refresh & new agency alerts</li>
                  <li>Priority support</li>
                </ul>
                <button className="btn-cta" style={{ marginTop: 4 }}
                  onClick={() => window.location.href = '/register?plan=annual-promo'}>
                  🚀 Get 12 Months for €50
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/register'}>
                  Start free instead
                </button>
              </div>

              {/* Full agency list grouped by wave */}
              {agencies.length > 0 && (
                <>
                  <hr className="divider" />

                  {wave1.length > 0 && (
                    <>
                      <div className="wave-header" style={{
                        background: WAVE_CONFIG[1].bg,
                        color: WAVE_CONFIG[1].color,
                        border: `1px solid ${WAVE_CONFIG[1].border}`,
                      }}>
                        🥇 Wave 1 — Best Matches
                        <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 'auto', opacity: 0.8 }}>{wave1.length} agencies</span>
                      </div>
                      {wave1.map((a, i) => <AgencyCard key={`w1-${i}`} agency={a} index={i} showContact />)}
                    </>
                  )}

                  {wave2.length > 0 && (
                    <>
                      <div className="wave-header" style={{
                        background: WAVE_CONFIG[2].bg,
                        color: WAVE_CONFIG[2].color,
                        border: `1px solid ${WAVE_CONFIG[2].border}`,
                      }}>
                        🥈 Wave 2 — Strong Matches
                        <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 'auto', opacity: 0.8 }}>{wave2.length} agencies</span>
                      </div>
                      {wave2.map((a, i) => <AgencyCard key={`w2-${i}`} agency={a} index={wave1.length + i} showContact />)}
                    </>
                  )}

                  {wave3.length > 0 && (
                    <>
                      <div className="wave-header" style={{
                        background: WAVE_CONFIG[3].bg,
                        color: WAVE_CONFIG[3].color,
                        border: `1px solid ${WAVE_CONFIG[3].border}`,
                      }}>
                        🥉 Wave 3 — Good Matches
                        <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 'auto', opacity: 0.8 }}>{wave3.length} agencies</span>
                      </div>
                      {wave3.map((a, i) => <AgencyCard key={`w3-${i}`} agency={a} index={wave1.length + wave2.length + i} showContact />)}
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}
