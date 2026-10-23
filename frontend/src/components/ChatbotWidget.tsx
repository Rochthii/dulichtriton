'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Sparkles, X, Send, Bot, User,
  MapPin, Navigation, Maximize2, Minimize2, Trash2,
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/utils';
import FormattedChatMessage from './FormattedChatMessage';
import WireDiagramItinerary, { type ItineraryData } from './WireDiagramItinerary';
import ItineraryPresetPicker from './ItineraryPresetPicker';
import AppLogo from './AppLogo';
import { generateSessionId } from '@/lib/sessionIdentifierContract';
import { useChatPrivacy } from '@/hooks/useChatPrivacy';
import { ChatConsentBadge, ChatConsentNotice } from '@/components/ChatConsentControls';
import { useDialogFocus } from '@/hooks/useDialogFocus';

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
  timestamp: '08:00',
  suggestions: ['Gợi ý tour 1 ngày', 'Ăn Gà Đốt ở đâu ngon?', 'Chùa Khmer nào đẹp nhất?'],
  showPresetPicker: true,
};

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dialogRef = useDialogFocus(isOpen && pathname !== '/chatbot' && pathname !== '/chat' && !pathname.startsWith('/admin'), () => setIsOpen(false));
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultWelcome]);
  const [isMounted, setIsMounted] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { chatConsent, consentRef, privacyNotice, sessionIdRef, sessionTokenRef,
    handleSetConsent, updateSessionToken, beginRequest, createRequest, retryDeletion, hasPendingDeletion } = useChatPrivacy(
    SESSION_KEY, 'triton_widget_session_id', 'triton_widget_session_token', () => {
      setMessages([defaultWelcome]);
      setIsTyping(false);
      setIsLoadingItinerary(false);
    });
  const prePingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPingedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    if (consentRef.current !== 'granted') return;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch { /* ignore */ }
  }, [consentRef]);

  useEffect(() => {
    if (isMounted && consentRef.current === 'granted' && messages.length > 0) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
      } catch { /* storage unavailable */ }
    }
  }, [messages, isMounted, chatConsent, consentRef]);

  // WCAG 2.1.2: No Keyboard Trap — Đóng modal bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendRef = useRef<((text?: string) => Promise<void>) | null>(null);

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const q = customEvent.detail?.query?.trim();
      setIsOpen(true);
      if (q) {
        setTimeout(() => {
          if (handleSendRef.current) {
            handleSendRef.current(q);
          }
        }, 150);
      }
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


  const presets = [
    '🧭 27 Lịch Trình',
    'Tour 1 Ngày',
    'Gà Đốt Ô Thum',
    'Hồ Tà Pạ',
    'Chùa Xvayton',
    'Homestay Đẹp'
  ];

  const handleOpenPresetPicker = () => {
    const pickerMsg: Message = {
      id: Date.now().toString(),
      sender: 'assistant',
      text: 'Dưới đây là danh sách **27 Lịch trình Khép Vòng Núi Tri Tôn** đã được tối ưu sẵn cự ly Kilomet thực địa. Mời Bạn bấm chọn cung đường phù hợp:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showPresetPicker: true,
      suggestions: ['Gợi ý tour 1 ngày', 'Quán Gà Đốt Ô Thum', 'Chùa Xvayton'],
    };
    setMessages(prev => [...prev, pickerMsg]);
  };

  const handlePresetSelect = async (presetSlug: string, presetTitle?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: presetTitle ? `Xem lịch trình: ${presetTitle}` : `Xem lịch trình: ${presetSlug}`,
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
    await handleSend(`Lên lịch trình ${presetTitle || presetSlug}`);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;
    const request = beginRequest();

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMsg]);
      if (!customText) setInput('');
      setIsTyping(true);
      setIsLoadingItinerary(true);

      try {
        const res = await fetch(`/api/v1/chat/itinerary?slug=${matchedSlug}`, { signal: request.signal });
        if (res.ok) {
          const data = await res.json();
          if (!request.isCurrent()) return;
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
      if (!request.isCurrent()) return;
      setIsLoadingItinerary(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!isItinIntent) setMessages(prev => [...prev, userMsg]);
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
        ...createRequest(textToSend, messages.slice(-6)), signal: request.signal,
      });
      if (!request.isCurrent()) return;

      const tokenHeader = res.headers?.get('x-chat-session-token');
      if (tokenHeader) updateSessionToken(tokenHeader, request.revision);


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
        if (!request.isCurrent()) { await reader.cancel(); return; }
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
          } catch { /* ignore parse error */ }
        }
      }
    } catch {
      if (!request.isCurrent()) return;
      try {
        const fallbackRes = await fetch('/api/v1/chat/query', {
          ...createRequest(textToSend, messages.slice(-6)), signal: request.signal,
        });
        if (!request.isCurrent()) return;
        if (!fallbackRes.ok) throw new Error('Fallback request failed');

        const fbToken = fallbackRes.headers?.get('x-chat-session-token');
        if (fbToken) updateSessionToken(fbToken, request.revision);

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (!request.isCurrent()) return;
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: data.text_response || data.answer || data.text || 'Tôi đã nhận được thông tin nhưng chưa thể phản hồi ngay.',
                    suggestions: data.suggestions || ['Khám phá Tà Pạ', 'Gà Đốt Ô Thum', 'Lịch trình 1 ngày'],
                  }
                : m
            )
          );
        }
      } catch {
        if (!request.isCurrent()) return;
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
      if (request.isCurrent()) setIsTyping(false);
    }
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleClearHistory = async () => {
    const clearRequest = beginRequest();
    setIsTyping(false);
    const currentSessionId = sessionIdRef.current;
    const currentToken = sessionTokenRef.current;

    // Kích hoạt xóa phiên thực tế trên máy chủ theo quyền được xóa bỏ dữ liệu (P05-005)
    if (currentSessionId && currentSessionId !== 'anonymous') {
      try {
        await fetch(`/api/v1/chat/session?sessionId=${encodeURIComponent(currentSessionId)}`, {
          method: 'DELETE',
          headers: {
            ...(currentToken ? { 'x-chat-session-token': currentToken } : {}),
          },
        });
      } catch {
        // Tiếp tục làm sạch giao diện cục bộ kể cả khi mất mạng
      }
    }

    if (!clearRequest.isCurrent()) return;
    setMessages([{
      ...defaultWelcome,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    const newSessionId = consentRef.current === 'granted' ? generateSessionId() : 'anonymous';
    sessionIdRef.current = newSessionId;
    sessionTokenRef.current = '';
    try {
      if (consentRef.current === 'granted') localStorage.setItem('triton_widget_session_id', newSessionId);
      else localStorage.removeItem('triton_widget_session_id');
      localStorage.removeItem('triton_widget_session_token');
    } catch { /* ignore */ }
  };

  // ── DRAGGABLE FLOATING ACTION BUTTON LOGIC ───────────────────────
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // Load saved position or set safe default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('triton_chatbot_fab_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Clamp inside current window
          const clampedX = Math.min(Math.max(12, parsed.x), window.innerWidth - 72);
          const clampedY = Math.min(Math.max(60, parsed.y), window.innerHeight - 90);
          setFabPos({ x: clampedX, y: clampedY });
          return;
        }
      }
    } catch { /* ignore */ }

    // Safe default: bottom right, above mobile bottom nav
    const defX = window.innerWidth - (window.innerWidth < 640 ? 68 : 170);
    const defY = window.innerHeight - (window.innerWidth < 640 ? 145 : 95);
    setFabPos({ x: defX, y: defY });
  }, []);

  // Handle Drag Events (Touch + Mouse)
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!fabPos) return;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      origX: fabPos.x,
      origY: fabPos.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.hasMoved = true;
      }

      const nextX = Math.min(Math.max(10, dragRef.current.origX + dx), window.innerWidth - 65);
      const nextY = Math.min(Math.max(60, dragRef.current.origY + dy), window.innerHeight - 80);
      setFabPos({ x: nextX, y: nextY });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (fabPos) {
        try {
          localStorage.setItem('triton_chatbot_fab_pos', JSON.stringify(fabPos));
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, fabPos]);

  const handleChipClick = (preset: string) => {
    if (preset === '🧭 27 Lịch Trình') {
      handleOpenPresetPicker();
    } else {
      handleSend(preset);
    }
  };

  const handleFabClick = () => {
    if (!dragRef.current.hasMoved) {
      setIsOpen(true);
      // TỰ ĐỘNG BẢO ĐẢM KHỐI 27 LỊCH TRÌNH LUÔN HIỆN DIỆN TRƯỚC MẮT KHI MỞ CHAT LẠI
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (!lastMsg || (!lastMsg.showPresetPicker && !lastMsg.itinerary)) {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'assistant',
              text: 'Chào Bạn! Dưới đây là danh sách **27 Lịch trình Khép Vòng Núi Tri Tôn** đã được tối ưu sẵn cự ly Kilomet thực địa. Bạn có thể bấm chọn ngay để xem chi tiết:',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              showPresetPicker: true,
              suggestions: ['Gợi ý tour 1 ngày', 'Quán Gà Đốt Ô Thum', 'Chùa Xvayton'],
            }
          ];
        }
        return prev;
      });
    }
  };
  if (pathname === '/chatbot' || pathname === '/chat' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* ── DRAGGABLE FLOATING BUTTON (KÉO THẢ TỰ DO BẤT KỲ VỊ TRÍ) ── */}
        <div
          hidden={isOpen}
          style={
            fabPos
              ? { left: `${fabPos.x}px`, top: `${fabPos.y}px`, position: 'fixed' }
              : { right: '16px', bottom: '80px', position: 'fixed' }
          }
          className={`z-50 select-none touch-none ${isDragging ? 'cursor-grabbing scale-105 opacity-90' : 'cursor-grab'}`}
          onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleFabClick}
        >
          <button
            type="button"
            className="p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#FFD37A] via-[#F0A32F] to-[#D98E20] text-[#26221B] shadow-[0_6px_24px_rgba(240,163,47,0.45)] hover:shadow-[0_8px_30px_rgba(240,163,47,0.6)] border-2 border-white/80 active:scale-95 transition-transform duration-200 flex items-center gap-2 group font-display"
            aria-label="Mở Trợ lý AI Du Lịch Tri Tôn"
          >
            <div className="relative">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#26221B]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0E8C7F] rounded-full border-2 border-white animate-ping" />
            </div>
            <span className="hidden sm:inline-block font-black text-xs text-[#26221B] pr-0.5">
              Trợ Lý AI
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-[#F26B3A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      {/* ── CHAT MODAL WINDOW ───────────────────────────────────────────── */}
      {isOpen && <div className="fixed inset-0 z-[55] bg-[#26221B]/30" onClick={() => setIsOpen(false)} aria-hidden="true" />}
      {isOpen && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Cửa sổ Trợ lý AI Du Lịch Tri Tôn"
          className={`fixed z-[60] flex flex-col bg-[#FAF3E7] shadow-[0_10px_40px_rgba(38,34,27,0.2)] border border-[#26221B]/10 overflow-hidden font-body transition-all duration-300
            ${isExpanded
              ? 'inset-3 sm:inset-6 rounded-[28px]'
              : 'bottom-0 inset-x-0 sm:inset-x-auto sm:right-6 sm:bottom-6 w-full sm:w-[420px] sm:max-w-[calc(100vw-3rem)] h-[88dvh] sm:h-[620px] sm:max-h-[85vh] rounded-t-[26px] sm:rounded-[26px]'
            }`}
        >
          {/* Mobile swipe handle */}
          <div
            onClick={() => setIsOpen(false)}
            aria-label="Thu nhỏ cửa sổ chat"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(false); }}
            className="sm:hidden w-full flex justify-center py-2 bg-[#0E8C7F] cursor-pointer shrink-0 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-[#0E8C7F] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-[#0B6B60] shrink-0">
            <div className="flex items-center gap-2.5">
              <AppLogo size="sm" variant="emblem" />
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

            <div className="flex items-center gap-1.5">
          <ChatConsentBadge status={chatConsent} onChange={handleSetConsent} />
              <button onClick={handleClearHistory} title="Xóa lịch sử" aria-label="Xóa lịch sử trò chuyện" className="p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'} aria-label={isExpanded ? 'Thu nhỏ cửa sổ chat' : 'Mở rộng toàn màn hình'} className="hidden sm:block p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} title="Đóng cửa sổ chat" aria-label="Đóng cửa sổ chat" className="p-1.5 rounded-full text-[#FAF3E7] hover:text-white hover:bg-[#0B6B60] transition-colors ml-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Privacy Consent Banner (P05-008: Hiển thị khi người dùng chưa chọn) */}
      <ChatConsentNotice status={chatConsent} onChange={handleSetConsent} notice={privacyNotice} onRetry={hasPendingDeletion ? () => { void retryDeletion(); } : undefined} />

      {/* Quick preset chips */}
          <div className="px-3 py-2 bg-[#FFFDF7] border-b border-[#26221B]/8 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none shrink-0 touch-pan-x">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(preset)}
                className={`px-3.5 py-1 rounded-full font-bold transition-all shadow-2xs active:scale-95 font-display ${
                  preset === '🧭 27 Lịch Trình'
                    ? 'bg-gradient-to-r from-[#FFD37A] to-[#F0A32F] text-[#26221B] border border-[#F0A32F] shadow-xs'
                    : 'bg-[#FAF3E7] border border-[#26221B]/10 hover:border-[#0E8C7F] hover:text-[#0E8C7F] text-[#26221B]'
                }`}
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

                <div className={`space-y-2 flex flex-col flex-1 min-w-0 ${msg.itinerary ? 'w-full max-w-full' : 'max-w-[92%] sm:max-w-[88%]'} ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
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
                      <FormattedChatMessage
                        content={msg.text}
                        isAssistant={msg.sender === 'assistant'}
                        itinerary={msg.itinerary}
                      />
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
            <button
              onClick={handleOpenPresetPicker}
              title="Mở 27 Lịch trình Khép Vòng"
              aria-label="Mở 27 Lịch trình Khép Vòng"
              className="p-2.5 rounded-full bg-[#FAF3E7] hover:bg-[#F0A32F] border border-[#26221B]/15 text-[#26221B] hover:text-[#26221B] flex items-center justify-center transition-colors shrink-0 shadow-2xs active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F]"
            >
              <Navigation className="w-4 h-4 text-[#0E8C7F] group-hover:text-[#26221B] rotate-45" />
            </button>
            <input
              type="text"
              value={input}
              aria-label="Nội dung câu hỏi du lịch Tri Tôn"
              onChange={(e) => {
                setInput(e.target.value);
                // CƠ CHẾC: Pre-ping Groq khi user gõ chữ (debounce 300ms)
                // Giúp Groq LPU "ấm máy" trước khi user bấm Gủi → giảm TTFB ~150ms
                if (e.target.value.length === 3 && !hasPingedRef.current) {
                  hasPingedRef.current = true;
                  if (prePingTimerRef.current) clearTimeout(prePingTimerRef.current);
                  prePingTimerRef.current = setTimeout(() => {
                    // Pre-ping nhẹ: 1 token để làm nóng Groq LPU
                    fetch('/api/v1/chat/ping', { method: 'POST' }).catch(() => {});
                    hasPingedRef.current = false;
                  }, 300);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về Hồ Tà Pạ, Gà đốt Ô Thum, Chùa Khmer..."
              className="flex-1 px-4 py-2.5 rounded-full border border-[#26221B]/15 text-xs sm:text-sm text-[#26221B] focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 focus-visible:outline-none focus-visible:border-[#0E8C7F] focus-visible:ring-2 focus-visible:ring-[#0E8C7F]/40 bg-[#FAF3E7] font-body"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || isLoadingItinerary || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] disabled:opacity-50 disabled:cursor-not-allowed text-[#26221B] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 min-w-[44px] min-h-[44px] shadow-xs active:scale-95 font-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F]"
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
