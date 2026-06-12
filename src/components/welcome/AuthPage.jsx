import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const GoogleIcon = ({ size = 20, style }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={style}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = ({ size = 20, style }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={style}
    fill="currentColor"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.51-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.61 2.98-1.42z" />
  </svg>
);

export function AuthPage({ onAuthSuccess, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAuthError = (err) => {
    console.error("Firebase Auth exact error details:", err);
    let message = "Authentication failed. Please try again.";
    
    if (err.code === 'auth/email-already-in-use') {
      message = "This email is already registered. Please sign in instead.";
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      message = "Invalid email or password. Please verify your credentials.";
    } else if (err.code === 'auth/user-not-found') {
      message = "No account found with this email. Please sign up first.";
    } else if (err.code === 'auth/invalid-email') {
      message = "Please enter a valid email address.";
    } else if (err.code === 'auth/weak-password') {
      message = "Password must be at least 6 characters long.";
    } else if (err.code === 'auth/popup-blocked') {
      message = "OAuth popup window was blocked by your browser settings.";
    } else if (err.code === 'auth/cancelled-popup-request') {
      message = "Sign in popup request was cancelled.";
    } else if (err.code === 'auth/network-request-failed') {
      message = "Network connection issue. Please check your internet connection.";
    } else if (err.code === 'auth/invalid-api-key') {
      message = "Invalid Firebase API key configurations.";
    } else if (err.code === 'auth/configuration-not-found') {
      message = "Firebase Auth provider configuration was not found.";
    } else if (err.code) {
      message = `Authentication Error (${err.code}): ${err.message}`;
    }
    toast.error(message);
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          try {
            await createUserDocument(user, user.displayName || '', result.providerId || 'google.com');
          } catch (writeErr) {
            console.error("Firestore write error on redirect outcome:", writeErr);
          }
          toast.success("Welcome back to EverBond!");
          onAuthSuccess();
        }
      })
      .catch((err) => {
        handleAuthError(err);
      });
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all credentials.");
      return;
    }
    if (activeTab === 'signup' && !fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        try {
          await updateProfile(user, { displayName: fullName.trim() });
        } catch (profileErr) {
          console.warn("Failed to set user displayName profile:", profileErr);
        }

        try {
          await createUserDocument(user, fullName.trim(), 'password');
        } catch (dbErr) {
          console.error("Firestore write failed for registered user:", dbErr);
          toast.warning("Profile database sync pending, proceeding to onboarding.");
        }

        toast.success("Account created successfully!");
        onAuthSuccess();
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        try {
          await createUserDocument(userCredential.user, '', 'password');
        } catch (dbErr) {
          console.warn("Ensure user document exists check failed:", dbErr);
        }
        toast.success("Welcome back to EverBond!");
        onAuthSuccess();
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        await createUserDocument(user, user.displayName || '', provider.providerId);
        toast.success("Welcome to EverBond!");
      } catch (writeErr) {
        console.error("Firestore write error during social sign-in:", writeErr);
        toast.success("Welcome back to EverBond!");
      }
      onAuthSuccess();
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        console.info("Popup blocked or cancelled, falling back to signInWithRedirect...");
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          handleAuthError(redirectErr);
        }
      } else {
        handleAuthError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        padding: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Background Liquid Glass Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          pointerEvents: 'none',
          filter: 'blur(40px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 140, 196, 0.04) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-5%',
          pointerEvents: 'none',
          filter: 'blur(45px)'
        }}
      />

      {/* Close/Back Link */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 100,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color 0.2s ease'
        }}
      >
        Close <X size={16} />
      </button>

      {/* Centered Split Glassmorphism Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'var(--bg-card-glass)',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
        className="auth-split-container"
      >
        {/* LEFT SIDE: AUTH PANEL */}
        <div
          className="auth-left-col"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '32px'
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo size={36} showText={true} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Titles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>
                Secure Access
              </span>
              <h1
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text)',
                  lineHeight: 1.2
                }}
              >
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                {activeTab === 'login' 
                  ? 'Access your financial ecosystem and continue building your future.' 
                  : 'Register your sovereign EverBond ID and start building your financial legacy.'}
              </p>
            </div>

            {/* Tabs Selector */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-warm)',
                borderRadius: '12px',
                padding: '4px',
                border: '1px solid var(--border-mid)'
              }}
            >
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setEmail(''); setPassword(''); setFullName(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'login' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'login' ? T.gold : 'var(--text-faint)',
                  boxShadow: activeTab === 'login' ? 'var(--sh-xs)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setEmail(''); setPassword(''); setFullName(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'signup' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'signup' ? T.gold : 'var(--text-faint)',
                  boxShadow: activeTab === 'signup' ? 'var(--sh-xs)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeTab === 'signup' && (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', zIndex: 5 }}>
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="eb-input auth-input"
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', zIndex: 5 }}>
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="eb-input auth-input"
                />
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', zIndex: 5 }}>
                  <Key size={14} />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="eb-input auth-input"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
                  border: 'none',
                  color: '#fff',
                  padding: '13px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: 'var(--sh-gold)',
                  opacity: isLoading ? 0.75 : 1,
                  marginTop: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span>{isLoading ? 'Connecting Vault...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Social Logins Circular Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sovereign Keys</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-mid)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {/* Google Circular Button */}
              <motion.button
                whileHover={{ scale: 1.08, borderColor: T.goldMid, backgroundColor: 'var(--bg-warm)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialSignIn(googleProvider)}
                disabled={isLoading}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-str)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--sh-xs)',
                  transition: 'all 0.2s'
                }}
              >
                <GoogleIcon size={20} />
              </motion.button>

              {/* Apple Circular Button */}
              <motion.button
                whileHover={{ scale: 1.08, borderColor: T.goldMid, backgroundColor: 'var(--bg-warm)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialSignIn(appleProvider)}
                disabled={isLoading}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-str)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--sh-xs)',
                  transition: 'all 0.2s'
                }}
              >
                <AppleIcon size={20} style={{ color: 'var(--text)' }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: VISUAL SHOWCASE PANEL */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'var(--bg-warm)'
          }}
          className="auth-right-col"
        >
          {/* High-Resolution Editorial Asset Image */}
          <img
            src={authBanner}
            alt="EverBond Wealth Banner"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              transition: 'transform 0.4s ease'
            }}
          />

          {/* Premium overlay gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(18, 17, 14, 0.85) 0%, rgba(18, 17, 14, 0.25) 60%, rgba(18, 17, 14, 0.0) 100%)',
              zIndex: 2
            }}
          />

          {/* Luxury context overlay text */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: T.gold }}>
              EverBond Ecosystem
            </span>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              Collaborative Wealth Architecture
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.45 }}>
              Scale, compounding, and shared milestones mapped under a sovereign private vault.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

