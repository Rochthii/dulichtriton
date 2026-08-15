"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Landmark, MapPin, Calendar, Compass, Clock, Star, Sparkles, ChevronRight, 
  Award, ShieldCheck, Flame, Navigation, BookOpen, Music, Layers, Eye, MessageSquareText
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
    location: "Sân Đua Bò Tà Pạ - Soài Chek (Xã Núi Tô), Chùa Rô (Xã Châu Lăng) & Cái Nôi Chùa Tà Miệt (Xã Lương Phi)",
    tag: "Di Sản Quốc Gia",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    desc: "Hội thi đua bò kịch tính và độc nhất vô nhị vùng Bảy Núi trên bãi bùn lầy, khởi nguồn từ tập tục cày ruộng chùa Tà Miệt gắn liền với lễ cúng ông bà Dolta thiêng liêng.",
    highlights: ["Màn so tài thần tốc 'tạt bùn rẽ sóng' tại Sân Tà Pạ - Soài Chek", "Điệu múa trống Chhay-dăm rộn rã", "Cái nôi cội nguồn tại Chùa Tà Miệt (Xã Lương Phi)"]
  },
  {
    id: "fest-chol-chnam-thmay",
    name: "Tết Cổ Truyền Chôl Chnăm Thmây",
    time: "13 - 16 Tháng 4 Dương Lịch Hàng Năm",
    location: "Khắp các chùa Khmer: Wat Xvayton, Chùa Tà Pạ, Chùa Hàng Còng, Chùa Mới Ô Lâm",
    tag: "Tết Cổ Truyền",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    desc: "Tết mừng năm mới rực rỡ sắc màu, nghi thức rước Đại lịch Maha Sangkran, đắp núi cát cầu phúc và lễ tắm Phật trang trọng.",
    highlights: ["Lễ Đắp Núi Cát (Poun Phnum Khsach)", "Tắm Phật bằng nước thơm hoa lài", "Vòng múa Răm-vông (Lâm-thôn) thâu đêm"]
  },
  {
    id: "fest-ok-om-bok",
    name: "Lễ Hội Cúng Trăng Ok Om Bok & Thả Đèn Gió",
    time: "Đêm Rằm Tháng 10 Âm Lịch (Khoảng Tháng 11)",
    location: "Khuôn viên chùa Khmer, Hồ Tà Pạ, Hồ Ô Thum",
    tag: "Lễ Hội Văn Hóa",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    desc: "Tạ ơn Thần Mặt Trăng ban mùa màng tốt tươi với nghi thức đút Cốm Dẹp (Ombok) cho trẻ nhỏ và thả đèn gió bay rực sáng bầu trời đêm Thất Sơn.",
    highlights: ["Nghi thức đút Cốm Dẹp ước nguyện", "Thả Đèn Gió (Khom Khsach) khổng lồ", "Hoa đăng thả trôi lấp lánh mặt hồ"]
  },
  {
    id: "fest-kathina",
    name: "Đại Lễ Dâng Y Kathina & Diễu Hành Nhạc Ngũ Âm",
    time: "Rằm Tháng 9 Đến Rằm Tháng 10 Âm Lịch",
    location: "Các Chùa Phật Giáo Nam Tông Khmer Tri Tôn",
    tag: "Đại Lễ Phật Giáo",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Đại lễ dâng y cà-sa và tứ vật dụng cho chư tăng sau 3 tháng An Cư Kiết Hạ, diễu hành rực rỡ với Dàn nhạc Ngũ Âm (Pinpeat) và múa Chhay-dăm.",
    highlights: ["Hòa tấu Dàn nhạc Ngũ Âm (Pinpeat)", "Đoàn rước cúng y quanh phum sóc", "Trang phục Sampot truyền thống lộng lẫy"]
  },
  {
    id: "fest-balloon",
    name: "Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn",
    time: "Dịp Lễ 30/4 - 1/5 & Quốc Khánh 2/9",
    location: "Quảng Trường TT. Tri Tôn & KDL Đồi Tức Dụp",
    tag: "Lễ Hội Hiện Đại",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    desc: "Trải nghiệm ngắm toàn cảnh cánh đồng Tà Pạ và dãy Thất Sơn hùng vĩ từ khinh khí cầu, mãn nhãn với các màn bay dù lượn Paramotor xả khói màu.",
    highlights: ["Bay khinh khí cầu ngắm núi Cô Tô", "Trình diễn dù lượn động cơ", "Đêm hội hoa đăng khinh khí cầu lung linh"]
  }
];

const HERITAGE_STORIES = [
  {
    id: "la-buong",
    title: "Kinh Lá Buông (Satra Slarkrit)",
    subtitle: "Di Sản Văn Hóa Phi Vật Thể Quốc Gia Độc Bản",
    location: "Chùa Xvayton (Wat Xvayton), TT. Tri Tôn",
    icon: BookOpen,
    desc: "Kho tàng tri thức phật giáo, văn hóa và y học cổ truyền Khmer được khắc tỉ mỉ bằng kim sắt trên lá cây buông/lá thốt nốt, quét tro than và dầu cây trai lưu giữ hàng trăm năm không mục rữa.",
    tag: "Chùa Xà Tón"
  },
  {
    id: "pinpeat",
    title: "Dàn Nhạc Ngũ Âm & Múa Dân Gian",
    subtitle: "Linh Hồn Diễn Xướng Chùa Tháp Nam Tông",
    location: "Các Chùa Khmer & Nhà Trưng Bày Văn Hóa Tri Tôn",
    icon: Music,
    desc: "Hệ thống 5 chất liệu âm thanh (Đồng, Sắt, Gỗ, Da, Hơi) với đàn Roneat-Ek, dàn cồng Kong-Vong hòa cùng điệu múa Răm-vông và kịch hát Dù Kê (Robam) trong mọi dịp lễ hội.",
    tag: "Diễn Xướng Dân Gian"
  },
  {
    id: "tho-cam",
    title: "Làng Dệt Thổ Cẩm & Khăn Krama",
    subtitle: "Nghề Thủ Công Tinh Xảo Khung Cửi Gỗ",
    location: "Xã Châu Lăng, Tri Tôn",
    icon: Layers,
    desc: "Nghề dệt tay truyền thống tạo ra những chiếc khăn rằn Krama, xà-rông hoa văn Thất Sơn với màu nhuộm tự nhiên từ lá cây rừng Bảy Núi.",
    tag: "Làng Nghề Thủ Công"
  },
  {
    id: "gom-ca-rang",
    title: "Lò Gốm Bếp Cà-Ràng & Nồi Đất Nung",
    subtitle: "Kỹ Thuật Nặn Tay Không Dùng Bàn Xoay",
    location: "Xã Ô Lâm, Tri Tôn",
    icon: Flame,
    desc: "Nặn gốm thủ công mộc mạc từ đất sét Thất Sơn, nung lộ thiên bằng rơm rạ tạo nên chiếc bếp cà-ràng hình số 3 và nồi niêu đất nấu gà đốt Ô Thum nổi tiếng.",
    tag: "Gốm Cổ Truyền"
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
          "client-culture-catalog-v2",
          async () => {
            const res = await fetch("/api/v1/culture?limit=100");
            return await res.json();
          },
          60 * 60 * 1000,
          (freshJson) => {
            processCultureData(freshJson);
          }
        );

        processCultureData(json);
      } catch (err) {
        console.warn("API fetch failed, using local master:", err);
        fallbackToLocalMaster();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToLocalMaster() {
      const list = (localMasterPois as any[])
        .filter(
          (p) =>
            p.category === "culture" ||
            p.category === "spiritual" ||
            p.category === "history" ||
            (p.tourism_category && (p.tourism_category.includes("Văn Hóa") || p.tourism_category.includes("Di Tích") || p.tourism_category.includes("Chùa") || p.tourism_category.includes("Lễ Hội"))) ||
            (p.id && (p.id.startsWith("CH") || p.id.startsWith("DT") || p.id.startsWith("VH") || p.id.startsWith("san-dua-bo")))
        )
        .map((p) => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          category: p.category || "culture",
          tourism_category: p.tourism_category || "Văn Hóa & Di Tích",
          commune: p.commune || "Thị trấn Tri Tôn",
          rating: p.rating ? Number(p.rating) : 4.9,
          image_url: p.image_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
          description: p.description || "",
          detailed_story: p.detailed_story || "",
          is_hot: !!p.is_hot || (p.rating && p.rating >= 4.8),
        }));

      setCultures(list);
    }

    loadLiveCultureData();
  }, []);

  const filteredCultures = useMemo(() => {
    if (selectedTab === "ALL") return cultures;
    if (selectedTab === "FESTIVAL") {
      return cultures.filter(c => 
        c.category === "culture" || 
        c.tourism_category.toLowerCase().includes("lễ hội") || 
        c.name.toLowerCase().includes("đua bò") ||
        c.name.toLowerCase().includes("sân đua") ||
        c.name.toLowerCase().includes("cổng trời")
      );
    }
    if (selectedTab === "PAGODA") {
      return cultures.filter(c => 
        c.category === "spiritual" || 
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

  const topHotCultures = useMemo(() => {
    return cultures.slice(0, 4);
  }, [cultures]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-10 px-4 py-8 md:px-6 md:py-10">
        
        {/* ── 1. HEADER HERO BANNER ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E8C7F] via-[#0B6B60] to-[#084D45] p-6 text-white shadow-xl md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3.5 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display border border-[#FFD37A]/30">
              <Landmark className="h-3.5 w-3.5" />
              <span>Văn Hóa & Lễ Hội Bảy Núi — Tri Tôn, An Giang</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Di Sản Văn Hóa & Lễ Hội Bảy Núi
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed font-body">
              Khám phá vùng đất Thất Sơn huyền tích với <strong>Lễ hội Đua Bò Bảy Núi</strong> di sản quốc gia, <strong>Kinh Lá Buông</strong> cổ bản, <strong>37 ngôi chùa Phật giáo Nam Tông Khmer</strong> cổ kính và các <strong>làng nghề dệt thổ cẩm, gốm đất nung</strong> trăm tuổi.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href="#le-hoi-section"
                className="px-4 py-2 rounded-xl bg-[#FFD37A] hover:bg-[#F26B3A] text-[#26221B] hover:text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Xem Lịch Lễ Hội 4 Mùa</span>
              </a>
              <a 
                href="#di-san-section"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Di Sản & Làng Nghề</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. LỊCH 5 ĐẠI LỄ HỘI BẢY NÚI (FESTIVAL CALENDAR TIMELINE) ──────── */}
        <section id="le-hoi-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                <Calendar className="w-4 h-4 text-[#F26B3A]" />
                <span>Hội Xuân & Lễ Hội Dân Gian</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-0.5">
                Lịch 5 Đại Lễ Hội Truyền Thống Tri Tôn
              </h2>
            </div>
            <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 w-fit">
              Diễn Ra Hàng Năm Theo Mùa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FESTIVALS_DATA.map((fest) => (
              <div 
                key={fest.id}
                className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl p-5 border border-[#26221B]/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${fest.badgeColor}`}>
                      {fest.tag}
                    </span>
                    <span className="text-[11px] font-bold text-[#0E8C7F] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fest.time}
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-black text-[#26221B] group-hover:text-[#0E8C7F] transition-colors leading-snug">
                    {fest.name}
                  </h3>

                  <p className="text-xs text-[#6B6355] leading-relaxed">
                    {fest.desc}
                  </p>

                  <div className="pt-2 border-t border-[#26221B]/5 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
                      <span className="truncate">{fest.location}</span>
                    </div>
                    <ul className="space-y-1 text-[10px] sm:text-[11px] text-[#4A4336]">
                      {fest.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    href={`/chat?q=${encodeURIComponent(`Hãy kể chi tiết về ${fest.name} ở Tri Tôn: thời gian, địa điểm, nghi thức và kinh nghiệm đi xem`)}`}
                    className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-[#0E8C7F] text-[#0E8C7F] hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#0E8C7F]/20"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>Hỏi AI Về Lễ Hội Này</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. KHÁM PHÁ DI SẢN PHI VẬT THỂ & LÀNG NGHỀ TRĂM TUỔI ──────────── */}
        <section id="di-san-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0E8C7F] uppercase tracking-wider font-display">
                <Sparkles className="w-4 h-4 text-[#0E8C7F]" />
                <span>Bảo Tồn Bản Sắc Dân Tộc</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-0.5">
                Bảo Vật Quốc Gia & Tinh Hoa Làng Nghề
              </h2>
            </div>
            <span className="text-xs font-bold text-[#6B6355] hidden sm:inline">
              4 Di Sản Đặc Trưng Nhất
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HERITAGE_STORIES.map((h) => {
              const Icon = h.icon;
              return (
                <div 
                  key={h.id}
                  className="bg-[#FFFDF7] rounded-2xl sm:rounded-3xl p-5 border border-[#26221B]/10 shadow-xs hover:border-[#0E8C7F]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F] flex items-center justify-center mb-1">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-[#F26B3A] uppercase tracking-wider">
                      {h.tag}
                    </span>
                    <h3 className="font-display text-base font-extrabold text-[#26221B] leading-tight">
                      {h.title}
                    </h3>
                    <p className="text-[11px] font-bold text-[#0E8C7F]">
                      {h.subtitle}
                    </p>
                    <p className="text-xs text-[#6B6355] leading-relaxed line-clamp-4">
                      {h.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#26221B]/5 mt-3">
                    <div className="text-[11px] text-[#4A4336] flex items-center gap-1 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0" />
                      <span>{h.location}</span>
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
              <h2 className="text-xl sm:text-2xl font-black text-[#26221B] font-display flex items-center gap-2">
                <Landmark className="w-6 h-6 text-[#0E8C7F]" />
                <span>Không Gian Văn Hóa & Địa Điểm Thực Địa ({filteredCultures.length} Điểm)</span>
              </h2>
              <p className="text-xs text-[#6B6355] mt-1">
                Khám phá hệ thống di tích lịch sử, chùa tháp Khmer, sân đua bò và làng nghề thủ công tại các xã
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    selectedTab === tab.id
                      ? "bg-[#0E8C7F] text-white shadow-xs"
                      : "bg-[#FFFDF7] text-[#6B6355] hover:bg-slate-100 border border-[#26221B]/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold text-sm">
              Đang tải danh mục di tích văn hóa thực địa...
            </div>
          ) : filteredCultures.length === 0 ? (
            <div className="py-12 text-center text-[#6B6355] bg-[#FFFDF7] rounded-3xl border border-dashed border-[#26221B]/15 p-8">
              <p className="font-bold text-sm">Chưa tìm thấy địa điểm phù hợp trong mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredCultures.map((culture) => (
                <div
                  key={culture.id}
                  className="group bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#26221B]/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-32 sm:h-52 overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(culture.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={culture.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-[9px] sm:text-xs">
                        {culture.tourism_category}
                      </div>
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/90 text-amber-600 font-extrabold text-[10px] sm:text-[11px] shadow-sm">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
                        {culture.rating}
                      </div>
                    </div>

                    <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{culture.commune}</span>
                      </div>

                      <h3 className="font-display text-xs sm:text-base font-extrabold text-[#26221B] group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {culture.name}
                      </h3>

                      {culture.description && (
                        <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                          {culture.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 pt-0 border-t border-[#26221B]/5 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${culture.slug || culture.id}`}
                      className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-center font-bold text-[10px] sm:text-xs transition-colors shadow-xs"
                    >
                      Xem Chi Tiết
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(culture.name + " " + culture.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors shrink-0"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
