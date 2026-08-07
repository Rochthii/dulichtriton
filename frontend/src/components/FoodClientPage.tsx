'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Utensils, Phone, MapPin, Clock, Calendar, Users, 
  Sparkles, CheckCircle2, Navigation, Flame, Info, Heart
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface FoodClientPageProps {
  restaurants: Place[];
}

export default function FoodClientPage({ restaurants }: FoodClientPageProps) {
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

  const specialties = [
    {
      id: 'ga-dot-o-thum',
      name: 'Gà Đốt Lá Chúc Hồ Ô Thum',
      desc: 'Món ăn biểu tượng trứ danh vùng Tri Tôn. Gà thả đồi thịt săn chắc, tẩm ướp lá chúc rừng (chanh rừng Tri Tôn), sả ớt & mật thốt nốt. Đốt than hồng trong niêu đất 45 phút, ăn kèm muối ớt chanh chúc.',
      price: '280.000đ - 350.000đ / con',
      prepTime: 'Chế biến 45 phút (Nên đặt trước)',
      location: 'Khu vực Hồ Ô Thum, Xã Ô Lâm & Xã Chau Lăng',
      image: '/images/food/ga_dot_o_thum.png',
      badge: 'Đặc Sản Số 1 Tri Tôn',
    },
    {
      id: 'bun-ca-tri-ton',
      name: 'Bún Cá Tri Tôn (Bún Cá An Giang)',
      desc: 'Nước dùng ninh từ xương cá lóc đồng ngọt thanh, thơm màu nghệ tươi vàng rực. Ăn kèm thịt cá lóc gỡ xương xào nghệ, heo quay da giòn, bông điên điển tươi & rau muống bào.',
      price: '35.000đ - 50.000đ / tô',
      prepTime: 'Phục vụ ngay (Sáng & Chiều)',
      location: 'Thị trấn Tri Tôn & Xã Chau Lăng',
      image: '/images/food/bun_nuoc_leo.png',
      badge: 'Đặc Sản Nổi Tiếng',
    },
    {
      id: 'du-du-dam-khmer',
      name: 'Đu Đủ Đâm Khmer (Bok Lahong)',
      desc: 'Món ăn vặt đường phố trứ danh tại Tri Tôn. Đu đủ xanh bào sợi đâm trong cối gỗ cùng ớt chim, ba khía ngâm, đậu phộng, tôm khô, lá chúc & đường thốt nốt chua ngọt cay nồng cực dính.',
      price: '25.000đ - 40.000đ / dĩa',
      prepTime: 'Phục vụ ngay tại chỗ',
      location: 'Xã Chau Lăng & Xã Ô Lâm',
      image: '/images/tiktok/du_du_dam.jpg',
      badge: 'Ăn Vặt Chua Cay Trứ Danh',
    },
    {
      id: 'banh-bo-thot-not',
      name: 'Bánh Bò Mật Thốt Nốt Nướng/Hấp',
      desc: 'Bánh bò làm từ bột gạo xay cối đá ngâm ủ tự nhiên, đường thốt nốt mật ngào màu vàng ổ ong & nước cốt dừa béo bùi. Mặt bánh rễ tre xốp dẻo, rắc dừa nạo sợi thơm ngạt ngào.',
      price: '10.000đ - 25.000đ / phần',
      prepTime: 'Bánh tươi làm trong ngày',
      location: 'Xã Chau Lăng & Chợ Tri Tôn',
      image: '/images/food/banh_bo_thot_not.png',
      badge: 'Quà Tặng Thốt Nốt',
    },
    {
      id: 'bo-nuong-mam-bo-hoc',
      name: 'Thịt Bò Nướng Bảy Núi Cuốn Bánh Tráng',
      desc: 'Thịt bò tươi Bảy Núi xắt mỏng tẩm ướp sả ớt nướng vỉ than hồng thơm phức. Cuốn bánh tráng phơi sương với các loại rau rừng Bảy Núi chấm mắm bò hóc Prahok hoặc mắm ruốc chao.',
      price: '120.000đ - 180.000đ / phần',
      prepTime: 'Chế biến 15 phút',
      location: 'Thị trấn Tri Tôn & Xã Núi Tô',
      image: '/images/food/ga_dot_o_thum.png',
      badge: 'Đặc Sản Thịt Bò Mềm',
    },
    {
      id: 'nuoc-thot-not-tuoi',
      name: 'Nước Thốt Nốt Tươi & Chè Thốt Nốt Dừa',
      desc: 'Nước thốt nốt lấy trực tiếp từ vòi hoa cây thốt nốt lúc sáng sớm, vị ngọt thanh tự nhiên ướp đá lạnh mát rượi. Cơm thốt nốt dẻo quánh ăn cùng nước cốt dừa béo bùi.',
      price: '15.000đ - 30.000đ / ly',
      prepTime: 'Phục vụ giải khát mát lạnh',
      location: 'Xã Chau Lăng & Xã An Tức',
      image: '/images/food/banh_bo_thot_not.png',
      badge: 'Giải Khát Bản Địa',
    },
  ];

  const handleDishToggle = (dishName: string) => {
    setFormData(prev => {
      const exists = prev.dishes.includes(dishName);
      return {
        ...prev,
        dishes: exists ? prev.dishes.filter(d => d !== dishName) : [...prev.dishes, dishName]
      };
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Vui lòng nhập Họ tên và Số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingCode = 'TTFOOD-' + Math.floor(100000 + Math.random() * 900000);
      
      // Save real audit log/booking entry into Supabase audit_logs
      await supabase.from('audit_logs').insert([
        {
          action: 'GASTRONOMY_BOOKING_CREATED',
          entity: 'food_booking',
          details: {
            bookingCode,
            fullName: formData.fullName,
            phone: formData.phone,
            date: formData.date,
            time: formData.time,
            guests: formData.guests,
            dishes: formData.dishes,
            notes: formData.notes,
            created_at: new Date().toISOString(),
          }
        }
      ]);

      setBookingSuccess(bookingCode);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Không thể gửi yêu cầu. Vui lòng gọi trực tiếp hotline!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* HERO BANNER SECTION */}
      <div className="bg-[#1B4D3E] text-white p-8 sm:p-12 rounded-3xl mb-12 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D99B26_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#D99B26] backdrop-blur-md mb-4">
            <Flame className="w-4 h-4 text-[#D99B26]" />
            <span>Ẩm Thực Bản Địa Bảy Núi — Gà Đốt Ô Thum & Bún Mắm Khmer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Thưởng Thức Hương Vị <br />
            <span className="text-[#D99B26]">Đặc Sản Ẩm Thực Tri Tôn</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 mt-4 leading-relaxed">
            Khám phá tinh hoa ẩm thực Khmer - Việt với lá chúc rừng Bảy Núi, mật thốt nốt ngọt thanh và mắm bồ hóc trứ danh. Đặt bàn trước để không phải chờ chế biến!
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href="#booking-form"
              className="px-6 py-3 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Utensils className="w-4 h-4" />
              <span>Đặt Bàn / Đặt Món Trước</span>
            </a>

            <a
              href="#specialties"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all"
            >
              <Info className="w-4 h-4 text-[#D99B26]" />
              <span>Xem Menu Đặc Sản</span>
            </a>
          </div>
        </div>
      </div>

      {/* SPECIALTY FOODS SHOWCASE (100% REAL PHOTOGRAPHY) */}
      <section id="specialties" className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-[#D99B26]" />
              <span>Tinh Hoa Ẩm Thực Bảy Núi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Đặc Sản Phải Thử Tại Tri Tôn</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialties.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col sm:flex-row">
              <div className="sm:w-2/5 relative h-52 sm:h-auto bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold shadow-xs">
                  {item.badge}
                </span>
              </div>

              <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Khoảng giá:</span>
                    <span className="font-bold text-emerald-800">{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vị trí:</span>
                    <span className="font-semibold text-slate-700">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.prepTime}</span>
                  </div>
                </div>

                <a
                  href="#booking-form"
                  onClick={() => {
                    if (!formData.dishes.includes(item.name)) {
                      setFormData(prev => ({ ...prev, dishes: [...prev.dishes, item.name] }));
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-[#1B4D3E] text-[#1B4D3E] hover:text-white text-xs font-bold transition-all text-center border border-emerald-100"
                >
                  Chọn Món Này & Đặt Bàn
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GASTRONOMY BOOKING FORM SECTION */}
      <section id="booking-form" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-6 h-6 text-[#D99B26]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Đặt Trước Nhà Hàng & Món Ăn Bản Địa</h2>
            <p className="text-xs text-slate-500 mt-1">
              Gà Đốt Ô Thum tốn 45 phút nướng trên than hồng. Đặt trước ngay để nhà hàng chuẩn bị sẵn sàng khi bạn tới nơi!
            </p>
          </div>

          {bookingSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#1B4D3E] mx-auto" />
              <h3 className="text-xl font-bold text-[#1B4D3E]">Gửi Yêu Cầu Đặt Bàn Thành Công!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Mã đặt bàn của bạn là: <strong className="text-slate-900 font-mono text-sm">{bookingSuccess}</strong>. Nhà hàng sẽ liên hệ xác nhận qua điện thoại trong vòng 10 phút.
              </p>
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-semibold"
              >
                Đặt Thêm Yêu Cầu Khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên Du Khách *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Ánh"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại Liên Hệ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Đến Ăn</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ Dự Kiến Đến</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Lượng Khách</label>
                  <select
                    value={formData.guests}
                    onChange={e => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
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
                <label className="block text-xs font-bold text-slate-700 mb-2">Chọn Món Ăn Yêu Cầu Chuẩn Bị Trước:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {specialties.map(s => {
                    const isChecked = formData.dishes.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleDishToggle(s.name)}
                        className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-[#1B4D3E] text-[#1B4D3E]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{s.name}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-[#1B4D3E]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú Đặc Biệt</label>
                <textarea
                  rows={2}
                  placeholder="VD: Không ăn cay, lấy thêm lá chúc, muốn ngồi chỗ view hồ Ô Thum..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang gửi yêu cầu...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D99B26]" />
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-[#D99B26]" />
              <span>Quán Ăn Uy Tín Đã Xác Minh</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Danh Sách Nhà Hàng & Quán Ăn Ngon Tại Tri Tôn</h2>
          </div>
        </div>

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurants.map((place) => (
              <div key={place.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="h-44 bg-slate-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.photos?.[0]?.url || '/images/food/ga_dot_o_thum.png'}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold">
                      {place.commune}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-slate-900">{place.name}</h3>
                    <p className="text-xs text-slate-500 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
                      <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">{place.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4 text-xs">
                  <span className="font-semibold text-emerald-800">{formatPrice(place.price_level || 'Bình dân')}</span>
                  
                  <a
                    href={getGoogleMapsUrl(place.name, place.commune)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4D3E] hover:underline"
                  >
                    <span>Chỉ đường</span>
                    <Navigation className="w-3.5 h-3.5 text-[#D99B26]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Đang cập nhật danh sách quán ăn từ Supabase database...</p>
          </div>
        )}
      </section>
    </>
  );
}
