/**
 * partnerService.js — Migrated to MongoDB + Node.js Backend
 * ALL Firestore partner queries, transactions, and mutations have been removed.
 * All partner business logic and state validation executes authoritatively on the backend.
 * 
 * Collections migrated:
 *  - users (MongoDB)
 *  - partnerInvites (MongoDB)
 *  - partnerWorkspaces (MongoDB)
 *  - notifications (MongoDB)
 */

import { apiGet, apiPost } from './apiClient';

/**
 * Send a partner invitation identified by EverBond ID or email.
 * @param {Object} senderUser - Ignored for identity, backend verifies Firebase token.
 * @param {string} receiverIdentifier - EverBond ID or email
 * @returns {Promise<{inviteId: string, status: string}>}
 */
export async function sendInvite(senderUser, receiverIdentifier) {
  const data = await apiPost('/api/partner/invites', {
    recipientIdentifier: receiverIdentifier.trim(),
  });
  return {
    inviteId: data.invite._id || data.invite.id,
    invite: data.invite,
  };
}

/**
 * Accept a pending invitation.
 * @param {string} inviteId
 * @param {Object} [receiverUser] - Identity derived strictly on backend.
 * @returns {Promise<{workspaceId: string}>}
 */
export async function acceptInvite(inviteId, receiverUser) {
  const data = await apiPost(`/api/partner/invites/${inviteId}/accept`);
  return {
    workspaceId: data.workspaceId,
    workspace: data.workspace,
  };
}

/**
 * Accept / process invitation via QR code.
 * @param {string} qrString - Scanned QR code payload
 * @param {Object} [receiverUser]
 * @returns {Promise<{workspaceId: string, inviteId: string, senderName: string}>}
 */
export async function acceptInviteByQR(qrString, receiverUser) {
  const resolution = await apiPost('/api/partner/qr/resolve', { qrPayload: qrString });

  if (resolution.type === 'invite') {
    const invite = resolution.data;
    const acceptRes = await acceptInvite(invite._id || invite.id);
    return {
      workspaceId: acceptRes.workspaceId,
      inviteId: invite._id || invite.id,
      senderName: invite.senderName || 'Partner',
    };
  }

  if (resolution.type === 'personal_id') {
    // Target user resolved — send invite
    const target = resolution.data;
    const sendRes = await sendInvite(receiverUser, target.ebId);
    return {
      workspaceId: '',
      inviteId: sendRes.inviteId,
      senderName: target.fullName,
      isPending: true,
    };
  }

  throw new Error('QR_INVALID');
}

/**
 * Reject a pending invitation
 * @param {string} inviteId
 * @param {Object} [receiverUser]
 */
export async function rejectInvite(inviteId, receiverUser) {
  await apiPost(`/api/partner/invites/${inviteId}/reject`);
}

/**
 * Cancel a pending invitation (sender only)
 * @param {string} inviteId
 * @param {Object} [senderUser]
 */
export async function cancelInvite(inviteId, senderUser) {
  await apiPost(`/api/partner/invites/${inviteId}/cancel`);
}

/**
 * Disconnect an established partner connection.
 * Archives workspace in MongoDB. Never deletes data.
 * Reverts both users to Single mode and clears partner fields.
 * @param {Object} [currentUser]
 * @param {string} [partnerUid]
 * @param {string} [workspaceId]
 */
export async function disconnectPartner(currentUser, partnerUid, workspaceId) {
  await apiPost('/api/partner/disconnect');
}

/**
 * Fetch current authoritative partner status from MongoDB
 */
export async function getPartnerStatus() {
  return await apiGet('/api/partner/status');
}

/**
 * Fetch sent and received partner invitations from MongoDB
 */
export async function getPartnerInvites() {
  return await apiGet('/api/partner/invites');
}

/**
 * Fetch partner workspace from MongoDB
 */
export async function getPartnerWorkspace() {
  return await apiGet('/api/partner/workspace');
}

/**
 * Fetch connected partner investments
 */
export async function getPartnerInvestments() {
  return await apiGet('/api/partner/investments');
}

/**
 * Update current user's investment contribution in connected partner workspace
 */
export async function updatePartnerInvestment(amount) {
  return await apiPost('/api/partner/investments', { amount });
}

