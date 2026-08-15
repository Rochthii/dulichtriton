import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import ChatbotWidget from "../components/ChatbotWidget";
import MobileBottomNav from "../components/MobileBottomNav";
import SecurityConsoleShield from "../components/SecurityConsoleShield";

export const metadata: Metadata = {
  title: "Tri Tôn AI Tourism - Nền Tảng Du Lịch Thông Minh Vùng Bảy Núi",
  description: "Khám phá Tri Tôn, An Giang cùng trợ lý AI: 149 địa điểm đã xác minh thực tế, cẩm nang ẩm thực Gà Đốt Ô Thum, di sản văn hóa Khmer và bản đồ tương tác.",
  manifest: "/manifest.json",
  themeColor: "#0E8C7F",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0E8C7F" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF3E7] text-[#26221B] antialiased font-body mobile-scroll-wrapper pb-16 sm:pb-0" suppressHydrationWarning>
        <SecurityConsoleShield />
        <SiteNav />
        <main className="flex-grow">{children}</main>
        <SiteFooter />
        <ChatbotWidget />
        <MobileBottomNav />
      </body>
    </html>
  );
}
