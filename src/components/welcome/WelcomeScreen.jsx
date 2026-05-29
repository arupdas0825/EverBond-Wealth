import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import { CURRENCIES, REGIONS } from '../../constants/presets';
import { Heart, Sparkles, User, Shield, Compass, TrendingUp, Award, Clock } from 'lucide-react';
import { T } from '../../theme/tokens';

const DREAM_GOALS = [
  { key: 'home', label: 'Buy a Home', icon: '🏡', desc: 'Secure your dream property asset' },
  { key: 'retirement', label: 'Early Retirement', icon: '🌅', desc: 'Reach financial sovereignty' },
  { key: 'vacation', label: 'Dream Vacation', icon: '✈️', desc: 'Explore global destinations together' },
  { key: 'freedom', label: 'Financial Freedom', icon: '💸', desc: 'Break away from income constraints' },
  { key: 'wedding', label: 'Wedding Planning', icon: '💍', desc: 'Celebrate committed partnership' },
  { key: 'child', label: 'Child Future Planning', icon: '🎓', desc: 'Provide superior education & launchpad' }
];

export function WelcomeScreen() {
  const {
    stage, setStage,
    mindset, setMindset,
    dreamGoals, setDreamGoals,
    onboardingSingle, setOnboardingSingle,
    onboardingCommitted, setOnboardingCommitted,
    onboardingMarried, setOnboardingMarried,
    setProfile,
    reset
  } = useFinanceStore();

  const [step, setStep] = useState(0);
  const [particles, setParticles] = useState([]);
  
  // Local state during welcome flow
  const [currency, setLocalCurrency] = useState('INR');
  const [region, setLocalRegion] = useState('India');
  
  // Loading calibration sequence logs
  const [calibrationLogs, setCalibrationLogs] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  // Generate cinematic floating particles on load
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 10}s`,
      size: `${2 + Math.random() * 5}px`
    }));
    setParticles(generated);
  }, []);

  // Step 6: Wealth engine calibration logs
  const logSequence = [
    { text: 'Initializing EverBond cryptographic ledger node...', type: 'info' },
    { text: `Configuring primary region to ${region} · System Currency: ${currency}`, type: 'info' },
    { text: `Aligning risk management profile with ${mindset} mindset...`, type: 'info' },
    { text: 'Synthesizing dynamic asset allocation coefficients...', type: 'info' },
    { text: 'Calibrating multi-horizon compound yield algorithms...', type: 'info' },
    { text: 'Compiling timeline projections & active milestones...', type: 'info' },
    { text: 'EVERBOND WEALTH MATRIX ENGAGED. Ready for liftoff.', type: 'success' }
  ];

  useEffect(() => {
    if (step === 6) {
      setCurrentLogIndex(0);
      setCalibrationLogs([]);
    }
  }, [step]);

  useEffect(() => {
    if (step === 6 && currentLogIndex < logSequence.length) {
      const timer = setTimeout(() => {
        setCalibrationLogs(prev => [...prev, logSequence[currentLogIndex]]);
        setCurrentLogIndex(prev => prev + 1);
      }, currentLogIndex === logSequence.length - 1 ? 1200 : 700);
      return () => clearTimeout(timer);
    } else if (step === 6 && currentLogIndex === logSequence.length) {
      const timer = setTimeout(() => {
        // Complete Onboarding & Save
        let finalPartner1 = '';
        let finalPartner2 = '';
        let p1Salary = 100000;
        let p2Salary = 0;

        if (stage === 'Single') {
          finalPartner1 = onboardingSingle.name || 'Single Builder';
          p1Salary = parseFloat(onboardingSingle.income) || 100000;
        } else if (stage === 'Committed') {
          finalPartner1 = onboardingCommitted.name || 'Partner 1';
          finalPartner2 = onboardingCommitted.partnerName || 'Partner 2';
          p1Salary = 100000;
          p2Salary = 80000;
        } else {
          finalPartner1 = onboardingMarried.spouseName ? 'Dynasty Head' : 'Spouse 1';
          finalPartner2 = onboardingMarried.spouseName || 'Spouse 2';
          p1Salary = 150000;
          p2Salary = 120000;
        }

        setProfile({
          partner1: finalPartner1,
          partner2: finalPartner2,
          region,
          currency,
          stage,
          p1Salary,
          p2Salary
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, currentLogIndex]);

  // Determine stage glow background
  const getGlowColor = () => {
    if (step === 0) return 'rgba(184, 144, 42, 0.1)';
    if (stage === 'Single') return 'rgba(74, 140, 196, 0.14)';
    if (stage === 'Committed') return 'rgba(208, 92, 114, 0.14)';
    return 'rgba(184, 144, 42, 0.14)';
  };

  const handleGoalToggle = (key) => {
    if (dreamGoals.includes(key)) {
      setDreamGoals(dreamGoals.filter(g => g !== key));
    } else {
      setDreamGoals([...dreamGoals, key]);
    }
  };

  return (
    <div className="onboarding-wrap">
      {/* Background Cinematic Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="cinematic-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            background: stage === 'Committed' ? T.rose : stage === 'Single' ? T.sky : T.goldMid
          }}
        />
      ))}

      {/* Dynamic Background Glows */}
      <div 
        className="onboarding-bg-glow" 
        style={{
          width: '700px',
          height: '700px',
          background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
          top: '-150px',
          right: '-100px',
        }} 
      />
      <div 
        className="onboarding-bg-glow" 
        style={{
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${stage === 'Committed' ? 'rgba(112, 89, 180, 0.1)' : 'rgba(74, 140, 196, 0.08)'} 0%, transparent 70%)`,
          bottom: '-100px',
          left: '-100px',
        }} 
      />

      <div style={{ width: '100%', maxWidth: step === 0 ? '560px' : '640px', position: 'relative', zIndex: 1 }}>
        
        {/* Logo anchor - keeping current logo EXACTLY the same */}
        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Logo size={42} showText={true} />
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 0: CINEMATIC INTRO */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="liquid-glass text-center"
              style={{ 
                padding: '56px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <Logo size={78} showText={false} />
              </div>
              <h1 style={{
                fontFamily: T.fontDisplay,
                fontSize: '3.4rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--onb-title)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                EverBond <em style={{ fontStyle: 'italic', color: T.goldMid }}>Wealth</em>
              </h1>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--onb-desc)',
                lineHeight: 1.6,
                maxWidth: '420px',
                margin: '0 auto 40px',
                textAlign: 'center'
              }}>
                Your financial journey through every stage of life. A futuristic financial companion that grows with your relationship.
              </p>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 12px 30px rgba(184, 144, 42, 0.45)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="btn-primary"
                style={{
                  display: 'block',
                  margin: '0 auto',
                  maxWidth: '280px',
                  fontSize: '1rem',
                  padding: '16px 32px',
                  borderRadius: T.radius,
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`
                }}
              >
                Start Your Journey
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: RELATIONSHIP STAGE SELECTION */}
          {step === 1 && (
            <motion.div
              key="stage-selection"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-32">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Stage selection</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  Where are you in your life journey?
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                
                {/* SINGLE CARD */}
                <div 
                  className={`onb-card-option stage-single ${stage === 'Single' ? 'selected' : ''}`}
                  onClick={() => setStage('Single')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <span className="onb-card-icon">⚡</span>
                    <div>
                      <h3 className="onb-card-title">Single</h3>
                      <p className="onb-card-desc">Building my future independently. Focus on solo growth, career compounding, and sovereign freedom.</p>
                    </div>
                  </div>
                </div>

                {/* COMMITTED CARD */}
                <div 
                  className={`onb-card-option stage-committed ${stage === 'Committed' ? 'selected' : ''}`}
                  onClick={() => setStage('Committed')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <span className="onb-card-icon">💑</span>
                    <div>
                      <h3 className="onb-card-title">Committed</h3>
                      <p className="onb-card-desc">Planning a future together. Dual-income wealth engines, collaborative budgeting, and romantic targets.</p>
                    </div>
                  </div>
                </div>

                {/* MARRIED CARD */}
                <div 
                  className={`onb-card-option stage-married ${stage === 'Married' ? 'selected' : ''}`}
                  onClick={() => setStage('Married')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <span className="onb-card-icon">💍</span>
                    <div>
                      <h3 className="onb-card-title">Married</h3>
                      <p className="onb-card-desc">Growing wealth as a family. Multi-generation safety cushions, child launching pads, and dynamic security.</p>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(0)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {step === 2 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-24">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Profile Calibration</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  {stage === 'Single' ? 'Independent Builder' : stage === 'Committed' ? 'Committed Partners' : 'Family Dynasty'}
                </h2>
              </div>

              {/* SINGLE DETAILS */}
              {stage === 'Single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Arup"
                        value={onboardingSingle.name}
                        onChange={e => setOnboardingSingle({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Age</label>
                      <input 
                        className="onb-input-glow" 
                        type="number" 
                        placeholder="28"
                        value={onboardingSingle.age}
                        onChange={e => setOnboardingSingle({ age: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Primary Region</label>
                      <select className="onb-select-glow" value={region} onChange={e => setLocalRegion(e.target.value)}>
                        {REGIONS.map(r => <option key={r} value={r} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Currency Mode</label>
                      <select className="onb-select-glow" value={currency} onChange={e => setLocalCurrency(e.target.value)}>
                        {Object.entries(CURRENCIES).map(([k,v]) => (
                          <option key={k} value={k} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{v.flag} {k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Solo Monthly Income</label>
                    <input 
                      className="onb-input-glow" 
                      type="number" 
                      placeholder="120000"
                      value={onboardingSingle.income}
                      onChange={e => setOnboardingSingle({ income: e.target.value })}
                    />
                  </div>

                  {/* Future locked preview for Single stage */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <div style={{ background: 'rgba(184,144,42,0.03)', border: '1px solid var(--onb-border)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--onb-desc)' }}>🔒 Couple Wealth Planning</span>
                      <span style={{ color: T.rose, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlocks in Committed stage</span>
                    </div>
                    <div style={{ background: 'rgba(184,144,42,0.03)', border: '1px solid var(--onb-border)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--onb-desc)' }}>🔒 Marriage Wealth Planning</span>
                      <span style={{ color: T.goldMid, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlocks in Married stage</span>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMITTED DETAILS */}
              {stage === 'Committed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Legal Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Arup"
                        value={onboardingCommitted.name}
                        onChange={e => setOnboardingCommitted({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Partner's Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Shatarupa"
                        value={onboardingCommitted.partnerName}
                        onChange={e => setOnboardingCommitted({ partnerName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Primary Region</label>
                      <select className="onb-select-glow" value={region} onChange={e => setLocalRegion(e.target.value)}>
                        {REGIONS.map(r => <option key={r} value={r} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Accounting Currency</label>
                      <select className="onb-select-glow" value={currency} onChange={e => setLocalCurrency(e.target.value)}>
                        {Object.entries(CURRENCIES).map(([k,v]) => (
                          <option key={k} value={k} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{v.flag} {k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Special Anniversary Date</label>
                    <input 
                      className="onb-input-glow" 
                      type="date" 
                      value={onboardingCommitted.anniversaryDate}
                      onChange={e => setOnboardingCommitted({ anniversaryDate: e.target.value })}
                    />
                  </div>

                  {/* Future locked preview for Committed stage */}
                  <div style={{ background: 'rgba(184,144,42,0.03)', border: '1px solid var(--onb-border)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '16px' }}>
                    <span style={{ color: 'var(--onb-desc)' }}>🔒 Family Dynasty Planning</span>
                    <span style={{ color: T.goldMid, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlocks in Married stage</span>
                  </div>
                </div>
              )}

              {/* MARRIED DETAILS */}
              {stage === 'Married' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Legal Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Arup"
                        value={onboardingMarried.spouseName ? 'Arup' : ''}
                        onChange={e => {}}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Spouse's Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Shatarupa"
                        value={onboardingMarried.spouseName}
                        onChange={e => setOnboardingMarried({ spouseName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Primary Region</label>
                      <select className="onb-select-glow" value={region} onChange={e => setLocalRegion(e.target.value)}>
                        {REGIONS.map(r => <option key={r} value={r} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Dynasty Currency</label>
                      <select className="onb-select-glow" value={currency} onChange={e => setLocalCurrency(e.target.value)}>
                        {Object.entries(CURRENCIES).map(([k,v]) => (
                          <option key={k} value={k} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{v.flag} {k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Dynasty Family Savings Goal</label>
                    <input 
                      className="onb-input-glow" 
                      type="number" 
                      placeholder="50000000"
                      value={onboardingMarried.currentSavings}
                      onChange={e => setOnboardingMarried({ currentSavings: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={() => setStep(3)}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FINANCIAL PERSONALITY */}
          {step === 3 && (
            <motion.div
              key="mindset"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-32">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Wealth psychology</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  How would you describe your financial mindset?
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                
                {/* CONSERVATIVE */}
                <div 
                  className={`onb-card-option ${mindset === 'Conservative' ? 'selected' : ''}`}
                  onClick={() => setMindset('Conservative')}
                  style={{ borderLeft: `3px solid ${T.sky}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Shield size={24} style={{ color: T.sky }} />
                    <div>
                      <h3 className="onb-card-title">Conservative</h3>
                      <p className="onb-card-desc">Safety first. 60% Needs · 30% core compounding investments. Preserving assets while growing with steady anchors.</p>
                    </div>
                  </div>
                </div>

                {/* BALANCED */}
                <div 
                  className={`onb-card-option ${mindset === 'Balanced' ? 'selected' : ''}`}
                  onClick={() => setMindset('Balanced')}
                  style={{ borderLeft: `3px solid ${T.goldMid}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Compass size={24} style={{ color: T.goldMid }} />
                    <div>
                      <h3 className="onb-card-title">Balanced</h3>
                      <p className="onb-card-desc">Optimized allocation. 55% Needs · 35% compound pool. Calculated growth index anchored with secure buffers.</p>
                    </div>
                  </div>
                </div>

                {/* AGGRESSIVE */}
                <div 
                  className={`onb-card-option ${mindset === 'Aggressive' ? 'selected' : ''}`}
                  onClick={() => setMindset('Aggressive')}
                  style={{ borderLeft: `3px solid ${T.rose}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <TrendingUp size={24} style={{ color: T.rose }} />
                    <div>
                      <h3 className="onb-card-title">Aggressive</h3>
                      <p className="onb-card-desc">Exponential compounder. 50% Needs · 40% high-octane growth portfolio. Maximum wealth speed, tolerating high volatility.</p>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(2)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={() => setStep(4)}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DREAM GOALS */}
          {step === 4 && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-24">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Target Indexing</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  What dreams are we securing?
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                {DREAM_GOALS.map(g => (
                  <div 
                    key={g.key}
                    className={`onb-card-option ${dreamGoals.includes(g.key) ? 'selected' : ''}`}
                    onClick={() => handleGoalToggle(g.key)}
                    style={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{g.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--onb-title)', marginBottom: '4px' }}>{g.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--onb-desc)', lineHeight: 1.3 }}>{g.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(3)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={() => setStep(5)}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FUTURE JOURNEY PREVIEW */}
          {step === 5 && (
            <motion.div
              key="timeline-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-32">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Dynamic Foresight</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  Your Life Journey Blueprint
                </h2>
              </div>

              {/* TIMELINE */}
              <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '32px' }}>
                
                {/* Timeline vertical bar */}
                <div style={{ position: 'absolute', left: '5px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(180deg, var(--gold-mid), var(--onb-border))' }} />

                {/* Node 1 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '4px' }}>
                    <div className="timeline-pulse-node" style={{ background: T.sky, boxShadow: `0 0 10px ${T.sky}` }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.sky, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2026 · Launch</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '2px' }}>Core Wealth Engine Sparked</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--onb-desc)', marginTop: '2px' }}>Personal assets indexed and calibrated for {mindset} growth parameters.</p>
                  </div>
                </div>

                {/* Node 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '4px' }}>
                    <div className="timeline-pulse-node" style={{ background: T.rose, boxShadow: `0 0 10px ${T.rose}` }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.rose, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2028 · Evolution</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '2px' }}>Cryptographic Partnership Sync</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--onb-desc)', marginTop: '2px' }}>Lockers merged. Dynamic dual-engine compound system fully online.</p>
                  </div>
                </div>

                {/* Node 3 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '4px' }}>
                    <div className="timeline-pulse-node" style={{ background: T.goldMid, boxShadow: `0 0 10px ${T.goldMid}` }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.goldMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2032 · Target Secured</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '2px' }}>First Major Family Asset Acquired</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--onb-desc)', marginTop: '2px' }}>Dynamic SIP targets triggered, executing automated maturity distributions.</p>
                  </div>
                </div>

                {/* Node 4 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '4px' }}>
                    <div className="timeline-pulse-node" style={{ background: T.sage, boxShadow: `0 0 10px ${T.sage}` }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.sage, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2045 · Sovereignty</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '2px' }}>Sovereign Financial Freedom</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--onb-desc)', marginTop: '2px' }}>Compounding peak unlocked. Multi-generational dynasty safety buffer secured.</p>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(4)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px', background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)` }}
                  onClick={() => setStep(6)}
                >
                  Confirm &amp; Calibrate Engine
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: WEALTH ENGINE CALIBRATION LOADING */}
          {step === 6 && (
            <motion.div
              key="calibration"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="liquid-glass"
              style={{ padding: '48px 40px', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'var(--onb-border)', border: '1px solid var(--onb-border)', marginBottom: '18px' }} className="animate-spin">
                  ⏳
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.65rem', fontWeight: 600, color: 'var(--onb-title)' }}>
                  Calibrating Wealth Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--onb-desc)', marginTop: '4px' }}>Please hold while assets are indexed to Excel precision standards...</p>
              </div>

              {/* CONSOLE OUTPUT LOGS */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.72)',
                border: '1px solid var(--onb-border)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontFamily: 'monospace',
                fontSize: '0.76rem',
                color: '#62ca98',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left',
                minHeight: '140px',
                overflowY: 'auto'
              }}>
                {calibrationLogs.map((l, i) => (
                  <div key={i} style={{ color: l.type === 'success' ? '#62ca98' : '#b0a898' }}>
                    &gt; {l.text}
                  </div>
                ))}
                {currentLogIndex < logSequence.length && (
                  <div className="animate-pulse" style={{ color: T.gold }}>&gt; SYNCING PROTOCOLS...</div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}