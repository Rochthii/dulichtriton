import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';
import { readJsonBodyWithLimit } from '@/lib/requestBodyGuard';
import { validateImageFile } from '@/lib/mimeValidator';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

function logAudit(
  action: string,
  resourceId: string,
  details: Record<string, unknown>,
  principal?: AdminPrincipal,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: principal ? (principal.fullName || principal.email) : 'Admin_Manager',
      user_role: principal?.role || 'ADMIN',
      action,
      resource_type: 'image_uploads',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  try {
    const bodyResult = await readJsonBodyWithLimit<{ files?: unknown; folder?: unknown }>(req);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error, code: bodyResult.code },
        { status: bodyResult.status }
      );
    }

    const { files, folder } = bodyResult.data;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy file ảnh để tải lên' }, { status: 400 });
    }

    // 1. Thẩm định nghiêm ngặt MIME type và chữ ký nhị phân của toàn bộ tệp đầu vào
    const validatedFiles: Array<{ file: string; isRemoteUrl: boolean }> = [];

    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i]);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: `Tệp thứ ${i + 1} không hợp lệ: ${validation.error}`,
            code: validation.code,
          },
          { status: 400 }
        );
      }
      validatedFiles.push({
        file: validation.isRemoteUrl && validation.sanitizedUrl ? validation.sanitizedUrl : (files[i] as string),
        isRemoteUrl: validation.isRemoteUrl,
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dulichtriton';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'triton_poi_images';

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validatedFiles.length; i++) {
      const { file, isRemoteUrl } = validatedFiles[i];

      if (isRemoteUrl) {
        // Already a remote URL
        uploadedUrls.push(file);
        continue;
      }

      // Base64 file -> Upload to Cloudinary REST API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (folder && typeof folder === 'string') formData.append('folder', folder);

      let cloudRes: Response;
      try {
        cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(10000),
        });
      } catch (cloudErr) {
        const errMsg = cloudErr instanceof Error ? cloudErr.message : 'Timeout hoặc lỗi kết nối';
        return NextResponse.json(
          {
            error: `Không thể kết nối đến dịch vụ lưu trữ hình ảnh Cloudinary cho tệp thứ ${i + 1}: ${errMsg}`,
            code: 'STORAGE_CONNECTION_FAILED',
          },
          { status: 502 }
        );
      }

      if (!cloudRes.ok) {
        const errorData = await cloudRes.json().catch(() => null);
        const errorDetail = errorData?.error?.message || cloudRes.statusText || 'Lỗi không xác định từ Cloudinary';
        return NextResponse.json(
          {
            error: `Dịch vụ lưu trữ ảnh Cloudinary từ chối tệp thứ ${i + 1}: ${errorDetail}`,
            code: 'STORAGE_UPLOAD_FAILED',
          },
          { status: 502 }
        );
      }

      const cloudData = await cloudRes.json().catch(() => null);
      if (!cloudData || !cloudData.secure_url) {
        return NextResponse.json(
          {
            error: `Dịch vụ lưu trữ ảnh Cloudinary không trả về secure_url cho tệp thứ ${i + 1}`,
            code: 'STORAGE_RESPONSE_INVALID',
          },
          { status: 502 }
        );
      }

      uploadedUrls.push(cloudData.secure_url);
    }

    logAudit('UPLOAD_IMAGES', 'batch_upload', { count: uploadedUrls.length, folder: folder || 'default' }, auth.principal);

    return NextResponse.json({
      success: true,
      count: uploadedUrls.length,
      urls: uploadedUrls,
      message: `Đã tải lên thành công ${uploadedUrls.length} hình ảnh`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error uploading images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
