'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { ApexAgency } from '@/app/api/apex-demo/route';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  black:'#080808', black2:'#111111', black3:'#181818',
  white:'#FFFFFF', w80:'rgba(255,255,255,0.80)', w60:'rgba(255,255,255,0.60)',
  w40:'rgba(255,255,255,0.40)', w20:'rgba(255,255,255,0.20)', w10:'rgba(255,255,255,0.08)',
  border:'rgba(255,255,255,0.10)', border2:'rgba(255,255,255,0.18)',
  gold:'#F5C200', green:'#22C55E', blue:'#3B82F6', purple:'#A855F7', red:'#F87171',
};

// ─── Property types ───────────────────────────────────────────────────────────
type PropertyType = 'apartment'|'house'|'villa'|'penthouse'|'commercial'|'land';

const PROP_TYPES: { id:PropertyType; label:string; icon:string; desc:string }[] = [
  { id:'apartment', label:'Apartment',   icon:'🏢', desc:'Flat / condo' },
  { id:'house',     label:'House',       icon:'🏠', desc:'Detached / semi' },
  { id:'villa',     label:'Villa',       icon:'🏡', desc:'Luxury / pool' },
  { id:'penthouse', label:'Penthouse',   icon:'🌆', desc:'Top floor' },
  { id:'land',      label:'Land / Plot', icon:'🌿', desc:'Building land' },
  { id:'commercial',label:'Commercial',  icon:'🏪', desc:'Office / retail' },
];

const COUNTRIES = [
  'Montenegro','Serbia','Croatia','Bosnia','Slovenia','North Macedonia',
  'Bulgaria','Romania','Greece','Albania',
  'Germany','Austria','Switzerland',
  'France','Spain','Portugal','Italy','Netherlands','Belgium','UK',
  'Czech Republic','Hungary','Poland','Slovakia','Other EU',
];

const CITY_HINTS: Record<string,string> = {
  Montenegro: 'e.g. Budva, Kotor, Tivat, Bar, Podgorica',
  Serbia: 'e.g. Belgrade, Novi Sad, Niš',
  Croatia: 'e.g. Dubrovnik, Split, Zagreb, Zadar',
  Slovenia: 'e.g. Ljubljana, Koper, Portorož',
  Bosnia: 'e.g. Sarajevo, Mostar',
  Greece: 'e.g. Athens, Thessaloniki, Mykonos',
  Germany: 'e.g. Berlin, Munich, Frankfurt',
  Austria: 'e.g. Vienna, Graz, Salzburg',
  Spain: 'e.g. Barcelona, Marbella, Madrid',
  Portugal: 'e.g. Lisbon, Porto, Algarve',
  Italy: 'e.g. Milan, Rome, Florence',
  France: 'e.g. Paris, Nice, Cannes',
};

// ─── Animated matching steps (shown while API call runs) ──────────────────────
const MATCH_STEPS_FN = (country: string) => [
  'Parsing property parameters…',
  `Scanning 2,847 verified EU agency profiles…`,
  `Applying geographic filters — ${country} and region…`,
  'Matching type, price band, language fit…',
  'Running LLM semantic analysis…',
  `Ranking by APEX score — ${country} specialists first…`,
  'Organizing into 3 distribution waves…',
  'Verifying agency contacts & activity status…',
  'Results ready.',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
type Step = 'form1'|'form2'|'matching'|'results'|'error';

export default function ApexDemoPage() {
  const [step,        setStep]       = useState<Step>('form1');
  const [propType,    setPropType]   = useState<PropertyType|null>(null);
  const [country,     setCountry]    = useState('');
  const [city,        setCity]       = useState('');
  const [price,       setPrice]      = useState('');
  const [sqm,         setSqm]        = useState('');
  const [beds,        setBeds]       = useState('');
  const [name,        setName]       = useState('');
  const [email,       setEmail]      = useState('');
  const [matches,     setMatches]    = useState<ApexAgency[]>([]);
  const [revealed,    setRevealed]   = useState(0);
  const [waveFilter,  setWaveFilter] = useState<0|1|2|3>(0);
  const [matchStep,   setMatchStep]  = useState(0);
  const [matchPct,    setMatchPct]   = useState(0);
  const [errorMsg,    setErrorMsg]   = useState('');
  const [provider,    setProvider]   = useState('');
  const apiCalledRef = useRef(false);

  const MATCH_STEPS = MATCH_STEPS_FN(country);

  // ── Run matching: animate + call API in parallel ────────────────────────────
  useEffect(() => {
    if (step !== 'matching') return;
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    // Animation ticker
    let ms = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    MATCH_STEPS.forEach((_, i) => {
      ms += 440 + i * 200;
      timers.push(setTimeout(() => {
        setMatchStep(i);
        setMatchPct(Math.round(((i + 1) / MATCH_STEPS.length) * 100));
      }, ms));
    });

    // Real API call (runs in parallel with animation)
    fetch('/api/apex-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propType,
        country,
        city,
        price: Number(price) || 200000,
        sqm,
        beds,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || 'Matching engine error');
        }
        return data;
      })
      .then(data => {
        // Wait at least until animation is at 80% before showing results
        const minWait = ms * 0.75;
        const elapsed = performance.now();
        const remaining = Math.max(0, minWait - elapsed);
        setTimeout(() => {
          timers.forEach(clearTimeout);
          setMatches(data.agencies || []);
          setProvider(data.provider || '');
          setMatchPct(100);
          setMatchStep(MATCH_STEPS.length - 1);
          setTimeout(() => setStep('results'), 400);
        }, remaining);
      })
      .catch(err => {
        timers.forEach(clearTimeout);
        setErrorMsg(err.message || 'Unknown error');
        setStep('error');
      });

    return () => {
      timers.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Staggered card reveal on results
  useEffect(() => {
    if (step !== 'results') return;
    setRevealed(0);
    let i = 0;
    const t = setInterval(() => { i++; setRevealed(i); if (i >= 30) clearInterval(t); }, 60);
    return () => clearInterval(t);
  }, [step]);

  const filtered  = waveFilter === 0 ? matches : matches.filter(m => m.wave === waveFilter);
  const wave1     = matches.filter(m => m.wave === 1);
  const wave2     = matches.filter(m => m.wave === 2);
  const wave3     = matches.filter(m => m.wave === 3);
  const avgScore  = matches.length ? Math.round(matches.reduce((s,m) => s + m.score, 0) / matches.length) : 0;
  const countries = new Set(matches.map(m => m.country)).size;

  const priceNum     = Number(price) || 0;
  const priceDisplay = priceNum >= 1_000_000
    ? `€${(priceNum/1_000_000).toFixed(2)}M`
    : priceNum >= 1000 ? `€${Math.round(priceNum/1000)}K` : `€${priceNum}`;

  function restart() {
    apiCalledRef.current = false;
    setStep('form1');
    setMatches([]);
    setRevealed(0);
    setWaveFilter(0);
    setMatchStep(0);
    setMatchPct(0);
    setErrorMsg('');
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.black};color:${C.white};font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:none}}
        .type-btn{padding:16px 14px;border-radius:14px;border:1px solid ${C.border};background:rgba(255,255,255,0.04);cursor:pointer;transition:all 0.2s;text-align:left;color:${C.white};position:relative}
        .type-btn:hover{border-color:${C.border2};background:rgba(255,255,255,0.08);transform:translateY(-2px)}
        .type-btn.sel{border-color:rgba(245,194,0,0.5);background:rgba(245,194,0,0.10);box-shadow:0 0 20px rgba(245,194,0,0.08)}
        .agency-card{background:rgba(255,255,255,0.04);border:1px solid ${C.border};border-radius:14px;padding:16px;transition:all 0.2s}
        .agency-card:hover{border-color:${C.border2};background:rgba(255,255,255,0.07);transform:translateY(-1px)}
        input,select{background:rgba(255,255,255,0.06);border:1px solid ${C.border};border-radius:12px;padding:13px 15px;color:${C.white};font-family:inherit;font-size:0.88rem;outline:none;transition:border-color 0.2s;width:100%}
        input:focus,select:focus{border-color:rgba(245,194,0,0.5);box-shadow:0 0 0 3px rgba(245,194,0,0.08)}
        input::placeholder{color:${C.w40}}
        select option{background:#1a1a1a;color:#fff}
        .fl{display:block;font-size:0.66rem;font-weight:700;color:${C.w40};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:7px}
        .req{color:${C.gold};margin-left:2px}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(16px,4vw,48px)',background:'rgba(8,8,8,0.92)',backdropFilter:'blur(16px)',borderBottom:`1px solid ${C.border}` }}>
        <Link href="/" style={{ textDecoration:'none',display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:28,height:28,borderRadius:7,background:C.white,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:900,color:C.black }}>PB</div>
          <span style={{ fontSize:'0.9rem',fontWeight:800,color:C.white,letterSpacing:'-0.02em' }}>PropBlaze</span>
        </Link>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <Link href="/login" style={{ fontSize:'0.78rem',color:C.w60,textDecoration:'none',fontWeight:600 }}>Sign in</Link>
          <Link href="/register" style={{ background:C.white,color:C.black,fontSize:'0.78rem',fontWeight:800,padding:'7px 18px',borderRadius:100,textDecoration:'none' }}>Get started</Link>
        </div>
      </nav>

      <div style={{ minHeight:'100vh',padding:'80px clamp(16px,5vw,60px) 60px',maxWidth:step==='results'?1200:640,margin:'0 auto' }}>

        {/* ══ STEP 1: property type ══ */}
        {step === 'form1' && (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>
            <div style={{ textAlign:'center',marginBottom:40,marginTop:20 }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(245,194,0,0.12)',border:'1px solid rgba(245,194,0,0.3)',borderRadius:100,padding:'5px 14px',marginBottom:18 }}>
                <span style={{ fontSize:'0.65rem',fontWeight:800,color:C.gold,letterSpacing:'0.1em',textTransform:'uppercase' }}>⚡ APEX AI Matching</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:900,letterSpacing:'-0.04em',lineHeight:1.05,color:C.white,marginBottom:12 }}>
                Find your perfect agencies.<br/>
                <span style={{ color:C.w40 }}>60 seconds. No signup.</span>
              </h1>
              <p style={{ fontSize:'0.88rem',color:C.w60,lineHeight:1.7 }}>
                Tell us about your property — APEX AI scans thousands of EU agencies and returns your top 28 real matches instantly.
              </p>
            </div>

            <p style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16 }}>
              Step 1 of 2 — What are you selling?
            </p>

            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:28 }}>
              {PROP_TYPES.map(t => (
                <button key={t.id} className={`type-btn${propType===t.id?' sel':''}`} onClick={() => setPropType(t.id)}>
                  <div style={{ fontSize:'1.5rem',marginBottom:8 }}>{t.icon}</div>
                  <div style={{ fontSize:'0.85rem',fontWeight:700,color:C.white,marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:'0.7rem',color:C.w40 }}>{t.desc}</div>
                  {propType===t.id && <div style={{ position:'absolute',top:10,right:10,width:20,height:20,borderRadius:'50%',background:C.gold,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',color:C.black,fontWeight:900 }}>✓</div>}
                </button>
              ))}
            </div>

            <button
              disabled={!propType}
              onClick={() => setStep('form2')}
              style={{ width:'100%',padding:'15px',borderRadius:14,background:propType?C.white:'rgba(255,255,255,0.08)',border:'none',color:propType?C.black:C.w40,fontWeight:800,fontSize:'0.9rem',cursor:propType?'pointer':'not-allowed',transition:'all 0.2s' }}
            >
              {propType ? `Continue — ${PROP_TYPES.find(t=>t.id===propType)?.label} →` : 'Select property type first'}
            </button>
          </div>
        )}

        {/* ══ STEP 2: details ══ */}
        {step === 'form2' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <button onClick={() => setStep('form1')} style={{ background:'none',border:'none',color:C.w60,cursor:'pointer',fontSize:'0.82rem',fontWeight:600,marginBottom:24,padding:0 }}>← Back</button>

            <div style={{ textAlign:'center',marginBottom:32 }}>
              <div style={{ fontSize:'2rem',marginBottom:8 }}>{PROP_TYPES.find(t=>t.id===propType)?.icon}</div>
              <h2 style={{ fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,letterSpacing:'-0.03em',color:C.white,marginBottom:6 }}>
                Tell us about your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}
              </h2>
              <p style={{ fontSize:'0.82rem',color:C.w60 }}>The more detail — the more precise the AI match.</p>
            </div>

            <p style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20 }}>Step 2 of 2 — Property details</p>

            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label className="fl">Country <span className="req">*</span></label>
                  <select value={country} onChange={e => { setCountry(e.target.value); setCity(''); }}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">City / Area</label>
                  <input
                    type="text"
                    placeholder={country ? (CITY_HINTS[country] || 'Enter city or area') : 'Select country first'}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={!country}
                  />
                </div>
              </div>

              <div>
                <label className="fl">Asking Price (€) <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 250000" value={price} onChange={e => setPrice(e.target.value)} min={0} />
                {price && <div style={{ fontSize:'0.75rem',color:C.gold,marginTop:6,fontWeight:600 }}>= {priceDisplay}</div>}
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label className="fl">Size (m²)</label>
                  <input type="number" placeholder="e.g. 120" value={sqm} onChange={e => setSqm(e.target.value)} min={0} />
                </div>
                <div>
                  <label className="fl">Bedrooms</label>
                  <select value={beds} onChange={e => setBeds(e.target.value)}>
                    <option value="">Select…</option>
                    <option value="studio">Studio</option>
                    <option value="1">1 bedroom</option>
                    <option value="2">2 bedrooms</option>
                    <option value="3">3 bedrooms</option>
                    <option value="4">4 bedrooms</option>
                    <option value="5+">5+ bedrooms</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:16 }}>
                <div style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>Optional — receive full report by email</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Summary preview */}
            {country && price && (
              <div style={{ margin:'20px 0',background:'rgba(245,194,0,0.06)',border:'1px solid rgba(245,194,0,0.2)',borderRadius:12,padding:'14px 18px' }}>
                <span style={{ fontSize:'0.8rem',color:C.w60 }}>
                  Matching: <strong style={{ color:C.white }}>{PROP_TYPES.find(t=>t.id===propType)?.label}</strong>
                  {city && <> · <strong style={{ color:C.white }}>{city}</strong></>}
                  · <strong style={{ color:C.white }}>{country}</strong>
                  · <strong style={{ color:C.gold }}>{priceDisplay}</strong>
                  {sqm && <> · <strong style={{ color:C.white }}>{sqm}m²</strong></>}
                  {beds && <> · <strong style={{ color:C.white }}>{beds} bed{beds!=='1'&&beds!=='studio'?'s':''}</strong></>}
                </span>
              </div>
            )}

            <button
              disabled={!country || !price}
              onClick={() => { apiCalledRef.current = false; setStep('matching'); }}
              style={{ width:'100%',padding:'15px',borderRadius:14,background:(country&&price)?C.gold:'rgba(255,255,255,0.08)',border:'none',color:(country&&price)?C.black:C.w40,fontWeight:900,fontSize:'0.9rem',cursor:(country&&price)?'pointer':'not-allowed',transition:'all 0.2s' }}
            >
              {(country&&price) ? '⚡ Run APEX Matching →' : 'Fill in country and price first'}
            </button>

            <p style={{ textAlign:'center',fontSize:'0.7rem',color:C.w40,marginTop:12 }}>
              🔒 Preview only — no data is sent to any agency
            </p>
          </div>
        )}

        {/* ══ MATCHING ANIMATION ══ */}
        {step === 'matching' && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'72vh',animation:'fadeIn 0.4s ease both' }}>
            <div style={{ width:'100%',maxWidth:540,textAlign:'center' }}>
              <div style={{ width:80,height:80,margin:'0 auto 28px',position:'relative' }}>
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${C.gold}22` }} />
                <div style={{ position:'absolute',inset:8,borderRadius:'50%',border:`2px solid ${C.gold}44` }} />
                <div style={{ position:'absolute',inset:16,borderRadius:'50%',background:`${C.gold}10`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:'1.4rem' }}>🤖</span>
                </div>
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid transparent`,borderTopColor:C.gold,animation:'spin 0.9s linear infinite' }} />
              </div>

              <h2 style={{ fontSize:'1.3rem',fontWeight:900,color:C.white,marginBottom:6,letterSpacing:'-0.02em' }}>APEX AI is analysing…</h2>
              <p style={{ fontSize:'0.82rem',color:C.w60,marginBottom:30 }}>
                Finding agencies for {city ? `${city}, ` : ''}{country}
              </p>

              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:99,height:6,marginBottom:10,overflow:'hidden' }}>
                <div style={{ height:'100%',background:C.gold,borderRadius:99,width:`${matchPct}%`,transition:'width 0.35s ease' }} />
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:C.w40,marginBottom:32 }}>
                <span style={{ animation:'pulse 1s ease infinite' }}>{MATCH_STEPS[matchStep]}</span>
                <span>{matchPct}%</span>
              </div>

              <div style={{ display:'flex',justifyContent:'center',gap:28 }}>
                {[
                  { label:'Scanned',     val: Math.round(matchPct * 28.47) },
                  { label:'Filtered',    val: Math.round(matchPct * 9.1) },
                  { label:'Top matches', val: Math.min(28, Math.round(matchPct * 0.28)) },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.3rem',fontWeight:900,color:C.gold,letterSpacing:'-0.02em',fontVariantNumeric:'tabular-nums' }}>{s.val.toLocaleString()}</div>
                    <div style={{ fontSize:'0.65rem',color:C.w40,marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ERROR ══ */}
        {step === 'error' && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',animation:'fadeIn 0.4s ease both' }}>
            <div style={{ textAlign:'center',maxWidth:480 }}>
              <div style={{ fontSize:'3rem',marginBottom:16 }}>⚙️</div>
              <h2 style={{ fontSize:'1.5rem',fontWeight:900,color:C.white,marginBottom:10 }}>APEX needs an AI key</h2>
              <p style={{ fontSize:'0.85rem',color:C.w60,lineHeight:1.65,marginBottom:8 }}>
                The live AI matching requires an Anthropic or OpenAI API key configured in Vercel environment variables.
              </p>
              {errorMsg && (
                <div style={{ background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:10,padding:'10px 16px',fontSize:'0.75rem',color:C.red,marginBottom:20,textAlign:'left',wordBreak:'break-word' }}>
                  {errorMsg}
                </div>
              )}
              <p style={{ fontSize:'0.8rem',color:C.w40,marginBottom:24 }}>
                Add <code style={{ background:'rgba(255,255,255,0.08)',padding:'2px 6px',borderRadius:4,color:C.gold }}>ANTHROPIC_API_KEY</code> to your Vercel project env vars and redeploy.
              </p>
              <button onClick={restart} style={{ background:C.white,color:C.black,border:'none',borderRadius:100,padding:'12px 28px',fontWeight:800,cursor:'pointer',fontSize:'0.88rem' }}>
                ← Try again
              </button>
            </div>
          </div>
        )}

        {/* ══ RESULTS ══ */}
        {step === 'results' && (
          <div style={{ animation:'fadeIn 0.4s ease both' }}>
            {/* Header */}
            <div style={{ marginBottom:32,marginTop:12 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:14 }}>
                <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:100,padding:'5px 14px' }}>
                  <span style={{ width:6,height:6,borderRadius:'50%',background:C.green,display:'inline-block',animation:'pulse 1.5s ease infinite' }} />
                  <span style={{ fontSize:'0.65rem',fontWeight:800,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase' }}>APEX Match Complete</span>
                </div>
                {provider && (
                  <div style={{ fontSize:'0.65rem',color:C.w40,background:'rgba(255,255,255,0.06)',borderRadius:100,padding:'4px 10px',border:`1px solid ${C.border}` }}>
                    Powered by {provider === 'claude' ? '⚡ Claude AI' : provider === 'openai' ? '🤖 GPT-4o' : '🔷 APEX Engine'}
                  </div>
                )}
              </div>
              <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)',fontWeight:900,letterSpacing:'-0.04em',color:C.white,lineHeight:1.05,marginBottom:10 }}>
                Found <span style={{ color:C.gold }}>{matches.length} agencies</span> for your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}
                {city ? <><br/><span style={{ color:C.w40 }}>in {city}, {country}</span></> : <><br/><span style={{ color:C.w40 }}>in {country}</span></>}
              </h2>
              <p style={{ fontSize:'0.85rem',color:C.w60,lineHeight:1.65 }}>
                AI-selected from 2,847+ EU agency profiles — geographic fit, property type, price band, language.
                Average APEX score: <span style={{ color:C.gold,fontWeight:700 }}>{avgScore}</span>/99.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:26 }}>
              {[
                { label:'Agencies matched', value:`${matches.length}`,      icon:'🎯' },
                { label:'Avg APEX score',   value:`${avgScore}/99`,          icon:'⚡' },
                { label:'Countries',        value:`${countries}`,            icon:'🌍' },
                { label:'Wave 1 priority',  value:`${wave1.length} agencies`,icon:'📡' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px' }}>
                  <div style={{ fontSize:'1.2rem',marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:'1.1rem',fontWeight:900,color:C.white,letterSpacing:'-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize:'0.68rem',color:C.w40,marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Wave filter */}
            <div style={{ display:'flex',gap:8,marginBottom:20,alignItems:'center',flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.7rem',color:C.w40,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase' }}>Show:</span>
              {([
                { val:0 as const, label:`All ${matches.length}`, color:C.w60 },
                { val:1 as const, label:`Wave 1 (${wave1.length})`, color:C.green },
                { val:2 as const, label:`Wave 2 (${wave2.length})`, color:C.blue },
                { val:3 as const, label:`Wave 3 (${wave3.length})`, color:C.purple },
              ]).map(tab => (
                <button key={tab.val} onClick={() => setWaveFilter(tab.val)} style={{
                  padding:'5px 14px',borderRadius:100,
                  border:`1px solid ${waveFilter===tab.val?tab.color:C.border}`,
                  background:waveFilter===tab.val?`${tab.color}18`:'transparent',
                  color:waveFilter===tab.val?tab.color:C.w60,
                  fontSize:'0.75rem',fontWeight:700,cursor:'pointer',transition:'all 0.2s',
                }}>{tab.label}</button>
              ))}
              <div style={{ marginLeft:'auto',fontSize:'0.7rem',color:C.w40 }}>🔒 Preview — not sent to anyone</div>
            </div>

            {/* Agency grid */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:10,marginBottom:40 }}>
              {filtered.map((m, i) => {
                const wColor = m.wave===1?C.green:m.wave===2?C.blue:C.purple;
                const sColor = m.score>=90?C.green:m.score>=80?C.gold:C.w60;
                return (
                  <div key={`${m.name}-${i}`} className="agency-card" style={{ opacity:i<revealed?1:0,transition:'opacity 0.3s ease' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                      <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                        <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0 }}>
                          {m.flag}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.82rem',fontWeight:700,color:C.white,lineHeight:1.2 }}>{m.name}</div>
                          <div style={{ fontSize:'0.7rem',color:C.w40,marginTop:2 }}>{m.city}, {m.country}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:'right',flexShrink:0,marginLeft:8 }}>
                        <div style={{ fontSize:'0.65rem',fontWeight:900,color:sColor,background:`${sColor}15`,padding:'2px 8px',borderRadius:5,marginBottom:4,whiteSpace:'nowrap' }}>
                          APEX {m.score}
                        </div>
                        <div style={{ fontSize:'0.6rem',fontWeight:700,color:wColor,background:`${wColor}18`,padding:'2px 8px',borderRadius:5,whiteSpace:'nowrap' }}>
                          Wave {m.wave}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize:'0.72rem',color:C.w60,marginBottom:10,lineHeight:1.4 }}>{m.spec}</div>

                    <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:8 }}>
                      {m.reasons.map((r,ri) => (
                        <span key={ri} style={{ fontSize:'0.62rem',fontWeight:600,color:C.w60,background:'rgba(255,255,255,0.07)',borderRadius:5,padding:'2px 8px' }}>
                          ✓ {r}
                        </span>
                      ))}
                      <span style={{ fontSize:'0.62rem',fontWeight:600,color:C.w60,background:'rgba(255,255,255,0.07)',borderRadius:5,padding:'2px 8px' }}>
                        🗣 {m.langs.join(' · ')}
                      </span>
                    </div>
                    {m.website && (
                      <div style={{ fontSize:'0.6rem',color:C.w40 }}>🔗 {m.website}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ background:'linear-gradient(135deg,rgba(245,194,0,0.12),rgba(245,194,0,0.04))',border:'1px solid rgba(245,194,0,0.3)',borderRadius:20,padding:'36px 32px',textAlign:'center' }}>
              <div style={{ fontSize:'2rem',marginBottom:12 }}>🚀</div>
              <h3 style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)',fontWeight:900,color:C.white,letterSpacing:'-0.03em',marginBottom:10 }}>
                Ready to launch your campaign?
              </h3>
              <p style={{ fontSize:'0.88rem',color:C.w60,maxWidth:480,margin:'0 auto 24px',lineHeight:1.65 }}>
                Create a free account, upload your property, and APEX will send personalised outreach to these {matches.length} agencies — in 3 waves, automatically.
              </p>
              <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
                <Link href="/register" style={{ display:'inline-flex',alignItems:'center',gap:8,background:C.gold,color:C.black,fontWeight:900,fontSize:'0.9rem',padding:'14px 32px',borderRadius:100,textDecoration:'none' }}>
                  Launch campaign — free →
                </Link>
                <button onClick={restart} style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.1)',color:C.white,fontWeight:700,fontSize:'0.9rem',padding:'14px 28px',borderRadius:100,border:`1px solid ${C.border2}`,cursor:'pointer' }}>
                  ↺ Try another property
                </button>
              </div>
              <p style={{ fontSize:'0.72rem',color:C.w40,marginTop:16 }}>
                First property FREE · From €4.90/mo · 1.5% success fee only on sale
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
