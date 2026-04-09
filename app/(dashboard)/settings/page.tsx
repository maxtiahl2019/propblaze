'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/store/auth';

type Tab = 'profile' | 'security' | 'notifications' | 'documents';

const COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy',
  'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Montenegro', 'Netherlands', 'Poland',
  'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
];

type DocStatus = 'none' | 'uploaded' | 'pending' | 'verified' | 'rejected';

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  uploadedAt: string;
}

const DEMO_DOCS: UploadedDoc[] = [
  { id: 'd1', name: 'passport_scan.pdf', type: 'ID Document', size: '1.2 MB', status: 'verified', uploadedAt: '2026-03-15' },
  { id: 'd2', name: 'proof_of_address.pdf', type: 'Proof of Address', size: '0.8 MB', status: 'pending', uploadedAt: '2026-04-01' },
];

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  color: 'rgba(255,255,255,0.3)',
  cursor: 'not-allowed',
};

function DocStatusBadge({ status }: { status: DocStatus }) {
  const cfg: Record<DocStatus, { label: string; color: string; bg: string }> = {
    none:     { label: 'Not uploaded',  color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.06)' },
    uploaded: { label: 'Uploaded',      color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)'  },
    pending:  { label: 'Under review',  color: '#fbbf24',               bg: 'rgba(251,191,36,0.12)'  },
    verified: { label: '✓ Verified',    color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
    rejected: { label: '✗ Rejected',    color: '#f87171',               bg: 'rgba(248,113,113,0.12)' },
  };
  const c = cfg[status];
  return (
    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.6875rem', fontWeight: 600, color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile
  const [profile, setProfile] = useState({
    full_name: 'Alexander Petrov',
    phone: '+382 67 123 456',
    country: 'Montenegro',
    language: 'en',
    company: '',
    website: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    email_leads: true, email_status: true, email_promo: false,
    telegram: true, whatsapp: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Password
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaved, setPwSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Documents
  const [docs, setDocs] = useState<UploadedDoc[]>(DEMO_DOCS);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveNotifs = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleChangePassword = () => {
    const errs: Record<string, string> = {};
    if (!pwForm.current) errs.current = 'Enter your current password';
    if (pwForm.next.length < 8) errs.next = 'At least 8 characters';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSaved(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 3000);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      const doc: UploadedDoc = {
        id: Math.random().toString(36).slice(2),
        name: f.name,
        type: 'Identity Document',
        size: (f.size / 1024 / 1024).toFixed(1) + ' MB',
        status: 'uploaded',
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      setDocs(prev => [...prev, doc]);
    });
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile',       icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/><path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg> },
    { id: 'security', label: 'Security',     icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L2 4v3.5c0 2.5 2 4.5 5 5.5 3-1 5-3 5-5.5V4L7 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a4 4 0 0 1 4 4c0 2 .5 3 1.5 4H1.5C2.5 8.5 3 7.5 3 5.5a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="1.25"/><path d="M5.5 9.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg> },
    { id: 'documents', label: 'Documents',   icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5h5.5l3 3V12.5H3V1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/><path d="M8.5 1.5V4.5H11.5M5 6.5h4M5 9h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#080809', color: 'white' }}>
      <div style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Settings & Profile
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
            {user?.email ?? 'your@email.com'} · Owner account
          </p>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 4px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: tab === t.id ? 600 : 400,
              background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === t.id ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}>
              <span style={{ color: tab === t.id ? '#e67e22' : 'rgba(255,255,255,0.3)' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <>
            <SectionCard title="Personal Information" subtitle="Used for account management and communication">
              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.375rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{profile.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{user?.email}</div>
                </div>
                <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Change photo
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Full Name">
                  <input style={inputStyle} value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                </Field>
                <Field label="Phone Number">
                  <input style={inputStyle} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 555 000 0000" />
                </Field>
              </div>

              <Field label="Email Address" hint="Contact support to change your email">
                <input style={disabledInputStyle} value={user?.email ?? ''} disabled />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Country">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })}>
                    {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Interface Language">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                    {[['en','English'],['ru','Русский'],['sr','Srpski'],['de','Deutsch']].map(([v, l]) => (
                      <option key={v} value={v} style={{ background: '#111' }}>{l}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Company (optional)">
                  <input style={inputStyle} value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="Your company name" />
                </Field>
                <Field label="Website (optional)">
                  <input style={inputStyle} value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} placeholder="https://…" />
                </Field>
              </div>

              {profileSaved && (
                <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, color: '#4ade80', fontSize: '0.8125rem', marginBottom: 12 }}>
                  ✓ Profile saved
                </div>
              )}

              <button onClick={handleSaveProfile} style={{
                padding: '9px 20px', borderRadius: 9,
                background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                color: 'white', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer',
              }}>
                Save Changes
              </button>
            </SectionCard>

            {/* Danger zone */}
            <SectionCard title="Danger Zone" subtitle="Irreversible actions">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Delete Account</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Permanently remove all data. Cannot be undone.</div>
                </div>
                <button style={{ padding: '6px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, color: '#f87171', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Delete Account
                </button>
              </div>
            </SectionCard>
          </>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <SectionCard title="Change Password" subtitle="Use a strong password with at least 8 characters">
            {pwSaved && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, color: '#4ade80', fontSize: '0.8125rem', marginBottom: 16 }}>
                ✓ Password changed successfully
              </div>
            )}

            {[
              { key: 'current', label: 'Current Password', ph: '••••••••' },
              { key: 'next',    label: 'New Password',     ph: 'Min. 8 characters' },
              { key: 'confirm', label: 'Confirm New Password', ph: 'Repeat new password' },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder={f.ph}
                    value={(pwForm as any)[f.key]}
                    onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    style={{
                      ...inputStyle,
                      borderColor: pwErrors[f.key] ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.09)',
                      paddingRight: 36,
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0,
                  }}>
                    {showPw
                      ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.25"/><line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.25"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                    }
                  </button>
                </div>
                {pwErrors[f.key] && <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: 4 }}>{pwErrors[f.key]}</p>}
              </Field>
            ))}

            <button onClick={handleChangePassword} style={{
              padding: '9px 20px', borderRadius: 9,
              background: 'linear-gradient(135deg,#c0392b,#e67e22)',
              color: 'white', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', marginTop: 4,
            }}>
              Update Password
            </button>

            {/* 2FA */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Adds an extra layer of security via authenticator app</div>
                </div>
                <button style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'not-allowed' }} disabled>
                  Coming soon
                </button>
              </div>
            </div>

            {/* Sessions */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', marginBottom: 12 }}>Active Sessions</div>
              {[
                { device: 'Chrome on macOS', ip: '185.xxx.xx.1', loc: 'Vienna, AT', current: true },
                { device: 'Safari on iPhone', ip: '91.xxx.xx.44', loc: 'Belgrade, RS', current: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.device}
                      {s.current && <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '1px 6px', borderRadius: 4 }}>CURRENT</span>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.loc} · {s.ip}</div>
                  </div>
                  {!s.current && (
                    <button style={{ padding: '4px 10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, color: '#f87171', fontSize: '0.7rem', cursor: 'pointer' }}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'notifications' && (
          <SectionCard title="Notification Preferences" subtitle="Choose how and when you receive updates">
            {[
              { key: 'email_leads',  label: 'New Lead Notification',   desc: 'When an agency responds to your property',  channel: 'Email' },
              { key: 'email_status', label: 'Status Updates',           desc: 'Changes in distribution and matching',       channel: 'Email' },
              { key: 'email_promo',  label: 'Tips & Feature Updates',   desc: 'Product news and best practices',            channel: 'Email' },
              { key: 'telegram',     label: 'Telegram Alerts',          desc: 'Instant push via @PropBlazeBot',             channel: 'Telegram' },
              { key: 'whatsapp',     label: 'WhatsApp Messages',        desc: 'Lead notifications via WhatsApp Business',   channel: 'WhatsApp' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{n.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{n.desc}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#e67e22', marginTop: 3 }}>{n.channel}</div>
                </div>
                <div
                  onClick={() => setNotifs({ ...notifs, [n.key]: !(notifs as any)[n.key] })}
                  style={{
                    width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                    background: (notifs as any)[n.key] ? 'linear-gradient(135deg,#c0392b,#e67e22)' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                  }}>
                  <div style={{
                    position: 'absolute', top: 3, width: 14, height: 14, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                    left: (notifs as any)[n.key] ? 18 : 3,
                  }} />
                </div>
              </div>
            ))}

            {notifSaved && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, color: '#4ade80', fontSize: '0.8125rem', marginTop: 16 }}>
                ✓ Preferences saved
              </div>
            )}

            <button onClick={handleSaveNotifs} style={{
              marginTop: 16, padding: '9px 20px', borderRadius: 9,
              background: 'linear-gradient(135deg,#c0392b,#e67e22)',
              color: 'white', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer',
            }}>
              Save Preferences
            </button>
          </SectionCard>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === 'documents' && (
          <>
            <SectionCard title="Identity Verification" subtitle="Required to publish properties and receive payouts. Documents are encrypted and stored securely.">
              {/* Verification status bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'ID Document', status: 'verified' as DocStatus },
                  { label: 'Address Proof', status: 'pending' as DocStatus },
                  { label: 'Ownership Proof', status: 'none' as DocStatus },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{item.label}</div>
                    <DocStatusBadge status={item.status} />
                  </div>
                ))}
              </div>

              {/* Upload dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFileUpload(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#e67e22' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 12, padding: '32px 20px', textAlign: 'center' as const,
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20,
                  background: dragging ? 'rgba(230,126,34,0.05)' : 'rgba(255,255,255,0.02)',
                }}>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files)} />
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Drop files here or click to upload
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  PDF, JPG or PNG · Max 10 MB per file
                </div>
                <div style={{ marginTop: 12 }}>
                  <span style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    Choose Files
                  </span>
                </div>
              </div>

              {/* Document list */}
              {docs.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Uploaded Documents
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {docs.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9 }}>
                        <div style={{ width: 32, height: 32, background: 'rgba(192,57,43,0.15)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5h5.5l3 3V12.5H3V1.5Z" stroke="#c0392b" strokeWidth="1.25" strokeLinejoin="round"/><path d="M5 6.5h4M5 9h4" stroke="#c0392b" strokeWidth="1.25" strokeLinecap="round"/></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{doc.type} · {doc.size} · {doc.uploadedAt}</div>
                        </div>
                        <DocStatusBadge status={doc.status} />
                        <button
                          onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '2px', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 9, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                🔒 All documents are encrypted (AES-256) and accessible only to our verification team. They are never shared with third parties. Review takes 24–48 hours.
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
