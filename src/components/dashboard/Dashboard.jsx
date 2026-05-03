import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useMilestoneStore } from '../../store/useMilestoneStore';
import { calculateFinancialSnapshot, calculateHealthScore, formatCurrency, formatCompact, formatDate } from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';

const TT = {
  borderRadius:'14px',border:'none',
  boxShadow:'0 8px 32px rgba(0,0,0,.10)',
  fontFamily:T.fontBody,fontSize:'13px',padding:'12px 16px',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return ['Good Night',    '🌙'];
  if (h < 12) return ['Good Morning',  '☀️'];
  if (h < 17) return ['Good Afternoon','✨'];
  if (h < 21) return ['Good Evening',  '🌇'];
  return ['Good Night','🌙'];
}

export function Dashboard() {
  const state    = useFinanceStore();
  const milestones = useMilestoneStore(s => s.milestones);
  const totalContribution = useMemo(() => 
    milestones.reduce((sum, m) => sum + (Number(m.monthlyContribution) || 0), 0), 
    [milestones]
  );
  const total    = state.getTotalSalary();
  const snap     = useMemo(() => calculateFinancialSnapshot(total, state.mode, totalContribution), 
    [total, state.mode, totalContribution]);
  const health   = useMemo(() => calculateHealthScore(snap), [snap]);
  const fmt      = a => formatCurrency(a, state.currency);
  const cmpct    = a => formatCompact(a, state.currency);
  const [greet, emoji] = greeting();
  const scoreColor = health.value >= 75 ? T.sage : health.value >= 50 ? T.goldMid : T.rose;
  const deg = (health.value / 100) * 360;

  const budgetData = [
    { name:'Essentials',  value:snap.budget.needs,        color:T.sky    },
    { name:'Emergency',   value:snap.budget.emergency,    color:T.rose   },
    { name:'Investments', value:snap.budget.investments,  color:T.goldMid},
  ];
  const assetData = [
    { name:'Equity',      value:snap.investmentSplit.equity,       color:T.goldMid },
    { name:'Debt',        value:snap.investmentSplit.debt,         color:T.sky     },
    { name:'Commodities', value:snap.investmentSplit.commodities,  color:T.sage    },
    { name:'Crypto',      value:snap.investmentSplit.crypto,       color:T.violet  },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">{greet}</div>
        <h1 className="page-title">{state.partner1} &amp; {state.partner2} {emoji}</h1>
        <p className="page-desc">
          Your wealth engine is calibrated for {state.region} · <strong>{state.mode}</strong> mode.
        </p>
      </div>

      <div className="stats-grid mb-24">
        <StatCard cls="gold" icon="💰" label="Combined Income"     value={cmpct(total)}                                 sub="Shared monthly salary" />
        <StatCard cls="sage" icon="📈" label="Monthly Investment"  value={cmpct(snap.budget.investments)}               sub={`${Math.round(snap.presets.invest*100)}% savings rate`} />
        <StatCard cls="rose" icon="🛡️" label="Emergency Reserve"  value={cmpct(snap.budget.emergency)}                 sub="Monthly safety fund" />
        <StatCard cls="sky"  icon="⚡" label="Financial Score"     value={`${health.value}/100`}                        sub={health.label} />
      </div>

      <div className="grid-2 mb-20">
        <Card>
          <div className="card-title">Budget Allocation</div>
          <div className="card-heading">Income Distribution</div>
          <div className="card-sub">Real-time split of combined income — mirrors Excel Sheet</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} innerRadius="55%" outerRadius="78%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {budgetData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={.82}/>)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={v=>[fmt(v),'']}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {budgetData.map(d=>(
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{background:d.color}}/>{d.name}
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
              <BarChart data={assetData} layout="vertical" margin={{top:0,right:0,left:0,bottom:0}}>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false}
                  tick={{fontSize:12,fill:T.textMuted,fontWeight:500}}/>
                <Tooltip contentStyle={TT} cursor={{fill:'transparent'}} formatter={v=>[cmpct(v),'']}/>
                <Bar dataKey="value" radius={[0,6,6,0]}>
                  {assetData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={.85}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card gold>
          <div className="card-title">Shared Readiness Score</div>
          <div className="card-heading">Financial Health</div>
          <div className="health-ring-wrap">
            <div className="health-ring"
              style={{background:`conic-gradient(${scoreColor} ${deg}deg, var(--bg-muted) ${deg}deg)`}}>
              <div className="health-ring-inner">
                <div className="health-score-num" style={{color:scoreColor}}>{health.value}</div>
                <div className="health-score-unit">/ 100</div>
              </div>
            </div>
            <div className="health-label">{health.label}</div>
            <div className="health-tip">{health.tips[0]}</div>
          </div>
        </Card>

        <Card>
          <div className="card-title">Monthly Snapshot</div>
          <div className="card-heading">Complete Flow</div>
          <div className="card-sub">Exact values — matches Excel "Clean View" column</div>
          {[
            {dot:T.sky,    label:'Essentials / Needs',    val:fmt(snap.budget.needs)},
            {dot:T.rose,   label:'Emergency / Safety',    val:fmt(snap.budget.emergency)},
            {dot:T.goldMid,label:'Investments (Total)',   val:fmt(snap.budget.investments)},
          ].map(r=>(
            <div key={r.label} className="alloc-row">
              <div className="alloc-name"><div className="alloc-dot" style={{background:r.dot}}/>{r.label}</div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
          <div className="divider"/>
          <div className="section-label">Portfolio Composition</div>
          {[
            {dot:T.goldMid,label:`Equity · ${Math.round(snap.presets.equity*100)}%`,       val:fmt(snap.investmentSplit.equity)},
            {dot:T.sky,    label:`Debt · ${Math.round(snap.presets.debt*100)}%`,           val:fmt(snap.investmentSplit.debt)},
            {dot:T.sage,   label:`Commodities · ${Math.round(snap.presets.commodities*100)}%`,val:fmt(snap.investmentSplit.commodities)},
            {dot:T.violet, label:`Crypto · ${Math.round(snap.presets.crypto*100)}%`,       val:fmt(snap.investmentSplit.crypto)},
          ].map(r=>(
            <div key={r.label} className="alloc-row">
              <div className="alloc-name"><div className="alloc-dot" style={{background:r.dot}}/>{r.label}</div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
          <div className="divider"/>
          <div className="section-label">Goal Funding (Monthly)</div>
          {[
            {icon:'🎓',label:'Child Education',  val:fmt(snap.goalSplit.child)},
            {icon:'🌅',label:'Retirement',        val:fmt(snap.goalSplit.retirement)},
            {icon:'🏡',label:'Home Purchase',     val:fmt(snap.goalSplit.house)},
            {icon:'✈️',label:'Vacation / Travel', val:fmt(snap.goalSplit.vacation)},
          ].map(r=>(
            <div key={r.label} className="alloc-row">
              <div className="alloc-name">{r.icon} {r.label}</div>
              <div className="alloc-amount">{r.val}</div>
            </div>
          ))}
        </Card>

        <Card>
          <div className="card-title">Future Assets</div>
          <div className="card-heading">Active Milestones</div>
          <div className="card-sub">Next life events and monthly savings</div>
          {milestones.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: '.85rem' }}>
              No active milestones. Start planning in the Milestone Planner.
            </div>
          ) : (
            milestones.slice(0, 4).map(m => (
              <div key={m.id} className="alloc-row">
                <div className="alloc-name">
                  <span style={{ fontSize: '1rem' }}>{m.category === 'Home' ? '🏡' : m.category === 'Car' ? '🚗' : m.category === 'Travel' ? '✈️' : '🎯'}</span>
                  <div>
                    <div>{m.name}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-faint)', fontWeight: 600 }}>Target: {formatDate(m.targetDate)}</div>
                  </div>
                </div>
                <div className="alloc-right">
                   <div className="alloc-amount">{fmt(Number(m.monthlyContribution))}</div>
                </div>
              </div>
            ))
          )}
          <div className="divider" />
          <div className="alloc-row" style={{ border: 'none', background: 'var(--gold-pale)', borderRadius: 10, padding: '10px 12px' }}>
            <div className="alloc-name" style={{ fontWeight: 700 }}>Total Milestone Saving</div>
            <div className="alloc-amount" style={{ color: 'var(--gold-mid)' }}>{fmt(totalContribution)}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}