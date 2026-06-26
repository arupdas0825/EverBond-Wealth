/**
 * partnerService.js
 * Production-ready Partner Connection service.
 * ALL Firestore write operations go through here.
 * Security: Never trusts client values — always uses authenticated Firebase UID from params.
 * Collections used: users, partnerInvites, partnerWorkspaces, notifications
 */

import { db } from '../utils/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { batchAddNotification } from './notificationService';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find a user document by EverBond ID (ebId field).
 * @param {string} ebId
 * @returns {Promise<{uid: string, data: Object}|null>}
 */
async function findUserByEbId(ebId) {
  const q = query(collection(db, 'users'), where('ebId', '==', ebId.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, data: d.data() };
}

/**
 * Find a user document by email address.
 * @param {string} email
 * @returns {Promise<{uid: string, data: Object}|null>}
 */
async function findUserByEmail(email) {
  const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, data: d.data() };
}

/**
 * Check if a pending invite already exists between sender and receiver.
 * @param {string} senderUid
 * @param {string} receiverUid
 * @returns {Promise<boolean>}
 */
async function pendingInviteExists(senderUid, receiverUid) {
  const q = query(
    collection(db, 'partnerInvites'),
    where('senderUid', '==', senderUid),
    where('receiverUid', '==', receiverUid),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEND INVITATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a partner invitation by EverBond ID or email.
 * Validates all guards server-side before writing.
 *
 * Guards checked:
 *  - receiver exists
 *  - not self-invite
 *  - sender is not already connected
 *  - receiver is not already connected
 *  - no duplicate pending invite
 *
 * Writes (batched):
 *  - partnerInvites doc (status=pending)
 *  - partnerWorkspaces doc (status=pending)
 *  - notifications doc for receiver
 *
 * @param {Object} senderUser  - { uid, ebId, fullName, email } from Firebase Auth + Firestore
 * @param {string} receiverIdentifier - EverBond ID (EB-XXXXXX) or email address
 * @returns {Promise<{inviteId: string, workspaceId: string}>}
 */
export async function sendInvite(senderUser, receiverIdentifier) {
  const { uid: senderUid, ebId: senderEbId, fullName: senderName, email: senderEmail } = senderUser;

  if (!senderUid) throw new Error('UNAUTHENTICATED');

  // ── Determine if identifier is email or EB ID ──
  const isEmail = receiverIdentifier.includes('@');
  let receiver = null;

  if (isEmail) {
    receiver = await findUserByEmail(receiverIdentifier);
  } else {
    receiver = await findUserByEbId(receiverIdentifier);
  }

  if (!receiver) {
    throw new Error('RECEIVER_NOT_FOUND');
  }

  const { uid: receiverUid, data: receiverData } = receiver;

  // ── Guard: Self-invite ──
  if (receiverUid === senderUid) {
    throw new Error('SELF_INVITE');
  }

  // ── Guard: Sender already connected ──
  const senderDoc = await getDoc(doc(db, 'users', senderUid));
  if (!senderDoc.exists()) throw new Error('SENDER_NOT_FOUND');
  const senderData = senderDoc.data();
  if (senderData.partnerStatus === 'connected' && senderData.partnerUid) {
    throw new Error('SENDER_ALREADY_CONNECTED');
  }

  // ── Guard: Receiver already connected ──
  if (receiverData.partnerStatus === 'connected' && receiverData.partnerUid) {
    throw new Error('RECEIVER_ALREADY_CONNECTED');
  }

  // ── Guard: Duplicate pending invite ──
  const duplicate = await pendingInviteExists(senderUid, receiverUid);
  if (duplicate) {
    throw new Error('DUPLICATE_INVITE');
  }

  // ── Build invite & workspace IDs ──
  const inviteRef = doc(collection(db, 'partnerInvites'));
  const workspaceRef = doc(collection(db, 'partnerWorkspaces'));
  const inviteId = inviteRef.id;
  const workspaceId = workspaceRef.id;

  const now = serverTimestamp();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const batch = writeBatch(db);

  // partnerInvites doc
  batch.set(inviteRef, {
    senderUid,
    senderEbId: senderEbId || '',
    senderName: senderName || '',
    senderEmail: senderEmail || '',
    receiverUid,
    receiverEbId: receiverData.ebId || '',
    receiverEmail: receiverData.email || '',
    receiverName: receiverData.fullName || '',
    status: 'pending',
    inviteCode: senderEbId || '',
    workspaceId,
    createdAt: now,
    expiresAt,
    acceptedAt: null,
    rejectedAt: null,
    cancelledAt: null,
  });

  // partnerWorkspaces doc (pre-created, awaiting partner2)
  batch.set(workspaceRef, {
    partner1Uid: senderUid,
    partner1EbId: senderEbId || '',
    partner1Name: senderName || '',
    partner2Uid: null,
    partner2EbId: null,
    partner2Name: null,
    status: 'pending',
    inviteId,
    createdAt: now,
    connectedAt: null,
    disconnectedAt: null,
  });

  // Notification for receiver
  batchAddNotification(
    batch,
    receiverUid,
    'partner_invite_received',
    'Partner Invitation Received',
    `${senderName || 'Someone'} wants to connect their financial workspace with yours.`,
    inviteId
  );

  await batch.commit();

  return { inviteId, workspaceId };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACCEPT INVITATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accept a pending partner invitation.
 * Uses a Firestore transaction to guarantee atomicity.
 *
 * Transaction steps:
 *  1. Validate invite exists, is pending, not expired
 *  2. Validate receiver is the authenticated user
 *  3. Update partnerInvites doc (status=accepted, receiverUid, acceptedAt)
 *  4. Update partnerWorkspaces doc (partner2Uid, partner2EbId, status=connected, connectedAt)
 *  5. Update sender's user doc (partnerUid, partnerEbId, partnerStatus, workspaceId)
 *  6. Update receiver's user doc (partnerUid, partnerEbId, partnerStatus, workspaceId)
 *  7. Create notification for sender (via batch, after transaction)
 *  8. Create notification for receiver
 *
 * @param {string} inviteId
 * @param {Object} receiverUser - { uid, ebId, fullName } from authenticated session
 * @returns {Promise<{workspaceId: string}>}
 */
export async function acceptInvite(inviteId, receiverUser) {
  const { uid: receiverUid, ebId: receiverEbId, fullName: receiverName } = receiverUser;

  if (!receiverUid) throw new Error('UNAUTHENTICATED');

  let workspaceId;
  let senderUid;
  let senderName;

  await runTransaction(db, async (transaction) => {
    const inviteRef = doc(db, 'partnerInvites', inviteId);
    const inviteSnap = await transaction.get(inviteRef);

    if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');

    const invite = inviteSnap.data();

    // ── Validate status ──
    if (invite.status !== 'pending') {
      throw new Error(`INVITE_${invite.status.toUpperCase()}`);
    }

    // ── Validate expiry ──
    const expiresAt = invite.expiresAt instanceof Date
      ? invite.expiresAt
      : invite.expiresAt?.toDate?.() ?? new Date(invite.expiresAt);
    if (new Date() > expiresAt) {
      throw new Error('INVITE_EXPIRED');
    }

    // ── Security: Verify receiver is the authenticated user ──
    if (invite.receiverUid !== receiverUid) {
      throw new Error('UNAUTHORIZED');
    }

    workspaceId = invite.workspaceId;
    senderUid = invite.senderUid;
    senderName = invite.senderName;

    const workspaceRef = doc(db, 'partnerWorkspaces', workspaceId);
    const senderUserRef = doc(db, 'users', senderUid);
    const receiverUserRef = doc(db, 'users', receiverUid);

    // Read both user docs inside the transaction
    const [workspaceSnap, senderSnap, receiverSnap] = await Promise.all([
      transaction.get(workspaceRef),
      transaction.get(senderUserRef),
      transaction.get(receiverUserRef),
    ]);

    if (!workspaceSnap.exists()) throw new Error('WORKSPACE_NOT_FOUND');
    if (!senderSnap.exists()) throw new Error('SENDER_NOT_FOUND');

    // ── Update partnerInvites ──
    transaction.update(inviteRef, {
      status: 'accepted',
      receiverUid,
      receiverEbId: receiverEbId || '',
      acceptedAt: serverTimestamp(),
    });

    // ── Update partnerWorkspaces ──
    transaction.update(workspaceRef, {
      partner2Uid: receiverUid,
      partner2EbId: receiverEbId || '',
      partner2Name: receiverName || '',
      status: 'connected',
      connectedAt: serverTimestamp(),
    });

    // ── Update sender's user doc ──
    transaction.update(senderUserRef, {
      partnerUid: receiverUid,
      partnerEbId: receiverEbId || '',
      partnerStatus: 'connected',
      workspaceId,
    });

    // ── Update receiver's user doc ──
    transaction.update(receiverUserRef, {
      partnerUid: senderUid,
      partnerEbId: senderSnap.data().ebId || '',
      partnerStatus: 'connected',
      workspaceId,
    });
  });

  // Post-transaction: create notifications (outside transaction is fine — not critical path)
  const notifBatch = writeBatch(db);
  batchAddNotification(
    notifBatch,
    senderUid,
    'partner_invite_accepted',
    'Partner Invitation Accepted!',
    `${receiverName || 'Your partner'} accepted your invitation. Your workspace is now connected.`,
    inviteId
  );
  batchAddNotification(
    notifBatch,
    receiverUid,
    'partner_invite_accepted',
    'Workspace Connected!',
    `You are now connected with ${senderName || 'your partner'}. Start planning together!`,
    inviteId
  );
  await notifBatch.commit();

  return { workspaceId };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REJECT INVITATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reject a pending partner invitation.
 * @param {string} inviteId
 * @param {Object} receiverUser - { uid, fullName }
 * @returns {Promise<void>}
 */
export async function rejectInvite(inviteId, receiverUser) {
  const { uid: receiverUid, fullName: receiverName } = receiverUser;
  if (!receiverUid) throw new Error('UNAUTHENTICATED');

  const inviteRef = doc(db, 'partnerInvites', inviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');
  const invite = inviteSnap.data();

  if (invite.status !== 'pending') throw new Error(`INVITE_${invite.status.toUpperCase()}`);
  if (invite.receiverUid !== receiverUid) throw new Error('UNAUTHORIZED');

  const batch = writeBatch(db);

  batch.update(inviteRef, {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  });

  batchAddNotification(
    batch,
    invite.senderUid,
    'partner_invite_rejected',
    'Invitation Declined',
    `${receiverName || 'The recipient'} declined your partner invitation.`,
    inviteId
  );

  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CANCEL INVITATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel a sent invitation (only the sender can cancel).
 * @param {string} inviteId
 * @param {Object} senderUser - { uid }
 * @returns {Promise<void>}
 */
export async function cancelInvite(inviteId, senderUser) {
  const { uid: senderUid, fullName: senderName } = senderUser;
  if (!senderUid) throw new Error('UNAUTHENTICATED');

  const inviteRef = doc(db, 'partnerInvites', inviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');
  const invite = inviteSnap.data();

  if (invite.senderUid !== senderUid) throw new Error('UNAUTHORIZED');
  if (invite.status !== 'pending') throw new Error(`INVITE_${invite.status.toUpperCase()}`);

  const batch = writeBatch(db);

  batch.update(inviteRef, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  });

  // Notify receiver that invite was cancelled
  batchAddNotification(
    batch,
    invite.receiverUid,
    'partner_invite_cancelled',
    'Partner Invitation Cancelled',
    `${senderName || 'The sender'} cancelled their partner invitation.`,
    inviteId
  );

  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DISCONNECT PARTNER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Disconnect an established partner connection.
 * Archives the workspace (status=disconnected) instead of deleting.
 * Clears partner fields from both user documents.
 *
 * @param {Object} currentUser - { uid, fullName }
 * @param {string} partnerUid
 * @param {string} workspaceId
 * @returns {Promise<void>}
 */
export async function disconnectPartner(currentUser, partnerUid, workspaceId) {
  const { uid: currentUid, fullName: currentName } = currentUser;
  if (!currentUid) throw new Error('UNAUTHENTICATED');

  const batch = writeBatch(db);

  // Archive workspace
  if (workspaceId) {
    const workspaceRef = doc(db, 'partnerWorkspaces', workspaceId);
    batch.update(workspaceRef, {
      status: 'disconnected',
      disconnectedAt: serverTimestamp(),
    });
  }

  // Clear current user's partner fields
  const currentUserRef = doc(db, 'users', currentUid);
  batch.update(currentUserRef, {
    partnerUid: null,
    partnerEbId: null,
    partnerStatus: 'none',
    workspaceId: null,
  });

  // Clear partner's partner fields
  if (partnerUid) {
    const partnerUserRef = doc(db, 'users', partnerUid);
    batch.update(partnerUserRef, {
      partnerUid: null,
      partnerEbId: null,
      partnerStatus: 'none',
      workspaceId: null,
    });
  }

  // Notify both parties
  batchAddNotification(
    batch,
    currentUid,
    'partner_disconnected',
    'Partner Disconnected',
    'Your partner workspace has been disconnected. You are now in Single mode.',
    null
  );

  if (partnerUid) {
    batchAddNotification(
      batch,
      partnerUid,
      'partner_disconnected',
      'Partner Disconnected',
      `${currentName || 'Your partner'} has disconnected the shared workspace.`,
      null
    );
  }

  await batch.commit();
}
