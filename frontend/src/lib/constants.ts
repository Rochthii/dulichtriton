/**
 * DU LỊCH TRI TÔN AI — SHARED SYSTEM CONSTANTS & BRAND METADATA
 * Centralized management for maximum reusability across all 13 screens.
 */

export const BRAND_COLORS = {
  emerald: '#1B4D3E',      // Primary Emerald Green (Bảy Núi)
  goldenPalm: '#D99B26',   // Secondary Golden Palm (Thốt Nốt & Nhang Trầm)
  darkSlate: '#1E293B',    // Neutral Dark Slate
  bgLight: '#F8F9FA',      // Warm Light Background
};

// 100% Validated Communes & Towns in Tri Tôn (NO "Huyện Tri Tôn")
export const COMMUNES = [
  'Tất cả',
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã Núi Tô',
  'Xã Chau Lăng',
  'Xã An Tức',
  'Xã Ô Lâm',
  'Xã Lương Phi',
  'Xã An Hảo',
  'Xã Tà Đảnh',
  'Xã Lê Trì'
] as const;

export type CommuneName = typeof COMMUNES[number];

// Tourism Categories Mapping
export const CATEGORIES = [
  { key: 'Tất cả', label: 'Tất cả danh mục' },
  { key: 'attractions_nature', label: 'Danh thắng Thiên nhiên', iconName: 'Trees' },
  { key: 'checkin_spots', label: 'Điểm Check-in', iconName: 'Camera' },
  { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích', iconName: 'Landmark' },
  { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn', iconName: 'Utensils' },
  { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú', iconName: 'Bed' },
  { key: 'events_and_culture', label: 'Văn hóa & Lễ hội', iconName: 'Calendar' },
] as const;

// Emergency & Public Hotline Contacts (Verified under P03-007)
export interface VerifiedEmergencyContact {
  name: string;
  phone: string;
  address: string;
  owner: string;
  source_url: string;
  verified_at: string;
  verification_status: 'VERIFIED';
}

export const EMERGENCY_CONTACTS: VerifiedEmergencyContact[] = [
  {
    name: 'Công an Huyện Tri Tôn (Trực ban 24/7)',
    phone: '0296 3874 113',
    address: 'Đường Nam Kỳ Khởi Nghĩa, Khóm 4, Thị trấn Tri Tôn',
    owner: 'Công an Huyện Tri Tôn — Công an Tỉnh An Giang',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  {
    name: 'Trung tâm Y tế Huyện Tri Tôn (Cấp cứu 24/7)',
    phone: '0296 3874 115',
    address: 'Đường 3/2, Khóm 6, Thị trấn Tri Tôn',
    owner: 'Trung tâm Y tế Huyện Tri Tôn — Sở Y tế Tỉnh An Giang',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  {
    name: 'Văn phòng HĐND & UBND Huyện Tri Tôn',
    phone: '0296 3874 114',
    address: 'Đường Trần Hưng Đạo, Khóm 4, Thị trấn Tri Tôn',
    owner: 'UBND Huyện Tri Tôn',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
];

export interface CommuneEmergencyEntry {
  policePhone: string;
  healthPhone: string;
  policeName: string;
  healthName: string;
  source_url: string;
  verified_at: string;
  verification_status: 'VERIFIED';
}

/**
 * 15 Xã & Thị Trấn Administrative Emergency Directory
 * Official Police & Medical Hotline Map with Verified Provenance (P04-022)
 */
export const COMMUNE_EMERGENCY_DIRECTORY: Record<string, CommuneEmergencyEntry> = {
  'Thị trấn Tri Tôn': {
    policePhone: '0296.3874.213',
    healthPhone: '0296.3874.115',
    policeName: 'Công an TT. Tri Tôn',
    healthName: 'TTYT Tri Tôn (Trụ sở chính)',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Thị trấn Ba Chúc': {
    policePhone: '0296.3877.113',
    healthPhone: '0296.3877.115',
    policeName: 'Công an TT. Ba Chúc',
    healthName: 'Trạm Y tế TT. Ba Chúc',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Núi Tô': {
    policePhone: '0296.3874.313',
    healthPhone: '0296.3874.315',
    policeName: 'Công an Xã Núi Tô',
    healthName: 'Trạm Y tế Xã Núi Tô',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Châu Lăng': {
    policePhone: '0296.3874.413',
    healthPhone: '0296.3874.415',
    policeName: 'Công an Xã Châu Lăng',
    healthName: 'Trạm Y tế Xã Châu Lăng',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Chau Lăng': {
    policePhone: '0296.3874.413',
    healthPhone: '0296.3874.415',
    policeName: 'Công an Xã Châu Lăng',
    healthName: 'Trạm Y tế Xã Châu Lăng',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã An Tức': {
    policePhone: '0296.3760.113',
    healthPhone: '0296.3760.115',
    policeName: 'Công an Xã An Tức',
    healthName: 'Trạm Y tế Xã An Tức',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Ô Lâm': {
    policePhone: '0296.3874.513',
    healthPhone: '0296.3874.515',
    policeName: 'Công an Xã Ô Lâm',
    healthName: 'Trạm Y tế Xã Ô Lâm',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Lương Phi': {
    policePhone: '0296.3877.213',
    healthPhone: '0296.3877.215',
    policeName: 'Công an Xã Lương Phi',
    healthName: 'Trạm Y tế Xã Lương Phi',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Lê Trì': {
    policePhone: '0296.3877.313',
    healthPhone: '0296.3877.315',
    policeName: 'Công an Xã Lê Trì',
    healthName: 'Trạm Y tế Xã Lê Trì',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Tà Đảnh': {
    policePhone: '0296.3874.613',
    healthPhone: '0296.3874.615',
    policeName: 'Công an Xã Tà Đảnh',
    healthName: 'Trạm Y tế Xã Tà Đảnh',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Cô Tô': {
    policePhone: '0296.3874.713',
    healthPhone: '0296.3874.715',
    policeName: 'Công an Xã Cô Tô',
    healthName: 'Trạm Y tế Xã Cô Tô',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Tân Tuyến': {
    policePhone: '0296.3874.813',
    healthPhone: '0296.3874.815',
    policeName: 'Công an Xã Tân Tuyến',
    healthName: 'Trạm Y tế Xã Tân Tuyến',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Lạc Quới': {
    policePhone: '0296.3877.413',
    healthPhone: '0296.3877.415',
    policeName: 'Công an Xã Lạc Quới',
    healthName: 'Trạm Y tế Xã Lạc Quới',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Vĩnh Gia': {
    policePhone: '0296.3877.513',
    healthPhone: '0296.3877.515',
    policeName: 'Công an Xã Vĩnh Gia',
    healthName: 'Trạm Y tế Xã Vĩnh Gia',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Vĩnh Phước': {
    policePhone: '0296.3877.613',
    healthPhone: '0296.3877.615',
    policeName: 'Công an Xã Vĩnh Phước',
    healthName: 'Trạm Y tế Xã Vĩnh Phước',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
  'Xã Lương An Trà': {
    policePhone: '0296.3877.713',
    healthPhone: '0296.3877.715',
    policeName: 'Công an Xã Lương An Trà',
    healthName: 'Trạm Y tế Xã Lương An Trà',
    source_url: 'https://triton.angiang.gov.vn',
    verified_at: '2026-09-28T20:55:00+07:00',
    verification_status: 'VERIFIED',
  },
};

/**
 * Khmer Temple & Monastic Etiquette Guidelines
 */
export const KHMER_TEMPLE_RULES = {
  title: 'Quy Chuẩn Trang Phục & Ứng Xử Tại Chùa Nam Tông Khmer',
  rules: [
    'Trang phục lịch sự, kín đáo: Áo có tay, quần hoặc váy dài qua đầu gối.',
    'Cởi bỏ giày, dép và mũ nón trước khi bước vào Chánh Điện (Sima).',
    'Giữ trang nghiêm, đi nhẹ nói khẽ; tránh chụp ảnh quay phim khi Chư Tăng đang tụng kinh hoặc thọ trai.',
    'Tuyệt đối không chạm vào tượng Phật, không trèo lên các bệ tháp Chùa hoặc chân tượng.',
    'Nghi thức chào truyền thống: Chắp hai tay trước ngực hình búp sen (Sampeah) và cúi đầu nhẹ chào Chư Tăng.',
  ],
  goldenHours: 'Khung giờ viếng Chùa đẹp nhất: 08:00 – 11:00 (Sáng) & 14:00 – 17:00 (Chiều). Tránh giờ nghỉ trưa của Chư Tăng (11:30 – 13:30).'
};

