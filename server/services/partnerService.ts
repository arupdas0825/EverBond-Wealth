import mongoose from 'mongoose';
import { User, IUserDocument } from '../models/User';
import { PartnerInvite, IPartnerInviteDocument } from '../models/PartnerInvite';
import { PartnerWorkspace, IPartnerWorkspaceDocument } from '../models/PartnerWorkspace';
import { Notification } from '../models/Notification';
import { emitToUser, emitToWorkspace } from '../websocket/socketServer';
import { findUserByIdentifier, getOrCreateUser } from './userService';

/**
 * Send an invitation to another user via EverBond ID or email
 */
export async function sendPartnerInvite(
  senderUid: string,
  recipientIdentifier: string
): Promise<{ invite: IPartnerInviteDocument }> {
  if (!senderUid) throw new Error('UNAUTHENTICATED');
  if (!recipientIdentifier || !recipientIdentifier.trim()) {
    throw new Error('INVALID_INPUT');
  }

  // 1. Fetch sender
  const sender = await User.findOne({ firebaseUid: senderUid });
  if (!sender) throw new Error('SENDER_NOT_FOUND');

  if (sender.partnerStatus === 'connected' && sender.partnerUid) {
    throw new Error('SENDER_ALREADY_CONNECTED');
  }

  // 2. Locate receiver
  const receiver = await findUserByIdentifier(recipientIdentifier);
  if (!receiver) {
    throw new Error('RECEIVER_NOT_FOUND');
  }

  if (receiver.firebaseUid === senderUid) {
    throw new Error('SELF_INVITE');
  }

  if (receiver.partnerStatus === 'connected' && receiver.partnerUid) {
    throw new Error('RECEIVER_ALREADY_CONNECTED');
  }

  // 3. Check for existing active invite between both users (either direction)
  const existingInvite = await PartnerInvite.findOne({
    $or: [
      { senderUid, receiverUid: receiver.firebaseUid, status: 'pending' },
      { senderUid: receiver.firebaseUid, receiverUid: senderUid, status: 'pending' },
    ],
  });

  if (existingInvite) {
    if (new Date() < new Date(existingInvite.expiresAt)) {
      throw new Error('DUPLICATE_INVITE');
    } else {
      // Mark expired
      existingInvite.status = 'expired';
      await existingInvite.save();
    }
  }

  // 4. Create pending invite
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const invite = await PartnerInvite.create({
    senderUid: sender.firebaseUid,
    senderEbId: sender.ebId,
    senderName: sender.fullName || 'Partner',
    senderEmail: sender.email || '',
    senderPhoto: sender.photoURL || '',
    receiverUid: receiver.firebaseUid,
    receiverEbId: receiver.ebId,
    receiverName: receiver.fullName || '',
    receiverEmail: receiver.email || '',
    receiverPhoto: receiver.photoURL || '',
    status: 'pending',
    inviteCode: sender.ebId,
    expiresAt,
  });

  // 5. Create notification for receiver
  const notif = await Notification.create({
    recipientUid: receiver.firebaseUid,
    type: 'partner_invite_received',
    title: 'Partner Invitation Received',
    body: `${sender.fullName || 'Someone'} (${sender.ebId}) wants to connect their financial workspace with yours.`,
    read: false,
    relatedInviteId: invite._id.toString(),
  });

  // 6. Emit real-time WebSocket events
  emitToUser(receiver.firebaseUid, 'partner:invite-created', {
    invite,
    notification: notif,
  });
  emitToUser(receiver.firebaseUid, 'partner:notification', notif);
  emitToUser(sender.firebaseUid, 'partner:invite-updated', { invite });

  return { invite };
}

/**
 * Accept a pending invitation atomically
 */
export async function acceptPartnerInvite(
  receiverUid: string,
  inviteId: string
): Promise<{ workspace: IPartnerWorkspaceDocument }> {
  if (!receiverUid) throw new Error('UNAUTHENTICATED');
  if (!inviteId) throw new Error('INVALID_INVITE');

  // Load invite
  const invite = await PartnerInvite.findById(inviteId);
  if (!invite) throw new Error('INVALID_INVITE');

  if (invite.status !== 'pending') {
    throw new Error(`INVITE_${invite.status.toUpperCase()}`);
  }

  if (new Date() > new Date(invite.expiresAt)) {
    invite.status = 'expired';
    await invite.save();
    throw new Error('INVITE_EXPIRED');
  }

  // If receiverUid was pre-specified on invite, verify it matches authenticated user
  if (invite.receiverUid && invite.receiverUid !== receiverUid) {
    throw new Error('UNAUTHORIZED');
  }

  // Load both users
  const sender = await User.findOne({ firebaseUid: invite.senderUid });
  const receiver = await User.findOne({ firebaseUid: receiverUid });

  if (!sender) throw new Error('SENDER_NOT_FOUND');
  if (!receiver) throw new Error('RECEIVER_NOT_FOUND');

  if (sender.partnerStatus === 'connected' && sender.partnerUid) {
    throw new Error('SENDER_ALREADY_CONNECTED');
  }
  if (receiver.partnerStatus === 'connected' && receiver.partnerUid) {
    throw new Error('RECEIVER_ALREADY_CONNECTED');
  }

  const now = new Date();

  // Perform atomic relationship update using a session/transaction when replica set is available
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (_) {
    // If running in standalone MongoDB without replica set, proceed with sequential updates
    session = null;
  }

  try {
    // 1. Create PartnerWorkspace
    const workspace = new PartnerWorkspace({
      partner1Uid: sender.firebaseUid,
      partner1EbId: sender.ebId,
      partner1Name: sender.fullName || 'Partner 1',
      partner1Photo: sender.photoURL || '',
      partner2Uid: receiver.firebaseUid,
      partner2EbId: receiver.ebId,
      partner2Name: receiver.fullName || 'Partner 2',
      partner2Photo: receiver.photoURL || '',
      status: 'connected',
      inviteId: invite._id.toString(),
      connectedAt: now,
      lastSync: now,
    });
    await workspace.save(session ? { session } : {});

    const workspaceIdStr = workspace._id.toString();

    // 2. Update invite
    invite.status = 'accepted';
    invite.acceptedAt = now;
    invite.receiverUid = receiver.firebaseUid;
    invite.receiverEbId = receiver.ebId;
    invite.receiverName = receiver.fullName;
    invite.receiverEmail = receiver.email;
    invite.receiverPhoto = receiver.photoURL;
    invite.workspaceId = workspaceIdStr;
    await invite.save(session ? { session } : {});

    // Invalidate any other pending invites involving sender or receiver to prevent multi-invites
    await PartnerInvite.updateMany(
      {
        _id: { $ne: invite._id },
        status: 'pending',
        $or: [
          { senderUid: sender.firebaseUid },
          { receiverUid: sender.firebaseUid },
          { senderUid: receiver.firebaseUid },
          { receiverUid: receiver.firebaseUid },
        ],
      },
      { status: 'cancelled', cancelledAt: now },
      session ? { session } : {}
    );

    // 3. Update sender user
    sender.partnerUid = receiver.firebaseUid;
    sender.partnerEbId = receiver.ebId;
    sender.partnerName = receiver.fullName;
    sender.partnerPhoto = receiver.photoURL;
    sender.partnerStatus = 'connected';
    sender.workspaceId = workspaceIdStr;
    sender.connectedAt = now;
    await sender.save(session ? { session } : {});

    // 4. Update receiver user
    receiver.partnerUid = sender.firebaseUid;
    receiver.partnerEbId = sender.ebId;
    receiver.partnerName = sender.fullName;
    receiver.partnerPhoto = sender.photoURL;
    receiver.partnerStatus = 'connected';
    receiver.workspaceId = workspaceIdStr;
    receiver.connectedAt = now;
    await receiver.save(session ? { session } : {});

    // 5. Notifications
    const notifSender = new Notification({
      recipientUid: sender.firebaseUid,
      type: 'partner_invite_accepted',
      title: 'Partner Connected! 🎉',
      body: `${receiver.fullName || 'Your partner'} accepted your invitation. Your shared workspace is now active!`,
      read: false,
      relatedInviteId: invite._id.toString(),
    });
    const notifReceiver = new Notification({
      recipientUid: receiver.firebaseUid,
      type: 'partner_invite_accepted',
      title: 'Workspace Connected! 🎉',
      body: `You are now connected with ${sender.fullName || 'your partner'}. Dual ledgers are synced!`,
      read: false,
      relatedInviteId: invite._id.toString(),
    });
    await notifSender.save(session ? { session } : {});
    await notifReceiver.save(session ? { session } : {});

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // 6. Real-time broadcast
    const connectionPayload = {
      workspaceId: workspaceIdStr,
      connectedAt: now.toISOString(),
      partner1: {
        uid: sender.firebaseUid,
        ebId: sender.ebId,
        name: sender.fullName,
        photo: sender.photoURL,
      },
      partner2: {
        uid: receiver.firebaseUid,
        ebId: receiver.ebId,
        name: receiver.fullName,
        photo: receiver.photoURL,
      },
    };

    emitToUser(sender.firebaseUid, 'partner:connected', {
      ...connectionPayload,
      partner: connectionPayload.partner2,
    });

    emitToUser(receiver.firebaseUid, 'partner:connected', {
      ...connectionPayload,
      partner: connectionPayload.partner1,
    });

    emitToWorkspace(workspaceIdStr, 'partner:workspace-updated', {
      workspaceId: workspaceIdStr,
      status: 'connected',
    });

    return { workspace };
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw err;
  }
}

/**
 * Reject an invitation
 */
export async function rejectPartnerInvite(
  receiverUid: string,
  inviteId: string
): Promise<void> {
  if (!receiverUid) throw new Error('UNAUTHENTICATED');
  const invite = await PartnerInvite.findById(inviteId);
  if (!invite) throw new Error('INVALID_INVITE');

  if (invite.status !== 'pending') {
    throw new Error(`INVITE_${invite.status.toUpperCase()}`);
  }

  if (invite.receiverUid && invite.receiverUid !== receiverUid) {
    throw new Error('UNAUTHORIZED');
  }

  const now = new Date();
  invite.status = 'rejected';
  invite.rejectedAt = now;
  await invite.save();

  const receiver = await User.findOne({ firebaseUid: receiverUid });

  const notif = await Notification.create({
    recipientUid: invite.senderUid,
    type: 'partner_invite_rejected',
    title: 'Invitation Declined',
    body: `${receiver?.fullName || 'The recipient'} declined your partner invitation.`,
    read: false,
    relatedInviteId: invite._id.toString(),
  });

  emitToUser(invite.senderUid, 'partner:invite-updated', { invite });
  emitToUser(invite.senderUid, 'partner:notification', notif);
  emitToUser(receiverUid, 'partner:invite-updated', { invite });
}

/**
 * Cancel an invitation (sender only)
 */
export async function cancelPartnerInvite(
  senderUid: string,
  inviteId: string
): Promise<void> {
  if (!senderUid) throw new Error('UNAUTHENTICATED');
  const invite = await PartnerInvite.findById(inviteId);
  if (!invite) throw new Error('INVALID_INVITE');

  if (invite.senderUid !== senderUid) {
    throw new Error('UNAUTHORIZED');
  }

  if (invite.status !== 'pending') {
    throw new Error(`INVITE_${invite.status.toUpperCase()}`);
  }

  const now = new Date();
  invite.status = 'cancelled';
  invite.cancelledAt = now;
  await invite.save();

  if (invite.receiverUid) {
    const sender = await User.findOne({ firebaseUid: senderUid });
    const notif = await Notification.create({
      recipientUid: invite.receiverUid,
      type: 'partner_invite_cancelled',
      title: 'Partner Invitation Cancelled',
      body: `${sender?.fullName || 'The sender'} cancelled their partner invitation.`,
      read: false,
      relatedInviteId: invite._id.toString(),
    });
    emitToUser(invite.receiverUid, 'partner:notification', notif);
    emitToUser(invite.receiverUid, 'partner:invite-updated', { invite });
  }

  emitToUser(senderUid, 'partner:invite-updated', { invite });
}

/**
 * Disconnect partner connection:
 * - Archives workspace (status = 'disconnected', disconnectedAt = now). Never deletes data!
 * - Clears partner fields on both users and sets partnerStatus = 'disconnected'.
 * - Emits real-time event partner:disconnected to both users.
 */
export async function disconnectPartner(currentUserUid: string): Promise<void> {
  if (!currentUserUid) throw new Error('UNAUTHENTICATED');

  const user = await User.findOne({ firebaseUid: currentUserUid });
  if (!user || user.partnerStatus !== 'connected' || !user.partnerUid) {
    throw new Error('NOT_CONNECTED');
  }

  const partnerUid = user.partnerUid;
  const workspaceId = user.workspaceId;
  const now = new Date();

  // 1. Archive workspace
  if (workspaceId) {
    await PartnerWorkspace.findByIdAndUpdate(workspaceId, {
      status: 'disconnected',
      disconnectedAt: now,
    });
  }

  // 2. Clear user 1
  user.partnerUid = null;
  user.partnerEbId = null;
  user.partnerName = null;
  user.partnerPhoto = null;
  user.partnerStatus = 'none';
  user.workspaceId = null;
  user.connectedAt = null;
  await user.save();

  // 3. Clear user 2
  const partnerUser = await User.findOne({ firebaseUid: partnerUid });
  if (partnerUser) {
    partnerUser.partnerUid = null;
    partnerUser.partnerEbId = null;
    partnerUser.partnerName = null;
    partnerUser.partnerPhoto = null;
    partnerUser.partnerStatus = 'none';
    partnerUser.workspaceId = null;
    partnerUser.connectedAt = null;
    await partnerUser.save();
  }

  // 4. Create notifications
  const notif1 = new Notification({
    recipientUid: currentUserUid,
    type: 'partner_disconnected',
    title: 'Partner Disconnected',
    body: 'Your shared workspace has been disconnected. You are now in Single mode.',
    read: false,
  });
  const notif2 = new Notification({
    recipientUid: partnerUid,
    type: 'partner_disconnected',
    title: 'Partner Disconnected',
    body: `${user.fullName || 'Your partner'} has disconnected the shared workspace.`,
    read: false,
  });
  await Promise.all([notif1.save(), notif2.save()]);

  // 5. Emit real-time disconnect events to both users and workspace room
  const disconnectPayload = {
    disconnectedAt: now.toISOString(),
    status: 'disconnected',
  };

  emitToUser(currentUserUid, 'partner:disconnected', disconnectPayload);
  emitToUser(partnerUid, 'partner:disconnected', disconnectPayload);
  if (workspaceId) {
    emitToWorkspace(workspaceId, 'partner:disconnected', disconnectPayload);
  }
}

/**
 * Resolve and validate a scanned QR code payload
 * Handles both:
 * 1. Personal EverBond ID QR (e.g. EVERBOND:EB-XXXXXX)
 * 2. Pre-generated invite QR payload
 */
export async function resolveQRPayload(
  currentUserUid: string,
  rawPayload: string
): Promise<{ type: 'personal_id' | 'invite'; data: any }> {
  if (!rawPayload || typeof rawPayload !== 'string') {
    throw new Error('QR_INVALID');
  }

  const trimmed = rawPayload.trim();

  // Check personal ID format: EVERBOND:EB-[A-Z0-9]{6} or direct EB-[A-Z0-9]{6}
  const idMatch =
    trimmed.match(/^EVERBOND:(EB-[A-Z0-9]{6})$/i) ||
    trimmed.match(/connect\/(EB-[0-9A-Z]{6})/i) ||
    trimmed.match(/^(EB-[0-9A-Z]{6})$/i);

  if (idMatch) {
    const targetEbId = idMatch[1].toUpperCase();
    const targetUser = await User.findOne({ ebId: targetEbId });
    if (!targetUser) throw new Error('RECEIVER_NOT_FOUND');
    if (targetUser.firebaseUid === currentUserUid) throw new Error('QR_SELF');
    if (targetUser.partnerStatus === 'connected') throw new Error('RECEIVER_ALREADY_CONNECTED');

    return {
      type: 'personal_id',
      data: {
        ebId: targetUser.ebId,
        fullName: targetUser.fullName,
        photoURL: targetUser.photoURL,
        uid: targetUser.firebaseUid,
      },
    };
  }

  // Check base64 encoded invite JSON (ebInvite: prefix)
  if (trimmed.startsWith('ebInvite:')) {
    const b64 = trimmed.slice('ebInvite:'.length);
    let payload: any;
    try {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      payload = JSON.parse(json);
    } catch (_) {
      throw new Error('QR_DECODE_FAILED');
    }

    if (!payload.inviteId || !payload.senderUid) throw new Error('QR_INVALID');
    if (payload.senderUid === currentUserUid) throw new Error('QR_SELF');
    if (payload.expiresAt && Date.now() > payload.expiresAt) throw new Error('QR_EXPIRED');

    const invite = await PartnerInvite.findById(payload.inviteId);
    if (!invite) throw new Error('INVALID_INVITE');
    if (invite.status !== 'pending') {
      throw new Error(`INVITE_${invite.status.toUpperCase()}`);
    }

    return {
      type: 'invite',
      data: invite,
    };
  }

  throw new Error('QR_INVALID');
}

/**
 * Get investment allocations for a connected workspace
 */
export async function getPartnerInvestments(userUid: string) {
  if (!userUid) throw new Error('UNAUTHENTICATED');
  const user = await User.findOne({ firebaseUid: userUid });
  if (!user || user.partnerStatus !== 'connected' || !user.workspaceId) {
    throw new Error('NOT_CONNECTED');
  }

  const workspace = await PartnerWorkspace.findById(user.workspaceId);
  if (!workspace || workspace.status !== 'connected') {
    throw new Error('NOT_CONNECTED');
  }

  const isPartner1 = workspace.partner1Uid === userUid;
  const myInvestment = isPartner1 ? (workspace.partner1Investment || 0) : (workspace.partner2Investment || 0);
  const partnerInvestment = isPartner1 ? (workspace.partner2Investment || 0) : (workspace.partner1Investment || 0);
  const totalInvestment = (workspace.partner1Investment || 0) + (workspace.partner2Investment || 0);

  return {
    workspaceId: workspace._id.toString(),
    isPartner1,
    myInvestment,
    partnerInvestment,
    totalInvestment,
    partner1Investment: workspace.partner1Investment || 0,
    partner2Investment: workspace.partner2Investment || 0,
    lastInvestmentUpdate: workspace.lastInvestmentUpdate,
  };
}

/**
 * Update investment allocation for caller in their connected workspace
 */
export async function updatePartnerInvestment(userUid: string, amount: number) {
  if (!userUid) throw new Error('UNAUTHENTICATED');
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    throw new Error('INVALID_AMOUNT');
  }

  const user = await User.findOne({ firebaseUid: userUid });
  if (!user || user.partnerStatus !== 'connected' || !user.workspaceId) {
    throw new Error('NOT_CONNECTED');
  }

  const workspace = await PartnerWorkspace.findById(user.workspaceId);
  if (!workspace || workspace.status !== 'connected') {
    throw new Error('NOT_CONNECTED');
  }

  const isPartner1 = workspace.partner1Uid === userUid;
  const now = new Date();
  if (isPartner1) {
    workspace.partner1Investment = parsedAmount;
  } else {
    workspace.partner2Investment = parsedAmount;
  }
  workspace.lastInvestmentUpdate = now;
  workspace.lastSync = now;
  await workspace.save();

  const totalInvestment = (workspace.partner1Investment || 0) + (workspace.partner2Investment || 0);

  const payload = {
    workspaceId: workspace._id.toString(),
    partner1Investment: workspace.partner1Investment || 0,
    partner2Investment: workspace.partner2Investment || 0,
    totalInvestment,
    updatedByUid: userUid,
    updatedAt: now.toISOString(),
  };

  // Broadcast to workspace room and both user rooms
  emitToWorkspace(workspace._id.toString(), 'partner:investments-updated', payload);
  emitToUser(workspace.partner1Uid, 'partner:investments-updated', payload);
  emitToUser(workspace.partner2Uid, 'partner:investments-updated', payload);

  return {
    success: true,
    ...payload,
  };
}

