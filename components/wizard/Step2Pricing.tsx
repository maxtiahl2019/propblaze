'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/store/wizard';
import clsx from 'clsx';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'RSD', 'HRK', 'RON', 'BGN', 'PLN'];

const BUYER_TYPES = [
  { value: 'end_user',         label: 'End-user',        icon: '👨‍👩‍👧' },
  { value: 'investor',         label: 'Investor',         icon: '📈' },
  { value: 'foreign_investor', label: 'Foreign investor', icon: '🌍' },
  { value: 'expat',            label: 'Expat',            icon: '✈️' },
  { value: 'holiday_home',     label: 'Holiday home',     icon: '🌴' },
  { value: 'diaspora',         label: 'Diaspora',         icon: '🗺️' },
  { value: 'any',              label: 'Any buyer',        icon: '🌐' },
];

const EXCLUSIVE_OPTIONS = [
  { value: 'yes',   label: 'Yes, open to exclusive', desc: 'Higher commitment from agency' },
  { value: 'no',    label: 'No, non-exclusive only', desc: 'Work with multiple agencies' },
  { value: 'maybe', label: 'Open to discuss',        desc: 'Decide on a case-by-case basis' },
];

const NOTARY_WHO_PAYS = [
  { value: 'buyer',  label: 'Buyer pays', icon: '🛒' },
  { value: 'seller', label: 'Seller pays', icon: '🏠' },
  { value: 'split',  label: '50/50 split', icon: '⚖️' },
];

// Toggle component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx('relative w-11 h-6 rounded-full transition-all flex-shrink-0', checked ? 'bg-blue-600' : 'bg-gray-300')}
    >
      <span className={clsx('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', checked ? 'left-6' : 'left-1')} />
    </button>
  );
}

// Section divider
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Step2Pricing() {
  const { step2, updateStep2 } = useWizardStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleBuyerType = (value: string) => {
    const current = step2.target_buyer_types;
    if (value === 'any') {
      updateStep2({ target_buyer_types: ['any'] });
      return;
    }
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current.filter((v) => v !== 'any'), value];
    updateStep2({ target_buyer_types: next });
  };

  // Derived: is cross-border scenario
  const isCrossBorder = step2.target_buyer_types.some(t =>
    ['foreign_investor', 'expat', 'diaspora'].includes(t)
  );

  // Commission summary for preview
  const commissionSummary = (() => {
    const pct = (step2 as any).commission_pct;
    if (!pct) return null;
    const price = step2.asking_price;
    if (!price) return `${pct}%`;
    const amount = price * pct / 100;
    const included = (step2 as any).commission_included !== false;
    return `${pct}% = ${step2.currency} ${Math.round(amount).toLocaleString()} (${included ? 'included in price' : 'on top of price'})`;
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Price & deal terms</h2>
        <p className="text-gray-500 mt-1">Set your asking price, commission structure, and transaction conditions</p>
      </div>

      {/* ── ASKING PRICE ─────────────────────────────────────────────────── */}
      <Section title="Asking price *">
        <div className="flex gap-3">
          <select
            value={step2.currency}
            onChange={(e) => updateStep2({ currency: e.target.value })}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium w-24"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number"
            min={0}
            value={step2.asking_price ?? ''}
            onChange={(e) => updateStep2({ asking_price: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="250,000"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={step2.negotiable}
            onChange={(e) => updateStep2({ negotiable: e.target.checked })}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className="text-sm text-gray-600">Price is negotiable</span>
        </label>
      </Section>

      {/* ── MINIMUM ACCEPTABLE PRICE ─────────────────────────────────────── */}
      <Section
        title="Minimum acceptable price"
        subtitle="Your real floor — not shown publicly, only used for AI matching"
      >
        <div className="flex gap-3 items-center">
          <span className="text-sm font-medium text-gray-500 w-12">{step2.currency}</span>
          <input
            type="number"
            min={0}
            value={(step2 as any).min_acceptable_price ?? ''}
            onChange={(e) => updateStep2({ min_acceptable_price: e.target.value ? parseFloat(e.target.value) : null } as any)}
            placeholder="e.g. 230,000"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {step2.asking_price && (step2 as any).min_acceptable_price && (
          <p className="text-xs text-gray-400">
            Negotiation margin: {step2.currency} {(step2.asking_price - (step2 as any).min_acceptable_price).toLocaleString()}
            {' '}({(((step2.asking_price - (step2 as any).min_acceptable_price) / step2.asking_price) * 100).toFixed(1)}%)
          </p>
        )}
      </Section>

      {/* ── AGENCY COMMISSION ────────────────────────────────────────────── */}
      <Section
        title="Agency commission"
        subtitle="Standard in most EU markets: 2–5% of sale price"
      >
        <div className="space-y-3">
          {/* Commission % */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Commission rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={(step2 as any).commission_pct ?? ''}
                  onChange={(e) => updateStep2({ commission_pct: e.target.value ? parseFloat(e.target.value) : null } as any)}
                  placeholder="3.0"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
                />
                <span className="text-gray-500 text-sm font-medium">%</span>
                {commissionSummary && (
                  <span className="text-xs text-blue-600 font-medium">{commissionSummary}</span>
                )}
              </div>
            </div>
          </div>

          {/* Included or on top */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">How is the commission shown?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: true,
                  label: 'Included in price',
                  desc: 'Commission is part of the listed price',
                  icon: '📦',
                },
                {
                  value: false,
                  label: 'Added on top',
                  desc: 'Buyer pays listing price + commission separately',
                  icon: '➕',
                },
              ].map((opt) => {
                const included = (step2 as any).commission_included !== false;
                const selected = opt.value === included;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => updateStep2({ commission_included: opt.value } as any)}
                    className={clsx(
                      'text-left p-3 rounded-xl border-2 transition-all',
                      selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <p className={clsx('text-xs font-semibold mt-1', selected ? 'text-blue-700' : 'text-gray-700')}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Example calculation */}
          {step2.asking_price && (step2 as any).commission_pct > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">💰 Transaction breakdown example</p>
              <div className="text-xs text-amber-700 space-y-0.5">
                <div className="flex justify-between">
                  <span>Listed price</span>
                  <span className="font-medium">{step2.currency} {step2.asking_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agency commission ({(step2 as any).commission_pct}%)</span>
                  <span className="font-medium">
                    {(step2 as any).commission_included !== false ? 'already included' : `+ ${step2.currency} ${Math.round(step2.asking_price * (step2 as any).commission_pct / 100).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t border-amber-200 pt-0.5 mt-0.5">
                  <span>Buyer pays (total)</span>
                  <span>
                    {step2.currency} {(
                      (step2 as any).commission_included !== false
                        ? step2.asking_price
                        : step2.asking_price + step2.asking_price * (step2 as any).commission_pct / 100
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── TRANSACTION COSTS ────────────────────────────────────────────── */}
      <Section
        title="Transaction costs — notary & taxes"
        subtitle="Clarify upfront who covers legal costs. This will be shown to agencies."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Notary / transfer tax (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.1}
                  value={(step2 as any).notary_pct ?? ''}
                  onChange={(e) => updateStep2({ notary_pct: e.target.value ? parseFloat(e.target.value) : null } as any)}
                  placeholder="2.5"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-gray-500 text-sm">%</span>
                {step2.asking_price && (step2 as any).notary_pct > 0 && (
                  <span className="text-xs text-gray-400">
                    = {step2.currency} {Math.round(step2.asking_price * (step2 as any).notary_pct / 100).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Who pays the notary / transfer tax?</label>
            <div className="grid grid-cols-3 gap-2">
              {NOTARY_WHO_PAYS.map((opt) => {
                const current = (step2 as any).notary_who_pays || 'buyer';
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateStep2({ notary_who_pays: opt.value } as any)}
                    className={clsx(
                      'p-3 rounded-xl border-2 text-center transition-all',
                      current === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl block">{opt.icon}</span>
                    <span className={clsx('text-xs font-semibold mt-1', current === opt.value ? 'text-blue-700' : 'text-gray-600')}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── TARGET BUYER ─────────────────────────────────────────────────── */}
      <Section title="Target buyer profile" subtitle="Affects which agencies AI selects — foreign buyer = cross-border specialist priority">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {BUYER_TYPES.map((t) => {
            const selected = step2.target_buyer_types.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleBuyerType(t.value)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all',
                  selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                <span className="text-xl">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {isCrossBorder && (
          <div className="flex items-start gap-2.5 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <span className="text-lg">🌍</span>
            <div>
              <p className="text-xs font-semibold text-indigo-800">Cross-border targeting activated</p>
              <p className="text-xs text-indigo-600 mt-0.5">AI Matching will prioritize agencies with international buyer networks (Russia, Germany, UK, UAE, etc.)</p>
            </div>
          </div>
        )}
      </Section>

      {/* ── REMOTE VIEWING ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-semibold text-gray-700">Remote viewings available</p>
          <p className="text-xs text-gray-500 mt-0.5">Agencies can arrange online tours for foreign buyers</p>
        </div>
        <Toggle
          checked={step2.remote_viewing}
          onChange={(v) => updateStep2({ remote_viewing: v })}
        />
      </div>

      {/* ── EXCLUSIVE ────────────────────────────────────────────────────── */}
      <Section title="Open to exclusive agency agreement?">
        <div className="space-y-2">
          {EXCLUSIVE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                step2.exclusive_agreement === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                name="exclusive"
                value={opt.value}
                checked={step2.exclusive_agreement === opt.value}
                onChange={() => updateStep2({ exclusive_agreement: opt.value })}
                className="accent-blue-600 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* ── SUMMARY BOX ──────────────────────────────────────────────────── */}
      {step2.asking_price && step2.asking_price > 0 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
          <p className="text-sm font-semibold text-blue-800">
            {step2.currency} {step2.asking_price.toLocaleString()}
            {step2.negotiable && ' · Negotiable'}
            {(step2 as any).commission_pct > 0 && ` · ${(step2 as any).commission_pct}% commission`}
          </p>
          <p className="text-xs text-blue-600">
            AI will match agencies specializing in this price range
            {isCrossBorder ? ' with international buyer access' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
