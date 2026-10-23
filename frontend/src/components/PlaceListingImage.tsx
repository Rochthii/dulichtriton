import type { ImgHTMLAttributes } from 'react';

export default function PlaceListingImage({ src, alt, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return <div className={`${className || ''} flex items-center justify-center bg-[var(--surface)]`} role="img" aria-label={`Chưa có ảnh địa điểm: ${alt || ''}`}>
    <span className="relative z-10 rounded-lg bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink)]">Chưa có ảnh địa điểm</span>
  </div>;
  // Existing location image only; no replacement stock image on missing/error.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt || ''} className={className} {...props} />;
}
