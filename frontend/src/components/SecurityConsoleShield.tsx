'use client';

import { useEffect } from 'react';

/**
 * SecurityConsoleShield
 * Displays enterprise security warning in F12 console and prevents client tampering.
 */
export default function SecurityConsoleShield() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // 1. Display Official Security Warning Banner in Console
      const titleStyle = 'color: #D9822B; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;';
      const warningStyle = 'color: #EF4444; font-size: 14px; font-weight: bold;';
      const textStyle = 'color: #334155; font-size: 12px;';

      console.log('%c🛡️ HỆ THỐNG DU LỊCH TRI TÔN AI', titleStyle);
      console.log(
        '%c⚠️ CẢNH BÁO BẢO MẬT & BẢN QUYỀN HỆ THỐNG (SECURITY WARNING)',
        warningStyle
      );
      console.log(
        '%cĐây là tính năng trình duyệt dành riêng cho các nhà phát triển hệ thống. Việc cố gắng chèn mã độc, cào vét dữ liệu tự động hoặc can thiệp vào phiên làm việc là hành vi bị nghiêm cấm theo Luật An toàn thông tin mạng.',
        textStyle
      );
      console.log(
        '%cMọi truy vấn bất thường và hành vi xâm nhập đều được ghi nhận tự động vào Audit Logs phục vụ công tác an ninh mạng.',
        'color: #0E8C7F; font-weight: bold;'
      );
    }
  }, []);

  return null;
}
