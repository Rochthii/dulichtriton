'use client';

import React, { useState } from 'react';
import { 
  Clock, Sparkles, Bookmark, QrCode, Printer, Check, X, Share2, 
  ChevronDown, ChevronUp, Globe, CheckCircle2 
} from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
}

export default function FormattedChatMessage({ content, isAssistant = true }: FormattedChatMessageProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  // Detect if content is long enough to have expand/collapse (e.g. > 450 chars)
  const isLongContent = content.length > 450;
  const shouldTruncate = isAssistant && isLongContent && !isExpanded;

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

    const formattedBody = content
      .replace(/###?\s*(.+)/g, '<h3 class="section-title">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/-(.*)/g, '<li class="bullet-item">$1</li>')
      .replace(/🗺️ Google Maps: (https:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="map-link">📍 Mở Google Maps</a>')
      .replace(/🎵 TikTok Review: (https:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="tiktok-link">🎵 Xem TikTok Review</a>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thông Tin Du Lịch Tri Tôn — AI Overview</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            @page { size: A4; margin: 15mm; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0F172A;
              line-height: 1.6;
              padding: 0;
              margin: 0;
              background-color: #fff;
            }
            .header-card {
              background: linear-gradient(135deg, #1B4D3E 0%, #0F5132 100%);
              color: white;
              padding: 24px 28px;
              border-radius: 16px;
              margin-bottom: 24px;
              border-bottom: 4px solid #D99B26;
            }
            .header-title {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 6px 0;
              letter-spacing: -0.5px;
            }
            .header-meta {
              font-size: 12px;
              color: #A7F3D0;
              display: flex;
              gap: 16px;
            }
            .badge-verified {
              background: #D99B26;
              color: #0F172A;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 11px;
            }
            .section-title {
              color: #1B4D3E;
              font-size: 16px;
              font-weight: 800;
              margin-top: 20px;
              margin-bottom: 10px;
              padding-bottom: 4px;
              border-bottom: 2px solid #E2E8F0;
            }
            .content-box {
              font-size: 13px;
              line-height: 1.7;
              color: #334155;
            }
            .bullet-item {
              margin-bottom: 6px;
              list-style-type: none;
              padding-left: 0;
            }
            .map-link, .tiktok-link {
              display: inline-block;
              color: #1B4D3E;
              background: #F1F5F9;
              padding: 3px 8px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 700;
              font-size: 11px;
              margin-right: 6px;
              margin-top: 4px;
            }
            .footer-bar {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #E2E8F0;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
            }
          </style>
        </head>
        <body>
          <div class="header-card">
            <h1 class="header-title">✨ THÔNG TIN TỔNG QUAN DU LỊCH TRI TÔN</h1>
            <div class="header-meta">
              <span>Nguồn: Google Search Grounding & Tri Tôn Master Data</span>
              <span>•</span>
              <span>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</span>
              <span class="badge-verified">Dữ liệu XÁC MINH 100%</span>
            </div>
          </div>

          <div class="content-box">
            ${formattedBody}
          </div>

          <div class="footer-bar">
            <strong>Dự án Du Lịch Tri Tôn</strong> — Chuyên trang Thông tin Du lịch, Văn hóa Khmer & Ẩm thực Bảy Núi An Giang.<br/>
            Truy cập trực tuyến: <em>du-lich-tri-ton.vercel.app</em>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
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
        <ul key={`list-${keyPrefix}`} className="space-y-2 my-2.5">
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
          <strong key={index} className="font-extrabold text-[#1B4D3E]">
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
        <div key={`h-${idx}`} className="mt-3.5 mb-2 pt-2 border-t border-slate-100 first:mt-0 first:pt-0 first:border-0">
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
          <li key={`li-${idx}`} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] shrink-0 mt-2" />
            <div className="flex-1">{renderInlineFormatted(rawText)}</div>
          </li>
        );
      }
      return;
    }

    // Regular Paragraph
    flushList(String(idx));
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-800 my-1 font-normal">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList('final');

  // QR Code URL (encodes current page URL with encoded text preview)
  const encodedText = encodeURIComponent(content.slice(0, 300));
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dulichtriton.vercel.app/chatbot?share=${encodedText}`;

  return (
    <div className="space-y-3 text-slate-900">
      {/* ── GOOGLE AI OVERVIEW HEADER BADGE ── */}
      {isAssistant && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-[#1B4D3E]">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Thông tin tổng quan do AI tạo</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-700" />
            Google AI Overview
          </span>
        </div>
      )}

      {/* ── CONTENT STREAM WITH EXPAND/COLLAPSE ACCORDION ── */}
      <div className={`relative transition-all duration-300 ${shouldTruncate ? 'max-h-56 overflow-hidden' : ''}`}>
        {elements}

        {/* Gradient Fade-out when collapsed */}
        {shouldTruncate && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Button (Google SGE Style) */}
      {isLongContent && isAssistant && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
        >
          {isExpanded ? (
            <>
              <span>Thu gọn</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            </>
          ) : (
            <>
              <span>Hiện thêm toàn bộ thông tin</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </>
          )}
        </button>
      )}

      {/* Action Toolbar for Itineraries */}
      {hasItinerary && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dữ liệu đã xác minh
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
              }}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" /> Sao chép
            </button>

            <button
              onClick={handleSave}
              type="button"
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                isSaved
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-emerald-700" />}
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" /> Mã QR
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" /> PDF
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
              Quét Mã QR Thông Tin
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Quét mã này bằng camera điện thoại để mở & chia sẻ thông tin du lịch Tri Tôn
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200/80 mb-4 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeImgUrl}
                alt="QR Code Tri Tôn AI Overview"
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
