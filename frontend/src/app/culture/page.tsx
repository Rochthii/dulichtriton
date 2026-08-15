"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Landmark, MapPin, Calendar, Compass, Clock, Star, Sparkles, ChevronRight, 
  Award, ShieldCheck, Flame, Navigation, BookOpen, Music, Layers, Eye, MessageSquareText,
  ChevronDown, Heart, ArrowUpRight, Share2, Info
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";

interface CulturePlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating?: number;
  image_url: string;
  description?: string;
  detailed_story?: string;
  is_hot?: boolean;
}

const FESTIVALS_DATA = [
  {
    id: "fest-dua-bo",
    name: "Lễ Hội Đua Bò Bảy Núi (Lễ Sene Dolta)",
    time: "Tháng 8 - 9 Âm Lịch (Cuối T9 - Đầu T10)",
    season_badge: "Mùa Nước Nổi & Thu Hoạch",
    location: "Sân Đua Bò Tà Pạ - Soài Chek (Xã Núi Tô) & Sân Đua Nước Chùa Rô (Xã Châu Lăng)",
    tag: "Di Sản Quốc Gia",
    tagColor: "bg-[#7C5CBF] text-white border-[#7C5CBF]",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop",
    desc: "Hội thi thể thao dân gian độc nhất vô nhị trên bãi bùn lầy, nơi các đôi bò dũng mãnh tranh tài tốc độ nghẹt thở trong tiếng hò reo của hàng vạn du khách khắp cả nước.",
    cradle: "Cái nôi cội nguồn khởi phát từ phong tục cày ruộng chùa tại Chùa Tà Miệt (Xã Lương Phi).",
    highlights: [
      "Màn so tài thần tốc 'tạt bùn rẽ sóng' tại Sân Tà Pạ - Soài Chek",
      "Hội thi bừa nước mùa nước nổi nghệ thuật tại Chùa Rô",
      "Vũ điệu múa trống Chhay-dăm và tiếng kèn bạt mạng rộn rã"
    ]
  },
  {
    id: "fest-chol-chnam-thmay",
    name: "Tết Cổ Truyền Chôl Chnăm Thmây",
    time: "13 - 16 Tháng 4 Dương Lịch Hàng Năm",
    season_badge: "Tết Mừng Năm Mới Rực Rỡ",
    location: "Khắp 37 ngôi chùa Nam Tông Khmer: Wat Xvayton, Chùa Tà Pạ, Chùa Hàng Còng, Chùa Mới",
    tag: "Tết Cổ Truyền",
    tagColor: "bg-[#D9822B] text-white border-[#D9822B]",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
    desc: "Dịp lễ hội lớn nhất năm của đồng bào Khmer đón mừng năm mới, khắp phum sóc rực rỡ cờ hoa, nghi thức rước Đại lịch Maha Sangkran và té nước chúc phúc an lành.",
    cradle: "Không gian trang nghiêm nhất tại Chùa Xvayton (>300 năm tuổi, TT. Tri Tôn).",
    highlights: [
      "Nghi thức Đắp Núi Cát (Poun Phnum Khsach) tích lũy công đức",
      "Lễ tắm tượng Phật bằng nước thơm hoa lài linh thiêng",
      "Vòng múa Răm-vông (Lâm-thôn) và diễn xướng Dù Kê thâu đêm"
    ]
  },
  {
    id: "fest-ok-om-bok",
    name: "Lễ Hội Cúng Trăng Ok Om Bok & Thả Đèn Gió",
    time: "Đêm Rằm Tháng 10 Âm Lịch (Khoảng T11)",
    season_badge: "Đêm Rằm Tạ Ơn Thần Mặt Trăng",
    location: "Khuôn viên chùa Khmer, Hồ Tà Pạ, Hồ Ô Thum, Chùa Soài So",
    tag: "Lễ Hội Văn Hóa",
    tagColor: "bg-[#0E8C7F] text-white border-[#0E8C7F]",
    image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    desc: "Đại lễ tạ ơn Thần Mặt Trăng đã ban mưa thuận gió hòa, bảo vệ mùa màng tốt tươi; trẻ nhỏ được các bậc cao niên đút Cốm Dẹp (Ombok) gửi gắm ước nguyện tương lai.",
    cradle: "Nghi thức thả đèn gió khổng lồ sáng rực nền trời đêm Thất Sơn huyền ảo.",
    highlights: [
      "Nghi thức đút Cốm Dẹp ước nguyện cho thế hệ trẻ",
      "Thả Đèn Gió (Khom Khsach) khổng lồ bay cao vút",
      "Thả hoa đăng lung linh soi bóng mặt hồ Ô Thum, Tà Pạ"
    ]
  },
  {
    id: "fest-kathina",
    name: "Đại Lễ Dâng Y Kathina & Nhạc Ngũ Âm",
    time: "Rằm Tháng 9 Đến Rằm Tháng 10 Âm Lịch",
    season_badge: "Đại Lễ Phật Giáo Trang Nghiêm",
    location: "37 Ngôi Chùa Phật Giáo Nam Tông Khmer Tri Tôn",
    tag: "Phật Giáo Nam Tông",
    tagColor: "bg-[#C97F1B] text-white border-[#C97F1B]",
    image_url: "https://images.unsplash.com/photo-1609743522653-52354461cf27?q=80&w=1200&auto=format&fit=crop",
    desc: "Đại lễ công đức dâng y cà-sa và tứ vật dụng cho chư tăng sau 3 tháng An Cư Kiết Hạ, đoàn diễu hành rực rỡ trang phục Sampot cùng dàn nhạc ngũ âm rộn rã.",
    cradle: "Tập tục truyền thống ngàn năm gìn giữ chánh pháp Phật giáo Theravada.",
    highlights: [
      "Hòa tấu Dàn nhạc Ngũ Âm (Pinpeat) 5 chất liệu âm thanh",
      "Đoàn rước cúng y quanh phum sóc trong niềm hân hoan",
      "Trang phục Sampot và khăn lụa Krama truyền thống tuyệt đẹp"
    ]
  },
  {
    id: "fest-balloon",
    name: "Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn",
    time: "Dịp Lễ 30/4 - 1/5 & Quốc Khánh 2/9",
    season_badge: "Sự Kiện Du Lịch Thể Thao Đỉnh Cao",
    location: "Quảng Trường TT. Tri Tôn & Khu Du Lịch Đồi Tức Dụp",
    tag: "Lễ Hội Hiện Đại",
    tagColor: "bg-[#F26B3A] text-white border-[#F26B3A]",
    image_url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop",
    desc: "Chiêm ngưỡng hàng chục quả khinh khí cầu khổng lồ rực rỡ bay lượn trên nền trời Thất Sơn, ngắm toàn cảnh cánh đồng lúa chín Tà Pạ và vách đá Phụng Hoàng Sơn hùng vĩ.",
    cradle: "Sự kiện du lịch - thể thao thường niên thu hút đông đảo du khách trẻ và nhiếp ảnh gia.",
    highlights: [
      "Trải nghiệm bay khinh khí cầu treo ngắm núi Cô Tô từ trên cao",
      "Màn trình diễn dù lượn động cơ Paramotor xả khói màu ngoạn mục",
      "Đêm hội hoa đăng khinh khí cầu kết hợp âm nhạc đường phố sôi động"
    ]
  }
];

const HERITAGE_STORIES = [
  {
    id: "la-buong",
    title: "Kinh Lá Buông (Satra Slarkrit)",
    subtitle: "Di Sản Phi Vật Thể Quốc Gia Độc Bản",
    location: "Chùa Xvayton (Wat Xvayton), TT. Tri Tôn",
    icon: BookOpen,
    image_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop",
    desc: "Bảo vật vô giá lưu giữ giáo lý Phật giáo, văn học và y học cổ truyền Khmer; được khắc tỉ mỉ bằng kim sắt trên lá cây buông/thốt nốt, quét tro than và dầu cây trai bảo quản hàng trăm năm không mục rữa.",
    tag: "Chùa Xà Tón Cổ Kính",
    stamp: "BẢO VẬT QUỐC GIA"
  },
  {
    id: "pinpeat",
    title: "Dàn Nhạc Ngũ Âm Pinpeat",
    subtitle: "Linh Hồn Diễn Xướng Chùa Tháp Nam Tông",
    location: "Các Chùa Khmer & Nhà Trưng Bày Văn Hóa",
    icon: Music,
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    desc: "Hệ thống hòa âm độc đáo từ 5 chất liệu (Đồng, Sắt, Gỗ, Da, Hơi) với đàn Roneat-Ek, dàn cồng Kong-Vong hòa quyện cùng điệu múa Răm-vông (Lâm-thôn) và kịch hát Dù Kê (Robam).",
    tag: "Âm Nhạc Cổ Truyền",
    stamp: "DIỄN XƯỚNG DÂN GIAN"
  },
  {
    id: "tho-cam",
    title: "Làng Dệt Thổ Cẩm Châu Lăng",
    subtitle: "Nghệ Thuật Khung Cửi Gỗ Trăm Năm",
    location: "Xã Châu Lăng, Tri Tôn",
    icon: Layers,
    image_url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=800&auto=format&fit=crop",
    desc: "Đôi bàn tay khéo léo của người phụ nữ Khmer dệt nên những chiếc khăn rằn Krama, xà-rông hoa văn Thất Sơn với kỹ thuật nhuộm màu thủ công từ vỏ cây và lá rừng Bảy Núi.",
    tag: "Làng Nghề Thủ Công",
    stamp: "NGHỀ TRUYỀN THỐNG"
  },
  {
    id: "gom-ca-rang",
    title: "Lò Gốm Bếp Cà-Ràng Ô Lâm",
    subtitle: "Kỹ Thuật Nặn Tay Không Bàn Xoay",
    location: "Xã Ô Lâm, Tri Tôn",
    icon: Flame,
    image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop",
    desc: "Nghề gốm đất nung cổ truyền độc đáo: nặn tay hoàn toàn từ đất sét Thất Sơn, nung lộ thiên bằng rơm rạ tạo nên chiếc bếp cà-ràng hình số 3 và nồi niêu nấu gà đốt Ô Thum lừng danh.",
    tag: "Gốm Đất Nung",
    stamp: "DI SẢN TRĂM TUỔI"
  }
];

export default function CulturePage() {
  const [cultures, setCultures] = useState<CulturePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");

  useEffect(() => {
    function processCultureData(json: any) {
      const data = json?.culture || [];
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => {
          let img = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop";
          if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
            img = item.image_url;
          } else if (Array.isArray(item.photos) && item.photos.length > 0) {
            const p0 = item.photos[0];
            if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
            else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
          }
          return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            category: item.category || "culture",
            tourism_category: item.tourism_category || "Văn Hóa & Di Tích",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.9,
            image_url: img,
            description: item.description || "",
            detailed_story: item.detailed_story || "",
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        formatted.sort((a: any, b: any) => {
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setCultures(formatted);
      }
    }

    async function loadLiveCultureData() {
      try {
        const json = await fetchWithCache(
          '/api/v1/culture',
          (data) => data && data.culture && data.culture.length > 0
        );
        processCultureData(json);
      } catch (err) {
        console.warn('Fallback local master pois for culture:', err);
        const fallbackItems = (localMasterPois as any[]).filter(
          (p: any) =>
            p.category === 'culture' ||
            p.category === 'spiritual' ||
            p.category === 'history' ||
            (p.tourism_category && p.tourism_category.includes('Lễ Hội'))
        );
        processCultureData({ culture: fallbackItems });
      } finally {
        setLoading(false);
      }
    }

    loadLiveCultureData();
  }, []);

  const filteredCultures = useMemo(() => {
    if (selectedTab === "ALL") return cultures;
    if (selectedTab === "FESTIVAL") {
      return cultures.filter(c => 
        c.tourism_category.toLowerCase().includes("lễ hội") || 
        c.name.toLowerCase().includes("đua bò") || 
        c.name.toLowerCase().includes("sân đua")
      );
    }
    if (selectedTab === "PAGODA") {
      return cultures.filter(c => 
        c.tourism_category.toLowerCase().includes("chùa") || 
        c.tourism_category.toLowerCase().includes("tâm linh") ||
        c.name.toLowerCase().includes("chùa") ||
        c.name.toLowerCase().includes("wat")
      );
    }
    if (selectedTab === "HISTORY") {
      return cultures.filter(c => 
        c.category === "history" || 
        c.tourism_category.toLowerCase().includes("di tích") || 
        c.tourism_category.toLowerCase().includes("lịch sử") ||
        c.name.toLowerCase().includes("nhà mồ") ||
        c.name.toLowerCase().includes("tức dụp") ||
        c.name.toLowerCase().includes("ô tà sóc")
      );
    }
    if (selectedTab === "CRAFT") {
      return cultures.filter(c => 
        c.tourism_category.toLowerCase().includes("làng nghề") || 
        c.tourism_category.toLowerCase().includes("thủ công") ||
        c.name.toLowerCase().includes("làng nghề") ||
        c.name.toLowerCase().includes("thổ cẩm") ||
        c.name.toLowerCase().includes("gốm") ||
        c.name.toLowerCase().includes("lò đường") ||
        c.name.toLowerCase().includes("trưng bày")
      );
    }
    return cultures;
  }, [cultures, selectedTab]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased selection:bg-[#F0A32F]/30">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#0E8C7F]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#F0A32F]/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-12 px-4 py-8 md:px-6 md:py-12">
        
        {/* ── 1. HEADER HERO BANNER (Folk-Modern Heritage Gateway) ───────────────── */}
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0E8C7F] via-[#0B6B60] to-[#084D45] p-6 sm:p-8 md:p-12 text-white shadow-xl border border-[#0B6B60]">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#FFD37A]/10 blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD37A]/20 px-4 py-1.5 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-md font-display border border-[#FFD37A]/30">
              <Landmark className="h-4 w-4" />
              <span>Di Sản & Lễ Hội Bảy Núi — Tri Tôn, An Giang</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Kho Tàng Di Sản & Lễ Hội Thất Sơn
            </h1>
            
            <p className="text-sm sm:text-base text-[#FFFDF7]/90 leading-relaxed font-body max-w-2xl">
              Vùng đất hội tụ trầm tích văn hóa ngàn năm với <strong>Lễ Hội Đua Bò Bảy Núi</strong> di sản quốc gia, <strong>Kinh Lá Buông</strong> độc bản, <strong>37 ngôi chùa Phật giáo Nam Tông Khmer</strong> cổ kính và những làng nghề trăm tuổi dệt thổ cẩm, gốm đất nung.
            </p>

            {/* Quick Stats Grid */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">37 Chùa</span>
                <span className="text-[11px] text-white/80 font-medium">Nam Tông Khmer</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">5 Đại Lễ</span>
                <span className="text-[11px] text-white/80 font-medium">4 Mùa Bảy Núi</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">4 Di Tích</span>
                <span className="text-[11px] text-white/80 font-medium">Cấp Quốc Gia</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">2 Di Sản</span>
                <span className="text-[11px] text-white/80 font-medium">Phi Vật Thể QG</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a 
                href="#le-hoi-section"
                className="px-5 py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Xem Lịch 5 Đại Lễ Hội</span>
              </a>
              <a 
                href="#di-san-section"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/25 flex items-center gap-2 backdrop-blur-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>4 Bảo Vật & Làng Nghề</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. LỊCH 5 ĐẠI LỄ HỘI BẢY NÚI (Folk-Modern Photo Showcase) ────────── */}
        <section id="le-hoi-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#26221B]/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                <Calendar className="w-4 h-4 text-[#F26B3A]" />
                <span>Hội Xuân & Lễ Hội Dân Gian Bảy Núi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26221B] font-display mt-1">
                Lịch 5 Đại Lễ Hội Truyền Thống Tri Tôn
              </h2>
            </div>
            <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-4 py-1.5 rounded-full border border-[#0E8C7F]/20 w-fit">
              Diễn Ra Hàng Năm Theo 4 Mùa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FESTIVALS_DATA.map((fest) => (
              <div 
                key={fest.id}
                className="group relative bg-[#FFFDF7] rounded-[26px] overflow-hidden border border-[#EBE1D0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* 16:9 Photography Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fest.image_url}
                    alt={fest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Scrim Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151B34]/90 via-[#151B34]/30 to-transparent" />
                  
                  {/* Badges on Photo */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${fest.tagColor}`}>
                      {fest.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#FFD37A] bg-[#151B34]/80 backdrop-blur-md border border-[#FFD37A]/30 flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-[#FFD37A]" />
                      <span>{fest.time.split('(')[0]}</span>
                    </span>
                  </div>

                  {/* Season Title Bottom Left on Photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[11px] font-bold text-[#FFD37A] uppercase tracking-wide flex items-center gap-1 font-display">
                      <Sparkles className="w-3.5 h-3.5" />
                      {fest.season_badge}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 space-y-3.5 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#26221B] group-hover:text-[#0E8C7F] transition-colors leading-snug">
                      {fest.name}
                    </h3>

                    <p className="text-xs text-[#6B6355] leading-relaxed">
                      {fest.desc}
                    </p>

                    {/* Location Badge */}
                    <div className="p-2.5 rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-1">
                      <div className="text-[11px] font-bold text-[#26221B] flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0 mt-0.5" />
                        <span className="leading-snug">{fest.location}</span>
                      </div>
                      {fest.cradle && (
                        <p className="text-[10px] text-[#6B6355] pl-5 italic font-hand text-xs">
                          {fest.cradle}
                        </p>
                      )}
                    </div>

                    {/* Highlights List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black uppercase text-[#0E8C7F] tracking-wider font-display">
                        Trải Nghiệm Nổi Bật:
                      </span>
                      <ul className="space-y-1 text-xs text-[#4A4336]">
                        {fest.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F] shrink-0 mt-1.5" />
                            <span className="leading-tight">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#EBE1D0]">
                    <Link
                      href={`/chat?q=${encodeURIComponent(`Hãy kể chi tiết về ${fest.name} ở Tri Tôn: thời gian, địa điểm, nghi thức và kinh nghiệm đi xem thực tế`)}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                    >
                      <MessageSquareText className="w-4 h-4 text-[#26221B]" />
                      <span>Hỏi Trợ Lý AI Về Lễ Hội Này</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#26221B]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. KHÁM PHÁ BẢO VẬT & LÀNG NGHỀ TRĂM TUỔI ───────────────────────── */}
        <section id="di-san-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#26221B]/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0E8C7F] uppercase tracking-wider font-display">
                <Sparkles className="w-4 h-4 text-[#0E8C7F]" />
                <span>Bảo Tồn Bản Sắc Dân Tộc & Di Sản Sống</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26221B] font-display mt-1">
                Bảo Vật Quốc Gia & Tinh Hoa Làng Nghề
              </h2>
            </div>
            <span className="text-xs font-bold text-[#6B6355] hidden sm:inline">
              4 Di Sản Đặc Trưng Nhất Của Người Khmer Tri Tôn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HERITAGE_STORIES.map((h) => {
              const Icon = h.icon;
              return (
                <div 
                  key={h.id}
                  className="group relative bg-[#FFFDF7] rounded-[26px] overflow-hidden border border-[#EBE1D0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.image_url}
                      alt={h.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151B34]/85 via-transparent to-transparent" />
                    
                    {/* Heritage Stamp */}
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#FFD37A] text-[#26221B] font-black text-[9px] uppercase tracking-wider shadow-sm font-display">
                      {h.stamp}
                    </div>

                    <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-[#FFD37A] flex items-center justify-center border border-white/30">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider font-display">
                        {h.tag}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-[#26221B] group-hover:text-[#0E8C7F] transition-colors leading-tight">
                        {h.title}
                      </h3>
                      <p className="text-[11px] font-bold text-[#D9822B]">
                        {h.subtitle}
                      </p>
                      <p className="text-xs text-[#6B6355] leading-relaxed line-clamp-4">
                        {h.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EBE1D0] mt-3">
                      <div className="text-[11px] text-[#4A4336] flex items-center gap-1.5 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0" />
                        <span>{h.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. BỘ LỌC TABS & DANH SÁCH DI TÍCH, CHÙA CHIỀNG, LỄ HỘI ─────────── */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26221B]/10 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26221B] font-display flex items-center gap-2.5">
                <Landmark className="w-7 h-7 text-[#0E8C7F]" />
                <span>Không Gian Văn Hóa & Địa Điểm Thực Địa ({filteredCultures.length} Điểm)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6355] mt-1">
                Khám phá hệ thống 37 ngôi chùa tháp Nam Tông, di tích lịch sử quốc gia, sân đua bò và làng nghề truyền thống
              </p>
            </div>

            {/* Filter Tabs (Folk-Modern Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "ALL", label: "Tất Cả" },
                { id: "FESTIVAL", label: "Lễ Hội & Sân Đua Bò" },
                { id: "PAGODA", label: "Chùa Khmer Cổ Kính" },
                { id: "HISTORY", label: "Di Tích Lịch Sử" },
                { id: "CRAFT", label: "Làng Nghề & Di Sản" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    selectedTab === tab.id
                      ? "bg-[#0E8C7F] text-white shadow-md"
                      : "bg-[#FFFDF7] text-[#6B6355] hover:bg-[#FAF3E7] hover:text-[#26221B] border border-[#EBE1D0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#6B6355] font-bold text-sm">
              Đang tải dữ liệu không gian văn hóa thực địa...
            </div>
          ) : filteredCultures.length === 0 ? (
            <div className="py-16 text-center text-[#6B6355] bg-[#FFFDF7] rounded-[26px] border border-dashed border-[#EBE1D0] p-8">
              <p className="font-bold text-sm">Chưa tìm thấy địa điểm phù hợp trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredCultures.map((culture) => (
                <div
                  key={culture.id}
                  className="group bg-[#FFFDF7] rounded-[26px] overflow-hidden border border-[#EBE1D0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* 4:3 Image Cover */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(culture.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={culture.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Category Chip */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#151B34]/80 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs border border-white/20 shadow-sm">
                        {culture.tourism_category}
                      </div>
                      
                      {/* Rating Chip */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[#26221B] font-extrabold text-[11px] shadow-md">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{culture.rating}</span>
                      </div>

                      {/* Commune Pin on bottom */}
                      <div className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#F26B3A]" />
                        <span>{culture.commune}</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2 text-xs">
                      <h3 className="font-display text-sm sm:text-base font-extrabold text-[#26221B] group-hover:text-[#0E8C7F] transition-colors line-clamp-1">
                        {culture.name}
                      </h3>

                      {culture.description && (
                        <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                          {culture.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Bottom */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#EBE1D0]/60 mt-1 flex items-center justify-between gap-2">
                    <Link
                      href={`/places/${culture.slug || culture.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#0B6B60] text-white text-center font-bold text-xs transition-all shadow-xs"
                    >
                      Xem Chi Tiết
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(culture.name + " " + culture.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-[#FAF3E7] hover:bg-[#F0A32F]/20 text-[#26221B] border border-[#EBE1D0] transition-colors shrink-0"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-4 h-4 text-[#0E8C7F]" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
