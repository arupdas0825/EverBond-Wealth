import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, LineChart, Wallet, Target, 
  ChevronDown, PieChart, Flag, Award, Activity, Heart, 
  FileText, Map, Shield
} from 'lucide-react';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'income',    label: 'Income',    icon: <Wallet size={16} /> },
  { id: 'insights',  label: 'Insights',  icon: <LineChart size={16} /> },
  { id: 'partner',   label: 'Partner',   icon: <Heart size={16} /> }
];

const MORE_TABS = [
  { id: 'allocation',      label: 'Allocation',      icon: <PieChart size={14} /> },
  { id: 'goals',           label: 'Goals',           icon: <Target size={14} /> },
  { id: 'milestones',      label: 'Milestones',      icon: <Flag size={14} /> },
  { id: 'simulation',      label: 'Simulation',      icon: <Activity size={14} /> },
  { id: 'couple-planning', label: 'Couple Plan',     icon: <Map size={14} /> },
  { id: 'family-planning', label: 'Family Dynasty',  icon: <Shield size={14} /> },
  { id: 'achievements',    label: 'Journey Rewards', icon: <Award size={14} /> },
  { id: 'settings',        label: 'Documentation',   icon: <FileText size={14} /> }
];

export function FloatingNav({ page, setPage }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const openTimeout = useRef(null);
  const closeTimeout = useRef(null);
  const theme = useFinanceStore(s => s.theme);

  // Smart hover state management
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    
    if (!isMoreOpen && !openTimeout.current) {
      openTimeout.current = setTimeout(() => {
        setIsMoreOpen(true);
        openTimeout.current = null;
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = null;
    }
    
    if (!closeTimeout.current) {
      closeTimeout.current = setTimeout(() => {
        setIsMoreOpen(false);
        closeTimeout.current = null;
      }, 200);
    }
  };

  // Close dropdown on outside click (fallback)
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (openTimeout.current) clearTimeout(openTimeout.current);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const handleNav = (id) => {
    setPage(id);
    setIsMoreOpen(false);
  };

  const activeInMore = MORE_TABS.some(t => t.id === page);

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      transition: {
        duration: 0.18, // 180ms closing
        ease: 'easeOut'
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.18, // 180ms opening (Apple-style fast transition)
        ease: 'easeOut'
      }
    }
  };

  const isLight = theme === 'light';

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
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: theme === 'dark' ? '0 10px 40px rgba(0, 0, 0, 0.35)' : '0 10px 40px rgba(0, 0, 0, 0.08)'
        }}
      >
        {MAIN_TABS.map(tab => {
          const isActive = page === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
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
        })}

        {/* More Dropdown (Triggered by Smart Hover) */}
        <div 
          ref={moreRef} 
          style={{ position: 'relative' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.button
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

          <AnimatePresence>
            {isMoreOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="eb-glass-dropdown"
              >
                {MORE_TABS.map(tab => {
                  const isItemActive = page === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNav(tab.id)}
                      className="eb-dropdown-item"
                      style={{
                        background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                        color: isItemActive ? T.gold : 'var(--text-muted)',
                        fontWeight: isItemActive ? 700 : 600
                      }}
                    >
                      <span className="eb-dropdown-item-icon">{tab.icon}</span>
                      {tab.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
