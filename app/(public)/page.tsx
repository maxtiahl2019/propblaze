'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

const C = {
  bg:        '#0C0F1A',
  surface:   '#131828',
  surface2:  '#1A1F31',
  border:    'rgba(255,255,255,0.08)',
  borderStr: 'rgba(255,255,255,0.14)',
  text:      '#E8EBF4',
  textMd:    '#8892AD',
  textSm:    '#525D78',
  orange:    '#F97316',
  orangeHov: '#FB8C36',
  orangeGlow:'rgba(249,115,22,0.15)',
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* Demo Banner */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'linear-gradient(90deg, #EA580C 0%, #F97316 50%, #FB923C 100%)',
        color: 'white', padding: '7px 24px', textAlign: 'center',
        fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em'
      }}>
        🚀 DEMO MODE ACTIVE — experience the full AI distribution flow below
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 30, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(12,15,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EA580C"/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#lg1)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.25"/>
            </svg>
            <div style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: C.text }}>PropBlaze</div>
          </Link>

          {/* Links */}
          <div style={{ display: 'flex', gap: '36px', fontSize: '13.5px' }}>
            {['#how-it-works', '#pricing', '#agencies'].map((href, i) => (
              <a key={i} href={href} style={{ color: C.textMd, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textMd)}>
                {['How it works', 'Pricing', 'For Agencies'][i]}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 500,
              color: C.textMd, textDecoration: 'none', borderRadius: '7px',
              border: `1px solid ${C.border}`, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMd; }}>
              Sign in
            </Link>
            <Link href="/demo" style={{
              padding: '8px 20px', fontSize: '13px', fontWeight: 600,
              background: C.orange, color: 'white', borderRadius: '7px',
              textDecoration: 'none', boxShadow: `0 0 20px ${C.orangeGlow}`,
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.orangeHov; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.orange; }}>
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: '160px', paddingBottom: '120px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>
        <div style={{
          position: 'absolute', top: '20%', left: '-5%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>

        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 32px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
          position: 'relative', zIndex: 1
        }}>
          <div>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px', borderRadius: '99px',
              border: `1px solid rgba(249,115,22,0.28)`,
              background: 'rgba(249,115,22,0.08)',
              color: '#FB923C', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.04em', marginBottom: '28px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F97316', display: 'block' }}/>
              AI-Powered Property Distribution
            </div>

            <h1 style={{
              fontSize: '52px', fontWeight: 800, letterSpacing: '-0.04em',
              lineHeight: 1.08, marginBottom: '24px', color: C.text
            }}>
              Sell smarter.<br/>
              <span style={{ color: C.orange }}>Close faster.</span>
            </h1>
            <p style={{
              fontSize: '17px', color: C.textMd, lineHeight: 1.65, marginBottom: '36px',
              maxWidth: '460px'
            }}>
              AI-powered property distribution to verified agencies across 31 EU markets. Get matched offers within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Link href="/demo" style={{
                padding: '13px 30px', background: C.orange, color: 'white',
                borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
                boxShadow: `0 4px 24px ${C.orangeGlow}`, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.orangeHov; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.orange; }}>
                Try live demo →
              </Link>
              <a href="#how-it-works" style={{
                padding: '13px 28px', border: `1px solid ${C.border}`,
                borderRadius: '8px', textDecoration: 'none', fontWeight: 500,
                fontSize: '14px', color: C.textMd, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; (e.currentTarget as HTMLElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMd; }}>
                See how it works
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{
            background: 'linear-gradient(135deg, #1A1F31 0%, #0F1220 100%)',
            border: `1px solid ${C.border}`,
            borderRadius: '16px', aspectRatio: '4/3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
          }}>
            {/* Glow inside card */}
            <div style={{
              position: 'absolute', top: '-30%', right: '-10%',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}/>

            {/* Mock UI inside hero card */}
            <div style={{ width: '85%', position: 'relative', zIndex: 1 }}>
              {/* Top bar */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '12px 16px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', color: C.textMd }}>🏠 Apartment · Belgrade · €285K</div>
                <div style={{
                  background: C.orange, color: 'white', padding: '3px 10px',
                  borderRadius: '4px', fontSize: '11px', fontWeight: 600
                }}>LIVE</div>
              </div>

              {/* Agency rows */}
              {DEMO_AGENCIES.map((ag, i) => (
                <div key={ag.id} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '10px 14px', marginBottom: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  opacity: 1 - i * 0.12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: `rgba(249,115,22,${0.2 - i * 0.05})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px'
                    }}>{ag.flag}</div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{ag.name}</div>
                      <div style={{ fontSize: '10px', color: C.textMd }}>{ag.city}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 700,
                      color: i === 0 ? '#34D399' : i === 1 ? C.orange : C.textMd
                    }}>
                      {ag.score}/100
                    </div>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: i < 2 ? '#34D399' : C.textSm
                    }}/>
                  </div>
                </div>
              ))}

              <div style={{
                textAlign: 'center', fontSize: '11px', color: C.textSm, marginTop: '10px'
              }}>
                ✨ AI matched 23 agencies · sending wave 1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        background: C.surface, padding: '40px 32px'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center'
        }}>
          {[
            { val: '847+', label: 'Verified Agencies' },
            { val: '31', label: 'EU Markets' },
            { val: '94%', label: 'Match Accuracy' },
            { val: '24h', label: 'First Response' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: C.orange, letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: C.textMd, marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 32px', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '12px'
            }}>Simple Process</div>
            <h2 style={{
              fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text
            }}>How It Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { num: '01', icon: '📋', title: 'Upload Property', desc: 'Share property details—location, price, features. Takes under 5 minutes.' },
              { num: '02', icon: '🤖', title: 'AI Analyzes & Matches', desc: 'Our engine scores 800+ agencies and selects the top 10–30 best fits.' },
              { num: '03', icon: '📬', title: 'Offers Flow In', desc: 'Matched agencies receive your listing and pitch back within 24 hours.' }
            ].map((step, i) => (
              <div key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: '14px', padding: '32px 28px',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, color: C.orange, letterSpacing: '0.08em',
                  marginBottom: '16px'
                }}>STEP {step.num}</div>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: C.textMd, fontSize: '13.5px', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Matching */}
      <section id="agencies" style={{
        padding: '100px 32px',
        background: C.surface,
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '12px'
            }}>AI Matching Engine</div>
            <h2 style={{
              fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '14px', color: C.text
            }}>Smart Agency Matching</h2>
            <p style={{ color: C.textMd, fontSize: '15px' }}>
              Every agency is scored on 12+ parameters before receiving your listing
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {DEMO_AGENCIES.map((agency, i) => (
              <div key={agency.id} style={{
                background: C.bg, border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : C.border}`,
                borderRadius: '14px', padding: '24px',
                boxShadow: i === 0 ? `0 0 30px rgba(249,115,22,0.08)` : 'none',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = i === 0 ? 'rgba(249,115,22,0.3)' : C.border; }}>
                {i === 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    color: '#FB923C', padding: '3px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 600, marginBottom: '14px'
                  }}>
                    ⭐ Top Match
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: C.text }}>
                      {agency.flag} {agency.name}
                    </div>
                    <div style={{ fontSize: '12px', color: C.textMd }}>{agency.city}, {agency.country}</div>
                  </div>
                  <div style={{
                    background: i === 0 ? C.orange : C.surface2,
                    color: i === 0 ? 'white' : C.textMd,
                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700
                  }}>
                    {agency.score}/100
                  </div>
                </div>

                {/* Score bar */}
                <div style={{
                  height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px',
                  marginBottom: '16px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', width: `${agency.score}%`,
                    background: i === 0 ? C.orange : 'rgba(255,255,255,0.2)', borderRadius: '99px',
                    transition: 'width 1s ease'
                  }}/>
                </div>

                <div style={{
                  fontSize: '12px', color: C.textMd, marginBottom: '14px',
                  paddingBottom: '14px', borderBottom: `1px solid ${C.border}`
                }}>
                  {agency.specialization}
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: C.textMd }}>
                  <div><span style={{ color: C.text, fontWeight: 600 }}>{agency.deals_30d}</span> deals/mo</div>
                  <div><span style={{ color: C.text, fontWeight: 600 }}>{agency.response_rate}%</span> response</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '12px'
            }}>Pricing</div>
            <h2 style={{
              fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '12px'
            }}>Simple, transparent pricing</h2>
            <p style={{ color: C.textMd, fontSize: '15px' }}>No setup fees. No hidden costs. Cancel anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for single properties', features: ['1 active property', 'Email distribution', 'Basic analytics', 'Community support'] },
              { name: 'Professional', price: '€29', period: '/mo', desc: 'For active sellers & investors', features: ['Unlimited properties', 'WhatsApp + Email', 'AI matching engine', 'Priority support', 'Advanced analytics'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For agencies & platforms', features: ['White-label solution', 'Dedicated success manager', 'Custom integrations', 'SLA guarantee', 'API access'] }
            ].map((plan, i) => (
              <div key={i} style={{
                background: i === 1 ? 'linear-gradient(145deg, #1A1F31 0%, #151A28 100%)' : C.surface,
                border: i === 1 ? `1px solid rgba(249,115,22,0.35)` : `1px solid ${C.border}`,
                borderRadius: '16px', padding: '32px 28px',
                position: 'relative',
                boxShadow: i === 1 ? `0 0 40px rgba(249,115,22,0.08)` : 'none',
                transform: i === 1 ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s'
              }}>
                {i === 1 && (
                  <div style={{
                    position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                    background: C.orange, color: 'white', padding: '4px 16px',
                    borderRadius: '99px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '34px', fontWeight: 800, color: C.orange, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: '14px', color: C.textMd }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: '13px', color: C.textMd, marginBottom: '24px' }}>{plan.desc}</p>
                <button style={{
                  width: '100%', padding: '12px',
                  background: i === 1 ? C.orange : 'transparent',
                  color: i === 1 ? 'white' : C.text,
                  border: i === 1 ? 'none' : `1px solid ${C.border}`,
                  borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', marginBottom: '24px',
                  boxShadow: i === 1 ? `0 4px 16px rgba(249,115,22,0.25)` : 'none',
                  transition: 'all 0.2s'
                }}>
                  Get started
                </button>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      fontSize: '13px', color: C.textMd, marginBottom: '10px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ color: '#34D399', fontSize: '13px', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.surface, borderTop: `1px solid ${C.border}`,
        padding: '100px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '40px', fontWeight: 700, letterSpacing: '-0.03em',
            marginBottom: '20px', color: C.text
          }}>
            Ready to sell <span style={{ color: C.orange }}>faster</span>?
          </h2>
          <p style={{ fontSize: '16px', color: C.textMd, marginBottom: '36px' }}>
            Join 847+ sellers and agencies using PropBlaze across 31 EU markets.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link href="/demo" style={{
              padding: '14px 32px', background: C.orange, color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              boxShadow: `0 4px 24px ${C.orangeGlow}`, transition: 'all 0.2s'
            }}>
              Try Demo Now
            </Link>
            <Link href="/login" style={{
              padding: '14px 28px', border: `1px solid ${C.border}`,
              borderRadius: '8px', textDecoration: 'none', fontWeight: 500,
              fontSize: '14px', color: C.textMd, transition: 'all 0.2s'
            }}>
              Sign In
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: C.textSm, marginTop: '24px' }}>
            No credit card required · Start free · Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: C.bg, borderTop: `1px solid ${C.border}`,
        padding: '40px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: '1280px', margin: '0 auto', fontSize: '12px', color: C.textSm
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" fill="#F97316"/>
          </svg>
          <span style={{ color: C.textMd, fontWeight: 500 }}>PropBlaze</span>
        </div>
        <div>© 2026 PropBlaze. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: C.textSm, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
