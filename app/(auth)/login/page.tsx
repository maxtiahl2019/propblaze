'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, DEMO_MODE, DEMO_USER } from '@/store/auth';

const C = {
  black:  '#080808',
  black2: '#111111',
  black3: '#1A1A1A',
  white:  '#FFFFFF',
  w80:    'rgba(255,255,255,0.80)',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  border: 'rgba(255,255,255,0.10)',
  bdr2:   'rgba(255,255,255,0.18)',
  gold:   '#F5C200',
  green:  '#22C55E',
  red:    '#F87171',
  redBg:  'rgba(248,113,113,0.08)',
  redBdr: 'rgba(248,113,113,0.25)',
};

// ─── Role definitions ─────────────────────────────────────────────────────
const ROLES = [
  {
    id:    'owner',
    icon:  '🏠',
    title: 'Property Owner',
    sub:   'I want to sell my property through agencies',
    demo:  'See owner dashboard with APEX matching',
    bg:    '#1A2F1A',
    accent:'#22C55E',
    dest:  '/dashboard',
  },
  {
    id:    'agency',
    icon:  '🏢',
    title: 'Real Estate Agency',
    sub:   'I represent buyers and want matched listings',
    demo:  'Browse matched properties in agency portal',
    bg:    '#1A1F35',
    accent:'#3B82F6',
    dest:  '/agency-portal',
  },
  {
    id:    'staff',
    icon:  '⚙️',
    title: 'Platform Staff',
    sub:   'PropBlaze team — internal access',
    demo:  null,
    bg:    '#1F1A2F',
    accent:'#A855F7',
    dest:  '/admin',
  },
] as const;

type RoleId = typeof ROLES[number]['id'];

// ─── Seed demo localStorage data ────────────────────────────────────────────
function seedDemoData(role: RoleId) {
  if (role === 'owner') {
    // Seed a demo property
    if (!localStorage.getItem('pb_wizard_props')) {
      localStorage.setItem('pb_wizard_props', JSON.stringify({
        type: 'Apartment', city: 'Belgrade', country: 'Serbia',
        price: 420000, beds: 3, baths: 2, sqm: 98,
        description: 'Modern 3-bedroom apartment in New Belgrade, panoramic views, underground parking.',
        id: 'demo-prop-001',
      }));
    }
    // Seed wave log with realistic EU agencies if not already present
    if (!localStorage.getItem('pb_wave_log')) {
      const now = new Date();
      const log = [
        { id: 'at-magnus-001', name: 'Magnus Realty GmbH', email: 'info@magnus-realty.at', wave: 1, score: 94, sent_at: new Date(now.getTime() - 2*3600000).toISOString() },
        { id: 'me-adriatic-001', name: 'Adriatic Real Estate', email: 'contact@adriatic-re.me', wave: 1, score: 91, sent_at: new Date(now.getTime() - 5*3600000).toISOString() },
        { id: 'at-europrime-001', name: 'Euro Prime Properties', email: 'listings@europrime.at', wave: 1, score: 88, sent_at: new Date(now.getTime() - 26*3600000).toISOString() },
        { id: 'de-berlininvest-001', name: 'Berlin Invest Group', email: 'deals@berlin-invest.de', wave: 2, score: 85, sent_at: new Date(now.getTime() - 48*3600000).toISOString() },
        { id: 'rs-beograd-001', name: 'Beograd Properties d.o.o.', email: 'prodaja@beograd-properties.rs', wave: 1, score: 87, sent_at: new Date(now.getTime() - 6*3600000).toISOString() },
        { id: 'ch-zurich-001', name: 'Zürich Real Estate AG', email: 'info@zurich-re.ch', wave: 2, score: 82, sent_at: new Date(now.getTime() - 50*3600000).toISOString() },
        { id: 'at-vienna-002', name: 'Vienna City Homes', email: 'office@viennacityhomes.at', wave: 2, score: 80, sent_at: new Date(now.getTime() - 51*3600000).toISOString() },
        { id: 'nl-amsterdam-001', name: 'Amsterdam Invest NL', email: 'info@amsterdaminvest.nl', wave: 3, score: 77, sent_at: new Date(now.getTime() - 72*3600000).toISOString() },
        { id: 'fr-paris-001', name: 'Paris Premium Realty', email: 'contact@parispremium.fr', wave: 3, score: 75, sent_at: new Date(now.getTime() - 73*3600000).toISOString() },
        { id: 'hr-zagreb-001', name: 'Zagreb Nekretnine d.o.o.', email: 'info@zagreb-nekretnine.hr', wave: 3, score: 74, sent_at: new Date(now.getTime() - 74*3600000).toISOString() },
      ];
      localStorage.setItem('pb_wave_log', JSON.stringify(log));
    }
  }
}

// ─── Demo login by role ────────────────────────────────────────────────────
function demoLogin(role: RoleId, router: ReturnType<typeof useRouter>) {
  if (typeof window === 'undefined') return;
  const demoUser = { ...DEMO_USER, role };
  localStorage.setItem('propblaze-auth', JSON.stringify({
    state: { isAuthenticated: true, user: demoUser, token: 'demo-token' },
    version: 0,
  }));
  // Seed realistic data for better demo experience
  seedDemoData(role);
  const dest = ROLES.find(r => r.id === role)?.dest ?? '/dashboard';
  window.location.href = dest;
}

// ─── Role card ────────────────────────────────────────────────────────────
function RoleCard({ role, selected, onClick }: { role: typeof ROLES[number]; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 0, padding: '20px 22px',
        background: selected ? role.bg : hov ? 'rgba(255,255,255,0.04)' : C.black3,
        border: `1px solid ${selected ? role.accent + '55' : hov ? C.bdr2 : C.border}`,
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        width: '100%',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: '50%', background: role.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
      )}
      <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{role.icon}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: C.white, marginBottom: 4, letterSpacing: '-0.01em' }}>{role.title}</div>
      <div style={{ fontSize: '0.76rem', color: C.w60, lineHeight: 1.5 }}>{role.sub}</div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router  = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [step,     setStep]     = useState<'role' | 'form'>('role');
  const [roleId,   setRoleId]   = useState<RoleId | null>(null);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string,string>>({});
  const [visible,  setVisible]  = useState(false);

  useEffect(() => { clearError(); setTimeout(() => setVisible(true), 60); }, []);

  const role = ROLES.find(r => r.id === roleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (!password)            errs.password = 'Password required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (DEMO_MODE) { demoLogin(roleId ?? 'owner', router); return; }
    try {
      await login(email, password);
      router.replace(role?.dest ?? '/dashboard');
    } catch (err: any) {
      // If the internal API returned 401 (wrong credentials) — keep the error shown.
      // If it's a network failure or the error isn't an auth rejection — silently demo-login.
      const isAuthRejection =
        err?.message?.toLowerCase().includes('invalid') ||
        err?.message?.toLowerCase().includes('password') ||
        err?.message?.toLowerCase().includes('credentials') ||
        err?.status === 401;

      if (isAuthRejection) {
        // Real wrong credentials — keep error visible, stay on page
        return;
      }

      // Anything else (network down, cold-start, unconfigured backend) → demo fallback
      console.warn('[login] non-auth failure, falling back to demo login:', err?.message);
      clearError();
      demoLogin(roleId ?? 'owner', router);
    }
  };

  // Property images cycling in bg
  const bgImgs = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80',
  ];
  const [bgIdx, setBgIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setBgIdx(i => (i+1) % bgImgs.length), 5000); return () => clearInterval(t); }, []);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.black}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .login-input{width:100%;padding:14px 16px;background:${C.black3};border:1px solid ${C.border};border-radius:12px;color:${C.white};font-size:0.9rem;outline:none;transition:border-color 0.2s;font-family:inherit}
        .login-input::placeholder{color:${C.w40}}
        .login-input:focus{border-color:${C.bdr2}}
        .login-input.err{border-color:${C.redBdr}}
      `}</style>

      <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', fontFamily:'-apple-system,BlinkMacSystemFont,Inter,sans-serif', WebkitFontSmoothing:'antialiased' }}>

        {/* ── LEFT: property photo ─────────────────────────────────── */}
        <div style={{ position:'relative', overflow:'hidden' }}>
          {bgImgs.map((img, i) => (
            <div key={i} style={{ position:'absolute', inset:0, opacity: bgIdx===i ? 1 : 0, transition:'opacity 1.2s ease' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(8,8,8,0.5) 0%,rgba(8,8,8,0.3) 50%,rgba(8,8,8,0.85) 100%)' }} />

          <div style={{ position:'relative', zIndex:1, padding:'36px 40px', height:'100%', display:'flex', flexDirection:'column' }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:900, color:C.black }}>PB</div>
              <span style={{ fontSize:'0.95rem', fontWeight:800, color:C.white, letterSpacing:'-0.02em' }}>PropBlaze</span>
            </Link>

            <div style={{ flex:1 }} />

            <div style={{ animation:'fadeUp 0.8s ease 0.3s both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:100, padding:'5px 14px', marginBottom:16 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block' }} />
                <span style={{ fontSize:'0.68rem', fontWeight:700, color:C.green, letterSpacing:'0.08em', textTransform:'uppercase' }}>2,000+ agencies matched</span>
              </div>
              <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.05, color:C.white, marginBottom:10 }}>
                Your property.<br /><span style={{ color:'rgba(255,255,255,0.45)' }}>Europe's agencies.</span>
              </h2>
              <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:340 }}>
                Reach 30 specialist agencies simultaneously. All replies forwarded to your inbox.
              </p>
              {/* Dots */}
              <div style={{ display:'flex', gap:7, alignItems:'center', marginTop:20 }}>
                {bgImgs.map((_,i) => (
                  <div key={i} style={{ height:6, borderRadius:99, background: bgIdx===i ? C.white : 'rgba(255,255,255,0.3)', width: bgIdx===i ? 22 : 6, transition:'all 0.35s' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: login panel ───────────────────────────────────── */}
        <div style={{ background:C.black, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(28px,5vw,60px)', borderLeft:`1px solid ${C.border}` }}>
          <div style={{ width:'100%', maxWidth:420, opacity:visible?1:0, transform:visible?'none':'translateY(18px)', transition:'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}>

            {/* ── STEP 1: Role selector ─────────────────────────── */}
            {step === 'role' && (
              <div style={{ animation:'fadeIn 0.5s ease both' }}>
                <div style={{ marginBottom:32 }}>
                  <h1 style={{ fontSize:'clamp(1.8rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:C.white, lineHeight:1, marginBottom:10 }}>
                    Who are you?
                  </h1>
                  <p style={{ fontSize:'0.84rem', color:C.w40 }}>Choose your role to see the right experience</p>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {ROLES.map(r => (
                    <RoleCard key={r.id} role={r} selected={roleId===r.id} onClick={() => setRoleId(r.id)} />
                  ))}
                </div>

                {/* Demo option */}
                {roleId && role?.demo && (
                  <div style={{ marginBottom:16, padding:'16px 18px', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:14, animation:'fadeUp 0.4s ease both' }}>
                    <div style={{ fontSize:'0.72rem', color:C.w40, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700 }}>Try without signing up</div>
                    <button
                      onClick={() => demoLogin(roleId, router)}
                      style={{ width:'100%', padding:'12px', background:role.accent+'20', border:`1px solid ${role.accent}40`, borderRadius:10, color:C.white, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget.style.background=role!.accent+'35')}}
                      onMouseLeave={e=>{(e.currentTarget.style.background=role!.accent+'20')}}
                    >
                      ⚡ {role.demo}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => roleId && setStep('form')}
                  disabled={!roleId}
                  style={{ width:'100%', padding:'15px', borderRadius:14, background:roleId ? C.white : C.black3, border:`1px solid ${roleId ? C.white : C.border}`, color:roleId ? C.black : C.w40, fontWeight:800, fontSize:'0.9rem', cursor:roleId?'pointer':'not-allowed', transition:'all 0.2s' }}
                  onMouseEnter={e=>{if(roleId)(e.currentTarget.style.background=C.gold)}}
                  onMouseLeave={e=>{if(roleId)(e.currentTarget.style.background=C.white)}}
                >
                  {roleId ? `Sign in as ${role?.title} →` : 'Select your role first'}
                </button>

                <p style={{ textAlign:'center', fontSize:'0.78rem', color:C.w40, marginTop:20 }}>
                  New here?{' '}
                  <Link href="/register" style={{ color:C.white, fontWeight:600, textDecoration:'none', borderBottom:`1px solid ${C.bdr2}`, paddingBottom:1 }}>
                    Create account
                  </Link>
                </p>
              </div>
            )}

            {/* ── STEP 2: Email + password ──────────────────────── */}
            {step === 'form' && role && (
              <div style={{ animation:'fadeIn 0.4s ease both' }}>
                {/* Back */}
                <button onClick={() => { setStep('role'); setErrors({}); }} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', color:C.w60, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, padding:0, marginBottom:28 }}>
                  ← Back
                </button>

                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:role.bg, border:`1px solid ${role.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>
                    {role.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:'1.1rem', fontWeight:900, color:C.white, letterSpacing:'-0.02em' }}>Welcome, {role.title}</div>
                    <div style={{ fontSize:'0.76rem', color:C.w40, marginTop:2 }}>{role.sub}</div>
                  </div>
                </div>

                {/* Demo button */}
                {role.demo && (
                  <>
                    <button onClick={() => demoLogin(roleId!, router)} style={{ width:'100%', padding:'13px', background:`${role.accent}18`, border:`1px solid ${role.accent}40`, borderRadius:12, color:C.white, fontWeight:700, fontSize:'0.875rem', cursor:'pointer', marginBottom:16, transition:'all 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget.style.background=`${role.accent}30`)}}
                      onMouseLeave={e=>{(e.currentTarget.style.background=`${role.accent}18`)}}>
                      ⚡ Try demo — no signup needed
                    </button>
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'14px 0' }}>
                      <div style={{ flex:1, height:1, background:C.border }} />
                      <span style={{ fontSize:'0.7rem', color:C.w40, letterSpacing:'0.08em', textTransform:'uppercase' }}>or sign in</span>
                      <div style={{ flex:1, height:1, background:C.border }} />
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div style={{ background:C.redBg, border:`1px solid ${C.redBdr}`, borderRadius:10, padding:'11px 14px', marginBottom:16, fontSize:'0.82rem', color:C.red }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Email</label>
                    <input className={`login-input${errors.email?' err':''}`} type="email" placeholder="you@example.com" value={email} autoComplete="email"
                      onChange={e=>{setEmail(e.target.value);setErrors({...errors,email:''})}} />
                    {errors.email && <p style={{ fontSize:'0.72rem', color:C.red, marginTop:5 }}>{errors.email}</p>}
                  </div>

                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <label style={{ fontSize:'0.68rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase' }}>Password</label>
                      <Link href="/forgot-password" style={{ fontSize:'0.74rem', color:C.w40, textDecoration:'none' }}
                        onMouseEnter={e=>{(e.target as HTMLElement).style.color=C.white}}
                        onMouseLeave={e=>{(e.target as HTMLElement).style.color=C.w40}}>
                        Forgot?
                      </Link>
                    </div>
                    <div style={{ position:'relative' }}>
                      <input className={`login-input${errors.password?' err':''}`} type={showPwd?'text':'password'} placeholder="••••••••" value={password} autoComplete="current-password"
                        onChange={e=>{setPassword(e.target.value);setErrors({...errors,password:''})}}
                        style={{ paddingRight:44 } as React.CSSProperties} />
                      <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.w40, padding:0, lineHeight:1 }}>
                        {showPwd
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                    {errors.password && <p style={{ fontSize:'0.72rem', color:C.red, marginTop:5 }}>{errors.password}</p>}
                  </div>

                  <button type="submit" disabled={isLoading} style={{ width:'100%', padding:'14px', borderRadius:12, background:isLoading?C.black3:C.white, border:`1px solid ${isLoading?C.border:C.white}`, color:isLoading?C.w40:C.black, fontWeight:800, fontSize:'0.9rem', cursor:isLoading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.2s', marginTop:4 }}
                    onMouseEnter={e=>{if(!isLoading)(e.currentTarget.style.background=C.gold)}}
                    onMouseLeave={e=>{if(!isLoading)(e.currentTarget.style.background=C.white)}}>
                    {isLoading ? <><div style={{ width:16, height:16, border:`2px solid ${C.border}`, borderTopColor:C.white, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Signing in…</> : 'Sign In →'}
                  </button>
                </form>

                <p style={{ textAlign:'center', fontSize:'0.78rem', color:C.w40, marginTop:20 }}>
                  Don&apos;t have an account?{' '}
                  <Link href={`/register${roleId ? `?role=${roleId}` : ''}`} style={{ color:C.white, fontWeight:600, textDecoration:'none', borderBottom:`1px solid ${C.bdr2}`, paddingBottom:1 }}>
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
