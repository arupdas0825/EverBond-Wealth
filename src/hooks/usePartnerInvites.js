/**
 * usePartnerInvites.js — Migrated from Firestore to MongoDB + Socket.IO
 * Real-time synchronization for received and sent partner invitations.
 * Zero Firestore dependencies.
 */

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../utils/firebase';
import { getPartnerInvites } from '../services/partnerService';
import { subscribeToEvent, connectSocket } from '../services/socketService';

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatInvite(inv) {
  return {
    ...inv,
    id: inv._id || inv.id,
    createdAt: toDate(inv.createdAt),
    expiresAt: toDate(inv.expiresAt),
    acceptedAt: toDate(inv.acceptedAt),
    rejectedAt: toDate(inv.rejectedAt),
    cancelledAt: toDate(inv.cancelledAt),
  };
}

export function usePartnerInvites(currentUid) {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvites = useCallback(async () => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getPartnerInvites();
      setSent((data.sent || []).map(formatInvite));
      setReceived((data.received || []).map(formatInvite));
    } catch (err) {
      console.warn('[usePartnerInvites] Error fetching invites:', err.message);
      if (err.message !== 'UNAUTHENTICATED') {
        setError('Failed to load partner invitations.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUid || !auth?.currentUser) {
      setLoading(false);
      return;
    }

    fetchInvites();
    connectSocket();

    const unsubCreated = subscribeToEvent('partner:invite-created', (payload) => {
      console.log('[usePartnerInvites] Real-time event: partner:invite-created', payload);
      if (payload?.invite) {
        const formatted = formatInvite(payload.invite);
        setReceived((prev) => [formatted, ...prev.filter((i) => i.id !== formatted.id)]);
      } else {
        fetchInvites();
      }
    });

    const unsubUpdated = subscribeToEvent('partner:invite-updated', (payload) => {
      console.log('[usePartnerInvites] Real-time event: partner:invite-updated', payload);
      if (payload?.invite) {
        const formatted = formatInvite(payload.invite);
        setSent((prev) =>
          prev.map((i) => (i.id === formatted.id ? formatted : i))
        );
        setReceived((prev) =>
          prev.map((i) => (i.id === formatted.id ? formatted : i))
        );
      } else {
        fetchInvites();
      }
    });

    const unsubConnected = subscribeToEvent('partner:connected', () => {
      fetchInvites();
    });

    const unsubSocketReconnect = subscribeToEvent('socket:connected', () => {
      fetchInvites();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubConnected();
      unsubSocketReconnect();
    };
  }, [currentUid, fetchInvites]);

  return { sent, received, loading, error, refreshInvites: fetchInvites };
}
