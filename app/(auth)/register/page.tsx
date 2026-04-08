'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, DEMO_MODE } from '@/store/auth';

type Role = 'owner' | 'agency';
type Step = 'role' | 'form' | 'verify' | 'done';

// ─── Shared input style ───────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
const inpErr: React.CSSProperties = { ...inp, borderColor: 'rgba(248,113,113,0.5)' };

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{children}</label>;
}
function ErrMsg({ msg }: { msg?: string }) {
  return msg ? <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: 4 }}>{msg}</p> : null;
}
function Spacer() { return <div style={{ height: 12 }} />; }

// ─── Progress dots ─────────────────────────────────────────────────────────────
function Progress({ step }: { step: Step }) {
  const steps: Step[] = ['role', 'form', 'verify', 'done'];
  const idx = steps.indexOf(step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: i === idx ? 20 : 7, height: 7, borderRadius: 4,
            background: i < idx ? '#4ade80' : i === idx ? 'linear-gradient(90deg,#c0392b,#e67e22)' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
          }} />
          {i < steps.length - 1 && <div style={{ width: 16, height: 1, background: i < idx ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Role selector card ────────────────────────────────────────────────────────
function RoleCard({ role, active, onClick }: { role: Role; active: boolean; onClick: () => void }) {
  const cfg = {
    owner: {
      icon: '🏠',
      title: 'I own a property',
      desc: 'List your property and let our AI match you with the best real estate agencies in Europe.',
      perks: ['AI-powered agency matching', 'Multilingual sales package', 'Live distribution tracking'],
    },
    agency: {
      icon: '🏢',
      title: "I'm a real estate agency",
      desc: 'Receive pre-qualified property leads directly matched to your specialisation.',
      perks: ['Pre-qualified property leads', 'Owner contact after deal', 'Agency profile & scoring'],
    },
  }[role];

  return (
    <div onClick={onClick} style={{
      flex: 1, padding: '20px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
      border: active ? '2px solid #e67e22' : '1.5px solid rgba(255,255,255,0.09)',
      background: active ? 'rgba(230,126,34,0.07)' : 'rgba(255,255,255,0.03)',
      boxShadow: active ? '0 0 0 3px rgba(230,126,34,0.12)' : 'none',
    }}>
      <div style={{ fontSize: '1.75rem', marginBottom: 10 }}>{cfg.icon}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>{cfg.title}</div>
      <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 12 }}>{cfg.desc}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {cfg.perks.map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.75rem', color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: active ? '#e67e22' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            {p}
          </div>
        ))}
      </div>
      {active && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: '#e67e22' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Selected
        </div>
      )}
    </div>
  );
}

// ─── Owner registration form ───────────────────────────────────────────────────
function OwnerForm({ onDone }: { onDone: () => void }) {
  const { register, isLoading, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'Montenegro', password: '', confirm: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({});
    if (DEMO_MODE) { onDone(); return; }
    try {
      await register(form.email, form.password, form.name);
      onDone();
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', fontSize: '0.8125rem', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <Label>Full Name</Label>
          <input style={errs.name ? inpErr : inp} placeholder="Alexander Petrov" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <ErrMsg msg={errs.name} />
        </div>
        <div>
          <Label>Phone Number</Label>
          <input style={errs.phone ? inpErr : inp} placeholder="+382 67 000 000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <ErrMsg msg={errs.phone} />
        </div>
      </div>
      <Spacer />

      <div>
        <Label>Email Address</Label>
        <input style={errs.email ? inpErr : inp} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <ErrMsg msg={errs.email} />
      </div>
      <Spacer />

      <div>
        <Label>Country of Residence</Label>
        <select style={{ ...inp, cursor: 'pointer' }} value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
          {['Montenegro','Serbia','Austria','Germany','Switzerland','France','Italy','Spain','Croatia','Bulgaria','Greece','Portugal','Netherlands'].map(c => (
            <option key={c} value={c} style={{ background: '#111' }}>{c}</option>
          ))}
        </select>
      </div>
      <Spacer />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <Label>Password</Label>
          <div style={{ position: 'relative' }}>
            <input style={errs.password ? inpErr : inp} type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
            </button>
          </div>
          <ErrMsg msg={errs.password} />
        </div>
        <div>
          <Label>Confirm Password</Label>
          <input style={errs.confirm ? inpErr : inp} type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
          <ErrMsg msg={errs.confirm} />
        </div>
      </div>
      <Spacer />

      <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 16 }}>
        By creating an account you agree to PropBlaze{' '}
        <Link href="/terms" style={{ color: '#e67e22', textDecoration: 'none' }}>Terms of Service</Link>{' '}and{' '}
        <Link href="/privacy" style={{ color: '#e67e22', textDecoration: 'none' }}>Privacy Policy</Link>.
        Your contact details are never shared without your explicit approval.
      </div>

      <button type="submit" disabled={isLoading} style={{
        width: '100%', padding: '12px', borderRadius: 10,
        background: isLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#c0392b,#e67e22)',
        color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
      }}>
        {isLoading ? 'Creating account…' : 'Create Owner Account →'}
      </button>
    </form>
  );
}

// ─── Agency registration form ─────────────────────────────────────────────────
function AgencyForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    agency_name: '', contact_name: '', email: '', phone: '', website: '',
    country: 'Serbia', city: '', specialization: 'residential',
    price_from: '', price_to: '', languages: 'en',
    password: '', confirm: '',
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1|2>(1);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.agency_name.trim()) e.agency_name = 'Required';
    if (!form.contact_name.trim()) e.contact_name = 'Required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setStep(2);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length) { setErrs(e); return; }
    onDone();
  };

  return (
    <form onSubmit={step === 1 ? (ev => { ev.preventDefault(); handleNext(); }) : handleSubmit}>
      {step === 1 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Agency Name</Label>
              <input style={errs.agency_name ? inpErr : inp} placeholder="Adriatic Properties d.o.o." value={form.agency_name} onChange={e => setForm({...form, agency_name: e.target.value})} />
              <ErrMsg msg={errs.agency_name} />
            </div>
            <div>
              <Label>Contact Person</Label>
              <input style={errs.contact_name ? inpErr : inp} placeholder="Your full name" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
              <ErrMsg msg={errs.contact_name} />
            </div>
            <div>
              <Label>Phone</Label>
              <input style={errs.phone ? inpErr : inp} placeholder="+381 11 000 0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <ErrMsg msg={errs.phone} />
            </div>
          </div>
          <Spacer />

          <div>
            <Label>Business Email</Label>
            <input style={errs.email ? inpErr : inp} type="email" placeholder="agency@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <ErrMsg msg={errs.email} />
          </div>
          <Spacer />

          <div>
            <Label>Website (optional)</Label>
            <input style={inp} placeholder="https://agency.com" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
          </div>
          <Spacer />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Country</Label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                {['Serbia','Montenegro','Croatia','Austria','Germany','Switzerland','France','Spain','Italy','Greece','Portugal','Netherlands','Bulgaria'].map(c => (
                  <option key={c} value={c} style={{ background: '#111' }}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>City / Region</Label>
              <input style={errs.city ? inpErr : inp} placeholder="Belgrade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              <ErrMsg msg={errs.city} />
            </div>
          </div>
          <Spacer />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Specialization</Label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}>
                {[['residential','Residential'],['commercial','Commercial'],['luxury','Luxury'],['land','Land & Plots'],['mixed','Mixed Portfolio']].map(([v,l]) => (
                  <option key={v} value={v} style={{ background: '#111' }}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Primary Language</Label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.languages} onChange={e => setForm({...form, languages: e.target.value})}>
                {[['en','English'],['sr','Serbian'],['ru','Russian'],['de','German'],['fr','French']].map(([v,l]) => (
                  <option key={v} value={v} style={{ background: '#111' }}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <Spacer />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Price Range: From (€)</Label>
              <input style={inp} type="number" placeholder="50 000" value={form.price_from} onChange={e => setForm({...form, price_from: e.target.value})} />
            </div>
            <div>
              <Label>Price Range: To (€)</Label>
              <input style={inp} type="number" placeholder="2 000 000" value={form.price_to} onChange={e => setForm({...form, price_to: e.target.value})} />
            </div>
          </div>
          <Spacer />

          <button type="submit" style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg,#c0392b,#e67e22)',
            color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
          }}>
            Next: Set Password →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Back to agency details
          </button>

          <div style={{ padding: '12px 14px', background: 'rgba(230,126,34,0.07)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: 9, marginBottom: 20 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e67e22', marginBottom: 2 }}>Agency ID Preview</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>PB-AG-{Math.random().toString(36).slice(2,6).toUpperCase()}-{Math.random().toString(36).slice(2,6).toUpperCase()}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Your unique PropBlaze Agency ID — shared with property owners only after deal confirmation</div>
          </div>

          <div>
            <Label>Password</Label>
            <input style={errs.password ? inpErr : inp} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <ErrMsg msg={errs.password} />
          </div>
          <Spacer />

          <div>
            <Label>Confirm Password</Label>
            <input style={errs.confirm ? inpErr : inp} type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
            <ErrMsg msg={errs.confirm} />
          </div>
          <Spacer />

          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 16 }}>
            By registering you confirm this is a licensed real estate agency. PropBlaze will review your application within 24–48 hours.{' '}
            <Link href="/terms" style={{ color: '#e67e22', textDecoration: 'none' }}>Terms</Link> ·{' '}
            <Link href="/privacy" style={{ color: '#e67e22', textDecoration: 'none' }}>Privacy</Link>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg,#c0392b,#e67e22)',
            color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
          }}>
            Submit Agency Application →
          </button>
        </>
      )}
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const initialRole = searchParams.get('role') === 'agency' ? 'agency' : 'owner';
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<Step>(searchParams.get('role') ? 'form' : 'role');

  useEffect(() => {
    if (DEMO_MODE) { router.replace('/dashboard'); return; }
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  if (DEMO_MODE || isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#070708', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #e67e22', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070708', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -200, left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: step === 'role' ? 640 : 540, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36 }}>
              <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c0392b"/>
                    <stop offset="100%" stopColor="#e67e22"/>
                  </linearGradient>
                </defs>
                <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#rg)"/>
                <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.25"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>PropBlaze</div>
              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Platform</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <Progress step={step} />

          {/* ── ROLE SELECTION ── */}
          {step === 'role' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 6 }}>
                  Create your account
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
                  Choose how you want to use PropBlaze
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <RoleCard role="owner" active={role === 'owner'} onClick={() => setRole('owner')} />
                <RoleCard role="agency" active={role === 'agency'} onClick={() => setRole('agency')} />
              </div>

              <button onClick={() => setStep('form')} style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
              }}>
                Continue as {role === 'owner' ? 'Property Owner' : 'Real Estate Agency'} →
              </button>
            </>
          )}

          {/* ── REGISTRATION FORM ── */}
          {step === 'form' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setStep('role')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Back
                </button>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                  {role === 'owner' ? '🏠 Owner Registration' : '🏢 Agency Registration'}
                </div>
                <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 6, background: 'rgba(230,126,34,0.12)', border: '1px solid rgba(230,126,34,0.2)', fontSize: '0.7rem', fontWeight: 600, color: '#e67e22' }}>
                  {role === 'owner' ? 'Property Owner' : 'Real Estate Agency'}
                </div>
              </div>

              {role === 'owner'
                ? <OwnerForm onDone={() => setStep('verify')} />
                : <AgencyForm onDone={() => setStep('verify')} />
              }
            </>
          )}

          {/* ── EMAIL VERIFY ── */}
          {step === 'verify' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(230,126,34,0.12)', border: '1px solid rgba(230,126,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.75rem' }}>
                📧
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>Check your email</h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 20 }}>
                We sent a verification link to your email address.
                {role === 'agency' && <><br /><span style={{ color: '#fbbf24' }}>Your agency application is under review (24–48 h).</span></>}
              </p>

              {role === 'owner' ? (
                <button onClick={() => router.push('/dashboard')} style={{
                  padding: '11px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                  color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
                }}>
                  Go to Dashboard →
                </button>
              ) : (
                <button onClick={() => router.push('/')} style={{
                  padding: '11px 24px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  Back to Homepage
                </button>
              )}

              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
                Didn't receive it?{' '}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e67e22', fontSize: '0.75rem', padding: 0 }}>Resend email</button>
              </p>
            </div>
          )}
        </div>

        {/* Sign-in link */}
        {step !== 'verify' && (
          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', marginTop: 16 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#e67e22', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
