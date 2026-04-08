'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OfferPreview } from '@/components/offer/OfferPreview';
import { AgencyMatchList } from '@/components/offer/AgencyMatchList';
import { Badge } from '@/components/ui/Badge';
import { OfferDraft, MatchScore, Property } from '@/lib/types';
import api from '@/lib/api';
import { DEMO_MODE } from '@/store/auth';
import clsx from 'clsx';

// ─── Demo mock data ───────────────────────────────────────────────────────────
const DEMO_MATCHES: MatchScore[] = [
  { id: 'm1', property_id: 'demo', agency_id: 'a1', agency_name: 'DiasporaHome Serbia', total_score: 0.94, rule_score: 0.88, llm_boost: 0.28, wave_number: 1, dimension_scores: { geo: 20, specialisation: 18, buyer_profile: 19, language: 14, cross_border: 12, response_rate: 9, conversion: 5, commission_fit: 2 }, explanation: 'Exceptional specialisation in CIS diaspora buyers. Highest response rate in dataset (92%). Russian-language capability is a direct match for cross-border demand from this market.' },
  { id: 'm2', property_id: 'demo', agency_id: 'a2', agency_name: 'BelgradeProperties Pro', total_score: 0.88, rule_score: 0.82, llm_boost: 0.24, wave_number: 1, dimension_scores: { geo: 20, specialisation: 18, buyer_profile: 16, language: 12, cross_border: 12, response_rate: 8, conversion: 4, commission_fit: 1 }, explanation: 'Strong local presence in Vracar district. Proven diaspora buyer network. Russian + Serbian + English language capability aligns with target buyer profile.' },
  { id: 'm3', property_id: 'demo', agency_id: 'a3', agency_name: 'EastEurope Invest', total_score: 0.81, rule_score: 0.74, llm_boost: 0.22, wave_number: 1, dimension_scores: { geo: 12, specialisation: 16, buyer_profile: 18, language: 13, cross_border: 12, response_rate: 8, conversion: 4, commission_fit: 1 }, explanation: 'Vienna-based with active Russian/CIS investor clientele. Premium cross-border positioning matches property price band. Ideal for foreign investor buyers.' },
  { id: 'm4', property_id: 'demo', agency_id: 'a4', agency_name: 'Moskovskaya Realty', total_score: 0.78, rule_score: 0.71, llm_boost: 0.26, wave_number: 2, dimension_scores: { geo: 8, specialisation: 16, buyer_profile: 17, language: 15, cross_border: 12, response_rate: 9, conversion: 4, commission_fit: 1 }, explanation: 'Direct access to Russian-speaking buyer segment. Very high response rate (88%). Cross-border specialist with significant EU property transactions.' },
  { id: 'm5', property_id: 'demo', agency_id: 'a5', agency_name: 'Balkans Realty Group', total_score: 0.74, rule_score: 0.70, llm_boost: 0.18, wave_number: 2, dimension_scores: { geo: 20, specialisation: 18, buyer_profile: 14, language: 10, cross_border: 12, response_rate: 7, conversion: 4, commission_fit: 1 }, explanation: 'Active foreign investor pipeline from Western Europe. Good language coverage. Commission structure competitive at 3%.' },
  { id: 'm6', property_id: 'demo', agency_id: 'a6', agency_name: 'Danube Property Partners', total_score: 0.70, rule_score: 0.65, llm_boost: 0.20, wave_number: 2, dimension_scores: { geo: 10, specialisation: 15, buyer_profile: 16, language: 12, cross_border: 12, response_rate: 8, conversion: 4, commission_fit: 1 }, explanation: 'Hungarian base provides EU investor access. Strong diaspora connections across Balkans. Multilingual staff a plus for this listing.' },
];

const DEMO_OFFER: any = {
  id: 'offer-demo-001',
  subject_line: '3-bedroom apartment for sale in Vracar, Belgrade — €210,000',
  short_pitch: 'Exceptional 3-bedroom apartment in prime Vracar location. 94m², renovated, private parking. Cross-border specialist outreach active.',
  full_pitch: `Dear [Agency Name],\n\nWe are reaching out on behalf of the property owner with an exclusive opportunity.\n\nA well-appointed 3-bedroom apartment (94m²) in the sought-after Vracar neighbourhood of Belgrade is available for immediate sale at €210,000. The property has been fully renovated and features private parking, a sunny aspect and excellent transport links.\n\nThis property is particularly suited for your diaspora and foreign investor clients given its competitive price point and prime location.\n\nCommission: 3% (negotiable for rapid transaction)\n\nAll documentation is prepared and verified. Remote viewing available.\n\nKind regards,\nPropSeller AI on behalf of the Owner`,
  selected_media_ids: ['p1', 'p2', 'p3', 'p4', 'p5'],
  languages: ['en', 'ru', 'sr'],
};

const DEMO_PROPERTY: any = {
  property_type: 'apartment',
  area_sqm: 94,
  city: 'Belgrade',
  region: 'Vracar',
  country: 'Serbia',
};

type ApprovalAction = 'approving' | 'rejecting' | 'requesting_changes' | null;
type Panel = 'offer' | 'agencies';

export default function OfferApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [offer, setOffer] = useState<OfferDraft | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ApprovalAction>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>('offer');
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [savingEdits, setSavingEdits] = useState(false);

  const loadData = useCallback(async () => {
    // Demo mode: inject mock data after a brief simulated load
    if (DEMO_MODE) {
      setTimeout(() => {
        setProperty(DEMO_PROPERTY);
        setOffer(DEMO_OFFER);
        setMatches(DEMO_MATCHES);
        setLoading(false);
      }, 1200);
      return;
    }
    try {
      const [propRes, offerRes, matchRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get(`/offers/${id}/current`),
        api.get(`/matching/${id}/scores`),
      ]);
      setProperty(propRes.data);
      setOffer(offerRes.data);
      setMatches(matchRes.data || []);
    } catch (err) {
      console.error('Failed to load offer data', err);
      // Fallback to demo data if backend unavailable
      setProperty(DEMO_PROPERTY);
      setOffer(DEMO_OFFER);
      setMatches(DEMO_MATCHES);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditField = (field: keyof OfferDraft, value: string) => {
    if (!offer) return;
    setOffer({ ...offer, [field]: value });
    setHasUnsavedEdits(true);
  };

  const handleSaveEdits = async () => {
    if (!offer) return;
    setSavingEdits(true);
    try {
      await api.patch(`/offers/${offer.id}`, {
        subject_line: offer.subject_line,
        short_pitch: offer.short_pitch,
        full_pitch: offer.full_pitch,
      });
      setHasUnsavedEdits(false);
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setSavingEdits(false);
    }
  };

  const handleApprove = async () => {
    if (!offer) return;

    // Save any pending edits first
    if (hasUnsavedEdits) await handleSaveEdits();

    setAction('approving');
    try {
      await api.post(`/offers/${offer.id}/approve`);
      setApprovalSuccess(true);
      // Redirect to property dashboard after 2s
      setTimeout(() => {
        router.push(`/dashboard/properties/${id}`);
      }, 2500);
    } catch (err) {
      console.error('Approve error', err);
      setAction(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!offer || !changeNote.trim()) return;
    setAction('requesting_changes');
    try {
      await api.post(`/offers/${offer.id}/request-changes`, { note: changeNote });
      setShowChangeModal(false);
      setChangeNote('');
      // Reload — offer will be regenerated
      setLoading(true);
      await loadData();
    } catch (err) {
      console.error('Request changes error', err);
    } finally {
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setAction('rejecting');
    try {
      await api.post(`/offers/${offer.id}/reject`, { note: rejectionNote });
      router.push(`/dashboard/properties/${id}`);
    } catch (err) {
      console.error('Reject error', err);
      setAction(null);
    }
  };

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-gray-600 font-medium">Loading your AI-prepared offer…</p>
          <p className="text-sm text-gray-400 mt-1">Matching agencies and preparing pitch</p>
        </div>
      </div>
    );
  }

  // --- Approval success ---
  if (approvalSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Distribution starts now!</h2>
          <p className="text-gray-500 mt-2">
            Your offer was approved. Wave 1 will be sent to {matches.filter(m => m.wave_number === 1).length} agencies within 24 hours.
          </p>
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 justify-center text-sm text-green-600">
              <span>✓</span> Offer approved & locked
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-blue-600">
              <span>↗</span> Redirecting to your property dashboard…
            </div>
          </div>
        </div>
      </div>
    );
  }

  const propertyTitle = property
    ? `${property.property_type?.charAt(0).toUpperCase()}${property.property_type?.slice(1) || 'Property'} · ${property.area_sqm || ''}m²`
    : 'Property';

  const propertyLocation = property
    ? [property.city, property.region, property.country].filter(Boolean).join(', ')
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/properties/${id}`)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ← Back
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-base font-semibold text-gray-900">Offer Approval</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{propertyTitle} · {propertyLocation}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="warning">⏳ Awaiting your approval</Badge>
            {hasUnsavedEdits && (
              <button
                type="button"
                onClick={handleSaveEdits}
                disabled={savingEdits}
                className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
              >
                {savingEdits ? 'Saving…' : 'Save edits'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white mb-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h2 className="font-bold text-lg">AI has prepared your offer</h2>
              <p className="text-blue-100 text-sm mt-1">
                Review the cover letter and agency list below. You can edit any text before approving.
                <strong className="text-white"> Nothing is sent until you click Approve.</strong>
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <span className="bg-white/20 rounded-full px-3 py-1">📧 {matches.length} agencies matched</span>
                <span className="bg-white/20 rounded-full px-3 py-1">🌍 3 language versions</span>
                <span className="bg-white/20 rounded-full px-3 py-1">📸 {(offer as any)?.selected_media_ids?.length || 5} photos</span>
                <span className="bg-white/20 rounded-full px-3 py-1">⚡ Wave 1: {matches.filter(m => m.wave_number === 1).length} agencies now</span>
              </div>
            </div>
          </div>
        </div>

        {/* 30-day auto-cycle notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🔄</span>
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Automatic re-cycle if not sold</p>
            <p className="text-amber-700 mt-0.5">
              If no deal closes in <strong>30 days</strong>, AI automatically selects a new batch of agencies, prepares a fresh offer, and sends it to you for approval again — until your property is sold.
              Billing pauses the moment you mark it sold.
            </p>
          </div>
        </div>

        {/* Mobile panel switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 lg:hidden">
          {([
            { key: 'offer', label: '📄 Offer content' },
            { key: 'agencies', label: `🎯 Agencies (${matches.length})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePanel(key)}
              className={clsx(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                activePanel === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main content — two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left: Offer preview */}
          <div className={clsx(activePanel !== 'offer' && 'hidden lg:block')}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Offer content</h3>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  ✏️ Click any field to edit
                </span>
              </div>
              {offer && (
                <OfferPreview
                  offer={offer}
                  onEdit={handleEditField}
                  propertyTitle={propertyTitle}
                  propertyLocation={propertyLocation}
                />
              )}
            </div>
          </div>

          {/* Right: Agency list + actions */}
          <div className={clsx('space-y-4', activePanel !== 'agencies' && 'hidden lg:block')}>
            {/* Approve box */}
            <div className="bg-white rounded-2xl border-2 border-green-200 p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Ready to send?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Approving will lock this version and schedule Wave 1 distribution within 24h.
                </p>
              </div>

              {/* Approve */}
              <button
                type="button"
                onClick={handleApprove}
                disabled={action !== null}
                className={clsx(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                  action === null
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {action === 'approving' ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Approving…</>
                ) : (
                  <>✅ Approve & start distribution</>
                )}
              </button>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(true)}
                  disabled={action !== null}
                  className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  🔄 Request changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={action !== null}
                  className="py-2 px-3 rounded-xl border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  ✕ Decline offer
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                You'll receive a distribution report via email & Telegram/WhatsApp
              </p>
            </div>

            {/* Agency match list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Matched agencies</h3>
                <span className="text-xs text-gray-400">{matches.length} total</span>
              </div>
              <AgencyMatchList matches={matches} loading={loading} />
            </div>
          </div>
        </div>
      </div>

      {/* Request Changes Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Request changes</h3>
            <p className="text-sm text-gray-500 mb-4">
              Describe what you'd like to change. AI will regenerate the offer.
            </p>
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Make the pitch more professional, emphasize the sea view, adjust the subject line…"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRequestChanges}
                disabled={!changeNote.trim() || action === 'requesting_changes'}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl font-medium text-sm transition-all',
                  changeNote.trim() && action !== 'requesting_changes'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {action === 'requesting_changes' ? 'Regenerating…' : '🔄 Regenerate offer'}
              </button>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Decline this offer?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will cancel the current offer. You can request a new one later.
            </p>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Optional: tell us why you're declining…"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={action === 'rejecting'}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {action === 'rejecting' ? 'Declining…' : 'Decline offer'}
              </button>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
