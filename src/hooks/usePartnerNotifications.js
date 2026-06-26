/**
 * usePartnerNotifications.js
 * Real-time Firestore listener for partner-related notifications.
 * Subscribes to notifications where recipientUid == currentUid.
 */

import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { markNotificationRead, markAllNotificationsRead } from '../services/notificationService';

/**
 * @typedef {Object} PartnerNotification
 * @property {string} id
 * @property {string} recipientUid
 * @property {string} type
 * @property {string} title
 * @property {string} body
 * @property {boolean} isRead
 * @property {string|null} relatedInviteId
 * @property {Date|null} createdAt
 */

/**
 * Real-time notifications hook for the current user.
 * @param {string|null|undefined} currentUid
 * @returns {{ notifications: PartnerNotification[], unreadCount: number, markRead: (id: string) => Promise<void>, markAllRead: () => Promise<void>, loading: boolean, error: string|null }}
 */
export function usePartnerNotifications(currentUid) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUid || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', currentUid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(d => {
          const data = d.data();
          const ts = data.createdAt;
          return {
            id: d.id,
            ...data,
            createdAt: ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null),
          };
        });
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.error('[usePartnerNotifications] listener error:', err);
        setError('Could not load notifications.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUid]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (e) {
      console.error('[usePartnerNotifications] markRead error:', e);
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await markAllNotificationsRead(unreadIds);
    } catch (e) {
      console.error('[usePartnerNotifications] markAllRead error:', e);
    }
  };

  return { notifications, unreadCount, markRead, markAllRead, loading, error };
}
