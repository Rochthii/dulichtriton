'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export default function AppLogo({ size = 'md', className = '', showText = false }: AppLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-6.5 h-6.5',
  };

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} overflow-hidden bg-gradient-to-br from-[#0E8C7F] to-[#0A6B61] flex items-center justify-center text-white shadow-md shadow-[#0E8C7F]/20 group-hover:scale-105 transition-transform shrink-0 border border-[#0E8C7F]/30`}
      >
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/images/logo.png"
            alt="Du Lịch Tri Tôn Logo"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Compass className={`${iconSizes[size]} text-[#FFD37A]`} />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
            Du Lịch <span className="text-[#0E8C7F]">Tri Tôn</span>
          </span>
          <span className="font-body text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-0.5">
            Cổng Thông Tin Bảy Núi AI
          </span>
        </div>
      )}
    </div>
  );
}
