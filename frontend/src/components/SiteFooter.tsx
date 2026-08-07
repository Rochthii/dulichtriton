import Link from "next/link";
import { Compass, Phone, ShieldCheck, MapPin, Heart, ExternalLink } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-heading font-extrabold text-xl">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Compass className="h-5 w-5 text-white" />
              </div>
              Tri Tôn AI Tourism
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng du lịch thông minh vùng Bảy Núi. Trợ lý AI đồng hành khám phá 82+ địa điểm danh thắng, ẩm thực và văn hóa đặc sắc tại Tri Tôn, An Giang.
            </p>
          </div>

          {/* Col 2: Khám phá */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/places" className="hover:text-emerald-400 transition-colors">
                  Địa điểm nổi bật
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-emerald-400 transition-colors">
                  Lịch trình gợi ý AI
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-emerald-400 transition-colors">
                  Bản đồ số du lịch
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-emerald-400 transition-colors">
                  Lễ hội Đua bò Khmer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dịch vụ */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dịch Vụ</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/food" className="hover:text-emerald-400 transition-colors">
                  Ẩm thực đặc sản
                </Link>
              </li>
              <li>
                <Link href="/stay" className="hover:text-emerald-400 transition-colors">
                  Lưu trú & Homestay
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-emerald-400 transition-colors">
                  Hướng dẫn viên AI 24/7
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-amber-400 transition-colors">
                  Cứu hộ khẩn cấp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hỗ trợ & Khẩn cấp */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hỗ Trợ Địa Phương</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Tri Tôn, Tỉnh An Giang, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <Phone className="h-4 w-4" />
                <span>Hotline: 0296.3874.112 (Công an Tri Tôn)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Cơ sở dữ liệu 82 địa điểm đã xác minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Tri Ton Tourism Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Powered by <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" /> Next.js & Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
