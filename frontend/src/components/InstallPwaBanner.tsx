'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Check, Sparkles } from 'lucide-react';

const DISMISS_KEY = 'triton_pwa_install_dismissed_v1';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Check if already installed as standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // 3. Check dismiss cooldown (7 days)
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 4. Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 5. Listen for Android / Chrome / Edge install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS and not standalone, show after a short delay (3s)
    if (isIosDevice && !standalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[PWA] User accepted installation');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Dismiss for 7 days
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {
      // ignore
    }
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Mini Banner at bottom */}
      <aside
        aria-label="Cài đặt ứng dụng Du Lịch Tri Tôn"
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 font-body"
      >
        <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl border-2 border-[#0E8C7F]/30 backdrop-blur-xl flex items-center justify-between gap-3">
          
          {/* Logo / Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-0.5 shadow-md shrink-0 flex items-center justify-center text-white">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD37A]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-black text-xs sm:text-sm text-[#26221B] truncate">
                Cài Đặt App Tri Tôn AI
              </h3>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] font-extrabold text-[9px] font-display">
                OFFLINE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#6B6355] line-clamp-1 leading-snug">
              Truy cập nhanh 1 chạm, bản đồ & cứu hộ 24/7
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] active:scale-95 text-[#26221B] font-bold text-xs font-display flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài Đặt</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] hover:bg-[#FAF3E7] transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#FFFDF7] rounded-3xl p-5 shadow-2xl border border-[#26221B]/15 space-y-4 animate-in slide-in-from-bottom-6 duration-300 font-body">
            <div className="flex items-center justify-between border-b border-[#26221B]/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#0E8C7F]" />
                <h3 className="font-display font-black text-sm text-[#26221B]">
                  Cài đặt trên iPhone / iPad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-[#6B6355] hover:text-[#26221B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B6355] leading-relaxed">
              Để thêm ứng dụng <strong>Du Lịch Tri Tôn</strong> ra màn hình chính, bạn thực hiện 2 bước đơn giản trên trình duyệt Safari:
            </p>

            <div className="space-y-3 bg-[#FAF3E7] p-3.5 rounded-2xl border border-[#26221B]/8">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0E8C7F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-[#26221B]">
                  Chạm vào biểu tượng <strong>Chia sẻ</strong> (
                  <Share2 className="w-3.5 h-3.5 inline text-[#0E8C7F] -mt-0.5 mx-0.5" />
                  ) ở thanh dưới Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0E8C7F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-[#26221B]">
                  Cuộn xuống và chọn <strong>"Thêm vào MH chính"</strong> (
                  <PlusSquare className="w-3.5 h-3.5 inline text-[#F0A32F] -mt-0.5 mx-0.5" />
                  Add to Home Screen).
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-full bg-[#0E8C7F] text-white font-bold text-xs font-display flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Đã Hiểu</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
