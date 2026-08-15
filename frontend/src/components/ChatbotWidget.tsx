'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Sparkles, X, Send, Bot, User,
  MapPin, Navigation, Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/utils';
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

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  spots?: EmbeddedSpot[];
  suggestions?: string[];
  itinerary?: ItineraryData;
  showPresetPicker?: boolean;
}

const SESSION_KEY = 'triton_chat_session';
const MAX_STORED_MESSAGES = 30;

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
      const newId = 'session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(KEY, newId);
      sessionIdRef.current = newId;
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
      } catch { /* ignore */ }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };
    window.addEventListener('triton:open-chat', handleOpenChat);
    return () => window.removeEventListener('triton:open-chat', handleOpenChat);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  if (pathname === '/chatbot') {
    return null;
  }

  const presets = [
    'Tour 1 Ngày',
    'Gà Đốt Ô Thum',
    'Hồ Tà Pạ',
    'Chùa Xvayton',
    'Homestay Đẹp'
  ];

  const handlePresetSelect = async (presetSlug: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Xem lịch trình: ${presetSlug}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setIsLoadingItinerary(true);

    try {
      const res = await fetch(`/api/v1/chat/itinerary?slug=${encodeURIComponent(presetSlug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.itinerary) {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: `Đây là sơ đồ lịch trình **${data.itinerary.title}** được xây dựng từ dữ liệu thực địa:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            itinerary: data.itinerary,
            suggestions: [
              'Tìm quán ăn gần đây',
              'Thời điểm đẹp nhất đi cung này?',
              'Có chỗ thuê xe máy không?',
            ],
          };
          setMessages(prev => [...prev, botMsg]);
          setIsLoadingItinerary(false);
          setIsTyping(false);
          return;
        }
      }
    } catch { /* fallback */ }

    setIsLoadingItinerary(false);
    await handleSend(`Lên lịch trình ${presetSlug}`);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const lower = textToSend.toLowerCase();
    if (
      lower.includes('lịch trình') ||
      lower.includes('tour') ||
      lower.includes('1 ngày') ||
      lower.includes('2 ngày')
    ) {
      let matchedSlug = 'classic-1day';
      if (lower.includes('2 ngày') || lower.includes('2n1d') || lower.includes('2n1đ')) {
        matchedSlug = 'backpack-2d1n';
      } else if (lower.includes('ẩm thực') || lower.includes('ăn')) {
        matchedSlug = 'foodie-trail';
      } else if (lower.includes('chùa') || lower.includes('tâm linh') || lower.includes('khmer')) {
        matchedSlug = 'pagoda-heritage';
      } else if (lower.includes('trekking') || lower.includes('núi') || lower.includes('cô tô')) {
        matchedSlug = 'co-to-trekking';
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMsg]);
      if (!customText) setInput('');
      setIsTyping(true);
      setIsLoadingItinerary(true);

      try {
        const res = await fetch(`/api/v1/chat/itinerary?slug=${matchedSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.itinerary) {
            const botMsg: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: `Tôi đã lập sơ đồ lịch trình **${data.itinerary.title}** phù hợp nhất cho bạn:`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              itinerary: data.itinerary,
              suggestions: [
                'Quán Gà Đốt Ô Thum ngon nhất',
                'Số hotline cứu hộ xe máy',
                'Xem các điểm check-in lân cận',
              ],
            };
            setMessages(prev => [...prev, botMsg]);
            setIsLoadingItinerary(false);
            setIsTyping(false);
            return;
          }
        }
      } catch { /* fallback */ }
      setIsLoadingItinerary(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, botMsg]);

    try {
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          session_id: sessionIdRef.current,
          history: messages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('API request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let extractedSpots: EmbeddedSpot[] = [];
      let extractedSuggestions: string[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'token') {
              accumulatedText += event.token;
              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId
                    ? { ...m, text: accumulatedText }
                    : m
                )
              );
            } else if (event.type === 'metadata') {
              if (event.places && Array.isArray(event.places)) {
                extractedSpots = event.places.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  commune: p.commune,
                  category: p.category,
                  imageUrl: p.imageUrl || p.image_url || '',
                  rating: p.rating || 4.5,
                }));
              }
              if (event.suggestions && Array.isArray(event.suggestions)) {
                extractedSuggestions = event.suggestions;
              }
            } else if (event.type === 'done') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        text: accumulatedText || event.full_text || m.text,
                        spots: extractedSpots.length > 0 ? extractedSpots : m.spots,
                        suggestions: extractedSuggestions.length > 0 ? extractedSuggestions : m.suggestions,
                      }
                    : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      try {
        const fallbackRes = await fetch('/api/v1/chat/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: textToSend,
            session_id: sessionIdRef.current,
          }),
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: data.answer || data.text || 'Tôi đã nhận được thông tin nhưng chưa thể phản hồi ngay.',
                    suggestions: data.suggestions || ['Khám phá Tà Pạ', 'Gà Đốt Ô Thum', 'Lịch trình 1 ngày'],
                  }
                : m
            )
          );
        }
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: 'Xin lỗi, kết nối bị gián đoạn. Bạn vui lòng thử lại hoặc bấm vào các câu hỏi gợi ý bên dưới nhé.',
                  suggestions: ['Gợi ý tour 1 ngày', 'Quán Gà Đốt Ô Thum', 'Chùa Xvayton'],
                }
              : m
          )
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([{
      ...defaultWelcome,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* ── FLOATING BUTTON (Folk-Modern Palm CTA) ────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-4 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white shadow-[0_4px_20px_rgba(240,163,47,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group select-none font-display"
          aria-label="Mở Trợ lý AI Du Lịch Tri Tôn"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0E8C7F] rounded-full border-2 border-white animate-ping" />
          </div>
          <span className="hidden sm:inline-block font-bold text-xs pr-1">
            Trợ Lý AI Tri Tôn
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-[#F26B3A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── CHAT MODAL WINDOW ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-[#FAF3E7] shadow-[0_10px_40px_rgba(38,34,27,0.2)] border border-[#26221B]/10 overflow-hidden font-body transition-all duration-300
            ${isExpanded
              ? 'inset-3 sm:inset-6 rounded-[28px]'
              : 'bottom-0 inset-x-0 sm:inset-x-auto sm:right-6 sm:bottom-6 w-full sm:w-[420px] sm:max-w-[calc(100vw-3rem)] h-[88dvh] sm:h-[620px] sm:max-h-[85vh] rounded-t-[26px] sm:rounded-[26px]'
            }`}
        >
          {/* Mobile swipe handle */}
          <div
            onClick={() => setIsOpen(false)}
            className="sm:hidden w-full flex justify-center py-2 bg-[#0E8C7F] cursor-pointer shrink-0 active:opacity-80"
          >
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-[#0E8C7F] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-[#0B6B60] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#0B6B60] border border-[#FFD37A]/40 flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-[#FFD37A]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base leading-none flex items-center gap-2 text-[#FFFDF7]">
                  Trợ Lý AI Tri Tôn
                  <span className="w-2 h-2 rounded-full bg-[#FFD37A] animate-ping" />
                </h3>
                <p className="text-[10px] sm:text-xs text-[#FAF3E7]/80 mt-1 font-body">
                  Lịch trình • Ẩm thực • Địa điểm • 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={handleClearHistory} title="Xóa lịch sử" className="p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'} className="hidden sm:block p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors">
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors ml-1 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="px-3 py-2 bg-[#FFFDF7] border-b border-[#26221B]/8 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0 touch-pan-x">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-3.5 py-1 rounded-full bg-[#FAF3E7] border border-[#26221B]/10 hover:border-[#0E8C7F] hover:text-[#0E8C7F] text-[#26221B] font-bold transition-all shadow-2xs active:scale-95 font-display"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div ref={messagesContainerRef} className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-[#FAF3E7]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${msg.sender === 'user' ? 'bg-[#F0A32F]' : 'bg-[#0E8C7F]'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-[#26221B]" /> : <Bot className="w-4 h-4 text-[#FFD37A]" />}
                </div>

                <div className={`max-w-[92%] sm:max-w-[88%] space-y-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Text bubble */}
                  <div className={`w-full rounded-[22px] px-3.5 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0E8C7F] text-white rounded-tr-none'
                      : 'bg-[#FFFDF7] text-[#26221B] border border-[#26221B]/8 rounded-tl-none'
                  }`}>
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                    ) : msg.text.trim() === '' && !msg.itinerary ? (
                      /* Loading dots */
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        <div className="flex items-center gap-1 text-[#0E8C7F]">
                          <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce" />
                        </div>
                        <span className="text-[11px] font-medium text-[#6B6355] ml-1.5">
                          {isLoadingItinerary ? 'Đang tải lịch trình...' : 'AI đang tra cứu thực địa...'}
                        </span>
                      </div>
                    ) : (
                      <FormattedChatMessage content={msg.text} isAssistant={msg.sender === 'assistant'} />
                    )}
                    <span className={`block text-[9px] sm:text-[10px] mt-1 ${msg.sender === 'user' ? 'text-[#FAF3E7]/80 text-right' : 'text-[#6B6355]/70'}`}>
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
                    <div className="w-full bg-[#FFFDF7] rounded-[22px] p-3 border border-[#26221B]/8 shadow-xs">
                      <ItineraryPresetPicker onSelect={handlePresetSelect} />
                    </div>
                  )}

                  {/* ── EMBEDDED SPOT CARDS ───────────────────────────────── */}
                  {msg.spots && msg.spots.length > 0 && (
                    <div className="w-full flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin snap-x touch-pan-x">
                      {msg.spots.map((spot, i) => (
                        <div key={`wspot-${msg.id}-${i}`} className="min-w-[210px] max-w-[230px] bg-[#FFFDF7] rounded-2xl p-2.5 border border-[#26221B]/8 flex items-center gap-2.5 shrink-0 snap-start shadow-xs hover:border-[#0E8C7F] transition-all">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {spot.imageUrl && (
                            <img src={spot.imageUrl} alt={spot.name} className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-[#0E8C7F]">
                              <MapPin className="w-2.5 h-2.5 text-[#F0A32F]" />
                              <span className="truncate">{spot.commune}</span>
                            </div>
                            <h4 className="font-display font-bold text-xs text-[#26221B] truncate">{spot.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <a href={getGoogleMapsUrl({ name: spot.name, commune: spot.commune })} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#26221B] bg-[#F0A32F] hover:bg-[#C97F1B] hover:text-white px-2 py-0.5 rounded-full transition-colors min-h-[24px]">
                                <Navigation className="w-2.5 h-2.5" />Maps
                              </a>
                              {spot.id && (
                                <Link href={`/places/${spot.id}`} className="flex items-center gap-1 text-[10px] font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 hover:bg-[#0E8C7F] hover:text-white px-2 py-0.5 rounded-full transition-colors min-h-[24px]">
                                  Xem
                                </Link>
                              )}
                            </div>
                          </div>
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
                          className="px-3.5 py-1.5 rounded-full border border-[#F0A32F]/50 text-[#26221B] bg-[#FFFDF7] hover:bg-[#F0A32F] hover:text-[#26221B] text-xs font-semibold transition-all shadow-2xs active:scale-95 font-display"
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
          <div className="p-3 sm:p-3.5 bg-[#FFFDF7] border-t border-[#26221B]/8 flex items-center gap-2 shrink-0 pb-safe">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về Hồ Tà Pạ, Gà đốt Ô Thum, Chùa Khmer..."
              className="flex-1 px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs sm:text-sm text-[#26221B] focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 bg-[#FAF3E7] font-body"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || isLoadingItinerary || !input.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] disabled:opacity-50 disabled:cursor-not-allowed text-[#26221B] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 min-w-[44px] min-h-[44px] shadow-xs active:scale-95 font-display"
            >
              <Send className="w-4 h-4 text-[#26221B]" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
