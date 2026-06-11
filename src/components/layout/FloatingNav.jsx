import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, LineChart, Wallet, Target, 
  ChevronDown, PieChart, Flag, Activity, Heart, 
  FileText, Map, Shield, Settings
} from 'lucide-react';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';

const MAIN_TABS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  { id: 'income',     label: 'Income',     icon: <Wallet size={16} /> },
  { id: 'allocation', label: 'Allocation', icon: <PieChart size={16} /> },
  { id: 'insights',   label: 'Insights',   icon: <LineChart size={16} /> }
];

const PARTNER_TABS = [
  { id: 'partner-committed', label: 'Committed Partners', icon: <Heart size={14} /> },
  { id: 'partner-family',    label: 'Family Dynasty',     icon: <Shield size={14} /> }
];

const MORE_TABS = [
  { id: 'goals',           label: 'Goals',           icon: <Target size={14} /> },
  { id: 'milestones',      label: 'Milestones',      icon: <Flag size={14} /> },
  { id: 'simulation',      label: 'Simulation',      icon: <Activity size={14} /> },
  { id: 'documentation',   label: 'Documentation',   icon: <FileText size={14} /> },
  { id: 'settings',        label: 'Settings',        icon: <Settings size={14} /> }
];

const NavButton = React.memo(({ tab, isActive, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: isActive ? 700 : 600,
        color: isActive ? '#fff' : 'var(--text-muted)',
        background: 'transparent',
        position: 'relative',
        outline: 'none'
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '999px',
            background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
            zIndex: 0,
            boxShadow: `0 4px 14px ${T.gold}40`
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {tab.icon}
        {tab.label}
      </span>
    </motion.button>
  );
});

export function FloatingNav({ page, setPage }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  
  const moreRef = useRef(null);
  const partnerRef = useRef(null);
  
  const theme = useFinanceStore(s => s.theme);

  const handlePartnerClick = useCallback((e) => {
    e.stopPropagation();
    setIsPartnerOpen(prev => !prev);
    setIsMoreOpen(false);
  }, []);

  const handleMoreClick = useCallback((e) => {
    e.stopPropagation();
    setIsMoreOpen(prev => !prev);
    setIsPartnerOpen(false);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
      if (partnerRef.current && !partnerRef.current.contains(e.target)) {
        setIsPartnerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Dispatch 'eb-menu-opened' when More menu opens
  useEffect(() => {
    if (isMoreOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'more' }));
    }
  }, [isMoreOpen]);

  // Dispatch 'eb-menu-opened' when Partner menu opens
  useEffect(() => {
    if (isPartnerOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'partner' }));
    }
  }, [isPartnerOpen]);

  // Listen to global open menu events to close if another one opens
  useEffect(() => {
    const handleMenuOpened = (e) => {
      if (e.detail !== 'more') {
        setIsMoreOpen(false);
      }
      if (e.detail !== 'partner') {
        setIsPartnerOpen(false);
      }
    };
    window.addEventListener('eb-menu-opened', handleMenuOpened);
    return () => window.removeEventListener('eb-menu-opened', handleMenuOpened);
  }, []);

  // Escape key handler to close the dropdowns
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

  const handleNav = useCallback((id) => {
    setPage(id);
    setIsMoreOpen(false);
  }, [setPage]);

  const handlePartnerNav = useCallback((id) => {
    setPage(id);
    setIsPartnerOpen(false);
  }, [setPage]);

  const activeInMore = MORE_TABS.some(t => t.id === page);
  const activeInPartner = page === 'partner-committed' || page === 'partner-family';

  return (
    <div className="hide-on-mobile" style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          borderRadius: '999px',
          background: theme === 'dark' ? 'rgba(15, 20, 30, 0.65)' : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: theme === 'dark' ? '0 10px 40px rgba(0, 0, 0, 0.35)' : '0 10px 40px rgba(0, 0, 0, 0.08)'
        }}
      >
        {MAIN_TABS.map(tab => (
          <NavButton
            key={tab.id}
            tab={tab}
            isActive={page === tab.id}
            onClick={() => handleNav(tab.id)}
          />
        ))}

        {/* Partner Dropdown */}
        <div 
          ref={partnerRef} 
          className={`eb-nav-dropdown-container partner-container ${isPartnerOpen ? 'eb-open' : ''}`}
          style={{ position: 'relative' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={handlePartnerClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeInPartner ? 700 : 600,
              color: activeInPartner ? '#fff' : 'var(--text-muted)',
              background: 'transparent',
              position: 'relative',
              outline: 'none'
            }}
          >
            {activeInPartner && (
              <motion.div
                layoutId="activeTabPill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '999px',
                  background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                  zIndex: 0,
                  boxShadow: `0 4px 14px ${T.gold}40`
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={16} /> Partner <ChevronDown size={14} style={{ transform: isPartnerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </span>
          </motion.button>

          <div className="eb-partner-glass-dropdown">
            {PARTNER_TABS.map(tab => {
              const isItemActive = page === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handlePartnerNav(tab.id)}
                  className="eb-dropdown-item"
                  style={{
                    background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                    color: isItemActive ? T.gold : (theme === 'dark' ? '#f3f4f6' : '#111827'),
                    fontWeight: isItemActive ? 700 : 600
                  }}
                >
                  <span 
                    className="eb-dropdown-item-icon" 
                    style={{ color: isItemActive ? T.gold : (theme === 'dark' ? '#9ca3af' : '#374151') }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* More Dropdown */}
        <div 
          ref={moreRef} 
          className={`eb-nav-dropdown-container more-container ${isMoreOpen ? 'eb-open' : ''}`}
          style={{ position: 'relative' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={handleMoreClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeInMore ? 700 : 600,
              color: activeInMore ? '#fff' : 'var(--text-muted)',
              background: 'transparent',
              position: 'relative',
              outline: 'none'
            }}
          >
            {activeInMore && (
              <motion.div
                layoutId="activeTabPill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '999px',
                  background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                  zIndex: 0,
                  boxShadow: `0 4px 14px ${T.gold}40`
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              More <ChevronDown size={14} style={{ transform: isMoreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </span>
          </motion.button>

          <div className="eb-glass-dropdown">
            {MORE_TABS.map(tab => {
              const isItemActive = page === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id)}
                  className="eb-dropdown-item"
                  style={{
                    background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                    color: isItemActive ? T.gold : (theme === 'dark' ? '#f3f4f6' : '#111827'),
                    fontWeight: isItemActive ? 700 : 600
                  }}
                >
                  <span 
                    className="eb-dropdown-item-icon" 
                    style={{ color: isItemActive ? T.gold : (theme === 'dark' ? '#9ca3af' : '#374151') }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
