import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wallet, Target, Heart, MoreHorizontal,
  LineChart, BarChart3, Award, Settings, FileText, Activity, Users, Shield, Map
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function MobileNav({ page, setPage, onReset }) {
  const theme = useFinanceStore(s => s.theme);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const MAIN_TABS = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "income",    icon: Wallet,          label: "Income" },
    { key: "goals",     icon: Target,          label: "Goals" },
    { key: "partner",   icon: Heart,           label: "Partner" }
  ];

  const MORE_TABS = [
    { id: 'workspace',    label: 'Workspace',       icon: <Users size={16} /> },
    { id: 'insights',     label: 'Insights',        icon: <LineChart size={16} /> },
    { id: 'allocation',   label: 'Allocation',      icon: <BarChart3 size={16} /> },
    { id: 'milestones',   label: 'Milestones',      icon: <Award size={16} /> },
    { id: 'simulation',   label: 'Simulation',      icon: <Activity size={16} /> },
    { id: 'couple-planning', label: 'Couple Plan',  icon: <Map size={16} /> },
    { id: 'family-planning', label: 'Family Dynasty', icon: <Shield size={16} /> },
    { id: 'settings',     label: 'Settings / Docs', icon: <Settings size={16} /> }
  ];

  const bgGlass = theme === 'dark' ? 'rgba(30, 30, 30, 0.65)' : 'rgba(255, 255, 255, 0.7)';
  const borderGlass = theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)';
  const shadowGlass = theme === 'dark' ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.08)';

  // Click outside "More" drawer
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
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

  const handleNav = (id) => {
    setPage(id);
    setIsMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
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
