import { CHAT_CONSENT_STORAGE_KEY, type ConsentStatus } from './chatConsentGuard';

export const CHAT_CONSENT_CHANGED_EVENT = 'triton:chat-consent-changed';

export function readChatConsent(storage: Pick<Storage, 'getItem'>): ConsentStatus {
  try {
    const saved = storage.getItem(CHAT_CONSENT_STORAGE_KEY);
    return saved === 'granted' || saved === 'denied' ? saved : 'unset';
  } catch {
    return 'unset';
  }
}

/** Used for both stream and fallback: consent cannot be lost on retry. */
export function buildChatRequest(
  status: ConsentStatus,
  sessionId: string,
  token: string,
  question: string,
  history: { sender: string; text: string }[],
): RequestInit {
  const granted = status === 'granted';
  return {
    method: 'POST',
    credentials: granted ? 'same-origin' : 'omit',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'x-chat-consent': status,
      ...(granted && token ? { 'x-chat-session-token': token } : {}),
    },
    body: JSON.stringify({
      question, query: question, consent: granted,
      session_id: granted ? sessionId : 'anonymous',
      session_token: granted ? token || undefined : undefined,
      history: granted ? history : [],
    }),
  };
}
