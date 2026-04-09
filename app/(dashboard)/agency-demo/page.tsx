'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Mock incoming offers from property owners ─────────────────────────────
const INCOMING_OFFERS = [
  {
    id: 'offer-001',
    ref: 'PB-2026-0041',
    received: '2026-04-07T09:14:00Z',
    property: {
      type: 'Villa',
      icon: '🏡',
      address: 'Jadranska bb 14, Budva',
      country: 'Montenegro',
      area_sqm: 210,
      bedrooms: 4,
      bathrooms: 3,
      year_built: 2019,
      price: 485000,
      currency: 'EUR',
      condition: 'Excellent',
      description: 'Sea-view villa with pool and landscaped garden. 210 m². Fully furnished. Private road access. Quiet upscale neighbourhood 400m from the beach.',
      photos: 12,
      has_docs: true,
      target_buyers: ['Investor', 'Foreign buyer', 'Luxury'],
    },
    owner: {
      name: 'A. Petrov',
      country: 'Russia',
      language: 'RU',
      response_within: '2h',
    },
    match: {
      score: 94,
      reasons: ['Geo match: Budva ✓', 'Luxury segment ✓', 'Price band €400K+ ✓', 'Russian buyer target ✓'],
      wave: 1,
    },
    status: 'new',
  },
  {
    id: 'offer-002',
    ref: 'PB-2026-0038',
    received: '2026-04-06T16:30:00Z',
    property: {
      type: 'Apartment',
      icon: '🏢',
      address: 'Knez Mihailova 28, Belgrade',
      country: 'Serbia',
      area_sqm: 68,
      bedrooms: 2,
      bathrooms: 1,
      year_built: 2015,
      price: 127000,
      currency: 'EUR',
      condition: 'Good',
      description: 'City centre apartment. 68 m². Renovated 2023. High floor with partial river view. Walking distance to main square and business district.',
      photos: 8,
      has_docs: true,
      target_buyers: ['Local buyer', 'Investor', 'Expat'],
    },
    owner: {
      name: 'M. Jovanović',
      country: 'Serbia',
      language: 'SR',
      response_within: '4h',
    },
    match: {
      score: 87,
      reasons: ['Geo match: Belgrade ✓', 'Residential segment ✓', 'Price band €100–150K ✓', 'Serbian market ✓'],
      wave: 1,
    },
    status: 'viewed',
  },
  {
    id: 'offer-003',
    ref: 'PB-2026-0035',
    received: '2026-04-05T11:00:00Z',
    property: {
      type: 'Penthouse',
      icon: '🌆',
      address: 'Bulevar Svetog Petra 7, Podgorica',
      country: 'Montenegro',
      area_sqm: 145,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2022,
      price: 295000,
      currency: 'EUR',
      condition: 'New',
      description: 'Top-floor penthouse in newly built complex. 145 m² + 35 m² roof terrace. City view. Two underground parking spaces. Smart home system.',
      photos: 15,
      has_docs: true,
      target_buyers: ['Investor', 'Relocation', 'Premium'],
    },
    owner: {
      name: 'D. Nikolić',
      country: 'Montenegro',
      language: 'SR',
      response_within: '1h',
    },
    match: {
      score: 81,
      reasons: ['Geo match: Montenegro ✓', 'New build ✓', 'Price band €250–350K ✓'],
      wave: 2,
    },
    status: 'responded',
  },
];

type OfferStatus = 'new' | 'viewed' | 'responded' | 'declined';

const STATUS_CFG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  new:       { label: 'New offer',   color: 'var(--primary)', bg: 'var(--primary-light)' },
  viewed:    { label: 'Viewed',      color: 'var(--blue)', bg: 'var(--blue-light)' },
  responded: { label: 'Responded',   color: 'var(--green)', bg: 'var(--green-light)' },
  declined:  { label: 'Declined',    color: 'var(--text-tertiary)', bg: 'var(--surface-2)' },
};

function ScoreDot({ score }: { score: number }) {
  const color = score >= 90 ? '#4ade80' : score >= 80 ? '#e67e22' : '#fbbf24';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="3"/>
        <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(score / 100) * 100.53} 100.53`}
          strokeLinecap="round" transform="rotate(-90 18 18)"/>
        <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{score}</text>
      </svg>
    </div>
  );
}

function OfferCard({ offer, onExpand }: { offer: typeof INCOMING_OFFERS[0]; onExpand: () => void }) {
  const st = STATUS_CFG[offer.status as OfferStatus];
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${offer.status === 'new' ? 'rgba(230,126,34,0.3)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 14, overflow: 'hidden', transition: 'border 0.2s',
      boxShadow: offer.status === 'new' ? '0 0 0 1px rgba(230,126,34,0.1)' : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '1.5rem' }}>{offer.property.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {offer.property.type} · {offer.property.area_sqm} m²
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {offer.property.address}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600, color: st.color, background: st.bg }}>
            {st.label}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            {offer.ref}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
        {/* Left: property info */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {[
              { icon: '💶', label: `€${offer.property.price.toLocaleString()}` },
              { icon: '🛏', label: `${offer.property.bedrooms} bed` },
              { icon: '📐', label: `${offer.property.area_sqm} m²` },
              { icon: '🏗', label: offer.property.condition },
              { icon: '📸', label: `${offer.property.photos} photos` },
              { icon: '📄', label: offer.property.has_docs ? 'Docs ✓' : 'No docs' },
            ].map(i => (
              <span key={i.icon} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {i.icon} {i.label}
              </span>
            ))}
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {offer.property.description}
          </p>

          {/* AI match reasons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {offer.match.reasons.map(r => (
              <span key={r} style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                {r}
              </span>
            ))}
          </div>

          {/* Owner info (anonymized) */}
          <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary),0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>👤</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Owner: <strong style={{ color: 'var(--text-secondary)' }}>●●●</strong> (revealed after contact)
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                From {offer.owner.country} · Speaks {offer.owner.language} · Responds in {offer.owner.response_within}
              </div>
            </div>
          </div>
        </div>

        {/* Right: match score + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 100 }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreDot score={offer.match.score} />
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Match score
            </div>
            <div style={{ fontSize: '0.65rem', color: '#e67e22', marginTop: 2 }}>
              Wave {offer.match.wave}
            </div>
          </div>

          {offer.status !== 'responded' && offer.status !== 'declined' && (
            <button onClick={onExpand} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#c0392b,#e67e22)',
              color: 'var(--text)', fontWeight: 700, fontSize: '0.75rem',
              boxShadow: '0 3px 12px linear-gradient(135deg, var(--primary),0.3)', whiteSpace: 'nowrap',
            }}>
              Respond →
            </button>
          )}
          {offer.status === 'responded' && (
            <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600 }}>✓ Responded</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 18px', borderTop: '1px solid var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--border)' }}>
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 3.5V6.5L7.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          Received {new Date(offer.received).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--border)' }}>
          ⏰ Offer expires in 5 days
        </span>
      </div>
    </div>
  );
}

// ─── Respond modal ─────────────────────────────────────────────────────────────
function RespondModal({ offer, onClose }: { offer: typeof INCOMING_OFFERS[0]; onClose: () => void }) {
  const [msg, setMsg] = useState(`Hello,\n\nWe are interested in ${offer.property.type.toLowerCase()} at ${offer.property.address}.\n\nWe specialize in this area and have active buyer base that matches your requirements.\n\nPlease contact us to discuss further.\n\nBest regards,`);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Response sent!</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>The property owner will be notified. Contact details will be shared after mutual confirmation.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Respond to offer {offer.ref}</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(230,126,34,0.07)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: 9, marginBottom: 16, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#e67e22' }}>📋 {offer.property.type}</strong> · {offer.property.address} · €{offer.property.price.toLocaleString()}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your message to the property owner
              </label>
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={7}
                style={{
                  width: '100%', padding: '10px 13px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9, color: 'var(--text)', fontSize: '0.8125rem', outline: 'none',
                  resize: 'vertical', lineHeight: 1.6,
                }}
              />
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              🔒 Owner's contact details are shared only after they accept your response. Your agency ID (PB-AG) is used until then.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSend} style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 3px 12px linear-gradient(135deg, var(--primary),0.3)' }}>
                Send Response →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AgencyDemoPage() {
  const [activeOffer, setActiveOffer] = useState<string | null>(null);

  const selectedOffer = INCOMING_OFFERS.find(o => o.id === activeOffer);

  const newCount = INCOMING_OFFERS.filter(o => o.status === 'new').length;

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Demo banner */}
      <div style={{ marginBottom: 20, padding: '8px 16px', background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
        <span style={{ fontSize: '1rem' }}>🏢</span>
        <span style={{ color: '#e67e22', fontWeight: 600 }}>Agency Demo Mode</span>
        <span style={{ color: 'var(--text-tertiary)' }}>— this is how your agency portal looks when matched to property owners</span>
        <div style={{ flex: 1 }} />
        <Link href="/register?role=agency" style={{ padding: '5px 12px', borderRadius: 7, background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'var(--text)', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
          Register Agency →
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Incoming Property Offers
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {INCOMING_OFFERS.length} offers matched to your agency · {newCount} new
          </p>
        </div>

        {/* Agency stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Match score', value: '89/100', icon: '🎯', color: '#4ade80' },
            { label: 'Response rate', value: '94%',    icon: '⚡', color: '#e67e22' },
            { label: 'Conversions',  value: '12',      icon: '🏆', color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agency ID badge */}
      <div style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Your PropBlaze Agency ID:</span>
        <code style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e67e22', letterSpacing: '0.05em', background: 'rgba(230,126,34,0.08)', padding: '2px 8px', borderRadius: 5 }}>PB-AG-DEMO-0001</code>
        <span style={{ fontSize: '0.7rem', color: 'var(--border)' }}>· Used in all offers until contact is confirmed</span>
      </div>

      {/* Offer cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {INCOMING_OFFERS.map(offer => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onExpand={() => setActiveOffer(offer.id)}
          />
        ))}
      </div>

      {/* Respond modal */}
      {selectedOffer && (
        <RespondModal offer={selectedOffer} onClose={() => setActiveOffer(null)} />
      )}
    </div>
  );
}
