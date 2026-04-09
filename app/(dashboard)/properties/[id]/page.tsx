'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Property, DistributionCampaign, Lead } from '@/lib/types';
import api from '@/lib/api';
import { DEMO_MODE } from '@/store/auth';
import clsx from 'clsx';

type Tab = 'overview' | 'distribution' | 'leads' | 'billing';

// âââ Demo data for property detail âââââââââââââââââââââââââââââââââââââââââââ
const DEMO_PROPERTY_MAP: Record<string, Partial<Property> & { [k: string]: any }> = {
  'demo-1': {
    id: 'demo-1', user_id: 'demo-user-001',
    property_type: 'villa' as any, address: 'Jadranska bb 14', city: 'Budva', country: 'Montenegro',
    region: 'Coastal', asking_price: 485000, currency: 'EUR',
    status: 'in_distribution' as any, area_sqm: 210, bedrooms: 4, bathrooms: 3,
    description: 'Luxury sea-view villa with private pool and terrace. Premium finishes throughout. 180Â° Adriatic views. Gated community with 24/7 security.',
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-04-01T12:00:00Z',
  },
  'demo-2': {
    id: 'demo-2', user_id: 'demo-user-001',
    property_type: 'apartment' as any, address: 'Knez Mihailova 28', city: 'Belgrade', country: 'Serbia',
    region: 'Central', asking_price: 127000, currency: 'EUR',
    status: 'active' as any, area_sqm: 68, bedrooms: 2, bathrooms: 1,
    description: 'City-centre apartment, fully renovated 2022. High ceilings, original parquet floors, new kitchen. 2 min walk from Kalemegdan fortress.',
    created_at: '2026-03-18T09:00:00Z', updated_at: '2026-04-05T14:00:00Z',
  },
  'demo-3': {
    id: 'demo-3', user_id: 'demo-user-001',
    property_type: 'land' as any, address: 'Zlatibor Highway, plot 44', city: 'Zlatibor', country: 'Serbia',
    region: 'Mountain', asking_price: 68000, currency: 'EUR',
    status: 'awaiting_approval' as any, area_sqm: 1800, bedrooms: 0, bathrooms: 0,
    description: 'Mountain building plot with full planning permission for a 4-unit residential complex. Utilities on site. Panoramic views.',
    created_at: '2026-04-02T11:00:00Z', updated_at: '2026-04-07T09:00:00Z',
  },
};

const DEMO_CAMPAIGN_MAP: Record<string, any> = {
  'demo-1': {
    id: 'camp-demo-1', property_id: 'demo-1', status: 'active',
    wave_current: 1, wave_total: 3, agencies_total: 18, agencies_replied: 4,
    created_at: '2026-04-01T08:00:00Z',
  },
  'demo-2': {
    id: 'camp-demo-2', property_id: 'demo-2', status: 'active',
    wave_current: 1, wave_total: 3, agencies_total: 12, agencies_replied: 2,
    created_at: '2026-04-05T10:00:00Z',
  },
  'demo-3': null,
};

const DEMO_LEADS_MAP: Record<string, any[]> = {
  'demo-1': [
    { id: 'l1', agency_name: 'Engel & VÃ¶lkers', contact_person: 'Klaus Weber', email: 'k.weber@ev.de', status: 'interested', response_date: '2 hours ago', message: 'Have 3 qualified buyers interested in this range. Can arrange viewing this week.' },
    { id: 'l2', agency_name: "Sotheby's MNE", contact_person: 'Marina PopoviÄ', email: 'm.popovic@sothebys.com', status: 'viewing', response_date: '5 hours ago', message: 'HNWI client very interested. Requesting exclusive viewing + all documents.' },
    { id: 'l3', agency_name: 'Savills Intl', contact_person: 'James Clarke', email: 'j.clarke@savills.com', status: 'new', response_date: '1 day ago', message: 'Received listing. Forwarding to our Balkans desk for review.' },
  ],
  'demo-2': [
    { id: 'l4', agency_name: 'Win-Win Solution', contact_person: 'Nikola JovanoviÄ', email: 'contact@win-winsolution.com', status: 'interested', response_date: '3 hours ago', message: 'Central Belgrade apartment is perfect for our buyers. Ready to schedule viewing next week.' },
    { id: 'l5', agency_name: 'Knight Frank Serbia', contact_person: 'Ana SimiÄ', email: 'a.simic@knightfrank.rs', status: 'new', response_date: '6 hours ago', message: 'Reviewing. Our Belgrade team will follow up.' },
  ],
  'demo-3': [],
};

const STATUS_CONFIG: Record<string, { label: string; variant: string; desc: string }> = {
  draft:                { label: 'Draft',              variant: 'default', desc: 'Complete your listing to continue' },
  pending_verification: { label: 'Pending review',     variant: 'warning', desc: 'Our team is reviewing' },
  ready_for_payment:    { label: 'Ready to activate',  variant: 'info',    desc: 'Choose a plan' },
  awaiting_approval:    { label: 'Approve offer',      variant: 'warning', desc: 'AI prepared your offer' },
  active:               { label: 'Active',             variant: 'success', desc: 'Distribution running' },
  in_distribution:      { label: 'Distributing',       variant: 'success', desc: 'Sending to agencies' },
  paused:               { label: 'Paused',             variant: 'default', desc: 'Campaign paused' },
  sold:                 { label: 'Sold',               variant: 'success', desc: 'Congratulations!' },
  archived:             { label: 'Archived',           variant: 'default', desc: 'Listing archived' },
};

function PropertyDetailPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [property, setProperty] = useState<Property | null>(null);
  const [campaign, setCampaign] = useState<DistributionCampaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('step') === 'payment') setActiveTab('billing');
  }, [searchParams]);

  const loadData = useCallback(async () => {
    // ââ DEMO MODE: serve local data, no backend needed ââââââââââââââââââââââ
    if (DEMO_MODE || id in DEMO_PROPERTY_MAP) {
      const demoId = id in DEMO_PROPERTY_MAP ? id : 'demo-1';
      setProperty(DEMO_PROPERTY_MAP[demoId] as Property);
      setCampaign(DEMO_CAMPAIGN_MAP[demoId]);
      setLeads(DEMO_LEADS_MAP[demoId] || []);
      setLoading(false);
      return;
    }
    // ââ Real API âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    try {
      const [propRes, campaignRes, leadsRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get(`/distributions/${id}/campaign`).catch(() => ({ data: null })),
        api.get(`/leads?property_id=${id}`).catch(() => ({ data: [] })),
      ]);
      setProperty(propRes.data);
      setCampaign(campaignRes.data);
      setLeads(leadsRes.data || []);

      if (campaignRes.data?.id) {
        const dlv = await api.get(`/distributions/${campaignRes.data.id}/deliveries`).catch(() => ({ data: [] }));
        setDeliveries(dlv.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePause = async () => {
    if (!campaign) return;
    setActionLoading('pause');
    try { await api.post(`/distributions/${campaign.id}/pause`); await loadData(); }
    finally { setActionLoading(null); }
  };

  const handleResume = async () => {
    if (!campaign) return;
    setActionLoading('resume');
    try { await api.post(`/distributions/${campaign.id}/resume`); await loadData(); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">ð</p>
          <p className="text-gray-600">Property not found</p>
          <Link href="/dashboard" className="text-blue-600 text-sm mt-2 block">â Dashboard</Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[property.status] || { label: property.status, variant: 'default', desc: '' };
  const title = `${(property.property_type || 'Property').charAt(0).toUpperCase()}${(property.property_type || '').slice(1)} Â· ${property.area_sqm || '?'}mÂ²`;
  const location = [property.city, property.region, property.country].filter(Boolean).join(', ');
  const isActive = ['active', 'in_distribution'].includes(property.status);
  const canSell = !['sold', 'archived', 'draft'].includes(property.status);
  const needsApproval = property.status === 'awaiting_approval';
  const needsPayment = property.status === 'ready_for_payment';
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview',     label: 'Overview' },
    { key: 'distribution', label: 'Distribution',  badge: deliveries.length || undefined },
    { key: 'leads',        label: 'Leads',          badge: newLeadsCount || undefined },
    { key: 'billing',      label: 'Billing' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/dashboard" className="hover:text-gray-800">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate">{title}</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 items-start flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 flex items-center justify-center text-2xl">
                ð 
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                  <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
                  {newLeadsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newLeadsCount} new</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">ð {location}</p>
                {property.asking_price && (
                  <p className="text-base font-semibold text-blue-700 mt-0.5">
                    {property.currency} {property.asking_price.toLocaleString()}
                    {property.negotiable && <span className="text-xs font-normal text-gray-400 ml-1">Â· Negotiable</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              {/* Agreement notification badge */}
              <Link
                href={`/properties/${id}/agreement`}
                className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 flex items-center gap-1.5"
              >
                ð Agreement
                {/* Show orange dot if pending signature */}
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
              </Link>
              {needsApproval && (
                <Link href={`/dashboard/properties/${id}/offer-approval`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 animate-pulse">
                  â¡ Approve offer
                </Link>
              )}
              {needsPayment && (
                <button onClick={() => setActiveTab('billing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                  ð³ Activate
                </button>
              )}
              {isActive && campaign?.status === 'active' && (
                <button onClick={handlePause} disabled={actionLoading === 'pause'}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  {actionLoading === 'pause' ? 'â¦' : 'â¸ Pause'}
                </button>
              )}
              {campaign?.status === 'paused' && (
                <button onClick={handleResume} disabled={actionLoading === 'resume'}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {actionLoading === 'resume' ? 'â¦' : 'â¶ Resume'}
                </button>
              )}
              {canSell && (
                <button onClick={() => setShowSoldModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
                  â Mark Sold
                </button>
              )}
              <Link href={`/dashboard/properties/${id}/edit`}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                âï¸ Edit
              </Link>
            </div>
          </div>

          {/* Approval banner */}
          {needsApproval && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
              <span className="text-orange-500 text-lg">â¡</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-800">Review your AI-prepared offer â nothing sent until you approve</p>
              </div>
              <Link href={`/dashboard/properties/${id}/offer-approval`}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600">
                Review â
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 mt-4 -mb-px">
            {TABS.map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5',
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}>
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={clsx(
                    'text-xs font-bold px-1.5 py-0.5 rounded-full',
                    tab.key === 'leads' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  )}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {activeTab === 'overview' && (
          <div style={{marginBottom:24,borderRadius:16,overflow:"hidden"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
<div style={{gridColumn:"1/3",gridRow:"1/3",minHeight:180,background:"linear-gradient(135deg,rgba(245,194,0,0.12),rgba(59,91,219,0.18))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer"}}>
<div style={{textAlign:"center",opacity:0.5}}><div style={{fontSize:52}}>🏠</div><div style={{color:"rgba(240,240,255,0.6)",fontSize:"0.78rem",marginTop:6}}>Main photo</div></div>
<div style={{position:"absolute",bottom:10,left:10,background:"rgba(7,7,15,0.75)",backdropFilter:"blur(8px)",borderRadius:8,padding:"3px 10px",fontSize:"0.72rem",color:"rgba(240,240,255,0.8)"}}>📷 1 / 3</div>
</div>
<div style={{minHeight:87,background:"linear-gradient(135deg,rgba(59,91,219,0.14),rgba(112,72,232,0.18))",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><span style={{fontSize:28,opacity:0.4}}>🛋️</span></div>
<div style={{minHeight:87,background:"linear-gradient(135deg,rgba(74,222,128,0.1),rgba(59,91,219,0.15))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer"}}>
<span style={{fontSize:28,opacity:0.4}}>🌊</span>
<div style={{position:"absolute",inset:0,background:"rgba(7,7,15,0.45)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:700,fontSize:"0.82rem"}}>+3 more</span></div>
</div>
</div></div>
<div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign performance</h3>
              <CampaignStats campaign={campaign} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Property details</h3>
                <div className="grid grid-cols-2 gap-y-2">
                  {[
                    ['Type', property.property_type],
                    ['Area', property.area_sqm ? `${property.area_sqm} mÂ²` : 'â'],
                    ['Bedrooms', property.bedrooms ?? 'â'],
                    ['Bathrooms', property.bathrooms ?? 'â'],
                    ['Condition', property.condition?.replace('_', ' ') || 'â'],
                    ['Year built', property.year_built || 'â'],
                  ].map(([k, v]) => (
                    <React.Fragment key={String(k)}>
                      <span className="text-gray-400 text-xs">{k}</span>
                      <span className="text-gray-800 font-medium text-xs capitalize">{String(v)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">Recent replies</h3>
                  {leads.length > 3 && (
                    <button onClick={() => setActiveTab('leads')} className="text-xs text-blue-600 hover:underline">
                      See all ({leads.length})
                    </button>
                  )}
                </div>
                {leads.length === 0 ? (
                  <p className="text-xs text-gray-400">No replies yet</p>
                ) : (
                  <div className="space-y-2">
                    {leads.slice(0, 3).map(lead => (
                      <div key={lead.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                          {(lead.agency_name || 'A').charAt(0)}
                        </div>
                        <p className="text-xs font-medium text-gray-800 flex-1 truncate">{lead.agency_name}</p>
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'interested' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'
                        )}>{lead.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
            <h3 className="font-semibold text-gray-900">Campaign & distribution</h3>
            <CampaignStats campaign={campaign} />
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery report</h3>
              <DistributionReport deliveries={deliveries} />
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">Leads & replies</h3>
              <p className="text-xs text-gray-400 mt-0.5">All responses forwarded to you via email & Telegram/WhatsApp</p>
            </div>
            <LeadsPanel leads={leads} onUpdate={loadData} />
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            {needsPayment ? (
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-1">Activate distribution</h3>
                <p className="text-blue-100 text-sm mb-5">Choose a plan to start sending your property to matched agencies</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Promo', price: 'â¬5', period: '3 months', features: ['Full AI packaging', '30 agencies matched', '3-wave distribution', 'All notifications'], badge: 'ð¥ Best start' },
                    { name: 'Standard', price: 'â¬29', period: 'per month', features: ['Everything in Promo', 'Priority matching', 'Follow-up waves', 'Featured listing'], badge: 'â­ Most popular' },
                  ].map(plan => (
                    <div key={plan.name} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold">{plan.name}</p>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{plan.badge}</span>
                      </div>
                      <p className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal text-blue-200">{plan.period}</span></p>
                      <ul className="mt-3 space-y-1 mb-4">
                        {plan.features.map(f => (
                          <li key={f} className="text-xs text-blue-100 flex items-center gap-1.5">
                            <span className="text-green-400">â</span> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.post('/payments/create-checkout', { property_id: id, plan: plan.name.toLowerCase() });
                            if (res.data?.url) window.location.href = res.data.url;
                          } catch {}
                        }}
                        className="w-full py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50">
                        Start with {plan.name} â
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Billing</h3>
                <Link href="/dashboard/billing" className="text-sm text-blue-600 hover:underline">
                  Open billing settings â
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {showSoldModal && (
        <MarkAsSoldModal
          propertyId={id}
          propertyTitle={title}
          onClose={() => setShowSoldModal(false)}
          onSuccess={() => { setShowSoldModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loadingâ¦</p></div>}>
      <PropertyDetailPageInner />
    </Suspense>
  );
}
