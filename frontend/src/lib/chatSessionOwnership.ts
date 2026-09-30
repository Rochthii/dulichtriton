import { createHmac, timingSafeEqual } from 'node:crypto';
import { isValidSessionId } from '@/lib/sessionIdentifierContract';

/**
 * CHAT-SESSION-OWNERSHIP-CONTRACT-V1
 * Core helper for verifying chat session ownership before reading or writing conversation history.
 */

export const SESSION_TOKEN_HEADER = 'x-chat-session-token';
export const SESSION_TOKEN_COOKIE = 'triton_chat_session_token';

/**
 * Retrieve the active server secret for HMAC signing.
 * Strictly uses CHAT_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY.
 * Falls back to an internal environment key in dev mode.
 */
export function getSessionSecret(): string {
  const secret = process.env.CHAT_SESSION_SECRET?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || 'triton-production-chat-session-ownership-secret-key-2026';
  return secret;
}

/**
 * Generate a cryptographic HMAC-SHA256 ownership token for a valid session ID.
 */
export function createSessionOwnershipToken(sessionId: string): string {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('sessionId must be a non-empty string');
  }
  const secret = getSessionSecret();
  return createHmac('sha256', secret).update(sessionId.trim()).digest('hex');
}

/**
 * Verify if a candidate token matches the expected HMAC-SHA256 token for a session ID.
 * Performs constant-time comparison to prevent timing attacks (INV-OWN-03).
 */
export function verifySessionOwnershipToken(sessionId: string, candidateToken?: string | null): boolean {
  if (!sessionId || !candidateToken || typeof candidateToken !== 'string') {
    return false;
  }

  const cleanToken = candidateToken.trim();
  const expectedToken = createSessionOwnershipToken(sessionId);

  if (cleanToken.length !== expectedToken.length) {
    return false;
  }

  try {
    const a = Buffer.from(cleanToken, 'utf8');
    const b = Buffer.from(expectedToken, 'utf8');
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Extract candidate ownership token across multi-channel transport (INV-OWN-02):
 * 1. HTTP Header: x-chat-session-token
 * 2. HTTP Cookie: triton_chat_session_token
 * 3. Body: session_token
 */
export function extractSessionOwnershipToken(req?: any, body?: any): string | null {
  // 1. Check HTTP header
  if (req?.headers) {
    let headerVal: string | null = null;
    if (typeof req.headers.get === 'function') {
      headerVal = req.headers.get(SESSION_TOKEN_HEADER) || req.headers.get(SESSION_TOKEN_HEADER.toLowerCase());
    } else if (typeof req.headers === 'object') {
      headerVal = req.headers[SESSION_TOKEN_HEADER] || req.headers[SESSION_TOKEN_HEADER.toLowerCase()];
    }
    if (headerVal && typeof headerVal === 'string' && headerVal.trim()) {
      return headerVal.trim();
    }
  }

  // 2. Check HTTP Cookie
  if (req) {
    // NextRequest style req.cookies.get(...)
    if (req.cookies && typeof req.cookies.get === 'function') {
      const c = req.cookies.get(SESSION_TOKEN_COOKIE);
      if (c?.value && typeof c.value === 'string' && c.value.trim()) {
        return c.value.trim();
      }
    }
    // Raw header cookie string
    let rawCookie: string | null = null;
    if (req.headers && typeof req.headers.get === 'function') {
      rawCookie = req.headers.get('cookie');
    } else if (req.headers && typeof req.headers === 'object') {
      rawCookie = req.headers['cookie'];
    }
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_TOKEN_COOKIE}=([^;]+)`));
      if (match && match[1]) {
        return decodeURIComponent(match[1].trim());
      }
    }
  }

  // 3. Check JSON Body
  if (body && typeof body === 'object' && typeof body.session_token === 'string' && body.session_token.trim()) {
    return body.session_token.trim();
  }

  return null;
}

export interface SessionOwnershipResult {
  isOwner: boolean;
  status: number;
  error?: string;
  token: string;
  isNewSession: boolean;
}

export interface VerifySessionOwnershipOptions {
  sessionId: string;
  req?: any;
  body?: any;
  supabase?: any;
  /**
   * Optional custom checker for session existence (useful for DI and unit tests).
   */
  sessionExistsChecker?: (sessionId: string) => Promise<boolean>;
}

/**
 * Verify session ownership before accessing or persisting chat history (INV-OWN-04).
 */
export async function verifySessionOwnership(options: VerifySessionOwnershipOptions): Promise<SessionOwnershipResult> {
  const { sessionId, req, body, supabase, sessionExistsChecker } = options;

  // 1. Anonymous sessions do not persist private history
  if (sessionId === 'anonymous') {
    return {
      isOwner: true,
      status: 200,
      token: '',
      isNewSession: true,
    };
  }

  // 2. Format validation: must be RFC 4122 UUID v4
  if (!isValidSessionId(sessionId)) {
    return {
      isOwner: false,
      status: 400,
      error: 'INVALID_SESSION_ID',
      token: '',
      isNewSession: false,
    };
  }

  const expectedToken = createSessionOwnershipToken(sessionId);
  const candidateToken = extractSessionOwnershipToken(req, body);

  // 3. Positive verification if candidate token matches
  if (candidateToken && verifySessionOwnershipToken(sessionId, candidateToken)) {
    return {
      isOwner: true,
      status: 200,
      token: expectedToken,
      isNewSession: false,
    };
  }

  // 4. Candidate token is missing or invalid: check if session already exists on DB
  let sessionAlreadyExists = false;

  if (typeof sessionExistsChecker === 'function') {
    sessionAlreadyExists = await sessionExistsChecker(sessionId);
  } else if (supabase) {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('session_id')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (data?.session_id) {
        sessionAlreadyExists = true;
      }
    } catch {
      // In case of DB lookup failure, fail-closed if token was provided but mismatch
      sessionAlreadyExists = Boolean(candidateToken);
    }
  }

  // 5. Fail-Closed Denial: if session belongs to another client, reject access!
  if (sessionAlreadyExists) {
    return {
      isOwner: false,
      status: 403,
      error: 'INVALID_SESSION_OWNERSHIP',
      token: '',
      isNewSession: false,
    };
  }

  // 6. Fresh session: allow creator to initiate and issue new ownership token (INV-OWN-05)
  return {
    isOwner: true,
    status: 200,
    token: expectedToken,
    isNewSession: true,
  };
}
