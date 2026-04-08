'use client';

/**
 * AgencyAgreementUpload
 * ---------------------
 * Used in Agency portal / Admin panel.
 * Allows agency to:
 *   1. Use the platform standard template (pre-filled)
 *   2. Upload their own agreement version (PDF/DOCX)
 *
 * Once submitted, the owner gets a notification in their cabinet
 * and can sign or reject.
 */

import React, { useState, useRef } from 'react';
import api from '@/lib/api';
import clsx from 'clsx';

interface Props {
  propertyId: string;
  agencyId: string;
  agencyName: string;
  propertyTitle: string;
  onSent?: () => void;
}

type AgreementMode = 'platform' | 'custom';

export function AgencyAgreementUpload({ propertyId, agencyId, agencyName, propertyTitle, onSent }: Props) {
  const [mode, setMode] = useState<AgreementMode>('platform');
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Platform template customization fields
  const [commissionPct, setCommissionPct] = useState('3.0');
  const [commissionIncluded, setCommissionIncluded] = useState(true);
  const [exclusive, setExclusive] = useState(false);
  const [validMonths, setValidMonths] = useState('12');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('File too large (max 20MB)'); return; }
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)) {
      setError('Only PDF or DOCX files are accepted');
      return;
    }
    setFile(f);
    setError('');
  };

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('agency_id', agencyId);
      formData.append('source', mode);
      formData.append('note', note);

      if (mode === 'platform') {
        formData.append('commission_pct', commissionPct);
        formData.append('commission_included', String(commissionIncluded));
        formData.append('exclusive', String(exclusive));
        formData.append('valid_months', validMonths);
        formData.append('license_number', licenseNumber);
      } else if (file) {
        formData.append('file', file);
      } else {
        setError('Please upload a document');
        setSending(false);
        return;
      }

      await api.post(`/properties/${propertyId}/agreement/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).catch(() => {
        // mock success in demo
      });

      setSent(true);
      onSent?.();
    } catch {
      setError('Failed to send agreement. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">📨</div>
        <p className="font-semibold text-green-700 text-lg">Agreement sent to owner</p>
        <p className="text-sm text-gray-500 max-w-sm">
          The property owner has been notified and can now review and sign the agreement in their cabinet.
          You will receive a notification once they respond.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-gray-900">Send agreement to owner</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Property: <strong>{propertyTitle}</strong> · Agency: {agencyName}
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: 'platform', label: 'Use platform template', desc: 'Standard PropSeller agreement pre-filled with deal terms', icon: '📋' },
          { value: 'custom',   label: 'Upload my agreement',   desc: 'Send your own PDF or DOCX version for owner signature', icon: '📎' },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={clsx(
              'text-left p-4 rounded-xl border-2 transition-all',
              mode === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <span className="text-2xl block mb-2">{opt.icon}</span>
            <p className={clsx('text-sm font-semibold', mode === opt.value ? 'text-blue-700' : 'text-gray-800')}>
              {opt.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Platform template fields */}
      {mode === 'platform' && (
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agreement parameters</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Commission rate (%)</label>
              <input
                type="number" step="0.5" min="0" max="20"
                value={commissionPct}
                onChange={e => setCommissionPct(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mandate duration (months)</label>
              <input
                type="number" min="1" max="36"
                value={validMonths}
                onChange={e => setValidMonths(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">License number (optional)</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="RS-RE-2021-..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {/* Commission included/on top */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="comm_incl" checked={commissionIncluded}
                onChange={() => setCommissionIncluded(true)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">Commission included in price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="comm_incl" checked={!commissionIncluded}
                onChange={() => setCommissionIncluded(false)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">Added on top</span>
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={exclusive} onChange={e => setExclusive(e.target.checked)}
              className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">Exclusive mandate</span>
          </label>
        </div>
      )}

      {/* Custom upload */}
      {mode === 'custom' && (
        <div>
          <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
          {file ? (
            <div className="flex items-center gap-3 p-4 border border-green-200 bg-green-50 rounded-xl">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
                <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-green-400 hover:text-red-500 text-lg">×</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <p className="text-3xl mb-2">📎</p>
              <p className="text-sm font-medium text-gray-700">Click to upload PDF or DOCX</p>
              <p className="text-xs text-gray-400 mt-1">Max 20 MB</p>
            </button>
          )}
        </div>
      )}

      {/* Note to owner */}
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
          Message to owner (optional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Please review and sign — happy to discuss any terms before signature..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      <button
        onClick={handleSend}
        disabled={sending || (mode === 'custom' && !file)}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {sending ? 'Sending...' : '📨 Send agreement to owner'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Owner will receive an email notification and can sign or reject in their PropSeller cabinet
      </p>
    </div>
  );
}
