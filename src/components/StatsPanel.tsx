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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-500 text-center">Загрузка статистики...</p>
      </div>
    );
  }

  const trendIcon = stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️';
  const trendText = stats.trend === 'up' ? 'Рост' : stats.trend === 'down' ? 'Снижение' : 'Стабильно';
  const trendColor = stats.trend === 'up' ? 'text-red-600' : stats.trend === 'down' ? 'text-green-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stats.total_listings}</p>
          <p className="text-sm text-gray-500">Объявлений</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{formatPrice(stats.avg_price)}</p>
          <p className="text-sm text-gray-500">Средняя цена</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{formatPrice(stats.median_price)}</p>
          <p className="text-sm text-gray-500">Медиана</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Мин — Макс</p>
          <p className="text-sm font-medium text-gray-700">
            {formatPrice(stats.min_price)} — {formatPrice(stats.max_price)}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className={`text-2xl font-bold ${trendColor}`}>
            {trendIcon} {trendText}
          </p>
          <p className="text-sm text-gray-500">Тренд</p>
        </div>
      </div>
    </div>
  );
}
