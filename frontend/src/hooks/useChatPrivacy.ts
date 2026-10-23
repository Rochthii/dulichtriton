'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAT_CONSENT_STORAGE_KEY, type ConsentStatus } from '@/lib/chatConsentGuard';
import { CHAT_CONSENT_CHANGED_EVENT, readChatConsent, buildChatRequest } from '@/lib/chatClientPrivacy';
import { generateSessionId, isValidSessionId } from '@/lib/sessionIdentifierContract';

/** Shared consent lifecycle for the page and widget, including same-tab updates. */
export function useChatPrivacy(historyKey: string, idKey: string, tokenKey: string, onReset: () => void) {
  const [chatConsent, setChatConsent] = useState<ConsentStatus>('unset');
  const [privacyNotice, setPrivacyNotice] = useState('');
  const consentRef = useRef<ConsentStatus>('unset');
  const sessionIdRef = useRef('anonymous');
  const sessionTokenRef = useRef('');
  const revisionRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);
  const pendingDeletionsRef = useRef(new Map<string, string>());
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  const retryDeletion = async () => {
    let failed = false;
    for (const [sessionId, token] of [...pendingDeletionsRef.current]) {
      try {
        const response = await fetch(`/api/v1/chat/session?sessionId=${encodeURIComponent(sessionId)}`, {
          method: 'DELETE', headers: { 'x-chat-session-token': token },
        });
        if (!response.ok || (await response.json()).success !== true) throw new Error('Deletion not confirmed');
        pendingDeletionsRef.current.delete(sessionId);
      } catch { failed = true; }
    }
    setPrivacyNotice(failed
      ? 'Chưa xác nhận được việc xóa phiên cũ trên máy chủ. Bạn có thể thử xóa lại.'
      : 'Đã xóa phiên cũ trên máy chủ.');
  };

  const applyConsent = (status: ConsentStatus) => {
    if (initializedRef.current && consentRef.current === status) return;
    const previousId = sessionIdRef.current;
    const previousToken = sessionTokenRef.current;
    const wasGranted = consentRef.current === 'granted';
    revisionRef.current++;
    requestRef.current?.abort();
    consentRef.current = status;
    setChatConsent(status);
    if (initializedRef.current) resetRef.current();
    try {
      if (status === 'granted') {
        const storedId = initializedRef.current ? null : localStorage.getItem(idKey);
        sessionIdRef.current = storedId && isValidSessionId(storedId) ? storedId : generateSessionId();
        sessionTokenRef.current = storedId === sessionIdRef.current ? localStorage.getItem(tokenKey) || '' : '';
        localStorage.setItem(idKey, sessionIdRef.current);
        if (!sessionTokenRef.current) localStorage.removeItem(tokenKey);
        if (initializedRef.current) localStorage.removeItem(historyKey);
      } else {
        sessionIdRef.current = 'anonymous';
        sessionTokenRef.current = '';
        for (const key of [historyKey, idKey, tokenKey]) localStorage.removeItem(key);
      }
    } catch {
      // Storage unavailable: consent stays in memory; identifiers remain secure.
      sessionIdRef.current = status === 'granted' ? generateSessionId() : 'anonymous';
      sessionTokenRef.current = '';
    }
    initializedRef.current = true;
    if (wasGranted && status !== 'granted' && previousToken && isValidSessionId(previousId)) {
      pendingDeletionsRef.current.set(previousId, previousToken);
      void retryDeletion();
    }
  };
  const applyRef = useRef(applyConsent);
  applyRef.current = applyConsent;

  useEffect(() => {
    let initial: ConsentStatus = 'unset';
    try { initial = readChatConsent(localStorage); } catch { /* storage blocked */ }
    applyRef.current(initial);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CHAT_CONSENT_STORAGE_KEY || event.key === null) {
        let status: ConsentStatus = 'unset';
        try { status = readChatConsent(localStorage); } catch { /* fail closed */ }
        applyRef.current(status);
      }
    };
    const onConsent = (event: Event) => {
      const status = (event as CustomEvent<ConsentStatus>).detail;
      applyRef.current(status === 'granted' || status === 'denied' ? status : 'unset');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CHAT_CONSENT_CHANGED_EVENT, onConsent);
    return () => {
      requestRef.current?.abort();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CHAT_CONSENT_CHANGED_EVENT, onConsent);
    };
  }, []);

  const handleSetConsent = (status: 'granted' | 'denied') => {
    try { localStorage.setItem(CHAT_CONSENT_STORAGE_KEY, status); } catch { /* memory only */ }
    if (!pendingDeletionsRef.current.size) setPrivacyNotice('');
    applyRef.current(status);
    window.dispatchEvent(new CustomEvent(CHAT_CONSENT_CHANGED_EVENT, { detail: status }));
  };
  const updateSessionToken = (token?: string | null, revision = revisionRef.current) => {
    if (consentRef.current !== 'granted' || revision !== revisionRef.current || !token?.trim()) return;
    sessionTokenRef.current = token.trim();
    try { localStorage.setItem(tokenKey, token.trim()); } catch { /* memory only */ }
  };
  const beginRequest = () => {
    requestRef.current?.abort();
    revisionRef.current++;
    const controller = new AbortController();
    requestRef.current = controller;
    const revision = revisionRef.current;
    return {
      revision, signal: controller.signal,
      isCurrent: () => !controller.signal.aborted && revision === revisionRef.current,
    };
  };
  const createRequest = (question: string, history: { sender: string; text: string }[]) =>
    buildChatRequest(consentRef.current, sessionIdRef.current, sessionTokenRef.current, question, history);

  return { chatConsent, consentRef, privacyNotice, sessionIdRef, sessionTokenRef,
    handleSetConsent, updateSessionToken, beginRequest, createRequest, retryDeletion,
    hasPendingDeletion: pendingDeletionsRef.current.size > 0 };
}
