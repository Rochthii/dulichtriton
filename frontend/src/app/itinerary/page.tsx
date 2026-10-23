import React, { Suspense } from 'react';
import ItineraryClientPage from '@/components/ItineraryClientPage';

export const revalidate = 86400;

export default function ItineraryPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<p role="status">Đang tải lịch trình...</p>}><ItineraryClientPage /></Suspense>
    </div>
  );
}
