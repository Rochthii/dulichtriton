'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Send, Bot, User, Trash2, ArrowLeft,
  MapPin, Navigation
} from 'lucide-react';
import FormattedChatMessage from '@/components/FormattedChatMessage';
import WireDiagramItinerary, { type ItineraryData } from '@/components/WireDiagramItinerary';
import ItineraryPresetPicker from '@/components/ItineraryPresetPicker';
import AppLogo from '@/components/AppLogo';
import { getGoogleMapsUrl } from '@/lib/utils';

interface EmbeddedSpot {
  type?: string;
  id?: string;
  name: string;
  commune: string;
  category: string;
  imageUrl: string;
  rating: number;
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

const SESSION_KEY = 'triton_chat_page_session';
const MAX_STORED_MESSAGES = 30;

function getSafeTime(): string {
  if (typeof window === 'undefined') return '08:00';
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const defaultWelcome: Message = {
  id: '1',
  sender: 'assistant',
  text: 'Xin chào! Tôi là Trợ Lý AI Du Lịch Tri Tôn 2026. Bạn cần tư vấn **lịch trình thực địa**, tìm **quán Gà Đốt Ô Thum ngon nhất**, hay khám phá **chùa Khmer** nào?',
  timestamp: '08:00',
  suggestions: ['Gợi ý tour 1 ngày', 'Gà Đốt Ô Thum quán nào ngon?', 'Cách đi Hồ Tà Pạ mùa nước xanh?', 'Chùa Xvayton có gì đặc sắc?'],
  showPresetPicker: true,
};

export default function ChatbotPageClient() {
  const initialQueryHandledRef = useRef(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultWelcome]);
  const [isMounted, setIsMounted] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    setIsMounted(true);
    const KEY = 'triton_chat_page_session_id';
    const stored = localStorage.getItem(KEY);
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const newId = 'page_session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(KEY, newId);
      sessionIdRef.current = newId;
    }

    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (isMounted && messages.length > 0) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
      } catch { /* ignore */ }
    }
  }, [messages, isMounted]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const presets = [
    'Tour Kinh Điển 1 Ngày',
    'Gà Đốt Ô Thum Quán Chuẩn',
    'Cách Đi Hồ Tà Pạ',
    'Chùa Xvayton Có Gì Hay',
    'Top Homestay Núi Cô Tô'
  ];

  const handlePresetSelect = async (presetSlug: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Xem lịch trình: ${presetSlug}`,
      timestamp: getSafeTime(),
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
            timestamp: getSafeTime(),
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
    } catch { /* fallback to standard query */ }

    setIsLoadingItinerary(false);
    await handleSend(`Lên lịch trình ${presetSlug}`);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const lower = textToSend.toLowerCase();
    const isItinIntent = 
      lower.includes('lịch trình') ||
      lower.includes('tour') ||
      lower.includes('kế hoạch') ||
      lower.includes('1 ngày') ||
      lower.includes('2 ngày') ||
      lower.includes('3 ngày') ||
      lower.includes('2n1đ') ||
      lower.includes('3n2đ') ||
      lower.includes('2d1n') ||
      lower.includes('3d2n') ||
      lower.includes('2n1d') ||
      lower.includes('3n2d') ||
      lower.includes('nửa ngày');

    if (isItinIntent) {
      let matchedSlug = 'kinh-dien-1-ngay';
      if (lower.includes('3 ngày') || lower.includes('3n2đ') || lower.includes('3d2n') || lower.includes('3n2d') || lower.includes('3 ngày 2 đêm')) {
        matchedSlug = 'kham-pha-sau-3n2d';
      } else if (lower.includes('2 ngày') || lower.includes('2n1đ') || lower.includes('2d1n') || lower.includes('2n1d') || lower.includes('2 ngày 1 đêm') || lower.includes('cuối tuần')) {
        matchedSlug = 'toan-canh-2n1d';
      } else if (lower.includes('ẩm thực') || lower.includes('ăn uống') || lower.includes('food')) {
        matchedSlug = 'food-tour-am-thuc-1-ngay-dem';
      } else if (lower.includes('chùa') || lower.includes('tâm linh') || lower.includes('khmer') || lower.includes('hành hương')) {
        matchedSlug = 'tam-linh-hanh-huong-1-ngay';
      } else if (lower.includes('lịch sử') || lower.includes('về nguồn') || lower.includes('nhà mồ') || lower.includes('tức dụp')) {
        matchedSlug = 'lich-su-ve-nguon-1-ngay';
      } else if (lower.includes('sống ảo') || lower.includes('checkin') || lower.includes('chụp ảnh') || lower.includes('cổng trời')) {
        matchedSlug = 'song-ao-checkin-1-ngay';
      } else if (lower.includes('đêm') || lower.includes('tối') || lower.includes('chợ đêm')) {
        matchedSlug = 'tri-ton-ve-dem-cafe-cho-dem';
      } else if (lower.includes('đua bò') || lower.includes('lễ hội')) {
        matchedSlug = 'mua-le-hoi-dua-bo';
      } else if (lower.includes('trekking') || lower.includes('núi') || lower.includes('cô tô')) {
        matchedSlug = 'trekking-cafe-chieu';
      } else if (lower.includes('gia đình') || lower.includes('trẻ nhỏ')) {
        matchedSlug = 'family-weekend-2n1d';
      } else if (lower.includes('nửa ngày') || lower.includes('express')) {
        matchedSlug = 'express-nua-ngay';
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: textToSend,
        timestamp: getSafeTime(),
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
              timestamp: getSafeTime(),
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
      } catch { /* fallback to standard query */ }
      setIsLoadingItinerary(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: getSafeTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      sender: 'assistant',
      text: '',
      timestamp: getSafeTime(),
    };

    setMessages(prev => [...prev, botMsg]);

    try {
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          query: textToSend,
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
            if (event.type === 'token' || event.type === 'text_delta') {
              const delta = event.token || event.delta || '';
              accumulatedText += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId
                    ? { ...m, text: accumulatedText }
                    : m
                )
              );
            } else if (event.type === 'metadata' || event.type === 'places') {
              const rawPlaces = event.places || event.data;
              if (rawPlaces && Array.isArray(rawPlaces)) {
                extractedSpots = rawPlaces.map((p: any) => ({
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
                        suggestions: (event.suggestions && event.suggestions.length > 0) ? event.suggestions : (extractedSuggestions.length > 0 ? extractedSuggestions : m.suggestions),
                      }
                    : m
                )
              );
            }
          } catch { /* ignore stream parse err */ }
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
      timestamp: getSafeTime(),
    }]);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || urlParams.get('prompt') || urlParams.get('question');
    if (q && !initialQueryHandledRef.current) {
      initialQueryHandledRef.current = true;
      void handleSend(q);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAF3E7] text-[#26221B] font-body">
      {/* ── TOP HEADER BAR (Folk-Modern Jade Bar) ──────────────────────── */}
      <header className="bg-[#0E8C7F] text-white px-3 sm:px-6 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-[#0B6B60]">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="p-2 -ml-1 rounded-full text-white hover:bg-[#0B6B60] transition-colors active:scale-95"
            title="Quay lại Trang Chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <AppLogo size="sm" variant="emblem" />

          <div>
            <h1 className="font-display font-extrabold text-sm sm:text-base flex items-center gap-2 leading-none text-[#FFFDF7]">
              <span>Trợ Lý AI Tri Tôn</span>
              <span className="w-2 h-2 rounded-full bg-[#FFD37A] animate-ping" />
            </h1>
            <p className="text-[10px] sm:text-xs text-[#FAF3E7]/80 mt-1 font-medium font-body">
              149 Địa Điểm Đã Xác Minh • 35 Lịch Trình Gợi Ý
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="Xóa lịch sử trò chuyện"
            className="p-2 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors active:scale-95 flex items-center gap-1 text-xs font-bold font-display"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa chat</span>
          </button>
        </div>
      </header>

      {/* ── QUICK PRESET FILTER CHIPS ───────────────────────────────────── */}
      <div className="px-3 py-2 bg-[#FFFDF7] border-b border-[#26221B]/8 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0 touch-pan-x">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            className="px-3.5 py-1.5 rounded-full bg-[#FAF3E7] border border-[#26221B]/10 hover:border-[#0E8C7F] hover:text-[#0E8C7F] text-[#26221B] font-bold transition-all shadow-2xs active:scale-95 shrink-0 font-display"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* ── MESSAGES CHAT STREAM ────────────────────────────────────────── */}
      <main
        ref={messagesContainerRef}
        className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 max-w-4xl w-full mx-auto"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user' ? 'bg-[#F0A32F]' : 'bg-[#0E8C7F]'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-[#26221B]" />
              ) : (
                <Bot className="w-4 h-4 text-[#FFD37A]" />
              )}
            </div>

            <div
              className={`space-y-2 flex flex-col flex-1 min-w-0 ${
                msg.itinerary ? 'w-full max-w-full' : 'max-w-[94%] sm:max-w-[85%]'
              } ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Bubble Text */}
              <div
                className={`w-full rounded-[22px] px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0E8C7F] text-white rounded-tr-none'
                    : 'bg-[#FFFDF7] text-[#26221B] border border-[#26221B]/8 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                ) : msg.text.trim() === '' && !msg.itinerary ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex items-center gap-1 text-[#0E8C7F]">
                      <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#0E8C7F] animate-bounce" />
                    </div>
                    <span className="text-xs font-medium text-[#6B6355]">
                      {isLoadingItinerary ? 'Đang tải sơ đồ lịch trình...' : 'AI đang tra cứu thực địa...'}
                    </span>
                  </div>
                ) : (
                  <FormattedChatMessage
                    content={msg.text}
                    isAssistant={msg.sender === 'assistant'}
                    itinerary={msg.itinerary}
                  />
                )}
                <span
                  className={`block text-[9px] sm:text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-[#FAF3E7]/80 text-right' : 'text-[#6B6355]/70'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Wire Diagram Itinerary */}
              {msg.itinerary && (
                <div className="w-full">
                  <WireDiagramItinerary itinerary={msg.itinerary} />
                </div>
              )}

              {/* Preset Itinerary Picker */}
              {msg.sender === 'assistant' && msg.showPresetPicker && (
                <div className="w-full bg-[#FFFDF7] rounded-[22px] p-3 border border-[#26221B]/8 shadow-xs">
                  <ItineraryPresetPicker onSelect={handlePresetSelect} />
                </div>
              )}

              {/* Embedded Spot Cards */}
              {msg.spots && msg.spots.length > 0 && (
                <div className="w-full flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin snap-x touch-pan-x">
                  {msg.spots.map((spot, i) => (
                    <div
                      key={`spot-${msg.id}-${i}`}
                      className="min-w-[210px] max-w-[230px] bg-[#FFFDF7] rounded-2xl p-2.5 border border-[#26221B]/8 flex items-center gap-2.5 shrink-0 snap-start shadow-xs hover:border-[#0E8C7F] transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {spot.imageUrl && (
                        <img
                          src={spot.imageUrl}
                          alt={spot.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#0E8C7F]">
                          <MapPin className="w-2.5 h-2.5 text-[#F0A32F]" />
                          <span className="truncate">{spot.commune}</span>
                        </div>
                        <h4 className="font-bold text-xs text-[#26221B] truncate font-display">{spot.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <a
                            href={getGoogleMapsUrl({ name: spot.name, commune: spot.commune })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-[#26221B] bg-[#F0A32F] hover:bg-[#C97F1B] hover:text-white px-2 py-0.5 rounded-full transition-colors min-h-[24px]"
                          >
                            <Navigation className="w-2.5 h-2.5" />Maps
                          </a>
                          {spot.id && (
                            <Link
                              href={`/places/${spot.id}`}
                              className="flex items-center gap-1 text-[10px] font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 hover:bg-[#0E8C7F] hover:text-white px-2 py-0.5 rounded-full transition-colors min-h-[24px]"
                            >
                              Xem
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion Chips */}
              {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={`sug-${msg.id}-${i}`}
                      onClick={() => handleSend(sug)}
                      className="px-3.5 py-1.5 rounded-full border border-[#F0A32F]/50 text-[#26221B] bg-[#FFFDF7] hover:bg-[#F0A32F] hover:text-[#26221B] text-xs font-bold transition-all shadow-2xs active:scale-95 font-display"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* ── BOTTOM INPUT BAR (Folk-Modern Safe Area) ─────────────────────── */}
      <footer className="p-3 sm:p-4 bg-[#FFFDF7] border-t border-[#26221B]/8 shrink-0 pb-safe">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Khmer..."
            className="flex-1 px-4 py-3 rounded-full border border-[#26221B]/15 text-xs sm:text-sm text-[#26221B] focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 bg-[#FAF3E7] font-body"
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || isLoadingItinerary || !input.trim()}
            className="px-5 py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] disabled:opacity-50 disabled:cursor-not-allowed text-[#26221B] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 min-w-[54px] min-h-[44px] shadow-xs active:scale-95 font-display"
          >
            <Send className="w-4 h-4 text-[#26221B]" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
