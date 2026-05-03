import React from 'react';
import { T } from '../../theme/tokens';

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#B8902A" />
        </linearGradient>
      </defs>
      {/* Two rings — union */}
      <circle cx="15" cy="20" r="8" stroke="url(#lgGold)" strokeWidth="2.2" fill="none" />
      <circle cx="25" cy="20" r="8" stroke="url(#lgGold)" strokeWidth="2.2" fill="none" />
      {/* Center upward growth */}
      <path d="M20 23V17M17.5 19.5L20 17L22.5 19.5" stroke="url(#lgGold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 30, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: size + 6,
        height: size + 6,
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${T.goldMid}, ${T.gold})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: T.shadowGold,
        flexShrink: 0,
      }}>
        <LogoMark size={size - 4} />
      </div>
      {showText && (
        <span style={{
          fontFamily: T.fontDisplay,
          fontSize: size * 0.62 + 'px',
          fontWeight: 600,
          color: T.text,
          letterSpacing: '-0.3px',
          lineHeight: 1,
        }}>
          EverBond <span style={{ color: T.goldMid }}>Wealth</span>
        </span>
      )}
    </div>
  );
}