/**
 * PartnerPage.jsx
 * Production-ready Partner Connection System — complete rewrite.
 *
 * Architecture:
 *  - usePartnerStatus hook: real-time Firestore listener → Zustand sync
 *  - ConnectedPartnerPanel: shown when partnerStatus = 'connected'
 *  - SendInvitePanel + PendingInvitesPanel: shown when not connected
 *  - Preserves existing QR/Link/ID wizard flow for invite creation
 *
 * Real-time: all data via onSnapshot — no page refresh needed.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { Card } from '../common/Card';

import {
  Users, Copy, Check, Heart, Key, Calendar, Link2, UserCheck,
  Sparkles, Lock, Shield, X, ArrowRight, Share2, Send,
  QrCode as QrCodeIcon, ScanLine, Camera, Download, AlertCircle, Info, LogOut, RefreshCw,
  Bell, Inbox, UserPlus,
} from 'lucide-react';
import * as QRCodeModule from 'react-qr-code';
import jsQR from 'jsqr';

import { db, auth } from '../../utils/firebase';
import {
  doc, getDoc, setDoc, writeBatch, collection,
  query, where, getDocs, onSnapshot,
} from 'firebase/firestore';

// ── New architecture imports ──
import { usePartnerStatus } from '../../hooks/usePartnerStatus';
import { ConnectedPartnerPanel } from './ConnectedPartnerPanel';
import { SendInvitePanel } from './SendInvitePanel';
import { PendingInvitesPanel } from './PendingInvitesPanel';

const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

export function PartnerPage({ setPage, connectCode }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  const everBondId = useFinanceStore(s => s.everBondId);
  const partnerLinked = useFinanceStore(s => s.partnerLinked);

  // Real-time partner status (Firestore → Zustand sync)
  const { isConnected, partnerName, loading: statusLoading } = usePartnerStatus(user?.uid);

  // ── Legacy wizard states (preserved for QR/Link/ID invite creation) ──
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Invite code states (sender side)
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [createdInviteId, setCreatedInviteId] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  // Partner B acceptance (via connectCode URL or ID input)
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [acceptChecked, setAcceptChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Success state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Camera QR scanner states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // ── View tab (when not connected) ──
  const [activeView, setActiveView] = useState('invite'); // 'invite' | 'pending'

  // ── Process connectCode from URL ──
  useEffect(() => {
    if (connectCode && user?.uid) {
      setHasConsented(true);
      setConsentChecked(true);
      handleValidateCode(connectCode);
    }
  }, [connectCode, user?.uid]);

  // ── Real-time listener: when sender's created invite is accepted ──
  useEffect(() => {
    if (!createdInviteId || !db) return;

    const unsub = onSnapshot(doc(db, 'partnerInvites', createdInviteId), async (docSnap) => {
      if (docSnap.exists()) {
        const inviteData = docSnap.data();
        if (inviteData.status === 'accepted') {
          // Zustand will be updated by usePartnerStatus hook via user doc listener
          toast.success('Partner accepted your invitation! Workspace is now active.');
          setShowSuccessScreen(true);
        }
      }
    });

    return () => unsub();
  }, [createdInviteId]);

  // ── Create invite code document ──
  const handleCreateInvite = async (method) => {
    if (!user?.uid) {
      toast.error('User session not found. Please log in again.');
      return;
    }
    setSelectedMethod(method);
    setIsCreatingInvite(true);

    try {
      const inviteCode = everBondId || '';
      const inviteId = doc(collection(db, 'partnerInvites')).id;
      const inviteRef = doc(db, 'partnerInvites', inviteId);
      const workspaceRef = doc(db, 'partnerWorkspaces', doc(collection(db, 'partnerWorkspaces')).id);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const batch = writeBatch(db);

      batch.set(inviteRef, {
        senderUid: user.uid,
        senderEbId: inviteCode,
        senderName: user.name || '',
        senderEmail: user.email || '',
        receiverUid: null,
        receiverEbId: null,
        receiverEmail: null,
        receiverName: null,
        status: 'pending',
        inviteCode,
        workspaceId: workspaceRef.id,
        createdAt: new Date().toISOString(),
        expiresAt,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
      });

      batch.set(workspaceRef, {
        partner1Uid: user.uid,
        partner1EbId: everBondId || '',
        partner1Name: user.name || '',
        partner2Uid: null,
        partner2EbId: null,
        partner2Name: null,
        status: 'pending',
        inviteId,
        createdAt: new Date().toISOString(),
        connectedAt: null,
        disconnectedAt: null,
      });

      await batch.commit();

      setCreatedInviteCode(inviteCode);
      setCreatedInviteId(inviteId);
    } catch (err) {
      console.error('[PartnerPage] handleCreateInvite error:', err);
      toast.error('Failed to generate invitation. Please try again.');
      setSelectedMethod(null);
    } finally {
      setIsCreatingInvite(false);
    }
  };

  // ── Validate code (Partner B lookup) ──
  const handleValidateCode = async (codeStr) => {
    const code = (codeStr || '').trim().toUpperCase();
    if (!code) return;
    setIsValidatingCode(true);

    try {
      if (code === everBondId || code === user?.uid) {
        toast.error('You cannot connect to yourself.');
        return;
      }

      // Check partnerInvites first (invite code flow)
      const qInvite = query(collection(db, 'partnerInvites'), where('inviteCode', '==', code));
      const querySnapInvite = await getDocs(qInvite);

      if (!querySnapInvite.empty) {
        const inviteDoc = querySnapInvite.docs[0];
        const inviteData = inviteDoc.data();

        if (inviteData.status !== 'pending') {
          toast.error(`This invitation has already been ${inviteData.status}.`);
          return;
        }

        const expiresAt = inviteData.expiresAt instanceof Date
          ? inviteData.expiresAt
          : inviteData.expiresAt?.toDate?.() ?? new Date(inviteData.expiresAt);
        if (new Date() > expiresAt) {
          toast.error('This invitation has expired.');
          return;
        }

        if (inviteData.senderUid === user?.uid) {
          toast.error('You cannot accept your own invitation.');
          return;
        }

        // Fetch sender details
        let senderName = inviteData.senderName || 'Partner';
        let senderEmail = inviteData.senderEmail || '';
        if (inviteData.senderUid && !senderName) {
          try {
            const senderSnap = await getDoc(doc(db, 'users', inviteData.senderUid));
            if (senderSnap.exists()) {
              senderName = senderSnap.data().fullName || senderName;
              senderEmail = senderSnap.data().email || senderEmail;
            }
          } catch (_) {}
        }

        setIncomingInvite({
          id: inviteDoc.id,
          ...inviteData,
          senderName,
          senderEmail,
          // Fill receiverUid so acceptInvite can validate
          receiverUid: user?.uid,
        });
      } else {
        // Try EverBond ID lookup
        const qUser = query(collection(db, 'users'), where('ebId', '==', code));
        const querySnapUser = await getDocs(qUser);

        if (querySnapUser.empty) {
          toast.error('Invite code or EverBond ID not found.');
          return;
        }

        const partnerUserDoc = querySnapUser.docs[0];
        const partnerUserData = partnerUserDoc.data();

        if (partnerUserData.uid === user?.uid || partnerUserDoc.id === user?.uid) {
          toast.error('You cannot connect to yourself.');
          return;
        }

        if (partnerUserData.partnerStatus === 'connected') {
          toast.error('This user is already connected with another partner.');
          return;
        }

        setIncomingInvite({
          id: 'direct',
          senderUid: partnerUserDoc.id,
          senderName: partnerUserData.fullName || 'Partner',
          senderEmail: partnerUserData.email || '',
          senderEbId: partnerUserData.ebId || code,
          inviteCode: code,
          receiverUid: user?.uid,
          isDirect: true,
        });
      }
    } catch (err) {
      console.error('[PartnerPage] handleValidateCode error:', err);
      toast.error('Failed to validate code. Please try again.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  // ── Accept connection (Partner B) ──
  const handleAcceptConnection = async () => {
    if (!incomingInvite || !user?.uid) return;
    setIsConnecting(true);

    try {
      const { acceptInvite, sendInvite } = await import('../../services/partnerService');
      const receiverUser = {
        uid: user.uid,
        ebId: everBondId || '',
        fullName: user.name || '',
      };

      if (incomingInvite.isDirect) {
        // Direct EB ID connection: sender must be found and a new invite created atomically
        // Use sendInvite from receiver side (sender field semantics swap for direct)
        // Instead, call service's acceptInvite after creating a quick invite
        const { runTransaction, serverTimestamp, doc: fsDoc, collection: fsCollection, writeBatch: fsWriteBatch } = await import('firebase/firestore');

        const inviteRef = fsDoc(fsCollection(db, 'partnerInvites'));
        const workspaceRef = fsDoc(fsCollection(db, 'partnerWorkspaces'));

        const batch = fsWriteBatch(db);

        // Create a pre-accepted invite for the direct connection
        batch.set(inviteRef, {
          senderUid: incomingInvite.senderUid,
          senderEbId: incomingInvite.senderEbId || '',
          senderName: incomingInvite.senderName || '',
          senderEmail: incomingInvite.senderEmail || '',
          receiverUid: user.uid,
          receiverEbId: everBondId || '',
          receiverEmail: user.email || '',
          receiverName: user.name || '',
          status: 'accepted',
          inviteCode: incomingInvite.inviteCode || everBondId || '',
          workspaceId: workspaceRef.id,
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          acceptedAt: serverTimestamp(),
          rejectedAt: null,
          cancelledAt: null,
        });

        batch.set(workspaceRef, {
          partner1Uid: incomingInvite.senderUid,
          partner1EbId: incomingInvite.senderEbId || '',
          partner1Name: incomingInvite.senderName || '',
          partner2Uid: user.uid,
          partner2EbId: everBondId || '',
          partner2Name: user.name || '',
          status: 'connected',
          inviteId: inviteRef.id,
          createdAt: serverTimestamp(),
          connectedAt: serverTimestamp(),
          disconnectedAt: null,
        });

        // Update both user docs
        batch.update(fsDoc(db, 'users', incomingInvite.senderUid), {
          partnerUid: user.uid,
          partnerEbId: everBondId || '',
          partnerStatus: 'connected',
          workspaceId: workspaceRef.id,
        });

        batch.update(fsDoc(db, 'users', user.uid), {
          partnerUid: incomingInvite.senderUid,
          partnerEbId: incomingInvite.senderEbId || '',
          partnerStatus: 'connected',
          workspaceId: workspaceRef.id,
        });

        // Notifications
        const { batchAddNotification } = await import('../../services/notificationService');
        batchAddNotification(batch, incomingInvite.senderUid, 'partner_invite_accepted',
          'Partner Connected!', `${user.name || 'Your partner'} connected with you directly.`, inviteRef.id);
        batchAddNotification(batch, user.uid, 'partner_invite_accepted',
          'Workspace Connected!', `You are now connected with ${incomingInvite.senderName || 'your partner'}.`, inviteRef.id);

        await batch.commit();

        // Update Zustand
        useFinanceStore.setState({
          partnerId: incomingInvite.senderUid,
          partnerEverBondId: incomingInvite.senderEbId || '',
          partnerLinked: true,
          partnerName: incomingInvite.senderName || 'Partner',
          partner2: incomingInvite.senderName || 'Partner',
          connectionStatus: 'connected',
          workspaceId: workspaceRef.id,
          stage: 'Committed',
          relationshipStage: 'Committed',
          relationshipStatus: 'Committed',
        });

      } else {
        // Standard invite acceptance via transaction
        const { workspaceId } = await acceptInvite(incomingInvite.id, receiverUser);
      }

      toast.success('Partner workspace connected!');
      setShowSuccessScreen(true);
      setIncomingInvite(null);
    } catch (err) {
      console.error('[PartnerPage] handleAcceptConnection error:', err);
      toast.error(err.message || 'Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // ── QR Scanner handlers ──
  const handleStartScanWorkflow = () => {
    setScanError('');
    setIsScannerOpen(true);
    setIsScanning(true);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          videoRef.current.play();
          requestAnimationFrame(tickScan);
        }
      })
      .catch(err => {
        setScanError('Camera access denied. Please check permissions or type code manually.');
        setIsScanning(false);
      });
  };

  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      scanLoopRef.current = requestAnimationFrame(tickScan);
      return;
    }
    const video = videoRef.current;
    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code) {
      handleQRScanned(code.data);
    } else {
      scanLoopRef.current = requestAnimationFrame(tickScan);
    }
  };

  const handleQRScanned = (scannedString) => {
    handleStopCamera();
    setIsScannerOpen(false);
    const match = scannedString.match(/connect\/(EB-[0-9A-Z]{6})/i)
      || scannedString.match(/^(EB-[0-9A-Z]{6})$/i);
    const parsedCode = match ? match[1].toUpperCase() : null;
    if (!parsedCode) {
      toast.error('Invalid EverBond invitation QR code scanned.');
      return;
    }
    handleValidateCode(parsedCode);
  };

  const handleStopCamera = () => {
    setIsScanning(false);
    if (scanLoopRef.current) { cancelAnimationFrame(scanLoopRef.current); scanLoopRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  const handleCloseScanner = () => { handleStopCamera(); setIsScannerOpen(false); setScanError(''); };
  const getInviteUrl = () => `${window.location.origin}${window.location.pathname}#/connect/${createdInviteCode}`;
  const maskEmail = (e) => {
    if (!e) return '***@***.com';
    const [name, domain] = e.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  };

  // ───────────────────────────────────────────────────────────────
  // RENDER STATES
  // ───────────────────────────────────────────────────────────────

  // Success screen
  if (showSuccessScreen) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
        <Card gold={true} style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.16) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              border: `2px solid ${T.gold}`,
            }}
          >
            <UserCheck size={36} style={{ color: T.gold }} />
          </motion.div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
            Partner Workspace Activated
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
            Your financial nodes have successfully established connection. You can now plan, save, and grow your wealth together.
          </p>
          <button
            onClick={() => { setShowSuccessScreen(false); setPage('dashboard'); }}
            className="onb-btn-continue"
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
          >
            Open Workspace
          </button>
        </Card>
      </div>
    );
  }

  // ── CONNECTED STATE: render ConnectedPartnerPanel ──
  if (isConnected || partnerLinked) {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '60px' }}>
        <div className="eb-page-header">
          <span className="page-eyebrow">Connection Workspace</span>
          <h1 className="page-title">Partner Workspace</h1>
          <p className="page-desc">Your workspace is actively connected to your partner node.</p>
        </div>
        <ConnectedPartnerPanel
          onDisconnected={() => {
            setPage('dashboard');
          }}
        />
      </div>
    );
  }

  // ── ACCEPTANCE FLOW: Partner B accepting an invite ──
  if (incomingInvite) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
        <Card gold={true} style={{ maxWidth: '460px', width: '100%', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--gold-pale)', color: T.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: `1px solid ${T.gold}40`,
          }}>
            <Heart size={28} />
          </div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
            Establish Partner Connection
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            You are connecting with a partner workspace to unlock shared wealth management tools.
          </p>

          <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              Partner Node Profile
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: 'var(--text)' }}>{incomingInvite.senderName || 'Partner'}</strong>
              </div>
              {incomingInvite.senderEmail && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                  <strong style={{ color: 'var(--text)' }}>{maskEmail(incomingInvite.senderEmail)}</strong>
                </div>
              )}
              {incomingInvite.senderEbId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>EverBond ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: T.gold }}>{incomingInvite.senderEbId}</strong>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="accept-consent"
              checked={acceptChecked}
              onChange={e => setAcceptChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="accept-consent" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I agree to establish a shared partner workspace and understand that co-trustee allocations will be synchronized.
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAcceptConnection}
              disabled={!acceptChecked || isConnecting}
              className="onb-btn-continue"
              style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem', opacity: (acceptChecked && !isConnecting) ? 1 : 0.6 }}
            >
              {isConnecting ? 'Activating…' : 'Accept Connection'}
            </button>
            <button
              onClick={() => { setIncomingInvite(null); setAcceptChecked(false); }}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── CONSENT PHASE (Phase 1) ──
  if (!hasConsented) {
    return (
      <div className="fade-in" style={{ maxWidth: '560px', margin: '40px auto 60px' }}>
        <Card style={{ padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
            background: 'radial-gradient(circle at center, rgba(184,144,42,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold-pale)', color: T.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              border: `1px solid ${T.gold}30`,
            }}>
              <Users size={24} />
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              Connect Your Partner
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Create a shared financial workspace and align your future together.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {['Shared financial goals', 'Joint milestone planning', 'Shared insights and projections', 'Private partner workspace'].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text)' }}>
                <span style={{ color: T.gold, fontWeight: 'bold' }}>✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Privacy & Sovereign Security</strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  Only the information you explicitly choose to share will be visible to your partner. Credentials and authentication data are never shared.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <input type="checkbox" id="consent-check" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} style={{ marginTop: '3px', accentColor: T.gold }} />
            <label htmlFor="consent-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I understand how partner workspaces function.
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
            <button onClick={() => setHasConsented(true)} disabled={!consentChecked} className="onb-btn-continue" style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem', opacity: consentChecked ? 1 : 0.6 }}>
              Continue
            </button>
            <button onClick={() => setPage('dashboard')} className="onb-btn-back" style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}>
              Back
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── METHOD SELECTION (Phase 2) ──
  if (!selectedMethod) {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '40px auto 60px' }}>
        <div className="eb-page-header">
          <span className="page-eyebrow">Partner Connection</span>
          <h1 className="page-title">Connect Your Partner</h1>
          <p className="page-desc">Choose how you'd like to establish the partner workspace.</p>
        </div>

        {/* View toggle: Create Invite vs Pending */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-warm)', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid var(--border)' }}>
          {[
            { id: 'invite', label: 'Send Invite', Icon: UserPlus },
            { id: 'pending', label: 'Pending', Icon: Inbox },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`partner-tab-${id}`}
              onClick={() => setActiveView(id)}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: activeView === id ? 'var(--bg-card)' : 'transparent',
                color: activeView === id ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeView === id ? 700 : 500,
                fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s',
                boxShadow: activeView === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'invite' ? (
            <motion.div
              key="invite-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* ── New: Send by EB ID or email ── */}
              <SendInvitePanel
                onInviteSent={() => setActiveView('pending')}
              />

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 500 }}>or generate an invite code</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              {/* Legacy QR / Link / ID method cards */}
              <Card style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>
                  Invite Code Methods
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { id: 'qr',   Icon: QrCodeIcon, label: 'QR Code',         desc: 'Generate a QR code for your partner to scan.' },
                    { id: 'link', Icon: Link2,       label: 'Invitation Link', desc: 'Share a secure link via any app.' },
                    { id: 'id',   Icon: Key,         label: 'Invite Code',     desc: 'Show or enter a 6-character code.' },
                  ].map(({ id, Icon, label, desc }) => (
                    <div
                      key={id}
                      onClick={() => handleCreateInvite(id)}
                      style={{
                        background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '14px',
                        padding: '14px', display: 'flex', alignItems: 'center', gap: '14px',
                        cursor: 'pointer', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.86rem', color: 'var(--text)', display: 'block' }}>{label}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                      <ArrowRight size={15} style={{ color: 'var(--text-faint)' }} />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="pending-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <PendingInvitesPanel
                onConnected={() => {
                  toast.success('Partner connected! Your workspace is now active.');
                  setShowSuccessScreen(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setHasConsented(false)} className="onb-btn-back" style={{ marginTop: '16px', width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}>
          Back
        </button>
      </div>
    );
  }

  // ── INVITE ACTION SCREENS (Phase 3: QR / Link / ID) ──
  return (
    <div className="fade-in" style={{ maxWidth: '580px', margin: '40px auto 60px' }}>
      <canvas ref={offscreenCanvasRef} style={{ display: 'none' }} />

      {isCreatingInvite ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <RefreshCw size={36} style={{ color: T.gold, margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>Generating Secure Invitation…</h3>
        </Card>
      ) : (
        <Card style={{ padding: '32px 24px', textAlign: 'center' }}>

          {/* QR Method */}
          {selectedMethod === 'qr' && (
            <div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '20px', border: `1.5px solid ${T.gold}40`, display: 'inline-flex', boxShadow: '0 8px 30px rgba(184,144,42,0.1)', marginBottom: '24px' }}>
                <QRCode value={getInviteUrl()} size={180} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Scan Partner Link</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.45 }}>
                Show this QR code to your partner. They can scan it with their phone camera to instantly establish the connection.
              </p>
            </div>
          )}

          {/* Link Method */}
          {selectedMethod === 'link' && (
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${T.gold}30` }}>
                <Link2 size={28} />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Share Invitation Link</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.45 }}>
                Send this secure web link to your partner. When opened, it will guide them through accepting the shared workspace.
              </p>
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 12px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1, textAlign: 'left' }}>{getInviteUrl()}</span>
                <button onClick={() => { navigator.clipboard.writeText(getInviteUrl()); toast.success('Link copied!'); }} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Copy size={12} /> Copy
                </button>
                <button onClick={async () => {
                  if (navigator.share) {
                    try { await navigator.share({ title: 'EverBond Wealth Connection', text: 'Join my shared workspace.', url: getInviteUrl() }); }
                    catch (e) {}
                  } else { navigator.clipboard.writeText(getInviteUrl()); toast.success('Link copied!'); }
                }} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>
          )}

          {/* ID Method */}
          {selectedMethod === 'id' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${T.gold}30` }}>
                  <Key size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Partner ID & Invite Code</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>Display your generated invite code or type your partner's code/ID below.</p>
              </div>

              {/* Your invite code */}
              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Your Invite Code</span>
                <strong style={{ fontSize: '1.4rem', color: T.gold, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{createdInviteCode || 'EB-XXXXXX'}</strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>Share this code with your partner</span>
              </div>

              {/* Enter partner code */}
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="code-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Enter Partner's Code or EverBond ID
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="code-input"
                    type="text"
                    className="onb-input-glow"
                    placeholder="e.g. EB-AB12CD"
                    value={manualCodeInput}
                    onChange={e => setManualCodeInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleStartScanWorkflow} className="btn-secondary" title="Scan QR Code" style={{ padding: '0 12px', border: '1px solid var(--border-mid)', borderRadius: '10px' }}>
                    <Camera size={18} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleValidateCode(manualCodeInput)}
                disabled={!manualCodeInput.trim() || isValidatingCode}
                className="onb-btn-continue"
                style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.88rem', opacity: manualCodeInput.trim() ? 1 : 0.6, marginBottom: '12px' }}
              >
                {isValidatingCode ? 'Checking…' : 'Connect Workspace'}
              </button>
            </div>
          )}

          {/* Waiting pulse (QR & Link) */}
          {(selectedMethod === 'qr' || selectedMethod === 'link') && (
            <div style={{ background: 'rgba(184,144,42,0.05)', border: `1px dashed ${T.gold}40`, borderRadius: '16px', padding: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.gold, display: 'inline-block', animation: 'pulse 1.5s ease infinite' }} />
                <strong style={{ fontSize: '0.88rem', color: T.gold }}>Waiting for your partner…</strong>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginTop: '6px' }}>
                Code: <strong style={{ fontFamily: 'monospace' }}>{createdInviteCode}</strong>
              </span>
            </div>
          )}

          <button
            onClick={() => { setSelectedMethod(null); setCreatedInviteCode(''); setCreatedInviteId(''); setManualCodeInput(''); }}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            Back to Options
          </button>
        </Card>
      )}

      {/* Camera QR scanner overlay */}
      {isScannerOpen && (
        <div className="eb-premium-overlay" style={{ zIndex: 100000 }} onClick={handleCloseScanner}>
          <div className="liquid-glass" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseScanner} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>Scan Invitation QR</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>Align the QR code within the viewfinder.</p>
            <div style={{ width: '240px', height: '240px', borderRadius: '16px', border: `3px solid ${T.gold}`, margin: '0 auto 20px', position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isScanning ? (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', left: 0, width: '100%', height: '3px', background: T.gold, boxShadow: `0 0 10px ${T.gold}`, animation: 'scanline 1.5s ease-in-out infinite' }} />
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '16px', fontSize: '0.8rem' }}>{scanError || 'Starting camera…'}</div>
              )}
            </div>
            <button onClick={handleCloseScanner} className="btn-secondary" style={{ width: 'auto', padding: '8px 20px', borderRadius: '100px', fontSize: '0.78rem' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
