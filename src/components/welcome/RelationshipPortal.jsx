import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Heart, Upload, Cpu, ShieldCheck, CheckCircle, Sparkles, Send, Link, Zap } from 'lucide-react';
import { T } from '../../theme/tokens';

export function RelationshipPortal({ isOpen, onClose }) {
  const { 
    stage,
    invitationAccepted,
    selfieUploaded,
    selfieUrl,
    accountsConnected,
    relationshipVerified,
    onboardingCommitted,
    setOnboardingCommitted,
    setVerificationState,
    setStage,
    partner1,
    setProfile
  } = useFinanceStore();

  const [activeStep, setActiveStep] = useState(1);
  const [partnerName, setPartnerName] = useState(onboardingCommitted.partnerName || '');
  const [anniversary, setAnniversary] = useState(onboardingCommitted.anniversaryDate || '');
  const [loadingText, setLoadingText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanPercentage, setScanPercentage] = useState(0);

  if (!isOpen) return null;

  const handleSendInvite = () => {
    if (!partnerName.trim()) return;
    setIsProcessing(true);
    setLoadingText('Broadcasting invitation packet via secure ledger protocol...');
    
    setTimeout(() => {
      setLoadingText('Awaiting handshake response from partner terminal...');
      setTimeout(() => {
        setVerificationState({
          invitationAccepted: true,
          partner2: partnerName.trim()
        });
        setOnboardingCommitted({ partnerName: partnerName.trim(), anniversaryDate: anniversary });
        setIsProcessing(false);
        setLoadingText('');
        setActiveStep(2);
      }, 1500);
    }, 1200);
  };

  const handleConnectAccounts = () => {
    setIsProcessing(true);
    setLoadingText('Initializing encrypted ledger handshake...');
    
    setTimeout(() => {
      setLoadingText('Syncing distributed assets and asset split matrix...');
      setTimeout(() => {
        setVerificationState({ accountsConnected: true });
        setIsProcessing(false);
        setLoadingText('');
        setActiveStep(3);
      }, 1500);
    }, 1200);
  };

  const handleDemoSelfie = () => {
    setIsProcessing(true);
    setLoadingText('Processing premium demo couple portrait...');
    
    setTimeout(() => {
      setVerificationState({
        selfieUploaded: true,
        selfieUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop'
      });
      setIsProcessing(false);
      setLoadingText('');
      setActiveStep(4);
    }, 1200);
  };

  const handleBiometricVerify = () => {
    setIsProcessing(true);
    setScanPercentage(0);
    
    const interval = setInterval(() => {
      setScanPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setVerificationState({ relationshipVerified: true });
          // Elevate relationship status!
          setStage('Committed');
          setProfile({
            partner1: partner1 || 'Single Builder',
            partner2: partnerName || onboardingCommitted.partnerName || 'Beloved',
            stage: 'Committed',
            p1Salary: 120000,
            p2Salary: 85000
          });
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 5, 8, 0.55)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4 }}
        className="liquid-glass"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '36px',
          position: 'relative',
          background: 'var(--onb-bg-card)',
          overflow: 'hidden',
        }}
      >
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '30%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(208, 92, 114, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        {/* Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: activeStep === s ? T.rose : activeStep > s ? 'var(--sage-lt)' : 'var(--onb-border)',
                border: `1.5px solid ${activeStep === s ? T.rose : activeStep > s ? T.sage : 'var(--onb-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: activeStep === s ? '#fff' : activeStep > s ? T.sage : 'var(--onb-back)',
                boxShadow: activeStep === s ? `0 0 12px ${T.rose}60` : 'none',
                transition: 'all 0.3s ease',
              }}>
                {activeStep > s ? '✓' : s}
              </div>
              {s < 4 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  background: activeStep > s ? T.sage : 'var(--onb-border)',
                  alignSelf: 'center',
                }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: PARTNER INVITE */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '16px', background: `${T.rose}15`, border: `1px solid ${T.rose}30`, marginBottom: '18px', color: T.rose }}>
                <Heart size={24} className="animate-pulse" />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 600, marginBottom: '8px' }}>
                Secure Partnership Handshake
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--onb-desc)', marginBottom: '24px', lineHeight: 1.5 }}>
                Initiate the dual-wealth matrix. Send an encrypted cryptographic invitation link to your partner's ledger node.
              </p>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--onb-label)', display: 'block', marginBottom: '6px' }}>Partner's Legal Name</label>
                  <input
                    type="text"
                    className="onb-input-glow"
                    placeholder="Enter partner name..."
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--onb-label)', display: 'block', marginBottom: '6px' }}>Special Anniversary (Optional)</label>
                  <input
                    type="date"
                    className="onb-input-glow"
                    value={anniversary}
                    onChange={e => setAnniversary(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, boxShadow: `0 6px 20px ${T.rose}40`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleSendInvite}
                disabled={isProcessing || !partnerName.trim()}
              >
                {isProcessing ? (
                  <>
                    <Zap size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Secure Invitation
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 2: LINK LEDGERS */}
          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '16px', background: 'rgba(74, 140, 196, 0.15)', border: '1px solid rgba(74, 140, 196, 0.30)', marginBottom: '18px', color: '#4a8cc4' }}>
                <Cpu size={24} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 600, marginBottom: '8px' }}>
                Establish Ledger Link
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--onb-desc)', marginBottom: '24px', lineHeight: 1.5 }}>
                Syncing asset matrices. Connect both portfolios to compile combined engine capacity.
              </p>

              <div style={{
                background: 'rgba(0, 0, 0, 0.72)',
                border: '1px solid var(--onb-border)',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                textAlign: 'left',
                color: '#62ca98',
                marginBottom: '24px',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: 'var(--onb-desc)', marginBottom: '4px' }}>&gt; INITIATING SYNC PROTOCOL</div>
                  <div>&gt; PARTNER HANDSHAKE COMPLETE: verified via {partnerName} terminal</div>
                  {isProcessing && <div style={{ color: T.rose }} className="animate-pulse">&gt; {loadingText}</div>}
                  {!isProcessing && <div style={{ color: '#62ca98' }}>&gt; READY TO MERGE ACCOUNTS</div>}
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #4a8cc4 0%, #2f6594 100%)', boxShadow: '0 6px 20px rgba(74, 140, 196, 0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleConnectAccounts}
                disabled={isProcessing}
              >
                {isProcessing ? 'Merging Assets...' : 'Link Financial Ledgers'}
              </button>
            </motion.div>
          )}

          {/* STEP 3: PORTRAIT UPLOAD */}
          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '16px', background: 'rgba(124, 107, 190, 0.15)', border: '1px solid rgba(124, 107, 190, 0.30)', marginBottom: '18px', color: '#7c6bbe' }}>
                <Upload size={24} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 600, marginBottom: '8px' }}>
                Upload Couple Selfie
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--onb-desc)', marginBottom: '24px', lineHeight: 1.5 }}>
                Provide a portrait containing both individuals. Our biometric scanner will extract joint facial vectors to encrypt the partnership locker.
              </p>

              <div style={{
                border: '2px dashed var(--onb-border)',
                borderRadius: '16px',
                padding: '32px 20px',
                background: 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
              }}
              onClick={handleDemoSelfie}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--onb-border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  📸
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--onb-title)' }}>Click to select files</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--onb-desc)', marginTop: '4px' }}>PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--onb-desc)', marginBottom: '24px' }}>
                — OR —
              </div>

              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #7c6bbe 0%, #52448a 100%)', boxShadow: '0 6px 20px rgba(124, 107, 190, 0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleDemoSelfie}
                disabled={isProcessing}
              >
                {isProcessing ? 'Decrypting...' : 'Generate Demo Couple Selfie'}
              </button>
            </motion.div>
          )}

          {/* STEP 4: SCANNER & VERIFIED */}
          {activeStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {!relationshipVerified ? (
                <>
                  <div className="biometric-scan-container">
                    <div className="biometric-scanner-ring" />
                    {isProcessing && <div className="biometric-laser" />}
                    <img 
                      src={selfieUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300'} 
                      alt="Couple Portrait" 
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 600, marginBottom: '8px' }}>
                    Biometric Face Scan
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--onb-desc)', marginBottom: '24px', lineHeight: 1.5 }}>
                    Scanning nodes and mapping couples synchronization density vectors.
                  </p>

                  {isProcessing && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: T.gold, marginBottom: '8px' }}>
                        {scanPercentage}% SCANNED
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--onb-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${scanPercentage}%`, height: '100%', background: T.gold, transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    style={{ background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`, boxShadow: 'var(--sh-gold)', width: '100%' }}
                    onClick={handleBiometricVerify}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Verifying Vectors...' : 'Initiate Verification Scan'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'inline-flex',
                    padding: '16px',
                    borderRadius: '50%',
                    background: 'rgba(62, 142, 104, 0.15)',
                    border: `1px solid ${T.sage}`,
                    color: T.sage,
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <CheckCircle size={44} />
                    <Sparkles size={18} style={{ position: 'absolute', top: 0, right: 0, color: T.gold }} className="animate-bounce" />
                  </div>

                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', fontWeight: 700, color: 'var(--onb-title)', marginBottom: '12px' }}>
                    Relationship Verified!
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--onb-desc)', marginBottom: '32px', lineHeight: 1.6 }}>
                    Handshake complete. Your financial souls are now cryptographically linked. Welcome to the **Committed Stage** of EverBond Wealth. Dual-Engine Activated!
                  </p>

                  <button
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)', border: '1px solid var(--gold-border)', boxShadow: 'var(--sh-gold)', width: '100%' }}
                    onClick={onClose}
                  >
                    Enter Dynamic Shared Workspace →
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button */}
        {!isProcessing && !relationshipVerified && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--onb-back)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 500
            }}
          >
            ✕
          </button>
        )}
      </motion.div>
    </div>
  );
}
