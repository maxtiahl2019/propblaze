'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

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

  // Step 1: Basic info — pre-filled for demo speed
  const [property, setProperty] = useState<PropertyData>({
    type: 'Apartment',
    address: 'Knez Mihailova 28',
    city: 'Belgrade',
    country: 'Serbia',
    areaSqm: 75,
    bedrooms: 2,
    bathrooms: 1,
    mode: 'sale',
    price: 145000,
    currency: 'EUR',
  });

  // Step 2: AI Description — pre-filled hint
  const [shortDesc, setShortDesc] = useState('Renovated city-centre apartment in Belgrade\'s pedestrian zone. Floor 5, high ceilings, new kitchen. 5 min to Kalemegdan fortress.');
  const [aiPackData, setAIPackData] = useState<AIPackData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Step 4: Distribution
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [distributionComplete, setDistributionComplete] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [property, shortDesc, photos]);

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

    // Simulate distribution to 10 agencies
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setSendProgress(Math.round(((i + 1) / 10) * 100));

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
        agencies_sent: 10,
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

        {/* Step 4: Distribution */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CSS_VARS.text, marginBottom: 24 }}>
              Distribution to Agencies
            </h2>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Matched agencies (10)
              </div>

              {DEMO_AGENCIES.map((agency, index) => (
                <div
                  key={agency.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${CSS_VARS.border}`,
                    marginBottom: 8,
                    background: agency.isRealEmail ? CSS_VARS.primaryLight : CSS_VARS.surface,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        fontSize: 18,
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: CSS_VARS.surface2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {agency.flag}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text }}>
                        {index + 1}. {agency.name}
                        {agency.isRealEmail && ' ★'}
                      </div>
                      <div style={{ fontSize: 11, color: CSS_VARS.textSecondary }}>
                        {agency.city}, {agency.country}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: CSS_VARS.primary }}>
                      {agency.score}/100
                    </div>
                    {agency.isRealEmail && (
                      <div
                        style={{
                          fontSize: 10,
                          color: CSS_VARS.primary,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        Real email will be sent
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isSending && (
              <div style={{ marginBottom: 24, padding: '20px 24px', background: 'rgba(245,194,0,0.04)', border: '1px solid rgba(245,194,0,0.2)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 700, color: CSS_VARS.primary }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CSS_VARS.primary, animation: 'pulse 1s infinite' }} />
                    Distributing to agencies…
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: CSS_VARS.primary }}>{sendProgress}%</div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${sendProgress}%`,
                    background: 'linear-gradient(90deg, #F5C200, #FF8C00)',
                    boxShadow: '0 0 10px rgba(245,194,0,0.5)',
                    transition: 'width 0.3s ease',
                    borderRadius: 99,
                  }} />
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
          disabled={!canProceed() || isSending}
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
              Launch Distribution
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
