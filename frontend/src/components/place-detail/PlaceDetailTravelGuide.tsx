'use client';

import React, { useState } from 'react';
import { 
  Clock, Ticket, Bus, Car, Footprints, AlertTriangle, 
  Sun, CheckCircle2, AlertOctagon, Lightbulb
} from 'lucide-react';
import { TimeStatusResult } from '@/lib/timeStatus';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailTravelGuideProps {
  guide: any;
  goldenHourTip: any;
  terrainInfo: any;
  timeStatus: TimeStatusResult;
  priceLevel?: string;
  recommendedDuration?: string;
  openingHours?: string;
}

export default function PlaceDetailTravelGuide({
  guide,
  goldenHourTip,
  terrainInfo,
  timeStatus,
  priceLevel,
  recommendedDuration,
  openingHours,
}: PlaceDetailTravelGuideProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [guideTab, setGuideTab] = useState<'hours_ticket' | 'transport_slope' | 'best_season'>('hours_ticket');

  const isSteepMountain = terrainInfo.accessibilityLevel === 'steep_stairs' || !!terrainInfo.slopeWarning;
  const photoTipText = typeof goldenHourTip === 'string' ? goldenHourTip : (goldenHourTip?.photoTip || goldenHourTip?.goldenHoursTime || '');

  return (
    <section className="p-5 sm:p-7 rounded-[28px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-5 font-body">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26221B]/8 pb-3">
        <h2 className="text-base sm:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>{isEn ? "Practical Field Travel Guide" : "Cẩm Nang Thực Địa & Kinh Nghiệm Khám Phá"}</span>
        </h2>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#FAF3E7] p-1 rounded-2xl border border-[#26221B]/6 font-display">
          <button
            onClick={() => setGuideTab('hours_ticket')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideTab === 'hours_ticket' ? "bg-[#0E8C7F] text-white shadow-2xs" : "text-[#6B6355] hover:text-[#26221B]"
            }`}
          >
            {isEn ? "Hours & Tickets" : "Giờ & Vé"}
          </button>
          <button
            onClick={() => setGuideTab('transport_slope')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideTab === 'transport_slope' ? "bg-[#0E8C7F] text-white shadow-2xs" : "text-[#6B6355] hover:text-[#26221B]"
            }`}
          >
            {isEn ? "Roads & Safety" : "Đường Đi & Dốc"}
          </button>
          <button
            onClick={() => setGuideTab('best_season')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideTab === 'best_season' ? "bg-[#0E8C7F] text-white shadow-2xs" : "text-[#6B6355] hover:text-[#26221B]"
            }`}
          >
            {isEn ? "Golden Hours" : "Khung Giờ Vàng"}
          </button>
        </div>
      </div>

      {/* Tab 1: Hours & Tickets */}
      {guideTab === 'hours_ticket' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-1">
            <span className="font-bold text-[#6B6355] flex items-center gap-1.5 font-display">
              <Clock className="w-3.5 h-3.5 text-[#0E8C7F]" />
              <span>{isEn ? "Opening Hours:" : "Thời Gian Mở Cửa:"}</span>
            </span>
            <span className="font-extrabold text-[#26221B] text-sm block">
              {openingHours || guide?.opening_hours || (isEn ? "All Day (06:00 - 18:00)" : "Cả ngày (06:00 - 18:00)")}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block">{timeStatus.badgeText}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-1">
            <span className="font-bold text-[#6B6355] flex items-center gap-1.5 font-display">
              <Ticket className="w-3.5 h-3.5 text-[#F0A32F]" />
              <span>{isEn ? "Admission Ticket:" : "Vé Vào Cổng:"}</span>
            </span>
            <span className="font-extrabold text-[#26221B] text-sm block">
              {priceLevel || guide?.ticket_price || (isEn ? "Free Entry" : "Miễn phí")}
            </span>
            <span className="text-[11px] text-[#6B6355] block">
              {isEn ? "Parking fees may apply at local houses" : "Phí gửi xe tự quản tùy điểm (5k - 10k)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-1">
            <span className="font-bold text-[#6B6355] flex items-center gap-1.5 font-display">
              <Footprints className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isEn ? "Recommended Duration:" : "Thời Gian Khám Phá:"}</span>
            </span>
            <span className="font-extrabold text-[#26221B] text-sm block">
              {recommendedDuration || guide?.recommended_duration || (isEn ? "1 - 2.5 hours" : "1 - 2.5 giờ")}
            </span>
            <span className="text-[11px] text-[#6B6355] block">
              {isEn ? "Sufficient for check-in and sightseeing" : "Vừa vặn chụp ảnh và vãn cảnh"}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Roads & Vehicle Advice */}
      {guideTab === 'transport_slope' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-1.5">
              <span className="font-bold text-[#26221B] flex items-center gap-1.5 font-display">
                <Car className="w-4 h-4 text-[#0E8C7F]" />
                <span>{isEn ? "Recommended Vehicle:" : "Phương Tiện Khuyên Dùng:"}</span>
              </span>
              <p className="text-[#4A4336] leading-relaxed">
                {guide?.recommended_vehicle || (isSteepMountain ? (isEn ? "Manual motorbike or XE ÔM (Steep slopes). Automatic scooters discouraged." : "Xe số, xe côn tay hoặc đi xe ôm địa phương. Hạn chế xe ga dốc cao.") : (isEn ? "Cars, motorbikes, bicycles accessible via paved roads." : "Ô tô, xe máy, xe đạp đều tiếp cận thuận tiện đường nhựa.")) }
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-1.5">
              <span className="font-bold text-[#26221B] flex items-center gap-1.5 font-display">
                <Bus className="w-4 h-4 text-amber-600" />
                <span>{isEn ? "Road Conditions & Access:" : "Tình Trạng Đường Đi:"}</span>
              </span>
              <p className="text-[#4A4336] leading-relaxed">
                {guide?.road_condition || terrainInfo.roadQuality || (isEn ? "Concrete/asphalt roads in good condition." : "Đường nhựa phẳng, dễ đi, có biển báo chỉ dẫn rõ ràng.")}
              </p>
            </div>
          </div>

          {/* Slope Safety Alert if mountain */}
          {isSteepMountain && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-[#F26B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-display">
                  {isEn ? "Safety Alert: Mountain Slopes & Hairpin Turns" : "Cảnh Báo An Toàn: Đèo Dốc & Khúc Cua"}
                </span>
                <p className="text-[11px] text-[#4A4336] mt-0.5 leading-relaxed">
                  {terrainInfo.slopeWarning || (isEn ? "Steep slope section. Drive in low gear (gear 1-2). Do not hold brake continuously on descents." : "Đoạn đèo dốc cao. Hãy đi số thấp (số 1 hoặc 2), tuyệt đối không rà thắng liên tục khi xuống dốc.")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Golden Hours & Photo Tips */}
      {guideTab === 'best_season' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-emerald-50/60 border border-amber-300/60 space-y-2">
            <span className="font-bold text-[#F26B3A] flex items-center gap-1.5 font-display">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{isEn ? "Golden Time for Photography:" : "Khung Giờ Vàng Chụp Ảnh:"}</span>
            </span>
            <p className="text-[#4A4336] leading-relaxed">
              {photoTipText || (isEn ? "Early morning (06:00 - 08:30) and late afternoon sunset (16:30 - 18:00) offer the most breathtaking lighting." : "Sáng sớm (06:00 - 08:30) và chiều hoàng hôn (16:30 - 18:00) cho ánh sáng đẹp nhất và không bị gắt nắng.")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
