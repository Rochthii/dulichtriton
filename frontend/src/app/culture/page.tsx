"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Landmark, MapPin, Calendar, Clock, Star, Sparkles, 
  Flame, Navigation, BookOpen, Music, Layers, MessageSquareText,
  ArrowUpRight, ChevronRight, Compass, ShieldCheck, HeartHandshake,
  CheckCircle2, BellRing, Eye, Award, ExternalLink
} from "lucide-react";
import Link from "next/link";
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

interface FestivalItem {
  id: string;
  name: string;
  time: string;
  monthsActive: number[]; // Months (1-12) when festival is active/upcoming
  season_badge: string;
  location: string;
  tag: string;
  tagColor: string;
  image_url: string;
  desc: string;
  cradle: string;
  highlights: string[];
  golden_hours_tip: string;
  parking_tip: string;
  ai_query: string;
}

const ALL_FESTIVALS: FestivalItem[] = [
  {
    id: "fest-balloon",
    name: "Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn",
    time: "Dịp Lễ Quốc Khánh 2/9 (01/9 - 03/9) & 30/4 - 1/5",
    monthsActive: [8, 9, 4, 5],
    season_badge: "Sự Kiện Du Lịch Thể Thao Đỉnh Cao",
    location: "Khu Thể thao Tà Pạ - Soài Chek & Đỉnh Núi Cô Tô (Xã Núi Tô)",
    tag: "Lễ Hội Hàng Không",
    tagColor: "bg-[#F26B3A] text-white border-[#F26B3A]",
    image_url: "/images/culture/festival_khinh_khi_cau.jpg",
    desc: "Chiêm ngưỡng 17 quả khinh khí cầu khổng lồ rực rỡ và màn thượng cờ Tổ quốc 200m² trên bầu trời Bảy Núi. Màn trình diễn dù lượn Paragliding & Paramotor xả khói ngũ sắc từ đỉnh Núi Cô Tô (>500m) đáp xuống thung lũng Tà Pạ.",
    cradle: "Sự kiện khinh khí cầu và dù lượn quy mô lớn nhất vùng Đồng bằng Sông Cửu Long.",
    highlights: [
      "Nghi thức Thượng cờ Tổ quốc 200m² bay bằng khinh khí cầu cấp 7",
      "Trải nghiệm bay treo khinh khí cầu (Tethered Flight) cao 30m - 50m ngắm Núi Cô Tô",
      "Biểu diễn Dù lượn Paragliding xả khói màu ngũ sắc từ đỉnh Phụng Hoàng Sơn",
      "Đêm Hoa Đăng thổi lửa khinh khí cầu (Night Glow) kết hợp âm nhạc Acoustic"
    ],
    golden_hours_tip: "06:00 - 08:30 sáng (gió êm nhất, bay đẹp nhất) & 18:30 - 21:00 tối (Đêm hoa đăng).",
    parking_tip: "Đường nhựa vào tận bãi đỗ Sân Đua Bò Tri Tôn (sức chứa ô tô 4-45 chỗ và xe máy).",
    ai_query: "Hãy kể chi tiết về Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn ở Tri Tôn: thời gian, địa điểm, nghi thức và kinh nghiệm đi xem thực tế"
  },
  {
    id: "fest-dua-bo",
    name: "Lễ Hội Đua Bò Bảy Núi Truyền Thống",
    time: "Tháng 8 - 9 Âm Lịch (Dịp Lễ Sêne Đônta)",
    monthsActive: [8, 9, 10],
    season_badge: "Di Sản Phi Vật Thể Quốc Gia",
    location: "Sân Đua Bò Tri Tôn (Xã Núi Tô) & Sân Đua Bừa Nước Chùa Rô (Xã Châu Lăng)",
    tag: "Di Sản Quốc Gia",
    tagColor: "bg-[#7C5CBF] text-white border-[#7C5CBF]",
    image_url: "/images/culture/festival_dua_bo.jpg",
    desc: "Hội thi thể thao dân gian độc nhất vô nhị trên bãi ruộng bùn nước, nơi các đôi bò chiến dũng mãnh tranh tài bứt tốc nghẹt thở trong tiếng hò reo của hàng vạn du khách và nhiếp ảnh gia khắp cả nước.",
    cradle: "Khởi phát từ tập tục cày ruộng chùa giúp nhà sư của đồng bào Khmer tại Chùa Tà Miệt (Xã Lương Phi).",
    highlights: [
      "Vòng Hô lấy đà và Vòng Thả bứt tốc 'tạt bùn rẽ sóng' ngoạn mục",
      "Hội thi bừa nước mùa nước nổi nghệ thuật tại Chùa Rô",
      "Vũ điệu múa trống Chhay-dăm và tiếng kèn bạt mạng rộn rã phum sóc"
    ],
    golden_hours_tip: "07:00 - 12:00 sáng. Nên đến từ 06:30 để chọn vị trí bờ bao quan sát tốt nhất.",
    parking_tip: "Đậu xe tại bãi giữ xe sân vận động Tà Pạ hoặc đường vào Chùa Rô.",
    ai_query: "Kinh nghiệm đi xem Lễ Hội Đua Bò Bảy Núi Tri Tôn: thời gian, địa điểm, các vòng đua và lưu ý an toàn"
  },
  {
    id: "fest-chol-chnam-thmay",
    name: "Tết Cổ Truyền Chôl Chnăm Thmây",
    time: "13 - 16 Tháng 4 Dương Lịch Hàng Năm",
    monthsActive: [3, 4],
    season_badge: "Tết Mừng Năm Mới Rực Rỡ",
    location: "Khắp 37 ngôi chùa Nam Tông Khmer Tri Tôn (Wat Xvayton, Chùa Tà Pạ, Chùa Koh Kas,...)",
    tag: "Tết Cổ Truyền",
    tagColor: "bg-[#D9822B] text-white border-[#D9822B]",
    image_url: "/images/culture/festival_chol_chnam_thmay.jpg",
    desc: "Dịp lễ hội lớn nhất năm của đồng bào Khmer đón mừng năm mới, khắp phum sóc rực rỡ cờ hoa, nghi thức rước Đại lịch Maha Sangkran, đắp núi cát tích đức và té nước chúc phúc an lành.",
    cradle: "Không gian trang nghiêm cổ kính nhất tại Chùa Xvayton (>300 năm tuổi, TT. Tri Tôn).",
    highlights: [
      "Nghi thức Đắp Núi Cát (Poun Phnum Khsach) tích lũy công đức",
      "Lễ tắm tượng Phật và tắm sư (Srong Preah) bằng nước thơm hoa tươi",
      "Vòng múa Răm-vông (Lâm-thôn) và diễn xướng Dù Kê thâu đêm tại sân chùa"
    ],
    golden_hours_tip: "08:00 - 10:30 sáng làm lễ chùa & 19:00 - 22:00 đêm hòa vào điệu múa Răm-vông.",
    parking_tip: "Đậu xe trong sân khuôn viên chùa (lưu ý tuân thủ hướng dẫn của ban quản trị chùa).",
    ai_query: "Các nghi thức đặc sắc trong Tết Chôl Chnăm Thmây của người Khmer Tri Tôn"
  },
  {
    id: "fest-sene-donta",
    name: "Lễ Hội Sêne Đônta (Lễ Cúng Ông Bà)",
    time: "Từ ngày 29/8 đến 01/9 Âm Lịch (Cuối T9 - Đầu T10)",
    monthsActive: [8, 9, 10],
    season_badge: "Đại Lễ Hiếu Hạnh Tổ Tiên",
    location: "37 Ngôi Chùa Khmer & Mọi Phum Sóc Tri Tôn",
    tag: "Lễ Báo Hiếu",
    tagColor: "bg-[#0E8C7F] text-white border-[#0E8C7F]",
    image_url: "/images/culture/festival_dua_bo.jpg",
    desc: "Đại lễ mang ý nghĩa tri ân công đức tổ tiên, ông bà cha mẹ và cầu siêu cho các linh hồn đã khuất. Không khí ấm cúng với mâm cỗ truyền thống bánh tét, cốm dẹp, canh kiểm và nghi thức thả thuyền cà tang.",
    cradle: "Tập tục đặt cơm vắt Bay Ben lúc rạng sáng tại các ngôi chùa Khmer cổ.",
    highlights: [
      "Lễ Đặt Cơm Vắt (Bay Ben) tích đức rạng sáng 04:30 tại chánh điện",
      "Mâm cỗ cúng ông bà tại tư gia thắt chặt tình làng nghĩa xóm",
      "Nghi thức Thả Thuyền Cà Tang (thuyền bẹ chuối chở hoa đăng) tiễn đưa linh hồn tổ tiên"
    ],
    golden_hours_tip: "Sáng sớm 05:00 - 07:00 xem lễ Bay Ben tại Chùa Tà Pạ & chiều xem hội đua bò.",
    parking_tip: "Phương tiện thuận tiện nhất là xe máy di chuyển giữa các chùa trong xã.",
    ai_query: "Ý nghĩa và nghi thức Lễ Sêne Đônta của người Khmer Tri Tôn An Giang"
  },
  {
    id: "fest-ok-om-bok",
    name: "Lễ Hội Cúng Trăng Ok Om Bok & Thả Đèn Gió",
    time: "Đêm Rằm Tháng 10 Âm Lịch (Khoảng Tháng 11 DL)",
    monthsActive: [10, 11],
    season_badge: "Đêm Rằm Tạ Ơn Thần Mặt Trăng",
    location: "Chùa Xvayton, Hồ Tà Pạ & Hồ Soài So",
    tag: "Lễ Hội Cúng Trăng",
    tagColor: "bg-[#C97F1B] text-white border-[#C97F1B]",
    image_url: "/images/culture/festival_ok_om_bok.jpg",
    desc: "Đại lễ tạ ơn Thần Mặt Trăng đã ban mưa thuận gió hòa bảo vệ mùa màng tươi tốt; trẻ nhỏ được người lớn đút Cốm Dẹp (Ombok) gửi gắm ước nguyện tương lai. Mặt hồ lung linh hàng ngàn hoa đăng và đèn gió bay cao.",
    cradle: "Nghi thức thả đèn gió khổng lồ rực sáng nền trời đêm Thất Sơn huyền ảo.",
    highlights: [
      "Nghi thức Đút Cốm Dẹp (Ok Om Bok) cầu may mắn cho thế hệ trẻ",
      "Thả Đèn Gió (Khom Khsach) khổng lồ bay cao vút giữa trời đêm",
      "Thả hoa đăng lung linh soi bóng mặt hồ Tà Pạ và Soài So"
    ],
    golden_hours_tip: "18:30 - 21:30 đêm rằm tháng 10 khi mặt trăng lên đỉnh đầu.",
    parking_tip: "Gửi xe tại cổng KDL Hồ Soài So hoặc bãi xe trung tâm Chùa Xvayton.",
    ai_query: "Lễ hội cúng trăng Ok Om Bok ở Tri Tôn diễn ra thế nào và ăn cốm dẹp ra sao?"
  },
  {
    id: "fest-kathina",
    name: "Đại Lễ Dâng Y Kathina & Nhạc Ngũ Âm",
    time: "Rằm Tháng 9 Đến Rằm Tháng 10 Âm Lịch",
    monthsActive: [9, 10, 11],
    season_badge: "Đại Lễ Phật Giáo Trang Nghiêm",
    location: "37 Ngôi Chùa Phật Giáo Nam Tông Khmer Tri Tôn",
    tag: "Phật Giáo Nam Tông",
    tagColor: "bg-[#7C5CBF] text-white border-[#7C5CBF]",
    image_url: "/images/culture/festival_kathina.jpg",
    desc: "Đại lễ công đức dâng y cà-sa và tứ vật dụng cho chư tăng sau 3 tháng An Cư Kiết Hạ (Vassa). Đoàn diễu hành rực rỡ trang phục Sampot truyền thống cùng dàn nhạc ngũ âm Pinpeat rộn rã khắp phum sóc.",
    cradle: "Tập tục truyền thống ngàn năm gìn giữ chánh pháp Phật giáo Theravada.",
    highlights: [
      "Hòa tấu Dàn nhạc Ngũ Âm (Pinpeat) 5 chất liệu âm thanh độc đáo",
      "Đoàn rước cúng y quanh phum sóc và 3 vòng chánh điện",
      "Trang phục Sampot và khăn lụa Krama truyền thống tuyệt mỹ"
    ],
    golden_hours_tip: "08:00 - 11:00 sáng tại các chùa lớn (Chùa Xvayton, Chùa Tà Pạ, Chùa Rô).",
    parking_tip: "Đậu xe tại sân chùa hoặc đường nhựa liên ấp.",
    ai_query: "Đại lễ dâng y Kathina ở Tri Tôn có quy định gì và diễn ra vào ngày nào?"
  }
];

const KHMER_PAGODA_RULES = [
  {
    id: "rule-attire",
    title: "1. Trang Phục Trang Nghiêm & Kín Đáo",
    desc: "Mặc áo có tay, quần hoặc váy dài qua đầu gối. Tuyệt đối không mặc áo sát nách, hở lưng hoặc váy ngắn trên gối khi bước vào khuôn viên chùa và Chánh điện.",
    badge: "Bắt Buộc",
    color: "border-emerald-400 bg-emerald-50/60 text-emerald-900"
  },
  {
    id: "rule-footwear",
    title: "2. Tháo Giày Dép & Nón Mũ Ngoài Thềm",
    desc: "Luôn tháo giày, dép, nón mũ và kính râm để gọn gàng bên ngoài trước khi bước vào Chánh điện (Preah Vihear) và không gian hành lễ linh thiêng.",
    badge: "Tôn Kính",
    color: "border-amber-400 bg-amber-50/60 text-amber-900"
  },
  {
    id: "rule-greeting",
    title: "3. Chào Sampheah Cung Kính",
    desc: "Chắp hai lòng bàn tay trước ngực hoặc ngang trán (cúi đầu nhẹ) khi chào các vị Sư Sãi (Chao Athikar) và trước tượng Đức Phật Thích Ca Mâu Ni.",
    badge: "Nghi Thức",
    color: "border-[#0E8C7F]/40 bg-[#0E8C7F]/10 text-[#0E8C7F]"
  },
  {
    id: "rule-monk-touch",
    title: "4. Quy Tắc Tiếp Xúc Với Chư Tăng",
    desc: "Nữ giới tuyệt đối không chạm trực tiếp vào thân thể hay y cà-sa của chư tăng. Khi dâng lễ vật, hãy đặt lên khay, bàn hoặc tấm vải do sư trải sẵn.",
    badge: "Giới Luật Theravada",
    color: "border-red-400 bg-red-50/60 text-red-900"
  },
  {
    id: "rule-chedi",
    title: "5. Tôn Trọng Tháp Cốt Chedi",
    desc: "Khuôn viên chùa có nhiều tháp Chedi lưu giữ tro cốt của các bậc tiền bối và đồng bào phum sóc. Tuyệt đối không leo trèo, tựa lưng hoặc ngồi lên chân tháp.",
    badge: "Tâm Linh",
    color: "border-purple-400 bg-purple-50/60 text-purple-900"
  },
  {
    id: "rule-silence",
    title: "6. Giữ Thanh Tịnh & Không Chỉ Tay Tượng Phật",
    desc: "Đi nhẹ, nói khẽ, chuyển điện thoại sang chế độ rung. Khi muốn chỉ về phía tượng Phật hoặc chư tăng, hãy mở ngửa lòng bàn tay hướng về phía đó, không dùng một ngón tay trỏ chỉ thẳng.",
    badge: "Văn Minh",
    color: "border-blue-400 bg-blue-50/60 text-blue-900"
  }
];

const HERITAGE_STORIES = [
  {
    id: "la-buong",
    title: "Kinh Lá Buông (Satra Slarkrit)",
    subtitle: "Di Sản Phi Vật Thể Quốc Gia Độc Bản",
    location: "Chùa Xvayton (Wat Xvayton), TT. Tri Tôn",
    icon: BookOpen,
    image_url: "/images/culture/heritage_kinh_la_buong.jpg",
    desc: "Bảo vật quốc gia vô giá lưu giữ giáo lý Tam Tạng Kinh, văn học và y học cổ truyền Khmer; được khắc thủ công bằng kim sắt mũi nhọn trên lá cây buông sấy khô, quét tro than rơm và dầu cây trai bảo quản hàng trăm năm không bị mối mọt mục rữa.",
    tag: "Chùa Xà Tón Cổ Kính",
    stamp: "BẢO VẬT QUỐC GIA"
  },
  {
    id: "pinpeat",
    title: "Dàn Nhạc Ngũ Âm Pinpeat",
    subtitle: "Linh Hồn Diễn Xướng Chùa Tháp Nam Tông",
    location: "Các Chùa Khmer & Nhà Trưng Bày Văn Hóa",
    icon: Music,
    image_url: "/images/culture/heritage_nhac_ngu_am.jpg",
    desc: "Hệ thống hòa âm độc đáo kết tinh từ 5 chất liệu âm thanh (Đồng, Sắt, Gỗ, Da, Hơi) với đàn thuyền Roneat-Ek, dàn cồng Kong-Vong, trống Sampho hòa quyện cùng điệu múa Răm-vông (Lâm-thôn) và kịch hát Dù Kê (Robam) trong mọi ngày hội phum sóc.",
    tag: "Âm Nhạc Cổ Truyền",
    stamp: "DIỄN XƯỚNG DÂN GIAN"
  },
  {
    id: "gom-ca-rang",
    title: "Lò Gốm Đất Nung Phnôm Pi & Bếp Cà-Ràng",
    subtitle: "Kỹ Thuật Nặn Tay Độc Đáo Không Dùng Bàn Xoay",
    location: "Làng Phnôm Pi, Xã Châu Lăng, Tri Tôn",
    icon: Flame,
    image_url: "/images/culture/heritage_gom_dat_nung.jpg",
    desc: "Nghề gốm đất nung cổ truyền độc nhất miền Tây: người thợ đi vòng quanh trụ đất nặn tay hoàn toàn từ đất sét Bảy Núi, nung lộ thiên bằng rơm rạ tạo nên chiếc bếp Cà-ràng hình số 3 và nồi đất nấu gà đốt Ô Thum lừng danh.",
    tag: "Gốm Đất Nung",
    stamp: "DI SẢN TRĂM TUỔI"
  },
  {
    id: "tho-cam",
    title: "Làng Nghề Thốt Nốt & Dệt Thổ Cẩm Ô Lâm",
    subtitle: "Hương Vị Ngọt Ngào & Sắc Màu Hoa Văn Krama",
    location: "Xã Châu Lăng & Xã Ô Lâm, Tri Tôn",
    icon: Layers,
    image_url: "/images/culture/heritage_lang_nghe_thot_not.jpg",
    desc: "Nghề leo cây thốt nốt lấy mật nấu đường vàng óng truyền đời kết hợp làng nghề dệt thổ cẩm truyền thống Khmer dệt khăn rằn Krama, xà-rông và túi xách hoa văn cổ tinh xảo trên khung cửi gỗ.",
    tag: "Làng Nghề Thủ Công",
    stamp: "NGHỀ TRUYỀN THỐNG"
  }
];

export default function CulturePage() {
  const [cultures, setCultures] = useState<CulturePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");

  // Dynamic Current Month Detection for Smart Spotlight
  const currentMonth = useMemo(() => {
    return new Date().getMonth() + 1; // 1 -> 12
  }, []);

  // Sort festivals: Put active / upcoming festivals to top spot
  const sortedFestivals = useMemo(() => {
    return [...ALL_FESTIVALS].sort((a, b) => {
      const aActive = a.monthsActive.includes(currentMonth);
      const bActive = b.monthsActive.includes(currentMonth);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [currentMonth]);

  const spotlightFestival = sortedFestivals[0];

  useEffect(() => {
    function processCultureData(json: any) {
      const data = Array.isArray(json) ? json : (json?.culture || []);
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
          (freshJson: any) => {
            processCultureData(freshJson);
          }
        );
        processCultureData(json);
      } catch (err) {
        console.warn('Fallback local master pois for culture:', err);
        const fallbackItems = (localMasterPois as any[]).filter(
          (p: any) =>
            p.category === 'culture' ||
            p.category === 'spiritual' ||
            p.category === 'history' ||
            (p.tourism_category && (p.tourism_category.includes('Lễ Hội') || p.tourism_category.includes('Chùa') || p.tourism_category.includes('Di Tích')))
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
        c.name.toLowerCase().includes("sân đua") ||
        c.name.toLowerCase().includes("khinh khí cầu")
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
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased selection:bg-[#F0A32F]/30 overflow-x-hidden">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#0E8C7F]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#F0A32F]/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 sm:space-y-12 px-3 sm:px-6 md:px-8 py-5 sm:py-10 pb-24 sm:pb-16">
        
        {/* ── 1. HEADER HERO BANNER (Folk-Modern Heritage Gateway) ───────────────── */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] via-[#0B6B60] to-[#084D45] p-6 sm:p-8 md:p-12 text-white shadow-xl border border-[#0B6B60]">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#FFD37A]/10 blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD37A]/20 px-4 py-1.5 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-md font-display border border-[#FFD37A]/30">
              <Landmark className="h-4 w-4" />
              <span>Di Sản & Lễ Hội Bảy Núi — Tri Tôn, An Giang</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Kho Tàng Di Sản & Đại Lễ Hội Thất Sơn
            </h1>
            
            <p className="text-sm sm:text-base text-[#FFFDF7]/90 leading-relaxed font-body max-w-2xl">
              Vùng đất hội tụ trầm tích văn hóa ngàn năm với <strong>Lễ Hội Khinh Khí Cầu & Dù Lượn</strong> đỉnh cao, <strong>Đua Bò Bảy Núi</strong> di sản quốc gia, <strong>Kinh Lá Buông</strong> độc bản, <strong>37 ngôi chùa Nam Tông Khmer</strong> cổ kính và những làng nghề trăm tuổi dệt thổ cẩm, gốm đất nung.
            </p>

            {/* Quick Stats Grid */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">37 Chùa</span>
                <span className="text-[11px] text-white/80 font-medium">Nam Tông Khmer</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">6 Đại Lễ</span>
                <span className="text-[11px] text-white/80 font-medium">4 Mùa Bảy Núi</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">Kinh Lá Buông</span>
                <span className="text-[11px] text-white/80 font-medium">Di Sản Quốc Gia</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="block font-display font-black text-xl text-[#FFD37A]">Gốm & Thốt Nốt</span>
                <span className="text-[11px] text-white/80 font-medium">Làng Nghề Trăm Tuổi</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a 
                href="#smart-spotlight"
                className="px-5 py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#26221B]" />
                <span>Xem Lễ Hội Nổi Bật Tháng {currentMonth}</span>
              </a>
              <a 
                href="#pagoda-rules"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/25 flex items-center gap-2 backdrop-blur-md"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFD37A]" />
                <span>Quy Chuẩn Viếng 37 Chùa</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. DYNAMIC SMART FESTIVAL SPOTLIGHT (Tự động đưa Lễ Hội Gần Nhất Lên Đầu) ── */}
        <section id="smart-spotlight" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26B3A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F26B3A]"></span>
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B]">
                Tiêu Điểm Lễ Hội Đang / Sắp Diễn Ra (Tháng {currentMonth})
              </h2>
            </div>
            <span className="text-xs font-bold text-[#F26B3A] bg-[#F26B3A]/10 px-3.5 py-1 rounded-full border border-[#F26B3A]/20">
              Tự Động Cập Nhật Theo Thời Gian Thực
            </span>
          </div>

          {spotlightFestival && (
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFFDF7] via-amber-50/40 to-[#FAF3E7] border-2 border-[#F0A32F] shadow-lg p-5 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Photo 16:9 */}
                <div className="lg:col-span-5 relative aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={spotlightFestival.image_url}
                    alt={spotlightFestival.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-[#F26B3A] text-white text-[11px] font-black uppercase tracking-wider shadow-md font-display flex items-center gap-1">
                      <Flame className="w-3 h-3 text-white" />
                      <span>{spotlightFestival.season_badge}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-mono text-[#FFD37A] font-bold block truncate">
                      📍 {spotlightFestival.location}
                    </span>
                  </div>
                </div>

                {/* Content & Action Guide */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#D9822B] font-display">
                      <Calendar className="w-4 h-4 text-[#D9822B]" />
                      <span>{spotlightFestival.time}</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">
                      {spotlightFestival.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A4336] leading-relaxed">
                      {spotlightFestival.desc}
                    </p>
                  </div>

                  {/* Highlights and Action Tips Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 space-y-1">
                      <span className="font-bold text-[#0E8C7F] flex items-center gap-1.5 font-display">
                        <Clock className="w-3.5 h-3.5 text-[#0E8C7F]" />
                        Khung Giờ Vàng Săn Ảnh:
                      </span>
                      <p className="text-[#6B6355] leading-relaxed text-[11px]">
                        {spotlightFestival.golden_hours_tip}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 space-y-1">
                      <span className="font-bold text-[#D9822B] flex items-center gap-1.5 font-display">
                        <Navigation className="w-3.5 h-3.5 text-[#D9822B]" />
                        Bãi Đỗ Xe & Tiếp Cận:
                      </span>
                      <p className="text-[#6B6355] leading-relaxed text-[11px]">
                        {spotlightFestival.parking_tip}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action CTA */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/chatbot?q=${encodeURIComponent(spotlightFestival.ai_query)}`}
                      className="px-5 py-2.5 rounded-full bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 tap-bounce"
                    >
                      <MessageSquareText className="w-4 h-4" />
                      <span>Hỏi Trợ Lý AI Chi Tiết Lễ Hội</span>
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotlightFestival.location + " Tri Tôn An Giang")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-full bg-white border border-[#26221B]/15 hover:border-[#0E8C7F] text-[#26221B] font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4 text-[#0E8C7F]" />
                      <span>Chỉ Đường Đến Sân Hội</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 3. LỊCH 6 ĐẠI LỄ HỘI 12 THÁNG BẢY NÚI ──────────────────────────── */}
        <section id="le-hoi-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#26221B]/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                <Calendar className="w-4 h-4 text-[#F26B3A]" />
                <span>Dòng Chảy Lễ Hội 4 Mùa Thất Sơn</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26221B] font-display mt-1">
                Lịch 6 Đại Lễ Hội Truyền Thống Tri Tôn
              </h2>
            </div>
            <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-4 py-1.5 rounded-full border border-[#0E8C7F]/20 w-fit">
              Diễn Ra Xuyên Suốt 12 Tháng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_FESTIVALS.map((fest) => {
              const isHighlight = fest.monthsActive.includes(currentMonth);
              return (
                <div 
                  key={fest.id}
                  className={`group relative bg-[#FFFDF7] rounded-[26px] overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                    isHighlight ? "border-2 border-[#F0A32F] ring-2 ring-[#F0A32F]/20" : "border-[#EBE1D0]"
                  }`}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151B34]/90 via-[#151B34]/30 to-transparent" />
                    
                    {/* Badges on Photo */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${fest.tagColor}`}>
                        {fest.tag}
                      </span>
                      {isHighlight && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-amber-900 bg-[#FFD37A] shadow-sm animate-pulse">
                          🔥 TIÊU ĐIỂM
                        </span>
                      )}
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
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#D9822B]">
                        <Clock className="w-3.5 h-3.5 text-[#D9822B]" />
                        <span>{fest.time}</span>
                      </div>

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
                        href={`/chatbot?q=${encodeURIComponent(fest.ai_query)}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                      >
                        <MessageSquareText className="w-4 h-4 text-[#26221B]" />
                        <span>Hỏi Trợ Lý AI Về Lễ Hội Này</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#26221B]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. CẨM NANG 6 QUY CHUẨN BẤT BIẾN KHI VIẾNG 37 CHÙA NAM TÔNG KHMER ── */}
        <section id="pagoda-rules" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#26221B]/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0E8C7F] uppercase tracking-wider font-display">
                <ShieldCheck className="w-4 h-4 text-[#0E8C7F]" />
                <span>Nghi Thức & Giới Luật Phật Giáo Theravada</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26221B] font-display mt-1">
                Cẩm Nang 6 Quy Chuẩn Viếng 37 Chùa Nam Tông Khmer
              </h2>
            </div>
            <span className="text-xs font-bold text-[#6B6355]">
              Tuân Thủ Để Trải Nghiệm Trọn Vẹn Sự Tôn Kính
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {KHMER_PAGODA_RULES.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 sm:p-6 rounded-[24px] border shadow-xs space-y-3 bg-white ${rule.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-base text-[#26221B]">
                    {rule.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-display">
                    {rule.badge}
                  </span>
                </div>
                <p className="text-xs text-[#4A4336] leading-relaxed font-body">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. BẢO VẬT QUỐC GIA & LÀNG NGHỀ TRĂM TUỔI ──────────────────────── */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {HERITAGE_STORIES.map((h) => {
              const Icon = h.icon;
              return (
                <div 
                  key={h.id}
                  className="group relative bg-[#FFFDF7] rounded-[24px] overflow-hidden border border-[#EBE1D0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.image_url}
                      alt={h.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151B34]/85 via-transparent to-transparent" />
                    
                    {/* Heritage Stamp */}
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#FFD37A] text-[#26221B] font-black text-[9px] uppercase tracking-wider shadow-sm font-display truncate">
                      {h.stamp}
                    </div>

                    <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-[#FFD37A] flex items-center justify-center border border-white/30 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider font-display truncate">
                        {h.tag}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-2 flex-grow flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-extrabold text-[#26221B] group-hover:text-[#0E8C7F] transition-colors leading-tight">
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
                        <span className="truncate">{h.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. BỘ LỌC TABS & DANH SÁCH 37 CHÙA THÁP, DI TÍCH, LỄ HỘI ────────── */}
        <section className="space-y-4 sm:space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#26221B]/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#26221B] font-display flex items-center gap-2">
                <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-[#0E8C7F]" />
                <span>Không Gian Văn Hóa Thực Địa ({filteredCultures.length} Điểm)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6355] mt-1">
                Khám phá 37 ngôi chùa tháp Nam Tông, di tích lịch sử kháng chiến, sân đua bò và làng nghề bản địa
              </p>
            </div>

            {/* Filter Tabs (Folk-Modern Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-display">
              {[
                { id: "ALL", label: "Tất Cả" },
                { id: "PAGODA", label: "37 Chùa Khmer" },
                { id: "FESTIVAL", label: "Lễ Hội & Sân Đua Bò" },
                { id: "HISTORY", label: "Di Tích Lịch Sử" },
                { id: "CRAFT", label: "Làng Nghề" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTab === tab.id
                      ? "bg-[#0E8C7F] text-white shadow-xs"
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredCultures.map((culture) => (
                <div
                  key={culture.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border border-[#EBE1D0] shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* 4:3 Image Cover */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(culture.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={culture.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                      {/* Category Chip */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1">
                        <span className="px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm font-display truncate">
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#26221B]" />
                          <span>{culture.tourism_category}</span>
                        </span>
                      </div>
                      
                      {/* Rating Chip */}
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm font-display">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        <span>{culture.rating || 4.9}</span>
                      </span>

                      {/* Bottom Text on Photo */}
                      <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 text-white space-y-0.5">
                        <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                          {culture.commune}
                        </span>
                        <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                          {culture.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                      {culture.description && (
                        <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                          {culture.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Bottom */}
                  <div className="p-3 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-2">
                    <Link
                      href={`/places/${culture.slug || culture.id}`}
                      className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors font-display truncate"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(culture.name + " " + culture.commune + " Tri Tôn An Giang")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="hidden sm:inline">Chỉ đường</span>
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
