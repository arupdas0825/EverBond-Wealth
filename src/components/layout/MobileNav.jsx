import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, BarChart3, Target, Settings, LineChart } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function MobileNav({ page, setPage }) {
  const theme = useFinanceStore(s => s.theme);
  
  const navItems = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "insights", icon: LineChart, label: "Insights" },
    { key: "income", icon: Wallet, label: "Income" },
    { key: "allocation", icon: BarChart3, label: "Allocation" },
    { key: "goals", icon: Target, label: "Goals" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  // Dynamic light/dark theme values for Apple Glassmorphism
  const bgGlass = theme === 'dark' 
    ? 'rgba(13, 13, 13, 0.68)' 
    : 'rgba(250, 246, 238, 0.78)';
  
  const borderGlass = theme === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.08)' 
    : '1px solid rgba(26, 23, 20, 0.08)';

  const shadowGlass = theme === 'dark'
    ? '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 12px 32px rgba(184, 144, 42, 0.08), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)';

  return (
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
        display: 'block', // Responsive toggle managed in CSS media queries
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          background: bgGlass,
          border: borderGlass,
          borderRadius: '28px',
          padding: '6px 8px',
          boxShadow: shadowGlass,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {navItems.map(item => {
          const isActive = page === item.key;
          const Icon = item.icon;
          
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                color: isActive ? T.gold : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: '18px',
                cursor: 'pointer',
                flex: 1,
                position: 'relative',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Sliding Active Pill Highlight */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  style={{
                    position: 'absolute',
                    inset: '2px',
                    borderRadius: '14px',
                    background: theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(184, 144, 42, 0.06)',
                    border: theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : '1px solid rgba(184, 144, 42, 0.1)',
                    boxShadow: theme === 'dark'
                      ? '0 4px 12px rgba(0,0,0,0.15)'
                      : '0 4px 12px rgba(184, 144, 42, 0.04)',
                    zIndex: 0
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Animated Icon */}
              <motion.div
                animate={{ 
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -1 : 0,
                  filter: isActive 
                    ? `drop-shadow(0 2px 8px rgba(184, 144, 42, 0.45))` 
                    : 'drop-shadow(0 0px 0px rgba(0,0,0,0))'
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                  zIndex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1px'
                }}
              >
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* Label */}
              <span 
                style={{ 
                  fontSize: '0.55rem', 
                  fontWeight: isActive ? 800 : 500, 
                  letterSpacing: '0.04em',
                  zIndex: 1,
                  textTransform: 'uppercase',
                  opacity: isActive ? 1 : 0.75,
                  transition: 'opacity 0.3s ease, font-weight 0.3s ease'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
