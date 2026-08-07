'use client';

import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Navigation, Sparkles, QrCode, 
  Car, Bike, Compass, Utensils, CheckCircle2, ChevronRight, Share2, Info
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import ItineraryExportModal from './ItineraryExportModal';
import PageHeaderBanner from './PageHeaderBanner';

interface ItineraryItem {
  timeSlot: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối';
  timeText: string;
  spotName: string;
  commune: string;
  category: string;
  description: string;
  distanceFromPrev?: string;
  foodSuggestion?: string;
}

interface DayPlan {
  dayNumber: number;
  dayTitle: string;
  items: ItineraryItem[];
}

export default function ItineraryClientPage() {
  const [days, setDays] = useState<'1' | '2' | '3'>('2');
  const [style, setStyle] = useState<'nature' | 'culture' | 'food' | 'homestay'>('nature');
  const [transport, setTransport] = useState<'bike' | 'car'>('bike');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Default sample AI Generated 2D1N Tour Plan
  const [currentPlan, setCurrentPlan] = useState<DayPlan[]>([
    {
      dayNumber: 1,
      dayTitle: 'Ngày 1: Chinh Phục Ngắm Bình Minh & Tinh Hoa Ẩm Thực Bảy Núi',
      items: [
        {
          timeSlot: 'Sáng',
          timeText: '06:00 - 08:30',
          spotName: 'Hồ Tà Pạ & Cổng Trời Koh Kas',
          commune: 'Xã Núi Tô & Xã Chau Lăng',
          category: 'Danh thắng Thiên nhiên',
          description: 'Đón bình minh rực rỡ soi bóng mặt hồ Tà Pạ ngọc bích, chụp ảnh check-in cổng chùa cổ Koh Kas giữa cánh đồng thốt nốt.',
          distanceFromPrev: 'Xuất phát từ Trung tâm Tri Tôn (3.5 km)'
        },
        {
          timeSlot: 'Trưa',
          timeText: '11:30 - 13:30',
          spotName: 'Khu Ẩm Thực Gà Đốt Ô Thum',
          commune: 'Xã Ô Lâm',
          category: 'Ẩm thực Bản địa',
          description: 'Thưởng thức đặc sản Gà Đốt lá chúc Ô Thum giòn rụm, giã muối ớt chanh và uống nước thốt nốt tươi ven lòng hồ Ô Thum mát rượi.',
          distanceFromPrev: 'Di chuyển 6.2 km (Haversine WGS84)',
          foodSuggestion: 'Gà Đốt Ô Thum Lá Chúc + Bánh bò thốt nốt'
        },
        {
          timeSlot: 'Chiều',
          timeText: '14:30 - 17:00',
          spotName: 'Di Tích Lịch Sử Đồi Tức Dụp',
          commune: 'Xã An Tức',
          category: 'Lịch sử & Di sản',
          description: 'Tham quan "Ngọn đồi 2 triệu hạm đội", khám phá hệ thống hang đá kiên cố và thung lũng tình yêu xanh ngát.',
          distanceFromPrev: 'Di chuyển 4.8 km'
        },
        {
          timeSlot: 'Tối',
          timeText: '18:30 - 21:00',
          spotName: 'Chợ Đêm Tri Tôn & Thưởng Thức Bún Mắm Khmer',
          commune: 'Thị trấn Tri Tôn',
          category: 'Ẩm thực & Mua sắm',
          description: 'Thưởng thức bún nước lèo Khmer nóng hổi, mua quà bánh tráng nướng và mật thốt nốt sấy dẻo.',
          distanceFromPrev: 'Di chuyển 5.1 km',
          foodSuggestion: 'Bún mắm Khmer cá lóc đồng + Chè thốt nốt'
        }
      ]
    },
    {
      dayNumber: 2,
      dayTitle: 'Ngày 2: Chiêm Bái Chùa Nam Tông & Ngắm Hoàng Hôn Hồ Soài Chek',
      items: [
        {
          timeSlot: 'Sáng',
          timeText: '07:30 - 10:00',
          spotName: 'Chùa Svay Ton (Chùa Xà Tón 300 Năm)',
          commune: 'Thị trấn Tri Tôn',
          category: 'Chùa Khmer cổ kính',
          description: 'Ngôi chùa lưu giữ nhiều bộ kinh lá buông bậc nhất Việt Nam với kiến trúc tháp nhọn rát vàng lộng lẫy.',
          distanceFromPrev: 'Di chuyển 1.2 km từ Homestay'
        },
        {
          timeSlot: 'Trưa',
          timeText: '11:30 - 13:00',
          spotName: 'Quán Bún Nước Lèo Chau Lăng',
          commune: 'Xã Chau Lăng',
          category: 'Ẩm thực truyền thống',
          description: 'Dùng bữa trưa nhẹ nhàng với tô bún nước lèo đậm vị mắm bồ hóc đặc sản Bảy Núi.',
          foodSuggestion: 'Bún nước lèo heo quay da giòn'
        },
        {
          timeSlot: 'Chiều',
          timeText: '14:30 - 17:30',
          spotName: 'Hồ Soài Chek & Vách Đá Latina',
          commune: 'Xã Núi Tô',
          category: 'Check-in Thiên nhiên',
          description: 'Ngắm hoàng hôn hoang sơ bên lòng hồ Soài Chek thơ mộng bạt ngàn dưới chân núi Cô Tô.',
          distanceFromPrev: 'Di chuyển 7.5 km'
        }
      ]
    }
  ]);

  const handleGenerateTour = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Thuật Toán Lập Tour Tự Động WGS84"
        badgeIcon={Sparkles}
        title="Trợ Lý AI Lập Lịch Trình Tour Tri Tôn"
        subtitle="Thuật toán AI tự động lọc toàn bộ địa điểm đã xác minh, tối ưu ma trận khoảng cách di chuyển Haversine ngắn nhất và gợi ý thực đơn đặc sản chuẩn vị."
        countLabel="Số ngày tour đề xuất"
        countValue={days === '1' ? '1 Ngày' : days === '2' ? '2 Ngày 1 Đêm' : '3 Ngày 2 Đêm'}
      />

      {/* TRIP GENERATOR PREFERENCE FORM */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#1B4D3E]" />
          <span>Tùy Chỉnh Phong Cách Du Lịch Của Bạn</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Duration Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Thời Gian Du Lịch</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: '1', label: '1 Ngày' },
                { key: '2', label: '2N1Đ' },
                { key: '3', label: '3N2Đ' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDays(item.key as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    days === item.key
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs'
                      : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#1B4D3E]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Phong Cách Ưa Thích</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-[#F8F9FA] focus:outline-none focus:border-[#1B4D3E]"
            >
              <option value="nature">Săn Ảnh & Danh Thắng Thiên Nhiên</option>
              <option value="culture">Văn Hóa & Chùa Nam Tông Khmer</option>
              <option value="food">Tín Đồ Ẩm Thực Gà Đốt Ô Thum</option>
              <option value="homestay">Nghỉ Dưỡng Homestay View Núi</option>
            </select>
          </div>

          {/* Transport Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Phương Tiện Di Chuyển</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransport('bike')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  transport === 'bike'
                    ? 'bg-[#D99B26] text-slate-900 border-[#D99B26] shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#D99B26]'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Xe Máy</span>
              </button>

              <button
                type="button"
                onClick={() => setTransport('car')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  transport === 'car'
                    ? 'bg-[#D99B26] text-slate-900 border-[#D99B26] shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#D99B26]'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Ô Tô</span>
              </button>
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerateTour}
            disabled={isGenerating}
            className="px-8 py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span>{isGenerating ? 'AI Đang Tính Lộ Trình...' : 'Tái Tạo Lịch Trình Tối Ưu'}</span>
          </button>
        </div>
      </section>

      {/* ITINERARY RESULT TIMELINE */}
      <div className="space-y-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#D99B26] uppercase tracking-wider block mb-1">Gợi Ý Đã Được Kiểm Định</span>
            <h2 className="text-2xl font-bold text-slate-900">Lịch Trình Đề Xuất Tour {days === '1' ? '1 Ngày' : '2 Ngày 1 Đêm'} Bảy Núi</h2>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-900 text-xs font-bold shadow-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Xuất QR Code & Tải PDF Lịch Trình</span>
          </button>
        </div>

        {/* Day-by-Day Loops */}
        {currentPlan.slice(0, Number(days)).map((day) => (
          <div key={day.dayNumber} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1B4D3E] font-extrabold text-lg flex items-center justify-center border border-emerald-100">
                {day.dayNumber}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{day.dayTitle}</h3>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-100">
              {day.items.map((item, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-[#1B4D3E] border-2 border-white ring-4 ring-emerald-50 group-hover:scale-125 transition-transform"></div>

                  <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200 hover:border-[#1B4D3E] transition-all space-y-3">
                    
                    {/* Top Row: Time & Category */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white font-mono text-[11px] font-bold">
                          {item.timeText}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.timeSlot}</span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1B4D3E] border border-emerald-100">
                        {item.category}
                      </span>
                    </div>

                    {/* Spot Title & Commune */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.spotName}</h4>
                      <p className="text-xs text-[#1B4D3E] font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>{item.commune}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                    {/* Food Recommendation if any */}
                    {item.foodSuggestion && (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs flex items-center gap-2 text-amber-900">
                        <Utensils className="w-4 h-4 text-[#D99B26] shrink-0" />
                        <span>Gợi ý dùng bữa: <strong>{item.foodSuggestion}</strong></span>
                      </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200/60">
                      {item.distanceFromPrev ? (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.distanceFromPrev}
                        </span>
                      ) : <span></span>}

                      <a
                        href={getGoogleMapsUrl(item.spotName, item.commune)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#1B4D3E] hover:underline"
                      >
                        <span>Mở bản đồ WGS84</span>
                        <Navigation className="w-3.5 h-3.5 text-[#D99B26]" />
                      </a>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        ))}

      </div>

      {/* EXPORT QR MODAL */}
      <ItineraryExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        tourTitle={`Tour ${days === '1' ? '1 Ngày' : '2 Ngày 1 Đêm'} Khám Phá Tri Tôn`}
        duration={`${days} Ngày`}
        totalSpots={days === '1' ? 4 : 7}
      />
    </>
  );
}
