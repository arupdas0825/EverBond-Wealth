import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Logo } from '../common/Logo';
import { 
  ArrowLeft, ArrowRight, Shield, Check, 
  User, Globe, AlertTriangle, LogOut, DollarSign
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { REGIONS } from '../../constants/presets';

const stepVariants = {
  enter: (dir) => ({
    x: dir === 'forward' ? 120 : -120,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir) => ({
    x: dir === 'forward' ? -120 : 120,
    opacity: 0
  })
};

export function OnboardingSystem({ onComplete, onOpenPolicy }) {
  const store = useFinanceStore();
  const toast = useToast();
  const user = store.user;

  // Step 1 State
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('India');
  const [currency, setCurrency] = useState('INR');

  // Step 2 State
  const [mode, setMode] = useState('Single'); // 'Single' | 'Committed' | 'Family Dynasty'

  // Step 3 State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Automatically suggest currency based on country selection
  const handleCountryChange = (val) => {
    setCountry(val);
    const currencyMapping = {
      'India': 'INR',
      'Germany': 'EUR',
      'Switzerland': 'CHF',
      'USA': 'USD',
      'UK': 'GBP',
      'Canada': 'CAD',
      'Singapore': 'SGD',
      'UAE': 'AED'
    };
    if (currencyMapping[val]) {
      setCurrency(currencyMapping[val]);
    } else {
      setCurrency('USD');
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      store.reset();
      localStorage.removeItem('eb_v6');
      toast.success("Signed out successfully.");
      window.location.hash = '#/auth';
    } catch (err) {
      console.error("Sign out failed during onboarding:", err);
      toast.error("Failed to sign out.");
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const errors = {};
      if (!fullName.trim()) errors.fullName = 'Full Name is required.';
      if (!age.trim() || isNaN(age) || parseInt(age) < 18) {
        errors.age = 'A valid age (18+) is required.';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix the validation errors.');
        return;
      }
      setValidationErrors({});
      setDirection('forward');
      setStep(2);
    } else if (step === 2) {
      setDirection('forward');
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setDirection('backward');
    setStep(step - 1);
  };

  const handleFinishOnboarding = async () => {
    if (!user?.uid) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    if (!termsAccepted || !privacyAccepted || !dataConsent) {
      toast.error("Please accept all agreements to activate your account.");
      return;
    }

    setIsLoading(true);
    toast.success('Calibrating your financial workspace...');

    try {
      // 1. Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        fullName: fullName.trim(),
        age: parseInt(age),
        country: country,
        currency: currency,
        mode: mode,
        onboardingCompleted: true,
        termsAccepted: true,
        privacyAccepted: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Map mode to store stage formats
      const mappedStage = mode === 'Family Dynasty' ? 'Married' : mode;
      
      // Calculate starting salaries depending on mode
      let p1Salary = 100000;
      let p2Salary = 0;
      let partnerName = '';
      if (mode === 'Committed') {
        p1Salary = 100000;
        p2Salary = 80000;
        partnerName = 'Partner';
      } else if (mode === 'Family Dynasty') {
        p1Salary = 150000;
        p2Salary = 120000;
        partnerName = 'Spouse';
      }

      // Update local Zustand store
      store.setProfile({
        partner1: fullName.trim(),
        partner2: partnerName,
        region: country,
        country: country,
        currency: currency,
        stage: mappedStage,
        p1Salary,
        p2Salary,
        connectionStatus: mode === 'Family Dynasty' ? 'connected' : 'none'
      });

      useFinanceStore.setState({
        onboardingComplete: true,
        started: true
      });

      toast.success("Workspace calibrated successfully!");
      onComplete();
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="onboarding-wrap"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-warm)',
        padding: '40px 24px',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184, 144, 42, 0.05) 0%, transparent 70%)',
          top: '-150px',
          right: '-100px',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 140, 196, 0.04) 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '540px', position: 'relative', zIndex: 10 }}>
        {/* EverBond Logo Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size={42} showText={true} />
        </div>

        {/* Progress Bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--sh-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <span>{step === 1 ? 'Personal Identity' : step === 2 ? 'Journey Selection' : 'Legal Consent'}</span>
            <span style={{ color: T.gold }}>Step {step} of 3</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${(step / 3) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${T.goldMid}, ${T.gold})`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Wizard Step Cards */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="liquid-glass"
            style={{ padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: T.radius }}
          >
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Step 1: Calibration</span>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                    Personal Details
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Name field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="fullname-input" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}>
                        <User size={14} />
                      </span>
                      <input
                        id="fullname-input"
                        type="text"
                        placeholder="e.g. Arup Das"
                        value={fullName}
                        onChange={e => {
                          setFullName(e.target.value);
                          if (validationErrors.fullName) {
                            setValidationErrors(prev => ({ ...prev, fullName: '' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          padding: '12px 14px 12px 36px',
                          borderRadius: '12px',
                          border: `1.5px solid ${validationErrors.fullName ? T.rose : 'var(--border-mid)'}`,
                          background: 'transparent',
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {validationErrors.fullName && <span style={{ fontSize: '0.7rem', color: T.rose, marginTop: '2px', display: 'block' }}>{validationErrors.fullName}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
                    {/* Age field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="age-input" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Age</label>
                      <input
                        id="age-input"
                        type="number"
                        placeholder="e.g. 28"
                        value={age}
                        onChange={e => {
                          setAge(e.target.value);
                          if (validationErrors.age) {
                            setValidationErrors(prev => ({ ...prev, age: '' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: `1.5px solid ${validationErrors.age ? T.rose : 'var(--border-mid)'}`,
                          background: 'transparent',
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {validationErrors.age && <span style={{ fontSize: '0.7rem', color: T.rose, marginTop: '2px', display: 'block' }}>{validationErrors.age}</span>}
                    </div>

                    {/* Country field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="country-select" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Country</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}>
                          <Globe size={14} />
                        </span>
                        <select
                          id="country-select"
                          value={country}
                          onChange={e => handleCountryChange(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '48px',
                            padding: '12px 14px 12px 36px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-mid)',
                            background: 'var(--bg-card)',
                            color: 'var(--text)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Currency field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="currency-select" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Preferred Currency</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}>
                        <DollarSign size={14} />
                      </span>
                      <select
                        id="currency-select"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          padding: '12px 14px 12px 36px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-mid)',
                          background: 'var(--bg-card)',
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="CHF">CHF (CHF)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="SGD">SGD (S$)</option>
                        <option value="AED">AED (AED)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="onb-btn-group stack-reverse" style={{ marginTop: '16px' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border-mid)',
                      color: T.rose,
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                  <button
                    className="onb-btn-continue"
                    onClick={handleNextStep}
                    style={{
                      background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: 'var(--sh-gold)',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE FINANCIAL MODE */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Step 2: Journey Mode</span>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                    Workspace Calibration
                  </h2>
                </div>

                {/* Permanent Decision Warning Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'rgba(208, 92, 114, 0.08)',
                    border: '1.5px solid rgba(208, 92, 114, 0.25)',
                    borderRadius: '12px',
                    color: T.rose
                  }}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, lineHeight: 1.45 }}>
                    This decision defines your EverBond workspace structure and cannot be changed later.
                  </p>
                </div>

                {/* Mode Selectors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'Single', label: 'Single Mode', icon: '⚡', desc: 'Building wealth independently. Plan asset compound models solo.' },
                    { id: 'Committed', label: 'Committed Partner Mode', icon: '💑', desc: 'Sync nodes with your partner. Access shared ledgers and joint targets.' },
                    { id: 'Family Dynasty', label: 'Family Dynasty Mode', icon: '💍', desc: 'Dynasty asset Overseer. Multi-generational capital structure oversight.' }
                  ].map((modeItem) => {
                    const isSelected = mode === modeItem.id;
                    return (
                      <motion.div
                        key={modeItem.id}
                        onClick={() => setMode(modeItem.id)}
                        whileHover={{ 
                          scale: 1.01, 
                          borderColor: isSelected ? T.gold : T.goldMid, 
                          backgroundColor: isSelected ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255, 255, 255, 0.02)' 
                        }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                          border: `2px solid ${isSelected ? T.gold : 'var(--border-mid)'}`,
                          padding: '16px 20px',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          background: isSelected ? 'rgba(201, 168, 76, 0.05)' : 'transparent',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected ? '0 8px 20px rgba(201, 168, 76, 0.1)' : 'none',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                          <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{modeItem.icon}</span>
                          <div>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 4px', color: isSelected ? T.gold : 'var(--text)' }}>
                              {modeItem.label}
                            </h3>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                              {modeItem.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: T.gold,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Check size={12} color="#ffffff" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Buttons Navigation */}
                <div className="onb-btn-group stack-reverse" style={{ marginTop: '16px' }}>
                  <button
                    onClick={handleBackStep}
                    disabled={isLoading}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border-mid)',
                      color: 'var(--text-muted)',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    style={{
                      background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: 'var(--sh-gold)',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: LEGAL CONSENT */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Step 3: Verification</span>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                    Terms & Privacy
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                    Please review and accept our framework agreements to initialize your secure financial vault.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Terms checkbox */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${termsAccepted ? T.goldMid : 'var(--border-mid)'}`,
                      background: termsAccepted ? 'rgba(201, 168, 76, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: T.gold,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <label
                      htmlFor="terms-checkbox"
                      style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3, cursor: 'pointer', flex: 1 }}
                    >
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onOpenPolicy) onOpenPolicy('terms');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: T.goldMid,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          font: 'inherit'
                        }}
                      >
                        Terms & Conditions
                      </button>
                    </label>
                  </div>

                  {/* Privacy checkbox */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${privacyAccepted ? T.goldMid : 'var(--border-mid)'}`,
                      background: privacyAccepted ? 'rgba(201, 168, 76, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      id="privacy-checkbox"
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={e => setPrivacyAccepted(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: T.gold,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <label
                      htmlFor="privacy-checkbox"
                      style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3, cursor: 'pointer', flex: 1 }}
                    >
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onOpenPolicy) onOpenPolicy('privacy');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: T.goldMid,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          font: 'inherit'
                        }}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  {/* Storage checkbox */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${dataConsent ? T.goldMid : 'var(--border-mid)'}`,
                      background: dataConsent ? 'rgba(201, 168, 76, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      id="data-consent-checkbox"
                      type="checkbox"
                      checked={dataConsent}
                      onChange={e => setDataConsent(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: T.gold,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <label
                      htmlFor="data-consent-checkbox"
                      style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3, cursor: 'pointer', flex: 1 }}
                    >
                      I consent to secure storage of my profile and financial workspace data (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onOpenPolicy) onOpenPolicy('data-handling');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: T.goldMid,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          font: 'inherit'
                        }}
                      >
                        Data Storage Policy
                      </button>
                      )
                    </label>
                  </div>
                </div>

                {/* Buttons Navigation */}
                <div className="onb-btn-group stack-reverse" style={{ marginTop: '16px' }}>
                  <button
                    onClick={handleBackStep}
                    disabled={isLoading}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border-mid)',
                      color: 'var(--text-muted)',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={isLoading || !(termsAccepted && privacyAccepted && dataConsent)}
                    style={{
                      background: termsAccepted && privacyAccepted && dataConsent
                        ? `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`
                        : 'var(--border-mid)',
                      color: termsAccepted && privacyAccepted && dataConsent ? '#ffffff' : 'var(--text-faint)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: isLoading || !(termsAccepted && privacyAccepted && dataConsent) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: termsAccepted && privacyAccepted && dataConsent ? 'var(--sh-gold)' : 'none',
                      opacity: isLoading ? 0.8 : 1,
                      transition: 'all 0.2s',
                      minHeight: '48px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {isLoading ? 'Calibrating...' : 'Finish Setup'}
                    <Check size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

