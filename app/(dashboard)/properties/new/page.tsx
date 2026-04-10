'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_AGENCY_POOL } from '@/lib/ai-matching/demo-agencies';

// ─── Design tokens (light premium) ───────────────────────────────────────────
const C = {
  bg:           '#F5F7FF',
  surface:      '#FFFFFF',
  surface2:     '#F0F4FF',
  border:       '#E2E8F8',
  borderFocus:  '#F97316',
  text:         '#1A1F2E',
  textSec:      '#6B7A99',
  textTer:      '#9BA8C0',
  primary:      '#F97316',
  primaryHov:   '#EA580C',
  primaryLight: '#FFF3E8',
  primaryBorder:'#FDD0A8',
  green:        '#16A34A',
  greenLight:   '#F0FDF4',
  greenBorder:  '#86EFAC',
  red:          '#DC2626',
  blue:         '#2563EB',
  blueLight:    '#EFF6FF',
  gold:         '#F59E0B',
  goldLight:    '#FFFBEB',
  shadow:       '0 4px 24px rgba(26,31,46,0.08)',
  shadowLg:     '0 8px 40px rgba(26,31,46,0.12)',
};

// ─── Quick-start description hints by property type ───────────────────────────
const HINTS: Record<string, string[]> = {
  Apartment: [
    'Renovated city-centre apartment, 5th floor, new kitchen, great natural light.',
    'Bright 2-bed flat near metro. Brand new bathrooms. Investment-ready.',
    'Penthouse with panoramic views. Modern finishes throughout.',
  ],
  Villa: [
    'Sea-view villa with private pool, 4 beds, mature garden, gated.',
    'Luxury countryside villa. Pool, BBQ, 2000m² plot. Quiet location.',
    'Architect-designed villa with smart home system and sea terrace.',
  ],
  House: [
    'Detached family house, large garden, parking, renovated in 2022.',
    'Traditional stone house in old town. Authentic character with modern comforts.',
    '3-storey townhouse with rooftop terrace and city views.',
  ],
  Land: [
    'Sea-view plot with building permit approved. Utilities connected.',
    'Flat agricultural land, road access, electricity. Ideal for development.',
    'Hillside plot with breathtaking views. No permit yet — investment potential.',
  ],
  Commercial: [
    'Prime retail unit on main pedestrian street. High footfall.',
    'Modern office space in business park. 200m², parking, fibre.',
    'Restaurant premises with full kitchen. Turnkey ready to operate.',
  ],
};

const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Land', 'Commercial'];
const COUNTRIES = [
  'Serbia','Montenegro','Croatia','Slovenia','Bosnia','North Macedonia',
  'Greece','Germany','Austria','France','Italy','Spain','Portugal',
  'Netherlands','Belgium','Poland','Czech Republic','Other',
];
const FEATURES_BY_TYPE: Record<string, string[]> = {
  Apartment: ['Balcony','Terrace','Elevator','Parking','Pool','Gym','Sea view','Mountain view','Concierge','Smart home','Air conditioning','Storage'],
  Villa:     ['Pool','Sea view','Garden','Terrace','BBQ','Garage','Smart home','Solar panels','Sauna','Security system'],
  House:     ['Garden','Garage','Pool','Terrace','Basement','Solar panels','Security system','Underfloor heating'],
  Land:      ['Sea view','Mountain view','Road access','Utilities connected','Building permit','Flat terrain','Fenced'],
  Commercial:['Parking','Open plan','HVAC','Generator','Security system','3-phase power','Server room','Shop front'],
};

interface PropertyData {
  type:      string;
  address:   string;
  city:      string;
  country:   string;
  areaSqm:   number;
  bedrooms:  number;
  bathrooms: number;
  mode:      'sale' | 'rent';
  price:     number;
  currency:  'EUR' | 'USD' | 'CHF' | 'RSD';
  yearBuilt: string;
  condition: string;
  features:  string[];
}

interface AIPackData {
  headline:            string;
  description:         string;
  keyFeatures:         string[];
  investmentHighlights:string[];
  targetBuyerProfile:  string;
}

const STEP_LABELS = ['Property', 'AI Pack', 'Photos', 'Launch'];

// ─── Input helper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>
        {label} {required && <span style={{ color:C.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'11px 14px', border:`1.5px solid ${C.border}`,
  borderRadius:10, fontSize:14, color:C.text, background:C.surface,
  boxSizing:'border-box', outline:'none', transition:'border-color 0.2s',
  fontFamily:'inherit',
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer' };

// ─── Main component ───────────────────────────────────────────────────────────
export default function PropertiesNewPage() {
  const router = useRouter();
  const [step, setStep]               = useState(0);
  const [savedAt, setSavedAt]         = useState<Date | null>(null);

  const [property, setProperty]       = useState<PropertyData>({
    type:'Apartment', address:'Knez Mihailova 28', city:'Belgrade', country:'Serbia',
    areaSqm:75, bedrooms:2, bathrooms:1, mode:'sale', price:145000, currency:'EUR',
    yearBuilt:'2018', condition:'Renovated', features:[],
  });

  const [shortDesc, setShortDesc]     = useState('Renovated city-centre apartment in Belgrade\'s pedestrian zone. Floor 5, high ceilings, new kitchen. 5 min to Kalemegdan.');
  const [aiPackData, setAIPackData]   = useState<AIPackData | null>(null);
  const [aiStatus, setAIStatus]       = useState<'idle'|'typing'|'generating'|'done'>('idle');
  const [photos, setPhotos]           = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [done, setDone]               = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [matchedAgencies, setMatchedAgencies] = useState<typeof DEMO_AGENCY_POOL>([]);
  const [hintIdx, setHintIdx]         = useState(0);
  const aiTimerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save indicator
  useEffect(() => {
    const t = setTimeout(() => setSavedAt(new Date()), 1200);
    return () => clearTimeout(t);
  }, [property, shortDesc, photos]);

  // AI auto-trigger: when shortDesc has ≥ 20 chars, wait 1.5s idle then auto-generate
  useEffect(() => {
    if (step !== 1) return;
    if (shortDesc.length < 20) { setAIStatus('typing'); return; }
    setAIStatus('typing');
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      if (!aiPackData) triggerGenerateAI();
    }, 1800);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [shortDesc, step]);

  // Pre-compute matched agencies for launch step
  useEffect(() => {
    if (step === 3) {
      const pool = DEMO_AGENCY_POOL.filter(a => a.is_active && a.contact_policy !== 'blacklisted');
      const sorted = [...pool].sort((a, b) => b.quality_score - a.quality_score).slice(0, 12);
      setMatchedAgencies(sorted);
    }
  }, [step]);

  const triggerGenerateAI = useCallback(async () => {
    setAIStatus('generating');
    try {
      const res = await fetch('/api/generate-pack', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ property, shortDesc }),
      });
      const data = await res.json();
      if (data?.headline) {
        setAIPackData({ headline: data.headline, description: data.description || '',
          keyFeatures: data.keyFeatures || [], investmentHighlights: data.investmentHighlights || [],
          targetBuyerProfile: data.targetBuyerProfile || '' });
        setAIStatus('done');
        return;
      }
    } catch { /* fall through to local template */ }
    // Local fallback — instant result, never blocks user
    setAIPackData({
      headline: `${property.type} in ${property.city} — ${property.mode === 'sale' ? 'Premium Investment' : 'Rental'} Opportunity`,
      description: `Premium ${property.type.toLowerCase()} offering ${property.areaSqm}m² in ${property.city}, ${property.country}. ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms. ${shortDesc}. Exceptional location with strong market fundamentals.`,
      keyFeatures: [`${property.areaSqm}m² of premium living space`, `${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms`, `Prime ${property.city} location`, 'Modern finishes throughout', 'Strong rental & resale potential'],
      investmentHighlights: [`${property.mode === 'sale' ? 'Below market average price/m²' : 'Gross yield est. 6–8%'}`, 'Growing expat and tourist demand', 'Strong currency — EUR pricing'],
      targetBuyerProfile: `EU investors and expats seeking quality ${property.type.toLowerCase()} in ${property.country}`,
    });
    setAIStatus('done');
  }, [property, shortDesc]);

  const regenerateAI = () => {
    setAIPackData(null);
    setAIStatus('idle');
    triggerGenerateAI();
  };

  // Voice dictation
  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported on this browser. Try Chrome.'); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onend   = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setShortDesc(p => p ? p + ' ' + t : t);
      setAIPackData(null);
    };
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file); fd.append('bucket', 'property-photos'); fd.append('path', `prop-${Date.now()}`);
        const res = await fetch('/api/upload', { method:'POST', body:fd });
        const d = await res.json();
        uploaded.push(d.url || URL.createObjectURL(file));
      } catch { uploaded.push(URL.createObjectURL(file)); }
    }
    setPhotos(p => [...p, ...uploaded]);
    setIsUploading(false);
  };

  const toggleFeature = (f: string) => {
    setProperty(p => ({ ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f] }));
  };

  const handleLaunch = async () => {
    setIsSending(true); setSendProgress(0);
    let tick = 0;
    const iv = setInterval(() => { tick++; setSendProgress(Math.min(88, Math.round((tick / 22) * 88))); }, 350);
    try {
      await fetch('/api/distribute', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ property, aiPack: aiPackData, ownerEmail: 'contact@win-winsolution.com', wave: 1 }),
      });
    } catch { /* ignore */ }
    clearInterval(iv); setSendProgress(100);
    setTimeout(() => { setIsSending(false); setDone(true); }, 500);
  };

  const canNext = () => {
    if (step === 0) return !!(property.type && property.city && property.country && property.areaSqm > 0 && property.price > 0);
    if (step === 1) return aiStatus === 'done' && !!aiPackData;
    if (step === 2) return true;
    return !isSending;
  };

  // ─── Done screen ───────────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:440, background:C.surface, borderRadius:24, padding:48, boxShadow:C.shadowLg }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:C.text, marginBottom:10 }}>Distribution Complete!</h2>
        <p style={{ color:C.textSec, fontSize:'0.9rem', lineHeight:1.7, marginBottom:28 }}>
          Your property was sent to <strong style={{ color:C.text }}>{matchedAgencies.length} matched agencies</strong> across Europe.<br/>
          Replies forward automatically to <strong style={{ color:C.primary }}>contact@win-winsolution.com</strong>.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding:'13px 28px', background:C.primary, color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer' }}>
            → Go to Dashboard
          </button>
          <button onClick={() => router.push('/distribution')} style={{ padding:'11px 28px', background:'transparent', color:C.textSec, border:`1.5px solid ${C.border}`, borderRadius:12, fontWeight:600, fontSize:14, cursor:'pointer' }}>
            📊 Track Campaign
          </button>
        </div>
      </div>
    </div>
  );

  const availFeatures = FEATURES_BY_TYPE[property.type] || FEATURES_BY_TYPE.Apartment;

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 4px rgba(26,31,46,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/properties')} style={{ background:'transparent', border:'none', cursor:'pointer', color:C.textSec, fontSize:20, lineHeight:1, padding:'0 4px' }}>←</button>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:C.text }}>New Property Listing</div>
            {savedAt && <div style={{ fontSize:11, color:C.textTer }}>Draft saved {savedAt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>}
          </div>
        </div>

        {/* Step pills */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={label}>
              <div style={{
                display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:99,
                background: i < step ? C.greenLight : i === step ? C.primaryLight : C.surface2,
                border: `1px solid ${i < step ? C.greenBorder : i === step ? C.primaryBorder : C.border}`,
                fontSize:12, fontWeight:600,
                color: i < step ? C.green : i === step ? C.primary : C.textTer,
              }}>
                {i < step ? '✓' : <span style={{ width:16, height:16, borderRadius:'50%', background: i === step ? C.primary : C.border, color:'white', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800 }}>{i+1}</span>}
                <span style={{ display:'none' }} className="sm-show">{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div style={{ width:16, height:1, background:C.border }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 20px 120px' }}>

        {/* ═══ STEP 0: Property Details ═══ */}
        {step === 0 && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:C.text, marginBottom:6 }}>Tell us about your property</h1>
              <p style={{ color:C.textSec, fontSize:14 }}>Basic details — takes 2 minutes. AI does the rest.</p>
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, boxShadow:C.shadow, display:'flex', flexDirection:'column', gap:20 }}>

              {/* Type & Mode */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="Property Type" required>
                  <select value={property.type} onChange={e => { setProperty({ ...property, type:e.target.value, features:[] }); }} style={selectStyle}>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Intent" required>
                  <div style={{ display:'flex', gap:8 }}>
                    {(['sale','rent'] as const).map(m => (
                      <button key={m} onClick={() => setProperty({...property, mode:m})} style={{
                        flex:1, padding:'11px 0', border: property.mode===m ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`,
                        background: property.mode===m ? C.primaryLight : C.surface, borderRadius:10,
                        fontWeight:700, fontSize:13, color: property.mode===m ? C.primary : C.textSec, cursor:'pointer',
                      }}>For {m}</button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Address */}
              <Field label="Street / Address">
                <input type="text" value={property.address} onChange={e => setProperty({...property, address:e.target.value})} placeholder="e.g. Knez Mihailova 28" style={inputStyle} />
              </Field>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="City" required>
                  <input type="text" value={property.city} onChange={e => setProperty({...property, city:e.target.value})} placeholder="e.g. Belgrade" style={inputStyle} />
                </Field>
                <Field label="Country" required>
                  <select value={property.country} onChange={e => setProperty({...property, country:e.target.value})} style={selectStyle}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                <Field label="Area (m²)" required>
                  <input type="number" value={property.areaSqm || ''} onChange={e => setProperty({...property, areaSqm: parseFloat(e.target.value)||0})} placeholder="75" style={inputStyle} />
                </Field>
                {property.type !== 'Land' && property.type !== 'Commercial' && (
                  <Field label="Bedrooms">
                    <input type="number" value={property.bedrooms || ''} onChange={e => setProperty({...property, bedrooms: parseInt(e.target.value)||0})} placeholder="2" style={inputStyle} />
                  </Field>
                )}
                {property.type !== 'Land' && (
                  <Field label="Bathrooms">
                    <input type="number" value={property.bathrooms || ''} onChange={e => setProperty({...property, bathrooms: parseInt(e.target.value)||0})} placeholder="1" style={inputStyle} />
                  </Field>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
                <Field label={property.mode==='sale' ? 'Asking Price' : 'Monthly Rent'} required>
                  <input type="number" value={property.price || ''} onChange={e => setProperty({...property, price: parseFloat(e.target.value)||0})} placeholder="145000" style={inputStyle} />
                </Field>
                <Field label="Currency">
                  <select value={property.currency} onChange={e => setProperty({...property, currency:e.target.value as any})} style={selectStyle}>
                    {['EUR','USD','CHF','RSD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="Year Built">
                  <input type="text" value={property.yearBuilt} onChange={e => setProperty({...property, yearBuilt:e.target.value})} placeholder="2018" style={inputStyle} />
                </Field>
                <Field label="Condition">
                  <select value={property.condition} onChange={e => setProperty({...property, condition:e.target.value})} style={selectStyle}>
                    {['New','Renovated','Good','Needs renovation'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              {/* Features */}
              <Field label="Key Features">
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                  {availFeatures.map(f => (
                    <button key={f} onClick={() => toggleFeature(f)} style={{
                      padding:'6px 13px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                      border: property.features.includes(f) ? `1.5px solid ${C.primary}` : `1.5px solid ${C.border}`,
                      background: property.features.includes(f) ? C.primaryLight : C.surface,
                      color: property.features.includes(f) ? C.primary : C.textSec,
                    }}>{f}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: AI Pack ═══ */}
        {step === 1 && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:C.text, marginBottom:6 }}>✨ AI Sales Package</h1>
              <p style={{ color:C.textSec, fontSize:14 }}>Describe your property — AI generates the full agency offer automatically.</p>
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, boxShadow:C.shadow }}>

              {/* Description input */}
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:C.textSec, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your description <span style={{ color:C.red }}>*</span></label>
                  <button onClick={startVoice} style={{
                    display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer',
                    background: isListening ? 'rgba(239,68,68,0.1)' : C.primaryLight,
                    color: isListening ? C.red : C.primary, fontWeight:700, fontSize:12,
                  }}>
                    🎤 {isListening ? 'Listening…' : 'Dictate'}
                  </button>
                </div>
                <textarea
                  value={shortDesc}
                  onChange={e => { setShortDesc(e.target.value); setAIPackData(null); setAIStatus('typing'); }}
                  placeholder="Describe your property in 2–3 sentences…"
                  style={{ ...inputStyle, minHeight:110, resize:'vertical', lineHeight:1.6 }}
                />
                {/* Quick hint chips */}
                <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:6 }}>
                  {(HINTS[property.type] || HINTS.Apartment).map((hint, i) => (
                    <button key={i} onClick={() => { setShortDesc(hint); setAIPackData(null); setAIStatus('typing'); }} style={{
                      padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer',
                      background:C.surface2, border:`1px solid ${C.border}`, color:C.textSec,
                    }}>💡 Example {i+1}</button>
                  ))}
                </div>
              </div>

              {/* AI status */}
              <div style={{
                padding:'14px 18px', borderRadius:14, marginBottom:20,
                background: aiStatus === 'done' ? C.greenLight : aiStatus === 'generating' ? C.blueLight : C.goldLight,
                border: `1px solid ${aiStatus === 'done' ? C.greenBorder : aiStatus === 'generating' ? '#BFDBFE' : '#FDE68A'}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {aiStatus === 'generating' && <div style={{ width:16, height:16, border:`2px solid ${C.blue}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.6s linear infinite', flexShrink:0 }}/>}
                  {aiStatus === 'done'       && <span style={{ fontSize:16 }}>✅</span>}
                  {aiStatus === 'typing'     && <span style={{ fontSize:16 }}>✍️</span>}
                  {aiStatus === 'idle'       && <span style={{ fontSize:16 }}>🤖</span>}
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                    {aiStatus === 'generating' && 'AI is building your sales package…'}
                    {aiStatus === 'done'       && 'AI package ready!'}
                    {aiStatus === 'typing'     && 'Keep writing — AI will auto-generate when you pause'}
                    {aiStatus === 'idle'       && 'Write 20+ characters to trigger AI auto-generation'}
                  </div>
                </div>
                {aiStatus === 'done' && (
                  <button onClick={regenerateAI} style={{ fontSize:12, fontWeight:600, color:C.textSec, background:'transparent', border:`1px solid ${C.border}`, padding:'5px 12px', borderRadius:99, cursor:'pointer', whiteSpace:'nowrap' }}>
                    ↻ Regenerate
                  </button>
                )}
                {(aiStatus === 'typing' || aiStatus === 'idle') && shortDesc.length >= 20 && (
                  <button onClick={triggerGenerateAI} style={{ fontSize:12, fontWeight:700, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, padding:'5px 12px', borderRadius:99, cursor:'pointer', whiteSpace:'nowrap' }}>
                    ⚡ Generate Now
                  </button>
                )}
              </div>

              {/* AI Pack preview */}
              {aiPackData && (
                <div style={{ border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
                  {/* Header */}
                  <div style={{ padding:'14px 20px', background:C.surface2, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>🚀</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Agency Offer Preview</span>
                    <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600, color:C.green, background:C.greenLight, border:`1px solid ${C.greenBorder}`, padding:'2px 8px', borderRadius:99 }}>Ready to send</span>
                  </div>
                  <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Headline</div>
                      <div style={{ fontSize:15, fontWeight:700, color:C.primary }}>{aiPackData.headline}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Description</div>
                      <div style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>{aiPackData.description}</div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Key Features</div>
                        {aiPackData.keyFeatures.map((f,i) => (
                          <div key={i} style={{ fontSize:12, color:C.text, padding:'4px 0', display:'flex', gap:7, alignItems:'flex-start' }}>
                            <span style={{ color:C.green, flexShrink:0, marginTop:2 }}>✓</span>{f}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Investment Highlights</div>
                        {aiPackData.investmentHighlights.map((h,i) => (
                          <div key={i} style={{ fontSize:12, color:C.text, padding:'4px 0', display:'flex', gap:7, alignItems:'flex-start' }}>
                            <span style={{ color:C.gold, flexShrink:0, marginTop:2 }}>★</span>{h}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding:'10px 14px', background:C.surface2, borderRadius:10, fontSize:12, color:C.textSec }}>
                      🎯 <strong style={{ color:C.text }}>Target buyer:</strong> {aiPackData.targetBuyerProfile}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Photos ═══ */}
        {step === 2 && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:C.text, marginBottom:6 }}>📸 Property Photos</h1>
              <p style={{ color:C.textSec, fontSize:14 }}>Great photos = more agency interest. 8+ photos gets premium placement.</p>
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, boxShadow:C.shadow }}>
              {/* Upload buttons */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:10, padding:'28px 16px', borderRadius:16, cursor:'pointer',
                  background:`linear-gradient(135deg,${C.primaryLight},#FFF7F0)`,
                  border:`2px dashed ${C.primaryBorder}`, textAlign:'center',
                }}>
                  <span style={{ fontSize:40 }}>📷</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.primary, marginBottom:3 }}>Camera</div>
                    <div style={{ fontSize:11, color:C.textTer }}>Take photos now</div>
                  </div>
                  <input type="file" accept="image/*" capture="environment" multiple style={{ display:'none' }} onChange={e => handlePhotoUpload(e.target.files)} />
                </label>

                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:10, padding:'28px 16px', borderRadius:16, cursor:'pointer',
                  background:C.surface2, border:`2px dashed ${C.border}`, textAlign:'center',
                }}>
                  <span style={{ fontSize:40 }}>{isUploading ? '⏳' : '🖼️'}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.textSec, marginBottom:3 }}>{isUploading ? 'Uploading…' : 'Gallery / Files'}</div>
                    <div style={{ fontSize:11, color:C.textTer }}>Choose from device</div>
                  </div>
                  <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handlePhotoUpload(e.target.files)} />
                </label>
              </div>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:10, marginBottom:20 }}>
                  {photos.map((src, i) => (
                    <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}` }}>
                      <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <button onClick={() => setPhotos(p => p.filter((_,j)=>j!==i))} style={{
                        position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%',
                        background:'rgba(220,38,38,0.85)', border:'none', color:'white', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                      }}>✕</button>
                      {i === 0 && <div style={{ position:'absolute', bottom:4, left:4, fontSize:10, fontWeight:700, background:C.primary, color:'white', padding:'2px 6px', borderRadius:99 }}>Cover</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Counter & tip */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:C.surface2, borderRadius:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</div>
                <div style={{ fontSize:12, color: photos.length >= 8 ? C.green : photos.length >= 3 ? C.gold : C.textSec, fontWeight:600 }}>
                  {photos.length >= 8 ? '🌟 Premium placement' : photos.length >= 3 ? '✓ Minimum met — add more for better results' : `Min 3 required (${3 - photos.length} more)`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Launch ═══ */}
        {step === 3 && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:C.text, marginBottom:6 }}>🚀 Ready to Launch</h1>
              <p style={{ color:C.textSec, fontSize:14 }}>AI matched your property to {matchedAgencies.length} agencies. Review and distribute.</p>
            </div>

            {/* Summary card */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, boxShadow:C.shadow, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Property Summary</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                {[
                  { label:'Type', value: property.type },
                  { label:'City', value: property.city },
                  { label:'Price', value: `${property.price.toLocaleString()} ${property.currency}` },
                  { label:'Area', value: `${property.areaSqm}m²` },
                  { label:'Beds / Baths', value: `${property.bedrooms}B / ${property.bathrooms}Ba` },
                  { label:'Intent', value: property.mode.toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding:'10px 14px', background:C.surface2, borderRadius:12 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{value}</div>
                  </div>
                ))}
              </div>
              {aiPackData && (
                <div style={{ padding:'12px 16px', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:12, fontSize:13, color:C.primary, fontWeight:600 }}>
                  ✨ {aiPackData.headline}
                </div>
              )}
            </div>

            {/* Matched agencies */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, boxShadow:C.shadow, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textTer, textTransform:'uppercase', letterSpacing:'0.06em' }}>Matched Agencies ({matchedAgencies.length})</div>
                <div style={{ fontSize:11, color:C.textSec }}>Wave 1: top 10 · Wave 2: next 12</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {matchedAgencies.slice(0,10).map((ag, i) => (
                  <div key={ag.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background: i < 3 ? C.primaryLight : C.surface2, border:`1px solid ${i < 3 ? C.primaryBorder : C.border}`, borderRadius:12 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background: i < 3 ? C.primary : C.surface, border:`1px solid ${i < 3 ? C.primaryBorder : C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color: i < 3 ? 'white' : C.textSec, flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ag.name}</div>
                      <div style={{ fontSize:11, color:C.textSec }}>{ag.country} · {ag.specializations.slice(0,2).join(', ')}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color: i < 3 ? C.primary : C.text }}>{ag.quality_score}<span style={{ fontSize:10, color:C.textTer }}>/100</span></div>
                      <div style={{ fontSize:10, color:C.green }}>{ag.historical.response_rate}% reply rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch button */}
            {!isSending ? (
              <button onClick={handleLaunch} style={{
                width:'100%', padding:'16px 24px', background:C.primary, color:'white', border:'none', borderRadius:16, fontWeight:800, fontSize:16, cursor:'pointer',
                boxShadow:`0 8px 24px rgba(249,115,22,0.35)`, transition:'transform 0.15s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='none')}>
                🚀 Send to All {matchedAgencies.length} Agencies
              </button>
            ) : (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Distributing to agencies…</div>
                <div style={{ height:8, background:C.surface2, borderRadius:99, overflow:'hidden', marginBottom:10 }}>
                  <div style={{ height:'100%', background:`linear-gradient(90deg,${C.primary},${C.primaryHov})`, borderRadius:99, width:`${sendProgress}%`, transition:'width 0.4s ease' }}/>
                </div>
                <div style={{ fontSize:13, color:C.textSec }}>{sendProgress}% complete</div>
              </div>
            )}
          </div>
        )}

        {/* ── Nav buttons ───────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:12, marginTop:24, justifyContent: step === 0 ? 'flex-end' : 'space-between' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ padding:'12px 24px', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, fontWeight:600, fontSize:14, color:C.textSec, cursor:'pointer' }}>
              ← Back
            </button>
          )}
          {step < 3 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{
              padding:'12px 32px', background: canNext() ? C.primary : C.surface2, color: canNext() ? 'white' : C.textTer,
              border:'none', borderRadius:12, fontWeight:700, fontSize:14,
              cursor: canNext() ? 'pointer' : 'not-allowed', transition:'all 0.2s',
            }}>
              {step === 2 ? 'Review & Launch →' : 'Next →'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus {
          border-color: ${C.primary} !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }
      `}</style>
    </div>
  );
}
