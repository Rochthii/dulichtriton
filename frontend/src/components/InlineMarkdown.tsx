import React from 'react';

// Display-only links: reject executable schemes, control characters and protocol-relative URLs.
function linkTarget(raw: string): string | null {
  const url = raw.trim();
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url)) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    return ['https:', 'http:', 'tel:', 'mailto:'].includes(new URL(url).protocol) ? url : null;
  } catch { return null; }
}

export function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = linkTarget(link[2]);
      if (!href) return <span key={index}>{link[1]}</span>;
      const external = /^https?:/i.test(href);
      return <a key={index} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
        className="break-words font-semibold text-[var(--jade-deep)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)]">{link[1]}</a>;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index} className="font-bold text-[var(--ink)]">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
