'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import clsx from 'clsx';

type CampaignStatus = 'active' | 'completed' | 'paused' | 'failed';
type WaveStatus = 'sent' | 'pending' | 'scheduled' | 'failed';

interface Wave {
  wave_number: number;
  agencies_count: number;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  status: WaveStatus;
  sent_at?: string;
  scheduled_for?: string;
}

interface Campaign {
  id: string;
  property_id: string;
  property_title: string;
  property_city: string;
  property_country: string;
  owner_name: string;
  owner_email: string;
  status: CampaignStatus;
  total_agencies: number;
  total_sent: number;
  total_delivered: number;
  total_replied: number;
  waves: Wave[];
  started_at: string;
  updated_at: string;
  subscription_plan: 'promo' | 'standard';
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1', property_id: 'p5', property_title: 'Sea-view apartment, Split', property_city: 'Split', property_country: 'Croatia',
    owner_name: 'Dmitri L.', owner_email: 'dmitri@example.com', status: 'active',
    total_agencies: 24, total_sent: 24, total_delivered: 22, total_replied: 8,
    waves: [
      { wave_number: 1, agencies_count: 10, sent: 10, delivered: 10, opened: 7, replied: 4, status: 'sent', sent_at: '2026-04-01T10:00:00Z' },
      { wave_number: 2, agencies_count: 10, sent: 10, delivered: 9, opened: 5, replied: 3, status: 'sent', sent_at: '2026-04-04T10:00:00Z' },
      { wave_number: 3, agencies_count: 4, sent: 4, delivered: 3, opened: 2, replied: 1, status: 'sent', sent_at: '2026-04-07T10:00:00Z' },
    ],
    started_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-07T15:00:00Z', subscription_plan: 'standard',
  },
  {
    id: 'c2', property_id: 'p4', property_title: 'House 250m², Limassol', property_city: 'Limassol', property_country: 'Cyprus',
    owner_name: 'Olga V.', owner_email: 'olga@example.com', status: 'active',
    total_agencies: 18, total_sent: 18, total_delivered: 17, total_replied: 6,
    waves: [
      { wave_number: 1, agencies_count: 10, sent: 10, delivered: 10, opened: 8, replied: 4, status: 'sent', sent_at: '2026-04-02T09:00:00Z' },
      { wave_number: 2, agencies_count: 8, sent: 8, delivered: 7, opened: 4, replied: 2, status: 'sent', sent_at: '2026-04-05T09:00:00Z' },
      { wave_number: 3, agencies_count: 0, sent: 0, delivered: 0, opened: 0, replied: 0, status: 'scheduled', scheduled_for: '2026-04-10T09:00:00Z' },
    ],
    started_at: '2026-04-02T09:00:00Z', updated_at: '2026-04-05T12:00:00Z', subscription_plan: 'standard',
  },
  {
    id: 'c3', property_id: 'p7', property_title: 'Land plot 800m², Tivat', property_city: 'Tivat', property_country: 'Montenegro',
    owner_name: 'Pavel C.', owner_email: 'pavel@example.com', status: 'completed',
    total_agencies: 22, total_sent: 22, total_delivered: 21, total_replied: 5,
    waves: [
      { wave_number: 1, agencies_count: 10, sent: 10, delivered: 10, opened: 6, replied: 3, status: 'sent', sent_at: '2026-03-20T10:00:00Z' },
      { wave_number: 2, agencies_count: 10, sent: 10, delivered: 9, opened: 5, replied: 2, status: 'sent', sent_at: '2026-03-24T10:00:00Z' },
      { wave_number: 3, agencies_count: 2, sent: 2, delivered: 2, opened: 1, replied: 0, status: 'sent', sent_at: '2026-03-28T10:00:00Z' },
    ],
    started_at: '2026-03-20T10:00:00Z', updated_at: '2026-04-01T10:00:00Z', subscription_plan: 'standard',
  },
  {
    id: 'c4', property_id: 'p-new', property_title: '2-bed apartment, Novi Sad', property_city: 'Novi Sad', property_country: 'Serbia',
    owner_name: 'Anna K.', owner_email: 'anna@example.com', status: 'paused',
    total_agencies: 14, total_sent: 10, total_delivered: 9, total_replied: 2,
    waves: [
      { wave_number: 1, agencies_count: 10, sent: 10, delivered: 9, opened: 4, replied: 2, status: 'sent', sent_at: '2026-04-03T14:00:00Z' },
      { wave_number: 2, agencies_count: 4, sent: 0, delivered: 0, opened: 0, replied: 0, status: 'pending', scheduled_for: '2026-04-08T14:00:00Z' },
    ],
    started_at: '2026-04-03T14:00:00Z', updated_at: '2026-04-06T09:00:00Z', subscription_plan: 'promo',
  },
];

const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: 'Active',     color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  completed: { label: 'Completed',  color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  paused:    { label: 'Paused',     color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-400' },
  failed:    { label: 'Failed',     color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
};

const WAVE_STATUS: Record<WaveStatus, { label: string; color: string }> = {
  sent:      { label: 'Sent',      color: 'text-green-600' },
  pending:   { label: 'Pending',   color: 'text-yellow-600' },
  scheduled: { label: 'Scheduled', color: 'text-blue-600' },
  failed:    { label: 'Failed',    color: 'text-red-600' },
};

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CampaignCard({ campaign, expanded, onToggle }: {
  campaign: Campaign;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = CAMPAIGN_STATUS[campaign.status];
  const replyRate = campaign.total_sent > 0 ? Math.round((campaign.total_replied / campaign.total_sent) * 100) : 0;
  const deliveryRate = campaign.total_sent > 0 ? Math.round((campaign.total_delivered / campaign.total_sent) * 100) : 0;

  return (
    <div className={clsx('bg-white rounded-2xl border transition-all', expanded ? 'border-blue-200 shadow-sm' : 'border-gray-100')}>
      {/* Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot, campaign.status === 'active' && 'animate-pulse')} />
              {cfg.label}
            </span>
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold',
              campaign.subscription_plan === 'standard' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
            )}>
              {campaign.subscription_plan === 'standard' ? 'Standard' : 'Promo'}
            </span>
          </div>
          <Link
            href={`/admin/properties/${campaign.property_id}`}
            onClick={e => e.stopPropagation()}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {campaign.property_title}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">
            {campaign.property_city}, {campaign.property_country} · {campaign.owner_name}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900">{campaign.total_agencies}</p>
            <p className="text-xs text-gray-400">agencies</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900">{campaign.total_replied}</p>
            <p className="text-xs text-gray-400">replied</p>
          </div>
          <div className="text-center">
            <p className={clsx('text-xl font-extrabold', replyRate >= 20 ? 'text-green-600' : replyRate >= 10 ? 'text-blue-600' : 'text-gray-700')}>
              {replyRate}%
            </p>
            <p className="text-xs text-gray-400">reply rate</p>
          </div>
        </div>

        <div className="text-gray-300 flex-shrink-0 pt-1">
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Delivery progress bars */}
      <div className="px-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sent',      value: campaign.total_sent,      color: 'bg-gray-400' },
          { label: 'Delivered', value: campaign.total_delivered, color: 'bg-blue-400' },
          { label: 'Replied',   value: campaign.total_replied,   color: 'bg-green-500' },
        ].map(stat => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <span className="text-xs font-semibold text-gray-700">{stat.value}</span>
            </div>
            <ProgressBar value={stat.value} max={campaign.total_agencies} color={stat.color} />
          </div>
        ))}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Reply rate</span>
            <span className="text-xs font-semibold text-gray-700">{replyRate}%</span>
          </div>
          <ProgressBar value={replyRate} max={100} color={replyRate >= 20 ? 'bg-green-500' : 'bg-blue-400'} />
        </div>
      </div>

      {/* Expanded: Wave detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Wave breakdown</h4>
            <span className="text-xs text-gray-400">
              Started {new Date(campaign.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3">
            {campaign.waves.map(wave => {
              const wCfg = WAVE_STATUS[wave.status];
              const wReplyRate = wave.sent > 0 ? Math.round((wave.replied / wave.sent) * 100) : 0;
              return (
                <div key={wave.wave_number} className={clsx('rounded-xl p-4 border',
                  wave.status === 'sent' ? 'bg-gray-50 border-gray-100' :
                  wave.status === 'scheduled' ? 'bg-blue-50 border-blue-100' :
                  wave.status === 'pending' ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                        {wave.wave_number}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">Wave {wave.wave_number}</span>
                      <span className={clsx('text-xs font-semibold', wCfg.color)}>{wCfg.label}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {wave.sent_at && `Sent ${new Date(wave.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      {wave.scheduled_for && `Scheduled ${new Date(wave.scheduled_for).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </div>
                  </div>

                  {wave.status === 'sent' ? (
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Sent',      val: wave.sent,      max: wave.agencies_count },
                        { label: 'Delivered', val: wave.delivered, max: wave.sent },
                        { label: 'Opened',    val: wave.opened,    max: wave.delivered },
                        { label: 'Replied',   val: wave.replied,   max: wave.sent },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <p className="text-lg font-bold text-gray-900">{m.val}</p>
                          <p className="text-xs text-gray-400">{m.label}</p>
                          {m.max > 0 && (
                            <p className="text-xs text-gray-400">{Math.round((m.val / m.max) * 100)}%</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{wave.agencies_count} agencies planned</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Owner info + link */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-400">
              Owner: <span className="text-gray-700 font-medium">{campaign.owner_name}</span>
              {' '}·{' '}
              <a href={`mailto:${campaign.owner_email}`} className="text-blue-500 hover:underline">{campaign.owner_email}</a>
            </div>
            <Link
              href={`/admin/properties/${campaign.property_id}`}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View property →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminDistributionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/campaigns').catch(() => ({ data: MOCK_CAMPAIGNS }));
        setCampaigns(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSent = campaigns.reduce((s, c) => s + c.total_sent, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.total_replied, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const avgReplyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  const filtered = campaigns.filter(c => statusFilter === 'all' || c.status === statusFilter);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Distributions</h1>
        <p className="text-sm text-gray-400 mt-0.5">{campaigns.length} campaigns · {activeCampaigns} active</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active campaigns', value: activeCampaigns, icon: '📤', color: 'from-blue-500 to-blue-600' },
          { label: 'Total sent', value: totalSent.toLocaleString(), icon: '✉️', color: 'from-indigo-500 to-indigo-600' },
          { label: 'Total replies', value: totalReplied, icon: '💬', color: 'from-green-500 to-green-600' },
          { label: 'Avg reply rate', value: `${avgReplyRate}%`, icon: '📊', color: 'from-purple-500 to-purple-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{kpi.value}</p>
              </div>
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br', kpi.color)}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Overall distribution funnel</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Sent',      value: totalSent,                         color: 'bg-blue-400' },
            { label: 'Delivered', value: campaigns.reduce((s, c) => s + c.total_delivered, 0), color: 'bg-indigo-400' },
            { label: 'Replied',   value: totalReplied,                      color: 'bg-green-500' },
            { label: 'Reply rate',value: `${avgReplyRate}%`,                color: 'bg-purple-500', isText: true },
          ].map((stage, i) => {
            const pct = !stage.isText && typeof stage.value === 'number' && totalSent > 0
              ? Math.round((stage.value / totalSent) * 100) : null;
            return (
              <div key={stage.label} className="text-center">
                <div className="relative h-20 bg-gray-100 rounded-xl overflow-hidden mb-2">
                  <div
                    className={clsx('absolute bottom-0 left-0 right-0 rounded-b-xl', stage.color)}
                    style={{ height: `${pct !== null ? pct : avgReplyRate}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-base font-bold text-gray-800">{stage.value}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600">{stage.label}</p>
                {pct !== null && <p className="text-xs text-gray-400">{pct}%</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {([['all', 'All campaigns'], ['active', '✅ Active'], ['completed', '🏁 Completed'], ['paused', '⏸ Paused'], ['failed', '❌ Failed']] as const).map(([val, lbl]) => (
          <button key={val} onClick={() => setStatusFilter(val as typeof statusFilter)}
            className={clsx('px-3 py-2 rounded-xl text-xs font-medium transition-all',
              statusFilter === val ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            )}>
            {lbl}
            <span className="ml-1 opacity-60">
              {val === 'all' ? campaigns.length : campaigns.filter(c => c.status === val).length}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No campaigns found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              expanded={expandedId === campaign.id}
              onToggle={() => setExpandedId(prev => prev === campaign.id ? null : campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
