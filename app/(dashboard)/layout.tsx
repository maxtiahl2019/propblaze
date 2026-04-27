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
      // ── ADMIN GATE: dashboard is closed to the public ──────────────────
      const ADMIN_EMAILS = ['contact@win-winsolution.com', 'max.tyagly@gmail.com', 'maxtiahyi@gmail.com']
      const ADMIN_TOKEN  = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'propblaze-admin-2025'

      // Check localStorage for admin token or email
      try {
        const stored = localStorage.getItem('propblaze-auth')
        if (stored) {
          const parsed = JSON.parse(stored)
          const email = parsed?.state?.user?.email || ''
          const token = parsed?.state?.token || ''
          if (ADMIN_EMAILS.includes(email) || token === ADMIN_TOKEN) {
            setVerified(true); return
          }
        }
        // Check sessionStorage for direct admin access
        const adminKey = sessionStorage.getItem('admin-access')
        if (adminKey === ADMIN_TOKEN) { setVerified(true); return }
      } catch {}

      if (DEMO_MODE) {
        // In demo mode only allow admin emails
        try {
          const stored = localStorage.getItem('propblaze-auth')
          if (stored) {
            const parsed = JSON.parse(stored)
            const email = parsed?.state?.user?.email || ''
            if (ADMIN_EMAILS.includes(email)) { setVerified(true); return }
          }
        } catch {}
        router.replace('/'); return
      }

      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession()
        if (!data.session) { logout(); router.replace('/'); return }
        if (!ADMIN_EMAILS.includes(data.session.user.email || '')) {
          router.replace('/'); return
        }
        setVerified(true); return
      }
      router.replace('/');
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!verified) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:36, height:36, border:'3px solid #DCFCE7', borderTopColor:'#16A34A', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ fontSize:'0.8125rem', color:'#94A3B8' }}>Checking session…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const lightSidebarVars = {
    '--bg-sidebar':     '#FFFFFF',
    '--surface':        'rgba(0,0,0,0.04)',
    '--surface-2':      'rgba(0,0,0,0.07)',
    '--surface-hover':  'rgba(0,0,0,0.05)',
    '--border':         '#E2E8F0',
    '--border-strong':  '#CBD5E1',
    '--text':           '#0F172A',
    '--text-secondary': '#475569',
    '--text-tertiary':  '#94A3B8',
    '--primary':        '#16A34A',
    '--primary-hover':  '#15803D',
    '--primary-light':  'rgba(22,163,74,0.08)',
    '--primary-border': 'rgba(22,163,74,0.25)',
    '--green':          '#16A34A',
    '--red':            '#EF4444',
    '--blue':           '#3B5BDB',
  } as React.CSSProperties;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8FAFC', flexDirection:'column' }}>
      {DEMO_MODE && (
        <div style={{
          background:'linear-gradient(90deg,#16A34A,#15803D)',
          color:'#fff', fontWeight:700, textAlign:'center',
          letterSpacing:'0.04em', display:'flex', alignItems:'center',
          justifyContent:'center', gap:6, padding:'8px 16px', fontSize:'0.8125rem',
        }} className="demo-banner">
          <span>🚀</span>
          <span className="demo-banner-full">DEMO MODE — PropBlaze · AI Property Distribution Preview</span>
          <span className="demo-banner-short">DEMO MODE · PropBlaze</span>
        </div>
      )}

      <div style={{ display:'flex', flex:1, minHeight:0 }}>
        <div style={lightSidebarVars} className="sidebar-wrap">
          <Sidebar />
        </div>
        <main className="dash-main" style={{ flex:1, minWidth:0, overflow:'auto', background:'#F8FAFC' }}>
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
