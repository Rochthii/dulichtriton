'use client';

import React, { useState } from 'react';
import { 
  Store, ShieldCheck, MapPin, Phone, CheckCircle2, 
  Sparkles, Globe, ArrowRight, Building, Award, TrendingUp
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import { COMMUNES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function PartnerClientPage() {
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
      title: 'Định Vị Ghim GIS WGS84 Chuẩn',
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
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Cổng Đăng Ký Dịch Vụ Đối Tác Bản Địa"
        badgeIcon={Store}
        title="Đăng Ký Đưa Cơ Sở Kinh Doanh Lên AI Tri Tôn"
        subtitle="Dành cho Quán ăn đặc sản Gà Đốt Ô Thum, Homestay, Dịch vụ cho thuê xe máy và Hướng dẫn viên bản địa tại 11 Xã/Thị trấn Tri Tôn."
      />

      {/* VALUE PROPOSITION BENEFITS */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#D99B26] uppercase tracking-widest block mb-1">Lợi Ích Tham Gia</span>
          <h2 className="text-2xl font-bold text-slate-900">Vì Sao Nên Đăng Ký Đối Tác Cùng Chúng Tôi?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center border border-emerald-100">
                  <Icon className="w-6 h-6 text-[#D99B26]" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARTNER REGISTRATION FORM */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg mb-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6 text-[#D99B26]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Form Đăng Ký Cơ Sở Dịch Vụ Mới</h2>
          <p className="text-xs text-slate-500 mt-1">Thông tin sẽ được ban quản trị xét duyệt và đưa lên CSDL Supabase trong 24 giờ</p>
        </div>

        {registrationCode ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#1B4D3E] mx-auto" />
            <h3 className="text-xl font-bold text-[#1B4D3E]">Gửi Hồ Sơ Đăng Ký Thành Công!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Mã hồ sơ đối tác của bạn là: <strong className="font-mono text-sm text-slate-900">{registrationCode}</strong>. Ban quản trị hệ thống Du Lịch Tri Tôn sẽ liên hệ xác minh thông tin cơ sở qua số điện thoại của bạn.
            </p>
            <button
              onClick={() => setRegistrationCode(null)}
              className="px-6 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-semibold"
            >
              Đăng Ký Cơ Sở Khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Cơ Sở Kinh Doanh / Thương Hiệu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quán Gà Đốt Ô Thum Siêu Ngon"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại Hình Dịch Vụ *</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                >
                  <option value="food_and_restaurants">Nhà Hàng / Quán Ăn Đặc Sản</option>
                  <option value="cafes_and_homestays">Homestay / Nhà Khách / Café View Đẹp</option>
                  <option value="bike_rental">Dịch Vụ Cho Thêu Xe Máy / Xe Đạp</option>
                  <option value="tour_guide">Hướng Dẫn Viên Du Lịch Bản Địa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đơn Vị Hành Chính Xã / Thị Trấn *</label>
                <select
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                >
                  {COMMUNES.filter(c => c !== 'Tất cả').map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Chi Tiết (Ấp/Khóm/Đường) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ấp Phước Thạnh, Hồ Ô Thum"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ Tên Người Đại Diện *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lê Văn Tâm"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại Hotline *</label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0918123456"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khoảng Giá Niêm Yết</label>
                <input
                  type="text"
                  placeholder="VD: 150.000đ - 350.000đ"
                  value={formData.priceRange}
                  onChange={e => setFormData({ ...formData, priceRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Nổi Bật Về Dịch Vụ Của Bạn</label>
              <textarea
                rows={3}
                placeholder="VD: Quán gà đốt ướp lá chúc tươi nguyên chất, có chỗ đỗ xe ô tô 16 chỗ, chỗ ngồi ngắm toàn cảnh hồ Ô Thum..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Đang gửi hồ sơ...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D99B26]" />
                  <span>Xác Nhận Nộp Hồ Sơ Đăng Ký Đối Tác</span>
                </>
              )}
            </button>

          </form>
        )}
      </section>
    </>
  );
}
