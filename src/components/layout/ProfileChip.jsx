import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, FileText, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

function ProfileAvatar({ name, size = 30 }) {
  const [imgFailed, setImgFailed] = useState(false);
  
  const getInitials = (n) => {
    if (!n) return 'U';
    return n.substring(0, 2).toUpperCase();
  };

  if (imgFailed || !name) {
    return (
      <div style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px',
        flexShrink: 0
      }}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img 
      src="/AD.jpeg" 
      alt={name} 
      onError={() => setImgFailed(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1.5px solid var(--gold-border)',
        flexShrink: 0,
        boxShadow: 'var(--sh-xs)'
      }}
    />
  );
}

export function ProfileChip({ setPage, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { partner1, theme, setTheme } = useFinanceStore();

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

  return (
    <div className="eb-profile-container" ref={menuRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="eb-profile-chip-btn"
      >
        <ProfileAvatar name={partner1} size={30} />
        
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
              gap: '4px',
              zIndex: 10000
            }}
          >
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <User size={14} /> Profile
            </button>
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <Settings size={14} /> Settings
            </button>
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <FileText size={14} /> Documentation
            </button>
            <button 
              onClick={() => { setIsOpen(false); setTheme(theme === 'light' ? 'dark' : 'light'); }} 
              style={menuItemStyle} 
              className="hover-bg"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />} Theme
            </button>
            
            <div style={{ height: '1px', background: 'var(--border-mid)', margin: '4px 0' }} />
            
            <button 
              onClick={handleLogout} 
              style={{ ...menuItemStyle, color: T.rose }} 
              className="hover-bg"
            >
              <LogOut size={14} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  padding: '10px 12px', 
  borderRadius: '10px',
  border: 'none', 
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: '0.8rem', 
  fontWeight: 500,
  cursor: 'pointer', 
  textAlign: 'left',
  transition: 'all 0.2s ease',
  width: '100%'
};
