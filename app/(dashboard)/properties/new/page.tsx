'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { runAPEX, type APEXResult, type APEXAgencyResult, type AgencyChannel } from '@/lib/ai-matching/apex-engine';
import { DEMO_AGENCY_POOL } from '@/lib/ai-matching/demo-agencies';
// DEMO_AGENCY_POOL contains real agency data — in production replaced by /api/agencies

const CSS_VARS = {
  bg: '#080810',
  surface: 'rgba(255,255,255,0.04)',
  surface2: 'rgba(255,255,255,0.07)',
  surface3: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.16)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textTertiary: 'rgba(255,255,255,0.35)',
  primary: '#F5C200',
  primaryHover: '#E0B000',
  primaryLight: 'rgba(245,194,0,0.12)',
  green: '#22C55E',
  greenDim: 'rgba(34,197,94,0.12)',
  red: '#EF4444',
  blue: '#3B5BDB',
  inputBg: '#0E0E1C',
};

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
}

interface AIPackData {
  headline: string;
  description: string;
  keyFeatures: string[];
  investmentHighlights: string[];
  targetBuyerProfile: string;
}

export default function PropertiesNewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);

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
  });

  // Step 2: AI Description
  const [shortDesc, setShortDesc] = useState('');
  const [aiPackData, setAIPackData] = useState<AIPackData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

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

  // Run APEX when entering Step 4 (index 3)
  useEffect(() => {
    if (currentStep === 3 && !apexResult && !apexLoading) {
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

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!(
          property.type &&
          property.city &&
          property.country &&
          property.areaSqm > 0 &&
          property.price > 0
        );
      case 1:
        return !!(shortDesc.length >= 10 && aiPackData);
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation (2 seconds)
    await new Promise((r) => setTimeout(r, 2000));

    const pack: AIPackData = {
      headline: `Luxury ${property.type} in ${property.city} — Premium ${property.mode === 'sale' ? 'Investment' : 'Rental'} Opportunity`,
      description: `This stunning ${property.type} in ${property.city}, ${property.country} offers ${property.areaSqm}m² of sophisticated living space. Located in one of the most sought-after areas, this property combines modern comfort with timeless elegance. The open-plan living areas are perfectly designed for contemporary lifestyles, featuring premium finishes throughout. With ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, this residence is ideal for families and investors alike. The property boasts excellent natural light, high ceilings, and a thoughtfully curated layout that maximizes both functionality and aesthetics.\n\nEach room has been meticulously designed with attention to detail, featuring quality materials and state-of-the-art amenities. The location provides easy access to shopping, dining, cultural venues, and excellent public transportation links. Whether you're looking for a primary residence, vacation home, or investment property, this exceptional offering delivers outstanding value and lifestyle benefits.\n\nThis is a rare opportunity to acquire a premium property in a thriving market. The area has demonstrated strong appreciation and rental demand. Contact us today to schedule an exclusive viewing and discover why this property represents an excellent choice for discerning buyers.`,
      keyFeatures: [
        `${property.areaSqm}m² of premium living space`,
        `${property.bedrooms} spacious bedrooms with ensuite bathrooms`,
        `${property.bathrooms} modern bathrooms with luxury finishes`,
        'Open-plan living areas with high ceilings',
        'Modern kitchen with integrated appliances',
        'Prime location in ${property.city}',
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

    // Simulate distribution
    for (let i = 0; i < total; i++) {
      await new Promise((r) => setTimeout(r, Math.max(100, 1500 / total)));
      setSendProgress(Math.round(((i + 1) / total) * 100));

      // On 9th agency (Win-Win Solution), send real email
      if (i === 8 && aiPackData) {
        try {
          const emailBody = generateEmailHTML();
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer re_K7ZtSKPE_EvUtEnCFCMoRCH1JjY2EgmMd',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'PropBlaze Platform <onboarding@resend.dev>',
              to: 'contact@win-winsolution.com',
              subject: `🏠 New Property Offer: ${property.type} in ${property.city} — PropBlaze AI Match`,
              html: emailBody,
            }),
          });
        } catch (error) {
          console.error('Email send failed:', error);
        }
      }
    }

    setIsSending(false);

    // Save property to localStorage so My Properties page shows it
    try {
      const wizardProp = {
        id: `wizard-${Date.now()}`,
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
        photos: photos,
        status: 'in_distribution',
        agencies_sent: distMode === 'manual' ? selectedAgencies.size : (apexResult?.results.length ?? 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('pb_wizard_props') || '[]');
      localStorage.setItem('pb_wizard_props', JSON.stringify([wizardProp, ...existing]));
    } catch (e) {
      // localStorage not available
    }

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

  const STEPS = ['Property Details', 'AI Packaging', 'Photos', 'Launch'];

  return (
    <div style={{ minHeight: '100vh', background: CSS_VARS.bg, padding: '40px 24px 100px', fontFamily: "'Inter',system-ui,sans-serif", color: CSS_VARS.text }}>

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  color: i < currentStep ? '#0A1A0A' : i === currentStep ? '#0A0A00' : CSS_VARS.textTertiary,
                  border: i === currentStep ? `2px solid ${CSS_VARS.primary}` : 'none',
                  boxShadow: i === currentStep ? `0 0 20px rgba(245,194,0,0.35)` : 'none',
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
        {/* Step 1: Property Basics */}
        {currentStep === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 24 }}>
              Property Details
            </h2>

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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                Address / Street
              </label>
              <input
                type="text"
                placeholder="e.g. Kneza Miloša 123"
                value={property.address}
                onChange={(e) => setProperty({ ...property, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${CSS_VARS.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: CSS_VARS.text,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Belgrade"
                  value={property.city}
                  onChange={(e) => setProperty({ ...property, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serbia"
                  value={property.country}
                  onChange={(e) => setProperty({ ...property, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Area (m²)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.areaSqm || ''}
                  onChange={(e) => setProperty({ ...property, areaSqm: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Bedrooms
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.bedrooms || ''}
                  onChange={(e) => setProperty({ ...property, bedrooms: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Bathrooms
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.bathrooms || ''}
                  onChange={(e) => setProperty({ ...property, bathrooms: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 6 }}>
                  Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={property.price || ''}
                  onChange={(e) => setProperty({ ...property, price: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                    boxSizing: 'border-box',
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
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: CSS_VARS.text,
                  }}
                >
                  {['EUR', 'USD', 'CHF', 'RSD'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI Description */}
        {currentStep === 1 && (
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
                  border: `1px solid ${CSS_VARS.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: CSS_VARS.text,
                  minHeight: 100,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
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

        {/* Step 3: Photos */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 24 }}>
              Photos & Documents
            </h2>

            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDrop={() => setDragActive(false)}
              style={{
                border: `2px dashed ${dragActive ? CSS_VARS.primary : CSS_VARS.border}`,
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                background: dragActive ? CSS_VARS.primaryLight : CSS_VARS.surface2,
                marginBottom: 24,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: CSS_VARS.text, marginBottom: 4 }}>
                Drag and drop photos here
              </div>
              <div style={{ fontSize: 12, color: CSS_VARS.textSecondary }}>
                Up to 20 photos (JPG, PNG)
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 12 }}>
                Sample Photos
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      background: CSS_VARS.surface2,
                      borderRadius: 8,
                      border: `1px solid ${CSS_VARS.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: CSS_VARS.textTertiary,
                      fontSize: 12,
                    }}
                  >
                    Sample Photo {i}
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/documents"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: CSS_VARS.primary,
                textDecoration: 'none',
              }}
            >
              📁 Your Documents Vault
            </a>
          </div>
        )}

        {/* Step 4: APEX Distribution */}
        {currentStep === 3 && (
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
            if (currentStep === 3) {
              handleSendDistribution();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={!canProceed() || isSending || (currentStep === 3 && apexLoading)}
          style={{
            padding: '13px 32px',
            background: canProceed() && !isSending ? CSS_VARS.primary : CSS_VARS.surface2,
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: canProceed() && !isSending ? '#080810' : CSS_VARS.textTertiary,
            cursor: canProceed() && !isSending ? 'pointer' : 'not-allowed',
            boxShadow: canProceed() && !isSending ? '0 0 24px rgba(245,194,0,0.3)' : 'none',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {isSending ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#080810', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Sending to agencies…
            </>
          ) : currentStep === 3 ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {apexResult
                ? `🚀 Launch — ${distMode === 'manual' ? selectedAgencies.size : apexResult.results.length} Agencies`
                : 'Launch Distribution'}
            </>
          ) : 'Continue →'}
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInOut { 0%,100% { opacity: 0; transform: translateY(6px); } 50% { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        input, select, textarea {
          background: #0E0E1C !important;
          color: #FFFFFF !important;
          -webkit-text-fill-color: #FFFFFF;
          color-scheme: dark;
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.32) !important; -webkit-text-fill-color: rgba(255,255,255,0.32) !important; }
        option { background: #0E0E1C !important; color: #FFFFFF !important; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>
    </div>
  );
}
