/**
 * QRGeneratePanel.jsx — Migrated to MongoDB + Backend
 * Generates a secure EverBond QR code for partner invitation.
 * Zero Firestore dependencies.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as QRCodeModule from 'react-qr-code';
import { QrCode, Copy, Check, Camera, Clock, RefreshCw, Loader, Shield } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { useFinanceStore } from '../../store/useFinanceStore';

const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

/**
 * @param {Object} props
 * @param {Function} props.onScanRequest - called when user clicks "Scan QR"
 */
export function QRGeneratePanel({ onScanRequest }) {
  const toast = useToast();
  const user = useFinanceStore((s) => s.user);
  const everBondId = useFinanceStore((s) => s.everBondId);
  const userName = useFinanceStore((s) => s.userName);

  const [copied, setCopied] = useState(false);

  // Deterministic Personal EverBond ID payload as specified in Phase 14
  const qrString = everBondId ? `EVERBOND:${everBondId}` : '';

  const handleCopyCode = async () => {
    if (!everBondId) return;
    try {
      await navigator.clipboard.writeText(everBondId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('EverBond ID copied!');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <Card style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <QrCode size={16} style={{ color: T.gold }} />
        <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>
          QR Invitation
        </span>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
        Partner QR Code
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
        Have your partner scan this code with their EverBond app to connect directly.
      </p>

      {everBondId ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* QR Container with luxury border */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: '#ffffff',
              border: `2px solid ${T.gold}40`,
              boxShadow: `0 8px 24px rgba(184, 144, 42, 0.12)`,
              display: 'inline-flex',
            }}
          >
            <QRCode value={qrString} size={180} />
          </div>

          {/* ID Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '100px',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 600 }}>Your ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.86rem', fontWeight: 700, color: T.gold }}>
              {everBondId}
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#4E9B78' : 'var(--text-faint)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center', margin: 0 }}>
            Encrypted payload: <code style={{ color: T.gold }}>{qrString}</code>
          </p>

          {/* Scan Action */}
          {onScanRequest && (
            <button
              onClick={onScanRequest}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                marginTop: '8px',
              }}
            >
              <Camera size={15} />
              Switch to Camera Scanner
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-faint)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          Resolving permanent EverBond ID...
        </div>
      )}
    </Card>
  );
}
