import React from 'react';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';

export function LogoMark({ size = 32, width }) {
  return (
    <img 
      src="/logo.png" 
      alt="EverBond Wealth Icon" 
      style={{ 
        width: width || 'auto',
        height: size, 
        objectFit: 'contain',
        display: 'block'
      }} 
    />
  );
}

export function Logo({ size = 40, width, showText = true, light = false }) {
  const theme = useFinanceStore(s => s.theme);
  // Default to white text if the theme is dark OR if explicitly marked as light mode text
  const textColor = (theme === 'dark' || light) ? '#ffffff' : 'var(--text)';
  const optimizedSize = size * 0.88; // 12% size reduction for better brand proportion and sharpness
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'opacity 0.2s ease'
    }}>
      <LogoMark size={optimizedSize} width={width} />
      
      {showText && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          lineHeight: 1.1
        }}>
          <span style={{
            fontFamily: T.fontDisplay,
            fontSize: size * 0.45 + 'px',
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.01em'
          }}>
            EverBond
          </span>
          <span style={{
            fontFamily: T.fontBody,
            fontSize: size * 0.25 + 'px',
            fontWeight: 700,
            color: T.gold,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '1px'
          }}>
            Wealth
          </span>
        </div>
      )}
    </div>
  );
}

export const BrandLogo = Logo;