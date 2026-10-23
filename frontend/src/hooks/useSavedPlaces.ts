'use client';

import { useCallback, useEffect, useState } from 'react';
import { readSavedPlaces, toggleSavedPlace, SAVED_PLACES_KEY, SAVED_PLACES_CHANGED_EVENT, type SavedPlaceIdentity } from '@/lib/savedPlaces';

export function useSavedPlaces() {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(() => {
    try { setSaved(readSavedPlaces(localStorage)); setError(''); }
    catch { setError('Chưa đọc được điểm đã lưu. Dữ liệu cũ được giữ nguyên; hãy thử lại hoặc kiểm tra quyền lưu trữ của trình duyệt.'); }
    setReady(true);
  }, []);
  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_PLACES_KEY || event.key === null) refresh();
    };
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);
  const toggle = (place: SavedPlaceIdentity): boolean | null => {
    try {
      const result = toggleSavedPlace(localStorage, place);
      setSaved(result.saved); setError('');
      window.dispatchEvent(new Event(SAVED_PLACES_CHANGED_EVENT));
      return result.isSaved;
    } catch {
      setError('Chưa lưu được trên thiết bị này. Dữ liệu cũ được giữ nguyên; hãy thử lại hoặc kiểm tra quyền lưu trữ.');
      return null;
    }
  };
  return { saved, ready, error, refresh, toggle };
}
