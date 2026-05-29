import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, calculateHealthScore, formatCurrency, formatCompact } from '../../utils/finance';
import { totalMilestoneContribution, requiredMonthlySaving, parseMilestoneDate } from '../../utils/milestones';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';
import { RelationshipPortal } from '../welcome/RelationshipPortal';
import { ShieldAlert, Heart, Users, Coins, Sparkles, Flame, UserCheck, Crown } from 'lucide-react';
import { Logo } from '../common/Logo';

const TT = {
  borderRadius:'14px',border:'none',
  boxShadow:'0 8px 32px rgba(0,0,0,.10)',
  fontFamily:T.fontBody,fontSize:'13px',padding:'12px 16px',
};

function greeting(stage, name, partner2) {
  const h = new Date().getHours();
  let text = 'Good Morning';
  let emoji = '☀️';
  
  if (h < 5)  { text = 'Good Night'; emoji = '🌙'; }
  else if (h < 12) { text = 'Good Morning'; emoji = '☀️'; }
  else if (h < 17) { text = 'Good Afternoon'; emoji = '✨'; }
  else if (h < 21) { text = 'Good Evening'; emoji = '🌇'; }
  else { text = 'Good Night'; emoji = '🌙'; }

  if (stage === 'Single') {
    return [`${text}, ${name || 'Ambition Builder'}`, emoji];
  } else if (stage === 'Committed') {
    return [`${text}, ${name} & ${partner2 || 'Partner'}`, `💑`];
  } else {
    return [`${text}, The Dynasty`, `👑`];
  }
}

export function Dashboard() {
  const { partner1, partner2, stage, region, mode, currency, milestones, getTotalSalary } = useFinanceStore();
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  
  const totalSalary = getTotalSalary();
  const mContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  
  const snap = useMemo(() => calculateFinancialSnapshot(totalSalary, mode), [totalSalary, mode]);
  const health = useMemo(() => calculateHealthScore(snap), [snap]);
  
  const fmt   = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  const [greet, emoji] = greeting(stage, partner1, partner2);
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo size={20} showText={false} />
            {stage === 'Single' ? (
              <span className="stage-badge single">Single Stage</span>
            ) : stage === 'Committed' ? (
              <span className="stage-badge committed">Committed Stage</span>
            ) : (
              <span className="stage-badge married">Married Dynasty</span>
            )}
            <span>· {greet}</span>
          </div>
          <h1 className="page-title">
            {stage === 'Single' ? `${partner1 || 'Solo Builder'} ${emoji}` : `${partner1} & ${partner2} ${emoji}`}
          </h1>
          <p className="page-desc">
            Your wealth engine is calibrated for {region} · <strong>{mode}</strong> mode.
          </p>
        </div>
        
        {stage === 'Single' && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', background: `linear-gradient(135deg, ${T.rose} 0%, #a33b52 100%)`, boxShadow: `0 6px 20px ${T.rose}30`, display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsPortalOpen(true)}
          >
            <Heart size={16} /> Connect Partner Engine
          </button>
        )}
      </div>

      {/* SINGLE DUAL-ENGINE PROMPT BLOCK */}
      {stage === 'Single' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(74, 140, 196, 0.08) 0%, rgba(124, 107, 190, 0.08) 100%)',
          border: '1px solid rgba(74, 140, 196, 0.2)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--sh-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '480px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(74, 140, 196, 0.15)', color: T.sky }}>
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Sync Dual-Income Wealth Engines</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Add your partner to unlock joint planning, couple asset optimization splits, custom anniversary countdown trackers, and double your primary in-hand ledger power!
              </p>
            </div>
          </div>
          <button 
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', background: T.sky, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.85rem' }}
            onClick={() => setIsPortalOpen(true)}
          >
            Link Partner Ledger
          </button>
        </div>
      )}

      {/* STATS MATRIX */}
      <div className="stats-grid mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard cls="gold" icon="💰" label={stage === 'Single' ? "Solo Monthly Income" : "Combined Monthly Income"} value={cmpct(totalSalary)} sub={stage === 'Single' ? "Independent earnings" : "Shared dual-incomes"} />
        <StatCard cls="sage" icon="📈" label="Monthly Investment"  value={cmpct(snap.budget.investments)}               sub={`${Math.round(snap.presets.invest*100)}% savings rate`} />
        <StatCard cls="rose" icon="🛡️" label="Emergency Reserve"  value={cmpct(snap.budget.emergency)}                 sub="Monthly safety fund" />
        <StatCard cls="sky"  icon="⚡" label="Financial Score"     value={`${health.value}/100`}                        sub={health.label} />
        <StatCard cls="gold" icon="🏁" label="Milestone Saving"    value={fmt(mContribution)}                           sub="Active goal monthly total" />
      </div>

      <div className="grid-2 mb-20">
        <Card>
          <div className="card-title">Budget Allocation</div>
          <div className="card-heading">Income Distribution</div>
          <div className="card-sub">{stage === 'Single' ? "Solo budget splits calibrated live" : "Real-time split of combined family income"}</div>
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
          <div className="card-title">{stage === 'Single' ? "Solo Readiness Score" : "Shared Readiness Score"}</div>
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

        <Card style={{ position: 'relative' }}>
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
          
          {/* Locks for Single / Committed stage previews on dynamic snapshot card */}
          {stage === 'Single' && (
            <div className="glass-lock-screen" style={{ borderRadius: 'var(--r-lg)' }}>
              <div className="lock-screen-inner">
                <div className="lock-icon-glow">
                  <Heart size={20} className="animate-pulse" style={{ color: T.rose }} />
                </div>
                <h4 className="lock-title">Collaborative Analysis</h4>
                <p className="lock-desc">Sync with a partner to unlock comprehensive combined snapshots, dual SIP structures, and dynastic goals.</p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.sky, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={() => setIsPortalOpen(true)}
                >
                  Sync Partner Ledger
                </button>
              </div>
            </div>
          )}
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
            [...milestones]
              .sort((a,b) => parseMilestoneDate(a.targetDate) - parseMilestoneDate(b.targetDate))
              .slice(0, 4)
              .map(m => {
                const req = requiredMonthlySaving(m.targetCost, m.monthlySaved, m.targetDate);
                const icons = { car: '🚗', house: '🏠', travel: '✈️', gadget: '💻', furniture: '🛋️', wedding: '💍', education: '🎓', other: '🏁' };
                return (
                  <div key={m.id} className="alloc-row">
                    <div className="alloc-name">
                      <span style={{ fontSize: '1rem' }}>{icons[m.category] || '🏁'}</span>
                      <div>
                        <div>{m.name}</div>
                        <div style={{ fontSize: '.65rem', color: 'var(--text-faint)', fontWeight: 600 }}>Target: {m.targetDate}</div>
                      </div>
                    </div>
                    <div className="alloc-right">
                       <div className="alloc-amount">{fmt(req)}</div>
                    </div>
                  </div>
                );
              })
          )}
          <div className="divider" />
          <div className="alloc-row" style={{ border: 'none', background: 'var(--gold-pale)', borderRadius: 10, padding: '10px 12px' }}>
            <div className="alloc-name" style={{ fontWeight: 700 }}>Total Milestone Saving</div>
            <div className="alloc-amount" style={{ color: 'var(--gold-mid)' }}>{fmt(mContribution)}</div>
          </div>
        </Card>
      </div>

      <RelationshipPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
    </div>
  );
}