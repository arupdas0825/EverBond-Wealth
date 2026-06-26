import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency, formatCompact } from '../../utils/finance';
import { totalMilestoneContribution } from '../../utils/milestones';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useTranslation } from '../../utils/i18n';

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
  const { t } = useTranslation();
  
  const total = getTotalSalary();
  const totalContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  
  const snap  = useMemo(()=>calculateFinancialSnapshot(total,mode),[total,mode]);
  const fmt   = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  const pct   = n => (n*100).toFixed(1)+'%';

  // Full donut data — mirrors Excel "Clean View" column exactly
  const donutData = [
    { name: t('large_cap', 'Large Cap'),       value:snap.equityBreakdown.largeCap,    color:'rgba(184,144,42,.92)' },
    { name: t('mid_cap', 'Mid Cap'),         value:snap.equityBreakdown.midCap,      color:'rgba(184,144,42,.60)' },
    { name: t('small_cap', 'Small Cap'),       value:snap.equityBreakdown.smallCap,    color:'rgba(184,144,42,.32)' },
    { name: t('liquid_debt', 'Liquid Debt'),   value:snap.debtBreakdown.liquid,        color:'rgba(58,126,196,.90)' },
    { name: t('short_tmf', 'Short/TMF'),       value:snap.debtBreakdown.shortTMF,      color:'rgba(58,126,196,.58)' },
    { name: t('target_mat', 'Target Mat.'),    value:snap.debtBreakdown.targetMat,     color:'rgba(58,126,196,.32)' },
    { name: t('gold', 'Gold'),                 value:snap.commoditiesBreakdown.gold,   color:'rgba(62,142,104,.92)' },
    { name: t('silver', 'Silver'),             value:snap.commoditiesBreakdown.silver, color:'rgba(62,142,104,.52)' },
    { name: t('crypto', 'Crypto'),             value:snap.investmentSplit.crypto,      color:'rgba(112,89,180,.85)' },
  ];

  const goalData = [
    { name: '🎓 ' + t('child', 'Child'),           value:snap.goalSplit.child,      color:T.goldMid },
    { name: '🌅 ' + t('retirement', 'Retirement'), value:snap.goalSplit.retirement, color:T.sage    },
    { name: '🏡 ' + t('home', 'Home'),             value:snap.goalSplit.house,      color:T.sky     },
    { name: '✈️ ' + t('vacation', 'Vacation'),     value:snap.goalSplit.vacation,   color:T.rose    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div>
          <div className="page-eyebrow">{t('portfolio_engine', 'Portfolio Engine')}</div>
          <h1 className="page-title">{t('allocation', 'Asset Allocation')}</h1>
          <p className="page-desc">
            {t('allocation_desc', 'Granular asset-class distribution — every number sourced directly from the Excel brain.')}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-20">
        <Card gold>
          <div className="card-title">{t('portfolio_breakdown', 'Full Portfolio Breakdown')}</div>
          <div className="card-heading">{t('all_asset_classes', 'All Asset Classes')}</div>
          <div className="card-sub">{t('portfolio_breakdown_sub', 'Complete drill-down of investment corpus')}</div>
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
          <div className="card-title">{t('goal_funding_engine', 'Goal Funding Engine')}</div>
          <div className="card-heading">{t('goal_split_title', 'Monthly Life Goal Split')}</div>
          <div className="card-sub">{t('goal_split_desc', 'Excel-accurate goal allocation fractions')}</div>
          <div className="chart-wrap" style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} layout="vertical" margin={{top:0,right:8,left:0,bottom:0}}>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false}
                  tick={{fontSize:12,fill:'var(--text-muted)',fontWeight:500}}/>
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
        <div className="card-title">{t('budget_split_title', 'Section 1 — Budget Split')}</div>
        <div className="card-heading mb-4">{t('budget_split_heading', 'Combined Salary Distribution')}</div>
        <p className="card-sub">{t('excel_sec1', 'Mirrors Excel Dashboard: Section 1 — "Active Percentages"')}</p>
        <AllocSection label={t('of_monthly_salary', 'Of Monthly Salary')} rows={[
          {dot:T.sky,    label: t('essentials_needs', 'Essentials / Needs'),           pct:pct(snap.presets.needs),     val:fmt(snap.budget.needs)},
          {dot:T.rose,   label: t('emergency_safety_reserve', 'Emergency / Safety Reserve'),   pct:pct(snap.presets.emergency), val:fmt(snap.budget.emergency)},
          {dot:T.goldMid,label: t('investments_core_pool', 'Investments (Core Pool)'),      pct:pct(snap.presets.invest),    val:fmt(snap.budget.investments)},
          {emoji:'📅',  label: t('milestone_earmark', 'Milestone Earmark (Target)'),    pct:((totalContribution / total) * 100).toFixed(1)+'%', val:fmt(totalContribution)},
        ]}/>
      </Card>

      {/* Investment Split */}
      <Card className="mb-16">
        <div className="card-title">{t('investment_split_title', 'Section 2 — Investment Split')}</div>
        <div className="card-heading mb-4">{t('investment_split_heading', 'Asset Class Weighting')}</div>
        <p className="card-sub">{t('excel_sec2', 'Mirrors Excel: "Investment Split (of Investments)"')}</p>
        <AllocSection label={t('of_investment_corpus', 'Of Investment Corpus')} rows={[
          {dot:T.goldMid,label: t('equity', 'Equity'),                       pct:pct(snap.presets.equity),       val:fmt(snap.investmentSplit.equity)},
          {dot:T.sky,    label: t('debt', 'Debt'),                         pct:pct(snap.presets.debt),         val:fmt(snap.investmentSplit.debt)},
          {dot:T.sage,   label: t('commodities', 'Commodities (Gold + Silver)'),  pct:pct(snap.presets.commodities),  val:fmt(snap.investmentSplit.commodities)},
          {dot:T.violet, label: t('crypto_optional', 'Crypto (Optional)'),            pct:pct(snap.presets.crypto),       val:fmt(snap.investmentSplit.crypto)},
        ]}/>
      </Card>

      {/* Detailed breakdowns */}
      <div className="grid-2 mb-16">
        <Card>
          <div className="card-title">{t('equity_engine_title', 'Section 3 — Equity Engine')}</div>
          <div className="card-heading mb-4">{t('equity_engine_heading', 'Cap-Size Breakdown')}</div>
          <p className="card-sub">{t('excel_sec3', 'Mirrors Excel: "Equity Breakdown (of Equity)"')}</p>
          <AllocSection label={t('of_equity_allocation', 'Of Equity Allocation')} rows={[
            {dot:'rgba(184,144,42,.92)',label: t('large_cap', 'Large Cap'),  pct:pct(snap.presets.equityLarge), val:fmt(snap.equityBreakdown.largeCap)},
            {dot:'rgba(184,144,42,.60)',label: t('mid_cap', 'Mid Cap'),    pct:pct(snap.presets.equityMid),   val:fmt(snap.equityBreakdown.midCap)},
            {dot:'rgba(184,144,42,.32)',label: t('small_cap', 'Small Cap'),  pct:pct(snap.presets.equitySmall), val:fmt(snap.equityBreakdown.smallCap)},
          ]}/>
        </Card>
        <Card>
          <div className="card-title">{t('debt_engine_title', 'Section 4 — Debt Engine')}</div>
          <div className="card-heading mb-4">{t('debt_engine_heading', 'Duration & Liquidity Split')}</div>
          <p className="card-sub">{t('excel_sec4', 'Mirrors Excel: "Debt Breakdown (of Debt)"')}</p>
          <AllocSection label={t('of_debt_allocation', 'Of Debt Allocation')} rows={[
            {dot:'rgba(58,126,196,.90)',label: t('liquid_overnight', 'Liquid / Overnight'),    pct:pct(snap.presets.debtLiquid),    val:fmt(snap.debtBreakdown.liquid)},
            {dot:'rgba(58,126,196,.58)',label: t('short_duration_tmf', 'Short Duration / TMF'),  pct:pct(snap.presets.debtShortTMF),  val:fmt(snap.debtBreakdown.shortTMF)},
            {dot:'rgba(58,126,196,.32)',label: t('target_maturity', 'Target Maturity'),       pct:pct(snap.presets.debtTargetMat), val:fmt(snap.debtBreakdown.targetMat)},
          ]}/>
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-title">{t('commodities_engine_title', 'Section 5 — Commodities Engine')}</div>
          <div className="card-heading mb-4">{t('commodities_engine_heading', 'Precious Metals Split')}</div>
          <p className="card-sub">{t('excel_sec5', 'Mirrors Excel: "Commodities Breakdown"')}</p>
          <AllocSection label={t('of_commodities_allocation', 'Of Commodities Allocation')} rows={[
            {dot:'rgba(62,142,104,.92)',label: t('gold_sgb_etf', 'Gold (SGB / ETF)'), pct:pct(snap.presets.goldPct),   val:fmt(snap.commoditiesBreakdown.gold)},
            {dot:'rgba(62,142,104,.52)',label: t('silver_etf', 'Silver (ETF)'),     pct:pct(snap.presets.silverPct), val:fmt(snap.commoditiesBreakdown.silver)},
          ]}/>
        </Card>
        <Card>
          <div className="card-title">{t('goal_funding_engine_title', 'Section 6 — Goal Funding Engine')}</div>
          <div className="card-heading mb-4">{t('goal_funding_heading', 'Monthly Goal Contributions')}</div>
          <p className="card-sub">{t('excel_sec6', 'Mirrors Excel: "Goal Split (of Investments)"')}</p>
          <AllocSection label={t('of_investment_corpus', 'Of Investment Corpus')} rows={[
            {emoji:'🎓',label: t('child_education', 'Child Education'), pct:pct(snap.presets.goalChild),    val:fmt(snap.goalSplit.child)},
            {emoji:'🌅',label: t('retirement', 'Retirement'),      pct:pct(snap.presets.goalRetire),   val:fmt(snap.goalSplit.retirement)},
            {emoji:'🏡',label: t('home_purchase', 'Home Purchase'),   pct:pct(snap.presets.goalHouse),    val:fmt(snap.goalSplit.house)},
            {emoji:'✈️',label: t('vacation', 'Vacation'),         pct:pct(snap.presets.goalVacation), val:fmt(snap.goalSplit.vacation)},
          ]}/>
        </Card>
      </div>
    </div>
  );
}