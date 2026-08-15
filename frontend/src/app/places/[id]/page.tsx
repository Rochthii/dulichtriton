import React from 'react';
import PlaceDetailClient from '../../../components/PlaceDetailClient';
import { getPlaceById } from '@/lib/places';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch live place record directly from Supabase DB (0% Hardcoded Data in code)
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
