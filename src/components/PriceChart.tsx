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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">Нет данных для отображения</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    priceFormatted: item.price / 100,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
          />
          <Tooltip
            formatter={(value) => [formatPrice(Number(value) * 100), 'Цена']}
            labelFormatter={(label) => `Дата: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="priceFormatted"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
