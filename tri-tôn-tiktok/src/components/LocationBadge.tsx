import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  location: string;
  address?: string;
  onClick?: (location: string) => void;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  address,
  onClick,
  active = false,
  size = 'md',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(location);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={address || `Xem tất cả video tại ${location}`}
      className={`inline-flex items-center rounded-full font-medium transition-all duration-200 cursor-pointer ${sizeClasses[size]} ${
        active
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-400 font-bold'
          : 'bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/30 backdrop-blur-md hover:border-orange-400/60'
      }`}
    >
      <MapPin className={`shrink-0 ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${active ? 'text-white' : 'text-orange-400'}`} />
      <span className="truncate max-w-[180px]">{location}</span>
    </button>
  );
};
