import { Ambulance, Flame, ShieldAlert } from 'lucide-react';

export const NATIONAL_EMERGENCY_CONTACTS = [
  { phone: '115', label: 'Cấp cứu y tế', Icon: Ambulance },
  { phone: '113', label: 'Công an', Icon: ShieldAlert },
  { phone: '114', label: 'PCCC và cứu nạn', Icon: Flame },
] as const;

export default function EmergencyQuickLinks() {
  return <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Tổng đài khẩn cấp quốc gia">
    {NATIONAL_EMERGENCY_CONTACTS.map(({ phone, label, Icon }) => <a key={phone}
      href={`tel:${phone}`} aria-label={`Gọi ${phone} — ${label}`}
      className="min-h-24 rounded-[var(--r-m)] border border-[var(--terracotta)]/30 bg-[var(--surface)] p-3 text-center text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jade)]">
      <Icon className="mx-auto h-5 w-5 text-[var(--terracotta)]" aria-hidden="true" />
      <strong className="block text-xl font-display mt-1">{phone}</strong>
      <span className="block text-xs leading-relaxed">{label}</span>
    </a>)}
  </div>;
}
