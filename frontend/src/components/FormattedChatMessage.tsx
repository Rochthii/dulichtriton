'use client';

import React, { useState } from 'react';
import { Clock, Sparkles, Bookmark, QrCode, Printer, Check, X, Share2 } from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
}

export default function FormattedChatMessage({ content }: FormattedChatMessageProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  if (!content) return null;

  // Detect if content contains tour/itinerary headings or time slots
  const hasItinerary =
    /lịch trình|lộ trình|tour|sáng \(|trưa \(|chiều \(|tối \(/i.test(content);

  const handleSave = () => {
    try {
      const savedList = JSON.parse(localStorage.getItem('triton_saved_itineraries') || '[]');
      const titleMatch = content.match(/###?\s*🌟?\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Lịch Trình Du Lịch Tri Tôn';
      
      const newEntry = {
        id: `itin_${Date.now()}`,
        title,
        content,
        savedAt: new Date().toLocaleString('vi-VN'),
      };

      // Avoid duplicates
      const updated = [newEntry, ...savedList.filter((item: { content: string }) => item.content !== content)].slice(0, 20);
      localStorage.setItem('triton_saved_itineraries', JSON.stringify(updated));
      setIsSaved(true);
    } catch (e) {
      console.warn('Failed to save itinerary:', e);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lịch Trình Du Lịch Tri Tôn AI</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; }
            h1 { color: #1B4D3E; font-size: 20px; margin-bottom: 8px; border-bottom: 2px solid #D99B26; padding-bottom: 8px; }
            .header { margin-bottom: 20px; font-size: 12px; color: #64748b; }
            .content { white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 30px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>🌄 LỊCH TRÌNH DU LỊCH TRI TÔN AN GIANG</h1>
          <div class="header">Được khởi tạo từ Trợ lý Du Lịch Tri Tôn AI • Ngày: ${new Date().toLocaleDateString('vi-VN')}</div>
          <div class="content">${content.replace(/###/g, '■').replace(/\*\*/g, '')}</div>
          <div class="footer">Dự án Du Lịch Tri Tôn — du-lich-tri-ton.vercel.app</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Split into lines for structured parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="space-y-2.5 my-3">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#B45309]">
            {innerText}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(String(idx));
      return;
    }

    // Headings: ### or ## or #
    if (trimmed.startsWith('#')) {
      flushList(String(idx));
      const headingText = trimmed.replace(/^#+\s*/, '');
      const isItineraryHeader = headingText.toLowerCase().includes('lịch trình') || headingText.toLowerCase().includes('lộ trình') || headingText.toLowerCase().includes('tour');

      elements.push(
        <div key={`h-${idx}`} className="mt-4 mb-2 pt-2 border-t border-slate-200/80 first:mt-0 first:pt-0 first:border-0">
          <div className="flex items-center gap-2">
            {isItineraryHeader ? (
              <div className="p-1 rounded-lg bg-amber-100 text-[#B45309]">
                <Clock className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-emerald-100 text-[#1B4D3E]">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#1B4D3E] tracking-tight">
              {renderInlineFormatted(headingText)}
            </h3>
          </div>
        </div>
      );
      return;
    }

    // Bullet Points (- or * or numbered list)
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);

    if (isBullet) {
      const rawText = trimmed.replace(/^([-*]|\d+\.)\s*/, '');

      // Check if bullet item represents a Time Slot (Sáng / Trưa / Chiều / Tối / Ngày)
      const isTimeSlot = /^(Sáng|Trưa|Chiều|Tối|Ngày\s*\d+)/i.test(rawText.replace(/\*\*/g, '').trim());

      if (isTimeSlot) {
        listItems.push(
          <li key={`li-${idx}`} className="bg-emerald-50/90 rounded-2xl p-3 sm:p-3.5 border border-emerald-200/80 shadow-xs flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#D99B26] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed flex-1 font-medium">
              {renderInlineFormatted(rawText)}
            </div>
          </li>
        );
      } else {
        listItems.push(
          <li key={`li-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <span className="w-2 h-2 rounded-full bg-[#D99B26] shrink-0 mt-1.5" />
            <div className="flex-1">{renderInlineFormatted(rawText)}</div>
          </li>
        );
      }
      return;
    }

    // Regular Paragraph
    flushList(String(idx));
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-800 my-1.5 font-medium">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList('final');

  // QR Code URL (encodes current page URL with encoded text preview)
  const encodedText = encodeURIComponent(content.slice(0, 300));
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dulichtriton.vercel.app/chatbot?share=${encodedText}`;

  return (
    <div className="space-y-2 text-slate-900">
      {elements}

      {/* Action Toolbar for Itineraries */}
      {hasItinerary && (
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Tiện ích Lịch trình
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleSave}
              type="button"
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-emerald-700" />}
              {isSaved ? 'Đã lưu' : 'Lưu lịch trình'}
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" /> Mã QR
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" /> Xuất PDF
            </button>
          </div>
        </div>
      )}

      {/* QR Code Share Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-extrabold text-slate-900 text-base mb-1">
              Quét Mã QR Lịch Trình
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Quét mã này bằng camera điện thoại để mở & chia sẻ lịch trình tham quan Tri Tôn
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200/80 mb-4 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeImgUrl}
                alt="QR Code Lịch Trình Tri Tôn"
                className="w-44 h-44 rounded-lg mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white font-medium text-xs hover:bg-[#153e32] transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
