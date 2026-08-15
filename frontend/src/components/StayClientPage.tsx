'use client';

import React, { useState } from 'react';
import { 
  Bed, MapPin, Navigation, Star, Phone, Car, Flame, 
  Bike, CheckCircle2, Filter, ShieldCheck, Clock, Sparkles, X, Heart
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';
import PageHeaderBanner from './PageHeaderBanner';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { fetchWithCache } from '@/lib/fastCache';

interface StayClientPageProps {
  homestays: Place[];
}

export default function StayClientPage({ homestays: initialHomestays }: StayClientPageProps) {
  const [staysList, setStaysList] = useState<Place[]>(initialHomestays || []);
  const [loading, setLoading] = useState<boolean>(staysList.length === 0);

  React.useEffect(() => {
    async function loadLiveStays() {
      try {
        setLoading(true);
        const data = await fetchWithCache('client-stays-places-12', async () => {
          const res = await fetch('/api/v1/stays?limit=12');
          return await res.json();
        });

        if (data?.stays && Array.isArray(data.stays) && data.stays.length > 0) {
          setStaysList(data.stays);
        }
      } catch (err) {
        console.error('[StayClientPage] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveStays();
  }, []);

  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [bookingHomestay, setBookingHomestay] = useState<Place | null>(null);
  
  // Booking Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: '2',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const amenities = [
    { key: 'all', label: 'Tất cả tiện ích' },
    { key: 'parking', label: 'Bãi đỗ xe ô tô' },
    { key: 'mountain_view', label: 'View núi Cô Tô' },
    { key: 'bbq', label: 'Sân nướng BBQ' },
    { key: 'bike_rental', label: 'Cho thuê xe máy' },
  ];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !bookingHomestay) {
      alert('Vui lòng điền đầy đủ Họ tên và Số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = 'STAY-' + Math.floor(100000 + Math.random() * 900000);
      
      // Real backend operation: write directly to Supabase audit_logs
      await supabase.from('audit_logs').insert([
        {
          action: 'HOMESTAY_BOOKING_REQUEST',
          entity: 'homestay_booking',
          details: {
            bookingCode: code,
            homestayName: bookingHomestay.name,
            fullName: formData.fullName,
            phone: formData.phone,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            guests: formData.guests,
            notes: formData.notes,
          }
        }
      ]);

      setBookingSuccess(code);
    } catch (err) {
      console.error('Homestay booking failed:', err);
      alert('Không thể kết nối. Vui lòng gọi trực tiếp hotline homestay!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Lưu Trú & Homestay Bản Địa Bảy Núi"
        badgeIcon={Bed}
        title="Danh Sách Homestay & Nhà Khách Tri Tôn"
        subtitle="Nghỉ dưỡng tuyệt vời với view núi Cô Tô, hồ Tà Pạ và cánh đồng thốt nốt. Đã xác minh bãi đỗ xe ô tô 7-16 chỗ và tiện ích tiệc BBQ ngoài trời."
        countLabel="Hiển thị homestay uy tín"
        countValue={`${staysList.length} chỗ nghỉ`}
      />

      {/* AMENITY FILTER TABS (Pill Style) */}
      <div className="bg-[#FFFDF7] p-4 sm:p-6 rounded-[22px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#26221B] uppercase tracking-wider mb-3 font-display">
          <Filter className="w-4 h-4 text-[#0E8C7F]" />
          <span>Lọc Theo Tiện Ích Yêu Cầu</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {amenities.map(item => {
            const isActive = selectedAmenity === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedAmenity(item.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all font-display active:scale-95 ${
                  isActive
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* HOMESTAYS GRID FROM SUPABASE DATABASE */}
      {staysList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {staysList.map(place => {
            const detailUrl = `/places/${place.slug || place.id}`;
            const { maps } = resolvePlaceExternalLinks({
              name: place.name,
              commune: place.commune,
              video_url: place.video_url,
            });
            const mainPhoto = place.image_url || place.photos?.[0]?.url || '/images/tiktok/ho_ta_pa.jpg';

            return (
              <div key={place.id} className="relative bg-[#FFFDF7] rounded-[26px] border border-[#26221B]/8 overflow-hidden shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-[0_10px_30px_rgba(38,34,27,0.14)] transition-all flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
                {/* 1-Touch Main Link Overlay */}
                <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${place.name}`} />

                <div className="pointer-events-none">
                  {/* Photo Header */}
                  <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainPhoto}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-[#8A5A33] text-white text-[10px] font-bold shadow-xs font-display">
                        {place.commune}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#26221B]/90 text-[#FFD37A] text-xs font-bold backdrop-blur-md border border-white/10 font-display">
                      {formatPrice(place.price_level || '350.000đ / đêm')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-[#26221B] group-hover:text-[#0E8C7F] transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#26221B]">
                        <Star className="w-3.5 h-3.5 fill-[#F0A32F] text-[#F0A32F]" />
                        <span>{place.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="font-body text-xs text-[#6B6355] flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                      <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                    </p>

                    <p className="font-body text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {place.description || `Homestay view đẹp tại ${place.commune}, phục vụ du khách khám phá Bảy Núi.`}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 flex items-center gap-2 border-t border-[#26221B]/6 mt-2 relative z-10 pointer-events-auto font-display">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingHomestay(place);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs shadow-xs transition-all text-center flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>Đặt Phòng</span>
                  </button>

                  <a
                    href={maps.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="py-2.5 px-3.5 rounded-full bg-transparent border border-[#26221B]/20 hover:border-[#0E8C7F] hover:text-[#0E8C7F] text-[#26221B] text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                    title={maps.tooltip}
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0E8C7F]" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FFFDF7] rounded-[26px] p-8 text-center border border-[#26221B]/8">
          <Bed className="w-8 h-8 text-[#6B6355]/40 mx-auto mb-2" />
          <p className="text-xs text-[#6B6355]">Đang cập nhật danh sách homestay từ Supabase database...</p>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingHomestay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] rounded-[28px] max-w-md w-full p-6 shadow-2xl relative border border-[#26221B]/10 overflow-hidden font-body">
            <button
              onClick={() => setBookingHomestay(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B6355] hover:bg-[#FAF3E7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F] flex items-center justify-center">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#26221B]">Đặt Chỗ Nghỉ Homestay</h3>
                <p className="text-xs text-[#0E8C7F] font-bold">{bookingHomestay.name}</p>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="bg-[#FAF3E7] border border-[#0E8C7F]/30 rounded-[22px] p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#0E8C7F] mx-auto" />
                <h4 className="font-display font-bold text-[#0E8C7F]">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-[#6B6355]">
                  Mã đặt chỗ của bạn: <strong className="text-[#26221B] font-mono">{bookingSuccess}</strong>. Chủ homestay sẽ liên hệ xác nhận trong ít phút.
                </p>
                <button
                  onClick={() => {
                    setBookingSuccess(null);
                    setBookingHomestay(null);
                  }}
                  className="px-5 py-2 rounded-full bg-[#0E8C7F] text-white text-xs font-bold font-display"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block font-bold text-[#26221B] mb-1 font-display">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Trần Văn Bình"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#26221B] mb-1 font-display">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#26221B] mb-1 font-display">Ngày Nhận Phòng</label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-3 py-2 rounded-full border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#26221B] mb-1 font-display">Ngày Trả Phòng</label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-3 py-2 rounded-full border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#26221B] mb-1 font-display">Số Khách</label>
                  <select
                    value={formData.guests}
                    onChange={e => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  >
                    <option value="1">1 Khách</option>
                    <option value="2">2 Khách (Phòng đôi)</option>
                    <option value="4">3 - 4 Khách (Phòng gia đình)</option>
                    <option value="8">Đoàn đông (Thuê nguyên căn / Phòng dorm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#26221B] mb-1 font-display">Ghi Chú</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Cần đỗ xe 7 chỗ, cần thuê 2 xe máy..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-2xl border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs shadow-md transition-all font-display active:scale-95"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Đặt Chỗ'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
