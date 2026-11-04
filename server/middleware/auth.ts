import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, VerifiedTokenUser } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: VerifiedTokenUser;
}

/**
 * Express middleware to authenticate requests via Firebase ID Token.
 * Derives `req.user.uid` strictly from verified token.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHENTICATED',
      message: 'Authorization header missing or malformed.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHENTICATED',
      message: 'Bearer token is empty.',
    });
    return;
  }

  try {
    const verifiedUser = await verifyFirebaseToken(token);
    req.user = verifiedUser;
    next();
  } catch (error: any) {
    const errorCode = error.message === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
    res.status(401).json({
      error: errorCode,
      message: 'Authentication token is invalid or expired.',
    });
  }
}
