export interface TikTokVideo {
  id: string;
  tiktokVideoId: string;
  tiktokUrl: string;
  username: string;
  userDisplayName: string;
  userAvatar?: string;
  description: string;
  location: string;
  locationAddress?: string;
  thumbnail: string;
  publishedAt: string;
  viewsCount?: string;
  likesCount?: string;
  sharesCount?: string;
  musicTrack?: string;
  isNew?: boolean;
}

export type LocationFilter = 'Tất cả' | 'Tà Pạ' | 'Chùa Koh Kas' | 'Núi Cô Tô' | 'Hồ Soài Chek' | 'Cây Thốt Nốt' | 'Ẩm Thực' | 'Lễ Hội';

export interface FeedStats {
  totalVideos: number;
  totalViews: string;
  totalLocations: number;
}
