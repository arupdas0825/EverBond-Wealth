import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency, formatCompact } from '../../utils/finance';
import { totalMilestoneContribution } from '../../utils/milestones';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

const TT = {
  borderRadius:'14px',border:'none',
  boxShadow:'0 8px 32px rgba(0,0,0,.10)',
  fontFamily:T.fontBody,fontSize:'13px',padding:'12px 16px',
};

function AllocSection({ label, rows }) {
  return (
    <div style={{marginBottom:0}}>
      <div className="section-label">{label}</div>
      {rows.map(r=>(
        <div key={r.label} className="alloc-row">
          <div className="alloc-name">
            {r.dot && <div className="alloc-dot" style={{background:r.dot}}/>}
            {r.emoji && <span style={{fontSize:'1rem',marginRight:2}}>{r.emoji}</span>}
            {r.label}
          </div>
          <div className="alloc-right">
            <span className="alloc-pct">{r.pct}</span>
            <span className="alloc-amount">{r.val}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AllocationPage() {
  const { mode, currency, milestones, getTotalSalary } = useFinanceStore();
  
  const total = getTotalSalary();
  const totalContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  
  const snap  = useMemo(()=>calculateFinancialSnapshot(total,mode),[total,mode]);
  const fmt   = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  const pct   = n => (n*100).toFixed(1)+'%';

  // Full donut data — mirrors Excel "Clean View" column exactly
  const donutData = [
    { name:'Large Cap',    value:snap.equityBreakdown.largeCap,    color:'rgba(184,144,42,.92)' },
    { name:'Mid Cap',      value:snap.equityBreakdown.midCap,      color:'rgba(184,144,42,.60)' },
    { name:'Small Cap',    value:snap.equityBreakdown.smallCap,    color:'rgba(184,144,42,.32)' },
    { name:'Liquid Debt',  value:snap.debtBreakdown.liquid,        color:'rgba(58,126,196,.90)' },
    { name:'Short/TMF',    value:snap.debtBreakdown.shortTMF,      color:'rgba(58,126,196,.58)' },
    { name:'Target Mat.',  value:snap.debtBreakdown.targetMat,     color:'rgba(58,126,196,.32)' },
    { name:'Gold',         value:snap.commoditiesBreakdown.gold,   color:'rgba(62,142,104,.92)' },
    { name:'Silver',       value:snap.commoditiesBreakdown.silver, color:'rgba(62,142,104,.52)' },
    { name:'Crypto',       value:snap.investmentSplit.crypto,      color:'rgba(112,89,180,.85)' },
  ];

  const goalData = [
    { name:'🎓 Child',      value:snap.goalSplit.child,      color:T.goldMid },
    { name:'🌅 Retirement', value:snap.goalSplit.retirement, color:T.sage    },
    { name:'🏡 Home',       value:snap.goalSplit.house,      color:T.sky     },
    { name:'✈️ Vacation',   value:snap.goalSplit.vacation,   color:T.rose    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:24}}>
        <div>
          <div className="page-eyebrow">Portfolio Engine</div>
          <h1 className="page-title">Investment <em>Allocation</em></h1>
          <p className="page-desc">
            Granular asset-class distribution — every number sourced directly from the Excel brain.
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-20">
        <Card gold>
          <div className="card-title">Full Portfolio Breakdown</div>
          <div className="card-heading">All Asset Classes</div>
          <div className="card-sub">Complete drill-down of investment corpus</div>
          <div className="chart-wrap" style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius="46%" outerRadius="70%"
                  paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {donutData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={v=>[fmt(v),'']}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {donutData.map(d=>(
              <div key={d.name} className="legend-item">
                <div className="legend-dot" style={{background:d.color}}/>{d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Goal Funding Engine</div>
          <div className="card-heading">Monthly Life Goal Split</div>
          <div className="card-sub">Excel-accurate goal allocation fractions</div>
          <div className="chart-wrap" style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} layout="vertical" margin={{top:0,right:8,left:0,bottom:0}}>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false}
                  tick={{fontSize:12,fill:T.textMuted,fontWeight:500}}/>
                <Tooltip contentStyle={TT} cursor={{fill:'transparent'}} formatter={v=>[fmt(v),'']}/>
                <Bar dataKey="value" radius={[0,6,6,0]}>
                  {goalData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={.85}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Budget Split */}
      <Card className="mb-16">
        <div className="card-title">Section 1 — Budget Split</div>
        <div className="card-heading mb-4">Combined Salary Distribution</div>
        <p className="card-sub">Mirrors Excel Dashboard: Section 1 — "Active Percentages"</p>
        <AllocSection label="Of Monthly Salary" rows={[
          {dot:T.sky,    label:'Essentials / Needs',           pct:pct(snap.presets.needs),     val:fmt(snap.budget.needs)},
          {dot:T.rose,   label:'Emergency / Safety Reserve',   pct:pct(snap.presets.emergency), val:fmt(snap.budget.emergency)},
          {dot:T.goldMid,label:'Investments (Core Pool)',      pct:pct(snap.presets.invest),    val:fmt(snap.budget.investments)},
          {emoji:'📅',  label:'Milestone Earmark (Target)',    pct:((totalContribution / total) * 100).toFixed(1)+'%', val:fmt(totalContribution)},
        ]}/>
      </Card>

      {/* Investment Split */}
      <Card className="mb-16">
        <div className="card-title">Section 2 — Investment Split</div>
        <div className="card-heading mb-4">Asset Class Weighting</div>
        <p className="card-sub">Mirrors Excel: "Investment Split (of Investments)"</p>
        <AllocSection label="Of Investment Corpus" rows={[
          {dot:T.goldMid,label:'Equity',                       pct:pct(snap.presets.equity),       val:fmt(snap.investmentSplit.equity)},
          {dot:T.sky,    label:'Debt',                         pct:pct(snap.presets.debt),         val:fmt(snap.investmentSplit.debt)},
          {dot:T.sage,   label:'Commodities (Gold + Silver)',  pct:pct(snap.presets.commodities),  val:fmt(snap.investmentSplit.commodities)},
          {dot:T.violet, label:'Crypto (Optional)',            pct:pct(snap.presets.crypto),       val:fmt(snap.investmentSplit.crypto)},
        ]}/>
      </Card>

      {/* Detailed breakdowns */}
      <div className="grid-2 mb-16">
        <Card>
          <div className="card-title">Section 3 — Equity Engine</div>
          <div className="card-heading mb-4">Cap-Size Breakdown</div>
          <p className="card-sub">Mirrors Excel: "Equity Breakdown (of Equity)"</p>
          <AllocSection label="Of Equity Allocation" rows={[
            {dot:'rgba(184,144,42,.92)',label:'Large Cap',  pct:pct(snap.presets.equityLarge), val:fmt(snap.equityBreakdown.largeCap)},
            {dot:'rgba(184,144,42,.60)',label:'Mid Cap',    pct:pct(snap.presets.equityMid),   val:fmt(snap.equityBreakdown.midCap)},
            {dot:'rgba(184,144,42,.32)',label:'Small Cap',  pct:pct(snap.presets.equitySmall), val:fmt(snap.equityBreakdown.smallCap)},
          ]}/>
        </Card>
        <Card>
          <div className="card-title">Section 4 — Debt Engine</div>
          <div className="card-heading mb-4">Duration &amp; Liquidity Split</div>
          <p className="card-sub">Mirrors Excel: "Debt Breakdown (of Debt)"</p>
          <AllocSection label="Of Debt Allocation" rows={[
            {dot:'rgba(58,126,196,.90)',label:'Liquid / Overnight',    pct:pct(snap.presets.debtLiquid),    val:fmt(snap.debtBreakdown.liquid)},
            {dot:'rgba(58,126,196,.58)',label:'Short Duration / TMF',  pct:pct(snap.presets.debtShortTMF),  val:fmt(snap.debtBreakdown.shortTMF)},
            {dot:'rgba(58,126,196,.32)',label:'Target Maturity',       pct:pct(snap.presets.debtTargetMat), val:fmt(snap.debtBreakdown.targetMat)},
          ]}/>
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-title">Section 5 — Commodities Engine</div>
          <div className="card-heading mb-4">Precious Metals Split</div>
          <p className="card-sub">Mirrors Excel: "Commodities Breakdown"</p>
          <AllocSection label="Of Commodities Allocation" rows={[
            {dot:'rgba(62,142,104,.92)',label:'Gold (SGB / ETF)', pct:pct(snap.presets.goldPct),   val:fmt(snap.commoditiesBreakdown.gold)},
            {dot:'rgba(62,142,104,.52)',label:'Silver (ETF)',     pct:pct(snap.presets.silverPct), val:fmt(snap.commoditiesBreakdown.silver)},
          ]}/>
        </Card>
        <Card>
          <div className="card-title">Section 6 — Goal Funding Engine</div>
          <div className="card-heading mb-4">Monthly Goal Contributions</div>
          <p className="card-sub">Mirrors Excel: "Goal Split (of Investments)"</p>
          <AllocSection label="Of Investment Corpus" rows={[
            {emoji:'🎓',label:'Child Education', pct:pct(snap.presets.goalChild),    val:fmt(snap.goalSplit.child)},
            {emoji:'🌅',label:'Retirement',      pct:pct(snap.presets.goalRetire),   val:fmt(snap.goalSplit.retirement)},
            {emoji:'🏡',label:'Home Purchase',   pct:pct(snap.presets.goalHouse),    val:fmt(snap.goalSplit.house)},
            {emoji:'✈️',label:'Vacation',         pct:pct(snap.presets.goalVacation), val:fmt(snap.goalSplit.vacation)},
          ]}/>
        </Card>
      </div>
    </div>
  );
}