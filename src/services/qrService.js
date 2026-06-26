/**
 * qrService.js
 * Secure EverBond QR code encode / decode / validate service.
 *
 * Security model:
 *  - Payload is Base64-encoded JSON prefixed with "ebInvite:" for recognition
 *  - Contains NO personal info (no names, emails, phone numbers)
 *  - Contains: inviteId, workspaceId, inviteCode, senderUid, expiresAt, v (version)
 *  - Any QR that doesn't start with "ebInvite:" is rejected immediately
 *  - Expired, already-used, and own-QR codes are all caught with specific errors
 */

/** Current QR schema version */
const QR_VERSION = 1;
/** Prefix that every EverBond QR must start with */
const EB_QR_PREFIX = 'ebInvite:';

/**
 * @typedef {Object} QRPayload
 * @property {string}  inviteId
 * @property {string}  workspaceId
 * @property {string}  inviteCode
 * @property {string}  senderUid
 * @property {number}  expiresAt   - Unix timestamp (ms)
 * @property {number}  v           - Schema version
 */

/**
 * Encode an invite into a secure QR string.
 * @param {{id: string, workspaceId: string, inviteCode: string, senderUid: string, expiresAt: Date|{toDate:()=>Date}|number}} invite
 * @returns {string} QR string to embed in <QRCode value={...} />
 */
export function generateQRPayload(invite) {
  const expiresAtMs =
    invite.expiresAt instanceof Date
      ? invite.expiresAt.getTime()
      : invite.expiresAt?.toDate
        ? invite.expiresAt.toDate().getTime()
        : typeof invite.expiresAt === 'number'
          ? invite.expiresAt
          : Date.now() + 7 * 24 * 60 * 60 * 1000;

  /** @type {QRPayload} */
  const payload = {
    inviteId:    invite.id || invite.inviteId || '',
    workspaceId: invite.workspaceId || '',
    inviteCode:  invite.inviteCode || '',
    senderUid:   invite.senderUid || '',
    expiresAt:   expiresAtMs,
    v:           QR_VERSION,
  };

  const json   = JSON.stringify(payload);
  const b64    = btoa(unescape(encodeURIComponent(json)));
  return `${EB_QR_PREFIX}${b64}`;
}

/**
 * Decode a raw QR string into a QRPayload.
 * Throws QR_INVALID if not an EverBond QR.
 * @param {string} raw - Raw string from the QR scanner
 * @returns {QRPayload}
 */
export function decodeQRPayload(raw) {
  if (typeof raw !== 'string' || !raw.startsWith(EB_QR_PREFIX)) {
    throw new Error('QR_INVALID');
  }

  const b64 = raw.slice(EB_QR_PREFIX.length);
  let json;
  try {
    json = decodeURIComponent(escape(atob(b64)));
  } catch {
    throw new Error('QR_DECODE_FAILED');
  }

  let payload;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error('QR_DECODE_FAILED');
  }

  if (!payload || typeof payload !== 'object') throw new Error('QR_INVALID');
  if (payload.v !== QR_VERSION) throw new Error('QR_VERSION_MISMATCH');
  if (!payload.inviteId || !payload.senderUid) throw new Error('QR_INVALID');

  return payload;
}

/**
 * Validate a decoded QR payload against the current user context.
 * Throws specific error codes on every failure case.
 * @param {QRPayload} payload
 * @param {string} currentUid - The authenticated user's UID
 * @param {'pending'|'accepted'|'rejected'|'cancelled'|string} [inviteStatus]
 * @returns {void}
 */
export function validateQRPayload(payload, currentUid, inviteStatus) {
  // Own QR
  if (payload.senderUid === currentUid) {
    throw new Error('QR_SELF');
  }

  // Expired
  if (Date.now() > payload.expiresAt) {
    throw new Error('QR_EXPIRED');
  }

  // Already used
  if (inviteStatus && inviteStatus !== 'pending') {
    if (inviteStatus === 'accepted') throw new Error('QR_ALREADY_USED');
    if (inviteStatus === 'cancelled') throw new Error('INVITE_CANCELLED');
    if (inviteStatus === 'rejected') throw new Error('INVITE_REJECTED');
    throw new Error('QR_ALREADY_USED');
  }
}

/**
 * Get remaining seconds until a QR payload expires.
 * @param {QRPayload} payload
 * @returns {number} Seconds remaining (negative if expired)
 */
export function getQRSecondsRemaining(payload) {
  return Math.floor((payload.expiresAt - Date.now()) / 1000);
}

/**
 * Format expiry as a human-readable string.
 * @param {number} expiresAtMs
 * @returns {string}
 */
export function formatQRExpiry(expiresAtMs) {
  const diff = expiresAtMs - Date.now();
  if (diff <= 0) return 'Expired';
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `Expires in ${hours}h ${mins}m`;
  return `Expires in ${mins}m`;
}
