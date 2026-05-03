import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSnapshot,
  formatCurrency,
  formatCompact,
  calculateGoalTimeline,
  simulateGrowth,
} from '../../utils/finance';
import { T } from '../../theme/tokens';

const GOAL_DEFS = [
  { key: 'child',      icon: '🎓', name: 'Child Education',  color: T.goldMid,  accent: T.goldMid,  retPct: 10 },
  { key: 'retirement', icon: '🌅', name: 'Retirement',       color: T.sage,     accent: T.sage,     retPct: 12 },
  { key: 'house',      icon: '🏡', name: 'Home Purchase',    color: T.sky,      accent: T.sky,      retPct: 9  },
  { key: 'vacation',   icon: '✈️', name: 'Vacation / Travel', color: T.rose,    accent: T.rose,     retPct: 6  },
];

function fmtTimeline(months) {
  if (!isFinite(months)) return '∞';
  if (months <= 0)       return 'Achieved!';
  if (months < 12)       return `${months}m`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export function GoalsPage() {
  const { mode, currency, goalTargets, setGoalTargets, getTotalSalary } = useFinanceStore();
  const total    = getTotalSalary();
  const snapshot = useMemo(() => calculateFinancialSnapshot(total, mode), [total, mode]);
  const fmt      = a => formatCurrency(a, currency);
  const cmpct    = a => formatCompact(a, currency);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Dream Planner</div>
        <h1 className="page-title">Life <em>Goals</em></h1>
        <p className="page-desc">
          Set your shared targets and track real-time progress toward every dream.
        </p>
      </div>

      <div className="grid-2">
        {GOAL_DEFS.map(g => {
          const monthly  = snapshot.goalSplit[g.key];
          const target   = goalTargets[g.key] || 0;
          const months   = target > 0 ? calculateGoalTimeline(monthly, target, g.retPct) : Infinity;
          const corpus20 = simulateGrowth(monthly, 20, g.retPct).fv;
          const progress = target > 0 ? Math.min(((monthly * 240) / target) * 100, 100) : 0;

          return (
            <div
              key={g.key}
              className="goal-card"
              style={{
                borderTop: `3px solid ${g.color}`,
              }}
            >
              {/* Header */}
              <div className="goal-card-header">
                <div>
                  <div className="goal-icon-wrap">{g.icon}</div>
                  <div className="goal-name">{g.name}</div>
                  <div className="goal-tag">Monthly Allocation</div>
                </div>
                <div className="goal-monthly">
                  <div className="goal-monthly-amount" style={{ color: g.color }}>
                    {fmt(monthly)}
                  </div>
                  <div className="goal-eta">
                    {isFinite(months) ? `ETA · ${fmtTimeline(months)}` : 'Set a target →'}
                  </div>
                </div>
              </div>

              {/* Target */}
              <div className="goal-target-row" style={{ marginBottom: 8 }}>
                <span className="goal-target-label">Target Amount</span>
                <span className="goal-target-value">{target > 0 ? fmt(target) : '—'}</span>
              </div>

              <input
                className="goal-input"
                type="number"
                min={0}
                placeholder="Set target amount…"
                value={target || ''}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setGoalTargets({ ...goalTargets, [g.key]: isNaN(v) ? 0 : v });
                }}
              />

              {/* Progress */}
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.toFixed(1)}%`, background: g.color }}
                />
              </div>

              <div className="goal-projection">
                <span>20-Year Projection (at {g.retPct}% p.a.)</span>
                <span style={{ color: g.color, fontWeight: 700 }}>{cmpct(corpus20)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}