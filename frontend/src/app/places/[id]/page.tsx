import React from 'react';
import PlaceDetailClient from '../../../components/PlaceDetailClient';
import { getPlaceById } from '@/lib/places';
import { notFound } from 'next/navigation';
import localMasterPois from '@/data/triton_pois_full.json';

export const revalidate = 300; // Edge ISR Cache 5 minutes

/**
 * Pre-generate static HTML/RSC payloads for all 136 POIs at build time.
 * This guarantees INSTANT (< 50ms) page loads on Vercel CDN without cold-start delay!
 */
export async function generateStaticParams() {
  const params: { id: string }[] = [];
  const seen = new Set<string>();

  for (const p of localMasterPois as any[]) {
    if (p.slug && !seen.has(p.slug)) {
      seen.add(p.slug);
      params.push({ id: p.slug });
    }
    if (p.id && !seen.has(p.id)) {
      seen.add(p.id);
      params.push({ id: p.id });
    }
  }

  return params;
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch live place record directly from Supabase DB (with local master fallback)
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
