import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Lock, FileText, CheckCircle } from 'lucide-react';
import { T } from '../../theme/tokens';

const drawerVariants = {
  hidden: { x: '100%', opacity: 0.9 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 240, damping: 26 } 
  },
  exit: { 
    x: '100%', 
    opacity: 0.9,
    transition: { duration: 0.25, ease: 'easeIn' } 
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export function PrivacyDrawer({ activeDoc, onClose }) {
  if (!activeDoc) return null;

  const getDocTitle = () => {
    if (activeDoc === 'terms') return 'Terms of Service';
    if (activeDoc === 'privacy') return 'Privacy Policy';
    if (activeDoc === 'cookie') return 'Cookie Policy';
    if (activeDoc === 'data-handling') return 'Data Handling & Privacy';
    return 'Policy Document';
  };

  const getDocIcon = () => {
    if (activeDoc === 'terms') return <FileText size={20} style={{ color: T.gold }} />;
    if (activeDoc === 'privacy') return <Shield size={20} style={{ color: T.sage }} />;
    if (activeDoc === 'data-handling') return <CheckCircle size={20} style={{ color: T.goldMid }} />;
    return <Lock size={20} style={{ color: T.sky }} />;
  };

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 8, 0.4)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9000,
        }}
      />

      {/* Slide-Out Side Panel */}
      <motion.div
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="liquid-glass"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          borderLeft: '1.5px solid var(--border-mid)',
          boxShadow: '0 0 50px rgba(0,0,0,0.15)',
          zIndex: 9001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-warm, rgba(0,0,0,0.01))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getDocIcon()}
            <h3 style={{
              fontFamily: T.fontDisplay,
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--text)',
              margin: 0,
            }}>
              {getDocTitle()}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-mid)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 28px',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: 'var(--text-muted)',
        }}>
          {activeDoc === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>
                Last Updated: June 2026
              </span>
              
              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                1. Agreement to Terms
              </h4>
              <p style={{ margin: 0 }}>
                Welcome to EverBond Wealth (the "Platform"). By creating an account, authenticating via Google OAuth, or using our wealth planning features, you agree to enter a legally binding contract governed by these Terms of Service. If you do not agree, you must immediately cease all access to the Platform.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                2. Platform Description & Intended Use
              </h4>
              <p style={{ margin: 0 }}>
                EverBond Wealth provides client-side cash flow ledgers, asset allocation templates, and collaborative wealth modeling systems. It acts as an interactive visualization database. You are fully responsible for all financial targets, milestones, and data exports created through your account.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                3. Data Sovereignty & Account Ownership
              </h4>
              <p style={{ margin: 0 }}>
                You hold absolute and sovereign title to your financial profile data. While login profiles are authorized securely through Firebase Authentication and public profile metadata is stored in our database, the core financial ledger caches live locally on your browser console. We assume no backup custody or restoration duties for local caches.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                4. Fiduciary Disclaimer & Financial Advice
              </h4>
              <p style={{ margin: 0 }}>
                <strong>EverBond Wealth is not a registered investment advisor, broker-dealer, or tax planner.</strong> All wealth calculations, compounding timelines, growth simulations, and interest projections are mathematical estimates and do not represent guaranteed outcomes. Consult a qualified fiduciary before committing funds to any asset classes.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                5. Link Nodes & Joint Accounts
              </h4>
              <p style={{ margin: 0 }}>
                Sharing your unique EverBond ID invites other users to sync with your Cash Flow boards. You warrant that you have obtained your partner's full consent before linking nodes. You can terminate the shared connection link at any time from Settings.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                6. Limit of Liability
              </h4>
              <p style={{ margin: 0 }}>
                To the maximum extent permitted by law, EverBond Wealth and its operators shall not be liable for any financial losses, investment underperformance, local browser cache deletion, or database sync errors.
              </p>
            </div>
          )}

          {activeDoc === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.sage }}>
                Last Updated: June 2026
              </span>

              <div style={{
                background: 'var(--sage-lt, rgba(78,155,120,0.06))',
                border: '1px solid var(--sage-border, rgba(78,155,120,0.18))',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <CheckCircle size={18} style={{ color: T.sage, marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600 }}>
                  Enterprise-Grade Security: Direct double-blind token validations.
                </span>
              </div>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                1. Data Privacy Principles
              </h4>
              <p style={{ margin: 0 }}>
                Your financial privacy is built directly into our app architecture. We operate under a strict zero-telemetry mandate: we do not sell your personal cash flow coordinates, track your browsing behavior, or display promotional marketing ads.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                2. Information We Access (Google Profile)
              </h4>
              <p style={{ margin: 0 }}>
                When you sign in using Google OAuth, the Platform requests permission to read only your public identity parameters: Full Name, Email Address, Profile Picture URL, and Account Metadata. We use these fields solely to provision and secure your EverBond node.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                3. Password Protection Shield
              </h4>
              <p style={{ margin: 0 }}>
                <strong>We never access, view, or store your Google Account password.</strong> Authentication verification is completed directly and securely on Google's authorization servers, which pass an encrypted session token to Firebase Authentication.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                4. Data Storage & Encryption
              </h4>
              <p style={{ margin: 0 }}>
                Profile records are stored on secure cloud database systems (Firestore) and validated via SSL/TLS encryption. Client-side financial ledger details (milestones, assets, budgets) are stored in your localized browser cookies (`localStorage`) using AES-256 equivalent containment.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                5. Complete Data Purge
              </h4>
              <p style={{ margin: 0 }}>
                You maintain a complete right to be forgotten. Under Settings, you can download a full backup JSON using "Export My Data" or permanently wipe your account history, Google identity mapping, and Firestore documents using "Delete Account".
              </p>
            </div>
          )}

          {activeDoc === 'cookie' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.sky }}>
                Last Updated: June 2026
              </span>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                1. Local Caching Infrastructure
              </h4>
              <p style={{ margin: 0 }}>
                EverBond Wealth uses browser cache sandboxes (`localStorage`) and session structures to operate. Unlike other platforms, we do not deploy commercial tracking cookies, retargeting scripts, or advertising widgets.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                2. Functional Cookies & Storage Parameters
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>`eb_v6`</strong>: Holds your localized financial parameters, allocations, income ledger index, and partner link codes.</li>
                <li><strong>`data-theme`</strong>: Remembers your Light/Dark interface setting.</li>
                <li><strong>`eb_cookie_consent`</strong>: Remembers if you have acknowledged cookie terms to suppress banners on repeat sessions.</li>
              </ul>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                3. Clearing Local Caches
              </h4>
              <p style={{ margin: 0 }}>
                Essential storage is required for platform operations. Clearing your browser's history or cookie caches will wipe your local financial records. Ensure you keep an exported backup copy from Settings to prevent data loss.
              </p>
            </div>
          )}

          {activeDoc === 'data-handling' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.goldMid }}>
                Last Updated: June 2026
              </span>
              
              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                Google OAuth Data Access
              </h4>
              <p style={{ margin: 0 }}>
                EverBond Wealth uses Google Authentication (OAuth 2.0) to authorize your login sessions securely. We request permission only to access your basic, public-facing Google profile information.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                Authorized Scope & Accessed Fields
              </h4>
              <p style={{ margin: 0 }}>
                We only read and store the following profile fields from your Google Identity card:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Full Name:</strong> Used to personalize your dashboard greeting and milestones.</li>
                <li><strong>Email Address:</strong> Serves as your unique user account identifier.</li>
                <li><strong>Profile Image URL:</strong> Displayed on your top-right profile chip.</li>
                <li><strong>Account Metadata:</strong> Google account creation time and authentication token parameters used to manage active sessions.</li>
              </ul>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0' }}>
                Absolute Protections
              </h4>
              <p style={{ margin: 0 }}>
                <strong>We never access or store your Google password.</strong> Your password verification is handled directly and securely by Google's own authentication servers, which issue a secure token back to the Firebase Authentication service.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-warm, rgba(0,0,0,0.01))',
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 'var(--r-pill)',
              background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
              border: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            I Acknowledge
          </button>
        </div>
      </motion.div>
    </>
  );
}
