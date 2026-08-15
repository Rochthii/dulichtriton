import React from "react";

export default function PlaceDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
        {/* Back link skeleton */}
        <div className="h-6 w-32 bg-[#EBE1D0] rounded-xl" />

        {/* Hero Section Skeleton */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[32px] bg-[#E5DACE] overflow-hidden shadow-inner flex flex-col justify-end p-6 md:p-10 space-y-4">
          <div className="h-6 w-24 bg-white/40 rounded-full" />
          <div className="h-10 md:h-14 w-2/3 bg-white/60 rounded-2xl" />
          <div className="h-5 w-1/2 bg-white/40 rounded-xl" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-wrap gap-3">
          <div className="h-12 w-40 bg-[#E5DACE] rounded-2xl" />
          <div className="h-12 w-36 bg-[#E5DACE] rounded-2xl" />
          <div className="h-12 w-32 bg-[#E5DACE] rounded-2xl" />
        </div>

        {/* Content Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[28px] p-6 md:p-8 space-y-4 border border-[#EBE1D0]">
              <div className="h-8 w-48 bg-[#EBE1D0] rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-[#FAF3E7] rounded-lg" />
                <div className="h-4 w-5/6 bg-[#FAF3E7] rounded-lg" />
                <div className="h-4 w-4/6 bg-[#FAF3E7] rounded-lg" />
                <div className="h-4 w-full bg-[#FAF3E7] rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-6 space-y-4 border border-[#EBE1D0]">
              <div className="h-6 w-36 bg-[#EBE1D0] rounded-xl" />
              <div className="h-20 w-full bg-[#FAF3E7] rounded-2xl" />
              <div className="h-10 w-full bg-[#FAF3E7] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
