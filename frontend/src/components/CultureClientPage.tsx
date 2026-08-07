'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Landmark, Calendar, MapPin, Navigation, Star, 
  Sparkles, CheckCircle2, ShieldCheck, Heart, Info, Clock, Compass, BookOpen
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import PageHeaderBanner from './PageHeaderBanner';

interface CultureClientPageProps {
  pagodas: Place[];
}

export default function CultureClientPage({ pagodas }: CultureClientPageProps) {
  const festivals = [
    {
      id: 'dua-bo-bay-nui',
      title: 'Lễ Hội Đua Bò Bảy Núi Truyền Thống',
      date: 'Cuối tháng 8 - Đầu tháng 9 Âm lịch hàng năm (Dịp Sene Dolta)',
      location: 'Sân đua bò Tri Tôn, Khóm 3, Thị trấn Tri Tôn, An Giang',
      description: 'Di sản văn hóa phi vật thể quốc gia mang đậm nét tinh thần thượng võ của đồng bào Khmer Bảy Núi. Hàng chục đôi bò chiến tranh tài trên bãi bùn lầy rực lửa.',
      image: '/images/tiktok/dua_bo_bay_nui.jpg',
      badge: 'Di Sản Quốc Gia',
    },
    {
      id: 'sene-dolta',
      title: 'Lễ Sene Dolta (Cúng Ông Bà Tổ Tiên)',
      date: 'Từ 29/8 đến 01/9 Âm lịch hàng năm',
      location: 'Toàn bộ 11 Xã/Thị trấn Tri Tôn',
      description: 'Dịp lễ báo hiếu tổ tiên lớn nhất trong năm của đồng bào Khmer. Gia đình sum họp, chuẩn bị mâm cỗ cúng truyền thống và dâng cơm lên các chư Tăng tại Chùa.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      badge: 'Lễ Hội Báo Hiếu',
    },
    {
      id: 'chol-chnam-thmay',
      title: 'Lễ Chôl Chnăm Thmây (Mừng Năm Mới Khmer)',
      date: 'Giữa tháng 4 Dương lịch (14 - 16/04)',
      location: 'Các Chùa Nam Tông Khmer Tri Tôn',
      description: 'Tết cổ truyền mừng năm mới của người Khmer. Diễn ra các nghi thức tắm Phật, đắp núi cát cầu may mắn và biểu diễn múa Chăm-riêng độc đáo.',
      image: 'https://images.unsplash.com/photo-1509024644553-a78625332450?q=80&w=800&auto=format&fit=crop',
      badge: 'Tết Cổ Truyền',
    },
    {
      id: 'ok-om-bok',
      title: 'Lễ Ok Om Bok (Cúng Trăng & Thả Đèn Gió)',
      date: 'Rằm tháng 10 Âm lịch (15/10 Âm lịch)',
      location: 'Khu vực Hồ Tà Pạ & Chùa Svay Ton',
      description: 'Lễ tạ ơn Thần Mặt Trăng đã ban cho mưa thuận gió hòa, mùa màng bội thu. Đêm hội lung linh với tục đút cốm dẹp và thả đèn gió lên bầu trời đêm Bảy Núi.',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop',
      badge: 'Đêm Hội Thả Đèn',
    },
  ];

  const rules = [
    { title: 'Trang phục trang nhã', desc: 'Mặc áo có tay, quần hoặc váy dài qua gối khi vào chánh điện Chùa.' },
    { title: 'Cởi giày dép', desc: 'Tháo nón bảo hiểm, cởi giày dép và để gọn gàng bên ngoài chánh điện.' },
    { title: 'Tôn kính chư Tăng', desc: 'Chào hỏi bằng cách chắp hai tay trước ngực (Sampeah) kính cẩn.' },
    { title: 'Giữ gìn không gian nghiêm trang', desc: 'Tránh nói to, không chạm vào tượng Phật và không xả rác.' },
  ];

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Di Sản Văn Hóa Khmer & Lễ Hội Bảy Núi"
        badgeIcon={Landmark}
        title="Văn Hóa & Chùa Nam Tông Khmer Tri Tôn"
        subtitle="Khám phá 10 ngôi chùa cổ kính rát vàng nguy nga, tìm hiểu di sản kinh lá buông 300 năm và hào hùng với không khí Lễ hội Đua bò Bảy Núi trứ danh."
        countLabel="Chùa cổ & Di tích đã xác minh"
        countValue={`${pagodas.length} di sản`}
      />

      {/* SEVEN MOUNTAINS FESTIVAL CALENDAR */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-[#D99B26]" />
              <span>Sự Kiện & Lễ Hội Bản Địa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">4 Lễ Hội Lớn Nhất Vùng Bảy Núi</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {festivals.map(fest => (
            <div key={fest.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="h-56 bg-slate-900 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fest.image} alt={fest.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#1B4D3E] text-white text-xs font-bold shadow-md">
                    {fest.badge}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-extrabold text-slate-900">{fest.title}</h3>
                  
                  <div className="flex flex-col gap-1.5 text-xs text-[#1B4D3E] font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#D99B26]" />
                      <span>Thời gian: <strong>{fest.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#1B4D3E]" />
                      <span>Địa điểm: <strong>{fest.location}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{fest.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/places?commune=T%E1%BA%A5t+c%E1%BA%A3`}
                  className="w-full py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#1B4D3E] text-slate-800 hover:text-white text-xs font-bold transition-all text-center block border border-slate-200"
                >
                  Khám Phá Địa Điểm Diễn Ra Lễ Hội
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KHMER PAGODAS & HERITAGE GRID FROM SUPABASE DATABASE */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-[#D99B26]" />
              <span>Chùa Cổ & Kiến Trúc Nghệ Thuật</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Danh Sách Chùa Nam Tông Khmer Tri Tôn</h2>
          </div>
        </div>

        {pagodas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pagodas.map(place => {
              const mapsUrl = getGoogleMapsUrl(place.name, place.commune);
              const mainPhoto = place.photos?.[0]?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

              return (
                <div key={place.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                  <div>
                    <div className="h-48 bg-slate-900 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mainPhoto} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold">
                        {place.commune}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1B4D3E] transition-colors">{place.name}</h3>
                      <p className="text-xs text-slate-500 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
                        <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                        {place.description || `Ngôi chùa Phật giáo Nam tông Khmer tôn nghiêm tại ${place.commune}, lưu giữ nghệ thuật điêu khắc truyền thống.`}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4 text-xs">
                    <Link
                      href={`/places/${place.id}`}
                      className="font-bold text-[#1B4D3E] hover:underline"
                    >
                      Xem chi tiết chùa
                    </Link>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#D99B26] hover:underline"
                    >
                      <span>Mở Google Maps</span>
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Đang nạp danh sách chùa Khmer...</p>
          </div>
        )}
      </section>

      {/* CULTURAL ETIQUETTE GUIDE */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#D99B26]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Quy Tắc Ứng Xử Văn Hóa Khi Tham Quan Chùa Khmer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Văn hóa ứng xử văn minh và tôn trọng tín ngưỡng bản địa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
                <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
                <span>{rule.title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
