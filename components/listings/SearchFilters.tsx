'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

export interface Filters {
  query: string;
  country: string;
  city: string;
  property_type: string;
  price_min: string;
  price_max: string;
  area_min: string;
  bedrooms_min: string;
  currency: string;
  tags: string[];
  verified_only: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  query: '', country: '', city: '', property_type: '',
  price_min: '', price_max: '', area_min: '', bedrooms_min: '',
  currency: 'EUR', tags: [], verified_only: false,
};

const PROPERTY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'apartment', label: '🏢 Apartment' },
  { value: 'house',     label: '🏠 House' },
  { value: 'villa',     label: '🏰 Villa' },
  { value: 'land',      label: '🌿 Land' },
  { value: 'commercial',label: '🏪 Commercial' },
  { value: 'studio',    label: '🛏 Studio' },
  { value: 'townhouse', label: '🏘 Townhouse' },
];

const PRICE_RANGES = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under €50k',   min: '', max: '50000' },
  { label: '€50k – €150k', min: '50000', max: '150000' },
  { label: '€150k – €300k',min: '150000', max: '300000' },
  { label: '€300k – €500k',min: '300000', max: '500000' },
  { label: '€500k – €1M',  min: '500000', max: '1000000' },
  { label: 'Over €1M',     min: '1000000', max: '' },
];

const POPULAR_COUNTRIES = [
  'Serbia', 'Montenegro', 'Croatia', 'Greece', 'Spain',
  'Portugal', 'Italy', 'Bulgaria', 'Cyprus', 'Turkey',
];

const TAGS = [
  { value: 'sea', label: '🌊 Sea' },
  { value: 'city_center', label: '🏙 City center' },
  { value: 'pool', label: '🏊 Pool' },
  { value: 'view', label: '🌄 View' },
  { value: 'new_build', label: '🏗 New build' },
  { value: 'renovated', label: '✨ Renovated' },
  { value: 'garden', label: '🌱 Garden' },
  { value: 'parking', label: '🅿️ Parking' },
];

interface SearchFiltersProps {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onSearch: () => void;
  totalCount?: number;
  loading?: boolean;
  // mobile panel state
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SearchFilters({
  filters, onChange, onSearch, totalCount, loading, mobileOpen, onMobileClose
}: SearchFiltersProps) {
  const [pricePreset, setPricePreset] = useState('');

  const setPriceRange = (min: string, max: string, label: string) => {
    setPricePreset(label);
    onChange({ price_min: min, price_max: max });
  };

  const toggleTag = (v: string) => {
    const tags = filters.tags.includes(v)
      ? filters.tags.filter(t => t !== v)
      : [...filters.tags, v];
    onChange({ tags });
  };

  const hasActive = !!(
    filters.country || filters.property_type || filters.price_min ||
    filters.price_max || filters.area_min || filters.bedrooms_min ||
    filters.tags.length || filters.verified_only
  );

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-sm">Filters</span>
        <div className="flex items-center gap-3">
          {hasActive && (
            <button
              type="button"
              onClick={() => { onChange(DEFAULT_FILTERS); setPricePreset(''); }}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
          {onMobileClose && (
            <button type="button" onClick={onMobileClose} className="text-gray-400 hover:text-gray-600 lg:hidden">✕</button>
          )}
        </div>
      </div>

      {/* Verified only */}
      <label className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verified_only}
          onChange={e => onChange({ verified_only: e.target.checked })}
          className="w-4 h-4 accent-green-600"
        />
        <span className="text-sm font-medium text-green-800">🛡 Verified listings only</span>
      </label>

      {/* Property type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Property type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {PROPERTY_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ property_type: t.value })}
              className={clsx(
                'px-2 py-1.5 rounded-lg border text-xs font-medium transition-all text-left',
                filters.property_type === t.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Country</label>
        <select
          value={filters.country}
          onChange={e => onChange({ country: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">All countries</option>
          {POPULAR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Quick country pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {POPULAR_COUNTRIES.slice(0, 5).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ country: filters.country === c ? '' : c })}
              className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium border transition-all',
                filters.country === c
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">City</label>
        <input
          type="text"
          value={filters.city}
          onChange={e => onChange({ city: e.target.value })}
          placeholder="Any city"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price range</label>
        <div className="space-y-1.5 mb-3">
          {PRICE_RANGES.map(r => (
            <button
              key={r.label}
              type="button"
              onClick={() => setPriceRange(r.min, r.max, r.label)}
              className={clsx(
                'w-full text-left px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                pricePreset === r.label
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Min</label>
            <input
              type="number"
              value={filters.price_min}
              onChange={e => { onChange({ price_min: e.target.value }); setPricePreset(''); }}
              placeholder="0"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max</label>
            <input
              type="number"
              value={filters.price_max}
              onChange={e => { onChange({ price_max: e.target.value }); setPricePreset(''); }}
              placeholder="Any"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Area & bedrooms */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min area (m²)</label>
          <input
            type="number"
            value={filters.area_min}
            onChange={e => onChange({ area_min: e.target.value })}
            placeholder="Any"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min bedrooms</label>
          <select
            value={filters.bedrooms_min}
            onChange={e => onChange({ bedrooms_min: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {['', '1', '2', '3', '4', '5'].map(v => (
              <option key={v} value={v}>{v ? `${v}+` : 'Any'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Features</label>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                filters.tags.includes(tag.value)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={() => { onSearch(); onMobileClose?.(); }}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {loading ? 'Searching…' : `Show ${totalCount !== undefined ? totalCount : ''} properties`}
      </button>
    </div>
  );

  if (mobileOpen !== undefined) {
    return (
      <>
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{content}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5">
              {content}
            </div>
          </div>
        )}
      </>
    );
  }

  return content;
}
