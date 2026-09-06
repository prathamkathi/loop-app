/**
 * Client for the Loop serverless API.
 *
 * Every call carries the current Firebase ID token. The API rejects
 * unauthenticated requests, so `ensureSignedIn()` runs first — students are
 * signed in anonymously at app boot, coordinators upgrade to a real account
 * through the Studio sign-in.
 */

import { auth } from '../config/firebase';
import { ensureSignedIn } from './session';

export const VERCEL_URL = 'https://loop-app-iitd.vercel.app/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Human-readable message for a failed call, safe to show in the UI. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 403) return 'This action needs a verified coordinator account.';
    if (error.status === 429) return 'Too many requests right now. Please try again shortly.';
    return error.message;
  }
  return 'Could not reach the campus servers. Check your connection and try again.';
}

export function httpsCallable(functionName: string) {
  return async (data: any = {}) => {
    await ensureSignedIn();

    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError(401, 'Sign in required');

    let response: Response;
    try {
      const signal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? (AbortSignal as any).timeout(15000)
        : undefined;

      response = await fetch(`${VERCEL_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
        signal,
      });
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError' || err?.message?.toLowerCase().includes('timeout')) {
        throw new ApiError(408, 'Request timed out. Campus AI servers took too long to respond.');
      }
      throw new ApiError(0, 'Network unavailable');
    }

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        if (body?.error) detail = body.error;
      } catch {
        /* non-JSON error body — keep statusText */
      }
      throw new ApiError(response.status, detail);
    }

    const json = await response.json();
    return { data: json.data };
  };
}
