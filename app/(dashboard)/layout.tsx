'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth, DEMO_MODE } from '@/store/auth';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

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
          background: '#080810',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: '#3B5BDB',
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
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  // ── Dark sidebar CSS variable overrides ──────────────────────────────────
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
      {/* Demo banner — compact on mobile */}
      {DEMO_MODE && (
        <div style={{
          background: 'linear-gradient(90deg, #F5C200, #E07B00)',
          color: '#080810',
          fontSize: isMobile ? '0.6rem' : '0.68rem',
          fontWeight: 700,
          textAlign: 'center',
          padding: isMobile ? '4px 12px' : '5px 16px',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <span>🚀</span>
          <span>{isMobile ? 'DEMO MODE · PropBlaze' : 'DEMO MODE — PropBlaze · AI Property Distribution Preview'}</span>
          {!isMobile && <span style={{ opacity: 0.6 }}>· demo@propblaze.eu</span>}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <div style={darkSidebarVars}>
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <main style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          background: '#080810',
          // On mobile, add bottom padding to clear the nav bar
          paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : 0,
        }}>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
