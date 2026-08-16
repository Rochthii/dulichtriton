'use client';

import { useEffect } from 'react';

/**
 * DeploymentAutoRecovery
 * 
 * Automatically recovers from Next.js / Vercel ChunkLoadError and Deployment Skew.
 * When a new deployment is pushed to production, clients running older JS bundles
 * might request stale chunk files (returning 404). This component intercepts those
 * chunk errors and performs an instant seamless hard-refresh so users NEVER see
 * the "This page couldn't load" screen!
 */
export default function DeploymentAutoRecovery() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Intercept Global Window Errors (e.g. ChunkLoadError)
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || '';
      const isChunkError =
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed');

      if (isChunkError) {
        console.warn('⚡ Detected deployment chunk skew. Auto-refreshing to latest version...');
        // Prevent infinite reload loops with a session flag
        const lastReload = sessionStorage.getItem('triton_auto_recovery_reload');
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 10000) {
          sessionStorage.setItem('triton_auto_recovery_reload', String(now));
          window.location.reload();
        }
      }
    };

    // 2. Intercept Unhandled Promise Rejections (e.g. Next.js router dynamic import failure)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonStr = typeof reason === 'string' ? reason : reason?.message || '';

      const isChunkRejection =
        reasonStr.includes('ChunkLoadError') ||
        reasonStr.includes('Loading chunk') ||
        reasonStr.includes('Failed to fetch dynamically imported module') ||
        reasonStr.includes('Importing a module script failed') ||
        reasonStr.includes('RSC payload') ||
        reasonStr.includes('failed to fetch');

      if (isChunkRejection) {
        console.warn('⚡ Detected stale bundle promise rejection. Seamlessly reloading...');
        const lastReload = sessionStorage.getItem('triton_auto_recovery_reload');
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 10000) {
          sessionStorage.setItem('triton_auto_recovery_reload', String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
