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
  const [isDeleting, setIsDeleting] = useState(false);

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
        limit: '50',
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

  async function handleDeleteAll() {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ объявления? Это действие необратимо!')) return;
    setIsDeleting(true);
    try {
      await fetch('/api/listings?all=true', { method: 'DELETE' });
      setListings([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error('Delete all error:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5' }}>Объявления</h1>
        {total > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={isDeleting}
            style={{
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {isDeleting ? 'Удаление...' : '🗑 Удалить все'}
          </button>
        )}
      </div>
      <p style={{ color: '#6a6a7a', marginBottom: 24 }}>Все спарсенные объявления ({total})</p>

      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Город</label>
          <input
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="Фильтр по городу"
            className="input"
            style={{ width: 180 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Поиск</label>
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadListings()}
            placeholder="Поиск по названию..."
            className="input"
            style={{ width: 180 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Сортировка</label>
          <select
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value)}
            className="select"
          >
            <option value="overall_score">По оценке</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
            <option value="date_parsed">По дате</option>
            <option value="views_count">По просмотрам</option>
          </select>
        </div>

        <button onClick={loadListings} className="btn-primary" style={{ padding: '10px 20px' }}>
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Загрузка...
        </div>
      ) : listings.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: '#5a5a6a' }}>
          Объявления не найдены
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
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
                    top: 8,
                    left: 8,
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-primary"
                style={{ opacity: page === 1 ? 0.5 : 1, padding: '8px 16px' }}
              >
                ←
              </button>
              <span style={{ padding: '8px 16px', color: '#a0a0b0', fontSize: 14 }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-primary"
                style={{ opacity: page === totalPages ? 0.5 : 1, padding: '8px 16px' }}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
