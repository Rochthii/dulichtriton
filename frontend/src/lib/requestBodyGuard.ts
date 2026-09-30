import type { NextRequest } from 'next/server';

/**
 * Mặc định giới hạn kích thước request body cho upload: 10MB (10,485,760 bytes).
 * Ngăn chặn DoS / OOM do payload lớn hoặc chuỗi Base64 ảnh khổng lồ.
 */
export const DEFAULT_MAX_BODY_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface JsonBodyReadOptions {
  maxBytes?: number;
  envVarName?: string;
}

export type JsonBodyReadResult<T = unknown> =
  | { ok: true; data: T; byteCount: number }
  | { ok: false; status: 400 | 413; error: string; code: string; byteCount?: number };

/**
 * Lấy giới hạn dung lượng request body từ biến môi trường hoặc fallback về mặc định.
 */
export function getMaxBodySizeBytes(
  envVarName = 'ADMIN_UPLOAD_MAX_BYTES',
  defaultBytes = DEFAULT_MAX_BODY_SIZE_BYTES
): number {
  const envVal = process.env[envVarName];
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultBytes;
}

/**
 * Đọc và kiểm tra kích thước request body đa lớp:
 * 1. Kiểm tra sớm Content-Length header (nếu có) để fail-closed tức thì.
 * 2. Đọc luồng stream byte thực tế, ngắt stream ngay khi tổng bytes vượt ngưỡng.
 * 3. Phân tích cú pháp JSON an toàn, trả về lỗi 400 rõ ràng nếu payload malformed.
 */
export async function readJsonBodyWithLimit<T = unknown>(
  req: NextRequest | Request,
  options?: JsonBodyReadOptions
): Promise<JsonBodyReadResult<T>> {
  const maxBytes = options?.maxBytes ?? getMaxBodySizeBytes(options?.envVarName);

  // 1. Kiểm tra sớm header Content-Length (Fast-path)
  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const parsedLen = parseInt(contentLengthHeader, 10);
    if (!Number.isFinite(parsedLen) || parsedLen < 0) {
      return {
        ok: false,
        status: 400,
        error: 'Header Content-Length không hợp lệ',
        code: 'INVALID_CONTENT_LENGTH',
      };
    }
    if (parsedLen > maxBytes) {
      return {
        ok: false,
        status: 413,
        error: `Dung lượng payload (${parsedLen} bytes) vượt quá giới hạn cho phép (${maxBytes} bytes)`,
        code: 'PAYLOAD_TOO_LARGE',
        byteCount: parsedLen,
      };
    }
  }

  // 2. Đọc dữ liệu từ body stream (phòng thủ trường hợp Content-Length giả mạo hoặc chunked)
  if (!req.body) {
    return { ok: true, data: {} as T, byteCount: 0 };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          try {
            await reader.cancel();
          } catch {
            // bỏ qua lỗi khi ngắt stream
          }
          return {
            ok: false,
            status: 413,
            error: `Dung lượng payload stream thực tế vượt quá giới hạn cho phép (${maxBytes} bytes)`,
            code: 'PAYLOAD_TOO_LARGE',
            byteCount: totalBytes,
          };
        }
        chunks.push(value);
      }
    }
  } catch (readErr) {
    return {
      ok: false,
      status: 400,
      error: 'Không thể đọc nội dung stream request',
      code: 'BODY_READ_ERROR',
    };
  }

  if (chunks.length === 0) {
    return { ok: true, data: {} as T, byteCount: 0 };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder('utf-8').decode(combined);
  try {
    const data = JSON.parse(text) as T;
    return { ok: true, data, byteCount: totalBytes };
  } catch {
    return {
      ok: false,
      status: 400,
      error: 'Payload không phải là định dạng JSON hợp lệ',
      code: 'INVALID_JSON',
      byteCount: totalBytes,
    };
  }
}
