'use client';

import { EyeOff, ShieldCheck } from 'lucide-react';
import type { ConsentStatus } from '@/lib/chatConsentGuard';

type Props = { status: ConsentStatus; onChange: (status: 'granted' | 'denied') => void };
const controlClass = 'min-h-11 px-3 rounded-lg text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)]';

export function ChatConsentBadge({ status, onChange }: Props) {
  const granted = status === 'granted';
  return <button type="button" onClick={() => onChange(granted ? 'denied' : 'granted')}
    aria-label={granted ? 'Đang lưu hội thoại 24 giờ. Chuyển sang không lưu' : 'Chưa lưu hội thoại. Cho phép lưu 24 giờ'}
    className={`${controlClass} flex items-center gap-1 border border-white/30 text-white focus-visible:outline-white`}>
    {granted ? <ShieldCheck className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
    <span>{granted ? 'Lưu 24h' : status === 'denied' ? 'Không lưu' : 'Chưa lưu'}</span>
  </button>;
}

export function ChatConsentNotice({ status, onChange, notice, onRetry }: Props & { notice: string; onRetry?: () => void }) {
  return <>
    {status === 'unset' && <section aria-label="Lựa chọn lưu hội thoại" className="bg-[var(--surface)] text-[var(--ink)] border-b border-[var(--ink)]/10 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
      <p className="text-xs leading-relaxed flex-1 min-w-40">Bạn vẫn có thể hỏi khi chưa chọn. Cho phép lưu hội thoại trên thiết bị và giữ ngữ cảnh trên máy chủ 24 giờ?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${controlClass} bg-[var(--palm)] text-[var(--ink)]`} onClick={() => onChange('granted')}>Cho phép lưu</button>
        <button type="button" className={`${controlClass} border border-[var(--ink)]/30`} onClick={() => onChange('denied')}>Không lưu</button>
      </div>
    </section>}
    {notice && <div className="px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)]">
      <p role="status">{notice}</p>
      {onRetry && <button type="button" onClick={onRetry} className={`${controlClass} underline`}>Thử xóa phiên cũ</button>}
    </div>}
  </>;
}
