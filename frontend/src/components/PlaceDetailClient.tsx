'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Place } from '@/components/PlaceCard';
import { 
  parseTravelGuide, parseCheckinSpots, sanitizeDescription, 
  sanitizeReviews, findDynamicNearbyFood, 
  getCategoryGoldenHourTip, getAccessibilityTerrainInfo, 
  getFoodSignatureMenu, findDynamicNearbyAttractionsAndCafes 
} from '@/lib/dataSanitizer';
import { calculateTimeStatus } from '@/lib/timeStatus';
import { savePlaceToOfflineCache } from '@/lib/offlineStorage';
import { COMMUNE_EMERGENCY_DIRECTORY } from '@/lib/constants';
import localMasterPois from '@/data/triton_pois_full.json';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Modular Subcomponents & Hook
import { useReactivePlace } from './place-detail/useReactivePlace';
import PlaceDetailHero from './place-detail/PlaceDetailHero';
import PlaceDetailStorySection from './place-detail/PlaceDetailStorySection';
import PlaceDetailGallerySection from './place-detail/PlaceDetailGallerySection';
import PlaceDetailTravelGuide from './place-detail/PlaceDetailTravelGuide';
import PlaceDetailFoodAndNearby from './place-detail/PlaceDetailFoodAndNearby';
import PlaceDetailSocialAndSupport from './place-detail/PlaceDetailSocialAndSupport';

interface PlaceDetailClientProps {
  place: Place;
  nearbyPlaces?: Place[];
}

export default function PlaceDetailClient({ place: initialPlace }: PlaceDetailClientProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const {
    place,
    distanceKm,
    drivingMinutes,
    userGpsCoords,
    isLocatingGps,
    gpsError,
    onFetchGps,
    mapsUrl,
    tiktokUrl,
    photos,
  } = useReactivePlace(initialPlace);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const displayName = isEn && (place as any).name_en ? (place as any).name_en : place.name;
  const displayStory = isEn && (place as any).detailed_story_en ? (place as any).detailed_story_en : (place.detailed_story || place.description);

  const hashtags = useMemo(() => {
    const cleanName = (place.name || '').replace(/[^\p{L}\p{N}]/gu, '');
    const cleanCommune = (place.commune || 'TriTon').replace(/[^\p{L}\p{N}]/gu, '');
    return [
      `#${cleanName || 'DuLichTriTon'}`,
      `#${cleanCommune}`,
      '#DuLichTriTon',
      '#CheckinTriTon',
      '#BayNuiAnGiang',
      '#ThatSon',
      '#AnGiangTourism',
    ];
  }, [place.name, place.commune]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('triton_bookmarks');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setIsBookmarked(ids.includes(place.id));
      }
    } catch { /* ignore */ }
  }, [place.id]);

  useEffect(() => {
    if (isBookmarked) {
      savePlaceToOfflineCache(place);
    }
  }, [isBookmarked, place]);

  const handleCopyHashtags = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hashtags.join(' '));
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const handleAskAi = (query: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query } }));
    }
  };

  const cleanDescription = sanitizeDescription(place.description, place.name);
  const checkinSpots = parseCheckinSpots(place.checkin_spots, place.name);
  const travelGuide = parseTravelGuide(place.travel_guide);
  const reviews = sanitizeReviews((place as any).reviews || []);
  const timeStatus = calculateTimeStatus(place.opening_hours, (place as any).open_late);
  const emergencyInfo = COMMUNE_EMERGENCY_DIRECTORY[place.commune] || COMMUNE_EMERGENCY_DIRECTORY['Thị trấn Tri Tôn'];
  const nearbyFood = findDynamicNearbyFood(place, localMasterPois as any[]);
  const nearbyAttractions = findDynamicNearbyAttractionsAndCafes(place, localMasterPois as any[]);
  const goldenHourTip = getCategoryGoldenHourTip(place.category, place.name, place.commune);
  const terrainInfo = getAccessibilityTerrainInfo(place.name, place.category);
  const foodSignatureMenu = getFoodSignatureMenu(place.name);

  return (
    <div className="bg-[#FAF3E7] min-h-screen text-[#26221B] font-body selection:bg-[#F0A32F]/20 selection:text-[#26221B] pb-24">
      {/* Hero Gallery, Badges & Interactive Controls */}
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
        onFetchGps={onFetchGps}
        mapsUrl={mapsUrl}
        tiktokUrl={tiktokUrl}
      />

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8 space-y-8 sm:space-y-12">
            <PlaceDetailStorySection
              placeName={displayName}
              story={displayStory}
              commune={place.commune}
              onAskAi={handleAskAi}
            />

            <PlaceDetailGallerySection
              placeName={displayName}
              checkinSpots={checkinSpots}
              hashtags={hashtags}
              copiedHashtags={copiedHashtags}
              onCopyHashtags={handleCopyHashtags}
              placeId={place.id}
            />

            <PlaceDetailTravelGuide
              guide={travelGuide}
              goldenHourTip={goldenHourTip}
              terrainInfo={terrainInfo}
              timeStatus={timeStatus}
              priceLevel={place.price_level}
              recommendedDuration={(place as any).recommended_duration}
              openingHours={place.opening_hours}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PlaceDetailFoodAndNearby
              isGastronomyPOI={place.category === 'food' || (place as any).category_group === 'food'}
              signatureMenu={foodSignatureMenu}
              dynamicNearbyFoods={nearbyFood}
              dynamicNearbyAttractions={nearbyAttractions}
              placeName={displayName}
              phone={(place as any).phone || (place as any).hotline}
            />

            <PlaceDetailSocialAndSupport
              placeName={displayName}
              category={place.category}
              commune={place.commune}
              communeEmergency={emergencyInfo}
              placeVideos={[]}
              isReelsOpen={isReelsOpen}
              setIsReelsOpen={setIsReelsOpen}
              selectedReelIndex={selectedReelIndex}
              setSelectedReelIndex={setSelectedReelIndex}
              reviews={reviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
