'use client';

import React, { useState } from 'react';
import { MessageSquare, Sparkles, X, Send, Bot, User, Compass, MapPin } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Du Lịch Tri Tôn. Bạn cần gợi ý điểm tham quan, ẩm thực Gà Đốt Ô Thum hay lịch trình du lịch?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const presets = [
    'Gợi ý lịch trình Tri Tôn 1 ngày',
    'Ăn Gà Đốt Ô Thum ở đâu chuẩn vị?',
    'Đường lên Chùa Tà Pạ có đi xe máy được không?'
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

    // Simulate AI response stream
    setTimeout(() => {
      let replyText = 'Tôi đã nhận được câu hỏi của bạn về Tri Tôn.';
      if (textToSend.includes('lịch trình')) {
        replyText = 'Lịch trình 1 ngày đề xuất: Sáng ngắm bình minh Hồ Tà Pạ & Cổng Trời Khmer (Xã Núi Tô). Trưa thưởng thức Gà Đốt Thốt Nốt tại Hồ Ô Thum (Xã Ô Lâm). Chiều tham quan Di tích Ô Tà Sóc (Xã Lương Phi).';
      } else if (textToSend.includes('Gà Đốt')) {
        replyText = 'Đặc sản Gà Đốt lá chúc Ô Thum tập trung nhiều nhất xung quanh khu vực Hồ Ô Thum, Xã Ô Lâm, Tri Tôn. Các quán uy tín đều ướp lá chúc tươi và mật thốt nốt nguyên chất.';
      } else if (textToSend.includes('Tà Pạ')) {
        replyText = 'Đường lên Chùa Tà Pạ và Hồ Tà Pạ (Ấp Tà Pạ, Xã Núi Tô) đã được trải bê tông hoàn chỉnh, xe máy và ô tô dưới 16 chỗ di chuyển dễ dàng.';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#1B4D3E] hover:bg-[#143B2F] text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center gap-2 group"
        aria-label="Open AI Chatbot"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-white" />
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26] absolute -top-1 -right-1 animate-pulse" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-semibold pr-1">
          Hỏi AI Tri Tôn
        </span>
      </button>

      {/* Expandable Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-[#1B4D3E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#143B2F] border border-[#D99B26] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                  TRỢ LÝ AI TRI TÔN
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[11px] text-emerald-200 mt-1">Trợ lý du lịch 82 địa điểm đã xác minh</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#1B4D3E] hover:text-[#1B4D3E] text-slate-600 transition-colors shadow-2xs"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#D99B26] text-white'
                      : 'bg-[#1B4D3E] text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#D99B26]" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1B4D3E] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-2.5 rounded-xl border border-slate-200 w-max">
                <Bot className="w-4 h-4 text-[#1B4D3E] animate-bounce" />
                <span>AI đang tìm kiếm dữ liệu...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi về địa điểm, gà đốt Ô Thum..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B4D3E]"
            />
            <button
              onClick={() => handleSend()}
              className="p-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white transition-colors"
            >
              <Send className="w-4 h-4 text-[#D99B26]" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
