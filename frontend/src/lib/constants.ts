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

// Emergency & Public Hotline Contacts
export const EMERGENCY_CONTACTS = [
  { name: 'Trung tâm Y tế Tri Tôn', phone: '0296 3874 115', address: 'Thị trấn Tri Tôn' },
  { name: 'Công an Xã/Thị trấn Tri Tôn', phone: '0296 3874 213', address: 'Thị trấn Tri Tôn' },
  { name: 'Cứu hộ Du lịch Bảy Núi', phone: '0913 789 123', address: 'Hỗ trợ 24/7' },
  { name: 'Ban Quản lý Di tích Tức Dụp', phone: '0296 3760 123', address: 'Xã An Tức' },
];
