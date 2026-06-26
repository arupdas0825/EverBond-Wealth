/**
 * ConnectedPartnerPanel.jsx
 * Displays the connected partner details and workspace info.
 * Shows a disconnect button that opens DisconnectModal.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Calendar, Link2, LogOut, Copy, Check } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { DisconnectModal } from './DisconnectModal';
import { useFinanceStore } from '../../store/useFinanceStore';

/** Format a Date or ISO string to a readable date */
function formatDate(val) {
  if (!val) return 'Unknown';
  const d = val instanceof Date ? val : new Date(val);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * @param {Object} props
 * @param {Function} props.onDisconnected - callback after disconnect
 */
export function ConnectedPartnerPanel({ onDisconnected }) {
  const toast = useToast();

  const partnerName = useFinanceStore(s => s.partnerName);
  const partnerEbId = useFinanceStore(s => s.partnerEverBondId);
  const partnerId   = useFinanceStore(s => s.partnerId);
  const workspaceId = useFinanceStore(s => s.workspaceId);
  const stage       = useFinanceStore(s => s.stage);
  const connectedAt = useFinanceStore(s => s.connectedAt);

  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (!partnerEbId) return;
    try {
      await navigator.clipboard.writeText(partnerEbId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {/* Connected status hero card */}
        <Card gold={true} style={{ padding: '24px' }}>
          {/* Live status pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <span style={{
              fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: T.gold,
            }}>
              Partner Workspace
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '100px',
              background: 'rgba(100,180,130,0.12)', color: 'var(--sage)',
              border: '1px solid rgba(100,180,130,0.25)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
              Active
            </span>
          </div>

          {/* Partner info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px',
            padding: '16px', borderRadius: '14px',
            background: 'rgba(184,144,42,0.05)', border: `1px solid ${T.gold}25`,
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.gold}40, ${T.gold}15)`,
              border: `2px solid ${T.gold}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700, color: T.gold, flexShrink: 0,
            }}>
              {(partnerName || 'P').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>
                {partnerName || 'Connected Partner'}
              </div>
              {partnerEbId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {partnerEbId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '2px' }}
                    title="Copy EverBond ID"
                  >
                    {copied ? <Check size={12} style={{ color: 'var(--sage)' }} /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <Zap size={12} style={{ color: T.gold }} />
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stage
                </span>
              </div>
              <strong style={{ fontSize: '0.85rem', color: T.gold }}>{stage || 'Committed'}</strong>
            </div>

            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <Calendar size={12} style={{ color: 'var(--text-faint)' }} />
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Connected
                </span>
              </div>
              <strong style={{ fontSize: '0.78rem', color: 'var(--text)' }}>
                {connectedAt ? formatDate(connectedAt) : 'Recently'}
              </strong>
            </div>
          </div>

          {/* Workspace ID */}
          {workspaceId && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-faint)',
            }}>
              <Link2 size={11} />
              <span>Workspace: </span>
              <code style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {workspaceId.slice(0, 16)}…
              </code>
            </div>
          )}
        </Card>

        {/* Privacy & Security card */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                Privacy & Security
              </strong>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Only financial data you explicitly share is visible to your partner. Credentials and personal auth data are never shared.
              </p>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card style={{ padding: '20px 24px', border: '1px solid rgba(208,92,114,0.2)', background: 'rgba(208,92,114,0.02)' }}>
          <span style={{
            fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--rose)', display: 'block', marginBottom: '8px',
          }}>
            Danger Zone
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
            Disconnecting will immediately archive the shared workspace and revert both accounts to Single planning mode.
          </p>
          <button
            id="disconnect-workspace-btn"
            onClick={() => setDisconnectOpen(true)}
            className="btn-secondary"
            style={{
              color: 'var(--rose)',
              borderColor: 'rgba(208,92,114,0.35)',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.8rem', padding: '9px 18px',
              width: 'auto', borderRadius: '100px',
            }}
          >
            <LogOut size={13} />
            Disconnect Workspace
          </button>
        </Card>
      </motion.div>

      {/* Disconnect confirmation modal */}
      <DisconnectModal
        isOpen={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onDisconnected={onDisconnected}
        partnerName={partnerName}
        partnerUid={partnerId}
        workspaceId={workspaceId}
      />
    </>
  );
}
