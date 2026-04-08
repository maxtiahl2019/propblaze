'use client';

import React, { useState } from 'react';
import { DeliveryAttempt } from '@/lib/types';
import clsx from 'clsx';

interface EnrichedDelivery extends DeliveryAttempt {
  agency_name?: string;
  agency_country?: string;
  wave_number?: number;
}

interface DistributionReportProps {
  deliveries: EnrichedDelivery[];
  loading?: boolean;
}

type StatusFilter = 'all' | 'replied' | 'opened' | 'sent' | 'failed';
type ChannelFilter = 'all' | 'email' | 'whatsapp' | 'telegram';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  replied:   { label: 'Replied',   color: 'text-green-700 bg-green-50 border-green-200',  icon: '💬' },
  opened:    { label: 'Opened',    color: 'text-blue-700 bg-blue-50 border-blue-200',     icon: '👁' },
  clicked:   { label: 'Clicked',   color: 'text-purple-700 bg-purple-50 border-purple-200', icon: '🔗' },
  sent:      { label: 'Sent',      color: 'text-gray-700 bg-gray-50 border-gray-200',     icon: '✉️' },
  pending:   { label: 'Pending',   color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: '⏳' },
  bounced:   { label: 'Bounced',   color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '↩️' },
  failed:    { label: 'Failed',    color: 'text-red-700 bg-red-50 border-red-200',        icon: '✕' },
};

const CHANNEL_ICONS: Record<string, string> = {
  email:    '📧',
  whatsapp: '💬',
  telegram: '✈️',
};

export function DistributionReport({ deliveries, loading }: DistributionReportProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = deliveries.filter((d) => {
    const matchStatus  = statusFilter === 'all' || d.status === statusFilter;
    const matchChannel = channelFilter === 'all' || d.channel === channelFilter;
    const matchSearch  = !search || (d.agency_name || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchChannel && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agency…"
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
        />

        {/* Status pills */}
        <div className="flex gap-1.5">
          {(['all', 'replied', 'opened', 'sent', 'failed'] as StatusFilter[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                statusFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f === 'all' ? `All (${deliveries.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Channel pills */}
        <div className="flex gap-1.5">
          {(['all', 'email', 'whatsapp', 'telegram'] as ChannelFilter[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setChannelFilter(f)}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                channelFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {f === 'all' ? '🌐 All' : CHANNEL_ICONS[f] + ' ' + f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No deliveries match your filter</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((d) => {
            const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG['sent'];
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all"
              >
                {/* Agency avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {(d.agency_name || 'AG').slice(0, 2).toUpperCase()}
                </div>

                {/* Name + country */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {d.agency_name || `Agency ${d.agency_id.slice(-4)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {d.agency_country && (
                      <span className="text-xs text-gray-400">{d.agency_country}</span>
                    )}
                    {d.wave_number && (
                      <span className="text-xs text-gray-400">· Wave {d.wave_number}</span>
                    )}
                  </div>
                </div>

                {/* Channel */}
                <span className="text-base flex-shrink-0" title={d.channel}>
                  {CHANNEL_ICONS[d.channel] || '📤'}
                </span>

                {/* Sent time */}
                {d.sent_at && (
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {new Date(d.sent_at).toLocaleDateString()}
                  </span>
                )}

                {/* Status badge */}
                <span className={clsx(
                  'text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0',
                  statusCfg.color
                )}>
                  {statusCfg.icon} {statusCfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Showing {filtered.length} of {deliveries.length} delivery records
      </p>
    </div>
  );
}
