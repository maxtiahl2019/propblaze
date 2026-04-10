'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
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
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080810' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:36, height:36, background:'#3B5BDB', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L2 7.5V16.5H6.5V12H11.5V16.5H16V7.5L9 1.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)' }}>Loading…</p>
        </div>
      </div>
    );
  }

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
    <div style={{ display:'flex', minHeight:'100vh', background:'#080810', flexDirection:'column' }}>
      {/* Demo banner */}
      {DEMO_MODE && (
        <div style={{
          background:'linear-gradient(90deg,#F5C200,#E07B00)',
          color:'#080810', fontWeight:700, textAlign:'center',
          letterSpacing:'0.04em', display:'flex', alignItems:'center',
          justifyContent:'center', gap:6,
        }} className="demo-banner">
          <span>🚀</span>
          <span className="demo-banner-full">DEMO MODE — PropBlaze · AI Property Distribution Preview</span>
          <span className="demo-banner-short">DEMO MODE · PropBlaze</span>
        </div>
      )}

      <div style={{ display:'flex', flex:1, minHeight:0 }}>
        {/* Sidebar — hidden on mobile via CSS */}
        <div style={darkSidebarVars} className="sidebar-wrap">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="dash-main" style={{ flex:1, minWidth:0, overflow:'auto', background:'#080810' }}>
          {children}
        </main>
      </div>

      {/* Bottom nav — shown on mobile via CSS */}
      <MobileBottomNav />
    </div>
  );
}
