import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSnapshot, formatCurrency, formatCompact, simulateGrowth,
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Logo } from '../common/Logo';

import { Lock } from 'lucide-react';

const YEARS     = [1, 5, 10, 20, 30];
const MILESTONES= [1, 3, 5, 10, 15, 20, 25, 30];
const TT = {
  borderRadius:'14px',border:'none',
  boxShadow:'0 8px 32px rgba(0,0,0,.10)',
  fontFamily:T.fontBody,fontSize:'13px',padding:'14px 18px',
};

export function SimulationPage() {
  const { mode, currency, simYears=10, simReturn, setSimYears, setSimReturn, getTotalSalary, stage, partnerAccepted } = useFinanceStore();
  const [inflAdj, setInflAdj] = useState(false);

  const total  = getTotalSalary();
  const snap   = useMemo(()=>calculateFinancialSnapshot(total,mode),[total,mode]);
  const fmt    = a => formatCurrency(a,currency);
  const cmpct  = a => formatCompact(a,currency);

  const blended = snap.blendedReturn;
  const ret     = simReturn !== null && simReturn !== undefined ? simReturn : Math.round(blended*10)/10;

  const result   = useMemo(()=>simulateGrowth(snap.budget.investments,simYears,ret,inflAdj),[snap,simYears,ret,inflAdj]);
  const invested = snap.budget.investments * simYears * 12;
  const gains    = result.fv - invested;
  const multi    = (result.fv / Math.max(invested,1)).toFixed(2);

  const chartData = result.dataPoints.map(p=>({
    name: p.year===0 ? 'Now' : `Yr ${p.year}`,
    'Wealth Corpus': p.corpus,
    'Total Invested': p.invested,
  }));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow">Wealth Engine</div>
          <h1 className="page-title">Future <em>Simulation</em></h1>
          <p className="page-desc">
            High-fidelity SIP projection using the Excel formula:
            <strong style={{color:T.goldMid}}> FV = PMT × [((1+r)ⁿ − 1) / r] × (1+r)</strong>
          </p>
        </div>
        <div style={{ flexShrink: 0 }} className="desktop-only-logo">
          <Logo size={36} />
        </div>
      </div>

      {/* Config */}
      <Card className="mb-20">
        <div className="card-title">Projection Settings</div>
        <div className="card-heading mb-20">Configure Horizon &amp; Return Rate</div>

        <div className="section-label" style={{marginBottom:10}}>Time Horizon</div>
        <div className="sim-yr-grid mb-24">
          {YEARS.map(y=>(
            <button key={y} className={`sim-yr-btn ${simYears===y?'active':''}`}
              onClick={()=>setSimYears(y)}>
              <span className="sim-yr-num">{y}</span>
              <span className="sim-yr-label">{y===1?'Year':'Years'}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',gap:20,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="section-label" style={{marginBottom:0}}>Expected Annual Return</div>
              <span style={{fontSize:'.76rem',color:T.textFaint,fontWeight:600}}>
                Blended Index:&nbsp;
                <span style={{color:T.sage,fontWeight:800}}>{blended.toFixed(1)}%</span>
              </span>
            </div>
            <div className="slider-wrap">
              <input type="range" className="eb-slider" min={1} max={40} step={0.5}
                value={ret} onChange={e=>setSimReturn(parseFloat(e.target.value))}/>
              <span className="slider-val">{ret.toFixed(1)}%</span>
            </div>
          </div>

          <div className="infl-toggle" onClick={()=>setInflAdj(!inflAdj)}>
            <div className={`toggle-track ${inflAdj?'on':''}`}>
              <div className="toggle-thumb"/>
            </div>
            <div>
              <div className="toggle-label">Inflation Adjust</div>
              <div className="toggle-sub">{inflAdj ? 'Real returns (−6% p.a.)' : 'Nominal returns'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Result cards */}
      <div className="sim-results mb-20">
        <div className="sim-result-card primary">
          <div className="sim-result-label">🏦 {stage === 'Single' ? 'Final Solo Corpus' : 'Final Shared Corpus'}</div>
          <div className="sim-result-value" style={{color:T.goldMid}}>{cmpct(result.fv)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">💰 Total Contributed</div>
          <div className="sim-result-value">{cmpct(invested)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">✨ Net Wealth Gains</div>
          <div className="sim-result-value" style={{color:T.sage}}>{cmpct(Math.max(0,gains))}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">📈 Wealth Multiplier</div>
          <div className="sim-result-value" style={{color:T.goldMid}}>{multi}×</div>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-20">
        <div className="card-title">Growth Trajectory</div>
        <div className="card-heading mb-4">{stage === 'Single' ? 'Solo' : 'Shared'} Wealth Compounding Curve</div>
        <p className="card-sub">
          Monthly SIP of {cmpct(snap.budget.investments)} at {ret.toFixed(1)}% p.a. over {simYears} year{simYears>1?'s':''}.
          {inflAdj && ' Inflation-adjusted (real returns).'}
        </p>
        <div className="chart-wrap-lg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{top:8,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gcorpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.goldMid} stopOpacity={.18}/>
                  <stop offset="95%" stopColor={T.goldMid} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ginvest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.sky} stopOpacity={.10}/>
                  <stop offset="95%" stopColor={T.sky} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{fontSize:11,fill:T.textFaint,fontWeight:600}} dy={7}/>
              <YAxis hide domain={['auto','auto']}/>
              <Tooltip contentStyle={TT}
                formatter={(v,name)=>[cmpct(v),name]}
                labelStyle={{fontWeight:700,color:T.text,marginBottom:6}}/>
              <Area name="Wealth Corpus" type="monotone" dataKey="Wealth Corpus"
                stroke={T.goldMid} strokeWidth={2.8}
                fill="url(#gcorpus)"
                activeDot={{r:7,stroke:'white',strokeWidth:2.5,fill:T.goldMid}}/>
              <Area name="Total Invested" type="monotone" dataKey="Total Invested"
                stroke={T.sky} strokeWidth={2} strokeDasharray="6 5"
                fill="url(#ginvest)"
                activeDot={{r:5,stroke:'white',strokeWidth:2,fill:T.sky}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend mt-16">
          <div className="legend-item">
            <div className="legend-dot" style={{background:T.goldMid}}/>Wealth Corpus (Compounded)
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{background:T.sky}}/>Total Amount Invested
          </div>
        </div>
      </Card>

      {/* Projection table */}
      <Card>
        <div className="card-title">Projection Table</div>
        <div className="card-heading mb-16">Wealth at Key Milestones</div>
        <div className="table-scroll">
          <table className="wealth-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Invested</th>
                <th>Net Gains</th>
                <th>Wealth Corpus</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map(y=>{
                const r   = simulateGrowth(snap.budget.investments,y,ret,inflAdj);
                const inv = snap.budget.investments * y * 12;
                const g   = Math.max(0,r.fv-inv);
                return (
                  <tr key={y}>
                    <td>{y} {y===1?'Year':'Years'}</td>
                    <td>{cmpct(inv)}</td>
                    <td style={{color:T.sage}}>{cmpct(g)}</td>
                    <td>{cmpct(r.fv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Joint Wealth Simulations locked preview */}
      {stage !== 'Single' && !partnerAccepted && (
        <Card style={{ position: 'relative', marginTop: '20px' }}>
          <div className="card-title">Joint Compounding</div>
          <div className="card-heading">🔒 Joint Wealth Simulations</div>
          <div className="card-sub">Simulate combined dual-income compound trajectories over multiple risk parameters.</div>
          
          <div style={{ height: '140px', background: 'var(--bg-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
            Interactive joint trajectory curve visualization
          </div>

          <div className="glass-lock-screen">
            <div className="lock-screen-inner">
              <div className="lock-icon-glow" style={{ color: stage === 'Married' ? T.gold : T.rose, background: stage === 'Married' ? 'var(--gold-pale)' : 'var(--rose-lt)' }}>
                <Lock size={20} />
              </div>
              <h4 className="lock-title">🔒 Joint Wealth Simulations</h4>
              <p className="lock-desc">Invite your partner to sync combined projection parameters and plan together.</p>
              <button 
                className="btn-primary" 
                style={{ background: stage === 'Married' ? T.gold : T.rose, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }} 
                onClick={() => alert("🔗 Go to the Dashboard and use the Partner Connection status widget to invite your partner!")}
              >
                Connect Partner
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}