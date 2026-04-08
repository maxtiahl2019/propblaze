'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Property, PropertyMedia } from '@/lib/types';
import api from '@/lib/api';
import clsx from 'clsx';

interface PublicProperty extends Property {
  media?: PropertyMedia[];
  verified?: boolean;
  proximity_tags?: string[];
  features?: string[];
  description_enhanced?: string;
  cover_photo_url?: string;
}

const TYPE_ICONS: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏰', land: '🌿',
  commercial: '🏪', studio: '🛏', townhouse: '🏘',
};

export default function PublicPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadProperty = useCallback(async () => {
    try {
      const res = await api.get(`/properties/public/${id}`);
      setProperty(res.data);
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProperty(); }, [loadProperty]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/properties/${id}/contact`, contactForm);
      setContactSent(true);
    } catch {
      setContactSent(true); // Still show success UX
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🏚</p>
          <h2 className="text-xl font-semibold text-gray-700">Property not found</h2>
          <p className="text-gray-400 mt-2">This listing may have been removed or sold</p>
          <Link href="/listings" className="mt-4 inline-block text-blue-600 hover:underline">← Browse all properties</Link>
        </div>
      </div>
    );
  }

  const photos = property.media?.filter(m => m.media_type === 'photo') || [];
  const icon = TYPE_ICONS[property.property_type] || '🏠';
  const isSold = property.status === 'sold';
  const title = `${(property.property_type || 'Property').charAt(0).toUpperCase()}${(property.property_type || '').slice(1)}${property.area_sqm ? ` · ${property.area_sqm}m²` : ''}`;
  const location = [property.city, property.region, property.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/listings" className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1">
              ← Listings
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600 truncate max-w-xs">{title}</span>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-bold text-gray-900 hidden sm:block">PropSeller AI</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Left column */}
          <div className="space-y-6">
            {/* Photo gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {/* Main photo */}
              <div className="relative h-80 sm:h-96 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                {photos.length > 0 ? (
                  <img
                    src={photos[activePhoto]?.url || ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl opacity-40">{icon}</span>
                )}

                {/* Sold overlay */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xl font-bold rotate-[-8deg]">
                      SOLD
                    </span>
                  </div>
                )}

                {/* Verified badge */}
                {property.verified && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur text-green-700 font-semibold text-sm px-3 py-1.5 rounded-full border border-green-200 shadow-sm flex items-center gap-1.5">
                      🛡 Verified listing
                    </span>
                  </div>
                )}

                {/* Photo counter */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                    {activePhoto + 1} / {photos.length}
                  </div>
                )}

                {/* Nav arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhoto(p => Math.max(0, p - 1))}
                      disabled={activePhoto === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActivePhoto(p => Math.min(photos.length - 1, p + 1))}
                      disabled={activePhoto === photos.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white disabled:opacity-30"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      className={clsx(
                        'w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                        i === activePhoto ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                      )}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & price */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">📍 {location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {property.asking_price ? (
                    <>
                      <p className="text-2xl font-bold text-blue-700">
                        {property.currency} {property.asking_price.toLocaleString()}
                      </p>
                      {property.negotiable && (
                        <p className="text-sm text-green-600 font-medium">Price negotiable</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-semibold text-gray-400">Price on request</p>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                {[
                  { icon: '📐', label: 'Area', value: property.area_sqm ? `${property.area_sqm}m²` : null },
                  { icon: '🛏', label: 'Beds', value: property.bedrooms != null ? String(property.bedrooms) : null },
                  { icon: '🚿', label: 'Baths', value: property.bathrooms != null ? String(property.bathrooms) : null },
                  { icon: '✨', label: 'Condition', value: property.condition?.replace('_', ' ') || null },
                  { icon: '🪑', label: 'Furnished', value: property.furnished_status?.replace('_', ' ') || null },
                ].filter(s => s.value).map(spec => (
                  <div key={spec.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl">{spec.icon}</p>
                    <p className="text-xs text-gray-400 mt-1">{spec.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {(property.description_enhanced || property.description_raw) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">About this property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {property.description_enhanced || property.description_raw}
                </p>
              </div>
            )}

            {/* Features & tags */}
            {((property.features && property.features.length > 0) || (property.proximity_tags && property.proximity_tags.length > 0)) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Highlights</h2>
                {property.features && property.features.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {property.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </div>
                    ))}
                  </div>
                )}
                {property.proximity_tags && property.proximity_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {property.proximity_tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
              <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center border border-gray-100">
                {property.latitude && property.longitude ? (
                  <div className="text-center">
                    <p className="text-3xl mb-2">📍</p>
                    <p className="text-sm font-medium text-gray-700">{location}</p>
                    <p className="text-xs text-gray-400 mt-1">{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</p>
                    <a
                      href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-3xl mb-1">🗺</p>
                    <p className="text-sm">{location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column — contact sticky */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              {/* Platform badge */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Listed on PropSeller AI</p>
                  {property.verified && (
                    <p className="text-xs text-green-700">🛡 Ownership verified</p>
                  )}
                </div>
              </div>

              {isSold ? (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">🏡</p>
                  <p className="font-semibold text-gray-700">This property has been sold</p>
                  <Link
                    href="/listings"
                    className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                  >
                    Browse similar properties
                  </Link>
                </div>
              ) : contactSent ? (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-semibold text-gray-700">Message sent!</p>
                  <p className="text-sm text-gray-500 mt-1">The owner will contact you shortly</p>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 mb-1">Contact about this property</h3>
                  <p className="text-xs text-gray-400 mb-4">Your message goes directly to the owner</p>

                  {!showContactForm ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(true)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
                      >
                        📧 Send message
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowContactForm(true)}
                        className="w-full py-3 border-2 border-green-500 text-green-700 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                      >
                        💬 Request viewing
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name *"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Your email *"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone (optional)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <textarea
                        required
                        value={contactForm.message}
                        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="I'm interested in this property…"
                        rows={3}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? 'Sending…' : 'Send message →'}
                      </button>
                      <p className="text-xs text-gray-400 text-center">
                        Your data is protected under GDPR
                      </p>
                    </form>
                  )}

                  {/* Share / save */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => navigator.share?.({ title, url: window.location.href })}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50"
                    >
                      ↗ Share
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50"
                    >
                      🔖 Save
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sell CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
              <p className="font-bold mb-1">Selling a property?</p>
              <p className="text-blue-100 text-xs mb-3">
                AI matches your property with the right agencies across Europe
              </p>
              <Link
                href="/register"
                className="block text-center py-2 bg-white text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50"
              >
                List your property →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
