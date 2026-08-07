import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import FoodClientPage from '@/components/FoodClientPage';
import { getPlacesFiltered } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function FoodPage() {
  // Fetch real restaurants and food spots dynamically from Supabase CSDL
  const restaurants = await getPlacesFiltered('Tất cả', 'food_and_restaurants');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FoodClientPage restaurants={restaurants} />
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

