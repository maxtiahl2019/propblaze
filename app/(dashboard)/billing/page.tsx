'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/LangContext';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  red: '#DC2626', redBg: '#FEF2F2',
  purple: '#7C3AED', purpleBg: '#EDE9FE',
};

const PLANS = [
  { id: 'starter', name: 'Starter', price: 49, desc: '1 property · 10 agencies · Wave 1', color: C.text, active: false },
  { id: 'pro', name: 'Pro', price: 99, desc: '3 properties · 30 agencies · 3 waves', color: C.green, badge: 'Popular', active: true },
  { id: 'premium', name: 'Premium', price: 249, desc: 'Unlimited · Priority placement · WhatsApp', color: C.blue, active: false },
];

const PROPERTIES = [
  { id: 'p1', emoji: '🏢', label: 'Apt · Belgrade', price: '€145,000', plan: 'Pro', status: 'active', nextBilling: 'May 10, 2026', amount: 99, agencies: 10, leads: 3 },
  { id: 'p2', emoji: '🏡', label: 'Villa · Budva', price: '€485,000', plan: 'Pro', status: 'active', nextBilling: 'May 10, 2026', amount: 99, agencies: 18, leads: 7 },
  { id: 'p3', emoji: '🌿', label: 'Land · Zlatibor', price: '€68,000', plan: 'Starter', status: 'draft', nextBilling: '—', amount: 0, agencies: 0, leads: 0 },
];

const INVOICES = [
  { id: 'inv-003', date: 'Apr 10, 2026', amount: 198, plan: 'Pro ×2', status: 'paid' },
  { id: 'inv-002', date: 'Mar 10, 2026', amount: 198, plan: 'Pro ×2', status: 'paid' },
  { id: 'inv-001', date: 'Feb 10, 2026', amount: 49, plan: 'Starter', status: 'paid' },
];

export default function BillingPage() {
  const { t } = useTranslation();
  const [markingSold, setMarkingSold] = useState<string | null>(null);
  const [soldDone, setSoldDone] = useState<string[]>([]);

  const handleMarkSold = (id: string) => {
    setMarkingSold(null);
    setSoldDone(prev => [...prev, id]);
  };

  const totalMonthly = PROPERTIES.filter(p => p.status === 'active' && !soldDone.includes(p.id)).reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", padding: 'clamp(16px,4vw,32px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: C.text }}>Billing</h1>
          <p style={{ fontSize: '0.8125rem', color: C.text3 }}>Subscription per property · auto-stops on sold</p>
        </div>

        {/* Monthly total banner */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Monthly Total</div>
            <div style={{ fontSize: 'clamp(2rem,8vw,2.5rem)', fontWeight: 800, color: C.green, lineHeight: 1, letterSpacing: '-0.03em' }}>€{totalMonthly}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: C.text3, marginBottom: 4 }}>Next billing</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.text }}>May 10, 2026</div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Active Subscriptions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {PROPERTIES.map(prop => {
            const isSold = soldDone.includes(prop.id);
            const isActive = prop.status === 'active' && !isSold;
            return (
              <div key={prop.id} style={{
                background: C.white, border: `1px solid ${isSold ? C.border : isActive ? 'rgba(22,163,74,0.3)' : C.border}`,
                borderLeft: `3px solid ${isSold ? C.border : isActive ? C.green : C.text3}`,
                borderRadius: 12, padding: '15px 16px',
                opacity: isSold ? 0.6 : 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{prop.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{prop.label}</div>
                        <div style={{ fontSize: '0.75rem', color: C.text3 }}>{prop.price}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: isSold ? C.text3 : C.green }}>{prop.amount > 0 ? `€${prop.amount}/mo` : 'Free'}</div>
                        <div style={{ fontSize: '0.65rem', color: C.text3 }}>{prop.plan}</div>
                      </div>
                    </div>

                    {isSold ? (
                      <div style={{ padding: '6px 12px', borderRadius: 8, background: C.greenBg, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.green }}>Marked as Sold — billing stopped</span>
                      </div>
                    ) : prop.status === 'active' ? (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1, fontSize: '0.72rem', color: C.text3 }}>
                          {prop.agencies} agencies · {prop.leads} leads · Next: {prop.nextBilling}
                        </div>
                        <button onClick={() => setMarkingSold(prop.id)} style={{ padding: '6px 12px', borderRadius: 8, background: C.redBg, border: `1px solid rgba(220,38,38,0.2)`, color: C.red, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          🏷️ Mark Sold
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: C.text3, marginTop: 4 }}>Draft — not yet active</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plans */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Plans</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.active ? C.greenBg : C.white,
              border: `1px solid ${plan.active ? 'rgba(22,163,74,0.3)' : C.border}`,
              borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: plan.active ? '0 2px 8px rgba(22,163,74,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: plan.color }}>{plan.name}</span>
                  {plan.badge && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.white, background: C.green, padding: '2px 7px', borderRadius: 99 }}>{plan.badge}</span>}
                  {plan.active && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.green }}>● Current plan</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: C.text3 }}>{plan.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: plan.color }}>€{plan.price}</div>
                <div style={{ fontSize: '0.65rem', color: C.text3 }}>/month</div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Invoice History</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {INVOICES.map((inv, i) => (
            <div key={inv.id} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < INVOICES.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: C.text }}>{inv.date}</div>
                <div style={{ fontSize: '0.7rem', color: C.text3 }}>{inv.plan} · {inv.id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>€{inv.amount}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.green, background: C.greenBg, padding: '2px 8px', borderRadius: 99 }}>Paid</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mark as Sold modal */}
        {markingSold && (
          <>
            <div onClick={() => setMarkingSold(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderRadius: '20px 20px 0 0', border: `1px solid ${C.border}`, padding: '24px 20px calc(24px + env(safe-area-inset-bottom,0px))', zIndex: 101, boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}>
              <div style={{ width: 40, height: 4, background: C.border, borderRadius: 99, margin: '0 auto 20px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: 6 }}>🏷️ Mark as Sold</div>
              <p style={{ fontSize: '0.85rem', color: C.text2, lineHeight: 1.6, marginBottom: 20 }}>
                This will stop the subscription immediately. No further charges after today. Your listing data will be archived.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setMarkingSold(null)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, color: C.text2, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handleMarkSold(markingSold!)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: C.redBg, border: `1px solid rgba(220,38,38,0.3)`, color: C.red, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Confirm Sold ✓
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
