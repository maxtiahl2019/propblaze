'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

const C = {
  bg:        '#F4F6FA',
  surface:   '#FFFFFF',
  surface2:  '#EEF1F7',
  border:    '#DDE2EE',
  borderStr: '#C4CBDB',
  text:      '#1A1F2E',
  textMd:    '#6B7A99',
  textSm:    '#9BA8C0',
  orange:    '#F97316',
  orangeHov: '#EA580C',
  orangeGlow:'rgba(249,115,22,0.12)',
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
        background: 'linear-gradient(90deg, #EA580C 0%, #F97316 60%, #FB923C 100%)',
        color: 'white', padding: '7px 24px', textAlign: 'center',
        fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em'
      }}>
        🚀 DEMO MODE — experience the full AI distribution flow below
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 30, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(244,246,250,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" width="26" height="26">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EA580C"/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#lg1)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.3"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: C.text }}>PropBlaze</span>
          </Link>

          <div style={{ display: 'flex', gap: '32px', fontSize: '13.5px' }}>
            {[['#how-it-works','How it works'],['#pricing','Pricing'],['#agencies','For Agencies']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: C.textMd, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textMd)}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 500,
              color: C.textMd, textDecoration: 'none', borderRadius: '7px',
              border: `1px solid ${C.border}`, background: C.surface,
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMd; }}>
              Sign in
            </Link>
            <Link href="/demo" style={{
              padding: '8px 20px', fontSize: '13px', fontWeight: 600,
              background: C.orange, color: 'white', borderRadius: '7px',
              textDecoration: 'none', boxShadow: '0 2px 12px rgba(249,115,22,0.2)',
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
      <section style={{ paddingTop: '160px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}/>
        <div style={{
          position: 'absolute', bottom: '0', left: '0',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>

        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 32px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center',
          position: 'relative', zIndex: 1
        }}>
          <div>
            {/* Pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '99px',
              background: '#FFF3E8', border: '1px solid #FDD0A8',
              color: '#C2410C', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.03em', marginBottom: '28px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.orange, display: 'inline-block' }}/>
              AI-Powered Property Distribution
            </div>

            <h1 style={{
              fontSize: '50px', fontWeight: 800, letterSpacing: '-0.04em',
              lineHeight: 1.08, marginBottom: '22px', color: C.text
            }}>
              Sell smarter.<br/>
              <span style={{ color: C.orange }}>Close faster.</span>
            </h1>
            <p style={{
              fontSize: '17px', color: C.textMd, lineHeight: 1.65,
              marginBottom: '36px', maxWidth: '440px'
            }}>
              AI-powered distribution to verified agencies across 31 EU markets. Matched offers within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link href="/demo" style={{
                padding: '13px 28px', background: C.orange, color: 'white',
                borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
                boxShadow: '0 4px 20px rgba(249,115,22,0.22)', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.orangeHov; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.orange; }}>
                Try live demo →
              </Link>
              <a href="#how-it-works" style={{
                padding: '13px 24px',
                border: `1px solid ${C.border}`,
                borderRadius: '8px', textDecoration: 'none', fontWeight: 500,
                fontSize: '14px', color: C.textMd, background: C.surface,
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStr; (e.currentTarget as HTMLElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMd; }}>
                How it works
              </a>
            </div>

            {/* Social proof */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginTop: '32px', paddingTop: '28px', borderTop: `1px solid ${C.border}`
            }}>
              <div style={{ display: 'flex' }}>
                {['🇩🇪','🇷🇸','🇭🇷','🇸🇰'].map((f,i) => (
                  <div key={i} style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: C.surface2, border: `2px solid ${C.bg}`,
                    marginLeft: i === 0 ? 0 : -8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                  }}>{f}</div>
                ))}
              </div>
              <div style={{ fontSize: '13px', color: C.textMd }}>
                <strong style={{ color: C.text }}>847+</strong> verified agencies in 31 EU markets
              </div>
            </div>
          </div>

          {/* Hero card — live agency matching preview */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: '16px', padding: '24px',
            boxShadow: '0 8px 32px rgba(30,40,80,0.1), 0 0 0 1px rgba(30,40,80,0.04)'
          }}>
            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}`
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>Apartment · Belgrade</div>
                <div style={{ fontSize: '12px', color: C.textMd, marginTop: '2px' }}>€285,000 · 78m² · 3 bed</div>
              </div>
              <div style={{
                background: '#ECFDF5', border: '1px solid #A7F0C4', color: '#16A34A',
                padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600
              }}>
                ✓ AI matched
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: C.textMd, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Top matched agencies
            </div>

            {DEMO_AGENCIES.map((ag, i) => (
              <div key={ag.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '9px', marginBottom: '8px',
                background: i === 0 ? '#FFF3E8' : C.bg,
                border: `1px solid ${i === 0 ? '#FDD0A8' : C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '7px',
                    background: i === 0 ? '#FEE4C4' : C.surface2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px'
                  }}>{ag.flag}</div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: C.text }}>{ag.name}</div>
                    <div style={{ fontSize: '11px', color: C.textMd }}>{ag.city}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: i === 0 ? C.orange : C.textMd
                  }}>{ag.score}/100</div>
                  <div style={{ fontSize: '10px', color: C.textSm }}>match score</div>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '12px', color: C.textMd }}>Wave 1 sending now</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: i === 0 ? '20px' : '6px', height: '6px', borderRadius: '99px',
                    background: i === 0 ? C.orange : C.border,
                    transition: 'width 0.3s'
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: '36px 32px'
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
              <div style={{ fontSize: '12px', color: C.textMd, marginTop: '5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '10px'
            }}>Simple Process</div>
            <h2 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { num: '01', icon: '📋', title: 'Upload Property', desc: 'Share property details — location, price, features. Takes under 5 minutes.' },
              { num: '02', icon: '🤖', title: 'AI Analyzes & Matches', desc: 'Our engine scores 800+ agencies and selects the top 10–30 best fits for your property.' },
              { num: '03', icon: '📬', title: 'Offers Flow In', desc: 'Matched agencies receive your listing and pitch back within 24 hours on average.' }
            ].map((step, i) => (
              <div key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: '14px', padding: '28px',
                boxShadow: '0 2px 8px rgba(30,40,80,0.05)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(30,40,80,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(30,40,80,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
                  background: '#FFF3E8', border: '1px solid #FDD0A8',
                  color: '#C2410C', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.06em', marginBottom: '16px'
                }}>STEP {step.num}</div>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: C.textMd, fontSize: '13.5px', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Matching */}
      <section id="agencies" style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: '96px 32px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '10px'
            }}>AI Matching Engine</div>
            <h2 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '12px', color: C.text }}>
              Smart Agency Matching
            </h2>
            <p style={{ color: C.textMd, fontSize: '15px' }}>
              Every agency is scored on 12+ parameters before receiving your listing
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {DEMO_AGENCIES.map((agency, i) => (
              <div key={agency.id} style={{
                background: C.bg,
                border: `1px solid ${i === 0 ? '#FDD0A8' : C.border}`,
                borderRadius: '14px', padding: '24px',
                boxShadow: i === 0 ? '0 4px 20px rgba(249,115,22,0.08)' : '0 2px 6px rgba(30,40,80,0.04)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(30,40,80,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = i === 0 ? '0 4px 20px rgba(249,115,22,0.08)' : '0 2px 6px rgba(30,40,80,0.04)'; }}>
                {i === 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: '#FFF3E8', border: '1px solid #FDD0A8',
                    color: '#C2410C', padding: '3px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 600, marginBottom: '14px'
                  }}>⭐ Top Match</div>
                )}
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '3px', color: C.text }}>
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
                  height: '4px', background: C.border, borderRadius: '99px',
                  marginBottom: '14px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', width: `${agency.score}%`,
                    background: i === 0 ? C.orange : C.borderStr, borderRadius: '99px'
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
      <section id="pricing" style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.orange, marginBottom: '10px'
            }}>Pricing</div>
            <h2 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: C.textMd, fontSize: '15px' }}>No setup fees. No hidden costs. Cancel anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for single properties', features: ['1 active property', 'Email distribution', 'Basic analytics', 'Community support'] },
              { name: 'Professional', price: '€29', period: '/mo', desc: 'For active sellers & investors', features: ['Unlimited properties', 'WhatsApp + Email + Telegram', 'AI matching engine', 'Priority support', 'Advanced analytics'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For agencies & platforms', features: ['White-label solution', 'Dedicated success manager', 'Custom integrations', 'SLA guarantee', 'API access'] }
            ].map((plan, i) => (
              <div key={i} style={{
                background: C.surface,
                border: i === 1 ? `2px solid ${C.orange}` : `1px solid ${C.border}`,
                borderRadius: '16px', padding: '28px 24px',
                boxShadow: i === 1 ? '0 8px 28px rgba(249,115,22,0.1)' : '0 2px 8px rgba(30,40,80,0.05)',
                transform: i === 1 ? 'scale(1.03)' : 'none',
                position: 'relative', transition: 'all 0.3s'
              }}>
                {i === 1 && (
                  <div style={{
                    position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                    background: C.orange, color: 'white', padding: '4px 16px',
                    borderRadius: '99px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>Most Popular</div>
                )}
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: C.orange, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: '14px', color: C.textMd }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: '13px', color: C.textMd, marginBottom: '20px' }}>{plan.desc}</p>
                <button style={{
                  width: '100%', padding: '11px',
                  background: i === 1 ? C.orange : 'transparent',
                  color: i === 1 ? 'white' : C.text,
                  border: i === 1 ? 'none' : `1px solid ${C.border}`,
                  borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', marginBottom: '20px',
                  boxShadow: i === 1 ? '0 3px 12px rgba(249,115,22,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}>Get started</button>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      fontSize: '13px', color: C.textMd, marginBottom: '9px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ color: '#16A34A', fontWeight: 600, flexShrink: 0 }}>✓</span>
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
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: '96px 32px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em',
            marginBottom: '18px', color: C.text
          }}>
            Ready to sell <span style={{ color: C.orange }}>faster</span>?
          </h2>
          <p style={{ fontSize: '16px', color: C.textMd, marginBottom: '32px' }}>
            Join 847+ sellers and agencies using PropBlaze across 31 EU markets.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/demo" style={{
              padding: '13px 28px', background: C.orange, color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              boxShadow: '0 4px 20px rgba(249,115,22,0.22)', transition: 'all 0.2s'
            }}>Try Demo Now</Link>
            <Link href="/login" style={{
              padding: '13px 24px', border: `1px solid ${C.border}`,
              background: C.bg,
              borderRadius: '8px', textDecoration: 'none', fontWeight: 500,
              fontSize: '14px', color: C.textMd, transition: 'all 0.2s'
            }}>Sign In</Link>
          </div>
          <p style={{ fontSize: '12px', color: C.textSm, marginTop: '20px' }}>
            No credit card required · Start free · Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: C.bg, borderTop: `1px solid ${C.border}`,
        padding: '36px 32px'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '12px', color: C.textSm
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" fill="#F97316"/>
            </svg>
            <span style={{ color: C.textMd, fontWeight: 500 }}>PropBlaze</span>
          </div>
          <div>© 2026 PropBlaze. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ color: C.textSm, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
