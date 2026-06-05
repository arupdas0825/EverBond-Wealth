import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, LineChart, Wallet, Target, 
  ChevronDown, PieChart, Flag, Award, Activity, Heart, 
  Settings, FileText, Map, Shield
} from 'lucide-react';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'workspace', label: 'Workspace', icon: <Users size={16} /> },
  { id: 'insights',  label: 'Insights',  icon: <LineChart size={16} /> },
  { id: 'income',    label: 'Income',    icon: <Wallet size={16} /> },
  { id: 'goals',     label: 'Goals',     icon: <Target size={16} /> }
];

const MORE_TABS = [
  { id: 'allocation',   label: 'Allocation',      icon: <PieChart size={14} /> },
  { id: 'milestones',   label: 'Milestones',      icon: <Flag size={14} /> },
  { id: 'achievements', label: 'Journey Rewards', icon: <Award size={14} /> },
  { id: 'simulation',   label: 'Simulation',      icon: <Activity size={14} /> },
  { id: 'partner',      label: 'Partner',         icon: <Heart size={14} /> },
  { id: 'couple-planning', label: 'Couple Plan',  icon: <Map size={14} /> },
  { id: 'family-planning', label: 'Family Dynasty', icon: <Shield size={14} /> },
  { id: 'settings',     label: 'Settings',        icon: <Settings size={14} /> }
];

export function FloatingNav({ page, setPage }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const theme = useFinanceStore(s => s.theme);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNav = (id) => {
    setPage(id);
    setIsMoreOpen(false);
  };

  const activeInMore = MORE_TABS.some(t => t.id === page);

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
          background: theme === 'dark' ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
        }}
      >
        {MAIN_TABS.map(tab => {
          const isActive = page === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              whileHover={{ scale: 1.04 }}
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
                background: isActive ? `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)` : 'transparent',
                boxShadow: isActive ? `0 4px 14px ${T.gold}40` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          );
        })}

        {/* More Dropdown */}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <motion.button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            whileHover={{ scale: 1.04 }}
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
              background: activeInMore ? `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)` : 'transparent',
              boxShadow: activeInMore ? `0 4px 14px ${T.gold}40` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            More <ChevronDown size={14} style={{ transform: isMoreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </motion.button>

          <AnimatePresence>
            {isMoreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '200px',
                  background: theme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,200,200,0.3)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {MORE_TABS.map(tab => {
                  const isItemActive = page === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNav(tab.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px', borderRadius: '10px',
                        border: 'none', background: isItemActive ? 'var(--gold-pale)' : 'transparent',
                        color: isItemActive ? T.gold : 'var(--text-muted)',
                        fontSize: '0.8rem', fontWeight: isItemActive ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if(!isItemActive) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseOut={(e) => {
                        if(!isItemActive) e.currentTarget.style.background = 'transparent';
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
        </div>

      </motion.div>
    </div>
  );
}
