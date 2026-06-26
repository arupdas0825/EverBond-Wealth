/**
 * usePartnerInvites.js — Fixed
 * Real-time Firestore listener for partner invitations.
 *
 * Fixes:
 *  - Checks auth.currentUser before attaching listeners
 *  - Handles permission errors gracefully (no raw Firebase messages)
 *  - Re-attaches listeners when auth changes
 */

import { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function mapInvite(d) {
  const data = d.data();
  return {
    id: d.id, ...data,
    createdAt:   toDate(data.createdAt),
    expiresAt:   toDate(data.expiresAt),
    acceptedAt:  toDate(data.acceptedAt),
    rejectedAt:  toDate(data.rejectedAt),
    cancelledAt: toDate(data.cancelledAt),
  };
}

/**
 * @param {string|null|undefined} currentUid
 * @returns {{ sent: Array, received: Array, loading: boolean, error: string|null }}
 */
export function usePartnerInvites(currentUid) {
  const [sent,     setSent]     = useState([]);
  const [received, setReceived] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!currentUid || !db) { setLoading(false); return; }
    // Don't attach listeners until Firebase Auth has a current user
    if (!auth?.currentUser) { setLoading(false); return; }

    setLoading(true);
    setError(null);

    let sentDone = false, receivedDone = false;
    const checkDone = () => { if (sentDone && receivedDone) setLoading(false); };

    // Sent invites
    const qSent = query(
      collection(db, 'partnerInvites'),
      where('senderUid', '==', currentUid),
      orderBy('createdAt', 'desc')
    );
    const unsubSent = onSnapshot(qSent,
      (snap) => { setSent(snap.docs.map(mapInvite)); sentDone = true; checkDone(); },
      (err)  => {
        console.error('[usePartnerInvites] sent error:', err.code);
        if (!err.code?.includes('permission')) setError('Failed to load sent invitations.');
        sentDone = true; checkDone();
      }
    );

    // Received invites
    const qReceived = query(
      collection(db, 'partnerInvites'),
      where('receiverUid', '==', currentUid),
      orderBy('createdAt', 'desc')
    );
    const unsubReceived = onSnapshot(qReceived,
      (snap) => { setReceived(snap.docs.map(mapInvite)); receivedDone = true; checkDone(); },
      (err)  => {
        console.error('[usePartnerInvites] received error:', err.code);
        if (!err.code?.includes('permission')) setError('Failed to load received invitations.');
        receivedDone = true; checkDone();
      }
    );

    return () => { unsubSent(); unsubReceived(); };
  }, [currentUid, auth?.currentUser?.uid]);

  return { sent, received, loading, error };
}
