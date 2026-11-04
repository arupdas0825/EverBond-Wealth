import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getOrCreateUser, completeUserOnboarding } from '../services/userService';
import { User } from '../models/User';

const router = Router();

router.use(requireAuth);

/**
 * POST /api/user/sync
 * Called on frontend auth resolution.
 * Atomically retrieves or creates user in MongoDB.
 * Permanently binds EverBond ID to firebaseUid.
 */
router.post('/sync', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tokenUser = req.user!;
    const { fullName, photoURL, ebId } = req.body;

    const user = await getOrCreateUser(
      tokenUser.uid,
      tokenUser.email,
      fullName || tokenUser.name,
      photoURL || tokenUser.picture,
      ebId
    );

    res.json({
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        ebId: user.ebId,
        email: user.email,
        fullName: user.fullName,
        photoURL: user.photoURL,
        age: user.age,
        country: user.country,
        currency: user.currency,
        mode: user.mode,
        onboardingCompleted: user.onboardingCompleted ?? false,
        partnerStatus: user.partnerStatus,
        partnerUid: user.partnerUid,
        partnerEbId: user.partnerEbId,
        partnerName: user.partnerName,
        partnerPhoto: user.partnerPhoto,
        workspaceId: user.workspaceId,
        connectedAt: user.connectedAt,
      },
    });
  } catch (err: any) {
    console.error('[UserRoutes] /sync error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * POST /api/user/onboarding
 * Completes onboarding in MongoDB for authenticated user.
 * Saves demographic and mode preferences and sets onboardingCompleted=true.
 */
router.post('/onboarding', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const { fullName, age, country, currency, mode, termsAccepted, privacyAccepted, dataConsent } = req.body;

    const user = await completeUserOnboarding(uid, {
      fullName,
      age: age !== undefined && age !== '' ? parseInt(age) : undefined,
      country,
      currency,
      mode,
      termsAccepted,
      privacyAccepted,
      dataConsent,
    });

    res.json({
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        ebId: user.ebId,
        email: user.email,
        fullName: user.fullName,
        photoURL: user.photoURL,
        age: user.age,
        country: user.country,
        currency: user.currency,
        mode: user.mode,
        onboardingCompleted: user.onboardingCompleted,
        partnerStatus: user.partnerStatus,
        partnerUid: user.partnerUid,
        partnerEbId: user.partnerEbId,
        partnerName: user.partnerName,
        partnerPhoto: user.partnerPhoto,
        workspaceId: user.workspaceId,
        connectedAt: user.connectedAt,
      },
    });
  } catch (err: any) {
    console.error('[UserRoutes] /onboarding error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

/**
 * GET /api/user/profile
 * Get authenticated user profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user!.uid;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      res.status(404).json({ error: 'USER_NOT_FOUND' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    console.error('[UserRoutes] /profile error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
