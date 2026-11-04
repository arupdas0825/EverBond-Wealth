import rateLimit from 'express-rate-limit';

export const inviteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 invite actions per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many invite actions from this connection, please try again later.',
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please slow down.',
  },
});
