import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency } from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

const TOOLTIP_STYLE = {
  borderRadius: '14px',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  fontFamily: T.fontBody,
  fontSize: '13px',
  padding: '12px 16px',
};

function AllocBlock({ label, sub, rows }) {
  return (
    <Card className="mb-16">
      <div className="card-title">{label}</div>
      <div className="card-heading" style={{ marginBottom: 4 }}>{sub}</div>
      <div className="divider" style={{ margin: '14px 0' }} />
      {rows.map(r => (
        <div key={r.label} className="alloc-row">
          <div className="alloc-name">
            {r.dot && <div className="alloc-dot" style={{ background: r.dot }} />}
            {r.label}
          </div>
          <div className="alloc-right">
            <span className="alloc-pct">{r.pct}</span>
            <span className="alloc-amount">{r.val}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

export function AllocationPage() {
  const { mode, currency, getTotalSalary } = useFinanceStore();
  const total    = getTotalSalary();
  const snap     = useMemo(() => calculateFinancialSnapshot(total, mode), [total, mode]);
  const fmt      = a => formatCurrency(a, currency);
  const pct      = n => (n * 100).toFixed(1) + '%';

  const portfolioData = [
    { name: 'Large Cap',   value: snap.equityBreakdown.largeCap,   color: 'rgba(184,144,42,0.92)' },
    { name: 'Mid Cap',     value: snap.equityBreakdown.midCap,     color: 'rgba(184,144,42,0.60)' },
    { name: 'Small Cap',   value: snap.equityBreakdown.smallCap,   color: 'rgba(184,144,42,0.32)' },
    { name: 'Liquid Debt', value: snap.debtBreakdown.liquid,       color: 'rgba(74,140,196,0.90)' },
    { name: 'Short TMF',   value: snap.debtBreakdown.shortTMF,     color: 'rgba(74,140,196,0.58)' },
    { name: 'Target Mat.', value: snap.debtBreakdown.targetMat,    color: 'rgba(74,140,196,0.30)' },
    { name: 'Gold',        value: snap.commoditiesBreakdown.gold,  color: 'rgba(78,155,120,0.92)' },
    { name: 'Silver',      value: snap.commoditiesBreakdown.silver,color: 'rgba(78,155,120,0.52)' },
    { name: 'Crypto',      value: snap.investmentSplit.crypto,     color: 'rgba(124,107,190,0.82)' },
  ];

  const goalData = [
    { name: 'Child Education', value: snap.goalSplit.child,      color: T.goldMid },
    { name: 'Retirement',      value: snap.goalSplit.retirement, color: T.sage },
    { name: 'Home Purchase',   value: snap.goalSplit.house,      color: T.sky },
    { name: 'Vacation',        value: snap.goalSplit.vacation,   color: T.rose },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Portfolio Engine</div>
        <h1 className="page-title">Investment <em>Allocation</em></h1>
        <p className="page-desc">
          Granular asset-class distribution across your entire shared portfolio.
        </p>
      </div>

      {/* Chart row */}
      <div className="grid-2 mb-20">
        <Card gold>
          <div className="card-title">Full Portfolio Breakdown</div>
          <div className="card-heading" style={{ marginBottom: 4 }}>All Asset Classes</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {portfolioData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {portfolioData.map(d => (
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Goal Funding Engine</div>
          <div className="card-heading" style={{ marginBottom: 4 }}>Life Goal Split</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalData}
                  outerRadius="68%"
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                >
                  {goalData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {goalData.map(d => (
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Budget Split */}
      <AllocBlock
        label="Budget Allocation"
        sub="Combined income distribution"
        rows={[
          { dot: T.sky,     label: 'Shared Essentials',           pct: pct(snap.presets.needs),      val: fmt(snap.budget.needs) },
          { dot: T.rose,    label: 'Safety / Emergency Reserve',  pct: pct(snap.presets.emergency),  val: fmt(snap.budget.emergency) },
          { dot: T.goldMid, label: 'Investment Corpus',           pct: pct(snap.presets.invest),     val: fmt(snap.budget.investments) },
        ]}
      />

      {/* Investment Split */}
      <AllocBlock
        label="Investment Split"
        sub="Primary asset-class weighting"
        rows={[
          { dot: T.goldMid, label: 'Equity',             pct: pct(snap.presets.equity),       val: fmt(snap.investmentSplit.equity) },
          { dot: T.sky,     label: 'Debt',               pct: pct(snap.presets.debt),         val: fmt(snap.investmentSplit.debt) },
          { dot: T.sage,    label: 'Commodities',        pct: pct(snap.presets.commodities),  val: fmt(snap.investmentSplit.commodities) },
          { dot: T.violet,  label: 'Crypto / High Risk', pct: pct(snap.presets.crypto),       val: fmt(snap.investmentSplit.crypto) },
        ]}
      />

      {/* Detailed breakdowns */}
      <div className="grid-2">
        <AllocBlock
          label="Equity Engine"
          sub="Internal cap-size split"
          rows={[
            { dot: 'rgba(184,144,42,0.92)', label: 'Large Cap', pct: pct(snap.presets.equityLarge), val: fmt(snap.equityBreakdown.largeCap) },
            { dot: 'rgba(184,144,42,0.60)', label: 'Mid Cap',   pct: pct(snap.presets.equityMid),   val: fmt(snap.equityBreakdown.midCap) },
            { dot: 'rgba(184,144,42,0.32)', label: 'Small Cap', pct: pct(snap.presets.equitySmall), val: fmt(snap.equityBreakdown.smallCap) },
          ]}
        />

        <AllocBlock
          label="Debt Engine"
          sub="Duration & liquidity split"
          rows={[
            { dot: 'rgba(74,140,196,0.90)', label: 'Liquid / Overnight', pct: pct(snap.presets.debtLiquid),    val: fmt(snap.debtBreakdown.liquid) },
            { dot: 'rgba(74,140,196,0.58)', label: 'Short Duration/TMF', pct: pct(snap.presets.debtShortTMF),  val: fmt(snap.debtBreakdown.shortTMF) },
            { dot: 'rgba(74,140,196,0.30)', label: 'Target Maturity',    pct: pct(snap.presets.debtTargetMat), val: fmt(snap.debtBreakdown.targetMat) },
          ]}
        />

        <AllocBlock
          label="Commodities Engine"
          sub="Precious metals allocation"
          rows={[
            { dot: 'rgba(78,155,120,0.92)', label: 'Gold (SGB/ETF)', pct: pct(snap.presets.goldPct),   val: fmt(snap.commoditiesBreakdown.gold) },
            { dot: 'rgba(78,155,120,0.52)', label: 'Silver (ETF)',   pct: pct(snap.presets.silverPct), val: fmt(snap.commoditiesBreakdown.silver) },
          ]}
        />

        <AllocBlock
          label="Goal Funding Engine"
          sub="Monthly allocation per goal"
          rows={[
            { dot: T.goldMid, label: '🎓 Child Education', pct: pct(snap.presets.goalChild),   val: fmt(snap.goalSplit.child) },
            { dot: T.sage,    label: '🌅 Retirement',      pct: pct(snap.presets.goalRetire),  val: fmt(snap.goalSplit.retirement) },
            { dot: T.sky,     label: '🏡 Home Purchase',   pct: pct(snap.presets.goalHouse),   val: fmt(snap.goalSplit.house) },
            { dot: T.rose,    label: '✈️ Vacation',         pct: pct(snap.presets.goalVacation),val: fmt(snap.goalSplit.vacation) },
          ]}
        />
      </div>
    </div>
  );
}