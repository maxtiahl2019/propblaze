'use client';

import React, { useState, useRef } from 'react';

const D = {
  bg: '#080810', bg2: '#0D0D1A', surface: 'rgba(255,255,255,0.05)',
  surface2: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.18)', yellow: '#F5C200', green: '#22C55E',
  red: '#EF4444', blue: '#3B5BDB', white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.80)', w60: 'rgba(255,255,255,0.60)',
  w40: 'rgba(255,255,255,0.40)', w20: 'rgba(255,255,255,0.20)',
};

type DocStatus = 'uploaded' | 'missing' | 'pending';

interface DocItem {
  id: string; label: string; required: boolean;
  status: DocStatus; fileName?: string; uploadedAt?: string; aiHint: string;
}

const INITIAL_DOCS: DocItem[] = [
  { id: 'title_deed', label: 'Title Deed / Ownership Certificate', required: true, status: 'uploaded',
    fileName: 'title_deed_belgrade_apt.pdf', uploadedAt: '2 days ago',
    aiHint: 'Most critical document. Agencies verify ownership before contacting buyers.' },
  { id: 'floor_plan', label: 'Floor Plan', required: false, status: 'missing',
    aiHint: 'Increases agency interest by 40%. Photograph the original — AI enhances it automatically.' },
  { id: 'building_permit', label: 'Building Permit', required: false, status: 'missing',
    aiHint: 'Required for new-builds and renovations. Buyers request this frequently.' },
  { id: 'energy_cert', label: 'Energy Certificate', required: false, status: 'missing',
    aiHint: 'EU law requires this for most sales. Upload now to avoid delays.' },
  { id: 'passport', label: 'Passport / ID (redacted)', required: true, status: 'uploaded',
    fileName: 'passport_redacted.pdf', uploadedAt: '2 days ago',
    aiHint: 'Encrypted, never shared with agencies — only used for owner verification.' },
  { id: 'proof_address', label: 'Proof of Address', required: false, status: 'missing',
    aiHint: 'Utility bill or bank statement from the last 3 months is sufficient.' },
];

function StatusChip({ status }: { status: DocStatus }) {
  const cfg = {
    uploaded: { label: 'Verified ✓', bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' },
    pending:  { label: 'Reviewing…', bg: 'rgba(245,194,0,0.12)', color: '#F5C200', border: 'rgba(245,194,0,0.3)' },
    missing:  { label: 'Missing',    bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
  }[status];
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

function DocCard({ doc, onUpload, onCamera }: {
  doc: DocItem;
  onUpload: (id: string, file: File) => void;
  onCamera: (id: string, file: File) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, mode: 'file'|'camera') => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (mode === 'camera') onCamera(doc.id, f);
    else onUpload(doc.id, f);
    e.target.value = '';
  };

  const borderColor = doc.status === 'uploaded' ? D.green
    : doc.status === 'pending' ? D.yellow
    : doc.required ? D.red : 'rgba(255,255,255,0.15)';

  return (
    <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderLeft: `3px solid ${borderColor}`,
      borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: doc.status === 'uploaded' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${doc.status === 'uploaded' ? 'rgba(34,197,94,0.3)' : D.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {doc.status === 'uploaded' ? '✅' : doc.required ? '📋' : '📄'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: D.w80, marginBottom: 2 }}>
            {doc.label}
            {doc.required && <span style={{ color: D.red, marginLeft: 4, fontSize: '0.75rem' }}>*</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: D.w40 }}>
            {doc.status === 'uploaded' ? `${doc.fileName} · ${doc.uploadedAt}` : 'Tap to upload or photograph'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <StatusChip status={doc.status} />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ color: D.w40, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${D.border}`, padding: '14px 16px' }}>
          {/* AI hint */}
          <div style={{ background: 'rgba(245,194,0,0.06)', border: '1px solid rgba(245,194,0,0.18)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,194,0,0.85)', lineHeight: 1.5, margin: 0 }}>
              {doc.aiHint}
            </p>
          </div>

          {doc.status === 'uploaded' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                fontSize: '0.8rem', color: D.green, fontWeight: 600 }}>✓ {doc.fileName}</div>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '10px 14px',
                borderRadius: 10, border: `1px solid ${D.border}`, background: D.surface2,
                color: D.w60, fontSize: '0.8rem', cursor: 'pointer' }}>Replace</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* PRIMARY: Camera — biggest button on mobile */}
              <button onClick={() => cameraRef.current?.click()} style={{
                width: '100%', padding: '18px 16px', borderRadius: 14,
                background: 'linear-gradient(135deg,#F5C200,#FF8C00)',
                border: 'none', color: '#080810', fontWeight: 800, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📷</span>
                Photograph Document
              </button>
              {/* SECONDARY: file */}
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                background: 'transparent', border: `1px solid ${D.border2}`,
                color: D.w80, fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📁</span>
                Upload from Files / Gallery
              </button>
            </div>
          )}

          {/* Hidden camera input — triggers native camera on mobile */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={e => handleFile(e, 'camera')} />
          {/* Hidden file input */}
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf"
            style={{ display: 'none' }} onChange={e => handleFile(e, 'file')} />

          {doc.status === 'missing' && (
            <p style={{ fontSize: '0.72rem', color: D.w40, marginTop: 10, lineHeight: 1.5 }}>
              🔒 AES-256 encrypted · EU servers · Never shared without your approval
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = (id: string, file: File) => {
    setDocs(prev => prev.map(d => d.id === id
      ? { ...d, status: 'pending', fileName: file.name, uploadedAt: 'Just now' } : d));
    showToast('📤 Uploading and encrypting…');
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'uploaded' } : d));
      showToast('✅ Document verified and saved');
    }, 2000);
  };

  const handleCamera = (id: string, file: File) => {
    showToast('📷 Enhancing photo quality…');
    setTimeout(() => handleUpload(id, file), 800);
  };

  const required = docs.filter(d => d.required);
  const optional = docs.filter(d => !d.required);
  const uploaded = docs.filter(d => d.required && d.status === 'uploaded').length;
  const pct = Math.round((uploaded / required.length) * 100);

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', border: `1px solid ${D.border2}`, borderRadius: 12,
          padding: '12px 20px', fontSize: '0.875rem', fontWeight: 600, color: D.white,
          zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.6rem)', fontWeight: 800, color: D.white, letterSpacing: '-0.02em', marginBottom: 6 }}>
            🗂️ Documents
          </h1>
          <p style={{ fontSize: '0.875rem', color: D.w60, lineHeight: 1.5 }}>
            Photograph or upload documents. All files are encrypted and stored on EU servers.
          </p>
        </div>

        {/* Progress card */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: D.white }}>Document Readiness</div>
              <div style={{ fontSize: '0.75rem', color: D.w40, marginTop: 2 }}>{uploaded}/{required.length} required uploaded</div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: pct === 100 ? D.green : D.yellow }}>{pct}%</div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s ease',
              background: pct === 100 ? D.green : 'linear-gradient(90deg,#F5C200,#FF8C00)' }} />
          </div>
          {pct < 100 && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(245,194,0,0.07)', border: '1px solid rgba(245,194,0,0.15)',
              fontSize: '0.8rem', color: 'rgba(245,194,0,0.9)', display: 'flex', gap: 8 }}>
              <span>🤖</span>
              <span>Upload missing required documents to unlock AI distribution</span>
            </div>
          )}
        </div>

        {/* Required */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Required
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {required.map(doc => <DocCard key={doc.id} doc={doc} onUpload={handleUpload} onCamera={handleCamera} />)}
        </div>

        {/* Optional */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Optional — Boost match score
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {optional.map(doc => <DocCard key={doc.id} doc={doc} onUpload={handleUpload} onCamera={handleCamera} />)}
        </div>

        {/* AI assistant tip */}
        <div style={{ padding: '16px 20px', borderRadius: 14,
          background: 'rgba(59,91,219,0.08)', border: '1px solid rgba(59,91,219,0.2)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>
                AI Document Assistant
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(147,197,253,0.75)', lineHeight: 1.6, margin: 0 }}>
                On mobile, tap <strong style={{ color: '#93c5fd' }}>Photograph Document</strong> — no scanning app needed.
                Point at any document, AI auto-enhances contrast and readability before encrypting.
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
