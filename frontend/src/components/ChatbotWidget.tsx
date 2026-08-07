'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Sparkles, X, Send, Bot, User, 
  MapPin, Play, Navigation, Maximize2, Minimize2, Trash2, ArrowRight
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/utils';

interface EmbeddedSpot {
  name: string;
  commune: string;
  category: string;
  imageUrl: string;
  rating: number;
}

interface EmbeddedVideo {
  title: string;
  views: string;
  imageUrl: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  spot?: EmbeddedSpot;
  video?: EmbeddedVideo;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Du Lịch Tri Tôn. Bạn cần tư vấn địa điểm danh thắng, đặc sản Gà Đốt Ô Thum hay lập tour du lịch 2 ngày 1 đêm?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const presets = [
    'Gợi ý tour 2N1Đ Bảy Núi',
    'Ăn Gà Đốt Ô Thum ở đâu ngon?',
    'Đường lên Chùa Tà Pạ',
    'Homestay view núi Cô Tô'
  ];

  const handleSend = (queryText?: string) => {
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

    // Simulate AI RAG Engine Stream Response
    setTimeout(() => {
      let replyText = 'Tôi đã tra cứu CSDL Supabase 106 địa điểm Tri Tôn cho câu hỏi của bạn.';
      let spotEmbed: EmbeddedSpot | undefined = undefined;
      let videoEmbed: EmbeddedVideo | undefined = undefined;

      const lower = textToSend.toLowerCase();

      if (lower.includes('lịch trình') || lower.includes('tour')) {
        replyText = 'Lộ trình 2 ngày 1 đêm tối ưu:\n• Ngày 1: Sáng đón bình minh Hồ Tà Pạ & Chùa Tà Pạ (Xã Núi Tô). Trưa ăn Gà Đốt lá chúc Ô Thum (Xã Ô Lâm). Chiều check-in Cổng Trời Koh Kas (Xã Chau Lăng).\n• Ngày 2: Chinh phục Di tích Đồi Tức Dụp (Xã An Tức) & mua sắm đặc sản bánh bò thốt nốt tại Thị trấn Tri Tôn.';
        spotEmbed = {
          name: 'Hồ Tà Pạ',
          commune: 'Xã Núi Tô',
          category: 'Danh thắng Thiên nhiên',
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
          rating: 4.9
        };
      } else if (lower.includes('gà đốt') || lower.includes('ăn')) {
        replyText = 'Quán Gà Đốt Ô Thum nổi tiếng nhất tập trung tại lòng Hồ Ô Thum (Xã Ô Lâm, Tri Tôn). Gà thả vườn được đốt trực tiếp với lá chúc rừng Bảy Núi nồng nàn. Nên đặt bàn trước 45 phút để không phải chờ!';
        spotEmbed = {
          name: 'Quán Gà Đốt Ô Thum Siêu Ngon',
          commune: 'Xã Ô Lâm',
          category: 'Ẩm thực & Quán ăn',
          imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop',
          rating: 4.8
        };
        videoEmbed = {
          title: 'Review Gà Đốt Ô Thum Lá Chúc Chuẩn Vị Bảy Núi',
          views: '28.9K lượt xem',
          imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop'
        };
      } else if (lower.includes('tà pạ') || lower.includes('chùa')) {
        replyText = 'Chùa Tà Pạ và Hồ Tà Pạ nằm trên ngọn núi Tà Pạ (Xã Núi Tô, Tri Tôn). Đường bê tông lên chùa phẳng đẹp, xe máy và ô tô di chuyển an toàn. Chùa xây theo kiến trúc Phật giáo Nam tông Khmer vô cùng nguy nga.';
        spotEmbed = {
          name: 'Chùa Tà Pạ',
          commune: 'Xã Núi Tô',
          category: 'Chùa Khmer & Di tích',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
          rating: 4.9
        };
      } else if (lower.includes('homestay') || lower.includes('ở')) {
        replyText = 'Danh sách Homestay có view Núi Cô Tô và cánh đồng thốt nốt đẹp nhất tập trung tại Xã Núi Tô và Thị trấn Tri Tôn. Giá chỉ từ 350.000đ/đêm có sân nướng BBQ.';
        spotEmbed = {
          name: 'Cô Tô Mountain Homestay',
          commune: 'Xã Núi Tô',
          category: 'Homestay & Lưu trú',
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
          rating: 4.7
        };
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spot: spotEmbed,
        video: videoEmbed,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'Đã làm mới cuộc hội thoại. Bạn muốn tìm thông tin gì ở Tri Tôn?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
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
              ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:w-[680px] sm:h-[650px]'
              : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[540px]'
          }`}
        >
          
          {/* Header Bar */}
          <div className="bg-[#1B4D3E] text-white p-4 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#143B2F] border border-[#D99B26] flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none flex items-center gap-2">
                  TRỢ LÝ AI RAG TRI TÔN
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-emerald-200 mt-1">106 Địa điểm Supabase DB Live</p>
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
                title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
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
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap scrollbar-none">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-[#1B4D3E] hover:text-[#1B4D3E] text-slate-700 font-medium transition-all shadow-2xs hover:scale-105"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#D99B26] text-slate-900'
                      : 'bg-[#1B4D3E] text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5 text-[#D99B26]" />}
                </div>

                <div className={`max-w-[85%] space-y-2`}>
                  {/* Text Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#1B4D3E] text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* EMBEDDED PLACE CARD CHIP */}
                  {msg.spot && (
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-[#1B4D3E] transition-all flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.spot.imageUrl}
                        alt={msg.spot.name}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#1B4D3E]">
                          <MapPin className="w-3 h-3 text-[#D99B26]" />
                          <span>{msg.spot.commune}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{msg.spot.name}</h4>
                        <span className="text-[10px] text-slate-500 block truncate">{msg.spot.category}</span>
                      </div>
                      <a
                        href={getGoogleMapsUrl(msg.spot.name, msg.spot.commune)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors shrink-0"
                        title="Mở Google Maps"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* EMBEDDED TIKTOK SHORTS CARD */}
                  {msg.video && (
                    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xs flex items-center gap-3 border border-slate-800">
                      <div className="w-12 h-14 bg-slate-800 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.video.imageUrl} alt={msg.video.title} className="w-full h-full object-cover opacity-60" />
                        <Play className="w-5 h-5 text-white absolute z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-rose-400 font-bold uppercase block">TikTok Shorts Review</span>
                        <h5 className="font-bold text-xs text-white truncate">{msg.video.title}</h5>
                        <span className="text-[10px] text-slate-400 block">{msg.video.views}</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-max shadow-2xs">
                <Bot className="w-4 h-4 text-[#1B4D3E] animate-bounce" />
                <span>RAG Engine đang truy vấn CSDL Supabase...</span>
              </div>
            )}
          </div>

          {/* Input Form Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
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
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
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

