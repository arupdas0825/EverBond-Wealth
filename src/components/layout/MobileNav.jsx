import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wallet, Target, Heart, MoreHorizontal,
  LineChart, BarChart3, Award, Settings, FileText, Activity, Users, Shield, Map, Flag
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function MobileNav({ page, setPage, onReset }) {
  const theme = useFinanceStore(s => s.theme);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);

  const MAIN_TABS = [
    { key: "dashboard",  icon: LayoutDashboard, label: "Dashboard" },
    { key: "income",     icon: Wallet,          label: "Income" },
    { key: "allocation", icon: BarChart3,       label: "Allocation" },
    { key: "insights",   icon: LineChart,       label: "Insights" },
    { key: "partner",    icon: Heart,           label: "Partner" }
  ];

  const MORE_TABS = [
    { id: 'goals',           label: 'Goals',           icon: <Target size={16} /> },
    { id: 'milestones',      label: 'Milestones',      icon: <Flag size={16} /> },
    { id: 'achievements',    label: 'Journey Rewards', icon: <Award size={16} /> },
    { id: 'simulation',      label: 'Simulation',      icon: <Activity size={16} /> },
    { id: 'couple-planning', label: 'Couple Plan',     icon: <Map size={16} /> },
    { id: 'family-planning', label: 'Family Dynasty',  icon: <Shield size={16} /> },
    { id: 'documentation',   label: 'Documentation',   icon: <FileText size={16} /> },
    { id: 'settings',        label: 'Settings',        icon: <Settings size={16} /> }
  ];

  const bgGlass = theme === 'dark' ? 'rgba(15, 20, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  const borderGlass = theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.4)';
  const shadowGlass = theme === 'dark' ? '0 20px 50px rgba(0, 0, 0, 0.28)' : '0 20px 50px rgba(0, 0, 0, 0.12)';

  // Click outside "More" drawer
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target) &&
          moreButtonRef.current && !moreButtonRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    if(isMoreOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isMoreOpen]);

  // Dispatch 'eb-menu-opened' when More menu opens on mobile
  useEffect(() => {
    if (isMoreOpen) {
      window.dispatchEvent(new CustomEvent('eb-menu-opened', { detail: 'more-mobile' }));
    }
  }, [isMoreOpen]);

  // Close when other menus are opened
  useEffect(() => {
    const handleMenuOpened = (e) => {
      if (e.detail !== 'more-mobile') {
        setIsMoreOpen(false);
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
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNav = (id) => {
    setPage(id);
    setIsMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      transition: {
        duration: 0.14,
        ease: 'easeOut'
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.18,
        ease: 'easeOut'
      }
    }
  };

  const activeInMore = MORE_TABS.some(t => t.id === page);

  return (
    <>
      <AnimatePresence>
        {isMoreOpen && (
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
          display: 'block', // Media query driven display block for mobile
        }}
      >
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              ref={moreRef}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                background: bgGlass,
                border: borderGlass,
                borderRadius: '24px',
                padding: '16px',
                boxShadow: shadowGlass,
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                marginBottom: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}
            >
              {MORE_TABS.map(tab => {
                const isItemActive = page === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNav(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px', borderRadius: '14px',
                      border: 'none', background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                      color: isItemActive ? T.gold : 'var(--text)',
                      fontSize: '0.8rem', fontWeight: isItemActive ? 700 : 500,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: bgGlass,
            border: borderGlass,
            borderRadius: '28px',
            padding: '8px',
            boxShadow: shadowGlass,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            position: 'relative'
          }}
        >
          {MAIN_TABS.map(item => {
            const isActive = page === item.key && !isMoreOpen;
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
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(184,144,42,0.08)'
                    }}
                  />
                )}
                <Icon size={isActive ? 22 : 20} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 700 : 500, position: 'relative', zIndex: 1 }}>{item.label}</span>
              </button>
            );
          })}

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
                  background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(184,144,42,0.08)'
                }}
              />
            )}
            <MoreHorizontal size={(isMoreOpen || activeInMore) ? 22 : 20} style={{ position: 'relative', zIndex: 1 }} />
            <span style={{ fontSize: '0.55rem', fontWeight: (isMoreOpen || activeInMore) ? 700 : 500, position: 'relative', zIndex: 1 }}>More</span>
          </button>

        </div>
      </div>
    </>
  );
}
