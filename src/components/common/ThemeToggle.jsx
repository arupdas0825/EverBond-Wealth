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

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ 
        scale: 1.1, 
        boxShadow: theme === 'light' 
          ? '0 8px 30px rgba(184, 144, 42, 0.25)' 
          : '0 8px 30px rgba(255, 255, 255, 0.15)'
      }}
      whileTap={{ scale: 0.92 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: theme === 'light' ? 'rgba(255, 252, 248, 0.75)' : 'rgba(19, 27, 46, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: theme === 'light' ? '1px solid rgba(184, 144, 42, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--sh-md)',
        color: theme === 'light' ? T.gold : '#fdfcf9',
        outline: 'none',
      }}
      aria-label="Toggle Theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </motion.div>
    </motion.button>
  );
}
