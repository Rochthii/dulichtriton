"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import GoldenTimeWidget from "@/components/GoldenTimeWidget";
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
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);

  const categories = [
    { label: "Danh Thắng & Tâm Linh", icon: Mountain },
    { label: "Ẩm Thực Đặc Sản", icon: Utensils },
    { label: "Văn Hóa Khmer", icon: Landmark },
    { label: "Check-in & Sinh Thái", icon: Camera },
  ];

  useEffect(() => {
    async function loadLivePlaces() {
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, commune, rating, photos, image_url, video_url, is_hot, hot_rank, golden_time_windows")
          .order("is_hot", { ascending: false })
          .order("hot_rank", { ascending: true })
          .limit(12);

        if (!error && data && data.length > 0) {
          const formatted = data.map((item: any) => {
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
          setPlaces(formatted);
        } else {
          setPlaces([
            {
              id: "ho-ta-pa",
              slug: "ho-ta-pa",
              name: "Hồ Tà Pạ & Cánh Đồng Tà Pạ",
              category: "Check-in & Sinh Thái",
              commune: "Xã Núi Tô",
              rating: 5,
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzEBJmMN9MDBMXjMxP__-ZHcR4SsumjDwneLDOiMeMeEnxO5L4-OXzwn9OtdG-7P1gnd7zxD9cpALjSM2Ti_GScFrGSZmaSOTLBEjWyssKW2a_zyVT6uxtzDhGhlW-J1BH7WYuCSv7XEjhNSVpjWpILzIuSP4k4VBbUTyFSd5SPdfBz9jpuhRXHkXoyqd0fe8203OOVA2FouxJ4U81kV1ol1Yq--EAkhGhU5dI13wt71HUBMIGst8cSg"
            },
            {
              id: "nui-co-to",
              slug: "nui-co-to",
              name: "Núi Cô Tô (Phụng Hoàng Sơn)",
              category: "Danh Thắng & Tâm Linh",
              commune: "Xã Cô Tô",
              rating: 4.9,
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIfQS126DdHB1kTyw0TkOgz99UPxHcVeRJIXdV8I69Cgzcr7E4o1aFEoT0Hs1Kpz_CzJGWkd9t1TedFnug_SXUYNtlAt44DfkzOVO64MGPv48-6IIa0ORQLhlpjgH3gX-5Ahx9CjMJ8wGmPM7u-koH2AoQB9FBHrQ8ZwCyGzrw8oEHLhhzbOxZ8Y4oxONE3NK42x8adezc_hCHwQNaMv1LA9PaqfZQM7kIvdrmQqo-WnfyZI6JH4gJWg"
            },
            {
              id: "chua-thom-mit",
              slug: "chua-thom-mit",
              name: "Chùa Thơm Mít & Sân Đua Bò",
              category: "Văn Hóa Khmer",
              commune: "Xã Vĩnh Trung",
              rating: 5,
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0a_ShvHqoLBzzQeBZPBVukoFsxHkKwXzcTE2T6K_xPyk67rYycDNJbkuK17L9mWsVhNHt61xA_rUHEZVNHKRhdP_2FifG80aCCtsRoh5M6AnzI1M0-Ph_03-SGI5d3LxCK8Tci5VwUmdtgQTARcov5Z1dut3OWHedU55-M9Smk9jgkYBSvoqmN9XIH3zKtZx8pZY9DYDY29mHsuXs8YFP921mu6oTsHeKkO9mBiIH2Z3DCkVCnXsbsg"
            },
            {
              id: "chao-bo-tri-ton",
              slug: "chao-bo-tri-ton",
              name: "Cháo Bò Trái Trúc Đặc Sản",
              category: "Ẩm Thực Đặc Sản",
              commune: "Thị trấn Tri Tôn",
              rating: 4.8,
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkHUDKiIJE4KJWt-00IzsRQDsKl5vybNI3P9LIGOjuRMdjrJdhiUH5dOucUHcg-zW-umlBu-mSWAsGVjE0n8H8jYDsKtcmyQQvogwqey9foKt3C1bb7nNGvC7-Kirf-csJPIMgIVc8gUAYmaT0QDsKy7v4VH7QbOofMDn8b4viEqW3cWXy5bawuYPjdKiMTRamLLDtFXWVhAQ653wbJsFgvYCxz3Kb3tHvnCyUagVBrZ27cZrEvz-I8g"
            }
          ]);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLivePlaces();
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

  // SECTION 1 OPTIMIZATION: ẨM THỰC BẢN ĐỒ VỊ GIÁC (TASTE SHOWCASE)
  const gourmetFoods = [
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
  ];

  // SECTION 2 OPTIMIZATION: TIMELINE LỄ HỘI & VĂN HÓA KHMER
  const cultureEvents = [
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
  ];

  // SECTION 4 OPTIMIZATION: LƯU TRÚ & HOMESTAY VIEW NÚI
  const featuredStays = [
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
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-base text-on-surface antialiased">
      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-section-gap px-margin-mobile py-8 md:px-margin-desktop md:py-12">

        {/* Hero Section nổi bật với ảnh cảnh quan Bảy Núi */}
        <section className="group relative h-[420px] w-full overflow-hidden rounded-3xl shadow-xl md:h-[520px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://cdn.tgdd.vn/Files/2023/11/06/1554179/top-8-dia-diem-du-lich-tri-ton-an-giang-nen-trai-nghiem-202311061412586340.jpg')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-white/30 shadow-lg">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Cổng Thông Tin Du Lịch Thông Minh Tri Tôn</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight drop-shadow-2xl max-w-4xl">
              Khám Phá Vẻ Đẹp <br className="hidden sm:inline" />
              <span className="text-amber-300 drop-shadow-md">
                Huyền Bí Bảy Núi Tri Tôn
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-100 max-w-2xl font-medium drop-shadow-md hidden sm:block">
              Nơi miền đất của 82 thắng cảnh tuyệt đẹp, di sản tâm linh Khmer lâu đời và bản đồ ẩm thực Cháo bò lá trúc độc đáo.
            </p>

            <div className="relative w-full max-w-2xl pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/places?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="glass-panel flex items-center rounded-full p-2 shadow-2xl transition-transform focus-within:scale-[1.02] bg-white/90 backdrop-blur-xl border border-white/60"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hỏi AI Du Lịch Tri Tôn (VD: 'Quán cháo bò ngon nhất'...)"
                  className="w-full flex-grow rounded-l-full border-none bg-transparent px-6 py-3 font-body-lg text-body-lg text-slate-800 outline-none placeholder:text-slate-500 focus:ring-0 text-xs sm:text-sm font-medium"
                />
                <button
                  type="submit"
                  className="flex min-w-[48px] items-center justify-center rounded-full bg-secondary p-3 text-white shadow-md transition-colors hover:bg-golden-hover md:px-6 md:py-3 shrink-0 font-bold text-xs"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Tìm Kiếm AI</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Dynamic Top 6 Hot Places Section */}
        <HotPlacesSection
          limit={6}
          title="🔥 TOP ĐỊA ĐIỂM HOT NỔI TIẾNG NHẤT"
          subtitle="Danh sách 6 điểm check-in, di sản & ẩm thực hot nhất Bảy Núi được du khách yêu thích nhất"
        />

        {/* Real-Time Golden Time Widget */}
        <GoldenTimeWidget />

        {/* Danh mục nổi bật (Quick Filter Category) */}
        <section className="flex flex-col gap-6">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Danh mục nổi bật
          </h2>
          <div className="flex flex-wrap gap-4">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={
                  activeCategory === label
                    ? "flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-bold text-label-bold text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95"
                    : "flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-5 py-2.5 font-label-bold text-label-bold text-on-surface-variant transition-all hover:bg-emerald-light hover:text-primary active:scale-95"
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* TỐI ƯU SECTION 1: BẢN ĐỒ VỊ GIÁC ẨM THỰC BẢY NÚI */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" /> Bản Đồ Vị Giác Bảy Núi
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Tinh Hoa Ẩm Thực Đặc Sản Tri Tôn
              </h2>
            </div>
            <Link
              href="/food"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Xem tất cả quán ăn đặc sản</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gourmetFoods.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md badge-gold text-[11px] font-bold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {item.rating}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">{item.name}</h3>
                    <p className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
                      {item.flavorTag}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.price}</span>
                  <Link href="/food" className="text-xs font-bold text-emerald-800 hover:underline">
                    Xem địa chỉ &gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: VĂN HÓA & LỄ HỘI KHMER */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-emerald-200/80 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" /> Di Sản Phi Vật Thể Độc Đáo
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Văn Hóa & Lễ Hội Khmer Sôi Động
              </h2>
            </div>
            <Link
              href="/culture"
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
            >
              <span>Xem chi tiết lễ hội Khmer</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cultureEvents.map((ev, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
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

                  <div className="p-6 space-y-2">
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {ev.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between pt-3">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    {ev.location}
                  </span>
                  <Link href="/culture" className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-0.5">
                    <span>Xem thêm</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: TIKTOK REELS SHOWCASE (STREAMLINED FULL WIDTH) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="font-headline-md text-2xl font-bold text-on-surface flex items-center gap-2">
              <span>🎵 TikTok Video Reviews Thực Tế</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                6 Reels Hot-Trend
              </span>
            </h2>
            <Link href="/places" className="text-xs font-bold text-emerald-800 hover:underline">
              Khám phá thêm trên TikTok &gt;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {tiktokVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={video.img}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/30 shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
                    <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                  <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                    {video.title}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-semibold text-rose-300">
                    {video.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TỐI ƯU SECTION 4: LƯU TRÚ & HOMESTAY VIEW NÚI NỔI BẬT */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Hotel className="h-4 w-4 text-blue-600" /> Nghỉ Dưỡng Thư Thái
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Homestay & Khách Sạn View Đẹp Tại Tri Tôn
              </h2>
            </div>
            <Link href="/stay" className="text-xs font-bold text-blue-700 hover:underline">
              Xem tất cả chỗ ở &gt;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredStays.map((stay, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full bg-slate-100">
                    <img src={stay.img} alt={stay.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md badge-gold text-[11px] font-bold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {stay.rating}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{stay.location}</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">{stay.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{stay.view}</p>
                  </div>
                </div>
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">{stay.price}</span>
                  <Link href="/stay" className="text-xs font-bold text-slate-900 hover:underline">
                    Đặt phòng ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TỐI ƯU SECTION 5: BẢN ĐỒ SỐ TƯƠNG TÁC THU NHỎ (MINI LIVE GIS MAP BANNER) */}
        <section className="rounded-3xl bg-slate-100 p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Navigation className="h-4 w-4 text-emerald-600" /> Định Vị Tọa Độ GPS 82 Địa Điểm
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Bản Đồ Số GIS Du Lịch Tri Tôn
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trải nghiệm bản đồ tương tác hiển thị vị trí các hồ nước, chùa chiền, quán ăn cháo bò và homestay với chỉ đường GPS chính xác tuyệt đối.
            </p>
          </div>
          <Link
            href="/map"
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl shadow-lg transition-all shrink-0"
          >
            <Map className="h-4 w-4" />
            <span>Mở Bản Đồ GIS Trực Tuyến</span>
          </Link>
        </section>

        {/* Hotline Emergency Support Banner */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Hỗ Trợ Du Khách 24/7
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Cần Hỗ Trợ Đường Đi Hoặc Sự Cố Du Lịch?
            </h3>
            <p className="text-xs text-slate-300">
              Đội ngũ Công an và Cấp cứu Huyện Tri Tôn luôn túc trực hỗ trợ an toàn cho du khách.
            </p>
          </div>
          <Link
            href="/emergency"
            className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all shrink-0"
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

      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/chatbot"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-primary shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-hover active:scale-95"
        >
          <Bot className="h-7 w-7 text-on-primary" />
        </Link>
      </div>
    </div>
  );
}
