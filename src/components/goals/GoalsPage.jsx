import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, 
  formatCurrency, 
  calculateGoalTimeline, 
  simulateGrowth 
} from '../../utils/finance';
import { T } from '../../theme/tokens';

const GOAL_DEFS = [
  { key: "child", icon: "🎓", name: "Child Education", color: T.gold, retPct: 10 },
  { key: "retirement", icon: "🌅", name: "Retirement", color: T.emerald, retPct: 12 },
  { key: "house", icon: "🏡", name: "Home Purchase", color: T.sky, retPct: 9 },
  { key: "vacation", icon: "✈️", name: "Vacation / Travel", color: T.rose, retPct: 6 },
];

export function GoalsPage() {
  const { 
    mode, currency, goalTargets, setGoalTargets, getTotalSalary 
  } = useFinanceStore();
  
  const totalSalary = getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, mode);
  const fmt = a => formatCurrency(a, currency);
  
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Goal <em>Engine</em></div>
          <div className="page-desc">Real-time timelines and funding progress for your shared dreams.</div>
        </div>
      </div>

      <div className="grid-2">
        {GOAL_DEFS.map(g => {
          const monthly = snapshot.goalSplit[g.key];
          const target = goalTargets[g.key] || 0;
          const months = calculateGoalTimeline(monthly, target, g.retPct);
          const years = months === Infinity ? "∞" : months < 12 ? `${months}m` : `${Math.floor(months / 12)}y ${months % 12}m`;
          const corpus20 = simulateGrowth(monthly, 20, g.retPct).fv;
          const progress = target > 0 ? Math.min(((monthly * 12 * 10) / target) * 100, 100) : 0;

          return (
            <div key={g.key} className="goal-card">
              <div className="goal-header">
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{g.icon}</div>
                  <div className="goal-name">{g.name}</div>
                  <div className="goal-monthly-label">Monthly Split</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="goal-amount" style={{ color: g.color }}>{fmt(monthly)}</div>
                  <div className="goal-timeline">ETA: <strong>{years}</strong></div>
                </div>
              </div>
              
              <div className="alloc-row" style={{ padding: "16px 0", borderBottom: 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '1px' }}>Engine Target</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{fmt(target)}</span>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <input
                  className="goal-input"
                  type="number"
                  placeholder="Set target amount..."
                  value={target === 0 ? "" : target}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setGoalTargets({ ...goalTargets, [g.key]: isNaN(v) ? 0 : v });
                  }}
                />
                
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: g.color }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>10-Year Trajectory</span>
                  <span style={{ color: T.textMuted }}>20yr Projection: {fmt(corpus20)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
