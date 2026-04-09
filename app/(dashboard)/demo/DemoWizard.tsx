'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

const DEMO_PROPERTY = {
  title: 'Luxury 3BR Apartment, Belgrade, Serbia',
  location: 'Belgrade, Serbia',
  type: 'Apartment',
  price: 185000,
  currency: 'EUR',
  area: 120,
  description: 'Beautiful modern apartment in the heart of New Belgrade with city views, premium finishes, and high-quality amenities.'
};

interface StepProps {
  onNext: () => void;
  onPrev?: () => void;
  step: number;
  totalSteps: number;
}

// Step 1: Property Details
function Step1PropertyDetails({ onNext }: StepProps) {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Your Property</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
            Property Title
          </label>
          <input
            type="text"
            defaultValue={DEMO_PROPERTY.title}
            readOnly
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#F9FAFB'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Location</label>
            <input
              type="text"
              defaultValue={DEMO_PROPERTY.location}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#F9FAFB'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Type</label>
            <input
              type="text"
              defaultValue={DEMO_PROPERTY.type}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#F9FAFB'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Price</label>
            <input
              type="text"
              defaultValue={`€${DEMO_PROPERTY.price.toLocaleString()}`}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#F9FAFB'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Area (m²)</label>
            <input
              type="text"
              defaultValue={DEMO_PROPERTY.area}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#F9FAFB'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Description</label>
          <textarea
            defaultValue={DEMO_PROPERTY.description}
            readOnly
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#F9FAFB',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button
          onClick={onNext}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: '#F97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// Step 2: AI Packaging
function Step2AIPackaging({ onNext }: StepProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    analyzed: false,
    positioning: false,
    multilingual: false,
    photos: false,
    matching: false
  });

  useEffect(() => {
    const items = ['analyzed', 'positioning', 'multilingual', 'photos', 'matching'];
    let index = 0;

    const interval = setInterval(() => {
      if (index < items.length) {
        setChecklist(prev => ({ ...prev, [items[index]]: true }));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onNext, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onNext]);

  const items = [
    { key: 'analyzed', label: 'Property analyzed' },
    { key: 'positioning', label: 'Market positioning calculated' },
    { key: 'multilingual', label: 'Multilingual pitch prepared (EN/DE/SR)' },
    { key: 'photos', label: 'Photo optimization complete' },
    { key: 'matching', label: 'Agency matching started...' }
  ];

  return (
    <div style={{ maxWidth: '600px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '48px' }}>AI Packaging</h2>

      <p style={{ color: '#6B7280', marginBottom: '48px' }}>
        Our AI is preparing your property package...
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {items.map(item => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: checklist[item.key] ? '#F0FDF4' : '#F9FAFB',
              borderRadius: '8px',
              border: checklist[item.key] ? '1px solid #BBFB7D0' : '1px solid #E5E7EB',
              transition: 'all 0.3s',
              animation: checklist[item.key] ? 'slideIn 0.4s ease' : 'none'
            }}
          >
            {checklist[item.key] ? (
              <span style={{ fontSize: '20px' }}>✓</span>
            ) : (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#E5E7EB',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}/>
            )}
            <span style={{ color: checklist[item.key] ? '#16A34A' : '#6B7280' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Step 3: Agency Matching
function Step3AgencyMatching({ onNext }: StepProps) {
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    DEMO_AGENCIES.forEach((agency, i) => {
      setTimeout(() => {
        setScores(prev => ({ ...prev, [agency.id]: agency.score }));
      }, i * 300);
    });
  }, []);

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Agency Matching</h2>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>
        {DEMO_AGENCIES.length} agencies matched for your property
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {DEMO_AGENCIES.map((agency) => (
          <div
            key={agency.id}
            style={{
              padding: '20px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: scores[agency.id] ? 'slideIn 0.4s ease' : 'none'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {agency.flag} {agency.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                {agency.city}, {agency.country}
              </div>
              <div style={{ fontSize: '12px', background: '#FFF7ED', color: '#F97316', display: 'inline-block', padding: '4px 8px', borderRadius: '4px' }}>
                {agency.specialization}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                Located in {agency.city} region · Handles €150-250k segment
              </div>
            </div>

            {scores[agency.id] ? (
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                background: '#F97316',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                {scores[agency.id]}<span style={{ fontSize: '12px' }}>/100</span>
              </div>
            ) : (
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                textAlign: 'center'
              }}>
                Calculating...
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '12px',
          background: '#F97316',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Approve & Send →
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Step 4: Sending
function Step4Sending({ onNext }: StepProps) {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const sendEmails = async () => {
      for (let i = 0; i < DEMO_AGENCIES.length; i++) {
        const agency = DEMO_AGENCIES[i];
        if (agency.isRealEmail) {
          try {
            const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
  <div style="background: #F97316; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">PropBlaze</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0;">AI Property Distribution Platform</p>
  </div>
  <div style="padding: 32px;">
    <h2>New Property Match for Your Agency</h2>
    <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px;">${DEMO_PROPERTY.title}</h3>
      <p>📍 ${DEMO_PROPERTY.location} · 💰 €${DEMO_PROPERTY.price.toLocaleString()} · 📐 ${DEMO_PROPERTY.area}m²</p>
      <p>${DEMO_PROPERTY.description}</p>
    </div>
    <p><strong>Why your agency was selected:</strong></p>
    <ul>
      <li>Match score: ${agency.score}/100</li>
      <li>You specialize in ${agency.specialization}</li>
      <li>You cover ${agency.city}, ${agency.country}</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://propblaze.com" style="background: #F97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        View Property & Respond
      </a>
    </div>
    <p style="color: #6B7280; font-size: 13px;">This is a demo distribution from PropBlaze. Platform: propblaze.com</p>
  </div>
</div>
            `;

            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_K7ZtSKPE_EvUtEnCFCMoRCH1JjY2EgmMd'}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'PropBlaze Demo <onboarding@resend.dev>',
                to: [agency.email],
                subject: `🏠 New Property: ${DEMO_PROPERTY.title} — PropBlaze`,
                html: emailHtml
              })
            });
          } catch (err) {
            console.error('Email error:', err);
          }
        }

        // Simulate send delay
        await new Promise(resolve => setTimeout(resolve, 600));
        setSent(prev => ({ ...prev, [agency.id]: true }));
      }

      setTimeout(onNext, 1000);
    };

    sendEmails();
  }, [onNext]);

  return (
    <div style={{ maxWidth: '700px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '48px' }}>Sending Distribution</h2>

      <p style={{ color: '#6B7280', marginBottom: '48px' }}>
        Sending your pitch to {DEMO_AGENCIES.length} agencies...
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {DEMO_AGENCIES.map((agency, i) => (
          <div
            key={agency.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: sent[agency.id] ? '#F0FDF4' : '#F9FAFB',
              border: sent[agency.id] ? '1px solid #BBFB7D0' : '1px solid #E5E7EB',
              borderRadius: '8px',
              animation: sent[agency.id] ? 'slideIn 0.3s ease' : 'none'
            }}
          >
            <span style={{ fontWeight: 500 }}>{agency.name}</span>
            {sent[agency.id] ? (
              <span style={{ color: '#16A34A', fontWeight: 600 }}>✓ Sent</span>
            ) : (
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #E5E7EB',
                borderTopColor: '#F97316',
                animation: 'spin 0.8s linear infinite'
              }}/>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Step 5: Success
function Step5Success({ onNext }: StepProps) {
  const router = useRouter();

  return (
    <div style={{ maxWidth: '600px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>

      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
        Distribution complete!
      </h2>

      <p style={{ color: '#6B7280', marginBottom: '48px', fontSize: '16px', lineHeight: 1.6 }}>
        {DEMO_AGENCIES.length} agencies notified<br/>
        First response expected in ~24h
      </p>

      <div style={{ background: '#F0FDF4', border: '1px solid #BBFB7D0', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🇷🇸</span>
          <span style={{ fontWeight: 600, flex: 1 }}>Win-Win Solution</span>
          <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>✓ Email delivered</span>
        </div>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
          contact@win-winsolution.com
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            background: '#F97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          View in Dashboard →
        </button>
        <button
          onClick={() => router.push('/leads')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: '#F97316',
            border: '1px solid #FED7AA',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          See your leads inbox →
        </button>
      </div>
    </div>
  );
}

export default function DemoWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { num: 1, title: 'Property' },
    { num: 2, title: 'AI Package' },
    { num: 3, title: 'Agencies' },
    { num: 4, title: 'Send' },
    { num: 5, title: 'Success' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px'
        }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: currentStep >= step.num ? '#F97316' : '#E5E7EB',
                color: currentStep >= step.num ? 'white' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span style={{
                fontSize: '12px',
                color: currentStep >= step.num ? '#111827' : '#9CA3AF',
                marginLeft: '8px',
                fontWeight: 500
              }}>
                {step.title}
              </span>

              {i < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: currentStep > step.num ? '#F97316' : '#E5E7EB',
                  margin: '0 16px',
                  transition: 'all 0.3s'
                }}/>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {currentStep === 1 && <Step1PropertyDetails onNext={handleNext} step={1} totalSteps={totalSteps}/>}
          {currentStep === 2 && <Step2AIPackaging onNext={handleNext} step={2} totalSteps={totalSteps}/>}
          {currentStep === 3 && <Step3AgencyMatching onNext={handleNext} step={3} totalSteps={totalSteps}/>}
          {currentStep === 4 && <Step4Sending onNext={handleNext} step={4} totalSteps={totalSteps}/>}
          {currentStep === 5 && <Step5Success onNext={handleNext} step={5} totalSteps={totalSteps}/>}
        </div>
      </div>
    </div>
  );
}
