'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V14H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/properties',
    label: 'Properties',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="10" width="18" height="10" rx="1.5"
          fill={active ? 'rgba(245,194,0,0.15)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 10V7a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/leads',
    label: 'Leads',
    badge: 3,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 19c0-3.31 2.69-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 12v7M12.5 15.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/messenger',
    label: 'Messages',
    badge: 5,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 4h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 4V5a1 1 0 0 1 1-1z"
          fill={active ? 'rgba(245,194,0,0.15)' : 'none'}
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7" r="3.5"
          fill={active ? 'rgba(245,194,0,0.15)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 19c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))', display: 'block' }}
           className="mobile-bottom-nav-spacer" />

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'rgba(10,10,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}>
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: active ? '#F5C200' : 'rgba(255,255,255,0.4)',
                position: 'relative',
                paddingTop: 8,
                paddingBottom: 4,
                transition: 'color 0.15s',
              }}
            >
              {/* Badge */}
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 'calc(50% - 18px)',
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  borderRadius: 99,
                  minWidth: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '1.5px solid #080810',
                }}>
                  {tab.badge}
                </span>
              )}

              {/* Icon */}
              {tab.icon(active)}

              {/* Label */}
              <span style={{
                fontSize: '0.6rem',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}>
                {tab.label}
              </span>

              {/* Active indicator */}
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 2,
                  borderRadius: 99,
                  background: '#F5C200',
                }} />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default MobileBottomNav
