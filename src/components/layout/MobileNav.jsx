import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wallet, Target, Heart, MoreHorizontal,
  LineChart, BarChart3, Settings, FileText, Activity, Users, Shield, Map, Flag
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useTranslation } from '../../utils/i18n';

// SVG Distortion Filter for Liquid Glass effect
const GlassFilter = () => (
  <svg style={{ display: 'none' }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

// Liquid Glass Wrapper Component
const LiquidGlassBox = ({ children, style = {}, theme = 'dark', borderRadius = '28px', className = '' }) => {
  const isDark = theme === 'dark';
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius,
    boxShadow: isDark
      ? '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(0, 0, 0, 0.25)'
      : '0 10px 30px rgba(0, 0, 0, 0.12), 0 0 20px rgba(255, 255, 255, 0.3)',
    transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
    transition: 'all 0.4s ease',
    ...style
  };

  const bgOverlay = isDark ? 'rgba(15, 20, 32, 0.65)' : 'rgba(255, 255, 255, 0.45)';
  const highlightBoxShadow = isDark
    ? 'inset 1.5px 1.5px 1px 0 rgba(255, 255, 255, 0.2), inset -1px -1px 1px 1px rgba(0, 0, 0, 0.4)'
    : 'inset 2px 2px 1px 0 rgba(255, 255, 255, 0.6), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.4)';

  return (
    <div className={`eb-liquid-glass ${className}`} style={containerStyle}>
      {/* Layer 1: Glass Distortion & Blur */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          borderRadius: borderRadius,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          filter: 'url(#glass-distortion)',
          isolation: 'isolate'
        }}
      />
      {/* Layer 2: Semi-transparent Tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: borderRadius,
          background: bgOverlay
        }}
      />
      {/* Layer 3: Inset Specular Border Reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          overflow: 'hidden',
          borderRadius: borderRadius,
          boxShadow: highlightBoxShadow,
          pointerEvents: 'none'
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export function MobileNav({ page, setPage, onReset }) {
  const theme = useFinanceStore(s => s.theme);
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);
  const partnerRef = useRef(null);
  const partnerButtonRef = useRef(null);

  const MAIN_TABS = [
    { key: "dashboard",  icon: LayoutDashboard, label: "Dashboard" },
    { key: "income",     icon: Wallet,          label: "Income" },
    { key: "allocation", icon: BarChart3,       label: "Allocation" },
    { key: "insights",   icon: LineChart,       label: "Insights" }
  ];

  const PARTNER_TABS = [
    { id: 'partner-committed', label: 'Committed Partners', icon: <Heart size={16} /> },
    { id: 'partner-family',    label: 'Family Dynasty',     icon: <Shield size={16} /> }
  ];

  const MORE_TABS = [
    { id: 'goals',           label: 'Goals',           icon: <Target size={16} /> },
    { id: 'milestones',      label: 'Milestones',      icon: <Flag size={16} /> },
    { id: 'simulation',      label: 'Simulation',      icon: <Activity size={16} /> },
    { id: 'documentation',   label: 'Documentation',   icon: <FileText size={16} /> },
    { id: 'settings',        label: 'Settings',        icon: <Settings size={16} /> }
  ];

  const mainTabs = MAIN_TABS.map(tab => ({
    ...tab,
    label: t(tab.key, tab.label)
  }));

  const partnerTabs = PARTNER_TABS.map(tab => ({
    ...tab,
    label: tab.id === 'partner-committed' ? t('partner', 'Partner') : t('family', 'Family')
  }));

  const moreTabs = MORE_TABS.map(tab => ({
    ...tab,
    label: t(tab.id, tab.label)
  }));

  // Click outside "More" or "Partner" drawer
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target) &&
          moreButtonRef.current && !moreButtonRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
      if (partnerRef.current && !partnerRef.current.contains(e.target) &&
          partnerButtonRef.current && !partnerButtonRef.current.contains(e.target)) {
        setIsPartnerOpen(false);
      }
    };
    if (isMoreOpen || isPartnerOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isMoreOpen, isPartnerOpen]);

  // Dispatch 'eb-menu-opened' when More menu opens on mobile
  useEffect(() => {
    if (isMoreOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'more-mobile' }));
    }
  }, [isMoreOpen]);

  // Dispatch 'eb-menu-opened' when Partner menu opens on mobile
  useEffect(() => {
    if (isPartnerOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'partner-mobile' }));
    }
  }, [isPartnerOpen]);

  // Close when other menus are opened
  useEffect(() => {
    const handleMenuOpened = (e) => {
      if (e.detail !== 'more-mobile') {
        setIsMoreOpen(false);
      }
      if (e.detail !== 'partner-mobile') {
        setIsPartnerOpen(false);
      }
    };
    window.addEventListener('eb-menu-opened', handleMenuOpened);
    return () => window.removeEventListener('eb-menu-opened', handleMenuOpened);
  }, []);

  // Escape key handler to close the drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
        setIsPartnerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNav = (id) => {
    setPage(id);
    setIsMoreOpen(false);
    setIsPartnerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      transition: { duration: 0.14, ease: 'easeOut' }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.18, ease: 'easeOut' }
    }
  };

  const activeInMore = MORE_TABS.some(t => t.id === page);
  const activeInPartner = page === 'partner-committed' || page === 'partner-family';

  return (
    <>
      <GlassFilter />

      <AnimatePresence>
        {(isMoreOpen || isPartnerOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1999,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
            }}
          />
        )}
      </AnimatePresence>

      <div 
        className="eb-mobile-nav" 
        style={{
          position: 'fixed',
          bottom: 'calc(16px + env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          width: 'calc(100% - 32px)',
          maxWidth: '430px',
          display: 'block',
        }}
      >
        {/* Partner Dropdown Drawer with Liquid Glass */}
        <AnimatePresence>
          {isPartnerOpen && (
            <motion.div
              ref={partnerRef}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ marginBottom: '12px' }}
            >
              <LiquidGlassBox theme={theme} borderRadius="24px" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {partnerTabs.map(tab => {
                    const isItemActive = page === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNav(tab.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px', borderRadius: '16px',
                          border: 'none', background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                          color: isItemActive ? T.gold : 'var(--text)',
                          fontSize: '0.8rem', fontWeight: isItemActive ? 700 : 500,
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
                          width: '100%'
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </LiquidGlassBox>
            </motion.div>
          )}
        </AnimatePresence>

        {/* More Dropdown Drawer with Liquid Glass */}
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              ref={moreRef}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ marginBottom: '12px' }}
            >
              <LiquidGlassBox theme={theme} borderRadius="24px" style={{ padding: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {moreTabs.map(tab => {
                    const isItemActive = page === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNav(tab.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px', borderRadius: '16px',
                          border: 'none', background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                          color: isItemActive ? T.gold : 'var(--text)',
                          fontSize: '0.8rem', fontWeight: isItemActive ? 700 : 500,
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 2.2)'
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </LiquidGlassBox>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation Bar with Liquid Glass */}
        <LiquidGlassBox theme={theme} borderRadius="28px" style={{ padding: '6px 8px' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              position: 'relative'
            }}
          >
            {mainTabs.map(item => {
              const isActive = page === item.key && !isMoreOpen && !isPartnerOpen;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    background: 'none', border: 'none',
                    color: isActive ? T.gold : 'var(--text-faint)',
                    padding: '8px 10px', borderRadius: '20px',
                    cursor: 'pointer', flex: 1, position: 'relative',
                    transition: 'color 0.3s'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: '20px',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(184,144,42,0.12)',
                        boxShadow: theme === 'dark' ? 'inset 0 0 10px rgba(255,255,255,0.1)' : 'inset 0 0 10px rgba(184,144,42,0.15)'
                      }}
                    />
                  )}
                  <Icon size={isActive ? 22 : 20} style={{ position: 'relative', zIndex: 1 }} />
                  <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 700 : 500, position: 'relative', zIndex: 1 }}>{item.label}</span>
                </button>
              );
            })}

            <button
              ref={partnerButtonRef}
              onClick={() => setIsPartnerOpen(!isPartnerOpen)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                background: 'none', border: 'none',
                color: isPartnerOpen || activeInPartner ? T.gold : 'var(--text-faint)',
                padding: '8px 10px', borderRadius: '20px',
                cursor: 'pointer', flex: 1, position: 'relative',
                transition: 'color 0.3s'
              }}
            >
              {(isPartnerOpen || activeInPartner) && (
                <motion.div
                  layoutId="mobileActiveTab"
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(184,144,42,0.12)',
                    boxShadow: theme === 'dark' ? 'inset 0 0 10px rgba(255,255,255,0.1)' : 'inset 0 0 10px rgba(184,144,42,0.15)'
                  }}
                />
              )}
              <Heart size={(isPartnerOpen || activeInPartner) ? 22 : 20} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ fontSize: '0.55rem', fontWeight: (isPartnerOpen || activeInPartner) ? 700 : 500, position: 'relative', zIndex: 1 }}>{t('partner', 'Partner')}</span>
            </button>

            <button
              ref={moreButtonRef}
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                background: 'none', border: 'none',
                color: isMoreOpen || activeInMore ? T.gold : 'var(--text-faint)',
                padding: '8px 10px', borderRadius: '20px',
                cursor: 'pointer', flex: 1, position: 'relative',
                transition: 'color 0.3s'
              }}
            >
              {(isMoreOpen || activeInMore) && (
                <motion.div
                  layoutId="mobileActiveTab"
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(184,144,42,0.12)',
                    boxShadow: theme === 'dark' ? 'inset 0 0 10px rgba(255,255,255,0.1)' : 'inset 0 0 10px rgba(184,144,42,0.15)'
                  }}
                />
              )}
              <MoreHorizontal size={(isMoreOpen || activeInMore) ? 22 : 20} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ fontSize: '0.55rem', fontWeight: (isMoreOpen || activeInMore) ? 700 : 500, position: 'relative', zIndex: 1 }}>{t('more', 'More')}</span>
            </button>
          </div>
        </LiquidGlassBox>
      </div>
    </>
  );
}
