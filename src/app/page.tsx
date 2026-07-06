'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import StatsPanel from '@/components/StatsPanel';
import { Listing, StatsResult } from '@/lib/types';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [listingsRes, statsRes] = await Promise.all([
        fetch('/api/listings?limit=6&sort=overall_score'),
        fetch('/api/stats?period=30d'),
      ]);

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>
          AvitoBot — Парсер объявлений
        </h1>
        <p style={{ color: '#a0a0b0', fontSize: 16 }}>
          Парсинг, анализ и статистика объявлений Авито в одном месте
        </p>
      </div>

      <StatsPanel stats={stats} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f5' }}>Лучшие объявления</h2>
        <Link href="/listings" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
          Смотреть все →
        </Link>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Загрузка...
        </div>
      ) : listings.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <svg width="64" height="64" fill="none" stroke="#3a3a4a" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 8 }}>Нет данных</h3>
          <p style={{ color: '#6a6a7a', marginBottom: 24 }}>Начните с поиска объявлений</p>
          <Link href="/search" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Перейти к поиску
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id || listing.avito_id}
              listing={listing}
              onClick={() => window.location.href = `/listings/${listing.id}`}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Link href="/search" className="card" style={{ padding: 24, textDecoration: 'none' }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }}>Поиск</h3>
          <p style={{ fontSize: 14, color: '#6a6a7a' }}>Найти объявления по запросу</p>
        </Link>

        <Link href="/analytics" className="card" style={{ padding: 24, textDecoration: 'none' }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="24" height="24" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }}>Аналитика</h3>
          <p style={{ fontSize: 14, color: '#6a6a7a' }}>Графики и тренды цен</p>
        </Link>

        <Link href="/export" className="card" style={{ padding: 24, textDecoration: 'none' }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="24" height="24" fill="none" stroke="#a855f7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }}>Экспорт</h3>
          <p style={{ fontSize: 14, color: '#6a6a7a' }}>Скачать данные в CSV/JSON</p>
        </Link>
      </div>
    </div>
  );
}
