'use client';

import React, { useState } from 'react';
import { Lead } from '@/lib/types';
import api from '@/lib/api';
import clsx from 'clsx';

interface LeadsPanelProps {
  leads: Lead[];
  onUpdate: () => void;
  loading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:         { label: 'New',         color: 'bg-blue-100 text-blue-700' },
  interested:  { label: 'Interested',  color: 'bg-green-100 text-green-700' },
  follow_up:   { label: 'Follow-up',   color: 'bg-yellow-100 text-yellow-700' },
  no_response: { label: 'No response', color: 'bg-gray-100 text-gray-500' },
  not_fit:     { label: 'Not a fit',   color: 'bg-red-100 text-red-600' },
};

const CHANNEL_ICONS: Record<string, string> = {
  email: '📧', whatsapp: '💬', telegram: '✈️',
};

function LeadCard({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus as Lead['status']);
    try {
      await api.patch(`/leads/${lead.id}`, { status: newStatus });
      onUpdate();
    } catch { /* revert on error */ }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.patch(`/leads/${lead.id}`, { notes });
      setEditingNotes(false);
    } finally {
      setSaving(false);
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['new'];

  return (
    <div className={clsx(
      'rounded-xl border p-4 transition-all',
      status === 'new' ? 'border-blue-200 bg-blue-50/30' :
      status === 'interested' ? 'border-green-200 bg-green-50/30' :
      'border-gray-100 bg-white'
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {(lead.contact_name || lead.agency_name || 'A').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {lead.agency_name || 'Unknown Agency'}
              </p>
              {lead.contact_name && (
                <p className="text-xs text-gray-500">{lead.contact_name}</p>
              )}
            </div>
            <span className={clsx('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', cfg.color)}>
              {cfg.label}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
            {(lead.reply_channel || lead.channel) && (
              <span>{CHANNEL_ICONS[lead.reply_channel || lead.channel || ''] || '📨'} via {lead.reply_channel || lead.channel}</span>
            )}
            {lead.contact_email && <span>📧 {lead.contact_email}</span>}
            {lead.contact_phone && <span>📞 {lead.contact_phone}</span>}
            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>

          {/* Summary */}
          {lead.summary && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">
              {lead.summary}
            </p>
          )}
        </div>
      </div>

      {/* Expand / collapse */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-left"
      >
        {expanded ? '▲ Less' : '▼ More details & actions'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
          {/* Raw message */}
          {lead.raw_message && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Original message</p>
              <p className="text-xs text-gray-600 leading-relaxed">{lead.raw_message}</p>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Update status</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateStatus(key)}
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                    status === key
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  )}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500">Notes</p>
              {!editingNotes && (
                <button
                  type="button"
                  onClick={() => setEditingNotes(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {notes ? 'Edit' : '+ Add note'}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  autoFocus
                  placeholder="Add private notes about this lead…"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNotes(lead.notes || ''); setEditingNotes(false); }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              notes && <p className="text-xs text-gray-600 italic">{notes}</p>
            )}
          </div>

          {/* Quick reply */}
          {lead.contact_email && (
            <a
              href={`mailto:${lead.contact_email}?subject=Re: Property inquiry`}
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              📧 Reply via email
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function LeadsPanel({ leads, onUpdate, loading }: LeadsPanelProps) {
  const [filter, setFilter] = useState<'all' | Lead['status']>('all');

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const newCount = leads.filter(l => l.status === 'new').length;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          All ({leads.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => {
          const count = leads.filter(l => l.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as Lead['status'])}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* New leads alert */}
      {newCount > 0 && filter === 'all' && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <span className="text-blue-500 font-bold text-sm">🔔</span>
          <p className="text-sm text-blue-700 font-medium">
            {newCount} new {newCount === 1 ? 'lead' : 'leads'} since last visit
          </p>
        </div>
      )}

      {/* Lead cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">
            {leads.length === 0
              ? 'No leads yet — agencies haven\'t replied yet'
              : 'No leads match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <LeadCard key={lead.id} lead={lead} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
