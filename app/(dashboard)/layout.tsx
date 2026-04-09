'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth, DEMO_MODE } from '@/store/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--blue)',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L2 7.5V16.5H6.5V12H11.5V16.5H16V7.5L9 1.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  // ── Dark sidebar CSS variable overrides (2027 design system) ──────────────
  const darkSidebarVars = {
    '--bg-sidebar':     '#0D0D1A',
    '--surface':        'rgba(255,255,255,0.05)',
    '--surface-2':      'rgba(255,255,255,0.08)',
    '--surface-hover':  'rgba(255,255,255,0.10)',
    '--border':         'rgba(255,255,255,0.09)',
    '--border-strong':  'rgba(255,255,255,0.16)',
    '--text':           '#FFFFFF',
    '--text-secondary': 'rgba(255,255,255,0.65)',
    '--text-tertiary':  'rgba(255,255,255,0.38)',
    '--primary':        '#F5C200',
    '--primary-hover':  '#E0B000',
    '--primary-light':  'rgba(245,194,0,0.10)',
    '--primary-border': 'rgba(245,194,0,0.28)',
    '--green':          '#22C55E',
    '--red':            '#EF4444',
    '--blue':           '#3B5BDB',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810', flexDirection: 'column' }}>
      {DEMO_MODE && (
        <div style={{
          background: 'linear-gradient(90deg, #F5C200, #E07B00)',
          color: '#080810', fontSize: '0.68rem', fontWeight: 700,
          textAlign: 'center', padding: '5px 16px', letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>🚀</span>
          <span>DEMO MODE — PropBlaze · AI Property Distribution Preview</span>
          <span style={{ opacity: 0.6 }}>· demo@propblaze.eu</span>
        </div>
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={darkSidebarVars}>
          <Sidebar />
        </div>
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto', background: '#080810' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
