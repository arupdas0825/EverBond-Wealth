import React from 'react';
import { T } from '../../theme/tokens';

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
  const textColor = light ? 'white' : T.text;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'opacity 0.2s ease'
    }}>
      <LogoMark size={size} width={width} />
      
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