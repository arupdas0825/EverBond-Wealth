import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSnapshot,
  formatCurrency,
  formatCompact,
  simulateGrowth,
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

const YEARS = [1, 5, 10, 20, 30];
const MILESTONES = [1, 3, 5, 10, 15, 20, 25, 30];

const TOOLTIP_STYLE = {
  borderRadius: '14px',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  fontFamily: T.fontBody,
  fontSize: '13px',
  padding: '14px 18px',
};

export function SimulationPage() {
  const {
    mode, currency, simYears, simReturn,
    setSimYears, setSimReturn, getTotalSalary,
  } = useFinanceStore();

  const [inflAdj, setInflAdj] = useState(false);

  const total    = getTotalSalary();
  const snapshot = useMemo(() => calculateFinancialSnapshot(total, mode), [total, mode]);
  const fmt      = a => formatCurrency(a, currency);
  const cmpct    = a => formatCompact(a, currency);

  const blended = snapshot.blendedReturn;
  const ret     = simReturn !== null ? simReturn : Math.round(blended * 10) / 10;

  const result   = useMemo(() => simulateGrowth(snapshot.budget.investments, simYears, ret, inflAdj), [snapshot, simYears, ret, inflAdj]);
  const invested = snapshot.budget.investments * simYears * 12;
  const gains    = result.fv - invested;
  const multi    = (result.fv / Math.max(invested, 1)).toFixed(2);

  const chartData = result.dataPoints.map(p => ({
    name: p.year === 0 ? 'Now' : `Yr ${p.year}`,
    Corpus: p.corpus,
    Invested: p.invested,
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Wealth Engine</div>
        <h1 className="page-title">Future <em>Simulation</em></h1>
        <p className="page-desc">
          High-fidelity shared wealth projection with SIP compounding. Inflation-adjustment optional.
        </p>
      </div>

      {/* Config Card */}
      <Card className="mb-20">
        <div className="card-title">Projection Settings</div>
        <div className="card-heading" style={{ marginBottom: 20 }}>Configure Horizon &amp; Return</div>

        {/* Year selector */}
        <div className="section-label" style={{ marginBottom: 12 }}>Time Horizon</div>
        <div className="sim-year-grid mb-28">
          {YEARS.map(y => (
            <button
              key={y}
              className={`sim-yr-btn ${simYears === y ? 'active' : ''}`}
              onClick={() => setSimYears(y)}
            >
              <span className="sim-yr-num">{y}</span>
              <span className="sim-yr-label">{y === 1 ? 'Year' : 'Years'}</span>
            </button>
          ))}
        </div>

        {/* Return slider + inflation toggle */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Expected Annual Return</div>
              <span style={{ fontSize: '0.78rem', color: T.textFaint, fontWeight: 600 }}>
                Blended Index:&nbsp;
                <span style={{ color: T.sage, fontWeight: 800 }}>{blended.toFixed(1)}%</span>
              </span>
            </div>
            <div className="slider-wrapper">
              <input
                type="range"
                className="eb-slider"
                min={1} max={40} step={0.5}
                value={ret}
                onChange={e => setSimReturn(parseFloat(e.target.value))}
              />
              <span className="slider-val">{ret.toFixed(1)}%</span>
            </div>
          </div>

          <div
            className="inflation-toggle"
            onClick={() => setInflAdj(!inflAdj)}
          >
            <div className={`toggle-track ${inflAdj ? 'on' : ''}`}>
              <div className="toggle-thumb" />
            </div>
            <div>
              <div className="toggle-label">Inflation Adjust</div>
              <div style={{ fontSize: '0.72rem', color: T.textFaint, fontWeight: 600 }}>
                {inflAdj ? 'Real returns (−6%)' : 'Nominal returns'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Result Cards */}
      <div className="sim-results mb-20">
        <div className="sim-result-card primary">
          <div className="sim-result-label">🏦 Final Shared Corpus</div>
          <div className="sim-result-value" style={{ color: T.goldMid }}>{cmpct(result.fv)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">💰 Total Contributions</div>
          <div className="sim-result-value">{cmpct(invested)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">✨ Net Wealth Gains</div>
          <div className="sim-result-value" style={{ color: T.sage }}>{cmpct(Math.max(0, gains))}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">📈 Wealth Multiplier</div>
          <div className="sim-result-value" style={{ color: T.goldMid }}>{multi}x</div>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-20">
        <div className="card-title">Growth Trajectory</div>
        <div className="card-heading" style={{ marginBottom: 4 }}>Shared Wealth Curve</div>
        <p className="card-sub">
          Compounding effect of {cmpct(snapshot.budget.investments)}/mo at {ret.toFixed(1)}% annual return.
        </p>

        <div className="chart-wrap-lg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCorpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.goldMid} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={T.goldMid} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInvest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.sky} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={T.sky} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: T.textFaint, fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                hide
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={v => [fmt(v), '']}
                labelStyle={{ fontWeight: 700, color: T.text, marginBottom: 6 }}
              />
              <Area
                name="Growth Corpus"
                type="monotone"
                dataKey="Corpus"
                stroke={T.goldMid}
                strokeWidth={3}
                fill="url(#gradCorpus)"
                activeDot={{ r: 7, stroke: 'white', strokeWidth: 2.5, fill: T.goldMid }}
              />
              <Area
                name="Total Invested"
                type="monotone"
                dataKey="Invested"
                stroke={T.sky}
                strokeWidth={2}
                strokeDasharray="6 6"
                fill="url(#gradInvest)"
                activeDot={{ r: 5, stroke: 'white', strokeWidth: 2, fill: T.sky }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-legend" style={{ marginTop: 20 }}>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: T.goldMid }} />
            Growth Corpus
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: T.sky, border: `2px dashed ${T.sky}`, background: 'transparent' }} />
            Total Contributed
          </div>
        </div>
      </Card>

      {/* Projection Table */}
      <Card>
        <div className="card-title">Projection Table</div>
        <div className="card-heading" style={{ marginBottom: 16 }}>Wealth at Key Milestones</div>
        <div className="table-scroll">
          <table className="wealth-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Invested</th>
                <th>Gains</th>
                <th>Corpus</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map(y => {
                const r = simulateGrowth(snapshot.budget.investments, y, ret, inflAdj);
                const inv = snapshot.budget.investments * y * 12;
                const g   = Math.max(0, r.fv - inv);
                return (
                  <tr key={y}>
                    <td>{y} {y === 1 ? 'Year' : 'Years'}</td>
                    <td>{cmpct(inv)}</td>
                    <td style={{ color: T.sage }}>{cmpct(g)}</td>
                    <td>{cmpct(r.fv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}