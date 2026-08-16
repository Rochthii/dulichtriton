import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import ChatbotWidget from "../components/ChatbotWidget";
import MobileBottomNav from "../components/MobileBottomNav";
import SecurityConsoleShield from "../components/SecurityConsoleShield";
import InstallPwaBanner from "../components/InstallPwaBanner";

export const viewport: Viewport = {
  themeColor: "#0E8C7F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dulichtriton.vn'),
  title: {
    default: "Du Lịch Tri Tôn AI — Nền Tảng Du Lịch Thông Minh Vùng Bảy Núi",
    template: "%s | Du Lịch Tri Tôn AI"
  },
  description: "Cẩm nang du lịch Tri Tôn, An Giang: 132 địa điểm xác minh thực tế, ẩm thực Gà Đốt Ô Thum, di sản Khmer và bản đồ tương tác thông minh.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Du Lịch Tri Tôn AI — Khám Phá Kỳ Quan Vùng Bảy Núi An Giang",
    description: "Trợ lý AI hướng dẫn du lịch Tri Tôn, 132 điểm đến thực tế, 27 tour gợi ý và bản đồ số GIS.",
    url: "https://dulichtriton.vn",
    siteName: "Du Lịch Tri Tôn AI",
    images: [
      {
        url: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
        width: 1200,
        height: 630,
        alt: "Du Lịch Tri Tôn An Giang",
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
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF3E7] text-[#26221B] antialiased font-body mobile-scroll-wrapper pb-16 sm:pb-0" suppressHydrationWarning>
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
