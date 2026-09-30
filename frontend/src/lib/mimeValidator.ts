/**
 * Danh sách MIME type hợp lệ và an toàn cho tải lên hình ảnh tại Du Lịch Tri Tôn.
 * Tuyệt đối CẤM image/svg+xml (chứa nguy cơ XSS stored), text/html, application/pdf, v.v.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
] as const;

export type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];

export type ImageValidationResult =
  | {
      isValid: true;
      mime: AllowedImageMimeType;
      isRemoteUrl: boolean;
      sanitizedUrl?: string;
    }
  | {
      isValid: false;
      error: string;
      code:
        | 'INVALID_FILE_PAYLOAD'
        | 'INVALID_DATA_URI'
        | 'INVALID_SCHEME'
        | 'DISALLOWED_MIME_TYPE'
        | 'DISALLOWED_FILE_EXTENSION'
        | 'MIME_SIGNATURE_MISMATCH';
    };

/**
 * Thẩm định chữ ký nhị phân (Magic Bytes) của tệp tin ảnh từ mảng buffer.
 */
export function detectMimeFromMagicBytes(bytes: Uint8Array): AllowedImageMimeType | null {
  if (bytes.length < 3) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF .... WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return 'image/webp';
  }

  // AVIF: .... ftyp (avif | mif1 | avis)
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70 // p
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand === 'avif' || brand === 'mif1' || brand === 'avis') {
      return 'image/avif';
    }
  }

  return null;
}

/**
 * Thẩm định định dạng và tính toàn vẹn của tệp tin ảnh đầu vào (URL từ xa hoặc Base64 Data URI).
 */
export function validateImageFile(file: unknown): ImageValidationResult {
  if (typeof file !== 'string' || !file.trim()) {
    return {
      isValid: false,
      error: 'Dữ liệu tệp tải lên phải là chuỗi đường dẫn URL hoặc Data URI hợp lệ',
      code: 'INVALID_FILE_PAYLOAD',
    };
  }

  const trimmed = file.trim();

  // 1. Trường hợp là đường dẫn URL từ xa
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return {
        isValid: false,
        error: 'Đường dẫn URL ảnh không hợp lệ',
        code: 'INVALID_FILE_PAYLOAD',
      };
    }

    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Chỉ chấp nhận URL ảnh sử dụng giao thức HTTPS bảo mật',
        code: 'INVALID_SCHEME',
      };
    }

    const pathname = parsed.pathname.toLowerCase();
    const extMatch = pathname.match(/\.([a-z0-9]+)$/);
    if (!extMatch) {
      return {
        isValid: false,
        error: `Đường dẫn ảnh thiếu phần mở rộng tệp tin hợp lệ. Chấp nhận: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
        code: 'DISALLOWED_FILE_EXTENSION',
      };
    }

    const ext = `.${extMatch[1]}` as AllowedImageExtension;
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Phần mở rộng tệp '${ext}' không được phép. Chỉ chấp nhận: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
        code: 'DISALLOWED_FILE_EXTENSION',
      };
    }

    let mime: AllowedImageMimeType = 'image/jpeg';
    if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.avif') mime = 'image/avif';

    return {
      isValid: true,
      mime,
      isRemoteUrl: true,
      sanitizedUrl: parsed.toString(),
    };
  }

  // 2. Trường hợp là Base64 Data URI
  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/);
    if (!match) {
      return {
        isValid: false,
        error: 'Cú pháp Base64 Data URI không hợp lệ. Phải có định dạng data:<mime>;base64,<data>',
        code: 'INVALID_DATA_URI',
      };
    }

    const declaredMime = match[1].toLowerCase() as AllowedImageMimeType;
    const base64Data = match[2];

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(declaredMime)) {
      return {
        isValid: false,
        error: `Định dạng MIME '${declaredMime}' không được phép. Chỉ chấp nhận: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
        code: 'DISALLOWED_MIME_TYPE',
      };
    }

    if (!base64Data || base64Data.length < 4) {
      return {
        isValid: false,
        error: 'Nội dung tệp Base64 rỗng hoặc không hợp lệ',
        code: 'INVALID_DATA_URI',
      };
    }

    // Decode tối đa 32 ký tự đầu để kiểm tra magic bytes
    let headerBytes: Uint8Array;
    try {
      const sample = base64Data.slice(0, 32);
      const buf = Buffer.from(sample, 'base64');
      headerBytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } catch {
      return {
        isValid: false,
        error: 'Không thể giải mã dữ liệu Base64',
        code: 'INVALID_DATA_URI',
      };
    }

    const detectedMime = detectMimeFromMagicBytes(headerBytes);
    if (!detectedMime) {
      return {
        isValid: false,
        error: `Không thể xác minh chữ ký nhị phân (magic bytes) của tệp ảnh cho định dạng '${declaredMime}'`,
        code: 'MIME_SIGNATURE_MISMATCH',
      };
    }

    if (detectedMime !== declaredMime) {
      return {
        isValid: false,
        error: `Chữ ký nhị phân của tệp (${detectedMime}) không khớp với định dạng MIME khai báo (${declaredMime})`,
        code: 'MIME_SIGNATURE_MISMATCH',
      };
    }

    return {
      isValid: true,
      mime: declaredMime,
      isRemoteUrl: false,
    };
  }

  // 3. Không thuộc HTTP URL cũng không phải Data URI
  return {
    isValid: false,
    error: 'Dữ liệu tệp không hợp lệ: phải là URL HTTPS hoặc Base64 Data URI',
    code: 'INVALID_FILE_PAYLOAD',
  };
}
