/**
 * notificationService.js
 * Handles all Firestore `notifications` collection operations.
 * Never trusts client-side data — always uses authenticated uid from params.
 */

import { db } from '../utils/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * @typedef {'partner_invite_received'|'partner_invite_accepted'|'partner_invite_rejected'|'partner_invite_cancelled'|'partner_disconnected'} NotificationType
 */

/**
 * Write a single notification document to Firestore.
 * @param {Object} batch - Firestore WriteBatch to attach to (or null for standalone write)
 * @param {string} recipientUid
 * @param {NotificationType} type
 * @param {string} title
 * @param {string} body
 * @param {string|null} relatedInviteId
 * @returns {import('firebase/firestore').DocumentReference}
 */
export function buildNotificationData(recipientUid, type, title, body, relatedInviteId = null) {
  return {
    recipientUid,
    type,
    title,
    body,
    isRead: false,
    relatedInviteId,
    createdAt: serverTimestamp(),
  };
}

/**
 * Add a notification document to a WriteBatch.
 * Call batch.commit() externally.
 * @param {import('firebase/firestore').WriteBatch} batch
 * @param {string} recipientUid
 * @param {NotificationType} type
 * @param {string} title
 * @param {string} body
 * @param {string|null} relatedInviteId
 */
export function batchAddNotification(batch, recipientUid, type, title, body, relatedInviteId = null) {
  const notifRef = doc(collection(db, 'notifications'));
  batch.set(notifRef, buildNotificationData(recipientUid, type, title, body, relatedInviteId));
}

/**
 * Standalone write of a single notification (outside a batch).
 * @param {string} recipientUid
 * @param {NotificationType} type
 * @param {string} title
 * @param {string} body
 * @param {string|null} relatedInviteId
 * @returns {Promise<void>}
 */
export async function createNotification(recipientUid, type, title, body, relatedInviteId = null) {
  await addDoc(collection(db, 'notifications'), buildNotificationData(recipientUid, type, title, body, relatedInviteId));
}

/**
 * Mark a notification document as read.
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationRead(notificationId) {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { isRead: true });
}

/**
 * Mark all provided notification IDs as read in a single batch.
 * @param {string[]} notificationIds
 * @returns {Promise<void>}
 */
export async function markAllNotificationsRead(notificationIds) {
  if (!notificationIds || notificationIds.length === 0) return;
  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    batch.update(doc(db, 'notifications', id), { isRead: true });
  });
  await batch.commit();
}
