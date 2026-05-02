import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Logo } from '../common/Logo';

export function Sidebar({ page, setPage }) {
  const { partner1, partner2, reset } = useFinanceStore();

  const navItems = [
    { key: "dashboard", icon: "◉", label: "Dashboard" },
    { key: "income", icon: "💰", label: "Income" },
    { key: "allocation", icon: "📊", label: "Allocation" },
    { key: "goals", icon: "🎯", label: "Goals" },
    { key: "simulation", icon: "🚀", label: "Simulate" },
  ];

  return (
    <aside className="eb-sidebar">
      <div className="eb-logo" style={{ paddingBottom: '32px' }}>
        <Logo size={28} />
      </div>
      
      <div className="nav-group">
        {navItems.map(n => (
          <button 
            key={n.key} 
            className={`nav-item ${page === n.key ? "active" : ""}`} 
            onClick={() => setPage(n.key)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div className="nav-partners">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '11px', color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partnership</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: T.text }}>
            <span>{partner1}</span>
            <span style={{ color: T.rose, fontSize: '10px' }}>❤</span>
            <span>{partner2}</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => { if (confirm("Reset EverBond Wealth? This will clear all data.")) reset(); }}
        className="reset-btn"
        style={{ 
          background: "none", border: "none", color: T.textFaint, 
          cursor: "pointer", fontSize: '11px', padding: "12px", textAlign: "left",
          marginTop: '8px', opacity: 0.6, transition: 'opacity 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.opacity = 1}
        onMouseOut={e => e.currentTarget.style.opacity = 0.6}
      >
        Reset Platform
      </button>
    </aside>
  );
}
