'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Subscription } from '@/lib/types';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  created_at: string;
  invoice_url?: string;
}

interface BillingData {
  subscription: Subscription | null;
  payments: Payment[];
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    '1 active property listing',
    'Up to 10 agency matches',
    'Email distribution',
    'Basic analytics',
    'Standard support',
  ],
  professional: [
    '3 active property listings',
    'Up to 30 agency matches per listing',
    'Email + WhatsApp distribution',
    'Advanced analytics & charts',
    'Priority support',
    'AI Sales Pack in 3 languages',
  ],
  premium: [
    'Unlimited property listings',
    'Up to 30 agency matches per listing',
    'Email + WhatsApp + Telegram distribution',
    'Full analytics dashboard',
    'Dedicated account manager',
    'AI Sales Pack in 3 languages',
    'Custom distribution waves',
  ],
};

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  trialing: 'badge-blue',
  past_due: 'badge-red',
  canceled: 'badge-gray',
  incomplete: 'badge-amber',
};

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100); // Stripe amounts in cents
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData>({ subscription: null, payments: [] });
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subRes, paymentsRes] = await Promise.allSettled([
        api.get('/payments/subscription'),
        api.get('/payments/history'),
      ]);

      setData({
        subscription: subRes.status === 'fulfilled' ? subRes.value.data : null,
        payments: paymentsRes.status === 'fulfilled' ? paymentsRes.value.data.payments ?? [] : [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await api.post('/payments/portal');
      window.open(res.data.url, '_blank');
    } catch {
      alert('Failed to open billing portal. Please try again.');
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await api.post('/payments/cancel');
      await loadBillingData();
      setCancelModal(false);
    } catch {
      alert('Failed to cancel. Contact support.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p style={{ color: 'var(--text-secondary)' }}>Loading billing…</p>
      </div>
    );
  }

  const { subscription, payments } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Billing</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.875rem' }}>
            Manage your subscription and payment history
          </p>
        </div>
        {subscription && (
          <button className="btn btn-secondary" onClick={handlePortal}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M9 4L12 7L9 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Stripe Portal
          </button>
        )}
      </div>

      {!subscription ? (
        /* No subscription */
        <NoSubscriptionView />
      ) : (
        <>
          {/* Subscription Card */}
          <SubscriptionCard
            subscription={subscription}
            onCancel={() => setCancelModal(true)}
            onPortal={handlePortal}
          />

          {/* Plan Features */}
          <PlanFeaturesCard plan={subscription.plan_name} />

          {/* Usage */}
          <UsageCard subscription={subscription} />
        </>
      )}

      {/* Payment History */}
      <PaymentHistoryCard payments={payments} />

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Subscription</h3>
              <button onClick={() => setCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M8 6V8.5M8 10.5V11M1.5 13.5L8 2.5L14.5 13.5H1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Your subscription will remain active until the end of the current billing period.</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                After cancellation, all active distribution campaigns will be paused and your listings will become inactive.
                You can resubscribe at any time.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModal(false)}>Keep Subscription</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={canceling}>
                {canceling ? 'Canceling…' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function NoSubscriptionView() {
  const plans = [
    { id: 'starter', name: 'Starter', price: 49, period: 'mo', description: 'For individual property owners' },
    { id: 'professional', name: 'Professional', price: 129, period: 'mo', description: 'For multiple properties', recommended: true },
    { id: 'premium', name: 'Premium', price: 299, period: 'mo', description: 'For developers & portfolios' },
  ];

  return (
    <div>
      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
          <path d="M8 7V11M8 5.5V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>You don't have an active subscription. Choose a plan to start distributing your property.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="card"
            style={{
              border: plan.recommended ? '2px solid var(--blue)' : '1px solid var(--border)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {plan.recommended && (
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--blue)',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 99,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Recommended
              </div>
            )}
            <div className="card-body">
              <h3 style={{ marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{plan.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>€{plan.price}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>/{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem' }}>
                {(PLAN_FEATURES[plan.id] ?? []).map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/billing/checkout?plan=${plan.id}`}
                className={`btn ${plan.recommended ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionCard({ subscription, onCancel, onPortal }: {
  subscription: Subscription;
  onCancel: () => void;
  onPortal: () => void;
}) {
  const nextDate = subscription.current_period_end
    ? formatDate(subscription.current_period_end)
    : '—';

  return (
    <div className="card">
      <div className="card-header">
        <h3>Current Subscription</h3>
        <span className={`badge ${STATUS_BADGE[subscription.status] ?? 'badge-gray'}`}>
          {subscription.status}
        </span>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Plan</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{subscription.plan_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Amount</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>
              {formatCurrency(subscription.amount ?? 0, subscription.currency ?? 'EUR')}
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/{subscription.interval ?? 'mo'}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Next Billing</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>{nextDate}</div>
          </div>
          {subscription.cancel_at_period_end && (
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cancels On</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--red)' }}>{nextDate}</div>
            </div>
          )}
        </div>
      </div>
      <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {!subscription.cancel_at_period_end && (
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={onCancel}>
            Cancel Subscription
          </button>
        )}
        <Link href="/billing/checkout" className="btn btn-secondary btn-sm">
          Change Plan
        </Link>
      </div>
    </div>
  );
}

function PlanFeaturesCard({ plan }: { plan: string }) {
  const features = PLAN_FEATURES[plan?.toLowerCase()] ?? [];

  return (
    <div className="card">
      <div className="card-header">
        <h3>Included in your plan</h3>
        <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{plan}</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {features.map((f) => (
            <div key={f} style={{ display: 'flex', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M3 7.5L6.5 11L12 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageCard({ subscription }: { subscription: Subscription }) {
  // Mock usage — replace with real API data
  const usageItems = [
    { label: 'Active Listings', used: subscription.active_listings ?? 0, limit: subscription.listing_limit ?? 1 },
    { label: 'Agency Matches (this month)', used: subscription.matches_used ?? 0, limit: subscription.matches_limit ?? 10 },
    { label: 'Distributions Sent', used: subscription.distributions_sent ?? 0, limit: subscription.distributions_limit ?? 30 },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3>Usage this period</h3>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {usageItems.map(({ label, used, limit }) => {
            const pct = Math.min(Math.round((used / limit) * 100), 100);
            const barClass = pct >= 90 ? 'pbar-fill-red' : pct >= 70 ? 'pbar-fill-amber' : 'pbar-fill-green';
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text)' }}>{used}</strong> / {limit === 999999 ? '∞' : limit}
                  </span>
                </div>
                <div className="pbar">
                  <div className={`pbar-fill ${barClass}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentHistoryCard({ payments }: { payments: Payment[] }) {
  const STATUS_PAY_BADGE: Record<string, string> = {
    paid: 'badge-green',
    pending: 'badge-amber',
    failed: 'badge-red',
    refunded: 'badge-gray',
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Payment History</h3>
      </div>
      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <p className="empty-title">No payments yet</p>
          <p className="empty-desc">Your payment history will appear here after your first billing cycle.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {formatDate(payment.created_at)}
                  </td>
                  <td>{payment.description || 'Subscription charge'}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_PAY_BADGE[payment.status] ?? 'badge-gray'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    {payment.invoice_url ? (
                      <a
                        href={payment.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 10.5V1.5H7.5L10 4V10.5H2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                          <path d="M7 1.5V4.5H10" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                        </svg>
                        PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
