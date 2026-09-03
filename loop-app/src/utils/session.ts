/**
 * Firebase session bootstrap.
 *
 * Every user of the app holds a Firebase identity, because the security rules
 * and the serverless API both key off `request.auth`:
 *
 *   - students          → anonymous account, created silently on first launch
 *   - club coordinators → email/password account with a `coordinator` custom
 *                         claim, signed in through the Studio portal
 *
 * Signing in anonymously does not create a visible account or ask the student
 * for anything; it exists so reads and concierge calls have a verifiable
 * caller. The student's display profile (name, Kerberos ID, hostel) is
 * separate and still local — see utils/auth.ts.
 */

import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Firebase restores a persisted session asynchronously. Anything that reads
 * `auth.currentUser` before the first auth-state callback sees `null` even
 * when a coordinator is signed in — and signing in anonymously at that moment
 * would replace their session. Everything below waits on this first.
 */
const authReady = new Promise<User | null>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

let pending: Promise<void> | null = null;

/**
 * Resolves once the app has some Firebase identity, creating an anonymous one
 * only if no session was restored. Safe to call repeatedly and concurrently.
 */
export function ensureSignedIn(): Promise<void> {
  if (pending) return pending;

  pending = authReady
    .then(async (restored) => {
      if (restored) return; // a real or anonymous session already exists
      await signInAnonymously(auth);
    })
    .catch((err) => {
      console.error('Anonymous sign-in failed:', err);
      pending = null; // allow a later retry
      throw err;
    });

  return pending;
}

export type CoordinatorInfo = { isCoordinator: boolean; clubId: string | null };

const NOT_COORDINATOR: CoordinatorInfo = { isCoordinator: false, clubId: null };

async function readClaims(user: User | null, forceRefresh: boolean): Promise<CoordinatorInfo> {
  if (!user || user.isAnonymous) return NOT_COORDINATOR;
  try {
    // Custom claims are baked into the ID token. A claim granted after the
    // user signed in is invisible until the token refreshes, so force it —
    // otherwise a newly promoted coordinator is denied for up to an hour.
    const token = await user.getIdTokenResult(forceRefresh);
    return {
      isCoordinator: token.claims?.coordinator === true,
      clubId: (token.claims?.clubId as string) ?? null,
    };
  } catch (err) {
    console.error('Could not read coordinator claims:', err);
    return NOT_COORDINATOR;
  }
}

/** One-shot check of the current user's coordinator status. */
export async function getCoordinatorInfo(forceRefresh = true): Promise<CoordinatorInfo> {
  const restored = await authReady;
  return readClaims(auth.currentUser ?? restored, forceRefresh);
}

/** Backwards-compatible boolean form. */
export async function isCoordinator(): Promise<boolean> {
  return (await getCoordinatorInfo()).isCoordinator;
}

/**
 * Subscribes to coordinator status across sign-in and sign-out. Screens that
 * gate on the claim must use this rather than a one-shot check on mount, or
 * they keep showing the signed-out state after the user signs in.
 */
export function onCoordinatorChange(
  callback: (info: CoordinatorInfo) => void,
): () => void {
  return onAuthStateChanged(auth, (user) => {
    readClaims(user, true).then(callback);
  });
}
