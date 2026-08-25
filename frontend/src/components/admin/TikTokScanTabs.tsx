'use client';

import React from 'react';
import { Hash, Sparkles, Video, Link as LinkIcon, RefreshCw, Eye } from 'lucide-react';

export const POPULAR_TIKTOK_HASHTAGS = [
  { tag: '#gadotothum', name: 'Gà Đốt Ô Thum', location: 'Ẩm Thực' },
  { tag: '#tapa', name: 'Tà Pạ & Chùa Tà Pạ', location: 'Tà Pạ' },
  { tag: '#kohkas', name: 'Cổng Trời Chùa Koh Kas', location: 'Chùa Koh Kas' },
  { tag: '#nuicoto', name: 'Đỉnh Núi Cô Tô', location: 'Núi Cô Tô' },
  { tag: '#thotnot', name: 'Thốt Nốt Trái Tim Ô Lâm', location: 'Cây Thốt Nốt' },
  { tag: '#duabo', name: 'Lễ Hội Đua Bò Chùa Rô', location: 'Lễ Hội' },
  { tag: '#hosoaichek', name: 'Hồ Soài Chek', location: 'Tà Pạ' },
  { tag: '#chaubozuctruc', name: 'Cháo Bò Lá Trúc', location: 'Ẩm Thực' },
];

interface PreviewMetadata {
  title: string;
  author_name: string;
  thumbnail_url: string;
  inferredLocation: string;
}

interface TikTokScanTabsProps {
  activeTab: 'single' | 'batch' | 'hashtag';
  singleUrl: string;
  setSingleUrl: (v: string) => void;
  batchUrls: string;
  setBatchUrls: (v: string) => void;
  selectedHashtag: string;
  setSelectedHashtag: (v: string) => void;
  locationTag: string;
  setLocationTag: (v: string) => void;
  previewMeta: PreviewMetadata | null;
  onFetchPreview: (url: string) => void;
  isLoading: boolean;
}

export function TikTokScanTabs({
  activeTab,
  singleUrl,
  setSingleUrl,
  batchUrls,
  setBatchUrls,
  selectedHashtag,
  setSelectedHashtag,
  locationTag,
  setLocationTag,
  previewMeta,
  onFetchPreview,
  isLoading,
}: TikTokScanTabsProps) {
  return (
    <div className="space-y-4 font-body text-xs">
      {activeTab === 'single' && (
        <div className="space-y-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Đường Dẫn Video TikTok:
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={singleUrl}
                onChange={(e) => {
                  setSingleUrl(e.target.value);
                  onFetchPreview(e.target.value);
                }}
                placeholder="https://www.tiktok.com/@creator/video/123456789..."
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-rose-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() => onFetchPreview(singleUrl)}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
              >
                {isLoading ? 'Đang đọc...' : 'Kiểm tra'}
              </button>
            </div>
          </div>

          {previewMeta && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-14 h-18 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewMeta.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs block line-clamp-2">
                  {previewMeta.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  @{previewMeta.author_name} • Gợi ý: {previewMeta.inferredLocation}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'batch' && (
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">
            Danh Sách URLs (Mỗi dòng một link):
          </label>
          <textarea
            rows={5}
            required
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/1234...&#10;https://www.tiktok.com/@user/video/5678..."
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-rose-500 outline-hidden"
          />
        </div>
      )}

      {activeTab === 'hashtag' && (
        <div className="space-y-2">
          <label className="font-bold text-slate-700 block">
            Chọn Hashtag Du Lịch Tri Tôn Để Quét AI:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_TIKTOK_HASHTAGS.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => {
                  setSelectedHashtag(item.tag);
                  setLocationTag(item.location);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedHashtag === item.tag
                    ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-mono text-xs text-rose-600">{item.tag}</div>
                <div className="text-[10px] text-slate-500">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
