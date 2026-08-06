import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import PlaceDetailClient from '../../../components/PlaceDetailClient';
import { getPlaceById } from '@/lib/places';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch live place record directly from Supabase DB (0% Hardcoded Data in code)
  const place = await getPlaceById(id);

  if (!place) {
    // Fallback search or 404
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlaceDetailClient place={place} />
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}
