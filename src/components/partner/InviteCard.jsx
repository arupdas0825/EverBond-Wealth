/**
 * InviteCard.jsx
 * Reusable card component for a single partner invitation.
 * Handles received (accept/reject) and sent (cancel) action modes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Clock, CheckCircle, XCircle, Ban, User } from 'lucide-react';
import { T } from '../../theme/tokens';

/** Relative time formatter */
function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Check if an invite is expired */
function isExpired(invite) {
  if (!invite.expiresAt) return false;
  return new Date() > new Date(invite.expiresAt);
}

const STATUS_CONFIG = {
  pending:   { color: 'var(--gold)',  label: 'Pending',   Icon: Clock },
  accepted:  { color: 'var(--sage)',  label: 'Accepted',  Icon: CheckCircle },
  rejected:  { color: 'var(--rose)',  label: 'Rejected',  Icon: XCircle },
  cancelled: { color: 'var(--text-faint)', label: 'Cancelled', Icon: Ban },
  expired:   { color: 'var(--text-faint)', label: 'Expired',   Icon: Clock },
};

/**
 * @param {Object} props
 * @param {import('../../hooks/usePartnerInvites').PartnerInvite} props.invite
 * @param {'received'|'sent'} props.mode
 * @param {(id: string) => Promise<void>} [props.onAccept]
 * @param {(id: string) => Promise<void>} [props.onReject]
 * @param {(id: string) => Promise<void>} [props.onCancel]
 * @param {boolean} [props.loading]
 */
export function InviteCard({ invite, mode, onAccept, onReject, onCancel, loading = false }) {
  const expired = isExpired(invite);
  const effectiveStatus = expired && invite.status === 'pending' ? 'expired' : invite.status;
  const { color, label, Icon } = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;

  const isPending = invite.status === 'pending' && !expired;

  const otherName = mode === 'received' ? invite.senderName : invite.receiverName;
  const otherEbId = mode === 'received' ? invite.senderEbId : invite.receiverEbId;
  const otherEmail = mode === 'received' ? invite.senderEmail : invite.receiverEmail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: 'var(--bg-warm)',
        border: `1px solid ${isPending ? `${T.gold}40` : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Avatar */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.gold}30, ${T.gold}10)`,
          border: `1px solid ${T.gold}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: T.gold,
        }}>
          <User size={18} />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
              {otherName || 'EverBond User'}
            </strong>
            {/* Status pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '2px 8px', borderRadius: '100px',
              background: `${color}18`, color,
            }}>
              <Icon size={9} />
              {label}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {otherEbId && (
              <span style={{ fontFamily: 'monospace', marginRight: '6px' }}>{otherEbId}</span>
            )}
            {otherEmail && !otherEbId && (
              <span style={{ marginRight: '6px' }}>{otherEmail}</span>
            )}
          </div>
        </div>

        {/* Time */}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {relativeTime(invite.createdAt)}
        </span>
      </div>

      {/* Expiry warning */}
      {invite.status === 'pending' && !expired && invite.expiresAt && (() => {
        const minsLeft = Math.floor((new Date(invite.expiresAt) - Date.now()) / 60000);
        const hoursLeft = Math.floor(minsLeft / 60);
        const daysLeft = Math.floor(hoursLeft / 24);
        const timeLabel = daysLeft > 0 ? `${daysLeft}d` : hoursLeft > 0 ? `${hoursLeft}h` : `${minsLeft}m`;
        return (
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-faint)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Clock size={10} />
            Expires in {timeLabel}
          </div>
        );
      })()}

      {/* Actions */}
      {isPending && mode === 'received' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onAccept?.(invite.id)}
            disabled={loading}
            style={{
              flex: 2,
              padding: '9px 16px',
              borderRadius: '100px',
              border: 'none',
              background: T.gold,
              color: '#12110E',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            <Check size={13} />
            {loading ? 'Accepting…' : 'Accept'}
          </button>
          <button
            onClick={() => onReject?.(invite.id)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '9px 16px',
              borderRadius: '100px',
              border: '1px solid var(--border-mid)',
              background: 'var(--bg)',
              color: 'var(--rose)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            <X size={13} />
            Decline
          </button>
        </div>
      )}

      {isPending && mode === 'sent' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onCancel?.(invite.id)}
            disabled={loading}
            style={{
              padding: '7px 14px',
              borderRadius: '100px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.72rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            <Trash2 size={12} />
            Cancel Invite
          </button>
        </div>
      )}
    </motion.div>
  );
}
