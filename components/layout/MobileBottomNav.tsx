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
    icon: (active: boolean) => (
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
    icon: (active: boolean) => (
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
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7" r="3.5"
          fill={active ? 'rgba(22,163,74,0.12)' : 'none'}
          stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 19c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()

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
      {TABS.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
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
              color: active ? '#16A34A' : '#94A3B8',
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
                background:'#16A34A',
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
