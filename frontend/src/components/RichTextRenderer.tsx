'use client';

import React from 'react';

interface RichTextRendererProps {
  content?: string | null;
  className?: string;
}

/**
 * Format inline text (bold **text**, italic *text*, links [title](url))
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to match markdown links [text](url), bold **text**, and italic *text*
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link [Title](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const [, linkText, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0E8C7F] hover:text-[#0B6B60] font-semibold underline underline-offset-2 transition-colors"
          >
            {linkText}
          </a>
        );
      }
    }

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-[#26221B]">
          {boldContent}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicContent = part.slice(1, -1);
      return (
        <em key={index} className="italic text-[#6B6355]">
          {italicContent}
        </em>
      );
    }

    // Normal text
    return <span key={index}>{part}</span>;
  });
}

/**
 * Clean up redundant geographical phrasing
 */
function cleanGeoPhrasing(text: string): string {
  return text
    .replace(/,\s*Tri Tôn,\s*An Giang/gi, ', Tri Tôn, An Giang')
    .replace(/Thị trấn Tri Tôn,\s*Tri Tôn,\s*An Giang/gi, 'Thị trấn Tri Tôn, An Giang')
    .replace(/Xã ([^,]+),\s*Tri Tôn,\s*An Giang/gi, 'Xã $1, An Giang');
}

/**
 * RichTextRenderer — Folk-Modern Typography Engine
 * Automatically transforms raw Markdown asterisks, headings, and bullet points
 * into beautifully aligned, high-contrast, readable UI blocks.
 */
export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const cleanedContent = cleanGeoPhrasing(content);
  // Split into raw lines / paragraphs
  const rawParagraphs = cleanedContent.split(/\n\s*\n|\n/);

  return (
    <div className={`space-y-3.5 text-sm sm:text-base leading-relaxed text-[#26221B]/90 font-body ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a Heading (### Heading or ## Heading or standalone **Heading**)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h3
              key={pIdx}
              className="font-display text-base sm:text-lg font-bold text-[#26221B] pt-2 pb-0.5 flex items-center gap-2 border-b border-[#26221B]/6"
            >
              <span className="w-1.5 h-4 rounded-full bg-[#0E8C7F] inline-block" />
              <span>{headingText}</span>
            </h3>
          );
        }

        // Standalone bold title line (e.g. **Con Đường Tuyến Tránh Tri Tôn: ...**)
        if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
          const title = trimmed.slice(2, -2);
          return (
            <h4
              key={pIdx}
              className="font-display text-sm sm:text-base font-bold text-[#0E8C7F] pt-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#F0A32F]" />
              <span>{title}</span>
            </h4>
          );
        }

        // Check if paragraph starts with a highlighted label (e.g. **Giờ mở cửa:** or **Trải nghiệm thực tế:**)
        if (trimmed.startsWith('**') && trimmed.includes('**:')) {
          const colonIdx = trimmed.indexOf('**:');
          const label = trimmed.slice(2, colonIdx);
          const restText = trimmed.slice(colonIdx + 3).trim();

          return (
            <div
              key={pIdx}
              className="p-3.5 sm:p-4 rounded-[18px] bg-[#FAF3E7]/80 border border-[#26221B]/6 space-y-1 my-2"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D9822B] font-display uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B]" />
                <span>{label}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#26221B] leading-relaxed">
                {renderInline(restText)}
              </p>
            </div>
          );
        }

        // Bullet point item (* item or - item)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[*•-]\s*/, '');
          return (
            <div key={pIdx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F] mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-[#26221B] leading-relaxed">
                {renderInline(bulletText)}
              </p>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <p key={pIdx} className="text-xs sm:text-sm text-[#26221B] leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
