'use client';

import React from 'react';
import { DistributionCampaign } from '@/lib/types';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  pct?: number;
}

function StatCard({ label, value, icon, sub, color = 'blue', pct }: StatCardProps) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  bar: 'bg-green-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
    gray:   { bg: 'bg-gray-50',   text: 'text-gray-700',   bar: 'bg-gray-400' },
  };
  const c = colorMap[color];

  return (
    <div className={clsx('rounded-2xl p-4 border border-white/80', c.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={clsx('text-2xl font-bold mt-1', c.text)}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {pct !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', c.bar)}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{pct}% rate</p>
        </div>
      )}
    </div>
  );
}

interface CampaignStatsProps {
  campaign: DistributionCampaign | null;
  loading?: boolean;
}

export function CampaignStats({ campaign, loading }: CampaignStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Agencies contacted', value: '—', icon: '📤', color: 'gray' as const },
          { label: 'Emails delivered', value: '—', icon: '✉️', color: 'gray' as const },
          { label: 'Opened', value: '—', icon: '👁', color: 'gray' as const },
          { label: 'Replies received', value: '—', icon: '💬', color: 'gray' as const },
        ].map(s => (
          <StatCard key={s.label} {...s} sub="Distribution not started" />
        ))}
      </div>
    );
  }

  const sent    = campaign.total_sent ?? 0;
  const opened  = campaign.total_opened ?? 0;
  const replied = campaign.total_replied ?? 0;
  const total   = campaign.total_agencies ?? 0;

  const openRate  = sent > 0 ? Math.round((opened / sent) * 100) : 0;
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Campaign status bar */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'w-2 h-2 rounded-full',
            campaign.status === 'active' ? 'bg-green-500 animate-pulse' :
            campaign.status === 'completed' ? 'bg-gray-400' :
            campaign.status === 'paused' ? 'bg-orange-400' : 'bg-blue-400'
          )} />
          <span className="text-sm font-medium text-gray-700 capitalize">
            Campaign {campaign.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Wave {campaign.waves?.filter(w => w.status === 'sent').length || 0}/{campaign.waves_planned || 3} sent</span>
          {campaign.started_at && (
            <span>Started {new Date(campaign.started_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Agencies contacted"
          value={total}
          icon="📤"
          color="blue"
          sub={`${campaign.waves_planned || 3} waves planned`}
        />
        <StatCard
          label="Emails delivered"
          value={sent}
          icon="✉️"
          color="purple"
          pct={total > 0 ? Math.round((sent / total) * 100) : 0}
        />
        <StatCard
          label="Opened"
          value={opened}
          icon="👁"
          color="orange"
          pct={openRate}
        />
        <StatCard
          label="Replies"
          value={replied}
          icon="💬"
          color="green"
          pct={replyRate}
          sub={replied > 0 ? `${replyRate}% reply rate` : 'Waiting for replies'}
        />
      </div>

      {/* Wave progress */}
      {campaign.waves && campaign.waves.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Distribution waves</p>
          <div className="space-y-2">
            {campaign.waves.map((wave) => (
              <div key={wave.id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 w-14">Wave {wave.wave_number}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      wave.status === 'sent' || wave.status === 'completed' ? 'bg-green-500' :
                      wave.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-200'
                    )}
                    style={{ width: wave.status === 'pending' ? '0%' : '100%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right">
                  {wave.agency_count ?? wave.agencies_count ?? '?'} agencies
                </span>
                <span className={clsx(
                  'text-xs font-medium w-20 text-right',
                  wave.status === 'sent' || wave.status === 'completed' ? 'text-green-600' :
                  wave.status === 'active' ? 'text-blue-600' :
                  'text-gray-400'
                )}>
                  {wave.status === 'sent' || wave.status === 'completed' ? '✓ Sent' :
                   wave.status === 'active' ? '⚡ Active' :
                   wave.status === 'scheduled' ? `Sched.` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
