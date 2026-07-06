'use client';

import { useEffect, useState } from 'react';
import PriceChart from '@/components/PriceChart';
import StatsPanel from '@/components/StatsPanel';
import { StatsResult } from '@/lib/types';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [period, setPeriod] = useState('30d');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStats();
  }, [period, city]);

  async function loadStats() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (city) params.set('city', city);
      const res = await fetch(`/api/stats?${params}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Удалить ВСЕ объявления и статистику? Это необратимо!')) return;
    setIsDeleting(true);
    try {
      await fetch('/api/listings?all=true', { method: 'DELETE' });
      setStats(null);
      loadStats();
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
      </div>
      <p style={{ color: '#6a6a7a', marginBottom: 24 }}>Статистика цен и тренды</p>

      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Период</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select">
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="365d">Год</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Все города"
            className="input"
            style={{ width: 180 }}
          />
        </div>

        <button onClick={loadStats} className="btn-primary" style={{ padding: '10px 20px' }}>
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Загрузка...
        </div>
      ) : (
        <>
          <StatsPanel stats={stats} />

          {stats?.price_history && stats.price_history.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <PriceChart data={stats.price_history} title="Динамика средней цены" />
            </div>
          )}

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Распределение цен</h3>
              {stats && stats.total_listings > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Минимум', value: formatPrice(stats.min_price || 0) },
                    { label: 'Максимум', value: formatPrice(stats.max_price || 0) },
                    { label: 'Средняя', value: formatPrice(stats.avg_price || 0) },
                    { label: 'Медиана', value: formatPrice(stats.median_price || 0) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: '#5a5a6a' }}>{label}:</span>
                      <span style={{ fontWeight: 500, color: '#a0a0b0' }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#5a5a6a', textAlign: 'center', padding: '16px 0' }}>Нет данных</p>
              )}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Рекомендации</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                {stats?.trend === 'up' && <p style={{ color: '#ef4444' }}>📈 Цены растут</p>}
                {stats?.trend === 'down' && <p style={{ color: '#22c55e' }}>📉 Цены снижаются</p>}
                {stats?.trend === 'stable' && <p style={{ color: '#a0a0b0' }}>➡️ Цены стабильны</p>}
                {stats && stats.total_listings < 10 && (
                  <p style={{ color: '#eab308' }}>⚠️ Мало данных — попробуйте расширенный поиск</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
