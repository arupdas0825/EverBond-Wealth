import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

const NAV = [
  { key: 'dashboard',  icon: '◉', label: 'Dashboard'  },
  { key: 'income',     icon: '💰', label: 'Income'     },
  { key: 'allocation', icon: '📊', label: 'Allocation' },
  { key: 'goals',      icon: '🎯', label: 'Goals'      },
  { key: 'simulation', icon: '🚀', label: 'Simulate'   },
];

function LogoSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg-sb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#B8902A" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="20" r="8" stroke="url(#lg-sb)" strokeWidth="2.2" fill="none"/>
      <circle cx="25" cy="20" r="8" stroke="url(#lg-sb)" strokeWidth="2.2" fill="none"/>
      <path d="M20 23V17M17.5 19.5L20 17L22.5 19.5"
        stroke="url(#lg-sb)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Sidebar({ page, setPage }) {
  const { partner1, partner2, reset } = useFinanceStore();
  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) reset();
  };
  return (
    <aside className="eb-sidebar">
      <div className="sb-brand">
        <div className="sb-icon"><LogoSVG size={20}/></div>
        <div className="sb-name">EverBond <span>Wealth</span></div>
      </div>
      <nav className="nav-group">
        {NAV.map(n => (
          <button key={n.key}
            className={`nav-item ${page===n.key?'active':''}`}
            onClick={() => setPage(n.key)} title={n.label}>
            <span className="nav-icon-w">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="couple-chip">
          <span style={{fontSize:'1rem'}}>💑</span>
          <div>
            <div className="couple-label">Partnership</div>
            <div className="couple-names">{partner1}<span className="couple-heart">❤</span>{partner2}</div>
          </div>
        </div>
        <button className="btn-reset" onClick={handleReset}>↺ Reset Platform</button>
      </div>
    </aside>
  );
}

export function MobileNav({ page, setPage }) {
  const { partner1, partner2, reset } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) { reset(); setOpen(false); }
  };
  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:'fixed',inset:0,zIndex:190,
          background:'rgba(0,0,0,0.18)',backdropFilter:'blur(3px)',
          display:'flex',alignItems:'flex-end',
          paddingBottom:'calc(100px + env(safe-area-inset-bottom))',
          justifyContent:'center',
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'rgba(255,252,248,0.96)',
            backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
            border:'1px solid rgba(255,255,255,0.8)',borderRadius:22,
            padding:'18px 20px',width:'calc(100% - 32px)',maxWidth:420,
            boxShadow:'0 8px 40px rgba(0,0,0,0.16)',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:8,
              padding:'8px 0 14px',borderBottom:'1px solid rgba(26,23,20,.08)',marginBottom:14}}>
              <span style={{fontSize:'1.4rem'}}>💑</span>
              <div>
                <div style={{fontSize:'.63rem',fontWeight:700,textTransform:'uppercase',
                  letterSpacing:'.08em',color:'var(--text-faint)',marginBottom:2}}>Partnership</div>
                <div style={{fontSize:'.9rem',fontWeight:600,color:'var(--text)'}}>
                  {partner1} ❤ {partner2}
                </div>
              </div>
            </div>
            <button onClick={handleReset} style={{
              width:'100%',padding:'12px 16px',
              background:'var(--rose-lt)',border:'1.5px solid var(--rose-border)',
              borderRadius:12,color:'var(--rose)',fontFamily:'var(--fb)',
              fontSize:'.9rem',fontWeight:600,cursor:'pointer',
              display:'flex',alignItems:'center',gap:8,
            }}>
              <span>↺</span> Reset Platform
            </button>
          </div>
        </div>
      )}
      <nav className="eb-mobile-nav">
        <div className="mob-nav-inner">
          {NAV.map(n => (
            <button key={n.key}
              className={`mob-nav-btn ${page===n.key?'active':''}`}
              onClick={() => setPage(n.key)}>
              <span className="mob-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
          <button className={`mob-nav-btn ${open?'active':''}`} onClick={() => setOpen(v=>!v)}>
            <span className="mob-nav-icon">⚙️</span>
            More
          </button>
        </div>
      </nav>
    </>
  );
}