"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchWithCache } from "@/lib/fastCache";
import HotPlacesSection from "@/components/HotPlacesSection";
import TikTokFeedSection from "@/components/TikTokFeedSection";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import MiniGisMapBanner from "@/components/MiniGisMapBanner";
import {
  Search,
  Mountain,
  Utensils,
  MapPin,
  Camera,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Bot,
  Compass,
  Landmark,
  Sparkles,
  PhoneCall,
  Calendar,
  CloudSun,
  ShieldCheck,
  X,
  Clock,
  ExternalLink,
  Map,
  CheckCircle,
  Heart,
  Zap,
  Hotel,
  Trophy,
  Flame,
  Coffee,
  Navigation
} from "lucide-react";

interface Place {
  id: string;
  slug: string;
  name: string;
  category: string;
  commune: string;
  rating?: number;
  image_url?: string;
}

interface TikTokVideo {
  id: string;
  title: string;
  stat: string;
  author: string;
  videoUrl: string;
  img: string;
  summary: string;
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Danh Thắng & Tâm Linh");
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [gourmetFoods, setGourmetFoods] = useState<any[]>([]);
  const [cultureEvents, setCultureEvents] = useState<any[]>([]);
  const [featuredStays, setFeaturedStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);

  const categories = [
    { label: "Danh Thắng & Tâm Linh", icon: Mountain },
    { label: "Ẩm Thực Đặc Sản", icon: Utensils },
    { label: "Văn Hóa Khmer", icon: Landmark },
    { label: "Check-in & Sinh Thái", icon: Camera },
  ];

  useEffect(() => {
    async function loadLiveData() {
      try {
        setLoading(true);

        // 1. Fetch Hot Places with fastCache
        const formattedHotPlaces = await fetchWithCache("homepage-hot-places", async () => {
          const { data: hotData } = await supabase
            .from("places")
            .select("id, slug, name, category, commune, rating, photos, image_url, video_url, is_hot, hot_rank, golden_time_windows")
            .order("is_hot", { ascending: false })
            .order("hot_rank", { ascending: true })
            .limit(12);

          if (hotData && hotData.length > 0) {
            return hotData.map((item: any) => {
              let img = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop";
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
                category: item.category || "Du lịch Bảy Núi",
                commune: item.commune || "Tri Tôn",
                rating: item.rating || 4.8,
                is_hot: item.is_hot || false,
                hot_rank: item.hot_rank || 99,
                golden_time_windows: item.golden_time_windows || [],
                image_url: img,
                video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`
              };
            });
          }
          return [];
        });

        if (formattedHotPlaces && formattedHotPlaces.length > 0) {
          setPlaces(formattedHotPlaces);
        }

        // 2. Fetch Gourmet Foods live from Supabase with fastCache
        const formattedFoods = await fetchWithCache("homepage-gourmet-foods", async () => {
          const { data: foodData } = await supabase
            .from("places")
            .select("id, slug, name, commune, rating, photos, image_url, category")
            .ilike("category", "%Ẩm thực%")
            .limit(4);

          if (foodData && foodData.length > 0) {
            return foodData.map((f: any) => ({
              name: f.name,
              location: f.commune || "Tri Tôn",
              price: "35.000đ - 150.000đ",
              flavorTag: f.category || "Đặc sản Bảy Núi",
              rating: f.rating || 4.9,
              slug: f.slug || f.id,
              img: f.image_url || (Array.isArray(f.photos) && f.photos[0]?.url) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
            }));
          }
          return null;
        });

        if (formattedFoods && formattedFoods.length > 0) {
          setGourmetFoods(formattedFoods);
        } else {
          setGourmetFoods([
            {
              name: "Cháo Bò Trái Trúc",
              location: "Thị trấn Tri Tôn & Xã Châu Lăng",
              price: "35.000đ - 55.000đ",
              flavorTag: "Chua dịu, béo nhẹ, thơm nồng lá trúc",
              rating: 4.9,
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkHUDKiIJE4KJWt-00IzsRQDsKl5vybNI3P9LIGOjuRMdjrJdhiUH5dOucUHcg-zW-umlBu-mSWAsGVjE0n8H8jYDsKtcmyQQvogwqey9foKt3C1bb7nNGvC7-Kirf-csJPIMgIVc8gUAYmaT0QDsKy7v4VH7QbOofMDn8b4viEqW3cWXy5bawuYPjdKiMTRamLLDtFXWVhAQ653wbJsFgvYCxz3Kb3tHvnCyUagVBrZ27cZrEvz-I8g"
            },
            {
              name: "Gà Đốt Ô Thum Lá Trúc",
              location: "Xã Ô Lâm (Bờ hồ Ô Thum)",
              price: "250.000đ - 320.000đ",
              flavorTag: "Da giòn rụm, thịt ngọt lịm, dậy mùi sả trúc",
              rating: 4.95,
              img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
            },
            {
              name: "Bánh Xèo Rau Rừng Thiền Viện",
              location: "Thị trấn Tri Tôn",
              price: "30.000đ - 50.000đ",
              flavorTag: "Giòn rụm, kèm 20 loại rau rừng thiên nhiên Cô Tô",
              rating: 4.8,
              img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"
            },
            {
              name: "Bò Nướng Kim Tiền & Nầm Nướng Tà Pạ",
              location: "Xã Núi Tô",
              price: "80.000đ - 150.000đ",
              flavorTag: "Đậm đà, béo ngậy nướng than hồng",
              rating: 4.85,
              img: "https://images.unsplash.com/photo-1544025162-d76694265947"
            }
          ]);
        }

        // 3. Culture Events Initializer
        setCultureEvents([
          {
            name: "Lễ Hội Đua Bò Bảy Núi (Sene Dolta)",
            time: "Tháng 8 - Tháng 9 Âm Lịch",
            location: "Chùa Thơm Mít (Xã Vĩnh Trung)",
            status: "Sắp diễn ra",
            desc: "Lễ hội thể thao dân gian độc nhất vô nhị miền Tây, quy tụ hàng trăm đôi bò chiến tranh tài khốc liệt.",
            badgeColor: "bg-rose-500 text-white"
          },
          {
            name: "Chùa Xvayton (Chùa Xà Tón) 500 Tuổi",
            time: "Mở cửa quanh năm",
            location: "Thị trấn Tri Tôn",
            status: "Di sản Quốc gia",
            desc: "Ngôi chùa Khmer cổ nhất An Giang mang kiến trúc tháp nhọn rực rỡ và nơi lưu giữ kinh lá buông quý hiếm.",
            badgeColor: "bg-amber-500 text-white"
          },
          {
            name: "Tết Chol Chnam Thmay Khmer",
            time: "14/04 - 16/04 Hàng Năm",
            location: "Toàn bộ các Xã/Thị trấn Tri Tôn",
            status: "Tết Truyền Thống",
            desc: "Lễ hội mừng năm mới rộn ràng nghi thức đắp núi cát, tắm Phật và múa mâm khèn Chhay-dăm.",
            badgeColor: "bg-emerald-600 text-white"
          }
        ]);

        // 4. Featured Stays Initializer
        setFeaturedStays([
          {
            name: "Soài Chek Eco Homestay",
            location: "Xã Núi Tô",
            price: "350.000đ / đêm",
            view: "View Hồ Tà Pạ & Cánh đồng lúa",
            rating: 4.9,
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEZigADSpj84ieydADEOQHzdJZkN0zsctfaByCdnhe7Kptx1Rh3rpQPiK_hjkkL8vcmOG_-QNX9DqegPHEImIum516b2ArKqeKj_Vbp100cfGcbYNgqKDSGzFPxRW0_JVid0sV9Cn7iq3iDqYedl_zXYdczxg_yNfXTv7mVYhB7Q7iYVr0Au6Gnca0TseXgBfR-tcZ93cZSXI4kPrWVLj7_bPRI6BrolBWKhcxcdwLrQlroi3tOWw7Iw"
          },
          {
            name: "Cô Tô View Farmstay",
            location: "Xã Cô Tô",
            price: "450.000đ / đêm",
            view: "Sát chân núi Phụng Hoàng Sơn",
            rating: 4.85,
            img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739"
          },
          {
            name: "Khách Sạn Sang Nhân Tri Tôn",
            location: "Thị trấn Tri Tôn",
            price: "280.000đ / đêm",
            view: "Trung tâm Thị trấn sầm uất",
            rating: 4.7,
            img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
          }
        ]);

      } catch (err) {
        console.error("Supabase live load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveData();
  }, []);

  const tiktokVideos: TikTokVideo[] = [
    {
      id: "v1",
      title: "Check-in Hồ Tà Pạ mùa nước xanh ngọc",
      stat: "12.4K views",
      author: "@TriTonVlog",
      videoUrl: "https://www.tiktok.com",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6V1-spJq0jknj9Xm7mw5tUkHHq_yUjyrF3H91G0yVH89SZV5p1Fav4obUXN6BKPjuT2RxuI2e4Ch9tLL_Fxwk9uQZG3TnbvwcHHmVeSVqlNUSVV5dV5t3jbTL7yk2YjMqQsPXI78C4JqflK9D3IVsIBsOVA11gfqRB8DBNCPqAAIaWHjiptwA-AJ55qT5b11pOZdmCYph2kEWNn-npd-hOxtaTsbb2ecqJsvUCqzUvIMnpnzMUCW7-w",
      summary: "Kinh nghiệm chụp ảnh Hồ Tà Pạ mùa nước xanh biếc, thời gian đẹp nhất 7h30 sáng khi mặt trời chiếu xuống hồ đá."
    },
    {
      id: "v2",
      title: "Thưởng thức Cháo bò & Bánh xèo rau rừng",
      stat: "45.8K views",
      author: "@AnGiangFoodie",
      videoUrl: "https://www.tiktok.com",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIkJnw4r7I1PTW0hftH6IPFjeI22_qtAKnBpDc2y-RuYr47yCD04mnlx-as03zRqDPnYkrIoabvkIv4GIN5QVDB46QzzrADXSv_Hk75GNPk2RlnVbcyKTUkwPFhx8pMpbd7B6NG-LSthuf2IYx5ys65lG0hoR3BlZOj0kxhdL9PWNc7tUn_QMiKPm6eaaX8-588Eo3kAouiHtXLtD85jiIyFo6aw1mzaYe_iUd3t9kjFZWSP5T-Trx8w",
      summary: "Review chi tiết quán Cháo bò trái trúc Rô 31 nổi tiếng nhất Thị trấn Tri Tôn và bánh xèo rau rừng Bảy Núi."
    },
    {
      id: "v3",
      title: "Chinh phục đỉnh núi Cô Tô 614m",
      stat: "89.2K views",
      author: "@PhuotBayNui",
      videoUrl: "https://www.tiktok.com",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      summary: "Hành trình phượt núi Cô Tô ngắm toàn cảnh cánh đồng lúa Tri Tôn và check-in biểu tượng chữ Tri Tôn khổng lồ."
    },
    {
      id: "v4",
      title: "Lễ hội Đua bò Bảy Núi rộn ràng",
      stat: "120.5K views",
      author: "@CultureVn",
      videoUrl: "https://www.tiktok.com",
      img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
      summary: "Không khí sôi động nghẹt thở tại Lễ hội Đua bò Bảy Núi truyền thống dịp lễ Sene Dolta của đồng bào Khmer."
    },
    {
      id: "v5",
      title: "Thử Gà đốt Ô Thum lá trúc giòn thơm",
      stat: "67.1K views",
      author: "@AmThucMienTay",
      videoUrl: "https://www.tiktok.com",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      summary: "Trải nghiệm món gà đốt Ô Thum lá trúc trứ danh thơm phức ăn kèm xôi phồng bên bờ hồ Ô Thum thơ mộng."
    },
    {
      id: "v6",
      title: "Tham quan Chùa Xvayton 500 năm tuổi",
      stat: "34.9K views",
      author: "@DiSanViet",
      videoUrl: "https://www.tiktok.com",
      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
      summary: "Chiêm bái ngôi chùa Khmer lâu đời nhất An Giang với kiến trúc Phật giáo Nam tông độc đáo bậc nhất."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-base text-on-surface antialiased">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col gap-6 sm:gap-8 md:gap-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Hero Section nổi bật với ảnh cảnh quan Bảy Núi */}
        <section className="group relative min-h-[400px] sm:h-[480px] md:h-[520px] w-full overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://cdn.tgdd.vn/Files/2023/11/06/1554179/top-8-dia-diem-du-lich-tri-ton-an-giang-nen-trai-nghiem-202311061412586340.jpg')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />

          <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-8 text-center space-y-4 sm:space-y-6 w-full max-w-4xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-extrabold border border-white/30 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Cổng Thông Tin Du Lịch Thông Minh Tri Tôn</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-2xl">
              Khám Phá Vẻ Đẹp <br className="hidden sm:inline" />
              <span className="text-amber-300 drop-shadow-md">
                Huyền Bí Bảy Núi Tri Tôn
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-100 max-w-2xl font-medium drop-shadow-md hidden sm:block">
              Nơi miền đất của 82 thắng cảnh tuyệt đẹp, di sản tâm linh Khmer lâu đời và bản đồ ẩm thực Cháo bò lá trúc độc đáo.
            </p>

            <SearchAutocomplete />
          </div>
        </section>

        {/* Dynamic Top 3 Hot Places Section */}
        <HotPlacesSection
          limit={3}
          title="🔥 TOP 3 ĐỊA ĐIỂM HOT NỔI TIẾNG NHẤT"
          subtitle="Top 3 điểm check-in, di sản & thắng cảnh Bảy Núi được du khách săn đón nhất"
        />

        {/* SECTION 2: TIKTOK REELS SHOWCASE */}
        <section className="flex flex-col gap-4">
          <TikTokFeedSection variant="grid" maxSlides={4} showTitle={true} />
        </section>

        {/* Danh mục nổi bật (Quick Filter Category Mobile Swipe) */}
        <section className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
              Danh Mục Nổi Bật
            </h2>
            <span className="text-[11px] font-bold text-slate-400 sm:hidden">Vuốt chọn ➔</span>
          </div>

          <div className="flex overflow-x-auto gap-2.5 pb-1 pt-1 scrollbar-none snap-x sm:flex-wrap">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={
                  activeCategory === label
                    ? "flex items-center gap-2 rounded-full bg-[#1B4D3E] px-4 sm:px-5 py-2.5 font-bold text-xs sm:text-sm text-white shadow-md transition-all shrink-0 snap-start active:scale-95 border border-[#D99B26]/40"
                    : "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 sm:px-5 py-2.5 font-semibold text-xs sm:text-sm text-slate-700 transition-all hover:bg-emerald-50 hover:text-[#1B4D3E] shrink-0 snap-start active:scale-95"
                }
              >
                <Icon className="h-4 w-4 text-[#D99B26]" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* TỐI ƯU SECTION 1: BẢN ĐỒ VỊ GIÁC ẨM THỰC BẢY NÚI */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> Bản Đồ Vị Giác Bảy Núi
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Tinh Hoa Ẩm Thực Đặc Sản Tri Tôn
              </h2>
            </div>
            <Link
              href="/food"
              className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors shrink-0"
            >
              <span>Tất cả</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 scrollbar-none touch-pan-x sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {gourmetFoods.map((item, idx) => (
              <div
                key={idx}
                className="snap-start shrink-0 w-[85vw] max-w-[310px] sm:w-auto sm:max-w-none bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 sm:h-48 w-full bg-slate-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block line-clamp-1">
                      {item.flavorTag}
                    </p>
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.price}</span>
                  <Link href="/food" className="text-xs font-bold text-[#1B4D3E] hover:underline flex items-center gap-0.5">
                    <span>Địa chỉ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: VĂN HÓA & LỄ HỘI KHMER */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between border-b border-emerald-200/80 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-500" /> Di Sản Phi Vật Thể Độc Đáo
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Văn Hóa & Lễ Hội Khmer Sôi Động
              </h2>
            </div>
            <Link
              href="/culture"
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors shrink-0"
            >
              <span>Tất cả</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 scrollbar-none touch-pan-x md:grid md:grid-cols-3 md:overflow-visible">
            {cultureEvents.map((ev, idx) => (
              <div
                key={idx}
                className="snap-start shrink-0 w-[85vw] max-w-[310px] md:w-auto md:max-w-none bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        idx === 0
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuA0a_ShvHqoLBzzQeBZPBVukoFsxHkKwXzcTE2T6K_xPyk67rYycDNJbkuK17L9mWsVhNHt61xA_rUHEZVNHKRhdP_2FifG80aCCtsRoh5M6AnzI1M0-Ph_03-SGI5d3LxCK8Tci5VwUmdtgQTARcov5Z1dut3OWHedU55-M9Smk9jgkYBSvoqmN9XIH3zKtZx8pZY9PYDY29mHsuXs8YFP921mu6oTsHeKkO9mBiIH2Z3DCkVCnXsbsg"
                          : idx === 1
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCIkt4mKcSMtN9qwWrnCavUNbd04V9-GYHPHeebFZyKXuiRnw6MUL1Qw2bsIsFB9nvNb4nwM87r5AbatwHdBlVeQ6ENzVwUmrHSBEYkmJ-cjCHYFjZRl6fz6VwL9RqMKrXt9pUigCmz71KjXxWSbsdcL3WCIX30VH8iXFopWhWSndEEy2G6dEqkpAdYMEoHcl-n0bTUj6Z7O50iAwa7xx_6bYi5N00srNzVSwgRc_6FXYAO_50JqasE4w"
                          : "https://images.unsplash.com/photo-1540555700478-4be289fbecef"
                      }
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-sm bg-white/90 backdrop-blur-md">
                      <span className={ev.status === "Sắp diễn ra" ? "text-rose-600 font-extrabold" : ev.status === "Di sản Quốc gia" ? "text-amber-600 font-extrabold" : "text-emerald-700 font-extrabold"}>
                        {ev.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-300 font-bold text-[11px]">
                      <Calendar className="h-3 w-3 text-amber-300" />
                      {ev.time}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-light line-clamp-2">
                      {ev.desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between pt-3">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </span>
                  <Link href="/culture" className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-0.5 shrink-0">
                    <span>Xem thêm</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TỐI ƯU SECTION 5: BẢN ĐỒ SỐ TƯƠNG TÁC THU NHỎ (MINI LIVE GIS MAP BANNER) */}
        <MiniGisMapBanner />

        {/* Hotline Emergency Support Banner (Mobile Touch Optimized) */}
        <section className="rounded-3xl bg-slate-900 text-white p-5 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Hỗ Trợ Du Khách 24/7
            </span>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Cần Hỗ Trợ Đường Đi Hoặc Sự Cố Du Lịch?
            </h3>
            <p className="text-xs text-slate-300">
              Đội ngũ Công an và Cấp cứu Tri Tôn túc trực 24/7 hỗ trợ an toàn cho du khách.
            </p>
          </div>
          <Link
            href="/emergency"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all shrink-0 active:scale-95 min-h-[44px]"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Gọi Cứu Hộ Khẩn Cấp</span>
          </Link>
        </section>

      </main>

      {/* Interactive Pop-up Modal for TikTok Video */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-4 p-6">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[9/16] max-h-[350px] rounded-2xl overflow-hidden bg-slate-900 mx-auto">
              <img
                src={selectedVideo.img}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="h-16 w-16 text-white/90 fill-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">{selectedVideo.author}</span>
                <span className="text-xs font-semibold text-slate-400">{selectedVideo.stat}</span>
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                {selectedVideo.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedVideo.summary}
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedVideo(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
              <a
                href={selectedVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Xem trên TikTok</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
