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

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>Аналитика</h1>
      <p style={{ color: '#a0a0b0', marginBottom: 24 }}>Статистика цен и тренды</p>

      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Период</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="select"
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="365d">Год</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Все города"
            className="input"
            style={{ width: 200 }}
          />
        </div>

        <button onClick={loadStats} className="btn-primary">
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

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Распределение цен</h3>
              {stats?.price_history && stats.price_history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#6a6a7a' }}>Минимум:</span>
                    <span style={{ fontWeight: 500, color: '#a0a0b0' }}>{new Intl.NumberFormat('ru-RU').format((stats.min_price || 0) / 100)} ₽</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#6a6a7a' }}>Максимум:</span>
                    <span style={{ fontWeight: 500, color: '#a0a0b0' }}>{new Intl.NumberFormat('ru-RU').format((stats.max_price || 0) / 100)} ₽</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#6a6a7a' }}>Средняя:</span>
                    <span style={{ fontWeight: 500, color: '#a0a0b0' }}>{new Intl.NumberFormat('ru-RU').format((stats.avg_price || 0) / 100)} ₽</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#6a6a7a' }}>Медиана:</span>
                    <span style={{ fontWeight: 500, color: '#a0a0b0' }}>{new Intl.NumberFormat('ru-RU').format((stats.median_price || 0) / 100)} ₽</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6a6a7a', textAlign: 'center', padding: '16px 0' }}>Нет данных</p>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Рекомендации</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                {stats?.trend === 'up' && (
                  <p style={{ color: '#ef4444' }}>📈 Цены растут — стоит рассмотреть повышение своих цен</p>
                )}
                {stats?.trend === 'down' && (
                  <p style={{ color: '#22c55e' }}>📉 Цены снижаются — хорошее время для покупки</p>
                )}
                {stats?.trend === 'stable' && (
                  <p style={{ color: '#a0a0b0' }}>➡️ Цены стабильны — рыночная ситуация предсказуема</p>
                )}
                {stats && stats.total_listings < 10 && (
                  <p style={{ color: '#eab308' }}>⚠️ Мало данных для анализа — попробуйте расширенный поиск</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
