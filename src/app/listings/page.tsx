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
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>Объявления</h1>
      <p style={{ color: '#a0a0b0', marginBottom: 24 }}>Все спарсенные объявления ({total})</p>

      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Город</label>
          <input
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="Фильтр по городу"
            className="input"
            style={{ width: 200 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Поиск</label>
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadListings()}
            placeholder="Поиск по названию..."
            className="input"
            style={{ width: 200 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Сортировка</label>
          <select
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value)}
            className="select"
          >
            <option value="overall_score">По оценке</option>
            <option value="price">По цене ↑</option>
            <option value="date_parsed">По дате</option>
          </select>
        </div>

        <button onClick={loadListings} className="btn-primary">
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Загрузка...
        </div>
      ) : listings.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: '#6a6a7a' }}>
          Объявления не найдены
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {listings.map((listing) => (
              <div key={listing.id} style={{ position: 'relative' }}>
                <ListingCard
                  listing={listing}
                  onClick={() => window.location.href = `/listings/${listing.id}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(listing.id!);
                  }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: 6,
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  title="Удалить"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-primary"
                style={{ opacity: page === 1 ? 0.5 : 1 }}
              >
                Назад
              </button>
              <span style={{ padding: '10px 16px', color: '#a0a0b0' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-primary"
                style={{ opacity: page === totalPages ? 0.5 : 1 }}
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
