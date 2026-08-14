'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, MapPin, Landmark, Sun, CloudRain, Utensils, Mountain, 
  ShieldCheck, PhoneCall, Bus, Bike, Clock, ChevronRight, Sparkles, 
  CheckCircle2, Info, BookOpen, AlertTriangle, ArrowRight, Heart, Star, Navigation, Play
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';

type TabKey = 'overview' | 'geography' | 'culture' | 'food' | 'seasons' | 'transport' | 'etiquette';

export default function GuideClientPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'overview',   label: 'Tổng Quan Tri Tôn', icon: Compass },
    { key: 'geography',  label: 'Địa Lý & 15 Xã',    icon: Mountain },
    { key: 'culture',    label: 'Văn Hóa & Lễ Hội',  icon: Landmark },
    { key: 'food',       label: 'Bản Đồ Ẩm Thực',   icon: Utensils },
    { key: 'seasons',    label: 'Khí Hậu & 2 Mùa',   icon: Sun },
    { key: 'transport',  label: 'Đường Đi & Xe Cộ',  icon: Bus },
    { key: 'etiquette',  label: 'Lưu Ý & Cứu Hộ',    icon: ShieldCheck },
  ];

  return (
    <>
      {/* Header Banner */}
      <PageHeaderBanner
        badgeText="Bách Khoa Toàn Thư Du Lịch Tri Tôn 2026"
        badgeIcon={BookOpen}
        title="GIỚI THIỆU TỔNG QUAN VÙNG ĐẤT BẢY NÚI TRI TÔN"
        subtitle="Cẩm nang toàn tập: Địa lý tự nhiên, 15 Xã & Thị trấn, lịch sử di sản Khmer cổ kính, bản đồ ẩm thực lá chúc trứ danh và kinh nghiệm thực địa chi tiết."
        countLabel="Chuyên mục đang xem"
        countValue={tabs.find(t => t.key === activeTab)?.label || 'Tổng Quan'}
      />

      {/* ── INTERACTIVE TAB NAVIGATION BAR ──────────────────────────────── */}
      <section className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── TAB 1: TỔNG QUAN TRI TÔN ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Hero Highlight Card */}
          <div className="bg-[#1B4D3E] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                ✨ Trái Tim Của Miền Thất Sơn Huyền Bí
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                Tri Tôn — Vùng Đất Giao Thoa Kỳ Vĩ Giữa Núi Rừng, Đồng Bằng & Văn Hóa Khmer
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Nằm ở phía Tây Nam tỉnh An Giang, giáp vương quốc Campuchia, Tri Tôn là vùng đất bán sơn địa hiếm có của Đồng bằng Sông Cửu Long. Nơi đây sở hữu cảnh sắc ngoạn mục với những hồ nước trên đỉnh đồi đá, các dãy núi granit sừng sững, cánh đồng thốt nốt bạt ngàn và nền văn hóa Phật giáo Nam tông Khmer hơn 500 năm lịch sử.
              </p>
            </div>
            <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-white pointer-events-none">
              <Mountain className="w-96 h-96" />
            </div>
          </div>

          {/* 4 Key Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400">Diện Tích Tự Nhiên</p>
              <p className="text-2xl font-black text-[#1B4D3E]">~600 km²</p>
              <p className="text-[11px] text-slate-500">Lớn nhất tỉnh An Giang</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400">Đơn Vị Hành Chính</p>
              <p className="text-2xl font-black text-[#1B4D3E]">15 Đơn Vị</p>
              <p className="text-[11px] text-slate-500">2 Thị Trấn & 13 Xã</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400">Dân Cư & Dân Tộc</p>
              <p className="text-2xl font-black text-amber-600">&gt;34% Khmer</p>
              <p className="text-[11px] text-slate-500">Cộng đồng Kinh - Khmer - Hoa</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400">Di Sản & Điểm Đến</p>
              <p className="text-2xl font-black text-[#1B4D3E]">82 Địa Điểm</p>
              <p className="text-[11px] text-slate-500">37 Chùa Khmer cổ kính</p>
            </div>
          </div>

          {/* 3 Pillars of Tri Ton Tourism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B4D3E] flex items-center justify-center font-black">
                <Mountain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">1. Thắng Cảnh Sơn Thủy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hồ Tà Pạ (Tuyệt Tình Cốc), Đỉnh Núi Cô Tô 614m, Vồ Hội, Suối Bạc Soài So, Hồ Ô Thum thơ mộng, Hàng cây thốt nốt trái tim huyền thoại.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">2. Di Sản & Lễ Hội Khmer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lễ hội Đua Bò Bảy Núi rực lửa (Sene Dolta), Chùa Xvayton hơn 500 năm tuổi lưu giữ Kinh lá buông, Cổng trời Chùa Koh Kas nguy nga.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">3. Ẩm Thực Bản Địa Độc Bản</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gà Đốt Ô Thum ướp lá chúc, Cháo Bò trái chúc thơm ngậy, Đu Đủ Đâm giòn cay, Bò nướng xiên, Bánh bò thốt nốt và nước thốt nốt ngọt lịm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ĐỊA LÝ & 15 XÃ THỊ TRẤN ───────────────────────────────── */}
      {activeTab === 'geography' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Mountain className="w-5 h-5 text-[#1B4D3E]" />
              <span>Bản Đồ Địa Lý & 15 Đơn Vị Hành Chính</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tri Tôn nằm ở tọa độ 10.25°–10.55°B và 104.85°–105.15°Đ. Phía Bắc giáp TX. Tịnh Biên, phía Đông giáp huyện Châu Thành và Thoại Sơn, phía Nam giáp tỉnh Kiên Giang (huyện Hòn Đất và Giang Thành), phía Tây Bắc giáp vương quốc Campuchia với đường biên giới dài hơn 15 km.
            </p>

            {/* 15 Communes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
              {[
                { name: 'Thị trấn Tri Tôn', role: 'Trung tâm hành chính, thương mại, ẩm thực đêm', icon: '🏛️' },
                { name: 'Thị trấn Ba Chúc', role: 'Vùng di tích lịch sử Nhà Mồ Ba Chúc & Chùa Phi Lai', icon: '📜' },
                { name: 'Xã Núi Tô',        role: 'Địa danh Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng Tà Pạ', icon: '🌾' },
                { name: 'Xã Ô Lâm',         role: 'Thủ phủ Gà Đốt Ô Thum, Chùa Ô Lâm, Làng nghề đan đát', icon: '🍗' },
                { name: 'Xã Châu Lăng',     role: 'Cổng Trời Koh Kas, Đu Đủ Đâm Rina, Làng bò nướng', icon: '⛩️' },
                { name: 'Xã Cô Tô',         role: 'Khu du lịch Suối Bạc Soài So, Đỉnh núi Cô Tô 614m', icon: '⛰️' },
                { name: 'Xã An Tức',        role: 'Khu di tích lịch sử Đồi Tức Dụp 2 Triệu Đô', icon: '🎖️' },
                { name: 'Xã Lương Phi',     role: 'Vườn cây ăn trái, Chùa Lương Phi, đồi dốc thanh bình', icon: '🌳' },
                { name: 'Xã Lạc Quới',      role: 'Vùng đệm biên giới, lúa trù phú kênh Vĩnh Tế', icon: '🌾' },
                { name: 'Xã Vĩnh Gia',      role: 'Cửa ngõ biên giới Tây Nam, kênh Vĩnh Tế lịch sử', icon: '🚤' },
                { name: 'Xã Vĩnh Phước',    role: 'Vùng nông nghiệp công nghệ cao, cánh đồng sen', icon: '🪷' },
                { name: 'Xã Lương An Trà',  role: 'Vùng đất khai hoang kiên cường Tứ Giác Long Xuyên', icon: '🚜' },
                { name: 'Xã Tà Đảnh',       role: 'Cửa ngõ kết nối TP. Long Xuyên vào Tri Tôn qua ĐT941', icon: '🛣️' },
                { name: 'Xã Tân Tuyến',     role: 'Vùng nông nghiệp sinh thái ngập nước', icon: '🌿' },
                { name: 'Xã Lê Trì',        role: 'Chân núi Dài Năm Giếng, vườn mãng cầu, sầu riêng núi', icon: '🍈' },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-emerald-400 transition-colors space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.icon}</span>
                    <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{c.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: VĂN HÓA & LỄ HỘI KHMER ─────────────────────────────────── */}
      {activeTab === 'culture' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Festival 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                🐃 Di Sản Văn Hóa Quốc Gia
              </span>
              <h3 className="text-xl font-black text-slate-900">Lễ Hội Đua Bò Bảy Núi (Sene Dolta)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diễn ra vào dịp lễ Sene Dolta (tháng 8–9 Âm lịch hàng năm). Đây là môn thể thao dân gian độc nhất vô nhị: các đôi bò khỏe nhất vùng Bảy Núi tranh tài trên ruộng bùn nước lấp xấp dưới sự điều khiển tài tình của các tài xế (người cầm roi).
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold">
                📍 Địa điểm: Sân chùa Tà Pạ (Núi Tô) hoặc Chùa Thơ Mít (Vĩnh Trung).
              </div>
            </div>

            {/* Festival 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                🎉 Tết Cổ Truyền
              </span>
              <h3 className="text-xl font-black text-slate-900">Tết Chol Chnam Thmay</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tết mừng năm mới của đồng bào Khmer (giữa tháng 4 Dương lịch hàng năm). Mọi người diện trang phục truyền thống rực rỡ, mang lễ vật đến chùa làm lễ đắp núi cát, tắm Phật cầu an và cùng hòa mình vào điệu múa Romvong, Saravan rộn ràng.
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold">
                📍 Địa điểm: Rộn ràng tại tất cả 37 ngôi Chùa Khmer trên địa bàn.
              </div>
            </div>

            {/* Heritage 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
                📜 Di Sản Tư Liệu Độc Bản
              </span>
              <h3 className="text-xl font-black text-slate-900">Kinh Lá Buông (Satra Sla-rit)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nghệ thuật khắc chữ thiêng trên lá cây buông sấy khô bằng bút sắt kim loại, sau đó quét mực tro muội đèn. Chùa Xvayton (Xà Tón) tại Thị trấn Tri Tôn hiện là nơi lưu giữ số lượng bộ Kinh lá buông cổ nhiều nhất và lâu đời nhất Việt Nam.
              </p>
            </div>

            {/* Heritage 4 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black">
                🪷 Lễ Cúng Trăng
              </span>
              <h3 className="text-xl font-black text-slate-900">Lễ Hội Ok Om Bok & Thả Đèn Gió</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diễn ra vào rằm tháng 10 Âm lịch. Người dân tạ ơn Thần Mặt Trăng đã ban cho mưa thuận gió hòa, mùa màng bội thu, cùng nghi thức đút cốm dẹp cho trẻ nhỏ và thả đèn hoa đăng, đèn gió lung linh rực sáng bầu trời đêm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BẢN ĐỒ ẨM THỰC ─────────────────────────────────────────── */}
      {activeTab === 'food' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              <span>Hương Vị Bản Địa Không Thể Nhầm Lẫn</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h3 className="font-extrabold text-sm text-amber-900">🍗 Gà Đốt Ô Thum (Xã Ô Lâm)</h3>
                <p className="text-slate-700 leading-relaxed">
                  Gà thả đồi thịt săn chắc, ướp sả, ớt, mật ong và đặc biệt là <strong>lá chúc</strong> tươi thái chỉ. Nướng than đượm trong nồi gang cho da vàng giòn ruộm, chấm muối ớt chanh trái chúc ăn kèm dưa leo và xôi chiên phồng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h3 className="font-extrabold text-sm text-amber-900">🍲 Cháo Bò Trái Trúc (Thị trấn Tri Tôn)</h3>
                <p className="text-slate-700 leading-relaxed">
                  Cháo ninh mềm nhuyễn từ gạo thơm và đậu xanh, ăn cùng lòng bò tươi luộc giòn, thịt bò bắp mềm ngọt, giá đỗ, gừng tươi và nước vắt từ <strong>trái chúc</strong> thơm thanh nồng nàn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h3 className="font-extrabold text-sm text-amber-900">🥗 Đu Đủ Đâm & Bò Lụi Khmer (Xã Châu Lăng)</h3>
                <p className="text-slate-700 leading-relaxed">
                  Đu đủ xanh giòn đâm trong cối gỗ cùng mắm ba khía, ruốc, đậu phộng, chanh ớt chua cay bùng nổ, ăn kèm các xiên thịt bò tơ nướng thơm phức bên bếp than đỏ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h3 className="font-extrabold text-sm text-amber-900">🥞 Bánh Bò Thốt Nốt & Nước Thốt Nốt</h3>
                <p className="text-slate-700 leading-relaxed">
                  Bánh bò làm từ bột gạo ủ men tự nhiên và đường thốt nốt nguyên chất, gói lá chuối hoặc lá thốt nốt hấp nóng xốp dẻo, rắc thêm dừa nạo béo ngậy.
                </p>
              </div>
            </div>

            <div className="pt-3 text-center">
              <Link
                href="/food"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                <span>Xem Bản Đồ Toàn Bộ Quán Ăn Ngon Tri Tôn</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: KHÍ HẬU & 2 MÙA ─────────────────────────────────────────── */}
      {activeTab === 'seasons' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Mùa Khô (Tháng 12 – Tháng 4)</h3>
                  <p className="text-xs text-amber-700 font-bold">Nắng vàng, trời trong, khô ráo</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thời tiết lý tưởng nhất cho các hoạt động dã ngoại ngoài trời: cắm trại ven hồ Ô Thum, trekking chinh phục đỉnh núi Cô Tô, ngắm bình minh trên đồi Tà Pạ và chiêm bái các ngôi chùa cổ.
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li>Uống nước thốt nốt tươi ngọt mát nhất vào mùa này.</li>
                <li>Hồ Tà Pạ trong xanh màu ngọc bích phẳng lặng.</li>
                <li>Nên mang theo kem chống nắng, kính râm và mũ rộng vành.</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Mùa Mưa & Nước Nổi (Tháng 5 – Tháng 11)</h3>
                  <p className="text-xs text-emerald-700 font-bold">Cánh đồng vàng rực, lễ hội đua bò rộn rã</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mùa đẹp nhất cho những tay săn ảnh: Cánh đồng lúa Tà Pạ chín vàng óng ả (Tháng 9–11), không khí lễ hội đua bò Sene Dolta náo nhiệt và đặc sản cá linh non, bông điên điển mùa nước nổi.
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li>Săn ảnh lúa chín vàng Tà Pạ từ 06:00 đến 07:30 sáng.</li>
                <li>Hòa mình vào Lễ hội Đua Bò Bảy Núi.</li>
                <li>Chuẩn bị áo mưa mỏng và giày có độ bám tốt khi leo núi.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: ĐƯỜNG ĐI & XE CỘ ────────────────────────────────────────── */}
      {activeTab === 'transport' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1B4D3E] text-xs font-bold border border-emerald-200">
                Tuyến TP. Hồ Chí Minh → Tri Tôn (~240km)
              </span>
              <h3 className="text-base font-black text-slate-900">Xe Khách Giường Nằm Chất Lượng Cao</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đón xe tại Bến xe Miền Tây (các hãng xe uy tín: Phương Trang, Huệ Nghĩa, Hùng Cường). Xe chạy cao tốc TP.HCM – Mỹ Thuận – Cần Thơ về thẳng Bến xe Thị trấn Tri Tôn.
              </p>
              <p className="text-xs font-bold text-emerald-800">⏱ Thời gian: ~5 – 6 tiếng • 💰 Giá vé: 180.000đ – 220.000đ</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                Tuyến TP. Cần Thơ → Tri Tôn (~110km)
              </span>
              <h3 className="text-base font-black text-slate-900">Xe Máy Hoặc Ô Tô Tự Lái</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chạy theo QL91 về Long Xuyên, rẽ vào ĐT941 chạy dọc kênh Mặc Cần Dưng tuyệt đẹp xuyên qua cánh đồng lúa bạt ngàn về trung tâm Thị trấn Tri Tôn.
              </p>
              <p className="text-xs font-bold text-amber-800">⏱ Thời gian: ~2.5 tiếng • 💰 Cung đường phượt mượt mà</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                Tuyến TP. Châu Đốc → Tri Tôn (~42km)
              </span>
              <h3 className="text-base font-black text-slate-900">Cung Đường Vòng Núi Thất Sơn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đi theo tuyến ĐT948 chạy men theo chân núi Cấm và rừng tràm Trà Sư về Tri Tôn. Cung đường ngắm trọn vẹn cảnh sắc hùng vĩ của dãy Thất Sơn.
              </p>
              <p className="text-xs font-bold text-blue-800">⏱ Thời gian: ~1 tiếng • 💰 Tuyến kết hợp Châu Đốc - Tri Tôn</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200">
                Phương Tiện Di Chuyển Tại Tri Tôn
              </span>
              <h3 className="text-base font-black text-slate-900">Thuê Xe Máy Là Lựa Chọn Tốt Nhất</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Các điểm tham quan ở Tri Tôn phân bố theo cụm xã cách nhau 3–8km. Đi xe máy giúp bạn tự do dừng chụp ảnh cánh đồng thốt nốt, len lỏi vào các hồ đá và leo dốc núi dễ dàng.
              </p>
              <p className="text-xs font-bold text-purple-800">💰 Thuê xe máy: 120.000đ – 150.000đ / ngày tại các khách sạn/homestay</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: LƯU Ý VĂN HÓA & CỨU HỘ SOS ─────────────────────────────── */}
      {activeTab === 'etiquette' && (
        <div className="space-y-8 animate-fade-in">
          {/* Emergency Box */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-700" />
              <h2 className="text-lg sm:text-xl font-black text-rose-900">
                Tổng Đài SOS Cứu Hộ Khẩn Cấp 24/7 (Tri Tôn, An Giang)
              </h2>
            </div>
            <p className="text-xs text-rose-800">
              Lưu ngay 3 số điện thoại khẩn cấp trực ban để liên hệ khi xảy ra sự cố trên đường:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <a
                href="tel:02963874113"
                className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs hover:shadow-md transition-all flex items-center gap-3 text-rose-950"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                  🚔
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">Công An Tri Tôn</p>
                  <p className="text-base font-black text-rose-700">0296 3874 113</p>
                </div>
              </a>

              <a
                href="tel:02963874115"
                className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs hover:shadow-md transition-all flex items-center gap-3 text-rose-950"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  🚑
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">Y Tế Tri Tôn (Cấp cứu)</p>
                  <p className="text-base font-black text-emerald-700">0296 3874 115</p>
                </div>
              </a>

              <a
                href="tel:02963771999"
                className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs hover:shadow-md transition-all flex items-center gap-3 text-rose-950"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                  🏛️
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">Hỗ Trợ Du Lịch</p>
                  <p className="text-base font-black text-amber-700">0296 3771 999</p>
                </div>
              </a>
            </div>
          </div>

          {/* Cultural Etiquette Rules */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900">Những Lưu Ý Quan Trọng Khi Đến Tri Tôn</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-[#1B4D3E] block">1. Khi Vào Viếng Chùa Khmer:</span>
                <p className="text-slate-700 leading-relaxed">
                  Mặc trang phục kín đáo (quần/váy dài quá đầu gối, áo có tay che vai). Bỏ giày dép bên ngoài trước khi bước vào chánh điện. Không chạm vào người hoặc đưa đồ trực tiếp cho các nhà sư nếu là nữ giới.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-[#1B4D3E] block">2. Đặt Món Gà Đốt Ô Thum:</span>
                <p className="text-slate-700 leading-relaxed">
                  Nên gọi điện cho quán trước 45–60 phút để quán bắt đầu ướp và đốt than. Tránh đến nơi mới gọi món vào giờ trưa sẽ phải chờ khá lâu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-[#1B4D3E] block">3. Trekking & Leo Núi Cô Tô / Vồ Hội:</span>
                <p className="text-slate-700 leading-relaxed">
                  Đi giày thể thao có độ bám tốt, mang theo đèn pin và nước uống. Không xả rác và không đốt lửa bừa bãi trong rừng núi mùa khô.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-[#1B4D3E] block">4. Tiền Mặt & Sóng Điện Thoại:</span>
                <p className="text-slate-700 leading-relaxed">
                  Các quán nước thốt nốt và sạp trái cây ven đường thường chỉ dùng tiền mặt. Hãy tải trước bản đồ offline trên điện thoại phòng khi đi sâu vào vùng núi mất sóng 4G.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
