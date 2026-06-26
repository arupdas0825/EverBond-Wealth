/**
 * QRGeneratePanel.jsx
 * Generates a secure EverBond QR code for partner invitation.
 * - Uses qrService to encode payload (no personal info in QR)
 * - Shows invite code, expiry countdown, Copy + Scan actions
 * - Real-time waiting pulse while pending
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as QRCodeModule from 'react-qr-code';
import { QrCode, Copy, Check, Camera, Clock, RefreshCw, Loader, Shield } from 'lucide-react';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { useFinanceStore } from '../../store/useFinanceStore';
import { sendInvite } from '../../services/partnerService';
import { generateQRPayload, formatQRExpiry } from '../../services/qrService';

const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

/**
 * @param {Object} props
 * @param {Function} props.onScanRequest - called when user clicks "Scan QR"
 */
export function QRGeneratePanel({ onScanRequest }) {
  const toast = useToast();
  const user      = useFinanceStore(s => s.user);
  const everBondId= useFinanceStore(s => s.everBondId);
  const userName  = useFinanceStore(s => s.userName);

  const [invite,    setInvite]    = useState(null);   // { id, workspaceId, inviteCode, senderUid, expiresAt }
  const [qrString,  setQrString]  = useState('');
  const [generating,setGenerating]= useState(false);
  const [copied,    setCopied]    = useState(false);
  const [expiry,    setExpiry]    = useState('');

  // Live expiry countdown
  useEffect(() => {
    if (!invite?.expiresAt) return;
    const tick = () => setExpiry(formatQRExpiry(new Date(invite.expiresAt).getTime()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [invite]);

  const handleGenerate = async () => {
    if (!user?.uid) { toast.error('Sign in required.'); return; }
    setGenerating(true);
    try {
      const senderUser = {
        uid:      user.uid,
        ebId:     everBondId || '',
        fullName: userName || user.name || '',
        email:    user.email || '',
      };

      // Use sendInvite without a receiver — for QR we create a self-addressed invite
      // that gets accepted when the receiver scans. We'll create the invite doc directly.
      const { db } = await import('../../utils/firebase');
      const { doc, collection, writeBatch, serverTimestamp } = await import('firebase/firestore');
      const { assertAuth } = await import('../../firebase/firestoreGuard');
      const { batchAddNotification } = await import('../../services/notificationService');

      assertAuth();

      const inviteRef    = doc(collection(db, 'partnerInvites'));
      const workspaceRef = doc(collection(db, 'partnerWorkspaces'));
      const inviteId     = inviteRef.id;
      const workspaceId  = workspaceRef.id;
      const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const { getDoc } = await import('firebase/firestore');
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      const batch = writeBatch(db);
      batch.set(inviteRef, {
        senderUid:    user.uid,
        senderEbId:   userData.ebId || everBondId || '',
        senderName:   userData.fullName || userName || '',
        senderEmail:  userData.email || user.email || '',
        senderPhoto:  userData.photoURL || userData.profilePhoto || '',
        receiverUid:  null,  // filled when scanned
        receiverEbId: null,
        receiverEmail:null,
        receiverName: null,
        receiverPhoto:null,
        status:       'pending',
        inviteCode:   userData.ebId || everBondId || '',
        workspaceId,
        createdAt:    serverTimestamp(),
        expiresAt,
        acceptedAt:   null,
        rejectedAt:   null,
        cancelledAt:  null,
      });
      batch.set(workspaceRef, {
        partner1Uid:   user.uid,
        partner1EbId:  userData.ebId || everBondId || '',
        partner1Name:  userData.fullName || userName || '',
        partner1Photo: userData.photoURL || userData.profilePhoto || '',
        partner2Uid:   null,
        partner2EbId:  null,
        partner2Name:  null,
        partner2Photo: null,
        status:        'pending',
        inviteId,
        createdAt:     serverTimestamp(),
        connectedAt:   null,
        disconnectedAt:null,
        lastSync:      serverTimestamp(),
      });
      await batch.commit();

      const newInvite = {
        id:          inviteId,
        workspaceId,
        inviteCode:  userData.ebId || everBondId || '',
        senderUid:   user.uid,
        expiresAt,
      };
      setInvite(newInvite);
      setQrString(generateQRPayload(newInvite));
      toast.success('QR code generated!');
    } catch (err) {
      console.error('[QRGeneratePanel] generate error:', err);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!invite?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(invite.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Could not copy to clipboard.'); }
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
        Generate a secure QR code. Your partner scans it to instantly connect — no typing needed.
      </p>

      {!invite ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="onb-btn-continue"
          style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: generating ? 0.7 : 1 }}
        >
          {generating ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />Generating…</> : <><QrCode size={15} />Generate QR Code</>}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* QR Code */}
          <div style={{
            background: '#fff', padding: '20px', borderRadius: '20px',
            border: `2px solid ${T.gold}60`,
            boxShadow: `0 12px 40px ${T.gold}20, 0 4px 12px rgba(0,0,0,0.08)`,
            position: 'relative',
          }}>
            {/* Corner markers */}
            {[{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', width: '16px', height: '16px',
                borderColor: T.gold, borderStyle: 'solid', borderWidth: '0',
                ...(pos.top !== undefined ? { top: pos.top, borderTopWidth: '2.5px' } : { bottom: pos.bottom, borderBottomWidth: '2.5px' }),
                ...(pos.left !== undefined ? { left: pos.left, borderLeftWidth: '2.5px' } : { right: pos.right, borderRightWidth: '2.5px' }),
                borderRadius: pos.top !== undefined
                  ? (pos.left !== undefined ? '3px 0 0 0' : '0 3px 0 0')
                  : (pos.left !== undefined ? '0 0 0 3px' : '0 0 3px 0'),
              }} />
            ))}
            <QRCode value={qrString} size={180} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
          </div>

          {/* Invite code chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-warm)', border: `1px solid ${T.gold}30`, borderRadius: '100px', padding: '8px 16px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Invite Code:</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '1rem', color: T.gold, letterSpacing: '0.04em' }}>{invite.inviteCode}</strong>
            <button onClick={handleCopyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '2px', display: 'flex' }}>
              {copied ? <Check size={14} style={{ color: 'var(--sage)' }} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Expiry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
            <Clock size={12} />
            <span>{expiry || formatQRExpiry(new Date(invite.expiresAt).getTime())}</span>
          </div>

          {/* Waiting pulse */}
          <div style={{ background: `${T.gold}08`, border: `1px dashed ${T.gold}40`, borderRadius: '14px', padding: '12px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.gold, display: 'inline-block', animation: 'pulse 1.5s ease infinite' }} />
              <strong style={{ fontSize: '0.82rem', color: T.gold }}>Waiting for partner to scan…</strong>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Connection will establish automatically</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={onScanRequest}
              className="onb-btn-continue"
              style={{ flex: 1, padding: '11px', borderRadius: '100px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Camera size={14} />
              Scan Partner QR
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-secondary"
              style={{ padding: '11px 14px', borderRadius: '100px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} />
              Regenerate
            </button>
          </div>

          {/* Security note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.7rem', color: 'var(--text-faint)', lineHeight: 1.4 }}>
            <Shield size={11} style={{ flexShrink: 0, marginTop: '1px', color: T.gold }} />
            QR contains no personal information. Only accepts EverBond-generated codes.
          </div>
        </motion.div>
      )}
    </Card>
  );
}
