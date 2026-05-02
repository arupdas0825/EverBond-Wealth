import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, 
  formatCurrency, 
  calculateGoalTimeline, 
  simulateGrowth 
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

const GOAL_DEFS = [
  { key: "child", icon: "🎓", name: "Child Education", color: T.gold, retPct: 10 },
  { key: "retirement", icon: "🌅", name: "Retirement", color: T.emerald, retPct: 12 },
  { key: "house", icon: "🏡", name: "Home Purchase", color: T.sky, retPct: 9 },
  { key: "vacation", icon: "✈️", name: "Vacation / Travel", color: T.rose, retPct: 6 },
];

export function GoalsPage() {
  const { 
    mode, currency, goalTargets, setGoalTargets, 
    customGoals, addCustomGoal, removeCustomGoal, getTotalSalary 
  } = useFinanceStore();
  
  const totalSalary = getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, mode);
  const fmt = a => formatCurrency(a, currency);
  
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (!newGoalName.trim()) return;
    const icons = ["🚗", "🌍", "📱", "🎵", "🏆", "💎", "🌺", "🎨"];
    addCustomGoal({ 
      name: newGoalName.trim(), 
      target: parseFloat(newGoalTarget) || 500000, 
      icon: icons[Math.floor(Math.random() * icons.length)], 
      pct: 0.05 
    });
    setNewGoalName(""); setNewGoalTarget(""); setShowAddForm(false);
  };

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
          
          // Use real compounding for 20yr projection
          const corpus20 = simulateGrowth(monthly, 20, g.retPct).fv;
          const progress = target > 0 ? Math.min(((monthly * 12 * 10) / target) * 100, 100) : 0;

          return (
            <div key={g.key} className="goal-card">
              <div className="goal-header">
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{g.icon}</div>
                  <div className="goal-name">{g.name}</div>
                  <div className="goal-monthly-label">Monthly Engine Funding</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="goal-amount" style={{ color: g.color }}>{fmt(monthly)}</div>
                  <div className="goal-timeline" style={{ fontWeight: 600 }}>ETA: {years}</div>
                </div>
              </div>
              
              <div className="alloc-row" style={{ padding: "12px 0", borderBottom: 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.textFaint, textTransform: 'uppercase' }}>Engine Target</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{fmt(target)}</span>
              </div>
              
              <input
                className="goal-input"
                type="number"
                placeholder="Set target amount"
                value={target === 0 ? "" : target}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setGoalTargets({ ...goalTargets, [g.key]: isNaN(v) ? 0 : v });
                }}
              />
              
              <div className="progress-track" style={{ height: '8px', marginTop: '16px' }}>
                <div className="progress-fill" style={{ width: `${progress}%`, background: g.color }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textFaint, marginTop: 10, fontWeight: 500 }}>
                <span>10-Year Trajectory</span>
                <span>20yr Corpus: {fmt(corpus20)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
