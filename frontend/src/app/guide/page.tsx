import React from 'react';
import GuideClientPage from '@/components/GuideClientPage';

export const revalidate = 86400;

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuideClientPage />
      </div>
    </div>
  );
}


