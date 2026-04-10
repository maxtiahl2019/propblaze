'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/LangContext';

interface Campaign {
  id: string;
  property_id: string;
  property_address: string;
  created_at: string;
  status: 'active' | 'completed' | 'paused';
  waves: {
    wave: 1 | 2 | 3;
    agencies_count: number;
    sent: number;
    responses: number;
    viewings: number;
    start_date: string;
  }[];
  metrics: {
    total_sent: number;
    total_responses: number;
    response_rate: number;
    total_viewings: number;
  };
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    property_id: 'prop-001',
    property_address: 'Budva, Montenegro - €2,500,000',
    created_at: '2 days ago',
    status: 'active',
    waves: [
      { wave: 1, agencies_count: 10, sent: 10, responses: 4, viewings: 2, start_date: '2 days ago' },
      { wave: 2, agencies_count: 15, sent: 12, responses: 2, viewings: 1, start_date: '1 day ago' },
      { wave: 3, agencies_count: 8, sent: 0, responses: 0, viewings: 0, start_date: 'pending' },
    ],
    metrics: {
      total_sent: 22,
      total_responses: 6,
      response_rate: 27.3,
      total_viewings: 3,
    },
  },
];

export default function DistributionPage() {
  const { t } = useTranslation();
  const [campaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('distribution.title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('distribution.subtitle')}
        </p>
      </div>

      {/* Overall metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">{t('distribution.total_sent')}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {campaigns.reduce((sum, c) => sum + c.metrics.total_sent, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Avg Response Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {(campaigns.reduce((sum, c) => sum + c.metrics.response_rate, 0) / campaigns.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">{t('distribution.total_viewings')}</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {campaigns.reduce((sum, c) => sum + c.metrics.total_viewings, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <div className="space-y-4">
        {campaigns.map(campaign => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.property_address}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Started {campaign.created_at}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  {campaign.status === 'active' && (
                    <Button variant="secondary" size="sm">Pause</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign metrics */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">{t('distribution.sent')}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{campaign.metrics.total_sent}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('distribution.responses')}</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">{campaign.metrics.total_responses}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Response Rate</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{campaign.metrics.response_rate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('distribution.viewings')}</p>
                  <p className="text-xl font-bold text-purple-600 mt-1">{campaign.metrics.total_viewings}</p>
                </div>
              </div>

              {/* Waves */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('distribution.wave')}s</h4>
                <div className="space-y-2">
                  {campaign.waves.map(w => (
                    <div key={w.wave} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{t('distribution.wave')} {w.wave}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {w.agencies_count} agencies · {w.sent} sent · {w.responses} responses · {w.viewings} viewings
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Started {w.start_date}</p>
                        </div>
                        <div className="flex gap-2">
                          {w.sent > 0 && (
                            <Link href={`/properties/${campaign.property_id}`}>
                              <Button variant="secondary" size="sm">View Results</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">{t('distribution.no_campaigns_desc')}</p>
            <Link href="/properties/new">
              <Button variant="primary">{t('distribution.list_property')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
