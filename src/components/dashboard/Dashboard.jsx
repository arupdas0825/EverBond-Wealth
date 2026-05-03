import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSnapshot,
  calculateHealthScore,
  formatCurrency,
  formatCompact,
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';

const TOOLTIP_STYLE = {
  borderRadius: '14px',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  fontFamily: T.fontBody,
  fontSize: '13px',
  padding: '12px 16px',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return ['Good Night',     '🌙'];
  if (h < 12) return ['Good Morning',   '☀️'];
  if (h < 17) return ['Good Afternoon', '✨'];
  if (h < 21) return ['Good Evening',   '🌇'];
  return ['Good Night', '🌙'];
}

export function Dashboard() {
  const state       = useFinanceStore();
  const totalSalary = state.getTotalSalary();
  const snapshot    = useMemo(() => calculateFinancialSnapshot(totalSalary, state.mode), [totalSalary, state.mode]);
  const health      = useMemo(() => calculateHealthScore(snapshot), [snapshot]);

  const fmt   = a => formatCurrency(a, state.currency);
  const cmpct = a => formatCompact(a, state.currency);

  const [greeting, emoji] = getGreeting();
  const scoreColor = health.value >= 75 ? T.sage : health.value >= 50 ? T.goldMid : T.rose;
  const scoreDeg   = (health.value / 100) * 360;

  // Chart data
  const budgetData = [
    { name: 'Essentials',   value: snapshot.budget.needs,        color: T.sky },
    { name: 'Emergency',    value: snapshot.budget.emergency,    color: T.rose },
    { name: 'Investments',  value: snapshot.budget.investments,  color: T.goldMid },
  ];

  const assetData = [
    { name: 'Equity',       value: snapshot.investmentSplit.equity,       color: T.goldMid },
    { name: 'Debt',         value: snapshot.investmentSplit.debt,         color: T.sky },
    { name: 'Commodities',  value: snapshot.investmentSplit.commodities,  color: T.sage },
    { name: 'Crypto',       value: snapshot.investmentSplit.crypto,       color: T.violet },
  ];

  return (
    <div className="fade-in">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">{greeting}</div>
        <h1 className="page-title">
          {state.partner1} &amp; {state.partner2} {emoji}
        </h1>
        <p className="page-desc">
          Your wealth engine is calibrated for {state.region} · {state.mode} mode.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid mb-28">
        <StatCard
          cls="gold"
          icon="💰"
          label="Combined Income"
          value={cmpct(totalSalary)}
          sub="Shared monthly salary"
        />
        <StatCard
          cls="sage"
          icon="📈"
          label="Monthly Investment"
          value={cmpct(snapshot.budget.investments)}
          sub={`${Math.round(snapshot.presets.invest * 100)}% savings rate`}
        />
        <StatCard
          cls="rose"
          icon="🛡️"
          label="Emergency Fund"
          value={cmpct(snapshot.budget.emergency)}
          sub="Monthly safety reserve"
        />
        <StatCard
          cls="sky"
          icon="⚡"
          label="Financial Score"
          value={`${health.value}/100`}
          sub={health.label}
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-20">
        <Card>
          <div className="card-title">Budget Allocation</div>
          <div className="card-heading">Income Distribution</div>
          <div className="card-sub">Real-time split of combined income</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {budgetData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.82} />)}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={v => [fmt(v), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {budgetData.map(d => (
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Asset Portfolio</div>
          <div className="card-heading">Investment Split</div>
          <div className="card-sub">Risk-weighted portfolio composition</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  innerRadius="42%"
                  outerRadius="68%"
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {assetData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.82} />)}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={v => [cmpct(v), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {assetData.map(d => (
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Health Score + Snapshot */}
      <div className="grid-2">
        <Card gold>
          <div className="card-title">Shared Readiness Score</div>
          <div className="card-heading">Financial Health</div>
          <div className="health-ring-wrap">
            <div
              className="health-ring"
              style={{
                background: `conic-gradient(${scoreColor} ${scoreDeg}deg, ${T.bgMuted} ${scoreDeg}deg)`,
              }}
            >
              <div className="health-ring-inner">
                <div className="health-score-num" style={{ color: scoreColor }}>
                  {health.value}
                </div>
                <div className="health-score-unit">/ 100</div>
              </div>
            </div>
            <div className="health-label">{health.label}</div>
            <div className="health-tip">
              {health.tips[0] || 'Your shared financial plan is well-structured.'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">Monthly Snapshot</div>
          <div className="card-heading">Complete Flow</div>
          <div className="card-sub">Detailed monthly money movement</div>

          <div style={{ marginBottom: 4 }}>
            {[
              { dot: T.sky,     label: 'Shared Essentials',    val: fmt(snapshot.budget.needs) },
              { dot: T.rose,    label: 'Safety Reserve',       val: fmt(snapshot.budget.emergency) },
              { dot: T.goldMid, label: 'Investment Corpus',    val: fmt(snapshot.budget.investments) },
            ].map(r => (
              <div key={r.label} className="alloc-row">
                <div className="alloc-name">
                  <div className="alloc-dot" style={{ background: r.dot }} />
                  {r.label}
                </div>
                <div className="alloc-amount">{r.val}</div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div className="section-label">Portfolio Composition</div>
          {[
            { dot: T.goldMid, label: `Equity · ${Math.round(snapshot.presets.equity * 100)}%`,       val: fmt(snapshot.investmentSplit.equity) },
            { dot: T.sky,     label: `Debt · ${Math.round(snapshot.presets.debt * 100)}%`,           val: fmt(snapshot.investmentSplit.debt) },
            { dot: T.sage,    label: `Commodities · ${Math.round(snapshot.presets.commodities * 100)}%`, val: fmt(snapshot.investmentSplit.commodities) },
            { dot: T.violet,  label: `Crypto · ${Math.round(snapshot.presets.crypto * 100)}%`,       val: fmt(snapshot.investmentSplit.crypto) },
          ].map(r => (
            <div key={r.label} className="alloc-row">
              <div className="alloc-name">
                <div className="alloc-dot" style={{ background: r.dot }} />
                {r.label}
              </div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}