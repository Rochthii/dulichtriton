'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, MapPin, Landmark, Sun, CloudRain, Utensils, Mountain, 
  ShieldCheck, PhoneCall, Bus, Bike, Clock, ChevronRight, Sparkles, 
  CheckCircle2, Info, BookOpen, AlertTriangle, ArrowRight, Heart, Star, Navigation, Play,
  Building, Scroll, Trees, Flame, Shield, Phone, HeartHandshake, Award, Coins
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
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
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
      <section className="bg-[#FFFDF7] rounded-[24px] p-2.5 sm:p-3 border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x font-display">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD37A]' : 'text-[#6B6355]'}`} />
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
          <div className="bg-gradient-to-br from-[#0B6B60] via-[#0E8C7F] to-[#151B34] text-white rounded-[28px] p-6 sm:p-10 shadow-[0_10px_30px_rgba(38,34,27,0.14)] relative overflow-hidden border border-[#0E8C7F]/30">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="text-xs font-bold text-[#FFD37A] uppercase tracking-widest block font-display">
                Trái Tim Của Miền Thất Sơn Huyền Bí
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight text-[#FFFDF7]">
                Tri Tôn — Vùng Đất Giao Thoa Kỳ Vĩ Giữa Núi Rừng, Đồng Bằng & Văn Hóa Khmer
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#FAF3E7]/90 leading-relaxed">
                Nằm ở phía Tây Nam tỉnh An Giang, giáp vương quốc Campuchia, Tri Tôn là vùng đất bán sơn địa hiếm có của Đồng bằng Sông Cửu Long. Nơi đây sở hữu cảnh sắc ngoạn mục với những hồ nước trên đỉnh đồi đá, các dãy núi granit sừng sững, cánh đồng thốt nốt bạt ngàn và nền văn hóa Phật giáo Nam tông Khmer hơn 500 năm lịch sử.
              </p>
            </div>
            <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-white pointer-events-none">
              <Mountain className="w-96 h-96" />
            </div>
          </div>

          {/* 4 Key Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF7] rounded-[22px] p-5 border border-[#26221B]/8 shadow-xs space-y-1">
              <p className="text-xs font-bold text-[#6B6355] font-display">Diện Tích Tự Nhiên</p>
              <p className="font-display text-2xl font-extrabold text-[#0E8C7F]">~600 km²</p>
              <p className="font-body text-[11px] text-[#6B6355]">Lớn nhất tỉnh An Giang</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[22px] p-5 border border-[#26221B]/8 shadow-xs space-y-1">
              <p className="text-xs font-bold text-[#6B6355] font-display">Đơn Vị Hành Chính</p>
              <p className="font-display text-2xl font-extrabold text-[#0E8C7F]">15 Đơn Vị</p>
              <p className="font-body text-[11px] text-[#6B6355]">2 Thị Trấn & 13 Xã</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[22px] p-5 border border-[#26221B]/8 shadow-xs space-y-1">
              <p className="text-xs font-bold text-[#6B6355] font-display">Dân Cư & Dân Tộc</p>
              <p className="font-display text-2xl font-extrabold text-[#D9822B]">&gt;34% Khmer</p>
              <p className="font-body text-[11px] text-[#6B6355]">Cộng đồng Kinh - Khmer - Hoa</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[22px] p-5 border border-[#26221B]/8 shadow-xs space-y-1">
              <p className="text-xs font-bold text-[#6B6355] font-display">Di Sản & Điểm Đến</p>
              <p className="font-display text-2xl font-extrabold text-[#0E8C7F]">149 Điểm Đến</p>
              <p className="font-body text-[11px] text-[#6B6355]">37 Chùa Khmer cổ kính</p>
            </div>
          </div>

          {/* 3 Pillars of Tri Ton Tourism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F] flex items-center justify-center font-black">
                <Mountain className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-bold text-[#26221B]">1. Thắng Cảnh Sơn Thủy</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Hồ Tà Pạ (Tuyệt Tình Cốc), Đỉnh Núi Cô Tô 614m, Vồ Hội, Suối Bạc Soài So, Hồ Ô Thum thơ mộng, Hàng cây thốt nốt trái tim huyền thoại.
              </p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9822B]/10 text-[#D9822B] flex items-center justify-center font-black">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-bold text-[#26221B]">2. Di Sản & Lễ Hội Khmer</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Lễ hội Đua Bò Bảy Núi rực lửa (Sene Dolta), Chùa Xvayton hơn 500 năm tuổi lưu giữ Kinh lá buông, Cổng trời Chùa Koh Kas nguy nga.
              </p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F26B3A]/10 text-[#F26B3A] flex items-center justify-center font-black">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-bold text-[#26221B]">3. Ẩm Thực Bản Địa Độc Bản</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Gà Đốt Ô Thum ướp lá chúc, Cháo Bò trái chúc thơm ngậy, Đu Đủ Đâm giòn cay, Bò nướng xiên, Bánh bò thốt nốt và nước thốt nốt ngọt lịm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ĐỊA LÝ & 15 XÃ THỊ TRẤN ───────────────────────────────── */}
      {activeTab === 'geography' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
            <h2 className="font-display text-xl font-bold text-[#26221B] flex items-center gap-2">
              <Mountain className="w-5 h-5 text-[#0E8C7F]" />
              <span>Bản Đồ Địa Lý & 15 Đơn Vị Hành Chính</span>
            </h2>
            <p className="font-body text-xs text-[#6B6355] leading-relaxed">
              Tri Tôn nằm ở tọa độ 10.25°–10.55°B và 104.85°–105.15°Đ. Phía Bắc giáp TX. Tịnh Biên, phía Đông giáp huyện Châu Thành và Thoại Sơn, phía Nam giáp tỉnh Kiên Giang (huyện Hòn Đất và Giang Thành), phía Tây Bắc giáp vương quốc Campuchia với đường biên giới dài hơn 15 km.
            </p>

            {/* 15 Communes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
              {[
                { name: 'Thị trấn Tri Tôn', role: 'Trung tâm hành chính, thương mại, ẩm thực đêm' },
                { name: 'Thị trấn Ba Chúc', role: 'Vùng di tích lịch sử Nhà Mồ Ba Chúc & Chùa Phi Lai' },
                { name: 'Xã Núi Tô',        role: 'Địa danh Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng Tà Pạ' },
                { name: 'Xã Ô Lâm',         role: 'Thủ phủ Gà Đốt Ô Thum, Chùa Ô Lâm, Làng nghề đan đát' },
                { name: 'Xã Châu Lăng',     role: 'Cổng Trời Koh Kas, Đu Đủ Đâm Rina, Làng bò nướng' },
                { name: 'Xã Cô Tô',         role: 'Khu du lịch Suối Bạc Soài So, Đỉnh núi Cô Tô 614m' },
                { name: 'Xã An Tức',        role: 'Khu di tích lịch sử Đồi Tức Dụp 2 Triệu Đô' },
                { name: 'Xã Lương Phi',     role: 'Vườn cây ăn trái, Chùa Lương Phi, đồi dốc thanh bình' },
                { name: 'Xã Lạc Quới',      role: 'Vùng đệm biên giới, lúa trù phú kênh Vĩnh Tế' },
                { name: 'Xã Vĩnh Gia',      role: 'Cửa ngõ biên giới Tây Nam, kênh Vĩnh Tế lịch sử' },
                { name: 'Xã Vĩnh Phước',    role: 'Vùng nông nghiệp công nghệ cao, cánh đồng sen' },
                { name: 'Xã Lương An Trà',  role: 'Vùng đất khai hoang kiên cường Tứ Giác Long Xuyên' },
                { name: 'Xã Tà Đảnh',       role: 'Cửa ngõ kết nối TP. Long Xuyên vào Tri Tôn qua ĐT941' },
                { name: 'Xã Tân Tuyến',     role: 'Vùng nông nghiệp sinh thái ngập nước' },
                { name: 'Xã Lê Trì',        role: 'Chân núi Dài Năm Giếng, vườn mãng cầu, sầu riêng núi' },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 hover:border-[#0E8C7F]/40 transition-colors space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#0E8C7F] shrink-0" />
                    <h3 className="font-display font-bold text-sm text-[#26221B]">{c.name}</h3>
                  </div>
                  <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">{c.role}</p>
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
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-xs font-bold font-display">
                Di Sản Văn Hóa Quốc Gia
              </span>
              <h3 className="font-display text-xl font-bold text-[#26221B]">Lễ Hội Đua Bò Bảy Núi (Sene Dolta)</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Diễn ra vào dịp lễ Sene Dolta (tháng 8–9 Âm lịch hàng năm). Đây là môn thể thao dân gian độc nhất vô nhị: các đôi bò khỏe nhất vùng Bảy Núi tranh tài trên ruộng bùn nước lấp xấp dưới sự điều khiển tài tình của các tài xế (người cầm roi).
              </p>
              <div className="p-3 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 text-xs text-[#26221B] font-bold font-body">
                Địa điểm: Sân chùa Tà Pạ (Núi Tô) hoặc Chùa Thơ Mít (Vĩnh Trung).
              </div>
            </div>

            {/* Festival 2 */}
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#D9822B]/15 text-[#D9822B] text-xs font-bold font-display">
                Tết Cổ Truyền
              </span>
              <h3 className="font-display text-xl font-bold text-[#26221B]">Tết Chol Chnam Thmay</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Tết mừng năm mới của đồng bào Khmer (giữa tháng 4 Dương lịch hàng năm). Mọi người diện trang phục truyền thống rực rỡ, mang lễ vật đến chùa làm lễ đắp núi cát, tắm Phật cầu an và cùng hòa mình vào điệu múa Romvong, Saravan rộn ràng.
              </p>
              <div className="p-3 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 text-xs text-[#26221B] font-bold font-body">
                Địa điểm: Rộn ràng tại tất cả 37 ngôi Chùa Khmer trên địa bàn.
              </div>
            </div>

            {/* Heritage 3 */}
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-xs font-bold font-display">
                Di Sản Tư Liệu Độc Bản
              </span>
              <h3 className="font-display text-xl font-bold text-[#26221B]">Kinh Lá Buông (Satra Sla-rit)</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Nghệ thuật khắc chữ thiêng trên lá cây buông sấy khô bằng bút sắt kim loại, sau đó quét mực tro muội đèn. Chùa Xvayton (Xà Tón) tại Thị trấn Tri Tôn hiện là nơi lưu giữ số lượng bộ Kinh lá buông cổ nhiều nhất và lâu đời nhất Việt Nam.
              </p>
            </div>

            {/* Heritage 4 */}
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-xs font-bold font-display">
                Lễ Cúng Trăng
              </span>
              <h3 className="font-display text-xl font-bold text-[#26221B]">Lễ Hội Ok Om Bok & Thả Đèn Gió</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Diễn ra vào rằm tháng 10 Âm lịch. Người dân tạ ơn Thần Mặt Trăng đã ban cho mưa thuận gió hòa, mùa màng bội thu, cùng nghi thức đút cốm dẹp cho trẻ nhỏ và thả đèn hoa đăng, đèn gió lung linh rực sáng bầu trời đêm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BẢN ĐỒ ẨM THỰC ─────────────────────────────────────────── */}
      {activeTab === 'food' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-6">
            <h2 className="font-display text-xl font-bold text-[#26221B] flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#F26B3A]" />
              <span>Hương Vị Bản Địa Không Thể Nhầm Lẫn</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-2">
                <h3 className="font-display font-bold text-sm text-[#F26B3A]">Gà Đốt Ô Thum (Xã Ô Lâm)</h3>
                <p className="text-[#6B6355] leading-relaxed">
                  Gà thả đồi thịt săn chắc, ướp sả, ớt, mật ong và đặc biệt là <strong>lá chúc</strong> tươi thái chỉ. Nướng than đượm trong nồi gang cho da vàng giòn ruộm, chấm muối ớt chanh trái chúc ăn kèm dưa leo và xôi chiên phồng.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-2">
                <h3 className="font-display font-bold text-sm text-[#F26B3A]">Cháo Bò Trái Trúc (Thị trấn Tri Tôn)</h3>
                <p className="text-[#6B6355] leading-relaxed">
                  Cháo ninh mềm nhuyễn từ gạo thơm và đậu xanh, ăn cùng lòng bò tươi luộc giòn, thịt bò bắp mềm ngọt, giá đỗ, gừng tươi và nước vắt từ <strong>trái chúc</strong> thơm thanh nồng nàn.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-2">
                <h3 className="font-display font-bold text-sm text-[#F26B3A]">Đu Đủ Đâm & Bò Lụi Khmer (Xã Châu Lăng)</h3>
                <p className="text-[#6B6355] leading-relaxed">
                  Đu đủ xanh giòn đâm trong cối gỗ cùng mắm ba khía, ruốc, đậu phộng, chanh ớt chua cay bùng nổ, ăn kèm các xiên thịt bò tơ nướng thơm phức bên bếp than đỏ.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-2">
                <h3 className="font-display font-bold text-sm text-[#F26B3A]">Bánh Bò Thốt Nốt & Nước Thốt Nốt</h3>
                <p className="text-[#6B6355] leading-relaxed">
                  Bánh bò làm từ bột gạo ủ men tự nhiên và đường thốt nốt nguyên chất, gói lá chuối hoặc lá thốt nốt hấp nóng xốp dẻo, rắc thêm dừa nạo béo ngậy.
                </p>
              </div>
            </div>

            <div className="pt-3 text-center">
              <Link
                href="/food"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs shadow-md transition-all active:scale-95 font-display"
              >
                <span>Xem Toàn Bộ Quán Ăn Ngon Tri Tôn</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: KHÍ HẬU & 2 MÙA ─────────────────────────────────────────── */}
      {activeTab === 'seasons' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-[#F0A32F]/10 text-[#F0A32F]">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#26221B]">Mùa Khô (Tháng 12 – Tháng 4)</h3>
                  <p className="text-xs text-[#D9822B] font-bold font-body">Nắng vàng, trời trong, khô ráo</p>
                </div>
              </div>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Thời tiết lý tưởng nhất cho các hoạt động dã ngoại ngoài trời: cắm trại ven hồ Ô Thum, trekking chinh phục đỉnh núi Cô Tô, ngắm bình minh trên đồi Tà Pạ và chiêm bái các ngôi chùa cổ.
              </p>
              <ul className="text-xs text-[#6B6355] space-y-1.5 list-disc pl-4 font-body">
                <li>Uống nước thốt nốt tươi ngọt mát nhất vào mùa này.</li>
                <li>Hồ Tà Pạ trong xanh màu ngọc bích phẳng lặng.</li>
                <li>Nên mang theo kem chống nắng, kính râm và mũ rộng vành.</li>
              </ul>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F]">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#26221B]">Mùa Mưa & Nước Nổi (Tháng 5 – Tháng 11)</h3>
                  <p className="text-xs text-[#0E8C7F] font-bold font-body">Cánh đồng vàng rực, lễ hội đua bò rộn rã</p>
                </div>
              </div>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Mùa đẹp nhất cho những tay săn ảnh: Cánh đồng lúa Tà Pạ chín vàng óng ả (Tháng 9–11), không khí lễ hội đua bò Sene Dolta náo nhiệt và đặc sản cá linh non, bông điên điển mùa nước nổi.
              </p>
              <ul className="text-xs text-[#6B6355] space-y-1.5 list-disc pl-4 font-body">
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
          {/* 4 Direction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-xs font-bold font-display">
                Tuyến TP. Hồ Chí Minh → Tri Tôn (~210km)
              </span>
              <h3 className="font-display text-base font-bold text-[#26221B]">Xe Khách Giường Nằm & Limousine VIP</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                • <strong>Nhà xe Huệ Nghĩa</strong> (Hotline: <strong>1900 636497</strong>): Chạy tuyến thẳng TP.HCM (BX Miền Tây, trạm An Sương) về thẳng BX Tri Tôn & Ba Chúc (mỗi 1-2h có 1 chuyến 24/7).<br/>
                • <strong>Nhà xe Phương Trang (FUTA Bus Lines)</strong> (Hotline: <strong>1900 6067</strong> - VP Tri Tôn: <strong>51 Đường 3 Tháng 2, Thị trấn Tri Tôn</strong>): Xe giường nằm cao cấp chạy thẳng tuyến TP.HCM (BX Miền Tây) ➔ Bến xe & Văn phòng Tri Tôn (đặt vé tiện lợi qua FUTA App).
              </p>
              <p className="font-body text-xs font-bold text-[#0E8C7F]">Thời gian: ~4.5 – 5 tiếng • Giá vé: 170.000đ – 220.000đ</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#F0A32F]/15 text-[#D9822B] text-xs font-bold font-display">
                Tuyến TP. Cần Thơ → Tri Tôn (~110km)
              </span>
              <h3 className="font-display text-base font-bold text-[#26221B]">Xe Máy Hoặc Ô Tô Tự Lái</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Chạy theo QL91 qua TP. Long Xuyên, rẽ trái vào Tỉnh lộ ĐT941 (ngã ba Lộ Tẻ Tri Tôn) chạy thẳng 45km dọc bờ kênh xanh mướt xuyên qua cánh đồng lúa bạt ngàn về thẳng trung tâm Thị trấn Tri Tôn.
              </p>
              <p className="font-body text-xs font-bold text-[#D9822B]">Thời gian: ~2.5 tiếng • Đường nhựa phẳng đẹp, dễ đi</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-xs font-bold font-display">
                Tuyến TP. Châu Đốc → Tri Tôn (~45km)
              </span>
              <h3 className="font-display text-base font-bold text-[#26221B]">Cung Đường Vòng Núi Thất Sơn Đẹp Nhất</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Đi theo QL91 rẽ vào Tỉnh lộ ĐT948 chạy men theo chân Núi Cấm và Rừng tràm Trà Sư, sườn Núi Dài qua Xã Châu Lăng về Tri Tôn. Cung đường đèo thấp uốn lượn ngắm trọn cảnh sắc núi non kỳ vĩ.
              </p>
              <p className="font-body text-xs font-bold text-[#0E8C7F]">Thời gian: ~1 tiếng • Tuyến kết hợp Châu Đốc - Trà Sư - Tri Tôn</p>
            </div>

            <div className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-xs font-bold font-display">
                Tuyến Rạch Giá / Kiên Giang → Tri Tôn (~75km)
              </span>
              <h3 className="font-display text-base font-bold text-[#26221B]">Cung Đường Xuyên Vùng Tứ Giác Long Xuyên</h3>
              <p className="font-body text-xs text-[#6B6355] leading-relaxed">
                Đi theo QL80 qua Kênh Tám Ngàn rẽ về Xã Tân Tuyến / Cô Tô đến Tri Tôn. Tuyến đường kết nối thuận tiện giữa biển Kiên Giang và vùng núi Thất Sơn An Giang.
              </p>
              <p className="font-body text-xs font-bold text-[#7C5CBF]">Thời gian: ~1.8 tiếng • Rất thuận tiện cho phượt thủ miền Tây</p>
            </div>
          </div>

          {/* Special Mountain Slopes & Local Guide Box */}
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border-2 border-[#D9822B]/30 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#D9822B]/10 text-[#D9822B]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#26221B]">
                Cẩm Nang Thực Địa Lên Các Thắng Cảnh Dốc Núi & Đường Hẹp
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body text-[#6B6355]">
              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2">
                <p className="font-bold text-[#26221B] font-display flex items-center gap-1.5">
                  <Mountain className="w-4 h-4 text-[#A6503A]" />
                  Đỉnh Núi Cô Tô & Vồ Hội Mẹ (Xã Cô Tô)
                </p>
                <p className="leading-relaxed">
                  Dốc đứng hơn 30 độ với cua tay áo cực gắt. <strong>CẢNH BÁO:</strong> Tuyệt đối KHÔNG tự lái xe máy cá nhân nếu không quen dốc núi. <strong>Bắt buộc thuê Đội xe ôm Núi Cô Tô</strong> (xe có phanh phụ chuyên dụng, ~100k-150k/người khứ hồi) hoặc đi bộ trekking 2-3 tiếng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2">
                <p className="font-bold text-[#26221B] font-display flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#0E8C7F]" />
                  Chùa Tà Pạ & Hồ Tà Pạ (Xã Núi Tô)
                </p>
                <p className="leading-relaxed">
                  Từ đường Nguyễn Trãi rẽ vào dốc bê tông 1.2km lên chùa. Xe máy đi số 1-2, KHÔNG rà thắng liên tục. Ô tô 4-7 chỗ lên tận sân chùa. Xe 16-29 chỗ đậu ở bãi xe chân núi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2">
                <p className="font-bold text-[#26221B] font-display flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#D9822B]" />
                  Hồ Ô Thum & Quán Gà Đốt (Xã Ô Lâm)
                </p>
                <p className="leading-relaxed">
                  Đường ĐT955B rẽ vào đường bờ hồ 1.5km trải nhựa và bê tông rộng rãi. Ô tô 4-29 chỗ và xe máy vào tận bãi đỗ xe của các quán gà đốt ven hồ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2">
                <p className="font-bold text-[#26221B] font-display flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#7C5CBF]" />
                  Cổng Trời Chùa Koh Kas (Xã Châu Lăng)
                </p>
                <p className="leading-relaxed">
                  Từ ngã 3 Cây Me (ĐT948) rẽ vào đường bê tông liên ấp An Hòa xuyên qua cánh đồng lúa 1km. Xe máy vào tận cổng chụp ảnh, ô tô đậu ngoài đường nhựa lớn cách 200m rồi đi bộ vào.
                </p>
              </div>
            </div>
          </div>

          {/* 8 Iconic Scenic Routes & Pathways */}
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#26221B]">
                  Tuyệt Tác 16 Cung Đường & Lối Mòn Check-in Huyền Thoại Tri Tôn
                </h3>
                <p className="font-body text-xs text-[#6B6355]">
                  Những cung đường tuyệt sắc dành cho phượt thủ, nhiếp ảnh gia và du khách mê xê dịch
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-[10px] font-bold font-display">
                  Biển Lúa Tà Pạ
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Con Đường Tơ Lụa</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường bê tông uốn lượn hình chữ S mềm mại vắt ngang đồng lúa Tà Pạ, nối Hồ Soài Chek và Hàng Cây Trâm trăm tuổi.
                </p>
                <p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Xã Núi Tô • Check-in lúc 06:00 & 16:30</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0A32F]/15 text-[#D9822B] text-[10px] font-bold font-display">
                  Săn Mây & Hoàng Hôn
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Tuyến Tránh Chữ Y</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Tuyến đường 4 làn rộng thoáng 4.3km nối ĐT941 sang ĐT948. Nút giao chữ Y độc đạo view trọn vẹn Núi Cô Tô và Núi Dài.
                </p>
                <p className="font-body text-[10px] font-bold text-[#D9822B]">📍 Nối ĐT941 - ĐT948 • View 360 độ</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-[10px] font-bold font-display">
                  Mùa Trái Trâm Tím
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Hàng Cây Trâm Cổ Thụ</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Hàng cây trâm trăm tuổi xanh ngắt giữa ruộng lúa. Mùa quả chín từ tháng 4-6 nhuộm tím cả góc trời đồng quê Bảy Núi.
                </p>
                <p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Xã Núi Tô • Mùa trâm tháng 4 - 6</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-[10px] font-bold font-display">
                  Thiên Đường Ẩm Thực
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Hàng Me Châu Lăng</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Đoạn đường ĐT948 qua Cầu Cây Me rợp bóng me cổ thụ, nơi có cháo bò trái chúc, đu đủ đâm Rina và bánh bò thốt nốt nướng.
                </p>
                <p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Cầu Cây Me, Xã Châu Lăng</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#A6503A]/15 text-[#A6503A] text-[10px] font-bold font-display">
                  Sắc Hoa Rực Rỡ
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Hoa Bờ Kè Núi Tô</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Tuyến đường hoa kèn hồng, kèn vàng và hoa điệp rực rỡ men theo bờ kè kênh dẫn vào Công viên Văn hóa và Hồ Soài Chek.
                </p>
                <p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Nội ô mở rộng TT. Tri Tôn</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-[10px] font-bold font-display">
                  Rừng Tre Thẳng Tắp
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Vào Ô Tà Sóc</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường rợp mát bóng tre tầm vông xanh mướt dẫn vào Hang Chỉ Huy, Điện Trời Gầm, Suối Bạc và Đồi Ma Thiên Lãnh.
                </p>
                <p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Xã Lương Phi • Ô tô & xe máy vào tận nơi</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#A6503A]/15 text-[#A6503A] text-[10px] font-bold font-display">
                  Thung Lũng Sơn Thủy
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Thung Lũng Tà Lọt</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Thung lũng hoang sơ kẹp giữa Núi Cấm và Núi Dài với Hồ Tà Lọt 531.000m³, suối đá róc rách và vườn sầu riêng trĩu quả.
                </p>
                <p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Xã Lê Trì - An Hảo • Đi phượt xe máy</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-[10px] font-bold font-display">
                  Biểu Tượng Tình Yêu
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Thốt Nốt Trái Tim</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cụm thốt nốt mọc tự nhiên kết thành hình trái tim hoàn mỹ giữa biển lúa vàng rực dưới chân Núi Phụng Hoàng Sơn.
                </p>
                <p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Xã Cô Tô • Cách TT. Tri Tôn 4km</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0A32F]/15 text-[#D9822B] text-[10px] font-bold font-display">
                  Cổ Kính & Đua Bừa
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Cổng Trời Koh Kas</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường đan xuyên cánh đồng lúa dẫn đến Cổng chùa Koh Kas cổ kính trơ trọi giữa đồng và Sân bừa nước Chùa Rô.
                </p>
                <p className="font-body text-[10px] font-bold text-[#D9822B]">📍 Xã Châu Lăng • Rẽ từ Ngã 3 Cây Me</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-[10px] font-bold font-display">
                  Cung Đèo Bảy Núi
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đèo Sườn Núi Dài (ĐT948)</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường huyết mạch uốn lượn ôm sát chân Núi Dài và Núi Cấm, nối Tri Tôn qua Châu Lăng, KDL Núi Cấm và Trà Sư.
                </p>
                <p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Tuyến Tỉnh lộ ĐT948</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#A6503A]/15 text-[#A6503A] text-[10px] font-bold font-display">
                  Mặt Nước Phẳng Lặng
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Vòng Hồ Soài So</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Đường nhựa bao quanh lòng hồ 5ha, chiêm ngưỡng vách đá dựng đứng của Núi Cô Tô soi bóng và dòng Suối Vàng thơ mộng.
                </p>
                <p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Xã Núi Tô • Cách trung tâm 1.5km</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-[10px] font-bold font-display">
                  Sân Đua Bò Lớn Nhất
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Hồ Soài Chek</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Đường hoa dẫn vào lòng hồ Soài Chek xanh biếc, công viên văn hóa và Sân Đua Bò Bảy Núi lớn nhất tỉnh An Giang.
                </p>
                <p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Ấp Tô Hạ, Xã Núi Tô</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0A32F]/15 text-[#D9822B] text-[10px] font-bold font-display">
                  Đồi Hai Triệu Đô
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Vào Đồi Tức Dụp</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường lịch sử dẫn vào ngọn đồi huyền thoại Tức Dụp với hệ thống hang lò ốc độc đáo trong lòng đá granite hùng vĩ.
                </p>
                <p className="font-body text-[10px] font-bold text-[#D9822B]">📍 ĐT948, Xã An Tức</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CBF]/15 text-[#7C5CBF] text-[10px] font-bold font-display">
                  Làng Nghề Cà-Ràng
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Gốm Phnôm Pi</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Con đường phum sóc thanh bình dẫn vào làng nghề làm bếp Cà-ràng và đồ gốm đất sét thủ công độc nhất của người Khmer.
                </p>
                <p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Ấp Phnôm Pi, Xã Châu Lăng</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#A6503A]/15 text-[#A6503A] text-[10px] font-bold font-display">
                  Biên Giới Tây Nam
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Đường Kênh Vĩnh Tế</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Cung đường biên giới chạy dọc bờ Kênh Vĩnh Tế lịch sử từ Ba Chúc đến Cửa khẩu Vĩnh Gia giáp Campuchia mùa nước nổi.
                </p>
                <p className="font-body text-[10px] font-bold text-[#A6503A]">📍 ĐT955A, Xã Vĩnh Gia</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-2 hover:shadow-md transition-all">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/15 text-[#0E8C7F] text-[10px] font-bold font-display">
                  Biểu Tượng Bảy Núi
                </span>
                <h4 className="font-display text-sm font-bold text-[#26221B]">Chữ &quot;TRI TÔN&quot; Núi Cô Tô</h4>
                <p className="font-body text-[11px] text-[#6B6355] leading-relaxed">
                  Dòng chữ bê tông trắng cao 7m sườn núi Phụng Hoàng Sơn. Check-in bên trong chữ Ô tạo góc nhìn ô cửa sổ máy bay triệu view.
                </p>
                <p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Sân Tiên, Núi Cô Tô • Rực sáng đèn LED đêm</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: LƯU Ý VĂN HÓA & CỨU HỘ SOS ─────────────────────────────── */}
      {activeTab === 'etiquette' && (
        <div className="space-y-8 animate-fade-in">
          {/* Emergency Box */}
          <div className="bg-[#FFFDF7] border-2 border-[#A6503A]/30 rounded-[28px] p-6 sm:p-8 space-y-4 shadow-[0_2px_10px_rgba(38,34,27,0.08)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#A6503A]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#26221B]">
                Tổng Đài SOS Cứu Hộ Khẩn Cấp 24/7 (Tri Tôn, An Giang)
              </h2>
            </div>
            <p className="font-body text-xs text-[#6B6355]">
              Lưu ngay 3 số điện thoại khẩn cấp trực ban để liên hệ khi xảy ra sự cố trên đường:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <a
                href="tel:02963874113"
                className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 shadow-2xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#A6503A] text-white flex items-center justify-center font-black">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6B6355] font-display">Công An Tri Tôn</p>
                  <p className="font-display text-base font-bold text-[#A6503A] group-hover:underline">0296 3874 113</p>
                </div>
              </a>

              <a
                href="tel:02963874115"
                className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 shadow-2xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#0E8C7F] text-white flex items-center justify-center font-black">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6B6355] font-display">Y Tế Tri Tôn (Cấp cứu)</p>
                  <p className="font-display text-base font-bold text-[#0E8C7F] group-hover:underline">0296 3874 115</p>
                </div>
              </a>

              <a
                href="tel:02963771999"
                className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 shadow-2xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F0A32F] text-[#26221B] flex items-center justify-center font-black">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6B6355] font-display">Hỗ Trợ Du Lịch</p>
                  <p className="font-display text-base font-bold text-[#26221B] group-hover:underline">0296 3771 999</p>
                </div>
              </a>
            </div>
          </div>

          {/* Cultural Etiquette Rules */}
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
            <h3 className="font-display text-lg font-bold text-[#26221B]">Những Lưu Ý Quan Trọng Khi Đến Tri Tôn</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body">
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-1.5">
                <span className="font-display font-bold text-[#0E8C7F] block">1. Khi Vào Viếng Chùa Khmer:</span>
                <p className="text-[#6B6355] leading-relaxed">
                  Mặc trang phục kín đáo (quần/váy dài quá đầu gối, áo có tay che vai). Bỏ giày dép bên ngoài trước khi bước vào chánh điện. Không chạm vào người hoặc đưa đồ trực tiếp cho các nhà sư nếu là nữ giới.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-1.5">
                <span className="font-display font-bold text-[#0E8C7F] block">2. Đặt Món Gà Đốt Ô Thum:</span>
                <p className="text-[#6B6355] leading-relaxed">
                  Nên gọi điện cho quán trước 45–60 phút để quán bắt đầu ướp và đốt than. Tránh đến nơi mới gọi món vào giờ trưa sẽ phải chờ khá lâu.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-1.5">
                <span className="font-display font-bold text-[#0E8C7F] block">3. Trekking & Leo Núi Cô Tô / Vồ Hội:</span>
                <p className="text-[#6B6355] leading-relaxed">
                  Đi giày thể thao có độ bám tốt, mang theo đèn pin và nước uống. Không xả rác và không đốt lửa bừa bãi trong rừng núi mùa khô.
                </p>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-1.5">
                <span className="font-display font-bold text-[#0E8C7F] block">4. Tiền Mặt & Sóng Điện Thoại:</span>
                <p className="text-[#6B6355] leading-relaxed">
                  Các quán nước thốt nốt và sạp trái cây ven đường thường chỉ dùng tiền mặt. Hãy tải trước bản đồ offline trên điện thoại phòng khi đi sâu vào vùng núi mất sóng 4G.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
