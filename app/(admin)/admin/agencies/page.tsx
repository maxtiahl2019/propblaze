'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import clsx from 'clsx';

type AgencyStatus = 'active' | 'inactive' | 'pending';

interface Agency {
  id: string;
  name: string;
  country: string;
  cities: string[];
  property_types: string[];
  languages: string[];
  email: string;
  phone?: string;
  website?: string;
  price_band_min: number;
  price_band_max: number;
  quality_score: number;
  response_rate: number;
  conversion_rate: number;
  campaigns_received: number;
  campaigns_replied: number;
  status: AgencyStatus;
  created_at: string;
  notes?: string;
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_AGENCIES: Agency[] = [
  { id: 'a1', name: 'RE Capital Serbia', country: 'Serbia', cities: ['Belgrade', 'Novi Sad'], property_types: ['apartment', 'house'], languages: ['sr', 'en', 'ru'], email: 'info@recapital.rs', phone: '+381 11 2345678', website: 'recapital.rs', price_band_min: 50000, price_band_max: 500000, quality_score: 92, response_rate: 78, conversion_rate: 12, campaigns_received: 18, campaigns_replied: 14, status: 'active', created_at: '2026-01-10T10:00:00Z', notes: 'Top performer in Belgrade market' },
  { id: 'a2', name: 'Adriatic Homes', country: 'Montenegro', cities: ['Budva', 'Tivat', 'Kotor'], property_types: ['villa', 'apartment', 'land'], languages: ['en', 'ru', 'de'], email: 'contact@adriatichomes.me', phone: '+382 33 456789', website: 'adriatichomes.me', price_band_min: 100000, price_band_max: 2000000, quality_score: 88, response_rate: 65, conversion_rate: 8, campaigns_received: 24, campaigns_replied: 16, status: 'active', created_at: '2026-01-15T10:00:00Z' },
  { id: 'a3', name: 'Athens Prime Realty', country: 'Greece', cities: ['Athens', 'Piraeus', 'Thessaloniki'], property_types: ['apartment', 'commercial'], languages: ['en', 'ru'], email: 'info@athensprime.gr', price_band_min: 80000, price_band_max: 600000, quality_score: 75, response_rate: 55, conversion_rate: 6, campaigns_received: 12, campaigns_replied: 7, status: 'active', created_at: '2026-02-01T10:00:00Z' },
  { id: 'a4', name: 'Limassol Luxury', country: 'Cyprus', cities: ['Limassol', 'Paphos'], property_types: ['villa', 'apartment'], languages: ['en', 'ru'], email: 'luxury@limassol.cy', phone: '+357 25 123456', website: 'limassolluxury.cy', price_band_min: 300000, price_band_max: 5000000, quality_score: 94, response_rate: 82, conversion_rate: 15, campaigns_received: 8, campaigns_replied: 7, status: 'active', created_at: '2026-01-20T10:00:00Z', notes: 'High-end segment specialist' },
  { id: 'a5', name: 'Sofia Real Estate Group', country: 'Bulgaria', cities: ['Sofia', 'Plovdiv'], property_types: ['apartment', 'commercial', 'house'], languages: ['bg', 'en', 'ru'], email: 'info@sofiarealty.bg', price_band_min: 30000, price_band_max: 400000, quality_score: 68, response_rate: 42, conversion_rate: 5, campaigns_received: 9, campaigns_replied: 4, status: 'active', created_at: '2026-02-10T10:00:00Z' },
  { id: 'a6', name: 'Split Riviera Properties', country: 'Croatia', cities: ['Split', 'Dubrovnik', 'Zadar'], property_types: ['apartment', 'villa', 'house'], languages: ['hr', 'en', 'de'], email: 'info@splitriviera.hr', website: 'splitriviera.hr', price_band_min: 80000, price_band_max: 800000, quality_score: 81, response_rate: 60, conversion_rate: 9, campaigns_received: 15, campaigns_replied: 9, status: 'inactive', created_at: '2026-01-25T10:00:00Z', notes: 'Seasonal — active Apr-Oct' },
  { id: 'a7', name: 'Sarajevo Homes', country: 'Bosnia', cities: ['Sarajevo', 'Banja Luka'], property_types: ['apartment', 'house'], languages: ['bs', 'sr', 'en'], email: 'contact@sarajevohomes.ba', price_band_min: 40000, price_band_max: 200000, quality_score: 61, response_rate: 35, conversion_rate: 4, campaigns_received: 5, campaigns_replied: 2, status: 'pending', created_at: '2026-04-01T10:00:00Z', notes: 'New — needs quality review' },
  { id: 'a8', name: 'Warsaw Investment Realty', country: 'Poland', cities: ['Warsaw', 'Krakow'], property_types: ['apartment', 'commercial'], languages: ['pl', 'en', 'ru'], email: 'info@warsawrealty.pl', phone: '+48 22 4567890', website: 'warsawrealty.pl', price_band_min: 100000, price_band_max: 1000000, quality_score: 77, response_rate: 58, conversion_rate: 7, campaigns_received: 11, campaigns_replied: 6, status: 'active', created_at: '2026-02-20T10:00:00Z' },
];

const LANG_LABELS: Record<string, string> = {
  en: 'EN', ru: 'RU', sr: 'SR', de: 'DE', fr: 'FR', hr: 'HR',
  bg: 'BG', bs: 'BS', pl: 'PL', el: 'EL', tr: 'TR', ro: 'RO',
};

function QualityBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-blue-500' : score >= 55 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-7">{score}</span>
    </div>
  );
}

// ─── Agency Form (add / edit) ─────────────────────────────────────────────────
function AgencyForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Agency>;
  onSave: (data: Partial<Agency>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Agency>>({
    name: '', country: '', cities: [], property_types: [], languages: [],
    email: '', phone: '', website: '', price_band_min: 0, price_band_max: 1000000,
    quality_score: 70, status: 'active', notes: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  const set = (field: keyof Agency, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.email || !form.country) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const toggleArr = (field: 'cities' | 'property_types' | 'languages', val: string) => {
    const arr = (form[field] as string[]) || [];
    set(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{initial?.id ? 'Edit agency' : 'Add agency'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Agency name *</label>
              <input value={form.name || ''} onChange={e => set('name', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Country *</label>
              <input value={form.country || ''} onChange={e => set('country', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
              <select value={form.status || 'active'} onChange={e => set('status', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending review</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email *</label>
              <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</label>
              <input value={form.phone || ''} onChange={e => set('phone', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Website</label>
              <input value={form.website || ''} onChange={e => set('website', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Property types */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Property types</label>
            <div className="flex flex-wrap gap-1.5">
              {['apartment', 'house', 'villa', 'land', 'commercial', 'garage', 'other'].map(t => (
                <button key={t} type="button"
                  onClick={() => toggleArr('property_types', t)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                    (form.property_types || []).includes(t)
                      ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Languages</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <button key={code} type="button"
                  onClick={() => toggleArr('languages', code)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    (form.languages || []).includes(code)
                      ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price band */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Min price (€)</label>
              <input type="number" value={form.price_band_min || 0} onChange={e => set('price_band_min', parseInt(e.target.value))}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Max price (€)</label>
              <input type="number" value={form.price_band_max || 0} onChange={e => set('price_band_max', parseInt(e.target.value))}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Quality score */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quality score (0–100)</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="range" min={0} max={100} value={form.quality_score || 70}
                onChange={e => set('quality_score', parseInt(e.target.value))}
                className="flex-1" />
              <span className="text-sm font-bold text-gray-900 w-8">{form.quality_score}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin notes</label>
            <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)}
              rows={2}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.email}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : initial?.id ? 'Save changes' : 'Add agency'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>(MOCK_AGENCIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AgencyStatus>('all');
  const [sortBy, setSortBy] = useState<'quality_score' | 'response_rate' | 'name' | 'campaigns_received'>('quality_score');
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/agencies').catch(() => ({ data: MOCK_AGENCIES }));
        setAgencies(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const countries = ['all', ...Array.from(new Set(agencies.map(a => a.country))).sort()];

  const filtered = agencies
    .filter(a => {
      const matchCountry = countryFilter === 'all' || a.country === countryFilter;
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q) ||
        a.cities.some(c => c.toLowerCase().includes(q)) || a.email.toLowerCase().includes(q);
      return matchCountry && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b[sortBy] as number) - (a[sortBy] as number);
    });

  const handleSave = useCallback(async (data: Partial<Agency>) => {
    try {
      if (editingAgency) {
        await api.patch(`/admin/agencies/${editingAgency.id}`, data).catch(() => {});
        setAgencies(prev => prev.map(a => a.id === editingAgency.id ? { ...a, ...data } : a));
      } else {
        const res = await api.post('/admin/agencies', data).catch(() => ({
          data: { id: `new-${Date.now()}`, ...data, campaigns_received: 0, campaigns_replied: 0, response_rate: 0, conversion_rate: 0, created_at: new Date().toISOString() }
        }));
        setAgencies(prev => [res.data as Agency, ...prev]);
      }
    } finally {
      setEditingAgency(null);
      setShowForm(false);
    }
  }, [editingAgency]);

  const handleToggleStatus = async (agency: Agency) => {
    const newStatus: AgencyStatus = agency.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/admin/agencies/${agency.id}`, { status: newStatus }).catch(() => {});
    setAgencies(prev => prev.map(a => a.id === agency.id ? { ...a, status: newStatus } : a));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/admin/agencies/import', formData).catch(() => {});
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Agencies</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {agencies.filter(a => a.status === 'active').length} active · {agencies.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <label className={clsx(
            'px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 cursor-pointer transition-colors',
            importing ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white hover:bg-gray-50 text-gray-700'
          )}>
            📥 {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
          <button
            onClick={() => { setEditingAgency(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            ➕ Add agency
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: agencies.filter(a => a.status === 'active').length, icon: '✅', color: 'text-green-700 bg-green-50' },
          { label: 'Inactive', value: agencies.filter(a => a.status === 'inactive').length, icon: '⏸', color: 'text-gray-500 bg-gray-50' },
          { label: 'Pending review', value: agencies.filter(a => a.status === 'pending').length, icon: '⏳', color: 'text-orange-600 bg-orange-50' },
          { label: 'Avg quality', value: agencies.length ? Math.round(agencies.reduce((s, a) => s + a.quality_score, 0) / agencies.length) : 0, icon: '⭐', color: 'text-blue-600 bg-blue-50' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', card.color)}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400">{card.label}</p>
            </div>
          </div>
        ))}
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
              placeholder="Search agencies, cities, emails..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Country */}
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]">
            {countries.map(c => <option key={c} value={c}>{c === 'all' ? 'All countries' : c}</option>)}
          </select>

          {/* Status */}
          <div className="flex gap-1.5">
            {([['all', 'All'], ['active', '✅ Active'], ['inactive', '⏸ Inactive'], ['pending', '⏳ Pending']] as const).map(([val, lbl]) => (
              <button key={val} onClick={() => setStatusFilter(val as typeof statusFilter)}
                className={clsx('px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
                  statusFilter === val ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]">
            <option value="quality_score">Sort: Quality score</option>
            <option value="response_rate">Sort: Response rate</option>
            <option value="campaigns_received">Sort: Campaigns</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading agencies...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-gray-500 font-medium">No agencies found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting the filters or add a new agency</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Agency</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Specialisation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Quality</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Response</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Campaigns</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Price band</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(agency => (
                  <tr key={agency.id}
                    className={clsx('hover:bg-gray-50 transition-colors', agency.status === 'pending' && 'bg-orange-50/30')}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {agency.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-gray-900">{agency.name}</p>
                            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0',
                              agency.status === 'active' ? 'bg-green-500' :
                              agency.status === 'pending' ? 'bg-orange-400' : 'bg-gray-300'
                            )} />
                          </div>
                          <p className="text-xs text-gray-400">{agency.country} · {agency.cities.slice(0, 2).join(', ')}{agency.cities.length > 2 ? ` +${agency.cities.length - 2}` : ''}</p>
                          <a href={`mailto:${agency.email}`} className="text-xs text-blue-500 hover:underline">{agency.email}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {agency.property_types.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">{t}</span>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {agency.languages.map(l => (
                          <span key={l} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-semibold">
                            {LANG_LABELS[l] || l.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-24">
                        <QualityBar score={agency.quality_score} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="text-sm font-semibold text-gray-800">{agency.response_rate}%</div>
                      <div className="text-xs text-gray-400">{agency.conversion_rate}% conv.</div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="text-sm text-gray-800">{agency.campaigns_received} received</div>
                      <div className="text-xs text-gray-400">{agency.campaigns_replied} replied</div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-xs text-gray-600">
                        €{(agency.price_band_min / 1000).toFixed(0)}k – €{(agency.price_band_max / 1000).toFixed(0)}k
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingAgency(agency); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-sm"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleStatus(agency)}
                          className={clsx('p-1.5 rounded-lg text-sm transition-colors',
                            agency.status === 'active'
                              ? 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                              : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                          )}
                          title={agency.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {agency.status === 'active' ? '⏸' : '▶'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {filtered.length} of {agencies.length} agencies shown
      </p>

      {/* Form modal */}
      {showForm && (
        <AgencyForm
          initial={editingAgency || undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingAgency(null); }}
        />
      )}
    </div>
  );
}
