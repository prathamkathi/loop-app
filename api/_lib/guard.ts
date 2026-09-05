/**
 * API guard — origin allowlist + Firebase ID token verification.
 *
 * Every endpoint under /api is a proxy to a metered third-party service
 * (Gemini, Cloudinary). Without this guard the endpoints are open to the
 * internet: the API keys stay server-side, but the *capability* does not,
 * so anyone can spend the project's quota from any website.
 *
 * Files prefixed with _ are not routed by Vercel.
 */

import admin from 'firebase-admin';

// Origins allowed to call the API. Anything else is rejected before the
// handler body runs. Add preview/staging origins here as they appear.
const ALLOWED_ORIGINS = [
  'https://loop-iitd.web.app',
  'https://loop-iitd.firebaseapp.com',
  'https://loop-app-iitd.vercel.app',
  'http://localhost:8081',
  'http://localhost:19006',
];

function initAdmin() {
  if (admin.apps.length) return admin.app();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  return admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
  });
}

export type Caller = {
  uid: string;
  isCoordinator: boolean;
  clubId: string | null;
};

/**
 * Applies CORS, handles preflight, and verifies the caller's Firebase ID token.
 *
 * Returns the caller on success, or null if the request has already been
 * answered (preflight, rejected origin, bad method, missing/invalid token) —
 * in which case the handler must return immediately.
 */
export async function guard(
  req: any,
  res: any,
  opts: { requireCoordinator?: boolean } = {},
): Promise<Caller | null> {
  const origin = req.headers?.origin;

  // Browsers and API callers must provide an allowed origin to prevent bypassing CORS
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return null;
  }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return null;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return null;
  }

  const header: string = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Sign in required' });
    return null;
  }

  try {
    initAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    const caller: Caller = {
      uid: decoded.uid,
      isCoordinator: decoded.coordinator === true,
      clubId: (decoded.clubId as string) ?? null,
    };

    if (opts.requireCoordinator && !caller.isCoordinator) {
      res.status(403).json({ error: 'Coordinator access required' });
      return null;
    }
    return caller;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }
}

/**
 * Per-UID rate limiter using Firestore.
 * Capped at limitPerHour requests per rolling hour window.
 */
export async function checkRateLimit(uid: string, limitPerHour: number = 20): Promise<boolean> {
  try {
    initAdmin();
    const db = admin.firestore();
    const docRef = db.collection('system').doc('ratelimit').collection('uids').doc(uid);
    const now = Date.now();
    const windowStart = now - 60 * 60 * 1000;

    return await db.runTransaction(async (t: admin.firestore.Transaction) => {
      const snap = await t.get(docRef);
      let timestamps: number[] = [];
      if (snap.exists) {
        const data = snap.data();
        if (Array.isArray(data?.timestamps)) {
          timestamps = data.timestamps.filter((ts: any) => typeof ts === 'number' && ts > windowStart);
        }
      }
      if (timestamps.length >= limitPerHour) {
        return false;
      }
      timestamps.push(now);
      t.set(docRef, {
        timestamps,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    });
  } catch (err) {
    console.error('Rate limit error:', err);
    return true; // Fail-open on transient database failure
  }
}

