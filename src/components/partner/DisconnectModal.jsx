/**
 * DisconnectModal.jsx
 * Premium confirmation modal for disconnecting a partner.
 * Requires two confirmation steps before calling the service.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, X, Loader } from 'lucide-react';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { disconnectPartner } from '../../services/partnerService';
import { useFinanceStore } from '../../store/useFinanceStore';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onDisconnected - callback after successful disconnect
 * @param {string} props.partnerName
 * @param {string} props.partnerUid
 * @param {string} props.workspaceId
 */
export function DisconnectModal({ isOpen, onClose, onDisconnected, partnerName, partnerUid, workspaceId }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  const userName = useFinanceStore(s => s.userName);

  const [confirmed, setConfirmed] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!user?.uid) return;
    setDisconnecting(true);
    try {
      await disconnectPartner(
        { uid: user.uid, fullName: userName || user.name || '' },
        partnerUid,
        workspaceId
      );

      // Update Zustand store
      useFinanceStore.setState({
        partnerId: '',
        partnerEverBondId: '',
        partnerLinked: false,
        partnerName: '',
        partner2: '',
        connectionStatus: 'none',
        workspaceId: '',
        stage: 'Single',
        relationshipStage: 'Single',
        relationshipStatus: 'Single',
      });

      toast.success('Partner workspace disconnected.');
      onDisconnected?.();
      onClose?.();
    } catch (err) {
      console.error('[DisconnectModal] disconnectPartner error:', err);
      toast.error(err.message || 'Failed to disconnect. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleClose = () => {
    if (disconnecting) return;
    setConfirmed(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="disconnect-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            key="disconnect-panel"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(208,92,114,0.25)',
              borderRadius: '20px',
              padding: '28px 24px',
              width: '100%',
              maxWidth: '420px',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={disconnecting}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-faint)', padding: '4px',
              }}
            >
              <X size={16} />
            </button>

            {/* Warning icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(208,92,114,0.1)',
              border: '1px solid rgba(208,92,114,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', color: 'var(--rose)',
            }}>
              <AlertTriangle size={22} />
            </div>

            <h2 style={{
              textAlign: 'center', fontSize: '1.2rem', fontWeight: 700,
              color: 'var(--text)', margin: '0 0 8px',
            }}>
              Disconnect Partner?
            </h2>
            <p style={{
              textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)',
              lineHeight: 1.5, margin: '0 0 22px',
            }}>
              This will permanently disconnect your shared workspace with{' '}
              <strong style={{ color: 'var(--text)' }}>{partnerName || 'your partner'}</strong>.
              Your personal data will be unaffected, but all shared workspace access will end.
            </p>

            {/* Warning list */}
            <div style={{
              background: 'rgba(208,92,114,0.05)',
              border: '1px solid rgba(208,92,114,0.15)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}>
              {[
                'Shared workspace access is immediately revoked',
                'Both users revert to Single mode',
                'Workspace is archived (not deleted)',
                'This action cannot be undone',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <span style={{ color: 'var(--rose)', fontWeight: 800, flexShrink: 0 }}>·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Confirmation checkbox */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              cursor: 'pointer', marginBottom: '20px',
              fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4,
            }}>
              <input
                id="disconnect-confirm-checkbox"
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                disabled={disconnecting}
                style={{ marginTop: '2px', accentColor: 'var(--rose)' }}
              />
              I understand this will disconnect my partner workspace and revert both accounts to Single mode.
            </label>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                id="disconnect-confirm-btn"
                onClick={handleDisconnect}
                disabled={!confirmed || disconnecting}
                style={{
                  flex: 2,
                  padding: '11px 16px',
                  borderRadius: '100px',
                  border: 'none',
                  background: 'var(--rose)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: (!confirmed || disconnecting) ? 'not-allowed' : 'pointer',
                  opacity: (!confirmed || disconnecting) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'opacity 0.15s',
                }}
              >
                {disconnecting ? (
                  <>
                    <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    Disconnecting…
                  </>
                ) : (
                  <>
                    <LogOut size={13} />
                    Yes, Disconnect
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={disconnecting}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
