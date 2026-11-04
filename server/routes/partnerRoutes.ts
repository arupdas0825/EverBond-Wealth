import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { inviteRateLimiter } from '../middleware/rateLimiter';
import { User } from '../models/User';
import { PartnerInvite } from '../models/PartnerInvite';
import { PartnerWorkspace } from '../models/PartnerWorkspace';
import { Notification } from '../models/Notification';
import { Message } from '../models/Message';
import {
  sendPartnerInvite,
  acceptPartnerInvite,
  rejectPartnerInvite,
  cancelPartnerInvite,
  disconnectPartner,
  resolveQRPayload,
  getPartnerInvestments,
  updatePartnerInvestment,
} from '../services/partnerService';
import { emitToWorkspace } from '../websocket/socketServer';

const router = Router();

// All partner routes require verified Firebase token
router.use(requireAuth);

/**
 * GET /api/partner/status
 * Get the current user's partner and workspace relationship status
 */
router.get('/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      res.status(404).json({ error: 'USER_NOT_FOUND' });
      return;
    }

    const isConnected = user.partnerStatus === 'connected' && !!user.partnerUid;

    res.json({
      isConnected,
      partnerUid: user.partnerUid || '',
      partnerEbId: user.partnerEbId || '',
      partnerName: user.partnerName || '',
      partnerPhoto: user.partnerPhoto || '',
      workspaceId: user.workspaceId || '',
      partnerStatus: user.partnerStatus || 'none',
      connectedAt: user.connectedAt || null,
      ebId: user.ebId,
      fullName: user.fullName,
    });
  } catch (err: any) {
    console.error('[PartnerRoutes] GET /status error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/partner/invites
 * Send an invitation to another user
 */
router.post(
  '/invites',
  inviteRateLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const senderUid = req.user!.uid;
      const { recipientIdentifier } = req.body;

      if (!recipientIdentifier) {
        res.status(400).json({ error: 'INVALID_INPUT', message: 'Recipient identifier is required.' });
        return;
      }

      const result = await sendPartnerInvite(senderUid, recipientIdentifier);
      res.status(201).json({
        success: true,
        invite: result.invite,
      });
    } catch (err: any) {
      console.warn('[PartnerRoutes] POST /invites warning:', err.message);
      const statusCode =
        err.message === 'RECEIVER_NOT_FOUND' || err.message === 'SENDER_NOT_FOUND'
          ? 404
          : err.message === 'SELF_INVITE' ||
            err.message === 'DUPLICATE_INVITE' ||
            err.message === 'SENDER_ALREADY_CONNECTED' ||
            err.message === 'RECEIVER_ALREADY_CONNECTED'
          ? 400
          : 500;

      res.status(statusCode).json({ error: err.message });
    }
  }
);

/**
 * GET /api/partner/invites
 * Get all sent and received invitations for authenticated user
 */
router.get('/invites', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;

    const [sent, received] = await Promise.all([
      PartnerInvite.find({ senderUid: uid }).sort({ createdAt: -1 }).limit(50),
      PartnerInvite.find({ receiverUid: uid }).sort({ createdAt: -1 }).limit(50),
    ]);

    res.json({
      sent,
      received,
    });
  } catch (err: any) {
    console.error('[PartnerRoutes] GET /invites error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/partner/invites/:id/accept
 * Accept a pending invitation
 */
router.post(
  '/invites/:id/accept',
  inviteRateLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const receiverUid = req.user!.uid;
      const inviteId = String(req.params.id);

      if (!mongoose.isValidObjectId(inviteId)) {
        res.status(400).json({ error: 'INVALID_INVITE', message: 'Malformed invitation ID.' });
        return;
      }

      const result = await acceptPartnerInvite(receiverUid, inviteId);
      res.json({
        success: true,
        workspaceId: result.workspace._id.toString(),
        workspace: result.workspace,
      });
    } catch (err: any) {
      console.warn('[PartnerRoutes] POST /invites/:id/accept error:', err.message);
      const statusCode =
        err.message === 'INVALID_INVITE' || err.message === 'INVITE_EXPIRED'
          ? 404
          : err.message === 'UNAUTHORIZED'
          ? 403
          : 400;

      res.status(statusCode).json({ error: err.message });
    }
  }
);

/**
 * POST /api/partner/invites/:id/reject
 * Reject a pending invitation
 */
router.post('/invites/:id/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const receiverUid = req.user!.uid;
    const inviteId = String(req.params.id);

    if (!mongoose.isValidObjectId(inviteId)) {
      res.status(400).json({ error: 'INVALID_INVITE', message: 'Malformed invitation ID.' });
      return;
    }

    await rejectPartnerInvite(receiverUid, inviteId);
    res.json({ success: true });
  } catch (err: any) {
    console.warn('[PartnerRoutes] POST /invites/:id/reject error:', err.message);
    res.status(err.message === 'UNAUTHORIZED' ? 403 : 400).json({ error: err.message });
  }
});

/**
 * POST /api/partner/invites/:id/cancel
 * Cancel a pending invitation (sender only)
 */
router.post('/invites/:id/cancel', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderUid = req.user!.uid;
    const inviteId = String(req.params.id);

    if (!mongoose.isValidObjectId(inviteId)) {
      res.status(400).json({ error: 'INVALID_INVITE', message: 'Malformed invitation ID.' });
      return;
    }

    await cancelPartnerInvite(senderUid, inviteId);
    res.json({ success: true });
  } catch (err: any) {
    console.warn('[PartnerRoutes] POST /invites/:id/cancel error:', err.message);
    res.status(err.message === 'UNAUTHORIZED' ? 403 : 400).json({ error: err.message });
  }
});

/**
 * POST /api/partner/disconnect
 * Disconnect partner and archive workspace
 */
router.post('/disconnect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    await disconnectPartner(uid);
    res.json({ success: true });
  } catch (err: any) {
    console.warn('[PartnerRoutes] POST /disconnect error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/partner/workspace
 * Get details of current partner workspace
 */
router.get('/workspace', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user || !user.workspaceId) {
      res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
      return;
    }

    const workspace = await PartnerWorkspace.findById(user.workspaceId);
    if (!workspace) {
      res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
      return;
    }

    res.json({ workspace });
  } catch (err: any) {
    console.error('[PartnerRoutes] GET /workspace error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/partner/investments
 * Get current investment split for connected partner workspace
 */
router.get('/investments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const data = await getPartnerInvestments(uid);
    res.json({ success: true, ...data });
  } catch (err: any) {
    if (err.message === 'NOT_CONNECTED') {
      res.status(403).json({ error: 'NOT_CONNECTED', message: 'User is not in an active connected workspace.' });
      return;
    }
    console.error('[PartnerRoutes] GET /investments error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/partner/investments
 * Update investment amount for caller and sync via WebSocket
 */
router.post('/investments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const { amount } = req.body;
    if (amount === undefined || amount === null) {
      res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Amount is required.' });
      return;
    }

    const result = await updatePartnerInvestment(uid, Number(amount));
    res.json(result);
  } catch (err: any) {
    if (err.message === 'NOT_CONNECTED') {
      res.status(403).json({ error: 'NOT_CONNECTED', message: 'User is not in an active connected workspace.' });
      return;
    }
    if (err.message === 'INVALID_AMOUNT') {
      res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Investment amount must be a non-negative number.' });
      return;
    }
    console.error('[PartnerRoutes] POST /investments error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/partner/qr/resolve
 * Resolve and validate a scanned QR code payload
 */
router.post('/qr/resolve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const { qrPayload } = req.body;

    if (!qrPayload) {
      res.status(400).json({ error: 'QR_INVALID', message: 'QR payload is required.' });
      return;
    }

    const result = await resolveQRPayload(uid, qrPayload);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.warn('[PartnerRoutes] POST /qr/resolve error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/partner/notifications
 * Get recent notifications for authenticated user
 */
router.get('/notifications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const notifications = await Notification.find({ recipientUid: uid })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (err: any) {
    console.error('[PartnerRoutes] GET /notifications error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/partner/notifications/:id/read
 */
router.post('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const notifId = String(req.params.id);

    const query = mongoose.isValidObjectId(notifId)
      ? { _id: notifId, recipientUid: uid }
      : { relatedInviteId: notifId, recipientUid: uid };

    await Notification.findOneAndUpdate(query, { read: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/partner/notifications/read-all
 */
router.post('/notifications/read-all', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    await Notification.updateMany({ recipientUid: uid, read: false }, { read: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/partner/messages (Phase 16 - Partner Communication)
 */
router.get('/messages', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user || !user.workspaceId || user.partnerStatus !== 'connected') {
      res.status(403).json({ error: 'NOT_CONNECTED_TO_WORKSPACE' });
      return;
    }

    const messages = await Message.find({ workspaceId: user.workspaceId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/partner/messages (Phase 16 - Partner Communication)
 */
router.post('/messages', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'MESSAGE_EMPTY' });
      return;
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || !user.workspaceId || user.partnerStatus !== 'connected') {
      res.status(403).json({ error: 'NOT_CONNECTED_TO_WORKSPACE' });
      return;
    }

    const msg = await Message.create({
      workspaceId: user.workspaceId,
      senderUid: uid,
      senderName: user.fullName || 'Partner',
      text: text.trim(),
    });

    emitToWorkspace(user.workspaceId, 'partner:message', msg);
    res.status(201).json({ success: true, message: msg });
  } catch (err: any) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
