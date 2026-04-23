'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#080808',
  card: '#111111',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(249,115,22,0.5)',
  text: '#ffffff',
  text2: 'rgba(255,255,255,0.5)',
  text3: 'rgba(255,255,255,0.25)',
  orange: '#f97316',
  red: '#dc2626',
  input: '#1a1a1a',
  inputBorder: 'rgba(255,255,255,0.1)',
  inputFocus: 'rgba(249,115,22,0.4)',
};

// ─── Options ───────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: 'apartment', label: '🏢 Apartment' },
  { id: 'villa', label: '🏡 Villa' },
  { id: 'house', label: '🏠 House' },
  { id: 'land', label: '🌿 Land' },
  { id: 'commercial', label: '🏪 Commercial' },
  { id: 'new_build', label: '🏗️ New Build' },
];

const PRICE_BANDS = [
  { id: 'budget', label: 'Budget', sub: '< €100K' },
  { id: 'mid', label: 'Mid', sub: '€100K–€500K' },
  { id: 'premium', label: 'Premium', sub: '€500K–€2M' },
  { id: 'luxury', label: 'Luxury', sub: '€2M–€10M' },
  { id: 'ultra', label: 'Ultra', sub: '€10M+' },
];

const BUYER_MARKETS = [
  { id: 'DE', label: '🇩🇪 Germany' },
  { id: 'AT', label: '🇦🇹 Austria' },
  { id: 'CH', label: '🇨🇭 Switzerland' },
  { id: 'NL', label: '🇳🇱 Netherlands' },
  { id: 'GB', label: '🇬🇧 United Kingdom' },
  { id: 'FR', label: '🇫🇷 France' },
  { id: 'IT', label: '🇮🇹 Italy' },
  { id: 'RU', label: '🇷🇺 Russia' },
  { id: 'UA', label: '🇺🇦 Ukraine' },
  { id: 'US', label: '🇺🇸 United States' },
  { id: 'CA', label: '🇨🇦 Canada' },
  { id: 'AE', label: '🇦🇪 UAE' },
  { id: 'SA', label: '🇸🇦 Saudi Arabia' },
  { id: 'SG', label: '🇸🇬 Singapore' },
  { id: 'CN', label: '🇨🇳 China' },
  { id: 'IL', label: '🇮🇱 Israel' },
  { id: 'PL', label: '🇵🇱 Poland' },
  { id: 'CZ', label: '🇨🇿 Czech Republic' },
  { id: 'SE', label: '🇸🇪 Sweden' },
  { id: 'NO', label: '🇳🇴 Norway' },
];

const LANGUAGES = [
  { id: 'en', label: '🇬🇧 English' },
  { id: 'de', label: '🇩🇪 German' },
  { id: 'ru', label: '🇷🇺 Russian' },
  { id: 'fr', label: '🇫🇷 French' },
  { id: 'it', label: '🇮🇹 Italian' },
  { id: 'es', label: '🇪🇸 Spanish' },
  { id: 'pt', label: '🇵🇹 Portuguese' },
  { id: 'ar', label: '🇸🇦 Arabic' },
  { id: 'zh', label: '🇨🇳 Chinese' },
  { id: 'sr', label: '🇷🇸 Serbian' },
  { id: 'hr', label: '🇭🇷 Croatian' },
  { id: 'pl', label: '🇵🇱 Polish' },
  { id: 'nl', label: '🇳🇱 Dutch' },
  { id: 'sv', label: '🇸🇪 Swedish' },
  { id: 'tr', label: '🇹🇷 Turkish' },
  { id: 'he', label: '🇮🇱 Hebrew' },
];

const SPECIALIZATIONS = [
  { id: 'residential', label: '🏘️ Residential' },
  { id: 'luxury', label: '💎 Luxury' },
  { id: 'investment', label: '📈 Investment' },
  { id: 'commercial', label: '🏪 Commercial' },
  { id: 'new_build', label: '🏗️ New Build' },
  { id: 'land', label: '🌿 Land & Plots' },
  { id: 'seaside', label: '🌊 Seaside' },
  { id: 'rural', label: '🌾 Rural / Countryside' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  company_name: string;
  agent_name: string;
  email: string;
  phone: string;
  website: string;
  vat_number: string;
  country: string;
  city: string;
  property_types: string[];
  price_bands: string[];
  buyer_markets: string[];
  languages: string[];
  specializations: string[];
}

// ─── Toggle chip component ─────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 10,
        border: `1px solid ${selected ? C.orange : C.inputBorder}`,
        background: selected ? 'rgba(249,115,22,0.12)' : C.input,
        color: selected ? C.orange : C.text2,
        fontSize: 13,
        fontWeight: selected ? 700 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ─── Input component ───────────────────────────────────────────────────────────
function Input({
  label, value, onChange, placeholder, type = 'text', required = false, hint
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 8 }}>
        {label}{required && <span style={{ color: C.orange, marginLeft: 4 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: C.input,
          border: `1px solid ${focused ? C.inputFocus : C.inputBorder}`,
          borderRadius: 12,
          padding: '12px 16px',
          color: C.text,
          fontSize: 15,
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
      />
      {hint && <p style={{ marginTop: 6, fontSize: 12, color: C.text3 }}>{hint}</p>}
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function Section({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: `1px solid rgba(249,115,22,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: C.orange, flexShrink: 0 }}>{n}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
          <div style={{ fontSize: 13, color: C.text2 }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AgencyRegisterPage() {
  const [form, setForm] = useState<FormData>({
    company_name: '', agent_name: '', email: '', phone: '',
    website: '', vat_number: '', country: '', city: '',
    property_types: [], price_bands: [], buyer_markets: [],
    languages: ['en'], specializations: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ agency_id: string; message: string } | null>(null);

  const toggle = (field: keyof FormData, value: string) => {
    setForm(f => {
      const arr = f[field] as string[];
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const set = (field: keyof FormData, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!form.company_name.trim()) return setError('Company name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.country.trim()) return setError('Country is required.');
    if (!form.property_types.length) return setError('Select at least one property type.');
    if (!form.buyer_markets.length) return setError('Select at least one buyer market.');
    if (!form.languages.length) return setError('Select at least one language.');

    setLoading(true);
    try {
      const res = await fetch('/api/agency-portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess({ agency_id: data.agency_id, message: data.message });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: '0 0 12px' }}>Welcome to PropBlaze!</h1>
          <p style={{ color: C.text2, fontSize: 15, marginBottom: 32 }}>{success.message}</p>

          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.text2, margin: '0 0 10px' }}>Your Agency ID</p>
            <p style={{ fontSize: 32, fontWeight: 900, fontFamily: 'monospace', color: C.orange, margin: 0, letterSpacing: '0.06em' }}>{success.agency_id}</p>
            <p style={{ fontSize: 12, color: C.text3, margin: '10px 0 0' }}>Sent to your email — keep it safe</p>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text2, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What happens next</p>
            {[
              'Check your email for confirmation and your Agency ID',
              'Our team reviews your profile within 24–48 hours',
              "Once approved, you'll start receiving matched property leads",
              'Leads include owner contact info — reach out directly',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: C.orange, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: C.text2, margin: 0, lineHeight: 1.5 }}>{step}</p>
              </div>
            ))}
          </div>

          <Link href="/" style={{ color: C.text2, fontSize: 13, textDecoration: 'none' }}>
            ← Back to PropBlaze
          </Link>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: ${C.bg}; margin: 0; }
        ::placeholder { color: rgba(255,255,255,0.2); }
        input { -webkit-appearance: none; }
        .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, padding: '40px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Prop<span style={{ color: C.orange }}>Blaze</span></span>
            </Link>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <span style={{ fontSize: 14, color: C.text2 }}>Agency Registration</span>
          </div>

          {/* Hero */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 16 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, letterSpacing: '0.05em' }}>APEX AI Network</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, margin: '0 0 12px', lineHeight: 1.1 }}>
              Join the PropBlaze<br />Agency Network
            </h1>
            <p style={{ fontSize: 16, color: C.text2, margin: 0, lineHeight: 1.6 }}>
              Receive real property leads matched to your specialisation by APEX AI. Direct owner contact included — no intermediaries.
            </p>

            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              {[
                { icon: '🎯', label: 'AI-matched leads' },
                { icon: '📧', label: 'Direct owner contact' },
                { icon: '🔥', label: 'Free to join' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: C.text2 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 32px 28px', marginBottom: 24 }}>
              <Section n={1} title="Agency Details" sub="Basic information about your agency" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input label="Company Name" value={form.company_name} onChange={v => set('company_name', v)} placeholder="City Expert d.o.o." required />
                </div>
                <Input label="Your Name" value={form.agent_name} onChange={v => set('agent_name', v)} placeholder="Ana Kovačević" />
                <Input label="Business Email" value={form.email} onChange={v => set('email', v)} placeholder="info@youragency.com" type="email" required />
                <Input label="Country" value={form.country} onChange={v => set('country', v)} placeholder="Serbia / Germany / RS / DE..." required hint="City, country name, or ISO-2 code" />
                <Input label="City" value={form.city} onChange={v => set('city', v)} placeholder="Belgrade" />
                <Input label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+381 11 123 4567" type="tel" />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://youragency.com" type="url" />
                </div>
                <Input label="VAT / Tax Number" value={form.vat_number} onChange={v => set('vat_number', v)} placeholder="RS1234567890 (optional)" />
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 32px 28px', marginBottom: 24 }}>
              <Section n={2} title="Specialisation" sub="What properties do you work with?" />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>
                  Property Types <span style={{ color: C.orange }}>*</span>
                </label>
                <div className="chip-grid">
                  {PROPERTY_TYPES.map(t => (
                    <Chip key={t.id} label={t.label} selected={form.property_types.includes(t.id)} onClick={() => toggle('property_types', t.id)} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>
                  Price Range
                </label>
                <div className="chip-grid">
                  {PRICE_BANDS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggle('price_bands', b.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${form.price_bands.includes(b.id) ? C.orange : C.inputBorder}`,
                        background: form.price_bands.includes(b.id) ? 'rgba(249,115,22,0.12)' : C.input,
                        color: form.price_bands.includes(b.id) ? C.orange : C.text2,
                        fontWeight: form.price_bands.includes(b.id) ? 700 : 400,
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 'inherit' }}>{b.label}</div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>
                  Specializations
                </label>
                <div className="chip-grid">
                  {SPECIALIZATIONS.map(s => (
                    <Chip key={s.id} label={s.label} selected={form.specializations.includes(s.id)} onClick={() => toggle('specializations', s.id)} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 32px 28px', marginBottom: 24 }}>
              <Section n={3} title="Buyer Markets & Languages" sub="Which buyers do you serve?" />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>
                  Buyer Markets <span style={{ color: C.orange }}>*</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginLeft: 8 }}>Where are your buyers from?</span>
                </label>
                <div className="chip-grid">
                  {BUYER_MARKETS.map(m => (
                    <Chip key={m.id} label={m.label} selected={form.buyer_markets.includes(m.id)} onClick={() => toggle('buyer_markets', m.id)} />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>
                  Languages <span style={{ color: C.orange }}>*</span>
                </label>
                <div className="chip-grid">
                  {LANGUAGES.map(l => (
                    <Chip key={l.id} label={l.label} selected={form.languages.includes(l.id)} onClick={() => toggle('languages', l.id)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                <p style={{ color: '#fca5a5', fontSize: 14, margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            {/* Privacy note */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: C.text3, margin: 0, lineHeight: 1.7 }}>
                🔒 By registering, you agree to the{' '}
                <Link href="/terms" style={{ color: C.text2 }}>Terms & Conditions</Link> and{' '}
                <Link href="/privacy" style={{ color: C.text2 }}>Privacy Policy</Link>.
                Your data is processed under EU GDPR. Property owner contact details are provided directly — handle with professional discretion.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #dc2626, #ea580c)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                borderRadius: 14,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Registering…' : 'Join Agency Network →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: C.text3, marginTop: 16 }}>
              Already registered?{' '}
              <Link href="/login" style={{ color: C.text2, textDecoration: 'none' }}>Sign in →</Link>
            </p>
          </form>

        </div>
      </div>
    </>
  );
}
