import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/serverSupabase';
import { 
  executeChatLogCleanup, 
  verifyCleanupAuthorization 
} from '@/lib/chatLogCleanupService';

/**
 * Handler chính thực thi dọn dẹp các bản ghi nhật ký kiểm toán chat_logs hết hạn (> 30 ngày)
 */
async function handleCleanup(req: NextRequest) {
  // 1. Kiểm tra xác thực Cron Secret (Fail-Closed)
  const authHeader = req.headers.get('authorization') || req.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET;

  if (!verifyCleanupAuthorization(authHeader, cronSecret)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Missing or invalid cron authorization secret.'
      },
      { status: 401 }
    );
  }

  // 2. Thu thập cấu hình batchLimit từ searchParams (nếu có)
  const url = new URL(req.url);
  const rawLimit = url.searchParams.get('limit');
  const batchLimit = rawLimit ? parseInt(rawLimit, 10) : 1000;

  // 3. Khởi tạo service_role client máy chủ
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        error: 'Server configuration error: Supabase service_role key not configured.'
      },
      { status: 500 }
    );
  }

  // 4. Thực thi dọn dẹp
  const result = await executeChatLogCleanup({
    supabaseClient: supabase,
    batchLimit
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}
