'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full';
  className?: string;
  showText?: boolean;
}

export default function AppLogo({
  size = 'md',
  variant = 'emblem',
  className = '',
  showText = false,
}: AppLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-6.5 h-6.5',
    xl: 'w-9 h-9',
  };

  const imgSrc = variant === 'full' ? '/images/logo_full.png' : '/images/logo_emblem.png';

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} overflow-hidden bg-[#FAF3E7] flex items-center justify-center text-white shadow-md shadow-[#0E8C7F]/15 group-hover:scale-105 transition-transform shrink-0 border border-[#0E8C7F]/30 p-0.5`}
      >
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt="Du Lịch Tri Tôn Logo"
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0E8C7F] to-[#0A6B61] flex items-center justify-center rounded-xl">
            <Compass className={`${iconSizes[size]} text-[#FFD37A]`} />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
            Du Lịch <span className="text-[#0E8C7F]">Tri Tôn</span>
          </span>
          <span className="font-body text-[10px] font-bold text-[#F0A32F] uppercase tracking-wider -mt-0.5">
            Vẻ Đẹp Bảy Núi • AI Portal
          </span>
        </div>
      )}
    </div>
  );
}
