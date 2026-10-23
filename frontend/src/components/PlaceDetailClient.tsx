'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import EmergencyQuickLinks from '@/components/EmergencyQuickLinks';
import { isFoodListing, presentRating } from '@/lib/publicPlacePresentation';
import { 
  MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, 
  Video, ArrowLeft, Heart, Share2, Sparkles, Play, Globe, Info, Compass,
  CheckCircle2, Utensils, Footprints, Bus, Car, AlertTriangle, Lightbulb, Phone,
  MessageSquareQuote, Layers, Users, Sun, Bookmark, Check, ChevronRight, Award, Ticket,
  Flag, X, Send, WifiOff, Smartphone, Calendar, AlertOctagon, HelpCircle, CloudRain, Landmark
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import VideoGallery from '@/components/VideoGallery';
import { type VideoItem } from '@/components/VideoModal';
import TikTokReelsViewer from '@/components/TikTokReelsViewer';
import ReviewSentimentWidget from '@/components/ReviewSentimentWidget';
import CheckinMasonryGallery from '@/components/CheckinMasonryGallery';
import { parseTravelGuide, parseNearbyFood, parseCheckinSpots, sanitizeDescription, sanitizeReviews, getCategoryFallbackImage, findDynamicNearbyFood, getCategoryGoldenHourTip, getAccessibilityTerrainInfo, findDynamicNearbyAttractionsAndCafes } from '@/lib/dataSanitizer';
import { calculateTimeStatus } from '@/lib/timeStatus';
import { savePlaceToOfflineCache, EMERGENCY_CONTACTS } from '@/lib/offlineStorage';
import { KHMER_TEMPLE_RULES } from '@/lib/constants';
import localMasterPois from '@/data/triton_pois_full.json';
import { getDeviceHardwareGps, TRI_TON_CENTER_COORDS } from '@/lib/maps';
import { calculateRoadDistanceKm, estimateDriveMinutes } from '@/lib/routeOptimizer';
import PoiWeatherWidget from '@/components/PoiWeatherWidget';
import { supabase } from '@/lib/supabase';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { getCanonicalPlaceVerification } from '@/lib/canonicalClaims';
import { useDialogFocus } from '@/hooks/useDialogFocus';

interface PlaceDetailClientProps {
  place: Place;
  nearbyPlaces?: Place[];
}

export default function PlaceDetailClient({ place: initialPlace, nearbyPlaces = [] }: PlaceDetailClientProps) {
  const [place, setPlace] = useState<Place>(initialPlace);
  const verification = getCanonicalPlaceVerification(place);

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

    // Supabase Realtime WebSocket listener: Auto-updates photo gallery if Admin uploads new photos
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

  const rawPhotos = filteredPhotos.length > 0
    ? filteredPhotos
    : [validImageUrl || defaultImg];

  const photos = useMemo(() => {
    return rawPhotos.map((photoUrl: string, idx: number) => {
      const finalUrl = photoUrl && photoUrl.trim().length > 0 ? photoUrl.trim() : defaultImg;
      const metadata = Array.isArray(place.photos)
        ? place.photos.find(photo => photo && typeof photo === 'object' && photo.url === finalUrl)
        : undefined;
      return {
        url: finalUrl,
        caption: idx === 0 ? place.name : `${place.name} - Ảnh ${idx + 1}`,
        source: metadata?.source,
        license: metadata?.license,
      };
    });
  }, [rawPhotos, place.name, place.photos, defaultImg]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [placeVideos, setPlaceVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [guideTab, setGuideTab] = useState<'hours_ticket' | 'transport_slope' | 'best_season'>('hours_ticket');
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const hashtags = useMemo(() => {
    const cleanName = (place.name || '').replace(/[^\p{L}\p{N}]/gu, '');
    const cleanCommune = (place.commune || 'TriTon').replace(/[^\p{L}\p{N}]/gu, '');
    return [
      `#${cleanName}`,
      '#DuLichTriTon',
      `#${cleanCommune}`,
      '#BayNuiAnGiang',
      '#CheckinTriTon',
    ];
  }, [place.name, place.commune]);

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2500);
  };

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');
  const reportDialogRef = useDialogFocus(showReportModal, () => setShowReportModal(false));
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  // Parse Travel Guide, Check-in Spots, Dynamic Nearby Food
  const guide = parseTravelGuide(place.travel_guide || (place as any).travel_guide_json);
  const checkinSpotsList = parseCheckinSpots(place.checkin_spots || (place as any).checkin_spots_json, photos.map((p) => p.url));
  const cleanDescription = sanitizeDescription(place.description, place.name, place.commune, place.category);
  const cleanStory = place.detailed_story || place.description || '';
  const cleanReviews = sanitizeReviews(place.review_samples || (place as any).reviews);
  const timeStatus = calculateTimeStatus(place.category, place.best_visit_time || (place as any).best_time);

  // 100% Dynamic Real-World Nearby Food (Haversine GPS calculation from 141 POIs - Zero Mock)
  const dynamicNearbyFoods = useMemo(() => {
    return findDynamicNearbyFood(place, localMasterPois as any[], 5.5, 3);
  }, [place]);

  const isGastronomyPOI = isFoodListing(place);

  // Post-meal Attractions, Lakes & Viewpoints (Smart Cross-sell, avoids competitor restaurants)
  const dynamicNearbyAttractions = useMemo(() => {
    if (!isGastronomyPOI) return [];
    return findDynamicNearbyAttractionsAndCafes(place, localMasterPois as any[], 6.0, 3);
  }, [isGastronomyPOI, place]);

  // Dynamic Category-Aware Golden Hours & Photography Advisory
  const goldenHourTip = useMemo(() => {
    return getCategoryGoldenHourTip(place.category, place.name, place.commune);
  }, [place.category, place.name, place.commune]);

  // Terrain & Accessibility Assessment Matrix
  const terrainInfo = useMemo(() => {
    return getAccessibilityTerrainInfo(place.name, place.category);
  }, [place.name, place.category]);

  const isGaDotOThum = place.name.toLowerCase().includes('gà đốt') || place.name.toLowerCase().includes('ô thum');
  const isHomestayOrCafe = place.name.toLowerCase().includes('homestay') || place.name.toLowerCase().includes('coffee') || place.name.toLowerCase().includes('cà phê') || place.name.toLowerCase().includes('quán');

  // Check slope warning for mountains
  const isSteepMountain = terrainInfo.accessibilityLevel === 'steep_stairs' || !!terrainInfo.slopeWarning;

  // GPS Distance Telemetry (Zero-IP Policy)
  const [userGpsCoords, setUserGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const baseCoords = userGpsCoords || TRI_TON_CENTER_COORDS;
  const isMtn = isSteepMountain || (place.category || '').toLowerCase().includes('mountain');
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

  // Save to offline storage & listen to network status
  useEffect(() => {
    savePlaceToOfflineCache(place);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [place]);

  // Preload videos from POI
  useEffect(() => {
    if (Array.isArray(place.tiktok_videos) && place.tiktok_videos.length > 0) {
      const vids: VideoItem[] = place.tiktok_videos.map((v: any, idx: number) => ({
        id: v.id || `poi-vid-${idx}`,
        title: v.title || `${place.name} Tri Tôn Review`,
        platform: 'tiktok',
        video_url: v.video_url || '',
        embed_url: v.embed_url || v.video_url || '',
        thumbnail_url: v.thumbnail_url || place.image_url || defaultImg,
        author_name: v.author || 'du_lich_tri_ton',
        view_count: v.views || 18000,
        place_id: place.id,
      }));
      setPlaceVideos(vids);
    } else {
      setVideosLoading(true);
      fetch(`/api/v1/places/${place.id}/videos`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.videos && Array.isArray(data.videos)) {
            setPlaceVideos(data.videos);
          }
        })
        .catch((err) => console.error('Error fetching POI videos:', err))
        .finally(() => setVideosLoading(false));
    }
  }, [place.id, place.name, place.image_url, place.tiktok_videos, defaultImg]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${place.name} — Du Lịch Tri Tôn`,
        text: `Khám phá ${place.name} tại ${place.commune}, Tri Tôn, An Giang!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const handleSaveToItinerary = () => {
    try {
      const key = 'triton_custom_itinerary';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!list.includes(place.id)) {
        list.push(place.id);
        localStorage.setItem(key, JSON.stringify(list));
      }
      setIsBookmarked(true);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    setIsSubmittingReport(true);
    setReportError('');
    try {
      const { error } = await supabase.from('audit_logs').insert([
        {
          action: 'POI_CORRECTION_REPORTED',
          entity: 'place',
          details: {
            place_id: place.id,
            place_name: place.name,
            reason: reportReason,
            contact: reportContact,
            reported_at: new Date().toISOString(),
          }
        }
      ]);
      if (error) throw error;
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportReason('');
        setReportContact('');
      }, 2500);
    } catch (err) {
      console.error('Report error:', err);
      setReportError('Chưa gửi được góp ý. Nội dung vẫn được giữ để bạn thử lại sau.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const navItems = [
    { id: 'story', label: '1. Khám Phá & Sự Tích', icon: Sparkles },
    { id: 'guide', label: '2. Cẩm Nang & Vé', icon: Compass },
    { id: 'checkin-spots', label: '3. Góc Check-in', icon: Camera },
    { id: 'nearby-food', label: '4. Ăn Gì Gần Đây', icon: Utensils },
    { id: 'videos', label: '5. Video Thực Tế', icon: Video },
    { id: 'reviews', label: '6. Đánh Giá Du Khách', icon: MessageSquareQuote },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen pb-28">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#151B34] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold font-display animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#F0A32F]" />
          <span>{isBookmarked ? 'Đã lưu địa điểm vào Lịch trình cá nhân!' : 'Đã sao chép liên kết chia sẻ!'}</span>
        </div>
      )}

      {/* Offline Mountain Banner (When user loses 4G signal on Núi Cô Tô / Tức Dụp) */}
      {isOffline && (
        <div className="bg-[#151B34] text-[#FFD37A] px-4 py-3 border-b border-[#FFD37A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-display">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#F26B3A] shrink-0" />
            <span>
              <strong>Chế độ Ngoại tuyến (Offline):</strong> Bạn đang mất kết nối 4G. Thông tin đã được lưu trong bộ nhớ máy.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/emergency" className="px-3 py-1 rounded-full bg-[#A6503A] text-white font-bold flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>SOS · Xem tổng đài</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex items-center justify-between py-4 border-b border-[#26221B]/8 font-display">
        <Link
          href="/places"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6355] hover:text-[#0E8C7F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-full bg-[#FFFDF7] hover:bg-[#FAF3E7] text-[#6B6355] hover:text-[#A6503A] border border-[#26221B]/8 shadow-2xs transition-all"
            title="Báo sai thông tin hoặc đóng cửa"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-[#FFFDF7] hover:bg-[#FAF3E7] text-[#6B6355] hover:text-[#0E8C7F] border border-[#26221B]/8 shadow-2xs transition-all"
            title="Chia sẻ liên kết"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── HERO BANNER: NAME, BADGES, PRIMARY ACTION BUTTONS ── */}
      <div className="my-6 bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {verification ? (
                <a href={verification.source_url} target="_blank" rel="noopener noreferrer" className="stamp-verified" title={`Xác minh: ${verification.verified_at}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Đã xác minh • Xem nguồn</span>
                </a>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#FAF3E7] text-[#6B6355] text-xs border border-[#26221B]/15">Thông tin tham khảo • Chưa được xác minh</span>
              )}
              <span className="px-3.5 py-1 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-xs font-bold border border-[#0E8C7F]/20 font-display">
                {place.commune}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FAF3E7] text-[#26221B] text-xs font-bold border border-[#F0A32F]/40 font-display">
                {timeStatus.badgeText}
              </span>
              <div className="flex items-center gap-1 bg-[#FAF3E7] px-3 py-1 rounded-full border border-[#F0A32F]/40 font-display">
                <Star className="w-3.5 h-3.5 fill-[#F0A32F] text-[#F0A32F]" />
                <span className="text-xs font-bold text-[#26221B]">{typeof place.rating === 'number' ? `${place.rating} / 5.0` : 'Chưa có đánh giá'}</span>
              </div>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#26221B] tracking-tight leading-tight">
              {place.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#6B6355] flex items-center gap-1.5 font-body">
              <MapPin className="w-4 h-4 text-[#0E8C7F] shrink-0" />
              <span>{place.address}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 font-display">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all tap-bounce"
            >
              <Navigation className="w-4 h-4" />
              <span>Chỉ Đường Google Maps</span>
            </a>

            {placeVideos.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedReelIndex(0);
                  setIsReelsOpen(true);
                }}
                className="flex-1 sm:flex-none px-5 py-3.5 rounded-full bg-[#151B34] hover:bg-[#F26B3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all tap-bounce"
              >
                <Play className="w-4 h-4 fill-[#FFD37A] text-[#FFD37A]" />
                <span>Xem Video Thực Tế ({placeVideos.length})</span>
              </button>
            ) : (
              <a
                href={tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-3.5 rounded-full bg-transparent border border-[#26221B]/20 hover:border-[#F26B3A] hover:text-[#F26B3A] text-[#26221B] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all tap-bounce"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>TikTok Review</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO VISUAL PHOTO SHOWCASE (PHÒNG TRANH ẢNH THỰC ĐỊA) ── */}
      <div className="mb-8 bg-[#FFFDF7] rounded-[28px] p-4 sm:p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
        {/* Main Large Image */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-[22px] overflow-hidden bg-[#FAF3E7] shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || place.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src = defaultImg;
            }}
          />

          {/* Bottom Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-[#26221B]/20 to-transparent pointer-events-none" />

          {/* Top Left Verified Stamp */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="stamp-verified backdrop-blur-md bg-[#0E8C7F]/90 text-white border border-[#FFD37A]/40 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-[#FFD37A]" />
              <span>Ảnh địa điểm</span>
            </span>
          </div>

          {/* Bottom Caption & Source Bar */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white font-display">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#FFFDF7] drop-shadow-md">
                {currentPhoto.caption || place.name}
              </h3>
              <p className="text-[11px] text-[#FAF3E7]/80 font-medium drop-shadow-sm font-body">
                Nguồn: {currentPhoto.source || 'Chưa có thông tin nguồn ảnh'}
              </p>
            </div>

            {photos.length > 1 && (
              <span className="px-3 py-1 rounded-full bg-[#151B34]/80 text-[#FFD37A] text-xs font-bold backdrop-blur-md border border-[#FFD37A]/30 shrink-0 self-start sm:self-auto">
                📸 {selectedPhotoIndex + 1} / {photos.length} ảnh
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Selector Strip (When multiple photos exist) */}
        {photos.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {photos.map((photo: { url: string; caption?: string }, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative shrink-0 w-20 sm:w-28 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all tap-bounce ${
                  selectedPhotoIndex === idx
                    ? 'border-[#0E8C7F] ring-2 ring-[#0E8C7F]/30 scale-105 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = defaultImg;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── STICKY QUICK-JUMP NAVIGATION TAB BAR ── */}
      <div className="sticky top-16 z-20 bg-[#FAF3E7]/95 backdrop-blur-md py-3 border-y border-[#26221B]/8 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 font-display">
        <div className="flex overflow-x-auto gap-2 scrollbar-none snap-x">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`snap-start shrink-0 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all tap-bounce ${
                  isActive
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FFFDF7] text-[#6B6355] border border-[#26221B]/8 hover:border-[#0E8C7F]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DETAIL CONTENT SECTIONS ── */}
      <div className="space-y-8">
        
        {/* ── SECTION 1: BÀI VIẾT KHÁM PHÁ, SỰ TÍCH, THỰC ĐƠN & GIỜ VÀNG SĂN ẢNH (ĐẶT Ở ĐẦU TRANG) ── */}
        <section id="story" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
          <div className="flex items-center justify-between border-b border-[#26221B]/6 pb-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B] flex items-center gap-2.5">
              {isGastronomyPOI ? (
                <Utensils className="w-6 h-6 text-[#F26B3A]" />
              ) : (
                <Sparkles className="w-6 h-6 text-[#0E8C7F]" />
              )}
              <span>{isGastronomyPOI ? '1. Giới Thiệu & Hương Vị Đặc Sản Bản Địa' : '1. Khám Phá & Sự Tích Bảy Núi'}</span>
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-xs font-bold font-display">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isGastronomyPOI ? 'Đặc sản xác minh thực địa' : 'Tư liệu lịch sử xác minh'}</span>
            </span>
          </div>

          {/* Detailed Narrative Story (Core Content) */}
          <div className="border-b border-[#26221B]/6 pb-6">
            <RichTextRenderer content={cleanStory} />
          </div>

          {/* Quick Metrics & Accessibility Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-display">
            <div className="bg-[#FAF3E7] p-3.5 rounded-[20px] border border-[#26221B]/8">
              <span className="text-[10px] font-bold text-[#6B6355] uppercase block">Giờ mở cửa</span>
              <span className="text-xs sm:text-sm font-bold text-[#0E8C7F] mt-1 block">
                {place.opening_hours || guide.openingHours}
              </span>
            </div>
            <div className="bg-[#FAF3E7] p-3.5 rounded-[20px] border border-[#26221B]/8">
              <span className="text-[10px] font-bold text-[#6B6355] uppercase block">
                {isGastronomyPOI ? 'Mức giá tham khảo' : 'Giá vé / Giữ xe'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#D9822B] mt-1 block">
                {isGastronomyPOI ? (place.price_level || 'Chưa có thông tin giá') : guide.ticketPrice}
              </span>
            </div>
            <div className="bg-[#FAF3E7] p-3.5 rounded-[20px] border border-[#26221B]/8">
              <span className="text-[10px] font-bold text-[#6B6355] uppercase block">Phương tiện</span>
              <span className="text-xs sm:text-sm font-bold text-[#0E8C7F] mt-1 block">
                {guide.vehicleSuitability}
              </span>
            </div>
            <div className="bg-[#FAF3E7] p-3.5 rounded-[20px] border border-[#26221B]/8">
              <span className="text-[10px] font-bold text-[#6B6355] uppercase block">Mùa lý tưởng</span>
              <span className="text-xs sm:text-sm font-bold text-[#0E8C7F] mt-1 block truncate" title={guide.bestSeason}>
                {guide.bestSeason.split('(')[0]}
              </span>
            </div>
          </div>

          {isGastronomyPOI && <p className="p-4 rounded-[var(--r-m)] bg-[var(--bg)] text-sm text-[var(--ink-soft)]">Chưa có thực đơn và thông tin tiện ích do cơ sở cung cấp. Hãy liên hệ xác nhận giá, chỗ đỗ xe và dịch vụ trước khi đến.</p>}

          {/* Accessibility & Terrain Index Badge */}
          <div className="p-3.5 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 flex items-center justify-between gap-3 text-xs font-display">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-[#0E8C7F] shrink-0" />
              <span className="text-[#6B6355]">Chỉ số tiếp cận địa hình:</span>
              <span className="font-extrabold text-[#26221B]">Chưa có xác nhận điều kiện tiếp cận</span>
            </div>
          </div>

          {/* ── DYNAMIC CATEGORY-AWARE GOLDEN HOURS & PHOTOGRAPHY ADVISORY ── */}
          <div className="p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-amber-50/80 via-emerald-50/40 to-[#FFFDF7] border border-amber-300/60 shadow-xs space-y-3.5 font-body">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-display">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{goldenHourTip.goldenHoursTitle}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200/60 text-amber-900 font-extrabold text-xs font-display">
                ⏱️ {goldenHourTip.goldenHoursTime}
              </span>
            </div>

            <p className="text-xs text-[#26221B] leading-relaxed bg-white/80 p-3 rounded-[16px] border border-amber-200/60 font-medium">
              💡 <strong>Mẹo chụp ảnh & Trải nghiệm:</strong> {goldenHourTip.photoTip}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[16px] bg-white/90 border border-amber-200/60 space-y-1">
                <span className="font-bold text-amber-800 flex items-center gap-1.5 font-display">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Mùa Khô & Nắng Vàng (T12 – T5):
                </span>
                <p className="text-[#6B6355] leading-relaxed">
                  {goldenHourTip.seasonTipDry}
                </p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/90 border border-amber-200/60 space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 font-display">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Mùa Mưa & Nước Nổi (T6 – T11):
                </span>
                <p className="text-[#6B6355] leading-relaxed">
                  {goldenHourTip.seasonTipRain}
                </p>
              </div>
            </div>
          </div>

          {/* ── KHMER TEMPLE MONASTIC ETIQUETTE (IF APPLICABLE) ── */}
          {goldenHourTip.dressCodeRequired && (
            <div className="p-4 sm:p-5 rounded-[22px] bg-[#D9822B]/10 border border-[#D9822B]/30 space-y-2.5 font-body">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D9822B] font-display">
                <Landmark className="w-4 h-4 text-[#D9822B] shrink-0" />
                <span>{KHMER_TEMPLE_RULES.title}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#26221B]">
                {KHMER_TEMPLE_RULES.rules.map((r, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D9822B] shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#6B6355] italic pt-1 border-t border-[#D9822B]/20">
                📌 {KHMER_TEMPLE_RULES.goldenHours}
              </p>
            </div>
          )}

          {/* ── REALTIME LIVE POI WEATHER WIDGET (OPEN-METEO WGS84) ── */}
          <PoiWeatherWidget
            latitude={place.latitude ? Number(place.latitude) : undefined}
            longitude={place.longitude ? Number(place.longitude) : undefined}
            placeName={place.name}
            category={place.category}
          />

          {/* ── REALTIME INSTANT DISTANCE & ETA WIDGET ── */}
          {distanceKm !== null && (
            <div className="p-4 rounded-[22px] bg-[#FAF3E7] border border-[#26221B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-display">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6355]">
                  <Navigation className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>
                    {userGpsCoords ? 'Khoảng cách từ vị trí của bạn:' : 'Khoảng cách từ Trung tâm Thị trấn Tri Tôn:'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold text-[#0E8C7F]">
                    Cách bạn: {distanceKm} km
                  </span>
                  <span className="text-xs font-bold text-[#26221B] px-2.5 py-0.5 rounded-full bg-[#FFFDF7] border border-[#26221B]/10">
                    ~{drivingMinutes} phút lái xe {isMtn ? '(đường đèo dốc)' : '(đồng bằng)'}
                  </span>
                </div>
                {gpsError && <p className="text-[11px] text-[#A6503A] font-bold">{gpsError}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleFetchGps}
                  disabled={isLocatingGps}
                  className="px-3.5 py-2 rounded-full bg-[#FFFDF7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] border border-[#0E8C7F]/30 text-xs font-bold transition-all tap-bounce flex items-center gap-1.5"
                  title="Đo từ vị trí hiện tại của bạn"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isLocatingGps ? 'Đang dò vị trí...' : userGpsCoords ? 'Cập nhật vị trí' : 'Vị trí của tôi'}</span>
                </button>

                <a
                  href={maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Dẫn đường</span>
                </a>
              </div>
            </div>
          )}

          {/* ── SPECIAL RECOMMENDATION / BOOKING ADVICE CARD ── */}
          {isGaDotOThum && (
            <div className="p-4 sm:p-5 rounded-[22px] bg-[#F26B3A]/10 border border-[#F26B3A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-display">
              <div className="flex items-start gap-3">
                <Utensils className="w-5 h-5 text-[#F26B3A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#26221B]">
                    Kinh Nghiệm Thưởng Thức Gà Đốt Ô Thum Chuẩn Vị
                  </h4>
                  <p className="text-xs text-[#6B6355] mt-0.5 font-body leading-relaxed">
                    Gà đốt lá chúc ngon nhất khi nướng than trực tiếp 35–45 phút. Khuyên du khách nên gọi điện đặt trước khi xuất phát để khi đến nơi là có gà nóng hổi dùng ngay!
                  </p>
                </div>
              </div>
              <a
                href={place.phone ? `tel:${place.phone}` : undefined}
                aria-disabled={!place.phone}
                className="px-4 py-2.5 rounded-full bg-[#F26B3A] hover:bg-[#D9531E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs tap-bounce"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{place.phone ? `Gọi ${place.phone}` : 'Chưa có số liên hệ cơ sở'}</span>
              </a>
            </div>
          )}

          {/* ── BỘ HASHTAG CHECK-IN MẠNG XÃ HỘI & TIKTOK ── */}
          <div className="p-4 sm:p-5 rounded-[22px] bg-[#FAF3E7] border border-[#26221B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-display">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#26221B]">
                <Sparkles className="w-4 h-4 text-[#0E8C7F]" />
                <span>Bộ Hashtag Check-in Mạng Xã Hội (TikTok / Facebook / Reels)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-white text-[#0E8C7F] text-xs font-bold border border-[#0E8C7F]/20 shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyHashtags}
                className="px-4 py-2 rounded-full bg-[#0E8C7F] hover:bg-[#0C756A] text-white text-xs font-bold flex items-center gap-1.5 transition-all tap-bounce shadow-xs cursor-pointer"
              >
                {copiedHashtags ? <Check className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                <span>{copiedHashtags ? 'Đã sao chép!' : 'Sao chép Hashtag'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: CẨM NANG & MA TRẬN TRẮC ĐỊA BÃI ĐỖ XE ── */}
        <section id="guide" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
          <div className="flex items-center justify-between border-b border-[#26221B]/6 pb-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B] flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-[#0E8C7F]" />
              <span>2. Cẩm Nang & Trắc Địa Di Chuyển</span>
            </h2>
          </div>

          {/* Guide Accordion / Sub-Tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/8 font-display">
            <button
              onClick={() => setGuideTab('hours_ticket')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all tap-bounce ${
                guideTab === 'hours_ticket' ? 'bg-[#0E8C7F] text-white shadow-xs' : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              🕒 Giờ Mở Cửa & Vé
            </button>
            <button
              onClick={() => setGuideTab('transport_slope')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all tap-bounce ${
                guideTab === 'transport_slope' ? 'bg-[#0E8C7F] text-white shadow-xs' : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              🚗 Bãi Đỗ Xe & Cảnh Báo
            </button>
            <button
              onClick={() => setGuideTab('best_season')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all tap-bounce ${
                guideTab === 'best_season' ? 'bg-[#0E8C7F] text-white shadow-xs' : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              🗓️ Mùa Đẹp Nhất
            </button>
          </div>

          {/* Tab Content 1: Giờ & Vé */}
          {guideTab === 'hours_ticket' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/6 flex items-start gap-3">
                <Ticket className="w-5 h-5 text-[#F0A32F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm font-bold text-[#26221B]">Quy Định Vé & Phí Dịch Vụ</h3>
                  <p className="text-xs text-[#26221B] mt-1 leading-relaxed">{guide.ticketPrice}</p>
                </div>
              </div>
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/6 flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#0E8C7F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm font-bold text-[#26221B]">Thời Gian Hoạt Động Khuyến Nghị</h3>
                  <p className="text-xs text-[#26221B] mt-1 leading-relaxed">{place.opening_hours || guide.openingHours}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Phương tiện & Ma trận đỗ xe Ô tô */}
          {guideTab === 'transport_slope' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/6 flex items-start gap-3">
                <Footprints className="w-5 h-5 text-[#0E8C7F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm font-bold text-[#26221B]">Hướng Dẫn Đường Đi</h3>
                  <p className="text-xs text-[#26221B] mt-1 leading-relaxed">{guide.howToGetThere}</p>
                </div>
              </div>

              {/* 4-Tier Parking Matrix */}
              <div className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#26221B]/10 space-y-3">
                <h4 className="font-display text-xs font-bold text-[#26221B] uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#0E8C7F]" />
                  <span>Ma Trận Bãi Đỗ Xe & Tiếp Cận Phương Tiện Thực Địa</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-display">
                  <div className="p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-0.5">
                    <span className="font-bold text-[#0E8C7F]">🚗 Ô tô 4 – 7 chỗ:</span>
                    <p className="text-[#6B6355] font-body text-[11px]">Chưa có thông tin bãi đỗ phù hợp</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-0.5">
                    <span className="font-bold text-[#D9822B]">🚐 Xe 16 – 29 chỗ:</span>
                    <p className="text-[#6B6355] font-body text-[11px]">Chưa có thông tin bãi đỗ phù hợp</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-0.5">
                    <span className="font-bold text-[#A6503A]">🚌 Xe lớn 45 chỗ:</span>
                    <p className="text-[#6B6355] font-body text-[11px]">Chưa có thông tin bãi đỗ phù hợp</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/6 space-y-0.5">
                    <span className="font-bold text-[#26221B]">🛵 Xe máy / Xe ôm:</span>
                    <p className="text-[#6B6355] font-body text-[11px]">Chưa có thông tin bãi đỗ phù hợp</p>
                  </div>
                </div>
              </div>

              {terrainInfo.slopeWarning && (
                <div className="p-4 rounded-[20px] bg-[#A6503A]/10 border border-[#A6503A]/30 flex items-start gap-3 text-[#A6503A]">
                  <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-[#A6503A]" />
                  <div>
                    <h3 className="font-display text-sm font-bold">Cảnh Báo An Toàn Độ Dốc Núi Cao</h3>
                    <p className="text-xs mt-1 leading-relaxed text-[#26221B]">
                      {terrainInfo.slopeWarning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Mùa đẹp nhất */}
          {guideTab === 'best_season' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/6 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#D9822B] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm font-bold text-[#26221B]">Thời Điểm Lý Tưởng Nhất Trong Năm</h3>
                  <p className="text-xs text-[#26221B] mt-1 leading-relaxed">{guide.bestSeason}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 3: CHECKIN SPOTS MASONRY ── */}
        {checkinSpotsList.length > 0 && (
          <section id="checkin-spots" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
            <CheckinMasonryGallery spots={checkinSpotsList} placeName={place.name} />
          </section>
        )}

        {/* ── SECTION 4: DYNAMIC NEARBY RECOMMENDATIONS (FOOD OR POST-MEAL ATTRACTIONS) ── */}
        {isGastronomyPOI ? (
          dynamicNearbyAttractions.length > 0 && (
            <section id="nearby-food" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/6 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-xs font-bold uppercase tracking-wider mb-1 font-display">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Lộ Trình Tiếp Nối</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B]">
                    Ăn Xong Đi Đâu? Điểm Check-in & Cà Phê Gần Quán Nhất
                  </h2>
                </div>
                <span className="text-xs text-[#6B6355] font-semibold">{dynamicNearbyAttractions.length} Điểm đến liền kề &lt; 6km</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dynamicNearbyAttractions.map((spot, idx) => {
                  const spotMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} Tri Tôn An Giang`)}`;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-[22px] bg-[#FAF3E7] border border-[#26221B]/8 flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F] text-white text-[10px] font-bold font-display">
                            {spot.distanceLabel}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#26221B] font-display">
                            <Star className="w-3.5 h-3.5 fill-[#F0A32F] text-[#F0A32F]" />
                            <span>{presentRating(spot.rating) ?? 'Chưa có đánh giá'}</span>
                          </div>
                        </div>

                        <h3 className="font-display text-base font-bold text-[#26221B] line-clamp-1">{spot.name}</h3>
                        <p className="text-xs text-[#6B6355] line-clamp-1">{spot.address}</p>

                        <div className="flex flex-wrap gap-1 pt-1 font-display">
                          {spot.specialties && spot.specialties.map((spec: string, sIdx: number) => (
                            <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFDF7] text-[#26221B] border border-[#26221B]/8">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#26221B]/6 font-display">
                        <Link
                          href={`/places/${spot.slug || spot.id}`}
                          className="flex-1 py-2 rounded-full bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all tap-bounce"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Xem Chi Tiết</span>
                        </Link>
                        <a
                          href={spotMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-full bg-[#FFFDF7] border border-[#26221B]/15 hover:border-[#0E8C7F] text-[#26221B] text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Navigation className="w-3 h-3 text-[#0E8C7F]" />
                          <span>Chỉ Đường</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        ) : (
          dynamicNearbyFoods.length > 0 && (
            <section id="nearby-food" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/6 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F26B3A]/10 text-[#F26B3A] text-xs font-bold uppercase tracking-wider mb-1 font-display">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Ẩm Thực Bản Địa Liền Kề</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B]">
                    Đang Ở Đây? Quán Ngon Thực Tế Gần Nhất
                  </h2>
                </div>
                <span className="text-xs text-[#6B6355] font-semibold">{dynamicNearbyFoods.length} Quán đặc sản đã xác minh</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dynamicNearbyFoods.map((food, idx) => {
                  const foodMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${food.name} Tri Tôn An Giang`)}`;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-[22px] bg-[#FAF3E7] border border-[#26221B]/8 flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F26B3A] text-white text-[10px] font-bold font-display">
                            {food.distanceLabel}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#26221B] font-display">
                            <Star className="w-3.5 h-3.5 fill-[#F0A32F] text-[#F0A32F]" />
                            <span>{presentRating(food.rating) ?? 'Chưa có đánh giá'}</span>
                          </div>
                        </div>

                        <h3 className="font-display text-base font-bold text-[#26221B] line-clamp-1">{food.name}</h3>
                        <p className="text-xs text-[#6B6355] line-clamp-1">{food.address}</p>

                        <div className="flex flex-wrap gap-1 pt-1 font-display">
                          {food.specialties.map((spec, sIdx) => (
                            <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFDF7] text-[#26221B] border border-[#26221B]/8">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#26221B]/6 font-display">
                        <a
                          href={foodMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all tap-bounce"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Chỉ Đường</span>
                        </a>
                        <a
                          href={`https://www.tiktok.com/search?q=${encodeURIComponent(`${food.name} Tri Tôn`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-full bg-[#FFFDF7] border border-[#26221B]/15 hover:border-[#F26B3A] text-[#26221B] text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3 h-3 fill-[#F26B3A] text-[#F26B3A]" />
                          <span>Review</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )}

        <section className="rounded-[var(--r-l)] border border-[var(--terracotta)]/30 bg-[var(--surface)] p-4 sm:p-6 space-y-3">
          <h3 className="font-display text-lg font-bold">Hỗ trợ khẩn cấp</h3>
          <EmergencyQuickLinks />
          <Link href="/emergency" className="inline-flex min-h-11 items-center text-sm text-[var(--jade-deep)] underline">Danh bạ địa phương và trạng thái đối chiếu</Link>
        </section>

        {/* ── SECTION 5: VIDEO TIKTOK REELS ── */}
        <section id="videos" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
          <div className="flex items-center justify-between border-b border-[#26221B]/6 pb-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B] flex items-center gap-2.5">
              <Video className="w-6 h-6 text-[#F26B3A]" />
              <span>5. Video Review TikTok Thực Tế</span>
            </h2>
            <span className="font-display text-xs text-[#26221B] bg-[#FAF3E7] px-3.5 py-1 rounded-full font-bold">
              TikTok Discovery ({placeVideos.length} video)
            </span>
          </div>

          {videosLoading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold text-xs font-body">
              Đang tìm kiếm video review cho {place.name}...
            </div>
          ) : (
            <VideoGallery
              videos={placeVideos}
              placeName={place.name}
              placeHashtag={place.name.toLowerCase().replace(/\s+/g, '')}
            />
          )}
        </section>

        {/* ── SECTION 6: ĐÁNH GIÁ & AI NLP SENTIMENT ── */}
        <section id="reviews" className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-6 scroll-mt-28 font-body">
          <div className="flex items-center justify-between border-b border-[#26221B]/6 pb-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#26221B] flex items-center gap-2.5">
              <MessageSquareQuote className="w-6 h-6 text-[#0E8C7F]" />
              <span>6. Đánh Giá Trải Nghiệm Thực Tế</span>
            </h2>
          </div>

          {/* AI NLP Sentiment Summary Widget */}
          <ReviewSentimentWidget reviews={cleanReviews} placeName={place.name} />

          {cleanReviews.length > 0 && (
            <div className="space-y-3 pt-2">
              {cleanReviews.map((r: any, idx: number) => (
                <div key={idx} className="p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/6 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-[#26221B]">{r.author || 'Du khách đã trải nghiệm'}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#F0A32F]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{presentRating(r.rating) ?? 'Chưa có đánh giá'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B6355] leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── TIKTOK REELS VERTICAL SWIPE MODAL ── */}
      <TikTokReelsViewer
        videos={placeVideos}
        isOpen={isReelsOpen}
        initialIndex={selectedReelIndex}
        onClose={() => setIsReelsOpen(false)}
        placeName={place.name}
        placeSlug={place.slug || place.id}
      />

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] bg-[#151B34]/60 backdrop-blur-sm flex items-center justify-center p-4 font-body">
          <div ref={reportDialogRef} role="dialog" aria-modal="true" aria-label="Báo lỗi địa điểm" tabIndex={-1} className="bg-[#FFFDF7] rounded-[28px] max-w-lg w-full max-h-[90dvh] overflow-y-auto p-6 sm:p-8 border border-[#26221B]/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#A6503A]" />
                <h3 className="font-display text-lg font-bold text-[#26221B]">Báo Lỗi / Cập Nhật Địa Điểm</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                aria-label="Đóng báo lỗi địa điểm"
                className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-[#6B6355] hover:bg-[#FAF3E7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#0E8C7F] mx-auto" />
                <p className="font-display font-bold text-base text-[#0E8C7F]">Gửi báo cáo thành công!</p>
                <p className="text-xs text-[#6B6355]">Cảm ơn bạn đã đóng góp thông tin chính xác cho du khách Bảy Núi.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportError && <p role="alert" className="text-sm text-[#A6503A]">{reportError}</p>}
                <div>
                  <label htmlFor="report-place" className="block text-xs font-bold text-[#26221B] mb-1 font-display">Địa điểm:</label>
                  <input
                    id="report-place"
                    type="text"
                    disabled
                    value={place.name}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E7] text-xs text-[#26221B] font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="report-reason" className="block text-xs font-bold text-[#26221B] mb-1 font-display">Nội dung báo lỗi hoặc cập nhật *</label>
                  <textarea
                    id="report-reason"
                    required
                    rows={4}
                    placeholder="VD: Quán đã chuyển địa điểm, giờ mở cửa mới từ 06:00, đường đi đang sửa..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <div>
                  <label htmlFor="report-contact" className="block text-xs font-bold text-[#26221B] mb-1 font-display">Số điện thoại hoặc Email liên hệ (tùy chọn)</label>
                  <input
                    id="report-contact"
                    type="text"
                    placeholder="Để BQT xác minh nếu cần"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#26221B]/15 text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F] bg-[#FAF3E7]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all font-display tap-bounce"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReport ? 'Đang gửi...' : 'Gửi Phản Hồi Xác Minh'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE STICKY 3-BUTTON ACTION BAR ── */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 bg-[#FAF3E7]/95 backdrop-blur-lg border-t border-[#26221B]/10 p-3 sm:hidden shadow-[0_-4px_25px_rgba(38,34,27,0.1)] flex items-center gap-2 font-display">
        <a
          href={maps.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all tap-bounce truncate"
        >
          <Navigation className="w-3.5 h-3.5 shrink-0" />
          <span>Chỉ Đường</span>
        </a>

        <button
          type="button"
          onClick={handleSaveToItinerary}
          className="py-3 px-3.5 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all shrink-0 tap-bounce"
        >
          <Bookmark className="w-3.5 h-3.5 shrink-0" />
          <span>Lưu Tour</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="py-3 px-3.5 rounded-full bg-[#FFFDF7] border border-[#26221B]/15 text-[#26221B] font-bold text-xs flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all shrink-0 tap-bounce"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>Chia Sẻ</span>
        </button>
      </div>
    </div>
  );
}
