import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getGoogleMapsUrl } from '@/lib/utils';
import type { ItineraryData } from '@/components/WireDiagramItinerary';
import { SITE_URL } from '@/lib/siteConfig';

export interface ExportPdfOptions {
  itinerary: ItineraryData;
  onProgress?: (status: string) => void;
}

/**
 * Generate and directly download a comprehensive, interactive PDF companion guide.
 * All Google Maps buttons in the PDF are clickable hyperlinks.
 */
export async function downloadItineraryPDF(itinerary: ItineraryData): Promise<void> {
  if (!itinerary) return;

  const stops = itinerary.stops || [];
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `${SITE_URL}/itinerary?slug=${encodeURIComponent(itinerary.slug || 'kinh-dien-1-ngay')}`
  )}`;

  // 1. Create a hidden rendering container in the DOM
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.backgroundColor = '#FFFDF7';
  container.style.color = '#26221B';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  // 2. Build the HTML content with dedicated clickable button classes
  const stopsHtml = stops.map((st, idx) => {
    const mapsUrl = getGoogleMapsUrl({
      name: st.name,
      commune: st.commune,
      lat: (st as any).latitude,
      lng: (st as any).longitude,
    });

    return `
      <div class="pdf-stop-card" style="margin-bottom: 18px; padding: 16px 18px; background: #FFFFFF; border: 1.5px solid rgba(38,34,27,0.12); border-radius: 16px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #0E8C7F; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
              TRẠM ${st.order || idx + 1}
            </span>
            <span style="font-size: 12px; font-weight: 700; color: #D9822B;">
              ⏰ ${st.time_start || ''} ${st.time_end ? '– ' + st.time_end : ''}
            </span>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #6B6355; background: #FAF3E7; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(38,34,27,0.08);">
            ${st.category ? st.category.toUpperCase() : 'THAM QUAN'}
          </span>
        </div>

        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #151B34;">
          ${st.name}
        </h3>
        
        <div style="font-size: 12px; color: #6B6355; margin-bottom: 8px;">
          📍 Địa bàn: <strong>${st.commune || 'Huyện Tri Tôn, An Giang'}</strong>
        </div>

        ${st.tip ? `
          <div style="font-size: 12px; color: #3B342A; background: #FAF3E7; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #F0A32F; margin-bottom: 8px; line-height: 1.4;">
            💡 <em>Mẹo thực địa:</em> ${st.tip}
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(38,34,27,0.1);">
          <div style="font-size: 11px; color: #6B6355;">
            ${st.cost_vnd ? `💵 Chi phí: <strong style="color: #0E8C7F;">${st.cost_vnd}</strong>` : ''}
            ${st.travel_to_next_km ? ` • 🛵 Chặng kế tiếp: <strong>${st.travel_to_next_km} km</strong> (${st.travel_to_next_min || 10} phút)` : ''}
          </div>

          <!-- Clickable Link Anchor & Visual Button -->
          <a 
            href="${mapsUrl}" 
            target="_blank" 
            class="pdf-maps-btn" 
            data-maps-url="${mapsUrl}"
            style="display: inline-flex; align-items: center; gap: 4px; background: #0E8C7F; color: #FFFFFF; text-decoration: none; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800;"
          >
            🗺️ MỞ GOOGLE MAPS DẪN ĐƯỜNG
          </a>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; box-sizing: border-box;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #0E8C7F 0%, #151B34 100%); color: #FFFFFF; padding: 24px; border-radius: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #FFD37A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            CỔNG THÔNG TIN DU LỊCH TRI TÔN • AN GIANG
          </div>
          <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #FFFDF7;">
            ${itinerary.emoji || '🧭'} ${itinerary.title}
          </h1>
          <p style="margin: 0; font-size: 13px; color: #FAF3E7; opacity: 0.9; max-width: 480px; line-height: 1.4;">
            ${itinerary.tagline || 'Cẩm nang lịch trình thực địa tối ưu cự ly Kilomet & trải nghiệm trọn vẹn'}
          </p>
        </div>
        <div style="background: #FFFFFF; padding: 8px; border-radius: 12px; text-align: center; shrink-0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <!-- eslint-disable-next-line @next/next/no-img-element -->
          <img src="${qrCodeUrl}" alt="QR Lịch Trình" style="width: 80px; height: 80px; display: block;" />
          <span style="display: block; font-size: 9px; font-weight: 800; color: #151B34; margin-top: 4px;">QUÉT MỞ TRÊN WEB</span>
        </div>
      </div>

      <!-- Quick Summary Matrix -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="background: #FFFFFF; padding: 12px; border-radius: 14px; border: 1px solid rgba(38,34,27,0.1); text-align: center;">
          <span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppercase;">⏱️ Thời lượng</span>
          <strong style="font-size: 13px; color: #0E8C7F;">${itinerary.duration || '1 Ngày'}</strong>
        </div>
        <div style="background: #FFFFFF; padding: 12px; border-radius: 14px; border: 1px solid rgba(38,34,27,0.1); text-align: center;">
          <span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppercase;">💰 Dự toán</span>
          <strong style="font-size: 13px; color: #D9822B;">${itinerary.budget_range || '300k–500k'}</strong>
        </div>
        <div style="background: #FFFFFF; padding: 12px; border-radius: 14px; border: 1px solid rgba(38,34,27,0.1); text-align: center;">
          <span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppercase;">👥 Phù hợp</span>
          <strong style="font-size: 12px; color: #151B34;">${itinerary.for_whom || 'Mọi lứa tuổi'}</strong>
        </div>
        <div style="background: #FFFFFF; padding: 12px; border-radius: 14px; border: 1px solid rgba(38,34,27,0.1); text-align: center;">
          <span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppercase;">🌤️ Mùa đẹp nhất</span>
          <strong style="font-size: 12px; color: #0E8C7F;">${itinerary.best_season || 'Quanh năm'}</strong>
        </div>
      </div>

      <!-- Timeline Stops List -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
          <div style="width: 4px; height: 18px; background: #0E8C7F; border-radius: 2px;"></div>
          <h2 style="margin: 0; font-size: 15px; font-weight: 800; color: #26221B; text-transform: uppercase; letter-spacing: 0.5px;">
            Sơ Đồ Các Trạm Dừng & Hướng Dẫn Điều Hướng GPS (${stops.length} Điểm)
          </h2>
        </div>
        ${stopsHtml}
      </div>

      <!-- Important Emergency & Local Notes -->
      <div style="background: #FAF3E7; border: 1.5px solid #F0A32F; border-radius: 16px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #A6503A; display: flex; align-items: center; gap: 6px;">
          🛡️ THÔNG TIN KHẨN CẤP & HỖ TRỢ DU KHÁCH TẠI TRI TÔN
        </h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 11px; color: #26221B;">
          <div>🚨 Công an Huyện: <strong>0296 3874 113</strong></div>
          <div>🏥 Trung tâm Y Tế: <strong>0296 3874 115</strong></div>
          <div>🛠️ Cứu hộ xe máy: <strong>0296 3771 999</strong></div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #6B6355; line-height: 1.4;">
          * Lưu ý: Khi tham quan các chùa Khmer, du khách vui lòng trang phục lịch sự, giữ gìn vệ sinh và không xả rác tại các thắng cảnh núi rừng.
        </p>
      </div>

      <!-- Footer Note -->
      <div style="text-align: center; font-size: 10px; color: #6B6355; padding-top: 8px; border-top: 1px solid rgba(38,34,27,0.1);">
        Bản quyền dữ liệu © 2026 Cổng thông tin Du lịch Tri Tôn • dulichtriton.vercel.app • Bấm trực tiếp vào các nút trên PDF để dẫn đường Maps
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // 3. Render container to Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFDF7',
    });

    // 4. Initialize jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const scaleRatio = pageWidth / container.offsetWidth; // Convert DOM px to PDF mm

    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 1;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pageCount++;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 5. Add interactive Clickable Hyperlink Annotations to all Maps buttons
    const containerRect = container.getBoundingClientRect();
    const btnElements = container.querySelectorAll<HTMLAnchorElement>('.pdf-maps-btn');

    btnElements.forEach((btn) => {
      const btnRect = btn.getBoundingClientRect();
      const mapsUrl = btn.getAttribute('data-maps-url') || btn.href;
      if (!mapsUrl) return;

      const relX_px = btnRect.left - containerRect.left;
      const relY_px = btnRect.top - containerRect.top;
      const relW_px = btnRect.width;
      const relH_px = btnRect.height;

      const x_mm = relX_px * scaleRatio;
      const totalY_mm = relY_px * scaleRatio;
      const w_mm = relW_px * scaleRatio;
      const h_mm = relH_px * scaleRatio;

      const targetPage = Math.floor(totalY_mm / pageHeight) + 1;
      const y_on_page_mm = totalY_mm % pageHeight;

      if (targetPage <= pageCount) {
        pdf.setPage(targetPage);
        pdf.link(x_mm, y_on_page_mm, w_mm, h_mm, { url: mapsUrl });
      }
    });

    // 6. Direct file download (No print dialog required)
    const cleanFileName = `Lich-Trinh-Tri-Ton-${(itinerary.slug || 'Chuan').replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
    pdf.save(cleanFileName);
  } finally {
    // 7. Cleanup DOM container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
