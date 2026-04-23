'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { runAPEX, type APEXResult, type APEXAgencyResult, type AgencyChannel } from '@/lib/ai-matching/apex-engine';
import { DEMO_AGENCY_POOL } from '@/lib/ai-matching/demo-agencies';
// DEMO_AGENCY_POOL contains real agency data — in production replaced by /api/agencies

const CSS_VARS = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  surface3: '#E8EDF4',
  border: '#E2E8F0',
  border2: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  primary: '#16A34A',
  primaryHover: '#15803D',
  primaryLight: 'rgba(22,163,74,0.08)',
  green: '#16A34A',
  greenDim: '#DCFCE7',
  red: '#DC2626',
  blue: '#3B5BDB',
  inputBg: '#FFFFFF',
};

// DEMO MODE: all emails route to Win-Win Solution
const DEMO_EMAIL = 'contact@win-winsolution.com';

interface PropertyData {
  type: string;
  address: string;
  city: string;
  country: string;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  mode: 'sale' | 'rent';
  price: number;
  currency: 'EUR' | 'USD' | 'CHF' | 'RSD';
  ownerName?: string;
  // v2.0: extended fields for APEX matching
  condition?: 'new' | 'good' | 'renovation';
  floor?: number;
  totalFloors?: number;
  furnished?: 'unfurnished' | 'partial' | 'full';
  exclusiveAgreement?: 'yes' | 'no' | 'maybe';
  remoteViewing?: boolean;
  features?: string[];            // e.g. ['pool', 'sea_view', 'garage']
  proximityTags?: string[];       // e.g. ['beach', 'city_center', 'ski_resort']
  targetBuyerTypes?: string[];    // e.g. ['investor', 'expat', 'russian_buyer']
}

interface AIPackData {
  headline: string;
  description: string;
  keyFeatures: string[];
  investmentHighlights: string[];
  targetBuyerProfile: string;
  emailDraft?: string;
}

export default function PropertiesNewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);

  // FIX Issue 15: always resolve report email from latest profile data
  const getReportEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pb_report_email') || DEMO_EMAIL;
    }
    return DEMO_EMAIL;
  };

  // Step 1: Basic info
  const [property, setProperty] = useState<PropertyData>({
    type: 'Apartment',
    address: '',
    city: '',
    country: '',
    areaSqm: 0,
    bedrooms: 1,
    bathrooms: 1,
    mode: 'sale',
    price: 0,
    currency: 'EUR',
    // v2.0 defaults
    condition: 'good',
    furnished: 'unfurnished',
    exclusiveAgreement: 'maybe',
    remoteViewing: true,
    features: [],
    proximityTags: [],
    targetBuyerTypes: [],
  });

  // Step 2: AI Description
  const [shortDesc, setShortDesc] = useState('');
  const [aiPackData, setAIPackData] = useState<AIPackData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Step 4: Documents
  interface DocFile { name: string; size: number; url: string; type: string }
  const [titleDeed, setTitleDeed] = useState<DocFile | null>(null);
  const [idDocument, setIdDocument] = useState<DocFile | null>(null);
  const [otherDocs, setOtherDocs] = useState<DocFile[]>([]);
  const titleDeedRef = React.useRef<HTMLInputElement>(null);
  const idDocRef = React.useRef<HTMLInputElement>(null);
  const otherDocRef = React.useRef<HTMLInputElement>(null);

  // Step 4: Distribution + APEX
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [distributionComplete, setDistributionComplete] = useState(false);
  const [apexResult, setApexResult] = useState<APEXResult | null>(null);
  const [apexLoading, setApexLoading] = useState(false);
  const [channelTab, setChannelTab] = useState<'all' | AgencyChannel>('all');
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set());
  const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
  const [distMode, setDistMode] = useState<'auto' | 'manual'>('auto');

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [property, shortDesc, photos]);

  // Run APEX when entering Step 6 (index 5 = Outreach) — updated for new 6-step order
  useEffect(() => {
    if (currentStep === 5 && !apexResult && !apexLoading) {
      setApexLoading(true);
      setTimeout(() => {
        try {
          const result = runAPEX(
            {
              type: property.type,
              address: property.address,
              city: property.city,
              country: property.country,
              areaSqm: property.areaSqm,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              mode: property.mode,
              price: property.price,
              currency: property.currency,
              // v2.0: extended fields
              condition: property.condition,
              floor: property.floor,
              total_floors: property.totalFloors,
              furnished: property.furnished,
              exclusiveAgreement: property.exclusiveAgreement,
              remoteViewing: property.remoteViewing,
              features: property.features,
              proximityTags: property.proximityTags,
              targetBuyerTypes: property.targetBuyerTypes,
              description: shortDesc || undefined,
            },
            DEMO_AGENCY_POOL
          );
          setApexResult(result);
          // Pre-select all agencies in auto mode
          setSelectedAgencies(new Set(result.results.map(r => r.agency.id)));
        } catch (e) {
          console.error('APEX error:', e);
        }
        setApexLoading(false);
      }, 1400); // small delay for UX effect
    }
  }, [currentStep]);

  // 6-step wizard:
  // 0 = Property Info + Description
  // 1 = Address + Map
  // 2 = Photos + Documents
  // 3 = AI Pack
  // 4 = Review (approve before sending)
  // 5 = Outreach (APEX + distribution)
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Property info: type, area, price required; description optional (can generate AI without it but better with)
        return !!(property.type && property.areaSqm > 0 && property.price > 0);
      case 1: // Address: city + country required
        return !!(property.city && property.country);
      case 2: // Photos + Docs: optional
        return true;
      case 3: // AI Pack: shortDesc must be ≥10 chars
        return shortDesc.length >= 10;
      case 4: // Review: always can proceed (user has reviewed)
        return true;
      case 5: // Outreach: always
        return true;
      default:
        return false;
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation (2 seconds)
    await new Promise((r) => setTimeout(r, 2000));

    const isLand = property.type === 'Land' || property.type === 'Commercial';
    const pack: AIPackData = {
      headline: `${property.type} in ${property.city} — ${property.mode === 'sale' ? 'Investment Opportunity' : 'For Rent'} · ${property.areaSqm}m²`,
      description: isLand
        ? `This ${property.areaSqm}m² ${property.type.toLowerCase()} plot in ${property.city}, ${property.country} represents a strategic acquisition opportunity. Located in a high-demand area with strong development potential, the site offers excellent infrastructure access and clear ownership documentation. Zoning supports ${property.type === 'Land' ? 'residential and commercial development' : 'commercial operations'}.\n\nThe location benefits from ongoing regional investment, infrastructure development, and growing interest from international buyers. Price: ${property.price.toLocaleString()} ${property.currency}. Immediate viewing and documentation available upon request.`
        : `This stunning ${property.type} in ${property.city}, ${property.country} offers ${property.areaSqm}m² of sophisticated living space. Located in one of the most sought-after areas, this property combines modern comfort with timeless elegance. With ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, this residence is ideal for families and investors alike.\n\nEach room has been meticulously designed with attention to detail, featuring quality materials and state-of-the-art amenities. The location provides easy access to shopping, dining, and cultural venues. Price: ${property.price.toLocaleString()} ${property.currency}.`,
      keyFeatures: isLand
        ? [
            `${property.areaSqm}m² plot with clear title`,
            `Prime location in ${property.city}, ${property.country}`,
            'Full ownership documentation available',
            'Strong development potential',
            'Infrastructure access (road, utilities)',
          ]
        : [
            `${property.areaSqm}m² of premium living space`,
            `${property.bedrooms} spacious bedrooms`,
            `${property.bathrooms} modern bathrooms`,
            'Open-plan living areas with high ceilings',
            `Prime location in ${property.city}`,
          ],
      investmentHighlights: [
        'Strong property appreciation in the area',
        'High rental yield potential and demand',
        'Excellent location with infrastructure development',
      ],
      targetBuyerProfile: 'HNW investors, European expats, families seeking premium residences',
    };

    setAIPackData(pack);
    setIsGeneratingAI(false);
  };

  const handleSendDistribution = async () => {
    setIsSending(true);
    setSendProgress(0);

    const agenciesToSend = distMode === 'manual'
      ? (apexResult?.results.filter(r => selectedAgencies.has(r.agency.id)) ?? [])
      : (apexResult?.results ?? []);
    const total = Math.max(agenciesToSend.length, 1);

    // Build agency list for API
    const apiAgencies = agenciesToSend.map((r, i) => ({
      id: r.agency.id,
      name: r.agency.name,
      email: r.agency.email,
      city: r.agency.city || '',
      country: r.agency.country || '',
      flag: r.agency.flag || '',
      phone: r.agency.phone,
      wave: r.wave,
      apex_score: Math.round(r.apex_score),
    }));

    // Show progress while API processes
    const progressInterval = setInterval(() => {
      setSendProgress(p => Math.min(p + Math.ceil(100 / (total * 3)), 92));
    }, 800);

    try {
      const ownerEmail = getReportEmail();
      const ownerPhone = typeof window !== 'undefined' ? (localStorage.getItem('pb_whatsapp') || '') : '';

      const resp = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            type: property.type,
            city: property.city,
            country: property.country,
            areaSqm: property.areaSqm,
            price: property.price,
            currency: property.currency || 'EUR',
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            address: property.address,
            description: aiPackData?.description || shortDesc,
          },
          agencies: apiAgencies,
          ownerName: property.ownerName || 'Owner',
          ownerEmail,
          ownerPhone,
          // Pass AI-generated description as letter body if available
          customLetter: aiPackData?.emailDraft || undefined,
          testMode: true,    // domain warmup: 1 real test email, rest simulated
        }),
      });

      if (resp.ok) {
        const result = await resp.json();
        console.log('[APEX] Distribution result:', result);
      }
    } catch (err) {
      console.error('[APEX] Distribution API error:', err);
    } finally {
      clearInterval(progressInterval);
      setSendProgress(100);
    }

    setIsSending(false);

    // Save property to localStorage so My Properties shows it
    try {
      const propId = `wizard-${Date.now()}`;
      const wizardProp = {
        id: propId,
        user_id: 'current-user',
        property_type: property.type.toLowerCase(),
        address: property.address || 'Added via wizard',
        city: property.city,
        country: property.country,
        asking_price: property.price,
        currency: property.currency,
        area_sqm: property.areaSqm,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        description: aiPackData?.description || shortDesc,
        headline: aiPackData?.headline || '',
        photos,
        status: 'in_distribution',
        agencies_sent: agenciesToSend.length,
        wave_log: agenciesToSend.map(r => ({
          id: r.agency.id, name: r.agency.name, email: r.agency.email,
          wave: r.wave, score: Math.round(r.apex_score), sent_at: new Date().toISOString(),
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('pb_wizard_props') || '[]');
      localStorage.setItem('pb_wizard_props', JSON.stringify([wizardProp, ...existing]));
    } catch {}

    setDistributionComplete(true);
  };

  const generateEmailHTML = () => {
    if (!aiPackData) return '';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 0; }
    .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 32px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .content { padding: 32px 24px; }
    .property-card { background: #F4F6FA; border: 1px solid #DDE2EE; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .property-card h3 { margin: 0 0 12px 0; color: #1A1F2E; font-size: 16px; font-weight: 600; }
    .property-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; color: #6B7A99; }
    .detail-item { display: flex; align-items: center; gap: 6px; }
    .match-score { background: #FFF3E8; border: 1px solid #FDD0A8; color: #C2410C; padding: 12px 16px; border-radius: 8px; text-align: center; margin: 20px 0; font-weight: 600; }
    .description { color: #1A1F2E; font-size: 14px; line-height: 1.6; margin: 20px 0; }
    .features { list-style: none; padding: 0; margin: 20px 0; }
    .features li { padding: 8px 0; color: #1A1F2E; font-size: 14px; }
    .features li:before { content: "✓ "; color: #16A34A; font-weight: 600; margin-right: 8px; }
    .cta-button { display: inline-block; background: #F97316; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #9BA8C0; border-top: 1px solid #DDE2EE; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PropBlaze</div>
      <div style="font-size: 14px; opacity: 0.9;">AI-Powered Property Distribution</div>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We have an exclusive property offer that matches your specialization perfectly:</p>

      <div class="property-card">
        <h3>${property.type} · ${property.city}</h3>
        <div class="property-details">
          <div class="detail-item"><strong>${property.price.toLocaleString()} ${property.currency}</strong></div>
          <div class="detail-item"><strong>${property.areaSqm}m²</strong></div>
          <div class="detail-item"><strong>${property.bedrooms} bed</strong></div>
          <div class="detail-item"><strong>${property.bathrooms} bath</strong></div>
        </div>
      </div>

      <div class="match-score">Match Score: 96/100</div>

      <h3 style="color: #1A1F2E; font-size: 16px; font-weight: 600; margin-top: 24px;">Headline</h3>
      <p style="color: #1A1F2E; font-size: 14px; font-weight: 600;">${aiPackData.headline}</p>

      <h3 style="color: #1A1F2E; font-size: 16px; font-weight: 600; margin-top: 24px;">Description</h3>
      <div class="description">${aiPackData.description.split('\n').join('<br />')}</div>

      <h3 style="color: #1A1F2E; font-size: 16px; font-weight: 600; margin-top: 24px;">Key Features</h3>
      <ul class="features">
        ${aiPackData.keyFeatures.map((f) => `<li>${f}</li>`).join('')}
      </ul>

      <h3 style="color: #1A1F2E; font-size: 16px; font-weight: 600; margin-top: 24px;">Investment Highlights</h3>
      <ul class="features">
        ${aiPackData.investmentHighlights.map((h) => `<li>${h}</li>`).join('')}
      </ul>

      <h3 style="color: #1A1F2E; font-size: 16px; font-weight: 600; margin-top: 24px;">Target Buyer Profile</h3>
      <p style="color: #6B7A99; font-size: 14px;">${aiPackData.targetBuyerProfile}</p>

      <center>
        <a href="https://propblaze.com/demo" class="cta-button">View Full Offer →</a>
      </center>
    </div>
    <div class="footer">
      <p>PropBlaze AI Distribution System<br />
      This property was matched to your agency based on specialization, location, and performance metrics.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  if (distributionComplete) {
    return (
      <div style={{ minHeight: '100vh', background: CSS_VARS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(34,197,94,0.2)',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16L13 23L26 9" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              color: CSS_VARS.text,
              marginBottom: 8,
            }}
          >
            Distribution Complete!
          </h2>
          <p
            style={{
              color: CSS_VARS.textSecondary,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Your property has been sent to all 10 matched agencies. <strong style={{ color: CSS_VARS.text }}>Win-Win Solution</strong> (contact@win-winsolution.com) will receive your listing within minutes. You can track all replies in your dashboard.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 28px',
              background: CSS_VARS.primary,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 12px rgba(249, 115, 22, 0.2)`,
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/messenger')}
            style={{
              padding: '10px 28px',
              background: 'transparent',
              color: CSS_VARS.textSecondary,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: 8,
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            💬 Check Messages from Agencies
          </button>
          </div>
        </div>
      </div>
    );
  }

  // NEW 6-step order per product spec (Issue 10)
  const STEPS = ['Property Info', 'Address & Map', 'Photos & Docs', 'AI Pack', 'Review', 'Outreach'];
  const isLandOrCommercial = property.type === 'Land' || property.type === 'Commercial';

  return (
    <div style={{ minHeight: '100vh', background: CSS_VARS.bg, padding: '24px 24px 100px', fontFamily: "'Inter',system-ui,sans-serif", color: CSS_VARS.text }}>

      {/* DEMO MODE Banner */}
      <div style={{ maxWidth: 800, margin: '0 auto 16px', padding: '8px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#92400E', fontWeight: 600 }}>
        <span>🧪</span>
        <span>DEMO MODE — All agency emails are routed to <strong>{DEMO_EMAIL}</strong>. No real agencies contacted.</span>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: CSS_VARS.primary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            New Listing
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: CSS_VARS.text, margin: 0, letterSpacing: '-0.02em' }}>
            Add Property
          </h1>
        </div>
        {draftSaved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, color: CSS_VARS.green }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Draft saved
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div style={{ maxWidth: 800, margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12, marginBottom: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                  background: i < currentStep ? CSS_VARS.green : i === currentStep ? CSS_VARS.primary : CSS_VARS.surface2,
                  color: i < currentStep ? '#FFFFFF' : i === currentStep ? '#FFFFFF' : CSS_VARS.textTertiary,
                  border: i === currentStep ? `2px solid ${CSS_VARS.primary}` : 'none',
                  boxShadow: i === currentStep ? `0 0 16px rgba(22,163,74,0.25)` : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L6 11L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (i + 1)}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: i === currentStep ? 700 : 500, color: i === currentStep ? CSS_VARS.primary : CSS_VARS.textTertiary, textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 2, height: 2, marginBottom: 24, background: i < currentStep ? CSS_VARS.green : CSS_VARS.border, borderRadius: 2, transition: 'background 0.4s' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          background: CSS_VARS.surface,
          border: `1px solid ${CSS_VARS.border}`,
          borderRadius: 20,
          padding: '32px 36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Step 1: Property Info + Description ── */}
        {currentStep === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 4 }}>
              Property Info
            </h2>
            <p style={{ fontSize: 12, color: CSS_VARS.textSecondary, marginBottom: 24 }}>Select type, size, price, and describe the property in your own words.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Property Type
                </label>
                <select
                  value={property.type}
                  onChange={(e) => setProperty({ ...property, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                  }}
                >
                  {['Apartment', 'Villa', 'House', 'Land', 'Commercial'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Sale or Rent?
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['sale', 'rent'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProperty({ ...property, mode })}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border:
                          property.mode === mode
                            ? `2px solid ${CSS_VARS.primary}`
                            : `1px solid ${CSS_VARS.border}`,
                        background: property.mode === mode ? CSS_VARS.primaryLight : CSS_VARS.surface,
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 13,
                        color: property.mode === mode ? CSS_VARS.primary : CSS_VARS.textSecondary,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      For {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description — moved here from old Step 2 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                Short description (optional)
                <span style={{ fontWeight: 400, color: CSS_VARS.textTertiary, marginLeft: 8 }}>Used for AI generation on next steps</span>
              </label>
              <textarea
                placeholder={`e.g. ${isLandOrCommercial ? 'Land plot with road access, suitable for residential construction. Clear title, ready to build.' : 'Bright 3-bedroom apartment in city center, recently renovated. Close to metro and parks.'}`}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                style={{
                  width: '100%', padding: '12px',
                  border: `1px solid ${CSS_VARS.border}`,
                  borderRadius: 8, fontSize: 13, color: CSS_VARS.text,
                  minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' as const,
                  background: CSS_VARS.inputBg, resize: 'vertical' as const,
                }}
              />
              {/* Voice input stub — P2 feature */}
              <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button disabled style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '5px 12px', borderRadius: 6, border: `1px solid ${CSS_VARS.border}`, background: CSS_VARS.surface2, color: CSS_VARS.textTertiary, fontSize: 11, cursor: 'not-allowed' }}>
                  🎙️ Voice input — coming soon
                </button>
                <span style={{ fontSize: 11, color: CSS_VARS.textTertiary }}>Speak your description in any language</span>
              </div>
            </div>

            {/* PLACEHOLDER — address fields moved to Step 2: Address & Map */}
            <div style={{ padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 11, color: '#1D4ED8', marginBottom: 20 }}>
              📍 Address and location will be entered in the next step.
            </div>

            {/* Area, Beds/Baths, Price — required on step 0 */}
            <div style={{ display: 'grid', gridTemplateColumns: isLandOrCommercial ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  {isLandOrCommercial ? 'Plot / Floor Area (m²) *' : 'Area (m²) *'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.areaSqm || ''}
                  onChange={(e) => setProperty({ ...property, areaSqm: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${property.areaSqm > 0 ? CSS_VARS.border : CSS_VARS.red}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }}
                />
              </div>
              {isLandOrCommercial ? (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                    Land Use / Zoning
                  </label>
                  <select
                    value={(property as any).zoning || ''}
                    onChange={(e) => setProperty({ ...property, ...(property as any), zoning: e.target.value } as any)}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, background: CSS_VARS.inputBg }}
                  >
                    <option value="">Select zoning</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="mixed">Mixed use</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Bedrooms</label>
                    <input type="number" placeholder="0" value={property.bedrooms || ''} onChange={(e) => setProperty({ ...property, bedrooms: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Bathrooms</label>
                    <input type="number" placeholder="0" value={property.bathrooms || ''} onChange={(e) => setProperty({ ...property, bathrooms: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
                  </div>
                </>
              )}
            </div>

            {/* Floor / total floors — only for Apartment type */}
            {property.type === 'Apartment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Floor number</label>
                  <input type="number" placeholder="e.g. 4" value={property.floor ?? ''} onChange={(e) => setProperty({ ...property, floor: parseInt(e.target.value) || undefined })}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Total floors in building</label>
                  <input type="number" placeholder="e.g. 10" value={property.totalFloors ?? ''} onChange={(e) => setProperty({ ...property, totalFloors: parseInt(e.target.value) || undefined })}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Price *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.price || ''}
                  onChange={(e) => setProperty({ ...property, price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: `1px solid ${property.price > 0 ? CSS_VARS.border : CSS_VARS.red}`,
                    borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Currency
                </label>
                <select
                  value={property.currency}
                  onChange={(e) => setProperty({ ...property, currency: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text }}
                >
                  {['EUR', 'USD', 'CHF', 'RSD'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── APEX-relevant fields (v2.0) ── */}
            <div style={{ background: CSS_VARS.surface2, border: `1px solid ${CSS_VARS.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: CSS_VARS.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎯 APEX Matching Signals
                <span style={{ fontWeight: 400, color: CSS_VARS.textTertiary, fontSize: 11 }}>— helps find the right agencies for your property</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 5 }}>Condition</label>
                  <select
                    value={property.condition ?? 'good'}
                    onChange={(e) => setProperty({ ...property, condition: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 10px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 7, fontSize: 12, color: CSS_VARS.text, background: CSS_VARS.surface }}
                  >
                    <option value="new">New / Under construction</option>
                    <option value="good">Good condition</option>
                    <option value="renovation">Needs renovation</option>
                  </select>
                </div>
                {!isLandOrCommercial && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 5 }}>Furnished</label>
                    <select
                      value={property.furnished ?? 'unfurnished'}
                      onChange={(e) => setProperty({ ...property, furnished: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 7, fontSize: 12, color: CSS_VARS.text, background: CSS_VARS.surface }}
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="partial">Partially furnished</option>
                      <option value="full">Fully furnished</option>
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 5 }}>Exclusive agreement?</label>
                  <select
                    value={property.exclusiveAgreement ?? 'maybe'}
                    onChange={(e) => setProperty({ ...property, exclusiveAgreement: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 10px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 7, fontSize: 12, color: CSS_VARS.text, background: CSS_VARS.surface }}
                  >
                    <option value="maybe">Open to discuss</option>
                    <option value="yes">Yes — exclusive only</option>
                    <option value="no">No — non-exclusive</option>
                  </select>
                </div>
              </div>

              {/* Location tags */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 6 }}>
                  Location proximity <span style={{ fontWeight: 400 }}>(select all that apply)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {[
                    { value: 'beach', label: '🏖 Beach / Seaside' },
                    { value: 'ski_resort', label: '⛷ Ski resort' },
                    { value: 'city_center', label: '🏙 City center' },
                    { value: 'airport', label: '✈️ Near airport' },
                    { value: 'school', label: '🎓 Near schools' },
                    { value: 'marina', label: '⚓ Marina / Port' },
                    { value: 'golf', label: '⛳ Golf course' },
                    { value: 'highway', label: '🛣 Highway access' },
                  ].map(({ value, label }) => {
                    const selected = (property.proximityTags ?? []).includes(value)
                    return (
                      <button key={value} onClick={() => {
                        const cur = property.proximityTags ?? []
                        setProperty({ ...property, proximityTags: selected ? cur.filter(t => t !== value) : [...cur, value] })
                      }} style={{
                        padding: '5px 10px', borderRadius: 16,
                        border: `1px solid ${selected ? CSS_VARS.primary : CSS_VARS.border}`,
                        background: selected ? CSS_VARS.primaryLight : CSS_VARS.surface,
                        color: selected ? CSS_VARS.primary : CSS_VARS.textSecondary,
                        fontSize: 11, fontWeight: selected ? 600 : 400, cursor: 'pointer',
                      }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Feature tags */}
              {!isLandOrCommercial && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 6 }}>
                    Property features <span style={{ fontWeight: 400 }}>(select all that apply)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                    {[
                      { value: 'pool', label: '🏊 Pool' },
                      { value: 'sea_view', label: '🌊 Sea view' },
                      { value: 'mountain_view', label: '🏔 Mountain view' },
                      { value: 'garden', label: '🌿 Garden' },
                      { value: 'garage', label: '🚗 Garage' },
                      { value: 'terrace', label: '🌅 Terrace / Balcony' },
                      { value: 'elevator', label: '🛗 Elevator' },
                      { value: 'basement', label: '🏚 Basement / Storage' },
                      { value: 'rooftop', label: '🏙 Rooftop' },
                      { value: 'smart_home', label: '🏠 Smart home' },
                    ].map(({ value, label }) => {
                      const selected = (property.features ?? []).includes(value)
                      return (
                        <button key={value} onClick={() => {
                          const cur = property.features ?? []
                          setProperty({ ...property, features: selected ? cur.filter(f => f !== value) : [...cur, value] })
                        }} style={{
                          padding: '5px 10px', borderRadius: 16,
                          border: `1px solid ${selected ? CSS_VARS.primary : CSS_VARS.border}`,
                          background: selected ? CSS_VARS.primaryLight : CSS_VARS.surface,
                          color: selected ? CSS_VARS.primary : CSS_VARS.textSecondary,
                          fontSize: 11, fontWeight: selected ? 600 : 400, cursor: 'pointer',
                        }}>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Target buyer types */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 6 }}>
                  Who do you want to sell to? <span style={{ fontWeight: 400 }}>(optional — APEX uses this to route to the right agencies)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {[
                    { value: 'investor', label: '💼 Investor' },
                    { value: 'expat', label: '🌍 EU expat' },
                    { value: 'russian_buyer', label: '🇷🇺 Russian-speaking' },
                    { value: 'family', label: '👨‍👩‍👧 Family' },
                    { value: 'developer', label: '🏗 Developer' },
                    { value: 'vacation_home', label: '🏖 Vacation home' },
                    { value: 'luxury', label: '💎 Luxury / HNWI' },
                    { value: 'local', label: '📍 Local buyer' },
                  ].map(({ value, label }) => {
                    const selected = (property.targetBuyerTypes ?? []).includes(value)
                    return (
                      <button key={value} onClick={() => {
                        const cur = property.targetBuyerTypes ?? []
                        setProperty({ ...property, targetBuyerTypes: selected ? cur.filter(t => t !== value) : [...cur, value] })
                      }} style={{
                        padding: '5px 10px', borderRadius: 16,
                        border: `1px solid ${selected ? CSS_VARS.blue : CSS_VARS.border}`,
                        background: selected ? 'rgba(59,91,219,0.08)' : CSS_VARS.surface,
                        color: selected ? CSS_VARS.blue : CSS_VARS.textSecondary,
                        fontSize: 11, fontWeight: selected ? 600 : 400, cursor: 'pointer',
                      }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Address & Map ── */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 4 }}>📍 Address & Location</h2>
            <p style={{ fontSize: 12, color: CSS_VARS.textSecondary, marginBottom: 24 }}>Enter the full address. Coordinates help agencies understand exact access.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Street address</label>
              <input type="text" placeholder="e.g. Kneza Miloša 123" value={property.address}
                onChange={(e) => setProperty({ ...property, address: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>City *</label>
                <input type="text" placeholder="e.g. Kremovice" value={property.city}
                  onChange={(e) => setProperty({ ...property, city: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${!property.city ? CSS_VARS.red : CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, boxSizing: 'border-box' as const, background: CSS_VARS.inputBg }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>Country *</label>
                <select value={property.country} onChange={(e) => setProperty({ ...property, country: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${!property.country ? CSS_VARS.red : CSS_VARS.border}`, borderRadius: 8, fontSize: 13, color: CSS_VARS.text, background: CSS_VARS.inputBg }}>
                  <option value="">Select country</option>
                  {['Albania','Austria','Belgium','Bosnia','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Ukraine'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Map placeholder + coordinates */}
            <div style={{ border: `2px dashed ${CSS_VARS.border}`, borderRadius: 12, padding: 20, background: CSS_VARS.surface2, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: CSS_VARS.text }}>Map pin (optional)</div>
                  <div style={{ fontSize: 11, color: CSS_VARS.textSecondary }}>Enter coordinates or use Google Maps to find exact location</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: CSS_VARS.textSecondary, marginBottom: 4 }}>Latitude</label>
                  <input type="number" step="0.000001" placeholder="e.g. 42.441" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 7, fontSize: 12, color: CSS_VARS.text, background: CSS_VARS.inputBg, boxSizing: 'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: CSS_VARS.textSecondary, marginBottom: 4 }}>Longitude</label>
                  <input type="number" step="0.000001" placeholder="e.g. 19.264" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${CSS_VARS.border}`, borderRadius: 7, fontSize: 12, color: CSS_VARS.text, background: CSS_VARS.inputBg, boxSizing: 'border-box' as const }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: CSS_VARS.textTertiary, marginTop: 10 }}>
                💡 Google Maps integration coming in v1.1. For now, copy lat/lng from maps.google.com.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: AI Description (moved from step 1) ── */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 24 }}>
              ✨ AI Packaging
            </h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                Describe your property (2-3 sentences)
              </label>
              <textarea
                placeholder="e.g. Beautiful apartment in downtown with modern finishes. Close to metro and shopping centers. Perfect investment opportunity."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${shortDesc.length > 0 && shortDesc.length < 10 ? CSS_VARS.red : CSS_VARS.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: CSS_VARS.text,
                  minHeight: 100,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  background: CSS_VARS.inputBg,
                }}
              />
              {shortDesc.length > 0 && shortDesc.length < 10 && (
                <p style={{ fontSize: 11, color: CSS_VARS.red, marginTop: 4 }}>
                  ⚠ Type at least {10 - shortDesc.length} more characters to unlock AI generation
                </p>
              )}
              {shortDesc.length === 0 && (
                <p style={{ fontSize: 11, color: CSS_VARS.textTertiary, marginTop: 4 }}>
                  Min. 10 characters → then click Generate AI Pack below
                </p>
              )}
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || shortDesc.length < 10}
              style={{
                padding: '12px 24px',
                background:
                  isGeneratingAI || shortDesc.length < 10
                    ? CSS_VARS.surface2
                    : CSS_VARS.primary,
                color:
                  isGeneratingAI || shortDesc.length < 10
                    ? CSS_VARS.textTertiary
                    : 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: isGeneratingAI || shortDesc.length < 10 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
              }}
            >
              {isGeneratingAI ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  Generating…
                </>
              ) : (
                <>✨ Generate AI Pack</>
              )}
            </button>

            {aiPackData && (
              <div style={{ background: 'rgba(245,194,0,0.04)', border: '1px solid rgba(245,194,0,0.18)', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#F5C200,#FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.5 5.5H13.5L9.5 8L11 12.5L7 10L3 12.5L4.5 8L0.5 5.5H5.5L7 1Z" fill="#080810"/></svg>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: CSS_VARS.primary, margin: 0 }}>AI Pack Generated</h3>
                  <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, color: CSS_VARS.green, padding: '3px 10px', background: CSS_VARS.greenDim, borderRadius: 100 }}>Ready</div>
                </div>
                <div style={{ fontSize: 13, color: CSS_VARS.text, lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Headline</div>
                    <div style={{ color: CSS_VARS.primary, fontWeight: 600 }}>{aiPackData.headline}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Description</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {aiPackData.description}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Key Features</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {aiPackData.keyFeatures.map((f, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Investment Highlights</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {aiPackData.investmentHighlights.map((h, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Target Buyer</div>
                    <div>{aiPackData.targetBuyerProfile}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Photos + Documents (merged) ── */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 4 }}>
              📸 Photos & Documents
            </h2>
            <p style={{ fontSize: 12, color: CSS_VARS.textSecondary, marginBottom: 24 }}>
              Add photos and ownership documents. Both steps are optional — you can always add them later.
            </p>

            {/* ── Photos ── */}
            <div style={{ fontSize: 11, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Photos</div>

            {/* Hidden file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.slice(0, 20 - photos.length).forEach(file => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setPhotos(prev => [...prev, ev.target!.result as string].slice(0, 20));
                    }
                  };
                  reader.readAsDataURL(file);
                });
                e.target.value = '';
              }}
            />

            {/* Drop zone */}
            <div
              onClick={() => photoInputRef.current?.click()}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                files.slice(0, 20 - photos.length).forEach(file => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setPhotos(prev => [...prev, ev.target!.result as string].slice(0, 20));
                    }
                  };
                  reader.readAsDataURL(file);
                });
              }}
              style={{
                border: `2px dashed ${dragActive ? CSS_VARS.primary : CSS_VARS.border}`,
                borderRadius: 12, padding: '28px 24px', textAlign: 'center' as const,
                background: dragActive ? CSS_VARS.primaryLight : CSS_VARS.surface2,
                marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: CSS_VARS.text, marginBottom: 4 }}>
                Click or drag photos here
              </div>
              <div style={{ fontSize: 12, color: CSS_VARS.textSecondary }}>
                Up to 20 photos (JPG, PNG) · {photos.length}/20 uploaded
              </div>
            </div>

            {/* Uploaded thumbnails */}
            {photos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>
                  Uploaded ({photos.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {photos.map((src, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: `1px solid ${CSS_VARS.border}` }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                          borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none',
                          color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: CSS_VARS.border, margin: '20px 0' }} />

            {/* ── Documents ── */}
            <div style={{ fontSize: 11, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Documents</div>
            <p style={{ fontSize: 12, color: CSS_VARS.textSecondary, marginBottom: 16 }}>
              Documents are <strong style={{ color: CSS_VARS.text }}>never sent</strong> to agencies automatically — only shared on your explicit request.
            </p>

            {/* Hidden file inputs */}
            <input ref={titleDeedRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { const url = URL.createObjectURL(f); setTitleDeed({ name: f.name, size: f.size, url, type: f.type }); }
                e.target.value = '';
              }} />
            <input ref={idDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { const url = URL.createObjectURL(f); setIdDocument({ name: f.name, size: f.size, url, type: f.type }); }
                e.target.value = '';
              }} />
            <input ref={otherDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setOtherDocs(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f), type: f.type }))]);
                e.target.value = '';
              }} />

            {/* Title Deed */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: CSS_VARS.text, marginBottom: 8 }}>
                🏠 Title Deed
                <span style={{ marginLeft: 8, fontSize: 10, color: CSS_VARS.green, fontWeight: 600 }}>recommended</span>
              </div>
              {titleDeed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CSS_VARS.greenDim, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{titleDeed.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{titleDeed.name}</div>
                    <div style={{ fontSize: 10, color: CSS_VARS.textTertiary }}>{(titleDeed.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={() => setTitleDeed(null)} style={{ background: 'none', border: 'none', color: CSS_VARS.textTertiary, cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ) : (
                <button onClick={() => titleDeedRef.current?.click()} style={{
                  width: '100%', padding: '12px', border: `2px dashed ${CSS_VARS.border}`, borderRadius: 10,
                  background: CSS_VARS.surface2, color: CSS_VARS.textSecondary, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <span>⬆️</span> Upload PDF or photo of document
                </button>
              )}
            </div>

            {/* ID Document */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: CSS_VARS.text, marginBottom: 8 }}>
                🪪 ID / Passport
                <span style={{ marginLeft: 8, fontSize: 10, color: CSS_VARS.textTertiary, fontWeight: 500 }}>optional</span>
              </div>
              {idDocument ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CSS_VARS.greenDim, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{idDocument.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{idDocument.name}</div>
                    <div style={{ fontSize: 10, color: CSS_VARS.textTertiary }}>{(idDocument.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={() => setIdDocument(null)} style={{ background: 'none', border: 'none', color: CSS_VARS.textTertiary, cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ) : (
                <button onClick={() => idDocRef.current?.click()} style={{
                  width: '100%', padding: '12px', border: `2px dashed ${CSS_VARS.border}`, borderRadius: 10,
                  background: CSS_VARS.surface2, color: CSS_VARS.textSecondary, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <span>⬆️</span> Upload passport or ID
                </button>
              )}
            </div>

            {/* Other documents */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: CSS_VARS.text, marginBottom: 8 }}>
                📁 Other Documents
                <span style={{ marginLeft: 8, fontSize: 10, color: CSS_VARS.textTertiary, fontWeight: 500 }}>optional</span>
              </div>
              {otherDocs.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: CSS_VARS.surface2, border: `1px solid ${CSS_VARS.border}`, borderRadius: 8, marginBottom: 6 }}>
                  <span>📄</span>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: CSS_VARS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{doc.name}</div>
                  <span style={{ fontSize: 10, color: CSS_VARS.textTertiary }}>{(doc.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setOtherDocs(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: CSS_VARS.textTertiary, cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
              <button onClick={() => otherDocRef.current?.click()} style={{
                width: '100%', padding: '10px', border: `1px dashed ${CSS_VARS.border}`, borderRadius: 8,
                background: 'transparent', color: CSS_VARS.textTertiary, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                + Add document
              </button>
            </div>

            {/* Privacy note */}
            <div style={{ padding: '12px 14px', background: 'rgba(59,91,219,0.06)', border: '1px solid rgba(59,91,219,0.15)', borderRadius: 10, fontSize: 11, color: CSS_VARS.textSecondary, display: 'flex', gap: 8 }}>
              <span>🔒</span>
              <span>Documents are stored encrypted and <strong style={{ color: CSS_VARS.text }}>never shared with agencies</strong> without your explicit consent. GDPR-compliant.</span>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Confirm ── */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 4 }}>
              ✅ Review & Confirm
            </h2>
            <p style={{ fontSize: 12, color: CSS_VARS.textSecondary, marginBottom: 24 }}>
              Check all details before launching distribution. You can go back to make changes.
            </p>

            {/* Property summary card */}
            <div style={{ background: CSS_VARS.surface2, border: `1px solid ${CSS_VARS.border}`, borderRadius: 14, padding: '20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 14 }}>Property Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Type', value: property.type },
                  { label: 'Mode', value: `For ${property.mode}` },
                  { label: 'City', value: property.city || '—' },
                  { label: 'Country', value: property.country || '—' },
                  { label: 'Area', value: property.areaSqm > 0 ? `${property.areaSqm} m²` : '—' },
                  { label: 'Price', value: property.price > 0 ? `${property.price.toLocaleString()} ${property.currency}` : '—' },
                  ...(!isLandOrCommercial ? [
                    { label: 'Bedrooms', value: `${property.bedrooms}` },
                    { label: 'Bathrooms', value: `${property.bathrooms}` },
                  ] : []),
                  { label: 'Address', value: property.address || '—' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, color: CSS_VARS.textTertiary, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: CSS_VARS.text }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Media summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { emoji: '📸', label: 'Photos', value: `${photos.length} uploaded`, ok: photos.length > 0 },
                { emoji: '📄', label: 'Title Deed', value: titleDeed ? titleDeed.name : 'Not uploaded', ok: !!titleDeed },
                { emoji: '✨', label: 'AI Pack', value: aiPackData ? 'Generated' : 'Not generated', ok: !!aiPackData },
              ].map(item => (
                <div key={item.label} style={{ background: CSS_VARS.surface, border: `1px solid ${item.ok ? 'rgba(22,163,74,0.25)' : CSS_VARS.border}`, borderRadius: 10, padding: '12px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: item.ok ? CSS_VARS.green : CSS_VARS.textSecondary, fontWeight: item.ok ? 700 : 400 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Description preview */}
            {shortDesc && (
              <div style={{ background: CSS_VARS.surface, border: `1px solid ${CSS_VARS.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Your Description</div>
                <p style={{ fontSize: 13, color: CSS_VARS.textSecondary, lineHeight: 1.6, margin: 0 }}>{shortDesc}</p>
              </div>
            )}

            {/* GDPR consent notice */}
            <div style={{ padding: '14px 16px', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🛡️</span>
              <div style={{ fontSize: 12, color: CSS_VARS.textSecondary, lineHeight: 1.6 }}>
                <strong style={{ color: CSS_VARS.text }}>By continuing, you confirm:</strong> Your property details will be shared with matched agencies for sales purposes. All data is processed in accordance with GDPR. You can stop distribution at any time by marking the property as sold.
              </div>
            </div>
          </div>
        )}

        {/* ── Step 6: APEX Distribution (Outreach) ── */}
        {currentStep === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, margin: 0 }}>
                  🎯 APEX Matching Engine
                </h2>
                {apexResult && (
                  <div style={{ fontSize: 11, color: CSS_VARS.textSecondary, marginTop: 4 }}>
                    Scanned {apexResult.total_scanned} agencies → {apexResult.passed_filter} qualified → {apexResult.results.length} selected
                  </div>
                )}
              </div>
              {/* Auto / Manual mode toggle */}
              <div style={{ display: 'flex', gap: 4, background: CSS_VARS.surface2, borderRadius: 8, padding: 3 }}>
                {(['auto', 'manual'] as const).map(m => (
                  <button key={m} onClick={() => setDistMode(m)} style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700,
                    background: distMode === m ? CSS_VARS.primary : 'transparent',
                    color: distMode === m ? '#080810' : CSS_VARS.textTertiary,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    transition: 'all 0.15s',
                  }}>
                    {m === 'auto' ? '⚡ Auto' : '✋ Manual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {apexLoading && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: 40, height: 40, margin: '0 auto 16px', borderRadius: '50%', border: `3px solid ${CSS_VARS.border}`, borderTopColor: CSS_VARS.primary, animation: 'spin 0.7s linear infinite' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: CSS_VARS.textSecondary }}>APEX is scanning {DEMO_AGENCY_POOL.length} agencies…</div>
                <div style={{ fontSize: 11, color: CSS_VARS.textTertiary, marginTop: 6 }}>Analyzing channels, Money Flow Matrix, anti-fatigue filters</div>
              </div>
            )}

            {/* APEX Result */}
            {apexResult && !apexLoading && (
              <>
                {/* Property DNA banner */}
                <div style={{ background: 'rgba(59,91,219,0.08)', border: '1px solid rgba(59,91,219,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, color: '#93A6F7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>Property DNA</div>
                  <div style={{ fontSize: 11, color: CSS_VARS.textSecondary }}>
                    <span style={{ color: CSS_VARS.text, fontWeight: 600 }}>Band:</span> {apexResult.property_dna.price_band}
                  </div>
                  <div style={{ fontSize: 11, color: CSS_VARS.textSecondary }}>
                    <span style={{ color: CSS_VARS.text, fontWeight: 600 }}>Markets:</span> {apexResult.property_dna.demand_markets.slice(0,4).join(' · ')}
                  </div>
                  <div style={{ fontSize: 11, color: CSS_VARS.textSecondary }}>
                    <span style={{ color: CSS_VARS.text, fontWeight: 600 }}>Buyers:</span> {apexResult.property_dna.buyer_archetypes.slice(0,2).join(', ')}
                  </div>
                  {apexResult.warnings.length > 0 && (
                    <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>⚠ {apexResult.warnings[0]}</div>
                  )}
                </div>

                {/* Channel tabs */}
                {(() => {
                  const tabs: { key: 'all' | AgencyChannel; label: string; color: string; count: number }[] = [
                    { key: 'all', label: 'All', color: CSS_VARS.primary, count: apexResult.results.length },
                    { key: 'local', label: '🏠 Local', color: '#22C55E', count: apexResult.channel_breakdown.local.length },
                    { key: 'cross_border', label: '🌍 Cross-Border', color: '#3B5BDB', count: apexResult.channel_breakdown.cross_border.length },
                    { key: 'stealth', label: '🕵️ Stealth', color: '#A855F7', count: apexResult.channel_breakdown.stealth.length },
                  ];
                  return (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                      {tabs.map(t => (
                        <button key={t.key} onClick={() => setChannelTab(t.key)} style={{
                          padding: '6px 14px', borderRadius: 20, border: channelTab === t.key ? `2px solid ${t.color}` : `1px solid ${CSS_VARS.border}`,
                          background: channelTab === t.key ? `${t.color}18` : 'transparent',
                          color: channelTab === t.key ? t.color : CSS_VARS.textSecondary,
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          {t.label}
                          <span style={{ background: channelTab === t.key ? t.color : CSS_VARS.surface2, color: channelTab === t.key ? '#fff' : CSS_VARS.textTertiary, borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                            {t.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* Manual mode select-all bar */}
                {distMode === 'manual' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '8px 12px', background: CSS_VARS.surface2, borderRadius: 8 }}>
                    <input type="checkbox"
                      checked={selectedAgencies.size === apexResult.results.length}
                      onChange={e => setSelectedAgencies(e.target.checked ? new Set(apexResult.results.map(r => r.agency.id)) : new Set())}
                      style={{ width: 14, height: 14, cursor: 'pointer', accentColor: CSS_VARS.primary }}
                    />
                    <span style={{ fontSize: 12, color: CSS_VARS.textSecondary, fontWeight: 600 }}>
                      {selectedAgencies.size} / {apexResult.results.length} agencies selected
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: CSS_VARS.textTertiary }}>
                      Uncheck to exclude from distribution
                    </span>
                  </div>
                )}

                {/* Wave sections */}
                {([1, 2, 3] as const).map(waveNum => {
                  const allInWave = apexResult.wave_breakdown[`wave${waveNum}` as 'wave1' | 'wave2' | 'wave3'];
                  const waveAgencies = channelTab === 'all' ? allInWave : allInWave.filter(r => r.channel === channelTab);
                  if (waveAgencies.length === 0) return null;

                  const waveColors: Record<number, string> = { 1: '#22C55E', 2: '#3B5BDB', 3: '#A855F7' };
                  const waveLabels: Record<number, string> = { 1: 'Wave 1 — Top Priority', 2: 'Wave 2 — Secondary', 3: 'Wave 3 — Extended' };
                  const waveTiming = apexResult.send_schedule.find(s => s.wave === waveNum);
                  const wColor = waveColors[waveNum];

                  return (
                    <div key={waveNum} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ height: 1, flex: 1, background: CSS_VARS.border }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: wColor, background: `${wColor}15`, border: `1px solid ${wColor}35`, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {waveLabels[waveNum]}
                          </span>
                          {waveTiming && (
                            <span style={{ fontSize: 10, color: CSS_VARS.textTertiary }}>
                              📅 {new Date(waveTiming.send_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div style={{ height: 1, flex: 1, background: CSS_VARS.border }} />
                      </div>

                      {waveAgencies.map((r, idx) => {
                        const isSelected = selectedAgencies.has(r.agency.id);
                        const isExpanded = expandedAgency === r.agency.id;
                        const channelColors: Record<AgencyChannel, string> = { local: '#22C55E', cross_border: '#3B5BDB', stealth: '#A855F7' };
                        const channelLabels: Record<AgencyChannel, string> = { local: '🏠', cross_border: '🌍', stealth: '🕵️' };
                        const cColor = channelColors[r.channel];

                        return (
                          <div key={r.agency.id} style={{ marginBottom: 6 }}>
                            {/* Main row */}
                            <div
                              onClick={() => distMode === 'manual'
                                ? (() => { const s = new Set(selectedAgencies); s.has(r.agency.id) ? s.delete(r.agency.id) : s.add(r.agency.id); setSelectedAgencies(s); })()
                                : setExpandedAgency(isExpanded ? null : r.agency.id)
                              }
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                                border: isSelected && distMode === 'manual' ? `1px solid ${cColor}50` : `1px solid ${CSS_VARS.border}`,
                                background: isSelected && distMode === 'manual' ? `${cColor}08` : CSS_VARS.surface,
                                transition: 'all 0.15s',
                              }}
                            >
                              {/* Checkbox in manual mode */}
                              {distMode === 'manual' && (
                                <input type="checkbox" checked={isSelected} onChange={() => {}} onClick={e => e.stopPropagation()}
                                  style={{ width: 14, height: 14, flexShrink: 0, accentColor: cColor, cursor: 'pointer' }}
                                />
                              )}

                              {/* Channel badge */}
                              <span style={{ fontSize: 14, flexShrink: 0 }}>{channelLabels[r.channel]}</span>

                              {/* Name + location */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {r.agency.name}
                                  {r.agency.quality_score >= 92 && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: CSS_VARS.primary, background: 'rgba(245,194,0,0.12)', padding: '1px 6px', borderRadius: 10 }}>ELITE</span>
                                  )}
                                </div>
                                <div style={{ fontSize: 10, color: CSS_VARS.textTertiary }}>
                                  {r.agency.country} · {r.agency.languages.slice(0,3).map(l => l.toUpperCase()).join(' / ')} · {r.agency.historical.response_rate}% reply rate
                                </div>
                              </div>

                              {/* Score */}
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: cColor }}>{Math.round(r.apex_score)}</div>
                                <div style={{ fontSize: 9, color: CSS_VARS.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>score</div>
                              </div>

                              {/* Expand toggle */}
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                onClick={e => { e.stopPropagation(); setExpandedAgency(isExpanded ? null : r.agency.id); }}
                                style={{ color: CSS_VARS.textTertiary, flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                <path d="M2.5 4.5L6 7.5L9.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                              </svg>
                            </div>

                            {/* Expanded profile */}
                            {isExpanded && (
                              <div style={{ margin: '0 0 4px 0', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${CSS_VARS.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                                {/* Why matched */}
                                <div style={{ marginBottom: 12 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Why Matched</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {r.why_matched.map((w, i) => (
                                      <span key={i} style={{ fontSize: 10, color: cColor, background: `${cColor}12`, border: `1px solid ${cColor}25`, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{w}</span>
                                    ))}
                                  </div>
                                </div>

                                {/* Deal signals */}
                                {r.deal_signals.length > 0 && (
                                  <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: CSS_VARS.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Active Signals</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {r.deal_signals.map((s, i) => (
                                        <span key={i} style={{ fontSize: 10, color: CSS_VARS.green, background: CSS_VARS.greenDim, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>⚡ {s}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Score breakdown */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                                  {[
                                    { label: 'Local', val: r.local_score, color: '#22C55E' },
                                    { label: 'Cross-Border', val: r.cross_border_score, color: '#3B5BDB' },
                                    { label: 'Stealth', val: r.stealth_score, color: '#A855F7' },
                                  ].map(s => (
                                    <div key={s.label} style={{ background: CSS_VARS.surface2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                      <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{Math.round(s.val)}</div>
                                      <div style={{ fontSize: 9, color: CSS_VARS.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Meta: specializations, buyer markets, channels */}
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: CSS_VARS.textSecondary }}>
                                  <div><span style={{ color: CSS_VARS.textTertiary }}>Specializes: </span>{r.agency.specializations.join(', ')}</div>
                                  <div><span style={{ color: CSS_VARS.textTertiary }}>Buyer markets: </span>{r.agency.buyer_markets.slice(0,5).join(', ')}</div>
                                  <div><span style={{ color: CSS_VARS.textTertiary }}>Channels: </span>{r.agency.delivery_channels.join(', ')}</div>
                                  {r.agency.historical.cross_border_deals_12m > 0 && (
                                    <div><span style={{ color: CSS_VARS.textTertiary }}>CB deals (12m): </span>{r.agency.historical.cross_border_deals_12m}</div>
                                  )}
                                </div>

                                {/* Fatigue warning */}
                                {r.fatigue_penalty < 0.9 && (
                                  <div style={{ marginTop: 8, fontSize: 10, color: '#F59E0B', fontWeight: 600 }}>
                                    ⚠ Anti-fatigue penalty applied ({Math.round((1 - r.fatigue_penalty) * 100)}% reduction — contacted recently)
                                  </div>
                                )}

                                {/* Send time */}
                                <div style={{ marginTop: 8, fontSize: 10, color: CSS_VARS.textTertiary }}>
                                  📅 Scheduled: {new Date(r.send_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} (agency local time)
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}

            {/* Distribution progress bar */}
            {isSending && (
              <div style={{ marginBottom: 24, padding: '20px 24px', background: 'rgba(245,194,0,0.04)', border: '1px solid rgba(245,194,0,0.2)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 700, color: CSS_VARS.primary }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CSS_VARS.primary, animation: 'pulse 1s infinite' }} />
                    Distributing via APEX channels…
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: CSS_VARS.primary }}>{sendProgress}%</div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${sendProgress}%`,
                    background: 'linear-gradient(90deg, #22C55E, #3B5BDB, #A855F7)',
                    boxShadow: '0 0 10px rgba(59,91,219,0.5)',
                    transition: 'width 0.3s ease',
                    borderRadius: 99,
                  }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: CSS_VARS.textTertiary }}>
                  Local → Cross-Border → Stealth channels
                </div>
              </div>
            )}
          </div>
        )}

        {/* Draft saved indicator moved to header */}
      </div>

      {/* Navigation buttons */}
      <div style={{ maxWidth: 800, margin: '20px auto 0', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={() => (currentStep > 0 ? setCurrentStep(currentStep - 1) : router.push('/dashboard'))}
          style={{
            padding: '13px 24px',
            background: 'transparent',
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: CSS_VARS.textSecondary,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {currentStep === 0 ? '← Cancel' : '← Back'}
        </button>

        <button
          onClick={() => {
            if (currentStep === 5) {
              handleSendDistribution();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={!canProceed() || isSending || (currentStep === 5 && apexLoading)}
          style={{
            padding: '13px 32px',
            background: canProceed() && !isSending ? CSS_VARS.primary : CSS_VARS.surface2,
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: canProceed() && !isSending ? '#FFFFFF' : CSS_VARS.textTertiary,
            cursor: canProceed() && !isSending ? 'pointer' : 'not-allowed',
            boxShadow: canProceed() && !isSending ? `0 0 24px rgba(22,163,74,0.3)` : 'none',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {isSending ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Sending to agencies…
            </>
          ) : currentStep === 5 ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {apexResult
                ? `🚀 Launch — ${distMode === 'manual' ? selectedAgencies.size : apexResult.results.length} Agencies`
                : 'Launch Distribution'}
            </>
          ) : currentStep === 4 ? 'Confirm & Continue →' : 'Continue →'}
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInOut { 0%,100% { opacity: 0; transform: translateY(6px); } 50% { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        input, select, textarea { color-scheme: light; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>
    </div>
  );
}
