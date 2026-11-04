/**
 * PartnerPage.jsx — Migrated to MongoDB + Socket.IO Backend
 * Single authoritative Partner Connection UI for EverBond Wealth.
 * 
 * Architecture:
 *  - usePartnerStatus: Real-time backend status + Socket.IO updates
 *  - ConnectedPartnerPanel: Rendered when partnerStatus === 'connected'
 *  - SendInvitePanel, PendingInvitesPanel, QRGeneratePanel: Sub-views when not connected
 *  - QRScanPanel: Camera QR scanner for direct ID connection
 * 
 * Complete removal of old competing Firestore queries, transactions, and mutations.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { Card } from '../common/Card';

import {
  Users,
  Copy,
  Check,
  Send,
  Inbox,
  QrCode,
  Camera,
  Shield,
  Loader,
} from 'lucide-react';

// Sub-components
import { usePartnerStatus } from '../../hooks/usePartnerStatus';
import { usePartnerInvites } from '../../hooks/usePartnerInvites';
import { ConnectedPartnerPanel } from './ConnectedPartnerPanel';
import { SendInvitePanel } from './SendInvitePanel';
import { PendingInvitesPanel } from './PendingInvitesPanel';
import { QRGeneratePanel } from './QRGeneratePanel';
import { QRScanPanel } from './QRScanPanel';

export function PartnerPage({ setPage, connectCode }) {
  const toast = useToast();
  const user = useFinanceStore((s) => s.user);
  const everBondId = useFinanceStore((s) => s.everBondId);

  // Authoritative real-time partner status from MongoDB + Socket.IO
  const { isConnected, partnerName, loading: statusLoading, refreshStatus } = usePartnerStatus(user?.uid);
  const { received } = usePartnerInvites(user?.uid);

  // Sub-view tab when not connected: 'invite' | 'pending' | 'qr'
  const [activeTab, setActiveTab] = useState(connectCode ? 'invite' : 'invite');
  const [copiedId, setCopiedId] = useState(false);

  // Camera QR scanner overlay
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Unread pending received invites count
  const pendingReceivedCount = received.filter((inv) => inv.status === 'pending').length;

  const handleCopyEbId = async () => {
    if (!everBondId) return;
    try {
      await navigator.clipboard.writeText(everBondId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast.success('EverBond ID copied to clipboard!');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const handleQRSuccess = (result) => {
    setIsScannerOpen(false);
    refreshStatus();
  };

  if (statusLoading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: T.gold, margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Loading partner status...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${T.gold}30, ${T.gold}10)`,
                border: `1px solid ${T.gold}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.gold,
              }}
            >
              <Users size={16} />
            </div>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: T.gold,
              }}
            >
              EverBond Wealth
            </span>
          </div>

          {/* User's Permanent EverBond ID badge */}
          {everBondId && (
            <div
              onClick={handleCopyEbId}
              title="Click to copy your EverBond ID"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '100px',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{ fontSize: '0.64rem', color: 'var(--text-faint)', fontWeight: 600 }}>ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: 700, color: T.gold }}>
                {everBondId}
              </span>
              {copiedId ? <Check size={11} style={{ color: '#4E9B78' }} /> : <Copy size={11} style={{ color: 'var(--text-faint)' }} />}
            </div>
          )}
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {isConnected ? `Shared Workspace` : `Partner Connection`}
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          {isConnected
            ? `Your financial ecosystem is connected with ${partnerName || 'your partner'}. Dual wealth streams are actively synced.`
            : `Link your finances with your partner to plan goals, forecast joint milestones, and share allocations.`}
        </p>
      </div>

      {/* ── Connected State View ── */}
      {isConnected ? (
        <ConnectedPartnerPanel setPage={setPage} onDisconnected={() => refreshStatus()} />
      ) : (
        /* ── Not Connected: Sub-navigation & Panels ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-navigation tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setActiveTab('invite')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'invite' ? 'var(--bg-muted)' : 'transparent',
                color: activeTab === 'invite' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeTab === 'invite' ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={13} style={{ color: activeTab === 'invite' ? T.gold : undefined }} />
              Send Invite
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'pending' ? 'var(--bg-muted)' : 'transparent',
                color: activeTab === 'pending' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeTab === 'pending' ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Inbox size={13} style={{ color: activeTab === 'pending' ? T.gold : undefined }} />
              Pending
              {pendingReceivedCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: T.gold,
                    color: '#000',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    marginLeft: '2px',
                  }}
                >
                  {pendingReceivedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'qr' ? 'var(--bg-muted)' : 'transparent',
                color: activeTab === 'qr' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeTab === 'qr' ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={13} style={{ color: activeTab === 'qr' ? T.gold : undefined }} />
              QR Code
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'invite' && (
              <motion.div
                key="invite-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <SendInvitePanel onInviteSent={() => setActiveTab('pending')} />
              </motion.div>
            )}

            {activeTab === 'pending' && (
              <motion.div
                key="pending-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <PendingInvitesPanel onConnected={() => refreshStatus()} />
              </motion.div>
            )}

            {activeTab === 'qr' && (
              <motion.div
                key="qr-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <QRGeneratePanel onScanRequest={() => setIsScannerOpen(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Camera QR Scanner Overlay ── */}
      {isScannerOpen && (
        <QRScanPanel
          onSuccess={handleQRSuccess}
          onBack={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
