'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, Bus, Bike, Sun, CloudRain, PhoneCall, ShieldAlert, 
  MapPin, Clock, ArrowRight, Info, CheckCircle2, Sparkles, Navigation
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export default function GuideClientPage() {
  const routes = [
    {
      title: 'Từ TP. Hồ Chí Minh → Tri Tôn',
      distance: '240 km (~5 tiếng di chuyển)',
      transport: 'Xe khách giường nằm (Phương Trang, Hùng Cường, Huệ Nghĩa)',
      desc: 'Đón xe tại Bến xe Miền Tây, xe chạy thẳng tuyến cao tốc TP.HCM - Trung Lương - Mỹ Thuận về Bến xe Tri Tôn.',
      price: '170.000đ - 220.000đ / vé',
      badge: 'Tuyến Phổ Biến Nhất',
    },
    {
      title: 'Từ TP. Cần Thơ → Tri Tôn',
      distance: '110 km (~2.5 tiếng di chuyển)',
      transport: 'Xe máy hoặc Ô tô cá nhân / Xe buýt chất lượng cao',
      desc: 'Đi theo Quốc lộ 91 qua Lăng Xuyên hoặc tuyến N2 qua Lương An Trà về thẳng Thị trấn Tri Tôn.',
      price: 'Xăng xe ~70.000đ',
      badge: 'Cung Đường Phượt Đẹp',
    },
    {
      title: 'Từ TP. Long Xuyên → Tri Tôn',
      distance: '55 km (~1.2 tiếng di chuyển)',
      transport: 'Xe buýt tuyến Long Xuyên - Tri Tôn / Xe máy',
      desc: 'Tuyến đường ĐT941 mượt mà chạy dọc kênh Mặc Cần Dưng xuyên qua các cánh đồng lúa bạt ngàn.',
      price: 'Vé xe buýt 30.000đ',
      badge: 'Tuyệt Đẹp Mùa Lúa',
    },
    {
      title: 'Từ TP. Châu Đốc → Tri Tôn',
      distance: '42 km (~1 tiếng di chuyển)',
      transport: 'Xe máy / Thuê ô tô du lịch',
      desc: 'Tuyến đường ĐT948 chạy qua chân núi Cấm và vùng Bảy Núi. Ghé qua Chùa Hang trước khi về Tri Tôn.',
      price: 'Cung đường Thất Sơn',
      badge: 'Nối Liền Danh Thắng',
    },
  ];

  const seasons = [
    {
      season: 'Mùa Lúa Chín Tà Pạ',
      time: 'Tháng 11 - Tháng 12 hàng năm',
      desc: 'Cánh đồng lúa Tà Pạ khoác lên mình màu vàng óng ả rực rỡ nhất trong năm. Nhìn từ Chùa Tà Pạ xuống giống như một bức tranh thổ cẩm khổng lồ.',
      icon: Sun,
      color: 'bg-[#D99B26]/10 border-[#D99B26] text-[#D99B26]',
    },
    {
      season: 'Mùa Nước Nổi Bảy Núi',
      time: 'Tháng 9 - Tháng 10 hàng năm',
      desc: 'Nước sông Mê Kông đổ về tràn bờ đồng. Trải nghiệm chèo xuồng ba lá hái bông điên điển vàng tươi và thưởng thức lẩu cá linh bông điên điển.',
      icon: CloudRain,
      color: 'bg-emerald-50 border-emerald-200 text-[#1B4D3E]',
    },
    {
      season: 'Mùa Thốt Nốt & Nắng Đẹp',
      time: 'Tháng 1 - Tháng 6 hàng năm',
      desc: 'Thời tiết khô ráo, nắng vàng ấm áp thích hợp dã ngoại lòng hồ Ô Thum, uống nước thốt nốt tươi và xem chế biến đường thốt nốt thủ công.',
      icon: Sun,
      color: 'bg-[#D99B26]/10 border-[#D99B26] text-[#D99B26]',
    },
  ];

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Cẩm Nang Du Lịch & Di Chuyển Tri Tôn"
        badgeIcon={Compass}
        title="Thông Tin Di Chuyển & Cẩm Nang Bảy Núi"
        subtitle="Hướng dẫn chi tiết tuyến đường xe khách từ TP.HCM, kinh nghiệm phượt xe máy, thời điểm du lịch đẹp nhất trong năm và hotline cứu hộ các Xã/Thị trấn."
      />

      {/* TRANSPORTATION ROUTES */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Bus className="w-4 h-4 text-[#D99B26]" />
              <span>Hướng Dẫn Lộ Trình</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Các Tuyến Đường Di Chuyển Đến Tri Tôn</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routes.map((r, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-emerald-50 text-[#1B4D3E] text-xs font-bold border border-emerald-100">
                    {r.badge}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">{r.distance}</span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{r.title}</h3>

                <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#1B4D3E] shrink-0" />
                  <span>{r.transport}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Chi phí dự kiến:</span>
                <span className="font-bold text-emerald-800">{r.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SEASONS TO VISIT */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Sun className="w-4 h-4 text-[#D99B26]" />
              <span>Thời Tiết & Mùa Vụ</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Nên Đi Du Lịch Tri Tôn Vào Mùa Nào?</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seasons.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{s.season}</h3>

                  <div className="inline-block px-3 py-1 rounded-md bg-amber-50 text-[#D99B26] text-xs font-bold border border-amber-200">
                    {s.time}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>

                <Link
                  href="/itinerary"
                  className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold text-center block"
                >
                  Lập Tour Khám Phá Mùa Này
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* EMERGENCY CONTACTS DIRECTORY */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Danh Bạ Hotline Cứu Hộ Khẩn Cấp Các Xã / Thị Trấn</h3>
            <p className="text-xs text-slate-500 mt-0.5">Lưu lại điện thoại cơ quan chức năng hỗ trợ du khách 24/7</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMERGENCY_CONTACTS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wider block">{item.address}</span>
              <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
              <a
                href={`tel:${item.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D99B26] hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{item.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
