'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

const CSS_VARS = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  surface2: '#EEF1F7',
  border: '#DDE2EE',
  text: '#1A1F2E',
  textSecondary: '#6B7A99',
  textTertiary: '#9BA8C0',
  primary: '#F97316',
  primaryHover: '#EA580C',
  primaryLight: '#FFF3E8',
  green: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
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

  // Step 1: Basic info â pre-filled for demo speed
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

  // Step 2: AI Description â pre-filled hint
  const [shortDesc, setShortDesc] = useState('Renovated city-centre apartment in Belgrade\'s pedestrian zone. Floor 5, high ceilings, new kitchen. 5 min to Kalemegdan fortress.');
  const [aiPackData, setAIPackData] = useState<AIPackData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
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
  
  // ── Voice dictation (Web Speech API) ──────────────────────────────────────
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation not supported on this browser. Try Chrome on Android or Safari on iOS 14+.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setShortDesc(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

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
      headline: `Luxury ${property.type} in ${property.city} â Premium ${property.mode === 'sale' ? 'Investment' : 'Rental'} Opportunity`,
      description: `This stunning ${property.type} in ${property.city}, ${property.country} offers ${property.areaSqm}mÂ² of sophisticated living space. Located in one of the most sought-after areas, this property combines modern comfort with timeless elegance. The open-plan living areas are perfectly designed for contemporary lifestyles, featuring premium finishes throughout. With ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, this residence is ideal for families and investors alike. The property boasts excellent natural light, high ceilings, and a thoughtfully curated layout that maximizes both functionality and aesthetics.\n\nEach room has been meticulously designed with attention to detail, featuring quality materials and state-of-the-art amenities. The location provides easy access to shopping, dining, cultural venues, and excellent public transportation links. Whether you're looking for a primary residence, vacation home, or investment property, this exceptional offering delivers outstanding value and lifestyle benefits.\n\nThis is a rare opportunity to acquire a premium property in a thriving market. The area has demonstrated strong appreciation and rental demand. Contact us today to schedule an exclusive viewing and discover why this property represents an excellent choice for discerning buyers.`,
      keyFeatures: [
        `${property.areaSqm}mÂ² of premium living space`,
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
              subject: `ð  New Property Offer: ${property.type} in ${property.city} â PropBlaze AI Match`,
              html: emailBody,
            }),
          });
        } catch (error) {
          console.error('Email send failed:', error);
        }
      }
    }

    setIsSending(false);
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
    .features li:before { content: "â "; color: #16A34A; font-weight: 600; margin-right: 8px; }
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
        <h3>${property.type} Â· ${property.city}</h3>
        <div class="property-details">
          <div class="detail-item"><strong>${property.price.toLocaleString()} ${property.currency}</strong></div>
          <div class="detail-item"><strong>${property.areaSqm}mÂ²</strong></div>
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
        <a href="https://propblaze.com/demo" class="cta-button">View Full Offer â</a>
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
      <div
        style={{
          minHeight: '100vh',
          background: CSS_VARS.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(22, 163, 74, 0.12)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '2rem',
            }}
          >
            â
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
            ð¬ Check Messages from Agencies
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: CSS_VARS.bg, padding: '32px 20px' }}>
      {/* Progress bar */}
      <div style={{ maxWidth: 760, margin: '0 auto 40px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    i < currentStep
                      ? CSS_VARS.green
                      : i === currentStep
                        ? CSS_VARS.primary
                        : CSS_VARS.surface2,
                  border:
                    i <= currentStep
                      ? 'none'
                      : `2px solid ${CSS_VARS.border}`,
                  color: i <= currentStep ? 'white' : CSS_VARS.textTertiary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 16,
                  zIndex: 2,
                }}
              >
                {i < currentStep ? 'â' : i + 1}
              </div>
              {i < 4 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background:
                      i < currentStep ? CSS_VARS.green : CSS_VARS.border,
                    margin: '0 8px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: CSS_VARS.textSecondary,
          }}
        >
          <div>Basics</div>
          <div>AI Pack</div>
          <div>Photos</div>
          <div>Docs</div>
          <div>Launch</div>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: CSS_VARS.surface,
          border: `1px solid ${CSS_VARS.border}`,
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 16px rgba(26, 31, 46, 0.06)',
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
                placeholder="e.g. Kneza MiloÅ¡a 123"
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
                  Area (mÂ²)
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
              â¨ AI Packaging
            </h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text }}>
                  Describe your property (2–3 sentences)
                </label>
                {/* Voice dictation button */}
                <button
                  onClick={startVoice}
                  title="Dictate with voice"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(245,194,0,0.15)',
                    color: isListening ? '#EF4444' : '#F5C200',
                    fontWeight: 700, fontSize: '0.78rem',
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="4.5" y="1" width="5" height="8" rx="2.5" fill="currentColor" fillOpacity="0.9"/>
                    <path d="M2 7c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    <line x1="7" y1="12" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                  </svg>
                  {isListening ? '● Recording…' : '🎤 Dictate'}
                </button>
              </div>
              <textarea
                placeholder="e.g. Beautiful renovated apartment in city centre, 5th floor, new kitchen, close to metro. Perfect investment."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                style={{
                  width: '100%', padding: '12px',
                  border: `1px solid ${isListening ? '#EF4444' : CSS_VARS.border}`,
                  borderRadius: 8, fontSize: 13, color: CSS_VARS.text,
                  minHeight: 110, fontFamily: 'inherit', boxSizing: 'border-box',
                  resize: 'vertical', transition: 'border-color 0.2s',
                }}
              />
              {isListening && (
                <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 6, fontWeight: 600 }}>
                  🎤 Listening — speak now, tap Dictate again to stop
                </p>
              )}
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                Tip: on mobile, tap 🎤 Dictate and speak — AI will write for you
              </p>
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
                  Generatingâ¦
                </>
              ) : (
                <>â¨ Generate AI Pack</>
              )}
            </button>

            {aiPackData && (
              <div style={{ background: CSS_VARS.surface2, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: CSS_VARS.text, marginBottom: 12 }}>
                  Preview
                </h3>
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>
              📸 Photos
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
              Great photos = more agency interest. Shoot living room, kitchen, bedroom, bathroom, view, entrance.
            </p>

            {/* Mobile primary: camera */}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '28px 20px', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg,rgba(245,194,0,0.12),rgba(255,140,0,0.08))',
              border: '2px dashed rgba(245,194,0,0.4)', marginBottom: 12,
            }}>
              <span style={{ fontSize: 44 }}>📷</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F5C200', marginBottom: 4 }}>
                  Take Photos with Camera
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                  Tap to open camera — take multiple shots
                </div>
              </div>
              <input type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} />
            </label>

            {/* Secondary: gallery */}
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '16px 20px', borderRadius: 12, cursor: 'pointer', marginBottom: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span style={{ fontSize: 22 }}>🖼️</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                Choose from Gallery / Files
              </span>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} />
            </label>

            {/* AI tip */}
            <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(245,194,0,0.06)', border: '1px solid rgba(245,194,0,0.15)',
              display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
              <p style={{ fontSize: '0.8rem', color: 'rgba(245,194,0,0.85)', lineHeight: 1.5, margin: 0 }}>
                AI will auto-enhance brightness and select the best shots.
                Minimum 3 photos — 8+ gets premium agency placement.
              </p>
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
              ð Your Documents Vault
            </a>
          </div>
        )}

        {/* Step 4: Legal Documents */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>
              🗂️ Legal Documents
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
              Upload title deed and supporting docs. Encrypted, only visible to you — never shared without approval.
            </p>

            {/* Title Deed — primary camera button */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Title Deed <span style={{ color: '#EF4444' }}>*</span>
              </div>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '24px 20px', borderRadius: 14, cursor: 'pointer', marginBottom: 10,
                background: 'linear-gradient(135deg,rgba(245,194,0,0.12),rgba(255,140,0,0.08))',
                border: '2px dashed rgba(245,194,0,0.4)',
              }}>
                <span style={{ fontSize: 40 }}>📷</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F5C200', marginBottom: 3 }}>Photograph Document</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>AI enhances contrast automatically</div>
                </div>
                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <span style={{ fontSize: 20 }}>📁</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Upload PDF from Files</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
              </label>
            </div>

            {/* Optional docs */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Optional — Boosts agency score
              </div>
              {[
                { emoji: '📐', label: 'Floor Plan', hint: '+40% agency interest' },
                { emoji: '⚡', label: 'Energy Certificate', hint: 'Required in EU' },
                { emoji: '🏗️', label: 'Building Permit', hint: 'New builds / renovations' },
              ].map(doc => (
                <label key={doc.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer', marginBottom: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
                }}>
                  <span style={{ fontSize: 22 }}>{doc.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{doc.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{doc.hint}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#F5C200', fontWeight: 600 }}>+ Add</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" style={{ display: 'none' }} />
                </label>
              ))}
            </div>

            {/* Security note */}
            <div style={{ background: 'rgba(59,91,219,0.08)', border: '1px solid rgba(59,91,219,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '0.78rem', color: 'rgba(147,197,253,0.8)', lineHeight: 1.5, margin: 0 }}>
                AES-256 encrypted · EU servers · Never shared without your explicit approval
              </p>
            </div>
          </div>
        )}
        {/* Step 5: Distribution */}
        {currentStep === 4 && (
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
                        {agency.isRealEmail && ' â'}
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
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: CSS_VARS.text, marginBottom: 8 }}>
                  Sending to agenciesâ¦
                </div>
                <div
                  style={{
                    height: 6,
                    background: CSS_VARS.surface2,
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${sendProgress}%`,
                      background: CSS_VARS.primary,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: CSS_VARS.textSecondary,
                  }}
                >
                  {sendProgress}% complete
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save draft indicator */}
        {draftSaved && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              background: CSS_VARS.green,
              color: 'white',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
              animation: 'fadeInOut 0.3s ease',
            }}
          >
            â Draft saved
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          maxWidth: 760,
          margin: '20px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          onClick={() => (currentStep > 0 ? setCurrentStep(currentStep - 1) : router.push('/dashboard'))}
          style={{
            padding: '12px 24px',
            background: CSS_VARS.surface,
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: CSS_VARS.textSecondary,
            cursor: 'pointer',
          }}
        >
          {currentStep === 0 ? 'â Cancel' : 'â Back'}
        </button>

        <button
          onClick={() => {
            if (currentStep === 4) {
              handleSendDistribution();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={!canProceed() || isSending}
          style={{
            padding: '12px 28px',
            background: canProceed() && !isSending ? CSS_VARS.primary : CSS_VARS.surface2,
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: canProceed() && !isSending ? 'white' : CSS_VARS.textTertiary,
            cursor: canProceed() && !isSending ? 'pointer' : 'not-allowed',
            boxShadow:
              canProceed() && !isSending
                ? `0 4px 12px rgba(249, 115, 22, 0.2)`
                : 'none',
          }}
        >
          {isSending ? 'Sendingâ¦' : currentStep === 4 ? 'ð Launch Distribution' : 'Continue â'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
