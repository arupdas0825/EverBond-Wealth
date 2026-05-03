import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency } from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

export function AllocationPage() {
  const { mode, currency, getTotalSalary } = useFinanceStore();
  const totalSalary = getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, mode);
  const fmt = a => formatCurrency(a, currency);
  const pct = n => (n * 100).toFixed(1) + "%";

  const portfolioData = [
    { name: "Large Cap", value: snapshot.equityBreakdown.largeCap, color: "rgba(201,168,76,0.9)" },
    { name: "Mid Cap", value: snapshot.equityBreakdown.midCap, color: "rgba(201,168,76,0.6)" },
    { name: "Small Cap", value: snapshot.equityBreakdown.smallCap, color: "rgba(201,168,76,0.35)" },
    { name: "Liquid Debt", value: snapshot.debtBreakdown.liquid, color: "rgba(91,155,213,0.9)" },
    { name: "Short TMF", value: snapshot.debtBreakdown.shortTMF, color: "rgba(91,155,213,0.6)" },
    { name: "Target Mat.", value: snapshot.debtBreakdown.targetMat, color: "rgba(91,155,213,0.35)" },
    { name: "Gold", value: snapshot.commoditiesBreakdown.gold, color: "rgba(76,175,138,0.9)" },
    { name: "Silver", value: snapshot.commoditiesBreakdown.silver, color: "rgba(76,175,138,0.5)" },
    { name: "Crypto", value: snapshot.investmentSplit.crypto, color: "rgba(139,111,212,0.8)" },
  ];

  const goalData = [
    { name: "Child Education", value: snapshot.goalSplit.child, color: "rgba(201,168,76,0.85)" },
    { name: "Retirement", value: snapshot.goalSplit.retirement, color: "rgba(76,175,138,0.85)" },
    { name: "Home Purchase", value: snapshot.goalSplit.house, color: "rgba(91,155,213,0.85)" },
    { name: "Vacation", value: snapshot.goalSplit.vacation, color: "rgba(232,110,122,0.85)" },
  ];

  const AllocSection = ({ title, sub, rows }) => (
    <Card className="mb-16">
      <div className="section-title">{title}</div>
      <div className="section-sub">{sub}</div>
      {rows.map(r => (
        <div key={r.label} className="alloc-row">
          <div className="alloc-name">{r.dot && <div className="alloc-dot" style={{ background: r.dot }} />}{r.label}</div>
          <div className="alloc-right">
            <span className="alloc-pct">{r.pct}</span>
            <span className="alloc-amount">{r.val}</span>
          </div>
        </div>
      ))}
    </Card>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Portfolio <em>Engine</em></div>
          <div className="page-desc">Granular asset-class distribution for your shared portfolio.</div>
        </div>
      </div>

      <div className="grid-2">
        <Card gold title="Asset Allocation Engine" subtitle="Dynamic portfolio weighting">
          <div className="recharts-responsive-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  {portfolioData.map((entry, index) => (
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
        </Card>
        <Card title="Goal Funding Engine" subtitle="Shared life goal distribution">
          <div className="recharts-responsive-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalData} outerRadius={70} dataKey="value">
                  {goalData.map((entry, index) => (
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
          <div className="chart-legend" style={{ marginTop: 12 }}>
            {goalData.map(item => (
              <div key={item.name} className="legend-item"><div className="legend-dot" style={{ background: item.color }} />{item.name}</div>
            ))}
          </div>
        </Card>
      </div>

      <AllocSection title="Engine Budget Split" sub="Shared income distribution" rows={[
        { dot: T.sky, label: "Shared Essentials", pct: pct(snapshot.presets.needs), val: fmt(snapshot.budget.needs) },
        { dot: T.rose, label: "Safety / Emergency Fund", pct: pct(snapshot.presets.emergency), val: fmt(snapshot.budget.emergency) },
        { dot: T.gold, label: "Investment Corpus", pct: pct(snapshot.presets.invest), val: fmt(snapshot.budget.investments) },
      ]} />

      <AllocSection title="Portfolio Weighting" sub="Primary asset-class split" rows={[
        { dot: T.gold, label: "Equity", pct: pct(snapshot.presets.equity), val: fmt(snapshot.investmentSplit.equity) },
        { dot: T.sky, label: "Debt", pct: pct(snapshot.presets.debt), val: fmt(snapshot.investmentSplit.debt) },
        { dot: T.emerald, label: "Commodities", pct: pct(snapshot.presets.commodities), val: fmt(snapshot.investmentSplit.commodities) },
        { dot: T.violet, label: "Crypto / High Risk", pct: pct(snapshot.presets.crypto), val: fmt(snapshot.investmentSplit.crypto) },
      ]} />

      <div className="grid-2">
        <AllocSection title="Equity Engine" sub="Internal cap-size distribution" rows={[
          { dot: T.gold, label: "Large Cap", pct: pct(snapshot.presets.equityLarge), val: fmt(snapshot.equityBreakdown.largeCap) },
          { dot: "rgba(201,168,76,0.6)", label: "Mid Cap", pct: pct(snapshot.presets.equityMid), val: fmt(snapshot.equityBreakdown.midCap) },
          { dot: "rgba(201,168,76,0.35)", label: "Small Cap", pct: pct(snapshot.presets.equitySmall), val: fmt(snapshot.equityBreakdown.smallCap) },
        ]} />
        <AllocSection title="Debt Engine" sub="Duration & Liquidity split" rows={[
          { dot: T.sky, label: "Liquid / Overnight", pct: pct(snapshot.presets.debtLiquid), val: fmt(snapshot.debtBreakdown.liquid) },
          { dot: "rgba(91,155,213,0.6)", label: "Short / TMF", pct: pct(snapshot.presets.debtShortTMF), val: fmt(snapshot.debtBreakdown.shortTMF) },
          { dot: "rgba(91,155,213,0.35)", label: "Target Maturity", pct: pct(snapshot.presets.debtTargetMat), val: fmt(snapshot.debtBreakdown.targetMat) },
        ]} />
      </div>
    </div>
  );
}
