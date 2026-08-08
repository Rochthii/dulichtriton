import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Du Lịch Tri Tôn',
    short_name: 'Tri Tôn',
    description: 'Trải nghiệm văn hóa Bảy Núi Tri Tôn với bản đồ Offline và AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FA',
    theme_color: '#1B4D3E',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
