'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Share2, AlertTriangle, Map, X, Check, MapPin } from 'lucide-react';

interface ItineraryExportModalProps {
  onClose: () => void;
  tourTitle?: string;
  duration?: string;
  totalSpots?: number;
}

export default function ItineraryExportModal({ onClose, tourTitle, duration, totalSpots }: ItineraryExportModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const itineraryData = {
    title: 'Lịch Trình Bảy Núi 2N1Đ',
    spots: [
      'Sáng: Chùa Tà Pạ (Xã Núi Tô)',
      'Trưa: Quán Gà Đốt Ô Thum (Xã Ô Lâm)',
      'Chiều: Cổng Trời Koh Kas (Xã Chau Lăng)',
      'Tối: Cô Tô Mountain Homestay'
    ],
    emergency: {
      police: '0296 3874 113 (Công an Tri Tôn)',
      hospital: '0296 3874 115 (TT Y Tế Tri Tôn)'
    },
    url: 'https://dulichtriton.vn/itinerary/12345'
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(qrRef.current);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'QR-Lich-Trinh-Tri-Ton.png';
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
    if (!pdfRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Lich-Trinh-Tri-Ton-Offline.pdf');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#1B4D3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-[#D99B26]" />
            <h3 className="font-bold">Xuất Lịch Trình Offline</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 relative">
          <div className="text-sm text-slate-600">
            Lưu lại mã QR hoặc tải file PDF để xem lịch trình khi mất sóng 4G tại khu vực núi rừng.
          </div>

          {/* Hidden PDF Content to render with html2canvas */}
          <div className="absolute top-[-9999px] left-[-9999px]">
             <div ref={pdfRef} className="w-[800px] bg-white p-12 space-y-8 font-sans">
                <div className="border-b-4 border-[#1B4D3E] pb-4 flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-black text-[#1B4D3E]">{itineraryData.title}</h1>
                    <p className="text-xl text-slate-500 mt-2">Bản lưu Offline - Trải nghiệm Du Lịch Tri Tôn</p>
                  </div>
                  <div className="text-right">
                    <QRCodeSVG value={itineraryData.url} size={100} />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Các điểm đến (Tọa độ đã ghim)</h2>
                  <ul className="space-y-3">
                    {itineraryData.spots.map((s, i) => (
                      <li key={i} className="text-lg flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <MapPin className="w-5 h-5 text-[#D99B26]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-rose-700 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    Thông Tin Cứu Hộ Khẩn Cấp (SOS 24/7)
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                      <p className="text-rose-900 font-bold">🚔 Công an Tri Tôn</p>
                      <p className="text-2xl font-black mt-1">{itineraryData.emergency.police}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                      <p className="text-rose-900 font-bold">🚑 Y tế Tri Tôn</p>
                      <p className="text-2xl font-black mt-1">{itineraryData.emergency.hospital}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* QR Section */}
            <div className="flex flex-col items-center justify-center space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                <QRCodeSVG value={itineraryData.url} size={160} level="H" />
              </div>
              <p className="text-xs text-center text-slate-500 font-medium">
                Quét mã để mở lịch trình trên điện thoại khác
              </p>
              <button
                onClick={handleDownloadQR}
                disabled={isExporting}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {exportSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                Lưu Ảnh QR
              </button>
            </div>

            {/* Actions Section */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <h4 className="font-bold text-rose-800 text-sm flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4" /> An Toàn Bảy Núi
                </h4>
                <p className="text-xs text-rose-700/80 leading-relaxed">
                  File PDF sẽ chứa lịch trình chi tiết và **Số điện thoại SOS Công An / Y Tế** để liên hệ trong trường hợp khẩn cấp.
                </p>
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="w-full py-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                {isExporting ? (
                  <span className="animate-pulse">Đang tạo PDF...</span>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-[#D99B26]" />
                    Tải File PDF Lịch Trình
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
