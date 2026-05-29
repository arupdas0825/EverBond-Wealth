import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, calculateHealthScore, formatCurrency, formatCompact } from '../../utils/finance';
import { totalMilestoneContribution, requiredMonthlySaving, parseMilestoneDate } from '../../utils/milestones';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';
import { FutureVerification } from '../welcome/FutureVerification';
import { ShieldAlert, Heart, Users, Coins, Sparkles, Flame, UserCheck, Crown, Lock, RefreshCw, Copy, Check, Link, ArrowRight, User, Smartphone, Send, Key } from 'lucide-react';
import { Logo } from '../common/Logo';

const TT = {
  borderRadius:'14px',border:'none',
  boxShadow:'0 8px 32px rgba(0,0,0,.10)',
  fontFamily:T.fontBody,fontSize:'13px',padding:'12px 16px',
};

function greeting(stage, name, partner2) {
  const h = new Date().getHours();
  let text = 'Good Morning';
  let emoji = '☀️';
  
  if (h < 5)  { text = 'Good Night'; emoji = '🌙'; }
  else if (h < 12) { text = 'Good Morning'; emoji = '☀️'; }
  else if (h < 17) { text = 'Good Afternoon'; emoji = '✨'; }
  else if (h < 21) { text = 'Good Evening'; emoji = '🌇'; }
  else { text = 'Good Night'; emoji = '🌙'; }

  if (stage === 'Single') {
    return [`${text}, ${name || 'Ambition Builder'}`, emoji];
  } else if (stage === 'Committed') {
    return [`${text}, ${name} & ${partner2 || 'Partner'}`, `💑`];
  } else {
    return [`${text}, The Dynasty`, `👑`];
  }
}

export function Dashboard() {
  const { 
    partner1, 
    partner2, 
    stage, 
    region, 
    mode, 
    currency, 
    milestones, 
    getTotalSalary,
    partnerLinked,
    partnerAccepted,
    verificationStatus,
    invitationCode,
    partnerId,
    relationshipId,
    setVerificationState,
    setProfile,
    setStage
  } = useFinanceStore();

  // Local state for invitation steps (1 to 7)
  const [localStep, setLocalStep] = useState(1);
  const [pName, setPName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [partnerEnteredCode, setPartnerEnteredCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const [isUpgradingStage, setIsUpgradingStage] = useState(false);
  const [selectedUpgradeStage, setSelectedUpgradeStage] = useState('Committed');

  // Load state if already in progress in the store
  useEffect(() => {
    if (invitationCode) {
      setGeneratedCode(invitationCode);
      if (partnerAccepted) {
        setLocalStep(7);
      } else if (partnerLinked) {
        setLocalStep(4);
      } else {
        setLocalStep(2);
      }
    } else {
      setLocalStep(1);
    }
  }, [invitationCode, partnerLinked, partnerAccepted]);

  const totalSalary = getTotalSalary();
  const mContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  
  const snap = useMemo(() => calculateFinancialSnapshot(totalSalary, mode), [totalSalary, mode]);
  const health = useMemo(() => calculateHealthScore(snap), [snap]);
  
  const fmt   = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  const [greet, emoji] = greeting(stage, partner1, partner2);
  const scoreColor = health.value >= 75 ? T.sage : health.value >= 50 ? T.goldMid : T.rose;
  const deg = (health.value / 100) * 360;

  const budgetData = [
    { name:'Essentials',  value:snap.budget.needs,        color:T.sky    },
    { name:'Emergency',   value:snap.budget.emergency,    color:T.rose   },
    { name:'Investments', value:snap.budget.investments,  color:T.goldMid},
  ];

  const assetData = [
    { name:'Equity',      value:snap.investmentSplit.equity,       color:T.goldMid },
    { name:'Debt',        value:snap.investmentSplit.debt,         color:T.sky     },
    { name:'Commodities', value:snap.investmentSplit.commodities,  color:T.sage    },
    { name:'Crypto',      value:snap.investmentSplit.crypto,       color:T.violet  },
  ];

  // Locked assessment: Committed and Married users must be connected
  const isLocked = stage !== 'Single' && !partnerAccepted;

  // Actions for the 7-Step Invitation Flow
  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!pName.trim()) return;
    
    // Generate code
    const prefix = stage === 'Married' ? 'EB-MRD' : 'EB-CPL';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalCode = `${prefix}-${code}`;
    
    setGeneratedCode(finalCode);
    setVerificationState({
      invitationCode: finalCode,
      partnerName: pName.trim(),
      partner2: pName.trim(),
      verificationStatus: 'awaiting'
    });
    setLocalStep(2);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePartnerSubmitCode = () => {
    if (partnerEnteredCode.trim().toUpperCase() !== generatedCode.toUpperCase()) {
      alert('Invalid security invitation code handshake sequence. Please verify.');
      return;
    }
    
    setVerificationState({
      partnerLinked: true,
      verificationStatus: 'connected'
    });
    setLocalStep(4);
  };

  const handlePartnerAccept = () => {
    // Partner accepts
    setLocalStep(5);
    setIsLinking(true);
    setLinkingProgress(0);
    
    const interval = setInterval(() => {
      setLinkingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLinking(false);
          setLocalStep(6);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  const handleCompleteVerification = () => {
    setLocalStep(7);
  };

  const handleUnlockWorkspace = () => {
    // Cryptographically link and unlock
    setVerificationState({
      partnerAccepted: true,
      partnerLinked: true,
      verificationStatus: 'verified',
      partner2: partner2 || pName || 'Partner',
      partnerName: partner2 || pName || 'Partner',
      relationshipId: `REL-${Math.floor(100000 + Math.random() * 900000)}`,
      partnerId: `USR-${Math.floor(100000 + Math.random() * 900000)}`
    });
  };

  // Upgrades a Single user's stage to Committed or Married
  const handleStageUpgrade = (targetStage) => {
    setStage(targetStage);
    setVerificationState({
      partnerAccepted: false,
      partnerLinked: false,
      verificationStatus: 'unverified',
      invitationCode: '',
      partner2: '',
      partnerName: ''
    });
    setIsUpgradingStage(false);
    setLocalStep(1);
    setPName('');
  };

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      
      {/* LOCKED DASHBOARD PREVIEW OVERLAY */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          inset: '-20px',
          zIndex: 1000,
          background: 'rgba(5, 5, 8, 0.45)',
          backdropFilter: 'blur(16px) saturate(130%)',
          WebkitBackdropFilter: 'blur(16px) saturate(130%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px 20px',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 40px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="liquid-glass"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '36px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              boxShadow: 'var(--sh-lg)',
              borderRadius: '24px',
              position: 'relative'
            }}
          >
            {/* Status chip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {localStep < 4 ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'var(--gold-pale)',
                  border: '1px solid var(--gold-border)',
                  color: T.gold,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟡 Awaiting Partner Acceptance
                </div>
              ) : localStep < 7 ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'rgba(78, 155, 120, 0.1)',
                  border: `1px solid ${T.sage}40`,
                  color: T.sage,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟢 Partner Connected
                </div>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'rgba(78, 155, 120, 0.1)',
                  border: `1px solid ${T.sage}40`,
                  color: T.sage,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟢 Couple Verified
                </div>
              )}
            </div>

            {/* Lock messages */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: stage === 'Married' ? 'var(--gold-pale)' : 'var(--rose-light)',
                color: stage === 'Married' ? T.gold : T.rose,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: 'var(--sh-xs)'
              }}>
                <Lock size={24} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Workspace Enforced Lock
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto' }}>
                {stage === 'Married' 
                  ? "Connect with your spouse to unlock Family Wealth Planning." 
                  : "Connect with your partner to unlock Couple Wealth Planning."}
              </p>
            </div>

            {/* Progress Bullet Steps */}
            <div style={{ display: 'flex', justifySelf: 'center', justifyContent: 'space-between', gap: '4px', background: 'var(--bg-warm)', padding: '8px 12px', borderRadius: '12px', border: '1.5px solid var(--border)', marginBottom: '28px' }}>
              {[
                { s: 1, label: 'Details' },
                { s: 2, label: 'Code' },
                { s: 3, label: 'Enter' },
                { s: 4, label: 'Accept' },
                { s: 5, label: 'Link' },
                { s: 6, label: 'Verify' },
                { s: 7, label: 'Unlock' }
              ].map(step => (
                <div key={step.s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: localStep === step.s ? T.gold : localStep > step.s ? T.sage : 'var(--bg-muted)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    boxShadow: localStep === step.s ? `0 0 8px ${T.gold}50` : 'none'
                  }}>
                    {localStep > step.s ? '✓' : step.s}
                  </div>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: localStep === step.s ? 'var(--text)' : 'var(--text-faint)', textTransform: 'uppercase' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Contents */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PARTNER DETAILS */}
              {localStep === 1 && (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleGenerateCode}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      {stage === 'Married' ? "Spouse's Legal Name" : "Partner's Legal Name"}
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow"
                      placeholder={stage === 'Married' ? "Enter spouse name..." : "Enter partner name..."}
                      value={pName}
                      onChange={e => setPName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Anniversary Date (Optional)
                      </label>
                      <input
                        type="date"
                        className="onb-input-glow"
                        value={anniversary}
                        onChange={e => setAnniversary(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Spouse / Partner ID (Optional)
                      </label>
                      <input
                        type="text"
                        className="onb-input-glow"
                        placeholder="E.g., EB-USR-928"
                        value={pEmail}
                        onChange={e => setPEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                      boxShadow: 'var(--sh-gold)',
                      marginTop: '8px'
                    }}
                    disabled={!pName.trim()}
                  >
                    Generate Invitation Code &amp; Proceed
                  </button>
                </motion.form>
              )}

              {/* STEP 2: GENERATED CODE DISPLAY */}
              {localStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
                    Provide this invitation key to your {stage === 'Married' ? 'spouse' : 'partner'}. They must enter it on their terminal to link your portfolios.
                  </p>

                  <div style={{
                    background: 'rgba(184, 144, 42, 0.05)',
                    border: '1.5px dashed var(--gold-border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    boxShadow: 'var(--sh-xs)',
                    width: '100%',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1.65rem',
                      fontWeight: 700,
                      color: T.gold,
                      letterSpacing: '0.08em'
                    }}>
                      {generatedCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-mid)',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: copied ? T.sage : 'var(--text)',
                        boxShadow: 'var(--sh-xs)'
                      }}
                      title="Copy invitation code"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)',
                      border: '1px solid var(--gold-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onClick={() => setLocalStep(3)}
                  >
                    <Send size={16} /> Simulate Partner Entry Link
                  </button>
                </motion.div>
              )}

              {/* STEP 3: MOCK PARTNER CODE ENTRY */}
              {localStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    border: '1.5px solid var(--border-mid)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    fontFamily: 'monospace',
                    color: '#62ca98',
                    fontSize: '0.72rem',
                    textAlign: 'left'
                  }}>
                    <div>&gt; INITIATING PARTNER LEDGER WORKSPACE SIMULATOR...</div>
                    <div style={{ color: 'var(--text-faint)', marginTop: '4px' }}>&gt; Authenticating partner node... SUCCESS</div>
                    <div style={{ color: T.gold }}>&gt; Enter the generated invitation packet code to establish secure handshake:</div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Partner Invitation Key (EB-XXX-XXXXX)
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow"
                      placeholder="Paste EB-... code here"
                      value={partnerEnteredCode}
                      onChange={e => setPartnerEnteredCode(e.target.value.toUpperCase())}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        onClick={() => setPartnerEnteredCode(generatedCode)}
                        style={{ background: 'none', border: 'none', color: T.gold, fontSize: '0.65rem', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Auto-fill code for simulation
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ background: T.sage }}
                    onClick={handlePartnerSubmitCode}
                    disabled={!partnerEnteredCode.trim()}
                  >
                    Establish Secure Handshake Connection
                  </button>
                </motion.div>
              )}

              {/* STEP 4: MOCK PARTNER ACCEPTANCE */}
              {localStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(78, 155, 120, 0.1)', color: T.sage, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <UserCheck size={20} />
                  </div>
                  
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    Handshake Link Accepted
                  </h4>
                  
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '20px' }}>
                    Your {stage === 'Married' ? 'spouse' : 'partner'} ({partner2 || pName || 'Beloved'}) has decrypted the packet. Click below to execute the cryptographically signed linkage.
                  </p>

                  <button
                    className="btn-primary"
                    style={{ background: T.sage, width: '100%' }}
                    onClick={handlePartnerAccept}
                  >
                    Accept Handshake &amp; Link Accounts
                  </button>
                </motion.div>
              )}

              {/* STEP 5: LEDGER SYNCHRONIZATION */}
              {localStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  {/* Ledger node linking animation */}
                  <div style={{ position: 'relative', width: '160px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-muted)',
                      border: '1.5px solid var(--border-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      YOU
                    </div>
                    
                    <div style={{ flex: 1, height: '2px', background: `linear-gradient(90deg, ${T.gold}, ${T.sage})`, position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '10px',
                        height: '100%',
                        background: '#fff',
                        boxShadow: '0 0 10px #fff',
                        animation: 'laserSweep 1s linear infinite'
                      }} />
                    </div>

                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-muted)',
                      border: '1.5px solid var(--border-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      PTNR
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Synchronizing Portfolios
                  </h4>

                  <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: T.gold, marginBottom: '6px' }}>
                      <span>Compiling Ledger Matrix...</span>
                      <span>{linkingProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--onb-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${linkingProgress}%`, height: '100%', background: T.gold, transition: 'width 0.2s ease' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                    Unifying combined risk parameters and SIP asset split index...
                  </div>
                </motion.div>
              )}

              {/* STEP 6: FUTURE VERIFICATION PREVIEW */}
              {localStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '12px', textAlign: 'center' }}>
                    Ledgers consolidated. Before unlocking the dashboard, explore our upcoming multi-party verification architecture node.
                  </p>

                  <FutureVerification />

                  <button
                    className="btn-primary"
                    style={{
                      background: `linear-gradient(135deg, ${T.sage} 0%, #3e8e68 100%)`,
                      boxShadow: '0 6px 20px rgba(78, 155, 120, 0.3)',
                      marginTop: '16px'
                    }}
                    onClick={handleCompleteVerification}
                  >
                    Finalize Connection &amp; Authenticate
                  </button>
                </motion.div>
              )}

              {/* STEP 7: ALL SYSTEMS ACTIVE */}
              {localStep === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{
                    display: 'inline-flex',
                    padding: '16px',
                    borderRadius: '50%',
                    background: 'rgba(78, 155, 120, 0.1)',
                    border: `1.5px solid ${T.sage}`,
                    color: T.sage,
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <UserCheck size={36} />
                    <Sparkles size={16} style={{ position: 'absolute', top: 0, right: 0, color: T.gold }} className="animate-bounce" />
                  </div>

                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Handshake Complete!
                  </h3>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px', maxWidth: '400px' }}>
                    Accounts successfully merged. Your financial workspaces are now cryptographically linked via secure ledger nodes. 
                  </p>

                  <div style={{
                    background: 'var(--bg-warm)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    width: '100%',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Status:</span>
                      <strong style={{ color: T.sage }}>🟢 Couple Verified</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Spouse / Partner:</span>
                      <strong style={{ color: 'var(--text)' }}>{partner2 || pName || 'Linked Partner'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Accounting Split:</span>
                      <strong style={{ color: 'var(--text)' }}>Consensus Multi-Locker Active</strong>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)',
                      border: '1px solid var(--gold-border)',
                      boxShadow: 'var(--sh-gold)',
                      width: '100%'
                    }}
                    onClick={handleUnlockWorkspace}
                  >
                    Enter Dynamic Shared Workspace →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* DYNAMIC BACKDROP STYLING FOR BLURRING */}
      <div style={{
        filter: isLocked ? 'blur(12px) saturate(30%)' : 'none',
        pointerEvents: isLocked ? 'none' : 'auto',
        userSelect: isLocked ? 'none' : 'auto',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        
        {/* NORMAL DASHBOARD CONTENT */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Logo size={20} showText={false} />
              {stage === 'Single' ? (
                <span className="stage-badge single">Single Stage</span>
              ) : stage === 'Committed' ? (
                <span className="stage-badge committed">Committed Stage</span>
              ) : (
                <span className="stage-badge married">Married Dynasty</span>
              )}
              <span>· {greet}</span>
            </div>
            <h1 className="page-title">
              {stage === 'Single' ? `${partner1 || 'Solo Builder'} ${emoji}` : `${partner1} & ${partner2} ${emoji}`}
            </h1>
            <p className="page-desc">
              Your wealth engine is calibrated for {region} · <strong>{mode}</strong> mode.
            </p>
          </div>
          
          {stage === 'Single' && (
            <button 
              className="btn-primary" 
              style={{ width: 'auto', background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, boxShadow: `0 6px 20px ${T.rose}30`, display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setIsUpgradingStage(true)}
            >
              <Heart size={16} /> Connect Partner Engine
            </button>
          )}
        </div>

        {/* Live Relationship Status Banner */}
        {stage !== 'Single' && partnerAccepted && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(78, 155, 120, 0.08) 0%, rgba(74, 140, 196, 0.08) 100%)',
            border: `1.5px solid ${T.sage}30`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--sh-xs)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.sage, boxShadow: `0 0 10px ${T.sage}` }} />
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.sage }}>
                  {stage === 'Married' ? 'Family Dynasty Verified' : 'Couple Workspace Active'}
                </span>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  🟢 {stage === 'Married' ? 'Spouse Verified' : 'Couple Verified'} · Distributed Portfolios Securely Linked
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 700, color: T.gold }}>
              <Sparkles size={14} className="animate-pulse" /> Verified Joint Engine
            </div>
          </div>
        )}

        {/* SINGLE DUAL-ENGINE PROMPT BLOCK */}
        {stage === 'Single' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(74, 140, 196, 0.08) 0%, rgba(124, 107, 190, 0.08) 100%)',
            border: '1px solid rgba(74, 140, 196, 0.2)',
            borderRadius: 'var(--r-lg)',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--sh-xs)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '480px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(74, 140, 196, 0.15)', color: T.sky }}>
                <Flame size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Sync Dual-Income Wealth Engines</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Add your partner to unlock joint planning, couple asset optimization splits, custom anniversary countdown trackers, and double your primary in-hand ledger power!
                </p>
              </div>
            </div>
            <button 
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 20px', background: T.sky, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.85rem' }}
              onClick={() => setIsUpgradingStage(true)}
            >
              Link Partner Ledger
            </button>
          </div>
        )}

        {/* STATS MATRIX */}
        <div className="stats-grid mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <StatCard cls="gold" icon="💰" label={stage === 'Single' ? "Solo Monthly Income" : "Combined Monthly Income"} value={cmpct(totalSalary)} sub={stage === 'Single' ? "Independent earnings" : "Shared dual-incomes"} />
          <StatCard cls="sage" icon="📈" label="Monthly Investment"  value={cmpct(snap.budget.investments)}               sub={`${Math.round(snap.presets.invest*100)}% savings rate`} />
          <StatCard cls="rose" icon="🛡️" label="Emergency Reserve"  value={cmpct(snap.budget.emergency)}                 sub="Monthly safety fund" />
          <StatCard cls="sky"  icon="⚡" label="Financial Score"     value={`${health.value}/100`}                        sub={health.label} />
          <StatCard cls="gold" icon="🏁" label="Milestone Saving"    value={fmt(mContribution)}                           sub="Active goal monthly total" />
        </div>

        <div className="grid-2 mb-20">
          <Card>
            <div className="card-title">Budget Allocation</div>
            <div className="card-heading">Income Distribution</div>
            <div className="card-sub">{stage === 'Single' ? "Solo budget splits calibrated live" : "Real-time split of combined family income"}</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData} innerRadius="55%" outerRadius="78%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {budgetData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={.82}/>)}
                  </Pie>
                  <Tooltip contentStyle={TT} formatter={v=>[fmt(v),'']}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {budgetData.map(d=>(
                <div key={d.name} className="legend-item">
                  <div className="legend-dot" style={{background:d.color}}/>{d.name}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="card-title">Asset Portfolio</div>
            <div className="card-heading">Investment Split</div>
            <div className="card-sub">Risk-weighted portfolio composition</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetData} layout="vertical" margin={{top:0,right:0,left:0,bottom:0}}>
                  <XAxis type="number" hide/>
                  <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false}
                    tick={{fontSize:12,fill:T.textMuted,fontWeight:500}}/>
                  <Tooltip contentStyle={TT} cursor={{fill:'transparent'}} formatter={v=>[cmpct(v),'']}/>
                  <Bar dataKey="value" radius={[0,6,6,0]}>
                    {assetData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={.85}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid-2">
          <Card gold>
            <div className="card-title">{stage === 'Single' ? "Solo Readiness Score" : "Shared Readiness Score"}</div>
            <div className="card-heading">Financial Health</div>
            <div className="health-ring-wrap">
              <div className="health-ring"
                style={{background:`conic-gradient(${scoreColor} ${deg}deg, var(--bg-muted) ${deg}deg)`}}>
                <div className="health-ring-inner">
                  <div className="health-score-num" style={{color:scoreColor}}>{health.value}</div>
                  <div className="health-score-unit">/ 100</div>
                </div>
              </div>
              <div className="health-label">{health.label}</div>
              <div className="health-tip">{health.tips[0]}</div>
            </div>
          </Card>

          <Card style={{ position: 'relative' }}>
            <div className="card-title">Monthly Snapshot</div>
            <div className="card-heading">Complete Flow</div>
            <div className="card-sub">Exact values — matches Excel "Clean View" column</div>
            {[
              {dot:T.sky,    label:'Essentials / Needs',    val:fmt(snap.budget.needs)},
              {dot:T.rose,   label:'Emergency / Safety',    val:fmt(snap.budget.emergency)},
              {dot:T.goldMid,label:'Investments (Total)',   val:fmt(snap.budget.investments)},
            ].map(r=>(
              <div key={r.label} className="alloc-row">
                <div className="alloc-name"><div className="alloc-dot" style={{background:r.dot}}/>{r.label}</div>
                <div className="alloc-amount">{r.val}</div>
              </div>
            ))}
            <div className="divider"/>
            <div className="section-label">Portfolio Composition</div>
            {[
              {dot:T.goldMid,label:`Equity · ${Math.round(snap.presets.equity*100)}%`,       val:fmt(snap.investmentSplit.equity)},
              {dot:T.sky,    label:`Debt · ${Math.round(snap.presets.debt*100)}%`,           val:fmt(snap.investmentSplit.debt)},
              {dot:T.sage,   label:`Commodities · ${Math.round(snap.presets.commodities*100)}%`,val:fmt(snap.investmentSplit.commodities)},
              {dot:T.violet, label:`Crypto · ${Math.round(snap.presets.crypto*100)}%`,       val:fmt(snap.investmentSplit.crypto)},
            ].map(r=>(
              <div key={r.label} className="alloc-row">
                <div className="alloc-name"><div className="alloc-dot" style={{background:r.dot}}/>{r.label}</div>
                <div className="alloc-amount">{r.val}</div>
              </div>
            ))}
            
            {/* Locks for Single / Committed stage previews on dynamic snapshot card */}
            {stage === 'Single' && (
              <div className="glass-lock-screen" style={{ borderRadius: 'var(--r-lg)' }}>
                <div className="lock-screen-inner">
                  <div className="lock-icon-glow">
                    <Heart size={20} className="animate-pulse" style={{ color: T.rose }} />
                  </div>
                  <h4 className="lock-title">Collaborative Analysis</h4>
                  <p className="lock-desc">Sync with a partner to unlock comprehensive combined snapshots, dual SIP structures, and dynastic goals.</p>
                  <button 
                    className="btn-primary" 
                    style={{ background: T.sky, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                    onClick={() => setIsUpgradingStage(true)}
                  >
                    Sync Partner Ledger
                  </button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="card-title">Future Assets</div>
            <div className="card-heading">Active Milestones</div>
            <div className="card-sub">Next life events and monthly savings</div>
            {milestones.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: '.85rem' }}>
                No active milestones. Start planning in the Milestone Planner.
              </div>
            ) : (
              [...milestones]
                .sort((a,b) => parseMilestoneDate(a.targetDate) - parseMilestoneDate(b.targetDate))
                .slice(0, 4)
                .map(m => {
                  const req = requiredMonthlySaving(m.targetCost, m.monthlySaved, m.targetDate);
                  const icons = { car: '🚗', house: '🏠', travel: '✈️', gadget: '💻', furniture: '🛋️', wedding: '💍', education: '🎓', other: '🏁' };
                  return (
                    <div key={m.id} className="alloc-row">
                      <div className="alloc-name">
                        <span style={{ fontSize: '1rem' }}>{icons[m.category] || '🏁'}</span>
                        <div>
                          <div>{m.name}</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--text-faint)', fontWeight: 600 }}>Target: {m.targetDate}</div>
                        </div>
                      </div>
                      <div className="alloc-right">
                         <div className="alloc-amount">{fmt(req)}</div>
                      </div>
                    </div>
                  );
                })
            )}
            <div className="divider" />
            <div className="alloc-row" style={{ border: 'none', background: 'var(--gold-pale)', borderRadius: 10, padding: '10px 12px' }}>
              <div className="alloc-name" style={{ fontWeight: 700 }}>Total Milestone Saving</div>
              <div className="alloc-amount" style={{ color: 'var(--gold-mid)' }}>{fmt(mContribution)}</div>
            </div>
          </Card>
        </div>

      </div>

      {/* DIALOG: SINGLE UPGRADE SELECTOR */}
      {isUpgradingStage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(5, 5, 8, 0.55)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="liquid-glass" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: 'var(--bg-card)', position: 'relative' }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
              Secure Partnership Upgrade
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '24px', textAlign: 'center' }}>
              Ready to link financial ledgers? Choose your partnership stage to configure identity &amp; initiate cryptographic synchronization:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => setSelectedUpgradeStage('Committed')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedUpgradeStage === 'Committed' ? T.rose : 'var(--border)'}`,
                  background: selectedUpgradeStage === 'Committed' ? 'rgba(208, 92, 114, 0.05)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💑</span>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: selectedUpgradeStage === 'Committed' ? T.rose : 'var(--text)' }}>Committed Partners</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Consolidate dual portfolios with romantic lifestyle targets.</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedUpgradeStage('Married')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedUpgradeStage === 'Married' ? T.gold : 'var(--border)'}`,
                  background: selectedUpgradeStage === 'Married' ? 'rgba(184, 144, 42, 0.05)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💍</span>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: selectedUpgradeStage === 'Married' ? T.gold : 'var(--text)' }}>Family Dynasty</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Multi-generation estate reserves &amp; child launchpads.</div>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 16px' }}
                onClick={() => setIsUpgradingStage(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2, padding: '10px 16px', background: selectedUpgradeStage === 'Married' ? T.gold : T.rose }}
                onClick={() => handleStageUpgrade(selectedUpgradeStage)}
              >
                Initiate Linkage Flow
              </button>
            </div>
            
            <button
              onClick={() => setIsUpgradingStage(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}