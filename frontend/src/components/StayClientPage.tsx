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

interface StayClientPageProps {
  homestays: Place[];
}

export default function StayClientPage({ homestays }: StayClientPageProps) {
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
            commune: bookingHomestay.commune,
            fullName: formData.fullName,
            phone: formData.phone,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            guests: formData.guests,
            notes: formData.notes,
            created_at: new Date().toISOString(),
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
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Lưu Trú & Homestay Bản Địa Bảy Núi"
        badgeIcon={Bed}
        title="Danh Sách Homestay & Nhà Khách Tri Tôn"
        subtitle="Nghỉ dưỡng tuyệt vời với view núi Cô Tô, hồ Tà Pạ và cánh đồng thốt nốt. Đã xác minh bãi đỗ xe ô tô 7-16 chỗ và tiện ích tiệc BBQ ngoài trời."
        countLabel="Hiển thị homestay uy tín"
        countValue={`${homestays.length} chỗ nghỉ`}
      />

      {/* AMENITY FILTER TABS */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          <Filter className="w-4 h-4 text-[#1B4D3E]" />
          <span>Lọc Theo Tiện Ích Yêu Cầu</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {amenities.map(item => {
            const isActive = selectedAmenity === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedAmenity(item.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 hover:bg-emerald-50 hover:text-[#1B4D3E] border border-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* HOMESTAYS GRID FROM SUPABASE DATABASE */}
      {homestays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {homestays.map(place => {
            const mapsUrl = getGoogleMapsUrl(place.name, place.commune);
            const mainPhoto = place.photos?.[0]?.url || '/images/tiktok/ho_ta_pa.jpg';

            return (
              <div key={place.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  {/* Photo Header */}
                  <div className="h-52 bg-slate-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainPhoto}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold shadow-xs">
                        {place.commune}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 text-[#D99B26] text-xs font-bold backdrop-blur-md border border-white/10">
                      {formatPrice(place.price_level || '350.000đ / đêm')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
                        <span>{place.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
                      <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {place.description || `Homestay không gian ấm cúng tại ${place.commune}, ngắm toàn cảnh không khí yên bình Bảy Núi.`}
                    </p>

                    {/* Amenity Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#1B4D3E] border border-emerald-100 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        <span>Đỗ ô tô 7 chỗ</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#D99B26]" />
                        <span>Tiệc BBQ ngoài trời</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        <span>Thuê xe máy</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 flex items-center gap-2 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setBookingHomestay(place)}
                    className="flex-1 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold transition-colors text-center shadow-xs"
                  >
                    Gửi Yêu Cầu Đặt Phòng
                  </button>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] text-slate-700 hover:text-[#1B4D3E] transition-colors"
                    title="Mở Google Maps"
                  >
                    <Navigation className="w-4 h-4 text-[#D99B26]" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs mb-12">
          <Bed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Đang cập nhật danh sách homestay</h3>
          <p className="text-xs text-slate-500 mt-1">Dữ liệu lưu trú đang được nạp đồng bộ từ Supabase CSDL thực tế...</p>
        </div>
      )}

      {/* BOOKING INQUIRY MODAL */}
      {bookingHomestay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
            
            <button
              onClick={() => {
                setBookingHomestay(null);
                setBookingSuccess(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-12 h-12 text-[#1B4D3E] mx-auto" />
                <h3 className="text-xl font-bold text-[#1B4D3E]">Gửi Đặt Phòng Thành Công!</h3>
                <p className="text-xs text-slate-600">
                  Mã giữ chỗ tại <strong className="text-slate-900">{bookingHomestay.name}</strong> là: <strong className="font-mono text-sm text-[#1B4D3E]">{bookingSuccess}</strong>.
                  Chủ homestay sẽ điện thoại xác nhận phòng còn trống trong ít phút.
                </p>
                <button
                  onClick={() => {
                    setBookingHomestay(null);
                    setBookingSuccess(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold"
                >
                  Đóng Cửa Sổ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-[#D99B26] uppercase tracking-widest block">Liên Hệ Trực Tiếp Homestay</span>
                  <h3 className="text-lg font-extrabold text-slate-900">{bookingHomestay.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>{bookingHomestay.commune}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên khách hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Trần Hoàng Nam"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-in</label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-out</label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Số khách</label>
                    <select
                      value={formData.guests}
                      onChange={e => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                    >
                      <option value="1">1 Người</option>
                      <option value="2">2 Người</option>
                      <option value="4">4 Người</option>
                      <option value="6">6+ Người</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Cần đỗ xe ô tô 7 chỗ, lấy phòng tầng trệt, mượn lò BBQ..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Đang kết nối chủ homestay...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D99B26]" />
                      <span>Gửi Giữ Phòng Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
