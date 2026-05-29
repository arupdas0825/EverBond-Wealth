import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldCheck, Scan, KeyRound, Sparkles, Check, ChevronRight, RefreshCw, Smartphone } from 'lucide-react';
import { T } from '../../theme/tokens';

export function FutureVerification() {
  const [activeTab, setActiveTab] = useState('selfie');
  
  // Selfie simulation state
  const [uploading, setUploading] = useState(false);
  const [selfieStatus, setSelfieStatus] = useState('idle'); // 'idle' | 'analyzing' | 'success'
  const [scanProgress, setScanProgress] = useState(0);

  // Face scanning simulation
  const [scanning, setScanning] = useState(false);
  const [faceMatch, setFaceMatch] = useState(null);

  // Digital credential generation
  const [loadingCred, setLoadingCred] = useState(false);
  const [credIssued, setCredIssued] = useState(false);

  const simulateSelfieUpload = () => {
    setSelfieStatus('analyzing');
    setUploading(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSelfieStatus('success');
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const simulateFaceScan = () => {
    setScanning(true);
    setFaceMatch(null);
    setTimeout(() => {
      setScanning(false);
      setFaceMatch(99.4);
    }, 2000);
  };

  const simulateCredIssue = () => {
    setLoadingCred(true);
    setTimeout(() => {
      setLoadingCred(false);
      setCredIssued(true);
    }, 1500);
  };

  const resetAll = () => {
    setSelfieStatus('idle');
    setUploading(false);
    setScanProgress(0);
    setScanning(false);
    setFaceMatch(null);
    setLoadingCred(false);
    setCredIssued(false);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--r-lg)',
      padding: '24px',
      marginTop: '20px',
      boxShadow: 'var(--sh-xs)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(184, 144, 42, 0.08) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sparkles size={16} style={{ color: T.goldMid }} className="animate-pulse" />
        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.goldMid }}>
          Future Architecture Preview
        </span>
      </div>

      <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.45rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
        Trust &amp; Verification Protocol
      </h3>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '20px' }}>
        Secure multi-party financial workspaces require absolute cryptographic validation. Interact with our modular future proofing nodes.
      </p>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-warm)',
        border: '1.5px solid var(--border)',
        borderRadius: '12px',
        padding: '3px',
        gap: '2px',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'selfie', icon: <Camera size={14} />, label: 'Selfie' },
          { id: 'badge', icon: <ShieldCheck size={14} />, label: 'Badge' },
          { id: 'face', icon: <Scan size={14} />, label: 'Face Scan' },
          { id: 'auth', icon: <KeyRound size={14} />, label: 'Auth Node' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '9px',
              background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.id ? T.gold : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? 'var(--sh-xs)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Workspace Container */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SELFIE VERIFICATION */}
          {activeTab === 'selfie' && (
            <motion.div
              key="selfie-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(74, 140, 196, 0.1)', color: T.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Camera size={20} />
              </div>
              
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Couple Selfie Verification</h4>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.4, marginBottom: '16px' }}>
                Joint portrait validation matches biological markers on the distributed ledger to unlock shared high-volume assets.
              </p>

              {selfieStatus === 'idle' && (
                <button
                  className="btn-primary"
                  style={{ background: T.sky, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={simulateSelfieUpload}
                >
                  Simulate Selfie Validation
                </button>
              )}

              {selfieStatus === 'analyzing' && (
                <div style={{ width: '100%', maxWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: T.sky, marginBottom: '6px' }}>
                    <span className="animate-pulse">Extracting Joint Vectors...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${scanProgress}%`, height: '100%', background: T.sky, transition: 'width 0.15s ease' }} />
                  </div>
                </div>
              )}

              {selfieStatus === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(78, 155, 120, 0.1)', borderRadius: '100px', border: `1.5px solid ${T.sage}`, color: T.sage, fontSize: '0.72rem', fontWeight: 700, alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <Check size={12} strokeWidth={3} /> Vector Matching Perfect (99.8%)
                  </div>
                  <button
                    onClick={resetAll}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Reset Simulation
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: SHARED VERIFICATION BADGE */}
          {activeTab === 'badge' && (
            <motion.div
              key="badge-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-pale) 0%, rgba(184, 144, 42, 0.15) 100%)',
                border: '1.5px solid var(--gold-border)',
                color: T.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: 'var(--sh-gold)',
                position: 'relative'
              }}>
                <ShieldCheck size={28} />
                <Sparkles size={14} style={{ position: 'absolute', top: -2, right: -2, color: T.gold }} className="animate-bounce" />
              </div>
              
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Shared Verification Badge</h4>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.4, marginBottom: '16px' }}>
                Establishes a public cryptographic trust badge proving linked ledger validation. Embeddable on digital financial passports.
              </p>

              <div style={{
                background: 'var(--gold-pale)',
                border: '1px solid var(--gold-border)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                color: T.gold,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✦ EVERBOND CERTIFIED TRUST VECTOR ✦
              </div>
            </motion.div>
          )}

          {/* TAB 3: FACE VERIFICATION */}
          {activeTab === 'face' && (
            <motion.div
              key="face-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                border: '2px solid rgba(184, 144, 42, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                overflow: 'hidden',
                background: 'var(--bg-warm)'
              }}>
                {scanning && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--gold-mid), transparent)',
                    boxShadow: '0 0 8px var(--gold-mid)',
                    animation: 'laserSweep 1.5s ease-in-out infinite alternate',
                    zIndex: 2
                  }} />
                )}
                <Scan size={36} style={{ color: scanning ? T.gold : 'var(--text-faint)', transition: 'all 0.3s' }} className={scanning ? 'animate-pulse' : ''} />
              </div>
              
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Face Verification Mesh</h4>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.4, marginBottom: '16px' }}>
                Secure 3D spatial mapping matches multi-dimensional nodes of both individuals to perform zero-knowledge proof authentication.
              </p>

              {!scanning && faceMatch === null && (
                <button
                  className="btn-primary"
                  style={{ background: T.gold, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={simulateFaceScan}
                >
                  Initiate 3D Mesh Calibration
                </button>
              )}

              {scanning && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.gold }} className="animate-pulse">
                  Sweeping facial coordinates...
                </span>
              )}

              {faceMatch !== null && !scanning && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(78, 155, 120, 0.1)', borderRadius: '100px', border: `1.5px solid ${T.sage}`, color: T.sage, fontSize: '0.72rem', fontWeight: 700, alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <Check size={12} strokeWidth={3} /> Spatial Handshake Validated ({faceMatch}%)
                  </div>
                  <button
                    onClick={resetAll}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Recalibrate Scan
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: RELATIONSHIP AUTHENTICATION */}
          {activeTab === 'auth' && (
            <motion.div
              key="auth-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124, 107, 190, 0.1)', color: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <KeyRound size={20} />
              </div>
              
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Distributed Authentication Node</h4>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.4, marginBottom: '16px' }}>
                Generates a zero-trust encrypted estate key, guaranteeing joint ownership credentials over future multi-generational assets.
              </p>

              {!credIssued && !loadingCred && (
                <button
                  className="btn-primary"
                  style={{ background: T.violet, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={simulateCredIssue}
                >
                  Generate Estate Credentials
                </button>
              )}

              {loadingCred && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 700, color: T.violet }} className="animate-pulse">
                  <RefreshCw size={12} className="animate-spin" /> Mining Cryptographic Credential Node...
                </div>
              )}

              {credIssued && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.85)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#62ca98',
                    textAlign: 'left',
                    width: '100%',
                    maxWidth: '300px',
                    marginBottom: '12px'
                  }}>
                    <div>&gt; ISSUING KEY PAIR: SUCCESS</div>
                    <div>&gt; DID: eb-cpl:joint-rel:9f8e7d2c</div>
                    <div style={{ color: T.gold }}>&gt; SHIELD PROTOCOL SECURED</div>
                  </div>
                  <button
                    onClick={resetAll}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Revoke &amp; Reissue Keys
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '16px' }}>
        <Smartphone size={12} />
        <span>Hardware validation vectors linked to mobile hardware keys.</span>
      </div>
    </div>
  );
}
