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
    <div className="bg-[#1B4D3E] text-white p-6 sm:p-10 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
      {/* Background Radial Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D99B26_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D99B26]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D99B26] uppercase tracking-wider mb-2">
          <BadgeIcon className="w-4 h-4 text-[#D99B26]" />
          <span>{badgeText}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl mt-2 leading-relaxed">
          {subtitle}
        </p>

        {countLabel && countValue !== undefined && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white border border-white/20 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
            <span>{countLabel}: <strong className="text-[#D99B26]">{countValue}</strong></span>
          </div>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
