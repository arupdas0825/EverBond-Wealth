import React, { useState } from 'react';
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
  
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeTab, setActiveTab] = useState(
    platform.isIOS ? 'ios' : platform.isAndroid ? 'android' : 'desktop'
  );
  const toast = useToast();

  const handleAction = async (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    
    if (isInstalled || installState === 'INSTALLED') {
      openApp();
      toast.info('Opening EverBond Wealth app...');
      return;
    }

    if (installState === 'INSTALLABLE' || isInstallable) {
      const result = await triggerInstallFlow();
      return;
    }

    // Otherwise, show manual install modal
    setShowManualModal(true);
  };

  // Determine button text and icons based on status
  const isInstalledState = isInstalled || installState === 'INSTALLED';
  const buttonText = isInstalledState ? 'Open App' : 'Install App';
  const Icon = isInstalledState ? ExternalLink : Download;

  // Render variants
  if (variant === 'profile') {
    return (
      <>
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
        {renderManualModal()}
      </>
    );
  }

  if (variant === 'icon') {
    return (
      <>
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
        {renderManualModal()}
      </>
    );
  }

  if (variant === 'navbar') {
    return (
      <>
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
        {renderManualModal()}
      </>
    );
  }

  // Default / Hero / Settings Full Button
  return (
    <>
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
      {renderManualModal()}
    </>
  );

  // Manual Installation Instructions Modal
  function renderManualModal() {
    return (
      <AnimatePresence>
        {showManualModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <div 
              style={{ position: 'absolute', inset: 0 }} 
              onClick={() => setShowManualModal(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '430px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: 'var(--sh-xl)',
                color: 'var(--text)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Install EverBond</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Manual Installation Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs for OS type */}
              <div style={{
                display: 'flex',
                background: 'var(--border-thin)',
                borderRadius: '12px',
                padding: '3px',
                gap: '4px'
              }}>
                <button
                  onClick={() => setActiveTab('ios')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'ios' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'ios' ? T.gold : 'var(--text-muted)',
                    fontWeight: activeTab === 'ios' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Smartphone size={14} /> iPhone/iPad
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'android' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'android' ? T.gold : 'var(--text-muted)',
                    fontWeight: activeTab === 'android' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Smartphone size={14} /> Android
                </button>
                <button
                  onClick={() => setActiveTab('desktop')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'desktop' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'desktop' ? T.gold : 'var(--text-muted)',
                    fontWeight: activeTab === 'desktop' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Laptop size={14} /> Desktop
                </button>
              </div>

              {/* Instructions list */}
              <div style={{ padding: '4px 0', minHeight: '180px' }}>
                {activeTab === 'ios' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>1</div>
                      <div style={stepTextStyle}>
                        Open <strong>EverBond Wealth</strong> website in Safari browser on your iOS device.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>2</div>
                      <div style={stepTextStyle}>
                        Tap the <strong>Share</strong> button in the browser toolbar (looks like a square with an arrow pointing up <ArrowUpRight size={14} style={{ display: 'inline', verticalAlign: 'middle', color: T.gold }} />).
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>3</div>
                      <div style={stepTextStyle}>
                        Scroll down and select <strong>Add to Home Screen</strong> (<PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', color: T.gold }} />).
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>4</div>
                      <div style={stepTextStyle}>
                        Tap <strong>Add</strong> in the top right corner to complete the process.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>1</div>
                      <div style={stepTextStyle}>
                        Open browser settings menu by tapping the <strong>three dots</strong> (⋮) in the top-right corner of Chrome.
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
                        Confirm the installation by tapping <strong>Install</strong> in the prompt.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'desktop' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>1</div>
                      <div style={stepTextStyle}>
                        In Chrome or Edge, look at the right side of the address bar at the top of the browser.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>2</div>
                      <div style={stepTextStyle}>
                        Click the <strong>App Available / Install</strong> icon (looks like a monitor with a down arrow <Download size={14} style={{ display: 'inline', verticalAlign: 'middle', color: T.gold }} /> or a plus sign).
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={stepNumStyle}>3</div>
                      <div style={stepTextStyle}>
                        Alternatively, open the browser menu (⋮) → <strong>Save and share</strong> → <strong>Install page</strong>.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Banner */}
              <div style={{
                display: 'flex',
                gap: '10px',
                background: 'var(--border-thin)',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                alignItems: 'center'
              }}>
                <Info size={16} style={{ color: T.gold, flexShrink: 0 }} />
                <span>Installing creates a native-feeling experience with offline capability and dock/home screen launching.</span>
              </div>

              {/* Close Action */}
              <button
                onClick={() => setShowManualModal(false)}
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
                  textAlign: 'center'
                }}
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
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
  fontSize: '0.8rem',
  lineHeight: 1.4,
  color: 'var(--text)'
};
