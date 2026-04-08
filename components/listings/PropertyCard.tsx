'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '@/lib/types';
import clsx from 'clsx';

interface PropertyCardProps {
  property: Property & {
    cover_photo_url?: string;
    verified?: boolean;
    listing_slug?: string;
  };
  variant?: 'grid' | 'list';
}

const TYPE_ICONS: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏰', land: '🌿',
  commercial: '🏪', studio: '🛏', townhouse: '🏘',
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active:         { label: 'Active',      className: 'bg-green-500 text-white' },
  in_distribution:{ label: 'Distributing',className: 'bg-blue-500 text-white' },
  sold:           { label: 'Sold',        className: 'bg-gray-500 text-white' },
};

export function PropertyCard({ property, variant = 'grid' }: PropertyCardProps) {
  const href = `/listings/${property.listing_slug || property.id}`;
  const icon = TYPE_ICONS[property.property_type] || '🏠';
  const statusBadge = STATUS_BADGES[property.status];

  if (variant === 'list') {
    return (
      <Link href={href} className="block group">
        <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-4 flex gap-4">
          {/* Thumbnail */}
          <div className="w-36 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            {property.cover_photo_url ? (
              <img src={property.cover_photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <span className="text-4xl">{icon}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-gray-900">
                    {(property.property_type || 'Property').charAt(0).toUpperCase() + (property.property_type || '').slice(1)}
                    {property.area_sqm ? ` · ${property.area_sqm}m²` : ''}
                  </h3>
                  {property.verified && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                  )}
                  {statusBadge && (
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusBadge.className)}>
                      {statusBadge.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">📍 {[property.city, property.country].filter(Boolean).join(', ')}</p>
              </div>
              <p className="text-lg font-bold text-blue-700 flex-shrink-0">
                {property.currency} {property.asking_price?.toLocaleString() || '—'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {property.bedrooms != null && <span>🛏 {property.bedrooms} bed</span>}
              {property.bathrooms != null && <span>🚿 {property.bathrooms} bath</span>}
              {property.condition && <span>✨ {property.condition.replace('_', ' ')}</span>}
              {property.negotiable && <span className="text-green-600 font-medium">Negotiable</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden">
        {/* Photo */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">
          {property.cover_photo_url ? (
            <img
              src={property.cover_photo_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl opacity-60">{icon}</span>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {property.verified && (
              <span className="bg-white/90 backdrop-blur text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200 shadow-sm">
                🛡 Verified
              </span>
            )}
            {statusBadge && (
              <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm', statusBadge.className)}>
                {statusBadge.label}
              </span>
            )}
          </div>

          {/* Price overlay */}
          {property.asking_price && (
            <div className="absolute bottom-3 left-3 right-3">
              <span className="bg-white/95 backdrop-blur text-blue-700 font-bold text-base px-3 py-1.5 rounded-xl shadow-sm inline-block">
                {property.currency} {property.asking_price.toLocaleString()}
                {property.negotiable && <span className="text-xs font-normal text-gray-400 ml-1">· neg.</span>}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {(property.property_type || 'Property').charAt(0).toUpperCase() + (property.property_type || '').slice(1)}
                {property.area_sqm ? ` · ${property.area_sqm}m²` : ''}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                📍 {[property.city, property.region, property.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          {/* Specs row */}
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">🛏 {property.bedrooms}</span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">🚿 {property.bathrooms}</span>
            )}
            {property.area_sqm && (
              <span className="flex items-center gap-1">📐 {property.area_sqm}m²</span>
            )}
            {property.condition && (
              <span className="flex items-center gap-1 capitalize">{property.condition.replace('_', ' ')}</span>
            )}
          </div>

          {/* View CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {property.city}, {property.country}
            </span>
            <span className="text-xs font-semibold text-blue-600 group-hover:underline">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
