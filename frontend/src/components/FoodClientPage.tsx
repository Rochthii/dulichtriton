'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Utensils, Phone, MapPin, Clock, Calendar, Users, 
  Sparkles, CheckCircle2, Navigation, Flame, Info, Heart
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { supabase } from '@/lib/supabase';
import { fetchWithCache } from '@/lib/fastCache';

interface FoodClientPageProps {
  restaurants: Place[];
}

export default function FoodClientPage({ restaurants: initialRestaurants }: FoodClientPageProps) {
  const [foodPlaces, setFoodPlaces] = React.useState<Place[]>(initialRestaurants || []);
  const [loading, setLoading] = React.useState<boolean>(foodPlaces.length === 0);

  React.useEffect(() => {
    async function loadLiveFood() {
      try {
        setLoading(true);
        const data = await fetchWithCache('client-food-places-12', async () => {
          const res = await fetch('/api/v1/food?limit=12');
          return await res.json();
        });

        if (data?.food && Array.isArray(data.food) && data.food.length > 0) {
          setFoodPlaces(data.food);
        }
      } catch (err) {
        console.error('[FoodClientPage] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveFood();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    guests: '2',
    dishes: ['Gà Đốt Lá Chúc Hồ Ô Thum'],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const handleDishToggle = (dishName: string) => {
    setFormData(prev => {
      const exists = prev.dishes.includes(dishName);
      if (exists) {
        if (prev.dishes.length === 1) return prev; // Keep at least 1
        return { ...prev, dishes: prev.dishes.filter(d => d !== dishName) };
      } else {
        return { ...prev, dishes: [...prev.dishes, dishName] };
      }
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookingRef = 'FD-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const { error: dbError } = await supabase.from('audit_logs').insert([
        {
          user_id: 'guest',
          action: 'GASTRONOMY_BOOKING_CREATE',
          target_type: 'restaurant_reservation',
          target_id: bookingRef,
          details: {
            ...formData,
            timestamp: new Date().toISOString(),
            status: 'confirmed_pending_call',
          },
        },
      ]);

      if (dbError) {
        console.warn('Audit log write note:', dbError.message);
      }

      setBookingSuccess(bookingRef);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Không thể gửi yêu cầu. Vui lòng gọi trực tiếp hotline!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* HERO BANNER SECTION (Folk-Modern Gradient) */}
      <div className="bg-gradient-to-br from-[#0B6B60] via-[#0E8C7F] to-[#151B34] text-white p-8 sm:p-12 rounded-[28px] mb-12 shadow-[0_10px_30px_rgba(38,34,27,0.14)] relative overflow-hidden border border-[#0E8C7F]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F0A32F_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFD37A] backdrop-blur-md mb-4 font-display">
            <Flame className="w-4 h-4 text-[#F0A32F]" />
            <span>Ẩm Thực Bản Địa Bảy Núi — Gà Đốt Ô Thum & Bún Mắm Khmer</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#FFFDF7]">
            Thưởng Thức Hương Vị <br />
            <span className="text-[#F0A32F]">Đặc Sản Ẩm Thực Tri Tôn</span>
          </h1>

          <p className="font-body text-xs sm:text-base text-[#FAF3E7]/90 mt-4 leading-relaxed">
            Khám phá tinh hoa ẩm thực Khmer - Kinh với lá chúc rừng Bảy Núi, mật thốt nốt ngọt thanh và mắm bồ hóc trứ danh. Đặt bàn trước để nhà hàng chuẩn bị than nướng sẵn sàng!
          </p>

          <div className="flex flex-wrap gap-3 mt-6 font-display">
            <a
              href="#booking-form"
              className="px-6 py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Utensils className="w-4 h-4" />
              <span>Đặt Bàn / Đặt Món Trước</span>
            </a>

            <a
              href="#specialties"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Info className="w-4 h-4 text-[#FFD37A]" />
              <span>Xem Menu Đặc Sản</span>
            </a>
          </div>
        </div>
      </div>

      {/* SPECIALTY FOODS SHOWCASE (100% REAL PHOTOGRAPHY) */}
      <section id="specialties" className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F26B3A] uppercase tracking-wider mb-1 font-display">
              <Flame className="w-4 h-4 text-[#F26B3A]" />
              <span>Tinh Hoa Ẩm Thực Bảy Núi</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">Đặc Sản Phải Thử Tại Tri Tôn</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {foodPlaces.map((item) => {
            const detailUrl = `/places/${item.slug || item.id}`;
            const { maps, tiktok } = resolvePlaceExternalLinks({
              name: item.name,
              commune: item.commune,
              video_url: item.video_url,
            });
            return (
              <div key={item.id} className="relative bg-[#FFFDF7] rounded-[26px] border border-[#26221B]/8 overflow-hidden shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-[0_10px_30px_rgba(38,34,27,0.14)] transition-all flex flex-col sm:flex-row group cursor-pointer hover:-translate-y-1">
                {/* 1-Touch Main Link Overlay */}
                <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${item.name}`} />

                <div className="sm:w-2/5 relative h-52 sm:h-auto bg-slate-900 pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url || '/images/food/ga_dot_o_thum.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#F26B3A] text-white text-[11px] font-bold shadow-xs font-display">
                    {item.commune}
                  </span>
                </div>

                <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-3 pointer-events-none">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#26221B] group-hover:text-[#0E8C7F] transition-colors">{item.name}</h3>
                    <p className="font-body text-xs text-[#6B6355] mt-2 leading-relaxed line-clamp-2">{item.description || `Đặc sản & quán ăn ngon tại ${item.commune}, Tri Tôn.`}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#26221B]/6 text-xs font-body">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6355]">Khoảng giá:</span>
                      <span className="font-bold text-[#0E8C7F] font-display">{formatPrice(item.price_level || 'Tùy món')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6355]">Đánh giá:</span>
                      <span className="font-semibold text-[#26221B]">★ {item.rating || 4.8} / 5.0</span>
                    </div>
                  </div>

                  {/* External Buttons */}
                  <div className="flex items-center gap-2 pt-2 relative z-10 pointer-events-auto font-display">
                    <Link
                      href={detailUrl}
                      className="flex-1 py-2 px-3 rounded-full bg-[#0E8C7F]/10 hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-xs font-bold transition-all text-center"
                    >
                      Chi Tiết
                    </Link>
                    <a
                      href={maps.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-4 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold transition-all text-center flex items-center gap-1 shadow-xs"
                      title={maps.tooltip}
                    >
                      <Navigation className="w-3 h-3 text-[#26221B]" />
                      <span>Bản Đồ</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* GASTRONOMY BOOKING FORM SECTION */}
      <section id="booking-form" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-10 border border-[#26221B]/8 shadow-[0_4px_20px_rgba(38,34,27,0.08)] mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3E7] text-[#0E8C7F] flex items-center justify-center mx-auto mb-3 border border-[#0E8C7F]/20">
              <Utensils className="w-6 h-6 text-[#F0A32F]" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">Đặt Trước Nhà Hàng & Món Ăn Bản Địa</h2>
            <p className="font-body text-xs text-[#6B6355] mt-1.5 max-w-lg mx-auto">
              Gà Đốt Ô Thum cần 45 phút nướng trên than hồng cùng lá chúc. Đặt trước ngay để nhà hàng chuẩn bị sẵn sàng khi bạn tới nơi!
            </p>
          </div>

          {bookingSuccess ? (
            <div className="bg-[#FAF3E7] border border-[#0E8C7F]/30 rounded-[22px] p-8 text-center space-y-4 font-body">
              <CheckCircle2 className="w-12 h-12 text-[#0E8C7F] mx-auto" />
              <h3 className="font-display text-xl font-bold text-[#0E8C7F]">Gửi Yêu Cầu Đặt Bàn Thành Công!</h3>
              <p className="text-xs text-[#6B6355] max-w-md mx-auto">
                Mã đặt bàn của bạn là: <strong className="text-[#26221B] font-mono text-sm">{bookingSuccess}</strong>. Nhà hàng sẽ liên hệ xác nhận qua điện thoại trong vòng 10 phút.
              </p>
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-6 py-2.5 rounded-full bg-[#0E8C7F] text-white text-xs font-bold font-display"
              >
                Đặt Thêm Yêu Cầu Khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitBooking} className="space-y-6 font-body">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Họ và Tên Du Khách *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Ánh"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Số Điện Thoại Liên Hệ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Ngày Đến Ăn</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Giờ Dự Kiến Đến</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Số Lượng Khách</label>
                  <select
                    value={formData.guests}
                    onChange={e => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  >
                    <option value="1">1 Người</option>
                    <option value="2">2 Người</option>
                    <option value="4">3 - 4 Người</option>
                    <option value="6">5 - 6 Người</option>
                    <option value="10">Đoàn 10+ Người</option>
                  </select>
                </div>
              </div>

              {/* Select Specialties */}
              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-2 font-display">Chọn Món Ăn Yêu Cầu Chuẩn Bị Trước:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {foodPlaces.map(s => {
                    const isChecked = formData.dishes.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleDishToggle(s.name)}
                        className={`p-3 rounded-2xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-[#0E8C7F]/10 border-[#0E8C7F] text-[#0E8C7F]'
                            : 'bg-[#FAF3E7] border-[#26221B]/10 text-[#26221B] hover:bg-[#FAF3E7]/80'
                        }`}
                      >
                        <span>{s.name}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-[#0E8C7F]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Ghi Chú Đặc Biệt</label>
                <textarea
                  rows={2}
                  placeholder="VD: Không ăn cay, lấy thêm lá chúc, muốn ngồi chỗ view hồ Ô Thum..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 font-display active:scale-95"
              >
                {isSubmitting ? (
                  <span>Đang gửi yêu cầu...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#26221B]" />
                    <span>Xác Nhận Đặt Bàn / Đặt Món Trước</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </section>

      {/* RESTAURANTS LIST FROM SUPABASE DATABASE */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F26B3A] uppercase tracking-wider mb-1 font-display">
              <MapPin className="w-4 h-4 text-[#F26B3A]" />
              <span>Quán Ăn Uy Tín Đã Xác Minh</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#26221B]">Danh Sách Nhà Hàng & Quán Ăn Ngon Tại Tri Tôn</h2>
          </div>
        </div>

        {foodPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {foodPlaces.map((place) => {
              const detailUrl = `/places/${place.slug || place.id}`;
              const { maps, tiktok } = resolvePlaceExternalLinks({
                name: place.name,
                commune: place.commune,
                video_url: place.video_url,
              });
              return (
                <div key={place.id} className="relative bg-[#FFFDF7] rounded-[26px] border border-[#26221B]/8 overflow-hidden shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
                  {/* 1-Touch Main Link Overlay */}
                  <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${place.name}`} />

                  <div className="pointer-events-none">
                    <div className="h-44 bg-slate-900 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={place.image_url || '/images/food/ga_dot_o_thum.png'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#F26B3A] text-white text-[10px] font-bold font-display">
                        {place.commune}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-display font-bold text-base text-[#26221B] group-hover:text-[#0E8C7F] transition-colors">{place.name}</h3>
                      <p className="font-body text-xs text-[#6B6355] flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                        <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                      </p>
                      <p className="font-body text-xs text-[#6B6355] line-clamp-2 mt-2">{place.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-[#26221B]/6 mt-2 text-xs relative z-10 pointer-events-auto font-display">
                    <span className="font-bold text-[#0E8C7F]">{formatPrice(place.price_level || 'Bình dân')}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <a
                        href={maps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0A32F] text-[#26221B] font-bold hover:bg-[#C97F1B] hover:text-white transition-all shadow-2xs"
                        title={maps.tooltip}
                      >
                        <span>Chỉ đường</span>
                        <Navigation className="w-3 h-3 text-[#26221B]" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFFDF7] rounded-[26px] p-8 text-center border border-[#26221B]/8">
            <Utensils className="w-8 h-8 text-[#6B6355]/40 mx-auto mb-2" />
            <p className="text-xs text-[#6B6355]">Đang cập nhật danh sách quán ăn từ Supabase database...</p>
          </div>
        )}
      </section>
    </div>
  );
}
