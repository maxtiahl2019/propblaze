'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizard';
import { Input } from '@/components/ui/Input';
import clsx from 'clsx';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'villa', label: 'Villa', icon: '🏰' },
  { value: 'land', label: 'Land', icon: '🌿' },
  { value: 'commercial', label: 'Commercial', icon: '🏪' },
  { value: 'studio', label: 'Studio', icon: '🛏' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘' },
];

const SELLER_TYPES = [
  { value: 'owner', label: 'Owner' },
  { value: 'representative', label: 'Representative' },
  { value: 'developer', label: 'Developer' },
  { value: 'agent', label: 'Agent' },
];

const CONDITIONS = [
  { value: 'new', label: 'New build' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'needs_renovation', label: 'Needs renovation' },
];

const FURNISHED = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi_furnished', label: 'Semi-furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const EU_COUNTRIES = [
  'Albania', 'Austria', 'Belgium', 'Bosnia', 'Bulgaria', 'Croatia',
  'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
  'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Montenegro', 'Netherlands', 'North Macedonia',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine',
];

export function Step1BasicInfo() {
  const { step1, updateStep1 } = useWizardStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your property</h2>
        <p className="text-gray-500 mt-1">Basic information and location details</p>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Property type *</label>
        <div className="grid grid-cols-4 gap-3">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateStep1({ property_type: t.value })}
              className={clsx(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                step1.property_type === t.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <span className="text-2xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seller Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">You are *</label>
        <div className="flex flex-wrap gap-2">
          {SELLER_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateStep1({ seller_type: t.value })}
              className={clsx(
                'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                step1.seller_type === t.value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Location</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              value={step1.country}
              onChange={(e) => updateStep1({ country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select country</option>
              {EU_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input
            label="Region / Province"
            value={step1.region}
            onChange={(e) => updateStep1({ region: e.target.value })}
            placeholder="e.g. Catalonia"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City *"
            value={step1.city}
            onChange={(e) => updateStep1({ city: e.target.value })}
            placeholder="e.g. Barcelona"
          />
          <Input
            label="Postal code"
            value={step1.postal_code}
            onChange={(e) => updateStep1({ postal_code: e.target.value })}
            placeholder="08001"
          />
        </div>

        <Input
          label="Street address"
          value={step1.address}
          onChange={(e) => updateStep1({ address: e.target.value })}
          placeholder="Street, building number"
        />

        {/* Map placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin on map</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl h-40 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-3xl mb-1">📍</div>
              <p className="text-sm text-gray-500">Interactive map</p>
              <div className="flex gap-4 mt-3 justify-center">
                <div>
                  <label className="text-xs text-gray-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={step1.latitude ?? ''}
                    onChange={(e) => updateStep1({ latitude: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="41.3851"
                    className="block w-28 px-2 py-1 border border-gray-300 rounded text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={step1.longitude ?? ''}
                    onChange={(e) => updateStep1({ longitude: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="2.1734"
                    className="block w-28 px-2 py-1 border border-gray-300 rounded text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property specs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Property specs</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqm) *</label>
            <input
              type="number"
              value={step1.area_sqm ?? ''}
              onChange={(e) => updateStep1({ area_sqm: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="85"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lot size (sqm)</label>
            <input
              type="number"
              value={step1.lot_size_sqm ?? ''}
              onChange={(e) => updateStep1({ lot_size_sqm: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year built</label>
            <input
              type="number"
              value={step1.year_built ?? ''}
              onChange={(e) => updateStep1({ year_built: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="2005"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              min={0}
              value={step1.bedrooms ?? ''}
              onChange={(e) => updateStep1({ bedrooms: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              min={0}
              value={step1.bathrooms ?? ''}
              onChange={(e) => updateStep1({ bathrooms: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <input
              type="number"
              value={step1.floor ?? ''}
              onChange={(e) => updateStep1({ floor: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total floors</label>
            <input
              type="number"
              value={step1.total_floors ?? ''}
              onChange={(e) => updateStep1({ total_floors: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="9"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
            <div className="flex flex-col gap-2">
              {CONDITIONS.map((c) => (
                <label key={c.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={step1.condition === c.value}
                    onChange={() => updateStep1({ condition: c.value })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing</label>
            <div className="flex flex-col gap-2">
              {FURNISHED.map((f) => (
                <label key={f.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="furnished"
                    value={f.value}
                    checked={step1.furnished_status === f.value}
                    onChange={() => updateStep1({ furnished_status: f.value })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
