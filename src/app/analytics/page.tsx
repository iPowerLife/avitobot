'use client';

import { useEffect, useState } from 'react';
import PriceChart from '@/components/PriceChart';
import { getStats, deleteAllListings } from '@/lib/storage';

interface LocalStats {
  avg_price: number;
  min_price: number;
  max_price: number;
  median_price: number;
  total_listings: number;
  trend: 'up' | 'down' | 'stable';
  price_history: { date: string; price: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<LocalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setIsLoading(true);
    try {
      // Try Supabase first
      const res = await fetch('/api/stats?period=30d');
      const data = await res.json();

      if (data.total_listings > 0) {
        setStats(data);
      } else {
        // Fallback to localStorage
        setStats(getStats());
      }
    } catch (error) {
      // Fallback to localStorage
      setStats(getStats());
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Очистить ВСЕ данные? Это необратимо!')) return;
    setIsDeleting(true);
    try {
      await fetch('/api/listings?all=true', { method: 'DELETE' }).catch(() => {});
      deleteAllListings();
      setStats(getStats());
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5' }}>Аналитика</h1>
        {stats && stats.total_listings > 0 && (
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
            {isDeleting ? 'Удаление...' : '🗑 Очистить данные'}
          </button>
        )}
      </div>
      <p style={{ color: '#6a6a7a', marginBottom: 24 }}>Статистика цен и тренды</p>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Загрузка...
        </div>
      ) : !stats || stats.total_listings === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: '#5a5a6a' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Нет данных для анализа</p>
          <p style={{ fontSize: 13 }}>Сначала спарьте объявления через поиск</p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              {[
                { label: 'Объявлений', value: stats.total_listings.toString(), color: '#3b82f6' },
                { label: 'Средняя цена', value: formatPrice(stats.avg_price), color: '#22c55e' },
                { label: 'Медиана', value: formatPrice(stats.median_price), color: '#eab308' },
                { label: 'Мин', value: formatPrice(stats.min_price), color: '#a0a0b0' },
                { label: 'Макс', value: formatPrice(stats.max_price), color: '#a0a0b0' },
                { label: 'Тренд', value: stats.trend === 'up' ? '📈 Рост' : stats.trend === 'down' ? '📉 Снижение' : '➡️ Стабильно', color: stats.trend === 'up' ? '#ef4444' : stats.trend === 'down' ? '#22c55e' : '#a0a0b0' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: 12, background: '#0f0f18', borderRadius: 10 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
                  <p style={{ fontSize: 12, color: '#5a5a6a' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price chart */}
          {stats.price_history.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <PriceChart data={stats.price_history} title="Динамика средней цены" />
            </div>
          )}

          {/* Insights */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 12 }}>Анализ рынка</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#a0a0b0' }}>
              {stats.trend === 'up' && <p>📈 Цены на услуги растут — рыночная конъюнктура благоприятна для продавцов</p>}
              {stats.trend === 'down' && <p>📉 Цены снижаются — хорошее время для покупателей</p>}
              {stats.trend === 'stable' && <p>➡️ Цены стабильны — предсказуемый рынок</p>}
              {stats.total_listings >= 10 && (
                <p>💡 Средняя цена: {formatPrice(stats.avg_price)}. Разброс: от {formatPrice(stats.min_price)} до {formatPrice(stats.max_price)}</p>
              )}
              {stats.total_listings < 10 && (
                <p>⚠️ Мало данных ({stats.total_listings} объявлений) — результаты могут быть неточными</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
