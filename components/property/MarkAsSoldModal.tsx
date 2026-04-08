'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import clsx from 'clsx';

interface MarkAsSoldModalProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SOLD_REASONS = [
  { value: 'sold_via_platform', label: 'Sold via an agency from this platform', icon: '🎯' },
  { value: 'sold_externally',   label: 'Sold through another channel',          icon: '🔗' },
  { value: 'no_longer_selling', label: 'No longer selling this property',       icon: '🚫' },
  { value: 'temporarily_off',   label: 'Temporarily off market',                icon: '⏸' },
];

type Step = 'confirm' | 'details' | 'success';

export function MarkAsSoldModal({ propertyId, propertyTitle, onClose, onSuccess }: MarkAsSoldModalProps) {
  const [step, setStep] = useState<Step>('confirm');
  const [reason, setReason] = useState('');
  const [soldDate, setSoldDate] = useState(new Date().toISOString().split('T')[0]);
  const [finalPrice, setFinalPrice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelNow, setCancelNow] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await api.post(`/properties/${propertyId}/sold`, {
        sold_reason: reason,
        sold_at: soldDate || undefined,
        sold_price: finalPrice ? parseFloat(finalPrice) : undefined,
        feedback: feedback || undefined,
        cancel_subscription_immediately: cancelNow,
      });
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="text-4xl mb-3">🏡</div>
              <h2 className="text-xl font-bold">Mark as Sold</h2>
              <p className="text-green-100 text-sm mt-1">
                Congratulations! This will stop your distribution campaign and billing.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm font-semibold text-amber-800">{propertyTitle}</p>
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ This action will:
                </p>
                <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Stop all active distribution campaigns</li>
                  <li>Disable future distribution waves</li>
                  <li>Cancel upcoming billing</li>
                  <li>Add a "Sold" badge to your listing</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all"
                >
                  Yes, mark as sold →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ← Back
              </button>
              <h2 className="text-base font-semibold text-gray-900">Sold details</h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">How was it sold? *</label>
                <div className="space-y-2">
                  {SOLD_REASONS.map(r => (
                    <label
                      key={r.value}
                      className={clsx(
                        'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                        reason === r.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-green-600"
                      />
                      <span className="text-lg">{r.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date + price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date sold</label>
                  <input
                    type="date"
                    value={soldDate}
                    onChange={e => setSoldDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Final price <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={finalPrice}
                    onChange={e => setFinalPrice(e.target.value)}
                    placeholder="e.g. 230000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Feedback <span className="font-normal text-gray-400">(optional — helps us improve)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="How was your experience with PropSeller AI?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Billing option */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelNow}
                    onChange={e => setCancelNow(e.target.checked)}
                    className="w-4 h-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cancel subscription immediately</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Otherwise, access continues until end of current billing period
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className={clsx(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                  reason && !submitting
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                ) : (
                  '✅ Confirm — Mark as Sold'
                )}
              </button>
            </div>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Congratulations!</h2>
            <p className="text-gray-500 mt-2">
              Your property has been marked as sold. Campaign stopped, billing cancelled.
            </p>
            <div className="mt-4 space-y-1 text-xs text-gray-400">
              <p>✓ Distribution campaign stopped</p>
              <p>✓ Future billing disabled</p>
              <p>✓ Listing updated with Sold badge</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
