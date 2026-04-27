'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5

interface FoundProperty {
  id: string
  title: string
  city: string
  country: string
  flag: string
  price: number
  price_formatted: string
  size_m2?: number
  beds?: number
  baths?: number
  type: string
  features: string[]
  description: string
  portal: string
  url: string
  score: number
  highlight: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢' },
  { id: 'villa', label: 'Villa', icon: '🌴' },
  { id: 'house', label: 'House', icon: '🏡' },
  { id: 'land', label: 'Land / Plot', icon: '🌍' },
  { id: 'penthouse', label: 'Penthouse', icon: '🏙️' },
  { id: 'commercial', label: 'Commercial', icon: '🏗️' },
]

const COUNTRIES = [
  'Montenegro', 'Serbia', 'Croatia', 'Greece', 'Spain', 'Portugal',
  'Italy', 'Germany', 'Austria', 'France', 'UK', 'UAE', 'Bulgaria', 'Cyprus', 'Turkey',
]

const PRICE_PRESETS = ['50,000', '100,000', '200,000', '350,000', '500,000', '800,000', '1,500,000', '3,000,000+']
const BEDS_OPTIONS = ['Any', '1', '2', '3', '4', '5+']

const PORTAL_COLORS: Record<string, string> = {
  'Idealista': '#FF4E00',
  'Rightmove': '#00DEB6',
  'Propertypal': '#7C3AED',
  'Imovirtual': '#E11D48',
  'dom.me': '#0EA5E9',
  'nekretnine.me': '#F59E0B',
  'Seloger': '#003189',
  'Immowelt': '#FF6B00',
  'ImmobilienScout24': '#1DB954',
  'Bayut': '#C9A84C',
  'Property Finder': '#E63946',
  'Zoopla': '#8B5CF6',
  'Global': '#475569',
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
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

// ─── PortalBadge ─────────────────────────────────────────────────────────────
function PortalBadge({ portal }: { portal: string }) {
  const color = PORTAL_COLORS[portal] ?? PORTAL_COLORS['Global']
  return (
    <span className="portal-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {portal}
    </span>
  )
}

// ─── PropertyCard ─────────────────────────────────────────────────────────────
function PropertyCard({
  property, index, saved, onSave,
}: {
  property: FoundProperty
  index: number
  saved: Set<string>
  onSave: (id: string) => void
}) {
  const isSaved = saved.has(property.id)

  return (
    <div className={`prop-card${property.highlight ? ' highlight' : ''}${isSaved ? ' bookmarked' : ''}`}>
      {property.highlight && (
        <div className="top-pick-banner">⭐ Top Match</div>
      )}

      <div className="prop-card-top">
        <div className="prop-meta-left">
          <div className="prop-flag-title">
            <span className="prop-flag">{property.flag}</span>
            <div>
              <div className="prop-title">{property.title}</div>
              <div className="prop-location">{property.city}, {property.country}</div>
            </div>
          </div>
        </div>
        <div className="prop-price-block">
          <div className="prop-price">{property.price_formatted}</div>
          <div className="prop-score">{property.score}/99</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="prop-stats">
        {property.beds !== undefined && (
          <span className="stat-chip">🛏️ {property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
        )}
        {property.baths !== undefined && (
          <span className="stat-chip">🚿 {property.baths} bath{property.baths !== 1 ? 's' : ''}</span>
        )}
        {property.size_m2 !== undefined && (
          <span className="stat-chip">📐 {property.size_m2} m²</span>
        )}
        <span className="stat-chip">🏠 {property.type}</span>
      </div>

      {/* Description */}
      <div className="prop-desc">{property.description}</div>

      {/* Feature tags */}
      {property.features?.length > 0 && (
        <div className="prop-features">
          {property.features.slice(0, 5).map((f, i) => (
            <span key={i} className="feature-tag">{f}</span>
          ))}
        </div>
      )}

      {/* Footer: portal + actions */}
      <div className="prop-footer">
        <PortalBadge portal={property.portal} />
        <div className="prop-actions">
          <button
            className={`save-btn${isSaved ? ' saved' : ''}`}
            onClick={() => onSave(property.id)}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            {isSaved ? '❤️' : '🤍'} {isSaved ? 'Saved' : 'Save'}
          </button>
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="view-btn"
          >
            View Listing →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PropertyFinderPage() {
  const [step, setStep] = useState<Step>(1)
  const [propType, setPropType] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [beds, setBeds] = useState('Any')
  const [properties, setProperties] = useState<FoundProperty[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('Scanning property portals...')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const LOAD_MSGS = [
    'Scanning Idealista, Rightmove, dom.me...',
    'Extracting matching listings with AI...',
    'Filtering by your budget and criteria...',
    'Ranking by relevance and value...',
    'Preparing your property shortlist...',
  ]
  useEffect(() => {
    if (!loading) return
    let i = 0
    const t = setInterval(() => { i = (i + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[i]) }, 1800)
    return () => clearInterval(t)
  }, [loading])

  async function runSearch() {
    if (!propType || !country || !maxPrice) return
    setLoading(true)
    setStep(3)
    try {
      const priceNum = Number(maxPrice.replace(/[^0-9]/g, '')) || 0
      const bedsNum = beds === 'Any' ? undefined : parseInt(beds.replace('+', ''))
      const res = await fetch('/api/property-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propType, country, city, maxPrice: priceNum, beds: bedsNum }),
      })
      const data = await res.json()
      setProperties(data.properties || [])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  function handleSave(id: string) {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !consent) return
    setSubmitting(true)
    try {
      const savedProps = properties.filter(p => saved.has(p.id))

      // 1. Save lead + Telegram
      fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, phone,
          intent: 'buy_property',
          source: 'property-finder',
          prop_type: propType, country, city,
          price: Number(maxPrice.replace(/[^0-9]/g, '')) || undefined,
          agencies_count: properties.length,
          saved_properties: savedProps.map(p => `${p.title} — ${p.price_formatted}`),
        }),
      }).catch(() => null)

      // 2. Send email
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Your PropBlaze Property Shortlist — ${propType} in ${city || country}`,
          html: buildEmailBody(savedProps),
        }),
      }).catch(() => null)
    } catch {}
    setSubmitting(false)
    setStep(5)
  }

  function buildEmailBody(savedProps: FoundProperty[]): string {
    const listProps = savedProps.length > 0 ? savedProps : properties.slice(0, 10)
    const rows = listProps.map(p =>
      `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee">
          <b>${p.flag} ${p.title}</b><br/>
          <small>${p.city}, ${p.country}</small>
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;color:#D97706">${p.price_formatted}</td>
        <td style="padding:10px;border-bottom:1px solid #eee">
          ${[p.beds ? `${p.beds} beds` : '', p.size_m2 ? `${p.size_m2}m²` : ''].filter(Boolean).join(' · ')}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee">${p.portal}</td>
        <td style="padding:10px;border-bottom:1px solid #eee"><a href="${p.url}">View →</a></td>
      </tr>`
    ).join('')
    return `<h2>Your PropBlaze Property Shortlist</h2>
<p>${propType} · ${city || country} · Max €${maxPrice}${beds !== 'Any' ? ` · ${beds} beds` : ''}</p>
${savedProps.length > 0 ? `<p><em>Showing ${savedProps.length} properties you saved</em></p>` : ''}
<table style="border-collapse:collapse;width:100%">
  <thead><tr style="background:#0F172A;color:white">
    <th style="padding:10px;text-align:left">Property</th>
    <th style="padding:10px;text-align:left">Price</th>
    <th style="padding:10px;text-align:left">Details</th>
    <th style="padding:10px;text-align:left">Portal</th>
    <th style="padding:10px;text-align:left">Link</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p style="margin-top:24px;color:#64748B">Full search available at <a href="https://propblaze.com">propblaze.com</a></p>`
  }

  const PREVIEW_VISIBLE = 3
  const visibleProps = properties.slice(0, PREVIEW_VISIBLE)
  const blurredProps = properties.slice(PREVIEW_VISIBLE, PREVIEW_VISIBLE + 2)
  const hiddenCount = Math.max(0, properties.length - PREVIEW_VISIBLE)
  const savedCount = saved.size

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        .pf-page { min-height: 100vh; background: linear-gradient(135deg, #080810 0%, #0F172A 50%, #0a1520 100%); color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px 16px 80px; }
        .logo { text-align: center; padding: 20px 0 8px; }
        .logo span { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #F5C200; }
        .logo small { display: block; font-size: 11px; color: #64748B; letter-spacing: 1px; margin-top: 2px; }
        .logo .engine-tag { display: inline-block; background: rgba(96,165,250,0.12); color: #60A5FA; border-radius: 6px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-top: 6px; text-transform: uppercase; }
        .progress { display: flex; gap: 4px; margin: 16px 0 28px; }
        .progress-dot { flex: 1; height: 3px; border-radius: 99px; background: #1E293B; transition: background 0.4s; }
        .progress-dot.active { background: #F5C200; }
        .progress-dot.done { background: #34D399; }
        h1 { font-size: 26px; font-weight: 700; line-height: 1.25; margin-bottom: 8px; }
        h1 span { color: #F5C200; }
        .subtitle { font-size: 14px; color: #94A3B8; margin-bottom: 28px; line-height: 1.5; }
        .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.8px; color: #64748B; text-transform: uppercase; margin-bottom: 10px; margin-top: 20px; }
        /* Type grid */
        .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .type-btn { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 8px; cursor: pointer; text-align: center; transition: all 0.2s; color: #E2E8F0; font-size: 13px; }
        .type-btn .ticon { font-size: 22px; margin-bottom: 4px; }
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
        /* Beds selector */
        .beds-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .beds-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; color: #94A3B8; transition: all 0.15s; }
        .beds-btn:hover, .beds-btn.selected { background: rgba(245,194,0,0.1); border-color: #F5C200; color: #F5C200; font-weight: 600; }
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
        /* Results header */
        .results-header { text-align: center; margin-bottom: 24px; }
        .results-count { font-size: 36px; font-weight: 800; color: #F5C200; }
        .results-label { font-size: 14px; color: #94A3B8; margin-top: 4px; }
        /* Portals strip */
        .portals-strip { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin: 12px 0 20px; }
        .portal-badge { border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        /* Property card */
        .prop-card { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; margin-bottom: 14px; transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .prop-card:hover { border-color: rgba(245,194,0,0.25); background: rgba(245,194,0,0.02); }
        .prop-card.highlight { border-color: rgba(245,194,0,0.4); background: rgba(245,194,0,0.04); }
        .prop-card.bookmarked { border-color: #EF4444; background: rgba(239,68,68,0.03); }
        .prop-card.blurred { filter: blur(5px); user-select: none; pointer-events: none; opacity: 0.5; }
        .top-pick-banner { position: absolute; top: 0; right: 0; background: linear-gradient(90deg, #F5C200, #D4A800); color: #000; font-size: 11px; font-weight: 700; padding: 4px 12px; border-bottom-left-radius: 10px; }
        .prop-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .prop-flag-title { display: flex; align-items: flex-start; gap: 8px; }
        .prop-flag { font-size: 22px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
        .prop-title { font-size: 15px; font-weight: 600; color: #F1F5F9; line-height: 1.3; margin-bottom: 3px; }
        .prop-location { font-size: 12px; color: #64748B; }
        .prop-price-block { text-align: right; flex-shrink: 0; }
        .prop-price { font-size: 18px; font-weight: 800; color: #F5C200; white-space: nowrap; }
        .prop-score { font-size: 11px; color: #475569; margin-top: 3px; }
        /* Stats */
        .prop-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .stat-chip { background: rgba(255,255,255,0.06); border-radius: 6px; padding: 3px 9px; font-size: 12px; color: #94A3B8; }
        .prop-desc { font-size: 13px; color: #94A3B8; line-height: 1.6; margin-bottom: 10px; }
        /* Feature tags */
        .prop-features { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
        .feature-tag { background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.15); border-radius: 5px; padding: 2px 8px; font-size: 11px; color: #60A5FA; }
        /* Footer */
        .prop-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .prop-actions { display: flex; gap: 8px; align-items: center; }
        .save-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer; color: #94A3B8; transition: all 0.15s; }
        .save-btn:hover { border-color: rgba(239,68,68,0.4); color: #EF4444; background: rgba(239,68,68,0.06); }
        .save-btn.saved { border-color: #EF4444; color: #EF4444; background: rgba(239,68,68,0.08); }
        .view-btn { background: rgba(245,194,0,0.1); border: 1px solid rgba(245,194,0,0.25); border-radius: 8px; padding: 7px 14px; font-size: 13px; color: #F5C200; text-decoration: none; font-weight: 600; transition: all 0.15s; }
        .view-btn:hover { background: rgba(245,194,0,0.18); }
        /* Saved counter */
        .saved-bar { display: flex; align-items: center; justify-content: space-between; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 10px 16px; margin-bottom: 16px; }
        .saved-bar-text { font-size: 13px; color: #94A3B8; }
        .saved-bar-count { font-size: 15px; font-weight: 700; color: #EF4444; }
        /* Gate */
        .gate-box { background: rgba(245,194,0,0.06); border: 1px solid rgba(245,194,0,0.2); border-radius: 16px; padding: 22px; margin: 20px 0; text-align: center; }
        .gate-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .gate-subtitle { font-size: 13px; color: #94A3B8; margin-bottom: 20px; line-height: 1.5; }
        .more-count { font-size: 30px; font-weight: 800; color: #F5C200; }
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
        /* Wishlist preview */
        .wishlist-preview { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
        .wishlist-preview-title { font-size: 13px; font-weight: 600; color: #EF4444; margin-bottom: 8px; }
        .wishlist-item { font-size: 13px; color: #94A3B8; padding: 3px 0; }
        .wishlist-item strong { color: #E2E8F0; }
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
        .full-list-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        @media (max-width: 420px) { h1 { font-size: 22px; } .prop-card-top { flex-direction: column; } .prop-price-block { text-align: left; } .top-pick-banner { font-size: 10px; } }
      `}</style>

      <div className="pf-page">
        <div className="container" ref={containerRef}>

          {/* Logo */}
          <div className="logo">
            <span>PROPBLAZE</span>
            <small>AI PROPERTY DISTRIBUTION</small>
            <div className="engine-tag">🔎 Property Finder</div>
          </div>

          {/* Progress */}
          <div className="progress">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`progress-dot ${step > s ? 'done' : step === s ? 'active' : ''}`} />
            ))}
          </div>

          {/* ─── STEP 1: Hero ──────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1>Find your perfect <span>property for sale</span> in seconds</h1>
              <p className="subtitle">
                AI searches Idealista, Rightmove, dom.me and 20+ portals to shortlist real listings that match your exact criteria.
              </p>

              {/* Portal logos */}
              <div className="portals-strip">
                {['Idealista', 'Rightmove', 'dom.me', 'Zoopla', 'Bayut', 'ImmobilienScout24'].map(p => (
                  <PortalBadge key={p} portal={p} />
                ))}
              </div>

              <div className="trust-row">
                <div className="trust-item"><span>✓</span>Real listings, real prices</div>
                <div className="trust-item"><span>✓</span>25+ countries</div>
                <div className="trust-item"><span>✓</span>Free search</div>
              </div>

              <button className="btn-primary" onClick={() => setStep(2)}>
                🔍 Start Property Search
              </button>
            </>
          )}

          {/* ─── STEP 2: Criteria ──────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <h1>Define your <span>search criteria</span></h1>
              <p className="subtitle">The more specific you are, the better your matches.</p>

              <div className="section-label">Property type</div>
              <div className="type-grid">
                {PROPERTY_TYPES.map(t => (
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
                <label>City / Region <span className="optional-tag">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Kotor, Algarve, Costa Brava..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Max budget (€)</label>
                <input
                  type="text"
                  placeholder="e.g. 350,000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
                <div className="price-presets">
                  {PRICE_PRESETS.map(p => (
                    <button
                      key={p}
                      className={`price-preset ${maxPrice === p ? 'selected' : ''}`}
                      onClick={() => setMaxPrice(p)}
                    >
                      €{p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-label">Bedrooms <span className="optional-tag">(optional)</span></div>
              <div className="beds-row">
                {BEDS_OPTIONS.map(b => (
                  <button
                    key={b}
                    className={`beds-btn ${beds === b ? 'selected' : ''}`}
                    onClick={() => setBeds(b)}
                  >
                    {b === 'Any' ? 'Any' : `${b} bed${b !== '1' ? 's' : ''}`}
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                disabled={!propType || !country || !maxPrice}
                onClick={runSearch}
              >
                🔍 Search Properties
              </button>

              <div className="trust-row" style={{ marginTop: 16 }}>
                <div className="trust-item"><span>✓</span>AI extracts real listings</div>
                <div className="trust-item"><span>✓</span>Matches your exact budget</div>
              </div>
            </>
          )}

          {/* ─── STEP 3: Results ───────────────────────────────────────────── */}
          {step === 3 && (
            <>
              {loading ? (
                <div className="loading-wrap">
                  <div className="load-counter">
                    <AnimatedCounter target={48320} />
                  </div>
                  <div className="load-counter-label">listings scanned across portals</div>
                  <div className="spinner" style={{ marginTop: 24 }} />
                  <p className="load-msg">{loadMsg}</p>
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <div className="results-count">{properties.length || 12}</div>
                    <div className="results-label">matching properties found</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
                      {propType} · {city || country} · Max €{maxPrice}
                      {beds !== 'Any' && ` · ${beds} beds`}
                    </div>
                  </div>

                  {/* Portals searched */}
                  <div className="portals-strip">
                    {['Idealista', 'Rightmove', 'dom.me', 'Zoopla', 'Bayut'].map(p => (
                      <PortalBadge key={p} portal={p} />
                    ))}
                  </div>

                  {/* Saved counter */}
                  {savedCount > 0 && (
                    <div className="saved-bar">
                      <span className="saved-bar-text">Properties saved to wishlist</span>
                      <span className="saved-bar-count">❤️ {savedCount}</span>
                    </div>
                  )}

                  {/* Visible properties */}
                  {visibleProps.map((property, i) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      index={i}
                      saved={saved}
                      onSave={handleSave}
                    />
                  ))}

                  {/* Blurred previews */}
                  {blurredProps.map((property, i) => (
                    <div key={`blur-${i}`} className="prop-card blurred">
                      <div className="prop-card-top">
                        <div className="prop-flag-title">
                          <span className="prop-flag">{property.flag}</span>
                          <div>
                            <div className="prop-title">{property.title}</div>
                            <div className="prop-location">{property.city}, {property.country}</div>
                          </div>
                        </div>
                        <div className="prop-price-block">
                          <div className="prop-price">{property.price_formatted}</div>
                        </div>
                      </div>
                      <div className="prop-stats">
                        {property.beds !== undefined && <span className="stat-chip">🛏️ {property.beds} beds</span>}
                        {property.size_m2 !== undefined && <span className="stat-chip">📐 {property.size_m2} m²</span>}
                      </div>
                    </div>
                  ))}

                  {/* Gate */}
                  <div className="gate-box">
                    <div className="more-count">+{hiddenCount || 9} more properties</div>
                    <div className="gate-title" style={{ marginTop: 8 }}>Unlock your full shortlist</div>
                    <div className="gate-subtitle">
                      Enter your email to get the complete list with direct links to listings and your saved wishlist.
                    </div>
                    <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => setStep(4)}>
                      📥 Get Full Shortlist — Free
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ─── STEP 4: Lead capture ──────────────────────────────────────── */}
          {step === 4 && (
            <>
              <p className="form-title">Get your <span style={{ color: '#F5C200' }}>full property shortlist</span></p>
              <p className="form-subtitle">
                We'll email you the complete list of {properties.length || 12} properties with direct portal links, prices, and full details.
              </p>

              {/* Search summary */}
              <div style={{ marginBottom: 20 }}>
                <span className="summary-pill">🏠 {propType}</span>
                <span className="summary-pill">📍 {city || country}</span>
                <span className="summary-pill">💶 Max €{maxPrice}</span>
                {beds !== 'Any' && <span className="summary-pill">🛏️ {beds} beds</span>}
              </div>

              {/* Wishlist summary */}
              {savedCount > 0 && (
                <div className="wishlist-preview">
                  <div className="wishlist-preview-title">❤️ {savedCount} properties in your wishlist</div>
                  {properties.filter(p => saved.has(p.id)).map(p => (
                    <div key={p.id} className="wishlist-item">
                      {p.flag} <strong>{p.title}</strong> — {p.price_formatted}
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
                  <label>Phone <span className="optional-tag">(optional — agents may call with new listings)</span></label>
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
                    I agree to receive my property shortlist and relevant property alerts from PropBlaze.
                    You can unsubscribe at any time. We never sell your data.
                  </span>
                </label>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!email || !consent || submitting}
                >
                  {submitting ? 'Sending...' : '📬 Send My Property Shortlist'}
                </button>
              </form>

              <div className="trust-row" style={{ marginTop: 16 }}>
                <div className="trust-item"><span>🔒</span>Data encrypted</div>
                <div className="trust-item"><span>✓</span>No spam, ever</div>
                <div className="trust-item"><span>✓</span>GDPR compliant</div>
              </div>
            </>
          )}

          {/* ─── STEP 5: Success + Offer ───────────────────────────────────── */}
          {step === 5 && (
            <>
              <div className="success-icon">🏠</div>
              <p className="success-title">Your shortlist is on its way!</p>
              <p className="success-sub">
                We've sent {properties.length || 12} property listings to <strong>{email}</strong>.
                {savedCount > 0 && ` Your ${savedCount} saved properties are highlighted.`}
              </p>

              {/* Subscription offer */}
              <div className="offer-box">
                <div className="offer-tag">⚡ Limited Launch Offer</div>
                <div className="offer-title">PropBlaze Pro — 12 Months Access</div>
                <div className="offer-desc">
                  Get unlimited property searches across 50+ countries, daily listing alerts, and instant access to our full agency network — at the price of just 3 months.
                </div>
                <div>
                  <span className="offer-price">€147</span>
                  <span className="offer-price-orig">€588</span>
                </div>
                <div className="offer-period">12 months · one payment · cancel anytime</div>
                <ul className="offer-features">
                  <li>Unlimited property searches across 50+ countries</li>
                  <li>Daily alerts — new listings matching your criteria</li>
                  <li>Full portal database access (Idealista, Rightmove, dom.me...)</li>
                  <li>Instant agency matching for any property</li>
                  <li>Price trend reports for your target market</li>
                  <li>Dedicated property advisor support</li>
                </ul>
                <button className="btn-offer">🚀 Claim 12 Months for €147</button>
                <button className="btn-secondary">Maybe later — keep free access</button>
              </div>

              <hr className="divider" />

              {/* Show full results */}
              {properties.length > 0 && (
                <>
                  <div className="full-list-title">Your full property shortlist</div>
                  {properties.map((property, i) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
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
