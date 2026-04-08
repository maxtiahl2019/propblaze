'use client';

import React, { useState } from 'react';
import { MatchScore } from '@/lib/types';
import clsx from 'clsx';

interface AgencyMatchListProps {
  matches: MatchScore[];
  loading?: boolean;
}

const WAVE_COLORS = {
  1: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600', text: 'text-blue-700' },
  2: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-500', text: 'text-purple-700' },
  3: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500', text: 'text-gray-600' },
};

function ScoreBar({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full', `bg-${color}-500`)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

function AgencyCard({ match, autoExpand = false }: { match: MatchScore; autoExpand?: boolean }) {
  const [expanded, setExpanded] = useState(autoExpand);
  const wave = (match.wave_number as 1 | 2 | 3) || 1;
  const colors = WAVE_COLORS[wave] || WAVE_COLORS[1];
  const scorePercent = Math.round(match.total_score * 100);

  // Parse explanation
  const dims = match.dimension_scores || {};

  return (
    <div className={clsx('rounded-xl border p-4 transition-all', colors.bg, colors.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 font-bold text-gray-600 text-sm">
            {(match.agency_name || 'AG').slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {match.agency_name || `Agency #${match.agency_id.slice(-4)}`}
              </p>
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full text-white', colors.badge)}>
                Wave {wave}
              </span>
            </div>

            {/* Score bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden border border-gray-200">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    scorePercent >= 75 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-blue-500' : 'bg-orange-400'
                  )}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span className={clsx('text-sm font-bold', colors.text)}>{scorePercent}%</span>
            </div>
          </div>
        </div>

        {/* Expand */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 flex items-center gap-1"
        >
          Why? {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-3 pt-3 border-t border-white/50">
          {/* Score breakdown */}
          {Object.keys(dims).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Score breakdown</p>
              <div className="space-y-1.5">
                {Object.entries(dims).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                      <span>{key.replace(/_/g, ' ')}</span>
                    </div>
                    <ScoreBar value={Number(val)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rule vs LLM */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-400">Rule score</p>
              <p className="text-sm font-semibold text-gray-700">{Math.round(match.rule_score * 100)}%</p>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-400">AI boost</p>
              <p className="text-sm font-semibold text-purple-700">+{Math.round(match.llm_boost)}</p>
            </div>
          </div>

          {/* AI explanation */}
          {match.explanation && (
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">AI reasoning</p>
              <p className="text-xs text-gray-600 leading-relaxed">{match.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgencyMatchList({ matches, loading }: AgencyMatchListProps) {
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3>('all');

  const wave1 = matches.filter((m) => m.wave_number === 1);
  const wave2 = matches.filter((m) => m.wave_number === 2);
  const wave3 = matches.filter((m) => m.wave_number === 3);

  const filtered = filter === 'all' ? matches : matches.filter((m) => m.wave_number === filter);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wave summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { wave: 1, count: wave1.length, label: 'First wave', color: 'blue' },
          { wave: 2, count: wave2.length, label: 'Second wave', color: 'purple' },
          { wave: 3, count: wave3.length, label: 'Third wave', color: 'gray' },
        ].map(({ wave, count, label, color }) => (
          <button
            key={wave}
            type="button"
            onClick={() => setFilter(filter === wave ? 'all' : wave as 1 | 2 | 3)}
            className={clsx(
              'p-3 rounded-xl border-2 text-center transition-all',
              filter === wave
                ? `border-${color}-400 bg-${color}-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <p className={clsx('text-xl font-bold', filter === wave ? `text-${color}-700` : 'text-gray-700')}>
              {count}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['all', 1, 2, 3] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f === 'all' ? `All (${matches.length})` : `Wave ${f}`}
          </button>
        ))}
      </div>

      {/* Agency cards */}
      <div className="space-y-2">
        {filtered.map((match) => (
          <AgencyCard key={match.id} match={match} autoExpand={match.wave_number === 1 && filtered.indexOf(match) === 0} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm">No agencies in this wave</p>
        </div>
      )}
    </div>
  );
}
