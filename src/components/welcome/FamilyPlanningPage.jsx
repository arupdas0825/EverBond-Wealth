import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Crown, Sparkles, GraduationCap, Coins, Plus, Trash2, ArrowUpRight, Lock } from 'lucide-react';
import { formatCurrency, formatCompact } from '../../utils/finance';
import { Logo } from '../common/Logo';

export function FamilyPlanningPage() {
  const { partner1, partner2, currency, getTotalSalary, partnerAccepted } = useFinanceStore();
  const total = getTotalSalary();
  
  const [children, setChildren] = useState([
    { id: 1, name: 'Aarav', collegeYear: 2040, costTarget: 4500000 },
  ]);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('2042');
  const [newCost, setNewCost] = useState('6000000');

  const addChild = () => {
    if (!partnerAccepted) return; // Disable interactive addition if locked
    if (!newName.trim()) return;
    setChildren([
      ...children,
      { id: Date.now(), name: newName.trim(), collegeYear: parseInt(newYear) || 2042, costTarget: parseFloat(newCost) || 5000000 }
    ]);
    setNewName('');
  };

  const removeChild = (id) => {
    if (!partnerAccepted) return; // Disable interactive removal if locked
    setChildren(children.filter(c => c.id !== id));
  };

  const fmt = val => formatCurrency(val, currency);
  const cmpct = val => formatCompact(val, currency);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="stage-badge married">Family Dynasty</span>
            <span>· Multi-Generational Locker</span>
          </div>
          <h1 className="page-title">Dynasty <em>Vault</em></h1>
          <p className="page-desc">
            Long-term family security assets, college reserves, and multi-generation estate legacy planners.
          </p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      {!partnerAccepted && (
        <div style={{
          background: 'rgba(184, 144, 42, 0.08)',
          border: `1.5px solid ${T.gold}30`,
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--sh-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.gold, boxShadow: `0 0 10px ${T.gold}` }} />
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>
                Family Workspace Preview
              </span>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                🔒 Collaborative Family Features Locked · Connect your spouse to activate
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 mb-20">
        
        {/* Generational Vault Trust */}
        <Card gold style={{ position: 'relative' }}>
          <div className="card-title">Dynastic Compounder</div>
          <div className="card-heading">40-Year Generational Vault</div>
          <div className="card-sub">Compounding projections of your investments dedicated to the family estate.</div>
          
          <div style={{ padding: '24px 0 12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em' }}>Dynasty Corpus Estimate</span>
            <div style={{ fontFamily: 'var(--fn)', fontSize: '2.8rem', fontWeight: 700, color: T.gold, letterSpacing: '-0.03em', marginTop: '6px', marginBottom: '4px' }}>
              {cmpct(450000000)}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Assuming Balanced SIP compounding over four decades</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Vault Contribution (Monthly)</span>
            <span style={{ fontWeight: 600 }}>{fmt(total * 0.15)}</span>
          </div>

          {/* Glass Lock Screen Overlay */}
          {!partnerAccepted && (
            <div className="glass-lock-screen">
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Shared Family Dashboard</h4>
                <p className="lock-desc">Connect with your spouse to unlock multi-generational wealth calculations and asset reserves.</p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.gold, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={() => alert("🔗 Go to the Dashboard and use the Spouse Connection status widget to invite your spouse!")}
                >
                  Connect Spouse
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Children University Calculator */}
        <Card style={{ position: 'relative' }}>
          <div className="card-title">Educational Index</div>
          <div className="card-heading">Child Launchpad &amp; College Index</div>
          <div className="card-sub">Target inflation-adjusted parameters for children college accounts.</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0 20px' }}>
            {children.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-warm)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GraduationCap size={18} style={{ color: T.goldMid }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Target Entry: {c.collegeYear}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--fn)', fontSize: '0.88rem', fontWeight: 600 }}>{fmt(c.costTarget)}</span>
                  <button onClick={() => removeChild(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: partnerAccepted ? 'pointer' : 'default' }}>
                    <Trash2 size={13} style={{ color: T.rose }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr auto', gap: '6px', alignItems: 'center' }}>
            <input 
              className="goal-input" 
              style={{ marginBottom: 0 }} 
              type="text" 
              placeholder="Name..." 
              value={newName} 
              disabled={!partnerAccepted}
              onChange={e => setNewName(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0 }} 
              type="number" 
              placeholder="Year..." 
              value={newYear} 
              disabled={!partnerAccepted}
              onChange={e => setNewYear(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0 }} 
              type="number" 
              placeholder="Cost..." 
              value={newCost} 
              disabled={!partnerAccepted}
              onChange={e => setNewCost(e.target.value)}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 12px', background: T.gold }}
              onClick={addChild}
              disabled={!partnerAccepted}
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Glass Lock Screen Overlay */}
          {!partnerAccepted && (
            <div className="glass-lock-screen">
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Combined Family Planning</h4>
                <p className="lock-desc">Invite your spouse to calculate joint tuition targets, child plans, and family inflation models.</p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.gold, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={() => alert("🔗 Go to the Dashboard and use the Spouse Connection status widget to invite your spouse!")}
                >
                  Connect Spouse
                </button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
