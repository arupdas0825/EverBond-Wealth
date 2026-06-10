import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, FileText, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function ProfileChip({ setPage, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { partner1, theme, setTheme, everBondId } = useFinanceStore();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNav = (pageId) => {
    setPage(pageId);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Reset onboarding Complete state to return to WelcomeScreen
    useFinanceStore.getState().setProfile({ onboardingComplete: false, started: false });
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return 'EB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Profile Dropdown animation variants: fade + scale (0.95 -> 1) over 180ms
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 8,
      transition: { duration: 0.18, ease: 'easeOut' }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.18, ease: 'easeOut' }
    }
  };

  return (
    <div className="eb-profile-container" ref={menuRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="eb-profile-chip-btn"
      >
        {/* Dynamic Circular Initials Avatar with Gold Gradient & Soft Shadow */}
        <div style={{
          width: '30px', 
          height: '30px', 
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '0.75rem', 
          fontWeight: 800, 
          letterSpacing: '0.5px',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)'
        }}>
          {getInitials(partner1)}
        </div>
        
        <span className="eb-profile-name">
          {partner1 || 'User'}
        </span>
        
        <ChevronDown 
          className="eb-profile-chevron" 
          size={12} 
          style={{ 
            color: 'var(--text-faint)', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s',
            flexShrink: 0
          }} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="eb-glass-dropdown"
            style={{ width: '220px', padding: '16px 12px' }}
          >
            {/* Header section with user initials avatar, full name, and EverBond ID */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '0 8px 12px', borderBottom: '1px solid var(--border-mid)', marginBottom: '8px' }}>
              <div style={{
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.85rem', 
                fontWeight: 800, 
                boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)'
              }}>
                {getInitials(partner1)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {partner1 || 'User'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'monospace', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {everBondId || 'EB-AWAITING-GEN'}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <button onClick={() => handleNav('profile')} className="eb-dropdown-item">
              <span className="eb-dropdown-item-icon"><User size={14} /></span>
              Profile
            </button>
            <button onClick={() => handleNav('settings')} className="eb-dropdown-item">
              <span className="eb-dropdown-item-icon"><Settings size={14} /></span>
              Settings
            </button>
            <button onClick={() => handleNav('documentation')} className="eb-dropdown-item">
              <span className="eb-dropdown-item-icon"><FileText size={14} /></span>
              Documentation
            </button>
            <button 
              onClick={() => { setIsOpen(false); setTheme(theme === 'light' ? 'dark' : 'light'); }} 
              className="eb-dropdown-item"
            >
              <span className="eb-dropdown-item-icon">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </span>
              Theme
            </button>
            
            <div style={{ height: '1px', background: 'var(--border-mid)', margin: '6px 0' }} />
            
            <button 
              onClick={handleLogout} 
              className="eb-dropdown-item"
              style={{ color: T.rose }}
            >
              <span className="eb-dropdown-item-icon" style={{ color: T.rose }}><LogOut size={14} /></span>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
