import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        {/* Header banner skeleton */}
        <div className="h-44 md:h-56 w-full rounded-[32px] bg-[#E5DACE] shadow-inner flex flex-col justify-end p-6 md:p-8 space-y-3">
          <div className="h-6 w-32 bg-white/40 rounded-full" />
          <div className="h-8 md:h-12 w-1/2 bg-white/60 rounded-2xl" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex gap-2.5 overflow-hidden py-1">
          <div className="h-10 w-28 bg-[#EBE1D0] rounded-full shrink-0" />
          <div className="h-10 w-32 bg-[#EBE1D0] rounded-full shrink-0" />
          <div className="h-10 w-24 bg-[#EBE1D0] rounded-full shrink-0" />
          <div className="h-10 w-36 bg-[#EBE1D0] rounded-full shrink-0" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-[#FFFDF7] rounded-[28px] overflow-hidden border border-[#EBE1D0] shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] w-full bg-[#E5DACE]" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-[#EBE1D0] rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-[#FAF3E7] rounded-lg" />
                  <div className="h-3.5 w-4/5 bg-[#FAF3E7] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
