import React, { useState, useEffect } from 'react';
import { useTikTokRealtime } from './hooks/useTikTokRealtime';
import { TikTokFeed } from './components/TikTokFeed';
import { ImportTikTokModal } from './components/ImportTikTokModal';

export default function App() {
  const {
    videos,
    isLoading,
    isError,
    refetchServerVideos,
    addCustomVideo
  } = useTikTokRealtime();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    // Simple check to show admin page based on URL
    if (window.location.pathname === '/admin' || window.location.search.includes('admin=true')) {
      setIsAdmin(true);
    }
  }, []);

  const handleRetry = () => {
    refetchServerVideos();
  };

  if (isAdmin) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0502] text-white p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 text-orange-500">Trang Quản Trị (Admin)</h1>
          <p className="text-white/50 mb-8 text-sm">Công cụ quản lý nội dung TikTok cho hệ thống</p>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-start gap-4">
            <h2 className="text-lg font-semibold text-white">Thêm Video Mới</h2>
            <p className="text-sm text-white/60 max-w-lg">Sử dụng công cụ thu thập tự động qua hashtag, dán hàng loạt link hoặc nhập link đơn lẻ để thêm video vào cơ sở dữ liệu. (Sau khi thêm có thể refresh lại trang chủ để xem thay đổi)</p>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-sm rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-900/50 cursor-pointer"
            >
              Mở Công Cụ Nhập TikTok
            </button>
          </div>
        </div>

        <ImportTikTokModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onAddVideo={(video) => {
            addCustomVideo(video);
            // Optionally refetch to ensure sync with server
            setTimeout(() => refetchServerVideos(), 500);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col font-sans overflow-hidden overscroll-none">
      <main className="flex-1 h-full w-full overflow-hidden bg-black">
        <TikTokFeed
          videos={videos}
          isLoading={isLoading}
          isError={isError}
          onRetry={handleRetry}
        />
      </main>
    </div>
  );
}

