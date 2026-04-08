'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Lead {
  id: string;
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string;
  property_id: string;
  property_address: string;
  status: 'new' | 'interested' | 'viewing' | 'negotiating' | 'rejected';
  response_date: string;
  message: string;
}

const DEMO_LEADS: Lead[] = [
  {
    id: '1',
    agency_name: 'Alpine Realty',
    contact_person: 'Marco Rossi',
    email: 'marco@alpinerealty.ch',
    phone: '+41 44 123 4567',
    property_id: 'prop-001',
    property_address: 'Budva, Montenegro - €2,500,000',
    status: 'interested',
    response_date: '2 hours ago',
    message: 'Interested in viewing. Have several qualified buyers.',
  },
  {
    id: '2',
    agency_name: 'Adriatic Properties',
    contact_person: 'Dragana Petrovic',
    email: 'dragana@adriaticprops.rs',
    phone: '+381 11 456 7890',
    property_id: 'prop-001',
    property_address: 'Budva, Montenegro - €2,500,000',
    status: 'viewing',
    response_date: 'Yesterday',
    message: 'Scheduled viewing for this weekend.',
  },
  {
    id: '3',
    agency_name: 'Croatian Coast Estates',
    contact_person: 'Ivan Horvat',
    email: 'ivan@croatiancoast.hr',
    phone: '+385 1 234 5678',
    property_id: 'prop-001',
    property_address: 'Budva, Montenegro - €2,500,000',
    status: 'new',
    response_date: '5 hours ago',
    message: 'We received your listing and it matches our criteria.',
  },
];

const STATUS_COLORS = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  interested: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  viewing: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100' },
  negotiating: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
  rejected: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' },
};

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(DEMO_LEADS);
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agency Leads</h1>
        <p className="text-gray-600 mt-1">
          Track all inquiries and responses from agencies
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">New</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{leads.filter(l => l.status === 'new').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Interested</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{leads.filter(l => l.status === 'interested').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Viewing</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{leads.filter(l => l.status === 'viewing').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'interested', 'viewing', 'negotiating'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Leads list */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Leads ({filtered.length})</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>No leads in this category</p>
              </div>
            ) : (
              filtered.map(lead => {
                const colors = STATUS_COLORS[lead.status];
                return (
                  <div key={lead.id} className={`p-4 rounded-lg border-l-4 ${colors.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{lead.agency_name}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{lead.contact_person}</p>
                        <p className="text-sm text-gray-500 mt-1">{lead.email} · {lead.phone}</p>
                        <Link href={`/properties/prop-001`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                          Property: {lead.property_address}
                        </Link>
                        <p className="text-sm text-gray-700 mt-2 italic">"{lead.message}"</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{lead.response_date}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="secondary" size="sm">Reply</Button>
                          <Button variant="secondary" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
