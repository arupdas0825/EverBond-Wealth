import React, { useState, useEffect, useRef } from 'react';
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

    // Auto-accept after 2s
    const name = partnerNameInput.trim();
    setTimeout(() => {
      acceptConnection({ partnerName: name });
      if (stage === 'Single') setStage('Committed');
    }, 2000);
  };

  const handleSimulateAccept = () => {
    setIsSimulating(true);
    setSimulateProgress(0);

    // Animate progress over 2 seconds
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / 2000, 1);
      setSimulateProgress(pct);
      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        acceptConnection({ partnerName: partner2 || 'Partner' });
        if (stage === 'Single') setStage('Committed');
        setIsSimulating(false);
        toast.success('Partner connected successfully!');
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
        <motion.div variants={itemVariants}>
          <Card gold style={{ position: 'relative', overflow: 'visible' }}>
            <GoldLabel>YOUR EVERBOND ID</GoldLabel>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              {/* ID Display */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{
                  fontFamily: "'Courier New', Consolas, monospace",
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                  fontWeight: 700,
                  color: T.gold,
                  letterSpacing: '0.06em',
                  lineHeight: 1.2,
                  marginBottom: '10px',
                }}>
                  {everBondId || '——————'}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                  Share this ID with your partner to connect.
                </p>
              </div>

              {/* Copy Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCopyId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: 'var(--r-pill)',
                  border: `1.5px solid ${copied ? T.sage : 'var(--gold-border)'}`,
                  background: copied ? 'var(--sage-lt, rgba(78,155,120,0.1))' : 'var(--gold-pale, rgba(184,144,42,0.08))',
                  color: copied ? T.sage : T.gold,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy ID'}
              </motion.button>
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

                  {/* CTA Button */}
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
                  {!showDisconnectConfirm ? (
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
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        background: 'var(--rose-lt, rgba(208,92,114,0.1))',
                        border: '1.5px solid var(--rose-border)',
                        borderRadius: 'var(--r-md)',
                        padding: '20px',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>
                        Are you sure you want to disconnect?
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        This will reset all shared features and partnership data.
                      </p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={() => setShowDisconnectConfirm(false)}
                          style={{
                            padding: '10px 24px',
                            borderRadius: 'var(--r-pill)',
                            border: '1.5px solid var(--border-mid)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDisconnect}
                          style={{
                            padding: '10px 24px',
                            borderRadius: 'var(--r-pill)',
                            border: 'none',
                            background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`,
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 6px 22px rgba(217,102,122,0.3)',
                          }}
                        >
                          Confirm Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         Connect Partner Modal
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4000,
              background: 'rgba(5, 5, 8, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              variants={modalCardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="liquid-glass"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '40px 32px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--gold-border)',
                boxShadow: 'var(--sh-lg)',
                borderRadius: '24px',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-mid)',
                  background: 'var(--bg-warm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-faint)',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                  boxShadow: 'var(--sh-gold)',
                }}>
                  <Key size={24} style={{ color: '#fff' }} />
                </div>

                <h2 style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '8px',
                }}>
                  Connect Your Partner
                </h2>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  maxWidth: '360px',
                  margin: '0 auto',
                }}>
                  Enter your partner's EverBond ID to begin a shared financial journey.
                </p>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    className="onb-input-glow"
                    value={partnerIdInput}
                    onChange={(e) => setPartnerIdInput(e.target.value.toUpperCase())}
                    placeholder="EB-XXXXXX"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
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
                    padding: '15px 24px',
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
                    marginTop: '4px',
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
      </AnimatePresence>

      {/* ── Disconnect Confirmation Modal (connected state) ── */}
      {/* Already inline above in connected state */}

    </div>
  );
}
