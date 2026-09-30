import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const contractDocPath = path.resolve(__dirname, '../../docs/technical-spec/CHAT_SESSION_OWNERSHIP_CONTRACT.md');
const modulePath = path.resolve(__dirname, '../src/lib/chatSessionOwnership.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const streamRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/stream/route.ts');

// Transpile and load TypeScript helper
function loadModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', outputText);
  fn(m, m.exports, (mod) => {
    if (mod === '@/lib/sessionIdentifierContract') {
      const target = path.resolve(__dirname, '../src/lib/sessionIdentifierContract.ts');
      return loadModule(target);
    }
    return require(mod);
  }, path.dirname(filePath), filePath);
  return m.exports;
}

test('P04-005: Chat Session Ownership Contract & History Access Verification', async (t) => {
  const {
    createSessionOwnershipToken,
    verifySessionOwnershipToken,
    extractSessionOwnershipToken,
    verifySessionOwnership,
    SESSION_TOKEN_HEADER,
    SESSION_TOKEN_COOKIE,
  } = loadModule(modulePath);

  // 1. Static Code Invariant
  await t.test('1. Static Code Invariant: Specification and routes enforce session ownership', () => {
    assert.ok(fs.existsSync(contractDocPath), 'CHAT_SESSION_OWNERSHIP_CONTRACT.md must exist');
    const doc = fs.readFileSync(contractDocPath, 'utf8');
    assert.ok(doc.includes('INV-OWN-01'), 'Must specify INV-OWN-01 (HMAC-SHA256 Token Binding)');
    assert.ok(doc.includes('INV-OWN-02'), 'Must specify INV-OWN-02 (Multi-Channel Transport)');
    assert.ok(doc.includes('INV-OWN-03'), 'Must specify INV-OWN-03 (Timing-Safe Verification)');
    assert.ok(doc.includes('INV-OWN-04'), 'Must specify INV-OWN-04 (Fail-Closed Denial on Unowned Session)');
    assert.ok(doc.includes('INV-OWN-05'), 'Must specify INV-OWN-05 (Fresh Session Lifecycle)');

    assert.ok(fs.existsSync(modulePath), 'chatSessionOwnership.ts must exist');

    const queryContent = fs.readFileSync(queryRoutePath, 'utf8');
    assert.ok(queryContent.includes('verifySessionOwnership'), 'query/route.ts must call verifySessionOwnership');
    assert.ok(queryContent.includes('INVALID_SESSION_OWNERSHIP'), 'query/route.ts must return INVALID_SESSION_OWNERSHIP on failure');

    const streamContent = fs.readFileSync(streamRoutePath, 'utf8');
    assert.ok(streamContent.includes('verifySessionOwnership'), 'stream/route.ts must call verifySessionOwnership');
    assert.ok(streamContent.includes('INVALID_SESSION_OWNERSHIP'), 'stream/route.ts must return INVALID_SESSION_OWNERSHIP on failure');
  });

  // 2. Unit Test: Token Generation & Timing-Safe Verification
  await t.test('2. Token Generation & Verification: Deterministic HMAC-SHA256 and constant-time check', () => {
    const sessionA = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    const sessionB = 'e3b0c442-98fc-4c14-9afe-bf4c7a2b9101';

    const tokenA1 = createSessionOwnershipToken(sessionA);
    const tokenA2 = createSessionOwnershipToken(sessionA);
    const tokenB = createSessionOwnershipToken(sessionB);

    assert.equal(tokenA1, tokenA2, 'Token generation must be deterministic for identical session ID');
    assert.notEqual(tokenA1, tokenB, 'Different sessions must have distinct ownership tokens');
    assert.equal(tokenA1.length, 64, 'Token must be 64 hex characters (256-bit SHA-256)');

    // Positive verification
    assert.equal(verifySessionOwnershipToken(sessionA, tokenA1), true, 'Valid token must be verified');

    // Negative verification: mismatched session
    assert.equal(verifySessionOwnershipToken(sessionA, tokenB), false, 'Token of session B must be rejected for session A');

    // Negative verification: corrupted token
    const tampered = tokenA1.slice(0, -1) + (tokenA1.slice(-1) === 'a' ? 'b' : 'a');
    assert.equal(verifySessionOwnershipToken(sessionA, tampered), false, 'Tampered token must be rejected');

    // Negative verification: empty/null/undefined
    assert.equal(verifySessionOwnershipToken(sessionA, ''), false, 'Empty token must be rejected');
    assert.equal(verifySessionOwnershipToken(sessionA, null), false, 'Null token must be rejected');
    assert.equal(verifySessionOwnershipToken(sessionA, undefined), false, 'Undefined token must be rejected');
  });

  // 3. Unit Test: Multi-Channel Token Extraction
  await t.test('3. Multi-Channel Extraction: Header, Cookie, and Body transport', () => {
    const testToken = 'a'.repeat(64);

    // From Header
    const reqWithHeader = {
      headers: new Headers({ [SESSION_TOKEN_HEADER]: testToken }),
    };
    assert.equal(extractSessionOwnershipToken(reqWithHeader), testToken, 'Must extract from HTTP header');

    // From Cookie (NextRequest cookies.get)
    const reqWithCookieGet = {
      cookies: {
        get: (name) => (name === SESSION_TOKEN_COOKIE ? { value: testToken } : undefined),
      },
    };
    assert.equal(extractSessionOwnershipToken(reqWithCookieGet), testToken, 'Must extract from cookies.get');

    // From Cookie (Raw header string)
    const reqWithRawCookie = {
      headers: new Headers({ cookie: `other=123; ${SESSION_TOKEN_COOKIE}=${testToken}; foo=bar` }),
    };
    assert.equal(extractSessionOwnershipToken(reqWithRawCookie), testToken, 'Must extract from raw Cookie header');

    // From Body
    assert.equal(extractSessionOwnershipToken({}, { session_token: testToken }), testToken, 'Must extract from JSON body');

    // Missing token returns null
    assert.equal(extractSessionOwnershipToken({ headers: new Headers() }, {}), null, 'Missing token returns null');
  });

  // 4. Behavioral Simulation: Fresh Session Lifecycle (INV-OWN-05)
  await t.test('4. Fresh Session Lifecycle: New session is granted access and issued token', async () => {
    const freshSessionId = '0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d';
    const mockDb = new Set(); // Empty DB, session not present

    const result = await verifySessionOwnership({
      sessionId: freshSessionId,
      sessionExistsChecker: async (id) => mockDb.has(id),
    });

    assert.equal(result.isOwner, true, 'Fresh session must be granted ownership');
    assert.equal(result.status, 200, 'Fresh session status must be 200');
    assert.equal(result.isNewSession, true, 'isNewSession must be true');
    assert.ok(result.token, 'Must issue fresh ownership token');
    assert.equal(verifySessionOwnershipToken(freshSessionId, result.token), true, 'Issued token must be valid for fresh session');
  });

  // 5. Behavioral Simulation: Legitimate Owner Access
  await t.test('5. Legitimate Owner Access: Existing session with valid matching token is permitted', async () => {
    const existingSessionId = '11111111-2222-4333-8444-555555555555';
    const validToken = createSessionOwnershipToken(existingSessionId);
    const mockDb = new Set([existingSessionId]); // Session exists on DB

    const req = {
      headers: new Headers({ [SESSION_TOKEN_HEADER]: validToken }),
    };

    const result = await verifySessionOwnership({
      sessionId: existingSessionId,
      req,
      sessionExistsChecker: async (id) => mockDb.has(id),
    });

    assert.equal(result.isOwner, true, 'Legitimate owner must be verified');
    assert.equal(result.status, 200, 'Status must be 200');
    assert.equal(result.isNewSession, false, 'isNewSession must be false');
    assert.equal(result.token, validToken, 'Token must match expected token');
  });

  // 6. Negative Simulation: Proof: Session khác owner bị từ chối (INV-OWN-04)
  await t.test('6. Proof: Session khác owner bị từ chối truy cập (HTTP 403)', async () => {
    const victimSessionId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const attackerSessionId = 'ffffffff-gggg-4hhh-8iii-jjjjjjjjjjjj';
    const attackerToken = createSessionOwnershipToken(attackerSessionId);

    const mockDb = new Set([victimSessionId]); // Victim session exists on DB

    // 6.1. Attacker provides NO token at all
    const noTokenResult = await verifySessionOwnership({
      sessionId: victimSessionId,
      req: { headers: new Headers() },
      sessionExistsChecker: async (id) => mockDb.has(id),
    });
    assert.equal(noTokenResult.isOwner, false, 'Access must be denied when token is missing for existing session');
    assert.equal(noTokenResult.status, 403, 'Must return status 403 Forbidden');
    assert.equal(noTokenResult.error, 'INVALID_SESSION_OWNERSHIP', 'Must return INVALID_SESSION_OWNERSHIP code');

    // 6.2. Attacker provides token belonging to another session
    const mismatchedTokenResult = await verifySessionOwnership({
      sessionId: victimSessionId,
      req: { headers: new Headers({ [SESSION_TOKEN_HEADER]: attackerToken }) },
      sessionExistsChecker: async (id) => mockDb.has(id),
    });
    assert.equal(mismatchedTokenResult.isOwner, false, 'Access must be denied when token belongs to another session');
    assert.equal(mismatchedTokenResult.status, 403, 'Must return status 403 Forbidden');
    assert.equal(mismatchedTokenResult.error, 'INVALID_SESSION_OWNERSHIP', 'Must return INVALID_SESSION_OWNERSHIP code');

    // 6.3. Attacker provides fabricated/random token
    const fakeTokenResult = await verifySessionOwnership({
      sessionId: victimSessionId,
      body: { session_token: 'deadbeef'.repeat(8) },
      sessionExistsChecker: async (id) => mockDb.has(id),
    });
    assert.equal(fakeTokenResult.isOwner, false, 'Access must be denied when token is fabricated');
    assert.equal(fakeTokenResult.status, 403, 'Must return status 403 Forbidden');
  });

  // 7. Two-Step Attack Chain Simulation (THREAT_MODEL.md TM-05)
  await t.test('7. Two-Step Attack Chain Simulation: Session takeover attempt across multiple requests is blocked', async () => {
    const sessionVictim = '77777777-8888-4999-8aaa-bbbbbbbbbbbb';
    const sessionAttacker = '22222222-3333-4444-8555-666666666666';

    const db = new Map(); // Simulating DB chat_sessions

    // Step 1: Victim creates session and saves conversation turns
    const victimInit = await verifySessionOwnership({
      sessionId: sessionVictim,
      sessionExistsChecker: async (id) => db.has(id),
    });
    assert.equal(victimInit.isOwner, true);
    const victimToken = victimInit.token;
    // Persist victim session to DB
    db.set(sessionVictim, { turns: [{ role: 'user', content: 'Tôi là du khách VIP cần tư vấn kín.' }] });

    // Step 2: Attacker initiates their own session
    const attackerInit = await verifySessionOwnership({
      sessionId: sessionAttacker,
      sessionExistsChecker: async (id) => db.has(id),
    });
    assert.equal(attackerInit.isOwner, true);
    const attackerToken = attackerInit.token;

    // Step 3 (Attack): Attacker sends request trying to read victim's session using attacker's token
    const attackResult = await verifySessionOwnership({
      sessionId: sessionVictim,
      req: { headers: new Headers({ [SESSION_TOKEN_HEADER]: attackerToken }) },
      sessionExistsChecker: async (id) => db.has(id),
    });
    assert.equal(attackResult.isOwner, false, 'Attacker MUST NOT be allowed to access victim session history');
    assert.equal(attackResult.status, 403, 'Attack request MUST be rejected with HTTP 403');
    assert.equal(attackResult.error, 'INVALID_SESSION_OWNERSHIP');

    // Step 4: Legitimate Victim sends follow-up query with correct token -> ALLOWED
    const legitimateResult = await verifySessionOwnership({
      sessionId: sessionVictim,
      req: { headers: new Headers({ [SESSION_TOKEN_HEADER]: victimToken }) },
      sessionExistsChecker: async (id) => db.has(id),
    });
    assert.equal(legitimateResult.isOwner, true, 'Legitimate victim must be authorized to load history');
    assert.equal(legitimateResult.status, 200);
  });
});
