import React from 'react';
import ChatbotWidget from '@/components/ChatbotWidget';
import ItineraryClientPage from '@/components/ItineraryClientPage';

export const revalidate = 60;

export default function PlannerPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ItineraryClientPage />
      <ChatbotWidget />
    </div>
  );
}
