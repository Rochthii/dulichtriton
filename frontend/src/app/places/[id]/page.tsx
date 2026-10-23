import React from 'react';
import PlaceDetailClient from '../../../components/PlaceDetailClient';
import { getPlaceById } from '@/lib/places';
import { notFound } from 'next/navigation';
import localMasterPois from '@/data/triton_pois_full.json';
import { SITE_URL } from '@/lib/siteConfig';
import { presentPlaceImage, presentRating } from '@/lib/publicPlacePresentation';

import type { Metadata } from 'next';

export const revalidate = false; // 100% Static SSG with On-Demand Admin Revalidation (0 ISR Writes on visitor traffic)

/**
 * Dynamic OpenGraph & SEO Metadata for Social Sharing (Facebook, Zalo, Twitter)
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    return {
      title: 'Địa Điểm Không Tồn Tại — Du Lịch Tri Tôn',
      description: 'Không tìm thấy thông tin địa điểm bạn yêu cầu trên hệ thống Du Lịch Tri Tôn.',
    };
  }

  const title = `${place.name} — Cẩm Nang & Bản Đồ Du Lịch Tri Tôn`;
  const description = place.description 
    ? `${place.description.slice(0, 155)}...` 
    : `Tra cứu thông tin tham khảo và hướng dẫn đường đi đến ${place.name} tại ${place.commune || 'Tri Tôn'}, An Giang.`;
  const imageUrl = presentPlaceImage(place);

  const rawKeywords = [
    place.name,
    `${place.name} Tri Tôn`,
    place.commune ? `${place.name} ${place.commune}` : '',
    place.commune ? `xã ${place.commune}` : '',
    place.category || '',
    'du lịch Tri Tôn',
    'Bảy Núi An Giang',
    'địa điểm du lịch Tri Tôn',
    'kinh nghiệm du lịch Tri Tôn',
    'check in Tri Tôn',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: rawKeywords,
    alternates: {
      canonical: `${SITE_URL}/places/${place.slug || place.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/places/${place.slug || place.id}`,
      siteName: 'Du Lịch Tri Tôn AI',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: place.name,
        },
      ] : [],
      locale: 'vi_VN',
      type: 'article',
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/**
 * Pre-generate static HTML/RSC payloads for all POI slugs at build time.
 * Delivers < 50ms Edge TTFB without bloating static build size.
 */
export async function generateStaticParams() {
  const params: { id: string }[] = [];
  const seen = new Set<string>();

  for (const p of localMasterPois as any[]) {
    const slug = (p.slug || p.id || '').trim();
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      params.push({ id: slug });
    }
  }

  return params;
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Instant RAM / Bulk cache lookup (0.001ms)
  const place = await getPlaceById(id);

  if (!place) {
    notFound();
  }

  // ── JSON-LD Structured Data (Schema.org TouristAttraction) ────────────────
  const categoryMap: Record<string, string> = {
    nature: 'NaturalPlace',
    temple: 'LandmarksOrHistoricalBuildings',
    pagoda: 'LandmarksOrHistoricalBuildings',
    culture: 'LandmarksOrHistoricalBuildings',
    food: 'FoodEstablishment',
    restaurant: 'Restaurant',
    cafe: 'CafeOrCoffeeShop',
    homestay: 'LodgingBusiness',
    hotel: 'Hotel',
    market: 'ShoppingCenter',
    festival: 'Event',
  };
  const addType = categoryMap[place.category || ''] || 'TouristAttraction';
  const imageUrl = presentPlaceImage(place);
  const rating = presentRating(place.rating);
  const reviewCount = place.review_count;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['TouristAttraction', addType],
        '@id': `${SITE_URL}/places/${place.slug || place.id}#place`,
        name: place.name,
        description: place.description || '',
        url: `${SITE_URL}/places/${place.slug || place.id}`,
        image: imageUrl
          ? { '@type': 'ImageObject', url: imageUrl, name: place.name }
          : undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: place.commune || 'Tri Tôn',
          addressRegion: 'An Giang',
          addressCountry: 'VN',
          streetAddress: (place as any).address || `${place.commune}, Tri Tôn, An Giang`,
        },
        geo: (place as any).latitude && (place as any).longitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: (place as any).latitude,
              longitude: (place as any).longitude,
            }
          : undefined,
        aggregateRating: rating !== undefined && rating >= 1 && typeof reviewCount === 'number' && Number.isInteger(reviewCount) && reviewCount > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: rating,
              bestRating: 5,
              worstRating: 1,
              ratingCount: reviewCount,
            }
          : undefined,
        isLocatedInPlace: {
          '@type': 'AdministrativeArea',
          name: 'Tri Tôn',
          containedInPlace: {
            '@type': 'State',
            name: 'An Giang',
            containedInPlace: { '@type': 'Country', name: 'Việt Nam' },
          },
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.place-description', '.place-story'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Du Lịch Tri Tôn', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Địa Điểm', item: `${SITE_URL}/places` },
          { '@type': 'ListItem', position: 3, name: place.name, item: `${SITE_URL}/places/${place.slug || place.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#FAF3E7]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PlaceDetailClient place={place} />
        </div>
      </div>
    </>
  );
}
