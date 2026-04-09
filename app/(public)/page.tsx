'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#FFFFFF', color: '#111827', minHeight: '100vh' }}>
      {/* Demo Mode Banner */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#F97316',
        color: 'white',
        padding: '8px 24px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em'
      }}>
        🚀 Demo mode active · Try the live experience below
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 32,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid #E5E7EB' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EA580C"/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#logo-grad)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.3"/>
            </svg>
            <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>PropBlaze</div>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', fontSize: '14px' }}>
            <a href="#how-it-works" style={{ color: '#6B7280', textDecoration: 'none', transition: 'color 0.2s' }}>How it works</a>
            <a href="#pricing" style={{ color: '#6B7280', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a>
            <a href="#agencies" style={{ color: '#6B7280', textDecoration: 'none', transition: 'color 0.2s' }}>For Agencies</a>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#6B7280',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}>
              Sign in
            </Link>
            <Link href="/demo" style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              background: '#F97316',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}>
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '180px',
        paddingBottom: '120px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center'
        }}>
          {/* Left: Text */}
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '24px'
            }}>
              Sell smarter.<br/>Close faster.
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#6B7280',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              AI-powered property distribution to verified agencies across 31 EU markets. Get matched offers in 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link href="/demo" style={{
                padding: '14px 32px',
                background: '#F97316',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}>
                Try live demo →
              </Link>
              <a href="#how-it-works" style={{
                padding: '14px 32px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                color: '#111827',
                transition: 'border 0.2s'
              }}>
                See how it works
              </a>
            </div>
          </div>

          {/* Right: Demo Video Placeholder */}
          <div style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            borderRadius: '12px',
            aspectRatio: '1 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'url(data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27none%27 stroke=%27white%27 stroke-width=%270.5%27 opacity=%270.1%27/%3E%3C/svg%3E)',
              opacity: 0.1
            }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
              <p>Property Distribution Engine</p>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Add your video here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '48px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F97316' }}>847+</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>Verified Agencies</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F97316' }}>31</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>EU Markets</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F97316' }}>94%</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>Match Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F97316' }}>24h</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>First Response</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        background: '#F9FAFB',
        padding: '96px 24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '64px',
            letterSpacing: '-0.02em'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px'
          }}>
            {[
              { num: '1', title: 'Upload Property', desc: 'Share your property details—location, price, features.' },
              { num: '2', title: 'AI Analyzes', desc: 'Our system matches to perfect agencies in seconds.' },
              { num: '3', title: 'Offers Flow In', desc: 'Agencies pitch back within 24 hours on average.' }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#F97316',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  margin: '0 auto 24px'
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Matching Preview */}
      <section id="agencies" style={{
        background: '#FFFFFF',
        padding: '96px 24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Smart Agency Matching
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '16px',
            marginBottom: '64px'
          }}>
            See how we match properties to the right agencies
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {DEMO_AGENCIES.map((agency) => (
              <div key={agency.id} style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {agency.flag} {agency.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {agency.city}, {agency.country}
                    </div>
                  </div>
                  <div style={{
                    background: '#F97316',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {agency.score}/100
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  {agency.specialization}
                </div>

                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  <div>
                    <strong style={{ color: '#111827' }}>{agency.deals_30d}</strong> deals in 30d
                  </div>
                  <div>
                    <strong style={{ color: '#111827' }}>{agency.response_rate}%</strong> response rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (Placeholder) */}
      <section id="pricing" style={{
        background: '#F9FAFB',
        padding: '96px 24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Simple Pricing
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '16px',
            marginBottom: '64px'
          }}>
            No setup fees. No long-term contracts.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for single properties', features: ['1 property', 'Email support', 'Basic analytics'] },
              { name: 'Professional', price: '$29', period: '/month', desc: 'For active sellers', features: ['Unlimited properties', 'Priority support', 'Advanced analytics', 'API access'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For agencies & platforms', features: ['White-label', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] }
            ].map((plan, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                border: i === 1 ? '2px solid #F97316' : '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                transform: i === 1 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s'
              }}>
                {i === 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#F97316',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: '#F97316' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: '14px', color: '#6B7280' }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>{plan.desc}</p>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: i === 1 ? '#F97316' : 'transparent',
                  color: i === 1 ? 'white' : '#111827',
                  border: i === 1 ? 'none' : '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '24px',
                  transition: 'all 0.2s'
                }}>
                  Get Started
                </button>
                <ul style={{ textAlign: 'left', fontSize: '13px', color: '#6B7280' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{
        background: '#FFFFFF',
        padding: '96px 24px',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Ready to sell faster?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px'
          }}>
            Join 847+ sellers and agencies using PropBlaze today.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/demo" style={{
              padding: '14px 32px',
              background: '#F97316',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}>
              Try Demo Now
            </Link>
            <Link href="/login" style={{
              padding: '14px 32px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              color: '#111827',
              transition: 'border 0.2s'
            }}>
              Sign In
            </Link>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '32px'
          }}>
            No credit card required. Start free and upgrade anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        padding: '48px 24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#9CA3AF'
      }}>
        <p>© 2026 PropBlaze. All rights reserved.</p>
      </footer>
    </div>
  );
}
