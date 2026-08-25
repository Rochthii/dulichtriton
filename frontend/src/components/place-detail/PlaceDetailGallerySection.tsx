'use client';

import React, { useState } from 'react';
import { Camera, Check, Flag, X, Send } from 'lucide-react';
import CheckinMasonryGallery from '@/components/CheckinMasonryGallery';
import { CheckinSpotItem } from '@/lib/dataSanitizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailGallerySectionProps {
  placeName: string;
  checkinSpots: CheckinSpotItem[];
  hashtags: string[];
  copiedHashtags: boolean;
  onCopyHashtags: () => void;
  placeId: string;
}

export default function PlaceDetailGallerySection({
  placeName,
  checkinSpots,
  hashtags,
  copiedHashtags,
  onCopyHashtags,
  placeId,
}: PlaceDetailGallerySectionProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);

    try {
      await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: 'photo_report',
          place_id: placeId,
          message: `[Báo lỗi ảnh/thực địa ${placeName}]: ${reportReason}`,
          contact: reportContact,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportReason('');
        setReportContact('');
      }, 2500);
    } catch {
      // Ignore network errors
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!checkinSpots || checkinSpots.length === 0) return null;

  return (
    <section className="space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/8 pb-3 font-display">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#0E8C7F]" />
          <h2 className="text-base sm:text-lg font-black text-[#26221B]">
            {isEn ? `Check-in Angles & Photo Gallery (${checkinSpots.length} Spots)` : `Góc Chụp Ảnh & Tọa Độ Check-in (${checkinSpots.length} Điểm)`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Hashtags */}
          <button
            onClick={onCopyHashtags}
            className="px-3 py-1 rounded-full bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] text-[11px] font-bold border border-[#26221B]/10 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedHashtags ? <Check className="w-3 h-3 text-emerald-600" /> : <span>#</span>}
            <span>{copiedHashtags ? (isEn ? "Copied Hashtags!" : "Đã chép hashtag!") : (isEn ? "Copy Hashtags" : "Chép Hashtag")}</span>
          </button>

          {/* Report Image Modal Trigger */}
          <button
            onClick={() => setShowReportModal(true)}
            title="Báo ảnh sai hoặc không chính xác"
            className="p-1.5 rounded-full text-[#6B6355] hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Check-in Spots Masonry Grid */}
      <CheckinMasonryGallery spots={checkinSpots} placeName={placeName} />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] rounded-3xl p-5 sm:p-6 max-w-md w-full border border-[#26221B]/10 shadow-xl space-y-4 font-body">
            <div className="flex items-center justify-between font-display">
              <h3 className="font-extrabold text-sm text-[#26221B]">
                {isEn ? "Report Inaccurate Photo or Information" : "Báo Cáo Ảnh Hoặc Thông Tin Sai Thực Tế"}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 text-[#6B6355] hover:text-[#26221B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center space-y-1">
                <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>{isEn ? "Thank you! Your report has been submitted to the admin." : "Cảm ơn bạn! Báo cáo đã được gửi tới ban quản trị để xác minh thực địa."}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#26221B] block mb-1">
                    {isEn ? "Issue description:" : "Nội dung cần điều chỉnh:"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder={isEn ? "E.g., wrong photo, outdated ticket price..." : "Ví dụ: ảnh không đúng địa điểm, giá vé thay đổi, đường đi khó..."}
                    className="w-full p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#6B6355] block mb-1">
                    {isEn ? "Your phone / email (Optional):" : "Số điện thoại / Email liên hệ (Không bắt buộc):"}
                  </label>
                  <input
                    type="text"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    placeholder="0912..."
                    className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold flex items-center justify-center gap-1.5 font-display transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? (isEn ? "Submitting..." : "Đang gửi...") : (isEn ? "Submit Report" : "Gửi Báo Cáo")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
