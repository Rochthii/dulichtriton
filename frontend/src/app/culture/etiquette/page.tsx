'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowLeft, HeartHandshake, CheckCircle2, XCircle, 
  Sparkles, BookOpen, MessageSquareText, Landmark, Compass, Eye, ShieldAlert,
  Sun, Footprints, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PagodaEtiquetteDetailPage() {
  const { language, dict } = useLanguage();
  const cu = dict.culture;
  const eq = cu.etiquetteDetail;
  const isEn = language === 'en';

  const pagodaRules = cu.pagodaRulesList || [];

  const handleAskAi = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('triton:open-chat', { 
        detail: { query: eq.askAiPrompt } 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B] antialiased pb-20 sm:pb-16 overflow-x-hidden">
      {/* Top Breadcrumb Bar */}
      <div className="bg-[#FFFDF7] border-b border-[#26221B]/10 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/culture"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0E8C7F] hover:text-[#085A52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{eq.backToCulture}</span>
          </Link>

          <button
            type="button"
            onClick={handleAskAi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'Ask AI About Rules' : 'Hỏi AI Quy Chuẩn'}</span>
            <span className="sm:hidden">Hỏi AI</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* ── 1. HERO HEADER BANNER ──────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-[#0E8C7F] via-[#0B6B60] to-[#151B34] text-white p-5 sm:p-8 md:p-10 shadow-xl border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD37A]/20 text-[#FFD37A] text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md border border-[#FFD37A]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{eq.heroBadge}</span>
            </div>

            <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold leading-snug text-[#FFFDF7]">
              {eq.heroTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#FAF3E7]/90 leading-relaxed font-body">
              {eq.heroSubtitle}
            </p>
          </div>
        </section>

        {/* ── 2. NGHỆ THUẬT CHÀO SAMPHEAH (3 CẤP ĐỘ) ────────────────────── */}
        <section className="bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-5 sm:p-8 border border-[#26221B]/10 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-[#26221B]/10 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9822B] uppercase tracking-wider font-display">
              <HeartHandshake className="w-4 h-4 text-[#D9822B]" />
              <span>Văn Hóa Chào Hỏi Truyền Thống Khmer</span>
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#26221B]">
              {eq.sampheahSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6355]">
              {eq.sampheahSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Level 1: Ngang Ngực */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border-2 border-emerald-300 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white font-display">
                    Cấp Độ 1
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 font-mono">0° - 10° Cúi nhẹ</span>
                </div>

                {/* Visual SVG Diagram for Level 1 */}
                <div className="w-full py-4 px-3 bg-emerald-100/50 rounded-xl border border-emerald-200/80 flex items-center justify-center gap-3">
                  <svg className="w-12 h-12 text-emerald-700 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Head */}
                    <circle cx="32" cy="14" r="7" stroke="currentColor" strokeWidth="2.5" />
                    {/* Body */}
                    <path d="M32 21V46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Folded Hands at Chest */}
                    <path d="M22 30C26 27 29 28 32 30C35 28 38 27 42 30" stroke="#0E8C7F" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M32 25L32 34" stroke="#F26B3A" strokeWidth="3" strokeLinecap="round" />
                    {/* Palms Indicator */}
                    <ellipse cx="32" cy="30" rx="3" ry="5" fill="#F0A32F" fillOpacity="0.4" stroke="#D9822B" strokeWidth="1.5" />
                    {/* Feet */}
                    <path d="M26 56L32 46L38 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block font-display">Vị Trí Hai Tay:</span>
                    <span className="text-xs font-bold text-emerald-950 block">Ngang Ngực (Chong Trud)</span>
                    <span className="text-[11px] text-emerald-700 block">Dành cho bạn bè đồng trang lứa</span>
                  </div>
                </div>

                <h3 className="font-display text-sm sm:text-base font-extrabold text-emerald-950 pt-1">
                  {eq.sampheahLevel1Title}
                </h3>
                <p className="text-xs text-emerald-900/90 leading-relaxed font-body">
                  {eq.sampheahLevel1Desc}
                </p>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
                💡 <span className="font-bold">Mẹo thực tế:</span> Đầu thẳng, mỉm cười nhẹ khi cất tiếng chào "Choum Reap Sur".
              </div>
            </div>

            {/* Level 2: Ngang Mũi / Miệng */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white border-2 border-amber-300 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white font-display">
                    Cấp Độ 2
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 font-mono">30° Cúi chào</span>
                </div>

                {/* Visual SVG Diagram for Level 2 */}
                <div className="w-full py-4 px-3 bg-amber-100/50 rounded-xl border border-amber-200/80 flex items-center justify-center gap-3">
                  <svg className="w-12 h-12 text-amber-800 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Head - Slightly tilted */}
                    <circle cx="34" cy="13" r="7" stroke="currentColor" strokeWidth="2.5" />
                    {/* Body - 30 deg bow */}
                    <path d="M34 20L31 34L28 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Folded Hands at Mouth / Nose */}
                    <path d="M22 26C27 22 30 20 34 20C38 20 41 22 46 26" stroke="#D9822B" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M34 16L34 24" stroke="#F26B3A" strokeWidth="3" strokeLinecap="round" />
                    {/* Palms Indicator */}
                    <ellipse cx="34" cy="19" rx="3" ry="5" fill="#F0A32F" fillOpacity="0.4" stroke="#D9822B" strokeWidth="1.5" />
                    {/* Feet */}
                    <path d="M24 56L28 46L34 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block font-display">Vị Trí Hai Tay:</span>
                    <span className="text-xs font-bold text-amber-950 block">Ngang Mũi / Miệng (Chong Mork)</span>
                    <span className="text-[11px] text-amber-700 block">Dành cho cha mẹ, người lớn tuổi</span>
                  </div>
                </div>

                <h3 className="font-display text-sm sm:text-base font-extrabold text-amber-950 pt-1">
                  {eq.sampheahLevel2Title}
                </h3>
                <p className="text-xs text-amber-900/90 leading-relaxed font-body">
                  {eq.sampheahLevel2Desc}
                </p>
              </div>
              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 font-medium">
                💡 <span className="font-bold">Mẹo thực tế:</span> Đầu ngón cái chạm nhẹ chóp mũi, người cúi gập góc 30 độ thể hiện hiếu kính.
              </div>
            </div>

            {/* Level 3: Ngang Trán (Giữa Chân Mày) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-50/80 to-white border-2 border-purple-300 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-700 text-white font-display">
                    Cấp Độ 3
                  </span>
                  <span className="text-[11px] font-bold text-purple-800 font-mono">45° - 60° Sùng kính</span>
                </div>

                {/* Visual SVG Diagram for Level 3 */}
                <div className="w-full py-4 px-3 bg-purple-100/50 rounded-xl border border-purple-200/80 flex items-center justify-center gap-3">
                  <svg className="w-12 h-12 text-purple-900 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Head - Deep bow */}
                    <circle cx="36" cy="14" r="7" stroke="currentColor" strokeWidth="2.5" />
                    {/* Body - 45-60 deg deep bow */}
                    <path d="M34 20L28 32L24 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Folded Hands at Forehead / Eyebrows */}
                    <path d="M22 22C27 16 31 12 36 12C41 12 45 16 50 22" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M36 8L36 17" stroke="#F26B3A" strokeWidth="3" strokeLinecap="round" />
                    {/* Palms Indicator */}
                    <ellipse cx="36" cy="12" rx="3.5" ry="5.5" fill="#F0A32F" fillOpacity="0.4" stroke="#7C5CBF" strokeWidth="1.5" />
                    {/* Feet */}
                    <path d="M20 56L24 46L30 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block font-display">Vị Trí Hai Tay:</span>
                    <span className="text-xs font-bold text-purple-950 block">Ngang Trán (Chong Tngos)</span>
                    <span className="text-[11px] text-purple-700 block">Dành cho Chư Tăng & Đức Phật</span>
                  </div>
                </div>

                <h3 className="font-display text-sm sm:text-base font-extrabold text-purple-950 pt-1">
                  {eq.sampheahLevel3Title}
                </h3>
                <p className="text-xs text-purple-900/90 leading-relaxed font-body">
                  {eq.sampheahLevel3Desc}
                </p>
              </div>
              <div className="pt-2 border-t border-purple-200/60 text-[11px] text-purple-800 font-medium">
                💡 <span className="font-bold">Mẹo thực tế:</span> Đầu ngón cái chạm giữa 2 chân mày, cúi gập sâu từ thắt lưng bày tỏ lòng sùng kính cao nhất.
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CHI TIẾT 6 QUY CHUẨN BẤT BIẾN (Responsive Cards) ────────── */}
        <section className="space-y-4">
          <div className="border-b border-[#26221B]/10 pb-3">
            <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#26221B]">
              {eq.deepDiveSectionTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pagodaRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-[24px] border shadow-xs space-y-3 bg-white ${rule.color}`}
              >
                {/* Responsive Header: Prevents title collision with badge on small screens */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-[#26221B] leading-tight">
                    {rule.title}
                  </h3>
                  <span className="self-start sm:self-auto px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-display shrink-0">
                    {rule.badge}
                  </span>
                </div>
                <p className="text-xs text-[#4A4336] leading-relaxed font-body">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. BẢNG CHECKLIST NÊN & KHÔNG NÊN LÀM (DOS & DON'TS) ─────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 font-body">
          {/* DOS */}
          <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-display">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg">{eq.dosTitle}</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-[#4A4336]">
              {eq.dosList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DON'TS */}
          <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-display">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg">{eq.dontsTitle}</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-[#4A4336]">
              {eq.dontsList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 5. BOTTOM ACTION CTA ────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#FAF3E7] via-amber-50 to-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-6 sm:p-8 border-2 border-[#F0A32F]/40 shadow-md text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F]">
            <Sparkles className="w-6 h-6 text-[#0E8C7F]" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="font-display text-lg sm:text-2xl font-extrabold text-[#26221B]">
              {isEn ? 'Need Assistance for Pagoda Visits?' : 'Cần Trợ Lý AI Hướng Dẫn Nghi Thức Trực Tiếp?'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6355]">
              {isEn ? 'AI can answer specific questions about Theravada Vinaya rules, offering procedures, and optimal visiting times.' : 'Hỏi trợ lý AI về giờ viếng chùa đẹp nhất, đường đi, và các tập tục dâng lễ chư tăng đúng phép.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleAskAi}
              className="px-6 py-3 rounded-full bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>{isEn ? 'Open AI Travel Assistant' : 'Mở Trợ Lý Du Lịch AI'}</span>
            </button>
            <Link
              href="/culture"
              className="px-5 py-3 rounded-full bg-white border border-[#26221B]/15 hover:border-[#0E8C7F] text-[#26221B] font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              {isEn ? 'Explore 37 Khmer Pagodas' : 'Khám Phá Danh Sách 37 Chùa'}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
