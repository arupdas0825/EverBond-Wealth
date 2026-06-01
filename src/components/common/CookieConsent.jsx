import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, Check, ChevronRight, Settings } from 'lucide-react';
import { T } from '../../theme/tokens';

export function CookieConsent({ onOpenPolicy }) {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  
  // Custom preference toggles local states
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [personalizationAllowed, setPersonalizationAllowed] = useState(true);

  useEffect(() => {
    // Check if consent has been recorded previously
    const consent = localStorage.getItem('eb_cookie_consent');
    if (!consent) {
      // Small visual delay before sliding in
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('eb_cookie_consent', JSON.stringify({
      analytics: true,
      personalization: true,
      timestamp: new Date().toISOString()
    }));
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('eb_cookie_consent', JSON.stringify({
      analytics: false,
      personalization: false,
      timestamp: new Date().toISOString()
    }));
    setVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('eb_cookie_consent', JSON.stringify({
      analytics: analyticsAllowed,
      personalization: personalizationAllowed,
      timestamp: new Date().toISOString()
    }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="liquid-glass"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            left: '24px', // mobile-responsive fallback
            margin: '0 auto',
            maxWidth: '420px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--gold-border)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
            borderRadius: '20px',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gold-pale, rgba(184,144,42,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.gold,
              flexShrink: 0
            }}>
              <Settings size={16} className={customizing ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block' }}>
                Privacy Preferences
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
                Cookie Preference Center
              </h4>
            </div>
          </div>

          {/* Body message */}
          <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
            We use cookies and localStorage parameters exclusively to remember your preferences (theme, stage, currency hashes) and validate your peer relationship credentials. Review our <span 
              onClick={() => onOpenPolicy('cookie')} 
              style={{ color: T.gold, textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
            >
              Cookie Policy
            </span> for details.
          </p>

          {/* Toggle preferences panel when Customize is active */}
          <AnimatePresence>
            {customizing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  overflow: 'hidden',
                  background: 'var(--bg-warm, rgba(0,0,0,0.02))',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginTop: '4px'
                }}
              >
                {/* 1. Necessary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'block' }}>Strictly Necessary</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Preserves active state database and themes.</span>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '18px',
                    borderRadius: '100px',
                    background: T.sage,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    opacity: 0.65,
                    cursor: 'not-allowed'
                  }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', marginLeft: 'auto' }} />
                  </div>
                </div>

                {/* 2. Analytics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'block' }}>Analytics & Compounding</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Calculates health scores and ledger metrics.</span>
                  </div>
                  <div 
                    onClick={() => setAnalyticsAllowed(!analyticsAllowed)}
                    style={{
                      width: '32px',
                      height: '18px',
                      borderRadius: '100px',
                      background: analyticsAllowed ? T.gold : 'var(--bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <motion.div 
                      layout
                      style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '50%', 
                        background: '#fff', 
                        marginLeft: analyticsAllowed ? 'auto' : '0' 
                      }} 
                    />
                  </div>
                </div>

                {/* 3. Personalization */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'block' }}>Personalized Projections</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Stores primary goals and compounding targets.</span>
                  </div>
                  <div 
                    onClick={() => setPersonalizationAllowed(!personalizationAllowed)}
                    style={{
                      width: '32px',
                      height: '18px',
                      borderRadius: '100px',
                      background: personalizationAllowed ? T.gold : 'var(--bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <motion.div 
                      layout
                      style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '50%', 
                        background: '#fff', 
                        marginLeft: personalizationAllowed ? 'auto' : '0' 
                      }} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
            {customizing ? (
              <>
                <button
                  onClick={() => setCustomizing(false)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm, 10px)',
                    border: '1px solid var(--border-mid)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustom}
                  style={{
                    flex: 1.5,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm, 10px)',
                    border: 'none',
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: 'var(--sh-xs)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={13} />
                  Save Preferences
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEssentialOnly}
                  style={{
                    flex: 1.2,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm, 10px)',
                    border: '1px solid var(--border-mid)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  style={{
                    flex: 1.8,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm, 10px)',
                    border: 'none',
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: 'var(--sh-xs)',
                    cursor: 'pointer'
                  }}
                >
                  Accept All
                </button>
                <button
                  onClick={() => setCustomizing(true)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm, 10px)',
                    border: 'none',
                    background: 'none',
                    color: T.gold,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '2px'
                  }}
                >
                  <Lock size={12} />
                  Customize Settings
                  <ChevronRight size={12} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
