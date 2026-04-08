'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import clsx from 'clsx';

type PropertyStatus =
  | 'draft' | 'pending_verification' | 'ready_for_payment'
  | 'awaiting_approval' | 'active' | 'in_distribution'
  | 'paused' | 'sold' | 'archived';

interface AdminProperty {
  id: string;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price: number;
  currency: string;
  status: PropertyStatus;
  owner_name: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
  photos_count: number;
  docs_count: number;
  has_title_deed: boolean;
  campaigns_count: number;
  subscription_active: boolean;
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_PROPERTIES: AdminProperty[] = [
  { id: 'p1', title: '3-bed apartment, Vracar', city: 'Belgrade', country: 'Serbia', property_type: 'apartment', price: 210000, currency: 'EUR', status: 'pending_verification', owner_name: 'Ivan Petrov', owner_email: 'ivan@example.com', created_at: '2026-04-07T10:00:00Z', updated_at: '2026-04-07T11:00:00Z', photos_count: 12, docs_count: 2, has_title_deed: true, campaigns_count: 0, subscription_active: true },
  { id: 'p2', title: 'Villa with pool, Budva', city: 'Budva', country: 'Montenegro', property_type: 'villa', price: 580000, currency: 'EUR', status: 'pending_verification', owner_name: 'Maria Smirnova', owner_email: 'maria@example.com', created_at: '2026-04-06T09:00:00Z', updated_at: '2026-04-07T08:00:00Z', photos_count: 24, docs_count: 3, has_title_deed: true, campaigns_count: 0, subscription_active: true },
  { id: 'p3', title: 'Studio, Piraeus', city: 'Athens', country: 'Greece', property_type: 'apartment', price: 95000, currency: 'EUR', status: 'awaiting_approval', owner_name: 'Alex K.', owner_email: 'alex@example.com', created_at: '2026-04-05T14:00:00Z', updated_at: '2026-04-07T12:00:00Z', photos_count: 8, docs_count: 1, has_title_deed: false, campaigns_count: 0, subscription_active: true },
  { id: 'p4', title: 'House 250m², Limassol', city: 'Limassol', country: 'Cyprus', property_type: 'house', price: 420000, currency: 'EUR', status: 'active', owner_name: 'Olga V.', owner_email: 'olga@example.com', created_at: '2026-04-01T08:00:00Z', updated_at: '2026-04-06T10:00:00Z', photos_count: 18, docs_count: 4, has_title_deed: true, campaigns_count: 1, subscription_active: true },
  { id: 'p5', title: 'Sea-view apartment, Split', city: 'Split', country: 'Croatia', property_type: 'apartment', price: 175000, currency: 'EUR', status: 'in_distribution', owner_name: 'Dmitri L.', owner_email: 'dmitri@example.com', created_at: '2026-03-28T11:00:00Z', updated_at: '2026-04-04T09:00:00Z', photos_count: 20, docs_count: 3, has_title_deed: true, campaigns_count: 1, subscription_active: true },
  { id: 'p6', title: 'Penthouse, Sofia', city: 'Sofia', country: 'Bulgaria', property_type: 'apartment', price: 310000, currency: 'EUR', status: 'ready_for_payment', owner_name: 'Natasha B.', owner_email: 'natasha@example.com', created_at: '2026-04-04T15:00:00Z', updated_at: '2026-04-06T14:00:00Z', photos_count: 16, docs_count: 2, has_title_deed: true, campaigns_count: 0, subscription_active: false },
  { id: 'p7', title: 'Land plot 800m², Tivat', city: 'Tivat', country: 'Montenegro', property_type: 'land', price: 120000, currency: 'EUR', status: 'sold', owner_name: 'Pavel C.', owner_email: 'pavel@example.com', created_at: '2026-03-15T09:00:00Z', updated_at: '2026-04-02T10:00:00Z', photos_count: 6, docs_count: 2, has_title_deed: true, campaigns_count: 1, subscription_active: false },
  { id: 'p8', title: 'Commercial space, Nis', city: 'Nis', country: 'Serbia', property_type: 'commercial', price: 88000, currency: 'EUR', status: 'draft', owner_name: 'Sergei M.', owner_email: 'sergei@example.com', created_at: '2026-04-07T16:00:00Z', updated_at: '2026-04-07T16:30:00Z', photos_count: 3, docs_count: 0, has_title_deed: false, campaigns_count: 0, subscription_active: false },
];

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  draft:               { label: 'Draft',           color: 'text-gray-500',   bg: 'bg-gray-100' },
  pending_verification:{ label: 'Pending review',  color: 'text-orange-600', bg: 'bg-orange-100' },
  ready_for_payment:   { label: 'Awaiting payment',color: 'text-purple-600', bg: 'bg-purple-100' },
  awaiting_approval:   { label: 'Awaiting approval',color:'text-blue-600',   bg: 'bg-blue-100' },
  active:              { label: 'Active',          color: 'text-green-700',  bg: 'bg-green-100' },
  in_distribution:     { label: 'Distributing',   color: 'text-indigo-700', bg: 'bg-indigo-100' },
  paused:              { label: 'Paused',          color: 'text-yellow-700', bg: 'bg-yellow-100' },
  sold:                { label: 'Sold',            color: 'text-emerald-700',bg: 'bg-emerald-100' },
  archived:            { label: 'Archived',        color: 'text-gray-400',   bg: 'bg-gray-100' },
};

const TYPE_ICONS: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏡', land: '🌳',
  commercial: '🏪', garage: '🚗', other: '📦',
};

const STATUS_FILTERS = [
  { value: 'all',                 label: 'All' },
  { value: 'pending_verification',label: '⏳ Pending review' },
  { value: 'awaiting_approval',   label: '⚡ Awaiting approval' },
  { value: 'ready_for_payment',   label: '💳 Awaiting payment' },
  { value: 'active',              label: '✅ Active' },
  { value: 'in_distribution',     label: '📤 Distributing' },
  { value: 'sold',                label: '🎉 Sold' },
  { value: 'archived',            label: '📁 Archived' },
];

// ─── Detail Drawer ───────────────────────────────────────────────────────────
function PropertyDetailDrawer({
  property,
  onClose,
  onStatusChange,
}: {
  property: AdminProperty;
  onClose: () => void;
  onStatusChange: (id: string, status: PropertyStatus, note?: string) => void;
}) {
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);

  const act = async (newStatus: PropertyStatus) => {
    setActing(true);
    await onStatusChange(property.id, newStatus, note);
    setActing(false);
  };

  const cfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICONS[property.property_type] || '📦'}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{property.title}</p>
              <p className="text-xs text-gray-400">{property.city}, {property.country}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400">Updated {new Date(property.updated_at).toLocaleDateString()}</span>
          </div>

          {/* Owner */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Owner</p>
            <p className="text-sm font-medium text-gray-900">{property.owner_name}</p>
            <a href={`mailto:${property.owner_email}`} className="text-xs text-blue-600 hover:underline">{property.owner_email}</a>
          </div>

          {/* Property details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Price</p>
              <p className="text-sm font-bold text-gray-900">{property.currency} {property.price.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{property.property_type}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Photos</p>
              <p className="text-sm font-bold text-gray-900">{property.photos_count}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Documents</p>
              <p className="text-sm font-bold text-gray-900">{property.docs_count}</p>
            </div>
          </div>

          {/* Document checklist */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Document checklist</p>
            {[
              { label: 'Title deed / ownership proof', ok: property.has_title_deed },
              { label: 'Minimum 5 photos', ok: property.photos_count >= 5 },
              { label: 'At least 1 document uploaded', ok: property.docs_count > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0',
                  item.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                )}>
                  {item.ok ? '✓' : '✗'}
                </span>
                <span className={clsx('text-sm', item.ok ? 'text-gray-700' : 'text-red-600')}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Subscription */}
          <div className={clsx('rounded-xl p-3 flex items-center gap-2',
            property.subscription_active ? 'bg-green-50' : 'bg-gray-50'
          )}>
            <span>{property.subscription_active ? '✅' : '⭕'}</span>
            <span className="text-sm text-gray-700">
              {property.subscription_active ? 'Active subscription' : 'No active subscription'}
            </span>
          </div>

          {/* Admin note */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Admin note (optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note visible to the owner..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          {property.status === 'pending_verification' && (
            <>
              <button
                onClick={() => act('active')}
                disabled={acting}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {acting ? 'Processing...' : '✅ Verify & approve'}
              </button>
              <button
                onClick={() => act('draft')}
                disabled={acting}
                className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                ✗ Reject — return to draft
              </button>
            </>
          )}
          {property.status === 'awaiting_approval' && (
            <button
              onClick={() => act('active')}
              disabled={acting}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {acting ? 'Processing...' : '⚡ Force activate'}
            </button>
          )}
          {(property.status === 'active' || property.status === 'in_distribution') && (
            <>
              <button
                onClick={() => act('paused')}
                disabled={acting}
                className="w-full py-2.5 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-semibold hover:bg-yellow-100 disabled:opacity-50"
              >
                ⏸ Pause
              </button>
              <button
                onClick={() => act('archived')}
                disabled={acting}
                className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                📁 Archive
              </button>
            </>
          )}
          {property.status === 'paused' && (
            <button
              onClick={() => act('active')}
              disabled={acting}
              className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              ▶ Resume
            </button>
          )}
          <Link
            href={`/listings/${property.id}`}
            target="_blank"
            className="block w-full py-2.5 text-center text-xs text-gray-400 hover:text-gray-700 border border-gray-100 rounded-xl transition-colors"
          >
            ↗ View public listing
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
function AdminPropertiesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusFilter = searchParams.get('status') || 'all';
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<AdminProperty[]>(MOCK_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminProperty | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/properties').catch(() => ({ data: MOCK_PROPERTIES }));
        setProperties(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = useCallback(async (id: string, newStatus: PropertyStatus, note?: string) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status: newStatus, note }).catch(() => {});
    } finally {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    }
  }, []);

  const filtered = properties.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.owner_name.toLowerCase().includes(q) ||
      p.owner_email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pendingCount = properties.filter(p => p.status === 'pending_verification').length;
  const awaitingCount = properties.filter(p => p.status === 'awaiting_approval').length;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-400 mt-0.5">{properties.length} total · {pendingCount} pending review</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => router.push('/admin/properties?status=pending_verification')}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 flex items-center gap-1.5"
            >
              ⏳ {pendingCount} need review
            </button>
          )}
          {awaitingCount > 0 && (
            <button
              onClick={() => router.push('/admin/properties?status=awaiting_approval')}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 flex items-center gap-1.5"
            >
              ⚡ {awaitingCount} awaiting approval
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, city, owner..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  f.value === 'all' ? params.delete('status') : params.set('status', f.value);
                  router.push(`/admin/properties?${params.toString()}`);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  statusFilter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1 opacity-60">
                    {properties.filter(p => p.status === f.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-gray-500 font-medium">No properties found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Docs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(property => {
                  const cfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;
                  const isUrgent = property.status === 'pending_verification' || property.status === 'awaiting_approval';
                  return (
                    <tr
                      key={property.id}
                      onClick={() => setSelected(property)}
                      className={clsx(
                        'hover:bg-gray-50 cursor-pointer transition-colors',
                        isUrgent && 'bg-orange-50/40'
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{TYPE_ICONS[property.property_type] || '📦'}</span>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{property.title}</p>
                            <p className="text-xs text-gray-400">{property.city}, {property.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-gray-800">{property.owner_name}</p>
                        <p className="text-xs text-gray-400">{property.owner_email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </span>
                          {isUrgent && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{property.has_title_deed ? '✅' : '⚠️'}</span>
                          <span className="text-xs text-gray-500">{property.docs_count} doc{property.docs_count !== 1 ? 's' : ''}</span>
                          <span className="text-xs text-gray-400">/ {property.photos_count} photos</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="font-semibold text-gray-900">{property.currency} {property.price.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-400">
                        {new Date(property.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="text-gray-300 hover:text-gray-600 text-lg">›</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {properties.length} properties
        </p>
      )}

      {/* Detail drawer */}
      {selected && (
        <PropertyDetailDrawer
          property={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading…</p></div>}>
      <AdminPropertiesPageInner />
    </Suspense>
  );
}
