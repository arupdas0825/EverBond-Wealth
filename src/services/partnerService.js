/**
 * partnerService.js — Production Rewrite
 * ALL partner Firestore writes go through here.
 *
 * Security guarantees:
 *  1. assertAuth() called at the top of every exported function
 *  2. UIDs always come from authenticated session, never from client params
 *  3. All multi-doc writes use runTransaction or writeBatch for atomicity
 *  4. partnerName + partnerPhoto written onto both user docs at connect time
 *     → eliminates secondary getDoc races in hooks
 *
 * Collections: users, partnerInvites, partnerWorkspaces, notifications
 */

import { db } from '../utils/firebase';
import { assertAuth } from '../firebase/firestoreGuard';
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
import { decodeQRPayload, validateQRPayload } from './qrService';

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function findUserByEbId(ebId) {
  const cleanId = ebId.trim().toUpperCase();
  console.log('[Firestore Step: Query receiver by EverBond ID] Executing query for ebId:', cleanId);
  try {
    const q = query(collection(db, 'users'), where('ebId', '==', cleanId));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('[Firestore Step: Query receiver by EverBond ID] No user found matching ebId:', cleanId);
      return null;
    }
    console.log('[Firestore Step: Query receiver by EverBond ID] Success! Found user UID:', snap.docs[0].id);
    return { uid: snap.docs[0].id, data: snap.docs[0].data() };
  } catch (err) {
    console.error('[Firestore PERMISSION/ERROR] Query receiver by EverBond ID failed:', err.code || err.name, err.message);
    throw err;
  }
}

async function findUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  console.log('[Firestore Step: Query receiver by email] Executing query for email:', cleanEmail);
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('[Firestore Step: Query receiver by email] No user found matching email:', cleanEmail);
      return null;
    }
    console.log('[Firestore Step: Query receiver by email] Success! Found user UID:', snap.docs[0].id);
    return { uid: snap.docs[0].id, data: snap.docs[0].data() };
  } catch (err) {
    console.error('[Firestore PERMISSION/ERROR] Query receiver by email failed:', err.code || err.name, err.message);
    throw err;
  }
}

/** Check for existing pending invite in either direction between two users */
async function pendingInviteExistsBetween(uidA, uidB) {
  console.log('[Firestore Step: Check duplicate invitations] Checking pending invites between sender:', uidA, 'and receiver:', uidB);
  try {
    // Sub-step 1: Check invites sent by current user (uidA) to target user (uidB)
    console.log('[Firestore Sub-step] Checking sent invites where senderUid == current user');
    const q1 = query(
      collection(db, 'partnerInvites'),
      where('senderUid', '==', uidA),
      where('receiverUid', '==', uidB),
      where('status', '==', 'pending')
    );
    const s1 = await getDocs(q1);
    if (!s1.empty) {
      console.log('[Firestore Step: Check duplicate invitations] Found active outgoing invite from current user');
      return true;
    }

    // Sub-step 2: Check invites received by current user (uidA) sent by target user (uidB)
    // Secure query: filter ONLY by receiverUid == currentUid to satisfy Firestore rules (request.auth.uid == resource.data.receiverUid)
    console.log('[Firestore Sub-step] Checking received invites where receiverUid == current user');
    const q2 = query(
      collection(db, 'partnerInvites'),
      where('receiverUid', '==', uidA),
      where('status', '==', 'pending')
    );
    const s2 = await getDocs(q2);
    const hasIncomingMatch = s2.docs.some(docSnap => docSnap.data().senderUid === uidB);
    if (hasIncomingMatch) {
      console.log('[Firestore Step: Check duplicate invitations] Found active incoming invite from target user');
      return true;
    }

    console.log('[Firestore Step: Check duplicate invitations] No duplicate pending invitation found');
    return false;
  } catch (err) {
    console.error('[Firestore PERMISSION/ERROR] Check duplicate invitations failed:', err.code || err.name, err.message);
    throw err;
  }
}

/** Safely coerce a Firestore Timestamp / Date / ISO string to a JS Date */
function toDate(val) {
  if (!val) return null;
  if (val?.toDate) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEND INVITATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a partner invitation identified by EverBond ID or email.
 *
 * Guards:
 *  ✓ Authenticated
 *  ✓ Receiver exists
 *  ✓ Not self-invite
 *  ✓ Sender not already connected
 *  ✓ Receiver not already connected
 *  ✓ No duplicate pending invite (either direction)
 *
 * Writes (batched):
 *  - partnerInvites doc  (status=pending)
 *  - partnerWorkspaces doc (status=pending)
 *  - notifications doc for receiver
 *
 * @param {Object} senderUser  { uid, ebId, fullName, email, photoURL? }
 * @param {string} receiverIdentifier  EverBond ID or email
 * @returns {Promise<{inviteId: string, workspaceId: string}>}
 */
export async function sendInvite(senderUser, receiverIdentifier) {
  // ── 1. Auth gate ──
  const firebaseUser = assertAuth();
  const senderUid = firebaseUser.uid;

  // ── 2. Locate receiver ──
  const isEmail = receiverIdentifier.includes('@');
  let receiver = null;
  if (isEmail) {
    console.log('[Firestore Step] Starting: Query receiver by email');
    receiver = await findUserByEmail(receiverIdentifier);
  } else {
    console.log('[Firestore Step] Starting: Query receiver by EverBond ID');
    receiver = await findUserByEbId(receiverIdentifier);
  }

  if (!receiver) throw new Error('RECEIVER_NOT_FOUND');
  const { uid: receiverUid, data: receiverData } = receiver;

  // ── 3. Guards & Current User Read ──
  if (receiverUid === senderUid) throw new Error('SELF_INVITE');

  console.log('[Firestore Step: Read current user] Fetching user document for UID:', senderUid);
  let senderDoc;
  try {
    senderDoc = await getDoc(doc(db, 'users', senderUid));
  } catch (err) {
    console.error('[Firestore PERMISSION/ERROR] Read current user failed:', err.code || err.name, err.message);
    throw err;
  }

  if (!senderDoc.exists()) throw new Error('SENDER_NOT_FOUND');
  const senderData = senderDoc.data();
  console.log('[Firestore Step: Read current user] Successfully read current user profile');

  if (senderData.partnerStatus === 'connected' && senderData.partnerUid)
    throw new Error('SENDER_ALREADY_CONNECTED');
  if (receiverData.partnerStatus === 'connected' && receiverData.partnerUid)
    throw new Error('RECEIVER_ALREADY_CONNECTED');

  console.log('[Firestore Step] Starting: Check duplicate invitations');
  const dupExists = await pendingInviteExistsBetween(senderUid, receiverUid);
  if (dupExists) throw new Error('DUPLICATE_INVITE');

  // ── 4. Resolve sender info from Firestore ──
  const resolvedSenderName  = senderData.fullName || senderUser.fullName || '';
  const resolvedSenderEbId  = senderData.ebId     || senderUser.ebId     || '';
  const resolvedSenderEmail = senderData.email    || senderUser.email    || '';
  const resolvedSenderPhoto = senderData.photoURL || senderData.profilePhoto || '';

  // ── 5. Prepare documents for batch write ──
  const inviteRef    = doc(collection(db, 'partnerInvites'));
  const workspaceRef = doc(collection(db, 'partnerWorkspaces'));
  const inviteId     = inviteRef.id;
  const workspaceId  = workspaceRef.id;
  const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  console.log('[Firestore Step: Create partnerInvites document] Pre-generating doc ID:', inviteId);
  console.log('[Firestore Step: Create/update partnerWorkspaces] Pre-generating workspace ID:', workspaceId);
  console.log('[Firestore Step: Create notifications document] Preparing notification for receiver:', receiverUid);

  const batch = writeBatch(db);

  // partnerInvites
  batch.set(inviteRef, {
    senderUid,
    senderEbId:    resolvedSenderEbId,
    senderName:    resolvedSenderName,
    senderEmail:   resolvedSenderEmail,
    senderPhoto:   resolvedSenderPhoto,
    receiverUid,
    receiverEbId:  receiverData.ebId     || '',
    receiverEmail: receiverData.email    || '',
    receiverName:  receiverData.fullName || '',
    receiverPhoto: receiverData.photoURL || receiverData.profilePhoto || '',
    status:        'pending',
    inviteCode:    resolvedSenderEbId,
    workspaceId,
    createdAt:     serverTimestamp(),
    expiresAt,
    acceptedAt:    null,
    rejectedAt:    null,
    cancelledAt:   null,
  });

  // partnerWorkspaces
  batch.set(workspaceRef, {
    partner1Uid:   senderUid,
    partner1EbId:  resolvedSenderEbId,
    partner1Name:  resolvedSenderName,
    partner1Photo: resolvedSenderPhoto,
    partner2Uid:   null,
    partner2EbId:  null,
    partner2Name:  null,
    partner2Photo: null,
    status:        'pending',
    inviteId,
    createdAt:     serverTimestamp(),
    connectedAt:   null,
    disconnectedAt: null,
    lastSync:      serverTimestamp(),
  });

  // Notification for receiver
  batchAddNotification(batch, receiverUid,
    'partner_invite_received',
    'Partner Invitation Received',
    `${resolvedSenderName || 'Someone'} wants to connect their financial workspace with yours.`,
    inviteId
  );

  console.log('[Firestore Step] Committing batched write for partnerInvites, partnerWorkspaces, and notifications');
  try {
    await batch.commit();
    console.log('[Firestore Step] Batch write committed successfully!');
  } catch (err) {
    console.error('[Firestore PERMISSION/ERROR] Batch write commit failed during document creation:', err.code || err.name, err.message);
    throw err;
  }

  return { inviteId, workspaceId };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACCEPT INVITATION (Firestore Transaction)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accept a pending invitation.
 * Uses runTransaction for full atomicity across 4 documents.
 * Also writes partnerName + partnerPhoto to both user docs so hooks
 * never need a secondary getDoc.
 *
 * @param {string} inviteId
 * @param {{uid:string, ebId:string, fullName:string, photoURL?:string}} receiverUser
 * @returns {Promise<{workspaceId: string}>}
 */
export async function acceptInvite(inviteId, receiverUser) {
  const firebaseUser = assertAuth();
  const receiverUid  = firebaseUser.uid;  // Always use auth UID, not param

  let workspaceId, senderUid, senderName, senderEbId;

  await runTransaction(db, async (tx) => {
    const inviteRef = doc(db, 'partnerInvites', inviteId);
    const inviteSnap = await tx.get(inviteRef);
    if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');

    const invite = inviteSnap.data();

    if (invite.status !== 'pending') throw new Error(`INVITE_${invite.status.toUpperCase()}`);

    const expiresAt = toDate(invite.expiresAt);
    if (expiresAt && new Date() > expiresAt) throw new Error('INVITE_EXPIRED');

    // Security: receiver must be authenticated user
    if (invite.receiverUid && invite.receiverUid !== receiverUid)
      throw new Error('UNAUTHORIZED');

    workspaceId = invite.workspaceId;
    senderUid   = invite.senderUid;
    senderName  = invite.senderName;
    senderEbId  = invite.senderEbId;

    const workspaceRef    = doc(db, 'partnerWorkspaces', workspaceId);
    const senderUserRef   = doc(db, 'users', senderUid);
    const receiverUserRef = doc(db, 'users', receiverUid);

    const [workspaceSnap, senderSnap, receiverSnap] = await Promise.all([
      tx.get(workspaceRef),
      tx.get(senderUserRef),
      tx.get(receiverUserRef),
    ]);

    if (!workspaceSnap.exists()) throw new Error('WORKSPACE_NOT_FOUND');
    if (!senderSnap.exists())    throw new Error('SENDER_NOT_FOUND');

    const senderData   = senderSnap.data();
    const receiverData = receiverSnap.exists() ? receiverSnap.data() : {};

    // Resolve names & photos from Firestore docs (not from client params)
    const resolvedReceiverName  = receiverData.fullName || receiverUser.fullName || '';
    const resolvedReceiverEbId  = receiverData.ebId     || receiverUser.ebId     || '';
    const resolvedReceiverPhoto = receiverData.photoURL || receiverData.profilePhoto || '';
    const resolvedSenderPhoto   = senderData.photoURL   || senderData.profilePhoto   || '';

    const now = serverTimestamp();

    // Update invite
    tx.update(inviteRef, {
      status:        'accepted',
      receiverUid,
      receiverEbId:  resolvedReceiverEbId,
      acceptedAt:    now,
    });

    // Update workspace
    tx.update(workspaceRef, {
      partner2Uid:   receiverUid,
      partner2EbId:  resolvedReceiverEbId,
      partner2Name:  resolvedReceiverName,
      partner2Photo: resolvedReceiverPhoto,
      status:        'connected',
      connectedAt:   now,
      lastSync:      now,
    });

    // Update sender's user doc — write partner info directly
    tx.update(senderUserRef, {
      partnerUid:    receiverUid,
      partnerEbId:   resolvedReceiverEbId,
      partnerName:   resolvedReceiverName,
      partnerPhoto:  resolvedReceiverPhoto,
      partnerStatus: 'connected',
      workspaceId,
      connectedAt:   now,
    });

    // Update receiver's user doc
    tx.update(receiverUserRef, {
      partnerUid:    senderUid,
      partnerEbId:   senderData.ebId || senderEbId || '',
      partnerName:   senderData.fullName || senderName || '',
      partnerPhoto:  resolvedSenderPhoto,
      partnerStatus: 'connected',
      workspaceId,
      connectedAt:   now,
    });
  });

  // Post-transaction notifications
  const notifBatch = writeBatch(db);
  batchAddNotification(notifBatch, senderUid,
    'partner_invite_accepted', 'Partner Invitation Accepted! 🎉',
    `Your workspace is now connected. Start planning together!`, inviteId);
  batchAddNotification(notifBatch, receiverUid,
    'partner_invite_accepted', 'Workspace Connected! 🎉',
    `You are now connected with ${senderName || 'your partner'}.`, inviteId);
  await notifBatch.commit();

  return { workspaceId };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACCEPT VIA QR CODE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decode a scanned QR string, validate it, then call acceptInvite.
 * Fetches the invite from Firestore for status validation before accepting.
 *
 * @param {string} qrString - Raw string from camera scanner
 * @param {{uid:string, ebId:string, fullName:string, photoURL?:string}} receiverUser
 * @returns {Promise<{workspaceId: string, inviteId: string, senderName: string}>}
 */
export async function acceptInviteByQR(qrString, receiverUser) {
  const firebaseUser = assertAuth();
  const currentUid   = firebaseUser.uid;

  // 1. Decode
  const payload = decodeQRPayload(qrString);  // throws QR_INVALID / QR_DECODE_FAILED

  // 2. Validate own QR + expiry from payload
  validateQRPayload(payload, currentUid);

  // 3. Fetch invite from Firestore to verify current status
  const inviteSnap = await getDoc(doc(db, 'partnerInvites', payload.inviteId));
  if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');

  const inviteData = inviteSnap.data();
  validateQRPayload(payload, currentUid, inviteData.status);

  // 4. Accept via the standard transaction
  const result = await acceptInvite(payload.inviteId, receiverUser);
  return { ...result, inviteId: payload.inviteId, senderName: inviteData.senderName };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REJECT INVITATION
// ─────────────────────────────────────────────────────────────────────────────

export async function rejectInvite(inviteId, receiverUser) {
  const firebaseUser = assertAuth();
  const receiverUid  = firebaseUser.uid;

  const inviteRef  = doc(db, 'partnerInvites', inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');

  const invite = inviteSnap.data();
  if (invite.status !== 'pending') throw new Error(`INVITE_${invite.status.toUpperCase()}`);
  if (invite.receiverUid !== receiverUid) throw new Error('UNAUTHORIZED');

  const batch = writeBatch(db);
  batch.update(inviteRef, { status: 'rejected', rejectedAt: serverTimestamp() });
  batchAddNotification(batch, invite.senderUid,
    'partner_invite_rejected', 'Invitation Declined',
    `${receiverUser.fullName || 'The recipient'} declined your partner invitation.`, inviteId);
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CANCEL INVITATION
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelInvite(inviteId, senderUser) {
  const firebaseUser = assertAuth();
  const senderUid    = firebaseUser.uid;

  const inviteRef  = doc(db, 'partnerInvites', inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) throw new Error('INVALID_INVITE');

  const invite = inviteSnap.data();
  if (invite.senderUid !== senderUid) throw new Error('UNAUTHORIZED');
  if (invite.status !== 'pending') throw new Error(`INVITE_${invite.status.toUpperCase()}`);

  const batch = writeBatch(db);
  batch.update(inviteRef, { status: 'cancelled', cancelledAt: serverTimestamp() });

  if (invite.receiverUid) {
    batchAddNotification(batch, invite.receiverUid,
      'partner_invite_cancelled', 'Partner Invitation Cancelled',
      `${senderUser.fullName || 'The sender'} cancelled their invitation.`, inviteId);
  }
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DISCONNECT PARTNER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Disconnect an established partner connection.
 * Archives workspace (status=disconnected). Never deletes data.
 * Clears partner fields from both user documents.
 *
 * @param {{uid:string, fullName:string}} currentUser
 * @param {string} partnerUid
 * @param {string} workspaceId
 */
export async function disconnectPartner(currentUser, partnerUid, workspaceId) {
  const firebaseUser = assertAuth();
  const currentUid   = firebaseUser.uid;

  const batch = writeBatch(db);

  if (workspaceId) {
    batch.update(doc(db, 'partnerWorkspaces', workspaceId), {
      status:          'disconnected',
      disconnectedAt:  serverTimestamp(),
    });
  }

  const clearFields = {
    partnerUid:    null,
    partnerEbId:   null,
    partnerName:   null,
    partnerPhoto:  null,
    partnerStatus: 'none',
    workspaceId:   null,
    connectedAt:   null,
  };

  batch.update(doc(db, 'users', currentUid), clearFields);

  if (partnerUid) {
    batch.update(doc(db, 'users', partnerUid), clearFields);
  }

  const disconnectedByName = currentUser.fullName || 'Your partner';
  batchAddNotification(batch, currentUid,
    'partner_disconnected', 'Partner Disconnected',
    'Your workspace has been disconnected. You are now in Single mode.', null);
  if (partnerUid) {
    batchAddNotification(batch, partnerUid,
      'partner_disconnected', 'Partner Disconnected',
      `${disconnectedByName} has disconnected the shared workspace.`, null);
  }

  await batch.commit();
}
