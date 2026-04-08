'use client';

import React, { useState } from 'react';
import { OfferDraft } from '@/lib/types';
import clsx from 'clsx';

interface OfferPreviewProps {
  offer: OfferDraft;
  onEdit: (field: keyof OfferDraft, value: string) => void;
  coverPhotoUrl?: string;
  propertyTitle: string;
  propertyLocation: string;
}

type Lang = 'en' | 'ru' | 'sr';

const LANG_LABELS: Record<Lang, string> = {
  en: '🇬🇧 English',
  ru: '🇷🇺 Russian',
  sr: '🇷🇸 Serbian',
};

interface EditableFieldProps {
  label: string;
  value: string;
  fieldKey: keyof OfferDraft;
  multiline?: boolean;
  onSave: (key: keyof OfferDraft, value: string) => void;
}

function EditableField({ label, value, fieldKey, multiline = false, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(fieldKey, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        {!editing && (
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none resize-none"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none"
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

export function OfferPreview({ offer, onEdit, coverPhotoUrl, propertyTitle, propertyLocation }: OfferPreviewProps) {
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [view, setView] = useState<'email' | 'whatsapp' | 'raw'>('email');

  return (
    <div className="space-y-5">
      {/* Language tabs */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Language versions</p>
        <div className="flex gap-2">
          {(['en', 'ru', 'sr'] as Lang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                activeLang === lang
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {LANG_LABELS[lang]}
              {lang === offer.primary_language && (
                <span className="ml-1 text-yellow-400">★</span>
              )}
            </button>
          ))}
        </div>
        {activeLang !== offer.primary_language && (
          <p className="text-xs text-gray-400 mt-1.5">
            ℹ️ Additional language version — translated by AI
          </p>
        )}
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {([
          { key: 'email', label: '📧 Email' },
          { key: 'whatsapp', label: '💬 WhatsApp' },
          { key: 'raw', label: '📝 Raw text' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Email preview */}
      {view === 'email' && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          {/* Email header */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">From:</span>
              <span>listings@propseller.ai</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">To:</span>
              <span className="text-blue-600">[Agency email — matched agencies]</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-500 font-medium mt-0.5">Subject:</span>
              <div className="flex-1">
                <EditableField
                  label=""
                  value={offer.subject_line}
                  fieldKey="subject_line"
                  onSave={onEdit}
                />
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="p-5 space-y-5 bg-white">
            {/* Cover photo */}
            {coverPhotoUrl && (
              <img
                src={coverPhotoUrl}
                alt="Property"
                className="w-full h-52 object-cover rounded-xl"
              />
            )}

            {/* Short pitch */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <EditableField
                label="Short pitch (opening line)"
                value={offer.short_pitch}
                fieldKey="short_pitch"
                onSave={onEdit}
              />
            </div>

            {/* Full pitch */}
            <div className="space-y-2">
              <EditableField
                label="Full agency pitch"
                value={offer.full_pitch}
                fieldKey="full_pitch"
                multiline
                onSave={onEdit}
              />
            </div>

            {/* Property card in email */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Property summary</p>
              <p className="font-semibold text-gray-800">{propertyTitle}</p>
              <p className="text-sm text-gray-500">📍 {propertyLocation}</p>
              <div className="mt-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg"
                >
                  View full listing →
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
              <p>This message was sent via PropSeller AI on behalf of the property owner.</p>
              <p>To unsubscribe from future property notifications: <span className="text-blue-500 cursor-pointer">unsubscribe</span></p>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp preview */}
      {view === 'whatsapp' && (
        <div className="bg-[#ECE5DD] rounded-2xl p-4">
          <div className="max-w-xs">
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm space-y-2">
              <p className="text-xs font-semibold text-green-700">PropSeller AI</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                🏠 <strong>New property opportunity</strong>{'\n\n'}
                {offer.short_pitch}
              </p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">📍 {propertyLocation}</p>
                <p className="text-xs text-blue-600 mt-1">View full details →</p>
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">via WhatsApp Business</p>
            </div>
          </div>
        </div>
      )}

      {/* Raw text */}
      {view === 'raw' && (
        <div className="bg-gray-900 rounded-xl p-4">
          <pre className="text-xs text-green-400 whitespace-pre-wrap leading-relaxed font-mono">
{`SUBJECT: ${offer.subject_line}

---PITCH---
${offer.short_pitch}

${offer.full_pitch}

---PROPERTY---
${propertyTitle}
${propertyLocation}`}
          </pre>
        </div>
      )}

      {/* Char counts */}
      <div className="flex gap-4 text-xs text-gray-400">
        <span>Subject: {offer.subject_line.length} chars</span>
        <span>Pitch: {offer.full_pitch.length} chars</span>
      </div>
    </div>
  );
}
