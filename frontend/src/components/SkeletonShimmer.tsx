'use client';

import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-[#FFFDF7] rounded-[26px] p-4 border border-[#26221B]/8 shadow-xs animate-pulse space-y-3">
      <div className="aspect-[4/3] w-full rounded-[20px] bg-[#26221B]/6" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-[#26221B]/8" />
        <div className="h-3 w-1/2 rounded-full bg-[#26221B]/6" />
      </div>
      <div className="pt-2 border-t border-[#26221B]/6 flex justify-between">
        <div className="h-3 w-1/3 rounded-full bg-[#26221B]/6" />
        <div className="h-3 w-1/4 rounded-full bg-[#26221B]/6" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
