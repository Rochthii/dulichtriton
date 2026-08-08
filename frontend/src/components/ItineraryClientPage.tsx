'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Navigation, Sparkles, QrCode, 
  Car, Bike, Compass, Utensils, CheckCircle2, ChevronRight, Share2, Info, AlertTriangle, Flame, ShieldAlert, Sun, Moon, Play, ArrowDown, ExternalLink, Star
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import ItineraryExportModal from './ItineraryExportModal';
import { supabase } from '@/lib/supabase';

interface TourStop {
  stepIndex: number;
  time: string;
  id: string;
  name: string;
  commune: string;
  category: string;
  rating?: number;
  img: string;
  videoUrl: string;
  hashtag: string;
  distanceToNext?: string;
  desc?: string;
  cluster?: string;
  reminder?: string;
}

interface TourDay {
  dayNumber: number;
  dayTitle: string;
  stops: TourStop[];
}

export default function ItineraryClientPage() {
  const [days, setDays] = useState<'1' | '2' | '3'>('1');
  const [style, setStyle] = useState<'nature' | 'culture' | 'food' | 'homestay'>('nature');
  const [transport, setTransport] = useState<'bike' | 'car'>('bike');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // MASTER POI MEDIA LOOKUP DICTIONARY
  const mediaMap: Record<string, { img: string; hashtag: string; rating: number; commune: string; category: string }> = {
    "PL001": {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      hashtag: "HoTaPaTriTon",
      rating: 4.7,
      commune: "Xã Núi Tô",
      category: "Hồ nước & Sinh thái"
    },
    "HG001": {
      img: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
      hashtag: "ChuaTaPaTriTon",
      rating: 4.8,
      commune: "Xã Núi Tô",
      category: "Chùa Khmer Núi"
    },
    "PL011": {
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
      hashtag: "CanhDongLuaTaPa",
      rating: 4.8,
      commune: "Xã Núi Tô",
      category: "Cánh Đồng Lúa"
    },
    "CK002": {
      img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      hashtag: "ConDuongToLuaTaPa",
      rating: 4.7,
      commune: "Xã Núi Tô",
      category: "Tuyến Đường Check-in"
    },
    "FD009": {
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BunNuocLeoSoNuong",
      rating: 4.7,
      commune: "Thị trấn Tri Tôn",
      category: "Bún Mắm Khmer"
    },
    "HG002": {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIkt4mKcSMtN9qwWrnCavUNbd04V9-GYHPHeebFZyKXuiRnw6MUL1Qw2bsIsFB9nvNb4nwM87r5AbatwHdBlVeQ6ENzVwUmrHSBEYkmJ-cjCHYFjZRl6fz6VwL9RqMKrXt9pUigCmz71KjXxWSbsdcL3WCIX30VH8iXFopWhWSndEEy2G6dEqkpAdYMEoHcl-n0bTUj6Z7O50iAwa7xx_6bYi5N00srNzVSwgRc_6FXYAO_50JqasE4w",
      hashtag: "ChuaXaTonTriTon",
      rating: 4.8,
      commune: "Thị trấn Tri Tôn",
      category: "Di Sản Kinh Lá Buông"
    },
    "FD024": {
      img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BanhKepThotNotChuaCu",
      rating: 4.6,
      commune: "Thị trấn Tri Tôn",
      category: "Bánh Dân Dã Khmer"
    },
    "CK010": {
      img: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
      hashtag: "CongTroiKohKas",
      rating: 4.8,
      commune: "Xã Châu Lăng",
      category: "Cổng Chùa Cổ"
    },
    "CK004": {
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
      hashtag: "VomCongChauLang",
      rating: 4.7,
      commune: "Xã Châu Lăng",
      category: "Hàng Còng Cổ Thụ"
    },
    "FD006": {
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop",
      hashtag: "DuDuDamRiNa",
      rating: 4.8,
      commune: "Xã Châu Lăng",
      category: "Đặc Sản Đu Đủ Đâm"
    },
    "FD011": {
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BanhBoThotNotUtCot",
      rating: 4.8,
      commune: "Xã Châu Lăng",
      category: "Bánh Bò Cốt Dừa"
    },
    "FD020": {
      img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop",
      hashtag: "DuongThotNotUtHue",
      rating: 4.7,
      commune: "Xã Châu Lăng",
      category: "Đường Mật Ngào"
    },
    "FD001": {
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      hashtag: "GaDotOThumLaTruc",
      rating: 4.9,
      commune: "Xã Ô Lâm",
      category: "Thủ Phủ Gà Đốt"
    },
    "CK012": {
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      hashtag: "CauGoHoOThum",
      rating: 4.6,
      commune: "Xã Ô Lâm",
      category: "Cầu Gỗ Ngắm Hồ"
    },
    "CF001": {
      img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      hashtag: "CaPheRuongTriTon",
      rating: 4.6,
      commune: "Xã Núi Tô",
      category: "Cà Phê Đồng Lúa"
    },
    "CK001": {
      img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      hashtag: "TuyenTranhTriTon",
      rating: 4.9,
      commune: "Thị trấn Tri Tôn",
      category: "Hoàng Hôn Núi Cô Tô"
    },
    "PL020": {
      img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BaiThaDieuTriTon",
      rating: 4.8,
      commune: "Thị trấn Tri Tôn",
      category: "Sân Diều Hoàng Hôn"
    },
    "FD017": {
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BoNuongTraiTruc",
      rating: 4.7,
      commune: "Thị trấn Tri Tôn",
      category: "Bò Nướng Than Hồng"
    },
    "PL022": {
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      hashtag: "ChoDemTriTon",
      rating: 4.6,
      commune: "Thị trấn Tri Tôn",
      category: "Khu Ẩm Thực Đêm"
    },
    "PL002": {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      hashtag: "HoSoaiSoTriTon",
      rating: 4.7,
      commune: "Xã Núi Tô",
      category: "Hồ Hồ Núi Tô"
    },
    "PL016": {
      img: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1200&auto=format&fit=crop",
      hashtag: "SuoiVangSoaiSo",
      rating: 4.6,
      commune: "Xã Núi Tô",
      category: "Suối Tự Nhiên"
    },
    "FD013": {
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1200&auto=format&fit=crop",
      hashtag: "BanhCanhLoRenTriTon",
      rating: 4.7,
      commune: "Thị trấn Tri Tôn",
      category: "Bánh Canh Gia Truyền"
    },
    "HG005": {
      img: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
      hashtag: "NhaMoBaChuc",
      rating: 4.7,
      commune: "Thị trấn Ba Chúc",
      category: "Di Tích Lịch Sử Quốc Gia"
    },
    "FD015": {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkHUDKiIJE4KJWt-00IzsRQDsKl5vybNI3P9LIGOjuRMdjrJdhiUH5dOucUHcg-zW-umlBu-mSWAsGVjE0n8H8jYDsKtcmyQQvogwqey9foKt3C1bb7nNGvC7-Kirf-csJPIMgIVc8gUAYmaT0QDsKy7v4VH7QbOofMDn8b4viEqW3cWXy5bawuYPjdKiMTRamLLDtFXWVhAQ653wbJsFgvYCxz3Kb3tHvnCyUagVBrZ27cZrEvz-I8g",
      hashtag: "ChaoBoTraiTrucBaChuc",
      rating: 4.6,
      commune: "Thị trấn Ba Chúc",
      category: "Cháo Bò Đặc Sản"
    },
    "PL010": {
      img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      hashtag: "DoiTucDupTriTon",
      rating: 4.6,
      commune: "Xã An Tức",
      category: "Di Tích Hang Đá 128 Ngày Đêm"
    },
    "CK009": {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      hashtag: "ThotNotTraiTimAnTuc",
      rating: 4.7,
      commune: "Xã An Tức",
      category: "Cụm Thốt Nốt Trái Tim"
    },
    "PL012": {
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
      hashtag: "RungTamVongOTaSoc",
      rating: 4.7,
      commune: "Xã Lương Phi",
      category: "Rừng Sinh Thái Tầm Vông"
    }
  };

  // Helper to fetch rich stop detail
  const getStopDetails = (id: string, name: string) => {
    const mainId = id.split('+')[0].trim().split(' ')[0].trim();
    const meta = mediaMap[mainId] || {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      hashtag: name.replace(/[^a-zA-Z0-9]/g, ""),
      rating: 4.8,
      commune: "Tri Tôn",
      category: "Điểm Đến Bảy Núi"
    };
    return {
      img: meta.img,
      hashtag: meta.hashtag,
      rating: meta.rating,
      commune: meta.commune,
      category: meta.category,
      videoUrl: `https://www.tiktok.com/tag/${meta.hashtag}`
    };
  };

  // 1-DAY CANONICAL TOUR
  const tour1Day: TourDay[] = [
    {
      dayNumber: 1,
      dayTitle: '⭐ Tour 1 Ngày "Classic" (05:30 – 21:00 · Sơ Đồ Di Chuyển ~35km)',
      stops: [
        { stepIndex: 1, time: '05:30', id: 'PL001 + HG001', name: 'Săn bình minh Hồ Tà Pạ + Viếng Chùa Tà Pạ', distanceToNext: '📍 Di chuyển 1.5km (5 phút)', desc: 'Đón hừng đông chiếu sáng xuống lòng hồ ngọc bích Tà Pạ và vách đá nghiêng tuyệt đẹp.', cluster: 'Cụm Tà Pạ', ...getStopDetails('PL001', 'Hồ Tà Pạ') },
        { stepIndex: 2, time: '07:00', id: 'PL011 + CK002', name: 'Cánh đồng lúa & Con đường tơ lụa Tà Pạ', distanceToNext: '📍 Di chuyển 3.2km (10 phút)', desc: 'Chụp ảnh mảng màu ô ruộng lúa Tà Pạ và rặng thốt nốt soi bóng.', cluster: 'Cụm Tà Pạ', ...getStopDetails('PL011', 'Cánh đồng lúa Tà Pạ') },
        { stepIndex: 3, time: '08:15', id: 'FD009', name: 'Ăn sáng Bún nước lèo Sơ Nương', distanceToNext: '📍 Di chuyển 1.2km (4 phút)', reminder: '⚠️ Quán đóng cửa lúc 11:00 sáng! Nên đến trước 09:30.', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD009', 'Bún nước lèo Sơ Nương') },
        { stepIndex: 4, time: '09:15', id: 'HG002 + FD024', name: 'Chùa Xà Tón + Bánh kẹp thốt nốt Chùa Cũ', distanceToNext: '📍 Di chuyển 4.5km (12 phút)', desc: 'Chiêm bái ngôi chùa Khmer cổ nhất An Giang >500 năm và lưu giữ Kinh Lá Buông.', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('HG002', 'Chùa Xà Tón') },
        { stepIndex: 5, time: '10:15', id: 'CK010 + CK004', name: 'Cổng Trời Koh Kas + Vòm Còng Châu Lăng', distanceToNext: '📍 Di chuyển 2.1km (6 phút)', desc: 'Check-in cổng chùa cổ giữa đồng thốt nốt và con đường hàng còng rợp bóng.', cluster: 'Cụm Châu Lăng', ...getStopDetails('CK010', 'Cổng Trời Koh Kas') },
        { stepIndex: 6, time: '12:00', id: 'FD006', name: 'Ăn trưa Đu đủ đâm RiNa Chau Lăng', distanceToNext: '📍 Di chuyển 0.8km (2 phút)', reminder: '⚠️ Mở cửa đúng 12:00 trưa! (Không bán buổi sáng)', cluster: 'Cụm Châu Lăng', ...getStopDetails('FD006', 'Đu đủ đâm RiNa') },
        { stepIndex: 7, time: '12:45', id: 'FD011 + FD020', name: 'Mua bánh bò Út Cột + Đường thốt nốt Út Huệ', distanceToNext: '📍 Di chuyển 6.5km (15 phút)', desc: 'Mua đặc sản bánh bò nướng cốt dừa và đường thốt nốt ngào thủ công về làm quà.', cluster: 'Cụm Châu Lăng', ...getStopDetails('FD011', 'Bánh bò Út Cột') },
        { stepIndex: 8, time: '13:30', id: 'FD001 + CK012', name: 'Thưởng thức Gà đốt Ô Thum + Cầu gỗ hồ Ô Thum', distanceToNext: '📍 Di chuyển 7.0km (16 phút)', reminder: '🔥 BẮT BỤỢC: Gọi điện đặt trước gà 45–60 phút trước khi đến!', cluster: 'Cụm Ô Thum', ...getStopDetails('FD001', 'Gà đốt Ô Thum') },
        { stepIndex: 9, time: '15:30', id: 'CF001 + CK013', name: 'Cà phê Ruộng (View cầu gỗ giữa đồng lúa)', distanceToNext: '📍 Di chuyển 3.0km (8 phút)', desc: 'Nghỉ ngơi thưởng thức cà phê ngắm rặng núi Cô Tô mờ sương.', cluster: 'Cụm Tà Pạ', ...getStopDetails('CF001', 'Cà phê Ruộng') },
        { stepIndex: 10, time: '16:30', id: 'CK001 + PL020', name: 'Đường tuyến tránh ĐT941 + Bãi thả diều', distanceToNext: '📍 Di chuyển 2.5km (6 phút)', desc: 'Khung giờ vàng hoàng hôn uốn lượn rực rỡ nhất miền Tây.', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('CK001', 'Tuyến Tránh Tri Tôn') },
        { stepIndex: 11, time: '18:30', id: 'FD017 + PL022', name: 'Bò nướng trái trúc + Dạo chơi Chợ đêm Tri Tôn', desc: 'Thưởng thức bò nướng thơm lừng lá trúc và khám phá ẩm thực chợ đêm.', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD017', 'Bò nướng trái trúc') }
      ]
    }
  ];

  // 2-DAY CANONICAL TOUR
  const tour2Day: TourDay[] = [
    {
      dayNumber: 1,
      dayTitle: '🌙 Ngày 1: Tà Pạ – Soài So – Ô Thum – Hoàng Hôn Tuyến Tránh (Ngủ Homestay)',
      stops: [
        { stepIndex: 1, time: '05:30', id: 'PL001 + HG001', name: 'Bình minh Hồ Tà Pạ & Chùa Tà Pạ', distanceToNext: '📍 Di chuyển 3.5km', cluster: 'Cụm Tà Pạ', ...getStopDetails('PL001', 'Hồ Tà Pạ') },
        { stepIndex: 2, time: '08:00', id: 'FD009', name: 'Ăn sáng Bún nước lèo Sơ Nương', distanceToNext: '📍 Di chuyển 4.2km', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD009', 'Bún nước lèo Sơ Nương') },
        { stepIndex: 3, time: '10:15', id: 'PL002 + PL016 + CK015', name: 'Cụm Soài So: Hồ Soài So + Suối Vàng + Cầu cây', distanceToNext: '📍 Di chuyển 1.5km', desc: 'Khám phá lòng hồ Soài So lộng gió dưới chân núi Cô Tô.', cluster: 'Cụm Soài So', ...getStopDetails('PL002', 'Hồ Soài So') },
        { stepIndex: 4, time: '11:30', id: 'CF010 + CF006', name: 'Cà phê Mùa Gió Lên / An Sơn view hồ', distanceToNext: '📍 Di chuyển 6.8km', cluster: 'Cụm Soài So', ...getStopDetails('CF010', 'Cà phê Mùa Gió Lên') },
        { stepIndex: 5, time: '13:00', id: 'FD001', name: 'Thưởng thức Gà đốt Ô Thum lá trúc', distanceToNext: '📍 Di chuyển 7.5km', reminder: '🔥 Nhắc AI: Gọi điện đặt trước 45 phút!', cluster: 'Cụm Ô Thum', ...getStopDetails('FD001', 'Gà đốt Ô Thum') },
        { stepIndex: 6, time: '16:00', id: 'CK001 + PL020', name: 'Hoàng hôn Tuyến Tránh & Bãi thả diều', distanceToNext: '📍 Di chuyển 2.0km', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('CK001', 'Tuyến Tránh Tri Tôn') },
        { stepIndex: 7, time: '18:30', id: 'PL022 + FD017', name: 'Chợ đêm Tri Tôn & Bò nướng trái trúc', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD017', 'Bò nướng trái trúc') }
      ]
    },
    {
      dayNumber: 2,
      dayTitle: '🌙 Ngày 2: Về Nguồn Ba Chúc + An Tức (~45km)',
      stops: [
        { stepIndex: 1, time: '06:30', id: 'FD013', name: 'Ăn sáng Bánh canh Lò Rèn gia truyền >30 năm', distanceToNext: '📍 Di chuyển 18.0km', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD013', 'Bánh canh Lò Rèn') },
        { stepIndex: 2, time: '08:00', id: 'HG005 + HG006 + HG007', name: 'Nhà mồ Ba Chúc + Chùa Phi Lai + Chùa Tam Bửu', distanceToNext: '📍 Di chuyển 1.2km', desc: 'Viếng di tích lịch sử quốc gia và cầu an tại các ngôi chùa cổ kính.', cluster: 'Cụm Ba Chúc', ...getStopDetails('HG005', 'Nhà mồ Ba Chúc') },
        { stepIndex: 3, time: '09:45', id: 'FD015', name: 'Cháo bò trái trúc Ba Chúc', distanceToNext: '📍 Di chuyển 5.0km', reminder: '⚠️ Mở cửa đến 14:00 chiều.', cluster: 'Cụm Ba Chúc', ...getStopDetails('FD015', 'Cháo bò trái trúc Ba Chúc') },
        { stepIndex: 4, time: '10:30', id: 'CK008 + PL013', name: 'Cung đường biên giới Kênh Vĩnh Tế + Đồng lúa Ba Chúc', distanceToNext: '📍 Di chuyển 12.5km', cluster: 'Cụm Ba Chúc', ...getStopDetails('CK002', 'Con đường biên giới') },
        { stepIndex: 5, time: '12:00', id: 'PL010', name: 'Khu du lịch Đồi Tức Dụp (Hang đá 128 ngày đêm)', distanceToNext: '📍 Di chuyển 4.5km', desc: 'Khám phá ngọn đồi lịch sử kiên cường và hệ thống hang đá tự nhiên.', cluster: 'Cụm An Tức', ...getStopDetails('PL010', 'Đồi Tức Dụp') },
        { stepIndex: 6, time: '15:00', id: 'CK009 + CK018 + CK019', name: 'Thốt nốt trái tim An Tức + Cầu khỉ + Quầy thốt nốt tươi', distanceToNext: '📍 Di chuyển 6.0km', cluster: 'Cụm An Tức', ...getStopDetails('CK009', 'Thốt nốt trái tim An Tức') },
        { stepIndex: 7, time: '16:30', id: 'PL020 + CK001', name: 'Hoàng hôn chốt tour: Bãi thả diều / Tuyến tránh ĐT941', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('CK001', 'Tuyến Tránh Tri Tôn') }
      ]
    }
  ];

  // 3-DAY CANONICAL TOUR
  const tour3Day: TourDay[] = [
    {
      dayNumber: 1,
      dayTitle: '⛰️ Ngày 1: Tà Pạ – Soài So – Ô Thum (Khám phá Đông & Nam Tri Tôn)',
      stops: tour2Day[0].stops
    },
    {
      dayNumber: 2,
      dayTitle: '⛰️ Ngày 2: Châu Lăng – Ô Thum – An Tức (Văn Hóa Khmer & Di Tích)',
      stops: [
        { stepIndex: 1, time: '06:00', id: 'CK010 + CK011', name: 'Săn ảnh Cổng Trời Koh Kas sáng sớm + Thốt nốt cô độc', distanceToNext: '📍 Di chuyển 3.0km', cluster: 'Cụm Châu Lăng', ...getStopDetails('CK010', 'Cổng Trời Koh Kas') },
        { stepIndex: 2, time: '08:00', id: 'CK004 + HG003', name: 'Vòm Còng Châu Lăng & Chùa Hàng Còng', distanceToNext: '📍 Di chuyển 4.0km', cluster: 'Cụm Châu Lăng', ...getStopDetails('CK004', 'Vòm Còng Châu Lăng') },
        { stepIndex: 3, time: '12:00', id: 'FD006 → FD001 + PL014', name: 'Đu đủ đâm RiNa → Gà đốt Ô Thum + Vườn nho sinh thái', distanceToNext: '📍 Di chuyển 6.5km', cluster: 'Cụm Châu Lăng / Ô Thum', ...getStopDetails('FD006', 'Đu đủ đâm RiNa') },
        { stepIndex: 4, time: '15:00', id: 'CK009 + PL010', name: 'Thốt nốt trái tim An Tức + Đồi Tức Dụp', distanceToNext: '📍 Di chuyển 5.5km', cluster: 'Cụm An Tức', ...getStopDetails('CK009', 'Thốt nốt trái tim An Tức') },
        { stepIndex: 5, time: '18:30', id: 'FD017 + PL022', name: 'Bò nướng trái trúc + Khám phá Chợ đêm', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD017', 'Bò nướng trái trúc') }
      ]
    },
    {
      dayNumber: 3,
      dayTitle: '⛰️ Ngày 3: Ô Tà Sóc – Núi Dài (~40km Sinh Thái Kháng Chiến)',
      stops: [
        { stepIndex: 1, time: '07:00', id: 'PL012 + HG008 + PL005', name: 'Rừng tầm vông + Căn cứ Ô Tà Sóc + Hồ Ô Tà Sóc', distanceToNext: '📍 Di chuyển 8.0km', desc: 'Hành trình sinh thái xuyên qua rừng tầm vông xanh ngát và di tích lịch sử.', cluster: 'Cụm Lương Phi', ...getStopDetails('PL012', 'Ô Tà Sóc') },
        { stepIndex: 2, time: '10:00', id: 'CK007 + PL017', name: 'Cung đường ven vách đá Núi Dài', distanceToNext: '📍 Di chuyển 12.0km', cluster: 'Cụm Tây Núi Dài', ...getStopDetails('CK001', 'Núi Dài') },
        { stepIndex: 3, time: '12:00', id: 'FD009 / FD013', name: 'Ăn trưa thị trấn (Bún nước lèo / Bánh canh Lò Rèn)', distanceToNext: '📍 Di chuyển 6.0km', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('FD009', 'Bún nước lèo Sơ Nương') },
        { stepIndex: 4, time: '14:00', id: 'PL006 + CF015', name: 'Hồ Ô Tà Lọt hoang sơ + Cà phê suối', distanceToNext: '📍 Di chuyển 7.0km', desc: 'Option trek Vách đá Latina (PL019).', cluster: 'Cụm Ô Tà Lọt', ...getStopDetails('PL001', 'Hồ Ô Tà Lọt') },
        { stepIndex: 5, time: '16:30', id: 'CK001', name: 'Hoàng hôn chốt tour: Con đường Tuyến Tránh ĐT941', cluster: 'Thị trấn Tri Tôn', ...getStopDetails('CK001', 'Tuyến Tránh Tri Tôn') }
      ]
    }
  ];

  const currentPlan = days === '1' ? tour1Day : days === '2' ? tour2Day : tour3Day;

  const handleGenerateTour = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Thuật Toán Lập Tour Sơ Đồ Node GIS WGS84"
        badgeIcon={Sparkles}
        title="BỘ LỊCH TRÌNH CHUẨN DU LỊCH TRI TÔN AI"
        subtitle="Thuật toán ghép cụm địa lý ngắn nhất, không chạy quay đầu, chuẩn ma trận giờ mở cửa quán ăn & chốt hoàng hôn tại vị trí vàng."
        countLabel="Số ngày tour đang xem"
        countValue={days === '1' ? '1 Ngày Classic' : days === '2' ? '2 Ngày 1 Đêm' : '3 Ngày 2 Đêm'}
      />

      {/* TRIP GENERATOR PREFERENCE FORM */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#1B4D3E]" />
          <span>Tùy Chỉnh Phong Cách Du Lịch Của Bạn</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Duration Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Chọn Lịch Trình Mẫu</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: '1', label: '1 Ngày' },
                { key: '2', label: '2N1Đ' },
                { key: '3', label: '3N2Đ' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDays(item.key as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    days === item.key
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-sm'
                      : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#1B4D3E]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Phong Cách Ưa Thích</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-[#F8F9FA] focus:outline-none focus:border-[#1B4D3E]"
            >
              <option value="nature">Săn Ảnh & Danh Thắng Thiên Nhiên</option>
              <option value="culture">Văn Hóa & Chùa Nam Tông Khmer</option>
              <option value="food">Tín Đồ Ẩm Thực Gà Đốt Ô Thum</option>
              <option value="homestay">Nghỉ Dưỡng Homestay View Núi</option>
            </select>
          </div>

          {/* Transport Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Phương Tiện Di Chuyển</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransport('bike')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  transport === 'bike'
                    ? 'bg-[#D99B26] text-slate-900 border-[#D99B26] shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#D99B26]'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Xe Máy</span>
              </button>

              <button
                type="button"
                onClick={() => setTransport('car')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  transport === 'car'
                    ? 'bg-[#D99B26] text-slate-900 border-[#D99B26] shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 border-slate-200 hover:border-[#D99B26]'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Ô Tô</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerateTour}
            disabled={isGenerating}
            className="px-8 py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span>{isGenerating ? 'AI Đang Tính Lộ Trình...' : 'Nạp Lịch Trình Tối Ưu'}</span>
          </button>
        </div>
      </section>

      {/* ITINERARY RESULT VISUAL NODE DIAGRAM */}
      <div className="space-y-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#D99B26] uppercase tracking-wider block mb-1">🗺️ SƠ ĐỒ LỊCH TRÌNH NODE CHI TIẾT</span>
            <h2 className="text-2xl font-bold text-slate-900">
              Lịch Trình Chi Tiết Tour {days === '1' ? '1 Ngày Classic' : days === '2' ? '2 Ngày 1 Đêm' : '3 Ngày 2 Đêm'}
            </h2>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-900 text-xs font-bold shadow-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Xuất QR Code & Tải PDF Lịch Trình</span>
          </button>
        </div>

        {/* Render Each Day as Visual Diagram Flow */}
        {currentPlan.map((dayPlan) => (
          <div key={dayPlan.dayNumber} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            
            {/* Header Day */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1B4D3E]" />
                <span>{dayPlan.dayTitle}</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {dayPlan.stops.length} Mốc Điểm Đến Node
              </span>
            </div>

            {/* Visual Node Diagram Flow */}
            <div className="relative space-y-6">
              {dayPlan.stops.map((stop, idx) => (
                <React.Fragment key={idx}>
                  
                  {/* STOP CARD NODE */}
                  <div className="group relative flex flex-col md:flex-row items-stretch rounded-3xl bg-[#F8F9FA] border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    
                    {/* Left Step Badge & Photo Thumbnail */}
                    <div className="relative w-full md:w-72 h-52 md:h-auto overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={stop.img}
                        alt={stop.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                      {/* Step Number Node Circle */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 font-extrabold text-xs shadow-md border border-amber-300/40">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">
                          {stop.stepIndex}
                        </span>
                        <span>NODE #{stop.stepIndex}</span>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700/90 text-white font-bold text-xs shadow-md">
                        <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                        <span>{stop.rating || 4.8}</span>
                      </div>

                      {/* Category Label */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-slate-900/70 inline-block mb-1">
                          {stop.category}
                        </span>
                        <h4 className="text-base font-extrabold line-clamp-1">
                          {stop.name}
                        </h4>
                      </div>
                    </div>

                    {/* Right Content Body */}
                    <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                      
                      <div className="space-y-2">
                        {/* Time & Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-[#1B4D3E] text-white font-mono font-bold text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-300" />
                              <span>{stop.time}</span>
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                              ID: {stop.id}
                            </span>
                            {stop.cluster && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                                {stop.cluster}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{stop.commune}</span>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {stop.name}
                        </h3>

                        {stop.desc && (
                          <p className="text-xs text-slate-600 leading-relaxed font-light">
                            {stop.desc}
                          </p>
                        )}

                        {stop.reminder && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{stop.reminder}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Links & TikTok Hashtags */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                        
                        {/* TikTok Hashtag Link */}
                        <a
                          href={`https://www.tiktok.com/tag/${stop.hashtag}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-extrabold shadow-sm transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>#{stop.hashtag}</span>
                        </a>

                        {/* TikTok Search Link */}
                        <a
                          href={`https://www.tiktok.com/search?q=${encodeURIComponent(stop.name + " Tri Tôn An Giang")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                        >
                          <span>Xem TikTok Video Thực Tế</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Google Maps GPS Route */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + " Tri Tôn An Giang")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-300" />
                          <span>Chỉ đường GPS</span>
                        </a>
                      </div>

                    </div>
                  </div>

                  {/* CONNECTING STEPPER ARROW NODE TO NEXT STOP */}
                  {stop.distanceToNext && (
                    <div className="flex items-center justify-center my-3">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300 text-xs font-black shadow-xs animate-pulse">
                        <ArrowDown className="w-4 h-4 text-emerald-700" />
                        <span>{stop.distanceToNext}</span>
                      </div>
                    </div>
                  )}

                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SEASONAL VARIANTS DISPLAY */}
      <div className="my-10">
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900">🎚️ Biến Thể Lịch Trình Theo Mùa / Sự Kiện</h3>
          </div>
          <p className="text-xs text-slate-600">Thuật toán AI tự động hoán đổi slot điểm đến phù hợp theo điều kiện tự nhiên:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-amber-800 block mb-1">🌾 Mùa lúa chín & Nước nổi (T9–T11):</span>
              <p className="text-slate-700">Ưu tiên Cánh đồng lúa Tà Pạ (PL011) & Con đường tơ lụa (CK002) vào slot 07:00 sáng; chèn Con đường tơ lụa Soài Chék (CK003).</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-rose-800 block mb-1">🐂 Dịp Lễ hội Đua bò Sene Dolta (T9–T10 Âm lịch):</span>
              <p className="text-slate-700">Chèn sự kiện EV001 Lễ hội Đua bò vào slot 14:00–17:00; chuyển bãi thả diều PL020 thành khu vực khán đài xem đua bò.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-amber-900 block mb-1">☀️ Mùa khô nắng nóng (T3–T5):</span>
              <p className="text-slate-700">Giảm thời lượng tại các hồ (nước cạn); tăng trải nghiệm Suối Soài So (PL016) và Đồi Tức Dụp (PL010).</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-indigo-900 block mb-1">🌙 Khách đến muộn sau 20:00:</span>
              <p className="text-slate-700">Đổi địa điểm ăn tối sang Gà đốt Kim Suổl (FD003) mở cửa đến 23:00 khuya.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1 md:col-span-2 lg:col-span-2">
              <span className="font-extrabold text-emerald-900 block mb-1">👨‍👩‍👧‍👦 Gia đình có trẻ nhỏ:</span>
              <p className="text-slate-700">Bỏ các đoạn trekking dốc Núi Dài; chèn Vườn nho sinh thái PL014 (vé 10k) + Vườn mãng cầu PL015.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ItineraryExportModal
          onClose={() => setShowExportModal(false)}
          tourTitle={days === '1' ? 'Tour 1 Ngày Classic Bảy Núi' : days === '2' ? 'Tour 2 Ngày 1 Đêm Thất Sơn' : 'Tour 3 Ngày 2 Đêm Trải Nghiệm Chuyên Sâu'}
          duration={days === '1' ? '1 Ngày (05:30 - 21:00)' : days === '2' ? '2 Ngày 1 Đêm' : '3 Ngày 2 Đêm'}
          totalSpots={currentPlan.reduce((acc, d) => acc + d.stops.length, 0)}
        />
      )}
    </>
  );
}
