'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Sparkles, X, Send, Bot, User,
  MapPin, Navigation, Maximize2, Minimize2, Trash2, ChevronRight
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/utils';
import VideoChatCard from './VideoChatCard';
import FormattedChatMessage from './FormattedChatMessage';

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
}

const SESSION_KEY = 'triton_chat_session';
const MAX_STORED_MESSAGES = 30;

const defaultWelcome: Message = {
  id: '1',
  sender: 'assistant',
  text: 'Xin chào! Tôi là Trợ lý AI Du Lịch Tri Tôn. Bạn cần tư vấn địa điểm danh thắng, đặc sản Gà Đốt Ô Thum hay lập tour du lịch 2 ngày 1 đêm?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: ['Gợi ý tour 2N1Đ Bảy Núi', 'Ăn Gà Đốt ở đâu ngon?', 'Chùa Khmer nào đẹp nhất?'],
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Load from localStorage on first render
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [defaultWelcome];
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore parse errors
    }
    return [defaultWelcome];
  });

  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // Keep only last MAX_STORED_MESSAGES to avoid quota issues
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
    } catch {
      // Quota exceeded — silently ignore
    }
  }, [messages]);

  // Track unread AI messages when widget is closed
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const presets = [
    'Gợi ý tour 2N1Đ Bảy Núi',
    'Ăn Gà Đốt Ô Thum ở đâu ngon?',
    'Đường lên Chùa Tà Pạ',
    'Homestay view núi Cô Tô'
  ];

  // Auto-scroll inside chat container without scrolling browser window
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, session_id: 'widget_session' })
      });

      const data = await response.json();

      // Map ui_components → spots
      const spots: EmbeddedSpot[] = (data.ui_components || []).slice(0, 3).map((c: EmbeddedSpot) => ({
        id: c.id,
        name: c.name,
        commune: c.commune,
        category: c.category,
        imageUrl: c.imageUrl || '',
        rating: c.rating || 4.5,
        latitude: c.latitude,
        longitude: c.longitude,
      }));

      // Map videos
      const videos: EmbeddedVideo[] = (data.videos || []).slice(0, 2).map((v: EmbeddedVideo) => ({
        title: v.title,
        views: v.views,
        imageUrl: v.imageUrl || '',
        embedUrl: v.embedUrl,
        creator: v.creator,
      }));

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text_response || 'Xin lỗi, tôi chưa hiểu ý bạn.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spots: spots.length > 0 ? spots : undefined,
        videos: videos.length > 0 ? videos : undefined,
        suggestions: data.suggestions || [],
      };
      setMessages(prev => [...prev, botMsg]);
      // Increment unread counter if chat widget is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Xin lỗi, server AI hiện đang bận hoặc chưa khởi động. Vui lòng thử lại sau!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Thử lại câu hỏi', 'Gợi ý tour 2N1Đ'],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    const freshMsg: Message = {
      id: Date.now().toString(),
      sender: 'assistant',
      text: 'Đã làm mới cuộc hội thoại. Bạn muốn tìm thông tin gì ở Tri Tôn?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Gợi ý tour 2N1Đ', 'Ăn gì ở Tri Tôn?', 'Homestay đẹp'],
    };
    setMessages([freshMsg]);
    setUnreadCount(0);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3.5 rounded-full bg-[#1B4D3E] hover:bg-[#143B2F] text-white shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group border border-[#D99B26]/30"
        aria-label="Open AI Chatbot"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-white" />
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26] absolute -top-1 -right-1 animate-pulse" />
          {/* Unread badge */}
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

      {/* Expandable Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:w-[720px] sm:h-[680px]'
              : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[560px]'
          }`}
        >

          {/* Header Bar */}
          <div className="bg-[#1B4D3E] text-white p-4 flex items-center justify-between border-b border-emerald-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#143B2F] border border-[#D99B26] flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none flex items-center gap-2">
                  TRỢ LÝ AI RAG TRI TÔN
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-emerald-200 mt-1">95+ Địa điểm Supabase DB Live</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Xóa lịch sử chat"
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                className="hidden sm:block p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-[#1B4D3E] hover:text-[#1B4D3E] text-slate-700 font-medium transition-all shadow-sm hover:scale-105"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                    msg.sender === 'user' ? 'bg-[#D99B26]' : 'bg-[#143B2F]'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-3.5 h-3.5 text-slate-900" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-[#D99B26]" />
                  )}
                </div>

                {/* Bubble & Cards */}
                <div className={`max-w-[85%] space-y-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#1B4D3E] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                    ) : (
                      <FormattedChatMessage content={msg.text} />
                    )}
                    <span
                      className={`block text-[9px] mt-1 ${
                        msg.sender === 'user' ? 'text-emerald-300 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Embedded Spot Cards */}
                  {msg.spots && msg.spots.length > 0 && (
                    <div className="w-full space-y-1.5">
                      {msg.spots.map((spot, i) => (
                        <div
                          key={`wspot-${msg.id}-${i}`}
                          className="bg-white rounded-xl border border-slate-200 p-2.5 flex items-center gap-2.5 shadow-2xs hover:shadow-xs transition-all group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={spot.imageUrl}
                            alt={spot.name}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                              <MapPin className="w-2.5 h-2.5 text-[#D99B26]" />
                              <span className="truncate">{spot.commune}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 truncate">{spot.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <a
                                href={getGoogleMapsUrl(spot.name, spot.commune)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[9px] font-bold text-[#1B4D3E] bg-emerald-50 hover:bg-[#1B4D3E] hover:text-white px-2 py-0.5 rounded-md transition-colors"
                              >
                                <Navigation className="w-2.5 h-2.5" />
                                Maps
                              </a>
                              {spot.id && (
                                <Link
                                  href={`/places/${spot.id}`}
                                  className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white px-2 py-0.5 rounded-md transition-colors"
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

                  {/* Embedded Video Cards */}
                  {msg.videos && msg.videos.length > 0 && (
                    <div className="w-full space-y-1.5">
                      {msg.videos.map((video, i) => (
                        <VideoChatCard
                          key={`wvid-${msg.id}-${i}`}
                          title={video.title}
                          views={video.views}
                          imageUrl={video.imageUrl}
                          embedUrl={video.embedUrl}
                        />
                      ))}
                    </div>
                  )}

                  {/* Suggestions Chips */}
                  {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={`wsug-${msg.id}-${i}`}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-0.5 rounded-full border border-[#D99B26]/40 text-[#1B4D3E] bg-amber-50/80 hover:bg-[#D99B26] hover:text-slate-900 text-[10px] font-medium transition-all"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-max shadow-xs">
                <Bot className="w-4 h-4 text-[#1B4D3E] animate-bounce" />
                <span>RAG Engine đang truy vấn CSDL Supabase...</span>
              </div>
            )}
          </div>

          {/* Input Form Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về Hồ Tà Pạ, Gà đốt Ô Thum, Chùa Khmer..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
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
