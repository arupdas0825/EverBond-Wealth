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
import { useTranslation } from '../../utils/i18n';
import { Lock } from 'lucide-react';

const YEARS     = [1, 5, 10, 20, 30];
const MILESTONES= [1, 3, 5, 10, 15, 20, 25, 30];
const TT = {
  borderRadius: '14px',
  border: '1px solid var(--border-mid)',
  boxShadow: 'var(--sh-md)',
  fontFamily: T.fontBody,
  fontSize: '13px',
  padding: '12px 16px',
  background: 'var(--bg-card)',
  color: 'var(--text)',
};

export function SimulationPage() {
  const { mode, currency, simYears=10, simReturn, setSimYears, setSimReturn, getTotalSalary, stage, partnerAccepted } = useFinanceStore();
  const { t } = useTranslation();
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
    name: p.year===0 ? t('now', 'Now') : `${t('yr_short', 'Yr')} ${p.year}`,
    'Wealth Corpus': p.corpus,
    'Total Invested': p.invested,
  }));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow">{t('wealth_engine', 'Wealth Engine')}</div>
          <h1 className="page-title">{t('future', 'Future')} <em>{t('simulation', 'Simulation')}</em></h1>
          <p className="page-desc">
            {t('simulation_desc', 'High-fidelity SIP projection using the Excel formula:')}
            <strong style={{color:T.goldMid}}> FV = PMT × [((1+r)ⁿ − 1) / r] × (1+r)</strong>
          </p>
        </div>
      </div>

      {/* Config */}
      <Card className="mb-20">
        <div className="card-title">{t('projection_settings', 'Projection Settings')}</div>
        <div className="card-heading mb-20">{t('configure_horizon_return', 'Configure Horizon & Return Rate')}</div>

        <div className="section-label" style={{marginBottom:10}}>{t('time_horizon', 'Time Horizon')}</div>
        <div className="sim-yr-grid mb-24">
          {YEARS.map(y=>(
            <button key={y} className={`sim-yr-btn ${simYears===y?'active':''}`}
              onClick={()=>setSimYears(y)}>
              <span className="sim-yr-num">{y}</span>
              <span className="sim-yr-label">{y===1?t('year', 'Year'):t('years', 'Years')}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',gap:20,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="section-label" style={{marginBottom:0}}>{t('expected_annual_return', 'Expected Annual Return')}</div>
              <span style={{fontSize:'.76rem',color:T.textFaint,fontWeight:600}}>
                {t('blended_index', 'Blended Index')}:&nbsp;
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
              <div className="toggle-label">{t('inflation_adjust', 'Inflation Adjust')}</div>
              <div className="toggle-sub">{inflAdj ? t('real_returns_sub', 'Real returns (−6% p.a.)') : t('nominal_returns', 'Nominal returns')}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Result cards */}
      <div className="sim-results mb-20">
        <div className="sim-result-card primary">
          <div className="sim-result-label">🏦 {stage === 'Single' ? t('final_solo_corpus', 'Final Solo Corpus') : t('final_shared_corpus', 'Final Shared Corpus')}</div>
          <div className="sim-result-value" style={{color:T.goldMid}}>{cmpct(result.fv)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">💰 {t('total_contributed', 'Total Contributed')}</div>
          <div className="sim-result-value">{cmpct(invested)}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">✨ {t('net_wealth_gains', 'Net Wealth Gains')}</div>
          <div className="sim-result-value" style={{color:T.sage}}>{cmpct(Math.max(0,gains))}</div>
        </div>
        <div className="sim-result-card">
          <div className="sim-result-label">📈 {t('wealth_multiplier', 'Wealth Multiplier')}</div>
          <div className="sim-result-value" style={{color:T.goldMid}}>{multi}×</div>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-20">
        <div className="card-title">{t('growth_trajectory', 'Growth Trajectory')}</div>
        <div className="card-heading mb-4">{stage === 'Single' ? t('solo_compounding_curve', 'Solo Wealth Compounding Curve') : t('shared_compounding_curve', 'Shared Wealth Compounding Curve')}</div>
        <p className="card-sub">
          {t('sip_compounding_desc', 'Monthly SIP of {amount} at {pct}% p.a. over {years} years.').replace('{amount}', cmpct(snap.budget.investments)).replace('{pct}', ret.toFixed(1)).replace('{years}', simYears)}
          {inflAdj && t('inflation_adjusted_note', ' Inflation-adjusted (real returns).')}
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
                tick={{fontSize:11,fill:'var(--text-faint)',fontWeight:600}} dy={7}/>
              <YAxis hide domain={['auto','auto']}/>
              <Tooltip contentStyle={TT}
                formatter={(v,name)=>[cmpct(v),t(name.toLowerCase().replace(' ', '_'), name)]}
                labelStyle={{fontWeight:700,color:'var(--text)',marginBottom:6}}/>
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
            <div className="legend-dot" style={{background:T.goldMid}}/>{t('wealth_corpus_compounded', 'Wealth Corpus (Compounded)')}
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{background:T.sky}}/>{t('total_amount_invested', 'Total Amount Invested')}
          </div>
        </div>
      </Card>

      {/* Projection table */}
      <Card>
        <div className="card-title">{t('projection_table', 'Projection Table')}</div>
        <div className="card-heading mb-16">{t('wealth_at_milestones', 'Wealth at Key Milestones')}</div>
        <div className="table-scroll">
          <table className="wealth-table">
            <thead>
              <tr>
                <th>{t('period', 'Period')}</th>
                <th>{t('invested', 'Invested')}</th>
                <th>{t('net_gains', 'Net Gains')}</th>
                <th>{t('wealth_corpus', 'Wealth Corpus')}</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map(y=>{
                const r   = simulateGrowth(snap.budget.investments,y,ret,inflAdj);
                const inv = snap.budget.investments * y * 12;
                const g   = Math.max(0,r.fv-inv);
                return (
                  <tr key={y}>
                    <td>{y} {y===1?t('year', 'Year'):t('years', 'Years')}</td>
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
          <div className="card-title">{t('joint_compounding', 'Joint Compounding')}</div>
          <div className="card-heading">🔒 {t('joint_simulations', 'Joint Wealth Simulations')}</div>
          <div className="card-sub">{t('joint_simulations_desc', 'Simulate combined dual-income compound trajectories over multiple risk parameters.')}</div>
          
          <div style={{ height: '140px', background: 'var(--bg-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
            {t('interactive_trajectory_vis', 'Interactive joint trajectory curve visualization')}
          </div>

          <div className="glass-lock-screen">
            <div className="lock-screen-inner">
              <div className="lock-icon-glow" style={{ color: stage === 'Married' ? T.gold : T.rose, background: stage === 'Married' ? 'var(--gold-pale)' : 'var(--rose-lt)' }}>
                <Lock size={20} />
              </div>
              <h4 className="lock-title">🔒 {t('joint_simulations', 'Joint Wealth Simulations')}</h4>
              <p className="lock-desc">{t('invite_partner_sim_desc', 'Invite your partner to sync combined projection parameters and plan together.')}</p>
              <button 
                className="btn-primary" 
                style={{ background: stage === 'Married' ? T.gold : T.rose, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }} 
                onClick={() => alert(t('sync_income_alert', "To sync, go to the Dashboard and use the Partner Connection widget!"))}
              >
                {t('connect_partner', 'Connect Partner')}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}