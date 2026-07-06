'use client';

import { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

function getScoreBadge(score: number): { text: string; className: string } {
  if (score >= 8) return { text: score.toFixed(1), className: 'badge badge-green' };
  if (score >= 6) return { text: score.toFixed(1), className: 'badge badge-yellow' };
  if (score >= 4) return { text: score.toFixed(1), className: 'badge badge-red' };
  return { text: score.toFixed(1), className: 'badge badge-red' };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price / 100) + ' ₽';
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
      <div style={{ position: 'relative', height: 200, background: '#1a1a25' }}>
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
      </div>

      <div style={{ padding: 16 }}>
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

        <p style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>
          {formatPrice(listing.price)}
        </p>

        <p style={{ fontSize: 13, color: '#6a6a7a', marginBottom: 8 }}>
          📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}
        </p>

        <p style={{
          fontSize: 13,
          color: '#6a6a7a',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          {listing.description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid #2a2a3a',
        }}>
          <span style={{ fontSize: 13, color: '#a0a0b0' }}>
            {listing.seller_name || 'Продавец'}
          </span>
          <span className={listing.seller_type === 'business' ? 'badge badge-blue' : 'badge badge-purple'}>
            {listing.seller_type === 'business' ? 'Бизнес' : 'Частное'}
          </span>
        </div>

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
