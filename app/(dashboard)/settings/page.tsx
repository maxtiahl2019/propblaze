'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/LangContext';
import { useAuth } from '@/store/auth';
import type { Lang } from '@/lib/i18n/translations';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  red: '#DC2626', redBg: '#FEF2F2',
  orange: '#EA580C', orangeBg: '#FFF7ED',
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
      background: on ? C.green : '#CBD5E1',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 10, background: C.white,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

function SettingsRow({ emoji, label, desc, right }: { emoji: string; label: string; desc?: string; right: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
      <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center' as const }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: '0.72rem', color: C.text3, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>{title}</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '0 16px' }} />;
}

const inpStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.8125rem',
  color: '#0F172A', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
};

export default function SettingsPage() {
  const { lang, setLang } = useTranslation();
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(false);
  const [autoWave2, setAutoWave2] = useState(true);
  const [forwardLeads, setForwardLeads] = useState(true);

  // Contact fields — persisted to localStorage for MVP (backend wiring in Phase 2)
  const [telegramHandle, setTelegramHandle] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pb_telegram') ?? '';
    return '';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pb_whatsapp') ?? '';
    return '';
  });
  const [commLang, setCommLang] = useState<'en' | 'ru' | 'sr'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('pb_comm_lang') as any) ?? 'en';
    return 'en';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pb_report_email') ?? (user?.email ?? '');
    return user?.email ?? '';
  });
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    localStorage.setItem('pb_telegram', telegramHandle);
    localStorage.setItem('pb_whatsapp', whatsappNumber);
    localStorage.setItem('pb_comm_lang', commLang);
    localStorage.setItem('pb_report_email', profileEmail);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Resolve display name from user object or localStorage
  const displayName = user?.email?.split('@')[0] ?? 'User';
  const displayEmail = profileEmail || user?.email || 'contact@win-winsolution.com';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", padding: 'clamp(16px,4vw,32px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: C.text }}>Settings</h1>
          <p style={{ fontSize: '0.8125rem', color: C.text3 }}>Account, notifications, and preferences</p>
        </div>

        {/* Profile card */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: C.white, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text }}>{displayName}</div>
            <div style={{ fontSize: '0.78rem', color: C.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{displayEmail}</div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white, background: C.green, padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}>Pro</span>
        </div>

        {/* Contact & Communication */}
        <Section title="Contact & Communication">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              Report & notification email
            </div>
            <input
              type="email"
              value={profileEmail}
              onChange={e => setProfileEmail(e.target.value)}
              placeholder="your@email.com"
              style={inpStyle}
            />
            <p style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4 }}>All lead emails and campaign reports go here.</p>
          </div>
          <Divider />
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              Telegram username
            </div>
            <input
              type="text"
              value={telegramHandle}
              onChange={e => setTelegramHandle(e.target.value)}
              placeholder="@yourusername"
              style={inpStyle}
            />
            <p style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4 }}>For instant campaign and lead alerts via Telegram bot.</p>
          </div>
          <Divider />
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              WhatsApp number
            </div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="+382 67 000 000"
              style={inpStyle}
            />
            <p style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4 }}>International format. Used for WhatsApp Business notifications.</p>
          </div>
          <Divider />
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              Communication language preference
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([{ code: 'en', label: '🇬🇧 English' }, { code: 'ru', label: '🇷🇺 Russian' }, { code: 'sr', label: '🇷🇸 Serbian' }] as const).map(l => (
                <button key={l.code} onClick={() => setCommLang(l.code)} style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, fontWeight: 600, fontSize: '0.75rem',
                  cursor: 'pointer', background: commLang === l.code ? C.green : C.bg,
                  color: commLang === l.code ? C.white : C.text2,
                  border: commLang === l.code ? 'none' : `1px solid ${C.border}`,
                }}>
                  {l.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: C.text3, marginTop: 6 }}>
              Agency emails and campaign reviews will be shown in this language when available.
            </p>
          </div>
          <Divider />
          <div style={{ padding: '12px 16px' }}>
            <button onClick={saveProfile} style={{
              width: '100%', padding: '11px', borderRadius: 9, fontWeight: 700, fontSize: '0.875rem',
              background: saved ? C.green : C.green, color: C.white, border: 'none', cursor: 'pointer',
              opacity: saved ? 0.85 : 1,
            }}>
              {saved ? '✓ Saved' : 'Save Contact Settings'}
            </button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingsRow emoji="✉️" label="Email notifications" desc="New leads and agency replies" right={<Toggle on={emailNotif} onChange={setEmailNotif} />} />
          <Divider />
          <SettingsRow emoji="✈️" label="Telegram notifications" desc="Instant alerts via Telegram bot" right={<Toggle on={telegramNotif} onChange={setTelegramNotif} />} />
          <Divider />
          <SettingsRow emoji="💬" label="WhatsApp Business" desc="WhatsApp notifications (Business API)" right={<Toggle on={whatsappNotif} onChange={setWhatsappNotif} />} />
        </Section>

        {/* AI Distribution */}
        <Section title="AI Distribution">
          <SettingsRow emoji="📡" label="Auto Wave 2" desc="Send Wave 2 automatically after 3 days if no reply" right={<Toggle on={autoWave2} onChange={setAutoWave2} />} />
          <Divider />
          <SettingsRow emoji="📨" label="Forward Leads to Email" desc="All agency replies → contact@win-winsolution.com" right={<Toggle on={forwardLeads} onChange={setForwardLeads} />} />
        </Section>

        {/* App Language (MVP: English UI only, others are stubs) */}
        <Section title="App Language">
          <div style={{ padding: '8px 10px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={() => setLang('en')} style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem',
                cursor: 'pointer', background: C.green, color: C.white, border: 'none',
              }}>
                🇬🇧 English
              </button>
              <button style={{ flex: 1, padding: '10px 8px', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', background: C.bg, color: C.text3, border: `1px solid ${C.border}`, cursor: 'not-allowed' }} disabled>
                🇷🇺 Русский
              </button>
              <button style={{ flex: 1, padding: '10px 8px', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', background: C.bg, color: C.text3, border: `1px solid ${C.border}`, cursor: 'not-allowed' }} disabled>
                🇷🇸 Srpski
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: C.text3, padding: '0 4px' }}>
              MVP: English interface only. RU/SR coming in v1.1. Set your <strong>communication language</strong> above to control email and report language.
            </p>
          </div>
        </Section>

        {/* Account */}
        <Section title="Account">
          <SettingsRow emoji="🔒" label="Change Password" desc="" right={<span style={{ color: C.text3, fontSize: 18 }}>›</span>} />
          <Divider />
          <SettingsRow emoji="🛡️" label="Privacy & Data" desc="GDPR export and consent management" right={<span style={{ color: C.text3, fontSize: 18 }}>›</span>} />
          <Divider />
          <SettingsRow emoji="📄" label="Terms of Service" desc="" right={<span style={{ color: C.text3, fontSize: 18 }}>›</span>} />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <SettingsRow
            emoji="🗑️"
            label="Delete Account"
            desc="Permanently delete your account and all data"
            right={<span style={{ color: C.red, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Delete</span>}
          />
        </Section>

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: C.text3, paddingBottom: 16 }}>
          PropBlaze v1.0 · MVP Preview · Built for EU property owners
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
