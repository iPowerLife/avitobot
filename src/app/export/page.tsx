'use client';

import { useState } from 'react';

export default function ExportPage() {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [limit, setLimit] = useState('1000');
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      const params = new URLSearchParams({ format, limit });
      if (city) params.set('city', city);
      if (category) params.set('category', category);
      if (priceMin) params.set('priceMin', (parseInt(priceMin) * 100).toString());
      if (priceMax) params.set('priceMax', (parseInt(priceMax) * 100).toString());

      const res = await fetch(`/api/export?${params}`);

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Ошибка экспорта');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avito_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка экспорта');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>Экспорт данных</h1>
      <p style={{ color: '#a0a0b0', marginBottom: 24 }}>Скачать спарсенные объявления в файл</p>

      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a0a0b0', marginBottom: 8 }}>
              Формат файла
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span style={{ fontSize: 14, color: '#a0a0b0' }}>CSV (для Excel)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span style={{ fontSize: 14, color: '#a0a0b0' }}>JSON (для разработчиков)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Город</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Все города"
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Категория</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Все категории"
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Цена от (₽)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Цена до (₽)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="∞"
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#6a6a7a', marginBottom: 4 }}>Максимум записей</label>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1 000</option>
              <option value="5000">5 000</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px' }}
          >
            {isExporting ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18 }} />
                Экспорт...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Скачать файл
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
