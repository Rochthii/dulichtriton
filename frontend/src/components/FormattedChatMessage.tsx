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

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://dulichtriton.vn/planner')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lịch Trình & Cẩm Nang Du Lịch Tri Tôn — AI Assistant</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@700;800&display=swap');
            @page { size: A4; margin: 12mm; }
            body {
              font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #26221B;
              line-height: 1.6;
              padding: 0;
              margin: 0;
              background-color: #FAF3E7;
            }
            .page-container {
              background: #FFFDF7;
              border-radius: 20px;
              padding: 24px;
              border: 1px solid rgba(38,34,27,0.1);
            }
            .header-card {
              background: linear-gradient(135deg, #0E8C7F 0%, #085A52 100%);
              color: white;
              padding: 22px 26px;
              border-radius: 16px;
              margin-bottom: 20px;
              border-bottom: 4px solid #F0A32F;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-title {
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 20px;
              font-weight: 800;
              margin: 0 0 6px 0;
              letter-spacing: -0.5px;
            }
            .header-meta {
              font-size: 11px;
              color: #E6FAF6;
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .badge-verified {
              background: #F0A32F;
              color: #26221B;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 10px;
              text-transform: uppercase;
            }
            .qr-side {
              background: white;
              padding: 6px;
              border-radius: 12px;
              border: 2px solid #F0A32F;
              text-align: center;
            }
            .qr-side img {
              width: 75px;
              height: 75px;
              display: block;
            }
            .qr-label {
              font-size: 8px;
              font-weight: 800;
              color: #26221B;
              margin-top: 2px;
            }
            .section-title {
              color: #0E8C7F;
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 15px;
              font-weight: 800;
              margin-top: 18px;
              margin-bottom: 8px;
              padding-bottom: 4px;
              border-bottom: 2px solid #EAE0D0;
            }
            .content-box {
              font-size: 12px;
              line-height: 1.7;
              color: #3B342A;
            }
            .bullet-item {
              margin-bottom: 6px;
              list-style-type: none;
              padding-left: 0;
            }
            .action-link {
              display: inline-block;
              color: #0E8C7F;
              background: #FAF3E7;
              padding: 3px 8px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 700;
              font-size: 10px;
              margin-right: 6px;
              margin-top: 3px;
              border: 1px solid rgba(14,140,127,0.2);
            }
            .emergency-box {
              margin-top: 20px;
              padding: 12px 16px;
              background: #FAF3E7;
              border: 1px solid rgba(240,163,47,0.4);
              border-radius: 12px;
              font-size: 11px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .footer-bar {
              margin-top: 20px;
              padding-top: 12px;
              border-top: 1px solid #EAE0D0;
              text-align: center;
              font-size: 10px;
              color: #6B6355;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header-card">
              <div>
                <h1 class="header-title">🌾 LỊCH TRÌNH & CẨM NANG DU LỊCH TRI TÔN</h1>
                <div class="header-meta">
                  <span>Trợ Lý AI Du Lịch Bảy Núi</span>
                  <span>•</span>
                  <span>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</span>
                  <span class="badge-verified">Dữ Liệu Thực Địa 100%</span>
                </div>
              </div>
              <div class="qr-side">
                <img src="${qrCodeUrl}" alt="QR Lộ Trình" />
                <div class="qr-label">QUÉT MỞ MAPS</div>
              </div>
            </div>

            <div class="content-box">
              ${formattedBody}
            </div>

            <div class="emergency-box">
              <div>
                <strong>🚨 Hotline Hỗ Trợ Khẩn Cấp Bảy Núi:</strong> Công An: 0296.3874.113 • Y Tế / Cấp Cứu: 0296.3874.115 • Du Lịch: 0296.3771.999
              </div>
              <div>
                <em>(Dùng khi mất sóng 4G leo núi Cô Tô / Tức Dụp)</em>
              </div>
            </div>

            <div class="footer-bar">
              <strong>Dự Án Du Lịch Tri Tôn AI</strong> — Cổng thông tin 149 địa điểm đã xác minh & Lộ trình du lịch thông minh An Giang.<br/>
              Truy cập trực tuyến: <em>dulichtriton.vn</em>
            </div>
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
    // Match markdown link: [label](url) OR bold: **bold** (support URLs with query parameters & spaces)
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. Markdown Links: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1].trim();
        const rawUrl = linkMatch[2].trim();

        // Ensure safe valid URL encoding (fixes spaces or unicode query strings)
        let url = rawUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        // If url has raw unencoded spaces, encode them
        if (url.includes(' ')) {
          url = encodeURI(url);
        }

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

      {/* ── ACTION BAR (Lưu, Xuất PDF & QR Lịch Trình) ── */}
      {isAssistant && hasItinerary && (
        <div className="pt-2.5 border-t border-[#26221B]/8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B6355] font-display">
          <span className="font-bold text-[#0E8C7F] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lịch trình & gợi ý Bảy Núi</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] border border-[#0E8C7F]/30 flex items-center gap-1.5 font-bold transition-all tap-bounce shadow-2xs"
              title="Xuất File PDF Lịch Trình Màu Sắc & Mã QR Dẫn Đường"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Xuất PDF & Mã QR</span>
            </button>

            <button
              onClick={handleSave}
              className={`px-2.5 py-1.5 rounded-full flex items-center gap-1 font-bold transition-all tap-bounce ${
                isSaved
                  ? 'bg-[#0E8C7F]/15 text-[#0E8C7F] border border-[#0E8C7F]/30'
                  : 'bg-[#FFFDF7] hover:bg-[#FAF3E7] text-[#6B6355] border border-[#26221B]/10'
              }`}
              title="Lưu lịch trình này"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Lưu</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="p-1.5 rounded-full bg-[#FFFDF7] hover:bg-[#FAF3E7] text-[#6B6355] border border-[#26221B]/10 flex items-center transition-colors"
              title="Chia sẻ mã QR"
            >
              <QrCode className="w-3.5 h-3.5" />
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
