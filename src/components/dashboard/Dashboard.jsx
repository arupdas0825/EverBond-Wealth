import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, calculateHealthScore, 
  formatCurrency, formatCompact 
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useTranslation } from '../../utils/i18n';
import { getExchangeRate } from '../../utils/currency';
import { 
  TrendingUp, Wallet, Coins, Shield, Landmark, Sparkles, 
  Target, AlertCircle, CheckCircle2, ChevronRight, Activity, 
  FileText, Heart, Info, Plus
} from 'lucide-react';

const CHART_TOOLTIP_STYLE = {
  borderRadius: '16px',
  border: '1px solid var(--border-mid)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '10px 14px',
  background: 'var(--bg-card)',
  color: 'var(--text)',
};

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export function Dashboard({ setPage }) {
  const { 
    partner1, currency, stage, p1Salary, p2Salary, mode, milestones, timelineEvents, connectionStatus,
    exchangeRates, ratesLastUpdated
  } = useFinanceStore();

  const { t } = useTranslation();

  // Handle window resizing for responsive layouts
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  React.useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const isMobile = windowWidth < 768;

  // Formatting Helpers
  const fmt = val => formatCurrency(val, currency);
  const cmpct = val => formatCompact(val, currency);

  const totalSalary = useMemo(() => {
    if (stage === 'Single') return p1Salary || 0;
    return (p1Salary || 0) + (p2Salary || 0);
  }, [p1Salary, p2Salary, stage]);

  const hasData = p1Salary > 0;

  // Financial Snapshot
  const snap = useMemo(() => {
    return calculateFinancialSnapshot(totalSalary, mode || 'Balanced');
  }, [totalSalary, mode]);

  // Health Score
  const health = useMemo(() => {
    if (!hasData) return null;
    const rawHealth = calculateHealthScore(snap);
    if (!rawHealth) return null;
    return {
      value: rawHealth.value,
      label: t('health_label_' + rawHealth.label.toLowerCase().replace(' ', '_'), rawHealth.label),
      tips: rawHealth.tips.map((tip, index) => t(`health_tip_${rawHealth.label.toLowerCase().replace(' ', '_')}_${index}`, tip))
    };
  }, [snap, hasData, t]);

  // Savings rate
  const savingsRatePct = useMemo(() => {
    if (!hasData || totalSalary === 0) return 0;
    return Math.round((snap.budget.investments / totalSalary) * 100);
  }, [hasData, snap, totalSalary]);

  // Cashflow Data for BarChart
  const cashflowData = useMemo(() => {
    if (!hasData) return [];
    return [
      { name: t('income', 'Income'), amount: totalSalary, color: T.sky },
      { name: t('expenses', 'Expenses'), amount: snap.budget.needs, color: T.rose },
      { name: t('investments', 'Investments'), amount: snap.budget.investments, color: T.goldMid },
      { name: t('savings', 'Savings'), amount: snap.budget.emergency, color: T.sage }
    ];
  }, [hasData, totalSalary, snap, t]);

  // Asset Allocation Data
  const allocationData = useMemo(() => {
    if (!hasData) return [];
    return [
      { name: t('equity', 'Equity'), value: snap.investmentSplit.equity, color: T.sky },
      { name: t('debt', 'Debt'), value: snap.investmentSplit.debt, color: T.goldMid },
      { name: t('gold', 'Gold'), value: snap.commoditiesBreakdown.gold, color: T.gold },
      { name: t('cash', 'Cash'), value: snap.budget.emergency, color: T.sage },
      { name: t('crypto', 'Crypto'), value: snap.investmentSplit.crypto, color: T.rose },
      { name: t('other', 'Other'), value: snap.commoditiesBreakdown.silver, color: '#a5f3fc' }
    ].filter(item => item.value > 0);
  }, [hasData, snap, t]);

  const totalPortfolioValue = useMemo(() => {
    return allocationData.reduce((sum, item) => sum + item.value, 0);
  }, [allocationData]);

  // Smart Insights generator
  const insights = useMemo(() => {
    if (!hasData) return [];
    const list = [];
    
    // Savings Rate Insight
    if (savingsRatePct >= 35) {
      list.push({
        id: 'sr',
        title: t('savings_rate_improving', 'Savings rate is improving'),
        desc: t('savings_rate_healthy_desc', 'Your savings rate is healthy at {pct}%. Capital splits are highly optimized for compounding.').replace('{pct}', savingsRatePct),
        type: 'success'
      });
    } else {
      list.push({
        id: 'sr',
        title: t('savings_rate_below_target', 'Savings rate below target'),
        desc: t('savings_rate_low_desc', 'Currently at {pct}% (optimal target: 35%+). Try reducing non-essential expenses to raise investment splits.').replace('{pct}', savingsRatePct),
        type: 'warning'
      });
    }

    // Emergency Fund Insight
    const emergencyMilestone = milestones.find(m => m.name.toLowerCase().includes('emergency') || m.category === 'other');
    if (emergencyMilestone) {
      const pct = Math.round((emergencyMilestone.monthlySaved / emergencyMilestone.targetCost) * 100);
      if (pct >= 100) {
        list.push({
          id: 'ef',
          title: t('emergency_reserve_secured', 'Emergency reserve secured'),
          desc: t('emergency_secured_desc', 'Your liquid locker is fully funded. Excellent capital safety margin.'),
          type: 'success'
        });
      } else {
        list.push({
          id: 'ef',
          title: t('emergency_reserve_below_target', 'Emergency reserve below target'),
          desc: t('emergency_low_desc', 'Liquid reserve is at {pct}% of target. Recommend top-ups to secure a safe 6-month buffer.').replace('{pct}', pct),
          type: 'warning'
        });
      }
    } else {
      list.push({
        id: 'ef',
        title: t('emergency_reserve_below_target', 'Emergency reserve below target'),
        desc: t('emergency_not_set_desc', 'No dedicated emergency milestone set yet. Recommend creating a buffer locker to protect investments.'),
        type: 'info'
      });
    }

    // Crypto risk limit
    const cryptoExposure = snap.investmentSplit.crypto / snap.budget.investments;
    if (cryptoExposure > 0.05) {
      list.push({
        id: 'cr',
        title: t('high_crypto_exposure', 'High crypto exposure warning'),
        desc: t('crypto_high_desc', 'Digital assets make up {pct}% of investments. Consider keeping within 5% safe limit.').replace('{pct}', (cryptoExposure * 100).toFixed(1)),
        type: 'danger'
      });
    }

    return list;
  }, [hasData, savingsRatePct, milestones, snap, t]);

  // Filter out default placeholder timeline items if matching data isn't configured
  const actualActivities = useMemo(() => {
    return timelineEvents.filter(evt => {
      if (evt.eventId === 'ev-income' && p1Salary === 0) return false;
      if (evt.eventId === 'ev-goal' && milestones.length === 0) return false;
      if (evt.eventId === 'ev-partner-req' && connectionStatus === 'none') return false;
      return true;
    }).slice(0, 5);
  }, [timelineEvents, p1Salary, milestones, connectionStatus]);

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* SECTION 1: WELCOME HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: T.gold }}>
          {t('greeting_' + getGreeting().toLowerCase().replace(' ', '_'), getGreeting())}, {partner1 || 'User'}
        </span>
        <h1 className="page-title" style={{ marginTop: '8px', fontSize: '2.1rem', fontWeight: 800 }}>
          {t('dashboard_title', 'Financial Command Center')}
        </h1>
        <p className="page-desc" style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '600px' }}>
          {t('dashboard_desc', 'Track income, investments, savings and long-term financial goals in one focused workspace.')}
        </p>
      </div>

      {/* SECTION 2: CORE FINANCIAL SNAPSHOT */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: '16px', 
          marginBottom: '24px' 
        }}
      >
        {/* Card 1: Monthly Income */}
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {t('monthly_income', 'Monthly Income')}
            </span>
            <Wallet size={16} style={{ color: T.sky }} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--fn)' }}>
            {hasData ? fmt(totalSalary) : t('not_added', 'Not Added')}
          </div>
        </div>

        {/* Card 2: Monthly Investment */}
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {t('monthly_investment', 'Monthly Investment')}
            </span>
            <TrendingUp size={16} style={{ color: T.gold }} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--fn)' }}>
            {hasData ? fmt(snap.budget.investments) : t('not_added', 'Not Added')}
          </div>
        </div>

        {/* Card 3: Emergency Fund */}
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {t('emergency_fund', 'Emergency Fund')}
            </span>
            <Shield size={16} style={{ color: T.rose }} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--fn)' }}>
            {hasData ? fmt(snap.budget.emergency) : t('not_added', 'Not Added')}
          </div>
        </div>

        {/* Card 4: Savings Rate */}
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {t('savings_rate', 'Savings Rate')}
            </span>
            <Activity size={16} style={{ color: T.sage }} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--fn)' }}>
            {hasData ? `${savingsRatePct}%` : t('not_added', 'Not Added')}
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.4fr 1fr', 
          gap: '24px', 
          marginBottom: '24px' 
        }}
      >
        {/* LEFT COLUMN: Cashflow & Allocations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 5: MONTHLY CASHFLOW */}
          <div className="apple-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                {t('flow_of_capital', 'Flow of Capital')}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                {t('monthly_cashflow', 'Monthly Cashflow')}
              </h3>
            </div>
            
            {hasData ? (
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis tickFormatter={v => cmpct(v)} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {cashflowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📊</span>
                <strong style={{ fontSize: '0.85rem' }}>{t('no_cashflow_data', 'No Cashflow Data')}</strong>
                <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>{t('add_income_to_visualize', 'Add income to visualize cashflow splits.')}</p>
              </div>
            )}
          </div>

          {/* SECTION 6: ASSET ALLOCATION */}
          {hasData && (
            <div className="apple-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                  {t('asset_command', 'Asset command')}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                  {t('asset_allocation', 'Asset Allocation')}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: '20px', alignItems: 'center' }}>
                <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => fmt(v)} contentStyle={CHART_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Visible Under-Chart Allocation Table (No Hover Needed) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allocationData.map(item => {
                    const pct = Math.round((item.value / totalPortfolioValue) * 100);
                    return (
                      <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                          <strong style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{item.name}</strong>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {fmt(item.value)} <span style={{ color: T.gold, fontSize: '0.72rem', marginLeft: '6px' }}>{pct}%</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Health Score & Active Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 3: FINANCIAL HEALTH SCORE */}
          <div className="apple-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                {t('system_diagnostic', 'System diagnostic')}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                {t('financial_health_score', 'Financial Health Score')}
              </h3>
            </div>

            {hasData && health ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '80px', height: '80px' }}>
                    <circle cx="40" cy="40" r="34" stroke="var(--border)" strokeWidth="6" fill="transparent" />
                    <circle cx="40" cy="40" r="34" stroke={health.value >= 80 ? T.sage : health.value >= 60 ? T.gold : T.rose} strokeWidth="6" fill="transparent"
                      strokeDasharray="213.6"
                      strokeDashoffset={213.6 - (213.6 * health.value) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--fn)' }}>
                    {health.value}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: health.value >= 80 ? T.sage : health.value >= 60 ? T.gold : T.rose }}>
                    {health.label}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    {health.tips[0]}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'var(--bg-muted)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: T.rose, letterSpacing: '0.05em' }}>
                    {t('diagnostic_status', 'Diagnostic status')}
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                    {t('incomplete', 'Incomplete')}
                  </div>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {t('incomplete_diagnostic_desc', 'Complete your profile to unlock score generation. Do not generate fake score.')}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 4: ACTIVE GOALS */}
          <div className="apple-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                  {t('target_milestones', 'Target milestones')}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                  {t('active_goals', 'Active Goals')}
                </h3>
              </div>
              {milestones.length > 0 && (
                <button onClick={() => setPage('milestones')} style={{ background: 'none', border: 'none', color: T.gold, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> {t('add', 'Add')}
                </button>
              )}
            </div>

            {milestones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {milestones.slice(0, 3).map(m => {
                  const pct = Math.min(100, Math.round((m.monthlySaved / m.targetCost) * 100)) || 0;
                  return (
                    <div key={m.id} style={{ background: 'var(--bg-muted)', padding: '12px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{m.name}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: T.gold, fontFamily: 'var(--fn)' }}>{pct}%</span>
                      </div>
                      
                      {/* Progress Track */}
                      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${T.gold} 0%, ${T.goldMid} 100%)`, borderRadius: '3px' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        <span>{t('saved_label', 'Saved')}: {fmt(m.monthlySaved)}</span>
                        <span>{t('target_label', 'Target')}: {fmt(m.targetCost)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', textAlign: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{t('no_active_goals', 'No Active Goals')}</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '240px', lineHeight: 1.4, marginBottom: '16px' }}>
                  {t('create_first_goal_desc', 'Create your first financial goal to start tracking progress.')}
                </p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.gold, width: 'auto', padding: '8px 20px', borderRadius: '10px', fontSize: '0.78rem' }}
                  onClick={() => setPage('milestones')}
                >
                  {t('add_goal', 'Add Goal')}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ROW 3: SMART INSIGHTS & RECENT ACTIVITY */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.4fr 1fr', 
          gap: '24px' 
        }}
      >
        {/* SECTION 7: SMART INSIGHTS */}
        <div className="apple-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              {t('actionable_advice', 'Actionable advice')}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              {t('smart_insights', 'Smart Insights')}
            </h3>
          </div>

          {hasData && insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map(ins => (
                <div key={ins.id} style={{ display: 'flex', gap: '12px', background: 'var(--bg-muted)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <Info size={16} style={{ color: ins.type === 'success' ? T.sage : ins.type === 'danger' ? T.rose : T.gold, marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{ins.title}</strong>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                      {ins.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {t('insights_empty_desc', 'Add more financial information to unlock insights. Do not generate fake advice.')}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 8: RECENT ACTIVITY */}
        <div className="apple-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              {t('ledger_telemetry', 'Ledger telemetry')}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              {t('recent_activity', 'Recent Activity')}
            </h3>
          </div>

          {actualActivities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              {actualActivities.map((act, index) => (
                <div key={act.eventId} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  
                  {/* Vertical Timeline Thread */}
                  {index < actualActivities.length - 1 && (
                    <div style={{ position: 'absolute', left: '8px', top: '18px', bottom: '-14px', width: '1px', background: 'var(--border)' }} />
                  )}
                  
                  {/* Event indicator */}
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--border)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', zIndex: 1 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: act.type === 'financial' ? T.gold : act.type === 'relationship' ? T.rose : T.sky }} />
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{t(act.eventId + '_title', act.title)}</strong>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>{t(act.eventId + '_desc', act.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🕒</span>
              <p style={{ fontSize: '0.72rem' }}>{t('no_recent_activity', 'No recent activity recorded.')}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}