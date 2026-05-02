import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, 
  calculateHealthScore,
  formatCurrency, 
  formatCompact 
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';

export function Dashboard() {
  const state = useFinanceStore();
  const totalSalary = state.getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, state.mode);
  const health = calculateHealthScore(snapshot);
  
  const fmt = a => formatCurrency(a, state.currency);
  const cmpct = a => formatCompact(a, state.currency);
  
  const scoreColor = health.value >= 75 ? T.emerald : health.value >= 50 ? T.gold : T.rose;

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Welcome Back";
    let emoji = "✨";

    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good Morning";
      emoji = "❤️";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good Afternoon";
      emoji = "☀️";
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Good Evening";
      emoji = "🌙";
    }

    return `${timeGreeting}, ${state.partner1} & ${state.partner2} ${emoji}`;
  };

  const budgetData = [
    { name: 'Essentials', value: snapshot.budget.needs, color: "rgba(91,155,213,0.75)" },
    { name: 'Emergency', value: snapshot.budget.emergency, color: "rgba(232,110,122,0.75)" },
    { name: 'Investments', value: snapshot.budget.investments, color: "rgba(201,168,76,0.85)" },
  ];

  const assetData = [
    { name: 'Equity', value: snapshot.investmentSplit.equity, color: "rgba(201,168,76,0.8)" },
    { name: 'Debt', value: snapshot.investmentSplit.debt, color: "rgba(91,155,213,0.8)" },
    { name: 'Commodities', value: snapshot.investmentSplit.commodities, color: "rgba(76,175,138,0.8)" },
    { name: 'Crypto', value: snapshot.investmentSplit.crypto, color: "rgba(139,111,212,0.8)" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{getGreeting()}</div>
          <div className="page-desc">Your financial engine is running optimally for {state.region}.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-gold" style={{ marginBottom: '4px' }}>{state.mode}</span>
          <div style={{ fontSize: '11px', color: T.textFaint }}>Risk: {state.mode}</div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard cls="gold" icon="💰" label="Combined Salary" value={cmpct(totalSalary)} sub="Shared monthly income" />
        <StatCard cls="green" icon="📈" label="Monthly Investment" value={cmpct(snapshot.budget.investments)} sub={`${Math.round(snapshot.presets.invest * 100)}% Savings Rate`} />
        <StatCard cls="rose" icon="🛡️" label="Emergency Contribution" value={cmpct(snapshot.budget.emergency)} sub="Monthly safety split" />
        <StatCard cls="sky" icon="⚡" label="Financial Score" value={`${health.value}/100`} sub={health.label} />
      </div>

      <div className="grid-2">
        <Card title="Budget Allocation" subtitle="Real-time distribution of shared income">
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: T.shadow }}
                  formatter={(value) => fmt(value)} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {budgetData.map(item => (
              <div key={item.name} className="legend-item"><div className="legend-dot" style={{ background: item.color }} />{item.name}</div>
            ))}
          </div>
        </Card>
        <Card title="Asset Portfolio" subtitle="Current risk-weighted distribution">
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: T.shadow }}
                  formatter={(value) => cmpct(value)} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card gold className="text-center">
          <div className="card-title">Shared Readiness Score</div>
          <div className="card-subtitle">AI-calculated health indicator</div>
          <div className="health-circle-wrap">
            <div className="health-ring" style={{ background: `conic-gradient(${scoreColor} ${(health.value / 100) * 360}deg, rgba(0,0,0,0.06) 0deg)` }}>
              <div className="health-ring-inner">
                <div className="health-score-num" style={{ color: scoreColor }}>{health.value}</div>
                <div className="health-score-label">/ 100</div>
              </div>
            </div>
            <div className="health-tip" style={{ marginTop: '16px' }}>
              {health.tips[0] || "Your shared financial plan is stable."}
            </div>
          </div>
        </Card>
        <Card title="Engine Breakdown" subtitle="Detailed monthly flow">
          {[
            { color: T.sky, label: "Shared Essentials", val: fmt(snapshot.budget.needs) },
            { color: T.rose, label: "Safety Fund", val: fmt(snapshot.budget.emergency) },
            { color: T.gold, label: "Investment Corpus", val: fmt(snapshot.budget.investments) },
          ].map(r => (
            <div key={r.label} className="alloc-row">
              <div className="alloc-name"><div className="alloc-dot" style={{ background: r.color }} />{r.label}</div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
          <hr className="divider" />
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Portfolio Composition</div>
          {[
            { color: T.gold, label: `Equity (${Math.round(snapshot.presets.equity * 100)}%)`, val: fmt(snapshot.investmentSplit.equity) },
            { color: T.sky, label: `Debt (${Math.round(snapshot.presets.debt * 100)}%)`, val: fmt(snapshot.investmentSplit.debt) },
            { color: T.emerald, label: `Commodities (${Math.round(snapshot.presets.commodities * 100)}%)`, val: fmt(snapshot.investmentSplit.commodities) },
            { color: T.violet, label: `Crypto (${Math.round(snapshot.presets.crypto * 100)}%)`, val: fmt(snapshot.investmentSplit.crypto) },
          ].map(r => (
            <div key={r.label} className="alloc-row">
              <div className="alloc-name"><div className="alloc-dot" style={{ background: r.color }} />{r.label}</div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
