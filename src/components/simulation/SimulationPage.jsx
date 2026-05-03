import React, { useState } from 'react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, 
  formatCurrency, 
  formatCompact, 
  simulateGrowth 
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

export function SimulationPage() {
  const { 
    mode, currency, simYears, simReturn, 
    setSimYears, setSimReturn, getTotalSalary 
  } = useFinanceStore();
  
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  
  const totalSalary = getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, mode);
  const fmt = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  
  const blended = snapshot.blendedReturn;
  const ret = simReturn !== null ? simReturn : Math.round(blended * 10) / 10;
  
  const result = simulateGrowth(snapshot.budget.investments, simYears, ret, inflationAdjusted);
  const invested = snapshot.budget.investments * simYears * 12;
  const gains = result.fv - invested;

  const chartData = result.dataPoints.map(p => ({
    name: `Yr ${p.year}`,
    corpus: p.corpus,
    invested: p.invested
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Wealth <em>Engine</em></div>
          <div className="page-desc">High-fidelity shared wealth projection with inflation-adjustment support.</div>
        </div>
      </div>

      <Card className="mb-20">
        <div className="card-title">Projection Configuration</div>
        <div className="card-subtitle">Select shared future horizon & parameters</div>
        
        <div className="sim-btn-grid">
          {[1, 5, 10, 20, 30].map(y => (
            <button key={y} className={`sim-btn ${simYears === y ? "active" : ""}`} onClick={() => setSimYears(y)}>
              <span className="sim-yr">{y}</span>
              <span className="sim-label">Yr Horizon</span>
            </button>
          ))}
        </div>

        <div className="sim-config-footer">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Expected Shared Return (%)</label>
              <div style={{ fontSize: '11px', fontWeight: 800, color: T.textFaint, textTransform: 'uppercase' }}>
                Blended Index: <span style={{ color: T.emerald }}>{blended.toFixed(1)}%</span>
              </div>
            </div>
            <div className="slider-row">
              <input 
                type="range" className="eb-slider" min={1} max={40} step={0.5} 
                value={ret} onChange={e => setSimReturn(parseFloat(e.target.value))} 
              />
              <span className="slider-val">{ret.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="inflation-toggle" onClick={() => setInflationAdjusted(!inflationAdjusted)} style={{ 
            padding: '16px 24px', background: '#F9F9F7', borderRadius: '16px', border: '1.5px solid var(--border)', 
            cursor: 'pointer', flexShrink: 0, transition: '0.3s'
          }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Inflation Mode (6%)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="eb-toggle" style={{ 
                width: '36px', height: '20px', background: inflationAdjusted ? T.emerald : '#E0E0E0', 
                borderRadius: '20px', position: 'relative', transition: '0.3s' 
              }}>
                <div style={{ 
                  width: '14px', height: '14px', background: 'white', borderRadius: '50%', 
                  position: 'absolute', top: '3px', left: inflationAdjusted ? '19px' : '3px', transition: '0.3s' 
                }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: T.text }}>{inflationAdjusted ? "Adjusted" : "Nominal"}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="sim-results-grid">
        <div className="sim-result-card card-gold">
          <div className="sim-result-label">🏦 Final Shared Corpus</div>
          <div className="sim-result-value" style={{ color: T.gold }}>{cmpct(result.fv)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">💰 Combined Contributions</div>
          <div className="sim-result-value">{cmpct(invested)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">✨ Shared Net Gains</div>
          <div className="sim-result-value" style={{ color: T.emerald }}>{cmpct(Math.max(0, gains))}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">📈 Wealth Multiplier</div>
          <div className="sim-result-value" style={{ color: T.gold }}>{(result.fv / Math.max(invested, 1)).toFixed(2)}x</div>
        </div>
      </div>

      <Card className="mb-20">
        <div className="card-title">Shared Growth Trajectory</div>
        <div className="card-subtitle">Compounding effect based on selected risk engine</div>
        <div className="recharts-responsive-container" style={{ marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.gold} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={T.gold} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: T.textFaint, fontWeight: 600 }} 
                dy={12}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: T.shadow, padding: '16px' }}
                formatter={(value) => [fmt(value), ""]}
                labelStyle={{ fontWeight: 800, color: T.text, marginBottom: '8px', fontSize: '15px' }}
              />
              <Area 
                name="Future Shared Corpus"
                type="monotone" 
                dataKey="corpus" 
                stroke={T.gold} 
                fillOpacity={1} 
                fill="url(#colorCorpus)" 
                strokeWidth={4} 
                activeDot={{ r: 8, stroke: 'white', strokeWidth: 3, fill: T.gold }}
              />
              <Area 
                name="Combined Invested"
                type="monotone" 
                dataKey="invested" 
                stroke={T.sky} 
                fill="transparent" 
                strokeWidth={2.5} 
                strokeDasharray="8 8" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '32px', gap: '48px' }}>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: T.gold, width: '14px', height: '14px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Shared Growth Corpus</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ 
              background: 'transparent', 
              border: `2.5px dashed ${T.sky}`, 
              width: '14px', height: '14px',
              borderRadius: '4px'
            }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Total Shared Contributions</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
