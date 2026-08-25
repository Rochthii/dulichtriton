'use client';

import React from 'react';
import { 
  CheckCircle2, XCircle, Trash2, ExternalLink, 
  MapPin, Eye, Heart, ShieldCheck 
} from 'lucide-react';

export interface VideoRecord {
  id: string;
  external_video_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  author_name: string;
  author_username: string;
  view_count: number;
  like_count: number;
  quality_score: number;
  matched_location: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'RELEVANT';
}

interface VideoGridTableProps {
  videos: VideoRecord[];
  onUpdateStatus: (id: string, newStatus: 'VERIFIED' | 'REJECTED') => void;
  onDelete: (id: string) => void;
}

export default function VideoGridTable({
  videos,
  onUpdateStatus,
  onDelete,
}: VideoGridTableProps) {
  if (videos.length === 0) {
    return (
      <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-2 font-body">
        <p className="text-sm font-bold text-[#26221B]">Không tìm thấy video nào phù hợp với bộ lọc.</p>
        <p className="text-xs text-[#6B6355]">Hãy nhấn nút &quot;Quét / Thêm Video TikTok&quot; để thu thập nội dung mới.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-body">
      {videos.map((vid) => {
        const isVerified = vid.verification_status === 'VERIFIED';
        const isRejected = vid.verification_status === 'REJECTED';
        const isPending = vid.verification_status === 'PENDING';

        return (
          <div
            key={vid.id}
            className="rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Visual Thumbnail */}
            <div className="relative aspect-[9/12] w-full bg-slate-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vid.thumbnail_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg'}
                alt={vid.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 font-display">
                {isVerified && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Đã Xác Minh</span>
                  </span>
                )}
                {isPending && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                    Chờ Duyệt
                  </span>
                )}
                {isRejected && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm">
                    Đã Ẩn
                  </span>
                )}
              </div>

              {/* Telemetry Stats */}
              <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>{(vid.view_count || 0).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>{(vid.like_count || 0).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xs text-[#26221B] line-clamp-2">
                  {vid.title || 'Video Review Tri Tôn'}
                </h3>
                <span className="text-[11px] text-[#6B6355] font-mono block">
                  @{vid.author_username || vid.author_name || 'tiktok_creator'}
                </span>
                {vid.matched_location && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0E8C7F] bg-emerald-50 px-2 py-0.5 rounded-md font-display">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{vid.matched_location}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#26221B]/6 flex items-center justify-between font-display">
                <a
                  href={vid.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-[#6B6355] hover:text-[#26221B] hover:bg-[#FAF3E7] transition-colors"
                  title="Xem video trên TikTok"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-1">
                  {!isVerified && (
                    <button
                      onClick={() => onUpdateStatus(vid.id, 'VERIFIED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Duyệt</span>
                    </button>
                  )}

                  {!isRejected && (
                    <button
                      onClick={() => onUpdateStatus(vid.id, 'REJECTED')}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <span>Ẩn</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(vid.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa video khỏi hệ thống"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
