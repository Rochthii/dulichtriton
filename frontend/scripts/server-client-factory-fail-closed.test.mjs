import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

test('server Supabase client factory fail-closed invariants', async (t) => {
  // Save original environment
  const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const origAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const {
    getSupabaseServerClient,
    requireSupabaseServerClient,
    getSupabaseAnonServerClient,
  } = await import('../src/lib/serverSupabase.ts');

  await t.test('returns null and throws when SUPABASE_SERVICE_ROLE_KEY is missing (even if anon key is set)', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-project.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'ey-anon-token-12345';

    // Must return null, NEVER fallback to anon key
    const client = getSupabaseServerClient();
    assert.equal(client, null, 'getSupabaseServerClient must return null when service_role key is missing');

    // requireSupabaseServerClient must throw fail-closed error
    assert.throws(
      () => requireSupabaseServerClient(),
      /fail-closed/i,
      'requireSupabaseServerClient must throw fail-closed error when service_role key is missing'
    );
  });

  await t.test('returns null and throws when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'ey-service-role-token-12345';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const client = getSupabaseServerClient();
    assert.equal(client, null, 'getSupabaseServerClient must return null when URL is missing');

    assert.throws(
      () => requireSupabaseServerClient(),
      /fail-closed/i,
      'requireSupabaseServerClient must throw fail-closed error when URL is missing'
    );
  });

  await t.test('rejects placeholder or blank values in URL or service key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder';

    assert.equal(getSupabaseServerClient(), null);
    assert.throws(() => requireSupabaseServerClient(), /fail-closed/i);

    process.env.NEXT_PUBLIC_SUPABASE_URL = '   ';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '   ';
    assert.equal(getSupabaseServerClient(), null);
    assert.throws(() => requireSupabaseServerClient(), /fail-closed/i);
  });

  await t.test('instantiates valid SupabaseClient when valid credentials exist', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-live-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'ey-real-service-role-key-xyz987';

    const client = getSupabaseServerClient();
    assert.ok(client, 'Client should be instantiated with valid credentials');
    assert.equal(typeof client.from, 'function', 'Client should have standard Supabase methods');

    const requiredClient = requireSupabaseServerClient();
    assert.ok(requiredClient, 'requireSupabaseServerClient should return client');
    assert.equal(typeof requiredClient.from, 'function');
  });

  await t.test('static code analysis: no fallback anti-patterns or hardcoded URLs in server code', () => {
    const filesToCheck = [
      path.join(repoRoot, 'frontend', 'src', 'lib', 'dataCache.ts'),
      path.join(repoRoot, 'frontend', 'src', 'lib', 'serverSupabase.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'audit-logs', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'stats', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'feedback', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'places', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'videos', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'itineraries', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'knowledge-base', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'revalidate', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'upload', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'scrape-images', 'route.ts'),
      path.join(repoRoot, 'frontend', 'src', 'app', 'api', 'v1', 'admin', 'gmaps-scraper', 'route.ts'),
    ];

    const fallbackPattern = /SUPABASE_SERVICE_ROLE_KEY\s*\|\|/;
    const hardcodedUrlPattern = /knmlbwsmfljlabhvqfid/;

    for (const filePath of filesToCheck) {
      assert.ok(fs.existsSync(filePath), `File must exist: ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf8');

      assert.equal(
        fallbackPattern.test(content),
        false,
        `File ${path.basename(filePath)} must NOT contain fallback 'SUPABASE_SERVICE_ROLE_KEY ||'`
      );

      assert.equal(
        hardcodedUrlPattern.test(content),
        false,
        `File ${path.basename(filePath)} must NOT contain hardcoded Supabase project ID 'knmlbwsmfljlabhvqfid'`
      );
    }
  });

  // Restore environment
  if (origUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl; else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (origServiceKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = origServiceKey; else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (origAnonKey !== undefined) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origAnonKey; else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});
