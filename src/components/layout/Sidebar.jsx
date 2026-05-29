import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import { RelationshipPortal } from '../welcome/RelationshipPortal';
import { Lock, Heart, User, Crown, RefreshCw } from 'lucide-react';
import { T } from '../../theme/tokens';

const NAV = [
  { key: 'dashboard', icon: '◉', label: 'Dashboard' },
  { key: 'income', icon: '💰', label: 'Income' },
  { key: 'allocation', icon: '📊', label: 'Allocation' },
  { key: 'goals', icon: '🎯', label: 'Goals' },
  { key: 'milestones', icon: '📅', label: 'Milestones' },
  { key: 'simulation', icon: '🚀', label: 'Simulate' },
  { key: 'couple-planning', icon: '💑', label: 'Couple Plan', lockedAt: 'Single' },
  { key: 'family-planning', icon: '👑', label: 'Family Dynasty', lockedAt: 'Committed' }
];

export function Sidebar({ page, setPage }) {
  const { partner1, partner2, reset, stage, setStage, setProfile } = useFinanceStore();
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) reset();
  };

  const handleNavClick = (n) => {
    if (n.lockedAt === 'Single' && stage === 'Single') {
      setIsPortalOpen(true);
      return;
    }
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) {
      if (stage === 'Single') {
        setIsPortalOpen(true);
      } else {
        // committed user clicks family - trigger elegant marriage upgrade
        if (window.confirm('💍 Upgrade to Married Stage? This will unlock Family Dynasty Planning, children education funds, and family estate reserves.')) {
          setStage('Married');
          setProfile({
            partner1,
            partner2: partner2 || 'Spouse',
            stage: 'Married',
            p1Salary: 150000,
            p2Salary: 120000
          });
          setPage('family-planning');
        }
      }
      return;
    }
    setPage(n.key);
  };

  const isLocked = (n) => {
    if (n.lockedAt === 'Single' && stage === 'Single') return true;
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) return true;
    return false;
  };

  return (
    <>
      <aside className="eb-sidebar" style={{ background: stage === 'Committed' ? 'rgba(252,238,241,0.2)' : stage === 'Married' ? 'rgba(253,250,242,0.2)' : 'var(--bg-sidebar)' }}>
        <div className="sb-brand" style={{ padding: '10px 6px', marginBottom: '40px' }}>
          <Logo size={36} showText={true} />
        </div>
        <nav className="nav-group">
          {NAV.map(n => {
            const locked = isLocked(n);
            return (
              <button key={n.key}
                className={`nav-item ${page === n.key ? 'active' : ''} ${locked ? 'sidebar-locked-item' : ''}`}
                onClick={() => handleNavClick(n)}
                title={n.label}
                style={{ position: 'relative' }}
              >
                <span className="nav-icon-w">{n.icon}</span>
                <span>{n.label}</span>
                {locked && <Lock size={11} style={{ position: 'absolute', right: '12px', opacity: 0.6 }} />}
              </button>
            );
          })}
        </nav>
        <div className="sb-footer">
          {/* Dynamic Stage Footer Chip */}
          {stage === 'Single' ? (
            <div className="couple-chip" style={{ border: '1px solid var(--sky-border)', background: 'var(--sky-lt)', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: T.sky }} />
                <span className="couple-names" style={{ fontSize: '0.8rem' }}>{partner1 || 'Single Builder'}</span>
              </div>
              <button 
                onClick={() => setIsPortalOpen(true)}
                style={{ background: 'none', border: 'none', color: T.sky, fontSize: '0.68rem', fontWeight: 700, padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                🔗 Connect Partner Engine
              </button>
            </div>
          ) : stage === 'Committed' ? (
            <div className="couple-chip" style={{ border: '1px solid var(--rose-border)', background: 'var(--rose-lt)' }}>
              <Heart size={14} fill={T.rose} style={{ color: T.rose }} />
              <div>
                <div className="couple-label" style={{ color: T.rose }}>Committed Partnership</div>
                <div className="couple-names">{partner1} <span className="couple-heart">❤</span> {partner2}</div>
              </div>
            </div>
          ) : (
            <div className="couple-chip" style={{ border: '1px solid var(--gold-border)', background: 'var(--gold-pale)' }}>
              <Crown size={14} style={{ color: T.gold }} />
              <div>
                <div className="couple-label" style={{ color: T.gold }}>Family Dynasty</div>
                <div className="couple-names">{partner1} &amp; {partner2}</div>
              </div>
            </div>
          )}

          <button className="btn-reset" onClick={handleReset}>↺ Reset Platform</button>
        </div>
      </aside>

      <RelationshipPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
    </>
  );
}

export function MobileNav({ page, setPage }) {
  const { partner1, partner2, reset, stage, setStage, setProfile } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) { reset(); setOpen(false); }
  };

  const handleNavClick = (n) => {
    if (n.lockedAt === 'Single' && stage === 'Single') {
      setIsPortalOpen(true);
      return;
    }
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) {
      if (stage === 'Single') {
        setIsPortalOpen(true);
      } else {
        if (window.confirm('💍 Upgrade to Married Stage? This will unlock Family Dynasty Planning, children education funds, and family estate reserves.')) {
          setStage('Married');
          setProfile({
            partner1,
            partner2: partner2 || 'Spouse',
            stage: 'Married',
            p1Salary: 150000,
            p2Salary: 120000
          });
          setPage('family-planning');
        }
      }
      return;
    }
    setPage(n.key);
  };

  const isLocked = (n) => {
    if (n.lockedAt === 'Single' && stage === 'Single') return true;
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) return true;
    return false;
  };

  // Only show first 4 items in bottom nav for layout reasons
  const visibleNav = NAV.slice(0, 4);

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'flex-end',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
          justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255,252,248,0.96)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.8)', borderRadius: 22,
            padding: '18px 20px', width: 'calc(100% - 32px)', maxWidth: 420,
            boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          }}>
            {/* Dynamic Mobile Upgrade Card */}
            {stage === 'Single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0 14px', borderBottom: '1px solid rgba(26,23,20,.08)', marginBottom: 14 }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', color: T.sky }}>Independent builder</div>
                <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text)' }}>{partner1 || 'Solo Builder'}</div>
                <button 
                  onClick={() => { setIsPortalOpen(true); setOpen(false); }}
                  style={{ width: '100%', padding: '10px', background: T.sky, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  🔗 Sync Partner Ledger
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0 14px', borderBottom: '1px solid rgba(26,23,20,.08)', marginBottom: 14
              }}>
                <span style={{ fontSize: '1.4rem' }}>{stage === 'Married' ? '👑' : '💑'}</span>
                <div>
                  <div style={{
                    fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.08em', color: stage === 'Married' ? T.gold : T.rose, marginBottom: 2
                  }}>{stage} Partnership</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>
                    {partner1} {stage === 'Married' ? '&' : '❤'} {partner2}
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {NAV.slice(4).map(n => {
                const locked = isLocked(n);
                return (
                  <button 
                    key={n.key}
                    onClick={() => { handleNavClick(n); setOpen(false); }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, background: '#fff', color: locked ? '#aaa' : 'var(--text)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifySelf: 'flex-start', gap: 8, cursor: 'pointer' }}
                  >
                    <span>{n.icon}</span> {n.label} {locked && '🔒'}
                  </button>
                );
              })}
            </div>

            <button onClick={handleReset} style={{
              width: '100%', padding: '12px 16px',
              background: 'var(--rose-lt)', border: '1.5px solid var(--rose-border)',
              borderRadius: 12, color: 'var(--rose)', fontFamily: 'var(--fb)',
              fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>↺</span> Reset Platform
            </button>
          </div>
        </div>
      )}

      <nav className="eb-mobile-nav">
        <div className="mob-nav-inner">
          {visibleNav.map(n => (
            <button key={n.key}
              className={`mob-nav-btn ${page === n.key ? 'active' : ''}`}
              onClick={() => handleNavClick(n)}>
              <span className="mob-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
          <button className={`mob-nav-btn ${open ? 'active' : ''}`} onClick={() => setOpen(v => !v)}>
            <span className="mob-nav-icon">⚙️</span>
            More
          </button>
        </div>
      </nav>

      <RelationshipPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
    </>
  );
}