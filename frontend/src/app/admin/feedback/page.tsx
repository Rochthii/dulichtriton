'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFeedbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/feedbacks');
  }, [router]);

  return (
    <div className="py-20 text-center font-body text-xs text-[#6B6355]">
      Đang chuyển hướng tới Hộp thư Phản hồi & Đóng góp...
    </div>
  );
}
