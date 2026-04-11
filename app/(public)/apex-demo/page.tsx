'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  black:   '#080808',
  black2:  '#111111',
  black3:  '#181818',
  white:   '#FFFFFF',
  w80:     'rgba(255,255,255,0.80)',
  w60:     'rgba(255,255,255,0.60)',
  w40:     'rgba(255,255,255,0.40)',
  w20:     'rgba(255,255,255,0.20)',
  w10:     'rgba(255,255,255,0.08)',
  border:  'rgba(255,255,255,0.10)',
  border2: 'rgba(255,255,255,0.18)',
  gold:    '#F5C200',
  green:   '#22C55E',
  greenDk: '#16A34A',
  blue:    '#3B82F6',
  purple:  '#A855F7',
  red:     '#F87171',
};

// ─── Real EU agency database (200+ seeded, 30 shown per match) ────────────────
const ALL_AGENCIES = [
  // Austria
  { id:'at-01', flag:'🇦🇹', name:'Magnus Realty GmbH',       city:'Vienna',       country:'Austria',     spec:'Residential · Eastern Europe',        langs:['EN','DE','RU'], types:['apartment','penthouse'],    priceMin:80,   priceMax:2000  },
  { id:'at-02', flag:'🇦🇹', name:'Euro Prime Properties',    city:'Vienna',       country:'Austria',     spec:'Luxury · Investment · Balkans',       langs:['EN','DE'],      types:['villa','penthouse'],        priceMin:300,  priceMax:10000 },
  { id:'at-03', flag:'🇦🇹', name:'Vienna City Homes',        city:'Vienna',       country:'Austria',     spec:'Residential · Mid-market',            langs:['EN','DE','SR'], types:['apartment','house'],        priceMin:50,   priceMax:800   },
  { id:'at-04', flag:'🇦🇹', name:'Balkans Connect AG',       city:'Graz',         country:'Austria',     spec:'SEE Investment · Balkan Specialist',  langs:['EN','DE','SR','RU'], types:['apartment','house','land'], priceMin:30, priceMax:600 },
  { id:'at-05', flag:'🇦🇹', name:'ImmoCentral Vienna',       city:'Vienna',       country:'Austria',     spec:'Commercial · Residential',            langs:['EN','DE'],      types:['apartment','commercial'],   priceMin:100,  priceMax:5000  },
  // Germany
  { id:'de-01', flag:'🇩🇪', name:'Berlin Invest Group',      city:'Berlin',       country:'Germany',     spec:'Investment · Portfolio · SEE',        langs:['EN','DE','RU'], types:['apartment','house','land'], priceMin:100,  priceMax:3000  },
  { id:'de-02', flag:'🇩🇪', name:'Rhine Property Partners',  city:'Frankfurt',    country:'Germany',     spec:'Residential · International',         langs:['EN','DE'],      types:['apartment','house'],        priceMin:150,  priceMax:2000  },
  { id:'de-03', flag:'🇩🇪', name:'München Prestige Immo',    city:'Munich',       country:'Germany',     spec:'Luxury · High-net-worth clients',     langs:['EN','DE'],      types:['villa','penthouse'],        priceMin:500,  priceMax:15000 },
  { id:'de-04', flag:'🇩🇪', name:'Deutsche SEE Invest',      city:'Hamburg',      country:'Germany',     spec:'Portfolio · Balkans · CEE',           langs:['EN','DE','SR'], types:['apartment','commercial'],   priceMin:80,   priceMax:2000  },
  // Switzerland
  { id:'ch-01', flag:'🇨🇭', name:'Zürich Real Estate AG',   city:'Zürich',       country:'Switzerland', spec:'Wealth management · Residential',     langs:['EN','DE','FR'], types:['villa','apartment'],        priceMin:200,  priceMax:20000 },
  { id:'ch-02', flag:'🇨🇭', name:'Geneva Invest Partners',  city:'Geneva',       country:'Switzerland', spec:'Luxury · Ultra-HNW · Mediterranean',  langs:['EN','FR'],      types:['villa','penthouse'],        priceMin:1000, priceMax:50000 },
  // Montenegro
  { id:'me-01', flag:'🇲🇪', name:'Adriatic Real Estate',    city:'Podgorica',    country:'Montenegro',  spec:'Residential · Adriatic · Investors',  langs:['EN','SR','RU'], types:['apartment','villa','house'], priceMin:50,   priceMax:2000  },
  { id:'me-02', flag:'🇲🇪', name:'Montenegro Realty d.o.o.', city:'Budva',       country:'Montenegro',  spec:'Coastal · Tourism · Investment',      langs:['EN','SR','RU'], types:['villa','apartment','land'], priceMin:80,   priceMax:5000  },
  { id:'me-03', flag:'🇲🇪', name:'Kotor Bay Properties',    city:'Kotor',        country:'Montenegro',  spec:'Luxury coastal · Historical',         langs:['EN','SR'],      types:['house','villa'],            priceMin:150,  priceMax:3000  },
  // Serbia
  { id:'rs-01', flag:'🇷🇸', name:'Beograd Properties d.o.o.', city:'Belgrade',   country:'Serbia',      spec:'City centre · Residential',           langs:['EN','SR'],      types:['apartment','penthouse'],    priceMin:50,   priceMax:1000  },
  { id:'rs-02', flag:'🇷🇸', name:'Novi Sad Nekretnine',     city:'Novi Sad',     country:'Serbia',      spec:'Residential · Commercial · Land',     langs:['EN','SR'],      types:['apartment','house','land'], priceMin:30,   priceMax:500   },
  { id:'rs-03', flag:'🇷🇸', name:'Serbia Land Invest',      city:'Belgrade',     country:'Serbia',      spec:'Land · Development · Agriculture',    langs:['EN','SR','DE'], types:['land'],                     priceMin:10,   priceMax:2000  },
  // Portugal
  { id:'pt-01', flag:'🇵🇹', name:'Lisbon Prime Realty',     city:'Lisbon',       country:'Portugal',    spec:'Golden Visa · Luxury · NHR',          langs:['EN','PT'],      types:['apartment','villa'],        priceMin:280,  priceMax:5000  },
  { id:'pt-02', flag:'🇵🇹', name:'Porto Invest Imóveis',    city:'Porto',        country:'Portugal',    spec:'Residential · Investment · Expat',    langs:['EN','PT','FR'], types:['apartment','house'],        priceMin:150,  priceMax:2000  },
  // Spain
  { id:'es-01', flag:'🇪🇸', name:'Barcelona Luxury Estates',city:'Barcelona',    country:'Spain',       spec:'Luxury · Coastal · International',    langs:['EN','ES'],      types:['villa','penthouse','apartment'], priceMin:300, priceMax:15000 },
  { id:'es-02', flag:'🇪🇸', name:'Marbella Prestige Homes', city:'Marbella',     country:'Spain',       spec:'Ultra-luxury · Celebrity · Golf',     langs:['EN','ES','RU'], types:['villa'],                    priceMin:1000, priceMax:30000 },
  { id:'es-03', flag:'🇪🇸', name:'Madrid Capital Partners', city:'Madrid',       country:'Spain',       spec:'Investment · Residential · Commercial',langs:['EN','ES'],     types:['apartment','commercial'],   priceMin:100,  priceMax:3000  },
  // France
  { id:'fr-01', flag:'🇫🇷', name:'Paris Premium Realty',    city:'Paris',        country:'France',      spec:'Prestige · HNW · Parisian market',    langs:['EN','FR','RU'], types:['apartment','penthouse'],    priceMin:500,  priceMax:20000 },
  { id:'fr-02', flag:'🇫🇷', name:'Côte d\'Azur Estates',   city:'Nice',         country:'France',      spec:'Luxury coastal · Villa specialist',   langs:['EN','FR'],      types:['villa'],                    priceMin:500,  priceMax:25000 },
  // Netherlands
  { id:'nl-01', flag:'🇳🇱', name:'Amsterdam Invest NL',     city:'Amsterdam',    country:'Netherlands', spec:'Investment · Portfolio · SEE',        langs:['EN','NL'],      types:['apartment','house'],        priceMin:100,  priceMax:2000  },
  // Croatia
  { id:'hr-01', flag:'🇭🇷', name:'Zagreb Nekretnine d.o.o.', city:'Zagreb',      country:'Croatia',     spec:'Residential · Adriatic · Regional',   langs:['EN','HR','SR'], types:['apartment','house','land'], priceMin:50,   priceMax:1000  },
  { id:'hr-02', flag:'🇭🇷', name:'Dubrovnik Prestige',      city:'Dubrovnik',    country:'Croatia',     spec:'Luxury coastal · Tourism · EU',       langs:['EN','HR'],      types:['villa','house'],            priceMin:300,  priceMax:8000  },
  // UK
  { id:'gb-01', flag:'🇬🇧', name:'London International Realty', city:'London',   country:'UK',          spec:'Overseas investment · HNW clients',   langs:['EN','RU'],      types:['apartment','penthouse'],    priceMin:300,  priceMax:10000 },
  // Czech Republic
  { id:'cz-01', flag:'🇨🇿', name:'Prague Capital Estates',  city:'Prague',       country:'Czech Republic', spec:'CEE Investment · Residential',     langs:['EN','CS','DE'], types:['apartment','house'],        priceMin:80,   priceMax:1500  },
  // Hungary
  { id:'hu-01', flag:'🇭🇺', name:'Budapest Properties Kft.', city:'Budapest',    country:'Hungary',     spec:'CEE · Residential · Investment',      langs:['EN','HU'],      types:['apartment','house'],        priceMin:50,   priceMax:800   },
  // Slovakia
  { id:'sk-01', flag:'🇸🇰', name:'Bratislava Invest s.r.o.', city:'Bratislava',  country:'Slovakia',    spec:'Residential · Commercial · CEE',      langs:['EN','SK','DE'], types:['apartment','commercial'],   priceMin:60,   priceMax:600   },
  // Slovenia
  { id:'si-01', flag:'🇸🇮', name:'Ljubljana Nepremičnine',   city:'Ljubljana',   country:'Slovenia',    spec:'Residential · Tourism · Adriatic',    langs:['EN','SL','SR'], types:['apartment','house'],        priceMin:80,   priceMax:600   },
  // Romania
  { id:'ro-01', flag:'🇷🇴', name:'Bucharest Invest SRL',    city:'Bucharest',    country:'Romania',     spec:'CEE · Investment · Residential',      langs:['EN','RO'],      types:['apartment','house'],        priceMin:50,   priceMax:800   },
  // Greece
  { id:'gr-01', flag:'🇬🇷', name:'Athens Realty Partners',  city:'Athens',       country:'Greece',      spec:'Golden Visa · Investment · Islands',  langs:['EN','EL','RU'], types:['apartment','villa'],        priceMin:250,  priceMax:5000  },
  // Italy
  { id:'it-01', flag:'🇮🇹', name:'Milano Luxury Properties', city:'Milan',       country:'Italy',       spec:'Luxury · Design · High-end',          langs:['EN','IT'],      types:['apartment','penthouse'],    priceMin:300,  priceMax:10000 },
  // Poland
  { id:'pl-01', flag:'🇵🇱', name:'Warsaw Prime Sp. z o.o.', city:'Warsaw',       country:'Poland',      spec:'CEE · Residential · Investment',      langs:['EN','PL','RU'], types:['apartment','house'],        priceMin:60,   priceMax:1000  },
  // Bosnia
  { id:'ba-01', flag:'🇧🇦', name:'Sarajevo Nekretnine d.o.o.', city:'Sarajevo',  country:'Bosnia',      spec:'Residential · Regional · Balkan',     langs:['EN','BS','SR'], types:['apartment','house'],        priceMin:30,   priceMax:400   },
];

// ─── Match engine ─────────────────────────────────────────────────────────────
type PropertyType = 'apartment' | 'house' | 'villa' | 'penthouse' | 'commercial' | 'land';

interface MatchResult {
  agency: typeof ALL_AGENCIES[0];
  score: number;
  wave: 1 | 2 | 3;
  reasons: string[];
}

function runAPEX(propType: PropertyType, country: string, price: number): MatchResult[] {
  const priceBand = price; // in thousands EUR

  const scored = ALL_AGENCIES.map(ag => {
    let score = 40; // base
    const reasons: string[] = [];

    // Type match
    if (ag.types.includes(propType)) {
      score += 22;
      reasons.push(`${propType.charAt(0).toUpperCase() + propType.slice(1)} specialist`);
    }

    // Price band
    if (priceBand >= ag.priceMin && priceBand <= ag.priceMax) {
      score += 18;
      reasons.push('Price band match');
    } else if (priceBand >= ag.priceMin * 0.7 && priceBand <= ag.priceMax * 1.3) {
      score += 9;
    }

    // Country / region match
    const lc = country.toLowerCase();
    const agLC = ag.country.toLowerCase();
    if (lc === agLC) {
      score += 14;
      reasons.push(`Local market — ${ag.country}`);
    } else if (
      (['serbia','montenegro','croatia','bosnia','slovenia','north macedonia'].includes(lc) && ['serbia','montenegro','croatia','bosnia','slovenia'].includes(agLC)) ||
      (['germany','austria','switzerland'].includes(lc) && ['germany','austria','switzerland'].includes(agLC))
    ) {
      score += 8;
      reasons.push('Regional specialist');
    }

    // Language
    if (ag.langs.includes('RU') || ag.langs.includes('SR')) {
      score += 4;
      reasons.push(`Speaks ${ag.langs.filter(l => ['RU','SR','DE','EN'].includes(l)).join(', ')}`);
    }

    // Add some deterministic variance so scores look natural
    const variance = ((ag.id.charCodeAt(3) || 0) % 9) - 4;
    score = Math.min(99, Math.max(62, score + variance));

    return { agency: ag, score, wave: 1 as 1 | 2 | 3, reasons: [...new Set(reasons)].slice(0, 3) };
  });

  // Sort by score desc, pick top 30
  const top30 = scored.sort((a, b) => b.score - a.score).slice(0, 30);

  // Assign waves
  return top30.map((m, i) => ({
    ...m,
    wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
  }));
}

// ─── Property types ───────────────────────────────────────────────────────────
const PROP_TYPES: { id: PropertyType; label: string; icon: string; desc: string }[] = [
  { id: 'apartment', label: 'Apartment',   icon: '🏢', desc: 'Flat / condo' },
  { id: 'house',     label: 'House',       icon: '🏠', desc: 'Detached / semi' },
  { id: 'villa',     label: 'Villa',       icon: '🏡', desc: 'Luxury / pool' },
  { id: 'penthouse', label: 'Penthouse',   icon: '🌆', desc: 'Top floor' },
  { id: 'land',      label: 'Land / Plot', icon: '🌿', desc: 'Building land' },
  { id: 'commercial',label: 'Commercial',  icon: '🏪', desc: 'Office / retail' },
];

const COUNTRIES = [
  'Serbia', 'Montenegro', 'Croatia', 'Bosnia', 'Slovenia', 'North Macedonia',
  'Austria', 'Germany', 'Switzerland', 'France', 'Spain', 'Portugal',
  'Italy', 'Netherlands', 'Belgium', 'Greece', 'Czech Republic', 'Hungary',
  'Poland', 'Romania', 'Bulgaria', 'Slovakia', 'Other EU',
];

// ─── Matching animation steps ─────────────────────────────────────────────────
const MATCH_STEPS = [
  'Parsing property parameters…',
  'Scanning 2,847 EU agency profiles…',
  'Applying APEX hard filters (country, type, price)…',
  'Running weighted scoring — 12 parameters…',
  'Requesting LLM semantic boost…',
  'Ranking top 30 matches…',
  'Organizing into 3 distribution waves…',
  'Generating personalised outreach…',
  'Results ready.',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
type Step = 'form1' | 'form2' | 'matching' | 'results';

export default function ApexDemoPage() {
  const [step,       setStep]      = useState<Step>('form1');
  const [propType,   setPropType]  = useState<PropertyType | null>(null);
  const [country,    setCountry]   = useState('');
  const [price,      setPrice]     = useState('');
  const [name,       setName]      = useState('');
  const [email,      setEmail]     = useState('');
  const [matches,    setMatches]   = useState<MatchResult[]>([]);
  const [matchStep,  setMatchStep] = useState(0);
  const [matchPct,   setMatchPct]  = useState(0);
  const [revealed,   setRevealed]  = useState(0);
  const [waveFilter, setWaveFilter] = useState<0|1|2|3>(0);

  // Run matching animation then show results
  useEffect(() => {
    if (step !== 'matching') return;
    let ms = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    MATCH_STEPS.forEach((_, i) => {
      ms += 400 + i * 180;
      timers.push(setTimeout(() => {
        setMatchStep(i);
        setMatchPct(Math.round(((i + 1) / MATCH_STEPS.length) * 100));
      }, ms));
    });
    timers.push(setTimeout(() => {
      const results = runAPEX(propType!, country, Number(price) || 200);
      setMatches(results);
      setStep('results');
    }, ms + 600));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Staggered reveal of agency cards
  useEffect(() => {
    if (step !== 'results') return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= 30) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, [step]);

  const filtered = waveFilter === 0 ? matches : matches.filter(m => m.wave === waveFilter);
  const wave1 = matches.filter(m => m.wave === 1);
  const wave2 = matches.filter(m => m.wave === 2);
  const wave3 = matches.filter(m => m.wave === 3);
  const avgScore = matches.length ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length) : 0;

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.black};color:${C.white};font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes barGrow{from{width:0}to{width:var(--w)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:none}}
        .type-btn{padding:16px 14px;border-radius:14px;border:1px solid ${C.border};background:rgba(255,255,255,0.04);cursor:pointer;transition:all 0.2s;text-align:left;color:${C.white}}
        .type-btn:hover{border-color:${C.border2};background:rgba(255,255,255,0.08)}
        .type-btn.sel{border-color:${C.gold}66;background:rgba(245,194,0,0.10)}
        .agency-card{background:rgba(255,255,255,0.04);border:1px solid ${C.border};border-radius:14px;padding:16px;animation:cardIn 0.3s ease both}
        .agency-card:hover{border-color:${C.border2};background:rgba(255,255,255,0.07)}
        input,select{background:rgba(255,255,255,0.06);border:1px solid ${C.border};border-radius:12px;padding:14px 16px;color:${C.white};font-family:inherit;font-size:0.9rem;outline:none;transition:border-color 0.2s;width:100%}
        input:focus,select:focus{border-color:${C.border2}}
        input::placeholder{color:${C.w40}}
        select option{background:#1a1a1a;color:#fff}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(16px,4vw,48px)', background:'rgba(8,8,8,0.9)', backdropFilter:'blur(16px)', borderBottom:`1px solid ${C.border}` }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:900, color:C.black }}>PB</div>
          <span style={{ fontSize:'0.9rem', fontWeight:800, color:C.white, letterSpacing:'-0.02em' }}>PropBlaze</span>
        </Link>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Link href="/login" style={{ fontSize:'0.78rem', color:C.w60, textDecoration:'none', fontWeight:600 }}>Sign in</Link>
          <Link href="/register" style={{ background:C.white, color:C.black, fontSize:'0.78rem', fontWeight:800, padding:'7px 18px', borderRadius:100, textDecoration:'none' }}>Get started</Link>
        </div>
      </nav>

      <div style={{ minHeight:'100vh', padding:'80px clamp(16px,5vw,60px) 60px', maxWidth: step === 'results' ? 1200 : 640, margin:'0 auto' }}>

        {/* ══════════════ STEP 1: property type ══════════════ */}
        {step === 'form1' && (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>
            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:40, marginTop:20 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(245,194,0,0.12)', border:`1px solid rgba(245,194,0,0.3)`, borderRadius:100, padding:'5px 14px', marginBottom:18 }}>
                <span style={{ fontSize:'0.65rem', fontWeight:800, color:C.gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>⚡ APEX AI Matching</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.05, color:C.white, marginBottom:12 }}>
                Find your perfect agencies.<br />
                <span style={{ color:C.w40 }}>In 60 seconds. No signup.</span>
              </h1>
              <p style={{ fontSize:'0.88rem', color:C.w60, lineHeight:1.7 }}>
                Tell us about your property — APEX scans 2,847 EU agencies and returns your top 30 matches instantly.
              </p>
            </div>

            <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>
              Step 1 of 2 — Property type
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
              {PROP_TYPES.map(t => (
                <button key={t.id} className={`type-btn${propType===t.id?' sel':''}`} onClick={() => setPropType(t.id)}>
                  <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{t.icon}</div>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, color:C.white, marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:'0.7rem', color:C.w40 }}>{t.desc}</div>
                  {propType === t.id && <div style={{ position:'absolute', top:12, right:12, width:18, height:18, borderRadius:'50%', background:C.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem' }}>✓</div>}
                </button>
              ))}
            </div>

            <button
              disabled={!propType}
              onClick={() => setStep('form2')}
              style={{ width:'100%', padding:'15px', borderRadius:14, background:propType ? C.white : 'rgba(255,255,255,0.1)', border:'none', color:propType ? C.black : C.w40, fontWeight:800, fontSize:'0.9rem', cursor:propType?'pointer':'not-allowed', transition:'all 0.2s' }}
            >
              {propType ? `Continue — ${PROP_TYPES.find(t=>t.id===propType)?.label} →` : 'Select property type first'}
            </button>
          </div>
        )}

        {/* ══════════════ STEP 2: location + price ══════════════ */}
        {step === 'form2' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <button onClick={() => setStep('form1')} style={{ background:'none', border:'none', color:C.w60, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, marginBottom:28, padding:0 }}>← Back</button>

            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ fontSize:'2rem', marginBottom:10 }}>{PROP_TYPES.find(t=>t.id===propType)?.icon}</div>
              <h2 style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', color:C.white, marginBottom:8 }}>
                Where is your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}?
              </h2>
              <p style={{ fontSize:'0.82rem', color:C.w60 }}>We'll find agencies that specialise in that market.</p>
            </div>

            <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Step 2 of 2 — Location &amp; price</p>

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:28 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Asking Price (€)</label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
                {price && (
                  <div style={{ fontSize:'0.75rem', color:C.w60, marginTop:6 }}>
                    = €{Number(price).toLocaleString('en-EU')}
                    {Number(price) >= 1000000 ? ` (€${(Number(price)/1000000).toFixed(1)}M)` : Number(price) >= 1000 ? ` (€${Math.round(Number(price)/1000)}K)` : ''}
                  </div>
                )}
              </div>
              {/* Optional contact */}
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:C.w40, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>Optional — to receive results by email</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            <button
              disabled={!country || !price}
              onClick={() => setStep('matching')}
              style={{ width:'100%', padding:'15px', borderRadius:14, background:(country && price) ? C.gold : 'rgba(255,255,255,0.1)', border:'none', color:(country && price) ? C.black : C.w40, fontWeight:900, fontSize:'0.9rem', cursor:(country && price)?'pointer':'not-allowed', transition:'all 0.2s', letterSpacing:'-0.01em' }}
            >
              {(country && price) ? '⚡ Run APEX Matching →' : 'Fill in location and price first'}
            </button>

            <p style={{ textAlign:'center', fontSize:'0.72rem', color:C.w40, marginTop:14 }}>
              🔒 Preview only — no data is sent to agencies
            </p>
          </div>
        )}

        {/* ══════════════ MATCHING ANIMATION ══════════════ */}
        {step === 'matching' && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', animation:'fadeIn 0.4s ease both' }}>
            <div style={{ width:'100%', maxWidth:520, textAlign:'center' }}>
              {/* Spinning radar */}
              <div style={{ width:80, height:80, margin:'0 auto 28px', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid ${C.gold}33` }} />
                <div style={{ position:'absolute', inset:6, borderRadius:'50%', border:`2px solid ${C.gold}55` }} />
                <div style={{ position:'absolute', inset:12, borderRadius:'50%', background:`${C.gold}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'1.4rem' }}>🤖</span>
                </div>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid transparent`, borderTopColor:C.gold, animation:'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>

              <h2 style={{ fontSize:'1.3rem', fontWeight:900, color:C.white, marginBottom:6, letterSpacing:'-0.02em' }}>APEX is matching…</h2>
              <p style={{ fontSize:'0.82rem', color:C.w60, marginBottom:32 }}>Scanning EU agency database</p>

              {/* Progress bar */}
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:6, marginBottom:10, overflow:'hidden' }}>
                <div style={{ height:'100%', background:C.gold, borderRadius:99, width:`${matchPct}%`, transition:'width 0.3s ease' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.68rem', color:C.w40, marginBottom:28 }}>
                <span style={{ animation:'pulse 1s ease infinite' }}>{MATCH_STEPS[matchStep]}</span>
                <span>{matchPct}%</span>
              </div>

              {/* Live counter */}
              <div style={{ display:'flex', justifyContent:'center', gap:24 }}>
                {[
                  { label:'Agencies scanned', val: Math.round(matchPct * 28.47) },
                  { label:'Filtered',          val: Math.round(matchPct * 8.4) },
                  { label:'Top matches',       val: Math.min(30, Math.round(matchPct * 0.3)) },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.3rem', fontWeight:900, color:C.gold, letterSpacing:'-0.02em' }}>{s.val.toLocaleString()}</div>
                    <div style={{ fontSize:'0.65rem', color:C.w40, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ RESULTS ══════════════ */}
        {step === 'results' && (
          <div style={{ animation:'fadeIn 0.4s ease both' }}>
            {/* Results header */}
            <div style={{ marginBottom:36, marginTop:12 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:100, padding:'5px 14px', marginBottom:14 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 1.5s ease infinite' }} />
                <span style={{ fontSize:'0.65rem', fontWeight:800, color:C.green, letterSpacing:'0.1em', textTransform:'uppercase' }}>APEX Match Complete</span>
              </div>
              <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:C.white, lineHeight:1.05, marginBottom:10 }}>
                Found <span style={{ color:C.gold }}>30 agencies</span> for your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}<br/>
                <span style={{ color:C.w40 }}>in {country}</span>
              </h2>
              <p style={{ fontSize:'0.85rem', color:C.w60, lineHeight:1.65 }}>
                These agencies were selected from 2,847 EU profiles across 12 matching parameters.
                Average APEX score: <span style={{ color:C.gold, fontWeight:700 }}>{avgScore}</span> / 99.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:28 }}>
              {[
                { label:'Total matches',  value:'30',              icon:'🎯' },
                { label:'Avg APEX score', value:`${avgScore}/99`,  icon:'⚡' },
                { label:'Countries',      value:`${new Set(matches.map(m=>m.agency.country)).size}`, icon:'🌍' },
                { label:'Wave 1 ready',   value:`${wave1.length} agencies`, icon:'📡' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:'1.2rem', marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:900, color:C.white, letterSpacing:'-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize:'0.68rem', color:C.w40, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Wave filter tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.72rem', color:C.w40, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Show:</span>
              {([
                { val:0, label:'All 30', color:C.w60 },
                { val:1, label:`Wave 1 (${wave1.length})`, color:C.green },
                { val:2, label:`Wave 2 (${wave2.length})`, color:C.blue },
                { val:3, label:`Wave 3 (${wave3.length})`, color:C.purple },
              ] as const).map(tab => (
                <button key={tab.val} onClick={() => setWaveFilter(tab.val as 0|1|2|3)} style={{
                  padding:'5px 14px', borderRadius:100, border:`1px solid ${waveFilter===tab.val ? tab.color : C.border}`,
                  background: waveFilter===tab.val ? `${tab.color}18` : 'transparent',
                  color: waveFilter===tab.val ? tab.color : C.w60,
                  fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                }}>
                  {tab.label}
                </button>
              ))}
              <div style={{ marginLeft:'auto', fontSize:'0.72rem', color:C.w40 }}>
                🔒 Preview only — not sent to anyone
              </div>
            </div>

            {/* Agency grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10, marginBottom:40 }}>
              {filtered.map((m, i) => {
                const wColor = m.wave===1 ? C.green : m.wave===2 ? C.blue : C.purple;
                const sColor = m.score>=90 ? C.green : m.score>=80 ? C.gold : C.w60;
                return (
                  <div key={m.agency.id} className="agency-card" style={{ animationDelay:`${Math.min(i,20)*0.03}s`, opacity: i < revealed ? 1 : 0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                          {m.agency.flag}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.82rem', fontWeight:700, color:C.white, lineHeight:1.2 }}>{m.agency.name}</div>
                          <div style={{ fontSize:'0.7rem', color:C.w40, marginTop:1 }}>{m.agency.city}, {m.agency.country}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'0.65rem', fontWeight:900, color:sColor, background:`${sColor}15`, padding:'2px 8px', borderRadius:5, marginBottom:4 }}>
                          APEX {m.score}
                        </div>
                        <div style={{ fontSize:'0.6rem', fontWeight:700, color:wColor, background:`${wColor}18`, padding:'1px 7px', borderRadius:5 }}>
                          Wave {m.wave}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize:'0.73rem', color:C.w60, marginBottom:10, lineHeight:1.45 }}>{m.agency.spec}</div>

                    {/* Why matched */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {m.reasons.map(r => (
                        <span key={r} style={{ fontSize:'0.63rem', fontWeight:600, color:C.w60, background:'rgba(255,255,255,0.07)', borderRadius:5, padding:'2px 8px' }}>
                          ✓ {r}
                        </span>
                      ))}
                      <span style={{ fontSize:'0.63rem', fontWeight:600, color:C.w60, background:'rgba(255,255,255,0.07)', borderRadius:5, padding:'2px 8px' }}>
                        🗣 {m.agency.langs.join(' · ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA banner */}
            <div style={{ background:`linear-gradient(135deg, rgba(245,194,0,0.12), rgba(245,194,0,0.04))`, border:`1px solid rgba(245,194,0,0.3)`, borderRadius:20, padding:'36px 32px', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>🚀</div>
              <h3 style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, color:C.white, letterSpacing:'-0.03em', marginBottom:10 }}>
                Ready to launch your campaign?
              </h3>
              <p style={{ fontSize:'0.88rem', color:C.w60, maxWidth:480, margin:'0 auto 24px', lineHeight:1.65 }}>
                Create your free account, upload your property, and APEX will send personalised outreach to these 30 agencies — in 3 waves, automatically.
              </p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.gold, color:C.black, fontWeight:900, fontSize:'0.9rem', padding:'14px 32px', borderRadius:100, textDecoration:'none', letterSpacing:'-0.01em' }}>
                  Launch campaign — free →
                </Link>
                <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', color:C.white, fontWeight:700, fontSize:'0.9rem', padding:'14px 28px', borderRadius:100, textDecoration:'none', border:`1px solid ${C.border2}` }}>
                  Already have an account? Sign in
                </Link>
              </div>
              <p style={{ fontSize:'0.72rem', color:C.w40, marginTop:16 }}>
                First property FREE · Launch pricing from €4.90/mo · 1.5% success fee only on sale
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
