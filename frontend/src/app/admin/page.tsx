import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import AdminClientPage from '@/components/AdminClientPage';
import { getPlacesFiltered } from '@/lib/places';

export const revalidate = 0; // Dynamic real-time data for Admin

export default async function AdminDashboardPage() {
  // Fetch initial master places for Admin Control Center
  const places = await getPlacesFiltered();

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminClientPage initialPlaces={places} />
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

