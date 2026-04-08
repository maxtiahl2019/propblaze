'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizard';
import { Input } from '@/components/ui/Input';
import clsx from 'clsx';

const CHANNELS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'phone', label: 'Phone call', icon: '📞' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'sr', label: 'Serbian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
];

const HOURS = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'morning', label: 'Morning (8–12)' },
  { value: 'afternoon', label: 'Afternoon (12–18)' },
  { value: 'evening', label: 'Evening (18–21)' },
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
];

export function Step6Contacts() {
  const { step6, updateStep6 } = useWizardStore();

  const toggleChannel = (value: string) => {
    const current = step6.preferred_channels;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length > 0) updateStep6({ preferred_channels: next });
  };

  const toggleLanguage = (value: string) => {
    const current = step6.preferred_languages;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length > 0) updateStep6({ preferred_languages: next });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Contact details</h2>
        <p className="text-gray-500 mt-1">
          This information will be included in your sales pack sent to agencies
        </p>
      </div>

      {/* Pre-fill notice */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <span className="text-blue-600">ℹ️</span>
        <p className="text-xs text-blue-700">
          Pre-filled from your profile. You can customise these contacts for this specific property.
        </p>
      </div>

      {/* Contact fields */}
      <div className="space-y-4">
        <Input
          label="Full name *"
          value={step6.contact_name}
          onChange={(e) => updateStep6({ contact_name: e.target.value })}
          placeholder="Your name"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone *"
            type="tel"
            value={step6.contact_phone}
            onChange={(e) => updateStep6({ contact_phone: e.target.value })}
            placeholder="+381 60 123 4567"
          />
          <Input
            label="Email *"
            type="email"
            value={step6.contact_email}
            onChange={(e) => updateStep6({ contact_email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="WhatsApp number"
            type="tel"
            value={step6.whatsapp_number}
            onChange={(e) => updateStep6({ whatsapp_number: e.target.value })}
            placeholder="+381 60 123 4567"
          />
          <Input
            label="Telegram username"
            value={step6.telegram_username}
            onChange={(e) => updateStep6({ telegram_username: e.target.value })}
            placeholder="@username"
          />
        </div>
      </div>

      {/* Preferred contact channels */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Preferred contact channels
          <span className="font-normal text-gray-400 ml-1">(agencies can reach you via these)</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHANNELS.map((ch) => {
            const active = step6.preferred_channels.includes(ch.value);
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => toggleChannel(ch.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all',
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <span className="text-xl">{ch.icon}</span>
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred languages */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Communication languages
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => toggleLanguage(lang.value)}
              className={clsx(
                'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                step6.preferred_languages.includes(lang.value)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred hours */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Preferred contact hours
        </label>
        <div className="grid grid-cols-3 gap-2">
          {HOURS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => updateStep6({ preferred_hours: h.value })}
              className={clsx(
                'px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left',
                step6.preferred_hours === h.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      {step6.contact_name && step6.contact_email && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Contact preview</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">{step6.contact_name}</p>
            {step6.contact_email && <p className="text-xs text-gray-600">📧 {step6.contact_email}</p>}
            {step6.contact_phone && <p className="text-xs text-gray-600">📞 {step6.contact_phone}</p>}
            {step6.whatsapp_number && <p className="text-xs text-gray-600">💬 WA: {step6.whatsapp_number}</p>}
            {step6.telegram_username && <p className="text-xs text-gray-600">✈️ {step6.telegram_username}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
