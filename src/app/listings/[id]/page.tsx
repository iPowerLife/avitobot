'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PriceChart from '@/components/PriceChart';
import { Listing, PriceHistory } from '@/lib/types';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadListing(params.id as string);
    }
  }, [params.id]);

  async function loadListing(id: string) {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();
      setListing(data.listing);
      setPriceHistory(data.priceHistory || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!listing?.id) return;
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      });
      const data = await res.json();
      if (data.success) {
        setListing({
          ...listing,
          text_quality_score: data.analysis.text_quality_score,
          image_quality_score: data.analysis.image_quality_score,
          overall_score: data.analysis.overall_score,
        });
      }
    } catch (error) {
      console.error('Analyze error:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">Загрузка...</div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12 text-gray-500">
        Объявление не найдено
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        ← Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {listing.images && listing.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 bg-gray-200">
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === i ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{listing.title}</h1>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('ru-RU').format(listing.price / 100)} ₽
              </span>
              {listing.overall_score > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  listing.overall_score >= 8 ? 'bg-green-100 text-green-700' :
                  listing.overall_score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Оценка: {listing.overall_score.toFixed(1)}/10
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span>📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
              <span>👤 {listing.seller_name || 'Неизвестно'}</span>
              <span className={listing.seller_type === 'business' ? 'text-blue-600 font-medium' : ''}>
                {listing.seller_type === 'business' ? '🏢 Бизнес' : '👤 Частное лицо'}
              </span>
              {listing.date_created && (
                <span>📅 {new Date(listing.date_created).toLocaleDateString('ru-RU')}</span>
              )}
            </div>

            {listing.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Открыть на Авито →
              </a>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Оценки</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Качество текста</span>
                  <span className="font-medium">{((listing.text_quality_score || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(listing.text_quality_score || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Качество фото</span>
                  <span className="font-medium">{((listing.image_quality_score || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(listing.image_quality_score || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Уникальность</span>
                  <span className="font-medium">{((listing.uniqueness_score || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(listing.uniqueness_score || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Пересчитать оценку
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">ID Авито:</dt>
                <dd className="font-mono text-gray-900">{listing.avito_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Фото:</dt>
                <dd className="text-gray-900">{listing.image_count || listing.images?.length || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Статус:</dt>
                <dd className="text-gray-900">{listing.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Спарсено:</dt>
                <dd className="text-gray-900">{new Date(listing.date_parsed).toLocaleString('ru-RU')}</dd>
              </div>
              {listing.address && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Адрес:</dt>
                  <dd className="text-gray-900 text-right max-w-[200px] truncate">{listing.address}</dd>
                </div>
              )}
            </dl>
          </div>

          {priceHistory.length > 0 && (
            <PriceChart
              data={priceHistory.map((h) => ({ date: h.recorded_at, price: h.price }))}
              title="История цены"
            />
          )}
        </div>
      </div>
    </div>
  );
}
