'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Coins, Users, Sparkles, ChevronRight, AlertTriangle, Sun, CloudRain } from 'lucide-react';

interface SmartTripBuilderProps {
  onTourSelected: (slug: string, costLabel: string, tourName: string) => void;
}

type Duration = 'half-day' | '1-day' | '2-day' | '3-day';
type Budget = 'budget' | 'comfort' | 'luxury';
type Group = 'solo' | 'couple' | 'family' | 'friends';

const TOUR_LOOKUP: Record<Duration, Record<Budget, Record<Group, { slug: string; cost: string; name: string }>>> = {
  'half-day': {
    budget:  { solo: { slug: 'express-nua-ngay', cost: '50k–100k', name: 'Express Nửa Ngày' }, couple: { slug: 'express-nua-ngay', cost: '50k–100k', name: 'Express Nửa Ngày' }, family: { slug: 'express-nua-ngay', cost: '50k–100k', name: 'Express Nửa Ngày' }, friends: { slug: 'express-nua-ngay', cost: '50k–100k', name: 'Express Nửa Ngày' } },
    comfort: { solo: { slug: 'dem-tri-ton-nha-thieu-nhi-pho-di-bo', cost: '80k–160k', name: 'Đêm Tri Tôn - Phố Đi Bộ' }, couple: { slug: 'sunset-dinner-tour', cost: '300k–500k/cặp', name: 'Sunset & Dinner Tour' }, family: { slug: 'express-nua-ngay', cost: '50k–100k', name: 'Express Nửa Ngày' }, friends: { slug: 'chay-xe-dem-tri-ton', cost: '80k–150k', name: 'Chạy Xe Đêm Tri Tôn' } },
    luxury:  { solo: { slug: 'sunset-dinner-tour', cost: '300k–500k/cặp', name: 'Sunset & Dinner Tour' }, couple: { slug: 'sunset-dinner-tour', cost: '300k–500k/cặp', name: 'Sunset & Dinner Tour' }, family: { slug: 'sunset-dinner-tour', cost: '300k–500k/cặp', name: 'Sunset & Dinner Tour' }, friends: { slug: 'hoang-hon-bbq-ga-dot-dem', cost: '300k–500k', name: 'Hoàng Hôn + BBQ Gà Đốt' } },
  },
  '1-day': {
    budget:  { solo: { slug: 'song-ao-checkin-1-ngay', cost: '200k–400k', name: 'Sống Ảo Check-in 1 Ngày' }, couple: { slug: 'song-ao-checkin-1-ngay', cost: '200k–400k', name: 'Sống Ảo Check-in 1 Ngày' }, family: { slug: 'tam-linh-hanh-huong-1-ngay', cost: '100k–200k', name: 'Tâm Linh Hành Hương' }, friends: { slug: 'cafe-hopping-tri-ton', cost: '200k–400k', name: 'Cafe Hopping Tri Tôn' } },
    comfort: { solo: { slug: 'kinh-dien-1-ngay', cost: '300k–500k', name: 'Kinh Điển 1 Ngày' }, couple: { slug: 'kinh-dien-1-ngay', cost: '300k–500k', name: 'Kinh Điển 1 Ngày' }, family: { slug: 'lich-su-ve-nguon-1-ngay', cost: '150k–300k', name: 'Lịch Sử Về Nguồn' }, friends: { slug: 'food-tour-am-thuc-1-ngay-dem', cost: '600k–1tr', name: 'Food Tour Ẩm Thực' } },
    luxury:  { solo: { slug: 'photographer-tour', cost: '300k–500k', name: 'Photographer Tour' }, couple: { slug: 'photographer-tour', cost: '300k–500k', name: 'Photographer Tour' }, family: { slug: 'kinh-dien-1-ngay', cost: '300k–500k', name: 'Kinh Điển 1 Ngày' }, friends: { slug: 'food-tour-am-thuc-1-ngay-dem', cost: '600k–1tr', name: 'Food Tour Ẩm Thực' } },
  },
  '2-day': {
    budget:  { solo: { slug: 'backpacker-budget-2n1d', cost: '250k–450k', name: 'Backpacker Budget 2N1Đ' }, couple: { slug: 'backpacker-budget-2n1d', cost: '250k–450k', name: 'Backpacker Budget 2N1Đ' }, family: { slug: 'family-weekend-2n1d', cost: '700k–1.2tr/GĐ', name: 'Family Weekend 2N1Đ' }, friends: { slug: 'toan-canh-2n1d', cost: '800k–1.2tr', name: 'Toàn Cảnh 2N1Đ' } },
    comfort: { solo: { slug: 'weekend-2n1d-day-dem', cost: '900k–1.5tr', name: 'Weekend 2N1Đ Đầy Đủ' }, couple: { slug: 'weekend-2n1d-day-dem', cost: '900k–1.5tr', name: 'Weekend 2N1Đ Đầy Đủ' }, family: { slug: 'family-weekend-2n1d', cost: '700k–1.2tr/GĐ', name: 'Family Weekend 2N1Đ' }, friends: { slug: 'mua-le-hoi-dua-bo', cost: '400k–700k', name: 'Mùa Lễ Hội Đua Bò' } },
    luxury:  { solo: { slug: 'luxury-chill-2n1d', cost: '1tr–2tr/cặp', name: 'Luxury Chill 2N1Đ' }, couple: { slug: 'luxury-chill-2n1d', cost: '1tr–2tr/cặp', name: 'Luxury Chill 2N1Đ' }, family: { slug: 'family-weekend-2n1d', cost: '700k–1.2tr/GĐ', name: 'Family Weekend 2N1Đ' }, friends: { slug: 'luxury-chill-2n1d', cost: '1tr–2tr/cặp', name: 'Luxury Chill 2N1Đ' } },
  },
  '3-day': {
    budget:  { solo: { slug: 'kham-pha-sau-3n2d', cost: '1.5tr–2.5tr', name: 'Khám Phá Sâu 3N2Đ' }, couple: { slug: 'kham-pha-sau-3n2d', cost: '1.5tr–2.5tr', name: 'Khám Phá Sâu 3N2Đ' }, family: { slug: 'kham-pha-sau-3n2d', cost: '1.5tr–2.5tr', name: 'Khám Phá Sâu 3N2Đ' }, friends: { slug: 'kham-pha-sau-3n2d', cost: '1.5tr–2.5tr', name: 'Khám Phá Sâu 3N2Đ' } },
    comfort: { solo: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, couple: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, family: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, friends: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' } },
    luxury:  { solo: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, couple: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, family: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' }, friends: { slug: 'full-experience-3n2d', cost: '1.8tr–3tr', name: 'Full Experience 3N2Đ' } },
  },
};

const DURATION_OPTIONS = [
  { key: 'half-day' as Duration, label: 'Nửa Ngày', desc: '3–5 tiếng' },
  { key: '1-day' as Duration, label: '1 Ngày', desc: 'Trọn vẹn' },
  { key: '2-day' as Duration, label: '2N1Đ', desc: 'Có lưu trú' },
  { key: '3-day' as Duration, label: '3N2Đ', desc: 'Sâu nhất' },
];

const BUDGET_OPTIONS = [
  { key: 'budget' as Budget, label: 'Tiết Kiệm', desc: 'Phượt bụi' },
  { key: 'comfort' as Budget, label: 'Thoải Mái', desc: 'Cân bằng nhất' },
  { key: 'luxury' as Budget, label: 'Nghỉ Dưỡng', desc: 'Premium' },
];

const GROUP_OPTIONS = [
  { key: 'solo' as Group, label: 'Solo / 1 Mình', icon: '🏕️' },
  { key: 'couple' as Group, label: 'Cặp Đôi', icon: '💑' },
  { key: 'family' as Group, label: 'Gia Đình', icon: '👨‍👩‍👧' },
  { key: 'friends' as Group, label: 'Nhóm Bạn', icon: '🎒' },
];

function getSeasonalTip() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 11) {
    return { type: 'rain', text: 'Mùa mưa: Cảnh núi xanh mướt & xem đua bừa Chùa Rô. Tránh leo dốc khi mưa chiều.' };
  }
  return { type: 'sun', text: 'Mùa khô: Bình minh & hoàng hôn ngũ sắc đẹp nhất. Khởi hành 6h–8h30 hoặc chiều 16h–18h.' };
}

export default function SmartTripBuilder({ onTourSelected }: SmartTripBuilderProps) {
  const [duration, setDuration] = useState<Duration>('1-day');
  const [budget, setBudget] = useState<Budget>('comfort');
  const [group, setGroup] = useState<Group>('couple');
  const [isRevealed, setIsRevealed] = useState(false);

  const result = useMemo(() => TOUR_LOOKUP[duration][budget][group], [duration, budget, group]);
  const tip = getSeasonalTip();

  const handleReveal = () => {
    setIsRevealed(true);
    onTourSelected(result.slug, result.cost, result.name);
  };

  const pillBase = 'flex flex-col items-center px-3 sm:px-4 py-2 rounded-[14px] border text-xs font-bold transition-all tap-bounce font-display cursor-pointer';
  const pillActive = 'bg-[#0E8C7F] text-white border-[#0E8C7F] shadow-sm';
  const pillInactive = 'bg-white/80 text-[#6B6355] border-[#26221B]/10 hover:border-[#0E8C7F]/30';

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-amber-50/40 to-emerald-50/30 rounded-[26px] border border-amber-300/50 shadow-sm p-4 sm:p-6 space-y-4 font-body">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#0E8C7F]/10">
          <Sparkles className="w-4 h-4 text-[#0E8C7F]" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-sm sm:text-base text-[#26221B]">Tìm Lịch Trình Phù Hợp Với Bạn</h3>
          <p className="text-[11px] text-[#6B6355]">Chọn 3 tiêu chí — gợi ý tour tối ưu ngay lập tức</p>
        </div>
      </div>

      {/* Seasonal Tip */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-[14px] bg-white/70 border border-amber-200/60 text-[11px] text-[#6B6355] leading-relaxed">
        {tip.type === 'rain'
          ? <CloudRain className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          : <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        }
        <span>{tip.text}</span>
      </div>

      {/* Row 1: Duration */}
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6355] uppercase tracking-wider font-display">
          <Clock className="w-3 h-3" /> Thời gian chuyến đi
        </span>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => { setDuration(opt.key); setIsRevealed(false); }}
              className={`${pillBase} ${duration === opt.key ? pillActive : pillInactive}`}>
              <span>{opt.label}</span>
              <span className={`text-[9px] font-medium mt-0.5 ${duration === opt.key ? 'text-white/75' : 'text-[#6B6355]/60'}`}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Budget */}
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6355] uppercase tracking-wider font-display">
          <Coins className="w-3 h-3" /> Phong cách chi tiêu
        </span>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => { setBudget(opt.key); setIsRevealed(false); }}
              className={`${pillBase} ${budget === opt.key ? 'bg-[#D9822B] text-white border-[#D9822B] shadow-sm' : pillInactive}`}>
              <span>{opt.label}</span>
              <span className={`text-[9px] font-medium mt-0.5 ${budget === opt.key ? 'text-white/75' : 'text-[#6B6355]/60'}`}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Group */}
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6355] uppercase tracking-wider font-display">
          <Users className="w-3 h-3" /> Đi cùng ai?
        </span>
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => { setGroup(opt.key); setIsRevealed(false); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-[14px] border text-xs font-bold transition-all tap-bounce font-display ${group === opt.key ? 'bg-[#26221B] text-white border-[#26221B] shadow-sm' : pillInactive}`}>
              <span>{opt.icon}</span><span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA or Result */}
      {!isRevealed ? (
        <button onClick={handleReveal}
          className="w-full py-3 rounded-[18px] bg-[#0E8C7F] hover:bg-[#085A52] text-white font-display font-extrabold text-sm flex items-center justify-center gap-2 transition-all tap-bounce shadow-sm">
          <Sparkles className="w-4 h-4" />
          Gợi Ý Tour Phù Hợp Nhất
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="p-4 rounded-[18px] bg-[#0E8C7F]/8 border border-[#0E8C7F]/20 space-y-2.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-[#0E8C7F] uppercase tracking-wider font-display">Tour Gợi Ý</span>
              <p className="font-display font-extrabold text-sm sm:text-base text-[#26221B] mt-0.5">{result.name}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6B6355] uppercase font-display">Chi phí ước tính</span>
              <p className="font-display font-extrabold text-sm text-[#D9822B]">~{result.cost}/người</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-[#6B6355]">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span>Chi phí tại chỗ ở Tri Tôn (chưa gồm vé xe từ tỉnh khác). Phần lớn danh thắng miễn phí vé — tiền chủ yếu ở ăn uống & lưu trú.</span>
          </div>
          <button onClick={() => setIsRevealed(false)}
            className="w-full mt-1 py-2 rounded-[14px] bg-white border border-[#0E8C7F]/30 text-[#0E8C7F] text-xs font-bold font-display hover:bg-[#0E8C7F]/5 transition-colors">
            Đổi tiêu chí khác
          </button>
        </div>
      )}
    </div>
  );
}