'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, WizardStep } from '@/store/wizard';
import { useAuth, DEMO_MODE } from '@/store/auth';
import api from '@/lib/api';

// ── Lazy-load wizard steps ─────────────────────────────────────────────────────
import { Step1BasicInfo } from '@/components/wizard/Step1BasicInfo';
import { Step2Pricing } from '@/components/wizard/Step2Pricing';
import { Step3Description } from '@/components/wizard/Step3Description';
import { Step4Media } from '@/components/wizard/Step4Media';
import { Step5Documents } from '@/components/wizard/Step5Documents';
import { Step6Contacts } from '@/components/wizard/Step6Contacts';
import { Step7Preview } from '@/components/wizard/Step7Preview';
import { WizardHint } from '@/components/wizard/WizardHint';

const TOTAL_STEPS = 7;

const STEP_LABELS = ['Location', 'Price', 'Description', 'Photos', 'Documents', 'Contacts', 'Preview'];

// ─── Dark wizard progress bar ──────────────────────────────────────────────────
function WizardTopBar({ currentStep, saveStatus, lastSavedAt }: {
  currentStep: number;
  saveStatus: string;
  lastSavedAt: Date | null;
}) {
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const savedText = () => {
    if (!lastSavedAt) return 'Draft';
    const diff = Math.round((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
    if (diff < 5) return 'Just saved';
    if (diff < 60) return `Saved ${diff}s ago`;
    return `Saved ${Math.round(diff / 60)}m ago`;
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#0c0c0e', borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '12px 24px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#c0392b,#e67e22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L1.5 6.5V13H5V9.5H9V13H12.5V6.5L7 1.5Z" fill="white" fillOpacity="0.9"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>Add Property</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
              Step {currentStep + 1} of {TOTAL_STEPS} · {STEP_LABELS[currentStep]}
            </span>
          </div>

          {/* Save status */}
          <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            {saveStatus === 'saving' && (
              <><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', animation: 'pulse 1s infinite' }} /><span style={{ color: '#60a5fa' }}>Saving…</span></>
            )}
            {saveStatus === 'saved' && (
              <><span style={{ color: '#4ade80' }}>✓</span><span style={{ color: 'rgba(255,255,255,0.35)' }}>{savedText()}</span></>
            )}
            {saveStatus === 'error' && <span style={{ color: '#f87171' }}>⚠ Not saved</span>}
            {saveStatus === 'idle' && <span style={{ color: 'rgba(255,255,255,0.25)' }}>Draft</span>}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg,#c0392b,#e67e22)',
            width: `${progress}%`, transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{
                fontSize: '0.6rem', fontWeight: i === currentStep ? 700 : 400,
                color: i < currentStep ? '#4ade80' : i === currentStep ? '#e67e22' : 'rgba(255,255,255,0.2)',
                textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              }}>
                {i < currentStep ? '✓' : (i + 1)}. {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function NewPropertyPage() {
  const router = useRouter();
  const { currentStep, setStep, step1, step2, step3, step4, step6, autosave, resetWizard, saveStatus, lastSavedAt, prefillContactsFromProfile } = useWizardStore();
  const { user } = useAuth();
  const [listingMode, setListingMode] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);

  // Prefill contacts from profile (non-demo)
  useEffect(() => {
    if (DEMO_MODE) return;
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.profile) {
          prefillContactsFromProfile({
            full_name: res.data.profile.full_name || '',
            phone: res.data.profile.phone || '',
            email: res.data.email || '',
            whatsapp_number: res.data.profile.whatsapp_number || '',
            telegram_username: res.data.profile.telegram_username || '',
            preferred_language: res.data.profile.preferred_language || 'en',
          });
        }
      } catch {}
    };
    loadProfile();
  }, []);

  // ── Validation per step ──────────────────────────────────────────────────────
  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0: return !!(step1.property_type && step1.country && step1.city && step1.area_sqm);
      case 1: return !!(step2.asking_price && step2.asking_price > 0);
      case 2: return step3.description_raw.length >= 10;
      case 3: return DEMO_MODE ? true : step4.mediaFiles.length >= 1; // relaxed: 1 photo minimum (0 in demo)
      case 4: return true; // documents optional
      case 5: return !!(step6.contact_name && step6.contact_email);
      case 6: return !!(
        step1.property_type && step1.country && step1.city &&
        step2.asking_price &&
        step3.description_raw.length >= 10 &&
        step6.contact_name && step6.contact_email
      );
      default: return false;
    }
  }, [currentStep, step1, step2, step3, step4, step6]);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      await autosave();
      setStep((currentStep + 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handlePublish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep((currentStep - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/dashboard');
    }
  };

  // ── Publish ──────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setIsSubmitting(true);

    if (DEMO_MODE) {
      // Demo: simulate processing, then show success and redirect
      await new Promise(r => setTimeout(r, 1500));
      setSubmitDone(true);
      await new Promise(r => setTimeout(r, 1000));
      resetWizard();
      router.push('/dashboard?new=1');
      return;
    }

    try {
      const { propertyId } = useWizardStore.getState();
      await api.patch(`/properties/${propertyId}`, {
        listing_mode: listingMode,
        status: 'awaiting_approval',
      });
      await api.post(`/properties/${propertyId}/generate-offer`);
      resetWizard();
      router.push(`/properties/${propertyId}/offer-approval`);
    } catch (err) {
      console.error('Publish error:', err);
      setIsSubmitting(false);
    }
  };

  // ── Publishing success screen ─────────────────────────────────────────────────
  if (submitDone) {
    return (
      <div style={{ minHeight: '100vh', background: '#080809', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Property submitted!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            AI matching is running. You'll be notified when your distribution offer is ready for approval.
          </p>
          <div style={{ marginTop: 20, width: 32, height: 32, border: '2px solid #e67e22', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '20px auto 0' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const STEP_COMPONENTS = [
    <Step1BasicInfo key="s1" />,
    <Step2Pricing key="s2" />,
    <Step3Description key="s3" />,
    <Step4Media key="s4" />,
    <Step5Documents key="s5" />,
    <Step6Contacts key="s6" />,
    <Step7Preview key="s7" listingMode={listingMode} setListingMode={setListingMode} />,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080809' }}>
      <WizardTopBar currentStep={currentStep} saveStatus={saveStatus} lastSavedAt={lastSavedAt} />

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {/* Step card */}
        <div style={{
          background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <WizardHint step={currentStep} />
          {STEP_COMPONENTS[currentStep]}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '0 4px' }}>
          <button
            onClick={handleBack}
            style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Save draft button */}
            <button onClick={() => autosave()} style={{
              padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent', color: 'rgba(255,255,255,0.35)',
              fontWeight: 400, fontSize: '0.8125rem', cursor: 'pointer',
            }}>
              Save draft
            </button>

            {/* Next / Publish button */}
            <button
              onClick={handleNext}
              disabled={!canGoNext() || isSubmitting}
              style={{
                padding: '10px 24px', borderRadius: 9, border: 'none',
                background: canGoNext() && !isSubmitting
                  ? 'linear-gradient(135deg,#c0392b,#e67e22)'
                  : 'rgba(255,255,255,0.07)',
                color: canGoNext() && !isSubmitting ? 'white' : 'rgba(255,255,255,0.25)',
                fontWeight: 700, fontSize: '0.9rem', cursor: !canGoNext() || isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: canGoNext() && !isSubmitting ? '0 4px 16px rgba(192,57,43,0.3)' : 'none',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              {isSubmitting && (
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
              {isSubmitting
                ? 'Submitting…'
                : currentStep === TOTAL_STEPS - 1
                ? 'Submit Property →'
                : 'Continue →'
              }
            </button>
          </div>
        </div>

        {/* Step hint */}
        {currentStep === 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: 14 }}>
            Your progress is auto-saved every 30 seconds
          </p>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  );
}
