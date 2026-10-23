import Link from 'next/link';
import { AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';
import EmergencyQuickLinks from '@/components/EmergencyQuickLinks';

export default function EmergencyPage() {
  return <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] px-4 py-6 pb-24 sm:py-10">
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[var(--terracotta)] font-display font-bold">
          <ShieldAlert aria-hidden="true" className="h-6 w-6" /> Hỗ trợ khẩn cấp
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold">Cần trợ giúp tại Tri Tôn?</h1>
        <p className="text-sm leading-relaxed">Chọn tổng đài phù hợp bên dưới. Khi gọi, hãy nêu vị trí và tình huống cần trợ giúp.</p>
      </header>
      <EmergencyQuickLinks />
      <section aria-labelledby="local-contacts-status" className="rounded-[var(--r-l)] border border-[var(--terracotta)]/30 bg-[var(--surface)] p-4 sm:p-6 space-y-3">
        <h2 id="local-contacts-status" className="font-display text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[var(--terracotta)] shrink-0" aria-hidden="true" /> Danh bạ địa phương đang đối chiếu
        </h2>
        <p className="text-sm leading-relaxed">Chưa đủ bằng chứng thống nhất về số liên hệ, đơn vị tiếp nhận và thời hạn xác minh của danh bạ địa phương. Các số này tạm thời không hiển thị để tránh hướng dẫn nhầm.</p>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">Các nút phía trên là tổng đài quốc gia, không phải số riêng của cơ sở tại Tri Tôn.</p>
        <a href="https://xaydungchinhsach.chinhphu.vn/tong-dai-so-112-tiep-nhan-24-7-cac-thong-tin-ve-su-co-thien-tai-tham-hoa-119250902150528929.htm"
          target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 text-sm text-[var(--jade-deep)] underline focus-visible:outline-2 focus-visible:outline-offset-2">
          Hướng dẫn tổng đài từ Cổng Thông tin Chính phủ <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </section>
      <Link href="/places" className="inline-flex min-h-11 items-center text-sm text-[var(--jade-deep)] underline focus-visible:outline-2 focus-visible:outline-offset-2">Quay lại danh sách địa điểm</Link>
    </div>
  </div>;
}
