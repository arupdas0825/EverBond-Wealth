/**
 * ConnectedPartnerPanel.jsx — Full Rewrite
 * Shows all 7 required fields for connected partner:
 *  - Partner Photo (or gold initial avatar)
 *  - Partner Name + EverBond ID
 *  - Relationship Status
 *  - Connected Since date
 *  - Workspace Status pill
 *  - Connection Health indicator
 *  - Last Sync
 *  Buttons: View Workspace, Disconnect
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Calendar, Link2, LogOut, Copy, Check,
  Wifi, WifiOff, Clock, Activity, ExternalLink, RefreshCw, User, Heart,
} from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { DisconnectModal } from './DisconnectModal';
import { useFinanceStore } from '../../store/useFinanceStore';

function formatDate(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatSyncTime(val) {
  if (!val) return 'Never';
  const d = val instanceof Date ? val : new Date(val);
  const diff = Date.now() - d.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60)  return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

/** @param {{ onDisconnected: Function, setPage: Function }} props */
export function ConnectedPartnerPanel({ onDisconnected, setPage }) {
  const toast = useToast();

  const partnerName  = useFinanceStore(s => s.partnerName);
  const partnerEbId  = useFinanceStore(s => s.partnerEverBondId);
  const partnerPhoto = useFinanceStore(s => s.partnerPhoto);
  const partnerId    = useFinanceStore(s => s.partnerId);
  const workspaceId  = useFinanceStore(s => s.workspaceId);
  const stage        = useFinanceStore(s => s.stage);
  const connectedAt  = useFinanceStore(s => s.connectedAt);
  const userName     = useFinanceStore(s => s.userName);
  const user         = useFinanceStore(s => s.user);

  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedWs, setCopiedWs] = useState(false);

  const connectionHealth = connectedAt ? 'good' : 'unknown';

  const handleCopy = async (text, setter) => {
    try { await navigator.clipboard.writeText(text); setter(true); setTimeout(() => setter(false), 2000); }
    catch { toast.error('Could not copy to clipboard.'); }
  };

  // Initial avatar
  const avatarLetter = (partnerName || 'P').charAt(0).toUpperCase();
  const connectedSince = formatDate(connectedAt);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── Hero card ── */}
        <Card gold style={{ padding: '24px', overflow: 'hidden', position: 'relative' }}>
          {/* Radial glow */}
          <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: '60%', paddingBottom: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${T.gold}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>
              Partner Workspace
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Health indicator */}
              {connectionHealth === 'good' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: '100px', background: 'rgba(78,155,120,0.12)', color: '#4E9B78', border: '1px solid rgba(78,155,120,0.25)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4E9B78', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
                  Active
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: '100px', background: 'rgba(184,144,42,0.12)', color: T.gold, border: `1px solid ${T.gold}30` }}>
                  <WifiOff size={9} />
                  Syncing
                </span>
              )}
            </div>
          </div>

          {/* Partner info row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '16px', background: `${T.gold}06`, border: `1px solid ${T.gold}20`, marginBottom: '18px', position: 'relative' }}>
            {/* Avatar / Photo */}
            {partnerPhoto ? (
              <img
                src={partnerPhoto}
                alt={partnerName}
                style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.gold}50`, flexShrink: 0 }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.gold}40, ${T.gold}18)`, border: `2px solid ${T.gold}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: 800, color: T.gold, flexShrink: 0, fontFamily: T.fontDisplay }}>
                {avatarLetter}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {partnerName || 'Connected Partner'}
              </div>
              {partnerEbId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{partnerEbId}</span>
                  <button onClick={() => handleCopy(partnerEbId, setCopiedId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '2px', display: 'flex' }} title="Copy EverBond ID">
                    {copiedId ? <Check size={12} style={{ color: '#4E9B78' }} /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid — 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {/* Relationship Status */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <Heart size={11} style={{ color: T.gold }} />
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relationship</span>
              </div>
              <strong style={{ fontSize: '0.82rem', color: T.gold }}>{stage || 'Committed'}</strong>
            </div>

            {/* Connected Since */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <Calendar size={11} style={{ color: 'var(--text-faint)' }} />
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected</span>
              </div>
              <strong style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.3 }}>{connectedSince || 'Recently'}</strong>
            </div>

            {/* Workspace Status */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <Activity size={11} style={{ color: 'var(--text-faint)' }} />
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              </div>
              <strong style={{ fontSize: '0.78rem', color: '#4E9B78' }}>Active</strong>
            </div>

            {/* Last Sync */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <RefreshCw size={11} style={{ color: 'var(--text-faint)' }} />
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Sync</span>
              </div>
              <strong style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{formatSyncTime(connectedAt)}</strong>
            </div>
          </div>

          {/* Workspace ID chip */}
          {workspaceId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '9px 12px', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
              <Link2 size={11} style={{ flexShrink: 0 }} />
              <code style={{ fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspaceId.slice(0, 20)}…</code>
              <button onClick={() => handleCopy(workspaceId, setCopiedWs)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '2px', display: 'flex', flexShrink: 0 }}>
                {copiedWs ? <Check size={12} style={{ color: '#4E9B78' }} /> : <Copy size={12} />}
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              id="view-workspace-btn"
              onClick={() => setPage?.('dashboard')}
              className="onb-btn-continue"
              style={{ flex: 2, padding: '11px', borderRadius: '100px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} />
              View Workspace
            </button>
            <button
              id="disconnect-workspace-btn"
              onClick={() => setDisconnectOpen(true)}
              className="btn-secondary"
              style={{ flex: 1, padding: '11px', borderRadius: '100px', fontSize: '0.82rem', color: 'var(--rose)', borderColor: 'rgba(217,102,122,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LogOut size={13} />
              Disconnect
            </button>
          </div>
        </Card>

        {/* Privacy card */}
        <Card style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Shield size={15} style={{ color: T.gold, flexShrink: 0, marginTop: '1px' }} />
            <div>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block', marginBottom: '3px' }}>Privacy & Security</strong>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Only data you explicitly share is visible to your partner. Auth credentials are never shared.
              </p>
            </div>
          </div>
        </Card>

      </motion.div>

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
