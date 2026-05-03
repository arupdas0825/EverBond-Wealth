import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { LogoMark } from '../common/Logo';
import { T } from '../../theme/tokens';

const NAV_ITEMS = [
  { key: 'dashboard',  icon: '◉', label: 'Dashboard'  },
  { key: 'income',     icon: '💰', label: 'Income'     },
  { key: 'allocation', icon: '📊', label: 'Allocation' },
  { key: 'goals',      icon: '🎯', label: 'Goals'      },
  { key: 'simulation', icon: '🚀', label: 'Simulate'   },
];

export function Sidebar({ page, setPage }) {
  const { partner1, partner2, reset } = useFinanceStore();

  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) reset();
  };

  return (
    <aside className="eb-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <LogoMark size={20} />
        </div>
        <div className="sidebar-brand-name">
          EverBond <span>Wealth</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-section">
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            className={`nav-item ${page === n.key ? 'active' : ''}`}
            onClick={() => setPage(n.key)}
            title={n.label}
          >
            <span className="nav-item-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="couple-badge">
          <span style={{ fontSize: '1rem' }}>💑</span>
          <div>
            <div className="couple-label">Partnership</div>
            <div className="couple-names">
              {partner1}
              <span className="couple-heart">❤</span>
              {partner2}
            </div>
          </div>
        </div>
        <button className="btn-reset" onClick={handleReset}>
          ↺ Reset Platform
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ page, setPage }) {
  return (
    <nav className="eb-mobile-nav">
      <div className="mobile-nav-inner">
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            className={`mob-nav-btn ${page === n.key ? 'active' : ''}`}
            onClick={() => setPage(n.key)}
          >
            <span className="mob-nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>
    </nav>
  );
}