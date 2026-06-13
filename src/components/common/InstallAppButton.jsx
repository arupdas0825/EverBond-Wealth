import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ExternalLink, X, Smartphone, Laptop, Info, ArrowUpRight, PlusSquare } from 'lucide-react';
import { T } from '../../theme/tokens';
import { usePWA } from '../welcome/usePWA';
import { useToast } from '../common/Toast';

export function InstallAppButton({ variant = 'default', style = {}, onClick }) {
  const {
    isInstalled,
    isInstallable,
    installState,
    platform,
    isStandalone,
    triggerInstallFlow,
    openApp
  } = usePWA();
  
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(
    platform.isIOS ? 'ios' : platform.isAndroid ? 'android' : 'desktop'
  );
  const toast = useToast();

  // Handle scroll lock and ESC key when modal opens
  useEffect(() => {
    if (isOpenModal) {
      // 1. Measure and lock scrollbar to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // 2. Global Escape key handler
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpenModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        // Restore styling on close
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpenModal]);

  const handleAction = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    
    if (isInstalled || installState === 'INSTALLED') {
      openApp();
      toast.info('Opening EverBond Wealth app...');
      return;
    }

    // Open our unified centered modal
    setIsOpenModal(true);
  };

  const handleConfirmNativeInstall = async (e) => {
    e.stopPropagation();
    setIsOpenModal(false); // Close modal immediately so native prompt is not obscured
    await triggerInstallFlow();
  };

  // Determine button text and icons based on status
  const isInstalledState = isInstalled || installState === 'INSTALLED';
  const buttonText = isInstalledState ? 'Open App' : 'Install App';
  const Icon = isInstalledState ? ExternalLink : Download;

  // Render trigger button depending on variant
  const renderTriggerButton = () => {
    if (variant === 'profile') {
      return (
        <button
          onClick={handleAction}
          className="eb-profile-menu-item"
          style={{
            color: isInstalledState ? T.gold : 'var(--text)',
            ...style
          }}
        >
          <span className="eb-dropdown-item-icon" style={{ color: isInstalledState ? T.gold : 'var(--text-muted)' }}>
            <Icon size={14} />
          </span>
          {buttonText}
        </button>
      );
    }

    if (variant === 'icon') {
      return (
        <button
          onClick={handleAction}
          aria-label={buttonText}
          className="eb-theme-btn-reset"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isInstalledState ? 'rgba(184, 144, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)',
            border: isInstalledState ? `1px solid ${T.gold}` : '1px solid var(--border-mid)',
            color: isInstalledState ? T.gold : 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isInstalledState ? `0 0 10px ${T.gold}30` : 'none',
            ...style
          }}
          title={isInstalledState ? 'Open EverBond app' : 'Install EverBond App'}
        >
          <Icon size={16} />
        </button>
      );
    }

    if (variant === 'navbar') {
      return (
        <motion.button
          onClick={handleAction}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: isInstalledState ? `1.5px solid ${T.gold}` : 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isInstalledState ? T.gold : '#fff',
            background: isInstalledState 
              ? 'rgba(184, 144, 42, 0.08)' 
              : `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
            boxShadow: isInstalledState ? 'none' : '0 4px 14px rgba(184, 144, 42, 0.25)',
            outline: 'none',
            transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            ...style
          }}
        >
          <Icon size={14} />
          <span>{buttonText}</span>
        </motion.button>
      );
    }

    // Default / Hero / Settings Full Button
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', ...style }}>
        <button
          onClick={handleAction}
          className="btn-primary"
          style={{
            background: isInstalledState
              ? 'rgba(184, 144, 42, 0.08)'
              : `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
            border: isInstalledState ? `1.5px solid ${T.gold}` : 'none',
            boxShadow: isInstalledState ? 'none' : 'var(--sh-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            width: '100%',
            borderRadius: '12px',
            color: isInstalledState ? T.gold : '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Icon size={18} />
          {buttonText}
        </button>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center' }}>
          {isInstalledState
            ? 'EverBond is installed. Clicking will launch the native app.'
            : isInstallable
            ? 'Install EverBond on your device for standalone access and offline load.'
            : `Manually add EverBond to your home screen using browser settings.`}
        </span>
      </div>
    );
  };

  // Render centered portal modal when active
  const renderPortalModal = () => {
    const isNativePromptAvailable = installState === 'INSTALLABLE' || isInstallable;
    
    return createPortal(
      <AnimatePresence>
        {isOpenModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'auto'
            }}
          >
            {/* Darkened Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpenModal(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 8, 6, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                touchAction: 'none' // Prevent scroll drag on mobile background
              }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                zIndex: 100001,
                width: '100%',
                // Mobile: 90%-92% width (max-width 420px). Desktop: max-width 480px.
                maxWidth: isNativePromptAvailable ? '420px' : '460px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: '24px',
                padding: '28px 24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
                color: 'var(--text)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                boxSizing: 'border-box'
              }}
            >
              {/* Close Button X (Top Right) */}
              <button
                onClick={() => setIsOpenModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  zIndex: 2
                }}
                className="eb-theme-btn-reset"
              >
                <X size={16} />
              </button>

              {/* FLOW 1: Native Installation Confirmation */}
              {isNativePromptAvailable ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', marginTop: '12px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'var(--gold-pale)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--gold-border)',
                    boxShadow: `0 8px 20px ${T.gold}15`
                  }}>
                    <Download size={28} style={{ color: T.gold }} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: T.fontDisplay }}>
                      Install EverBond Wealth
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Access your shared financial workspace directly from your desktop and mobile device with instant loading and offline capabilities.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmNativeInstall}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: 'var(--sh-gold)'
                      }}
                    >
                      Install App
                    </motion.button>
                    
                    <button
                      onClick={() => setIsOpenModal(false)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              ) : (
                /* FLOW 2: Manual Installation Guide */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Header Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--gold-pale)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--gold-border)'
                    }}>
                      <Download size={16} style={{ color: T.gold }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Install EverBond</h3>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Manual Installation Guide</p>
                    </div>
                  </div>

                  {/* Tabs for OS */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--border-thin)',
                    borderRadius: '12px',
                    padding: '3px',
                    gap: '4px'
                  }}>
                    {['ios', 'android', 'desktop'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '9px',
                          border: 'none',
                          background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                          color: activeTab === tab ? T.gold : 'var(--text-muted)',
                          fontWeight: activeTab === tab ? 700 : 500,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab === 'desktop' ? <Laptop size={12} /> : <Smartphone size={12} />}
                        {tab === 'ios' ? 'iPhone/iPad' : tab === 'android' ? 'Android' : 'Desktop'}
                      </button>
                    ))}
                  </div>

                  {/* Instruction Content area */}
                  <div style={{ minHeight: '170px', padding: '4px 0' }}>
                    {activeTab === 'ios' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>1</div>
                          <div style={stepTextStyle}>
                            Open <strong>EverBond Wealth</strong> in Safari browser on your iOS device.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>2</div>
                          <div style={stepTextStyle}>
                            Tap the <strong>Share</strong> button in the browser menu bar (looks like a square with an arrow pointing up <ArrowUpRight size={14} style={{ display: 'inline', color: T.gold }} />).
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>3</div>
                          <div style={stepTextStyle}>
                            Scroll down and select <strong>Add to Home Screen</strong> (<PlusSquare size={14} style={{ display: 'inline', color: T.gold }} />).
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>4</div>
                          <div style={stepTextStyle}>
                            Tap <strong>Add</strong> in the top-right corner to complete installation.
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'android' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>1</div>
                          <div style={stepTextStyle}>
                            Open the browser settings by tapping the <strong>three dots</strong> (⋮) in the top-right corner of Chrome.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>2</div>
                          <div style={stepTextStyle}>
                            Select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>3</div>
                          <div style={stepTextStyle}>
                            Confirm the installation by tapping <strong>Install</strong> in the dialog.
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'desktop' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>1</div>
                          <div style={stepTextStyle}>
                            In Chrome or Edge, look at the right side of the address bar at the top of your screen.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>2</div>
                          <div style={stepTextStyle}>
                            Click the <strong>App Available / Install</strong> button (looks like a monitor with a down arrow <Download size={14} style={{ display: 'inline', color: T.gold }} /> or a plus sign).
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={stepNumStyle}>3</div>
                          <div style={stepTextStyle}>
                            Alternatively, open browser options (⋮) → <strong>Save and share</strong> → <strong>Install page</strong>.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info helper */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    background: 'var(--border-thin)',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    alignItems: 'center'
                  }}>
                    <Info size={16} style={{ color: T.gold, flexShrink: 0 }} />
                    <span>PWAs install directly on your device, enabling native performance, offline work, and standalone windows.</span>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setIsOpenModal(false)}
                    className="btn-primary"
                    style={{
                      background: 'var(--text)',
                      color: 'var(--bg-card)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      marginTop: '4px'
                    }}
                  >
                    Got It
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      {renderTriggerButton()}
      {renderPortalModal()}
    </>
  );
}

const stepNumStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: 'var(--gold-pale)',
  border: '1px solid var(--gold-border)',
  color: T.gold,
  fontSize: '0.7rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '2px'
};

const stepTextStyle = {
  fontSize: '0.82rem',
  lineHeight: 1.4,
  color: 'var(--text)'
};
