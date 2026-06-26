/**
 * SendInvitePanel.jsx — Updated
 * Send partner invitation by EverBond ID or email.
 * Uses centralized partnerErrors for all error messages.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { sendInvite } from '../../services/partnerService';
import { getPartnerErrorMessage } from '../../utils/partnerErrors';
import { useFinanceStore } from '../../store/useFinanceStore';

export function SendInvitePanel({ onInviteSent }) {
  const toast    = useToast();
  const user     = useFinanceStore(s => s.user);
  const everBondId = useFinanceStore(s => s.everBondId);
  const userName   = useFinanceStore(s => s.userName);

  const [identifier,  setIdentifier]  = useState('');
  const [sending,     setSending]     = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [fieldError,  setFieldError]  = useState('');

  const isEmail   = identifier.includes('@');
  const InputIcon = isEmail ? Mail : User;

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed) { setFieldError('Enter an EverBond ID or email address.'); return; }
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setFieldError('Enter a valid email address.'); return; }

    setFieldError('');
    setSending(true);
    try {
      await sendInvite({
        uid:      user?.uid,
        ebId:     everBondId || '',
        fullName: userName || user?.name || '',
        email:    user?.email || '',
      }, trimmed);

      setSentSuccess(true);
      setIdentifier('');
      toast.success('Invitation sent!');
      onInviteSent?.();
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (err) {
      console.error('[SendInvitePanel]', err.message);
      const msg = getPartnerErrorMessage(err);
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card style={{ padding: '22px' }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '12px' }}>
        Send Invitation
      </span>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Invite Your Partner</h3>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 18px', lineHeight: 1.5 }}>
        Enter their EverBond ID (e.g. <code style={{ fontFamily: 'monospace', color: T.gold }}>EB-AR7X92</code>) or email.
      </p>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: fieldError ? '#D9667A' : 'var(--text-faint)', pointerEvents: 'none' }}>
            <InputIcon size={15} />
          </div>
          <input
            id="partner-invite-input"
            type="text"
            className="onb-input-glow"
            placeholder="EB-XXXXXX or email address"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setFieldError(''); setSentSuccess(false); }}
            disabled={sending}
            autoComplete="off"
            autoCapitalize="none"
            style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box', borderColor: fieldError ? '#D9667A' : undefined, minHeight: '44px' }}
          />
        </div>

        <AnimatePresence>
          {fieldError && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', background: 'rgba(217,102,122,0.07)', border: '1px solid rgba(217,102,122,0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.78rem', color: '#D9667A', lineHeight: 1.4 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              {fieldError}
            </motion.div>
          )}
          {sentSuccess && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(78,155,120,0.08)', border: '1px solid rgba(78,155,120,0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.78rem', color: '#4E9B78', lineHeight: 1.4 }}>
              <CheckCircle size={14} />
              Invitation sent! They'll see it in their pending invitations.
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="send-invite-btn"
          type="submit"
          disabled={sending || !identifier.trim()}
          className="onb-btn-continue"
          style={{ minHeight: '44px', borderRadius: '100px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', opacity: (sending || !identifier.trim()) ? 0.6 : 1, cursor: (sending || !identifier.trim()) ? 'not-allowed' : 'pointer' }}
        >
          {sending ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />Sending…</> : <><Send size={14} />Send Invitation</>}
        </button>
      </form>

      {everBondId && (
        <div style={{ marginTop: '14px', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
          <User size={11} style={{ color: T.gold, flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap' }}>Your ID:</span>
          <strong style={{ fontFamily: 'monospace', color: T.gold }}>{everBondId}</strong>
          <span style={{ fontSize: '0.65rem' }}>· Share with your partner</span>
        </div>
      )}
    </Card>
  );
}
