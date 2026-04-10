'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const D = {
  bg: '#080810', bg2: '#0D0D1A',
  surface: 'rgba(255,255,255,0.04)', surface2: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.08)', border2: 'rgba(255,255,255,0.16)',
  yellow: '#F5C200', green: '#22C55E', red: '#EF4444', blue: '#3B5BDB',
  white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.80)', w60: 'rgba(255,255,255,0.60)',
  w40: 'rgba(255,255,255,0.40)', w20: 'rgba(255,255,255,0.20)',
  grad1: 'linear-gradient(135deg, #F5C200 0%, #FF8C00 100%)',
}

// ─── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_PROPERTIES = [
  {
    id: 'prop-1',
    emoji: '🏢',
    label: 'Apt · Belgrade',
    address: 'Knez Mihailova 28',
    price: '€145,000',
    status: 'distributing',
    statusLabel: 'Distributing',
    agencies: 10,
    leads: 3,
    wave: 1,
    docsReady: 100,
    aiScore: 94,
  },
  {
    id: 'prop-2',
    emoji: '🏖️',
    label: 'Villa · Budva',
    address: 'Sveti Stefan Peninsula',
    price: '€485,000',
    status: 'draft',
    statusLabel: 'Draft',
    agencies: 0,
    leads: 0,
    wave: 0,
    docsReady: 40,
    aiScore: 0,
  },
]

const URGENT_LEADS = [
  { id: 'l1', name: 'Magnus Realty', city: 'Vienna', flag: '🇦🇹', time: '2h ago', snippet: 'Interested in the Belgrade apt. Can you share floor plan?', unread: true },
  { id: 'l2', name: 'Adriatic Real Estate', city: 'Podgorica', flag: '🇲🇪', time: '5h ago', snippet: 'We have a buyer for €140k. Owner direct possible?', unread: true },
  { id: 'l3', name: 'Euro Prime', city: 'Vienna', flag: '🇦🇹', time: '1d ago', snippet: 'Professional photos received. Listing going live today.', unread: false },
]

const ACTIONS = [
  { emoji: '➕', label: 'List Property', href: '/properties/new', color: D.yellow, bg: 'rgba(245,194,0,0.12)', border: 'rgba(245,194,0,0.25)' },
  { emoji: '📋', label: 'View Leads', href: '/leads', color: '#93c5fd', bg: 'rgba(59,91,219,0.10)', border: 'rgba(59,91,219,0.22)' },
  { emoji: '🗂️', label: 'Documents', href: '/documents', color: '#86efac', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.20)' },
  { emoji: '📡', label: 'Distribution', href: '/distribution', color: 'rgba(255,255,255,0.7)', bg: D.surface2, border: D.border2 },
]

function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    distributing: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: '● Active' },
    draft:        { color: '#F5C200', bg: 'rgba(245,194,0,0.12)', label: '○ Draft' },
    sold:         { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)', label: '✓ Sold' },
  }
  const c = cfg[status] || cfg.draft
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: c.color, background: c.bg,
      padding: '2px 8px', borderRadius: 99, border: `1px solid ${c.color}33` }}>
      {c.label}
    </span>
  )
}

export default function DashboardPage() {
  const [expandedProp, setExpandedProp] = useState<string | null>('prop-1')

  const totalLeads = 3
  const totalSent = 10
  const unread = URGENT_LEADS.filter(l => l.unread).length

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem,5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 3 }}>
              Good morning 👋
            </h1>
            <p style={{ fontSize: '0.85rem', color: D.w40 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <Link href="/properties/new" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: D.grad1, borderRadius: 12, color: '#080810', fontWeight: 800,
            fontSize: '0.82rem', textDecoration: 'none', flexShrink: 0,
          }}>
            <span>➕</span> List Property
          </Link>
        </div>

        {/* ── AI Pulse — urgency banner ────────────────────────────────────────── */}
        {unread > 0 && (
          <Link href="/leads" style={{ display: 'block', textDecoration: 'none', marginBottom: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,194,0,0.13), rgba(255,140,0,0.08))',
              border: '1px solid rgba(245,194,0,0.3)', borderRadius: 16, padding: '14px 18px',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <span style={{ fontSize: 28 }}>🤖</span>
                <span style={{
                  position: 'absolute', top: -4, right: -4, background: D.red,
                  color: D.white, fontSize: '0.6rem', fontWeight: 800, borderRadius: 99,
                  padding: '1px 5px', minWidth: 16, textAlign: 'center',
                }}>{unread}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: D.yellow, marginBottom: 2 }}>
                  {unread} new lead{unread > 1 ? 's' : ''} need your attention
                </div>
                <div style={{ fontSize: '0.78rem', color: D.w60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {URGENT_LEADS.find(l => l.unread)?.snippet}
                </div>
              </div>
              <span style={{ color: D.w40, fontSize: 20, flexShrink: 0 }}>›</span>
            </div>
          </Link>
        )}

        {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Agencies Reached', value: totalSent, icon: '📡', color: D.yellow },
            { label: 'Active Leads', value: totalLeads, icon: '🔥', color: '#fb923c' },
            { label: 'Unread Messages', value: unread, icon: '💬', color: '#93c5fd' },
          ].map(kpi => (
            <div key={kpi.label} style={{
              background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14,
              padding: '14px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{kpi.icon}</div>
              <div style={{ fontSize: 'clamp(1.3rem,5vw,1.8rem)', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.65rem', color: D.w40, marginTop: 4, lineHeight: 1.3 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── Properties ───────────────────────────────────────────────────────── */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          My Properties
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {DEMO_PROPERTIES.map(prop => (
            <div key={prop.id} style={{
              background: D.surface, border: `1px solid ${D.border}`,
              borderLeft: `3px solid ${prop.status === 'distributing' ? D.green : D.yellow}`,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Card header */}
              <div
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => setExpandedProp(expandedProp === prop.id ? null : prop.id)}
              >
                <div style={{ fontSize: 28, flexShrink: 0 }}>{prop.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: D.white }}>{prop.label}</span>
                    <StatusDot status={prop.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: D.w40 }}>{prop.price} · {prop.address}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ color: D.w40, flexShrink: 0, transform: expandedProp === prop.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Expanded: AI status + quick actions */}
              {expandedProp === prop.id && (
                <div style={{ borderTop: `1px solid ${D.border}`, padding: '14px 16px' }}>
                  {prop.status === 'distributing' ? (
                    <>
                      {/* Distribution progress */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.75rem', color: D.w60, fontWeight: 600 }}>Wave {prop.wave} · {prop.agencies} agencies</span>
                          <span style={{ fontSize: '0.75rem', color: D.green, fontWeight: 700 }}>{prop.leads} leads</span>
                        </div>
                        <div style={{ height: 5, background: D.surface2, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '67%', borderRadius: 99, background: 'linear-gradient(90deg,#22C55E,#16A34A)' }} />
                        </div>
                      </div>
                      {/* Quick links */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href="/leads" style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: D.green, fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                          🔥 {prop.leads} Leads
                        </Link>
                        <Link href="/distribution" style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: D.surface2, border: `1px solid ${D.border2}`, color: D.w80, fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                          📡 Distribution
                        </Link>
                        <Link href="/documents" style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: D.surface2, border: `1px solid ${D.border2}`, color: D.w80, fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                          🗂️ Docs
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Draft — AI tells what's missing */}
                      <div style={{ background: 'rgba(245,194,0,0.07)', border: '1px solid rgba(245,194,0,0.18)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: D.yellow, marginBottom: 3 }}>AI needs 2 more things</div>
                          <div style={{ fontSize: '0.76rem', color: 'rgba(245,194,0,0.75)', lineHeight: 1.5 }}>Upload title deed · Add property photos to unlock distribution</div>
                        </div>
                      </div>
                      {/* Docs readiness */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.72rem', color: D.w40 }}>Documents</span>
                          <span style={{ fontSize: '0.72rem', color: D.yellow, fontWeight: 700 }}>{prop.docsReady}%</span>
                        </div>
                        <div style={{ height: 4, background: D.surface2, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${prop.docsReady}%`, borderRadius: 99, background: 'linear-gradient(90deg,#F5C200,#FF8C00)' }} />
                        </div>
                      </div>
                      <Link href="/documents" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 12, background: D.grad1, color: '#080810', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}>
                        📷 Upload Documents to Launch
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add property CTA */}
          <Link href="/properties/new" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px', borderRadius: 14, textDecoration: 'none',
            border: '1.5px dashed rgba(245,194,0,0.3)', color: D.yellow,
            fontWeight: 700, fontSize: '0.875rem',
          }}>
            <span style={{ fontSize: 22 }}>➕</span> List another property
          </Link>
        </div>

        {/* ── Urgent Leads ─────────────────────────────────────────────────────── */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Recent Lead Activity
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {URGENT_LEADS.map(lead => (
            <Link key={lead.id} href="/leads" style={{ textDecoration: 'none' }}>
              <div style={{
                background: lead.unread ? 'rgba(245,194,0,0.05)' : D.surface,
                border: `1px solid ${lead.unread ? 'rgba(245,194,0,0.2)' : D.border}`,
                borderRadius: 14, padding: '13px 15px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: lead.unread ? 'rgba(245,194,0,0.1)' : D.surface2,
                    border: `1px solid ${lead.unread ? 'rgba(245,194,0,0.25)' : D.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{lead.flag}</div>
                  {lead.unread && <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: D.red, borderRadius: 99, border: '2px solid #080810' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: lead.unread ? D.yellow : D.w80 }}>{lead.name}</span>
                    <span style={{ fontSize: '0.7rem', color: D.w40, flexShrink: 0 }}>{lead.time}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: D.w60 }}>{lead.city}</div>
                  <div style={{ fontSize: '0.75rem', color: D.w40, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.snippet}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/leads" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 12, border: `1px solid ${D.border}`, color: D.w60, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
            View all leads →
          </Link>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────────────── */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
          {ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: a.bg, border: `1px solid ${a.border}`, borderRadius: 14,
                padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 26 }}>{a.emoji}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: a.color }}>{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── AI Status Card ───────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 18px', borderRadius: 16, marginBottom: 32,
          background: 'rgba(59,91,219,0.07)', border: '1px solid rgba(59,91,219,0.18)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#93c5fd', marginBottom: 5 }}>
                PropBlaze AI — Active
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(147,197,253,0.7)', lineHeight: 1.6, margin: 0 }}>
                Monitoring 10 agencies for your Belgrade apartment. Wave 2 sends automatically in 3 days if no response from Wave 1.
                Your offer is being tracked for replies — all messages forward to <strong style={{ color: '#93c5fd' }}>contact@win-winsolution.com</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
