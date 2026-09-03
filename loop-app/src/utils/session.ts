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

import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';

let pending: Promise<void> | null = null;

/**
 * Resolves once the app has some Firebase identity. Safe to call repeatedly
 * and concurrently — the anonymous sign-in only ever happens once.
 */
export function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return Promise.resolve();
  if (pending) return pending;

  pending = signInAnonymously(auth)
    .then(() => undefined)
    .catch((err) => {
      // Leave currentUser null; callers surface a user-visible error rather
      // than failing silently. Clearing `pending` allows a later retry.
      console.error('Anonymous sign-in failed:', err);
      throw err;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/** True when the signed-in user carries the coordinator custom claim. */
export async function isCoordinator(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return false;
  const token = await user.getIdTokenResult();
  return token.claims?.coordinator === true;
}
