import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import GuideClientPage from '@/components/GuideClientPage';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuideClientPage />
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

