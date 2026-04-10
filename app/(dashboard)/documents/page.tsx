'use client';

import React, { useState, useRef } from 'react';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  red: '#DC2626', redBg: '#FEF2F2',
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
    uploaded: { label: 'Verified ✓', bg: C.greenBg, color: C.green },
    pending:  { label: 'Reviewing…', bg: C.yellowBg, color: C.yellow },
    missing:  { label: 'Missing',    bg: C.redBg,    color: C.red },
  }[status];
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' as const }}>
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

  const accentColor = doc.status === 'uploaded' ? C.green
    : doc.status === 'pending' ? C.yellow
    : doc.required ? C.red : C.border;

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: doc.status === 'uploaded' ? C.greenBg : C.bg,
          border: `1px solid ${doc.status === 'uploaded' ? 'rgba(22,163,74,0.25)' : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {doc.status === 'uploaded' ? '✅' : doc.required ? '📋' : '📄'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, marginBottom: 2 }}>
            {doc.label}
            {doc.required && <span style={{ color: C.red, marginLeft: 4, fontSize: '0.75rem' }}>*</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: C.text3 }}>
            {doc.status === 'uploaded' ? `${doc.fileName} · ${doc.uploadedAt}` : 'Tap to upload or photograph'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <StatusChip status={doc.status} />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ color: C.text3, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px' }}>
          {/* AI hint */}
          <div style={{ background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.8rem', color: C.blue, lineHeight: 1.5, margin: 0 }}>
              {doc.aiHint}
            </p>
          </div>

          {doc.status === 'uploaded' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10,
                background: C.greenBg, border: `1px solid rgba(22,163,74,0.2)`,
                fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>✓ {doc.fileName}</div>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '10px 14px',
                borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg,
                color: C.text2, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Replace</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* PRIMARY: Camera */}
              <button onClick={() => cameraRef.current?.click()} style={{
                width: '100%', padding: '18px 16px', borderRadius: 12,
                background: C.green, border: 'none',
                color: C.white, fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 22 }}>📷</span>
                Photograph Document
              </button>
              {/* SECONDARY: file */}
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                background: C.bg, border: `1px solid ${C.border}`,
                color: C.text2, fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 18 }}>📁</span>
                Upload from Files / Gallery
              </button>
            </div>
          )}

          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={e => handleFile(e, 'camera')} />
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf"
            style={{ display: 'none' }} onChange={e => handleFile(e, 'file')} />

          {doc.status === 'missing' && (
            <p style={{ fontSize: '0.72rem', color: C.text3, marginTop: 10, lineHeight: 1.5 }}>
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
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", padding: 'clamp(16px,4vw,28px)' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: C.text, borderRadius: 10,
          padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600, color: C.white,
          zIndex: 9999, whiteSpace: 'nowrap' as const, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.5rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 6 }}>
            🗂️ Documents
          </h1>
          <p style={{ fontSize: '0.875rem', color: C.text3, lineHeight: 1.5 }}>
            Photograph or upload documents. All files are AES-256 encrypted on EU servers.
          </p>
        </div>

        {/* Progress card */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>Document Readiness</div>
              <div style={{ fontSize: '0.75rem', color: C.text3, marginTop: 2 }}>{uploaded}/{required.length} required uploaded</div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: pct === 100 ? C.green : C.yellow }}>{pct}%</div>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s ease',
              background: pct === 100 ? C.green : C.orange }} />
          </div>
          {pct < 100 && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: C.yellowBg, border: `1px solid rgba(202,138,4,0.2)`,
              fontSize: '0.8rem', color: C.yellow, display: 'flex', gap: 8 }}>
              <span>🤖</span>
              <span>Upload missing required documents to unlock AI distribution</span>
            </div>
          )}
        </div>

        {/* Required */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>
          Required
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {required.map(doc => <DocCard key={doc.id} doc={doc} onUpload={handleUpload} onCamera={handleCamera} />)}
        </div>

        {/* Optional */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>
          Optional — Boost match score
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {optional.map(doc => <DocCard key={doc.id} doc={doc} onUpload={handleUpload} onCamera={handleCamera} />)}
        </div>

        {/* AI tip */}
        <div style={{ padding: '16px 20px', borderRadius: 12,
          background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.blue, marginBottom: 4 }}>
                AI Document Assistant
              </div>
              <p style={{ fontSize: '0.8rem', color: C.blue, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
                On mobile, tap <strong>Photograph Document</strong> — no scanning app needed.
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
