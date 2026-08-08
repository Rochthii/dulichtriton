'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, MapPin, Navigation, Play, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import VideoModal, { VideoItem } from '@/components/VideoModal';
import { getGoogleMapsUrl } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotCard {
  id?: string;
  name: string;
  commune: string;
  category: string;
  imageUrl: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

interface VideoCard {
  title: string;
  views: string;
  imageUrl: string;
  embedUrl?: string;
  creator?: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  spots?: SpotCard[];
  videos?: VideoCard[];
  suggestions?: string[];
  timestamp: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Du Lịch Tri Tôn. Hãy hỏi tôi về địa điểm, ẩm thực đặc sản, homestay, hay lịch trình tham quan Bảy Núi An Giang!',
      suggestions: ['Gợi ý tour 2N1Đ Bảy Núi', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Homestay view núi Cô Tô', 'Chùa Khmer nổi tiếng nhất'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Internal container auto-scroll to bottom on new message without scrolling browser window
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, session_id: 'chatbot_page' }),
      });

      const data = await res.json();

      // Map spots
      const spots: SpotCard[] = (data.ui_components || []).slice(0, 4).map((c: SpotCard) => ({
        id: c.id,
        name: c.name,
        commune: c.commune,
        category: c.category,
        imageUrl: c.imageUrl || '/images/tiktok/ho_ta_pa.jpg',
        rating: c.rating || 4.5,
        latitude: c.latitude,
        longitude: c.longitude,
      }));

      // Map videos
      const videos: VideoCard[] = (data.videos || []).slice(0, 3).map((v: VideoCard) => ({
        title: v.title,
        views: v.views,
        imageUrl: v.imageUrl || '',
        embedUrl: v.embedUrl,
        creator: v.creator,
      }));

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.text_response || 'Xin lỗi, tôi không tìm thấy kết quả phù hợp.',
        spots: spots.length > 0 ? spots : undefined,
        videos: videos.length > 0 ? videos : undefined,
        suggestions: data.suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Xin lỗi, không thể kết nối với server AI. Vui lòng kiểm tra kết nối và thử lại!',
          suggestions: ['Thử lại câu hỏi', 'Gợi ý tour 2N1Đ'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openVideoModal = (video: VideoCard) => {
    const parsedViews = parseInt(video.views.replace(/[^0-9]/g, '')) * 1000 || 10000;
    setActiveVideo({
      id: Date.now().toString(),
      title: video.title,
      embed_url: video.embedUrl || '',
      thumbnail_url: video.imageUrl,
      video_url: video.embedUrl || '',
      platform: 'tiktok',
      author_name: video.creator || 'TikTok Creator',
      view_count: parsedViews,
      hashtags: ['#triton', '#review'],
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0F2D24] via-[#1B4D3E] to-[#143B2F] flex flex-col overflow-hidden">

      {/* Hero Header */}
      <div className="px-4 pt-6 pb-4 text-center border-b border-emerald-800/40 shrink-0">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#143B2F] border border-[#D99B26] flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-[#D99B26]" />
          </div>
          <div className="text-left">
            <h1 className="text-white font-bold text-base leading-tight">AI Chatbot Du Lịch Tri Tôn</h1>
            <p className="text-emerald-300 text-[11px]">RAG Engine — 95+ địa điểm Supabase DB Live</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </div>
        <p className="text-emerald-200 text-xs max-w-lg mx-auto">
          Trò chuyện cùng trợ lý AI để khám phá địa điểm, đặc sản và lịch trình tại vùng Bảy Núi An Giang
        </p>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full scrollbar-none">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user' ? 'bg-[#D99B26]' : 'bg-[#143B2F] border border-[#D99B26]/40'
              }`}
            >
              {msg.role === 'user'
                ? <User className="w-4 h-4 text-slate-900" />
                : <Bot className="w-4 h-4 text-[#D99B26]" />
              }
            </div>

            {/* Content */}
            <div className={`max-w-[85%] space-y-3 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

              {/* Text Bubble */}
              <div
                className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1B4D3E] text-white rounded-tr-none border border-emerald-700'
                    : 'bg-white/95 text-slate-800 border border-white/20 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`block text-[10px] mt-2 ${msg.role === 'user' ? 'text-emerald-300 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {/* Spot Cards Grid */}
              {msg.spots && msg.spots.length > 0 && (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.spots.map((spot, i) => (
                    <div
                      key={`spot-${msg.id}-${i}`}
                      className="bg-white/95 rounded-xl border border-white/20 p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-0.5">
                          <MapPin className="w-3 h-3 text-[#D99B26]" />
                          <span className="truncate">{spot.commune}</span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 truncate">{spot.name}</h3>
                        <span className="text-[10px] text-slate-500 truncate block">{spot.category}</span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <a
                            href={getGoogleMapsUrl(spot.name, spot.commune)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-semibold text-[#1B4D3E] hover:text-white bg-emerald-50 hover:bg-[#1B4D3E] px-2 py-0.5 rounded-full transition-colors"
                            title="Chỉ đường Google Maps"
                          >
                            <Navigation className="w-3 h-3" />
                            Bản đồ
                          </a>
                          {spot.id && (
                            <Link
                              href={`/places/${spot.id}`}
                              className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 px-2 py-0.5 rounded-full transition-colors"
                            >
                              <ChevronRight className="w-3 h-3" />
                              Chi tiết
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Cards */}
              {msg.videos && msg.videos.length > 0 && (
                <div className="w-full space-y-2">
                  {msg.videos.map((video, i) => (
                    <button
                      key={`video-${msg.id}-${i}`}
                      onClick={() => openVideoModal(video)}
                      className="w-full bg-slate-900/80 text-white rounded-xl p-3 flex items-center gap-3 border border-slate-700 hover:border-[#D99B26] hover:bg-slate-800 transition-all text-left group"
                    >
                      <div className="w-14 h-16 bg-slate-800 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.imageUrl}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <Play className="w-5 h-5 text-white absolute z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-rose-400 font-bold uppercase block mb-0.5">Video Review</span>
                        <h4 className="font-bold text-xs text-white truncate">{video.title}</h4>
                        {video.creator && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">@{video.creator}</span>
                        )}
                        <span className="text-[10px] text-slate-500 block">{video.views}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestion Chips */}
              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, i) => (
                    <button
                      key={`sug-${msg.id}-${i}`}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1 rounded-full border border-[#D99B26]/40 text-[#D99B26] text-[11px] font-medium hover:bg-[#D99B26] hover:text-slate-900 transition-all bg-[#D99B26]/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#143B2F] border border-[#D99B26]/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#D99B26] animate-pulse" />
            </div>
            <div className="bg-white/95 rounded-2xl rounded-tl-none px-5 py-3.5 text-sm text-slate-500 border border-white/20 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1 text-xs">RAG Engine đang truy vấn Supabase...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-[#0F2D24]/95 backdrop-blur-sm border-t border-emerald-800/40 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Hỏi AI về Hồ Tà Pạ, Gà Đốt Ô Thum, Lịch trình 2N1Đ..."
            disabled={isLoading}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-emerald-400/60 focus:outline-none focus:border-[#D99B26]/60 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-3.5 rounded-2xl bg-[#D99B26] hover:bg-[#C48A22] disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold flex items-center gap-2 transition-colors shadow-lg shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Gửi</span>
          </button>
        </div>
        <p className="text-center text-emerald-500/60 text-[10px] mt-2">
          AI có thể mắc lỗi. Kiểm tra thực tế trước khi lên đường.
        </p>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
