'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/store/auth'

interface Tab {
  href: string
  label: string
  badge?: number
  icon: (active: boolean) => React.ReactNode
}

const OWNER_TABS: Tab[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active) => (
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
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="10" width="18" height="10" rx="1.5"
          fill={active ? 'rgba(22,163,74,0.12)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 10V7a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/leads',
    label: 'Sellers',
    badge: 3,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"
          fill={active ? 'rgba(22,163,74,0.08)' : 'none'}/>
        <path d="M2 19c0-3.31 2.69-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 12v7M12.5 15.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/messenger',
    label: 'Messages',
    badge: 5,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 4h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 4V5a1 1 0 0 1 1-1z"
          fill={active ? 'rgba(22,163,74,0.12)' : 'none'}
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7" r="3.5"
          fill={active ? 'rgba(22,163,74,0.12)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 19c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const AGENCY_TABS: Tab[] = [
  {
    href: '/agency-demo',
    label: 'Dashboard',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" opacity={active ? 1 : 0.6}/>
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        <rect x="12" y="12" width="8" height="8" rx="2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" opacity={active ? 1 : 0.6}/>
      </svg>
    ),
  },
  {
    href: '/agency-demo?tab=new',
    label: 'Incoming',
    badge: 2,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3V15M6.5 10.5L11 15L15.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 18H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/agency-demo?tab=in_progress',
    label: 'In Work',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(59,130,246,0.1)' : 'none'}/>
        <path d="M11 6V11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/agency-demo?tab=closed',
    label: 'Closed',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 11.5L9 15.5L17 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3.5"
          fill={active ? 'rgba(59,130,246,0.12)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 2.5V5M11 17V19.5M2.5 11H5M17 11H19.5M4.9 4.9L6.5 6.5M15.5 15.5L17.1 17.1M17.1 4.9L15.5 6.5M6.5 15.5L4.9 17.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()
  const { user } = useAuth()
  const isAgency = user?.role === 'agency'
  const tabs = isAgency ? AGENCY_TABS : OWNER_TABS
  const accentColor = isAgency ? '#3B82F6' : '#16A34A'

  return (
    <nav className="mobile-bottom-nav" style={{
      position:'fixed',
      bottom:0,
      left:0,
      right:0,
      zIndex:200,
      background:'#FFFFFF',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderTop:'1px solid #E2E8F0',
      boxShadow:'0 -4px 20px rgba(0,0,0,0.06)',
      display:'flex',
      alignItems:'stretch',
      paddingBottom:'env(safe-area-inset-bottom,0px)',
      height:'calc(60px + env(safe-area-inset-bottom,0px))',
      overflowX:'auto',
    }}>
      {tabs.map(tab => {
        const base = tab.href.split('?')[0]
        const active = pathname === base || pathname.startsWith(base + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex:'0 0 20%',
              minWidth:56,
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:3,
              textDecoration:'none',
              color: active ? accentColor : '#94A3B8',
              position:'relative',
              paddingTop:8,
              paddingBottom:4,
              transition:'color 0.15s',
              minHeight:44,
            }}
          >
            {tab.badge && (
              <span style={{
                position:'absolute', top:6, right:'calc(50% - 16px)',
                background:'#EF4444', color:'white',
                fontSize:'0.55rem', fontWeight:700,
                borderRadius:99, minWidth:15, height:15,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:'0 3px', border:'1.5px solid #FFFFFF',
              }}>
                {tab.badge}
              </span>
            )}
            {tab.icon(active)}
            <span style={{
              fontSize:'0.6rem', fontWeight: active ? 600 : 400,
              letterSpacing:'0.01em', lineHeight:1,
            }}>
              {tab.label}
            </span>
            {active && (
              <span style={{
                position:'absolute', top:0, left:'50%',
                transform:'translateX(-50%)',
                width:20, height:2, borderRadius:99,
                background: accentColor,
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
