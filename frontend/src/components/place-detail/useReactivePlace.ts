'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Place } from '@/components/PlaceCard';
import { supabase } from '@/lib/supabase';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { getCategoryFallbackImage } from '@/lib/dataSanitizer';
import { getDeviceHardwareGps, TRI_TON_CENTER_COORDS } from '@/lib/maps';
import { calculateRoadDistanceKm, estimateDriveMinutes } from '@/lib/routeOptimizer';

export function useReactivePlace(initialPlace: Place) {
  const [place, setPlace] = useState<Place>(initialPlace);
  const [userGpsCoords, setUserGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // SWR Reactive Supabase Realtime Subscription
  useEffect(() => {
    setPlace(initialPlace);
    let isMounted = true;

    async function fetchReactivePlace() {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*')
          .or(`id.eq.${initialPlace.id},slug.eq.${initialPlace.slug || initialPlace.id}`)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && data && isMounted) {
          setPlace((prev) => ({
            ...prev,
            ...data,
            photos: data.photos && Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : prev.photos,
            image_url: data.image_url || prev.image_url,
            checkin_spots: data.checkin_spots || prev.checkin_spots,
            detailed_story: data.detailed_story || prev.detailed_story,
          }));
        }
      } catch (e) {
        console.warn('[ReactiveSWR] Error fetching live POI:', e);
      }
    }

    fetchReactivePlace();

    const channel = supabase
      .channel(`poi-${initialPlace.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'places', filter: `id=eq.${initialPlace.id}` },
        (payload) => {
          if (payload.new && isMounted) {
            setPlace((prev) => ({
              ...prev,
              ...payload.new,
              photos: payload.new.photos && Array.isArray(payload.new.photos) && payload.new.photos.length > 0 ? payload.new.photos : prev.photos,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [initialPlace.id, initialPlace.slug]);

  // GPS Distance fetching handler
  const fetchGps = useCallback(() => {
    setIsLocatingGps(true);
    setGpsError('');
    getDeviceHardwareGps(
      (coords) => {
        setUserGpsCoords(coords);
        setIsLocatingGps(false);
      },
      (err) => {
        console.warn('GPS Fetch Warning:', err);
        setUserGpsCoords({ latitude: TRI_TON_CENTER_COORDS.latitude, longitude: TRI_TON_CENTER_COORDS.longitude });
        setGpsError('Đã đặt vị trí mẫu tại TT Tri Tôn');
        setIsLocatingGps(false);
      }
    );
  }, []);

  useEffect(() => {
    fetchGps();
  }, [fetchGps]);

  const distanceInfo = useMemo(() => {
    if (!userGpsCoords || !place.latitude || !place.longitude) return null;
    const km = calculateRoadDistanceKm(userGpsCoords.latitude, userGpsCoords.longitude, place.latitude, place.longitude);
    const mins = estimateDriveMinutes(km);
    return { km, mins };
  }, [userGpsCoords, place.latitude, place.longitude]);

  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    category: place.category,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
    tiktok_videos: (place as any).tiktok_videos,
  });

  const defaultImg = getCategoryFallbackImage(place.category, place.name);
  const rawPhotos: string[] = (Array.isArray(place.photos) ? place.photos : [])
    .map((p: any) => (typeof p === 'string' ? p : p?.url))
    .filter((url: any): url is string => typeof url === 'string' && url.trim().length > 0);

  const finalPhotoUrls = rawPhotos.length > 0 ? rawPhotos : [place.image_url || defaultImg];

  const photos = useMemo(() => {
    return finalPhotoUrls.map((photoUrl: string, idx: number) => ({
      url: photoUrl || defaultImg,
      caption: idx === 0 ? place.name : `${place.name} - Ảnh ${idx + 1}`,
      source: 'Cổng thông tin Du lịch Tri Tôn',
      license: 'Verified Field Data',
    }));
  }, [finalPhotoUrls, place.name, defaultImg]);

  return {
    place,
    distanceKm: distanceInfo?.km ?? null,
    drivingMinutes: distanceInfo?.mins ?? null,
    userGpsCoords,
    isLocatingGps,
    gpsError,
    onFetchGps: fetchGps,
    mapsUrl: maps.url,
    tiktokUrl: tiktok.url,
    photos,
  };
}
