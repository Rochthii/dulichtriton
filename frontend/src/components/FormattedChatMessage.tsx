'use client';

import React from 'react';
import { Compass, Clock, MapPin, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
}

export default function FormattedChatMessage({ content, isAssistant = true }: FormattedChatMessageProps) {
  if (!content) return null;

  // Split into lines for structured parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="space-y-2 my-2.5">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInlineFormatted = (text: string) => {
    // Parse bold text **...**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#D99B26] drop-shadow-xs">
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

    // Check for Headings: ### or ## or #
    if (trimmed.startsWith('#')) {
      flushList(String(idx));
      const headingText = trimmed.replace(/^#+\s*/, '');
      const isItineraryHeader = headingText.toLowerCase().includes('lịch trình') || headingText.toLowerCase().includes('lộ trình') || headingText.toLowerCase().includes('tour');

      elements.push(
        <div key={`h-${idx}`} className="mt-4 mb-2 pt-2 border-t border-emerald-500/20 first:mt-0 first:pt-0 first:border-0">
          <div className="flex items-center gap-2">
            {isItineraryHeader ? (
              <div className="p-1 rounded-lg bg-amber-500/20 text-[#D99B26]">
                <Clock className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <h3 className="font-extrabold text-sm sm:text-base text-amber-300 tracking-tight">
              {renderInlineFormatted(headingText)}
            </h3>
          </div>
        </div>
      );
      return;
    }

    // Check for Bullet Points (- or * or numbered list)
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);

    if (isBullet) {
      inList = true;
      const rawText = trimmed.replace(/^([-*]|\d+\.)\s*/, '');

      // Check if this bullet item represents a Time Slot (Sáng / Trưa / Chiều / Tối / Ngày)
      const isTimeSlot = /^(Sáng|Trưa|Chiều|Tối|Ngày\s*\d+)/i.test(rawText.replace(/\*\*/g, '').trim());

      if (isTimeSlot) {
        listItems.push(
          <li key={`li-${idx}`} className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-700/40 shadow-xs flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#D99B26]/20 text-[#D99B26] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-100 leading-relaxed flex-1">
              {renderInlineFormatted(rawText)}
            </div>
          </li>
        );
      } else {
        listItems.push(
          <li key={`li-${idx}`} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99B26] shrink-0 mt-2" />
            <div className="flex-1">{renderInlineFormatted(rawText)}</div>
          </li>
        );
      }
      return;
    }

    // Regular Paragraph
    flushList(String(idx));
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-100 my-1 font-normal">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList('final');

  return <div className="space-y-1.5 text-slate-100">{elements}</div>;
}
