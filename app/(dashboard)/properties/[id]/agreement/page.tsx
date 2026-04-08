'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { AgreementTemplate, AgreementData } from '@/components/agreements/AgreementTemplate';
import clsx from 'clsx';

type AgreementStatus = 'pending_owner' | 'pending_agency' | 'signed_both' | 'rejected' | 'expired';

interface AgreementMeta {
  id: string;
  status: AgreementStatus;
  source: 'platform_template' | 'agency_upload';
  agency_name: string;
  agency_file_url?: string;    // if agency uploaded their own PDF
  signed_by_owner_at?: string;
  signed_by_agency_at?: string;
  created_at: string;
  expires_at?: string;
  agreement_data: AgreementData;
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_AGREEMENT: AgreementMeta = {
  id: 'agr-001',
  status: 'pending_owner',
  source: 'platform_template',
  agency_name: 'RE Capital Serbia',
  created_at: '2026-04-08T10:00:00Z',
  expires_at: '2027-04-08T10:00:00Z',
  agreement_data: {
    agreement_number: 'PS-2026-0042',
    date: '2026-04-08',
    valid_until: '2027-04-08',
    seller: {
      full_name: 'Ivan Petrov',
      email: 'ivan@example.com',
      phone: '+381 60 1234567',
      address: 'Knez Mihailova 1, Belgrade',
      country: 'Serbia',
    },
    agency: {
      full_name: 'RE Capital Serbia d.o.o.',
      email: 'info@recapital.rs',
      phone: '+381 11 2345678',
      address: 'Terazije 23, Belgrade, Serbia',
      country: 'Serbia',
      license_number: 'RS-RE-2021-0089',
    },
    property: {
      title: '3-bed apartment, Vracar',
      address: 'Vojvode Misica 12',
      city: 'Belgrade',
      country: 'Serbia',
      property_type: 'Apartment',
      area_sqm: 92,
      asking_price: 210000,
      currency: 'EUR',
      min_acceptable_price: 195000,
      commission_pct: 3.0,
      commission_included: true,
      notary_pct: 2.5,
      notary_who_pays: 'buyer',
    },
    exclusive: false,
    governing_law: 'Serbia',
    language: 'en',
  },
};

const STATUS_CONFIG: Record<AgreementStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending_owner:  { label: 'Awaiting your signature', color: 'text-orange-700', bg: 'bg-orange-100', icon: '✍️' },
  pending_agency: { label: 'Awaiting agency signature', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: '⏳' },
  signed_both:    { label: 'Fully executed',           color: 'text-green-700',  bg: 'bg-green-100',  icon: '✅' },
  rejected:       { label: 'Rejected',                 color: 'text-red-700',    bg: 'bg-red-100',    icon: '✗' },
  expired:        { label: 'Expired',                  color: 'text-gray-500',   bg: 'bg-gray-100',   icon: '⌛' },
};

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [agreement, setAgreement] = useState<AgreementMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agreement' | 'agency_doc'>('agreement');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}/agreement`).catch(() => ({ data: MOCK_AGREEMENT }));
        setAgreement(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId]);

  const handleSign = async (signatureData: { full_name: string; timestamp: string }) => {
    await api.post(`/properties/${propertyId}/agreement/${agreement!.id}/sign`, signatureData).catch(() => {});
    setAgreement(prev => prev ? {
      ...prev,
      status: 'pending_agency',
      signed_by_owner_at: signatureData.timestamp,
    } : prev);
    setSignSuccess(true);
  };

  const handleReject = async () => {
    setRejecting(true);
    await api.post(`/properties/${propertyId}/agreement/${agreement!.id}/reject`, { note: rejectNote }).catch(() => {});
    setAgreement(prev => prev ? { ...prev, status: 'rejected' } : prev);
    setRejecting(false);
    setRejectModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <p className="text-3xl mb-2">📄</p>
          <p className="text-sm">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-5xl mb-4">📭</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No agreement found</h2>
        <p className="text-gray-500 text-sm mb-6">No agency has sent an agreement for this property yet.</p>
        <Link href={`/properties/${propertyId}`} className="text-blue-600 hover:underline text-sm">
          ← Back to property
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[agreement.status];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}`} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            ← Back to property
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Agency Agreement</h1>
          <p className="text-sm text-gray-500 mt-0.5">With {agreement.agency_name}</p>
        </div>
        <span className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold', cfg.bg, cfg.color)}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Sign success banner */}
      {signSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">✅</div>
          <div>
            <p className="font-semibold text-green-800">Agreement signed successfully</p>
            <p className="text-sm text-green-600 mt-0.5">
              Your signature has been recorded. The agency has been notified and will countersign.
              A copy will be sent to your email once fully executed.
            </p>
          </div>
        </div>
      )}

      {/* Source badge + tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('agreement')}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'agreement' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              📄 {agreement.source === 'platform_template' ? 'Platform template' : 'PropSeller standard'}
            </button>
            {agreement.source === 'agency_upload' && agreement.agency_file_url && (
              <button
                onClick={() => setActiveTab('agency_doc')}
                className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'agency_doc' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                🏢 Agency version
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Download */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ⬇️ Download PDF
            </button>
            {/* Reject (only if pending_owner) */}
            {agreement.status === 'pending_owner' && !signSuccess && (
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                ✗ Reject
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'agreement' && (
            <AgreementTemplate
              data={agreement.agreement_data}
              mode={agreement.status === 'pending_owner' && !signSuccess ? 'sign' : 'preview'}
              onSign={handleSign}
              alreadySigned={!!agreement.signed_by_owner_at || signSuccess}
              signedAt={agreement.signed_by_owner_at}
            />
          )}

          {activeTab === 'agency_doc' && agreement.agency_file_url && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="text-5xl">📋</div>
              <p className="text-gray-700 font-medium">Agency's version of the agreement</p>
              <p className="text-sm text-gray-400">Uploaded by {agreement.agency_name}</p>
              <a
                href={agreement.agency_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                ↗ Open document
              </a>
              <p className="text-xs text-gray-400 max-w-sm text-center">
                Review the agency's document carefully. You can sign the platform template above OR contact the agency to request modifications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Agreement timeline</p>
        <div className="space-y-3">
          {[
            { label: 'Agreement created', date: agreement.created_at, done: true },
            { label: 'Signed by you', date: agreement.signed_by_owner_at, done: !!agreement.signed_by_owner_at || signSuccess },
            { label: 'Countersigned by agency', date: agreement.signed_by_agency_at, done: !!agreement.signed_by_agency_at },
            { label: 'Agreement fully executed', date: agreement.status === 'signed_both' ? agreement.signed_by_agency_at : undefined, done: agreement.status === 'signed_both' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0',
                step.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              )}>
                {step.done ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <p className={clsx('text-sm', step.done ? 'text-gray-800 font-medium' : 'text-gray-400')}>{step.label}</p>
              </div>
              {step.date && (
                <p className="text-xs text-gray-400">{new Date(step.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reject modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Reject this agreement</h3>
            <p className="text-sm text-gray-500">
              The agency will be notified. You can request modifications or ask them to send a revised version.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">Reason / feedback (optional)</label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={3}
                placeholder="e.g. Commission rate too high, terms need modification..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? 'Rejecting...' : '✗ Reject agreement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
