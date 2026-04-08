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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080809', flexDirection: 'column' }}>
      {DEMO_MODE && (
        <div style={{
          background: 'linear-gradient(90deg,rgba(192,57,43,0.9),rgba(230,126,34,0.9))',
          color: 'white', fontSize: '0.7rem', fontWeight: 600,
          textAlign: 'center', padding: '5px 16px', letterSpacing: '0.02em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>🔥</span>
          <span>DEMO MODE — PropBlaze preview with sample data</span>
          <span style={{ opacity: 0.6 }}>· demo@propblaze.com</span>
        </div>
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
