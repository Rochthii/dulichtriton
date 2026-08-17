import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import ChatbotWidget from "../components/ChatbotWidget";
import MobileBottomNav from "../components/MobileBottomNav";
import SecurityConsoleShield from "../components/SecurityConsoleShield";
import DeploymentAutoRecovery from "../components/DeploymentAutoRecovery";
import InstallPwaBanner from "../components/InstallPwaBanner";

export const viewport: Viewport = {
  themeColor: "#0E8C7F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dulichtriton.com'),
  title: {
    default: "Du Lịch Tri Tôn AI — Nền Tảng Du Lịch Thông Minh Vùng Bảy Núi",
    template: "%s | Du Lịch Tri Tôn AI"
  },
  description: "Cẩm nang du lịch Tri Tôn, An Giang: 149 địa điểm xác minh thực tế, ẩm thực Gà Đốt Ô Thum, di sản Khmer và bản đồ tương tác thông minh.",
  keywords: [
    'du lịch Tri Tôn', 'Tri Tôn An Giang', 'Bảy Núi', 'Hồ Tà Pạ', 'Tuyệt Tình Cốc',
    'Gà Đốt Ô Thum', 'chùa Khmer', 'Núi Cô Tô', 'Hồ Soài So', 'ẩm thực Bảy Núi',
    'tour Tri Tôn', 'du lịch An Giang', 'Thất Sơn', 'lịch trình Tri Tôn',
  ],
  alternates: {
    canonical: 'https://dulichtriton.com',
    languages: { 'vi-VN': 'https://dulichtriton.com' },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Du Lịch Tri Tôn AI — Khám Phá Kỳ Quan Vùng Bảy Núi An Giang",
    description: "Trợ lý AI hướng dẫn du lịch Tri Tôn, 149 điểm đến thực tế, 35 tour gợi ý và bản đồ số GIS.",
    url: "https://dulichtriton.com",
    siteName: "Du Lịch Tri Tôn AI",
    images: [
      {
        url: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
        width: 1200,
        height: 630,
        alt: "Du Lịch Tri Tôn An Giang — Hồ Tà Pạ Tuyệt Tình Cốc Bảy Núi",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Du Lịch Tri Tôn AI — Cẩm Nang Bảy Núi",
    description: "Khám phá danh thắng, chùa Khmer cổ kính và ẩm thực gà đốt Ô Thum Tri Tôn.",
    images: ["https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Du Lịch Tri Tôn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'googleb86c8a47cc2c384e',
  },
};

// JSON-LD Structured Data — WebSite + Organization + TouristDestination
const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://dulichtriton.com/#website',
      url: 'https://dulichtriton.com',
      name: 'Du Lịch Tri Tôn AI',
      description: 'Nền tảng du lịch thông minh vùng Bảy Núi Tri Tôn, An Giang với 149 địa điểm xác minh thực tế.',
      inLanguage: 'vi-VN',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://dulichtriton.com/places?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://dulichtriton.com/#organization',
      name: 'Du Lịch Tri Tôn AI',
      url: 'https://dulichtriton.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dulichtriton.com/icon.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://www.facebook.com/dulichtriton',
        'https://www.tiktok.com/@dulichtriton',
      ],
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Tri Tôn',
        containedInPlace: { '@type': 'State', name: 'An Giang', containedInPlace: { '@type': 'Country', name: 'Việt Nam' } },
      },
    },
    {
      '@type': 'TouristDestination',
      '@id': 'https://dulichtriton.com/#destination',
      name: 'Tri Tôn, An Giang',
      description: 'Huyện Tri Tôn thuộc vùng Bảy Núi (Thất Sơn), An Giang, Việt Nam. Nơi giao thoa độc đáo giữa văn hóa Khmer, cảnh quan núi rừng Tà Pạ và ẩm thực đặc sắc như Gà Đốt Ô Thum, Bánh Bò Thốt Nốt.',
      geo: { '@type': 'GeoCoordinates', latitude: 10.3996, longitude: 104.9783 },
      touristType: ['Du khách trong nước', 'Khách quốc tế', 'Phượt thủ', 'Gia đình'],
      includesAttraction: [
        { '@type': 'TouristAttraction', name: 'Hồ Tà Pạ (Tuyệt Tình Cốc)', url: 'https://dulichtriton.com/places/ho-ta-pa' },
        { '@type': 'TouristAttraction', name: 'Chùa Tà Pạ', url: 'https://dulichtriton.com/places/chua-ta-pa' },
        { '@type': 'TouristAttraction', name: 'Hồ Soài So', url: 'https://dulichtriton.com/places/ho-soai-so' },
        { '@type': 'TouristAttraction', name: 'Núi Cô Tô', url: 'https://dulichtriton.com/places/nui-co-to' },
        { '@type': 'Restaurant', name: 'Gà Đốt Ô Thum', url: 'https://dulichtriton.com/food' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Du lịch Tri Tôn An Giang có gì đẹp?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Tri Tôn nổi tiếng với Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi), Hồ Soài So, Cánh Đồng Lúa Tà Pạ, hệ thống chùa Khmer cổ kính (Chùa Xvayton, Chùa Tà Miệt), và đặc sản Gà Đốt Ô Thum nức tiếng cả nước.',
          },
        },
        {
          '@type': 'Question',
          name: 'Gà Đốt Ô Thum ăn ở đâu ngon nhất Tri Tôn?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Các quán Gà Đốt Ô Thum ngon nhất tại Tri Tôn gồm: Quán Thảo Nguyên Hồ Ô Thum, Quán Kiều Tiên, Quán Siêu (Chau Siêu) và Quán Kim Suổl — tất cả đều nằm tại bờ Hồ Ô Thum, Xã Ô Lâm.',
          },
        },
        {
          '@type': 'Question',
          name: 'Đường đi Hồ Tà Pạ như thế nào?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Từ chợ Tri Tôn, đi theo đường Nguyễn Trãi hướng Xã Núi Tô khoảng 4km đến chân đồi Tà Pạ, sau đó theo đường bê tông dốc 1.2km lên đỉnh. Xe máy và ô tô dưới 16 chỗ có thể lên tận nơi.',
          },
        },
        {
          '@type': 'Question',
          name: 'Thời điểm đẹp nhất để du lịch Tri Tôn là khi nào?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Tháng 9-11 là mùa lúa chín và mùa nước nổi đẹp nhất. Tháng 12-4 (mùa khô) thời tiết mát mẻ, lý tưởng để leo núi và thăm chùa Khmer. Mùa hè (5-8) có Lễ Hội Đua Bò Bảy Núi đặc sắc.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        {/* JSON-LD Global Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF3E7] text-[#26221B] antialiased font-body mobile-scroll-wrapper pb-16 sm:pb-0" suppressHydrationWarning>
        <DeploymentAutoRecovery />
        <SecurityConsoleShield />
        <SiteNav />
        <main className="flex-grow">{children}</main>
        <SiteFooter />
        <ChatbotWidget />
        <MobileBottomNav />
        <InstallPwaBanner />
      </body>
    </html>
  );
}
