/**
 * firestoreGuard.js
 * Auth-gate wrapper for all Firestore operations.
 * Every service function MUST call assertAuth() before touching Firestore.
 * This eliminates "Missing or insufficient permissions" caused by unauthenticated reads/writes.
 */

import { auth } from '../utils/firebase';

/**
 * Assert that a Firebase user is currently authenticated.
 * Throws a structured error if not.
 * @returns {import('firebase/auth').User} The current Firebase Auth user
 */
export function assertAuth() {
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    const err = new Error('UNAUTHENTICATED');
    err.code = 'permission-denied';
    throw err;
  }
  return currentUser;
}

/**
 * Assert that the provided UID matches the authenticated user.
 * Prevents spoofed UID injection.
 * @param {string} uid
 * @returns {import('firebase/auth').User}
 */
export function assertAuthMatch(uid) {
  const currentUser = assertAuth();
  if (uid && uid !== currentUser.uid) {
    const err = new Error('UID_MISMATCH');
    err.code = 'permission-denied';
    throw err;
  }
  return currentUser;
}

/**
 * Wait for Firebase Auth to initialize and return the current user.
 * Useful for cases where the auth state may not be immediately available.
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<import('firebase/auth').User|null>}
 */
export function waitForAuth(timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (auth?.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const timer = setTimeout(() => resolve(null), timeoutMs);
    const unsub = auth?.onAuthStateChanged((user) => {
      clearTimeout(timer);
      unsub?.();
      resolve(user);
    });
  });
}
