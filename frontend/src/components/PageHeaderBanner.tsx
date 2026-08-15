import React from 'react';
import { Compass, CheckCircle2, LucideIcon } from 'lucide-react';

interface PageHeaderBannerProps {
  badgeText?: string;
  badgeIcon?: LucideIcon;
  title: string;
  subtitle: string;
  countLabel?: string;
  countValue?: number | string;
  children?: React.ReactNode;
}

export default function PageHeaderBanner({
  badgeText = 'Hệ Thống AI Du Lịch Tri Tôn',
  badgeIcon: BadgeIcon = Compass,
  title,
  subtitle,
  countLabel,
  countValue,
  children
}: PageHeaderBannerProps) {
  return (
    <div className="bg-gradient-to-br from-[#0B6B60] via-[#0E8C7F] to-[#151B34] text-white p-6 sm:p-10 rounded-[26px] mb-8 shadow-[0_10px_30px_rgba(38,34,27,0.14)] relative overflow-hidden border border-[#0E8C7F]/30">
      {/* Background Radial Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F0A32F_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F0A32F]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FFD37A] uppercase tracking-wider mb-2 font-display">
          <BadgeIcon className="w-4 h-4 text-[#F0A32F]" />
          <span>{badgeText}</span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#FFFDF7]">
          {title}
        </h1>

        <p className="font-body text-xs sm:text-sm text-[#FAF3E7]/85 max-w-3xl mt-2.5 leading-relaxed">
          {subtitle}
        </p>

        {countLabel && countValue !== undefined && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white border border-white/20 backdrop-blur-md font-body">
            <CheckCircle2 className="w-4 h-4 text-[#FFD37A]" />
            <span>{countLabel}: <strong className="text-[#FFD37A] font-display">{countValue}</strong></span>
          </div>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
