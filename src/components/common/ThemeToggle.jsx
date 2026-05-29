import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Sun, Moon } from 'lucide-react';
import { T } from '../../theme/tokens';

export function ThemeToggle() {
  const { theme, setTheme } = useFinanceStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ 
        scale: 1.08, 
        boxShadow: isLight 
          ? '0 12px 36px rgba(184, 144, 42, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.5)' 
          : '0 12px 36px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        borderColor: isLight ? 'rgba(184, 144, 42, 0.45)' : 'rgba(255, 255, 255, 0.22)'
      }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: isLight ? 'rgba(255, 252, 248, 0.42)' : 'rgba(11, 15, 25, 0.42)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: isLight ? '1px solid rgba(184, 144, 42, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: isLight ? '0 8px 32px rgba(184, 144, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        color: isLight ? T.gold : '#f5f5f7',
        outline: 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease'
      }}
      aria-label="Toggle Theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isLight ? <Moon size={20} /> : <Sun size={20} />}
      </motion.div>
    </motion.button>
  );
}
