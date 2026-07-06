'use client';

import { useEffect, useState } from 'react';
import ListingCard from '@/components/ListingCard';
import { Listing } from '@/lib/types';
import { getListings, deleteListing, deleteAllListings } from '@/lib/storage';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterCity, setFilterCity] = useState('');
  const [filterSort, setFilterSort] = useState('overall_score');
  const [filterSearch, setFilterSearch] = useState('');
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    loadListings();
  }, [page, filterCity, filterSort, filterSearch]);

  async function loadListings() {
    setIsLoading(true);
    try {
      // Try Supabase first
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sort: filterSort,
      });
      if (filterCity) params.set('city', filterCity);
      if (filterSearch) params.set('search', filterSearch);

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();

      if (data.listings && data.listings.length > 0) {
        setListings(data.listings);
        setTotal(data.total || data.listings.length);
      } else {
        // Fallback to localStorage
        let allListings = getListings();

        // Apply filters
        if (filterCity) {
          allListings = allListings.filter((l) =>
            l.city?.toLowerCase().includes(filterCity.toLowerCase())
          );
        }
        if (filterSearch) {
          const searchLower = filterSearch.toLowerCase();
          allListings = allListings.filter((l) =>
            l.title?.toLowerCase().includes(searchLower) ||
            l.description?.toLowerCase().includes(searchLower)
          );
        }

        // Sort
        if (filterSort === 'price_asc') allListings.sort((a, b) => (a.price || 0) - (b.price || 0));
        else if (filterSort === 'price_desc') allListings.sort((a, b) => (b.price || 0) - (a.price || 0));
        else if (filterSort === 'overall_score') allListings.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
        else if (filterSort === 'views_count') allListings.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        else allListings.sort((a, b) => (b.date_parsed || '').localeCompare(a.date_parsed || ''));

        setTotal(allListings.length);
        const from = (page - 1) * ITEMS_PER_PAGE;
        setListings(allListings.slice(from, from + ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Load error:', error);
      // Fallback to localStorage on error
      const allListings = getListings();
      setTotal(allListings.length);
      const from = (page - 1) * ITEMS_PER_PAGE;
      setListings(allListings.slice(from, from + ITEMS_PER_PAGE));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить объявление?')) return;
    try {
      await fetch(`/api/listings?id=${id}`, { method: 'DELETE' }).catch(() => {});
      deleteListing(id);
      loadListings();
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Удалить ВСЕ объявления? Это действие необратимо!')) return;
    setIsDeleting(true);
    try {
      await fetch('/api/listings?all=true', { method: 'DELETE' }).catch(() => {});
      deleteAllListings();
      setListings([]);
      setTotal(0);
      setPage(1);
    } catch (error) {
      console.error('Delete all error:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
            onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
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
            onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
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
            onChange={(e) => { setFilterSort(e.target.value); setPage(1); }}
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
          <p style={{ fontSize: 16, marginBottom: 8 }}>Объявления не найдены</p>
          <p style={{ fontSize: 13 }}>Начните с поиска на странице «Поиск»</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {listings.map((listing) => (
              <div key={listing.id || listing.avito_id} style={{ position: 'relative' }}>
                <ListingCard
                  listing={listing}
                  onClick={() => {
                    if (listing.id) window.location.href = `/listings/${listing.id}`;
                    else if (listing.url) window.open(listing.url, '_blank');
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(listing.id || 0);
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
