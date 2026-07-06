'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data: { date: string; price: number }[];
  title?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price / 100) + ' ₽';
}

export default function PriceChart({ data, title = 'Динамика цен' }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>{title}</h3>
        <p style={{ color: '#6a6a7a', textAlign: 'center', padding: '32px 0' }}>Нет данных для отображения</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    priceFormatted: item.price / 100,
  }));

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6a6a7a' }} stroke="#2a2a3a" />
          <YAxis
            tick={{ fontSize: 12, fill: '#6a6a7a' }}
            stroke="#2a2a3a"
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a25',
              border: '1px solid #2a2a3a',
              borderRadius: 8,
              color: '#f0f0f5',
            }}
            formatter={(value) => [formatPrice(Number(value) * 100), 'Цена']}
            labelFormatter={(label) => `Дата: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="priceFormatted"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
