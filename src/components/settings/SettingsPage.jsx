import React, { useState } from 'react';
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

export function SettingsPage() {
  const store = useFinanceStore();
  const { 
    partner1, partner2, stage, region, mode, currency, 
    verificationStatus, partnerAccepted, onboardingCommitted,
    setProfile, setStage, setMindset, setTheme, reset, setVerificationState
  } = store;

  // Local state edit fields
  const [nameInput, setNameInput] = useState(partner1 || '');
  const [partnerInput, setPartnerInput] = useState(partner2 || '');
  const [anniversaryInput, setAnniversaryInput] = useState(onboardingCommitted.anniversaryDate || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [customId] = useState(() => `EB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  
  // Danger zone modals local state
  const [activeDangerModal, setActiveDangerModal] = useState(null); // 'onboarding' | 'clear' | 'new'

  const handleCopyId = () => {
    navigator.clipboard.writeText(customId);
    setCopiedId(true);
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
    if (window.confirm(`Are you sure you want to disconnect from ${partner2 || 'your partner'}? This will reset all shared lockers.`)) {
      setVerificationState({
        partnerAccepted: false,
        partnerLinked: false,
        verificationStatus: 'unverified',
        invitationCode: '',
        partner2: '',
        partnerName: ''
      });
    }
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
                border: '3px solid #fff'
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

            {/* Cryptographic EverBond ID */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-mid)', paddingTop: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={14} style={{ color: T.gold }} />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sovereign EverBond ID:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: 'var(--text)' }}>{customId}</strong>
                <button 
                  onClick={handleCopyId}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: copiedId ? T.sage : 'var(--text-faint)', display: 'flex', alignItems: 'center' }}
                  title="Copy security ID"
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
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
                <span style={{ color: 'var(--text-faint)' }}>Linkage Status:</span>
                <strong style={{ color: partnerAccepted ? T.sage : 'var(--text-faint)' }}>
                  {partnerAccepted ? '🟢 Connected' : '🔴 Inactive'}
                </strong>
              </div>

              {stage !== 'Single' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Partner:</span>
                    <strong style={{ color: 'var(--text)' }}>{partner2 || 'Awaiting Link'}</strong>
                  </div>
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
              {partnerAccepted ? (
                <button 
                  onClick={handleDisconnectPartner}
                  className="btn-primary" 
                  style={{ background: 'var(--rose-lt)', border: '1.5px solid var(--rose-border)', color: 'var(--rose)', fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  Disconnect Partner Node
                </button>
              ) : (
                <button 
                  onClick={() => alert('Use the Link Partner Ledger widget on the Dashboard to select Committed/Married parameters and initiate connection handshake.')}
                  className="btn-primary" 
                  style={{ background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  Establish Connection
                </button>
              )}
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
                <span style={{ color: 'var(--text-muted)' }}>🔒 Verified Couple Badge</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>Roadmap</span>
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
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(5, 5, 8, 0.65)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="liquid-glass"
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '32px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--rose-border)',
                boxShadow: 'var(--sh-lg)',
                borderRadius: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--rose-lt)',
                color: 'var(--rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: 'var(--sh-xs)'
              }}>
                <ShieldAlert size={22} />
              </div>

              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Are you absolutely sure?
              </h3>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '24px' }}>
                {activeDangerModal === 'onboarding' && "This will wipe your active profile and return you to the launchpad onboarding screen."}
                {activeDangerModal === 'clear' && "This will completely delete all locally cached database ledger indexes and re-initialize the app."}
                {activeDangerModal === 'new' && "This will restore goals, milestones, and salary parameters back to solo defaults."}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => setActiveDangerModal(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1.2, padding: '10px', background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)` }}
                  onClick={executeDangerAction}
                >
                  Confirm &amp; Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
