'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

interface Campaign {
  id: string; property_id: string; property_address: string; created_at: string;
  status: 'active' | 'completed' | 'paused';
  waves: { wave: 1 | 2 | 3; agencies_count: number; sent: number; responses: number; viewings: number; start_date: string }[];
  metrics: { total_sent: number; total_responses: number; response_rate: number; total_viewings: number };
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001', property_id: 'prop-001',
    property_address: 'Budva, Montenegro — €485,000 · Villa',
    created_at: '2 days ago', status: 'active',
    waves: [
      { wave: 1, agencies_count: 10, sent: 10, responses: 4, viewings: 2, start_date: 'Apr 8, Tue 10:00' },
      { wave: 2, agencies_count: 12, sent: 12, responses: 2, viewings: 1, start_date: 'Apr 10, Thu 14:00' },
      { wave: 3, agencies_count: 8, sent: 0, responses: 0, viewings: 0, start_date: 'Apr 13, Mon 09:00' },
    ],
    metrics: { total_sent: 22, total_responses: 6, response_rate: 27.3, total_viewings: 3 },
  },
  {
    id: 'camp-002', property_id: 'prop-002',
    property_address: 'Belgrade, Serbia — €127,000 · Apartment',
    created_at: '5 days ago', status: 'active',
    waves: [
      { wave: 1, agencies_count: 10, sent: 10, responses: 3, viewings: 1, start_date: 'Apr 5, Sat 10:00' },
      { wave: 2, agencies_count: 10, sent: 8, responses: 1, viewings: 0, start_date: 'Apr 7, Mon 14:00' },
      { wave: 3, agencies_count: 6, sent: 0, responses: 0, viewings: 0, start_date: 'Apr 12, Sun 09:00' },
    ],
    metrics: { total_sent: 18, total_responses: 4, response_rate: 22.2, total_viewings: 1 },
  },
];

const WAVE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: C.green, bg: C.greenBg },
  2: { color: C.blue,  bg: C.blueBg },
  3: { color: C.purple, bg: C.purpleBg },
};

export default function DistributionPage() {
  const { t } = useTranslation();
  const [campaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [expanded, setExpanded] = useState<string>(DEMO_CAMPAIGNS[0]?.id ?? '');

  const totalSent = campaigns.reduce((s, c) => s + c.metrics.total_sent, 0);
  const totalResponses = campaigns.reduce((s, c) => s + c.metrics.total_responses, 0);
  const avgRate = campaigns.length ? (campaigns.reduce((s, c) => s + c.metrics.response_rate, 0) / campaigns.length) : 0;
  const totalViewings = campaigns.reduce((s, c) => s + c.metrics.total_viewings, 0);

  return (
    <div style={{ padding: 'clamp(16px,4vw,32px)', minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Distribution</h1>
          <p style={{ fontSize: '0.8125rem', color: C.text3 }}>APEX AI campaign tracking · Wave-based outreach</p>
        </div>
        <Link href="/properties/new" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
          borderRadius: 10, background: C.green, color: C.white,
          fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none',
          boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          New Campaign
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length, color: C.green, bg: C.greenBg, icon: '📡' },
          { label: 'Total Sent', value: totalSent, color: C.blue, bg: C.blueBg, icon: '📤' },
          { label: 'Avg Response', value: `${avgRate.toFixed(1)}%`, color: C.orange, bg: C.orangeBg, icon: '📊' },
          { label: 'Viewings', value: totalViewings, color: C.purple, bg: C.purpleBg, icon: '👁' },
        ].map(k => (
          <div key={k.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: k.color, letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Campaigns */}
      {campaigns.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📡</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: C.text, marginBottom: 6 }}>No campaigns yet</p>
          <p style={{ fontSize: '0.8125rem', color: C.text3, marginBottom: 20 }}>Add a property to launch your first APEX distribution campaign.</p>
          <Link href="/properties/new" style={{ display: 'inline-flex', padding: '9px 20px', borderRadius: 10, background: C.green, color: C.white, fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
            List a Property
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {campaigns.map(campaign => {
            const isOpen = expanded === campaign.id;
            return (
              <div key={campaign.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Campaign header */}
                <div
                  onClick={() => setExpanded(isOpen ? '' : campaign.id)}
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.text }}>{campaign.property_address}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: C.greenBg, color: C.green }}>
                        ● Active
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: C.text3 }}>Started {campaign.created_at} · {campaign.metrics.total_sent} sent · {campaign.metrics.total_responses} responses</div>
                  </div>
                  <span style={{ color: C.text3, fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ⌃
                  </span>
                </div>

                {/* Summary metrics strip */}
                <div style={{ padding: '0 20px 16px', display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  {[
                    { label: 'Sent', value: campaign.metrics.total_sent, color: C.blue, bg: C.blueBg },
                    { label: 'Responses', value: campaign.metrics.total_responses, color: C.green, bg: C.greenBg },
                    { label: 'Rate', value: `${campaign.metrics.response_rate.toFixed(1)}%`, color: C.orange, bg: C.orangeBg },
                    { label: 'Viewings', value: campaign.metrics.total_viewings, color: C.purple, bg: C.purpleBg },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '8px 14px', borderRadius: 8, background: m.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: '0.65rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Waves (expandable) */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}` }}>
                    <div style={{ padding: '14px 20px 6px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Wave Breakdown
                    </div>
                    {campaign.waves.map(w => {
                      const wc = WAVE_COLORS[w.wave];
                      const isPending = w.sent === 0;
                      const hasReplies = w.responses > 0;
                      return (
                        <div key={w.wave} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          {/* Wave badge */}
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: wc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: wc.color }}>W{w.wave}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>Wave {w.wave}</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isPending ? C.text3 : hasReplies ? C.green : C.blue }}>
                                {isPending ? '⏳ Pending' : hasReplies ? `✓ ${w.responses} replied` : '⏱ Awaiting replies'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: C.text3, marginBottom: 6 }}>
                              {w.agencies_count} agencies · {w.sent} sent · {w.responses} responses · {w.viewings} viewings
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.68rem', color: C.text3 }}>🕐 {w.start_date}</span>
                              {w.sent > 0 && (
                                <Link href="/messenger" style={{ padding: '4px 12px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.text2, fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none' }}>
                                  View Replies →
                                </Link>
                              )}
                            </div>
                            {/* Progress bar */}
                            {w.sent > 0 && (
                              <div style={{ marginTop: 8, height: 4, background: C.bg, borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(w.responses / w.sent) * 100}%`, background: wc.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ padding: '12px 20px' }}>
                      <Link href="/messenger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: C.green, color: C.white, fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
                        💬 View all messages
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
