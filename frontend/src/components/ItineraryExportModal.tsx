'use client';

import React, { useState } from 'react';
import { X, QrCode, Download, Share2, FileText, Check, Sparkles, MapPin } from 'lucide-react';

interface ItineraryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  duration: string;
  totalSpots: number;
}

export default function ItineraryExportModal({
  isOpen,
  onClose,
  tourTitle,
  duration,
  totalSpots,
}: ItineraryExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6 text-[#D99B26]" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#D99B26] uppercase tracking-widest block mb-1">Xuất Lịch Trình Ngoại Tuyến</span>
            <h3 className="text-xl font-extrabold text-slate-900">{tourTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quét mã QR để lưu toàn bộ lộ trình {duration} vào điện thoại hoặc dùng khi không có 4G.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 inline-block shadow-inner">
            {/* Standard Generated QR Code for Tri Ton Tour */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://dulichtriton.vn/itinerary/tour-2n1d&color=1B4D3E"
              alt="QR Code Lịch trình Tri Tôn"
              className="w-44 h-44 mx-auto rounded-xl shadow-xs border border-slate-200"
            />
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Bao gồm {totalSpots} địa điểm WGS84 chuẩn</span>
            </div>
          </div>

          {/* Actions Button Group */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D99B26]" />
                  <span>Đã Sao Chép Liên Kết Tour!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#D99B26]" />
                  <span>Sao Chép Link Chia Sẻ Tour</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintPDF}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Tải Bàn In / Lưu PDF Ngoại Tuyến</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
