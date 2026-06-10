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
        scale: 1.05
      }}
      whileTap={{ scale: 0.94 }}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: isLight ? T.gold : '#f5f5f7',
        outline: 'none',
        background: 'transparent',
        border: 'none',
        transition: 'all 0.2s ease'
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
