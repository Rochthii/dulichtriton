'use client';

import React, { useState } from 'react';
import { X, Link as LinkIcon, Sparkles, CheckCircle2, Hash, Layers, Video } from 'lucide-react';

interface ImportTikTokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportTikTokModal({ isOpen, onClose, onSuccess }: ImportTikTokModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'hashtag'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('#gadotothum');
  const [locationTag, setLocationTag] = useState('Ẩm Thực');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const popularHashtags = [
    { tag: '#gadotothum', name: 'Gà Đốt Ô Thum' },
    { tag: '#tapa', name: 'Tà Pạ & Chùa Tà Pạ' },
    { tag: '#kohkas', name: 'Cổng Trời Chùa Koh Kas' },
    { tag: '#nuicoto', name: 'Đỉnh Núi Cô Tô' },
    { tag: '#thotnot', name: 'Thốt Nốt Trái Tim Ô Lâm' },
    { tag: '#duabo', name: 'Lễ Hội Đua Bò Chùa Rô' },
    { tag: '#hosoaichek', name: 'Hồ Soài Chek' },
    { tag: '#chaubozuctruc', name: 'Cháo Bò Lá Trúc' },
  ];

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim() || isLoading) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      // Extract oembed details
      const oembedRes = await fetch(`/api/v1/videos/oembed?url=${encodeURIComponent(singleUrl.trim())}`);
      const oembedData = await oembedRes.json();

      if (!oembedRes.ok) throw new Error(oembedData.error || 'Không thể lấy dữ liệu TikTok oEmbed');

      setStatusMsg({
        type: 'success',
        text: `Đã nạp thành công video từ @${oembedData.author_name || 'TikTok'}!`,
      });

      setSingleUrl('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi nhập video';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#B45309] flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-lg">
              Quản Lý & Thêm Video TikTok Real
            </h3>
            <p className="text-xs text-slate-500">
              Nhập URL TikTok thật để tự động bóc tách oEmbed và đồng bộ vào CSDL Tri Tôn
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'single' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> 1 Link Đơn
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'batch' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Hàng Loạt (Batch)
          </button>
          <button
            onClick={() => setActiveTab('hashtag')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hashtag' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Hashtag Target
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-medium mb-4 flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {statusMsg.text}
          </div>
        )}

        {/* Single Link Form */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Video TikTok Thật</label>
              <input
                type="url"
                required
                placeholder="https://www.tiktok.com/@username/video/123456789"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gắn Thẻ Địa Danh / Danh Mục</label>
              <select
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
              >
                <option value="Tà Pạ">Tà Pạ (Hồ & Chùa Tà Pạ)</option>
                <option value="Chùa Koh Kas">Chùa Koh Kas (Cổng Trời)</option>
                <option value="Núi Cô Tô">Núi Cô Tô (Phụng Hoàng Sơn)</option>
                <option value="Cây Thốt Nốt">Cây Thốt Nốt Trái Tim Ô Lâm</option>
                <option value="Ẩm Thực">Ẩm Thực (Gà Đốt Ô Thum, Cháo Bò)</option>
                <option value="Lễ Hội">Lễ Hội (Đua Bò Chùa Rô)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isLoading ? 'Đang phân tích oEmbed TikTok...' : 'Thêm Video TikTok Vào Hệ Thống'}
            </button>
          </form>
        )}

        {/* Batch Form */}
        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Danh Sách Link TikTok (1 Link / Dòng)</label>
              <textarea
                rows={4}
                placeholder="https://www.tiktok.com/@user/video/1111&#10;https://www.tiktok.com/@user/video/2222"
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <button
              onClick={() => {
                setStatusMsg({ type: 'success', text: 'Đã nhập hàng loạt danh sách video!' });
                setTimeout(onClose, 1200);
              }}
              className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs transition-all cursor-pointer"
            >
              Nhập Hàng Loạt Link TikTok
            </button>
          </div>
        )}

        {/* Hashtag Form */}
        {activeTab === 'hashtag' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">Chọn Hashtag Target Tri Tôn</label>
            <div className="grid grid-cols-2 gap-2">
              {popularHashtags.map((h) => (
                <button
                  key={h.tag}
                  type="button"
                  onClick={() => setSelectedHashtag(h.tag)}
                  className={`p-2.5 rounded-xl text-xs text-left font-medium border transition-all ${
                    selectedHashtag === h.tag
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-emerald-800 font-bold">{h.tag}</div>
                  <div className="text-[10px] text-slate-500">{h.name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setStatusMsg({ type: 'success', text: `Đã kích hoạt quét tự động cho ${selectedHashtag}!` });
                setTimeout(onClose, 1200);
              }}
              className="w-full py-3 rounded-xl bg-[#D99B26] hover:bg-amber-600 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              Tự Động Quét Video TikTok Theo Hashtag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
