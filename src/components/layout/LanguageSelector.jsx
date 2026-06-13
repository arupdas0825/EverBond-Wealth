import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { getNormalizedLanguage } from '../../utils/i18n';

const LANGUAGES = [
  { code: 'English', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'Deutsch', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'Français', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'Español', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'Italiano', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'Português', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'Nederlands', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'Svenska', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  { code: 'Norsk', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴' },
  { code: 'Dansk', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
  { code: 'Polski', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'Čeština', name: 'Czech', native: 'Čeština', flag: '🇨🇿' },
  { code: 'Magyar', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺' },
  { code: 'Română', name: 'Romanian', native: 'Română', flag: '🇷🇴' },
  { code: 'Türkçe', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'Русский', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'Українська', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'Arabic', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'हिन्दी', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'বাংলা', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: '简体中文', name: 'Chinese', native: '简体中文', flag: '🇨🇳' },
  { code: '日本語', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'Korean', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'Thai', name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  { code: 'Vietnamese', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'Indonesian', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'Malay', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' }
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  
  const { language: rawLanguage, setLanguage, theme } = useFinanceStore();
  const currentLanguage = getNormalizedLanguage(rawLanguage);
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isDark = theme === 'dark';

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const selectedLangInfo = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

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
    <div 
      ref={containerRef} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {/* Globe Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => { if (isMobile) setIsOpen(!isOpen); }}
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
        <Globe size={18} />
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
                top: '44px',
                right: 0,
                width: '240px',
                padding: '8px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '380px',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                Select Language
              </div>
              {LANGUAGES.map(lang => {
                const isActive = currentLanguage === lang.code;
                return (
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
                      background: isActive ? 'var(--gold-pale)' : 'transparent',
                      color: isActive ? T.gold : 'var(--text)',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem' }}>{lang.flag}</span>
                      <span>{lang.name} <span style={{ fontSize: '0.74rem', opacity: 0.6 }}>({lang.native})</span></span>
                    </span>
                    {isActive && <Check size={12} style={{ color: T.gold }} />}
                  </button>
                );
              })}
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
                  {LANGUAGES.map(lang => {
                    const isActive = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => selectLanguage(lang.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          fontSize: '0.92rem',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? 'var(--gold-pale)' : 'transparent',
                          color: isActive ? T.gold : 'var(--text)',
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
                          <span>{lang.name} <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>({lang.native})</span></span>
                        </span>
                        {isActive && <Check size={18} style={{ color: T.gold }} />}
                      </button>
                    );
                  })}
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
