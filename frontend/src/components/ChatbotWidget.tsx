'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Sparkles, X, Send, Bot, User,
  MapPin, Navigation, Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/utils';
import VideoChatCard from './VideoChatCard';
import FormattedChatMessage from './FormattedChatMessage';
import WireDiagramItinerary, { type ItineraryData } from './WireDiagramItinerary';
import ItineraryPresetPicker from './ItineraryPresetPicker';

interface EmbeddedSpot {
  type?: string;
  id?: string;
  name: string;
  commune: string;
  category: string;
  imageUrl: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

interface EmbeddedVideo {
  title: string;
  views: string;
  imageUrl: string;
  embedUrl?: string;
  creator?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  spots?: EmbeddedSpot[];
  videos?: EmbeddedVideo[];
  suggestions?: string[];
  itinerary?: ItineraryData;
  showPresetPicker?: boolean;
}

const SESSION_KEY = 'triton_chat_session';
const MAX_STORED_MESSAGES = 30;

// Itinerary intent keywords
const ITINERARY_KEYWORDS = /lịch trình|tour|gợi ý đi|kế hoạch|nên đi đâu|đi 1 ngày|đi 2 ngày|muốn đi|phượt|hành trình|đi chơi|tham quan|ghé/i;

const defaultWelcome: Message = {
  id: '1',
  sender: 'assistant',
  text: 'Xin chào! Tôi là Trợ lý AI Du Lịch Tri Tôn. Bạn cần gợi ý **lịch trình**, tìm **đặc sản Bảy Núi**, hay khám phá **chùa Khmer** nào đó?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: ['Gợi ý tour 1 ngày', 'Ăn Gà Đốt ở đâu ngon?', 'Chùa Khmer nào đẹp nhất?'],
  showPresetPicker: true,
};

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [defaultWelcome];
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return [defaultWelcome];
  });

  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    const KEY = 'triton_widget_session_id';
    const stored = localStorage.getItem(KEY);
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const newId = `wgt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(KEY, newId);
      sessionIdRef.current = newId;
    }
  }, []);

  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvt = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvt.detail?.query) {
        handleSend(customEvt.detail.query);
      }
    };
    window.addEventListener('triton:open-chat', handleCustomOpen);
    return () => window.removeEventListener('triton:open-chat', handleCustomOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
    } catch { /* quota exceeded */ }
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (pathname?.startsWith('/admin')) return null;

  const presets = [
    'Gợi ý tour 1 ngày Bảy Núi',
    'Ăn Gà Đốt Ô Thum ở đâu?',
    'Đường lên Hồ Tà Pạ',
    'Chùa Khmer đẹp nhất'
  ];

  // ── Handle preset itinerary selection ──────────────────────────────────────
  const handlePresetSelect = async (slug: string) => {
    const PRESET_LABELS: Record<string, string> = {
      'classic-1day':       '🔥 Kinh Điển 1 Ngày',
      'tiktok-viral':       '📸 Sống Ảo TikTok',
      'spiritual-family':   '🙏 Tâm Linh Khmer',
      'trekking-adventure': '🥾 Trekking Bảy Núi',
      'food-tour':          '🍗 Food Tour Bảy Núi',
      'half-day':           '🕰️ Nửa Ngày Ghé Ngang',
      'history-memorial':   '📜 Lịch Sử & Tưởng Niệm',
      'couple-chill':       '💑 Couple Chill & Hoàng Hôn',
    };

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Cho tôi lịch trình: ${PRESET_LABELS[slug] || slug}`,
      timestamp: now,
    };

    const botId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botId,
      sender: 'assistant',
      text: '',
      timestamp: now,
    };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setIsLoadingItinerary(true);

    try {
      const res = await fetch(`/api/v1/chat/itinerary?slug=${slug}`);
      if (!res.ok) throw new Error('Not found');
      const { itinerary } = await res.json() as { itinerary: ItineraryData };

      setMessages(prev => prev.map(m =>
        m.id === botId
          ? {
              ...m,
              text: `Đây là lịch trình **${itinerary.emoji} ${itinerary.title}** — ${itinerary.tagline}`,
              itinerary,
              suggestions: ['Lịch trình khác', 'Ăn gì ở Tri Tôn?', 'Hỏi thêm về Hồ Tà Pạ'],
            }
          : m
      ));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === botId
          ? { ...m, text: 'Không tải được lịch trình. Bạn hãy thử lại nhé!' }
          : m
      ));
    } finally {
      setIsLoadingItinerary(false);
    }
  };

  // ── Main send handler ──────────────────────────────────────────────────────
  const handleSend = useCallback(async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    // Detect itinerary intent → show preset picker
    if (ITINERARY_KEYWORDS.test(textToSend) && !queryText?.includes('slug:')) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend, timestamp: now };
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Tôi có **8 lịch trình** được thiết kế sẵn cho từng nhu cầu — bấm chọn lịch trình phù hợp với bạn:',
        timestamp: now,
        showPresetPicker: true,
        suggestions: ['Ăn gì ở Tri Tôn?', 'Hỏi về Hồ Tà Pạ', 'Chùa Khmer nào đẹp?'],
      };
      setMessages(prev => [...prev, userMsg, botMsg]);
      if (!queryText) setInput('');
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend, timestamp: now };
    const botId = (Date.now() + 1).toString();
    const botPlaceholder: Message = { id: botId, sender: 'assistant', text: '', timestamp: now, suggestions: [] };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, session_id: sessionIdRef.current || 'widget_session' }),
      });

      if (!response.ok || !response.body) throw new Error('Stream unavailable');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let fullStreamText = '';

      const update = (patch: Partial<Message>) =>
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, ...patch } : m));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));

            if (evt.type === 'text_delta') {
              fullStreamText += evt.delta;
              setMessages(prev => prev.map(m =>
                m.id === botId ? { ...m, text: fullStreamText } : m
              ));
            } else if (evt.type === 'places' && Array.isArray(evt.data) && evt.data.length > 0) {
              const spots: EmbeddedSpot[] = evt.data.slice(0, 3).map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: p.name as string,
                commune: p.commune as string,
                category: p.category as string,
                imageUrl: (p.image_url as string) || '',
                rating: (p.rating as number) || 4.5,
              }));
              update({ spots });
            } else if (evt.type === 'videos' && Array.isArray(evt.data) && evt.data.length > 0) {
              const videos: EmbeddedVideo[] = evt.data.slice(0, 2).map((v: Record<string, unknown>) => ({
                title: v.title as string,
                views: (v.view_count as string) || '0',
                imageUrl: (v.thumbnail_url as string) || '',
                embedUrl: (v.video_url as string) || '',
                creator: (v.author_name as string) || '',
              }));
              update({ videos });
            } else if (evt.type === 'suggestions') {
              update({ suggestions: evt.data as string[] });
            } else if (evt.type === 'error') {
              update({ text: 'Tôi gặp sự cố kết nối tạm thời. Bạn hãy thử lại nhé!' });
            }
          } catch { /* malformed chunk */ }
        }
      }

      if (!fullStreamText.trim()) {
        update({ text: 'Tôi đã tìm thấy thông tin Tri Tôn cho Bạn. Vui lòng tham khảo các thẻ địa điểm bên trên!' });
      }

      if (!isOpen) setUnreadCount(prev => prev + 1);

    } catch (error) {
      console.error('Chatbot API Error:', error);
      setMessages(prev => prev.map(m =>
        m.id === botId
          ? { ...m, text: 'Xin lỗi, server AI hiện đang bận. Bạn hãy thử lại nhé!', suggestions: ['Thử lại', 'Gợi ý tour 1 ngày'] }
          : m
      ));
    } finally {
      setIsTyping(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isOpen]);

  const handleClearHistory = () => {
    setMessages([{
      ...defaultWelcome,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setUnreadCount(0);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Floating Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 p-3.5 rounded-full bg-[#1B4D3E] hover:bg-[#143B2F] text-white shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group border border-[#D99B26]/30"
        aria-label="Open AI Chatbot"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-white" />
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26] absolute -top-1 -right-1 animate-pulse" />
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-[#1B4D3E] animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs sm:text-sm font-bold pr-1">
          Hỏi AI Tri Tôn
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'inset-0 sm:bottom-4 sm:right-4 sm:left-auto sm:top-4 sm:w-[720px] sm:h-[680px] rounded-none sm:rounded-3xl'
              : 'inset-x-0 bottom-0 top-14 rounded-t-3xl sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[440px] sm:h-[600px] sm:rounded-3xl'
          }`}
        >
          {/* Mobile swipe handle */}
          <div
            onClick={() => setIsOpen(false)}
            className="sm:hidden w-full flex justify-center py-2 bg-[#1B4D3E] cursor-pointer shrink-0 active:opacity-80"
          >
            <div className="w-12 h-1.5 bg-emerald-200/60 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-[#1B4D3E] text-white px-4 py-3 sm:py-4 flex items-center justify-between border-b border-emerald-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#143B2F] border border-[#D99B26] flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-none flex items-center gap-2">
                  Trợ Lý AI Tri Tôn
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-200 mt-1">
                  Lịch trình • Ẩm thực • Địa điểm • 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={handleClearHistory} title="Xóa lịch sử" className="p-2 sm:p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'} className="hidden sm:block p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors">
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 sm:p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors ml-1 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0 touch-pan-x">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 hover:border-[#1B4D3E] hover:text-[#1B4D3E] text-slate-700 font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95 touch-manipulation"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div ref={messagesContainerRef} className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${msg.sender === 'user' ? 'bg-[#D99B26]' : 'bg-[#143B2F]'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-slate-900" /> : <Bot className="w-4 h-4 text-[#D99B26]" />}
                </div>

                <div className={`max-w-[92%] sm:max-w-[88%] space-y-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Text bubble */}
                  <div className={`w-full rounded-2xl px-3.5 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1B4D3E] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}>
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                    ) : msg.text.trim() === '' && !msg.itinerary ? (
                      /* Loading dots */
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        <div className="flex items-center gap-1 text-[#1B4D3E]">
                          <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                          {isLoadingItinerary ? 'Đang tải lịch trình...' : 'AI đang suy nghĩ...'}
                        </span>
                      </div>
                    ) : (
                      <FormattedChatMessage content={msg.text} isAssistant={msg.sender === 'assistant'} />
                    )}
                    <span className={`block text-[9px] sm:text-[10px] mt-1 ${msg.sender === 'user' ? 'text-emerald-300 text-right' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* ── WIRE DIAGRAM ITINERARY ────────────────────────────── */}
                  {msg.itinerary && (
                    <div className="w-full">
                      <WireDiagramItinerary itinerary={msg.itinerary} />
                    </div>
                  )}

                  {/* ── PRESET PICKER ─────────────────────────────────────── */}
                  {msg.sender === 'assistant' && msg.showPresetPicker && (
                    <div className="w-full bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
                      <ItineraryPresetPicker onSelect={handlePresetSelect} />
                    </div>
                  )}

                  {/* ── EMBEDDED SPOT CARDS ───────────────────────────────── */}
                  {msg.spots && msg.spots.length > 0 && (
                    <div className="w-full flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin snap-x touch-pan-x">
                      {msg.spots.map((spot, i) => (
                        <div key={`wspot-${msg.id}-${i}`} className="min-w-[210px] max-w-[230px] bg-white rounded-2xl p-2.5 border border-slate-200 flex items-center gap-2.5 shrink-0 snap-start shadow-xs hover:border-[#1B4D3E]/40 transition-all">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={spot.imageUrl} alt={spot.name} className="w-13 h-13 rounded-xl object-cover bg-slate-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                              <MapPin className="w-2.5 h-2.5 text-[#D99B26]" />
                              <span className="truncate">{spot.commune}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 truncate">{spot.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <a href={getGoogleMapsUrl(spot.name, spot.commune)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#1B4D3E] bg-emerald-100/80 hover:bg-[#1B4D3E] hover:text-white px-2.5 py-1 rounded-lg transition-colors min-h-[28px]">
                                <Navigation className="w-3 h-3" />Maps
                              </a>
                              {spot.id && (
                                <Link href={`/places/${spot.id}`} className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-600 hover:text-white px-2.5 py-1 rounded-lg transition-colors min-h-[28px]">
                                  Xem
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── EMBEDDED VIDEO CARDS ──────────────────────────────── */}
                  {msg.videos && msg.videos.length > 0 && (
                    <div className="w-full flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin snap-x touch-pan-x">
                      {msg.videos.map((video, i) => (
                        <div key={`wvid-${msg.id}-${i}`} className="min-w-[220px] max-w-[240px] shrink-0 snap-start">
                          <VideoChatCard title={video.title} views={video.views} imageUrl={video.imageUrl} embedUrl={video.embedUrl} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── SUGGESTION CHIPS ──────────────────────────────────── */}
                  {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={`wsug-${msg.id}-${i}`}
                          onClick={() => handleSend(sug)}
                          className="px-3.5 py-1.5 rounded-full border border-[#D99B26]/40 text-[#1B4D3E] bg-amber-50 hover:bg-[#D99B26] hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs touch-manipulation active:scale-95"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 pb-safe">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về Hồ Tà Pạ, Gà đốt Ô Thum, Chùa Khmer..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || isLoadingItinerary || !input.trim()}
              className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 min-w-[44px] min-h-[44px]"
            >
              <Send className="w-4 h-4 text-[#D99B26]" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
