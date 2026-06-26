/**
 * usePartnerInvites.js
 * Real-time Firestore listener for partner invitations.
 * Subscribes to:
 *  - partnerInvites where senderUid == currentUid (sent invites)
 *  - partnerInvites where receiverUid == currentUid (received invites)
 *
 * Returns live-updating arrays with no page refresh required.
 */

import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

/**
 * @typedef {Object} PartnerInvite
 * @property {string} id
 * @property {string} senderUid
 * @property {string} senderEbId
 * @property {string} senderName
 * @property {string} senderEmail
 * @property {string} receiverUid
 * @property {string} receiverEbId
 * @property {string} receiverName
 * @property {string} receiverEmail
 * @property {'pending'|'accepted'|'rejected'|'cancelled'|'expired'} status
 * @property {string} workspaceId
 * @property {Date|null} createdAt
 * @property {Date|null} expiresAt
 * @property {Date|null} acceptedAt
 * @property {Date|null} rejectedAt
 * @property {Date|null} cancelledAt
 */

/**
 * Safely convert a Firestore timestamp to a JS Date.
 * @param {any} ts
 * @returns {Date|null}
 */
function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

/**
 * Map a Firestore doc snapshot to a PartnerInvite object.
 * @param {import('firebase/firestore').QueryDocumentSnapshot} d
 * @returns {PartnerInvite}
 */
function mapInvite(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: toDate(data.createdAt),
    expiresAt: toDate(data.expiresAt),
    acceptedAt: toDate(data.acceptedAt),
    rejectedAt: toDate(data.rejectedAt),
    cancelledAt: toDate(data.cancelledAt),
  };
}

/**
 * Real-time hook for partner invitations.
 * @param {string|null|undefined} currentUid - The authenticated user's UID
 * @returns {{ sent: PartnerInvite[], received: PartnerInvite[], loading: boolean, error: string|null }}
 */
export function usePartnerInvites(currentUid) {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUid || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let sentDone = false;
    let receivedDone = false;

    const checkDone = () => {
      if (sentDone && receivedDone) setLoading(false);
    };

    // ── Sent invites listener ──
    const sentQuery = query(
      collection(db, 'partnerInvites'),
      where('senderUid', '==', currentUid),
      orderBy('createdAt', 'desc')
    );

    const unsubSent = onSnapshot(
      sentQuery,
      (snap) => {
        setSent(snap.docs.map(mapInvite));
        sentDone = true;
        checkDone();
      },
      (err) => {
        console.error('[usePartnerInvites] sent listener error:', err);
        setError('Failed to load sent invitations. Check your connection.');
        sentDone = true;
        checkDone();
      }
    );

    // ── Received invites listener ──
    const receivedQuery = query(
      collection(db, 'partnerInvites'),
      where('receiverUid', '==', currentUid),
      orderBy('createdAt', 'desc')
    );

    const unsubReceived = onSnapshot(
      receivedQuery,
      (snap) => {
        setReceived(snap.docs.map(mapInvite));
        receivedDone = true;
        checkDone();
      },
      (err) => {
        console.error('[usePartnerInvites] received listener error:', err);
        setError('Failed to load received invitations. Check your connection.');
        receivedDone = true;
        checkDone();
      }
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [currentUid]);

  return { sent, received, loading, error };
}
