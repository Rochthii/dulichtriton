import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');

test('P01-025: Request Body Size Limit & JSON Validation Suite', async (t) => {
  const {
    DEFAULT_MAX_BODY_SIZE_BYTES,
    getMaxBodySizeBytes,
    readJsonBodyWithLimit,
  } = await import('../src/lib/requestBodyGuard.ts');

  // 1. Helper function getMaxBodySizeBytes
  await t.test('1. getMaxBodySizeBytes returns configured or default limits', () => {
    assert.equal(getMaxBodySizeBytes(), DEFAULT_MAX_BODY_SIZE_BYTES);
    assert.equal(DEFAULT_MAX_BODY_SIZE_BYTES, 10 * 1024 * 1024);

    const oldEnv = process.env.TEST_UPLOAD_MAX_BYTES;
    try {
      process.env.TEST_UPLOAD_MAX_BYTES = '2048';
      assert.equal(getMaxBodySizeBytes('TEST_UPLOAD_MAX_BYTES'), 2048);

      process.env.TEST_UPLOAD_MAX_BYTES = 'invalid-number';
      assert.equal(getMaxBodySizeBytes('TEST_UPLOAD_MAX_BYTES'), DEFAULT_MAX_BODY_SIZE_BYTES);

      process.env.TEST_UPLOAD_MAX_BYTES = '-500';
      assert.equal(getMaxBodySizeBytes('TEST_UPLOAD_MAX_BYTES'), DEFAULT_MAX_BODY_SIZE_BYTES);
    } finally {
      if (oldEnv === undefined) delete process.env.TEST_UPLOAD_MAX_BYTES;
      else process.env.TEST_UPLOAD_MAX_BYTES = oldEnv;
    }
  });

  // 2. Content-Length header checks (Fast-path 413 & 400)
  await t.test('2. Content-Length header evaluation', async (st) => {
    await st.test('rejects request when Content-Length header exceeds limit with 413', async () => {
      const limit = 1000;
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-length': '2000',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message: 'hello' }),
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: limit });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 413);
        assert.equal(result.code, 'PAYLOAD_TOO_LARGE');
        assert.equal(result.byteCount, 2000);
        assert.ok(result.error.includes('vượt quá giới hạn cho phép'));
      }
    });

    await st.test('rejects negative Content-Length header with 400', async () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-length': '-50',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message: 'hello' }),
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: 1000 });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 400);
        assert.equal(result.code, 'INVALID_CONTENT_LENGTH');
      }
    });

    await st.test('rejects non-numeric Content-Length header with 400', async () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-length': 'not-a-number',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message: 'hello' }),
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: 1000 });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 400);
        assert.equal(result.code, 'INVALID_CONTENT_LENGTH');
      }
    });
  });

  // 3. Streaming byte count check (defense against header spoofing or chunked transfer)
  await t.test('3. Streaming byte count evaluation', async (st) => {
    await st.test('rejects stream when cumulative bytes exceed limit with 413', async () => {
      const limit = 50;
      // Body has ~95 bytes, but no content-length header
      const largePayload = JSON.stringify({ data: 'A'.repeat(80) });
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: largePayload,
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: limit });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 413);
        assert.equal(result.code, 'PAYLOAD_TOO_LARGE');
        assert.ok(result.error.includes('stream thực tế'));
      }
    });

    await st.test('accepts stream within limit and parses JSON properly', async () => {
      const payload = { files: ['https://example.com/photo.jpg'], folder: 'test' };
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: 5000 });
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.deepEqual(result.data, payload);
        assert.ok(result.byteCount > 0);
      }
    });
  });

  // 4. Malformed JSON handling
  await t.test('4. Malformed JSON handling', async (st) => {
    await st.test('rejects broken JSON syntax with 400 INVALID_JSON', async () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"files": ["incomplete json...',
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: 5000 });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 400);
        assert.equal(result.code, 'INVALID_JSON');
      }
    });

    await st.test('handles empty body gracefully', async () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      });

      const result = await readJsonBodyWithLimit(req, { maxBytes: 5000 });
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.deepEqual(result.data, {});
        assert.equal(result.byteCount, 0);
      }
    });
  });
});
