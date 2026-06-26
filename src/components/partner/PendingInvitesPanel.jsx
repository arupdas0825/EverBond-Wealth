/**
 * PendingInvitesPanel.jsx
 * Shows received and sent partner invitations with real-time updates.
 * Uses usePartnerInvites hook for live Firestore onSnapshot data.
 */

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, Send, RefreshCw, Bell } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { InviteCard } from './InviteCard';
import { usePartnerInvites } from '../../hooks/usePartnerInvites';
import { acceptInvite, rejectInvite, cancelInvite } from '../../services/partnerService';
import { useFinanceStore } from '../../store/useFinanceStore';

/** Map service error codes to user-friendly messages */
const ACTION_ERRORS = {
  UNAUTHENTICATED:  'You must be signed in.',
  INVALID_INVITE:   'This invitation no longer exists.',
  INVITE_EXPIRED:   'This invitation has expired.',
  INVITE_ACCEPTED:  'This invitation was already accepted.',
  INVITE_REJECTED:  'This invitation was already rejected.',
  INVITE_CANCELLED: 'This invitation was already cancelled.',
  UNAUTHORIZED:     'You are not authorized for this action.',
  WORKSPACE_NOT_FOUND: 'Workspace not found. Please contact support.',
};

function getActionError(err) {
  return ACTION_ERRORS[err?.message] || err?.message || 'Action failed. Please try again.';
}

const TABS = [
  { id: 'received', label: 'Received', Icon: Inbox },
  { id: 'sent',     label: 'Sent',     Icon: Send  },
];

/**
 * @param {Object} props
 * @param {Function} [props.onConnected] - callback when an invite is accepted and connection established
 */
export function PendingInvitesPanel({ onConnected }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  const everBondId = useFinanceStore(s => s.everBondId);
  const userName = useFinanceStore(s => s.userName);

  const { sent, received, loading, error } = usePartnerInvites(user?.uid);

  const [activeTab, setActiveTab] = useState('received');
  const [actionLoading, setActionLoading] = useState({}); // { [inviteId]: boolean }

  const setLoading = (id, val) =>
    setActionLoading(prev => ({ ...prev, [id]: val }));

  // ── Accept ──
  const handleAccept = useCallback(async (inviteId) => {
    if (!user?.uid) return;
    setLoading(inviteId, true);
    try {
      const receiverUser = {
        uid: user.uid,
        ebId: everBondId || '',
        fullName: userName || user.name || '',
      };
      const { workspaceId } = await acceptInvite(inviteId, receiverUser);
      toast.success('Partner connected! Your workspace is now active.');
      onConnected?.({ workspaceId });
    } catch (err) {
      console.error('[PendingInvitesPanel] acceptInvite error:', err);
      toast.error(getActionError(err));
    } finally {
      setLoading(inviteId, false);
    }
  }, [user, everBondId, userName, onConnected]);

  // ── Reject ──
  const handleReject = useCallback(async (inviteId) => {
    if (!user?.uid) return;
    setLoading(inviteId, true);
    try {
      await rejectInvite(inviteId, { uid: user.uid, fullName: userName || user.name || '' });
      toast.success('Invitation declined.');
    } catch (err) {
      console.error('[PendingInvitesPanel] rejectInvite error:', err);
      toast.error(getActionError(err));
    } finally {
      setLoading(inviteId, false);
    }
  }, [user, userName]);

  // ── Cancel ──
  const handleCancel = useCallback(async (inviteId) => {
    if (!user?.uid) return;
    setLoading(inviteId, true);
    try {
      await cancelInvite(inviteId, { uid: user.uid, fullName: userName || user.name || '' });
      toast.success('Invitation cancelled.');
    } catch (err) {
      console.error('[PendingInvitesPanel] cancelInvite error:', err);
      toast.error(getActionError(err));
    } finally {
      setLoading(inviteId, false);
    }
  }, [user, userName]);

  const pendingReceived = received.filter(i => i.status === 'pending');
  const pendingSent     = sent.filter(i => i.status === 'pending');
  const allReceived     = received;
  const allSent         = sent;

  const currentList = activeTab === 'received' ? allReceived : allSent;
  const pendingCount = activeTab === 'received' ? pendingReceived.length : pendingSent.length;

  return (
    <Card style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <span style={{
            fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '4px',
          }}>
            Invitations
          </span>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Partner Invitations
          </h3>
        </div>
        {loading && (
          <RefreshCw size={14} style={{ color: 'var(--text-faint)', animation: 'spin 1s linear infinite' }} />
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--bg)',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '18px',
        border: '1px solid var(--border)',
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const count = id === 'received' ? pendingReceived.length : pendingSent.length;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`invites-tab-${id}`}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--bg-warm)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span style={{
                  background: T.gold,
                  color: '#12110E',
                  borderRadius: '100px',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(208,92,114,0.07)', border: '1px solid rgba(208,92,114,0.2)',
          borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem',
          color: 'var(--rose)', marginBottom: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Invite list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '80px' }}>
        <AnimatePresence mode="popLayout">
          {loading && currentList.length === 0 ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: '80px', borderRadius: '16px',
                  background: 'var(--bg-muted)', animation: 'skeleton-pulse 1.5s ease infinite',
                }} />
              ))}
            </motion.div>
          ) : currentList.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', padding: '32px 16px',
                color: 'var(--text-faint)', fontSize: '0.82rem',
              }}
            >
              <Bell size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <div style={{ fontWeight: 500 }}>
                {activeTab === 'received' ? 'No invitations received yet.' : 'No invitations sent yet.'}
              </div>
            </motion.div>
          ) : (
            currentList.map(invite => (
              <InviteCard
                key={invite.id}
                invite={invite}
                mode={activeTab}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                loading={!!actionLoading[invite.id]}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
