'use client';

import { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 bg-green-100';
  if (score >= 6) return 'text-yellow-600 bg-yellow-100';
  if (score >= 4) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price / 100) + ' ₽';
}

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  const mainImage = listing.images?.[0] || null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative h-48 bg-gray-200">
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {listing.overall_score > 0 && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(listing.overall_score)}`}>
            {listing.overall_score.toFixed(1)}
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {listing.image_count} фото
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {listing.title}
        </h3>

        <p className="text-2xl font-bold text-blue-600 mb-2">
          {formatPrice(listing.price)}
        </p>

        <p className="text-sm text-gray-500 mb-2">
          {listing.city}{listing.district ? `, ${listing.district}` : ''}
        </p>

        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {listing.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {listing.seller_name || 'Продавец'}
          </span>
          <span className={listing.seller_type === 'business' ? 'text-blue-500 font-medium' : ''}>
            {listing.seller_type === 'business' ? 'Бизнес' : 'Частное лицо'}
          </span>
        </div>

        {(listing.text_quality_score > 0 || listing.image_quality_score > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 text-xs">
            <span className="text-gray-500">
              Текст: <span className="font-medium">{(listing.text_quality_score * 100).toFixed(0)}%</span>
            </span>
            <span className="text-gray-500">
              Фото: <span className="font-medium">{(listing.image_quality_score * 100).toFixed(0)}%</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
