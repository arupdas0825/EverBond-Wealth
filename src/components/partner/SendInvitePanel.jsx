/**
 * SendInvitePanel.jsx
 * Panel for sending a partner invitation by EverBond ID or email address.
 * Handles all client-visible error states gracefully.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { sendInvite } from '../../services/partnerService';
import { useFinanceStore } from '../../store/useFinanceStore';

/** Map service error codes to user-friendly messages */
const ERROR_MESSAGES = {
  UNAUTHENTICATED:          'You must be signed in to send invitations.',
  RECEIVER_NOT_FOUND:       'No EverBond user found with that ID or email address.',
  SELF_INVITE:              'You cannot send an invitation to yourself.',
  SENDER_ALREADY_CONNECTED: 'You already have a connected partner. Disconnect first.',
  RECEIVER_ALREADY_CONNECTED: 'This user is already connected with another partner.',
  DUPLICATE_INVITE:         'You already have a pending invitation with this person.',
  NETWORK_ERROR:            'Network error. Please check your connection and try again.',
};

function getErrorMessage(err) {
  if (!err) return 'An unexpected error occurred.';
  const code = err.message?.toUpperCase().replace(/[^A-Z_]/g, '_') || '';
  return ERROR_MESSAGES[err.message] || ERROR_MESSAGES[code] || err.message || 'An unexpected error occurred.';
}

/**
 * @param {Object} props
 * @param {Function} props.onInviteSent - callback when invite successfully sent
 */
export function SendInvitePanel({ onInviteSent }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  const everBondId = useFinanceStore(s => s.everBondId);
  const userName = useFinanceStore(s => s.userName);

  const [identifier, setIdentifier] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const isEmail = identifier.includes('@');
  const InputIcon = isEmail ? Mail : User;

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = identifier.trim();

    if (!trimmed) {
      setFieldError('Please enter an EverBond ID or email address.');
      return;
    }

    // Basic email format check if it looks like an email
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    setFieldError('');
    setSending(true);

    try {
      const senderUser = {
        uid: user?.uid,
        ebId: everBondId || '',
        fullName: userName || user?.name || '',
        email: user?.email || '',
      };

      await sendInvite(senderUser, trimmed);

      setSentSuccess(true);
      setIdentifier('');
      toast.success('Invitation sent successfully!');
      onInviteSent?.();

      // Reset success state after 4s
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (err) {
      console.error('[SendInvitePanel] sendInvite error:', err);
      const msg = getErrorMessage(err);
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card style={{ padding: '24px' }}>
      {/* Section label */}
      <span style={{
        fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px',
      }}>
        Send Invitation
      </span>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
        Invite Your Partner
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
        Enter your partner's EverBond ID (e.g. <code style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: T.gold }}>EB-AR7X92</code>) or their registered email address.
      </p>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Input row */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: fieldError ? 'var(--rose)' : 'var(--text-faint)',
            pointerEvents: 'none',
          }}>
            <InputIcon size={15} />
          </div>
          <input
            id="partner-invite-input"
            type="text"
            className="onb-input-glow"
            placeholder={isEmail ? 'partner@example.com' : 'EB-XXXXXX or email'}
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setFieldError(''); setSentSuccess(false); }}
            disabled={sending}
            autoComplete="off"
            autoCapitalize="off"
            style={{
              paddingLeft: '38px',
              width: '100%',
              boxSizing: 'border-box',
              borderColor: fieldError ? 'var(--rose)' : undefined,
            }}
          />
        </div>

        {/* Validation error */}
        <AnimatePresence>
          {fieldError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '7px',
                background: 'rgba(208,92,114,0.07)', border: '1px solid rgba(208,92,114,0.25)',
                borderRadius: '10px', padding: '10px 12px',
                fontSize: '0.78rem', color: 'var(--rose)', lineHeight: 1.4,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              {fieldError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success feedback */}
        <AnimatePresence>
          {sentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'rgba(100,180,130,0.08)', border: '1px solid rgba(100,180,130,0.25)',
                borderRadius: '10px', padding: '10px 12px',
                fontSize: '0.78rem', color: 'var(--sage)', lineHeight: 1.4,
              }}
            >
              <CheckCircle size={14} />
              Invitation sent! Your partner will see it in their pending invitations.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <button
          id="send-invite-btn"
          type="submit"
          disabled={sending || !identifier.trim()}
          className="onb-btn-continue"
          style={{
            padding: '11px 20px',
            borderRadius: '100px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            opacity: (sending || !identifier.trim()) ? 0.6 : 1,
            cursor: (sending || !identifier.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? (
            <>
              <Loader size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Sending…
            </>
          ) : (
            <>
              <Send size={14} />
              Send Invitation
            </>
          )}
        </button>
      </form>

      {/* Your EverBond ID hint */}
      {everBondId && (
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          fontSize: '0.72rem',
          color: 'var(--text-faint)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <User size={12} style={{ color: T.gold }} />
          Your EverBond ID:{' '}
          <strong style={{ fontFamily: 'monospace', color: T.gold }}>{everBondId}</strong>
          <span style={{ color: 'var(--text-faint)', fontSize: '0.65rem' }}>
            Share this with your partner so they can invite you.
          </span>
        </div>
      )}
    </Card>
  );
}
