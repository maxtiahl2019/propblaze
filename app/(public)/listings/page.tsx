'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { SearchFilters, Filters, DEFAULT_FILTERS } from '@/components/listings/SearchFilters';
import { Property } from '@/lib/types';
import api from '@/lib/api';
import clsx from 'clsx';

type ViewMode = 'grid' | 'list';
type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area_desc',  label: 'Largest first' },
];

const PAGE_SIZE = 18;

function ListingsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    query:         searchParams.get('q') || '',
    country:       searchParams.get('country') || '',
    property_type: searchParams.get('type') || '',
  });
  const [sort, setSort] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const buildQuery = useCallback((f: Filters, s: SortKey, p: number) => {
    const params = new URLSearchParams();
    if (f.query)         params.set('q', f.query);
    if (f.country)       params.set('country', f.country);
    if (f.city)          params.set('city', f.city);
    if (f.property_type) params.set('property_type', f.property_type);
    if (f.price_min)     params.set('price_min', f.price_min);
    if (f.price_max)     params.set('price_max', f.price_max);
    if (f.area_min)      params.set('area_min', f.area_min);
    if (f.bedrooms_min)  params.set('bedrooms_min', f.bedrooms_min);
    if (f.verified_only) params.set('verified', '1');
    if (f.tags.length)   params.set('tags', f.tags.join(','));
    params.set('sort', s);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String((p - 1) * PAGE_SIZE));
    return params.toString();
  }, []);

  const fetchListings = useCallback(async (f: Filters, s: SortKey, p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/public?${buildQuery(f, s, p)}`);
      setProperties(res.data.items || res.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchListings(filters, sort, page);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchListings(filters, sort, 1);
  };

  const handleSortChange = (s: SortKey) => {
    setSort(s);
    setPage(1);
    fetchListings(filters, s, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchListings(filters, sort, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">PropSeller AI</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={filters.query}
                onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by city, country, property type…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              Search
            </button>
            <Link
              href="/register"
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hidden sm:block"
            >
              List your property
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <SearchFilters
                filters={filters}
                onChange={f => setFilters(prev => ({ ...prev, ...f }))}
                onSearch={handleSearch}
                totalCount={total}
                loading={loading}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {loading ? 'Searching…' : `${total.toLocaleString()} properties`}
                </h1>
                {filters.country && (
                  <p className="text-sm text-gray-500">in {filters.country}{filters.city ? `, ${filters.city}` : ''}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ⚙️ Filters
                  {Object.values(filters).some(v => v && v !== '' && !(Array.isArray(v) && v.length === 0)) && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => handleSortChange(e.target.value as SortKey)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View mode */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  {(['grid', 'list'] as ViewMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={clsx(
                        'px-3 py-2 text-sm transition-all',
                        viewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {mode === 'grid' ? '⊞' : '☰'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {(filters.country || filters.property_type || filters.price_min || filters.price_max || filters.verified_only || filters.tags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {filters.country && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    📍 {filters.country}
                    <button onClick={() => setFilters(f => ({ ...f, country: '' }))} className="hover:text-blue-900 ml-1">✕</button>
                  </span>
                )}
                {filters.property_type && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    🏠 {filters.property_type}
                    <button onClick={() => setFilters(f => ({ ...f, property_type: '' }))} className="hover:text-blue-900 ml-1">✕</button>
                  </span>
                )}
                {(filters.price_min || filters.price_max) && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    💶 {filters.price_min ? `€${Number(filters.price_min).toLocaleString()}` : '0'} –{' '}
                    {filters.price_max ? `€${Number(filters.price_max).toLocaleString()}` : '∞'}
                    <button onClick={() => setFilters(f => ({ ...f, price_min: '', price_max: '' }))} className="hover:text-blue-900 ml-1">✕</button>
                  </span>
                )}
                {filters.verified_only && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    🛡 Verified only
                    <button onClick={() => setFilters(f => ({ ...f, verified_only: false }))} className="hover:text-green-900 ml-1">✕</button>
                  </span>
                )}
                {filters.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {tag.replace('_', ' ')}
                    <button onClick={() => setFilters(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="hover:text-purple-900 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className={clsx(
                'gap-4',
                viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col'
              )}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={clsx(
                    'bg-gray-100 rounded-2xl animate-pulse',
                    viewMode === 'grid' ? 'h-72' : 'h-28'
                  )} />
                ))}
              </div>
            )}

            {/* Results grid/list */}
            {!loading && properties.length > 0 && (
              <div className={clsx(
                'gap-4',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col'
              )}>
                {properties.map(p => (
                  <PropertyCard key={p.id} property={p} variant={viewMode} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search in a different area</p>
                <button
                  type="button"
                  onClick={() => { setFilters(DEFAULT_FILTERS); handleSearch(); }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={clsx(
                        'w-9 h-9 rounded-xl text-sm font-medium transition-all',
                        p === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}

            {/* CTA for sellers */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white text-center">
              <h3 className="text-lg font-bold mb-1">Selling a property?</h3>
              <p className="text-blue-100 text-sm mb-4">
                List your property and let AI match it with the right agencies across Europe
              </p>
              <Link
                href="/register"
                className="inline-block px-6 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50"
              >
                List your property →
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <SearchFilters
        filters={filters}
        onChange={f => setFilters(prev => ({ ...prev, ...f }))}
        onSearch={handleSearch}
        totalCount={total}
        loading={loading}
        mobileOpen={mobileFiltersOpen}
        onMobileClose={() => setMobileFiltersOpen(false)}
      />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading…</p></div>}>
      <ListingsPageInner />
    </Suspense>
  );
}
