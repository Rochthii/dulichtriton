'use client';

import React, { useState } from 'react';
import { 
  Clock, Sparkles, Bookmark, QrCode, Printer, Check, X, Share2, 
  ChevronDown, ChevronUp, Globe, CheckCircle2, Navigation, Play, ExternalLink 
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

  const isLongContent = content.length > 550;
  const shouldTruncate = isAssistant && isLongContent && !isExpanded;

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
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="action-link">$1</a>')
      .replace(/-(.*)/g, '<li class="bullet-item">$1</li>');

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
            .action-link {
              display: inline-block;
              color: #1B4D3E;
              background: #F1F5F9;
              padding: 4px 10px;
              border-radius: 8px;
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
            <h1 class="header-title">✨ THÔNG TIN DU LỊCH TRI TÔN</h1>
            <div class="header-meta">
              <span>Nguồn: Thông tin thực địa & Live Search Tri Tôn</span>
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

  // ── Render inline tokens (Bold + Markdown Links + Plain text) ──────────────
  const renderInlineFormatted = (text: string) => {
    // Match markdown link: [label](url) OR bold: **bold**
    const tokenRegex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. Markdown Links: [label](url)
      const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const url = linkMatch[2];
        const isMaps = url.includes('google.com/maps') || url.includes('maps.google') || /maps|chỉ đường/i.test(label);
        const isTikTok = url.includes('tiktok.com') || /tiktok/i.test(label);

        if (isMaps) {
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 my-1 mr-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] shadow-2xs transition-all active:scale-95 no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation className="w-3 h-3 text-amber-300 shrink-0" />
              <span>{label.replace(/^[📍🗺️]\s*/, '')}</span>
            </a>
          );
        }

        if (isTikTok) {
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 my-1 mr-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] shadow-2xs transition-all active:scale-95 no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-3 h-3 fill-white text-white shrink-0" />
              <span>{label.replace(/^[▶🎵]\s*/, '')}</span>
            </a>
          );
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B4D3E] hover:underline font-bold inline-flex items-center gap-0.5 text-xs mx-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }

      // 2. Bold text: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#1B4D3E]">
            {innerText}
          </strong>
        );
      }

      // 3. Regular text
      return part;
    });
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
      const isItineraryHeader = /lịch trình|lộ trình|tour/i.test(headingText);

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

      {/* Accordion Toggle Button for Mobile / Long Messages */}
      {isAssistant && isLongContent && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 px-3 mt-1 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-[#1B4D3E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200/60"
        >
          {isExpanded ? (
            <>
              <span>Thu gọn câu trả lời</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Đọc toàn bộ nội dung chi tiết</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      {/* ── ACTION BAR (Lưu, In/Tải PDF, Chia sẻ QR) ── */}
      {isAssistant && hasItinerary && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="font-semibold text-emerald-800">
            Dữ liệu xác thực Tri Tôn, An Giang
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Lưu lịch trình này"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Đã lưu</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lưu</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors"
              title="In / Lưu PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In/PDF</span>
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors"
              title="Chia sẻ mã QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mã QR</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal for sharing text overview */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#1B4D3E]">Chia Sẻ Thông Tin Tri Tôn</h4>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeImgUrl}
                alt="QR Code"
                className="w-44 h-44 rounded-xl shadow-xs"
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Quét mã QR bằng Camera điện thoại để mở nội dung này trên thiết bị khác.
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
