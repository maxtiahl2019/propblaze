'use client';

import React, { useState, useEffect } from 'react';

// ─── Per-step hint content ────────────────────────────────────────────────────
const STEP_HINTS: Record<number, {
  title: string;
  why: string;
  tips: string[];
  emoji: string;
  important?: string;
}> = {
  0: {
    emoji: '📍',
    title: 'Location & Type',
    why: 'The property type and location are the #1 matching criteria. Our AI uses this to find agencies that specialize in your exact area and property category.',
    tips: [
      'Be as precise as possible with city and address',
      'Select the correct property type — it affects which agencies see your offer',
      'Area in m² affects the price bracket matching',
      'Year built and condition affect buyer interest signals',
    ],
    important: 'City + property type + area are required to proceed.',
  },
  1: {
    emoji: '💶',
    title: 'Pricing',
    why: 'Your asking price determines which agencies are included in the match. Agencies are scored on their success rate within your price band.',
    tips: [
      'Set a realistic asking price based on local comparables',
      'Mark "Negotiable" if you have flexibility — it increases agency interest',
      'Exclusive agreement gives the platform higher priority matching',
      'Remote viewing enabled = wider buyer reach from abroad',
    ],
    important: 'Price is required. You can change it later from your dashboard.',
  },
  2: {
    emoji: '✍️',
    title: 'Property Description',
    why: 'The AI uses your description to generate a professional sales package in 3 languages (EN/RU/SR) that is sent to agencies. A richer description = better offer quality.',
    tips: [
      'Write at least 3–4 sentences about what makes this property special',
      'Mention views, proximity to landmarks, recent renovations',
      'Include legal status if it\'s clean (no debt, no disputes)',
      'The AI will enhance and translate your text — write naturally',
    ],
    important: 'Minimum 10 characters. The more detail, the better the AI output.',
  },
  3: {
    emoji: '📸',
    title: 'Photos & Media',
    why: 'Agencies respond 3× more often to listings with quality photos. Photos are included in the offer package sent to agencies.',
    tips: [
      'Upload at least 3–5 photos for best results',
      'Include exterior, living room, kitchen, main bedrooms',
      'Mark the best photo as "cover" — it\'s shown first',
      'Video or drone footage increases response rate significantly',
    ],
    important: 'In demo mode, photos are optional. On live listings, 1+ photo required.',
  },
  4: {
    emoji: '📄',
    title: 'Documents',
    why: 'Document verification builds trust with agencies and speeds up the sales process. Verified listings receive priority placement.',
    tips: [
      'Title deed (deed of purchase) is the most important document',
      'Cadastral extract shows legal property boundaries',
      'All documents are encrypted and only visible to our verification team',
      'Documents are never shared with agencies without your explicit approval',
    ],
    important: 'Documents are optional now but required before distribution.',
  },
  5: {
    emoji: '📞',
    title: 'Contact Details',
    why: 'Agency responses and leads will be forwarded to these contacts. This is how you receive inquiries. Your full contact details are never shared until you approve.',
    tips: [
      'Add WhatsApp if you want instant push notifications',
      'Telegram username for real-time alerts',
      'Preferred contact hours help agencies know when to expect a response',
      'Your contacts are only revealed to agencies after you confirm their response',
    ],
    important: 'Name and email are required. All other fields are optional.',
  },
  6: {
    emoji: '👀',
    title: 'Review & Submit',
    why: 'Before anything is sent, you review the complete offer. No emails or messages go to agencies until you click Approve.',
    tips: [
      'Double-check the price and property type',
      'After submission, the AI match engine runs (~2–5 min)',
      'You\'ll receive an email to review and approve the offer',
      'Only after your approval does distribution begin',
    ],
    important: '⚡ Nothing is sent to agencies without your explicit approval.',
  },
};

interface WizardHintProps {
  step: number;
}

export function WizardHint({ step }: WizardHintProps) {
  const hint = STEP_HINTS[step];
  const [open, setOpen] = useState(true);
  const [pulse, setPulse] = useState(false);

  // Pulse animation on step change to draw attention
  useEffect(() => {
    setOpen(true);
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 2000);
    return () => clearTimeout(t);
  }, [step]);

  if (!hint) return null;

  return (
    <div style={{
      margin: '0 0 20px 0',
      borderRadius: 12,
      border: `1px solid ${pulse ? 'rgba(230,126,34,0.4)' : 'rgba(230,126,34,0.2)'}`,
      background: pulse ? 'rgba(230,126,34,0.06)' : 'rgba(230,126,34,0.04)',
      overflow: 'hidden',
      transition: 'all 0.4s ease',
      boxShadow: pulse ? '0 0 0 2px rgba(230,126,34,0.08)' : 'none',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{hint.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e67e22' }}>
            💡 Step hint: {hint.title}
          </div>
          {!open && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>
              {hint.why.slice(0, 80)}…
            </div>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2.5 5L7 9L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 10 }}>
            {hint.why}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: hint.important ? 10 : 0 }}>
            {hint.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ color: '#e67e22', fontSize: '0.75rem', marginTop: 1, flexShrink: 0 }}>›</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          {hint.important && (
            <div style={{ padding: '6px 10px', background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: 7, fontSize: '0.75rem', color: '#e67e22', fontWeight: 600, marginTop: 2 }}>
              {hint.important}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
