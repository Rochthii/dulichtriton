'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Navigation, Sparkles, QrCode, 
  Car, Bike, Compass, Play, ArrowDown, CheckCircle2,
  Sun, AlertCircle, Info, Tag, Coins, Users, Heart, Zap,
  Plus, Trash2, ArrowRight, Check, Route, ShieldAlert, Footprints,
  LocateFixed, ShieldCheck, Crosshair
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import SmartTripBuilder from './SmartTripBuilder';
import ItineraryExportModal from './ItineraryExportModal';
import { getGoogleMapsUrl, getDeviceHardwareGps, TRI_TON_CENTER_COORDS } from '@/lib/maps';
import type { ItineraryData, ItineraryStop } from './WireDiagramItinerary';
import WireDiagramItinerary from './WireDiagramItinerary';
import { optimizeRouteTSP, OptimizablePlace, OptimizedRouteResult } from '@/lib/routeOptimizer';
import { supabase } from '@/lib/supabase';

interface PresetSummary {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  for_whom: string;
  duration: string;
  budget_range: string;
  sort_order: number;
}

const CATEGORY_STYLE: Record<string, { bg: string; label: string }> = {
  'check-in':  { bg: 'bg-[#0E8C7F]/10 text-[#0E8C7F] border-[#0E8C7F]/30',     label: 'Check-in Thắng Cảnh' },
  'food':      { bg: 'bg-[#F26B3A]/10 text-[#F26B3A] border-[#F26B3A]/30',   label: 'Ẩm Thực Đặc Sản' },
  'spiritual': { bg: 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30', label: 'Chùa & Tâm Linh' },
  'nature':    { bg: 'bg-[#0E8C7F]/10 text-[#0E8C7F] border-[#0E8C7F]/30', label: 'Thiên Nhiên & Núi' },
  'history':   { bg: 'bg-[#A6503A]/10 text-[#A6503A] border-[#A6503A]/30',     label: 'Di Tích Lịch Sử' },
  'stay':      { bg: 'bg-[#8A5A33]/10 text-[#8A5A33] border-[#8A5A33]/30',     label: 'Lưu Trú Homestay' },
};

type DurationFilter = 'all' | '1-day' | 'evening' | '2-day' | '3-day';
type PlannerTab = 'presets' | 'optimizer';

export default function ItineraryClientPage() {
  const [activeTab, setActiveTab] = useState<PlannerTab>('presets');
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [transport, setTransport] = useState<'bike' | 'car'>('bike');
  const [showExportModal, setShowExportModal] = useState(false);
  const [savedFavorites, setSavedFavorites] = useState<Record<string, boolean>>({});

  // ── Custom Route Optimizer State ──────────────────────────────────────────
  const [allPois, setAllPois] = useState<OptimizablePlace[]>([]);
  const [selectedCustomPlaces, setSelectedCustomPlaces] = useState<OptimizablePlace[]>([]);
  const [optimizedResult, setOptimizedResult] = useState<OptimizedRouteResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startPlaceId, setStartPlaceId] = useState<string>('tri_ton_center');
  const [gpsStatusText, setGpsStatusText] = useState<string>('');
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);

  // ── Fetch presets list on mount ───────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadPresets() {
      try {
        const res = await fetch('/api/v1/chat/itinerary');
        if (!res.ok) throw new Error('Failed to load presets');
        const data = await res.json();
        if (isMounted && Array.isArray(data.presets) && data.presets.length > 0) {
          setPresets(data.presets);
          setSelectedSlug(data.presets[0].slug);
        }
      } catch (err) {
        console.error('Error fetching itinerary presets:', err);
      } finally {
        if (isMounted) setIsListLoading(false);
      }
    }
    loadPresets();
    return () => { isMounted = false; };
  }, []);

  // ── Fetch full itinerary details on selectedSlug change ───────────────────
  useEffect(() => {
    if (!selectedSlug) return;
    let isMounted = true;
    async function loadDetail() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/chat/itinerary?slug=${encodeURIComponent(selectedSlug)}`);
        if (!res.ok) throw new Error('Failed to load detail');
        const data = await res.json();
        if (isMounted && data.itinerary) {
          setCurrentItinerary(data.itinerary);
        }
      } catch (err) {
        console.error('Error fetching itinerary detail:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDetail();
    return () => { isMounted = false; };
  }, [selectedSlug]);

  // ── Load POIs for Custom Route Optimizer ──────────────────────────────────
  useEffect(() => {
    async function loadOptimizerPlaces() {
      try {
        const { data } = await supabase
          .from('places')
          .select('id, name, commune, latitude, longitude, category, image_url')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (data && data.length > 0) {
          const formatted: OptimizablePlace[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            commune: p.commune || 'Tri Tôn',
            latitude: Number(p.latitude) || 10.42,
            longitude: Number(p.longitude) || 105.01,
            category: p.category || 'nature',
            image_url: p.image_url,
          }));
          setAllPois(formatted);

          // Check if user has saved custom itinerary in localStorage
          const savedIds: string[] = JSON.parse(localStorage.getItem('triton_custom_itinerary') || '[]');
          if (savedIds.length > 0) {
            const savedItems = formatted.filter((p) => savedIds.includes(p.id));
            if (savedItems.length >= 2) {
              setSelectedCustomPlaces(savedItems);
              setOptimizedResult(optimizeRouteTSP(savedItems));
              return;
            }
          }

          // Default initial selection (Iconic Tri Ton Loop)
          const defaultPois = formatted.filter(
            (p) =>
              p.name.includes('Hồ Tà Pạ') ||
              p.name.includes('Gà Đốt') ||
              p.name.includes('Chùa Xà Tón') ||
              p.name.includes('Núi Cô Tô')
          ).slice(0, 4);

          if (defaultPois.length >= 2) {
            setSelectedCustomPlaces(defaultPois);
            setOptimizedResult(optimizeRouteTSP(defaultPois));
          }
        }
      } catch (err) {
        console.error('Error loading places for optimizer:', err);
      }
    }
    loadOptimizerPlaces();
  }, []);

  // Get user's real hardware GPS (NO IP LOOKUP)
  const handleGetDeviceGps = () => {
    setIsLocatingGps(true);
    setGpsStatusText('Đang kết nối chip GPS phần cứng thiết bị...');
    getDeviceHardwareGps(
      (coords) => {
        setIsLocatingGps(false);
        const myGpsPlace: OptimizablePlace = {
          id: 'user_device_gps',
          name: '📍 Vị trí GPS của tôi (Thiết bị)',
          commune: 'Vị trí hiện tại',
          latitude: coords.latitude,
          longitude: coords.longitude,
          category: 'gps',
        };

        // Add as start point
        const filtered = selectedCustomPlaces.filter((p) => p.id !== 'user_device_gps');
        const updated = [myGpsPlace, ...filtered];
        setSelectedCustomPlaces(updated);
        setStartPlaceId('user_device_gps');
        const result = optimizeRouteTSP(updated, 'user_device_gps');
        setOptimizedResult(result);
        setGpsStatusText(`Đã lấy GPS thành công: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        setTimeout(() => setGpsStatusText(''), 4000);
      },
      (errMsg) => {
        setIsLocatingGps(false);
        setGpsStatusText(errMsg);
        setTimeout(() => setGpsStatusText(''), 5000);
      }
    );
  };

  // Add place to custom optimizer list
  const handleAddPlace = (p: OptimizablePlace) => {
    if (selectedCustomPlaces.some((item) => item.id === p.id)) return;
    if (selectedCustomPlaces.length >= 8) {
      alert('Bạn chỉ nên chọn tối đa 8 địa điểm trong 1 ngày để đảm bảo thời gian tham quan!');
      return;
    }
    const updated = [...selectedCustomPlaces, p];
    setSelectedCustomPlaces(updated);
    const result = optimizeRouteTSP(updated, startPlaceId || undefined);
    setOptimizedResult(result);
  };

  // Remove place from custom optimizer list
  const handleRemovePlace = (id: string) => {
    const updated = selectedCustomPlaces.filter((p) => p.id !== id);
    setSelectedCustomPlaces(updated);
    if (updated.length >= 2) {
      const result = optimizeRouteTSP(updated, startPlaceId || undefined);
      setOptimizedResult(result);
    } else {
      setOptimizedResult(null);
    }
  };

  // Trigger TSP optimization
  const handleRunOptimizer = () => {
    if (selectedCustomPlaces.length < 2) return;
    const result = optimizeRouteTSP(selectedCustomPlaces, startPlaceId || undefined);
    setOptimizedResult(result);
  };

  // Filter presets based on duration
  const filteredPresets = presets.filter(p => {
    if (durationFilter === 'all') return true;
    const d = (p.duration || '').toLowerCase();
    if (durationFilter === '1-day') return d.includes('1 ngày') && !d.includes('đêm');
    if (durationFilter === 'evening') return d.includes('chiều') || d.includes('nửa ngày') || d.includes('hoàng hôn');
    if (durationFilter === '2-day') return d.includes('2 ngày') || d.includes('2n1đ');
    if (durationFilter === '3-day') return d.includes('3 ngày') || d.includes('3n2đ');
    return true;
  });

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="35 Lịch Trình Gợi Ý & Tối Ưu Tuyến Đường"
        badgeIcon={Compass}
        title="LẬP KẾ HOẠCH & TỐI ƯU LỘ TRÌNH DU LỊCH BẢY NÚI"
        subtitle="Khám phá các tour gợi ý chuyên sâu hoặc tự chọn các điểm đến yêu thích để hệ thống tự động sắp xếp thứ tự ngắn nhất, tránh đi vòng và tiết kiệm thời gian qua đèo."
        countLabel="Lịch trình gợi ý"
        countValue="35 Kịch bản tour"
      />

      {/* ── TOP PLANNER MODE SWITCHER TABS ── */}
      <div className="flex items-center justify-center gap-3 my-6 font-display">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all tap-bounce ${
            activeTab === 'presets'
              ? 'bg-[#0E8C7F] text-white shadow-md'
              : 'bg-[#FFFDF7] text-[#6B6355] border border-[#26221B]/10 hover:border-[#0E8C7F]/40'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Lịch Trình Có Sẵn (35 Tour)</span>
        </button>

        <button
          onClick={() => setActiveTab('optimizer')}
          className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all tap-bounce ${
            activeTab === 'optimizer'
              ? 'bg-[#F0A32F] text-[#26221B] shadow-md'
              : 'bg-[#FFFDF7] text-[#6B6355] border border-[#26221B]/10 hover:border-[#F0A32F]/40'
          }`}
        >
          <Zap className="w-4 h-4 text-[#26221B]" />
          <span>Tự Chọn Điểm & Tối Ưu Đường Đi</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: 35 LỊCH TRÌNH CHUẨN THỰC ĐỊA
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'presets' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">

          {/* ── SMART TRIP BUILDER: 3-Button Filter ── */}
          <SmartTripBuilder
            onTourSelected={(slug, _cost, _name) => {
              setSelectedSlug(slug);
              // Smooth scroll to the preset list after short delay
              setTimeout(() => {
                const el = document.getElementById('preset-list-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 150);
            }}
          />

          {/* Duration Filter Pills (Horizontal Scroll on Mobile) */}
          <div id="preset-list-anchor" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#FFFDF7] p-2 sm:p-3 rounded-2xl sm:rounded-[22px] border border-[#26221B]/8 shadow-xs font-display">
            <span className="text-[11px] sm:text-xs font-bold text-[#6B6355] px-1.5 sm:px-2 shrink-0">Thời lượng:</span>
            {[
              { key: 'all', label: 'Tất Cả' },
              { key: '1-day', label: '1 Ngày Trọn Vẹn' },
              { key: 'evening', label: 'Nửa Ngày / Chiều Tà' },
              { key: '2-day', label: '2 Ngày 1 Đêm (2N1Đ)' },
              { key: '3-day', label: '3 Ngày 2 Đêm (3N2Đ)' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setDurationFilter(f.key as DurationFilter)}
                className={`whitespace-nowrap px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all tap-bounce shrink-0 ${
                  durationFilter === f.key
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:border-[#0E8C7F]/30 border border-[#26221B]/6'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* MOBILE PRESET SELECTOR (Compact Swipe Carousel + Quick Picker) */}
          <div className="block md:hidden space-y-2.5">
            {/* Quick Dropdown Picker */}
            <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-[#26221B]/8 shadow-xs space-y-1.5">
              <label className="text-[11px] font-bold text-[#6B6355] uppercase tracking-wider font-display flex items-center justify-between">
                <span>Chọn nhanh tour mẫu ({filteredPresets.length} tour)</span>
                {currentItinerary && (
                  <span className="text-[#0E8C7F] font-extrabold">{currentItinerary.duration}</span>
                )}
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-bold text-[#26221B] focus:outline-none focus:border-[#0E8C7F]"
              >
                {filteredPresets.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.duration} — {p.title} ({p.budget_range})
                  </option>
                ))}
              </select>
            </div>

            {/* Swipeable Horizontal Cards */}
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none snap-x snap-mandatory">
              {filteredPresets.map((p) => {
                const isSelected = selectedSlug === p.slug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className={`snap-start shrink-0 w-[70vw] max-w-[260px] p-2.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FFFDF7] border-[#0E8C7F] ring-2 ring-[#0E8C7F]/30 shadow-md'
                        : 'bg-[#FFFDF7] border-[#26221B]/8 hover:border-[#0E8C7F]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-display mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-[9px] font-bold">
                        {p.duration}
                      </span>
                      <span className="text-[10px] font-bold text-[#D9822B]">{p.budget_range}</span>
                    </div>
                    <h3 className="font-display text-xs font-bold text-[#26221B] line-clamp-1 mb-0.5">
                      {p.title}
                    </h3>
                    <p className="text-[10px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {p.tagline}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Presets Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DESKTOP Left Column: Preset Cards List (Hidden on Mobile) */}
            <div className="hidden md:block md:col-span-1 space-y-3 max-h-[820px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredPresets.map((p) => {
                const isSelected = selectedSlug === p.slug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className={`ticket-stub p-4 rounded-[22px] border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FFFDF7] border-[#0E8C7F] ring-2 ring-[#0E8C7F]/30 shadow-md translate-x-1'
                        : 'bg-[#FFFDF7] border-[#26221B]/8 hover:border-[#0E8C7F]/30 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-display mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-[10px] font-bold">
                        {p.duration}
                      </span>
                      <span className="text-xs font-bold text-[#D9822B]">{p.budget_range}</span>
                    </div>

                    <h3 className="font-display text-sm font-bold text-[#26221B] line-clamp-1 mb-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {p.tagline}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Wire Diagram Itinerary View */}
            <div className="md:col-span-2">
              {isLoading ? (
                <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-8 sm:p-12 text-center border border-[#26221B]/8 animate-pulse font-display">
                  <Compass className="w-8 h-8 text-[#0E8C7F] animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#6B6355]">Đang nạp chi tiết lộ trình...</p>
                </div>
              ) : currentItinerary ? (
                <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-4 sm:p-8 border border-[#26221B]/8 shadow-md space-y-4 sm:space-y-6">
                  {/* Top Bar with Export QR */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#26221B]/6 pb-3 sm:pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0E8C7F] text-white text-[11px] sm:text-xs font-bold font-display">
                          {currentItinerary.duration}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#D9822B] font-display">
                          {currentItinerary.budget_range}
                        </span>
                      </div>
                      <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#26221B] leading-tight">
                        {currentItinerary.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => setShowExportModal(true)}
                      className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-display tap-bounce shrink-0 shadow-2xs"
                    >
                      <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Xuất Lịch Trình (QR/PDF)</span>
                    </button>
                  </div>

                  {/* Wire Diagram Itinerary */}
                  <WireDiagramItinerary itinerary={currentItinerary} transport={transport} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: TRÌNH TỐI ƯU TUYẾN ĐƯỜNG TỰ CHỌN
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'optimizer' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Card */}
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26221B]/6 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F0A32F]/15 text-[#26221B] text-xs font-bold uppercase tracking-wider mb-1 font-display">
                  <Zap className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>Gợi Ý Lộ Trình Tối Ưu</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B]">
                  Tự Động Sắp Xếp Thứ Tự Ngắn Nhất & Tránh Đi Vòng
                </h2>
                <p className="text-xs text-[#6B6355] mt-1 font-body">
                  Tự động sắp xếp các điểm đến theo thứ tự thuận đường nhất, giúp bạn tiết kiệm thời gian di chuyển và hạn chế đi vòng qua các cung đèo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetDeviceGps}
                  disabled={isLocatingGps}
                  className="px-4 py-3 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all tap-bounce shrink-0"
                >
                  <Crosshair className={`w-4 h-4 ${isLocatingGps ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGps ? 'Đang dò vị trí...' : 'Vị trí của tôi'}</span>
                </button>

                {selectedCustomPlaces.length >= 2 && (
                  <button
                    onClick={handleRunOptimizer}
                    className="px-6 py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all tap-bounce shrink-0"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Tối Ưu Đường Đi</span>
                  </button>
                )}
              </div>
            </div>

            {/* GPS Feedback notification if any */}
            {gpsStatusText && (
              <div className="p-3 rounded-xl bg-[#0E8C7F]/10 border border-[#0E8C7F]/20 text-xs font-bold text-[#0E8C7F] flex items-center gap-2 font-display">
                <ShieldCheck className="w-4 h-4" />
                <span>{gpsStatusText}</span>
              </div>
            )}

            {/* Selected Places Tray */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold font-display">
                <span className="text-[#0E8C7F]">
                  Địa điểm đã chọn trong chuyến đi ({selectedCustomPlaces.length}/8 điểm):
                </span>
                {selectedCustomPlaces.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCustomPlaces([]);
                      setOptimizedResult(null);
                    }}
                    className="text-[#A6503A] hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {selectedCustomPlaces.length === 0 ? (
                <div className="p-6 rounded-[20px] bg-[#FAF3E7] text-center text-xs text-[#6B6355] font-body">
                  Chưa có địa điểm nào được chọn. Hãy chọn các địa điểm yêu thích bên dưới hoặc bấm &quot;Vị trí của tôi&quot; để tạo lộ trình tối ưu!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCustomPlaces.map((p, idx) => (
                    <div
                      key={p.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-display shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0E8C7F] text-white flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#26221B]">{p.name}</span>
                      <button
                        onClick={() => handleRemovePlace(p.id)}
                        className="text-[#6B6355] hover:text-[#A6503A] p-0.5"
                        title="Xóa điểm này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── OPTIMIZATION RESULTS CARD ── */}
          {optimizedResult && selectedCustomPlaces.length >= 2 && (
            <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-md space-y-6">
              {/* Savings Matrix Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-display">
                <div className="bg-[#FAF3E7] p-4 rounded-[20px] border border-[#26221B]/8">
                  <span className="text-[10px] font-bold text-[#6B6355] uppercase block">Tổng quãng đường</span>
                  <span className="text-xl font-extrabold text-[#0E8C7F] mt-1 block">
                    {optimizedResult.optimizedKm} km
                  </span>
                </div>

                <div className="bg-[#FAF3E7] p-4 rounded-[20px] border border-[#26221B]/8">
                  <span className="text-[10px] font-bold text-[#6B6355] uppercase block">Thời gian lái xe</span>
                  <span className="text-xl font-extrabold text-[#26221B] mt-1 block">
                    ~{optimizedResult.totalDrivingMinutes} phút
                  </span>
                </div>

                <div className="bg-[#0E8C7F]/10 p-4 rounded-[20px] border border-[#0E8C7F]/30">
                  <span className="text-[10px] font-bold text-[#0E8C7F] uppercase block">Tiết kiệm quãng đường</span>
                  <span className="text-xl font-extrabold text-[#0E8C7F] mt-1 block">
                    -{optimizedResult.savedKm} km
                  </span>
                </div>

                <div className="bg-[#F0A32F]/15 p-4 rounded-[20px] border border-[#F0A32F]/40">
                  <span className="text-[10px] font-bold text-[#26221B] uppercase block">Tiết kiệm thời gian</span>
                  <span className="text-xl font-extrabold text-[#D9822B] mt-1 block">
                    -{optimizedResult.savedMinutes} phút
                  </span>
                </div>
              </div>

              {/* Step-by-Step Optimized Route List */}
              <div className="space-y-3 font-body">
                <h3 className="font-display text-base font-bold text-[#26221B] flex items-center gap-2">
                  <Route className="w-5 h-5 text-[#0E8C7F]" />
                  <span>Thứ Tự Di Chuyển Tối Ưu Nhất:</span>
                </h3>

                <div className="space-y-2">
                  {optimizedResult.orderedPlaces.map((place, idx) => {
                    const leg = optimizedResult.legs[idx];
                    return (
                      <div key={place.id} className="space-y-2">
                        {/* Stop Node */}
                        <div className="p-4 rounded-[22px] bg-[#FAF3E7] border border-[#26221B]/8 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0E8C7F] text-white flex items-center justify-center font-display font-extrabold text-xs shadow-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-display text-sm font-bold text-[#26221B]">{place.name}</h4>
                              <p className="text-xs text-[#6B6355] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#F0A32F]" />
                                <span>{place.commune}</span>
                              </p>
                            </div>
                          </div>

                          <a
                            href={getGoogleMapsUrl({
                              name: place.name,
                              commune: place.commune,
                              lat: place.latitude,
                              lng: place.longitude,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-full bg-[#FFFDF7] text-[#0E8C7F] text-xs font-bold border border-[#0E8C7F]/20 hover:bg-[#0E8C7F] hover:text-white transition-all font-display tap-bounce shrink-0"
                          >
                            Chỉ đường
                          </a>
                        </div>

                        {/* Leg connector if not last */}
                        {leg && (
                          <div className="flex items-center gap-2 pl-7 py-1 text-xs text-[#6B6355] font-display">
                            <div className="w-0.5 h-6 bg-[#0E8C7F]/40 ml-1.5" />
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF7] text-[11px] font-bold text-[#0E8C7F] border border-[#0E8C7F]/20">
                              → {leg.distanceKm} km (khoảng {leg.estimatedMinutes} phút {leg.roadType === 'mountain_pass' ? 'đường đèo' : 'đồng bằng'})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Stop Google Maps Navigation CTA */}
              <div className="pt-4 border-t border-[#26221B]/6 flex flex-col sm:flex-row items-center justify-between gap-4 font-display">
                <a
                  href={optimizedResult.googleMapsMultiStopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all tap-bounce"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Mở Google Maps Dẫn Đường Toàn Tuyến</span>
                </a>

                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-full bg-[#FFFDF7] border border-[#26221B]/15 text-[#26221B] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:border-[#0E8C7F] transition-all tap-bounce"
                >
                  <QrCode className="w-4 h-4 text-[#0E8C7F]" />
                  <span>Lưu & Xuất Lịch Trình</span>
                </button>
              </div>
            </div>
          )}

          {/* ── POI PICKER LIST ── */}
          <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#26221B]/8 shadow-sm space-y-4 font-body">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26221B]/6 pb-3">
              <h3 className="font-display text-base font-bold text-[#26221B]">
                Danh Sách Điểm Đến Có Thể Thêm Vào Tour ({allPois.length} Địa Điểm Đã Xác Minh)
              </h3>
              <input
                type="text"
                placeholder="Tìm nhanh địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-1.5 rounded-full border border-[#26221B]/15 text-xs text-[#26221B] bg-[#FAF3E7] focus:outline-none focus:border-[#0E8C7F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {allPois
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.commune.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => {
                  const isAdded = selectedCustomPlaces.some((item) => item.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-[20px] border flex items-center justify-between gap-2 transition-all ${
                        isAdded ? 'bg-[#0E8C7F]/10 border-[#0E8C7F]/40' : 'bg-[#FAF3E7] border-[#26221B]/6 hover:bg-white'
                      }`}
                    >
                      <div className="truncate">
                        <h4 className="font-display text-xs font-bold text-[#26221B] truncate">{p.name}</h4>
                        <span className="text-[10px] text-[#6B6355] truncate block">{p.commune}</span>
                      </div>

                      <button
                        onClick={() => (isAdded ? handleRemovePlace(p.id) : handleAddPlace(p))}
                        className={`p-1.5 rounded-full text-xs font-bold transition-all tap-bounce shrink-0 ${
                          isAdded
                            ? 'bg-[#0E8C7F] text-white'
                            : 'bg-[#FFFDF7] text-[#26221B] border border-[#26221B]/10 hover:bg-[#F0A32F]'
                        }`}
                        title={isAdded ? 'Đã thêm (Bấm để xóa)' : 'Thêm vào tour'}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      )}

      {/* Export QR Modal */}
      {showExportModal && currentItinerary && (
        <ItineraryExportModal
          itinerary={currentItinerary}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
