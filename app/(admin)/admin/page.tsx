'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import clsx from 'clsx';

interface AdminStats {
  total_properties: number;
  active_properties: number;
  pending_verification: number;
  awaiting_approval: number;
  total_agencies: number;
  active_agencies: number;
  total_users: number;
  total_campaigns: number;
  active_campaigns: number;
  total_sent: number;
  total_replied: number;
  sold_this_month: number;
  revenue_this_month: number;
}

interface RecentActivity {
  id: string;
  type: 'new_property' | 'new_user' | 'sold' | 'agency_reply' | 'payment';
  message: string;
  time: string;
  meta?: string;
}

function StatCard({
  label, value, sub, icon, color = 'blue', href, alert
}: {
  label: string; value: number | string; sub?: string;
  icon: string; color?: string; href?: string; alert?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-400 to-orange-500',
    red:    'from-red-500 to-red-600',
    gray:   'from-gray-400 to-gray-500',
  };

  const card = (
    <div className={clsx(
      'bg-white rounded-2xl p-5 border transition-all',
      href ? 'hover:shadow-md hover:border-blue-200 cursor-pointer' : '',
      alert ? 'border-orange-200 ring-1 ring-orange-300' : 'border-gray-100'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-br flex-shrink-0',
          colorMap[color] || colorMap.blue
        )}>
          {icon}
        </div>
      </div>
      {alert && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-600 font-medium">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          Needs attention
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function ActivityFeed({ items }: { items: RecentActivity[] }) {
  const icons: Record<string, string> = {
    new_property: '🏠', new_user: '👤', sold: '✅',
    agency_reply: '💬', payment: '💳',
  };
  const colors: Record<string, string> = {
    new_property: 'bg-blue-50 text-blue-600',
    new_user: 'bg-purple-50 text-purple-600',
    sold: 'bg-green-50 text-green-600',
    agency_reply: 'bg-orange-50 text-orange-600',
    payment: 'bg-emerald-50 text-emerald-600',
  };

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>;
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all">
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0', colors[item.type])}>
            {icons[item.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">{item.message}</p>
            {item.meta && <p className="text-xs text-gray-400 mt-0.5">{item.meta}</p>}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

// Mock data fallback when API not connected
const MOCK_STATS: AdminStats = {
  total_properties: 47, active_properties: 23, pending_verification: 5,
  awaiting_approval: 3, total_agencies: 284, active_agencies: 261,
  total_users: 51, total_campaigns: 29, active_campaigns: 18,
  total_sent: 1847, total_replied: 312, sold_this_month: 4,
  revenue_this_month: 1247,
};

const MOCK_ACTIVITY: RecentActivity[] = [
  { id: '1', type: 'new_property', message: 'New property listed in Belgrade, Serbia', time: '5m ago', meta: '3-bed apartment · €210,000' },
  { id: '2', type: 'agency_reply', message: 'Agency RE Capital replied to listing #A47', time: '23m ago', meta: 'Interested in viewing' },
  { id: '3', type: 'payment', message: 'New subscription — Standard plan', time: '1h ago', meta: '€29 · user@example.com' },
  { id: '4', type: 'sold', message: 'Property marked as sold — Villa in Montenegro', time: '2h ago', meta: 'Sold via platform agency' },
  { id: '5', type: 'new_user', message: 'New owner registered', time: '3h ago', meta: 'Serbia · Preferred language: Russian' },
  { id: '6', type: 'new_property', message: 'New property listed in Athens, Greece', time: '4h ago', meta: 'Villa · €485,000' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
  const [activity, setActivity] = useState<RecentActivity[]>(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: MOCK_STATS })),
          api.get('/admin/activity').catch(() => ({ data: MOCK_ACTIVITY })),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/properties?status=pending_verification"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 flex items-center gap-1.5">
            ⚠️ {stats.pending_verification} pending
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total properties" value={stats.total_properties} sub={`${stats.active_properties} active`} icon="🏠" color="blue" href="/admin/properties" />
        <StatCard label="Pending review" value={stats.pending_verification} sub="Verification needed" icon="⏳" color="orange" href="/admin/properties?status=pending_verification" alert={stats.pending_verification > 0} />
        <StatCard label="Awaiting approval" value={stats.awaiting_approval} sub="Offer approval" icon="⚡" color="purple" href="/admin/properties?status=awaiting_approval" alert={stats.awaiting_approval > 0} />
        <StatCard label="Sold this month" value={stats.sold_this_month} sub="Success conversions" icon="✅" color="green" />
        <StatCard label="Agencies" value={stats.active_agencies} sub={`${stats.total_agencies} total`} icon="🏢" color="blue" href="/admin/agencies" />
        <StatCard label="Active campaigns" value={stats.active_campaigns} sub={`${stats.total_campaigns} total`} icon="📤" color="purple" href="/admin/distributions" />
        <StatCard label="Emails sent" value={stats.total_sent.toLocaleString()} sub={`${stats.total_replied} replied`} icon="📧" color="blue" />
        <StatCard label="Revenue (month)" value={`€${stats.revenue_this_month.toLocaleString()}`} sub="Active subscriptions" icon="💳" color="green" href="/admin/billing" />
      </div>

      {/* Conversion funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Platform funnel</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Listed',      value: stats.total_properties, color: 'blue' },
            { label: 'Verified',    value: Math.round(stats.total_properties * 0.7), color: 'indigo' },
            { label: 'Paid',        value: stats.active_campaigns, color: 'purple' },
            { label: 'Distributing',value: stats.active_campaigns, color: 'orange' },
            { label: 'Sold',        value: stats.sold_this_month, color: 'green' },
          ].map((stage, i, arr) => {
            const pct = i === 0 ? 100 : Math.round((stage.value / arr[0].value) * 100);
            return (
              <div key={stage.label} className="text-center">
                <div className="relative h-24 bg-gray-100 rounded-xl overflow-hidden mb-2">
                  <div
                    className={clsx(
                      'absolute bottom-0 left-0 right-0 rounded-b-xl transition-all',
                      stage.color === 'blue'   && 'bg-blue-400',
                      stage.color === 'indigo' && 'bg-indigo-400',
                      stage.color === 'purple' && 'bg-purple-400',
                      stage.color === 'orange' && 'bg-orange-400',
                      stage.color === 'green'  && 'bg-green-500',
                    )}
                    style={{ height: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-bold text-gray-800">{stage.value}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600">{stage.label}</p>
                <p className="text-xs text-gray-400">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent activity</h3>
            <span className="text-xs text-gray-400">Last 24h</span>
          </div>
          <ActivityFeed items={activity} />
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick actions</h3>
            <div className="space-y-2">
              {[
                { href: '/admin/properties?status=pending_verification', icon: '🔍', label: 'Review pending verifications', badge: stats.pending_verification, color: 'orange' },
                { href: '/admin/agencies/new', icon: '➕', label: 'Add agency manually', color: 'blue' },
                { href: '/admin/agencies/import', icon: '📥', label: 'Import agencies CSV', color: 'purple' },
                { href: '/admin/distributions', icon: '📊', label: 'View all campaigns', color: 'green' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">{action.label}</span>
                  {action.badge ? (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  ) : (
                    <span className="text-gray-300 group-hover:text-gray-500">→</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Reply rate mini card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold mb-1">Reply rate</p>
            <p className="text-3xl font-extrabold">
              {stats.total_sent > 0 ? Math.round((stats.total_replied / stats.total_sent) * 100) : 0}%
            </p>
            <p className="text-blue-200 text-xs mt-1">{stats.total_replied} replies / {stats.total_sent} sent</p>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${stats.total_sent > 0 ? Math.min((stats.total_replied / stats.total_sent) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
