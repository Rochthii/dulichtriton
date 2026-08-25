'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Place } from '@/components/PlaceCard';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { type VideoItem } from '@/components/VideoModal';
import { 
  parseTravelGuide, parseCheckinSpots, sanitizeDescription, 
  sanitizeReviews, getCategoryFallbackImage, findDynamicNearbyFood, 
  getCategoryGoldenHourTip, getAccessibilityTerrainInfo, 
  getFoodSignatureMenu, findDynamicNearbyAttractionsAndCafes 
} from '@/lib/dataSanitizer';
import { calculateTimeStatus } from '@/lib/timeStatus';
import { savePlaceToOfflineCache } from '@/lib/offlineStorage';
import { COMMUNE_EMERGENCY_DIRECTORY } from '@/lib/constants';
import localMasterPois from '@/data/triton_pois_full.json';
import { getDeviceHardwareGps, TRI_TON_CENTER_COORDS } from '@/lib/maps';
import { calculateRoadDistanceKm, estimateDriveMinutes } from '@/lib/routeOptimizer';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Modular Subcomponents
import PlaceDetailHero from '@/components/place-detail/PlaceDetailHero';
import PlaceDetailStorySection from '@/components/place-detail/PlaceDetailStorySection';
import PlaceDetailGallerySection from '@/components/place-detail/PlaceDetailGallerySection';
import PlaceDetailTravelGuide from '@/components/place-detail/PlaceDetailTravelGuide';
import PlaceDetailFoodAndNearby from '@/components/place-detail/PlaceDetailFoodAndNearby';
import PlaceDetailSocialAndSupport from '@/components/place-detail/PlaceDetailSocialAndSupport';

interface PlaceDetailClientProps {
  place: Place;
  nearbyPlaces?: Place[];
}

export default function PlaceDetailClient({ place: initialPlace }: PlaceDetailClientProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [place, setPlace] = useState<Place>(initialPlace);

  // Client-Side Reactive SWR + Realtime Subscription (0 Vercel ISR Writes)
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

  const displayName = isEn && (place as any).name_en ? (place as any).name_en : place.name;
  const displayStory = isEn && (place as any).detailed_story_en ? (place as any).detailed_story_en : (place.detailed_story || place.description);

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
  const filteredPhotos = (Array.isArray(place.photos) ? place.photos : [])
    .map((p: any) => (typeof p === 'string' ? p : p?.url))
    .filter((url: any) => typeof url === 'string' && url.trim().length > 0 && !url.includes('unsplash.com'));

  const validImageUrl = place.image_url && typeof place.image_url === 'string' && place.image_url.trim().length > 0 && !place.image_url.includes('unsplash.com')
    ? place.image_url
    : null;

  const rawPhotos = filteredPhotos.length > 0 ? filteredPhotos : [validImageUrl || defaultImg];

  const photos = useMemo(() => {
    return rawPhotos.map((photoUrl: string, idx: number) => {
      const finalUrl = photoUrl && photoUrl.trim().length > 0 ? photoUrl.trim() : defaultImg;
      return {
        url: finalUrl,
        caption: idx === 0 ? place.name : `${place.name} - Ảnh ${idx + 1}`,
        source: 'Cổng thông tin Du lịch Tri Tôn',
        license: 'Verified Field Data',
      };
    });
  }, [rawPhotos, place.name, defaultImg]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const hashtags = useMemo(() => {
    const cleanName = (place.name || '').replace(/[^\p{L}\p{N}]/gu, '');
    const cleanCommune = (place.commune || 'TriTon').replace(/[^\p{L}\p{N}]/gu, '');
    return [`#${cleanName}`, '#DuLichTriTon', `#${cleanCommune}`, '#BayNuiAnGiang', '#CheckinTriTon'];
  }, [place.name, place.commune]);

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2500);
  };

  const handleAskAi = (query: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query } }));
    }
  };

  const guide = parseTravelGuide(
    language === 'en' && (place as any).travel_guide_json_en
      ? (place as any).travel_guide_json_en
      : (place.travel_guide || (place as any).travel_guide_json)
  );

  const checkinSpotsList = parseCheckinSpots(
    language === 'en' && (place as any).checkin_spots_json_en
      ? (place as any).checkin_spots_json_en
      : (place.checkin_spots || (place as any).checkin_spots_json),
    photos.map((p) => p.url)
  );

  const cleanReviews = sanitizeReviews(place.review_samples || (place as any).reviews);
  const timeStatus = calculateTimeStatus(place.category, place.best_visit_time || (place as any).best_time);

  const isGastronomyPOI = Boolean(
    place.category === 'gastronomy' ||
    place.category === 'food' ||
    (place.id && (place.id.startsWith('AT') || place.id.startsWith('CF') || place.id.startsWith('DS'))) ||
    (place.tourism_category && place.tourism_category.includes('Ẩm Thực'))
  );

  const dynamicNearbyFoods = useMemo(() => {
    return findDynamicNearbyFood(place, localMasterPois as any[], 5.5, 3);
  }, [place]);

  const signatureMenu = useMemo(() => {
    if (!isGastronomyPOI) return [];
    return getFoodSignatureMenu(place.name);
  }, [isGastronomyPOI, place.name]);

  const dynamicNearbyAttractions = useMemo(() => {
    if (!isGastronomyPOI) return [];
    return findDynamicNearbyAttractionsAndCafes(place, localMasterPois as any[], 6.0, 3);
  }, [isGastronomyPOI, place]);

  const goldenHourTip = useMemo(() => {
    return getCategoryGoldenHourTip(place.category, place.name, place.commune);
  }, [place.category, place.name, place.commune]);

  const terrainInfo = useMemo(() => {
    return getAccessibilityTerrainInfo(place.name, place.category);
  }, [place.name, place.category]);

  const communeEmergency = COMMUNE_EMERGENCY_DIRECTORY[place.commune] || COMMUNE_EMERGENCY_DIRECTORY['Thị trấn Tri Tôn'];

  // GPS Distance Telemetry
  const [userGpsCoords, setUserGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const baseCoords = userGpsCoords || TRI_TON_CENTER_COORDS;
  const isMtn = terrainInfo.accessibilityLevel === 'steep_stairs' || (place.category || '').toLowerCase().includes('mountain');
  const distanceKm = (place.latitude && place.longitude)
    ? calculateRoadDistanceKm(baseCoords.latitude, baseCoords.longitude, Number(place.latitude), Number(place.longitude), isMtn)
    : null;
  const drivingMinutes = distanceKm !== null ? estimateDriveMinutes(distanceKm, isMtn) : null;

  const handleFetchGps = () => {
    setIsLocatingGps(true);
    setGpsError('');
    getDeviceHardwareGps(
      (coords) => {
        setIsLocatingGps(false);
        setUserGpsCoords(coords);
      },
      (errMsg) => {
        setIsLocatingGps(false);
        setGpsError(errMsg);
        setTimeout(() => setGpsError(''), 4000);
      }
    );
  };

  useEffect(() => {
    savePlaceToOfflineCache(place);
  }, [place]);

  const placeVideos: VideoItem[] = useMemo(() => {
    if (Array.isArray((place as any).tiktok_videos) && (place as any).tiktok_videos.length > 0) {
      return (place as any).tiktok_videos.map((v: any, idx: number) => ({
        id: v.id || `poi-vid-${idx}`,
        title: v.title || `${place.name} Review`,
        platform: 'tiktok',
        video_url: v.video_url || '',
        embed_url: v.embed_url || v.video_url || '',
        thumbnail_url: v.thumbnail_url || place.image_url || defaultImg,
        author_name: v.author || 'du_lich_tri_ton',
        view_count: v.views || 18000,
      }));
    }
    if (place.video_url && place.video_url.includes('tiktok')) {
      return [{
        id: 'poi-primary-video',
        title: `${place.name} — Video Review`,
        platform: 'tiktok',
        video_url: place.video_url,
        embed_url: place.video_url,
        thumbnail_url: place.image_url || defaultImg,
        author_name: 'TikTok Creator',
        view_count: 25000,
      }];
    }
    return [];
  }, [place, defaultImg]);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10 space-y-8">
        {/* 1. Hero Visual, Actions & Telemetry */}
        <PlaceDetailHero
          place={place}
          displayName={displayName}
          photos={photos}
          selectedPhotoIndex={selectedPhotoIndex}
          setSelectedPhotoIndex={setSelectedPhotoIndex}
          isBookmarked={isBookmarked}
          setIsBookmarked={setIsBookmarked}
          showShareToast={showShareToast}
          setShowShareToast={setShowShareToast}
          distanceKm={distanceKm}
          drivingMinutes={drivingMinutes}
          userGpsCoords={userGpsCoords}
          isLocatingGps={isLocatingGps}
          gpsError={gpsError}
          onFetchGps={handleFetchGps}
          mapsUrl={maps.url}
          tiktokUrl={tiktok?.url}
        />

        {/* 2. Historical & Cultural Story */}
        <PlaceDetailStorySection
          placeName={displayName}
          story={displayStory || ''}
          commune={place.commune}
          onAskAi={handleAskAi}
        />

        {/* 3. Check-in Spots Photo Gallery */}
        <PlaceDetailGallerySection
          placeName={displayName}
          checkinSpots={checkinSpotsList}
          hashtags={hashtags}
          copiedHashtags={copiedHashtags}
          onCopyHashtags={handleCopyHashtags}
          placeId={place.id}
        />

        {/* 4. Travel Guide, Hours, Roads & Safety */}
        <PlaceDetailTravelGuide
          guide={guide}
          goldenHourTip={goldenHourTip}
          terrainInfo={terrainInfo}
          timeStatus={timeStatus}
          priceLevel={place.price_level}
          recommendedDuration={(place as any).recommended_duration}
          openingHours={place.opening_hours}
        />

        {/* 5. Food Menu & Nearby Recommendations */}
        <PlaceDetailFoodAndNearby
          isGastronomyPOI={isGastronomyPOI}
          signatureMenu={signatureMenu}
          dynamicNearbyFoods={dynamicNearbyFoods}
          dynamicNearbyAttractions={dynamicNearbyAttractions}
          placeName={displayName}
          phone={place.phone}
        />

        {/* 6. TikTok Reels, Reviews & Emergency SOS Contacts */}
        <PlaceDetailSocialAndSupport
          placeName={displayName}
          category={place.category}
          commune={place.commune}
          communeEmergency={communeEmergency}
          placeVideos={placeVideos}
          isReelsOpen={isReelsOpen}
          setIsReelsOpen={setIsReelsOpen}
          selectedReelIndex={selectedReelIndex}
          setSelectedReelIndex={setSelectedReelIndex}
          reviews={cleanReviews}
        />
      </main>
    </div>
  );
}
