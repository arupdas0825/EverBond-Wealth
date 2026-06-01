import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { 
  User, Shield, Heart, Sparkles, Lock, ShieldAlert, Award, Copy, Check, 
  Eye, RefreshCw, Upload, Download, Moon, Sun, ChevronRight, Landmark,
  Globe, CreditCard, Key, Smartphone, FileText, ExternalLink, Trash2
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/finance';
import { useToast } from '../common/Toast';

class SettingsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SettingsErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fade-in" style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '18px', border: '1.5px solid var(--border)', margin: '20px auto', maxWidth: '500px' }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Settings Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Settings module is loading.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function SettingsPage({ setActivePolicyDoc }) {
  return (
    <SettingsErrorBoundary>
      <SettingsPageImpl setActivePolicyDoc={setActivePolicyDoc} />
    </SettingsErrorBoundary>
  );
}

function SettingsPageImpl({ setActivePolicyDoc }) {
  const store = useFinanceStore();
  const toast = useToast();
  const { 
    partner1, partner2, stage, region, mode, currency, 
    verificationStatus, partnerAccepted, onboardingCommitted = {}, theme,
    setProfile, setStage, setMindset, setTheme, reset, setVerificationState,
    everBondId, coupleId, familyId, connectionStatus, partnerEverBondId, disconnectPartner, initEverBondId
  } = store;

  // Initialize EverBond ID on mount
  useEffect(() => { initEverBondId(); }, []);

  // Local state edit fields
  const [nameInput, setNameInput] = useState(partner1 || '');
  const [partnerInput, setPartnerInput] = useState(partner2 || '');
  const [anniversaryInput, setAnniversaryInput] = useState(onboardingCommitted.anniversaryDate || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
  // Danger zone modals local state
  const [activeDangerModal, setActiveDangerModal] = useState(null); // 'onboarding' | 'clear' | 'new'

  const handleCopyId = () => {
    navigator.clipboard.writeText(everBondId);
    setCopiedId(true);
    toast.success('EverBond ID copied.');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfileChanges = () => {
    setProfile({
      partner1: nameInput.trim(),
      partner2: partnerInput.trim(),
      region,
      currency,
      stage
    });
    
    // Save Committed anniversary update if committed
    if (stage === 'Committed') {
      store.setOnboardingCommitted({
        name: nameInput.trim(),
        partnerName: partnerInput.trim(),
        anniversaryDate: anniversaryInput
      });
    }

    setIsEditingProfile(false);
  };

  const handleDisconnectPartner = () => {
    setShowDisconnectModal(true);
  };

  const confirmDisconnectPartner = () => {
    disconnectPartner();
    setShowDisconnectModal(false);
    toast.success('Connection removed.');
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `everbond_ledger_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Hydrate store dynamically
        useFinanceStore.setState(parsed);
        
        // Update local edits to match new store values
        setNameInput(parsed.partner1 || '');
        setPartnerInput(parsed.partner2 || '');
        setAnniversaryInput(parsed.onboardingCommitted?.anniversaryDate || '');
        
        alert('EverBond Wealth sovereign ledger database restored successfully!');
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid EverBond Wealth ledger backup.');
      }
    };
    reader.readAsText(file);
  };

  const executeDangerAction = () => {
    if (activeDangerModal === 'onboarding') {
      store.reset();
      useFinanceStore.setState({ onboardingComplete: false });
    } else if (activeDangerModal === 'clear') {
      store.reset();
      localStorage.removeItem('eb_v6');
      window.location.reload();
    } else if (activeDangerModal === 'new') {
      store.reset();
    }
    setActiveDangerModal(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="fade-in" style={{ position: 'relative', width: '100%' }}>
      
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">Financial Control Center</div>
          <h1 className="page-title">Platform <em>Settings</em></h1>
          <p className="page-desc">Calibrate personal parameters, visual themes, data encryption, and sync options.</p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      {/* ── Bento Settings Grid ── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="eb-settings-grid"
      >
        
        {/* ── SECTION 1: PROFILE BENTO (Double Width) ── */}
        <motion.div variants={itemVariants} className="span-8" style={{ minHeight: '260px' }}>
          <Card gold style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Profile Calibration</span>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Initials avatar bubble */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.7rem',
                fontWeight: 700,
                fontFamily: T.fontDisplay,
                boxShadow: 'var(--sh-gold)',
                border: '3px solid var(--bg-card)'
              }}>
                {(partner1 || 'S').slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                {isEditingProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="onb-input-glow" 
                      value={nameInput} 
                      onChange={e => setNameInput(e.target.value)} 
                      placeholder="Your Full Name"
                      style={{ fontSize: '0.9rem', padding: '10px 14px' }}
                    />
                    {stage !== 'Single' && (
                      <input 
                        type="text" 
                        className="onb-input-glow" 
                        value={partnerInput} 
                        onChange={e => setPartnerInput(e.target.value)} 
                        placeholder="Partner Name"
                        style={{ fontSize: '0.9rem', padding: '10px 14px' }}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>
                      {partner1 || 'Solo Builder'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', background: 'var(--bg-warm)', padding: '4px 10px', borderRadius: '100px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {stage} Workspace
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{region} · {currency}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Action Triggers */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-mid)', paddingTop: '16px', marginTop: '20px' }}>
              {isEditingProfile ? (
                <>
                  <button className="btn-reset" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button className="btn-primary" style={{ width: 'auto', padding: '6px 16px', background: T.gold }} onClick={handleSaveProfileChanges}>Save Changes</button>
                </>
              ) : (
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 18px', background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)', border: '1px solid var(--gold-border)' }} onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 2: RELATIONSHIP SETTINGS ── */}
        <motion.div variants={itemVariants} className="span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Relationship Node</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Current Stage:</span>
                <strong style={{ color: 'var(--text)' }}>{stage}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Connection:</span>
                <strong style={{ color: connectionStatus === 'connected' ? T.sage : connectionStatus === 'pending' ? T.goldMid : 'var(--text-faint)' }}>
                  {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'pending' ? '🟡 Pending' : '🔴 Not Connected'}
                </strong>
              </div>

              {stage !== 'Single' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Partner:</span>
                    <strong style={{ color: 'var(--text)' }}>{partner2 || 'Awaiting Link'}</strong>
                  </div>
                  {connectionStatus === 'connected' && partnerEverBondId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Partner ID:</span>
                      <strong style={{ fontFamily: 'monospace', color: T.gold, fontSize: '0.78rem' }}>{partnerEverBondId}</strong>
                    </div>
                  )}
                  {onboardingCommitted.anniversaryDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Anniversary:</span>
                      <strong style={{ color: 'var(--text)' }}>{onboardingCommitted.anniversaryDate}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              {connectionStatus === 'connected' ? (
                <button 
                  onClick={handleDisconnectPartner}
                  className="btn-primary" 
                  style={{ background: 'var(--rose-lt)', border: '1.5px solid var(--rose-border)', color: 'var(--rose)', fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  Disconnect Partner Node
                </button>
              ) : (
                <button 
                  onClick={() => alert('Navigate to the Partner page to connect your partner.')}
                  className="btn-primary" 
                  style={{ background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  Establish Connection
                </button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 2.5: EVERBOND PREMIUM IDENTITY CENTER (Full Width span-12) ── */}
        <motion.div variants={itemVariants} className="span-12">
          <Card gold style={{ position: 'relative', overflow: 'visible', padding: '24px 28px' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: T.gold,
              display: 'block',
              marginBottom: '14px'
            }}>
              EVERBOND IDENTITY CENTER
            </span>
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

        {/* ── SECTION 3: FINANCIAL PREFERENCES ── */}
        <motion.div variants={itemVariants} className="span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Financial Preferences</span>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Risk &amp; Preset Personality</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Conservative', 'Balanced', 'Aggressive'].map(r => (
                  <button
                    key={r}
                    onClick={() => setMindset(r)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1.5px solid ${mode === r ? T.gold : 'var(--border)'}`,
                      background: mode === r ? 'var(--gold-pale)' : 'transparent',
                      color: mode === r ? T.gold : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{r} Preset</span>
                    {mode === r && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 5: APPEARANCE PREVIEW (Double Width) ── */}
        <motion.div variants={itemVariants} className="span-8">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Appearance Theme</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
              {/* Light Card Preview */}
              <button 
                onClick={() => setTheme('light')}
                style={{
                  background: '#FAF6EE',
                  border: `2px solid ${theme === 'light' ? T.gold : 'rgba(26,23,20,.12)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1714' }}>Warm Beige Light</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme === 'light' ? T.gold : 'transparent', border: '1.5px solid #1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {theme === 'light' && <Check size={10} style={{ color: '#fff' }} />}
                  </div>
                </div>
                
                {/* Mini mockup items */}
                <div style={{ width: '100%', height: '40px', background: '#FFFFFF', borderRadius: '10px', marginTop: '16px', border: '1px solid rgba(0,0,0,.06)', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                  <div style={{ width: '30%', height: '4px', background: T.gold, borderRadius: '4px' }} />
                  <div style={{ width: '60%', height: '6px', background: '#1A1714', borderRadius: '4px' }} />
                </div>
              </button>

              {/* Dark Card Preview */}
              <button 
                onClick={() => setTheme('dark')}
                style={{
                  background: '#0D0D0D',
                  border: `2px solid ${theme === 'dark' ? T.gold : 'rgba(255,255,255,.08)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FAF6EE' }}>Deep Charcoal Dark</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme === 'dark' ? T.gold : 'transparent', border: '1.5px solid #FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {theme === 'dark' && <Check size={10} style={{ color: '#fff' }} />}
                  </div>
                </div>
                
                {/* Mini mockup items */}
                <div style={{ width: '100%', height: '40px', background: '#0A0A0A', borderRadius: '10px', marginTop: '16px', border: '1px solid rgba(255,255,255,.04)', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                  <div style={{ width: '30%', height: '4px', background: T.goldMid, borderRadius: '4px' }} />
                  <div style={{ width: '60%', height: '6px', background: '#FAF6EE', borderRadius: '4px' }} />
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 4: GOALS & JOURNEY ── */}
        <motion.div variants={itemVariants} className="span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Goals &amp; Milestones</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => {
                  const targetPageBtn = document.querySelector('button[title="Goals"]');
                  if (targetPageBtn) targetPageBtn.click();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '100px',
                  border: '1.5px solid var(--border-mid)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--sh-xs)'
                }}
              >
                <span>🎯 Manage Life Goals</span>
                <ChevronRight size={14} />
              </button>

              <button 
                onClick={() => {
                  const targetPageBtn = document.querySelector('button[title="Milestones"]');
                  if (targetPageBtn) targetPageBtn.click();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '100px',
                  border: '1.5px solid var(--border-mid)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--sh-xs)'
                }}
              >
                <span>📅 Edit Milestones Planner</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 6: DATA PORTABILITY (Double Width) ── */}
        <motion.div variants={itemVariants} className="span-8">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Data Portability</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Sovereign Database Backup</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Download a completely encrypted local JSON file containing your active assets, milestones, and presets.
                </p>
                
                <button 
                  onClick={handleExportData}
                  style={{
                    marginTop: '16px',
                    width: 'auto',
                    padding: '10px 18px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    border: 'none',
                    borderRadius: '100px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'var(--sh-gold)'
                  }}
                >
                  <Download size={14} /> Export Journey Ledger
                </button>
              </div>

              {/* Restore drag node */}
              <div style={{
                border: '1.5px dashed var(--border-str)',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                background: 'var(--bg-warm)',
                position: 'relative'
              }}>
                <Upload size={22} style={{ color: 'var(--text-faint)', marginBottom: '8px', display: 'block', margin: '0 auto' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Restore Database Ledger</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '10px' }}>Upload your .json backup packet</span>
                
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleRestoreData}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-mid)', paddingTop: '12px', marginTop: '16px', fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
              <Lock size={12} /> Future ready: 🔒 Cloud Ledger Sync (Zero-Knowledge Multi-Party Consolidation)
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 7: PRIVACY & ROADMAP ── */}
        <motion.div variants={itemVariants} className="span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Privacy &amp; Credentials</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Link Trust Status:</span>
                <strong style={{ color: verificationStatus === 'verified' ? T.sage : T.gold }}>
                  {verificationStatus === 'verified' ? 'Verified Consensus' : 'Acoustic Standard'}
                </strong>
              </div>

              <div style={{
                background: 'var(--bg-warm)',
                border: '1.5px solid var(--border-mid)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                opacity: 0.8
              }}>
                <span style={{ color: 'var(--text-muted)' }}>🔒 Biometric Face Sync</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>Roadmap</span>
              </div>
              <div style={{
                background: 'var(--bg-warm)',
                border: '1.5px solid var(--border-mid)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                opacity: 0.8
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{connectionStatus === 'connected' ? '💑 Verified Couple Badge' : '🔒 Verified Couple Badge'}</span>
                <span style={{ color: connectionStatus === 'connected' ? T.sage : T.gold, fontWeight: 700 }}>
                  {connectionStatus === 'connected' ? 'Active' : 'Roadmap'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 7.5: LEGAL & CONSENT ── */}
        <motion.div variants={itemVariants} className="span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '14px' }}>Legal &amp; Consent</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                onClick={() => setActivePolicyDoc('terms')}
                style={{
                  background: 'var(--bg-warm)',
                  border: '1.5px solid var(--border-mid)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Terms of Service</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>Review →</span>
              </div>

              <div 
                onClick={() => setActivePolicyDoc('privacy')}
                style={{
                  background: 'var(--bg-warm)',
                  border: '1.5px solid var(--border-mid)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Privacy Policy</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>Review →</span>
              </div>

              <div 
                onClick={() => setActivePolicyDoc('cookie')}
                style={{
                  background: 'var(--bg-warm)',
                  border: '1.5px solid var(--border-mid)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cookie Policy</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>Review →</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 8: ABOUT EVERBOND ── */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '12px' }}>About Ecosystem</span>
            
            <div>
              <Logo size={32} showText={true} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '14px', fontStyle: 'italic', fontFamily: T.fontDisplay }}>
                "Building a relationship-driven financial future."
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Created by <strong>Arup Das</strong> · Version 2.0</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://github.com/arupdas0825/EverBond-Wealth" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: 700, color: T.gold, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  GitHub <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── SECTION 9: DANGER ZONE ── */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid var(--rose-border)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose, display: 'block', marginBottom: '14px' }}>Danger Zone</span>
            
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '16px' }}>
              Actions here permanently delete your active cash flow assets, milestone goals, and calibrated income splits. Proceed with caution.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button 
                onClick={() => setActiveDangerModal('onboarding')}
                className="btn-primary" 
                style={{ flex: 1, minWidth: '120px', background: 'transparent', border: '1.5px solid var(--border-mid)', color: 'var(--text-muted)', fontSize: '0.74rem', padding: '8px 12px' }}
              >
                Reset Onboarding
              </button>
              <button 
                onClick={() => setActiveDangerModal('new')}
                className="btn-primary" 
                style={{ flex: 1, minWidth: '120px', background: 'transparent', border: '1.5px solid var(--rose-border)', color: 'var(--rose)', fontSize: '0.74rem', padding: '8px 12px' }}
              >
                Clear Active Ledger
              </button>
              <button 
                onClick={() => setActiveDangerModal('clear')}
                className="btn-primary" 
                style={{ flex: 1.2, minWidth: '130px', background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, fontSize: '0.74rem', padding: '8px 12px' }}
              >
                Reset Platform
              </button>
            </div>
          </Card>
        </motion.div>

      </motion.div>

      {/* ── High-Fidelity Custom Confirmation Modals ── */}
      <AnimatePresence>
        {activeDangerModal && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4000,
              background: theme === 'dark' ? 'rgba(13, 13, 13, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setActiveDangerModal(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="liquid-glass"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                boxShadow: 'var(--sh-lg)',
                borderRadius: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--rose-lt)',
                border: '1px solid var(--rose-border)',
                color: 'var(--rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Trash2 size={24} />
              </div>

              <h3 style={{ 
                fontFamily: T.fontDisplay, 
                fontSize: '1.6rem', 
                fontWeight: 700, 
                color: 'var(--text)', 
                marginBottom: '12px' 
              }}>
                {activeDangerModal === 'onboarding' && "Reset Onboarding Stage"}
                {activeDangerModal === 'clear' && "Reset EverBond Workspace"}
                {activeDangerModal === 'new' && "Clear Ledger Data"}
              </h3>
              
              <p style={{ 
                fontSize: '0.88rem', 
                color: 'var(--text-muted)', 
                lineHeight: 1.5, 
                marginBottom: '28px',
                padding: '0 8px'
              }}>
                {activeDangerModal === 'onboarding' && "This will wipe your active profile and return you to the launchpad onboarding screen."}
                {activeDangerModal === 'clear' && "This action will remove all locally stored financial data, partner connections, goals, simulations and preferences. This cannot be undone."}
                {activeDangerModal === 'new' && "This will restore goals, milestones, and salary parameters back to solo defaults."}
              </p>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                <button 
                  className="btn-secondary" 
                  style={{ 
                    flex: 1, 
                    padding: '12px 20px', 
                    borderRadius: T.radiusPill, 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--border-mid)'
                  }}
                  onClick={() => setActiveDangerModal(null)}
                >
                  Keep My Data
                </button>
                <motion.button 
                  className="btn-primary" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    flex: 1.2, 
                    padding: '12px 20px', 
                    borderRadius: T.radiusPill, 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #e05c72 0%, #b33951 100%)',
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(208, 92, 114, 0.25)',
                    cursor: 'pointer'
                  }}
                  onClick={executeDangerAction}
                >
                  {activeDangerModal === 'clear' ? "Reset Everything" : "Confirm & Delete"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Disconnect Confirmation Modal ── */}
      <AnimatePresence>
        {showDisconnectModal && (
          <div 
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
            onClick={(e) => { if (e.target === e.currentTarget) setShowDisconnectModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="liquid-glass"
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '32px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--rose-border)',
                boxShadow: '0 20px 50px rgba(208, 92, 114, 0.15)',
                borderRadius: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--rose-lt, rgba(208,92,114,0.1))',
                border: '1px solid var(--rose-border)',
                color: 'var(--rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ShieldAlert size={24} />
              </div>

              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Disconnect Partner?
              </h3>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
                Are you sure you want to disconnect? This will remove access to shared planning features.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-pill)', fontSize: '0.82rem', fontWeight: 700 }}
                  onClick={() => setShowDisconnectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  style={{ 
                    flex: 1.2, 
                    padding: '12px', 
                    borderRadius: 'var(--r-pill)', 
                    fontSize: '0.82rem', 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`,
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(208,92,114,0.25)',
                    cursor: 'pointer'
                  }}
                  onClick={confirmDisconnectPartner}
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
