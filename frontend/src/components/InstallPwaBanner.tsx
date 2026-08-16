'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Check, Sparkles, ShieldCheck } from 'lucide-react';

const DISMISS_KEY = 'triton_pwa_install_dismissed_v2';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // 1. Force unregister any stale Service Worker and clear old caches
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) console.log('[PWA] Stale Service Worker successfully unregistered');
          });
        }
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }

    // 2. Check standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // 3. Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner automatically if not dismissed
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (!dismissedUntil || Date.now() >= Number(dismissedUntil)) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Global Custom Event to open install modal from anywhere
    const handleOpenInstallEvent = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowInstallModal(true);
      }
    };

    window.addEventListener('open-pwa-install', handleOpenInstallEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleOpenInstallEvent);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstallModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch { /* ignore */ }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* ── TOP-RIGHT / BOTTOM-LEFT TOAST BANNER (KHÔNG ĐÈ CẤN CHATBOT) ── */}
      {showBanner && (
        <aside
          aria-label="Cài đặt ứng dụng Du Lịch Tri Tôn"
          className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 max-w-[calc(100vw-5rem)] sm:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300 font-body"
        >
          <div className="bg-[#FFFDF7]/95 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-xl border border-[#0E8C7F]/30 backdrop-blur-xl flex items-center justify-between gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-0.5 shadow-xs shrink-0 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5 text-[#FFD37A]" />
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="font-display font-bold text-xs text-[#26221B] truncate">
                Cài App Du Lịch Tri Tôn
              </h4>
              <p className="text-[10px] text-[#6B6355] truncate">
                Mở nhanh 1 chạm, dùng mượt mà
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-2.5 py-1.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] active:scale-95 text-[#26221B] font-bold text-[11px] font-display flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Cài Đặt</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-full text-[#6B6355] hover:text-[#26221B] transition-colors"
                aria-label="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── MODAL HƯỚNG DẪN CÀI ĐẶT APP CHO MỌI THIẾT BỊ ── */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#FFFDF7] rounded-3xl p-5 shadow-2xl border border-[#26221B]/15 space-y-4 animate-in slide-in-from-bottom-6 duration-300 font-body">
            <div className="flex items-center justify-between border-b border-[#26221B]/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#0E8C7F]" />
                <h3 className="font-display font-black text-sm text-[#26221B]">
                  {isIOS ? 'Cài Đặt Trên iPhone / iPad' : 'Cài Đặt App Tri Tôn'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="p-1 rounded-full text-[#6B6355] hover:text-[#26221B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <>
                <p className="text-xs text-[#6B6355] leading-relaxed">
                  Để cài ứng dụng <strong>Du Lịch Tri Tôn</strong> ra màn hình chính, thực hiện 2 bước đơn giản trên Safari:
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
                      Cuộn xuống và chọn <strong>&quot;Thêm vào MH chính&quot;</strong> (
                      <PlusSquare className="w-3.5 h-3.5 inline text-[#F0A32F] -mt-0.5 mx-0.5" />
                      Add to Home Screen).
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#6B6355] leading-relaxed">
                  Bấm vào nút bên dưới hoặc menu <strong>⋮ (3 chấm)</strong> của trình duyệt Chrome/Cốc Cốc và chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.
                </p>
                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs font-display flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cài Đặt Ngay</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowInstallModal(false);
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
