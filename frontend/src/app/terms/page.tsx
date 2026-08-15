import React from 'react';
import Link from 'next/link';
import { Shield, FileText, ArrowLeft, CheckCircle2, Lock, Scale, AlertCircle, Compass, Mail, Phone } from 'lucide-react';

export const metadata = {
  title: 'Điều Khoản Sử Dụng | Du Lịch Tri Tôn AI',
  description: 'Điều khoản và điều kiện sử dụng Cổng thông tin & Trợ lý AI Du Lịch Tri Tôn, An Giang.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E7] text-[#26221B] font-body pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] hover:text-[#0A6B61] transition-colors mb-6 font-display group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại Trang Chủ</span>
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#151B34] to-[#1E2647] rounded-3xl p-6 sm:p-10 text-white shadow-lg border border-white/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E8C7F] text-[#FFD37A] text-xs font-bold font-display">
              <Scale className="w-3.5 h-3.5" />
              <span>Văn Bản Pháp Lý & Quy Chuẩn</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#FFFDF7] tracking-tight">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Chào mừng bạn đến với Cổng thông tin & Trợ lý Trí tuệ Nhân tạo Du Lịch Tri Tôn (An Giang). Việc sử dụng hệ thống đồng nghĩa với việc bạn đồng ý với các điều khoản dưới đây.
            </p>
            <div className="pt-2 text-[11px] text-[#FFD37A] font-mono">
              Hiệu lực cập nhật: Tháng 08/2026 • Phiên bản 2.4.0
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-10 border border-[#26221B]/8 shadow-xs space-y-8 text-sm leading-relaxed text-[#26221B]/90">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2>1. Giới Thiệu Về Nền Tảng & Mục Đích Phục Vụ</h2>
            </div>
            <p>
              Cổng thông tin <strong>Du Lịch Tri Tôn AI Platform</strong> là nền tảng phi thương mại hướng tới cộng đồng du khách và người dân bản địa, cung cấp dữ liệu số hóa thực địa về 149 địa điểm danh thắng, chùa Khmer, ẩm thực đặc sản (Gà đốt Ô Thum, Cháo bò Tri Tôn, v.v.), cơ sở lưu trú và cẩm nang di chuyển tại vùng đất Bảy Núi (Thất Sơn), tỉnh An Giang.
            </p>
            <p>
              Nền tảng được nghiên cứu, kiến trúc và phát triển bởi tác giả <strong>Chăm Rốch Thi</strong> (Cham Roch Thi) với định hướng tôn vinh bản sắc văn hóa Khmer - Kinh - Hoa và hỗ trợ quảng bá du lịch bền vững.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <FileText className="w-5 h-5 shrink-0" />
              <h2>2. Tính Xác Thực Của Dữ Liệu & Khuyến Cáo An Toàn Thực Địa</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6355]">
              <li>
                <strong>Dữ liệu thực địa:</strong> Toàn bộ 149 tọa độ GPS, giờ mở cửa, giá vé và khung giờ vàng đều được khảo sát và đối chiếu thực tế. Tuy nhiên, thời tiết vùng núi (mưa dông, sương mù trên đỉnh Cô Tô, Tà Pạ) hoặc các dịp lễ hội truyền thống (Chol Chnam Thmay, Sêne Đônta, Đua bò Bảy Núi) có thể làm thay đổi thời gian hoạt động của một số điểm đến.
              </li>
              <li>
                <strong>An toàn khi di chuyển đèo dốc:</strong> Du khách khi tự lái xe máy lên các triền dốc núi Cô Tô, Tà Pạ hoặc Ô Tà Sóc cần tuân thủ nghiêm ngặt biển báo giao thông, kiểm tra phanh xe và ưu tiên sử dụng dịch vụ xe ôm bản địa khi đường trơn trượt.
              </li>
              <li>
                <strong>Tôn trọng văn hóa tâm linh:</strong> Khi viếng thăm các ngôi chùa Phật giáo Nam tông Khmer (như chùa Xvayton, chùa Koh Kas, chùa Tà Pạ), du khách vui lòng mặc trang phục trang nghiêm, cởi giày dép trước khi vào chính điện và giữ gìn sự thanh tịnh nơi thờ tự.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h2>3. Trách Nhiệm Sử Dụng Trợ Lý AI</h2>
            </div>
            <p>
              Trợ lý AI Tri Tôn được tích hợp mô hình ngôn ngữ lớn (RAG) kết nối trực tiếp với cơ sở dữ liệu vector thực địa để gợi ý lịch trình thông minh. Các thông tin phản hồi từ AI mang tính chất tư vấn và gợi ý tối ưu. Người dùng cần chủ động xác thực tình trạng giao thông, thời tiết và an toàn cá nhân trong hành trình thực tế.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>4. Quyền Sở Hữu Trí Tuệ & Giấy Phép Sử Dụng</h2>
            </div>
            <p>
              Mã nguồn, thuật toán định tuyến, hệ thống nhận diện thực thể địa danh và phong cách thiết kế Folk-Modern Bảy Núi thuộc quyền sở hữu của <strong>Chăm Rốch Thi</strong>.
            </p>
            <p>
              Dữ liệu danh thắng, hình ảnh cộng đồng và video TikTok trải nghiệm thuộc bản quyền của các nhiếp ảnh gia và nhà sáng tạo nội dung đã được ghi nhận nguồn rõ ràng trên từng thẻ địa điểm.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-[#26221B]/8">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Compass className="w-5 h-5 shrink-0" />
              <h2>5. Thông Tin Liên Hệ & Đóng Góp Ý Kiến</h2>
            </div>
            <p>
              Mọi ý kiến đóng góp, cập nhật thông tin địa điểm mới hoặc phản hồi sai lệch dữ liệu thực địa, vui lòng liên hệ:
            </p>
            <div className="p-4 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 space-y-2 text-xs font-display">
              <div className="flex items-center gap-2 text-[#26221B]">
                <Mail className="w-4 h-4 text-[#0E8C7F]" />
                <span>Email tác giả: <a href="mailto:rochthi59@gmail.com" className="font-bold underline text-[#0E8C7F] hover:text-[#0A6B61]">rochthi59@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2 text-[#26221B]">
                <Phone className="w-4 h-4 text-[#F0A32F]" />
                <span>Đường dây nóng Cứu hộ Công an Tri Tôn: <strong>0296.3874.113</strong></span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
