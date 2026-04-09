'use client';

import React, { useState } from 'react';
import { MatchScore } from '@/lib/types';
import clsx from 'clsx';

interface AgencyMatchListProps {
  matches: MatchScore[];
  loading?: boolean;
}

// ── Circular score ring ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 85 ? '#22c55e' : pct >= 65 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
      <svg width="56" height="56" className="rotate-[-90deg]">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <span className="absolute text-xs font-black" style={{ color }}>{pct}%</span>
    </div>
  
  9��p�function DimBar({ dim, val }:''��fnnction: DimBar({ dim, val }: { dim: string; val: number }) {
  const max = DIM_MAX[dim] || 20;
  const pct = Math.min((val / max) * 100, 100);
  const label = DIM_LABELS[dim] || dim.replace(/_/g, ' ');
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/50">{label}</span>
        <span className="text-white/40">{val}/{max}</span>
      </div>
      <div className="h-1 rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f97316' : 'rgba(255,255,255,0.3)',
          }}
        />
      </div>
    </div>
  
  9��p�function DimBar({ dim, val }:''��