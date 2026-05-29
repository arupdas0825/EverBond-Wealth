import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Crown, Sparkles, GraduationCap, Coins, Plus, Trash2, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatCompact } from '../../utils/finance';
import { Logo } from '../common/Logo';

export function FamilyPlanningPage() {
  const { partner1, partner2, currency, getTotalSalary } = useFinanceStore();
  const total = getTotalSalary();
  
  const [children, setChildren] = useState([
    { id: 1, name: 'Aarav', collegeYear: 2040, costTarget: 4500000 },
  ]);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('2042');
  const [newCost, setNewCost] = useState('6000000');

  const addChild = () => {
    if (!newName.trim()) return;
    setChildren([
      ...children,
      { id: Date.now(), name: newName.trim(), collegeYear: parseInt(newYear) || 2042, costTarget: parseFloat(newCost) || 5000000 }
    ]);
    setNewName('');
  };

  const removeChild = (id) => {
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

      <div className="grid-2 mb-20">
        
        {/* Generational Vault Trust */}
        <Card gold>
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
        </Card>

        {/* Children University Calculator */}
        <Card>
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
                  <button onClick={() => removeChild(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
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
              onChange={e => setNewName(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0 }} 
              type="number" 
              placeholder="Year..." 
              value={newYear} 
              onChange={e => setNewYear(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0 }} 
              type="number" 
              placeholder="Cost..." 
              value={newCost} 
              onChange={e => setNewCost(e.target.value)}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 12px', background: T.gold }}
              onClick={addChild}
            >
              <Plus size={15} />
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
