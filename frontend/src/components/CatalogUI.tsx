'use client';

import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { Compass, LoaderCircle } from 'lucide-react';

export function CatalogCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`group relative flex flex-col justify-between overflow-hidden rounded-[var(--r-l)] border border-[var(--ink)]/10 bg-[var(--surface)] shadow-[var(--shadow-elevation-sm)] hover:shadow-[var(--shadow-elevation-md)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-250 ease-out ${className}`} />;
}

export function FilterChip({ active, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return <button {...props} type="button" aria-pressed={active}
    className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-bold font-display active:scale-[0.97] transition-[transform,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)] ${active ? 'border-[var(--jade-deep)] bg-[var(--jade-deep)] text-white shadow-xs' : 'border-[var(--ink)]/15 bg-[var(--surface)] text-[var(--ink-soft)] hover:bg-[var(--bg)]'} ${className}`} />;
}

export function CatalogFeedback({ kind = 'empty', message, actionLabel, onAction }: {
  kind?: 'empty' | 'loading' | 'error'; message: string; actionLabel?: string; onAction?: () => void;
}) {
  const Icon = kind === 'loading' ? LoaderCircle : Compass;
  return <div role={kind === 'error' ? 'alert' : 'status'} aria-live={kind === 'error' ? 'assertive' : 'polite'}
    className="space-y-3 rounded-[var(--r-m)] border border-[var(--ink)]/15 bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--ink)] shadow-[var(--shadow-elevation-sm)]">
    <Icon aria-hidden="true" className={`mx-auto h-6 w-6 text-[var(--jade-deep)] ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
    <p>{message}</p>
    {onAction && actionLabel && <button type="button" onClick={onAction}
      className="min-h-11 rounded-full bg-[var(--palm)] px-4 font-bold text-[var(--ink)] active:scale-[0.98] transition-transform duration-150 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)]">{actionLabel}</button>}
  </div>;
}
