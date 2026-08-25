'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, Compass, Navigation, Phone, ChevronRight, Star } from 'lucide-react';
import { FoodMenuItem } from '@/lib/dataSanitizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailFoodAndNearbyProps {
  isGastronomyPOI: boolean;
  signatureMenu: FoodMenuItem[];
  dynamicNearbyFoods: any[];
  dynamicNearbyAttractions: any[];
  placeName: string;
  phone?: string;
}

export default function PlaceDetailFoodAndNearby({
  isGastronomyPOI,
  signatureMenu,
  dynamicNearbyFoods,
  dynamicNearbyAttractions,
  placeName,
  phone,
}: PlaceDetailFoodAndNearbyProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="space-y-6 font-body">
      {/* 1. If Gastronomy POI: Signature Menu Matrix */}
      {isGastronomyPOI && signatureMenu.length > 0 && (
        <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-orange-50/60 border border-amber-300/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#F26B3A]" />
              <h2 className="text-base sm:text-lg font-black text-[#26221B]">
                {isEn ? `Signature Specialty Menu: ${placeName}` : `Thực Đơn Chữ Ký & Đặc Sản: ${placeName}`}
              </h2>
            </div>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{isEn ? "Call to order" : "Gọi đặt món"}</span>
              </a>
            )}
          </div>

          <div className="space-y-4">
            {signatureMenu.map((group, gidx) => (
              <div key={gidx} className="space-y-2">
                <h3 className="text-xs font-bold text-[#6B6355] uppercase tracking-wider font-display">
                  {group.categoryName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/95 border border-amber-200/80 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between font-display">
                        <span className="font-extrabold text-xs text-[#26221B]">{item.name}</span>
                        <span className="text-[11px] font-bold text-[#F26B3A]">{item.price}</span>
                      </div>
                      <p className="text-[11px] text-[#6B6355] leading-relaxed">{item.note}</p>
                      {item.isSignature && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold inline-block">
                          ⭐ Chữ Ký Bảy Núi
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. If Attraction: Dynamic Real-world Nearby Food Spots */}
      {!isGastronomyPOI && dynamicNearbyFoods.length > 0 && (
        <section className="p-5 sm:p-7 rounded-[28px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#0E8C7F]" />
              <h2 className="text-base sm:text-lg font-black text-[#26221B]">
                {isEn ? "Nearby Specialties & Eateries (<5.5km)" : "Quán Ăn & Đặc Sản Lân Cận (<5.5km)"}
              </h2>
            </div>
            <span className="text-xs text-[#6B6355] font-mono">
              {isEn ? "Distance verified" : "Tính theo cự ly thực"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dynamicNearbyFoods.map((food, fidx) => {
              const displayName = isEn && food.name_en ? food.name_en : food.name;
              return (
                <div key={fidx} className="p-3 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-display">
                      <h3 className="font-bold text-xs text-[#26221B] line-clamp-1">{displayName}</h3>
                      <span className="text-[10px] font-bold text-[#0E8C7F]">{food.distanceText || `~${food.distanceKm}km`}</span>
                    </div>
                    <p className="text-[11px] text-[#6B6355] line-clamp-2 mt-1">{food.description || food.specialty}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6 font-display">
                    <Link href={`/places/${food.slug || food.id}`} className="text-[11px] font-bold text-[#0E8C7F] hover:underline">
                      {isEn ? "View menu" : "Xem quán"}
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-800 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>{isEn ? "Directions" : "Chỉ đường"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Nearby Scenic Attractions & Viewpoints */}
      {dynamicNearbyAttractions.length > 0 && (
        <section className="p-5 sm:p-7 rounded-[28px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0E8C7F]" />
              <h2 className="text-base sm:text-lg font-black text-[#26221B]">
                {isEn ? "Nearby Scenic Spots & Check-in Coordinates" : "Danh Thắng & Tọa Độ Tham Quan Lân Cận"}
              </h2>
            </div>
            <span className="text-xs text-[#6B6355] font-mono">
              {isEn ? "Smart connection" : "Tiện đường ghé thăm"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dynamicNearbyAttractions.map((spot, sidx) => {
              const displayName = isEn && spot.name_en ? spot.name_en : spot.name;
              return (
                <div key={sidx} className="p-3 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-display">
                      <h3 className="font-bold text-xs text-[#26221B] line-clamp-1">{displayName}</h3>
                      <span className="text-[10px] font-bold text-[#0E8C7F]">{spot.distanceText || `~${spot.distanceKm}km`}</span>
                    </div>
                    <p className="text-[11px] text-[#6B6355] line-clamp-2 mt-1">{spot.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6 font-display">
                    <Link href={`/places/${spot.slug || spot.id}`} className="text-[11px] font-bold text-[#0E8C7F] hover:underline">
                      {isEn ? "View details" : "Xem điểm"}
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-800 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>{isEn ? "Directions" : "Chỉ đường"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
