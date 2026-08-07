"use client";

import { useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "user",
      text: "Ho Ta Pa có gì chơi và ăn gì gần đây?"
    },
    {
      id: 2,
      role: "assistant",
      text: "Chào bạn! Hồ Tà Pạ là một điểm đến tuyệt vời với cảnh quan xanh mát. Dưới đây là một số đề xuất cho bạn tham khảo:"
    }
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "Tạo lịch trình 1 ngày",
    "Mở Google Maps",
    "Tìm chỗ ở gần đây"
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: userMsg }
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Cảm ơn bạn đã hỏi! Đây là gợi ý địa điểm & ẩm thực đặc sản hấp dẫn nhất tại Tri Tôn."
        }
      ]);
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-base text-on-surface antialiased">
      <main className="mx-auto w-full max-w-container-max flex-grow flex-col gap-section-gap px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Header */}
        <section className="flex flex-col gap-2 border-b border-outline-variant/30 pb-6">
          <h1 className="font-display-lg text-display-lg-mobile text-primary md:text-display-lg font-bold">
            AI Chatbot Du Lịch Tri Tôn
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Trò chuyện cùng trợ lý AI để khám phá điểm đến, ẩm thực và lịch trình tại Tri Tôn.
          </p>
        </section>

        {/* Quick Suggestions Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="rounded-full border border-outline-variant/40 bg-surface px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-emerald-light"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="bg-surface rounded-3xl p-6 border border-outline-variant/30 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-slate-800 text-white" : "bg-primary text-white"
                }`}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[80%] shadow-sm ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI Du Lịch Tri Tôn..."
            className="w-full rounded-full border border-outline-variant bg-surface px-6 py-3.5 text-xs sm:text-sm font-medium focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-hover"
          >
            <span>Gửi</span>
            <Send className="h-4 w-4" />
          </button>
        </form>

      </main>
    </div>
  );
}
