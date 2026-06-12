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
import authBanner from '../../assets/auth_banner.png';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '13px', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-faint)', zIndex: 5,
          pointerEvents: 'none'
        }}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            height: '46px',
            paddingLeft: '38px',
            paddingRight: '14px',
            borderRadius: '10px',
            border: `1.5px solid ${error ? '#d05c72' : 'var(--border-mid)'}`,
            background: 'var(--bg-warm)',
            color: 'var(--text)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.12)`; }}
          onBlur={e => { e.target.style.borderColor = error ? '#d05c72' : 'var(--border-mid)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.68rem', color: '#d05c72', paddingLeft: '2px' }}>{error}</span>
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
        background: 'var(--bg)',
        fontFamily: T.fontBody,
        position: 'relative',
        padding: '16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'absolute', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', top: '-8%', left: '-4%', pointerEvents: 'none', filter: 'blur(36px)' }} />
      <div style={{ position: 'absolute', width: '540px', height: '540px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,140,196,0.04) 0%, transparent 70%)', bottom: '-12%', right: '-4%', pointerEvents: 'none', filter: 'blur(40px)' }} />

      {/* Close button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', zIndex: 100,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'color 0.2s',
        }}
      >
        Close <X size={15} />
      </button>

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="auth-split-container"
        style={{
          width: '100%',
          maxWidth: '1040px',
          background: 'var(--bg-card-glass)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.14)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >

        {/* ══ LEFT — Auth panel ══════════════════════════ */}
        <div
          className="auth-left-col"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            justifyContent: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '20px' }}>
            <Logo size={32} showText={true} />
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: '18px' }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.gold, display: 'block', marginBottom: '4px' }}>
                {activeTab === 'login' ? 'Secure Access' : 'New Account'}
              </span>
              <h1 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 700, margin: 0, color: 'var(--text)', lineHeight: 1.2 }}>
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '5px 0 0', lineHeight: 1.4 }}>
                {activeTab === 'login'
                  ? 'Sign in to your EverBond financial vault.'
                  : 'Start building your wealth legacy today.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-warm)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-mid)',
            marginBottom: '16px',
          }}>
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => switchTab(tab)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === tab ? T.gold : 'var(--text-faint)',
                  boxShadow: activeTab === tab ? 'var(--sh-xs)' : 'none',
                  transition: 'all 0.18s ease',
                  fontFamily: 'inherit',
                }}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <AnimatePresence>
              {activeTab === 'signup' && (
                <motion.div
                  key="fullname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <AuthField
                    icon={<User size={14} />}
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

            <AuthField
              icon={<Mail size={14} />}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
              disabled={isLoading}
              error={errors.email}
            />

            <AuthField
              icon={<Key size={14} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
              disabled={isLoading}
              error={errors.password}
            />

            {/* Password strength bar */}
            {activeTab === 'signup' && password && (
              <div style={{ padding: '0 2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                  <span>Strength</span>
                  <span style={{ color: strengthInfo.color, fontWeight: 700 }}>{strengthInfo.text}</span>
                </div>
                <div style={{ height: '3px', background: 'var(--border-mid)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: strengthInfo.width, height: '100%', background: strengthInfo.color, transition: 'all 0.3s ease', borderRadius: '2px' }} />
                </div>
              </div>
            )}

            <AnimatePresence>
              {activeTab === 'signup' && (
                <motion.div
                  key="confirmpw"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <AuthField
                    icon={<Key size={14} />}
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

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              style={{
                background: `linear-gradient(135deg, ${T.gold} 0%, #9a7320 100%)`,
                border: 'none',
                color: '#fff',
                height: '46px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(201,168,76,0.3)',
                opacity: isLoading ? 0.72 : 1,
                width: '100%',
                transition: 'all 0.2s',
                marginTop: '4px',
                fontFamily: 'inherit',
              }}
            >
              <span>{isLoading ? 'Please wait…' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </motion.button>
          </form>

          {/* Divider + circular social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Quick Access
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {/* Google circle */}
            <motion.button
              type="button"
              onClick={() => handleSocial(googleProvider)}
              disabled={isLoading}
              whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.94 }}
              title="Continue with Google"
              aria-label="Sign in with Google"
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                border: '1.5px solid var(--border-str)',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <GoogleIcon size={20} />
            </motion.button>

            {/* Apple circle */}
            <motion.button
              type="button"
              onClick={() => handleSocial(appleProvider)}
              disabled={isLoading}
              whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.94 }}
              title="Continue with Apple"
              aria-label="Sign in with Apple"
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                border: '1.5px solid var(--border-str)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <AppleIcon size={20} />
            </motion.button>
          </div>
        </div>

        {/* ══ RIGHT — Image panel ════════════════════════ */}
        <div
          className="auth-right-col"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'var(--bg-warm)',
          }}
        >
          <img
            src={authBanner}
            alt="EverBond Wealth"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              zIndex: 1,
            }}
          />
          {/* gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(12,11,9,0.88) 0%, rgba(12,11,9,0.22) 55%, transparent 100%)',
            zIndex: 2,
          }} />
          {/* caption */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '5px', padding: '32px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: T.gold }}>
              EverBond Ecosystem
            </span>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.45rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              Collaborative Wealth Architecture
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.45 }}>
              Compounding milestones mapped inside a private sovereign vault.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
