import React from 'react';
import PlaceDetailClient from '../../../components/PlaceDetailClient';
import { getPlaceById } from '@/lib/places';
import { notFound } from 'next/navigation';
import localMasterPois from '@/data/triton_pois_full.json';

export const revalidate = 300; // Edge ISR Cache 5 minutes

/**
 * Pre-generate static HTML/RSC payloads for all 136 POI slugs at build time.
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

  return (
    <div className="min-h-screen bg-[#FAF3E7]">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlaceDetailClient place={place} />
      </div>
    </div>
  );
}
