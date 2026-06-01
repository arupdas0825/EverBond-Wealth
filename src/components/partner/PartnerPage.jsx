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
  Sparkles, Lock, Shield, Target, TrendingUp, Crown, X, ArrowRight
} from 'lucide-react';

/* ── Animation variants ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 16 } }
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

/* ── Pulse keyframes for pending state ──────────────────── */
const goldPulseStyle = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184, 144, 42, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(184, 144, 42, 0); }
}
@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}
@keyframes checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`;

/* ── Reusable label ─────────────────────────────────────── */
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

/* ── Locked Feature Card ────────────────────────────────── */
function LockedFeatureCard({ icon, title, desc }) {
  return (
    <Card style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '18px 20px',
      borderLeft: `3px solid var(--gold-border)`,
      opacity: 0.7,
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'var(--gold-pale, rgba(184,144,42,0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Lock size={16} style={{ color: T.gold }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.82rem' }}>{icon}</span>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            {title}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', lineHeight: 1.45, margin: 0 }}>
          {desc}
        </p>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: T.gold, marginTop: '6px', display: 'inline-block' }}>
          Connect your partner to unlock
        </span>
      </div>
    </Card>
  );
}

/* ── Unlocked Feature Chip ──────────────────────────────── */
function UnlockedFeature({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: 'var(--r-sm)',
        background: 'var(--sage-lt, rgba(78,155,120,0.1))',
        border: '1px solid var(--sage-border, rgba(78,155,120,0.18))',
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: T.sage,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'checkPop 0.4s ease forwards',
      }}>
        <Check size={12} style={{ color: '#fff' }} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PARTNER PAGE — Main Export
═══════════════════════════════════════════════════════════ */
export function PartnerPage({ setPage }) {
  const toast = useToast();

  // Store
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
    setVerificationState,
    simulateIncomingRequest,
    declineRequest,
    incomingRequest,
  } = useFinanceStore();

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateProgress, setSimulateProgress] = useState(0);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const simulateTimerRef = useRef(null);

  // Success acceptance screen & confetti particles local state
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  // Responsive mobile media listener
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 600 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Programmatic Scroll Lock targeting document.body when modals mount
  useEffect(() => {
    const shouldLock = isModalOpen || showDisconnectConfirm;
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, showDisconnectConfirm]);

  // Premium Custom Spring Animation Variants (Responsive Center Card vs Bottom Sheet)
  const premiumModalVariants = {
    hidden: isMobile 
      ? { y: '100%', opacity: 1, scale: 1 } 
      : { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: isMobile ? 300 : 260, 
        damping: isMobile ? 30 : 24 
      } 
    },
    exit: isMobile 
      ? { y: '100%', opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeIn' } } 
      : { y: 20, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  // Init EverBond ID on mount
  useEffect(() => {
    initEverBondId();
  }, [initEverBondId]);

  // Inject keyframes
  useEffect(() => {
    const styleId = 'partner-page-keyframes';
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style');
      el.id = styleId;
      el.textContent = goldPulseStyle;
      document.head.appendChild(el);
    }
  }, []);

  // Cleanup simulate timer
  useEffect(() => {
    return () => {
      if (simulateTimerRef.current) clearTimeout(simulateTimerRef.current);
    };
  }, []);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleCopyId = () => {
    if (!everBondId) return;
    navigator.clipboard.writeText(everBondId);
    setCopied(true);
    toast.success('EverBond ID copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateIncomingRequest = () => {
    simulateIncomingRequest({
      senderEverBondId: 'EB-A7K92X',
      senderName: 'Arup',
      relationshipDate: '2025-02-15'
    });
    toast.info('Simulated connection request received from Arup!');
  };

  const handleDeclineRequest = () => {
    declineRequest();
    toast.info('Connection request declined.');
  };

  const handleAcceptRequest = () => {
    // Generate premium gold and champagne falling particles
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

    // Transition state after 3.5 seconds
    setTimeout(() => {
      const incoming = useFinanceStore.getState().incomingRequest;
      acceptConnection({ partnerName: incoming?.senderName || partner2 || 'Partner' });
      if (stage === 'Single') setStage('Committed');
      setShowSuccessOverlay(false);
      toast.success('Connection established successfully!');
    }, 3500);
  };

  const handleSubmitConnection = () => {
    // Validation
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
      toast.error('Please enter your partner\'s name.');
      return;
    }

    // Submit
    sendConnectionRequest({ partnerEverBondId: formattedId, relationshipDate: dateInput });
    setVerificationState({ partner2: partnerNameInput.trim(), partnerName: partnerNameInput.trim() });
    toast.success('Connection request sent!');
    setIsModalOpen(false);

    // Reset form
    setPartnerIdInput('');
    setPartnerNameInput('');
    setDateInput('');
  };

  const handleSimulateAccept = () => {
    setIsSimulating(true);
    setSimulateProgress(0);

    // Animate progress over 1.5 seconds
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / 1500, 1);
      setSimulateProgress(pct);
      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsSimulating(false);
        // Trigger success animation overlay
        handleAcceptRequest();
      }
    };
    requestAnimationFrame(tick);
  };

  const handleDisconnect = () => {
    disconnectPartner();
    setShowDisconnectConfirm(false);
    toast.info('Partner disconnected.');
  };

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

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="fade-in" style={{ position: 'relative', width: '100%' }}>

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">EverBond Identity System</div>
          <h1 className="page-title">Partner <em>Connection</em></h1>
          <p className="page-desc">Build a shared financial journey with your partner.</p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      {/* ── Staggered Sections ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >

        {/* ══════════════════════════════════════════════════
           Section 1 — Your EverBond Identity Card
        ══════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════
           Section 1 — EverBond Premium Identity Center
        ══════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <Card gold style={{ position: 'relative', overflow: 'visible', padding: '24px 28px' }}>
            <GoldLabel>EVERBOND IDENTITY CENTER</GoldLabel>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '20px', lineHeight: 1.45 }}>
              Your secure cryptographic relationship anchors. Authenticate your partnership node and unlock cooperative features.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}>
              
              {/* 1. PERSONAL IDENTITY CARD */}
              <div style={{
                background: 'radial-gradient(circle at 0% 0%, rgba(184, 144, 42, 0.06) 0%, transparent 60%), var(--bg-card)',
                border: '1px solid var(--gold-border)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--sh-xs)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>
                      Personal Identity
                    </span>
                    <span style={{ fontSize: '0.62rem', background: 'var(--gold-pale)', padding: '2px 8px', borderRadius: '100px', color: T.gold, fontWeight: 700 }}>
                      Permanent
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "'Courier New', Consolas, monospace",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '0.04em',
                    margin: '6px 0 12px 0'
                  }}>
                    {everBondId || 'EB-PENDING-XXXX'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(everBondId);
                      toast.success('EverBond ID copied successfully');
                    }}
                    className="btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.72rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      borderRadius: '100px',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={12} /> Copy ID
                  </button>
                  
                  {/* Future Ready QR Code action */}
                  <button
                    onClick={() => {
                      toast.info('QR Code Partner Linking feature coming soon to mobile apps!');
                    }}
                    className="btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.72rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      borderRadius: '100px',
                      cursor: 'pointer'
                    }}
                  >
                    📷 Share QR
                  </button>

                  {/* Future Ready Share Invite Link action */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://everbond.wealth/invite/${everBondId}`);
                      toast.success('Invite link copied successfully');
                    }}
                    className="btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.72rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      borderRadius: '100px',
                      cursor: 'pointer'
                    }}
                  >
                    🔗 Invite Link
                  </button>
                </div>
              </div>

              {/* 2. COUPLE IDENTITY CARD */}
              <div style={{
                background: connectionStatus === 'connected'
                  ? 'radial-gradient(circle at 0% 0%, rgba(78, 155, 120, 0.06) 0%, transparent 60%), var(--bg-card)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: connectionStatus === 'connected'
                  ? '1px solid rgba(78, 155, 120, 0.25)'
                  : '1px dashed var(--border-mid)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                position: 'relative',
                overflow: 'hidden',
                opacity: connectionStatus === 'connected' ? 1 : 0.7,
                boxShadow: connectionStatus === 'connected' ? 'var(--sh-xs)' : 'none'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: connectionStatus === 'connected' ? T.sage : 'var(--text-faint)' }}>
                      Couple Identity
                    </span>
                    {connectionStatus === 'connected' ? (
                      <span style={{ fontSize: '0.62rem', background: 'var(--sage-lt)', padding: '2px 8px', borderRadius: '100px', color: T.sage, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        💑 Verified Badge
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', background: 'var(--bg-warm)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-faint)', fontWeight: 700 }}>
                        Locked
                      </span>
                    )}
                  </div>
                  {connectionStatus === 'connected' ? (
                    <div style={{
                      fontFamily: "'Courier New', Consolas, monospace",
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      letterSpacing: '0.04em',
                      margin: '6px 0 12px 0'
                    }}>
                      {coupleId}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', margin: '14px 0', lineHeight: 1.4 }}>
                      🔒 Links after mutual connection request acceptance.
                    </div>
                  )}
                </div>

                {connectionStatus === 'connected' && (
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(coupleId);
                        toast.success('EverBond ID copied successfully');
                      }}
                      className="btn-secondary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.72rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        borderRadius: '100px',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={12} /> Copy Couple ID
                    </button>
                  </div>
                )}
              </div>

              {/* 3. FAMILY IDENTITY CARD */}
              <div style={{
                background: stage === 'Married'
                  ? 'radial-gradient(circle at 0% 0%, rgba(124, 107, 190, 0.06) 0%, transparent 60%), var(--bg-card)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: stage === 'Married'
                  ? '1px solid rgba(124, 107, 190, 0.25)'
                  : '1px dashed var(--border-mid)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                position: 'relative',
                overflow: 'hidden',
                opacity: stage === 'Married' ? 1 : 0.7,
                boxShadow: stage === 'Married' ? 'var(--sh-xs)' : 'none'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: stage === 'Married' ? T.violet : 'var(--text-faint)' }}>
                      Family Identity
                    </span>
                    {stage === 'Married' ? (
                      <span style={{ fontSize: '0.62rem', background: 'var(--violet-lt)', padding: '2px 8px', borderRadius: '100px', color: T.violet, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        👑 Dynasty Badge
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', background: 'var(--bg-warm)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-faint)', fontWeight: 700 }}>
                        Locked
                      </span>
                    )}
                  </div>
                  {stage === 'Married' ? (
                    <div style={{
                      fontFamily: "'Courier New', Consolas, monospace",
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      letterSpacing: '0.04em',
                      margin: '6px 0 12px 0'
                    }}>
                      {familyId}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', margin: '14px 0', lineHeight: 1.4 }}>
                      🔒 Unlocks upon Married Stage activation in settings.
                    </div>
                  )}
                </div>

                {stage === 'Married' && (
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(familyId);
                        toast.success('EverBond ID copied successfully');
                      }}
                      className="btn-secondary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.72rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        borderRadius: '100px',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={12} /> Copy Family ID
                    </button>
                  </div>
                )}
              </div>

            </div>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════
           Section 2 — Partner Connection Status
        ══════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <AnimatePresence mode="wait">

            {/* ── STATUS: NONE ── */}
            {connectionStatus === 'none' && (
              <motion.div
                key="none"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card style={{ textAlign: 'center', padding: '48px 28px' }}>
                  {/* Empty state icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: 'var(--sh-gold)',
                  }}>
                    <Users size={32} style={{ color: '#fff' }} />
                  </div>

                  <h2 style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '10px',
                  }}>
                    No Partner Connected
                  </h2>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    maxWidth: '420px',
                    margin: '0 auto 28px',
                    lineHeight: 1.6,
                  }}>
                    Connect your partner to unlock collaborative financial planning.
                  </p>

                  {/* CTA Buttons */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '440px', margin: '0 auto 28px' }}>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 32px',
                        borderRadius: 'var(--r-pill)',
                        background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 8px 28px rgba(184,144,42,0.35)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      <Link2 size={18} />
                      Connect Partner
                      <ArrowRight size={16} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSimulateIncomingRequest}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        borderRadius: 'var(--r-pill)',
                        background: 'transparent',
                        border: '1.5px solid var(--gold-border)',
                        color: T.gold,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.01em',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Users size={18} />
                      Receive Mock Request
                    </motion.button>
                  </div>

                  {/* Locked Features Grid */}
                  <div style={{ marginTop: '40px', textAlign: 'left' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-faint)',
                      display: 'block',
                      marginBottom: '14px',
                      textAlign: 'center',
                    }}>
                      Locked Features
                    </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '12px',
                    }}>
                      <LockedFeatureCard
                        icon="🔒"
                        title="Shared Goals"
                        desc="Co-plan for weddings, homes, or travel."
                      />
                      <LockedFeatureCard
                        icon="🔒"
                        title="Couple Dashboard"
                        desc="Consolidate multiple ledgers securely."
                      />
                      <LockedFeatureCard
                        icon="🔒"
                        title="Joint Wealth Center"
                        desc="Orchestrate multi-generation legacy reserves."
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── STATUS: PENDING ── */}
            {connectionStatus === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card style={{
                  padding: '36px 28px',
                  border: '1.5px solid var(--gold-border)',
                  animation: 'goldPulse 2.5s ease-in-out infinite',
                }}>
                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '24px',
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: T.gold,
                      animation: 'dotPulse 1.5s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: T.gold,
                      background: 'var(--gold-pale, rgba(184,144,42,0.08))',
                      padding: '6px 14px',
                      borderRadius: 'var(--r-pill)',
                      border: '1px solid var(--gold-border)',
                    }}>
                      Connection Request Sent
                    </span>
                  </div>

                  {/* Info rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Partner EverBond ID</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.04em' }}>
                        {partnerEverBondId}
                      </strong>
                    </div>
                    {relationshipDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Relationship Date</span>
                        <strong style={{ color: 'var(--text)' }}>{formatDate(relationshipDate)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Status</span>
                      <span style={{ color: T.gold, fontWeight: 700, fontStyle: 'italic' }}>
                        Waiting for partner confirmation...
                      </span>
                    </div>
                  </div>

                  {/* Simulate progress bar */}
                  {isSimulating && (
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--bg-muted)',
                        borderRadius: 'var(--r-pill)',
                        overflow: 'hidden',
                      }}>
                        <motion.div
                          style={{
                            height: '100%',
                            borderRadius: 'var(--r-pill)',
                            background: `linear-gradient(90deg, ${T.goldMid}, ${T.gold})`,
                            width: `${simulateProgress * 100}%`,
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: T.gold, marginTop: '6px', textAlign: 'center', fontWeight: 600 }}>
                        Simulating partner acceptance...
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSimulateAccept}
                      disabled={isSimulating}
                      style={{
                        flex: 1,
                        minWidth: '160px',
                        padding: '12px 20px',
                        borderRadius: 'var(--r-pill)',
                        background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: isSimulating ? 'not-allowed' : 'pointer',
                        opacity: isSimulating ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: 'var(--sh-gold)',
                      }}
                    >
                      <UserCheck size={16} />
                      Simulate Partner Accept
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        disconnectPartner();
                        toast.info('Connection request cancelled.');
                      }}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '12px 20px',
                        borderRadius: 'var(--r-pill)',
                        background: 'transparent',
                        border: '1.5px solid var(--border-mid)',
                        color: 'var(--text-muted)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <X size={15} />
                      Cancel Request
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )}

                  {/* ── STATUS: RECEIVED (Request Received) ── */}
                  {connectionStatus === 'received' && (
                    <motion.div
                      key="received"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card style={{
                        padding: '36px 28px',
                        border: '1.5px solid var(--gold-border)',
                        boxShadow: '0 12px 30px rgba(184, 144, 42, 0.12)',
                      }}>
                        {/* Status Badge */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '24px',
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: T.gold,
                            animation: 'dotPulse 1.5s ease-in-out infinite',
                          }} />
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: T.gold,
                            background: 'var(--gold-pale, rgba(184,144,42,0.08))',
                            padding: '6px 14px',
                            borderRadius: 'var(--r-pill)',
                            border: '1px solid var(--gold-border)',
                          }}>
                            Partner Connection Request
                          </span>
                        </div>

                        {/* Message */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'var(--gold-pale, rgba(184,144,42,0.06))',
                            border: '1px solid var(--gold-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            color: T.gold,
                          }}>
                            <Users size={28} />
                          </div>
                          <h3 style={{
                            fontFamily: T.fontDisplay,
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                            marginBottom: '6px',
                          }}>
                            {incomingRequest?.senderName || 'Arup'} wants to connect with you.
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                            Accept this invitation to activate your shared financial journey and merge workspaces.
                          </p>
                        </div>

                        {/* Info Row */}
                        <div style={{
                          background: 'var(--bg-warm, rgba(0,0,0,0.02))',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border-mid)',
                          padding: '16px 20px',
                          marginBottom: '28px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Partner EverBond ID</span>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.04em' }}>
                              {incomingRequest?.senderEverBondId || 'EB-A7K92X'}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Relationship Anniversary</span>
                            <strong style={{ color: 'var(--text)' }}>
                              {formatDate(incomingRequest?.relationshipDate || '2025-02-15')}
                            </strong>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAcceptRequest}
                            style={{
                              flex: 1,
                              minWidth: '160px',
                              padding: '14px 24px',
                              borderRadius: 'var(--r-pill)',
                              background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 8px 20px rgba(184,144,42,0.25)',
                            }}
                          >
                            <Sparkles size={16} />
                            Accept Invitation
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeclineRequest}
                            style={{
                              flex: 1,
                              minWidth: '120px',
                              padding: '14px 24px',
                              borderRadius: 'var(--r-pill)',
                              background: 'transparent',
                              border: '1.5px solid var(--border-mid)',
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <X size={15} />
                            Decline
                          </motion.button>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* ── STATUS: CONNECTED ── */}
                  {connectionStatus === 'connected' && (
                    <motion.div
                      key="connected"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card style={{ padding: '36px 28px' }}>
                        {/* Status Badge */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '28px',
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: T.sage,
                          }} />
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: T.sage,
                            background: 'var(--sage-lt, rgba(78,155,120,0.1))',
                            padding: '6px 14px',
                            borderRadius: 'var(--r-pill)',
                            border: '1px solid var(--sage-border, rgba(78,155,120,0.18))',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                            >
                              <Check size={12} />
                            </motion.span>
                            Connected
                          </span>
                        </div>

                        {/* Partner Info Card */}
                        <div style={{
                          background: 'var(--bg-warm)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border)',
                          padding: '24px',
                          marginBottom: '28px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {/* Partner Avatar */}
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              fontFamily: T.fontDisplay,
                              boxShadow: 'var(--sh-gold)',
                              border: '3px solid var(--bg-card)',
                              flexShrink: 0,
                            }}>
                              {(partner2 || 'P').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 style={{
                                fontFamily: T.fontDisplay,
                                fontSize: '1.35rem',
                                fontWeight: 700,
                                color: 'var(--text)',
                                marginBottom: '2px',
                              }}>
                                {partner2 || 'Partner'}
                              </h3>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 600 }}>
                                Linked Partner
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-faint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Key size={13} /> Partner EverBond ID
                              </span>
                              <strong style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.04em' }}>
                                {partnerEverBondId}
                              </strong>
                            </div>
                            {relationshipDate && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-faint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Heart size={13} /> Relationship Date
                                </span>
                                <strong style={{ color: 'var(--text)' }}>{formatDate(relationshipDate)}</strong>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-faint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={13} /> Connected Since
                              </span>
                              <strong style={{ color: 'var(--text)' }}>{formatDate(requestSentAt)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Unlocked Features */}
                        <div style={{ marginBottom: '28px' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: T.sage,
                            display: 'block',
                            marginBottom: '14px',
                          }}>
                            Unlocked Features
                          </span>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '10px',
                          }}>
                            <UnlockedFeature label="Couple Dashboard" />
                            <UnlockedFeature label="Shared Goals" />
                            <UnlockedFeature label="Joint Planning" />
                            <UnlockedFeature label="Shared Wealth Tracking" />
                            <UnlockedFeature label="Relationship Timeline" />
                          </div>
                        </div>

                        {/* Disconnect Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowDisconnectConfirm(true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: 'var(--r-md)',
                            background: 'var(--rose-lt, rgba(208,92,114,0.1))',
                            border: '1.5px solid var(--rose-border)',
                            color: 'var(--rose)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <X size={15} />
                          Disconnect Partner
                        </motion.button>
                      </Card>
                    </motion.div>
                  )}

          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         Connect Partner Modal
      ══════════════════════════════════════════════════════ */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              key="modal-overlay"
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
            >
              <motion.div
                variants={premiumModalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="eb-premium-modal"
              >
                {/* Close Button */}
                <button
                  className="eb-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="eb-modal-header">
                  {/* Icon */}
                  <div className="eb-modal-icon-container">
                    <Key size={24} />
                  </div>

                  <h2 className="eb-modal-title">
                    Connect Your Partner
                  </h2>
                  <p className="eb-modal-desc">
                    Enter your partner's EverBond ID to begin a shared financial journey.
                  </p>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Partner EverBond ID */}
                  <div>
                    <label style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: T.gold,
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Partner EverBond ID
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow eb-id-input"
                      value={partnerIdInput}
                      onChange={(e) => setPartnerIdInput(e.target.value.toUpperCase())}
                      placeholder="EB-XXXXXX"
                      autoFocus
                    />
                  </div>

                  {/* Partner Name */}
                  <div>
                    <label style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: T.gold,
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Partner Name
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow"
                      value={partnerNameInput}
                      onChange={(e) => setPartnerNameInput(e.target.value)}
                      placeholder="Partner's name"
                    />
                  </div>

                  {/* Relationship Anniversary */}
                  <div>
                    <label style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: T.gold,
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Relationship Anniversary
                    </label>
                    <input
                      type="date"
                      className="onb-input-glow"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitConnection}
                    disabled={!partnerIdInput.trim()}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      borderRadius: 'var(--r-md)',
                      background: partnerIdInput.trim()
                        ? `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`
                        : 'var(--bg-muted)',
                      border: 'none',
                      color: partnerIdInput.trim() ? '#fff' : 'var(--text-faint)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: partnerIdInput.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: partnerIdInput.trim() ? '0 8px 28px rgba(184,144,42,0.35)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '8px',
                      transition: 'background 0.25s ease, box-shadow 0.25s ease',
                    }}
                  >
                    <Sparkles size={17} />
                    Send Connection Request
                  </motion.button>
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
              key="disconnect-modal-overlay"
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="eb-premium-overlay"
              style={{ zIndex: 10000 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowDisconnectConfirm(false); }}
            >
              <motion.div
                variants={premiumModalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="eb-premium-modal"
                style={{ 
                  maxWidth: '460px',
                  borderColor: 'var(--rose-border)',
                  boxShadow: '0 30px 60px rgba(208, 92, 114, 0.12)'
                }}
              >
                {/* Close Button */}
                <button
                  className="eb-modal-close"
                  onClick={() => setShowDisconnectConfirm(false)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="eb-modal-header">
                  <div className="eb-modal-icon-container" style={{
                    background: 'var(--rose-lt, rgba(208,92,114,0.1))',
                    border: '1px solid var(--rose-border)',
                    color: 'var(--rose)',
                    boxShadow: 'none'
                  }}>
                    <X size={28} />
                  </div>

                  <h3 className="eb-modal-title">
                    Disconnect Partner?
                  </h3>
                  <p className="eb-modal-desc" style={{ maxWidth: '360px' }}>
                    Are you sure you want to disconnect? This will remove access to shared planning features, couple dashboard, and joint timeline tracking.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: 'var(--r-pill)',
                      border: '1.5px solid var(--border-mid)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: 'var(--r-pill)',
                      border: 'none',
                      background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`,
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(208,92,114,0.25)',
                      transition: 'all 0.2s ease',
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

      {/* ── Success Connection Overlay (Confetti Effect) ── */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 5000,
              background: 'rgba(5, 5, 8, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              pointerEvents: 'auto',
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
                  boxShadow: '0 2px 8px rgba(184, 144, 42, 0.4)',
                  zIndex: 5001,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Glowing gold back-light */}
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
              zIndex: 5002,
              animation: 'goldPulse 3s ease-in-out infinite',
            }} />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.2 }}
              style={{
                textAlign: 'center',
                zIndex: 5003,
                padding: '40px',
                maxWidth: '480px',
                width: '100%',
              }}
            >
              {/* Check Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 28px',
                  boxShadow: '0 12px 35px rgba(184, 144, 42, 0.5)',
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Heart size={44} fill="#fff" />
              </motion.div>

              <h2 style={{
                fontFamily: T.fontDisplay,
                fontSize: '2rem',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '8px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                Partner Connected Successfully
              </h2>
              
              <p style={{
                fontSize: '1rem',
                color: T.gold,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Shared Journey Activated
              </p>
              
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.5,
                maxWidth: '360px',
                margin: '0 auto',
              }}>
                Initializing your joint planning workspace. Shared goals, timelines, and wallets are being unlocked...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
