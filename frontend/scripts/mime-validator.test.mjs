import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  detectMimeFromMagicBytes,
  validateImageFile,
} from '../src/lib/mimeValidator.ts';

test('P01-026: Image MIME Validator & Binary Signature Suite', async (t) => {
  // Fixtures: Real Magic Byte Base64 Payloads
  const VALID_JPEG_B64 = 'data:image/jpeg;base64,' + Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]).toString('base64');
  const VALID_PNG_B64 = 'data:image/png;base64,' + Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]).toString('base64');
  const VALID_WEBP_B64 = 'data:image/webp;base64,' + Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]).toString('base64');
  const VALID_AVIF_B64 = 'data:image/avif;base64,' + Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]).toString('base64');

  // 1. Constants verification
  await t.test('1. Allowlist constants coverage', () => {
    assert.deepEqual(ALLOWED_IMAGE_MIME_TYPES, ['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    assert.deepEqual(ALLOWED_IMAGE_EXTENSIONS, ['.jpg', '.jpeg', '.png', '.webp', '.avif']);
  });

  // 2. detectMimeFromMagicBytes unit tests
  await t.test('2. detectMimeFromMagicBytes correctly identifies binary headers', () => {
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0xff, 0xd8, 0xff])), 'image/jpeg');
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])), 'image/webp');
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66])), 'image/avif');

    // Unknown or invalid signatures
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x47, 0x49, 0x46, 0x38])), null); // GIF
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46])), null); // PDF
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x3c, 0x73, 0x76, 0x67])), null); // <svg
    assert.equal(detectMimeFromMagicBytes(new Uint8Array([0x00])), null); // short
  });

  // 3. Data URI Positive Validations
  await t.test('3. Accepts valid Base64 image Data URIs', () => {
    const jpegRes = validateImageFile(VALID_JPEG_B64);
    assert.equal(jpegRes.isValid, true);
    if (jpegRes.isValid) {
      assert.equal(jpegRes.mime, 'image/jpeg');
      assert.equal(jpegRes.isRemoteUrl, false);
    }

    const pngRes = validateImageFile(VALID_PNG_B64);
    assert.equal(pngRes.isValid, true);
    if (pngRes.isValid) {
      assert.equal(pngRes.mime, 'image/png');
      assert.equal(pngRes.isRemoteUrl, false);
    }

    const webpRes = validateImageFile(VALID_WEBP_B64);
    assert.equal(webpRes.isValid, true);
    if (webpRes.isValid) {
      assert.equal(webpRes.mime, 'image/webp');
    }

    const avifRes = validateImageFile(VALID_AVIF_B64);
    assert.equal(avifRes.isValid, true);
    if (avifRes.isValid) {
      assert.equal(avifRes.mime, 'image/avif');
    }
  });

  // 4. Disallowed MIME Types (SVG XSS vector, HTML, PDF, GIF)
  await t.test('4. Strictly rejects disallowed MIME types', () => {
    // SVG XSS attack vector
    const svgRes = validateImageFile('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==');
    assert.equal(svgRes.isValid, false);
    if (!svgRes.isValid) {
      assert.equal(svgRes.code, 'DISALLOWED_MIME_TYPE');
      assert.ok(svgRes.error.includes('image/svg+xml'));
    }

    // HTML payload
    const htmlRes = validateImageFile('data:text/html;base64,PGh0bWw+PC9odG1sPg==');
    assert.equal(htmlRes.isValid, false);
    if (!htmlRes.isValid) {
      assert.equal(htmlRes.code, 'DISALLOWED_MIME_TYPE');
    }

    // PDF document
    const pdfRes = validateImageFile('data:application/pdf;base64,JVBERi0xLjQK');
    assert.equal(pdfRes.isValid, false);
    if (!pdfRes.isValid) {
      assert.equal(pdfRes.code, 'DISALLOWED_MIME_TYPE');
    }

    // GIF animation
    const gifRes = validateImageFile('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    assert.equal(gifRes.isValid, false);
    if (!gifRes.isValid) {
      assert.equal(gifRes.code, 'DISALLOWED_MIME_TYPE');
    }
  });

  // 5. Anti-Spoofing: Magic Bytes Mismatch vs Declared Header
  await t.test('5. Detects spoofed MIME headers where content does not match', () => {
    // Declares image/jpeg but payload is SVG XML text (<svg onload=alert(1)>)
    const spoofedSvgRes = validateImageFile('data:image/jpeg;base64,' + Buffer.from('<svg onload=alert(1)>').toString('base64'));
    assert.equal(spoofedSvgRes.isValid, false);
    if (!spoofedSvgRes.isValid) {
      assert.equal(spoofedSvgRes.code, 'MIME_SIGNATURE_MISMATCH');
    }

    // Declares image/jpeg but binary is PNG
    const spoofedPngRes = validateImageFile('data:image/jpeg;base64,' + Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64'));
    assert.equal(spoofedPngRes.isValid, false);
    if (!spoofedPngRes.isValid) {
      assert.equal(spoofedPngRes.code, 'MIME_SIGNATURE_MISMATCH');
    }

    // Declares image/png but binary is JPEG
    const spoofedJpegRes = validateImageFile('data:image/png;base64,' + Buffer.from([0xff, 0xd8, 0xff, 0xe0]).toString('base64'));
    assert.equal(spoofedJpegRes.isValid, false);
    if (!spoofedJpegRes.isValid) {
      assert.equal(spoofedJpegRes.code, 'MIME_SIGNATURE_MISMATCH');
    }
  });

  // 6. Remote URLs validation (HTTPS, valid extensions)
  await t.test('6. Validates remote URLs properly', () => {
    // Valid HTTPS images
    const validJpg = validateImageFile('https://example.com/photos/chua-xa-ton.jpg');
    assert.equal(validJpg.isValid, true);
    if (validJpg.isValid) {
      assert.equal(validJpg.mime, 'image/jpeg');
      assert.equal(validJpg.isRemoteUrl, true);
    }

    const validPng = validateImageFile('https://example.com/photos/ho-ta-pa.png');
    assert.equal(validPng.isValid, true);

    const validWebp = validateImageFile('https://example.com/photos/nui-to.webp?w=1080');
    assert.equal(validWebp.isValid, true);

    const validAvif = validateImageFile('https://example.com/photos/doi-tuc-dup.avif');
    assert.equal(validAvif.isValid, true);

    // Insecure HTTP rejected
    const httpRes = validateImageFile('http://example.com/photos/chua-xa-ton.jpg');
    assert.equal(httpRes.isValid, false);
    if (!httpRes.isValid) {
      assert.equal(httpRes.code, 'INVALID_SCHEME');
    }

    // Dangerous extensions rejected
    const exeRes = validateImageFile('https://example.com/malware.exe');
    assert.equal(exeRes.isValid, false);
    if (!exeRes.isValid) {
      assert.equal(exeRes.code, 'DISALLOWED_FILE_EXTENSION');
    }

    const svgUrlRes = validateImageFile('https://example.com/vector.svg');
    assert.equal(svgUrlRes.isValid, false);
    if (!svgUrlRes.isValid) {
      assert.equal(svgUrlRes.code, 'DISALLOWED_FILE_EXTENSION');
    }

    const pdfUrlRes = validateImageFile('https://example.com/document.pdf');
    assert.equal(pdfUrlRes.isValid, false);
    if (!pdfUrlRes.isValid) {
      assert.equal(pdfUrlRes.code, 'DISALLOWED_FILE_EXTENSION');
    }

    const noExtRes = validateImageFile('https://example.com/photo');
    assert.equal(noExtRes.isValid, false);
    if (!noExtRes.isValid) {
      assert.equal(noExtRes.code, 'DISALLOWED_FILE_EXTENSION');
    }
  });

  // 7. Malformed file payloads
  await t.test('7. Handles malformed or non-string payloads', () => {
    assert.equal(validateImageFile(null).isValid, false);
    assert.equal(validateImageFile(undefined).isValid, false);
    assert.equal(validateImageFile(12345).isValid, false);
    assert.equal(validateImageFile({}).isValid, false);
    assert.equal(validateImageFile('').isValid, false);
    assert.equal(validateImageFile('   ').isValid, false);
    assert.equal(validateImageFile('not-a-url-or-data-uri').isValid, false);
    assert.equal(validateImageFile('data:bad-format').isValid, false);
  });
});
