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
    if (params.id) loadListing(params.id as string);
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

  function formatDate(dateStr: string): string {
    if (!dateStr) return 'Неизвестно';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function renderStars(rating: number): string {
    if (rating === 0) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  }

  if (!listing) {
    return <div style={{ textAlign: 'center', padding: '48px 0', color: '#6a6a7a' }}>Объявление не найдено</div>;
  }

  return (
    <div>
      <button onClick={() => router.back()} style={{ marginBottom: 16, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        ← Назад
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 400, background: '#12121a' }}>
                <img src={listing.images[selectedImage]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              {listing.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        flexShrink: 0, width: 72, height: 72, borderRadius: 8, overflow: 'hidden',
                        border: selectedImage === i ? '2px solid #3b82f6' : '2px solid transparent',
                        cursor: 'pointer', padding: 0, background: 'none',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title + Price */}
          <div className="card" style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f5', marginBottom: 12 }}>{listing.title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                {listing.price > 0 ? `${new Intl.NumberFormat('ru-RU').format(listing.price)} ₽` : 'Договорная'}
              </span>
              {listing.overall_score > 0 && (
                <span className={listing.overall_score >= 7 ? 'badge badge-green' : listing.overall_score >= 5 ? 'badge badge-yellow' : 'badge badge-red'}>
                  Оценка: {listing.overall_score.toFixed(1)}/10
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: '#a0a0b0' }}>
              <span>📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
              {listing.date_created && <span>📅 {formatDate(listing.date_created)}</span>}
              {listing.views_count > 0 && <span>👁 {listing.views_count} просм.</span>}
              {listing.image_count > 0 && <span>📷 {listing.image_count} фото</span>}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 12 }}>Описание</h3>
              <p style={{ color: '#a0a0b0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{listing.description}</p>
            </div>
          )}

          {/* Link to Avito */}
          {listing.url && (
            <a href={listing.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', background: '#ff6600', color: 'white',
                borderRadius: 8, textDecoration: 'none', fontWeight: 500, width: 'fit-content',
              }}>
              Открыть на Авито →
            </a>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Seller card */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Продавец</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {listing.seller_url ? (
                <a href={listing.seller_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>
                  {listing.seller_name || 'Продавец'}
                </a>
              ) : (
                <span style={{ color: '#f0f0f5', fontWeight: 500, fontSize: 16 }}>{listing.seller_name || 'Продавец'}</span>
              )}

              <span className={listing.seller_type === 'business' ? 'badge badge-blue' : 'badge badge-purple'} style={{ width: 'fit-content' }}>
                {listing.seller_type === 'business' ? 'Бизнес' : 'Частное лицо'}
              </span>

              {listing.seller_rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#eab308', fontSize: 16 }}>{renderStars(listing.seller_rating)}</span>
                  <span style={{ color: '#a0a0b0', fontSize: 14 }}>{listing.seller_rating}</span>
                </div>
              )}

              {listing.seller_reviews_count > 0 && (
                <span style={{ color: '#6a6a7a', fontSize: 13 }}>
                  {listing.seller_reviews_count} отзывов
                </span>
              )}

              {listing.seller_id && (
                <a href={`https://www.avito.ru/all/profile/${listing.seller_id}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#3b82f6', fontSize: 13, textDecoration: 'none' }}>
                  Все объявления продавца →
                </a>
              )}
            </div>
          </div>

          {/* Scores */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Оценки</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Качество текста', value: listing.text_quality_score, color: '#3b82f6' },
                { label: 'Качество фото', value: listing.image_quality_score, color: '#22c55e' },
                { label: 'Уникальность', value: listing.uniqueness_score, color: '#a855f7' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: '#6a6a7a' }}>{label}</span>
                    <span style={{ color: '#a0a0b0' }}>{((value || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(value || 0) * 100}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAnalyze} style={{
              marginTop: 16, width: '100%', padding: '10px 16px',
              background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8,
              color: '#a0a0b0', cursor: 'pointer', fontSize: 13,
            }}>
              Пересчитать оценку
            </button>
          </div>

          {/* Meta info */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>Информация</h3>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                { label: 'ID Авито', value: listing.avito_id },
                { label: 'Фото', value: listing.image_count || listing.images?.length || 0 },
                { label: 'Просмотры', value: listing.views_count || '—' },
                { label: 'Статус', value: listing.status },
                { label: 'Размещено', value: formatDate(listing.date_created) },
                { label: 'Спарсено', value: new Date(listing.date_parsed).toLocaleString('ru-RU') },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <dt style={{ color: '#6a6a7a' }}>{label}:</dt>
                  <dd style={{ color: '#a0a0b0' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Price history */}
          {priceHistory.length > 0 && (
            <PriceChart data={priceHistory.map((h) => ({ date: h.recorded_at, price: h.price }))} title="История цены" />
          )}
        </div>
      </div>
    </div>
  );
}
