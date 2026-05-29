import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSnapshot, formatCurrency, formatCompact,
  calculateGoalTimeline, simulateGrowth,
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Lock, Crown } from 'lucide-react';
import { Logo } from '../common/Logo';

const GOAL_DEFS = [
  { key:'child',      icon:'🎓', name:'Child Education',   color:T.goldMid, retPct:10, tag:'Education Fund', lockedAt: 'Committed' },
  { key:'retirement', icon:'🌅', name:'Retirement Corpus', color:T.sage,    retPct:12, tag:'Long-term Goal' },
  { key:'house',      icon:'🏡', name:'Home Purchase',     color:T.sky,     retPct:9,  tag:'Asset Goal' },
  { key:'vacation',   icon:'✈️',  name:'Vacation / Travel', color:T.rose,    retPct:6,  tag:'Lifestyle Goal' },
];

function fmtEta(months) {
  if (!isFinite(months)) return '∞ — Set a target';
  if (months <= 0)        return '✓ Achieved!';
  if (months < 12)        return `${months} month${months>1?'s':''}`;
  const y = Math.floor(months/12), m = months%12;
  return m > 0 ? `${y}y ${m}m` : `${y} years`;
}

export function GoalsPage() {
  const { mode, currency, goalTargets, setGoalTargets, getTotalSalary, stage, setStage, partner1, partner2, setProfile } = useFinanceStore();
  const total = getTotalSalary();
  const snap  = useMemo(()=>calculateFinancialSnapshot(total,mode),[total,mode]);
  const fmt   = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);

  const handleUpgradeMarried = () => {
    if (window.confirm('💍 Upgrade to Married Stage? This will unlock Family Dynasty Planning, children education funds, and family estate reserves.')) {
      setStage('Married');
      setProfile({
        partner1,
        partner2: partner2 || 'Spouse',
        stage: 'Married',
        p1Salary: 150000,
        p2Salary: 120000
      });
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow">Dream Planner</div>
          <h1 className="page-title">Life <em>Goals</em></h1>
          <p className="page-desc">
            Set your targets. Monthly allocations are auto-calculated from the Excel engine based on your current life stage.
          </p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      <div className="grid-2">
        {GOAL_DEFS.map(g => {
          const monthly  = snap.goalSplit[g.key];
          const target   = goalTargets[g.key] || 0;
          const months   = target > 0 ? calculateGoalTimeline(monthly, target, g.retPct) : Infinity;
          const corpus20 = simulateGrowth(monthly, 20, g.retPct).fv;
          const progress = target > 0 ? Math.min((monthly * 240 / target) * 100, 100) : 0;
          
          const isGoalLocked = g.lockedAt === 'Committed' && stage !== 'Married';

          return (
            <div key={g.key} className="goal-card" style={{ borderTop: `3px solid ${g.color}`, position: 'relative' }}>
              {/* Header row */}
              <div className="goal-header">
                <div>
                  <div className="goal-icon">{g.icon}</div>
                  <div className="goal-name">{g.name}</div>
                  <div className="goal-tag">{g.tag}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="goal-monthly-amount" style={{color:g.color}}>{fmt(monthly)}</div>
                  <div className="goal-eta">{fmtEta(months)}</div>
                </div>
              </div>

              {/* Rate badge */}
              <div style={{
                display:'inline-flex',alignItems:'center',gap:5,
                padding:'3px 10px',borderRadius:100,
                background:`${g.color}14`,border:`1px solid ${g.color}30`,
                fontSize:'.68rem',fontWeight:700,color:g.color,marginBottom:14,
              }}>
                Expected Return · {g.retPct}% p.a.
              </div>

              {/* Target input */}
              <div className="goal-target-row">
                <span className="goal-target-label">Target Amount</span>
                <span className="goal-target-val">{target > 0 ? fmt(target) : '—'}</span>
              </div>
              <input
                className="goal-input"
                type="number" min={0}
                placeholder={`Set ${g.name} target…`}
                value={target||''}
                disabled={isGoalLocked}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setGoalTargets({ ...goalTargets, [g.key]: isNaN(v) ? 0 : v });
                }}
              />

              {/* Progress bar */}
              <div className="progress-track">
                <div className="progress-fill"
                  style={{width:`${progress.toFixed(1)}%`, background:g.color}}/>
              </div>

              {/* Projection row */}
              <div className="goal-projection">
                <span>20-yr corpus @ {g.retPct}% p.a.</span>
                <span style={{color:g.color, fontWeight:700, fontFamily:'var(--fd)', fontSize:'1rem'}}>
                  {cmpct(corpus20)}
                </span>
              </div>

              {/* Monthly breakdown micro-table */}
              <div className="divider" style={{margin:'12px 0 10px'}}/>
              <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
                {[1,5,10].map(y => {
                  const r = simulateGrowth(monthly, y, g.retPct);
                  return (
                    <div key={y} style={{textAlign:'center',flex:1,minWidth:60}}>
                      <div style={{fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',
                        letterSpacing:'.07em',color:'var(--text-faint)',marginBottom:3}}>
                        {y}Y Corpus
                      </div>
                      <div style={{fontFamily:'var(--fd)',fontSize:'.9rem',fontWeight:700,color:'var(--text)'}}>
                        {cmpct(r.fv)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Child Education Lock Overlay */}
              {isGoalLocked && (
                <div className="glass-lock-screen">
                  <div className="lock-screen-inner">
                    <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                      <Crown size={20} />
                    </div>
                    <h4 className="lock-title">Family Dynasty Plan</h4>
                    <p className="lock-desc">Child education indexes and family legacy building are unlocked in the Married Dynasty stage.</p>
                    <button 
                      className="btn-primary" 
                      style={{ background: T.gold, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                      onClick={handleUpgradeMarried}
                    >
                      💍 Upgrade to Married Stage
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}