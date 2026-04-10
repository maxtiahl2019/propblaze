'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth, DEMO_MODE } from '@/store/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // Demo mode — allow through
      if (DEMO_MODE) { setVerified(true); return; }

      // Supabase: verify there's a real live session
      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          logout();           // clear stale localStorage
          router.replace('/login');
          return;
        }
        setVerified(true);
        return;
      }

      // Fallback (no Supabase): redirect to login always
      router.replace('/login');
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!verified) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080810' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:36, height:36, border:'3px solid rgba(245,194,0,0.2)', borderTopColor:'#F5C200', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)' }}>Checking session…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
