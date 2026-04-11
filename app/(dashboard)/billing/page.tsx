'use client';

import React, { useState } from 'react';

// ─── Same tokens as dashboard ─────────────────────────────────────────────
const T = {
  bg:      '#F7F6F3',
  white:   '#FFFFFF',
  border:  '#E8E5DF',
  border2: '#D4D0C8',
  text:    '#1A1A1A',
  text2:   '#6B6B6B',
  text3:   '#9E9E9E',
  green:   '#1A7A4A',
  greenBg: '#E8F5EE',
  red:     '#DC2626',
  redBg:   '#FEF2F2',
  redBdr:  'rgba(220,38,38,0.2)',
  gold:    '#B8860B',
  goldBg:  '#FDF8E1',
  blue:    '#1D4ED8',
  blueBg:  '#EFF6FF',
  spring:  'cubic-bezier(0.34,1.56,0.64,1)',
};

const PLANS = [
  { id:'starter', name:'Starter', price:49,  desc:'1 property · 10 agencies · Wave 1',              active:false },
  { id:'pro',     name:'Pro',     price:99,  desc:'3 properties · 30 agencies · 3 waves',  badge:'Popular', active:true  },
  { id:'premium', name:'Premium', price:249, desc:'Unlimited · Priority placement · WhatsApp',       active:false },
];

const PROPERTIES = [
  { id:'p1', emoji:'🏢', label:'Apt · Belgrade',   price:'€145,000', plan:'Pro',     status:'active', nextBilling:'May 10, 2026', amount:99,  agencies:10, leads:3 },
  { id:'p2', emoji:'🏡', label:'Villa · Budva',    price:'€485,000', plan:'Pro',     status:'active', nextBilling:'May 10, 2026', amount:99,  agencies:18, leads:7 },
  { id:'p3', emoji:'🌿', label:'Land · Zlatibor',  price:'€68,000',  plan:'Starter', status:'draft',  nextBilling:'—',            amount:0,   agencies:0,  leads:0 },
];

const INVOICES = [
  { id:'inv-003', date:'Apr 10, 2026', amount:198, plan:'Pro ×2',  status:'paid' },
  { id:'inv-002', date:'Mar 10, 2026', amount:198, plan:'Pro ×2',  status:'paid' },
  { id:'inv-001', date:'Feb 10, 2026', amount:49,  plan:'Starter', status:'paid' },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.white,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: `all 0.28s ${T.spring}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function BillingPage() {
  const [markingSold,  setMarkingSold]  = useState<string|null>(null);
  const [soldDone,     setSoldDone]     = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const handleMarkSold = (id: string) => { setMarkingSold(null); setSoldDone(p => [...p, id]); };

  const totalMonthly = PROPERTIES
    .filter(p => p.status === 'active' && !soldDone.includes(p.id))
    .reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <style>{`
        body { background:${T.bg}; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .plan-row { border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition:all 0.2s; cursor:pointer; border:1px solid transparent; }
        .plan-row:hover { background:${T.greenBg}; }
        .plan-row.active { background:${T.greenBg}; border-color:rgba(26,122,74,0.25); }
      `}</style>

      <div style={{ background: T.bg, minHeight: '100vh', padding: 'clamp(20px,4vw,36px)', fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: T.text, marginBottom: 6 }}>
              Billing
            </h1>
            <p style={{ fontSize: '0.84rem', color: T.text3 }}>
              Subscription per property · billing stops automatically when you mark a property as sold
            </p>
          </div>

          {/* ── Monthly total ───────────────────────────────────────────── */}
          <Card style={{ padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Monthly Total</div>
                <div style={{ fontSize: 'clamp(2.4rem,8vw,3rem)', fontWeight: 900, color: T.green, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  €{totalMonthly}
                </div>
                <div style={{ fontSize: '0.78rem', color: T.text3, marginTop: 6 }}>
                  {PROPERTIES.filter(p => p.status === 'active' && !soldDone.includes(p.id)).length} active subscriptions
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: T.text3, marginBottom: 6 }}>Next billing</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: T.text }}>May 10, 2026</div>
                <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: T.greenBg, border: '1px solid rgba(26,122,74,0.2)', borderRadius: 100, padding: '5px 12px' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: T.green }}>Pro plan</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Active subscriptions ────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Active Subscriptions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {PROPERTIES.map(prop => {
              const isSold   = soldDone.includes(prop.id);
              const isActive = prop.status === 'active' && !isSold;
              return (
                <Card key={prop.id} style={{ padding: '18px 20px', opacity: isSold ? 0.55 : 1, borderLeft: `4px solid ${isSold ? T.border : isActive ? T.green : T.border2}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {prop.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>{prop.label}</div>
                          <div style={{ fontSize: '0.76rem', color: T.text3, marginTop: 1 }}>{prop.price}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isSold ? T.text3 : prop.amount > 0 ? T.green : T.text3, letterSpacing: '-0.02em' }}>
                            {prop.amount > 0 ? `€${prop.amount}/mo` : 'Free'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: T.text3, marginTop: 2 }}>{prop.plan}</div>
                        </div>
                      </div>

                      {isSold ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.greenBg, borderRadius: 8, padding: '6px 12px' }}>
                          <span>✅</span>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: T.green }}>Sold — billing stopped</span>
                        </div>
                      ) : isActive ? (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                          <div style={{ flex: 1, fontSize: '0.74rem', color: T.text3 }}>
                            {prop.agencies} agencies · {prop.leads} leads · Next: {prop.nextBilling}
                          </div>
                          <button
                            onClick={() => setMarkingSold(prop.id)}
                            style={{ padding: '6px 13px', borderRadius: 9, background: T.redBg, border: `1px solid ${T.redBdr}`, color: T.red, fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget.style.background = '#fee2e2'); }}
                            onMouseLeave={e => { (e.currentTarget.style.background = T.redBg); }}
                          >
                            🏷️ Mark Sold
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: T.text3, marginTop: 4, fontStyle: 'italic' }}>Draft — not yet active</div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Plans ──────────────────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Plans</div>
          <Card style={{ overflow: 'hidden', marginBottom: 28 }}>
            {PLANS.map((plan, i) => (
              <div key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`plan-row${plan.active || selectedPlan === plan.id ? ' active' : ''}`}
                style={{ borderBottom: i < PLANS.length - 1 ? `1px solid ${T.border}` : 'none', borderRadius: 0 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>{plan.name}</span>
                    {plan.badge && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: T.white, background: T.green, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em' }}>
                        {plan.badge}
                      </span>
                    )}
                    {plan.active && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.green }}>● Current plan</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: T.text3 }}>{plan.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: plan.active ? T.green : T.text, letterSpacing: '-0.03em' }}>€{plan.price}</div>
                  <div style={{ fontSize: '0.65rem', color: T.text3 }}>/month</div>
                </div>
              </div>
            ))}
          </Card>

          {/* ── Invoice history ─────────────────────────────────────────── */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Invoice History</div>
          <Card style={{ overflow: 'hidden', marginBottom: 32 }}>
            {INVOICES.map((inv, i) => (
              <div key={inv.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < INVOICES.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.15s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget.style.background = T.bg); }}
                onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: T.text, marginBottom: 2 }}>{inv.date}</div>
                  <div style={{ fontSize: '0.72rem', color: T.text3 }}>{inv.plan} · {inv.id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>€{inv.amount}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: T.green, background: T.greenBg, padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(26,122,74,0.15)' }}>
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </Card>

          {/* ── Bottom CTA ──────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
            <p style={{ fontSize: '0.8rem', color: T.text3, marginBottom: 12 }}>
              Need help with billing? Contact support
            </p>
            <a href="mailto:contact@win-winsolution.com?subject=PropBlaze billing" style={{ fontSize: '0.8rem', fontWeight: 700, color: T.green, textDecoration: 'none', borderBottom: `1px solid rgba(26,122,74,0.3)`, paddingBottom: 2 }}>
              contact@win-winsolution.com
            </a>
          </div>
        </div>
      </div>

      {/* ── Mark as Sold modal ──────────────────────────────────────────── */}
      {markingSold && (
        <>
          <div onClick={() => setMarkingSold(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.white, borderRadius: '24px 24px 0 0', border: `1px solid ${T.border}`, padding: '28px 24px calc(28px + env(safe-area-inset-bottom,0px))', zIndex: 101, boxShadow: '0 -12px 48px rgba(0,0,0,0.12)', animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ width: 40, height: 4, background: T.border, borderRadius: 99, margin: '0 auto 24px' }} />
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: T.text, marginBottom: 8, letterSpacing: '-0.02em' }}>🏷️ Mark as Sold</div>
            <p style={{ fontSize: '0.875rem', color: T.text2, lineHeight: 1.65, marginBottom: 24 }}>
              This will stop the subscription immediately. No further charges after today. Your listing data will be archived.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setMarkingSold(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, color: T.text2, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleMarkSold(markingSold!)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: T.redBg, border: `1px solid ${T.redBdr}`, color: T.red, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                Confirm Sold ✓
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
