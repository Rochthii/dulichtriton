'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Send, Bot, User, Sparkles, Trash2, ArrowLeft,
  Compass, MapPin, Navigation, Play, RefreshCw, Flame, ExternalLink
} from 'lucide-react';
import FormattedChatMessage from '@/components/FormattedChatMessage';
import WireDiagramItinerary, { type ItineraryData } from '@/components/WireDiagramItinerary';
import ItineraryPresetPicker from '@/components/ItineraryPresetPicker';
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

const defaultWelcome: Message = {
  id: '1',
  sender: 'assistant',
  text: 'Xin chào! Tôi là Trợ Lý AI Du Lịch Tri Tôn 2026. Bạn cần tư vấn **lịch trình thực địa**, tìm **quán Gà Đốt Ô Thum ngon nhất**, hay khám phá **chùa Khmer** nào?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: ['Gợi ý tour 1 ngày', 'Gà Đốt Ô Thum quán nào ngon?', 'Cách đi Hồ Tà Pạ mùa nước xanh?', 'Chùa Xvayton có gì đặc sắc?'],
  showPresetPicker: true,
};

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    const KEY = 'triton_chat_page_session_id';
    const stored = localStorage.getItem(KEY);
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const newId = 'page_session_' + Math.random().toString(36).substring(2, 9);
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
    '🔥 Tour Kinh Điển 1 Ngày',
    '🗺️ Toàn Cảnh Bảy Núi 2N1Đ',
    '🍗 Quán Gà Đốt Ô Thum ngon',
    '🍲 Cháo Bò Trái Trúc chuẩn vị',
    '📸 Điểm check-in đẹp nhất',
  ];

  // Handle Preset Select
  const handlePresetSelect = async (slug: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const botPlaceholderId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: `Xem sơ đồ lịch trình: ${slug}`,
        timestamp: now,
      },
      {
        id: botPlaceholderId,
        sender: 'assistant',
        text: 'Đang nạp sơ đồ lịch trình thực địa...',
        timestamp: now,
      },
    ]);

    setIsLoadingItinerary(true);

    try {
      const res = await fetch(`/api/v1/chat/itinerary?slug=${slug}`);
      if (!res.ok) throw new Error('Failed to fetch itinerary');
      const data = await res.json();

      if (data.itinerary) {
        setMessages(prev => prev.map(m =>
          m.id === botPlaceholderId
            ? {
                ...m,
                text: `Dưới đây là sơ đồ nối dây chi tiết cho **${data.itinerary.title}** (${data.itinerary.duration}):`,
                itinerary: data.itinerary,
                showPresetPicker: false,
              }
            : m
        ));
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === botPlaceholderId
          ? {
              ...m,
              text: 'Không thể tải lịch trình này lúc này. Bạn có thể thử lại hoặc chọn lịch trình khác!',
            }
          : m
      ));
    } finally {
      setIsLoadingItinerary(false);
    }
  };

  // Handle Send Message (Streaming)
  const handleSend = async (customText?: string) => {
    const userQuery = (customText || input).trim();
    if (!userQuery || isTyping || isLoadingItinerary) return;

    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const botMessageId = (Date.now() + 1).toString();

    const historyForApi = messages
      .filter(m => m.text.trim())
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: userQuery,
        timestamp: now,
      },
      {
        id: botMessageId,
        sender: 'assistant',
        text: '',
        timestamp: now,
      },
    ]);

    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          history: historyForApi,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) throw new Error('Stream request failed');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let accumulatedText = '';
      let receivedPlaces: EmbeddedSpot[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') break;

          try {
            const evt = JSON.parse(jsonStr);

            if (evt.type === 'places' && Array.isArray(evt.data)) {
              receivedPlaces = evt.data.map((p: any) => ({
                id: p.id || p.slug,
                name: p.name,
                commune: p.commune || 'Tri Tôn',
                category: p.category || 'Điểm đến',
                imageUrl: p.image_url || p.imageUrl || '',
                rating: p.rating || 4.8,
              }));
              setMessages(prev => prev.map(m =>
                m.id === botMessageId
                  ? { ...m, spots: receivedPlaces }
                  : m
              ));
            } else if (evt.type === 'text') {
              accumulatedText += evt.data;
              setMessages(prev => prev.map(m =>
                m.id === botMessageId
                  ? { ...m, text: accumulatedText }
                  : m
              ));
            } else if (evt.type === 'itinerary' && evt.data) {
              setMessages(prev => prev.map(m =>
                m.id === botMessageId
                  ? { ...m, itinerary: evt.data, showPresetPicker: false }
                  : m
              ));
            } else if (evt.type === 'suggestions' && Array.isArray(evt.data)) {
              setMessages(prev => prev.map(m =>
                m.id === botMessageId
                  ? { ...m, suggestions: evt.data }
                  : m
              ));
            }
          } catch { /* ignore JSON chunk errors */ }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => prev.map(m =>
        m.id === botMessageId
          ? {
              ...m,
              text: 'Dạ, hiện tại đường truyền đang bận một chút. Bạn vui lòng thử đặt lại câu hỏi nhé!',
            }
          : m
      ));
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
    <div className="flex flex-col h-[100dvh] bg-[#F8F9FA] text-slate-900 font-sans">
      {/* ── TOP HEADER BAR (Mobile First) ──────────────────────────────── */}
      <header className="bg-[#1B4D3E] text-white px-3 sm:px-6 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="p-2 -ml-1 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors active:scale-95"
            title="Quay lại Trang Chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-9 h-9 rounded-xl bg-[#143B2F] border border-[#D99B26] flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5 text-[#D99B26]" />
          </div>

          <div>
            <h1 className="font-black text-sm sm:text-base flex items-center gap-2 leading-none">
              <span>Trợ Lý AI Tri Tôn</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-200 mt-1 font-medium">
              Live Internet • 82 Địa Điểm • 35 Lịch Trình Thực Địa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="Xóa lịch sử trò chuyện"
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors active:scale-95 flex items-center gap-1 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa chat</span>
          </button>
        </div>
      </header>

      {/* ── QUICK PRESET FILTER CHIPS ───────────────────────────────────── */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0 touch-pan-x">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            className="px-3.5 py-1.5 rounded-full bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] hover:text-[#1B4D3E] text-slate-700 font-bold transition-all shadow-2xs active:scale-95 shrink-0"
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
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user' ? 'bg-[#D99B26]' : 'bg-[#143B2F]'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-slate-900" />
              ) : (
                <Bot className="w-4 h-4 text-[#D99B26]" />
              )}
            </div>

            <div
              className={`max-w-[94%] sm:max-w-[85%] space-y-2 flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Bubble Text */}
              <div
                className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1B4D3E] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                ) : msg.text.trim() === '' && !msg.itinerary ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex items-center gap-1 text-[#1B4D3E]">
                      <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#1B4D3E] animate-bounce" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {isLoadingItinerary ? 'Đang tải sơ đồ lịch trình...' : 'AI đang tra cứu thực địa...'}
                    </span>
                  </div>
                ) : (
                  <FormattedChatMessage content={msg.text} isAssistant={msg.sender === 'assistant'} />
                )}
                <span
                  className={`block text-[9px] sm:text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-emerald-300 text-right' : 'text-slate-400'
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
                <div className="w-full bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
                  <ItineraryPresetPicker onSelect={handlePresetSelect} />
                </div>
              )}

              {/* Embedded Spot Cards */}
              {msg.spots && msg.spots.length > 0 && (
                <div className="w-full flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin snap-x touch-pan-x">
                  {msg.spots.map((spot, i) => (
                    <div
                      key={`spot-${msg.id}-${i}`}
                      className="min-w-[210px] max-w-[230px] bg-white rounded-2xl p-2.5 border border-slate-200 flex items-center gap-2.5 shrink-0 snap-start shadow-xs hover:border-[#1B4D3E] transition-all"
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
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                          <MapPin className="w-2.5 h-2.5 text-[#D99B26]" />
                          <span className="truncate">{spot.commune}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{spot.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <a
                            href={getGoogleMapsUrl({ name: spot.name, commune: spot.commune })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-[#1B4D3E] bg-emerald-50 hover:bg-[#1B4D3E] hover:text-white px-2 py-0.5 rounded-lg transition-colors min-h-[24px]"
                          >
                            <Navigation className="w-2.5 h-2.5" />Maps
                          </a>
                          {spot.id && (
                            <Link
                              href={`/places/${spot.id}`}
                              className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-600 hover:text-white px-2 py-0.5 rounded-lg transition-colors min-h-[24px]"
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
                      className="px-3 py-1.5 rounded-full border border-[#D99B26]/50 text-[#1B4D3E] bg-amber-50/80 hover:bg-[#D99B26] hover:text-slate-950 text-xs font-bold transition-all shadow-2xs active:scale-95"
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

      {/* ── BOTTOM INPUT BAR (Mobile Keyboard Safe) ─────────────────────── */}
      <footer className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 pb-safe">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Khmer..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/20 bg-[#F8F9FA]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || isLoadingItinerary || !input.trim()}
            className="px-4 py-3 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 min-w-[48px] min-h-[44px] shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4 text-[#D99B26]" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
