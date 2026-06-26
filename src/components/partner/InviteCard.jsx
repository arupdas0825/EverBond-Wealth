/**
 * InviteCard.jsx — Mobile-fixed
 * Reusable card for a single partner invitation.
 * Fixes: text clamping, 44px touch targets, flex overflow on small screens.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Clock, CheckCircle, XCircle, Ban, User, Loader } from 'lucide-react';
import { T } from '../../theme/tokens';

function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isExpired(invite) {
  if (!invite.expiresAt) return false;
  return new Date() > new Date(invite.expiresAt);
}

const STATUS_CONFIG = {
  pending:   { color: T.gold,                label: 'Pending',   Icon: Clock },
  accepted:  { color: '#4E9B78',             label: 'Accepted',  Icon: CheckCircle },
  rejected:  { color: '#D9667A',             label: 'Declined',  Icon: XCircle },
  cancelled: { color: 'var(--text-faint)',   label: 'Cancelled', Icon: Ban },
  expired:   { color: 'var(--text-faint)',   label: 'Expired',   Icon: Clock },
};

export function InviteCard({ invite, mode, onAccept, onReject, onCancel, loading = false }) {
  const expired = isExpired(invite);
  const effectiveStatus = expired && invite.status === 'pending' ? 'expired' : invite.status;
  const { color, label, Icon } = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const isPending = invite.status === 'pending' && !expired;

  const otherName  = mode === 'received' ? invite.senderName  : invite.receiverName;
  const otherEbId  = mode === 'received' ? invite.senderEbId  : invite.receiverEbId;
  const otherEmail = mode === 'received' ? invite.senderEmail : invite.receiverEmail;
  const otherPhoto = mode === 'received' ? invite.senderPhoto : invite.receiverPhoto;
  const avatarLetter = (otherName || 'P').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      style={{
        background: 'var(--bg-warm)',
        border: `1px solid ${isPending ? `${T.gold}35` : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {otherPhoto ? (
            <img src={otherPhoto} alt={otherName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.gold}40` }} onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.gold}28, ${T.gold}10)`, border: `1.5px solid ${T.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, fontWeight: 700, fontSize: '0.9rem' }}>
              {avatarLetter}
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {otherName || 'EverBond User'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 7px', borderRadius: '100px', background: `${color}18`, color, flexShrink: 0 }}>
              <Icon size={8} />{label}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {otherEbId
              ? <span style={{ fontFamily: 'monospace' }}>{otherEbId}</span>
              : otherEmail || ''}
          </div>
        </div>

        {/* Time */}
        <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', flexShrink: 0, marginTop: '2px' }}>
          {relativeTime(invite.createdAt)}
        </span>
      </div>

      {/* Expiry hint */}
      {isPending && invite.expiresAt && (() => {
        const ms = new Date(invite.expiresAt) - Date.now();
        const d  = Math.floor(ms / 86400000);
        const h  = Math.floor((ms % 86400000) / 3600000);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', color: 'var(--text-faint)' }}>
            <Clock size={10} />
            {d > 0 ? `Expires in ${d}d ${h}h` : h > 0 ? `Expires in ${h}h` : 'Expires soon'}
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
              flex: 2, minHeight: '44px', padding: '0 16px',
              borderRadius: '100px', border: 'none',
              background: T.gold, color: '#12110E',
              fontWeight: 700, fontSize: '0.82rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
            {loading ? 'Accepting…' : 'Accept'}
          </button>
          <button
            onClick={() => onReject?.(invite.id)}
            disabled={loading}
            style={{
              flex: 1, minHeight: '44px', padding: '0 12px',
              borderRadius: '100px', border: '1px solid var(--border-mid)',
              background: 'var(--bg)', color: '#D9667A',
              fontWeight: 600, fontSize: '0.82rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            <X size={13} />Decline
          </button>
        </div>
      )}

      {isPending && mode === 'sent' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onCancel?.(invite.id)}
            disabled={loading}
            style={{
              minHeight: '40px', padding: '0 14px',
              borderRadius: '100px', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.75rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={11} />}
            {loading ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
