'use client';

import React, { useState } from 'react';
import { 
  Store, ShieldCheck, MapPin, Phone, CheckCircle2, 
  Sparkles, Globe, ArrowRight, Building, Award, TrendingUp
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import { COMMUNES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PartnerClientPage() {
  const { language, dict } = useLanguage();
  const pt = dict.partner;
  const isEn = language === 'en';

  const [formData, setFormData] = useState({
    businessName: '',
    serviceType: 'food_and_restaurants',
    commune: 'Thị trấn Tri Tôn',
    address: '',
    ownerName: '',
    phone: '',
    priceRange: '50.000đ - 200.000đ',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.phone || !formData.ownerName) {
      alert('Vui lòng điền đầy đủ thông tin cơ sở và số điện thoại liên hệ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = 'PARTNER-' + Math.floor(100000 + Math.random() * 900000);

      // Real backend operation: write audit log entry to Supabase DB
      await supabase.from('audit_logs').insert([
        {
          action: 'PARTNER_REGISTRATION_SUBMITTED',
          entity: 'partner',
          details: {
            registrationCode: code,
            businessName: formData.businessName,
            serviceType: formData.serviceType,
            commune: formData.commune,
            address: formData.address,
            ownerName: formData.ownerName,
            phone: formData.phone,
            priceRange: formData.priceRange,
            description: formData.description,
            created_at: new Date().toISOString(),
          }
        }
      ]);

      setRegistrationCode(code);
    } catch (err) {
      console.error('Partner registration error:', err);
      alert('Không thể kết nối CSDL. Vui lòng thử lại sau!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      title: 'Quảng Bá Miễn Phí Trên AI Chatbot',
      desc: 'Cơ sở của bạn sẽ được gợi ý tự động khi du khách hỏi AI về điểm ăn uống, lưu trú tại Tri Tôn.',
      icon: Sparkles,
    },
    {
      title: 'Định Vị Ghim Bản Đồ Chính Xác',
      desc: 'Xuất hiện trực tiếp trên Bản đồ số Bảy Núi với liên kết mở đường Google Maps chính xác.',
      icon: Globe,
    },
    {
      title: 'Gia Tăng Lượt Đặt Bàn / Đặt Phòng',
      desc: 'Tiếp cận hàng nghìn du khách từ TP.HCM, Cần Thơ và du khách phượt mỗi tháng.',
      icon: TrendingUp,
    },
    {
      title: 'Huy Hiệu Xác Minh Uy Tín',
      desc: 'Nhận badge "Đối tác đã xác minh" từ Hệ thống Du Lịch Tri Tôn nâng cao niềm tin du khách.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Cổng Đăng Ký Dịch Vụ Đối Tác Bản Địa"
        badgeIcon={Store}
        title="Đăng Ký Đưa Cơ Sở Kinh Doanh Lên AI Tri Tôn"
        subtitle="Dành cho Quán ăn đặc sản Gà Đốt Ô Thum, Homestay, Dịch vụ cho thuê xe máy và Hướng dẫn viên bản địa tại 15 Xã/Thị trấn Tri Tôn."
      />

      {/* VALUE PROPOSITION BENEFITS */}
      <section className="mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#F0A32F] uppercase tracking-widest block mb-1 font-display">Lợi Ích Tham Gia</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">Vì Sao Nên Đăng Ký Đối Tác Cùng Chúng Tôi?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-md transition-all space-y-3 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F] flex items-center justify-center border border-[#0E8C7F]/20">
                  <Icon className="w-6 h-6 text-[#F0A32F]" />
                </div>
                <h3 className="font-display font-bold text-base text-[#26221B]">{b.title}</h3>
                <p className="font-body text-xs text-[#6B6355] leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARTNER REGISTRATION FORM */}
      <section className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-10 border border-[#26221B]/8 shadow-[0_4px_20px_rgba(38,34,27,0.08)] mb-12 max-w-4xl mx-auto font-body">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF3E7] text-[#0E8C7F] flex items-center justify-center mx-auto mb-3 border border-[#0E8C7F]/20">
            <Building className="w-6 h-6 text-[#F0A32F]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#26221B]">Form Đăng Ký Cơ Sở Dịch Vụ Mới</h2>
          <p className="font-body text-xs text-[#6B6355] mt-1">Thông tin sẽ được ban quản trị xét duyệt và đưa lên CSDL Supabase trong 24 giờ</p>
        </div>

        {registrationCode ? (
          <div className="bg-[#FAF3E7] border border-[#0E8C7F]/30 rounded-[22px] p-8 text-center space-y-4 font-body">
            <CheckCircle2 className="w-12 h-12 text-[#0E8C7F] mx-auto" />
            <h3 className="font-display text-xl font-bold text-[#0E8C7F]">Gửi Hồ Sơ Đăng Ký Thành Công!</h3>
            <p className="text-xs text-[#6B6355] max-w-md mx-auto">
              Mã hồ sơ đối tác của bạn là: <strong className="font-mono text-sm text-[#26221B]">{registrationCode}</strong>. Ban quản trị hệ thống Du Lịch Tri Tôn sẽ liên hệ xác minh thông tin cơ sở qua số điện thoại của bạn.
            </p>
            <button
              onClick={() => setRegistrationCode(null)}
              className="px-6 py-2.5 rounded-full bg-[#0E8C7F] text-white text-xs font-bold font-display"
            >
              Đăng Ký Cơ Sở Khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 font-body">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Tên Cơ Sở Kinh Doanh / Thương Hiệu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quán Gà Đốt Ô Thum Siêu Ngon"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Loại Hình Dịch Vụ *</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                >
                  <option value="food_and_restaurants">Nhà Hàng / Quán Ăn Đặc Sản</option>
                  <option value="cafes_and_homestays">Homestay / Nhà Khách / Café View Đẹp</option>
                  <option value="bike_rental">Dịch Vụ Cho Thuê Xe Máy / Xe Đạp</option>
                  <option value="tour_guide">Hướng Dẫn Viên Du Lịch Bản Địa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Đơn Vị Hành Chính Xã / Thị Trấn *</label>
                <select
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                >
                  {COMMUNES.filter(c => c !== 'Tất cả').map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Địa Chỉ Chi Tiết (Ấp/Khóm/Đường) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ấp Phước Thạnh, Hồ Ô Thum"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Họ Tên Người Đại Diện *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lê Văn Tâm"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Số Điện Thoại Hotline *</label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0918123456"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Khoảng Giá Niêm Yết</label>
                <input
                  type="text"
                  placeholder="VD: 150.000đ - 350.000đ"
                  value={formData.priceRange}
                  onChange={e => setFormData({ ...formData, priceRange: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26221B] mb-1 font-display">Mô Tả Nổi Bật Về Dịch Vụ Của Bạn</label>
              <textarea
                rows={3}
                placeholder="VD: Quán gà đốt ướp lá chúc tươi nguyên chất, có chỗ đỗ xe ô tô 16 chỗ, chỗ ngồi ngắm toàn cảnh hồ Ô Thum..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 font-display active:scale-95"
            >
              {isSubmitting ? (
                <span>Đang gửi hồ sơ...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#26221B]" />
                  <span>Xác Nhận Nộp Hồ Sơ Đăng Ký Đối Tác</span>
                </>
              )}
            </button>

          </form>
        )}
      </section>
    </div>
  );
}
