'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProperty } from '@/store/property';
import { DEMO_MODE } from '@/store/auth';
import { Property, PropertyStatus } from '@/lib/types';

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PROPERTIES: Partial<Property>[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user-001',
    property_type: 'villa' as any,
    address: 'Jadranska bb 14',
    city: 'Budva',
    country: 'Montenegro',
    asking_price: 485000,
    currency: 'EUR',
    status: 'in_distribution' as PropertyStatus,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-04-01T12:00:00Z',
    area_sqm: 210,
    bedrooms: 4,
    bathrooms: 3,
    description: 'Luxury sea-view villa with pool',
  },
  {
    id: 'demo-2',
    user_id: 'demo-user-001',
    property_type: 'apartment' as any,
    address: 'Knez Mihailova 28',
    city: 'Belgrade',
    country: 'Serbia',
    asking_price: 127000,
    currency: 'EUR',
    status: 'active' as PropertyStatus,
    created_at: '2026-03-18T09:00:00Z',
    updated_at: '2026-04-05T14:00:00Z',
    area_sqm: 68,
    bedrooms: 2,
    bathrooms: 1,
    description: 'City centre apartment, recently renovated',
  },
  {
    id: 'demo-3',
    user_id: 'demo-user-001',
    property_type: 'land' as any,
    address: 'Zlatibor Highway, plot 44',
    city: 'Zlatibor',
    country: 'Serbia',
    asking_price: 68000,
    currency: 'EUR',
    status: 'awaiting_approval' as PropertyStatus,
    created_at: '2026-04-02T11:00:00Z',
    updated_at: '2026-04-07T09:00:00Z',
    area_sqm: 1800,
    bedrooms: 0,
    bathrooms: 0,
    description: 'Mountain building plot with planning permission',
  },
];

// per-property mock stats
const DEMO_STATS: Record<string, { views: number; leads: number; agencies: number; days: number }> = {
  'demo-1': { views: 1248, leads: 7, agencies: 18, days: 38 },
  'demo-2': { views: 431,  leads: 3, agencies: 12, days: 21 },
  'demo-3': { views: 84,   leads: 0, agencies: 0,  days: 6  },
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:                  { label: 'Draft',           color: 'rgba(255,255,255,0.4)',  bg: 'rgba(255,255,255,0.07)' },
  onboarding:             { label: 'Onboarding',      color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)'  },
  awaiting_review:        { label: 'Awaiting Review', color: '#fbbf24',               bg: 'rgba(251,191,36,0.12)'  },
  reviewing:              { label: 'Reviewing',       color: '#fbbf24',               bg: 'rgba(251,191,36,0.12)'  },
  approved:               { label: 'Approved',        color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  packaging:              { label: 'AI Packaging',    color: '#a78bfa',               bg: 'rgba(167,139,250,0.12)' },
  matching:               { label: 'Matching',        color: '#a78bfa',               bg: 'rgba(167,139,250,0.12)' },
  pending_verification:   { label: 'Pending Review',  color: '#fbbf24',               bg: 'rgba(251,191,36,0.12)'  },
  ready_for_payment:      { label: 'Ready to Activate',color: '#60a5fa',              bg: 'rgba(96,165,250,0.12)'  },
  offer_preparation:      { label: 'Preparing Offer', color: '#a78bfa',               bg: 'rgba(167,139,250,0.12)' },
  awaiting_approval:      { label: 'Approve Offer',   color: '#e67e22',               bg: 'rgba(230,126,34,0.15)'  },
  active:                 { label: 'Active',          color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  in_distribution:        { label: 'Distributing',    color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  ready_for_distribution: { label: 'Ready',           color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)'  },
  distributing:           { label: 'Distributing',    color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  distributed:            { label: 'Distributed',     color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  paused:                 { label: 'Paused',          color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' },
  completed:              { label: 'Completed',       color: '#4ade80',               bg: 'rgba(74,222,128,0.12)'  },
  sold:                   { label: 'Sold ✓',          color: '#4ade80',               bg: 'rgba(74,222,128,0.18)'  },
  archived:               { label: 'Archived',        color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' },
};

const TYPE_ICONS: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏡', commercial: '🏪',
  land: '🌿', penthouse: '🌆', office: '🏛️', hotel: '🏨',
};
const TYPE_LABEL: Record<string, string> = {
  apartment: 'Apartment', house: 'House', villa: 'Villa', commercial: 'Commercial',
  land: 'Land', penthouse: 'Penthouse', office: 'Office', hotel: 'Hotel',
};

function fmt(n: number, cur = 'EUR') {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PropertiesPage() {
  const store = useProperty();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');

  useEffect(() => {
    if (!DEMO_MODE) store.fetchProperties();
  }, []);

  const rawList: Partial<Property>[] = DEMO_MODE ? DEMO_PROPERTIES : store.properties;
  const isLoading = DEMO_MODE ? false : store.isLoading;

  const filtered = rawList
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.address?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.country?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return (b.asking_price ?? 0) - (a.asking_price ?? 0);
      if (sortBy === 'status') return (a.status ?? '').localeCompare(b.status ?? '');
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });

  const totalLeads = rawList.reduce((sum, p) => sum + (DEMO_MODE ? (DEMO_STATS[p.id ?? '']?.leads ?? 0) : 0), 0);
  const totalViews = rawList.reduce((sum, p) => sum + (DEMO_MODE ? (DEMO_STATS[p.id ?? '']?.views ?? 0) : 0), 0);
  const activeCount = rawList.filter(p => ['active', 'in_distribution', 'distributing', 'distributed'].includes(p.status ?? '')).length;

  return (
    <div style={{ padding: 'clamp(16px,4vw,32px)', minHeight: '100vh', background: '#080809', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
            My Properties
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
            {rawList.length} {rawList.length === 1 ? 'property' : 'properties'} · {activeCount} active
          </p>
        </div>
        <Link href="/properties/new" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
          borderRadius: 10, background: 'linear-gradient(135deg,#c0392b,#e67e22)',
          color: 'white', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none',
          boxShadow: '0 2px 12px rgba(192,57,43,0.3)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          Add Property
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Properties', value: rawList.length, icon: '🏠', color: '#c0392b' },
          { label: 'Active Campaigns', value: activeCount, icon: '📡', color: '#4ade80' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁', color: '#60a5fa' },
          { label: 'Leads Received', value: totalLeads, icon: '🎯', color: '#e67e22' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: kpi.color, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 16,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const,
      }}>
        <div style={{ flex: 1, minWidth: 'min(200px,100%)', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by address, city, country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, color: 'white', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' as const,
            }}
          />
        </div>
        {[
          { value: statusFilter, onChange: setStatusFilter, options: [
            { v: 'all', l: 'All Statuses' },
            { v: 'active', l: 'Active' },
            { v: 'in_distribution', l: 'Distributing' },
            { v: 'awaiting_approval', l: 'Approve Offer' },
            { v: 'draft', l: 'Draft' },
            { v: 'sold', l: 'Sold' },
          ]},
          { value: sortBy, onChange: (v: string) => setSortBy(v as 'date'|'price'|'status'), options: [
            { v: 'date', l: 'Newest first' },
            { v: 'price', l: 'Price: high to low' },
            { v: 'status', l: 'By status' },
          ]},
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
            style={{
              padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8,
              color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', outline: 'none',
            }}>
            {sel.options.map(o => <option key={o.v} value={o.v} style={{ background: '#111' }}>{o.l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏠</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: 6 }}>
              {search || statusFilter !== 'all' ? 'No matching properties' : 'No properties yet'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first property to start the AI matching process.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/properties/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px',
                borderRadius: 10, background: 'linear-gradient(135deg,#c0392b,#e67e22)',
                color: 'white', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none',
              }}>Add Property</Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Property', 'Type', 'Price', 'Status', 'Views', 'Leads', 'Agencies', 'Added', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left' as const,
                      fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase' as const, letterSpacing: '0.06em', whiteSpace: 'nowrap' as const,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const s = STATUS_CONFIG[p.status ?? ''] ?? { label: p.status ?? '', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' };
                  const stats = DEMO_STATS[p.id ?? ''];
                  return (
                    <tr key={p.id} style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: 'white', fontSize: '0.875rem' }}>{p.address || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                          {[p.city, p.country].filter(Boolean).join(', ')}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>
                          {TYPE_ICONS[p.property_type ?? ''] ?? '🏠'} {TYPE_LABEL[p.property_type ?? ''] ?? p.property_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                          {fmt(p.asking_price ?? 0, p.currency)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 9px', borderRadius: 6,
                          fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.02em',
                          color: s.color, background: s.bg,
                        }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                        {stats ? stats.views.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: stats && stats.leads > 0 ? '#e67e22' : 'rgba(255,255,255,0.4)', fontWeight: stats && stats.leads > 0 ? 700 : 400, fontSize: '0.875rem' }}>
                          {stats ? stats.leads : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                        {stats ? stats.agencies : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', whiteSpace: 'nowrap' as const }}>
                        {p.created_at ? fmtDate(p.created_at) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/properties/${p.id ?? 'unknown'}`} style={{
                          display: 'inline-block', padding: '5px 12px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 7, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem',
                          fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' as const,
                        }}>View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
