'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { useTranslation } from '@/lib/i18n/LangContext'
import type { Lang } from '@/lib/i18n/translations'

/* ─── Owner navigation ─────────────────────────────────────────────── */
const OWNER_NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.9"/><rect x="8.5" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="1" y="8.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.9"/></svg>,
  },
  {
    href: '/properties',
    label: 'My Properties',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1.5 7V14.5H5.5V10.5H10.5V14.5H14.5V7L8 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/></svg>,
  },
  {
    href: '/leads',
    label: 'Sellers',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.25"/><path d="M1 13.5C1 11.015 3.015 9 5.5 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/><path d="M11 9V14M8.5 11.5H13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
    badge: '3',
  },
  {
    href: '/distribution',
    label: 'Distribution',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="2.5" cy="8" r="1.5" fill="currentColor" fillOpacity="0.4"/><circle cx="8" cy="2.5" r="1.5" fill="currentColor" fillOpacity="0.7"/><circle cx="8" cy="13.5" r="1.5" fill="currentColor" fillOpacity="0.7"/><circle cx="13.5" cy="8" r="1.5" fill="currentColor"/><path d="M4 8H6.5M9.5 4L12 7M9.5 12L12 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2.5C2 2.22 2.22 2 2.5 2H9L14 7V13.5C14 13.78 13.78 14 13.5 14H2.5C2.22 14 2 13.78 2 13.5V2.5Z" stroke="currentColor" strokeWidth="1.25"/><path d="M9 2V7H14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
  },
  {
    href: '/messenger',
    label: 'Outreach',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3.5C2 3.22 2.22 3 2.5 3H13.5C13.78 3 14 3.22 14 3.5V11.5C14 11.78 13.78 12 13.5 12H3L1.5 13.5V3.5Z" stroke="currentColor" strokeWidth="1.25"/></svg>,
    badge: '1',
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2H2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h2v2l3-2h7a.5.5 0 0 0 .5-.5v-9A.5.5 0 0 0 14 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/><path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
    badge: '2',
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25"/><path d="M1 6.5H15" stroke="currentColor" strokeWidth="1.25"/><rect x="3" y="9" width="3" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.5"/></svg>,
  },
  {
    href: '/settings',
    label: 'Settings & Profile',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25"/><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M12.6 3.4L11.5 4.5M4.5 11.5L3.4 12.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
  },
]

/* ─── Agency navigation ────────────────────────────────────────────── */
const AGENCY_NAV = [
  {
    href: '/agency-demo',
    label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.9"/><rect x="8.5" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="1" y="8.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.9"/></svg>,
  },
  {
    href: '/agency-demo?tab=new',
    label: 'Incoming',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5V10.5M4.5 7L8 10.5L11.5 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12.5H14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
    badge: '!',
  },
  {
    href: '/agency-demo?tab=in_progress',
    label: 'In Work',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25"/><path d="M8 4.5V8L10.5 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
  },
  {
    href: '/agency-demo?tab=closed',
    label: 'Closed',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25"/><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M12.6 3.4L11.5 4.5M4.5 11.5L3.4 12.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>,
  },
]

// ─── Light language switcher ──────────────────────────────────────────
function LangBar() {
  const { lang, setLang } = useTranslation()
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'ru', flag: '🇷🇺', label: 'RU' },
    { code: 'es', flag: '🇷🇸', label: 'SR' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
      {langs.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} style={{
          padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: lang === l.code ? 'var(--primary-light)' : 'transparent',
          color: lang === l.code ? 'var(--primary)' : 'var(--text-tertiary)',
          fontSize: '0.65rem', fontWeight: lang === l.code ? 700 : 400,
          transition: 'all 0.15s', letterSpacing: '0.05em',
        }}>
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  const isAgency = user?.role === 'agency'
  const nav = isAgency ? AGENCY_NAV : OWNER_NAV

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}>
          <div style={{ width: 30, height: 30, flexShrink: 0 }}>
            <svg viewBox="0 0 32 32" fill="none" width="30" height="30">
              <defs>
                <linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isAgency ? '#3B82F6' : '#F97316'}/>
                  <stop offset="100%" stopColor={isAgency ? '#1D4ED8' : '#EA580C'}/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#sbg)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.25"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>PropBlaze</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {isAgency ? 'Agency Portal' : 'AI Platform'}
            </div>
          </div>
        </div>
      </Link>

      {/* Language Switcher */}
      <LangBar />

      {/* Add Property CTA — owners only */}
      {!isAgency && (
        <div style={{ padding: '12px 12px 8px' }}>
          <Link href="/properties/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 12px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Add Property
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map(item => {
          // For agency tabs with query params, match on base path
          const base = item.href.split('?')[0]
          const active = pathname === base || pathname.startsWith(base + '/')
          return (
            <Link key={item.href} href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                background: active ? 'var(--primary-light)' : 'transparent',
                border: active ? `1px solid var(--primary-border)` : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span style={{ color: active ? 'var(--primary)' : 'var(--text-tertiary)', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 999,
                  minWidth: 18,
                  textAlign: 'center',
                }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Profile / User */}
      <div style={{ padding: '8px 10px 12px', borderTop: '1px solid var(--border)' }}>
        <div
          onClick={() => setShowProfile(!showProfile)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}>
          {/* Avatar */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
            background: isAgency
              ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
              : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          }}>
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email?.split('@')[0] ?? 'User'}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              {isAgency ? 'Agency' : 'Owner'} · Active
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: showProfile ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M2.5 4.5L6 7.5L9.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
        </div>

        {showProfile && (
          <div style={{ marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <Link href="/settings" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
              fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/><path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
              Profile & Settings
            </Link>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--red)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M9.5 9.5L12.5 7M12.5 7L9.5 4.5M12.5 7H5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
