import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, FileText, LogOut, ChevronDown, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useToast } from '../common/Toast';
import { T } from '../../theme/tokens';

export function ProfileChip({ setPage, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const toast = useToast();

  const { partner1, theme, setTheme, everBondId, logout } = useFinanceStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNav = (pageId) => {
    setPage(pageId);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);

    // Small delay for animation feel, then execute logout
    setTimeout(() => {
      // 1. Execute store logout — patches localStorage synchronously
      logout();

      // 2. Show success toast (brief)
      toast.success('Successfully signed out');

      // 3. Close modal
      setShowLogoutModal(false);
      setIsLoggingOut(false);

      // Note: OnboardingGuard reacts to onboardingComplete=false immediately.
      // No page reload needed — React state change triggers re-render to WelcomeScreen.
    }, 400);
  };

  const handleCancelLogout = () => {
    if (!isLoggingOut) setShowLogoutModal(false);
  };

  const getInitials = (name) => {
    if (!name) return 'EB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Dropdown animation: fade + scale (0.95 → 1) over 180ms
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 8,
      transition: { duration: 0.18, ease: 'easeOut' }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.18, ease: 'easeOut' }
    }
  };

  return (
    <>
      <div className="eb-profile-container" ref={menuRef} style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          className="eb-profile-chip-btn"
        >
          {/* Dynamic Circular Initials Avatar */}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)'
          }}>
            {getInitials(partner1)}
          </div>

          <span className="eb-profile-name">
            {partner1 || 'User'}
          </span>

          <ChevronDown
            className="eb-profile-chevron"
            size={12}
            style={{
              color: 'var(--text-faint)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
              flexShrink: 0
            }}
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="eb-glass-dropdown"
              style={{ width: '220px', padding: '16px 12px' }}
            >
              {/* Header: avatar, name, EverBond ID */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '0 8px 12px', borderBottom: '1px solid var(--border-mid)', marginBottom: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)'
                }}>
                  {getInitials(partner1)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {partner1 || 'User'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'monospace', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {everBondId || 'EB-AWAITING-GEN'}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button onClick={() => handleNav('profile')} className="eb-dropdown-item">
                <span className="eb-dropdown-item-icon"><User size={14} /></span>
                Profile
              </button>
              <button onClick={() => handleNav('settings')} className="eb-dropdown-item">
                <span className="eb-dropdown-item-icon"><Settings size={14} /></span>
                Settings
              </button>
              <button onClick={() => handleNav('documentation')} className="eb-dropdown-item">
                <span className="eb-dropdown-item-icon"><FileText size={14} /></span>
                Documentation
              </button>
              <button
                onClick={() => { setIsOpen(false); setTheme(theme === 'light' ? 'dark' : 'light'); }}
                className="eb-dropdown-item"
              >
                <span className="eb-dropdown-item-icon">
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                </span>
                Theme
              </button>

              <div style={{ height: '1px', background: 'var(--border-mid)', margin: '6px 0' }} />

              <button
                onClick={handleLogoutClick}
                className="eb-dropdown-item"
                style={{ color: T.rose }}
              >
                <span className="eb-dropdown-item-icon" style={{ color: T.rose }}><LogOut size={14} /></span>
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Logout Confirmation Modal (portalled to body) ── */}
      {createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 15, 15, 0.20)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '24px',
              }}
              onClick={handleCancelLogout}
            >
              <motion.div
                initial={{ scale: 0.93, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '24px',
                  padding: '36px 32px',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)',
                  position: 'relative',
                  textAlign: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--rose-lt, rgba(208,92,114,0.08))',
                  border: '1.5px solid var(--rose-border, rgba(208,92,114,0.25))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: T.rose,
                }}>
                  <LogOut size={24} />
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text)',
                  margin: '0 0 8px',
                }}>
                  Sign Out
                </h2>

                {/* Message */}
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  margin: '0 0 28px',
                  maxWidth: '300px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                  Are you sure you want to sign out of EverBond Wealth? Your financial data is safely stored and will be here when you return.
                </p>

                {/* User info pill */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: 'var(--bg-warm, rgba(184,144,42,0.04))',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '100px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 800,
                  }}>
                    {getInitials(partner1)}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
                    {partner1 || 'User'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                    {everBondId || 'EB-PENDING'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    style={{
                      flex: 1,
                      padding: '13px',
                      borderRadius: '100px',
                      border: '1.5px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                      opacity: isLoggingOut ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    style={{
                      flex: 1,
                      padding: '13px',
                      borderRadius: '100px',
                      border: 'none',
                      background: isLoggingOut
                        ? 'var(--bg-muted)'
                        : `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`,
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isLoggingOut ? 'none' : '0 6px 16px rgba(208,92,114,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isLoggingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                        />
                        Signing out…
                      </>
                    ) : (
                      <><LogOut size={14} /> Sign Out</>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
