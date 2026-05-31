import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import { CURRENCIES, REGIONS } from '../../constants/presets';
import { Heart, Sparkles, User, Shield, Compass, TrendingUp, Award, Clock } from 'lucide-react';
import { T } from '../../theme/tokens';
import { LandingPage } from './LandingPage';

const DREAM_GOALS = [
  { key: 'freedom', label: 'Financial Freedom', icon: '💸', desc: 'Break away from income constraints' },
  { key: 'home', label: 'Dream Home', icon: '🏡', desc: 'Secure your dream property asset' },
  { key: 'security', label: 'Family Security', icon: '🛡️', desc: 'Establish safety cushion for loved ones' },
  { key: 'retirement', label: 'Early Retirement', icon: '🌅', desc: 'Reach financial sovereignty' },
  { key: 'vacation', label: 'Travel Fund', icon: '✈️', desc: 'Explore global destinations' },
  { key: 'growth', label: 'Wealth Growth', icon: '📈', desc: 'Accelerate compound wealth expansion' }
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
  const [validationErrors, setValidationErrors] = useState({});
  const [currency, setLocalCurrency] = useState('INR');
  const [region, setLocalRegion] = useState('India');
  
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

  const handleCompleteOnboarding = () => {
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
      finalPartner1 = onboardingMarried.name || 'Dynasty Head';
      finalPartner2 = onboardingMarried.partnerName || 'Partner 2';
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
  };

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

  const getStepIndex = (s) => {
    if (s === 1) return 1;
    if (s === 2) return 2;
    return 3;
  };

  const getStepText = (s) => {
    if (s === 1) return "Choose Partnership Stage";
    if (s === 2) return "Configure Identity & Ledger";
    return "Choose Your Financial Style";
  };

  const handleStep2Continue = () => {
    const errors = {};
    if (stage === 'Single') {
      if (!onboardingSingle.name || !onboardingSingle.name.trim()) {
        errors.userName = 'Please enter your name.';
      }
    } else if (stage === 'Committed') {
      if (!onboardingCommitted.name || !onboardingCommitted.name.trim()) {
        errors.userName = 'Please enter your name.';
      }
      if (!onboardingCommitted.partnerName || !onboardingCommitted.partnerName.trim()) {
        errors.partnerName = 'Please enter your partner\'s name.';
      }
    } else if (stage === 'Married') {
      if (!onboardingMarried.name || !onboardingMarried.name.trim()) {
        errors.userName = 'Please enter your name.';
      }
      if (!onboardingMarried.partnerName || !onboardingMarried.partnerName.trim()) {
        errors.partnerName = 'Please enter your partner\'s name.';
      }
    }

    if (!region) {
      errors.country = 'Please choose your country.';
    }
    if (!currency) {
      errors.currency = 'Please select your accounting currency.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
    } else {
      setValidationErrors({});
      setStep(3);
    }
  };

  if (step === 0) {
    return <LandingPage onStartJourney={() => setStep(1)} />;
  }

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

        {/* Premium Onboarding Progress Bar */}
        {step > 0 && step <= 5 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--sh-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--onb-desc)' }}>
              <span>{getStepText(step)}</span>
              <span style={{ color: T.goldMid }}>Step {getStepIndex(step)} of 3</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--onb-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(getStepIndex(step) / 3) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${T.goldMid}, ${T.gold})`,
                transition: 'width 0.4s ease'
              }} />
            </div>
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

              {/* Premium Inline Error Block */}
              {Object.keys(validationErrors).length > 0 && (
                <div style={{
                  background: 'var(--rose-lt)',
                  border: '1px solid var(--rose-border)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: T.rose,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  textAlign: 'left',
                  animation: 'shake 0.4s ease'
                }}>
                  {Object.entries(validationErrors).map(([key, msg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚠️</span> <span>{msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SINGLE DETAILS */}
              {stage === 'Single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Enter your name"
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
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Enter your name"
                        value={onboardingCommitted.name}
                        onChange={e => setOnboardingCommitted({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Partner's Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Enter partner's name"
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
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Your Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Enter your name"
                        value={onboardingMarried.name}
                        onChange={e => setOnboardingMarried({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--onb-label)', marginBottom: '4px' }}>Partner's Name</label>
                      <input 
                        className="onb-input-glow" 
                        type="text" 
                        placeholder="Enter partner's name"
                        value={onboardingMarried.partnerName}
                        onChange={e => setOnboardingMarried({ partnerName: e.target.value })}
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
                  onClick={handleStep2Continue}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FINANCIAL PERSONALITY & GOAL ALIGNMENT */}
          {step === 3 && (
            <motion.div
              key="personality-goals"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass"
              style={{ padding: '40px' }}
            >
              <div className="text-center mb-32">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Financial Personality Setup</span>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '6px' }}>
                  Choose Your Financial Style
                </h2>
              </div>

              {/* Financial Style Selectable Cards */}
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
                      <p className="onb-card-desc" style={{ color: 'var(--onb-desc)', fontSize: '0.8rem' }}>Focus on stability and lower risk.</p>
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
                      <p className="onb-card-desc" style={{ color: 'var(--onb-desc)', fontSize: '0.8rem' }}>A mix of growth and security.</p>
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
                      <p className="onb-card-desc" style={{ color: 'var(--onb-desc)', fontSize: '0.8rem' }}>Higher growth potential with higher risk.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Optional Section: Select Your Primary Goal */}
              <div style={{ borderTop: '1px solid var(--onb-border)', paddingTop: '28px', marginTop: '12px' }}>
                <div className="text-center mb-24">
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Optional Section</span>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 600, color: 'var(--onb-title)', marginTop: '4px' }}>
                    Select Your Primary Goal
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                  {DREAM_GOALS.map(g => (
                    <div 
                      key={g.key}
                      className={`onb-card-option ${dreamGoals.includes(g.key) ? 'selected' : ''}`}
                      onClick={() => handleGoalToggle(g.key)}
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{g.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--onb-title)' }}>{g.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--onb-desc)', lineHeight: 1.3 }}>{g.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--onb-border)', paddingTop: '24px' }}>
                <button className="btn-reset" style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--onb-back)' }} onClick={() => setStep(2)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 28px', background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)` }}
                  onClick={handleCompleteOnboarding}
                >
                  Start My Financial Journey
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}