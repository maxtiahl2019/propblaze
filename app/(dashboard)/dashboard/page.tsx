'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [expandedProp, setExpandedProp] = useState<string | null>('prop-1')
  const unread = 2

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(245,194,0,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(245,194,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,194,0,0); }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          50%       { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .banner-pulse { animation: pulse-ring 2s ease-out infinite; }
        .red-pulse    { animation: pulse-red 1.8s ease-out infinite; }
        .dot-blink    { animation: blink-dot 1.5s ease-in-out infinite; }
        .action-card  { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .action-card:hover { transform: translateY(-2px); }
        .action-card:active { transform: scale(0.97); }
        .lead-row { transition: background 0.12s ease; }
        .lead-row:hover { background: rgba(255,255,255,0.06) !important; }
        .prop-card { transition: box-shadow 0.2s ease; }
        .prop-card:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.4) !important; }
        .slide-in { animation: slide-in 0.25s ease both; }
      `}</style>

      <div style={{ background: '#14142A', minHeight: '100vh', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

          {/* ─── HEADER ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.7rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 2 }}>
                Good morning 👋
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <Link href="/properties/new" style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px',
              background: 'linear-gradient(135deg, #F5C200, #FF8C00)',
              borderRadius: 14, color: '#0A0A18', fontWeight: 900,
              fontSize: '0.85rem', textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 6px 20px rgba(245,194,0,0.45)',
            }}>
              ➕ List Property
            </Link>
          </div>

          {/* ─── AI URGENCY BANNER ─────────────────────────────── */}
          {unread > 0 && (
            <Link href="/leads" style={{ display: 'block', textDecoration: 'none', marginBottom: 18 }}>
              <div className="banner-pulse" style={{
                background: 'linear-gradient(135deg, rgba(245,194,0,0.18) 0%, rgba(255,120,0,0.12) 100%)',
                border: '1.5px solid rgba(245,194,0,0.55)', borderRadius: 20,
                padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(245,194,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🤖</div>
                  <div className="red-pulse" style={{
                    position: 'absolute', top: -5, right: -5,
                    width: 20, height: 20, borderRadius: 99,
                    background: '#EF4444', border: '2px solid #14142A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 900, color: '#fff',
                  }}>{unread}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F5C200', marginBottom: 3 }}>
                    {unread} new leads — reply within 24h
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(245,194,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Magnus Realty: "Interested in Belgrade apt. Can you share floor plan?"
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', color: 'rgba(245,194,0,0.5)', flexShrink: 0 }}>›</div>
              </div>
            </Link>
          )}

          {/* ─── KPI TILES ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { v: 10, label: 'Agencies', icon: '📡', color: '#F5C200', glow: 'rgba(245,194,0,0.22)', border: 'rgba(245,194,0,0.35)', bg: 'rgba(245,194,0,0.09)' },
              { v: 3,  label: 'Leads',    icon: '🔥', color: '#FB923C', glow: 'rgba(251,146,60,0.22)', border: 'rgba(251,146,60,0.35)', bg: 'rgba(251,146,60,0.09)' },
              { v: unread, label: 'Unread', icon: '💬', color: '#93C5FD', glow: 'rgba(59,91,219,0.25)', border: 'rgba(59,91,219,0.38)', bg: 'rgba(59,91,219,0.10)', pulse: unread > 0 },
            ].map(t => (
              <div key={t.label} className={t.pulse ? 'banner-pulse' : ''} style={{
                background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 16,
                padding: '14px 10px', textAlign: 'center',
                boxShadow: `0 4px 16px ${t.glow}`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 'clamp(1.6rem,6vw,2.2rem)', fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.v}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: 5, fontWeight: 600 }}>{t.label}</div>
              </div>
            ))}
          </div>

          {/* ─── QUICK ACTIONS ──────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { emoji: '➕', label: 'List Property', href: '/properties/new',
                bg: 'linear-gradient(135deg,#F5C200,#FF8C00)', color: '#0A0A18',
                shadow: '0 6px 20px rgba(245,194,0,0.4)', border: 'transparent' },
              { emoji: '🔥', label: 'View Leads', href: '/leads',
                bg: 'linear-gradient(135deg,rgba(251,146,60,0.25),rgba(239,68,68,0.18))', color: '#FB923C',
                shadow: '0 4px 16px rgba(251,146,60,0.2)', border: 'rgba(251,146,60,0.4)' },
              { emoji: '🗂️', label: 'Documents', href: '/documents',
                bg: 'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(22,163,74,0.12))', color: '#4ADE80',
                shadow: '0 4px 16px rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.38)' },
              { emoji: '📡', label: 'Distribution', href: '/distribution',
                bg: 'linear-gradient(135deg,rgba(59,91,219,0.22),rgba(112,72,232,0.15))', color: '#93C5FD',
                shadow: '0 4px 16px rgba(59,91,219,0.18)', border: 'rgba(59,91,219,0.38)' },
            ].map(a => (
              <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                <div className="action-card" style={{
                  background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: 16,
                  padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: a.shadow, cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{a.emoji}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: a.color, lineHeight: 1.2 }}>{a.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* ─── MY PROPERTIES ─────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            My Properties
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>

            {/* Active property */}
            <div className="prop-card" style={{
              background: '#1C1C34', border: '1.5px solid rgba(34,197,94,0.35)',
              borderLeft: '4px solid #22C55E', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(34,197,94,0.10)',
            }}>
              <div onClick={() => setExpandedProp(expandedProp === 'prop-1' ? null : 'prop-1')}
                style={{ padding: '15px 17px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🏢</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Apt · Belgrade</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.18)', padding: '2px 9px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.4)' }}>
                      <span className="dot-blink" style={{ width: 5, height: 5, borderRadius: 99, background: '#22C55E', display: 'inline-block' }} />
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)' }}>€145,000 · Knez Mihailova 28</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, transform: expandedProp === 'prop-1' ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                  <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              {expandedProp === 'prop-1' && (
                <div className="slide-in" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 17px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Wave 1 · 10 agencies contacted</span>
                      <span style={{ fontSize: '0.78rem', color: '#22C55E', fontWeight: 800 }}>🔥 3 leads</span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.09)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '67%', borderRadius: 99, background: 'linear-gradient(90deg,#22C55E,#16A34A)', boxShadow: '0 0 10px rgba(34,197,94,0.6)' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { href: '/leads', label: '🔥 3 Leads', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.38)', color: '#4ADE80' },
                      { href: '/distribution', label: '📡 Distribution', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' },
                      { href: '/documents', label: '🗂️ Docs', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' },
                    ].map(b => (
                      <Link key={b.label} href={b.href} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, background: b.bg, border: `1px solid ${b.border}`, color: b.color, fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                        {b.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Draft property */}
            <div className="prop-card" style={{
              background: '#1C1C34', border: '1.5px solid rgba(245,194,0,0.28)',
              borderLeft: '4px solid #F5C200', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(245,194,0,0.06)',
            }}>
              <div onClick={() => setExpandedProp(expandedProp === 'prop-2' ? null : 'prop-2')}
                style={{ padding: '15px 17px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🏖️</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Villa · Budva</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F5C200', background: 'rgba(245,194,0,0.14)', padding: '2px 9px', borderRadius: 99, border: '1px solid rgba(245,194,0,0.35)' }}>○ Draft</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)' }}>€485,000 · Sveti Stefan Peninsula</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, transform: expandedProp === 'prop-2' ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                  <path d="M3 6L8 10L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {expandedProp === 'prop-2' && (
                <div className="slide-in" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 17px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ background: 'rgba(245,194,0,0.10)', border: '1px solid rgba(245,194,0,0.30)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F5C200', marginBottom: 3 }}>2 things needed to launch</div>
                        <div style={{ fontSize: '0.76rem', color: 'rgba(245,194,0,0.7)', lineHeight: 1.5 }}>Upload title deed · Add photos → AI reaches 30 agencies</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)' }}>Documents</span>
                      <span style={{ fontSize: '0.73rem', color: '#F5C200', fontWeight: 700 }}>40%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.09)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '40%', borderRadius: 99, background: 'linear-gradient(90deg,#F5C200,#FF8C00)' }} />
                    </div>
                  </div>
                  <Link href="/documents" style={{ display: 'block', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#F5C200,#FF8C00)', color: '#0A0A18', fontWeight: 900, fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center', boxShadow: '0 6px 18px rgba(245,194,0,0.35)' }}>
                    📷 Upload Docs to Launch
                  </Link>
                </div>
              )}
            </div>

            <Link href="/properties/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px', borderRadius: 14, textDecoration: 'none', border: '1.5px dashed rgba(245,194,0,0.40)', color: '#F5C200', fontWeight: 700, fontSize: '0.875rem', background: 'rgba(245,194,0,0.05)' }}>
              ➕ List another property
            </Link>
          </div>

          {/* ─── RECENT LEADS ───────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            Recent Lead Activity
          </div>
          <div style={{ background: '#1C1C34', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
            {[
              { flag: '🇦🇹', name: 'Magnus Realty', city: 'Vienna', time: '2h ago', snippet: 'Can you share floor plan and arrange a virtual tour?', unread: true },
              { flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', time: '5h ago', snippet: 'Motivated buyer offering €140k cash, quick close possible.', unread: true },
              { flag: '🇦🇹', name: 'Euro Prime', city: 'Vienna', time: '1d ago', snippet: 'Professional photos received. Listing goes live today.', unread: false },
            ].map((lead, i, arr) => (
              <Link key={lead.name} href="/leads" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="lead-row" style={{
                  padding: '13px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  background: lead.unread ? 'rgba(245,194,0,0.04)' : 'transparent',
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: lead.unread ? 'rgba(245,194,0,0.14)' : 'rgba(255,255,255,0.08)', border: `1.5px solid ${lead.unread ? 'rgba(245,194,0,0.40)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{lead.flag}</div>
                    {lead.unread && <div className="red-pulse" style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: '#EF4444', borderRadius: 99, border: '2px solid #14142A' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: lead.unread ? '#F5C200' : 'rgba(255,255,255,0.9)' }}>{lead.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: 8 }}>{lead.time}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{lead.city}</div>
                    <div style={{ fontSize: '0.78rem', color: lead.unread ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.snippet}</div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/leads" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              View all leads →
            </Link>
          </div>

          {/* ─── AI STATUS ──────────────────────────────────────── */}
          <div style={{ padding: '18px 20px', borderRadius: 18, marginBottom: 40,
            background: 'linear-gradient(135deg,rgba(59,91,219,0.18),rgba(112,72,232,0.12))',
            border: '1.5px solid rgba(59,91,219,0.40)',
            boxShadow: '0 6px 24px rgba(59,91,219,0.15)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(59,91,219,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#93C5FD', marginBottom: 5 }}>
                  PropBlaze AI — Active
                </div>
                <p style={{ fontSize: '0.81rem', color: 'rgba(147,197,253,0.72)', lineHeight: 1.65, margin: 0 }}>
                  Monitoring 10 agencies for your Belgrade apartment. Wave 2 sends automatically in <strong style={{ color: '#93C5FD' }}>3 days</strong> if no Wave 1 response. All replies forward to <strong style={{ color: '#93C5FD' }}>contact@win-winsolution.com</strong>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
