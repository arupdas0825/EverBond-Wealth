/**
 * usePartnerNotifications.js — Migrated from Firestore to MongoDB + Socket.IO
 * Real-time notifications listener for partner events.
 * Zero Firestore dependencies.
 */

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../utils/firebase';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';
import { subscribeToEvent, connectSocket } from '../services/socketService';

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export function usePartnerNotifications(currentUid) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifs = useCallback(async () => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const items = await getNotifications();
      setNotifications(
        items.map((n) => ({
          ...n,
          id: n._id || n.id,
          isRead: n.read ?? false,
          createdAt: toDate(n.createdAt),
        }))
      );
    } catch (err) {
      console.warn('[usePartnerNotifications] Error fetching notifications:', err.message);
      if (err.message !== 'UNAUTHENTICATED') {
        setError('Could not load notifications.');
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

    fetchNotifs();
    connectSocket();

    const unsubNotif = subscribeToEvent('partner:notification', (notif) => {
      console.log('[usePartnerNotifications] Real-time event: partner:notification', notif);
      if (notif) {
        const formatted = {
          ...notif,
          id: notif._id || notif.id,
          isRead: notif.read ?? false,
          createdAt: toDate(notif.createdAt) || new Date(),
        };
        setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== formatted.id)]);
      } else {
        fetchNotifs();
      }
    });

    const unsubSocketReconnect = subscribeToEvent('socket:connected', () => {
      fetchNotifs();
    });

    return () => {
      unsubNotif();
      unsubSocketReconnect();
    };
  }, [currentUid, fetchNotifs]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('[usePartnerNotifications] markRead error:', e);
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('[usePartnerNotifications] markAllRead error:', e);
    }
  };

  return { notifications, unreadCount, markRead, markAllRead, loading, error, refreshNotifs: fetchNotifs };
}
