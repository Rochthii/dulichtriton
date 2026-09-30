import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import Module, { createRequire } from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const __dirname = dirname(fileURLToPath(import.meta.url));

// Register TypeScript and path alias loader for @/
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const rel = request.slice(2);
    const resolvedPath = path.resolve(__dirname, '../src', rel);
    for (const ext of ['', '.ts', '.tsx', '.js']) {
      if (fs.existsSync(resolvedPath + ext)) return resolvedPath + ext;
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

const routePath = path.resolve(__dirname, '../src/app/api/v1/admin/upload/route.ts');

function loadRoute() {
  const { outputText } = typescript.transpileModule(fs.readFileSync(routePath, 'utf8'), {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const routeModule = new Module(routePath);
  routeModule.filename = routePath;
  routeModule.paths = Module._nodeModulePaths(dirname(routePath));
  routeModule._compile(outputText, routePath);
  return routeModule.exports;
}

test('admin upload route enforces server-side guard on POST, kill-switch, and principal logging', async () => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 77,
    email: 'upload_admin@triton.gov.vn',
    full_name: 'Admin Upload Manager',
    role: 'ADMIN',
    is_active: true,
    session_hash: sessionHash,
    session_created_at: new Date(Date.now() - 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  const dbRequests = [];
  const errors = [];

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    dbRequests.push({ method: req.method, url: url.toString(), body });

    res.setHeader('content-type', 'application/json');

    if (url.pathname === '/rest/v1/admin_users') {
      if (url.searchParams.get('session_hash') === `eq.${account.session_hash}` && account.is_active) {
        res.end(JSON.stringify(account));
      } else {
        res.end('null');
      }
    } else if (url.pathname === '/rest/v1/audit_logs') {
      res.statusCode = 201;
      res.end('{}');
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });

  await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));

  const envNames = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV',
    'ADMIN_LOCAL_HTTP',
    'ADMIN_MUTATIONS_ENABLED',
    'ADMIN_UPLOAD_MAX_BYTES',
  ];
  const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const oldConsoleError = console.error;
  const originalFetch = globalThis.fetch;

  let cloudinaryStatus = 200;
  let cloudinaryResponseBody = { secure_url: 'https://res.cloudinary.com/dulichtriton/image/upload/v12345/chua-xa-ton.jpg' };
  let cloudinaryThrow = false;

  globalThis.fetch = async function (input, init) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (urlStr.includes('api.cloudinary.com')) {
      if (cloudinaryThrow) {
        throw new Error('Connection refused to api.cloudinary.com');
      }
      return new Response(JSON.stringify(cloudinaryResponseBody), {
        status: cloudinaryStatus,
        headers: { 'content-type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };

  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${dbServer.address().port}`,
    SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
    NODE_ENV: 'production',
    ADMIN_LOCAL_HTTP: 'false',
    ADMIN_MUTATIONS_ENABLED: 'true',
  });

  console.error = (...args) => errors.push(args.map(String).join(' '));

  try {
    const { POST } = loadRoute();

    const makeReq = (method, pathUrl, cookie = '', bodyObj = null) => {
      const init = {
        method,
        headers: {
          ...(cookie ? { cookie } : {}),
          ...(bodyObj ? { 'content-type': 'application/json' } : {}),
        },
        ...(bodyObj ? { body: JSON.stringify(bodyObj) } : {}),
      };
      return new NextRequest(`http://localhost${pathUrl}`, init);
    };

    const prodCookie = `__Host-triton_admin_session=${token}`;

    // 1. Anonymous request (Missing cookie) -> MUST return 401
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/upload', '', { files: ['https://example.com/photo.jpg'] }))).status, 401);

    // 2. Unauthorized Role (e.g. VIEWER) -> MUST return 403
    account.role = 'VIEWER';
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, { files: ['https://example.com/photo.jpg'] }))).status, 403);
    account.role = 'ADMIN'; // restore

    // 3. Authorized Admin: POST -> 200 OK & Audit Log with principal
    const postRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['https://example.com/tri-ton-landscape.jpg'],
      folder: 'places',
    }));
    assert.equal(postRes.status, 200);
    const postBody = await postRes.json();
    assert.equal(postBody.success, true);
    assert.equal(postBody.count, 1);
    assert.equal(postBody.urls[0], 'https://example.com/tri-ton-landscape.jpg');

    // Wait for audit log write
    for (let attempt = 0; attempt < 50; attempt++) {
      const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('UPLOAD_IMAGES'));
      if (audit) {
        assert.ok(audit.body.includes('Admin Upload Manager'));
        assert.ok(audit.body.includes('ADMIN'));
        assert.ok(audit.body.includes('image_uploads'));
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // 4. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false -> 503
    process.env.ADMIN_MUTATIONS_ENABLED = 'false';
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, { files: ['https://example.com/photo.jpg'] }))).status, 503);
    process.env.ADMIN_MUTATIONS_ENABLED = 'true'; // restore

    // 5. Payload Too Large: Content-Length header exceeds default limit (10MB) -> 413 PAYLOAD_TOO_LARGE
    const oversizedLengthReq = new NextRequest('http://localhost/api/v1/admin/upload', {
      method: 'POST',
      headers: {
        cookie: prodCookie,
        'content-type': 'application/json',
        'content-length': '15728640', // 15MB > 10MB
      },
      body: JSON.stringify({ files: ['https://example.com/photo.jpg'] }),
    });
    const oversizedLengthRes = await POST(oversizedLengthReq);
    assert.equal(oversizedLengthRes.status, 413);
    const oversizedLengthJson = await oversizedLengthRes.json();
    assert.equal(oversizedLengthJson.code, 'PAYLOAD_TOO_LARGE');
    assert.ok(oversizedLengthJson.error.includes('vượt quá giới hạn cho phép'));

    // 6. Payload Too Large: Actual streaming bytes exceed configured limit via ADMIN_UPLOAD_MAX_BYTES -> 413
    process.env.ADMIN_UPLOAD_MAX_BYTES = '2048'; // 2KB limit for testing
    const oversizedStreamReq = new NextRequest('http://localhost/api/v1/admin/upload', {
      method: 'POST',
      headers: {
        cookie: prodCookie,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        files: ['https://example.com/' + 'a'.repeat(3000)], // > 3000 bytes
        folder: 'test',
      }),
    });
    const oversizedStreamRes = await POST(oversizedStreamReq);
    assert.equal(oversizedStreamRes.status, 413);
    const oversizedStreamJson = await oversizedStreamRes.json();
    assert.equal(oversizedStreamJson.code, 'PAYLOAD_TOO_LARGE');
    delete process.env.ADMIN_UPLOAD_MAX_BYTES; // restore

    // 7. Invalid Content-Length header (< 0 or non-numeric) -> 400 INVALID_CONTENT_LENGTH
    const invalidLengthReq = new NextRequest('http://localhost/api/v1/admin/upload', {
      method: 'POST',
      headers: {
        cookie: prodCookie,
        'content-type': 'application/json',
        'content-length': '-999',
      },
      body: JSON.stringify({ files: ['https://example.com/photo.jpg'] }),
    });
    const invalidLengthRes = await POST(invalidLengthReq);
    assert.equal(invalidLengthRes.status, 400);
    const invalidLengthJson = await invalidLengthRes.json();
    assert.equal(invalidLengthJson.code, 'INVALID_CONTENT_LENGTH');

    // 8. Malformed JSON payload -> 400 INVALID_JSON
    const malformedReq = new NextRequest('http://localhost/api/v1/admin/upload', {
      method: 'POST',
      headers: {
        cookie: prodCookie,
        'content-type': 'application/json',
      },
      body: '{"files": ["broken-json...',
    });
    const malformedRes = await POST(malformedReq);
    assert.equal(malformedRes.status, 400);
    const malformedJson = await malformedRes.json();
    assert.equal(malformedJson.code, 'INVALID_JSON');

    // 9. Missing or empty files array -> 400
    const emptyFilesRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, { files: [] }));
    assert.equal(emptyFilesRes.status, 400);
    const nonArrayFilesRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, { files: 'not-array' }));
    assert.equal(nonArrayFilesRes.status, 400);

    // 10. Disallowed MIME Types: SVG XSS vector, HTML, PDF -> 400 DISALLOWED_MIME_TYPE
    const svgRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='],
    }));
    assert.equal(svgRes.status, 400);
    const svgJson = await svgRes.json();
    assert.equal(svgJson.code, 'DISALLOWED_MIME_TYPE');

    const htmlRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['data:text/html;base64,PGh0bWw+PC9odG1sPg=='],
    }));
    assert.equal(htmlRes.status, 400);
    const htmlJson = await htmlRes.json();
    assert.equal(htmlJson.code, 'DISALLOWED_MIME_TYPE');

    const pdfRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['data:application/pdf;base64,JVBERi0xLjQK'],
    }));
    assert.equal(pdfRes.status, 400);
    const pdfJson = await pdfRes.json();
    assert.equal(pdfJson.code, 'DISALLOWED_MIME_TYPE');

    // 11. Anti-Spoofing: Declared JPEG but actual binary is SVG script -> 400 MIME_SIGNATURE_MISMATCH
    const spoofedRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['data:image/jpeg;base64,' + Buffer.from('<svg onload=alert(1)>').toString('base64')],
    }));
    assert.equal(spoofedRes.status, 400);
    const spoofedJson = await spoofedRes.json();
    assert.equal(spoofedJson.code, 'MIME_SIGNATURE_MISMATCH');

    // 12. Remote URL Validation: HTTP scheme -> 400 INVALID_SCHEME, disallowed extension -> 400 DISALLOWED_FILE_EXTENSION
    const httpUrlRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['http://example.com/photo.jpg'],
    }));
    assert.equal(httpUrlRes.status, 400);
    const httpUrlJson = await httpUrlRes.json();
    assert.equal(httpUrlJson.code, 'INVALID_SCHEME');

    const exeUrlRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['https://example.com/payload.exe'],
    }));
    assert.equal(exeUrlRes.status, 400);
    const exeUrlJson = await exeUrlRes.json();
    assert.equal(exeUrlJson.code, 'DISALLOWED_FILE_EXTENSION');

    const svgUrlRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: ['https://example.com/vector.svg'],
    }));
    assert.equal(svgUrlRes.status, 400);
    const svgUrlJson = await svgUrlRes.json();
    assert.equal(svgUrlJson.code, 'DISALLOWED_FILE_EXTENSION');

    // 13. Mixed Batch Atomic Rejection: 1 valid JPG + 1 invalid SVG -> Entire request rejected with 400
    const mixedRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: [
        'https://example.com/valid-photo.jpg',
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==',
      ],
    }));
    assert.equal(mixedRes.status, 400);
    const mixedJson = await mixedRes.json();
    assert.equal(mixedJson.code, 'DISALLOWED_MIME_TYPE');

    // 14. Valid Base64 JPEG Upload: Correct magic bytes -> 200 OK (Real Cloudinary upload, Zero Unsplash)
    cloudinaryStatus = 200;
    cloudinaryThrow = false;
    cloudinaryResponseBody = { secure_url: 'https://res.cloudinary.com/dulichtriton/image/upload/v1720000000/chua-xa-ton.jpg' };

    const validJpegB64 = 'data:image/jpeg;base64,' + Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]).toString('base64');
    const validBase64Res = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: [validJpegB64],
      folder: 'places',
    }));
    assert.equal(validBase64Res.status, 200);
    const validBase64Json = await validBase64Res.json();
    assert.equal(validBase64Json.success, true);
    assert.equal(validBase64Json.count, 1);
    assert.equal(validBase64Json.urls[0], 'https://res.cloudinary.com/dulichtriton/image/upload/v1720000000/chua-xa-ton.jpg');
    assert.equal(validBase64Json.urls[0].includes('unsplash.com'), false);

    // 15. Cloudinary API Failure: Must fail-closed with 502 STORAGE_UPLOAD_FAILED, ZERO Unsplash fallback
    cloudinaryStatus = 400;
    cloudinaryResponseBody = { error: { message: 'Invalid upload preset' } };
    const cloudFailRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: [validJpegB64],
      folder: 'places',
    }));
    assert.equal(cloudFailRes.status, 502);
    const cloudFailJson = await cloudFailRes.json();
    assert.equal(cloudFailJson.code, 'STORAGE_UPLOAD_FAILED');
    assert.ok(cloudFailJson.error.includes('Invalid upload preset'));
    assert.equal(JSON.stringify(cloudFailJson).includes('unsplash.com'), false);

    // 16. Cloudinary Connection Failure: Must fail-closed with 502 STORAGE_CONNECTION_FAILED, ZERO Unsplash fallback
    cloudinaryThrow = true;
    const cloudConnFailRes = await POST(makeReq('POST', '/api/v1/admin/upload', prodCookie, {
      files: [validJpegB64],
      folder: 'places',
    }));
    assert.equal(cloudConnFailRes.status, 502);
    const cloudConnFailJson = await cloudConnFailRes.json();
    assert.equal(cloudConnFailJson.code, 'STORAGE_CONNECTION_FAILED');
    assert.equal(JSON.stringify(cloudConnFailJson).includes('unsplash.com'), false);
    cloudinaryThrow = false; // restore

    // 17. Static Code Invariant: Route file must NOT contain any reference to unsplash
    const routeSource = fs.readFileSync(routePath, 'utf8');
    assert.equal(routeSource.toLowerCase().includes('unsplash'), false, 'Route upload must not contain any unsplash references');

    // Verify token secrecy
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
