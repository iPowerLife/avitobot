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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитика</h1>
      <p className="text-gray-600 mb-6">Статистика цен и тренды</p>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Период</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="365d">Год</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Все города"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <>
          <StatsPanel stats={stats} />

          {stats?.price_history && stats.price_history.length > 0 && (
            <div className="mt-6">
              <PriceChart data={stats.price_history} title="Динамика средней цены" />
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение цен</h3>
              {stats?.price_history && stats.price_history.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Минимум:</span>
                    <span className="font-medium">{new Intl.NumberFormat('ru-RU').format((stats.min_price || 0) / 100)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Максимум:</span>
                    <span className="font-medium">{new Intl.NumberFormat('ru-RU').format((stats.max_price || 0) / 100)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Средняя:</span>
                    <span className="font-medium">{new Intl.NumberFormat('ru-RU').format((stats.avg_price || 0) / 100)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Медиана:</span>
                    <span className="font-medium">{new Intl.NumberFormat('ru-RU').format((stats.median_price || 0) / 100)} ₽</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Нет данных</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Рекомендации</h3>
              <div className="space-y-3 text-sm">
                {stats?.trend === 'up' && (
                  <p className="text-red-600">📈 Цены растут — стоит рассмотреть повышение своих цен</p>
                )}
                {stats?.trend === 'down' && (
                  <p className="text-green-600">📉 Цены снижаются — хорошее время для покупки</p>
                )}
                {stats?.trend === 'stable' && (
                  <p className="text-gray-600">➡️ Цены стабильны — рыночная ситуация предсказуема</p>
                )}
                {stats && stats.total_listings < 10 && (
                  <p className="text-yellow-600">⚠️ Мало данных для анализа — попробуйте расширенный поиск</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
