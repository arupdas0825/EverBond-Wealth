import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, appleProvider, createUserDocument } from '../../utils/firebase';
import { Logo } from '../common/Logo';
import { T } from '../../theme/tokens';
import { ArrowRight, X, Mail, Key, User } from 'lucide-react';
import { useToast } from '../common/Toast';

const GoogleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const AppleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.61 2.98-1.42z" />
  </svg>
);

/* ── Password strength helper ─────────────────────────── */
function getPasswordStrength(pwd) {
  if (!pwd) return { text: '', color: 'transparent', width: '0%' };
  if (pwd.length < 8) return { text: 'Too short', color: '#d05c72', width: '20%' };
  let score = 0;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { text: 'Weak', color: '#d05c72', width: '30%' };
  if (score === 2) return { text: 'Fair', color: '#e67e22', width: '55%' };
  if (score === 3) return { text: 'Good', color: '#C9A227', width: '78%' };
  return { text: 'Strong', color: '#27ae60', width: '100%' };
}

/* ── Reusable input field ─────────────────────────────── */
function AuthField({ icon, type = 'text', placeholder, value, onChange, disabled, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '18px', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-faint)', zIndex: 5,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`auth-glass-input ${error ? 'has-error' : ''}`}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.72rem', color: '#d05c72', paddingLeft: '4px', fontWeight: 500 }}>{error}</span>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export function AuthPage({ onAuthSuccess, onBackToLanding, onOpenPolicy }) {
  const [activeTab, setActiveTab] = useState('login');
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const strengthInfo = getPasswordStrength(password);

  /* ── Reset on tab switch ─── */
  const switchTab = (tab) => {
    setActiveTab(tab);
    setFullName(''); setEmail(''); setPassword(''); setConfirmPw(''); setErrors({});
  };

  /* ── Validation ─── */
  const validate = () => {
    const e = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (activeTab === 'signup' && !fullName.trim())       e.fullName = 'Full name is required.';
    if (!email.trim())                                     e.email = 'Email is required.';
    else if (!emailRx.test(email.trim()))                  e.email = 'Enter a valid email address.';
    if (!password)                                         e.password = 'Password is required.';
    else if (password.length < 8)                          e.password = 'Minimum 8 characters.';
    if (activeTab === 'signup') {
      if (!confirmPw)                                      e.confirmPw = 'Please confirm your password.';
      else if (confirmPw !== password)                     e.confirmPw = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Error decoder ─── */
  const decodeFirebaseError = (err) => {
    const map = {
      'auth/email-already-in-use':    'This email is already registered.',
      'auth/invalid-credential':      'Invalid email or password.',
      'auth/wrong-password':          'Invalid email or password.',
      'auth/user-not-found':          'No account found with this email.',
      'auth/invalid-email':           'Please enter a valid email.',
      'auth/weak-password':           'Password must be at least 8 characters.',
      'auth/popup-blocked':           'Popup blocked — please allow popups.',
      'auth/network-request-failed':  'Network error. Check your connection.',
      'auth/invalid-api-key':         'Firebase configuration error.',
    };
    return map[err.code] || `Auth error: ${err.message}`;
  };

  /* ── Redirect result on mount ─── */
  useEffect(() => {
    getRedirectResult(auth).then(async result => {
      if (result?.user) {
        try { await createUserDocument(result.user, result.user.displayName || '', result.providerId || 'google.com'); } catch (_) {}
        toast.success('Welcome to EverBond!');
        onAuthSuccess();
      }
    }).catch(err => toast.error(decodeFirebaseError(err)));
  }, []);

  /* ── Email/password submit ─── */
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (activeTab === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        try { await updateProfile(cred.user, { displayName: fullName.trim() }); } catch (_) {}
        try { await createUserDocument(cred.user, fullName.trim(), 'password'); } catch (_) {}
        toast.success('Account created!');
        onAuthSuccess();
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        try { await createUserDocument(cred.user, '', 'password'); } catch (_) {}
        toast.success('Welcome back!');
        onAuthSuccess();
      }
    } catch (err) {
      toast.error(decodeFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Social sign-in ─── */
  const handleSocial = async (provider) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      try { await createUserDocument(result.user, result.user.displayName || '', provider.providerId); } catch (_) {}
      toast.success('Welcome to EverBond!');
      onAuthSuccess();
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try { await signInWithRedirect(auth, provider); } catch (e) { toast.error(decodeFirebaseError(e)); }
      } else {
        toast.error(decodeFirebaseError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FAF6EE 0%, #EAE2D0 100%)',
        fontFamily: T.fontBody,
        position: 'relative',
        padding: '16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient luxury glows */}
      <motion.div
        animate={{ x: [0, 30, -30, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201, 168, 76, 0.08) 0%, transparent 70%)', top: '-15%', left: '-10%', pointerEvents: 'none', filter: 'blur(60px)', zIndex: 1 }}
      />
      <motion.div
        animate={{ x: [0, -40, 25, 0], y: [0, 30, -25, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244, 240, 230, 0.55) 0%, transparent 70%)', bottom: '-20%', right: '-10%', pointerEvents: 'none', filter: 'blur(80px)', zIndex: 1 }}
      />
      
      {/* Close button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'rgba(255, 255, 255, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '12px',
          padding: '8px 14px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--text-muted)',
          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', zIndex: 100,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        Close <X size={15} />
      </button>

      {/* ── Main card (with glass bloom & smooth height layouts) ── */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.45, 
          ease: "easeInOut",
          layout: { type: 'tween', duration: 0.4, ease: 'easeInOut' }
        }}
        className="auth-split-container"
        style={{
          width: '100%',
          maxWidth: '1040px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >

        {/* ══ LEFT — Auth panel ══════════════════════════ */}
        <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="auth-left-col">
          {/* Scrollable upper section (Logo + Heading + Toggle + Form) */}
          <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="auth-scrollable-content">
            {/* Logo */}
            <div style={{ marginBottom: '24px' }}>
              <Logo size={32} showText={true} />
            </div>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ marginBottom: '20px' }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.gold, display: 'block', marginBottom: '6px' }}>
                  {activeTab === 'login' ? 'Secure Access' : 'New Account'}
                </span>
                <h1 style={{ fontFamily: T.fontDisplay, fontSize: '1.85rem', fontWeight: 700, margin: 0, color: 'var(--text)', lineHeight: 1.2 }}>
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.45 }}>
                  {activeTab === 'login'
                    ? 'Sign in to your EverBond financial vault.'
                    : 'Start building your wealth legacy today.'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(15px)',
              borderRadius: '14px',
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 5,
            }}>
              {['login', 'signup'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchTab(tab)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: activeTab === tab ? '#C9A227' : 'rgba(28, 26, 22, 0.45)',
                    transition: 'color 0.25s ease',
                    fontFamily: 'inherit',
                    position: 'relative',
                  }}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabHighlight"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.26) 0%, rgba(184, 144, 42, 0.16) 100%)',
                        border: '1px solid rgba(201, 168, 76, 0.45)',
                        borderRadius: '10px',
                        zIndex: -1,
                      }}
                    />
                  )}
                  {tab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form with layout animations */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AnimatePresence initial={false}>
                {activeTab === 'signup' && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0, y: -12 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                    layout
                  >
                    <AuthField
                      icon={<User size={16} />}
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors(p => ({ ...p, fullName: '' })); }}
                      disabled={isLoading}
                      error={errors.fullName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
                <AuthField
                  icon={<Mail size={16} />}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  disabled={isLoading}
                  error={errors.email}
                />
              </motion.div>

              <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
                <AuthField
                  icon={<Key size={16} />}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  disabled={isLoading}
                  error={errors.password}
                />
              </motion.div>

              {/* Password strength bar */}
              <AnimatePresence initial={false}>
                {activeTab === 'signup' && password && (
                  <motion.div
                    key="strength"
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ overflow: 'hidden', padding: '0 4px', marginTop: '2px' }}
                    layout
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px', color: 'var(--text-muted)' }}>
                      <span>Strength</span>
                      <span style={{ color: strengthInfo.color, fontWeight: 700 }}>{strengthInfo.text}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(28, 26, 22, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: strengthInfo.width, height: '100%', background: strengthInfo.color, transition: 'all 0.3s ease', borderRadius: '2px' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {activeTab === 'signup' && (
                  <motion.div
                    key="confirmpw"
                    initial={{ opacity: 0, height: 0, y: -12 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                    layout
                  >
                    <AuthField
                      icon={<Key size={16} />}
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPw}
                      onChange={e => { setConfirmPw(e.target.value); if (errors.confirmPw) setErrors(p => ({ ...p, confirmPw: '' })); }}
                      disabled={isLoading}
                      error={errors.confirmPw}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { 
                    y: -2, 
                    boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4), 0 0 15px rgba(201, 168, 76, 0.2)',
                    background: 'linear-gradient(135deg, #d4ae3b 0%, #ca9718 100%)'
                  } : {}}
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    background: 'linear-gradient(135deg, #C9A227 0%, #B8860B 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    height: '56px',
                    borderRadius: '18px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(201, 168, 76, 0.25)',
                    opacity: isLoading ? 0.72 : 1,
                    width: '100%',
                    marginTop: '8px',
                    fontFamily: 'inherit',
                  }}
                >
                  <span>{isLoading ? 'Please wait…' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  {!isLoading && <ArrowRight size={16} />}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Fixed bottom footer */}
          <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="auth-fixed-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Quick Access</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <motion.button type="button" onClick={() => handleSocial(googleProvider)} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                <GoogleIcon size={22} />
              </motion.button>
              <motion.button type="button" onClick={() => handleSocial(appleProvider)} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                <AppleIcon size={22} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* ══ RIGHT — Image panel ════════════════════════ */}
        <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="auth-right-col">
          <div className="auth-image-panel">
            <img src="/Auth page image.jpeg" alt="EverBond Wealth" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 60%), linear-gradient(to top, rgba(12,11,9,0.92) 0%, rgba(12,11,9,0.15) 60%, transparent 100%)', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.45)', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, display: 'flex', flexDirection: 'column', gap: '6px', padding: '32px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: T.gold }}>EverBond Ecosystem</span>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.55rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>Collaborative Wealth Architecture</h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.45 }}>Compounding milestones mapped inside a private sovereign vault.</p>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
