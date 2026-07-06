'use client';

import { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

function getScoreBadge(score: number): { text: string; className: string } {
  if (score >= 8) return { text: score.toFixed(1), className: 'badge badge-green' };
  if (score >= 6) return { text: score.toFixed(1), className: 'badge badge-yellow' };
  return { text: score.toFixed(1), className: 'badge badge-red' };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
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

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  const mainImage = listing.images?.[0] || null;
  const score = listing.overall_score || 0;
  const scoreBadge = getScoreBadge(score);

  return (
    <div
      onClick={onClick}
      className="card"
      style={{ overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, background: '#12121a' }}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3a3a4a',
          }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {score > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span className={scoreBadge.className}>{scoreBadge.text}</span>
          </div>
        )}

        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
        }}>
          {listing.image_count || listing.images?.length || 0} фото
        </div>

        {listing.views_count > 0 && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {listing.views_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Title */}
        <h3 style={{
          fontWeight: 600,
          color: '#f0f0f5',
          marginBottom: 8,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {listing.title}
        </h3>

        {/* Price */}
        <p style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>
          {listing.price > 0 ? formatPrice(listing.price) : 'Договорная'}
        </p>

        {/* Description */}
        {listing.description && (
          <p style={{
            fontSize: 13,
            color: '#8a8a9a',
            lineHeight: 1.5,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.description}
          </p>
        )}

        {/* Location + Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#6a6a7a' }}>
          <span>📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
          {listing.date_created && (
            <span>• {formatDate(listing.date_created)}</span>
          )}
        </div>

        {/* Seller info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid #2a2a3a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {listing.seller_url ? (
              <a
                href={listing.seller_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}
              >
                {listing.seller_name || 'Продавец'}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#a0a0b0' }}>
                {listing.seller_name || 'Продавец'}
              </span>
            )}

            {listing.seller_rating > 0 && (
              <span style={{ fontSize: 12, color: '#eab308' }}>
                {renderStars(listing.seller_rating)} {listing.seller_rating}
              </span>
            )}

            {listing.seller_reviews_count > 0 && (
              <span style={{ fontSize: 11, color: '#6a6a7a' }}>
                ({listing.seller_reviews_count} отз.)
              </span>
            )}
          </div>

          <span className={listing.seller_type === 'business' ? 'badge badge-blue' : 'badge badge-purple'}>
            {listing.seller_type === 'business' ? 'Бизнес' : 'Частное'}
          </span>
        </div>

        {/* Analysis scores */}
        {(listing.text_quality_score > 0 || listing.image_quality_score > 0) && (
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #2a2a3a',
            fontSize: 12,
            color: '#6a6a7a',
          }}>
            <span>Текст: <span style={{ color: '#a0a0b0' }}>{(listing.text_quality_score * 100).toFixed(0)}%</span></span>
            <span>Фото: <span style={{ color: '#a0a0b0' }}>{(listing.image_quality_score * 100).toFixed(0)}%</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
