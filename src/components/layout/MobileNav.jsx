import React from 'react';
import { T } from '../../theme/tokens';

export function MobileNav({ page, setPage }) {
  const navItems = [
    { key: "dashboard", icon: "◉", label: "Dashboard" },
    { key: "income", icon: "💰", label: "Income" },
    { key: "allocation", icon: "📊", label: "Allocation" },
    { key: "goals", icon: "🎯", label: "Goals" },
    { key: "simulation", icon: "🚀", label: "Simulate" },
  ];

  return (
    <nav className="eb-mobile-nav">
      {navItems.map(n => (
        <button 
          key={n.key} 
          className={`mob-nav-item ${page === n.key ? "active" : ""}`} 
          onClick={() => {
            setPage(n.key);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="mob-nav-icon">{n.icon}</span>
          <span>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}
