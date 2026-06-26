/**
 * partnerErrors.js
 * Single source of truth for partner error code → user-facing message mapping.
 * Import this everywhere instead of defining local error maps.
 */

/** @type {Record<string, string>} */
export const PARTNER_ERROR_MESSAGES = {
  // Auth
  UNAUTHENTICATED:              'You must be signed in to perform this action.',
  UID_MISMATCH:                 'Authentication mismatch. Please sign out and sign back in.',
  UNAUTHORIZED:                 'You are not authorized to perform this action.',

  // Receiver lookup
  RECEIVER_NOT_FOUND:           'No EverBond user found with that ID or email address.',
  SENDER_NOT_FOUND:             'Your account details could not be found. Please refresh.',

  // Invite guards
  SELF_INVITE:                  'You cannot send an invitation to yourself.',
  SENDER_ALREADY_CONNECTED:     'You already have a connected partner. Disconnect first to send a new invitation.',
  RECEIVER_ALREADY_CONNECTED:   'This user is already connected with a partner.',
  DUPLICATE_INVITE:             'You already have a pending invitation with this person.',

  // Invite state
  INVALID_INVITE:               'This invitation no longer exists or has been removed.',
  INVITE_EXPIRED:               'This invitation has expired. Please request a new one.',
  INVITE_ACCEPTED:              'This invitation has already been accepted.',
  INVITE_REJECTED:              'This invitation has already been declined.',
  INVITE_CANCELLED:             'This invitation has been cancelled by the sender.',
  INVITE_PENDING:               'You already have a pending invitation from this person.',

  // Workspace
  WORKSPACE_NOT_FOUND:          'Partner workspace not found. Please contact support.',

  // QR
  QR_INVALID:                   'This is not a valid EverBond QR code.',
  QR_EXPIRED:                   'This QR code has expired. Please generate a new one.',
  QR_ALREADY_USED:              'This QR code has already been used.',
  QR_SELF:                      'You cannot scan your own QR code.',
  QR_DECODE_FAILED:             'Could not read this QR code. Please try again.',
  QR_VERSION_MISMATCH:          'This QR code format is outdated. Please generate a new one.',

  // Network
  NETWORK_ERROR:                'Network error. Please check your connection and try again.',
  TRANSACTION_FAILED:           'Connection failed due to a conflict. Please try again.',

  // Generic
  UNKNOWN_ERROR:                'An unexpected error occurred. Please try again.',
};

/**
 * Map a service error (Error object or string) to a user-friendly message.
 * Falls back gracefully so raw Firebase messages never reach the UI.
 * @param {unknown} err
 * @returns {string}
 */
export function getPartnerErrorMessage(err) {
  if (!err) return PARTNER_ERROR_MESSAGES.UNKNOWN_ERROR;

  // Check by message code first (our custom codes)
  const msg = err instanceof Error ? err.message : String(err);
  if (PARTNER_ERROR_MESSAGES[msg]) return PARTNER_ERROR_MESSAGES[msg];

  // Firebase-specific codes
  if (msg.includes('permission-denied') || msg.includes('Missing or insufficient'))
    return 'Permission denied. Please ensure you are signed in and try again.';
  if (msg.includes('unavailable') || msg.includes('offline'))
    return PARTNER_ERROR_MESSAGES.NETWORK_ERROR;
  if (msg.includes('already-exists'))
    return PARTNER_ERROR_MESSAGES.DUPLICATE_INVITE;
  if (msg.includes('not-found'))
    return PARTNER_ERROR_MESSAGES.INVALID_INVITE;
  if (msg.includes('unauthenticated'))
    return PARTNER_ERROR_MESSAGES.UNAUTHENTICATED;
  if (msg.includes('aborted') || msg.includes('transaction'))
    return PARTNER_ERROR_MESSAGES.TRANSACTION_FAILED;

  // Last resort: return a generic message (not the raw error)
  return PARTNER_ERROR_MESSAGES.UNKNOWN_ERROR;
}
