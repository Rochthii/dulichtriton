import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, EyeOff, Database, Smartphone, CheckCircle, Mail, Server } from 'lucide-react';

export const metadata = {
  title: 'Chính Sách Bảo Mật | Du Lịch Tri Tôn AI',
  description: 'Chính sách bảo vệ dữ liệu cá nhân và quyền riêng tư của người dùng trên Cổng thông tin Du Lịch Tri Tôn AI.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E7] text-[#26221B] font-body pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bảo Vệ Quyền Riêng Tư & Dữ Liệu</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#FFFDF7] tracking-tight">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Cam kết bảo mật tuyệt đối dữ liệu người dùng, tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ Dữ liệu Cá nhân.
            </p>
            <div className="pt-2 text-[11px] text-[#FFD37A] font-mono">
              Hiệu lực cập nhật: Tháng 08/2026 • Được xây dựng bởi Chăm Rốch Thi
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-10 border border-[#26221B]/8 shadow-xs space-y-8 text-sm leading-relaxed text-[#26221B]/90">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <EyeOff className="w-5 h-5 shrink-0" />
              <h2>1. Nguyên Tắc Thu Thập Tối Thiểu (Zero-Tracking)</h2>
            </div>
            <p>
              Hệ thống Du Lịch Tri Tôn AI hoạt động với nguyên tắc <strong>không thu thập thông tin danh tính cá nhân không cần thiết</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6355]">
              <li>Không yêu cầu đăng ký tài khoản bắt buộc đối với du khách tra cứu thông thường.</li>
              <li>Không thu thập số điện thoại, email hay căn cước công dân của du khách khi sử dụng trợ lý AI.</li>
              <li>Không bán, chia sẻ hoặc thương mại hóa bất kỳ dữ liệu tìm kiếm nào cho bên thứ ba vì mục đích quảng cáo rác.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h2>2. Xử Lý Vị Trí Địa Lý (GPS Telemetry)</h2>
            </div>
            <p>
              Khi du khách sử dụng tính năng <em>"Tìm đường đi ngắn nhất"</em> hoặc <em>"Quán ăn gần tôi nhất"</em>, trình duyệt sẽ yêu cầu quyền truy cập vị trí hiện tại (GPS).
            </p>
            <p>
              Toàn bộ quá trình tính toán khoảng cách và định tuyến Google Maps được thực thi trực tiếp tại thiết bị của bạn (Client-side execution). Tọa độ GPS cá nhân của bạn <strong>không được lưu trữ vĩnh viễn</strong> trên máy chủ.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Database className="w-5 h-5 shrink-0" />
              <h2>3. Lưu Trữ Dữ Liệu Cục Bộ (LocalStorage & Cookie)</h2>
            </div>
            <p>
              Để mang lại trải nghiệm tiện lợi nhất mà không cần đăng nhập, hệ thống sử dụng bộ nhớ cục bộ trên thiết bị của bạn (Browser LocalStorage và Cookie) để lưu trữ:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6355]">
              <li>Danh sách địa điểm bạn đã bấm thả tim yêu thích (<code>triton_fav_places</code>).</li>
              <li>Mã định danh phiên hội thoại ngẫu nhiên (UUID v4) và mã xác thực quyền sở hữu mật mã HMAC-SHA256 phục vụ duy trì phiên.</li>
              <li>Các bản nháp lịch trình tùy chỉnh bạn đã lưu lại để chuẩn bị cho chuyến đi.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Server className="w-5 h-5 shrink-0" />
              <h2>4. Nơi Lưu Trữ Phiên Hội Thoại & Vòng Đời Tự Hủy (Chat Sessions Storage & Retention)</h2>
            </div>
            <p>
              Nội dung các lượt trò chuyện với Trợ lý AI được lưu trữ tạm thời trên máy chủ tại cơ sở dữ liệu Supabase PostgreSQL (bảng <code>public.chat_sessions</code>, tối đa 20 lượt trao đổi gần nhất) dưới mã phiên ngẫu nhiên UUID v4 được bảo vệ bởi chữ ký mật mã HMAC-SHA256 nhằm duy trì ngữ cảnh trò chuyện liên tục trong phiên làm việc.
            </p>
            <p>
              Tuân thủ Nghị định 13/2023/NĐ-CP và Quyết định Kiến trúc G3 (<code>DR-G3-RETENTION-SESSIONS-001</code>), dữ liệu hội thoại có thời hạn lưu trữ tự hủy tối đa <strong>chính xác 24 giờ</strong> kể từ lượt tương tác cuối cùng (sliding window TTL 24h) và được tự động xóa sạch bởi tác vụ bảo trì định kỳ. Bạn có toàn quyền chủ động xóa ngay lập tức phiên hội thoại của mình khỏi cơ sở dữ liệu bất cứ lúc nào thông qua nút <strong>Xóa chat</strong> (Quyền được xóa dữ liệu / Right to Erasure).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>5. An Toàn Máy Chủ & Mã Hóa Truyền Tải (SSL/TLS)</h2>
            </div>
            <p>
              Tất cả các lượt truy vấn, dữ liệu 149 địa danh và thông tin kết nối tới hệ thống Supabase PostgreSQL đều được mã hóa bằng giao thức HTTPS/TLS 1.3 theo tiêu chuẩn ngành. Cơ sở dữ liệu được bảo vệ nghiêm ngặt bằng Row-Level Security (RLS) và chính sách kiểm toán nhật ký (Audit Logging).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[#26221B]/8">
            <div className="flex items-center gap-2 text-[#0E8C7F] font-display font-bold text-base sm:text-lg">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>6. Đơn Vị Chịu Trách Nhiệm Vận Hành & Bảo Mật</h2>
            </div>
            <p>
              Hệ thống được thiết kế, vận hành và quản lý trực tiếp bởi nhà phát triển <strong>Chăm Rốch Thi</strong>. Mọi thắc mắc về quyền riêng tư và yêu cầu hỗ trợ dữ liệu, vui lòng liên hệ trực tiếp:
            </p>
            <div className="p-4 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 space-y-2 text-xs font-display">
              <div className="flex items-center gap-2 text-[#26221B]">
                <Mail className="w-4 h-4 text-[#0E8C7F]" />
                <span>Email bảo mật: <a href="mailto:rochthi59@gmail.com" className="font-bold underline text-[#0E8C7F] hover:text-[#0A6B61]">rochthi59@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2 text-[#6B6355]">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Trực thuộc Dự Án Số Hóa Di Sản & Du Lịch Tri Tôn 2026</span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
