'use client'

import React, { useState } from 'react'
import Link from 'next/link'

// Lighter, richer palette — deep navy instead of pure black
const D = {
  bg:       '#10101E',
  bg2:      '#181828',
  surface:  'rgba(255,255,255,0.07)',
  surface2: 'rgba(255,255,255,0.12)',
  surface3: 'rgba(255,255,255,0.18)',
  border:   'rgba(255,255,255,0.10)',
  border2:  'rgba(255,255,255,0.20)',
  yellow:   '#F5C200',
  green:    '#22C55E',
  red:      '#EF4444',
  blue:     '#3B5BDB',
  white:    '#FFFFFF',
  w90: 'rgba(255,255,255,0.90)',
  w70: 'rgba(255,255,255,0.70)',
  w50: 'rgba(255,255,255,0.50)',
  w30: 'rgba(255,255,255,0.30)',
  grad1: 'linear-gradient(135deg, #F5C200 0%, #FF8C00 100%)',
}

const DEMO_PROPERTIES = [
  { id: 'prop-1', emoji: '🏢', label: 'Apt · Belgrade', address: 'Knez Mihailova 28', price: '€145,000', status: 'distributing', agencies: 10, leads: 3, wave: 1, docsReady: 100 },
  { id: 'prop-2', emoji: '🏖️', label: 'Villa · Budva', address: 'Sveti Stefan Peninsula', price: '€485,000', status: 'draft', agencies: 0, leads: 0, wave: 0, docsReady: 40 },
]

const URGENT_LEADS = [
  { id: 'l1', flag: '🇦🇹', name: 'Magnus Realty', city: 'Vienna', time: '2h ago', snippet: 'Interested in the Belgrade apt. Can you share floor plan?', unread: true },
  { id: 'l2', flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', time: '5h ago', snippet: 'We have a buyer for €140k. Owner direct possible?', unread: true },
  { id: 'l3', flag: '🇦🇹', name: 'Euro Prime', city: 'Vienna', time: '1d ago', snippet: 'Professional photos received. Listing going live today.', unread: false },
]

const ACTIONS = [
  { emoji: '➕', label: 'List Property', href: '/properties/new', color: '#080810', bg: D.grad1, border: 'transparent', bold: true },
  { emoji: '📋', label: 'View Leads', href: '/leads', color: '#93c5fd', bg: 'rgba(59,91,219,0.15)', border: 'rgba(59,91,219,0.30)' },
  { emoji: '🗂️', label: 'Documents', href: '/documents', color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  { emoji: '📡', label: 'Distribution', href: '/distribution', color: D.w70, bg: D.surface2, border: D.border2 },
]

function StatusChip({ status }: { status: string }) {
  if (status === 'distributing') return (
    <span className="chip-active" style={{ fontSize: '0.7rem', fontWeight: 700, color: D.green, background: 'rgba(34,197,94,0.18)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.4)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: 99, background: D.green, display: 'inline-block' }} />
      Active
    </span>
  )
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: D.yellow, background: 'rgba(245,194,0,0.14)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(245,194,0,0.35)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      ○ Draft
    </span>
  )
}

export default function DashboardPage() {
  const [expandedProp, setExpandedProp] = useState<string | null>('prop-1')
  const unread = URGENT_LEADS.filter(l => l.unread).length

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(245,194,0,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(245,194,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,194,0,0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.75); }
        }
        @keyframes glow-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .banner-pulse { animation: pulse-ring 2.2s ease-out infinite; }
        .dot-pulse    { animation: pulse-dot 1.6s ease-in-out infinite; }
        .badge-pulse  { animation: glow-red 1.8s ease-out infinite; }
        .card-hover:active { transform: scale(0.985); }
      `}</style>

      <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

          {/* ── Header ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.25rem,5vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2, color: D.white }}>
                Good morning 👋
              </h1>
              <p style={{ fontSize: '0.82rem', color: D.w50 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <Link href="/properties/new" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px',
              background: D.grad1, borderRadius: 12, color: '#080810', fontWeight: 800,
              fontSize: '0.82rem', textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(245,194,0,0.35)',
            }}>
              ➕ List Property
            </Link>
          </div>

          {/* ── AI Urgency Banner — PULSING ───────────────────────── */}
          {unread > 0 && (
            <Link href="/leads" style={{ display: 'block', textDecoration: 'none', marginBottom: 16 }}>
              <div className="banner-pulse" style={{
                background: 'linear-gradient(135deg, rgba(245,194,0,0.14), rgba(255,140,0,0.09))',
                border: '1.5px solid rgba(245,194,0,0.45)', borderRadius: 18, padding: '16px 18px',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <span style={{ fontSize: 30 }}>🤖</span>
                  <span className="badge-pulse" style={{
                    position: 'absolute', top: -6, right: -6, background: D.red,
                    color: D.white, fontSize: '0.62rem', fontWeight: 800, borderRadius: 99,
                    padding: '2px 6px', minWidth: 18, textAlign: 'center',
                    border: '2px solid #10101E',
                  }}>{unread}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: D.yellow, marginBottom: 3 }}>
                    {unread} new lead{unread > 1 ? 's' : ''} need your attention
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(245,194,0,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {URGENT_LEADS.find(l => l.unread)?.snippet}
                  </div>
                </div>
                <div style={{ fontSize: 22, color: 'rgba(245,194,0,0.6)', flexShrink: 0 }}>›</div>
              </div>
            </Link>
          )}

          {/* ── KPI Strip ────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Agencies Reached', value: 10, icon: '📡', color: D.yellow, bg: 'rgba(245,194,0,0.10)', border: 'rgba(245,194,0,0.22)' },
              { label: 'Active Leads', value: 3, icon: '🔥', color: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.22)' },
              { label: 'Unread', value: unread, icon: '💬', color: '#93c5fd', bg: 'rgba(59,91,219,0.12)', border: 'rgba(59,91,219,0.25)', pulse: unread > 0 },
            ].map(kpi => (
              <div key={kpi.label} className={kpi.pulse ? 'banner-pulse' : ''} style={{
                background: kpi.bg, border: `1.5px solid ${kpi.border}`, borderRadius: 14,
                padding: '14px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>{kpi.icon}</div>
                <div style={{ fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ fontSize: '0.62rem', color: D.w50, marginTop: 4, lineHeight: 1.3 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* ── Properties ─────────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: D.w50, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            My Properties
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {DEMO_PROPERTIES.map(prop => (
              <div key={prop.id} style={{
                background: D.bg2, border: `1px solid ${D.border}`,
                borderLeft: `3px solid ${prop.status === 'distributing' ? D.green : D.yellow}`,
                borderRadius: 14, overflow: 'hidden',
                boxShadow: prop.status === 'distributing' ? '0 2px 16px rgba(34,197,94,0.08)' : '0 2px 12px rgba(0,0,0,0.3)',
              }}>
                <div className="card-hover" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpandedProp(expandedProp === prop.id ? null : prop.id)}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{prop.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: D.w90 }}>{prop.label}</span>
                      <StatusChip status={prop.status} />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: D.w50 }}>{prop.price} · {prop.address}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    style={{ color: D.w50, flexShrink: 0, transform: expandedProp === prop.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                    <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>

                {expandedProp === prop.id && (
                  <div style={{ borderTop: `1px solid ${D.border}`, padding: '14px 16px', background: 'rgba(255,255,255,0.02)' }}>
                    {prop.status === 'distributing' ? (
                      <>
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                            <span style={{ fontSize: '0.75rem', color: D.w70, fontWeight: 600 }}>Wave {prop.wave} · {prop.agencies} agencies contacted</span>
                            <span style={{ fontSize: '0.75rem', color: D.green, fontWeight: 800 }}>{prop.leads} leads 🔥</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '67%', borderRadius: 99, background: 'linear-gradient(90deg,#22C55E,#16A34A)', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[
                            { href: '/leads', label: `🔥 ${prop.leads} Leads`, bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.32)', color: D.green, bold: true },
                            { href: '/distribution', label: '📡 Distribution', bg: D.surface2, border: D.border2, color: D.w70 },
                            { href: '/documents', label: '🗂️ Docs', bg: D.surface2, border: D.border2, color: D.w70 },
                          ].map(btn => (
                            <Link key={btn.label} href={btn.href} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color, fontWeight: btn.bold ? 800 : 600, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                              {btn.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* AI guidance for draft */}
                        <div style={{ background: 'rgba(245,194,0,0.09)', border: '1px solid rgba(245,194,0,0.28)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                            <div>
                              <div style={{ fontSize: '0.83rem', fontWeight: 800, color: D.yellow, marginBottom: 3 }}>2 things needed to launch</div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(245,194,0,0.75)', lineHeight: 1.5 }}>Upload title deed · Add photos → AI distributes to 30 agencies</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '0.72rem', color: D.w50 }}>Documents complete</span>
                            <span style={{ fontSize: '0.72rem', color: D.yellow, fontWeight: 700 }}>{prop.docsReady}%</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${prop.docsReady}%`, borderRadius: 99, background: 'linear-gradient(90deg,#F5C200,#FF8C00)' }} />
                          </div>
                        </div>
                        <Link href="/documents" style={{ display: 'block', padding: '13px', borderRadius: 12, background: D.grad1, color: '#080810', fontWeight: 800, fontSize: '0.87rem', textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 14px rgba(245,194,0,0.3)' }}>
                          📷 Upload Documents to Launch
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            <Link href="/properties/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', borderRadius: 14, textDecoration: 'none', border: '1.5px dashed rgba(245,194,0,0.35)', color: D.yellow, fontWeight: 700, fontSize: '0.875rem', background: 'rgba(245,194,0,0.04)' }}>
              ➕ List another property
            </Link>
          </div>

          {/* ── Recent Leads ─────────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: D.w50, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Recent Lead Activity
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {URGENT_LEADS.map(lead => (
              <Link key={lead.id} href="/leads" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: lead.unread ? 'rgba(245,194,0,0.06)' : D.bg2,
                  border: `1px solid ${lead.unread ? 'rgba(245,194,0,0.28)' : D.border}`,
                  borderRadius: 14, padding: '13px 15px',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: lead.unread ? 'rgba(245,194,0,0.12)' : D.surface2, border: `1.5px solid ${lead.unread ? 'rgba(245,194,0,0.35)' : D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {lead.flag}
                    </div>
                    {lead.unread && <div className="badge-pulse" style={{ position: 'absolute', top: -3, right: -3, width: 11, height: 11, background: D.red, borderRadius: 99, border: '2px solid #10101E' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: '0.87rem', fontWeight: 700, color: lead.unread ? D.yellow : D.w90 }}>{lead.name}</span>
                      <span style={{ fontSize: '0.7rem', color: D.w50, flexShrink: 0, marginLeft: 8 }}>{lead.time}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: D.w50, marginBottom: 3 }}>{lead.city}</div>
                    <div style={{ fontSize: '0.78rem', color: lead.unread ? D.w70 : D.w50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.snippet}</div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/leads" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 12, border: `1px solid ${D.border}`, color: D.w70, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', background: D.surface }}>
              View all leads →
            </Link>
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: D.w50, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
            {ACTIONS.map(a => (
              <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: 14, padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.1s' }}>
                  <span style={{ fontSize: 26 }}>{a.emoji}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: a.bold ? 800 : 700, color: a.color }}>{a.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* ── AI Status ─────────────────────────────────────────────── */}
          <div style={{ padding: '16px 18px', borderRadius: 16, marginBottom: 32,
            background: 'rgba(59,91,219,0.10)', border: '1.5px solid rgba(59,91,219,0.28)',
            boxShadow: '0 4px 20px rgba(59,91,219,0.08)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#93c5fd', marginBottom: 5 }}>
                  PropBlaze AI — Active
                </div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(147,197,253,0.75)', lineHeight: 1.65, margin: 0 }}>
                  Monitoring 10 agencies for your Belgrade apartment. Wave 2 sends in <strong style={{ color: '#93c5fd' }}>3 days</strong> if no Wave 1 reply. All messages forward to <strong style={{ color: '#93c5fd' }}>contact@win-winsolution.com</strong>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
