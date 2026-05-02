import React from 'react';

export function Logo({ size = 32, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#E8C96A" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <blur stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Connected Bonds / Infinity Symbol */}
        <path 
          d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20Z" 
          stroke="url(#logoGradient)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        <path 
          d="M8 20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20C32 26.6274 26.6274 32 20 32C13.3726 32 8 26.6274 8 20Z" 
          stroke="url(#logoGradient)" 
          strokeWidth="1.5" 
          strokeDasharray="4 4"
          opacity="0.4"
        />
        
        {/* Partnership Intersection */}
        <circle cx="16" cy="20" r="4" fill="url(#logoGradient)" fillOpacity="0.2" />
        <circle cx="24" cy="20" r="4" fill="url(#logoGradient)" fillOpacity="0.2" />
        
        {/* Center Growth Line */}
        <path 
          d="M20 16V24M17 19L20 16L23 19" 
          stroke="url(#logoGradient)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      {showText && (
        <span className="eb-logo-text" style={{ 
          fontFamily: "'DM Serif Display', serif", 
          fontSize: size * 0.6 + 'px',
          color: 'var(--text)',
          letterSpacing: '-0.5px'
        }}>
          EverBond <span style={{ color: 'var(--gold)' }}>Wealth</span>
        </span>
      )}
    </div>
  );
}
