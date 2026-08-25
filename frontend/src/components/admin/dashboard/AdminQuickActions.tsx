'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, Compass, Brain, Video, MessageSquare, 
  Activity, ChevronRight, Layers, ArrowUpRight 
} from 'lucide-react';

export default function AdminQuickActions() {
  const actions = [
    {
      title: 'Quản Lý Điểm Đến',
      desc: 'Thêm mới, sửa tọa độ, upload ảnh CDN, cập nhật câu chuyện sự tích.',
      href: '/admin/places',
      icon: MapPin,
      badge: 'Danh Mục Điểm Đến',
      color: 'hover:border-[#0E8C7F]/50',
    },
    {
      title: 'Quản Trị 27 Lịch Trình Khép Vòng',
      desc: 'Biên tập điểm dừng, tối ưu cự ly km, thời gian di chuyển và chi phí.',
      href: '/admin/itineraries',
      icon: Compass,
      badge: '27 Tours',
      color: 'hover:border-amber-400',
    },
    {
      title: 'Cơ Sở Tri Thức AI (Knowledge Base)',
      desc: 'Cấu hình ngữ cảnh thực địa chuyên sâu, sự tích và quy chuẩn cho Trợ lý AI.',
      href: '/admin/knowledge-base',
      icon: Brain,
      badge: 'AI RAG',
      color: 'hover:border-purple-400',
    },
    {
      title: 'Kho Video TikTok & Review',
      desc: 'Quét tự động và đồng bộ video review ẩm thực, check-in thực tế.',
      href: '/admin/videos',
      icon: Video,
      badge: 'TikTok Matrix',
      color: 'hover:border-rose-400',
    },
    {
      title: 'Ý Kiến Đóng Góp & Báo Lỗi',
      desc: 'Xem báo cáo ảnh sai, góp ý của du khách và duyệt thông tin thực địa.',
      href: '/admin/feedbacks',
      icon: MessageSquare,
      badge: 'Phản Hồi',
      color: 'hover:border-blue-400',
    },
    {
      title: 'Chỉ Số AI & Giám Sát Hiệu Năng',
      desc: 'Theo dõi token, độ trễ phản hồi, tỷ lệ câu hỏi hợp lệ và nhật ký chat.',
      href: '/admin/ai-metrics',
      icon: Activity,
      badge: 'Telemetry',
      color: 'hover:border-emerald-400',
    },
  ];

  return (
    <section className="space-y-3 font-body">
      <div className="flex items-center justify-between font-display">
        <h2 className="text-base sm:text-lg font-black text-[#26221B] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0E8C7F]" />
          <span>Danh Mục Quản Trị Hệ Thống</span>
        </h2>
        <span className="text-xs text-[#6B6355]">Điều hướng tác vụ nhanh</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className={`p-4 sm:p-5 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${act.color}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-display">
                  <span className="p-2 rounded-xl bg-[#FAF3E7] text-[#0E8C7F]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E7] text-[#6B6355] border border-[#26221B]/10">
                    {act.badge}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-sm text-[#26221B]">
                  {act.title}
                </h3>
                <p className="text-xs text-[#6B6355] leading-relaxed">
                  {act.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-xs font-bold text-[#0E8C7F] font-display">
                <span>Truy cập quản lý</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
