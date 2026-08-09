import React from 'react';
import { MapPin, Heart, Video, ExternalLink, Shield, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0502] border-t border-white/10 pt-12 pb-8 text-white/50 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-white/10">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                <Video className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-base text-white">Tri Tôn TikTok</span>
            </div>
            <p className="text-white/50 leading-relaxed text-xs">
              Chuyên trang tổng hợp và khám phá video TikTok du lịch Tri Tôn, An Giang. Nơi tôn vinh vẻ đẹp thiên nhiên, con người và văn hóa đặc sắc vùng Bảy Núi.
            </p>
          </div>

          {/* Col 2: Notable Landmarks */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Điểm Đến Tri Tôn</span>
            </h4>
            <ul className="space-y-2 text-white/50">
              <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Cánh Đồng Tà Pạ & Chùa Tà Pạ</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Cổng Trời Chùa Koh Kas</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Núi Cô Tô (Phụng Hoàng Sơn)</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Hồ Soài Chek & Hồ Ô Tà Sóc</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Rặng Cây Thốt Nốt Trái Tim</span></li>
            </ul>
          </div>

          {/* Col 3: Cultural & Culinary */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              <span>Văn Hóa & Ẩm Thực</span>
            </h4>
            <ul className="space-y-2 text-white/50">
              <li><span>Lễ Hội Đua Bò Chùa Rô</span></li>
              <li><span>Bánh Bò Thốt Nốt Nướng</span></li>
              <li><span>Gà Đốt Ô Thum Trứ Danh</span></li>
              <li><span>Gỏi Đu Đủ Đuôi Bò Tri Tôn</span></li>
              <li><span>Kiến Trúc Chùa Khmer Cổ Kính</span></li>
            </ul>
          </div>

          {/* Col 4: Compliance & Technical */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>Cam Kết Kỹ Thuật</span>
            </h4>
            <p className="text-white/50 leading-relaxed text-[11px]">
              Tất cả video được nhúng trực tiếp qua trình phát chính thức <strong>TikTok Embed Player</strong>. Không lưu trữ hay sửa đổi nội dung của tác giả.
            </p>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-orange-400 hover:underline font-semibold"
            >
              <span>Trang chủ TikTok</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-white/40">
            © 2026 Tri Tôn TikTok • Trải nghiệm du lịch An Giang, Việt Nam.
          </p>
          <div className="flex items-center gap-1 text-white/40">
            <span>Xây dựng dành riêng cho du lịch Tri Tôn, An Giang</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
