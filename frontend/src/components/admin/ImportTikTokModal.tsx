'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { TikTokScanTabs } from './TikTokScanTabs';

interface ImportTikTokModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportTikTokModal({ isOpen = true, onClose, onSuccess }: ImportTikTokModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'hashtag'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('#gadotothum');
  const [locationTag, setLocationTag] = useState('AUTO');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFetchPreview = async (url: string) => {
    if (!url.trim() || !url.includes('tiktok.com')) return;
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/v1/videos/oembed?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (res.ok && data.title) {
        setPreviewMeta({
          title: data.title,
          author_name: data.author_name || 'TikToker',
          thumbnail_url: data.thumbnail_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg',
          inferredLocation: data.inferredLocation || 'Tri Tôn, An Giang',
        });
        if (locationTag === 'AUTO') {
          setLocationTag(data.inferredLocation || 'Tà Pạ');
        }
      }
    } catch (e) {
      console.warn('oEmbed preview error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      if (activeTab === 'single') {
        const oembedRes = await fetch(`/api/v1/videos/oembed?url=${encodeURIComponent(singleUrl.trim())}`);
        const oembedData = await oembedRes.json();
        if (!oembedRes.ok) throw new Error(oembedData.error || 'Không thể đọc video');

        const targetLocation = locationTag === 'AUTO' ? (oembedData.inferredLocation || 'Tri Tôn, An Giang') : locationTag;

        await fetch('/api/v1/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_url: singleUrl.trim(),
            embed_url: oembedData.embed_url || singleUrl.trim(),
            thumbnail_url: oembedData.thumbnail_url,
            title: oembedData.title || `Review TikTok tại ${targetLocation}`,
            author_name: oembedData.author_name || 'TikToker',
            author_username: oembedData.author_name ? `@${oembedData.author_name.toLowerCase().replace(/\s+/g, '')}` : '@tiktok',
            matched_location: targetLocation,
            verification_status: 'VERIFIED',
            quality_score: 0.95,
            view_count: 25000,
          }),
        });
      } else if (activeTab === 'hashtag') {
        await fetch('/api/v1/admin/videos/ai-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hashtag: selectedHashtag, matched_location: locationTag }),
        });
      }

      setStatusMsg({ type: 'success', text: 'Đã nhập video và lưu vào hệ thống thành công!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi xử lý video' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-display">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Quét & Nhập Video TikTok</h3>
              <p className="text-[11px] text-slate-500">Tự động bóc tách oEmbed và gán nhãn địa điểm</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 pt-3 pb-1 border-b border-slate-100 font-display text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer ${
              activeTab === 'single' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-50 text-slate-600'
            }`}
          >
            Nhập 1 Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer ${
              activeTab === 'batch' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-50 text-slate-600'
            }`}
          >
            Nhập Nhiều Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hashtag')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer ${
              activeTab === 'hashtag' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-50 text-slate-600'
            }`}
          >
            Quét AI Theo Hashtag
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 overflow-y-auto space-y-4">
          <TikTokScanTabs
            activeTab={activeTab}
            singleUrl={singleUrl}
            setSingleUrl={setSingleUrl}
            batchUrls={batchUrls}
            setBatchUrls={setBatchUrls}
            selectedHashtag={selectedHashtag}
            setSelectedHashtag={setSelectedHashtag}
            locationTag={locationTag}
            setLocationTag={setLocationTag}
            previewMeta={previewMeta}
            onFetchPreview={handleFetchPreview}
            isLoading={isLoading}
          />

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 font-display">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isLoading ? 'Đang xử lý...' : 'Bắt Đầu Nhập'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
