import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { getNormalizedLanguage } from '../../utils/i18n';

const LANGUAGES = [
  { code: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'Español', native: 'Español', flag: '🇪🇸' },
  { code: 'Italiano', native: 'Italiano', flag: '🇮🇹' },
  { code: 'Português', native: 'Português', flag: '🇵🇹' },
  { code: 'Nederlands', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'हिन्दी', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'বাংলা', native: 'বাংলা', flag: '🇧🇩' },
  { code: '简体中文', native: '简体中文', flag: '🇨🇳' },
  { code: '日本語', native: '日本語', flag: '🇯🇵' }
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const { language: rawLanguage, setLanguage, theme } = useFinanceStore();
  const currentLanguage = getNormalizedLanguage(rawLanguage);
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDark = theme === 'dark';

  // Click outside listener for desktop dropdown
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Dispatch global event on open to coordinate with other dropdowns
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'language' }));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMenuOpened = (e) => {
      if (e.detail !== 'language') {
        setIsOpen(false);
      }
    };
    window.addEventListener('eb-menu-opened', handleMenuOpened);
    return () => window.removeEventListener('eb-menu-opened', handleMenuOpened);
  }, []);

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const selectedLangInfo = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.14, ease: 'easeIn' } }
  };

  const bottomSheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 280 } },
    exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Globe Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="eb-theme-btn-reset"
        aria-label="Select Language"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'var(--text)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.2s ease',
          outline: 'none',
          padding: 0
        }}
      >
        {isTablet ? (
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedLangInfo.flag}</span>
        ) : (
          <Globe size={18} />
        )}
      </motion.button>

      {/* Desktop & Tablet Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="eb-profile-dropdown-glass"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '180px',
                padding: '6px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                Select Language
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className="eb-profile-menu-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    background: currentLanguage === lang.code ? 'var(--gold-pale)' : 'transparent',
                    color: currentLanguage === lang.code ? T.gold : 'var(--text)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </span>
                  {currentLanguage === lang.code && <Check size={12} style={{ color: T.gold }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 99999,
                  background: 'rgba(10, 10, 10, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              />

              {/* Sheet */}
              <motion.div
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: isDark ? 'rgba(25, 23, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  borderTop: '1px solid var(--border-mid)',
                  boxShadow: '0 -10px 45px rgba(0, 0, 0, 0.15)',
                  padding: '24px 20px 40px',
                  zIndex: 100000,
                  maxHeight: '75vh',
                  overflowY: 'auto'
                }}
              >
                {/* Drag Handle */}
                <div style={{ width: '40px', height: '5px', background: 'var(--border-mid)', borderRadius: '10px', margin: '0 auto 20px' }} />
                
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 16px', textAlign: 'center' }}>
                  Select Language / भाषा चुनें
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => selectLanguage(lang.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        fontSize: '0.95rem',
                        fontWeight: currentLanguage === lang.code ? 700 : 500,
                        background: currentLanguage === lang.code ? 'var(--gold-pale)' : 'transparent',
                        color: currentLanguage === lang.code ? T.gold : 'var(--text)',
                        border: 'none',
                        borderBottom: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      {currentLanguage === lang.code && <Check size={18} style={{ color: T.gold }} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
