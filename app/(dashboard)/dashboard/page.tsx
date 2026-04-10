'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'
import { useTranslation } from '@/lib/i18n/LangContext'

const DEMO_PROPS = [
  { id: 'p1', type: 'Apt', city: 'Belgrade', price: 145000, status: 'active', agencies: 10, leads: 3, progress: 100 },
  { id: 'p2', type: 'Villa', city: 'Budva', price: 485000, status: 'draft', agencies: 0, leads: 0, progress: 30 },
]

const DEMO_LEADS = [
  { id: 'l1', agency: 'Magnus Realty', city: 'Vienna', msg: 'Can you share floor plan and arrange a virtual tour?', time: '2h', unread: true },
  { id: 'l2', agency: 'Adriatic Real Estate', city: 'Podgorica', msg: 'Motivated buyer offering €140k cash, quick close possible.', time: '5h', unread: true },
]

function getGreeting(t: (k: string) => string) {
  const h = new Date().getHours()
  if (h < 12) return t('dash.greeting_morning')
  if (h < 18) return t('dash.greeting_day')
  return t('dash.greeting_evening')
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const userName = (user as any)?.profile?.full_name || (user as any)?.name || user?.email?.split('@')[0] || 'Max'
  const [pulse, setPulse] = useState(true)
  const [aiOpen, setAiOpen] = useState(false)
  const [globe, setGlobe] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setGlobe(g => (g + 1) % 360), 50)
    return () => clearInterval(t)
  }, [])

  const totalLeads = DEMO_LEADS.length
  const unread = DEMO_LEADS.filter(l => l.unread).length
  const activeProps = DEMO_PROPS.filter(p => p.status === 'active').length

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,150,50,0.0), 0 4px 24px rgba(245,150,50,0.12); }
          50%      { box-shadow: 0 0 0 8px rgba(245,150,50,0.12), 0 8px 40px rgba(245,150,50,0.22); }
        }
        @keyframes dot-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.6); }
        }
        @keyframes badge-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          60%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes lead-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0.08); }
        }
        .glow-card { animation: glow-pulse 3s ease-in-out infinite; }
        .lead-card  { animation: lead-glow 2.5s ease-in-out infinite; }
        .float-ai   { animation: float 4s ease-in-out infinite; }
        .dot-live   { animation: dot-pulse 1.2s ease-in-out infinite; }
        .badge-live { animation: badge-pulse 1.4s ease-in-out infinite; }
        .slide-up   { animation: slide-up 0.5s ease both; }

        .stat-hover { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; }

        .action-btn { transition: all 0.16s; cursor:pointer; }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.04); }
        .action-btn:active { transform: scale(0.98); }

        /* globe rings */
        @keyframes ring1 { 0%,100%{transform:rotateX(70deg) rotateZ(0deg)} 100%{transform:rotateX(70deg) rotateZ(360deg)} }
        @keyframes ring2 { 0%,100%{transform:rotateX(70deg) rotateZ(60deg)} 100%{transform:rotateX(70deg) rotateZ(420deg)} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FAFAF8 0%, #F5F3EF 50%, #F8F6F2 100%)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        padding: '0 0 80px',
      }}>

        {/* ── TOP HERO SECTION ──────────────────────────────────── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
          padding: '32px 24px 40px',
          borderRadius: '0 0 32px 32px',
        }}>
          {/* Background earth glow */}
          <div style={{
            position: 'absolute', right: -60, top: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,91,219,0.25) 0%, rgba(15,52,96,0.1) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          {/* Animated globe rings */}
          <div style={{
            position: 'absolute', right: 16, top: 16,
            width: 120, height: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {/* Globe body */}
            <div style={{
              position: 'absolute',
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #4A90D9, #1a3a6b)',
              boxShadow: '0 0 30px rgba(74,144,217,0.4), inset -8px -8px 16px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}>
              {/* Continents (abstract) */}
              <div style={{ position:'absolute', top:20, left:10, width:30, height:18, borderRadius:8, background:'rgba(80,180,80,0.6)' }}/>
              <div style={{ position:'absolute', top:35, left:38, width:22, height:28, borderRadius:6, background:'rgba(80,180,80,0.5)' }}/>
              <div style={{ position:'absolute', top:15, left:48, width:18, height:14, borderRadius:5, background:'rgba(80,180,80,0.55)' }}/>
            </div>
            {/* Orbit ring 1 */}
            <div style={{
              position: 'absolute', width: 100, height: 100, borderRadius: '50%',
              border: '1px solid rgba(74,144,217,0.3)',
              transform: 'rotateX(70deg)',
              animation: 'ring1 8s linear infinite',
            }}/>
            {/* Orbit ring 2 */}
            <div style={{
              position: 'absolute', width: 115, height: 115, borderRadius: '50%',
              border: '1px dashed rgba(245,194,0,0.25)',
              transform: 'rotateX(70deg) rotateZ(60deg)',
              animation: 'ring2 12s linear infinite',
            }}/>
            {/* Pulsing dot on orbit */}
            <div className="dot-live" style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#F5C200',
              boxShadow: '0 0 8px #F5C200',
            }}/>
          </div>

          {/* Greeting */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              {getGreeting(t)}, {new Date().toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long' })}
            </p>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 5vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              marginBottom: 6,
              lineHeight: 1.2,
            }}>
              Дорогой {userName} 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              {activeProps === 0
                ? t('wizard.sell_desc')
                : `${activeProps} ${t('dash.your_properties').toLowerCase()} · ${totalLeads} ${t('dash.new_leads').toLowerCase()}`}
            </p>

            {/* CTA */}
            <Link href="/properties/new" style={{ textDecoration: 'none' }}>
              <button className="glow-card action-btn" style={{
                background: 'linear-gradient(135deg, #F5C200, #FF8C00)',
                border: 'none', borderRadius: 14,
                padding: '12px 24px',
                color: '#1A1A2E', fontWeight: 800, fontSize: '0.9rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                letterSpacing: '-0.01em',
              }}>
                <span style={{ fontSize: 18 }}>＋</span>
                {t('dash.add_property')}
              </button>
            </Link>
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>

          {/* ── AI ASSISTANT ──────────────────────────────────────── */}
          <div className="float-ai slide-up" style={{
            marginTop: -20,
            background: '#fff',
            borderRadius: 20,
            padding: '20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 16,
            position: 'relative',
            animationDelay: '0.1s',
          }}>
            {/* AI Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
              boxShadow: '0 4px 16px rgba(118,75,162,0.35)',
              position: 'relative',
            }}>
              👩‍💼
              <div className="dot-live" style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 12, height: 12, borderRadius: '50%',
                background: '#22C55E', border: '2px solid #fff',
              }}/>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9BA8C0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                {t('dash.ai_assistant')} · {t('dash.ai_online').split('·')[1]?.trim() || 'online'}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#1A1F2E', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                {unread > 0
                  ? `${unread} ${t('dash.new_leads')} — ${t('leads.reply_email').toLowerCase()}`
                  : t('dash.your_properties') + ' — ' + t('dash.add_property').toLowerCase()}
              </p>
            </div>

            {unread > 0 && (
              <Link href="/leads" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div className="badge-live action-btn" style={{
                  background: '#EF4444', color: '#fff',
                  fontWeight: 800, fontSize: '0.8rem',
                  borderRadius: 10, padding: '8px 14px',
                  whiteSpace: 'nowrap',
                }}>
                  {unread} новых →
                </div>
              </Link>
            )}
          </div>

          {/* ── STATS ROW ─────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }} className="slide-up">
            {[
              { icon: '🏠', val: DEMO_PROPS.length, label: t('dash.properties_label'), color: '#3B5BDB', bg: '#EEF2FF', link: '/properties' },
              { icon: '🔥', val: totalLeads, label: t('dash.new_leads'), color: '#EA580C', bg: '#FFF3E8', link: '/leads' },
              { icon: '💬', val: unread, label: t('dash.unread_messages'), color: '#7C3AED', bg: '#F3E8FF', link: '/messenger', pulse: unread > 0 },
            ].map(s => (
              <Link key={s.label} href={s.link} style={{ textDecoration: 'none' }}>
                <div className={`stat-hover${s.pulse ? ' badge-live' : ''}`} style={{
                  background: '#fff',
                  borderRadius: 16, padding: '16px 12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9BA8C0', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── ATTENTION: NEW LEADS ZONE ─────────────────────────── */}
          {unread > 0 && (
            <div className="lead-card slide-up" style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, #FFF5F5, #FFF)',
              borderRadius: 20,
              border: '1.5px solid rgba(239,68,68,0.2)',
              overflow: 'hidden',
              animationDelay: '0.2s',
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div className="dot-live" style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#EF4444', flexShrink: 0,
                }}/>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#991B1B' }}>
                  {t('dash.requires_reply')} · {unread} {t('dash.new_leads')}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                  {t('leads.reply_email')} ↗
                </span>
              </div>
              {DEMO_LEADS.filter(l => l.unread).map((lead, i) => (
                <Link key={lead.id} href="/leads" style={{ textDecoration: 'none' }}>
                  <div className="action-btn" style={{
                    padding: '14px 18px',
                    borderBottom: i < unread - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FDE68A, #F97316)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      🏢
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A1F2E' }}>{lead.agency}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9BA8C0' }}>· {lead.city}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#9BA8C0' }}>{lead.time} назад</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#6B7A99', lineHeight: 1.45, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.msg}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── MY PROPERTIES ─────────────────────────────────────── */}
          <div style={{ marginTop: 20 }} className="slide-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1F2E', letterSpacing: '-0.02em' }}>
                Мои объекты
              </h2>
              <Link href="/properties" style={{ fontSize: '0.78rem', color: '#3B5BDB', fontWeight: 600, textDecoration: 'none' }}>
                Все →
              </Link>
            </div>

            {DEMO_PROPS.map((prop, i) => (
              <div key={prop.id} className="stat-hover" style={{
                background: '#fff',
                borderRadius: 18,
                marginBottom: 10,
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                border: `1.5px solid ${prop.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.06)'}`,
                overflow: 'hidden',
                animationDelay: `${0.1 * i}s`,
              }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: prop.status === 'active'
                        ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                        : 'linear-gradient(135deg, #94A3B8, #64748B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      🏠
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1F2E' }}>
                          {prop.type} · {prop.city}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                          borderRadius: 20,
                          background: prop.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                          color: prop.status === 'active' ? '#16A34A' : '#64748B',
                        }}>
                          {prop.status === 'active' ? `● ${t('billing.active')}` : `○ ${t('billing.draft')}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9BA8C0', marginTop: 2 }}>
                        €{prop.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: '#9BA8C0', fontWeight: 600 }}>
                        {prop.agencies > 0 ? `Wave 1 · ${prop.agencies} ${t('distribution.agencies').toLowerCase()}` : t('wizard.publish')}
                      </span>
                      {prop.leads > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>
                          🔥 {prop.leads} {t('dash.new_leads')}
                        </span>
                      )}
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${prop.progress}%`,
                        background: prop.progress === 100
                          ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                          : 'linear-gradient(90deg, #F5C200, #FF8C00)',
                        transition: 'width 1s ease',
                      }}/>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {prop.status === 'active' ? (
                      <>
                        <Link href="/leads" style={{ textDecoration: 'none', flex: 1 }}>
                          <button className="action-btn" style={{
                            width: '100%', padding: '9px',
                            background: '#FFF7ED', border: '1px solid rgba(234,88,12,0.2)',
                            borderRadius: 10, color: '#EA580C', fontWeight: 700, fontSize: '0.78rem',
                          }}>🔥 {prop.leads} {t('leads.title')}</button>
                        </Link>
                        <Link href="/distribution" style={{ textDecoration: 'none', flex: 1 }}>
                          <button className="action-btn" style={{
                            width: '100%', padding: '9px',
                            background: '#EEF2FF', border: '1px solid rgba(59,91,219,0.15)',
                            borderRadius: 10, color: '#3B5BDB', fontWeight: 700, fontSize: '0.78rem',
                          }}>📡 {t('dash.distribution')}</button>
                        </Link>
                      </>
                    ) : (
                      <Link href="/properties/new" style={{ textDecoration: 'none', flex: 1 }}>
                        <button className="glow-card action-btn" style={{
                          width: '100%', padding: '10px',
                          background: 'linear-gradient(135deg, #F5C200, #FF8C00)',
                          border: 'none', borderRadius: 10,
                          color: '#1A1A2E', fontWeight: 800, fontSize: '0.82rem',
                        }}>🚀 {t('wizard.publish')}</button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add property */}
            <Link href="/properties/new" style={{ textDecoration: 'none' }}>
              <div className="action-btn" style={{
                padding: '16px',
                background: 'rgba(59,91,219,0.04)',
                border: '2px dashed rgba(59,91,219,0.2)',
                borderRadius: 18,
                textAlign: 'center',
                color: '#3B5BDB',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}>
                ＋ {t('dash.add_property')}
              </div>
            </Link>
          </div>

          {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
          <div style={{ marginTop: 20 }} className="slide-up">
            <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1F2E', letterSpacing: '-0.02em', marginBottom: 12 }}>
              {t('dash.quick_actions')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { emoji:'🔥', label:t('leads.title'), sub:t('leads.new'), href:'/leads', grad:'linear-gradient(135deg,#FFF7ED,#FFF3E8)', border:'rgba(234,88,12,0.15)', color:'#EA580C' },
                { emoji:'💬', label:t('messenger.title'), sub:t('dash.messenger_desc'), href:'/messenger', grad:'linear-gradient(135deg,#F3E8FF,#EDE9FE)', border:'rgba(124,58,237,0.15)', color:'#7C3AED', badge: unread },
                { emoji:'📡', label:t('distribution.title'), sub:t('dash.distribution_desc'), href:'/distribution', grad:'linear-gradient(135deg,#EEF2FF,#E8ECFF)', border:'rgba(59,91,219,0.15)', color:'#3B5BDB' },
                { emoji:'💳', label:t('billing.title'), sub:t('billing.subtitle'), href:'/billing', grad:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border:'rgba(22,163,74,0.15)', color:'#16A34A' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                  <div className="action-btn" style={{
                    background: a.grad, border: `1.5px solid ${a.border}`,
                    borderRadius: 16, padding: '16px 14px',
                    position: 'relative',
                  }}>
                    {a.badge ? (
                      <div className="badge-live" style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#EF4444', color: '#fff',
                        fontSize: '0.65rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{a.badge}</div>
                    ) : null}
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{a.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: a.color, marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9BA8C0', fontWeight: 500 }}>{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── PROGRESS INSIGHT ──────────────────────────────────── */}
          <div className="slide-up" style={{
            marginTop: 20,
            background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
            borderRadius: 20,
            padding: '20px',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('dash.agency_reach')}</span>
            </div>
            {[
              { label: t('dash.agency_reach'), val: 10, max: 30, color: '#F5C200' },
              { label: t('dash.lead_conversion'), val: 3, max: 10, color: '#22C55E' },
              { label: t('dash.profile_complete'), val: 70, max: 100, color: '#3B5BDB', pct: true },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>
                    {s.pct ? `${s.val}%` : `${s.val}/${s.max}`}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${(s.val / s.max) * 100}%`,
                    background: s.color,
                    transition: 'width 1.5s ease',
                  }}/>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
