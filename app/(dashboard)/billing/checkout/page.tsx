'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

// Stripe.js loaded async
declare const Stripe: any;

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripe_price_id: string;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individual property owners',
    price: 4900,
    currency: 'EUR',
    interval: 'month',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? 'price_starter',
    features: ['1 active listing', '10 agency matches', 'Email distribution', 'Basic analytics'],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Most popular for active sellers',
    price: 12900,
    currency: 'EUR',
    interval: 'month',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL ?? 'price_professional',
    features: ['3 active listings', '30 agency matches', 'Email + WhatsApp', 'Advanced analytics', 'AI Pack in 3 languages'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For developers & portfolios',
    price: 29900,
    currency: 'EUR',
    interval: 'month',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM ?? 'price_premium',
    features: ['Unlimited listings', '30 agency matches/listing', 'All channels incl. Telegram', 'Dedicated account manager'],
  },
];

function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlan = searchParams.get('plan') ?? 'professional';

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [interval, setIntervalMode] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = PLANS.find((p) => p.id === selectedPlan) ?? PLANS[1];
  const effectivePrice = interval === 'year' ? Math.round(plan.price * 10) : plan.price; // 2 months free

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/payments/checkout', {
        plan_id: selectedPlan,
        interval,
        success_url: `${window.location.origin}/billing?success=1`,
        cancel_url: `${window.location.origin}/billing/checkout`,
      });

      const { checkout_url, session_id } = res.data;

      if (checkout_url) {
        // Stripe Checkout redirect
        window.location.href = checkout_url;
      } else if (session_id) {
        // Stripe.js redirect
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!stripeKey) throw new Error('Stripe key not configured');
        const stripe = await loadStripe(stripeKey);
        await stripe.redirectToCheckout({ sessionId: session_id });
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 900 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <button onClick={() => router.push('/billing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}>
            Billing
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>Choose Plan</span>
        </div>
        <h1>Choose your plan</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.875rem' }}>
          All plans include a 14-day free trial. No card required to start.
        </p>
      </div>

      {/* Billing Interval Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', color: interval === 'month' ? 'var(--text)' : 'var(--text-secondary)', fontWeight: interval === 'month' ? 600 : 400 }}>Monthly</span>
        <button
          onClick={() => setIntervalMode(interval === 'month' ? 'year' : 'month')}
          style={{
            width: 40,
            height: 22,
            borderRadius: 99,
            background: interval === 'year' ? 'var(--blue)' : 'var(--border)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background var(--transition)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: interval === 'year' ? 21 : 3,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'white',
              boxShadow: 'var(--shadow-sm)',
              transition: 'left var(--transition)',
            }}
          />
        </button>
        <span style={{ fontSize: '0.8125rem', color: interval === 'year' ? 'var(--text)' : 'var(--text-secondary)', fontWeight: interval === 'year' ? 600 : 400 }}>
          Annual
        </span>
        {interval === 'year' && (
          <span className="badge badge-green">Save 17%</span>
        )}
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {PLANS.map((p) => {
          const price = interval === 'year' ? Math.round(p.price * 10) : p.price;
          const isSelected = selectedPlan === p.id;
          const isRecommended = p.id === 'professional';

          return (
            <div
              key={p.id}
              className="card"
              onClick={() => setSelectedPlan(p.id)}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--blue)' : '1px solid var(--border)',
                background: isSelected ? 'var(--blue-light)' : 'var(--surface)',
                position: 'relative',
                overflow: 'visible',
                transition: 'all var(--transition)',
              }}
            >
              {isRecommended && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--blue)',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 99,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </div>
              )}
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3>{p.name}</h3>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--blue)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>{p.description}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {formatPrice(price, p.currency)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    /{interval === 'year' ? 'yr' : 'mo'}
                  </span>
                </div>

                {interval === 'year' && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--green)', marginBottom: '0.75rem', fontWeight: 500 }}>
                    = {formatPrice(Math.round(price / 12), p.currency)}/mo — 2 months free
                  </p>
                )}

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M2 6.5L5 9.5L11 3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA + Security */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {plan.name} — {formatPrice(effectivePrice, plan.currency)}/{interval === 'year' ? 'yr' : 'mo'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              14-day free trial · Cancel anytime · Auto-stops on property sold
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/billing')}>
              Back
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCheckout}
              disabled={loading}
              style={{ minWidth: 180 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5" strokeDasharray="20 15"/>
                  </svg>
                  Redirecting…
                </span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.25"/>
                    <path d="M1 6H13" stroke="white" strokeWidth="1.25"/>
                  </svg>
                  Start Free Trial
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="card-footer">
            <div className="alert alert-error" style={{ flex: 1 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M7 4.5V7M7 9.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Trust Signals */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
        {[
          { icon: '🔒', text: 'Secured by Stripe' },
          { icon: '🇪🇺', text: 'GDPR Compliant' },
          { icon: '🔄', text: 'Cancel anytime' },
          { icon: '🏠', text: 'Auto-stops when property sold' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Lazy-load Stripe.js
async function loadStripe(publishableKey: string) {
  if (typeof window === 'undefined') throw new Error('Not in browser');
  if (!(window as any).Stripe) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Stripe.js load failed'));
      document.head.appendChild(script);
    });
  }
  return (window as any).Stripe(publishableKey);
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="empty-state"><p style={{ color: 'var(--text-secondary)' }}>Loading…</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
