import { CheckinSpotItem } from './components/CheckinSpotsManager';

export interface PlaceRecord {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  tourism_category?: string;
  rating: number;
  image_url: string;
  photos?: string[];
  checkin_spots?: CheckinSpotItem[] | string;
  description: string;
  detailed_story?: string;
  phone?: string;
  open_late?: boolean;
  night_hours?: string;
  golden_time_windows?: string;
  price_level?: string;
  video_url?: string;
  is_hot?: boolean;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export const COMMUNES = [
  'ALL',
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã Núi Tô',
  'Xã Cô Tô',
  'Xã Ô Lâm',
  'Xã An Tức',
  'Xã Châu Lăng',
  'Xã Lương Phi',
  'Xã Lương An Trà',
  'Xã Tà Đảnh',
  'Xã Tân Tuyến',
  'Xã Vĩnh Phước',
  'Xã Vĩnh Gia',
  'Xã Lạc Quới',
  'Xã Lê Trì',
] as const;

export const CATEGORIES = [
  'ALL',
  'Danh thắng check-in',
  'Văn hóa & Tâm linh',
  'Ẩm thực & Đặc sản',
  'Quán Cà Phê',
  'Homestay & Lưu Trú',
  'Di tích Lịch sử',
] as const;

export const DEFAULT_NEW_PLACE: Partial<PlaceRecord> = {
  name: '',
  commune: 'Thị trấn Tri Tôn',
  category: 'Danh thắng check-in',
  tourism_category: 'Địa Điểm Tham Quan',
  rating: 4.8,
  image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
  photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'],
  description: '',
  detailed_story: '',
  phone: '',
  open_late: false,
  night_hours: '17:00 - 22:00',
  golden_time_windows: '06:00-08:00 • 16:00-17:30',
  price_level: 'Bình dân',
  video_url: '',
  latitude: 10.42,
  longitude: 105.01,
  is_hot: false,
  is_active: true,
};
