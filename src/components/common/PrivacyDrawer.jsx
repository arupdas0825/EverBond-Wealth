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
    return 'Policy Document';
  };

  const getDocIcon = () => {
    if (activeDoc === 'terms') return <FileText size={20} style={{ color: T.gold }} />;
    if (activeDoc === 'privacy') return <Shield size={20} style={{ color: T.sage }} />;
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
              
              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                1. General Sovereign Terms
              </h4>
              <p style={{ margin: 0 }}>
                Welcome to EverBond Wealth (the "Platform"). By initiating your onboarding setup and deploying your localized financial ledger, you agree to these Terms of Service. EverBond Wealth operates strictly as a client-side database model that compounds, forecasts, and visualizes financial allocations.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                2. No Investment Advice
              </h4>
              <p style={{ margin: 0 }}>
                All growth simulations, interest compounding calculations, and percentage allocations are mathematical estimates generated for illustrative planning. They do not constitute financial advice, tax declarations, or official investment mandates. Always consult a certified fiduciary before executing major market transfers.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                3. Collaborative Peer Linkage
              </h4>
              <p style={{ margin: 0 }}>
                The EverBond ID linking system allows user profiles to merge into committed budgets. By transmitting your unique identity key (`EB-XXXXXX`) to another user, you authorize mutual permission to view, update, and balance joint milestones, salaries, and projections. You can sever this connection node at any time via Settings, which will instantly split the shared caches.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                4. Database Sovereignty & Limits
              </h4>
              <p style={{ margin: 0 }}>
                You maintain absolute title to your local state caches. Since we do not host your profiles on centralized corporate storage, you are solely responsible for exporting sovereign ledger backup JSON files from Settings. We are not liable for data loss arising from cleared browser cookies or hardware failures.
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
                  Decentralized Sovereign Sandboxing: Zero Server Data Storage.
                </span>
              </div>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                1. Sovereign Privacy First
              </h4>
              <p style={{ margin: 0 }}>
                EverBond Wealth is built on a "Privacy by Architecture" philosophy. We believe that your intimate relationship finances should not live on centralized corporate servers. Consequently, 100% of your entered profiles, salary lists, budget allocations, and relationship dates are stored directly inside your browser's local sandbox (`localStorage`).
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                2. No Tracking and No Ads
              </h4>
              <p style={{ margin: 0 }}>
                We run no ad-retargeting pixels, no marketing tracker scripts, and no commercial tracking code. Your sovereignty is protected. We have zero interest in selling or capitalizing on your financial behavior metrics.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                3. Encryption & Future Syncing
              </h4>
              <p style={{ margin: 0 }}>
                In future production iterations incorporating encrypted real-time cloud synchronizations, all database transmissions will be fully encrypted client-side using double-blind payloads. EverBond will never hold the keys to view your financial numbers.
              </p>
            </div>
          )}

          {activeDoc === 'cookie' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.sky }}>
                Last Updated: June 2026
              </span>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                1. Local Preference Storage Only
              </h4>
              <p style={{ margin: 0 }}>
                We use the term "cookies" to encompass local storage sandboxes (`localStorage`) and essential browser session structures. Unlike traditional sites that use cookies to track you across the web, EverBond Wealth uses these tools strictly to operate the platform.
              </p>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                2. What We Save Locally
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>`eb_v6`</strong>: Persists your financial profile, salary targets, stage upgrade parameters, and EverBond ID relationship nodes.</li>
                <li><strong>`data-theme`</strong>: Remembers your preference between Light and Dark visual theme systems.</li>
                <li><strong>`eb_cookie_consent`</strong>: Tracks whether you have agreed to cookie selections to avoid showing banners on repeat visits.</li>
              </ul>

              <h4 style={{ color: 'var(--text)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px' }}>
                3. Managing Preferences
              </h4>
              <p style={{ margin: 0 }}>
                Essential storage is required for the application to function. You can clear your localized memory storage at any time using your browser's developer console or the "Danger Zone" section inside the Settings page. Note that doing so will completely reset all financial ledgers.
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
