'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Search,
  RotateCcw,
  ImageOff,
} from 'lucide-react';

/* =========================================================================
   TYPE DEFINITIONS (100% STRICT TYPESCRIPT - ZERO ANY)
   ========================================================================= */
export type POICategory = 'nature' | 'culture' | 'food' | 'history' | 'stay';

export interface CategoryVisualMeta {
  readonly label: string;
  readonly bgClass: string;
  readonly textClass: string;
}

export interface POICardItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: POICategory;
  readonly commune: string;
  readonly address: string;
  readonly imageUrl: string;
  readonly mapsUrl: string;
  readonly openingHours?: string;
  readonly isVerified?: boolean;
  readonly verifiedDate?: string;
}

export interface TicketStopItem {
  readonly tourCode: string;
  readonly title: string;
  readonly duration: string;
  readonly stopsCount: number;
  readonly highlightRoute: string;
  readonly priceNote?: string;
}

export interface MetroStationItem {
  readonly order: number;
  readonly time: string;
  readonly name: string;
  readonly commune: string;
  readonly tip?: string;
  readonly travelToNext?: {
    readonly timeMin: number;
    readonly distanceKm: number;
  };
}

/* =========================================================================
   CATEGORY COLOR MAPPING (1 CATEGORY = 1 MÀU BẢN ĐỊA)
   ========================================================================= */
export const CATEGORY_META: Record<POICategory, CategoryVisualMeta> = {
  nature: {
    label: 'Thiên Nhiên',
    bgClass: 'bg-[#0E8C7F]',
    textClass: 'text-white',
  },
  culture: {
    label: 'Chùa Khmer',
    bgClass: 'bg-[#D9822B]',
    textClass: 'text-white',
  },
  food: {
    label: 'Đặc Sản Ẩm Thực',
    bgClass: 'bg-[#F26B3A]',
    textClass: 'text-white',
  },
  history: {
    label: 'Di Tích Lịch Sử',
    bgClass: 'bg-[#A6503A]',
    textClass: 'text-white',
  },
  stay: {
    label: 'Lưu Trú',
    bgClass: 'bg-[#8A5A33]',
    textClass: 'text-white',
  },
};

/* =========================================================================
   1. SIGNATURE COMPONENT: NÚT LƯU "TRÁI TIM THỐT NỐT" (48px Touch Target)
   ========================================================================= */
export interface PalmHeartButtonProps {
  readonly isSaved: boolean;
  readonly onToggle: () => void;
  readonly placeName: string;
}

export function PalmHeartButton({ isSaved, onToggle, placeName }: PalmHeartButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isSaved ? `Bỏ lưu ${placeName}` : `Lưu ${placeName} vào danh sách`}
      aria-pressed={isSaved}
      className="group relative min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-[#FFFDF7]/95 hover:bg-[#FFFDF7] shadow-[var(--shadow-elevation-sm)] hover:shadow-[var(--shadow-elevation-md)] border border-[#26221B]/10 transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F] focus-visible:ring-offset-2"
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 transition-transform duration-300 ${
          isSaved
            ? 'scale-110 text-[#F26B3A] fill-[#F26B3A]'
            : 'text-[#6B6355] fill-none group-hover:text-[#26221B]'
        }`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Silhouette biểu tượng Núi Cô Tô - Núi Tà Pạ & Cây Thốt Nốt Bản Địa */}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5v13" className="opacity-40" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

/* =========================================================================
   2. SIGNATURE COMPONENT: CON DẤU XÁC MINH THỰC ĐỊA (12° Print Stamp)
   ========================================================================= */
export interface VerifiedStampProps {
  readonly label?: string;
  readonly date?: string;
  readonly variant?: 'terracotta' | 'jade';
}

export function VerifiedStamp({
  label = 'ĐÃ XÁC MINH THỰC ĐỊA',
  date,
  variant = 'terracotta',
}: VerifiedStampProps) {
  const colorClasses =
    variant === 'jade'
      ? 'border-[#0E8C7F] text-[#0E8C7F]'
      : 'border-[#A6503A] text-[#A6503A]';

  return (
    <div
      role="status"
      aria-label="Thông tin đã được đội ngũ khảo sát thực địa xác minh"
      className={`inline-flex flex-col items-center justify-center p-2 rounded-full border-2 border-dashed ${colorClasses} rotate-[-12deg] select-none pointer-events-none transition-transform hover:rotate-0 duration-300 shadow-xs bg-white/60 backdrop-blur-[2px]`}
      style={{ width: '88px', height: '88px' }}
    >
      <CheckCircle2 className="w-4 h-4 mb-0.5 stroke-[2.5]" aria-hidden="true" />
      <span className="font-['Patrick_Hand',cursive] text-[9.5px] uppercase font-bold tracking-wider leading-tight text-center px-1">
        {label}
      </span>
      {date && (
        <time className="text-[7.5px] font-semibold tracking-tighter mt-0.5 opacity-80">
          {date}
        </time>
      )}
    </div>
  );
}

/* =========================================================================
   3. SIGNATURE COMPONENT: THẺ POI CARD (1 Giây Quét Mắt & Zero CLS)
   ========================================================================= */
export interface POICardProps {
  readonly place: POICardItem;
  readonly isSaved?: boolean;
  readonly onSaveToggle?: () => void;
}

export function POICard({ place, isSaved = false, onSaveToggle }: POICardProps) {
  const [imageError, setImageError] = useState(false);
  const handleImageError = useCallback(() => setImageError(true), []);
  const categoryConfig = CATEGORY_META[place.category] ?? CATEGORY_META.nature;

  return (
    <article className="group relative flex flex-col h-full bg-[#FFFDF7] rounded-[26px] overflow-hidden border border-[#26221B]/10 shadow-[var(--shadow-elevation-sm)] hover:shadow-[var(--shadow-elevation-md)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-250 ease-out">
      {/* Khung ảnh cố định tỷ lệ 4:3 chống giật khung hình (Zero CLS) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF3E7]">
        {imageError ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-4 text-[#6B6355] bg-[#FAF3E7]">
            <ImageOff className="w-8 h-8 mb-1.5 opacity-50" aria-hidden="true" />
            <span className="text-[11px] font-medium text-center">
              Hình ảnh đang cập nhật thực địa
            </span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={place.imageUrl}
            alt={`Danh thắng ${place.name} tại ${place.commune}`}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        {/* Scrim Gradient Đen 40% Bảo Vệ Tương Phản Chữ */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#26221B]/70 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Góc trên bên trái: Chip Category độc bản */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${categoryConfig.bgClass} ${categoryConfig.textClass} shadow-sm`}
          >
            {categoryConfig.label}
          </span>
        </div>

        {/* Góc trên bên phải: Nút lưu (Touch Target 48px) */}
        {onSaveToggle && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <PalmHeartButton
              isSaved={isSaved}
              onToggle={onSaveToggle}
              placeName={place.name}
            />
          </div>
        )}

        {/* Con dấu xác minh nếu có */}
        {place.isVerified && (
          <div className="absolute bottom-2 right-2 pointer-events-none opacity-95 z-10">
            <VerifiedStamp label="Xác minh" date={place.verifiedDate} variant="jade" />
          </div>
        )}
      </div>

      {/* Nội dung chi tiết (Defensive Layout) */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6355] mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0" aria-hidden="true" />
          <span className="truncate">{place.commune}, Tri Tôn</span>
        </div>

        {/* Tiêu đề chống tràn chữ Khmer */}
        <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[#26221B] leading-snug line-clamp-1 group-hover:text-[#0E8C7F] transition-colors">
          <Link
            href={`/places/${place.slug}`}
            className="focus-visible:outline-none focus-visible:underline"
          >
            {place.name}
          </Link>
        </h3>

        {/* Địa chỉ rút gọn */}
        <p className="mt-1 text-xs text-[#6B6355] line-clamp-1 leading-relaxed">
          {place.address}
        </p>

        {place.openingHours && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-[#6B6355]">
            <Clock className="w-3.5 h-3.5 text-[#D9822B] shrink-0" aria-hidden="true" />
            <span className="truncate">{place.openingHours}</span>
          </div>
        )}

        {/* Hàng CTA cuối thẻ: Duy nhất 1 nút Solid Vàng Thốt Nốt */}
        <div className="mt-auto pt-4 border-t border-[#26221B]/8 flex items-center justify-between gap-3">
          <Link
            href={`/places/${place.slug}`}
            className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F] rounded-md px-1"
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>

          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chỉ đường đến ${place.name}`}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-[transform,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F] focus-visible:ring-offset-2"
          >
            <Navigation className="w-3.5 h-3.5 stroke-[2.5] translate-y-[-0.5px] translate-x-[0.5px]" aria-hidden="true" />
            <span>Chỉ đường</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   4. SIGNATURE COMPONENT: THẺ LỊCH TRÌNH DẠNG VÉ (Pure CSS Radial Cutout)
   ========================================================================= */
export interface TicketStubCardProps {
  readonly ticket: TicketStopItem;
  readonly onSelect: () => void;
}

export function TicketStubCard({ ticket, onSelect }: TicketStubCardProps) {
  return (
    <article className="relative flex flex-col md:flex-row bg-[#FFFDF7] rounded-[24px] border border-[#26221B]/12 shadow-[var(--shadow-elevation-sm)] hover:shadow-[var(--shadow-elevation-md)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-250 ease-out overflow-hidden">
      {/* CUỐNG VÉ (STUB) - Bên trái trên desktop / Phía trên trên mobile */}
      <div className="relative flex md:flex-col justify-between items-center md:items-start p-5 bg-[#FAF3E7] md:w-48 border-b md:border-b-0 md:border-r border-dashed border-[#26221B]/25">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B6355]">
            MÃ CHUYẾN ĐI
          </span>
          <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-black text-[#0E8C7F] tracking-tight">
            {ticket.tourCode}
          </div>
        </div>

        <div className="text-right md:text-left mt-0 md:mt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B6355]">
            THỜI LƯỢNG
          </span>
          <div className="text-xs font-bold text-[#26221B]">{ticket.duration}</div>
          <div className="text-[11px] font-medium text-[#6B6355]">
            {ticket.stopsCount} trạm dừng
          </div>
        </div>

        {/* LỖ BÁN NGUYỆT TRÊN MOBILE (2 bên mép đường cắt đứt) */}
        <div
          className="md:hidden absolute -left-3 bottom-[-12px] w-6 h-6 rounded-full bg-[#FAF3E7] border border-[#26221B]/12 z-20"
          aria-hidden="true"
        />
        <div
          className="md:hidden absolute -right-3 bottom-[-12px] w-6 h-6 rounded-full bg-[#FAF3E7] border border-[#26221B]/12 z-20"
          aria-hidden="true"
        />
      </div>

      {/* LỖ BÁN NGUYỆT TRÊN DESKTOP (Đỉnh và Đáy đường cắt đứt) */}
      <div
        className="hidden md:block absolute left-48 -top-3 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FAF3E7] border border-[#26221B]/12 z-20"
        aria-hidden="true"
      />
      <div
        className="hidden md:block absolute left-48 -bottom-3 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FAF3E7] border border-[#26221B]/12 z-20"
        aria-hidden="true"
      />

      {/* THÂN VÉ (MAIN BODY) */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F26B3A]/10 text-[#F26B3A] text-[11px] font-bold mb-2">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>Khảo sát thực địa tối ưu</span>
          </div>

          <h4 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#26221B] leading-snug">
            {ticket.title}
          </h4>

          <p className="mt-1 text-xs text-[#6B6355] leading-relaxed">
            <span className="font-bold text-[#26221B]">Lộ trình:</span>{' '}
            {ticket.highlightRoute}
          </p>
        </div>

        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#26221B]/8">
          <span className="font-['Patrick_Hand',cursive] text-xs text-[#A6503A]">
            * {ticket.priceNote ?? 'Chi phí tự túc'}
          </span>

          <button
            type="button"
            onClick={onSelect}
            className="min-h-[44px] px-5 py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] text-xs font-bold shadow-sm active:scale-[0.98] transition-[transform,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F]"
          >
            Xem lịch trình
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   5. SIGNATURE COMPONENT: SƠ ĐỒ NỐI DÂY METRO-LINE DU LỊCH
   ========================================================================= */
export interface MetroLineProps {
  readonly stations: readonly MetroStationItem[];
}

export function MetroLineTimeline({ stations }: MetroLineProps) {
  return (
    <div
      role="list"
      aria-label="Lộ trình di chuyển các trạm dừng"
      className="relative pl-6 py-4"
    >
      {/* Tuyến line màu ngọc Tà Pạ với viền bo 4px */}
      <div
        className="absolute left-[13px] top-6 bottom-6 w-[3px] bg-[#0E8C7F] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="space-y-7">
        {stations.map((station, index) => (
          <div
            key={station.order}
            role="listitem"
            className="relative flex items-start gap-4"
          >
            {/* Chấm trạm tròn viền cát sương */}
            <div
              className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-[#0E8C7F] text-[#FAF3E7] font-bold text-xs shadow-xs ring-4 ring-[#FAF3E7]"
              aria-label={`Trạm dừng số ${station.order}`}
            >
              {station.order}
            </div>

            {/* Khung nội dung trạm dừng */}
            <div className="flex-1 bg-[#FFFDF7] p-4 rounded-[18px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.04)]">
              <div className="flex items-center justify-between text-xs text-[#6B6355] mb-1">
                <span className="font-bold text-[#D9822B] flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {station.time}
                </span>
                <span className="font-medium">{station.commune}</span>
              </div>

              <h5 className="font-['Bricolage_Grotesque',sans-serif] text-base font-bold text-[#26221B]">
                {station.name}
              </h5>

              {station.tip && (
                <p className="font-['Patrick_Hand',cursive] text-xs text-[#0E8C7F] mt-1">
                  Mẹo: {station.tip}
                </p>
              )}
            </div>

            {/* Pill Badge hiển thị khoảng cách và thời gian */}
            {station.travelToNext && index < stations.length - 1 && (
              <div
                className="absolute -bottom-4 left-0 z-20 translate-x-1"
                aria-label={`Di chuyển tiếp theo: ${station.travelToNext.timeMin} phút, quãng đường ${station.travelToNext.distanceKm} km`}
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E7] text-[#0E8C7F] text-[10px] font-bold border border-[#0E8C7F]/30 shadow-xs">
                  <Navigation className="w-2.5 h-2.5" aria-hidden="true" />
                  {station.travelToNext.timeMin} phút ({station.travelToNext.distanceKm} km)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   6. STATES: LOADING SKELETON SHIMMER & HONEST EMPTY STATE
   ========================================================================= */
export function POICardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải dữ liệu điểm đến..."
      className="flex flex-col h-full bg-[#FFFDF7] rounded-[26px] overflow-hidden border border-[#26221B]/8 animate-pulse"
    >
      <div className="aspect-[4/3] bg-[#26221B]/10 w-full" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-1/3 bg-[#26221B]/10 rounded-full" />
          <div className="h-5 w-3/4 bg-[#26221B]/10 rounded-full" />
          <div className="h-3 w-1/2 bg-[#26221B]/10 rounded-full" />
        </div>
        <div className="pt-4 flex justify-between items-center border-t border-[#26221B]/6">
          <div className="h-4 w-12 bg-[#26221B]/10 rounded-full" />
          <div className="h-9 w-24 bg-[#26221B]/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export interface HonestEmptyStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly onReset?: () => void;
}

export function HonestEmptyState({
  title = 'Chưa tìm thấy địa điểm phù hợp',
  message = 'Khu vực này hiện chưa có dữ liệu khảo sát thực địa được thẩm định.',
  onReset,
}: HonestEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 md:p-14 text-center bg-[#FFFDF7] rounded-[26px] border border-dashed border-[#26221B]/18 my-6"
    >
      <div className="w-14 h-14 rounded-full bg-[#FAF3E7] flex items-center justify-center text-[#6B6355] mb-4">
        <Search className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />
      </div>
      <h4 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#26221B]">
        {title}
      </h4>
      <p className="mt-1.5 text-xs text-[#6B6355] max-w-sm leading-relaxed">
        {message}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 min-h-[44px] px-5 py-2.5 rounded-full border border-[#0E8C7F] text-[#0E8C7F] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#0E8C7F]/5 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#0E8C7F]"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Đặt lại bộ lọc tìm kiếm</span>
        </button>
      )}
    </div>
  );
}
