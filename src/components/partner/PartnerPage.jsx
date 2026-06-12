import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { Card } from '../common/Card';
import {
  Users, Copy, Check, Heart, Key, Calendar, Link2, UserCheck,
  Sparkles, Lock, Shield, X, ArrowRight,
  QrCode as QrCodeIcon, ScanLine, Camera, Download, AlertCircle, Info, LogOut, RefreshCw
} from 'lucide-react';
import * as QRCodeModule from 'react-qr-code';
import jsQR from 'jsqr';
import { db, auth, createUserDocument } from '../../utils/firebase';
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

export function PartnerPage({ setPage, connectCode }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  const everBondId = useFinanceStore(s => s.everBondId);
  const partnerId = useFinanceStore(s => s.partnerId);
  const partnerEverBondId = useFinanceStore(s => s.partnerEverBondId);
  const partnerLinked = useFinanceStore(s => s.partnerLinked);
  const partnerName = useFinanceStore(s => s.partnerName);
  const connectionStatus = useFinanceStore(s => s.connectionStatus);
  const stage = useFinanceStore(s => s.stage);

  // Connection Wizard states
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null); // 'qr' | 'link' | 'id'
  
  // Invite states (Partner A)
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [createdInviteId, setCreatedInviteId] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  // Direct ID input states
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Confirmation/Acceptance states (Partner B)
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [acceptChecked, setAcceptChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Success states
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Disconnect confirmation
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Camera QR scanner states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // 1. Process connectCode from direct URL route if present
  useEffect(() => {
    if (connectCode && user?.uid) {
      setHasConsented(true);
      setConsentChecked(true);
      handleValidateCode(connectCode);
    }
  }, [connectCode, user?.uid]);

  // 2. Real-time Invite Status Listener (Partner A side)
  useEffect(() => {
    if (!createdInviteId || !db) return;

    const unsub = onSnapshot(doc(db, 'partnerInvites', createdInviteId), async (docSnap) => {
      if (docSnap.exists()) {
        const inviteData = docSnap.data();
        if (inviteData.status === 'accepted' && inviteData.acceptedBy) {
          // Fetch the partner details to update local store
          let partnerNameVal = 'Partner';
          let partnerEBIdVal = '';
          try {
            const partnerSnap = await getDoc(doc(db, 'users', inviteData.acceptedBy));
            if (partnerSnap.exists()) {
              const pData = partnerSnap.data();
              partnerNameVal = pData.fullName || partnerNameVal;
              partnerEBIdVal = pData.ebId || '';
            }
          } catch (e) {
            console.error("Error fetching partner details:", e);
          }

          useFinanceStore.setState({
            partnerId: inviteData.acceptedBy,
            partnerEverBondId: partnerEBIdVal,
            partnerLinked: true,
            partnerName: partnerNameVal,
            partner2: partnerNameVal,
            connectionStatus: 'connected',
            stage: 'Committed',
            relationshipStage: 'Committed',
            relationshipStatus: 'Committed'
          });

          toast.success("Partner connected successfully!");
          setShowSuccessScreen(true);
        }
      }
    });

    return () => unsub();
  }, [createdInviteId]);

  // 3. Generate invite code & Firestore document (Partner A)
  const handleCreateInvite = async (method) => {
    if (!user?.uid) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    setSelectedMethod(method);
    setIsCreatingInvite(true);

    try {
      const codeSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteCode = `EB-P${codeSuffix}`;
      
      const inviteId = doc(collection(db, 'partnerInvites')).id;
      const inviteRef = doc(db, 'partnerInvites', inviteId);
      
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration

      await setDoc(inviteRef, {
        inviteCode,
        createdBy: user.uid,
        creatorName: user.name || 'User',
        creatorEmail: user.email || '',
        status: 'pending',
        createdAt,
        expiresAt
      });

      setCreatedInviteCode(inviteCode);
      setCreatedInviteId(inviteId);
    } catch (err) {
      console.error("Failed to create invite:", err);
      toast.error("Failed to generate invitation. Please try again.");
      setSelectedMethod(null);
    } finally {
      setIsCreatingInvite(false);
    }
  };

  // 4. Validate manual code or ID input
  const handleValidateCode = async (codeStr) => {
    const code = codeStr.trim().toUpperCase();
    if (!code) return;
    setIsValidatingCode(true);

    try {
      if (code === everBondId || code === user?.uid) {
        toast.error("You cannot connect to yourself.");
        setIsValidatingCode(false);
        return;
      }

      // Check if it's an invite code (starts with EB-P) or a direct EverBond ID
      if (code.startsWith('EB-P')) {
        const q = query(collection(db, 'partnerInvites'), where('inviteCode', '==', code));
        const querySnap = await getDocs(q);
        
        if (querySnap.empty) {
          toast.error("Invitation code not found or invalid.");
          setIsValidatingCode(false);
          return;
        }

        const inviteDoc = querySnap.docs[0];
        const inviteData = inviteDoc.data();

        if (inviteData.status !== 'pending') {
          toast.error(`This invitation has already been ${inviteData.status}.`);
          setIsValidatingCode(false);
          return;
        }

        if (new Date(inviteData.expiresAt) < new Date()) {
          toast.error("This invitation has expired.");
          setIsValidatingCode(false);
          return;
        }

        if (inviteData.createdBy === user?.uid) {
          toast.error("You cannot accept your own invitation.");
          setIsValidatingCode(false);
          return;
        }

        setIncomingInvite({
          id: inviteDoc.id,
          ...inviteData,
          isDirect: false
        });
      } else {
        // It's a partner EverBond ID! Search for user in Firestore
        const q = query(collection(db, 'users'), where('ebId', '==', code));
        const querySnap = await getDocs(q);
        
        if (querySnap.empty) {
          toast.error("Partner EverBond ID not found.");
          setIsValidatingCode(false);
          return;
        }

        const partnerUserDoc = querySnap.docs[0];
        const partnerUserData = partnerUserDoc.data();

        if (partnerUserData.uid === user?.uid) {
          toast.error("You cannot connect to yourself.");
          setIsValidatingCode(false);
          return;
        }

        if (partnerUserData.partnerId) {
          toast.error("This partner is already connected to another user.");
          setIsValidatingCode(false);
          return;
        }

        setIncomingInvite({
          id: 'direct',
          createdBy: partnerUserData.uid,
          creatorName: partnerUserData.fullName,
          creatorEmail: partnerUserData.email,
          inviteCode: code,
          isDirect: true
        });
      }
    } catch (err) {
      console.error("Code validation error:", err);
      toast.error("Failed to validate code. Please try again.");
    } finally {
      setIsValidatingCode(false);
    }
  };

  // 5. Establish atomic partner connection (Partner B accepts)
  const handleAcceptConnection = async () => {
    if (!incomingInvite || !user?.uid) return;
    setIsConnecting(true);

    try {
      const workspaceId = doc(collection(db, 'workspaces')).id;
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      
      const batch = writeBatch(db);

      // Create workspace document
      batch.set(workspaceRef, {
        type: 'committed',
        partnerAUid: incomingInvite.createdBy,
        partnerBUid: user.uid,
        status: 'active',
        createdAt: new Date().toISOString(),
        connectedAt: new Date().toISOString()
      });

      // Update invite document status if not a direct connection
      if (!incomingInvite.isDirect) {
        const inviteRef = doc(db, 'partnerInvites', incomingInvite.id);
        batch.update(inviteRef, {
          status: 'accepted',
          workspaceId: workspaceId,
          acceptedBy: user.uid,
          acceptedAt: new Date().toISOString()
        });
      }

      // Update creator (Partner A) profile document
      const partnerRef = doc(db, 'users', incomingInvite.createdBy);
      batch.update(partnerRef, {
        partnerId: user.uid,
        workspaceId: workspaceId,
        mode: 'committed'
      });

      // Update current user (Partner B) profile document
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        partnerId: incomingInvite.createdBy,
        workspaceId: workspaceId,
        mode: 'committed'
      });

      await batch.commit();

      // Update Zustand local store state
      useFinanceStore.setState({
        partnerId: incomingInvite.createdBy,
        partnerEverBondId: incomingInvite.inviteCode || '',
        partnerLinked: true,
        partnerName: incomingInvite.creatorName,
        partner2: incomingInvite.creatorName,
        connectionStatus: 'connected',
        stage: 'Committed',
        relationshipStage: 'Committed',
        relationshipStatus: 'Committed'
      });

      toast.success("Workspace connected successfully!");
      setShowSuccessScreen(true);
    } catch (err) {
      console.error("Connection establish error:", err);
      toast.error("Failed to connect workspace. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 6. Sever connection (Requires confirmation)
  const handleDisconnectNode = async () => {
    if (!user?.uid) return;
    setIsDisconnecting(true);

    try {
      const batch = writeBatch(db);

      // Reset partner profile if exists
      if (partnerId) {
        const partnerRef = doc(db, 'users', partnerId);
        batch.update(partnerRef, {
          partnerId: '',
          workspaceId: '',
          mode: 'Single'
        });
      }

      // Reset current user profile
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        partnerId: '',
        workspaceId: '',
        mode: 'Single'
      });

      // Update workspace status to inactive
      const activeWorkspaceId = useFinanceStore.getState().workspaceId;
      if (activeWorkspaceId) {
        const workspaceRef = doc(db, 'workspaces', activeWorkspaceId);
        batch.update(workspaceRef, {
          status: 'inactive',
          deactivatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      // Update local store
      useFinanceStore.setState({
        partnerId: '',
        partnerEverBondId: '',
        partnerLinked: false,
        partnerName: '',
        partner2: '',
        connectionStatus: 'none',
        stage: 'Single',
        relationshipStage: 'Single',
        relationshipStatus: 'Single'
      });

      toast.success("Workspace disconnected.");
      setShowDisconnectConfirm(false);
      setPage('dashboard');
    } catch (err) {
      console.error("Disconnect error:", err);
      toast.error("Failed to disconnect workspace.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // 7. QR Scanner handlers
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
        console.error("Camera access failed:", err);
        setScanError('Camera Access Denied: Please check permissions or type code manually.');
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
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code) {
      handleQRScanned(code.data);
    } else {
      scanLoopRef.current = requestAnimationFrame(tickScan);
    }
  };

  const handleQRScanned = (scannedString) => {
    handleStopCamera();
    setIsScannerOpen(false);

    // Extract code suffix from link if scanned as a URL, e.g. /connect/EB-PXXXXXX
    const match = scannedString.match(/connect\/(EB-P[0-9A-Z]{6})/i) || scannedString.match(/^(EB-P[0-9A-Z]{6})$/i) || scannedString.match(/^(EB-[0-9A-Z]{4,12}-[0-9A-Z]{4,12})$/i);
    const parsedCode = match ? match[1].toUpperCase() : null;

    if (!parsedCode) {
      toast.error('Invalid EverBond invitation QR scanned.');
      return;
    }

    handleValidateCode(parsedCode);
  };

  const handleStopCamera = () => {
    setIsScanning(false);
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCloseScanner = () => {
    handleStopCamera();
    setIsScannerOpen(false);
    setScanError('');
  };

  // Helper getters
  const getInviteUrl = () => {
    return `${window.location.origin}${window.location.pathname}#/connect/${createdInviteCode}`;
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return '***@gmail.com';
    const [name, domain] = emailStr.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  // ────────────────────────────────────────────────────────────────
  // RENDERING ENGINE
  // ────────────────────────────────────────────────────────────────

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
              border: `2px solid ${T.gold}`
            }}
          >
            <UserCheck size={36} style={{ color: T.gold }} />
          </motion.div>
          
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
            Partner Workspace Activated
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
            Your financial nodes have successfully established connection. You can now plan, save, and grow your dynastic wealth together.
          </p>

          <button
            onClick={() => {
              setShowSuccessScreen(false);
              setPage('dashboard');
            }}
            className="onb-btn-continue"
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
          >
            Open Workspace
          </button>
        </Card>
      </div>
    );
  }

  // Active connected state
  if (partnerLinked) {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '60px' }}>
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div className="page-eyebrow">Connection Workspace</div>
          <h1 className="page-title">Active <em>Connection</em></h1>
          <p className="page-desc">Your workspace is connected to your partner node in committed planning mode.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <Card gold={true}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em', display: 'block', marginBottom: '16px' }}>
              Connection Parameters
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Connected Stage</span>
                  <strong style={{ fontSize: '0.9rem', color: T.gold }}>{stage} Planning</strong>
                </div>
                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Workspace Status</span>
                  <strong style={{ fontSize: '0.9rem', color: T.sage }}>● Active</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Partner Node Identity</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text)', display: 'block', marginBottom: '2px' }}>{partnerName}</strong>
                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {partnerEverBondId || 'EB-NODE'}</span>
              </div>
            </div>
          </Card>

          <Card style={{ border: '1px solid var(--rose-border)', background: 'rgba(208, 92, 114, 0.02)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose)', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Danger Zone
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
              Severing this node connection will immediately deactivate your shared workspace. Personal assets and targets will return to independent command.
            </p>

            {showDisconnectConfirm ? (
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Are you absolutely sure?</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  Both nodes will immediately revert to Single stage workspaces. Shared ledgers will be locked.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDisconnectNode}
                    disabled={isDisconnecting}
                    className="btn-primary"
                    style={{ background: 'var(--rose)', color: '#fff', fontSize: '0.75rem', padding: '8px 16px', width: 'auto', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Yes, Disconnect Node'}
                  </button>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="btn-secondary"
                style={{
                  color: 'var(--rose)', borderColor: 'var(--rose-border)', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.8rem', padding: '10px 18px', width: 'auto', borderRadius: '100px'
                }}
              >
                <LogOut size={14} /> Disconnect Workspace
              </button>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // Partner B Acceptance Flow (if connect invite is validated and loaded)
  if (incomingInvite) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
        <Card gold={true} style={{ maxWidth: '460px', width: '100%', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--gold-pale)', color: T.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: `1px solid ${T.gold}40`
          }}>
            <Heart size={28} />
          </div>
          
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
            Establish Node Connection
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
                <strong style={{ color: 'var(--text)' }}>{incomingInvite.creatorName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong style={{ color: 'var(--text)' }}>{maskEmail(incomingInvite.creatorEmail)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Invite Code:</span>
                <strong style={{ fontFamily: 'monospace', color: T.gold }}>{incomingInvite.inviteCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="accept-consent"
              checked={acceptChecked}
              onChange={(e) => setAcceptChecked(e.target.checked)}
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
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: (acceptChecked && !isConnecting) ? 1 : 0.6
              }}
            >
              {isConnecting ? 'Activating...' : 'Accept Connection'}
            </button>
            <button
              onClick={() => {
                setIncomingInvite(null);
                setConnectCode(null);
              }}
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

  // Phase 1 - Consent & Introduction (Partner A)
  if (!hasConsented) {
    return (
      <div className="fade-in" style={{ maxWidth: '560px', margin: '40px auto 60px' }}>
        <Card style={{ padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
            background: 'radial-gradient(circle at center, rgba(184,144,42,0.04) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold-pale)', color: T.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              border: `1px solid ${T.gold}30`
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

          {/* Benefits Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {[
              "Shared financial goals",
              "Joint milestone planning",
              "Shared insights and projections",
              "Private partner workspace"
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text)' }}>
                <span style={{ color: T.gold, fontWeight: 'bold' }}>✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Privacy Section */}
          <div style={{
            background: 'var(--bg-warm)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px', marginBottom: '28px', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Privacy & Sovereign Security</strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  Only the information you explicitly choose to share will be visible to your partner. Your personal credentials, passwords, and authentication data are never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="consent-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I understand how partner workspaces function.
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setHasConsented(true)}
              disabled={!consentChecked}
              className="onb-btn-continue"
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: consentChecked ? 1 : 0.6
              }}
            >
              Continue
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              Back
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Phase 2 - Connection Method Selection (Partner A)
  if (!selectedMethod) {
    return (
      <div className="fade-in" style={{ maxWidth: '580px', margin: '40px auto 60px' }}>
        <Card style={{ padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.50rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              Choose Connection Method
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Select a method below to link workspaces with your partner.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {/* Option 1: QR Code */}
            <div
              onClick={() => handleCreateInvite('qr')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCodeIcon size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>QR Code</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scan and connect instantly.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 2: Invitation Link */}
            <div
              onClick={() => handleCreateInvite('link')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>Invitation Link</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Share a secure invitation link.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 3: Partner ID */}
            <div
              onClick={() => setSelectedMethod('id')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>Partner ID / Invite Code</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enter your partner's ID or invite code.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>
          </div>

          <button
            onClick={() => setHasConsented(false)}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            Back
          </button>
        </Card>
      </div>
    );
  }

  // Phase 3 - Invite Action Screens (QR Code, Invitation Link, or ID Entry)
  return (
    <div className="fade-in" style={{ maxWidth: '580px', margin: '40px auto 60px' }}>
      
      {/* Offscreen Canvas for jsQR processing */}
      <canvas ref={offscreenCanvasRef} style={{ display: 'none' }} />

      {isCreatingInvite && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <RefreshCw size={36} className="skeleton-pulse" style={{ color: T.gold, margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>Generating Secure invitation...</h3>
        </Card>
      )}

      {!isCreatingInvite && (
        <Card style={{ padding: '32px 24px', textAlign: 'center' }}>
          
          {selectedMethod === 'qr' && (
            <div>
              <div style={{
                background: '#fff', padding: '16px', borderRadius: '20px',
                border: `1.5px solid ${T.gold}40`, display: 'inline-flex',
                boxShadow: '0 8px 30px rgba(184,144,42,0.1)', marginBottom: '24px'
              }}>
                <QRCode value={getInviteUrl()} size={180} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                Scan Partner Link
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.45 }}>
                Show this QR code to your partner. They can scan it with their phone camera to instantly establish the connection.
              </p>
            </div>
          )}

          {selectedMethod === 'link' && (
            <div>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--gold-pale)', color: T.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: `1px solid ${T.gold}30`
              }}>
                <Link2 size={28} />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                Share Invitation Link
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.45 }}>
                Send this secure web link to your partner. When opened, it will guide them through accepting the shared workspace.
              </p>

              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 12px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1, textAlign: 'left' }}>
                  {getInviteUrl()}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getInviteUrl());
                    toast.success("Link copied to clipboard!");
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          )}

          {selectedMethod === 'id' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <Key size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Enter Partner ID or Invite Code
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  Establish connection by typing your partner's EverBond ID or a shared invitation code.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label htmlFor="code-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    EverBond ID or Invite Code
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="code-input"
                      type="text"
                      className="onb-input-glow"
                      placeholder="e.g. EB-C1A2-B3D4 or EB-PA1B2C"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      style={{ flexGrow: 1, padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={handleStartScanWorkflow}
                      className="btn-secondary"
                      title="Scan QR Code"
                      style={{ padding: '0 12px', border: '1px solid var(--border-mid)', borderRadius: '10px' }}
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>
                    Format: EB-XXXXXX (6+ chars) or EB-PXXXXXX (Invite)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleValidateCode(manualCodeInput)}
                disabled={!manualCodeInput.trim() || isValidatingCode}
                className="onb-btn-continue"
                style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.88rem', opacity: manualCodeInput.trim() ? 1 : 0.6, marginBottom: '12px' }}
              >
                {isValidatingCode ? 'Checking...' : 'Connect Workspace'}
              </button>
            </div>
          )}

          {/* Pulse Waiting Status Indicator for QR & Link Creators */}
          {(selectedMethod === 'qr' || selectedMethod === 'link') && (
            <div style={{
              background: 'rgba(184, 144, 42, 0.05)', border: `1px dashed ${T.gold}40`,
              borderRadius: '16px', padding: '16px', marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="eb-pulse-dot gold" style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.gold, display: 'inline-block' }} />
                <strong style={{ fontSize: '0.88rem', color: T.gold }}>Waiting for your partner...</strong>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginTop: '6px' }}>
                Code: <strong style={{ fontFamily: 'monospace' }}>{createdInviteCode}</strong>
              </span>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => {
              setSelectedMethod(null);
              setCreatedInviteCode('');
              setCreatedInviteId('');
              setManualCodeInput('');
            }}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            Back to Options
          </button>
        </Card>
      )}

      {/* Camera Scanning Portal Overlay */}
      {isScannerOpen && (
        <div className="eb-premium-overlay" style={{ zIndex: 100000 }} onClick={handleCloseScanner}>
          <div className="liquid-glass" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseScanner}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
            
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>
              Scan Invitation QR
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
              Align the QR code on your partner's screen within the viewfinder.
            </p>

            <div style={{
              width: '240px', height: '240px', borderRadius: '16px', border: `3px solid ${T.gold}`,
              margin: '0 auto 20px', position: 'relative', overflow: 'hidden', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {isScanning ? (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="camera-laser" style={{ position: 'absolute', left: 0, width: '100%', height: '3px', background: T.gold, boxShadow: `0 0 10px ${T.gold}` }} />
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '16px', fontSize: '0.8rem' }}>
                  {scanError || 'Starting Camera stream...'}
                </div>
              )}
            </div>
            
            <button
              onClick={handleCloseScanner}
              className="btn-secondary"
              style={{ width: 'auto', padding: '8px 20px', borderRadius: '100px', fontSize: '0.78rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
