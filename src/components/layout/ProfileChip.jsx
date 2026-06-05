import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Link, Settings, FileText, Trash2, ChevronDown } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function ProfileChip({ setPage, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { partner1, theme } = useFinanceStore();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

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

  return (
    <div className="hide-on-mobile" ref={menuRef} style={{
      position: 'fixed',
      top: '24px',
      right: '32px',
      zIndex: 9999
    }}>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px 6px 6px',
          borderRadius: '999px',
          border: 'none',
          background: theme === 'dark' ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px'
        }}>
          {getInitials(partner1)}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
          {partner1 || 'User'}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-faint)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
              width: '220px',
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
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <User size={14} /> Profile
            </button>
            <button onClick={() => handleNav('partner')} style={menuItemStyle} className="hover-bg">
              <Link size={14} /> Partner Connection
            </button>
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <Settings size={14} /> Settings
            </button>
            {/* Navigates to settings for Documentation */}
            <button onClick={() => handleNav('settings')} style={menuItemStyle} className="hover-bg">
              <FileText size={14} /> Documentation
            </button>
            
            <div style={{ height: '1px', background: 'var(--border-mid)', margin: '4px 0' }} />
            
            <button 
              onClick={() => { setIsOpen(false); onReset(); }} 
              style={{ ...menuItemStyle, color: T.rose }} 
              className="hover-bg"
            >
              <Trash2 size={14} /> Reset Platform
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '10px 12px', borderRadius: '10px',
  border: 'none', background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: '0.8rem', fontWeight: 500,
  cursor: 'pointer', textAlign: 'left',
  transition: 'all 0.2s ease'
};
