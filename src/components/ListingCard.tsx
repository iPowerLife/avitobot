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
  if (!price) return 'Договорная';
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
  // Get the best image URL - try multiple sources
  const getImageUrl = (): string | null => {
    // Check images array first
    if (listing.images && listing.images.length > 0) {
      const img = listing.images[0];
      if (img && img.includes('http')) return img;
      if (img && img.includes('//')) return `https:${img}`;
      if (img) return img;
    }
    return null;
  };

  const mainImage = getImageUrl();
  const score = listing.overall_score || 0;
  const scoreBadge = getScoreBadge(score);
  const imageCount = listing.image_count || listing.images?.length || 0;

  return (
    <div
      onClick={onClick}
      className="card"
      style={{ overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, background: '#0f0f18' }}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2a2a3a',
          }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Score badge */}
        {score > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className={scoreBadge.className}>{scoreBadge.text}</span>
          </div>
        )}

        {/* Image count */}
        {imageCount > 0 && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
          }}>
            📷 {imageCount}
          </div>
        )}

        {/* Views */}
        {listing.views_count > 0 && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
          }}>
            👁 {listing.views_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 14 }}>
        {/* Title */}
        <h3 style={{
          fontWeight: 600,
          color: '#f0f0f5',
          marginBottom: 6,
          lineHeight: 1.3,
          fontSize: 14,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {listing.title}
        </h3>

        {/* Price */}
        <p style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', marginBottom: 6 }}>
          {formatPrice(listing.price)}
        </p>

        {/* Description */}
        {listing.description && (
          <p style={{
            fontSize: 12,
            color: '#7a7a8a',
            lineHeight: 1.4,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.description}
          </p>
        )}

        {/* Location + Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: '#5a5a6a' }}>
          {listing.city && <span>📍 {listing.city}</span>}
          {listing.date_created && <span>• {formatDate(listing.date_created)}</span>}
        </div>

        {/* Seller row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 10,
          borderTop: '1px solid #222230',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {listing.seller_url ? (
              <a
                href={listing.seller_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
              >
                {listing.seller_name || 'Продавец'}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#a0a0b0', fontWeight: 500 }}>
                {listing.seller_name || 'Продавец'}
              </span>
            )}

            {listing.seller_rating > 0 && (
              <span style={{ fontSize: 11, color: '#eab308' }}>
                {renderStars(listing.seller_rating)} {listing.seller_rating}
              </span>
            )}

            {listing.seller_reviews_count > 0 && (
              <span style={{ fontSize: 10, color: '#5a5a6a' }}>
                ({listing.seller_reviews_count})
              </span>
            )}
          </div>

          <span className={listing.seller_type === 'business' ? 'badge badge-blue' : 'badge badge-purple'} style={{ fontSize: 10 }}>
            {listing.seller_type === 'business' ? 'Бизнес' : 'Лицео'}
          </span>
        </div>
      </div>
    </div>
  );
}
