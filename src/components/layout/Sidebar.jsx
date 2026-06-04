import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
import { Lock, Heart, User, Crown, RefreshCw, UserCheck } from 'lucide-react';
import { T } from '../../theme/tokens';

const NAV = [
  { key: 'dashboard', icon: '◉', label: 'Dashboard' },
  { key: 'insights', icon: '📈', label: 'Wealth Insights' },
  { key: 'income', icon: '💰', label: 'Income' },
  { key: 'allocation', icon: '📊', label: 'Allocation' },
  { key: 'goals', icon: '🎯', label: 'Goals' },
  { key: 'milestones', icon: '📅', label: 'Milestones' },
  { key: 'simulation', icon: '🚀', label: 'Simulate' },
  { key: 'partner', icon: '🔗', label: 'Partner' },
  { key: 'couple-planning', icon: '💑', label: 'Couple Plan', lockedAt: 'Single' },
  { key: 'family-planning', icon: '👑', label: 'Family Dynasty', lockedAt: 'Committed' },
  { key: 'settings', icon: '⚙️', label: 'Settings' }
];

export function Sidebar({ page, setPage, onReset }) {
  const { 
    partner1, 
    partner2, 
    reset, 
    stage, 
    setStage, 
    setProfile, 
    theme,
    partnerAccepted,
    connectionStatus,
    everBondId,
    setVerificationState,
    incomingRequest
  } = useFinanceStore();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) reset();
    }
  };

  const isLocked = (n) => {
    // Dashboard is never locked
    if (n.key === 'dashboard') return false;

    // Lock Couple Planning in Committed Stage if partner not connected
    if (n.key === 'couple-planning' && stage === 'Committed' && connectionStatus !== 'connected') return true;

    // Standard stage locks
    if (n.lockedAt === 'Single' && stage === 'Single') return true;
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) return true;

    return false;
  };

  const handleNavClick = (n) => {
    if (isLocked(n)) {
      if (n.key === 'couple-planning' && stage === 'Committed' && connectionStatus !== 'connected') {
        alert('🔒 Couple Planning requires Partner Connection. Please connect your partner on the Partner page first.');
        setPage('partner');
        return;
      }

      if (n.lockedAt === 'Single' && stage === 'Single') {
        alert('🔒 Unlocks in Committed stage. Link a partner node to unlock Couple Planning.');
        setPage('dashboard');
        return;
      }

      if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) {
        if (stage === 'Single') {
          alert('🔒 Unlocks in Married stage. Upgrade stage and link partner to unlock Family Dynasty.');
          setPage('dashboard');
        } else {
          // Committed user clicks family dynasty - trigger elegant marriage upgrade
          if (connectionStatus !== 'connected') {
            alert('🔒 Connect your partner first before upgrading to Married stage.');
            setPage('partner');
          } else if (window.confirm('💍 Upgrade to Married Stage? This will unlock Family Dynasty Planning, children education funds, and family estate reserves.')) {
            setStage('Married');
            setVerificationState({
              partnerAccepted: false,
              partnerLinked: false,
              verificationStatus: 'unverified',
              invitationCode: '',
              partner2: partner2 || 'Partner',
              partnerName: partner2 || 'Partner'
            });
            setPage('dashboard');
          }
        }
        return;
      }
      return;
    }
    setPage(n.key);
  };

  return (
    <>
      <aside className="eb-sidebar" style={{
        background: stage === 'Committed'
          ? (theme === 'dark' ? 'rgba(208, 92, 114, 0.05)' : 'rgba(252, 238, 241, 0.5)')
          : stage === 'Married'
            ? (theme === 'dark' ? 'rgba(184, 144, 42, 0.06)' : 'rgba(253, 250, 242, 0.5)')
            : 'var(--bg-sidebar)'
      }}>
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
          {/* Live Partner Verification Footer Chip */}
          {stage === 'Single' ? (
            <div className="couple-chip" style={{ border: '1px solid var(--sky-border)', background: 'var(--sky-lt)', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: T.sky }} />
                <span className="couple-names" style={{ fontSize: '0.8rem' }}>{partner1 || 'Single Builder'}</span>
              </div>
              {everBondId && (
                <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-faint)', letterSpacing: '0.03em' }}>{everBondId}</span>
              )}
              <button 
                onClick={() => setPage('partner')}
                style={{ background: 'none', border: 'none', color: T.sky, fontSize: '0.68rem', fontWeight: 700, padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                🔗 Connect Partner
              </button>
            </div>
          ) : connectionStatus === 'pending' ? (
            <div className="couple-chip" style={{ border: '1.5px dashed var(--gold-border)', background: 'var(--gold-pale)', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={12} className="animate-spin" style={{ color: T.goldMid }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: T.goldMid }}>Request Pending</span>
              </div>
              <div className="couple-names" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {partner1} → {partner2 || 'Partner'}
              </div>
              {everBondId && (
                <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-faint)' }}>{everBondId}</span>
              )}
            </div>
          ) : connectionStatus === 'received' ? (
            <div 
              className="couple-chip" 
              onClick={() => setPage('partner')}
              style={{ border: '1.5px solid var(--gold-border)', background: 'var(--gold-pale)', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold }}>Request Received!</span>
              </div>
              <div className="couple-names" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {incomingRequest?.senderName || 'Partner'} wants to connect
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.gold, display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔗 Review Request →
              </span>
            </div>
          ) : connectionStatus === 'connected' && stage === 'Committed' ? (
            <div className="couple-chip" style={{ border: `1.5px solid ${T.sage}`, background: 'var(--sage-lt)', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={14} fill={T.sage} style={{ color: T.sage }} />
                <div>
                  <div className="couple-label" style={{ color: T.sage }}>Couple Verified</div>
                  <div className="couple-names">{partner1} ❤ {partner2}</div>
                </div>
              </div>
              {everBondId && (
                <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'var(--text-faint)', marginTop: '2px', display: 'block' }}>{everBondId}</span>
              )}
            </div>
          ) : connectionStatus === 'connected' ? (
            <div className="couple-chip" style={{ border: `1.5px solid ${T.gold}`, background: 'var(--gold-pale)', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={14} style={{ color: T.gold }} />
                <div>
                  <div className="couple-label" style={{ color: T.gold }}>Partner Verified</div>
                  <div className="couple-names">{partner1} & {partner2}</div>
                </div>
              </div>
              {everBondId && (
                <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'var(--text-faint)', marginTop: '2px', display: 'block' }}>{everBondId}</span>
              )}
            </div>
          ) : !partnerAccepted ? (
            <div className="couple-chip" style={{ border: '1.5px dashed var(--gold-border)', background: 'var(--gold-pale)', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={12} className="animate-spin" style={{ color: T.goldMid }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: T.goldMid }}>Awaiting Acceptance</span>
              </div>
              <div className="couple-names" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {partner1} ➜ {partner2 || 'Partner'}
              </div>
            </div>
          ) : stage === 'Committed' ? (
            <div className="couple-chip" style={{ border: `1.5px solid ${T.sage}`, background: 'var(--sage-lt)' }}>
              <Heart size={14} fill={T.sage} style={{ color: T.sage }} />
              <div>
                <div className="couple-label" style={{ color: T.sage }}>Couple Verified</div>
                <div className="couple-names">{partner1} ❤ {partner2}</div>
              </div>
            </div>
          ) : (
            <div className="couple-chip" style={{ border: `1.5px solid ${T.gold}`, background: 'var(--gold-pale)' }}>
              <Crown size={14} style={{ color: T.gold }} />
              <div>
                <div className="couple-label" style={{ color: T.gold }}>Partner Verified</div>
                <div className="couple-names">{partner1} & {partner2}</div>
              </div>
            </div>
          )}

          <button className="btn-reset" onClick={handleReset}>↺ Reset Platform</button>
        </div>
      </aside>
    </>
  );
}

export function MobileNav({ page, setPage }) {
  const { 
    partner1, 
    partner2, 
    reset, 
    stage, 
    setStage, 
    setProfile,
    partnerAccepted,
    connectionStatus,
    everBondId,
    setVerificationState,
    incomingRequest
  } = useFinanceStore();
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset EverBond Wealth? All data will be cleared.')) { reset(); setOpen(false); }
  };

  const isLocked = (n) => {
    if (n.key === 'dashboard') return false;

    // Lock Couple Planning in Committed Stage if partner not connected
    if (n.key === 'couple-planning' && stage === 'Committed' && connectionStatus !== 'connected') return true;

    if (n.lockedAt === 'Single' && stage === 'Single') return true;
    if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) return true;

    return false;
  };

  const handleNavClick = (n) => {
    if (isLocked(n)) {
      if (n.key === 'couple-planning' && stage === 'Committed' && connectionStatus !== 'connected') {
        alert('🔒 Couple Planning requires Partner Connection. Please connect your partner on the Partner page first.');
        setPage('partner');
        return;
      }

      if (n.lockedAt === 'Single' && stage === 'Single') {
        alert('🔒 Unlocks in Committed stage. Link a partner on the Dashboard.');
        setPage('dashboard');
        return;
      }

      if (n.lockedAt === 'Committed' && (stage === 'Single' || stage === 'Committed')) {
        if (stage === 'Single') {
          alert('🔒 Unlocks in Married stage. Upgrade stage and link partner to unlock Family Dynasty.');
          setPage('dashboard');
        } else {
          if (connectionStatus !== 'connected') {
            alert('🔒 Connect your partner first before upgrading to Married stage.');
            setPage('partner');
          } else if (window.confirm('💍 Upgrade to Married Stage? This will unlock Family Dynasty Planning.')) {
            setStage('Married');
            setVerificationState({
              partnerAccepted: false,
              partnerLinked: false,
              verificationStatus: 'unverified',
              invitationCode: '',
              partner2: partner2 || 'Partner',
              partnerName: partner2 || 'Partner'
            });
            setPage('dashboard');
          }
        }
        return;
      }
      return;
    }
    setPage(n.key);
  };

  // Only show first 4 items in bottom nav for layout reasons
  const visibleNav = NAV.slice(0, 4);

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
          justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--border-mid)', borderRadius: 22,
            padding: '18px 20px', width: 'calc(100% - 32px)', maxWidth: 420,
            boxShadow: 'var(--sh-lg)',
            color: 'var(--text)'
          }}>
            {/* Dynamic Mobile Upgrade Card */}
            {stage === 'Single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', color: T.sky }}>Independent builder</div>
                <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text)' }}>{partner1 || 'Solo Builder'}</div>
                {everBondId && (
                  <div style={{ fontSize: '.62rem', fontFamily: 'monospace', color: 'var(--text-faint)', marginTop: '2px' }}>{everBondId}</div>
                )}
                <button 
                  onClick={() => { setPage('partner'); setOpen(false); }}
                  style={{ width: '100%', padding: '10px', background: T.sky, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  🔗 Connect Partner
                </button>
              </div>
            ) : connectionStatus === 'pending' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.4rem' }}>⏳</span>
                  <div>
                    <div style={{ fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase', color: T.goldMid, marginBottom: 2 }}>Request Pending</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {partner1} → {partner2 || 'Partner'}
                    </div>
                  </div>
                </div>
                {everBondId && (
                  <div style={{ fontSize: '.62rem', fontFamily: 'monospace', color: 'var(--text-faint)', marginTop: '2px' }}>{everBondId}</div>
                )}
              </div>
            ) : connectionStatus === 'received' ? (
              <div 
                onClick={() => { setPage('partner'); setOpen(false); }}
                style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.4rem' }}>📩</span>
                  <div>
                    <div style={{ fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase', color: T.gold, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
                      Request Received
                    </div>
                    <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {incomingRequest?.senderName || 'Partner'} wants to connect
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: T.gold, marginTop: 2 }}>
                  🔗 Review Invitation →
                </div>
              </div>
            ) : connectionStatus === 'connected' ? (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.4rem' }}>{stage === 'Married' ? '👑' : '💑'}</span>
                  <div>
                    <div style={{
                      fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '.08em', color: stage === 'Married' ? T.gold : T.sage, marginBottom: 2
                    }}>{stage === 'Married' ? 'Partner Verified' : 'Couple Verified'}</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {partner1} {stage === 'Married' ? '&' : '❤'} {partner2}
                    </div>
                  </div>
                </div>
                {everBondId && (
                  <div style={{ fontSize: '.62rem', fontFamily: 'monospace', color: 'var(--text-faint)', marginTop: '2px' }}>{everBondId}</div>
                )}
              </div>
            ) : !partnerAccepted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                <span style={{ fontSize: '1.4rem' }}>⏳</span>
                <div>
                  <div style={{ fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase', color: T.goldMid, marginBottom: 2 }}>Handshake Awaiting</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>
                    {partner1} ➜ {partner2 || 'Partner'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0 14px', borderBottom: '1px solid var(--border)', marginBottom: 14
              }}>
                <span style={{ fontSize: '1.4rem' }}>{stage === 'Married' ? '👑' : '💑'}</span>
                <div>
                  <div style={{
                    fontSize: '.63rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.08em', color: stage === 'Married' ? T.gold : T.sage, marginBottom: 2
                  }}>{stage === 'Married' ? 'Partner Verified' : 'Couple Verified'}</div>
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
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-warm)', color: locked ? 'var(--text-faint)' : 'var(--text)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifySelf: 'flex-start', gap: 8, cursor: 'pointer' }}
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
    </>
  );
}