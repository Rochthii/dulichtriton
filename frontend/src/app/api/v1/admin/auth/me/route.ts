import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('triton_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: 'Trưởng Ban Quản Trị Tri Tôn',
      email: 'admin@triton.gov.vn',
      role: 'ADMIN',
    },
  });
}
