'use client';

import React, { useState } from 'react';

const D = {
  bg: '#10101E', surface: 'rgba(255,255,255,0.07)', surface2: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.10)', border2: 'rgba(255,255,255,0.22)',
  yellow: '#F5C200', green: '#22C55E', red: '#EF4444', blue: '#3B5BDB',
  white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.88)', w60: 'rgba(255,255,255,0.68)',
  w40: 'rgba(255,255,255,0.48)', w20: 'rgba(255,255,255,0.28)',
};

const PLANS = [
  { id: 'starter', name: 'Starter', price: 49, desc: '1 property · 10 agencies · Wave 1', color: D.w80, bg: D.surface },
  { id: 'pro', name: 'Pro', price: 99, desc: '3 properties · 30 agencies · 3 waves', color: D.yellow, bg: 'rgba(245,194,0,0.08)', badge: 'Popular', active: true },
  { id: 'premium', name: 'Premium', price: 249, desc: 'Unlimited · Priority placement · WhatsApp', color: '#93c5fd', bg: 'rgba(59,91,219,0.08)' },
];

const PROPERTIES = [
  { id: 'p1', emoji: '🏢', label: 'Apt · Belgrade', price: '€145,000', plan: 'Pro', status: 'active', nextBilling: 'May 10, 2026', amount: 99, agencies: 10, leads: 3 },
  { id: 'p2', emoji: '🏖️', label: 'Villa · Budva', price: '€485,000', plan: 'Starter', status: 'draft', nextBilling: '—', amount: 0, agencies: 0, leads: 0 },
];

const INVOICES = [
  { id: 'inv-003', date: 'Apr 10, 2026', amount: 99, plan: 'Pro', status: 'paid' },
  { id: 'inv-002', date: 'Mar 10, 2026', amount: 99, plan: 'Pro', status: 'paid' },
  { id: 'inv-001', date: 'Feb 10, 2026', amount: 49, plan: 'Starter', status: 'paid' },
];

export default function BillingPage() {
  const [markingSold, setMarkingSold] = useState<string | null>(null);
  const [soldDone, setSoldDone] = useState<string[]>([]);

  const handleMarkSold = (id: string) => {
    setMarkingSold(null);
    setSoldDone(prev => [...prev, id]);
  };

  const totalMonthly = PROPERTIES.filter(p => p.status === 'active' && !soldDone.includes(p.id)).reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>💳 Billing</h1>
          <p style={{ fontSize: '0.85rem', color: D.w40 }}>Subscription · per property · auto-stops on sold</p>
        </div>

        {/* Monthly total */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,194,0,0.1), rgba(255,140,0,0.06))', border: '1px solid rgba(245,194,0,0.25)', borderRadius: 18, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(245,194,0,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Monthly Total</div>
              <div style={{ fontSize: 'clamp(2rem,8vw,2.5rem)', fontWeight: 800, color: D.yellow, lineHeight: 1 }}>€{totalMonthly}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: D.w40, marginBottom: 4 }}>Next billing</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: D.w80 }}>May 10, 2026</div>
            </div>
          </div>
        </div>

        {/* Property subscriptions */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Active Subscriptions</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {PROPERTIES.map(prop => {
            const isSold = soldDone.includes(prop.id);
            return (
              <div key={prop.id} style={{ background: isSold ? 'rgba(255,255,255,0.03)' : D.surface, border: `1px solid ${isSold ? D.border : D.border2}`, borderLeft: `3px solid ${isSold ? 'rgba(255,255,255,0.15)' : D.green}`, borderRadius: 14, padding: '15px 16px', opacity: isSold ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{prop.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: D.white }}>{prop.label}</div>
                        <div style={{ fontSize: '0.75rem', color: D.w40 }}>{prop.price}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: isSold ? D.w40 : D.yellow }}>{prop.amount > 0 ? `€${prop.amount}/mo` : 'Free'}</div>
                        <div style={{ fontSize: '0.65rem', color: D.w40 }}>{prop.plan}</div>
                      </div>
                    </div>

                    {isSold ? (
                      <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.2)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: D.green }}>Marked as Sold — billing stopped</span>
                      </div>
                    ) : prop.status === 'active' ? (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <div style={{ flex: 1, fontSize: '0.72rem', color: D.w40 }}>
                          {prop.agencies} agencies · {prop.leads} leads · Next: {prop.nextBilling}
                        </div>
                        <button onClick={() => setMarkingSold(prop.id)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: D.red, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          🏷️ Mark Sold
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: D.w40, marginTop: 4 }}>Draft — not yet active</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plans */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Plans</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: plan.bg, border: `1px solid ${plan.active ? 'rgba(245,194,0,0.3)' : D.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: plan.color }}>{plan.name}</span>
                  {plan.badge && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#080810', background: D.yellow, padding: '2px 7px', borderRadius: 99 }}>{plan.badge}</span>}
                  {plan.active && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: D.green }}>● Current</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: D.w40 }}>{plan.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: plan.color }}>€{plan.price}</div>
                <div style={{ fontSize: '0.65rem', color: D.w40 }}>/month</div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice history */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Invoice History</div>
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {INVOICES.map((inv, i) => (
            <div key={inv.id} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < INVOICES.length - 1 ? `1px solid ${D.border}` : 'none' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: D.w80 }}>{inv.date}</div>
                <div style={{ fontSize: '0.7rem', color: D.w40 }}>{inv.plan} · {inv.id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: D.w80 }}>€{inv.amount}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: D.green, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '2px 8px', borderRadius: 99 }}>Paid</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mark as Sold bottom sheet */}
        {markingSold && (
          <>
            <div onClick={() => setMarkingSold(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0D0D1A', borderRadius: '24px 24px 0 0', border: `1px solid ${D.border2}`, padding: '24px 20px calc(24px + env(safe-area-inset-bottom,0px))', zIndex: 101 }}>
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, margin: '0 auto 20px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: D.white, marginBottom: 6 }}>🏷️ Mark as Sold</div>
              <p style={{ fontSize: '0.85rem', color: D.w60, lineHeight: 1.6, marginBottom: 20 }}>
                This will stop the subscription immediately. No further charges after today. Your listing data will be archived.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setMarkingSold(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: D.surface2, border: `1px solid ${D.border2}`, color: D.w80, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handleMarkSold(markingSold)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: D.red, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Confirm — Sold ✓
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
