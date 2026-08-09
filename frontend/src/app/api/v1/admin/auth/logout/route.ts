import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất tài khoản Quản trị' });
  response.cookies.delete('triton_admin_token');
  return response;
}
