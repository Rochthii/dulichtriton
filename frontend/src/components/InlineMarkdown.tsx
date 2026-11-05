import React from 'react';
import { Navigation, Play } from 'lucide-react';
import { resolveTikTokHashtag } from '@/lib/tiktok';

// Display-only links: reject executable schemes, control characters and protocol-relative URLs.
function linkTarget(raw: string): string | null {
  let url = raw.trim();
  if (!url) return null;
  // If external URL has unencoded spaces, heal them
  if (/^https?:\/\//i.test(url) && /\s/.test(url)) {
    url = url.replace(/\s+/g, '%20');
  }
  if (/[\u0000-\u0020\u007f\\]/.test(url)) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    return ['https:', 'http:', 'tel:', 'mailto:'].includes(new URL(url).protocol) ? url : null;
  } catch { return null; }
}

function cleanLinkLabel(label: string): string {
  // Strip redundant leading emoji icons if we render custom SVG Lucide icons
  return label.replace(/^[📍▶🗺️📌\s]+/, '').trim() || label;
}

export function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Balanced parentheses regex to support URLs containing query parens like (Wat Xvayton)
  const tokenRegex = /(\[[^\]]+\]\((?:[^()]+|\([^()]*\))*\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;

  return text.split(tokenRegex).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(((?:[^()]+|\([^()]*\))*)\)$/);
    if (link) {
      let href = linkTarget(link[2]);
      if (!href) return <span key={index}>{link[1]}</span>;
      const external = /^https?:/i.test(href);

      const isMaps = /maps\.google\.|google\.com\/maps|goo\.gl\//i.test(href);
      const isTikTok = /tiktok\.com/i.test(href);

      if (isTikTok && href.includes('/search')) {
        try {
          const parsed = new URL(href);
          const q = parsed.searchParams.get('q') || link[1];
          const tag = resolveTikTokHashtag(q);
          href = `https://www.tiktok.com/tag/${tag}`;
        } catch {
          href = 'https://www.tiktok.com/tag/dulichtriton';
        }
      }

      if (isMaps) {
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chỉ đường Google Maps: ${cleanLinkLabel(link[1])}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 mx-0.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300 align-middle font-display"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.25]" />
            <span className="truncate max-w-[220px]">{cleanLinkLabel(link[1])}</span>
          </a>
        );
      }

      if (isTikTok) {
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Xem video TikTok: ${cleanLinkLabel(link[1])}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 mx-0.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 bg-rose-50 text-rose-700 border border-rose-200/90 hover:bg-rose-100 hover:border-rose-300 align-middle font-display"
          >
            <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600 shrink-0" />
            <span className="truncate max-w-[220px]">{cleanLinkLabel(link[1])}</span>
          </a>
        );
      }

      return (
        <a
          key={index}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="break-words font-semibold text-[var(--jade-deep)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)]"
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index} className="font-bold text-[var(--ink)]">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
