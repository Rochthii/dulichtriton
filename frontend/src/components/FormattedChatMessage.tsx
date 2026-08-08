'use client';

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
}

export default function FormattedChatMessage({ content }: FormattedChatMessageProps) {
  if (!content) return null;

  // Split into lines for structured parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="space-y-2.5 my-3">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInlineFormatted = (text: string) => {
    // Parse bold text **...**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#B45309]">
            {innerText}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(String(idx));
      return;
    }

    // Headings: ### or ## or #
    if (trimmed.startsWith('#')) {
      flushList(String(idx));
      const headingText = trimmed.replace(/^#+\s*/, '');
      const isItineraryHeader = headingText.toLowerCase().includes('lịch trình') || headingText.toLowerCase().includes('lộ trình') || headingText.toLowerCase().includes('tour');

      elements.push(
        <div key={`h-${idx}`} className="mt-4 mb-2 pt-2 border-t border-slate-200/80 first:mt-0 first:pt-0 first:border-0">
          <div className="flex items-center gap-2">
            {isItineraryHeader ? (
              <div className="p-1 rounded-lg bg-amber-100 text-[#B45309]">
                <Clock className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-emerald-100 text-[#1B4D3E]">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#1B4D3E] tracking-tight">
              {renderInlineFormatted(headingText)}
            </h3>
          </div>
        </div>
      );
      return;
    }

    // Bullet Points (- or * or numbered list)
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);

    if (isBullet) {
      const rawText = trimmed.replace(/^([-*]|\d+\.)\s*/, '');

      // Check if bullet item represents a Time Slot (Sáng / Trưa / Chiều / Tối / Ngày)
      const isTimeSlot = /^(Sáng|Trưa|Chiều|Tối|Ngày\s*\d+)/i.test(rawText.replace(/\*\*/g, '').trim());

      if (isTimeSlot) {
        listItems.push(
          <li key={`li-${idx}`} className="bg-emerald-50/90 rounded-2xl p-3 sm:p-3.5 border border-emerald-200/80 shadow-xs flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#D99B26] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed flex-1 font-medium">
              {renderInlineFormatted(rawText)}
            </div>
          </li>
        );
      } else {
        listItems.push(
          <li key={`li-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <span className="w-2 h-2 rounded-full bg-[#D99B26] shrink-0 mt-1.5" />
            <div className="flex-1">{renderInlineFormatted(rawText)}</div>
          </li>
        );
      }
      return;
    }

    // Regular Paragraph
    flushList(String(idx));
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-800 my-1.5 font-medium">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList('final');

  return <div className="space-y-2 text-slate-900">{elements}</div>;
}
