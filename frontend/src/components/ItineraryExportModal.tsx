'use client';

import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Share2, AlertTriangle, Map, X, Check, MapPin, Clock, Bike, Compass, Phone, Shield, Sparkles } from 'lucide-react';
import type { ItineraryData, ItineraryStop } from './WireDiagramItinerary';

interface ItineraryExportModalProps {
  onClose: () => void;
  itinerary?: ItineraryData | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'check-in':  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Check-in Sống Ảo' },
  'food':      { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', label: 'Ẩm Thực Đặc Sản' },
  'spiritual': { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', label: 'Chùa & Tâm Linh' },
  'nature':    { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Thiên Nhiên & Núi' },
  'history':   { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', label: 'Di Tích Lịch Sử' },
};

export default function ItineraryExportModal({ onClose, itinerary: propItinerary }: ItineraryExportModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryData | null>(propItinerary || null);

  useEffect(() => {
    if (propItinerary) {
      setActiveItinerary(propItinerary);
      return;
    }
    let isMounted = true;
    async function loadDefaultItinerary() {
      try {
        const res = await fetch('/api/v1/chat/itinerary?slug=kinh-dien-1-ngay');
        if (!res.ok) throw new Error('Failed to load itinerary');
        const data = await res.json();
        if (isMounted && data.itinerary) {
          setActiveItinerary(data.itinerary);
        }
      } catch (err) {
        console.error('Failed to load default itinerary for export:', err);
      }
    }
    loadDefaultItinerary();
    return () => { isMounted = false; };
  }, [propItinerary]);

  const itinerary = activeItinerary;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/itinerary?slug=${itinerary?.slug || 'kinh-dien-1-ngay'}`
    : `https://dulichtriton.com/itinerary?slug=${itinerary?.slug || 'kinh-dien-1-ngay'}`;

  const emergencyContacts = {
    police: '0296 3874 113',
    hospital: '0296 3874 115',
    hotline: '0296 3771 999',
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(qrRef.current, { scale: 3 });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR-${itinerary?.slug || 'Lich-Trinh-Tri-Ton'}.png`;
      link.href = url;
      link.click();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export QR', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !itinerary) return;
    try {
      setIsExporting(true);
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Subsequent pages if long diagram
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Lich-Trinh-Tri-Ton-${itinerary.slug || 'Chuan'}.pdf`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Group stops by day for wire diagram rendering
  const stopsByDay: Record<number, ItineraryStop[]> = {};
  if (itinerary?.stops) {
    for (const stop of itinerary.stops) {
      const dayNum = stop.day || 1;
      if (!stopsByDay[dayNum]) stopsByDay[dayNum] = [];
      stopsByDay[dayNum].push(stop);
    }
  }
  const daysList = Object.keys(stopsByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#1B4D3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-[#D99B26]" />
            <h3 className="font-bold text-sm sm:text-base">Xuất Sơ Đồ Lịch Trình PDF</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 relative">
          <div className="text-xs sm:text-sm text-slate-600">
            Tải bản PDF dạng <strong>Sơ Đồ Nối Dây Thực Địa</strong> chuẩn A4 để in ấn hoặc xem offline khi mất sóng 4G tại khu vực rừng núi Bảy Núi.
          </div>

          {!itinerary ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-500">
              Đang chuẩn bị sơ đồ lịch trình...
            </div>
          ) : (
            <>
              {/* ── HIDDEN HIGH-RES WIRE DIAGRAM TEMPLATE FOR HTML2CANVAS ── */}
              <div className="absolute top-[-9999px] left-[-9999px]">
                <div ref={pdfRef} style={{ width: '820px', backgroundColor: '#FFFFFF', padding: '36px 40px', fontFamily: '"Plus Jakarta Sans", Arial, sans-serif' }}>
                  
                  {/* Header Banner */}
                  <div style={{ backgroundColor: '#1B4D3E', color: '#FFFFFF', padding: '24px 28px', borderRadius: '18px', marginBottom: '24px', borderBottom: '4px solid #D99B26' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                          SƠ ĐỒ HÀNH TRÌNH THỰC ĐỊA • DU LỊCH TRI TÔN AI
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0', color: '#FFFFFF' }}>
                          {itinerary.emoji} {itinerary.title}
                        </h1>
                        <p style={{ fontSize: '12px', color: '#D1FAE5', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                          {itinerary.tagline}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11px', fontWeight: 700 }}>
                          <span style={{ backgroundColor: '#143B2F', padding: '4px 10px', borderRadius: '8px', color: '#FDE68A' }}>
                            ⏱ {itinerary.duration}
                          </span>
                          {itinerary.budget_range && (
                            <span style={{ backgroundColor: '#143B2F', padding: '4px 10px', borderRadius: '8px', color: '#FDE68A' }}>
                              💰 {itinerary.budget_range}
                            </span>
                          )}
                          <span style={{ backgroundColor: '#143B2F', padding: '4px 10px', borderRadius: '8px', color: '#A7F3D0' }}>
                            👥 {itinerary.for_whom}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '14px', flexShrink: 0 }}>
                        <QRCodeSVG value={shareUrl} size={90} level="M" />
                        <p style={{ fontSize: '9px', fontWeight: 700, color: '#1B4D3E', margin: '4px 0 0 0' }}>Quét xem online</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '24px', textAlign: 'center' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#1B4D3E', margin: 0 }}>{itinerary.stops.length}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 700 }}>Điểm Dừng</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#1B4D3E', margin: 0 }}>{daysList.length}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 700 }}>Số Ngày</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#1B4D3E', margin: 0 }}>{itinerary.best_season || 'Quanh năm'}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 700 }}>Mùa Lý Tưởng</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#D99B26', margin: 0 }}>Xe Máy / Ô Tô</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 700 }}>Phương Tiện</p>
                    </div>
                  </div>

                  {/* Day by Day Wire Diagram Flow */}
                  {daysList.map(dayNum => {
                    const stops = stopsByDay[dayNum] || [];
                    return (
                      <div key={dayNum} style={{ marginBottom: '24px' }}>
                        {/* Day Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
                          <span style={{ backgroundColor: '#1B4D3E', color: '#FFFFFF', fontWeight: 900, fontSize: '11px', padding: '4px 12px', borderRadius: '8px' }}>
                            {daysList.length > 1 ? `NGÀY ${dayNum}` : 'LỘ TRÌNH CHI TIẾT'}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                            {stops.length} Mốc Điểm Đến Node
                          </span>
                        </div>

                        {/* Stops List */}
                        <div>
                          {stops.map((stop, idx) => {
                            const cat = CATEGORY_COLORS[stop.category] || CATEGORY_COLORS['nature'];
                            const isLast = idx === stops.length - 1;

                            return (
                              <div key={stop.order || idx}>
                                {/* Stop Card Node */}
                                <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px', marginBottom: '4px' }}>
                                  
                                  {/* Left Timeline Indicator */}
                                  <div style={{ width: '80px', flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ backgroundColor: '#1B4D3E', color: '#FFFFFF', fontWeight: 800, fontSize: '12px', padding: '3px 8px', borderRadius: '8px', textAlign: 'center', marginBottom: '4px' }}>
                                      {stop.time_start}
                                    </div>
                                    {stop.duration_min > 0 && (
                                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 600, textAlign: 'center' }}>
                                        {stop.duration_min} phút
                                      </p>
                                    )}
                                  </div>

                                  {/* Right Node Box */}
                                  <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ backgroundColor: '#D99B26', color: '#0F172A', fontWeight: 900, fontSize: '10px', padding: '2px 7px', borderRadius: '6px' }}>
                                          NODE #{stop.order || idx + 1}
                                        </span>
                                        <span style={{ backgroundColor: cat.bg, color: cat.text, border: `1px solid ${cat.border}`, fontWeight: 700, fontSize: '10px', padding: '2px 8px', borderRadius: '6px' }}>
                                          {cat.label}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                                        📍 {stop.commune}
                                      </span>
                                    </div>

                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                                      {stop.name}
                                    </h3>

                                    {stop.tip && (
                                      <div style={{ backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '6px', fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>
                                        <strong style={{ color: '#B45309' }}>💡 Mẹo & Hoạt động: </strong>
                                        {stop.tip}
                                      </div>
                                    )}

                                    {stop.cost_vnd && (
                                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', margin: '6px 0 0 0' }}>
                                        💰 Chi phí: {stop.cost_vnd}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Connecting Transit Stepper Arrow */}
                                {!isLast && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '4px 0' }}>
                                    <div style={{ width: '80px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                      <div style={{ width: '2px', height: '22px', backgroundColor: '#CBD5E1' }} />
                                    </div>
                                    <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      ↓ {stop.transport_to_next || (stop.travel_to_next_min > 0 ? `Di chuyển ${stop.travel_to_next_min} phút (${stop.travel_to_next_km}km)` : 'Di chuyển tiếp')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tips Section */}
                  {Array.isArray(itinerary.tips) && itinerary.tips.length > 0 && (
                    <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', margin: '0 0 8px 0' }}>
                        💡 LƯU Ý THỰC ĐỊA QUAN TRỌNG:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#78350F', lineHeight: 1.6 }}>
                        {itinerary.tips.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Emergency SOS Section */}
                  <div style={{ backgroundColor: '#FFF1F2', border: '2px solid #FECDD3', borderRadius: '16px', padding: '14px 18px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: '#BE123C' }}>
                        🚨 THÔNG TIN CỨU HỘ & KHẨN CẤP 24/7 (TRI TÔN, AN GIANG)
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
                      <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFE4E6' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🚔 Công An Tri Tôn</p>
                        <p style={{ margin: '3px 0 0 0', fontWeight: 900, fontSize: '13px', color: '#BE123C' }}>{emergencyContacts.police}</p>
                      </div>
                      <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFE4E6' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🚑 Y Tế Tri Tôn</p>
                        <p style={{ margin: '3px 0 0 0', fontWeight: 900, fontSize: '13px', color: '#BE123C' }}>{emergencyContacts.hospital}</p>
                      </div>
                      <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFE4E6' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🏛️ Hỗ Trợ Du Lịch</p>
                        <p style={{ margin: '3px 0 0 0', fontWeight: 900, fontSize: '13px', color: '#BE123C' }}>{emergencyContacts.hotline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Watermark */}
                  <div style={{ textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '12px', fontSize: '10px', color: '#94A3B8' }}>
                    Dự án Chuyên trang Du Lịch Tri Tôn • Website: <strong>dulichtriton.com</strong> • Dữ liệu thực địa chuẩn xác 2026
                  </div>

                </div>
              </div>

              {/* ── UI DIALOG BUTTONS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Section */}
                <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-2xs border border-slate-200">
                    <QRCodeSVG value={shareUrl} size={140} level="H" />
                  </div>
                  <p className="text-[11px] text-center text-slate-500 font-medium">
                    Quét mã để mở sơ đồ trực tuyến trên điện thoại
                  </p>
                  <button
                    onClick={handleDownloadQR}
                    disabled={isExporting}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    {exportSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    Lưu Ảnh QR
                  </button>
                </div>

                {/* PDF Action Section */}
                <div className="space-y-3 flex flex-col justify-center">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                    <h4 className="font-extrabold text-[#1B4D3E] text-xs flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-[#D99B26]" /> Sơ Đồ Nối Dây Chuẩn A4
                    </h4>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      PDF được căn chỉnh theo dạng sơ đồ trạm node, hiển thị thời gian, mẹo ăn uống và số điện thoại SOS cứu hộ.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="w-full py-3.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 active:scale-95"
                  >
                    {isExporting ? (
                      <span className="animate-pulse">Đang kết xuất PDF...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#D99B26]" />
                        Tải PDF Sơ Đồ Lịch Trình
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
