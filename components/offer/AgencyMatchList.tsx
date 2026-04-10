'use client';

import React from 'react';
import clsx from 'clsx';

interface MatchScore {
  agency_id: string;
  total_score: number;
  wave_number: number;
}

interface AgencyMatchListProps {
  matches: MatchScore[];
  loading?: boolean;
  onSelect?: (id: string) => void;
  selectedIds?: string[];
}

export default function AgencyMatchList({
  matches,
  loading = false,
  onSelect,
  selectedIds = [],
}: AgencyMatchListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-10 text-white/40 text-sm">
        No agency matches found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const selected = selectedIds.includes(m.agency_id);
        const scoreColor =
          m.total_score >= 88
            ? 'text-green-400'
            : m.total_score >= 78
            ? 'text-yellow-400'
            : 'text-purple-400';

        return (
          <div
            key={m.agency_id}
            onClick={() => onSelect?.(m.agency_id)}
            className={clsx(
              'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
              selected
                ? 'border-orange-500/60 bg-orange-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
          >
            <div>
              <p className="text-sm font-medium text-white">{m.agency_id}</p>
              <p className="text-xs text-white/40 mt-0.5">Wave {m.wave_number}</p>
            </div>
            <div className="text-right">
              <p className={clsx('text-lg font-bold', scoreColor)}>{m.total_score}</p>
              <p className="text-xs text-white/40">score</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}