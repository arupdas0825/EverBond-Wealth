/**
 * notificationService.js — Migrated to MongoDB + Backend API
 * All Firestore notifications collection operations have been removed.
 */

import { apiGet, apiPost } from './apiClient';

/**
 * Fetch notifications from backend
 */
export async function getNotifications() {
  const data = await apiGet('/api/partner/notifications');
  return data.notifications || [];
}

/**
 * Mark a notification as read
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
  await apiPost(`/api/partner/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  await apiPost('/api/partner/notifications/read-all');
}

/**
 * Compatibility helpers (no-ops for Firestore batching)
 */
export function buildNotificationData(recipientUid, type, title, body, relatedInviteId = null) {
  return { recipientUid, type, title, body, relatedInviteId, read: false, createdAt: new Date() };
}

export function batchAddNotification() {
  // Managed atomically on backend during MongoDB partner operations
}

export async function createNotification() {
  // Notifications are created server-side to guarantee integrity
}
