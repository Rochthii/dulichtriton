'use client';

import React, { useState } from 'react';
import { 
  Clock, Sparkles, Bookmark, QrCode, Printer, Check, X, Share2, 
  ChevronDown, ChevronUp, Globe, CheckCircle2, Navigation, Play, ExternalLink, MapPin, Bike, Coins, PhoneCall
} from 'lucide-react';
import type { ItineraryData } from './WireDiagramItinerary';
import ItineraryExportModal from './ItineraryExportModal';
import { resolveTikTokHashtag } from '@/lib/tiktok';
import { SITE_URL } from '@/lib/siteConfig';

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
  itinerary?: ItineraryData | null;
}

export default function FormattedChatMessage({ content, isAssistant = true, itinerary }: FormattedChatMessageProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content && !itinerary) return null;

  const isLongContent = (content || '').length > 550;
  const shouldTruncate = isAssistant && isLongContent && !isExpanded;

  const hasItinerary = !!itinerary || /lịch trình|lộ trình|tour|sáng \(|trưa \(|chiều \(|tối \(|chặng 1|chặng 2/i.test(content || '');

  const handleSave = () => {
    try {
      const savedList = JSON.parse(localStorage.getItem('triton_saved_itineraries') || '[]');
      const titleMatch = (content || '').match(/###?\s*🌟?\s*(.+)/);
      const title = itinerary?.title || (titleMatch ? titleMatch[1].trim() : 'Lịch Trình Du Lịch Tri Tôn');
      
      const newEntry = {
        id: `itin_${Date.now()}`,
        title,
        content,
        itinerary,
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

    const title = itinerary?.title || 'Lịch Trình Du Lịch Tri Tôn';
    const tagline = itinerary?.tagline || 'Cẩm nang du lịch trải nghiệm Bảy Núi An Giang';
    const duration = itinerary?.duration || '1 Ngày';
    const totalKm = itinerary?.stops?.reduce((s, st) => s + (st.travel_to_next_km || 0), 0) || 30;
    const budget = itinerary?.budget_range || '350.000đ - 650.000đ/người';
    const stops = itinerary?.stops || [];

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${SITE_URL}/planner`)}`;

    // Render stops into a beautiful printable timeline
    let stopsHtml = '';
    if (stops.length > 0) {
      stopsHtml = `
        <div class="timeline-container">
          <h2 class="timeline-title">🗺️ SƠ ĐỒ LỊCH TRÌNH & CÁC TRẠM DỪNG THỰC ĐỊA</h2>
          <div class="stops-list">
            ${stops.map((st, idx) => `
              <div class="stop-card">
                <div class="stop-header">
                  <span class="stop-badge">TRẠM ${st.order || idx + 1}</span>
                  <span class="stop-time">⏰ ${st.time_start || ''} – ${st.time_end || ''}</span>
                  <span class="stop-cat">${st.category?.toUpperCase() || 'THAM QUAN'}</span>
                </div>
                <div class="stop-body">
                  <h3 class="stop-name">${st.name}</h3>
                  <div class="stop-commune">📍 Xã/Thị trấn: <strong>${st.commune || 'Tri Tôn'}</strong></div>
                  ${st.tip ? `<div class="stop-tip">💡 <em>Lời khuyên:</em> ${st.tip}</div>` : ''}
                  ${st.cost_vnd ? `<div class="stop-cost">💵 Chi phí ước tính: <strong>${st.cost_vnd}</strong></div>` : ''}
                  ${st.travel_to_next_km ? `
                    <div class="stop-travel">
                      🛵 Di chuyển đến trạm tiếp theo: <strong>${st.travel_to_next_km} km</strong> (${st.travel_to_next_min || 10} phút)
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const formattedBody = (content || '')
      .replace(/###?\s*(.+)/g, '<h3 class="section-title">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="action-link">$1</a>')
      .replace(/-(.*)/g, '<li class="bullet-item">$1</li>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} — Lịch Trình Du Lịch Tri Tôn</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@700;800&display=swap');
            @page { size: A4; margin: 10mm; }
            body {
              font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #26221B;
              line-height: 1.5;
              padding: 0;
              margin: 0;
              background-color: #FAF3E7;
            }
            .page-container {
              background: #FFFDF7;
              border-radius: 16px;
              padding: 20px;
              border: 1px solid rgba(38,34,27,0.1);
            }
            .header-card {
              background: linear-gradient(135deg, #0E8C7F 0%, #085A52 100%);
              color: white;
              padding: 20px 24px;
              border-radius: 16px;
              margin-bottom: 16px;
              border-bottom: 4px solid #F0A32F;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-title {
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 18px;
              font-weight: 800;
              margin: 0 0 4px 0;
              letter-spacing: -0.3px;
            }
            .header-meta {
              font-size: 11px;
              color: #E6FAF6;
              display: flex;
              gap: 8px;
              align-items: center;
              margin-top: 4px;
            }
            .badge-verified {
              background: #F0A32F;
              color: #26221B;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              text-transform: uppercase;
            }
            .summary-bar {
              display: flex;
              gap: 16px;
              background: rgba(255,255,255,0.15);
              padding: 6px 12px;
              border-radius: 8px;
              margin-top: 8px;
              font-size: 11px;
              font-weight: 600;
            }
            .qr-side {
              background: white;
              padding: 6px;
              border-radius: 10px;
              border: 2px solid #F0A32F;
              text-align: center;
              shrink-0: 0;
            }
            .qr-side img {
              width: 70px;
              height: 70px;
              display: block;
            }
            .qr-label {
              font-size: 8px;
              font-weight: 800;
              color: #26221B;
              margin-top: 2px;
            }
            .timeline-container {
              margin: 16px 0;
            }
            .timeline-title {
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 14px;
              font-weight: 800;
              color: #0E8C7F;
              margin-bottom: 12px;
              padding-bottom: 4px;
              border-bottom: 2px solid #EAE0D0;
            }
            .stops-list {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .stop-card {
              background: white;
              border: 1px solid #E5DECF;
              border-left: 4px solid #0E8C7F;
              border-radius: 10px;
              padding: 10px 14px;
            }
            .stop-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;
            }
            .stop-badge {
              background: #0E8C7F;
              color: white;
              font-weight: 800;
              font-size: 10px;
              padding: 1px 6px;
              border-radius: 4px;
            }
            .stop-time {
              font-weight: 800;
              color: #B45309;
              font-size: 11px;
            }
            .stop-cat {
              background: #FAF3E7;
              color: #6B6355;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 6px;
              border-radius: 4px;
              margin-left: auto;
            }
            .stop-name {
              font-size: 13px;
              font-weight: 800;
              color: #1A1713;
              margin: 0 0 2px 0;
            }
            .stop-commune {
              font-size: 11px;
              color: #6B6355;
            }
            .stop-tip {
              font-size: 11px;
              color: #0E8C7F;
              margin-top: 4px;
              background: #F0FAF8;
              padding: 4px 8px;
              border-radius: 6px;
            }
            .stop-cost {
              font-size: 10px;
              color: #B45309;
              margin-top: 2px;
            }
            .stop-travel {
              font-size: 10px;
              color: #78716C;
              margin-top: 4px;
              padding-top: 4px;
              border-top: 1px dashed #E5DECF;
            }
            .section-title {
              color: #0E8C7F;
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 14px;
              font-weight: 800;
              margin-top: 14px;
              margin-bottom: 6px;
              padding-bottom: 4px;
              border-bottom: 2px solid #EAE0D0;
            }
            .content-box {
              font-size: 11px;
              line-height: 1.6;
              color: #3B342A;
              margin-bottom: 12px;
            }
            .bullet-item {
              margin-bottom: 4px;
              list-style-type: none;
              padding-left: 0;
            }
            .action-link {
              display: inline-block;
              color: #0E8C7F;
              background: #FAF3E7;
              padding: 2px 6px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 700;
              font-size: 10px;
              margin-right: 4px;
              margin-top: 2px;
              border: 1px solid rgba(14,140,127,0.2);
            }
            .emergency-box {
              margin-top: 16px;
              padding: 10px 14px;
              background: #FAF3E7;
              border: 1px solid rgba(240,163,47,0.4);
              border-radius: 10px;
              font-size: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .footer-bar {
              margin-top: 14px;
              padding-top: 10px;
              border-top: 1px solid #EAE0D0;
              text-align: center;
              font-size: 9px;
              color: #6B6355;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header-card">
              <div>
                <h1 class="header-title">🌾 ${title}</h1>
                <div style="font-size: 11px; color: #FAF3E7; opacity: 0.9;">${tagline}</div>
                <div class="summary-bar">
                  <span>⏱️ ${duration}</span>
                  <span>🛵 ~${typeof totalKm === 'number' ? totalKm.toFixed(0) : totalKm} km</span>
                  <span>💵 ${budget}</span>
                </div>
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

            ${content ? `<div class="content-box">${formattedBody}</div>` : ''}

            ${stopsHtml}

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
              Truy cập trực tuyến: <em>${SITE_URL.replace(/^https?:\/\//, '')}</em>
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
    // Clean any lingering [ID: ...]
    const cleanText = text.replace(/\[ID:\s*[^\]]+\]\s*/gi, '');
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
    const parts = cleanText.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Markdown Link: [Label](URL)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        let url = linkMatch[2].trim().replace(/\s+/g, '');

        try {
          url = encodeURI(decodeURI(url));
        } catch {
          // ignore
        }

        const isTikTok = url.includes('tiktok.com');
        if (isTikTok && url.includes('/search')) {
          try {
            const parsed = new URL(url);
            const q = parsed.searchParams.get('q') || label;
            const tag = resolveTikTokHashtag(q);
            url = `https://www.tiktok.com/tag/${tag}`;
          } catch {
            url = 'https://www.tiktok.com/tag/dulichtriton';
          }
        }
        const isMaps = url.includes('google.com/maps') || url.includes('maps.google') || url.includes('goo.gl');

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1 my-1 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 ${
              isTikTok
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                : isMaps
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isTikTok ? (
              <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600 shrink-0" />
            ) : isMaps ? (
              <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            )}
            <span className="truncate max-w-[200px]">{label}</span>
          </a>
        );
      }

      // Bold: **Text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={index} className="font-extrabold text-[#1A1713]">
            {boldMatch[1]}
          </strong>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Pre-clean and heal broken multiline markdown links from LLM
  let normalizedContent = (content || '')
    .replace(/\[ID:\s*[^\]]+\]\s*/gi, '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)\s]+)\s*\n\s*([^\)\s]+)\)/gi, '[$1]($2$3)')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]*)\n\s*([^\)]*)\)/gi, '[$1]($2$3)');

  const rawLines = normalizedContent.split('\n');
  const lines = rawLines.filter((l) => {
    const t = l.trim();
    if (!t) return true;
    // Filter out leaked percent-encoded URL tail fragments
    if (/^%[0-9A-Fa-f]{2}/.test(t) && t.length > 4 && !t.includes(' ')) return false;
    if (/^%[0-9A-Fa-f]{2}.*\)$/.test(t)) return false;
    return true;
  });

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-[#26221B] font-body">
      <div className={`space-y-1.5 ${shouldTruncate ? 'line-clamp-6' : ''}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // H3 Heading (### Section)
          if (trimmed.startsWith('###')) {
            const titleText = trimmed.replace(/^###\s*/, '');
            return (
              <h4
                key={idx}
                className="font-display font-black text-sm sm:text-base text-[#0E8C7F] mt-3 mb-1 pt-1.5 border-t border-[#26221B]/6 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#F0A32F] shrink-0" />
                <span>{titleText}</span>
              </h4>
            );
          }

          // Timeline Stop (07:00, Sáng, Chiều, Chặng...)
          const isTimeline = /^(\d{1,2}:\d{2}|Sáng|Trưa|Chiều|Tối|Chặng \d)/i.test(trimmed);
          if (isTimeline) {
            return (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 shadow-2xs space-y-1 my-1.5"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#0E8C7F] font-display">
                  <Clock className="w-3.5 h-3.5 text-[#F0A32F] shrink-0" />
                  <span>{trimmed.split(':')[0]}</span>
                </div>
                <div className="text-xs text-[#3B342A] pl-5">
                  {renderInlineFormatted(trimmed.substring(trimmed.indexOf(':') + 1 || 0))}
                </div>
              </div>
            );
          }

          // Bullet point (- or *)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F] mt-2 shrink-0" />
                <div className="flex-1">{renderInlineFormatted(bulletText)}</div>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="py-0.5">
              {renderInlineFormatted(trimmed)}
            </p>
          );
        })}
      </div>

      {/* Truncate Toggle Button */}
      {isLongContent && isAssistant && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0E8C7F] hover:text-[#0A6B61] transition-colors py-1 cursor-pointer"
        >
          {isExpanded ? (
            <>
              <span>Thu gọn bớt</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Xem đầy đủ toàn bộ lộ trình</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      {/* Action Bar (Lưu & Xuất Lịch Trình PDF & QR) */}
      {hasItinerary && isAssistant && (
        <div className="pt-2 mt-2 border-t border-[#26221B]/8 flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#FFFDF7] hover:bg-[#FAF3E7] text-[#6B6355] border border-[#26221B]/10'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Đã Lưu Lịch Trình</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#0E8C7F]" />
                <span>Lưu Lịch Trình</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            title="Xuất File PDF Sơ Đồ Lịch Trình Kèm Mã QR Thực Địa"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0E8C7F] hover:bg-[#0A6B61] text-white transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Xuất PDF Sơ Đồ & QR</span>
          </button>

          {itinerary && (
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Tải Ảnh QR Lộ Trình</span>
            </button>
          )}
        </div>
      )}

      {/* High-Res Export Modal */}
      {showExportModal && itinerary && (
        <ItineraryExportModal
          itinerary={itinerary}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
