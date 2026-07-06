'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ListingCard from '@/components/ListingCard';
import { Listing, SearchParams } from '@/lib/types';

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ total: number; new: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setResultInfo(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка парсинга');
      }

      setResultInfo({
        total: data.total,
        new: data.new,
        updated: data.updated,
      });

      const listingsRes = await fetch(
        `/api/listings?search=${encodeURIComponent(params.query)}&city=${params.city || ''}&limit=50`
      );
      const listingsData = await listingsRes.json();
      setListings(listingsData.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Поиск объявлений</h1>
      <p className="text-gray-600 mb-6">
        Введите запрос для парсинга объявлений Авито
      </p>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {resultInfo && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <strong>Результат:</strong> Найдено {resultInfo.total} объявлений.{' '}
          Новых: {resultInfo.new}, Обновлено: {resultInfo.updated}
        </div>
      )}

      {listings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Результаты ({listings.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id || listing.avito_id}
                listing={listing}
                onClick={() => window.location.href = `/listings/${listing.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && listings.length === 0 && !resultInfo && !error && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Введите запрос и нажмите «Найти»</p>
        </div>
      )}
    </div>
  );
}
