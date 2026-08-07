import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import StayClientPage from '@/components/StayClientPage';
import { getPlacesFiltered } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function StayPage() {
  // Fetch real homestays and lodging spots dynamically from Supabase CSDL
  const homestays = await getPlacesFiltered('Tất cả', 'cafes_and_homestays');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StayClientPage homestays={homestays} />
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

