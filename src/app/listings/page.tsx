'use client';

import { useEffect, useState } from 'react';
import ListingCard from '@/components/ListingCard';
import { Listing } from '@/lib/types';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterCity, setFilterCity] = useState('');
  const [filterSort, setFilterSort] = useState('overall_score');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    loadListings();
  }, [page, filterCity, filterSort]);

  async function loadListings() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: filterSort,
      });
      if (filterCity) params.set('city', filterCity);
      if (filterSearch) params.set('search', filterSearch);

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();

      setListings(data.listings || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить объявление?')) return;

    try {
      await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
      setListings(listings.filter((l) => l.id !== id));
      setTotal(total - 1);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Объявления</h1>
      <p className="text-gray-600 mb-6">Все спарсенные объявления ({total})</p>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Город</label>
          <input
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="Фильтр по городу"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Поиск</label>
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadListings()}
            placeholder="Поиск по названию..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Сортировка</label>
          <select
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="overall_score">По оценке</option>
            <option value="price">По цене ↑</option>
            <option value="date_parsed">По дате</option>
          </select>
        </div>

        <button
          onClick={loadListings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Объявления не найдены
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard
                  listing={listing}
                  onClick={() => window.location.href = `/listings/${listing.id}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(listing.id!);
                  }}
                  className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-4 py-2 text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
