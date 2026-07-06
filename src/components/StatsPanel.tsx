'use client';

import { StatsResult } from '@/lib/types';

interface StatsPanelProps {
  stats: StatsResult | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price / 100) + ' ₽';
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <p style={{ color: '#6a6a7a', textAlign: 'center' }}>Загрузка статистики...</p>
      </div>
    );
  }

  const trendConfig = {
    up: { icon: '📈', text: 'Рост', color: '#ef4444' },
    down: { icon: '📉', text: 'Снижение', color: '#22c55e' },
    stable: { icon: '➡️', text: 'Стабильно', color: '#a0a0b0' },
  };

  const trend = trendConfig[stats.trend] || trendConfig.stable;

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 20 }}>Статистика</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#12121a',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{stats.total_listings}</p>
          <p style={{ fontSize: 13, color: '#6a6a7a' }}>Объявлений</p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#12121a',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{formatPrice(stats.avg_price)}</p>
          <p style={{ fontSize: 13, color: '#6a6a7a' }}>Средняя цена</p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#12121a',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#eab308' }}>{formatPrice(stats.median_price)}</p>
          <p style={{ fontSize: 13, color: '#6a6a7a' }}>Медиана</p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#12121a',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Мин — Макс</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#a0a0b0' }}>
            {formatPrice(stats.min_price)} — {formatPrice(stats.max_price)}
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#12121a',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: trend.color }}>
            {trend.icon} {trend.text}
          </p>
          <p style={{ fontSize: 13, color: '#6a6a7a' }}>Тренд</p>
        </div>
      </div>
    </div>
  );
}
