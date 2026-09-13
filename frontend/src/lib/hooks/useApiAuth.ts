/**
 * Clerk API token helper for making authenticated backend requests.
 * Uses useAuth() to get the current session token in Clerk v7.
 *
 * Usage in a component:
 *   const { getApiToken } = useApiAuth();
 *   const token = await getApiToken();
 *   fetch('/api/...', { headers: { Authorization: `Bearer ${token}` } });
 */
'use client';

import { useAuth } from '@clerk/nextjs';

export function useApiAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const getApiToken = async (): Promise<string | null> => {
    try {
      const fetchTokenWithTimeout = async () => {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const tokenPromise = getToken().catch(() => null);
        return Promise.race([tokenPromise, timeout]);
      };

      let token = await fetchTokenWithTimeout();
      if (!token && isSignedIn) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        token = await fetchTokenWithTimeout();
      }
      return token;
    } catch {
      return null;
    }
  };

  return { getApiToken, isLoaded, isSignedIn };
}
