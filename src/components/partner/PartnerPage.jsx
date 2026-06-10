import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { isValidEverBondId, formatEverBondId } from '../../utils/everbondId';
import { Card } from '../common/Card';
import { Logo } from '../common/Logo';
import {
  Users, Copy, Check, Heart, Key, Calendar, Link2, UserCheck,
  Sparkles, Lock, Shield, Target, TrendingUp, Crown, X, ArrowRight,
  QrCode as QrCodeIcon, ScanLine, Camera, Download, Upload, AlertCircle, FileText, Activity
} from 'lucide-react';
import * as QRCodeModule from 'react-qr-code';
import jsQR from 'jsqr';

// Safe resolution for Vite CommonJS bundling:
const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

/* ── SafeQRCode: crash-proof QR renderer ─────────────────── */
class SafeQRCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      // Fallback: show the raw value as text
      const raw = this.props.value || '';
      let displayId = 'EB-PENDING';
      try {
        const parsed = JSON.parse(raw);
        displayId = parsed.userId || displayId;
      } catch { /* raw string */ }
      return (
        <div style={{
          width: this.props.size || 120,
          height: this.props.size || 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #b8902a',
          borderRadius: '12px',
          padding: '8px',
          textAlign: 'center',
          background: '#fffdf8'
        }}>
          <span style={{ fontSize: '0.55rem', color: '#999', marginBottom: '4px' }}>Your ID</span>
          <strong style={{ fontSize: '0.65rem', color: '#b8902a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {displayId}
          </strong>
        </div>
      );
    }
    if (!QRCode) {
      return (
        <div style={{ fontSize: '0.7rem', color: '#b8902a', textAlign: 'center', padding: '12px' }}>
          QR unavailable. Share ID: {this.props.value}
        </div>
      );
    }
    return (
      <QRCode
        value={this.props.value}
        size={this.props.size || 120}
        fgColor="#1A1714"
        bgColor="#ffffff"
        level="H"
      />
    );
  }
}

/* ── Animation variants ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

/* ── Injected styles for animations ───────────────────── */
const partnerStyles = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184, 144, 42, 0.25); }
  50% { box-shadow: 0 0 0 10px rgba(184, 144, 42, 0); }
}
@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
@keyframes checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.9; }
}
.skeleton-pulse {
  animation: skeletonPulse 1.6s ease-in-out infinite;
}
.eb-premium-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 15, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 24px;
}
.camera-laser {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: ${T.gold};
  box-shadow: 0 0 12px ${T.gold};
  animation: scannerLaserSweep 2s ease-in-out infinite alternate;
}
@keyframes scannerLaserSweep {
  0% { top: 10%; }
  100% { top: 90%; }
}
`;

/* ── Error Boundary for Partner Module ─────────────────── */
class PartnerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PartnerErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '24px',
          width: '100%',
        }}>
          <Card style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '40px 24px',
            border: '1.5px solid var(--rose-border)',
            boxShadow: '0 20px 50px rgba(208, 92, 114, 0.15)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--rose-lt, rgba(208,92,114,0.1))',
              border: '1px solid var(--rose-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--rose)',
            }}>
              <AlertCircle size={28} />
            </div>
            <h2 style={{
              fontFamily: T.fontDisplay,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
            }}>
              Partner Module Unavailable
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: '28px',
              lineHeight: 1.5,
            }}>
              Something went wrong while loading the connection workspace.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                className="btn-primary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  border: 'none',
                  color: '#fff'
                }}
              >
                Retry
              </button>
              <button
                onClick={() => {
                  if (typeof this.props.setPage === 'function') {
                    this.props.setPage('dashboard');
                  }
                }}
                className="btn-secondary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border-mid)',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
              >
                Go Back
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ── Main Export Wrapper with Error Boundary ──────────── */
export function PartnerPage({ setPage }) {
  return (
    <PartnerErrorBoundary setPage={setPage}>
      <PartnerPageContent setPage={setPage} />
    </PartnerErrorBoundary>
  );
}

/* ── Reusable Component Labels & Indicators ──────────── */
function GoldLabel({ children }) {
  return (
    <span style={{
      fontSize: '0.65rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: T.gold,
      display: 'block',
      marginBottom: '14px'
    }}>
      {children}
    </span>
  );
}

/* ── Partner Page Content Implementation ──────────────── */
function PartnerPageContent({ setPage }) {
  const toast = useToast();

  // Store bindings
  const {
    everBondId,
    coupleId,
    familyId,
    partnerEverBondId,
    connectionStatus,
    requestSentAt,
    relationshipDate,
    partner2,
    stage,
    initEverBondId,
    sendConnectionRequest,
    acceptConnection,
    disconnectPartner,
    setStage,
    simulateIncomingRequest,
    declineRequest,
    incomingRequest,
    timelineEvents,
  } = useFinanceStore();

  // Local state
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  // QR connection connection modal / camera scanning states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [scannedPartner, setScannedPartner] = useState(null);
  const [scanError, setScanError] = useState('');

  // Confetti particles & animations overlays
  const [isSimulatingAccept, setIsSimulatingAccept] = useState(false);
  const [simulateProgress, setSimulateProgress] = useState(0);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // References for Media/Canvas capture loop
  const videoRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);

  // Responsive device checks
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    return isSmallScreen || isTouch;
  };

  // Generate strict, compliant JSON QR Payload
  const generateQRValue = () => {
    return JSON.stringify({
      userId: everBondId || 'EB-PENDING',
      type: 'partner_connect',
      version: '2.0'
    });
  };

  // Start browser camera scan cycle
  const handleStartScanWorkflow = async (forceMobileOverride = false) => {
    setScanError('');
    setScannedPartner(null);

    // Desktop Check
    if (!forceMobileOverride && !isMobileDevice()) {
      setIsDesktopModalOpen(true);
      return;
    }

    setIsScannerOpen(true);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }
      scanLoopRef.current = requestAnimationFrame(tickCameraScan);
    } catch (err) {
      console.error('Camera streaming permission error:', err);
      toast.error('Unable to access camera.');
      setIsScanning(false);
      setScanError('Camera access denied. Ensure browser permissions are allowed.');
    }
  };

  // Frame processing loop
  const tickCameraScan = () => {
    if (!videoRef.current || !offscreenCanvasRef.current || !isScanning) {
      if (isScanning) {
        scanLoopRef.current = requestAnimationFrame(tickCameraScan);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        handleQRDecoded(code.data);
        return; // Break scan loop
      }
    }
    scanLoopRef.current = requestAnimationFrame(tickCameraScan);
  };

  // Decode validation & security filters (Step 8 & 9)
  const handleQRDecoded = (data) => {
    handleStopCamera();

    let payload = null;
    try {
      payload = JSON.parse(data);
    } catch (err) {
      // JSON syntax parsing error ( WiFi QR, payment QRs, URLs )
      setScanError('Invalid EverBond QR: Scanned code contains non-JSON data.');
      toast.error('Invalid EverBond QR');
      return;
    }

    // JSON Validation
    if (!payload || payload.type !== 'partner_connect') {
      setScanError('Invalid EverBond QR: Missing or incorrect application connect metadata.');
      toast.error('Invalid EverBond QR');
      return;
    }

    const scannedUserId = payload.userId;
    if (!scannedUserId || !isValidEverBondId(formatEverBondId(scannedUserId))) {
      setScanError('Invalid EverBond QR: Scanned EverBond User ID is formatted incorrectly.');
      toast.error('Invalid EverBond QR');
      return;
    }

    // Security constraints
    if (scannedUserId === everBondId) {
      setScanError('Self Scanning Blocked: You cannot scan your own connection QR.');
      toast.error('Cannot connect to your own ID');
      return;
    }

    if (scannedUserId === partnerEverBondId && connectionStatus === 'connected') {
      setScanError('Duplicate Link Blocked: This partner is already connected.');
      toast.error('Partner already connected');
      return;
    }

    // Mock partner information retrieval based on User ID
    const namePart = scannedUserId.split('-')[1] || 'Partner';
    const cleanName = namePart.charAt(0) + namePart.slice(1).toLowerCase();

    setScannedPartner({
      everBondId: scannedUserId,
      name: cleanName,
      stage: 'Single'
    });
    toast.success('Partner Found!');
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
    setScannedPartner(null);
    setScanError('');
  };

  // Submit scanned partner link request
  const handleConfirmQRConnection = () => {
    setIsScannerOpen(false);
    sendConnectionRequest({
      partnerEverBondId: scannedPartner.everBondId,
      relationshipDate: new Date().toISOString().split('T')[0]
    });
    // Store resolved partner name globally
    useFinanceStore.setState({ partner2: scannedPartner.name, partnerName: scannedPartner.name });
    toast.success('Partner connection request sent!');
    setScannedPartner(null);
  };

  // Format anniv dates
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  // Manual ID connect forms
  const handleSendManualRequest = () => {
    if (!partnerIdInput.trim()) {
      toast.error('Please enter a valid EverBond ID.');
      return;
    }

    const formattedId = formatEverBondId(partnerIdInput);
    if (!isValidEverBondId(formattedId)) {
      toast.error('Invalid EverBond ID format. Expected: EB-XXXXXX');
      return;
    }

    if (formattedId === everBondId) {
      toast.error('Cannot connect to your own EverBond ID.');
      return;
    }

    if (!partnerNameInput.trim()) {
      toast.error("Please enter your partner's name.");
      return;
    }

    sendConnectionRequest({
      partnerEverBondId: formattedId,
      relationshipDate: dateInput
    });
    useFinanceStore.setState({ partner2: partnerNameInput.trim(), partnerName: partnerNameInput.trim() });
    toast.success('Connection request sent!');
    
    // Clear forms
    setPartnerIdInput('');
    setPartnerNameInput('');
    setDateInput('');
  };

  // Clipboard Paste ID
  const handlePasteClipboardId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        let cleanText = text.trim().toUpperCase();
        if (!cleanText.startsWith('EB-') && cleanText.length > 2) {
          cleanText = 'EB-' + cleanText;
        }
        setPartnerIdInput(cleanText);
        toast.success('Pasted EverBond ID from clipboard.');
      } else {
        toast.error('Clipboard is empty.');
      }
    } catch (err) {
      toast.error('Unable to read clipboard. Type ID manually.');
    }
  };

  // Simulation buttons
  const handleSimulateIncomingInvite = () => {
    simulateIncomingRequest({
      senderEverBondId: 'EB-ARUP-7K92',
      senderName: 'Arup',
      relationshipDate: '2025-02-15'
    });
    toast.info('Simulated connection request received!');
  };

  const handleSimulatePartnerHandshake = () => {
    setIsSimulatingAccept(true);
    setSimulateProgress(0);

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / 1500, 1);
      setSimulateProgress(pct);
      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsSimulatingAccept(false);
        triggerSuccessConfetti();
      }
    };
    requestAnimationFrame(tick);
  };

  const triggerSuccessConfetti = () => {
    const particles = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: Math.random() * 8 + 4,
      color: ['#b8902a', '#e5c158', '#f3d97e', '#dfb03e', '#ffffff', '#faeed1'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1.5,
      duration: Math.random() * 3 + 2,
      sway: Math.random() * 50 - 25,
      rotation: Math.random() * 720,
    }));
    setConfettiParticles(particles);
    setShowSuccessOverlay(true);

    // Commit connection status and upgrade stage in store after 3.2s
    setTimeout(() => {
      const incoming = useFinanceStore.getState().incomingRequest;
      acceptConnection({ partnerName: incoming?.senderName || partner2 || 'Partner' });
      if (stage === 'Single') setStage('Committed');
      setShowSuccessOverlay(false);
      toast.success('Workspace connected successfully!');
    }, 3200);
  };

  // Disconnect Handshake
  const handleDisconnectNode = () => {
    disconnectPartner();
    setShowDisconnectConfirm(false);
    toast.info('Partner disconnected.');
  };

  // Trigger ID generation on mount
  useEffect(() => {
    initEverBondId();
  }, [initEverBondId]);

  // Inject styles
  useEffect(() => {
    const styleId = 'partner-connect-system-styles';
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style');
      el.id = styleId;
      el.textContent = partnerStyles;
      document.head.appendChild(el);
    }
  }, []);

  // Cleanup media loops
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  // ── MISSING HANDLER DEFINITIONS (root cause of crash) ──────────

  // Input change handler for Partner ID field (formats as user types)
  const handleIdInputChange = (e) => {
    let val = e.target.value.toUpperCase();
    setPartnerIdInput(val);
  };

  // Download QR Code as PNG image
  const handleDownloadQR = () => {
    try {
      const svg = document.querySelector('#qr-code-svg svg');
      if (!svg) {
        // Fallback: copy ID instead
        if (navigator.clipboard && everBondId) {
          navigator.clipboard.writeText(everBondId);
          toast.success('EverBond ID copied to clipboard!');
        } else {
          toast.info('QR code not ready yet. Try again in a moment.');
        }
        return;
      }
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EverBond-QR-${everBondId || 'connect'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR downloaded!');
    } catch (err) {
      toast.error('Download failed. Copy your EverBond ID manually.');
    }
  };

  // Copy shareable invite link / EverBond ID to clipboard
  const handleCopyInviteLink = () => {
    const shareText = `Connect with me on EverBond! My ID: ${everBondId || 'EB-PENDING'} — Download EverBond to get started.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => toast.success('Invite link copied to clipboard!'))
        .catch(() => toast.error('Could not copy to clipboard.'));
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Invite link copied!');
      } catch {
        toast.error('Copy failed. Share your ID manually: ' + (everBondId || 'EB-PENDING'));
      }
    }
  };

  // Decline an incoming connection request
  const handleDeclineRequest = () => {
    declineRequest();
    toast.info('Connection request declined.');
  };

  // Mobile version link (opens instructions or current URL with mobile hint)
  const handleOpenMobileVersionSim = () => {
    setIsDesktopModalOpen(false);
    // On mobile browsers this opens the same page. On desktop, shows instructions.
    try {
      const currentUrl = window.location.href;
      window.open(currentUrl, '_blank');
    } catch {
      toast.info('Open EverBond on your mobile device to use the QR scanner.');
    }
  };

  // ────────────────────────────────────────────────────────────────

  const isManualIdValid = isValidEverBondId(formatEverBondId(partnerIdInput));

  return (
    <div className="fade-in" style={{ position: 'relative', width: '100%' }}>
      
      {/* Offscreen Canvas for jsQR processing */}
      <canvas ref={offscreenCanvasRef} style={{ display: 'none' }} />

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">EverBond Workspace Node</div>
          <h1 className="page-title">Relationship <em>Hub</em></h1>
          <p className="page-desc">Synchronize nodes, automate joint allocations, and build combined dynastic accounts.</p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >

        {/* ══════════════════════════════════════════════════
           SECTION A: CONNECTION STATUS BANNER
        ══════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <Card gold={connectionStatus === 'connected'} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <GoldLabel>Connection Status</GoldLabel>
              {connectionStatus === 'connected' ? (
                <span className="eb-status-badge status-connected">
                  <span className="eb-pulse-dot green" />
                  Connected Node
                </span>
              ) : (
                <span className="eb-status-badge status-none">
                  <span className="eb-pulse-dot" />
                  Not Connected
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-warm, rgba(0,0,0,0.015))', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Your Node ID</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: T.gold, letterSpacing: '0.04em' }}>{everBondId || 'EB-PENDING'}</strong>
              </div>

              {connectionStatus === 'connected' && (
                <>
                  <div style={{ background: 'var(--bg-warm, rgba(0,0,0,0.015))', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Partner Name</span>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--text)' }}>{partner2 || 'Partner'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-warm, rgba(0,0,0,0.015))', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Partner ID</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.98rem', color: 'var(--text)', letterSpacing: '0.04em' }}>{partnerEverBondId}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-warm, rgba(0,0,0,0.015))', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Connected Date</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{formatDate(requestSentAt || new Date().toISOString())}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-warm, rgba(0,0,0,0.015))', border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Relationship Stage</span>
                    <strong style={{ fontSize: '0.92rem', color: T.gold, fontWeight: 700 }}>{stage}</strong>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════
           STATE 1 & 2: NOT CONNECTED (Empty state with responsive buttons)
        ══════════════════════════════════════════════════ */}
        {connectionStatus !== 'connected' && (
          <>
            {/* STEP 4: Empty State Card */}
            <motion.div variants={itemVariants}>
              <Card style={{ textAlign: 'center', padding: '48px 32px', border: '1.5px dashed var(--border-mid)' }}>
                <div className="eb-empty-circle" style={{
                  background: 'var(--gold-pale, rgba(184, 144, 42, 0.08))',
                  color: T.gold
                }}>
                  <Users size={32} />
                </div>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                  No Partner Connected
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.55 }}>
                  Connect with your partner to unlock shared financial planning, synchronise savings, and co-plan lifetime goals.
                </p>
                
                {/* SECTION A LAYOUT BUTTONS (Step 1 buttons alignment) */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const element = document.getElementById('connect-form-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-primary"
                    style={{
                      padding: '12px 28px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                      border: 'none',
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(184,144,42,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Link2 size={16} /> Connect Partner
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById('qr-connect-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-secondary"
                    style={{
                      padding: '12px 28px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <QrCodeIcon size={16} /> Generate QR
                  </button>
                  <button
                    onClick={() => handleStartScanWorkflow(false)}
                    className="btn-secondary"
                    style={{
                      padding: '12px 28px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ScanLine size={16} /> Scan QR
                  </button>
                </div>
              </Card>
            </motion.div>

            {/* Main Form & QR grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* SECTION B: Connect Form */}
              <motion.div variants={itemVariants} id="connect-form-section">
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <GoldLabel>SECTION B: CONNECT PARTNER</GoldLabel>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.45 }}>
                      Enter your partner's unique EverBond ID to initiate a dashboard merge request.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Enter Partner ID</label>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Format: EB-XXXXXX</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="onb-input-glow eb-id-input"
                            value={partnerIdInput}
                            onChange={handleIdInputChange}
                            placeholder="e.g. EB-COUPLE-AS22-7K9X"
                            style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                          />
                          <button
                            onClick={handlePasteClipboardId}
                            className="btn-secondary"
                            title="Paste Clipboard"
                            style={{ padding: '0 12px', border: '1px solid var(--border-mid)', background: 'var(--bg-warm)', borderRadius: '10px', color: 'var(--text)' }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                        {partnerIdInput && (
                          <div style={{ marginTop: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isManualIdValid ? (
                              <span style={{ color: T.sage, fontWeight: 600 }}>✓ Correct ID Format</span>
                            ) : (
                              <span style={{ color: T.rose, fontWeight: 600 }}>✗ ID must start with EB- (6+ characters)</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Partner Name</label>
                        <input
                          type="text"
                          className="onb-input-glow"
                          value={partnerNameInput}
                          onChange={(e) => setPartnerNameInput(e.target.value)}
                          placeholder="Partner's full name"
                          style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Anniversary Date (Optional)</label>
                        <input
                          type="date"
                          className="onb-input-glow"
                          value={dateInput}
                          onChange={(e) => setDateInput(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      onClick={handleSendManualRequest}
                      disabled={!isManualIdValid || !partnerNameInput.trim()}
                      className="btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: '10px',
                        background: (isManualIdValid && partnerNameInput.trim()) ? `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)` : 'var(--bg-muted)',
                        border: 'none',
                        color: (isManualIdValid && partnerNameInput.trim()) ? '#fff' : 'var(--text-faint)',
                        cursor: (isManualIdValid && partnerNameInput.trim()) ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={14} /> Send Request
                    </button>
                    <button
                      onClick={() => handleStartScanWorkflow(false)}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: '10px',
                        border: '1px solid var(--border-mid)',
                        background: 'transparent',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ScanLine size={14} /> Scan QR
                    </button>
                  </div>
                </Card>
              </motion.div>

              {/* SECTION C: QR Connect */}
              <motion.div variants={itemVariants} id="qr-connect-section">
                <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px' }}>
                  <div style={{ width: '100%' }}>
                    <GoldLabel>SECTION C: QR CONNECT</GoldLabel>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45, textAlign: 'center' }}>
                      Share your personal code containing your secure EverBond connection payload.
                    </p>
                  </div>

                  {/* Dynamic QR Code Canvas */}
                  <motion.div 
                    id="qr-code-svg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      padding: '14px',
                      background: '#fff',
                      borderRadius: '20px',
                      border: `1.5px solid ${T.gold}30`,
                      boxShadow: '0 10px 30px rgba(184, 144, 42, 0.12)',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SafeQRCode value={generateQRValue()} size={120} />
                  </motion.div>

                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button
                      onClick={handleDownloadQR}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.78rem',
                        borderRadius: '100px',
                        border: '1px solid var(--border-mid)',
                        background: 'transparent',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={13} /> Download QR
                    </button>
                    <button
                      onClick={handleCopyInviteLink}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.78rem',
                        borderRadius: '100px',
                        border: '1px solid var(--border-mid)',
                        background: 'transparent',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Copy size={13} /> Copy Link
                    </button>
                  </div>
                </Card>
              </motion.div>

            </div>

            {/* SECTION D: Pending Requests Manager */}
            <motion.div variants={itemVariants}>
              <Card>
                <GoldLabel>SECTION D: PENDING REQUESTS</GoldLabel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Outgoing Requests */}
                  {connectionStatus === 'pending' && (
                    <div className="eb-pending-border" style={{
                      padding: '16px 20px',
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--gold-border)',
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      animation: 'goldPulse 2s ease-in-out infinite'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.gold, animation: 'dotPulse 1.5s infinite' }} />
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>Waiting For Acceptance</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Sent to Partner: </span>
                        <strong style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text)' }}>{partnerEverBondId}</strong>
                        {relationshipDate && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginLeft: '12px' }}>
                            Anniversary: {formatDate(relationshipDate)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleSimulatePartnerHandshake}
                          disabled={isSimulatingAccept}
                          className="btn-primary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '100px',
                            background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {isSimulatingAccept ? 'Accepting...' : 'Simulate Partner Accept'}
                        </button>
                        <button
                          onClick={() => {
                            declineRequest();
                            toast.info('Outgoing connection request cancelled.');
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '100px',
                            border: '1px solid var(--border-mid)',
                            background: 'transparent',
                            color: 'var(--text)',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Incoming Requests */}
                  {connectionStatus === 'received' && (
                    <div style={{
                      padding: '16px 20px',
                      background: 'radial-gradient(circle at 0% 0%, rgba(184, 144, 42, 0.05) 0%, transparent 50%), var(--bg-card)',
                      border: '1.5px solid var(--gold-border)',
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.gold, animation: 'dotPulse 1.5s infinite' }} />
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>Incoming Connection Request</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>From Sender: </span>
                        <strong style={{ fontSize: '0.8rem', color: T.gold }}>{incomingRequest?.senderName || partner2 || 'Partner'} </strong>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-faint)' }}>({incomingRequest?.senderEverBondId || partnerEverBondId})</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={triggerSuccessConfetti}
                          className="btn-primary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '100px',
                            background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} /> Accept
                        </button>
                        <button
                          onClick={handleDeclineRequest}
                          className="btn-secondary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '100px',
                            border: '1px solid var(--border-mid)',
                            background: 'transparent',
                            color: T.rose,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty pending state */}
                  {connectionStatus !== 'pending' && connectionStatus !== 'received' && (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-faint)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      No active incoming or outgoing relationship invitations.
                    </div>
                  )}

                  {/* Dev Sandbox Trigger */}
                  {connectionStatus === 'none' && (
                    <div style={{ borderTop: '1px dashed var(--border-mid)', paddingTop: '16px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleSimulateIncomingInvite}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '6px 12px', border: '1px solid var(--border-mid)', borderRadius: '100px', color: T.gold }}
                      >
                        🧪 Trigger Mock Incoming Request
                      </button>
                    </div>
                  )}

                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* ══════════════════════════════════════════════════
           STATE 3: CONNECTED WORKSPACE (Profile Card replaces Empty State)
        ══════════════════════════════════════════════════ */}
        {connectionStatus === 'connected' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', alignItems: 'start' }} className="responsive-split">
              
              {/* Connected View - Partner Profile Card */}
              <motion.div variants={itemVariants}>
                <Card style={{ padding: '28px', background: 'radial-gradient(circle at 100% 0%, rgba(184,144,42,0.06) 0%, transparent 60%), var(--bg-card)' }}>
                  <GoldLabel>Partner Profile</GoldLabel>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '12px 0 24px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(184,144,42,0.35)',
                      border: '4px solid var(--bg-card)',
                      marginBottom: '16px'
                    }}>
                      {(partner2 || 'Partner').slice(0, 2).toUpperCase()}
                    </div>

                    <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                      {partner2 || 'Partner'}
                    </h3>
                    <span style={{ fontSize: '0.75rem', background: 'var(--sage-lt)', color: T.sage, padding: '4px 14px', borderRadius: '100px', fontWeight: 700 }}>
                      Verified Partner Node
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Partner ID</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.04em' }}>{partnerEverBondId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Relationship Stage</span>
                      <strong style={{ color: T.gold, fontWeight: 700 }}>{stage}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Connected Since</span>
                      <strong style={{ color: 'var(--text)' }}>{formatDate(requestSentAt || new Date().toISOString())}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Shared Workspace</span>
                      <strong style={{ color: T.sage, fontWeight: 700 }}>Active Synced</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDisconnectConfirm(true)}
                    className="btn-reset"
                    style={{
                      width: '100%',
                      marginTop: '24px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'var(--rose-lt, rgba(208,92,114,0.1))',
                      border: '1.5px solid var(--rose-border)',
                      color: T.rose,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Disconnect Partner
                  </button>
                </Card>
              </motion.div>

              {/* SECTION F: Shared Features */}
              <motion.div variants={itemVariants}>
                <Card>
                  <GoldLabel>SECTION F: SHARED FEATURES</GoldLabel>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-8px' }}>
                    Collaborate instantly across shared ledgers, joint objectives, decision logs, and timelines.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px'
                  }}>
                    {/* Feature 1: Shared Goals */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setPage('goals')}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Target size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Shared Goals</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        Co-plan joint targets for weddings, homes, or investments.
                      </p>
                    </motion.div>

                    {/* Feature 2: Shared Notes */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setPage('workspace')}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <FileText size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Shared Notes</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        Store joint planning notes, drafts, and decision logs.
                      </p>
                    </motion.div>

                    {/* Feature 3: Shared Wealth Charts */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setPage('insights')}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <TrendingUp size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Shared Charts</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        View combined compound calculations and projection curves.
                      </p>
                    </motion.div>

                    {/* Feature 4: Couple Dashboard */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setPage('dashboard')}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Users size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Couple Dashboard</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        Consolidated ledger of incomes, asset splits, and indices.
                      </p>
                    </motion.div>

                    {/* Feature 5: Activity Timeline */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setShowTimelineModal(true)}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Activity size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Activity Timeline</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        Review connection histories, updates, and milestones.
                      </p>
                    </motion.div>

                    {/* Feature 6: Achievements */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 6 }}
                      onClick={() => setPage('achievements')}
                      style={{ border: '1px solid var(--border-mid)', borderRadius: '16px', padding: '16px', cursor: 'pointer', background: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Crown size={16} style={{ color: T.gold }} />
                        <strong style={{ fontSize: '0.85rem' }}>Achievements</strong>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                        Complete collaborative journey tasks and earn XP tags.
                      </p>
                    </motion.div>

                  </div>
                </Card>
              </motion.div>

            </div>
          </>
        )}

      </motion.div>

      {/* ── DESKTOP BEHAVIOUR: QR Scanner Unavailable Modal ── */}
      {createPortal(
        <AnimatePresence>
          {isDesktopModalOpen && (
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              onClick={() => setIsDesktopModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--gold-border)',
                  borderRadius: '24px',
                  padding: '36px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  className="eb-modal-close"
                  onClick={() => setIsDesktopModalOpen(false)}
                  style={{ top: '16px', right: '16px' }}
                >
                  <X size={16} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--gold-pale, rgba(184, 144, 42, 0.08))',
                    color: T.gold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <QrCodeIcon size={24} />
                  </div>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
                    QR Scanner Unavailable
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Use the EverBond mobile experience to scan a partner QR code. You can also send your QR to your partner or continue using manual connection.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleOpenMobileVersionSim}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '100px',
                      background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Open Mobile Version
                  </button>
                  <button
                    onClick={() => {
                      setIsDesktopModalOpen(false);
                      const element = document.getElementById('connect-form-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '100px',
                      border: '1px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Manual Connect
                  </button>
                  <button
                    onClick={() => setIsDesktopModalOpen(false)}
                    className="btn-reset"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── MOBILE BEHAVIOUR: Real-time Camera Scanner Modal ── */}
      {createPortal(
        <AnimatePresence>
          {isScannerOpen && (
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              style={{ zIndex: 10000 }}
              onClick={handleCloseScanner}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--gold-border)',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  className="eb-modal-close"
                  onClick={handleCloseScanner}
                  style={{ top: '16px', right: '16px' }}
                >
                  <X size={16} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                    Scan Partner QR
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Align the partner's EverBond QR inside the viewport brackets to synchronize nodes.
                  </p>
                </div>

                {/* Camera Viewfinder Area */}
                <div style={{
                  width: '260px',
                  height: '260px',
                  borderRadius: '20px',
                  border: '3px solid var(--gold-border)',
                  margin: '0 auto 20px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
                }}>
                  {isScanning ? (
                    <>
                      {/* Sweep Laser */}
                      <div className="camera-laser" />
                      
                      {/* Viewfinder brackets */}
                      <div style={{ position: 'absolute', top: '20px', left: '20px', width: '20px', height: '20px', borderTop: `3px solid ${T.gold}`, borderLeft: `3px solid ${T.gold}` }} />
                      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '20px', height: '20px', borderTop: `3px solid ${T.gold}`, borderRight: `3px solid ${T.gold}` }} />
                      <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '20px', height: '20px', borderBottom: `3px solid ${T.gold}`, borderLeft: `3px solid ${T.gold}` }} />
                      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '20px', height: '20px', borderBottom: `3px solid ${T.gold}`, borderRight: `3px solid ${T.gold}` }} />

                      <video
                        ref={videoRef}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </>
                  ) : scannedPartner ? (
                    // Scale + Checkmark success animation (Step 10)
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: T.sage,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(78, 155, 120, 0.4)'
                      }}
                    >
                      <Check size={36} className="eb-check-pop" />
                    </motion.div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <Camera size={44} style={{ color: 'var(--text-faint)', opacity: 0.3, marginBottom: '8px' }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', display: 'block' }}>Camera stopped.</span>
                    </div>
                  )}
                </div>

                {/* Error Validation State (Step 8) */}
                {scanError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--rose-lt, rgba(208,92,114,0.08))',
                      border: '1px solid var(--rose-border)',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: T.rose
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{scanError}</span>
                  </motion.div>
                )}

                {/* Confirmation Modal: Partner Found (Step 9) */}
                {scannedPartner && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'radial-gradient(circle at 100% 0%, rgba(184,144,42,0.03) 0%, transparent 60%), var(--bg-card)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      marginBottom: '20px'
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: T.gold, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Partner Found
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>User ID</span>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{scannedPartner.everBondId}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>Partner Name</span>
                        <strong style={{ color: 'var(--text)' }}>{scannedPartner.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>Relationship Stage</span>
                        <strong style={{ color: 'var(--text)' }}>{scannedPartner.stage}</strong>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scanner Controls */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCloseScanner}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '100px',
                      border: '1px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  {scannedPartner && (
                    <button
                      onClick={handleConfirmQRConnection}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '100px',
                        background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 6px 15px rgba(184,144,42,0.2)'
                      }}
                    >
                      Connect Partner
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Disconnect Confirmation Modal ── */}
      {createPortal(
        <AnimatePresence>
          {showDisconnectConfirm && (
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              style={{ zIndex: 10000 }}
              onClick={() => setShowDisconnectConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--rose-border)',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 20px 60px rgba(208, 92, 114, 0.12)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="eb-modal-close"
                  onClick={() => setShowDisconnectConfirm(false)}
                  style={{ top: '16px', right: '16px' }}
                >
                  <X size={16} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--rose-lt, rgba(208,92,114,0.06))',
                    border: '1px solid var(--rose-border)',
                    color: T.rose,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <AlertCircle size={28} />
                  </div>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Disconnect Node?</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Are you sure you want to disconnect from your partner? This will immediately lock shared ledger planning, compound comparative charts, and relationship timeline history.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '12px', borderRadius: '100px', border: '1px solid var(--border-mid)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnectNode}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '100px',
                      background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`,
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      boxShadow: '0 6px 15px rgba(208,92,114,0.2)'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Success Celebration Overlay ── */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(5, 5, 8, 0.88)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Drifting Gold and Champagne Confetti */}
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  rotate: p.rotation,
                  opacity: 1,
                  scale: Math.random() * 0.4 + 0.6,
                }}
                animate={{
                  top: '110%',
                  x: p.sway,
                  rotate: p.rotation + 720,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                  repeat: 0,
                }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: Math.random() > 0.45 ? '50%' : '2px',
                  boxShadow: '0 2px 8px rgba(184, 144, 42, 0.3)',
                  zIndex: 5001,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Glowing gold back-light */}
            <div style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
              zIndex: 5002,
              animation: 'goldPulse 3s ease-in-out infinite',
            }} />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              style={{
                textAlign: 'center',
                zIndex: 5003,
                padding: '40px',
                maxWidth: '440px',
                width: '100%',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 30px rgba(184, 144, 42, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Heart size={36} fill="#fff" />
              </motion.div>

              <h2 style={{
                fontFamily: T.fontDisplay,
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '8px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                Nodes Synchronized
              </h2>
              
              <p style={{
                fontSize: '0.8rem',
                color: T.gold,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Workspace Connection Activated
              </p>
              
              <p style={{
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.5,
                maxWidth: '340px',
                margin: '0 auto',
              }}>
                Consolidating shared ledgers, allocations, decision channels, and dynamic timeline nodes.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Timeline Events Slide-over Modal ── */}
      {createPortal(
        <AnimatePresence>
          {showTimelineModal && (
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              style={{ zIndex: 10000 }}
              onClick={() => setShowTimelineModal(false)}
            >
              <motion.div
                initial={{ x: '100%', opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                style={{
                  position: 'fixed',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '100%',
                  maxWidth: '480px',
                  background: 'var(--bg-card)',
                  borderLeft: '1.5px solid var(--border)',
                  boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
                  padding: '36px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  zIndex: 10000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-mid)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      Activity <em>Timeline</em>
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Audited node event timeline logs</span>
                  </div>
                  <button
                    onClick={() => setShowTimelineModal(false)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-warm)',
                      border: '1px solid var(--border-mid)', color: 'var(--text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Timeline scrollable area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="hide-scrollbar">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '20px', borderLeft: '1.5px solid var(--border-mid)' }}>
                    {timelineEvents && timelineEvents.length > 0 ? (
                      timelineEvents.map((event, index) => (
                        <div key={event.eventId} style={{ position: 'relative', marginBottom: '4px' }}>
                          {/* Pulsing dot indicator */}
                          <div style={{
                            position: 'absolute',
                            left: '-26px',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: event.isMilestone ? T.gold : 'var(--border-mid)',
                            border: event.isMilestone ? `2.5px solid var(--bg-card)` : '2px solid var(--bg-card)',
                            boxShadow: event.isMilestone ? `0 0 8px ${T.gold}` : 'none'
                          }} />

                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', fontWeight: 500 }}>
                              {formatDate(event.createdAt)}
                            </span>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block', marginTop: '2px' }}>
                              {event.title}
                            </strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.45 }}>
                              {event.description}
                            </p>
                            <span style={{ fontSize: '0.68rem', color: T.gold, display: 'block', marginTop: '6px', fontWeight: 700 }}>
                              Logged By: {event.createdBy || 'System'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No relationship timeline logs yet.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
