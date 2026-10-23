'use client';

import React from 'react';
import { renderInlineMarkdown as renderInline } from '@/components/InlineMarkdown';
import { formatDetailedStory } from '@/lib/storyFormatter';

interface RichTextRendererProps {
  content?: string | null;
  className?: string;
}

/**
 * Format inline text (bold **text**, italic *text*, links [title](url))
 */
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
 * Automatically transforms raw Markdown asterisks, headings, bullet points,
 * and Markdown tables into beautifully aligned, high-contrast, readable UI blocks.
 */
export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const formattedStory = formatDetailedStory(content);
  const cleanedContent = cleanGeoPhrasing(formattedStory);
  
  // Split content by lines
  const lines = cleanedContent.split('\n');
  const blocks: { type: 'heading' | 'subheading' | 'title' | 'card' | 'list' | 'table' | 'paragraph'; data: any }[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Table Detection: line starts and ends with '|' or contains multiple '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const tLine = lines[i].trim();
        // Ignore separator lines like | --- | --- |
        if (!/^\|(?:\s*[-:]+\s*\|)+$/.test(tLine)) {
          tableLines.push(tLine);
        }
        i++;
      }
      if (tableLines.length > 0) {
        const rows = tableLines.map(line => 
          line.split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
        );
        blocks.push({ type: 'table', data: rows });
      }
      continue;
    }

    // 2. Heading (# Heading, ## Heading, ### Heading)
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const level = (trimmed.match(/^#+/) || ['#'])[0].length;
      const text = trimmed.replace(/^#+\s*/, '');
      blocks.push({ type: level <= 2 ? 'heading' : 'subheading', data: text });
      i++;
      continue;
    }

    // 3. Highlight Card (e.g. **Label:** text or **Giờ mở cửa:** ...)
    if (trimmed.startsWith('**') && trimmed.includes('**:')) {
      const colonIdx = trimmed.indexOf('**:');
      const label = trimmed.slice(2, colonIdx);
      const restText = trimmed.slice(colonIdx + 3).trim();
      blocks.push({ type: 'card', data: { label, text: restText } });
      i++;
      continue;
    }

    // 4. Standalone Bold Title (e.g. **Con Đường Tuyến Tránh Tri Tôn**)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      const title = trimmed.slice(2, -2);
      blocks.push({ type: 'title', data: title });
      i++;
      continue;
    }

    // 5. Unordered List Items (* item, - item, • item)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• '))) {
        listItems.push(lines[i].trim().replace(/^[*•-]\s*/, ''));
        i++;
      }
      blocks.push({ type: 'list', data: listItems });
      continue;
    }

    // 6. Regular Paragraph
    blocks.push({ type: 'paragraph', data: trimmed });
    i++;
  }

  return (
    <div className={`min-w-0 break-words space-y-4 text-sm sm:text-base leading-relaxed text-[#26221B]/90 font-body ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'heading') {
          return (
            <h2
              key={bIdx}
              className="font-display text-lg sm:text-xl font-extrabold text-[#26221B] pt-4 pb-1 flex items-center gap-2.5 border-b border-[#26221B]/8 first:pt-0"
            >
              <span className="w-2 h-5 rounded-full bg-[#0E8C7F] inline-block shrink-0" />
              <span>{block.data}</span>
            </h2>
          );
        }

        if (block.type === 'subheading') {
          return (
            <h3
              key={bIdx}
              className="font-display text-base sm:text-lg font-bold text-[#0E8C7F] pt-3 pb-0.5 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0A32F] inline-block shrink-0" />
              <span>{block.data}</span>
            </h3>
          );
        }

        if (block.type === 'title') {
          return (
            <h4
              key={bIdx}
              className="font-display text-sm sm:text-base font-bold text-[#D9822B] pt-2 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B]" />
              <span>{block.data}</span>
            </h4>
          );
        }

        if (block.type === 'card') {
          return (
            <div
              key={bIdx}
              className="p-3.5 sm:p-4 rounded-[20px] bg-[#FAF3E7] border border-[#26221B]/8 space-y-1 my-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#D9822B] font-display uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B]" />
                <span>{block.data.label}</span>
              </div>
              <p className="text-sm text-[#26221B] leading-relaxed">
                {renderInline(block.data.text)}
              </p>
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-1">
              {(block.data as string[]).map((item, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F] mt-2 shrink-0" />
                  <p className="text-sm text-[#26221B] leading-relaxed">
                    {renderInline(item)}
                  </p>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'table') {
          const rows = block.data as string[][];
          if (rows.length === 0) return null;
          const [header, ...bodyRows] = rows;

          return (
            <div key={bIdx} tabIndex={0} role="region" aria-label="Bảng thông tin, cuộn ngang để xem thêm" className="focus-visible:outline-2 focus-visible:outline-[var(--jade)] overflow-x-auto rounded-[var(--r-m)] border border-[#EBE1D0] bg-[#FFFDF7] my-3 shadow-xs">
              <table className="w-full text-left border-collapse">
                {header && header.length > 0 && (
                  <thead>
                    <tr className="bg-[#FAF3E7] border-b border-[#EBE1D0]">
                      {header.map((col, cIdx) => (
                        <th
                          key={cIdx}
                          className="px-4 py-3 text-sm font-bold text-[#26221B] font-display uppercase tracking-wider"
                        >
                          {renderInline(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-[#EBE1D0]/60 last:border-b-0 even:bg-[#FAF3E7]/30 hover:bg-[#FAF3E7]/60 transition-colors"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-4 py-2.5 text-sm text-[#26221B] ${
                            cellIdx === 0 ? 'font-bold text-[#0E8C7F]' : ''
                          }`}
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={bIdx} className="text-sm text-[#26221B] leading-relaxed">
            {renderInline(block.data)}
          </p>
        );
      })}
    </div>
  );
}
