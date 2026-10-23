'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { isPlaceSaved, type SavedPlaceIdentity } from '@/lib/savedPlaces';

export default function SavePlaceButton({ place, compact = false }: { place: SavedPlaceIdentity & { name: string }; compact?: boolean }) {
  const { saved, ready, error, refresh, toggle } = useSavedPlaces();
  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const selected = isPlaceSaved(saved, place);
  return <div className="relative">
    <button type="button" disabled={!ready} aria-disabled={!!error || !ready} aria-pressed={ready && !error ? selected : undefined}
      aria-label={`${selected ? 'Bỏ lưu' : 'Lưu'} ${place.name} trên thiết bị`}
      onClick={(event) => {
        event.preventDefault(); event.stopPropagation();
        if (error) { setShowError(true); return; }
        const next = toggle(place);
        setShowError(next === null);
        if (next !== null) setMessage(next ? `Đã lưu ${place.name} trên thiết bị.` : `Đã bỏ lưu ${place.name}.`);
      }}
      className={`min-h-11 min-w-11 inline-flex items-center justify-center gap-2 rounded-full border px-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)] disabled:opacity-60 ${selected ? 'bg-[var(--jade-deep)] text-white border-[var(--jade-deep)]' : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--ink)]/15'}`}>
      <Heart className={`h-4 w-4 ${selected ? 'fill-current' : ''}`} aria-hidden="true" />
      {!compact && <span>{selected ? 'Đã lưu' : 'Lưu điểm'}</span>}
    </button>
    {message && !error && <span role="status" className="sr-only">{message}</span>}
    {showError && error && <div className="absolute right-0 top-full z-30 mt-2 w-60 max-w-[70vw] rounded-lg bg-[var(--surface)] border border-[var(--terracotta)] p-3 text-xs text-[var(--ink)] shadow-[var(--shadow-1)]">
      <p role="alert">{error}</p>
      <button type="button" className="min-h-11 underline text-[var(--jade-deep)]" onClick={refresh}>Thử đọc lại</button>
    </div>}
  </div>;
}
