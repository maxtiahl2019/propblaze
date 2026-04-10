'use client';

import React, { useState } from 'react';

const D = {
  bg: '#10101E', surface: 'rgba(255,255,255,0.07)', surface2: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.10)', border2: 'rgba(255,255,255,0.22)',
  yellow: '#F5C200', green: '#22C55E', red: '#EF4444',
  white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.88)', w60: 'rgba(255,255,255,0.68)',
  w40: 'rgba(255,255,255,0.48)', w20: 'rgba(255,255,255,0.28)',
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
      background: on ? D.yellow : 'rgba(255,255,255,0.15)',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 10, background: on ? '#080810' : 'rgba(255,255,255,0.6)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

function SettingsRow({ emoji, label, desc, right }: { emoji: string; label: string; desc?: string; right: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
      <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center' }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: D.w80 }}>{label}</div>
        {desc && <div style={{ fontSize: '0.72rem', color: D.w40, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</div>
      <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: D.border, margin: '0 16px' }} />;
}

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(false);
  const [autoWave2, setAutoWave2] = useState(true);
  const [forwardLeads, setForwardLeads] = useState(true);
  const [lang, setLang] = useState('en');

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>⚙️ Settings</h1>
        </div>

        {/* Profile */}
        <div style={{ background: 'rgba(245,194,0,0.06)', border: '1px solid rgba(245,194,0,0.18)', borderRadius: 16, padding: '16px 18px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg,#F5C200,#FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#080810', flexShrink: 0 }}>M</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: D.white }}>Max</div>
            <div style={{ fontSize: '0.78rem', color: D.w40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>contact@win-winsolution.com</div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#080810', background: D.yellow, padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}>Pro</span>
        </div>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingsRow emoji="✉️" label="Email" desc="Lead replies, wave updates, billing" right={<Toggle on={emailNotif} onChange={setEmailNotif} />} />
          <Divider />
          <SettingsRow emoji="✈️" label="Telegram" desc="Instant lead alerts" right={<Toggle on={telegramNotif} onChange={setTelegramNotif} />} />
          <Divider />
          <SettingsRow emoji="💬" label="WhatsApp" desc="Premium plan required" right={<Toggle on={whatsappNotif} onChange={setWhatsappNotif} />} />
        </Section>

        {/* AI Settings */}
        <Section title="AI Distribution">
          <SettingsRow emoji="📡" label="Auto Wave 2" desc="Send Wave 2 after 3 days if no reply" right={<Toggle on={autoWave2} onChange={setAutoWave2} />} />
          <Divider />
          <SettingsRow emoji="📨" label="Forward Leads to Email" desc="All agency replies → contact@win-winsolution.com" right={<Toggle on={forwardLeads} onChange={setForwardLeads} />} />
        </Section>

        {/* Language */}
        <Section title="Language">
          <div style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
            {[{ code: 'en', label: '🇬🇧 EN' }, { code: 'ru', label: '🇷🇺 RU' }, { code: 'sr', label: '🇷🇸 SR' }].map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: lang === l.code ? D.yellow : 'transparent', color: lang === l.code ? '#080810' : D.w60, border: lang === l.code ? 'none' : `1px solid ${D.border}` }}>
                {l.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Account */}
        <Section title="Account">
          <SettingsRow emoji="🔒" label="Change Password" desc="" right={<span style={{ color: D.w40, fontSize: 18 }}>›</span>} />
          <Divider />
          <SettingsRow emoji="🛡️" label="Privacy & GDPR" desc="Data, consent, export" right={<span style={{ color: D.w40, fontSize: 18 }}>›</span>} />
          <Divider />
          <SettingsRow emoji="📄" label="Terms of Service" desc="" right={<span style={{ color: D.w40, fontSize: 18 }}>›</span>} />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <SettingsRow emoji="🗑️" label="Delete Account" desc="Permanent — removes all data" right={<span style={{ color: D.red, fontSize: '0.78rem', fontWeight: 700 }}>Delete</span>} />
        </Section>

        {/* Version */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: D.w20, paddingBottom: 16 }}>
          PropBlaze v1.0 · MVP Preview · Built with ❤️ for EU property owners
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
