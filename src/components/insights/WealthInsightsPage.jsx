import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Calendar, Target, Heart, Award,
  Sparkles, DollarSign, Wallet, ShieldAlert, ChevronRight, Lock
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatCompact } from '../../utils/finance';
import { Card } from '../common/Card';
import { T } from '../../theme/tokens';
import { useTranslation } from '../../utils/i18n';


export function WealthInsightsPage() {
  const store = useFinanceStore();
  const { t } = useTranslation();
  const {
    historicalNetWorth = [],
    incomeHistory = [],
    expenseHistory = [],
    goalProgress = [],
    wealthForecast = [],
    savingsRate = null,
    partnerWealthData = null,
    currency = 'INR',
    connectionStatus = 'none',
    stage = 'Single',
    partner1 = 'User',
    partner2 = 'Partner',
    p1Salary = 0,
    p2Salary = 0,
    syncInsightsData
  } = store;

  // Sync state data on page load
  useEffect(() => {
    if (syncInsightsData) {
      syncInsightsData();
    }
  }, []);

  const fmt = (v) => formatCurrency(v, currency);
  const cmpct = (v) => formatCompact(v, currency);

  // Time range selection for Net Worth growth
  const [netWorthRange, setNetWorthRange] = useState('1Y');
  
  const slicedNetWorth = useMemo(() => {
    if (!historicalNetWorth || historicalNetWorth.length === 0) return [];
    switch (netWorthRange) {
      case '1M': return historicalNetWorth.slice(-2);
      case '3M': return historicalNetWorth.slice(-3);
      case '6M': return historicalNetWorth.slice(-6);
      case '1Y': return historicalNetWorth.slice(-12);
      case '5Y': return historicalNetWorth; // Show all 60 points
      default: return historicalNetWorth.slice(-12);
    }
  }, [historicalNetWorth, netWorthRange]);

  // Compute Net Worth growth parameters for current range
  const netWorthMetrics = useMemo(() => {
    if (slicedNetWorth.length < 2) return { current: 0, growthPct: 0, trend: 'neutral' };
    const firstVal = slicedNetWorth[0].value;
    const lastVal = slicedNetWorth[slicedNetWorth.length - 1].value;
    const diff = lastVal - firstVal;
    const pct = firstVal > 0 ? (diff / firstVal) * 100 : 0;
    
    return {
      current: lastVal,
      growthPct: pct.toFixed(1),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
    };
  }, [slicedNetWorth]);

  // Check if there is insufficient data (e.g. Salary is not set)
  const totalSal = (p1Salary || 0) + (connectionStatus === 'connected' ? (p2Salary || 0) : 0);
  const isDataInsufficient = totalSal < 1000;

  // Hover state for Asset Allocation Doughnut Chart
  const [hoveredAlloc, setHoveredAlloc] = useState(null);

  // Prepare Asset Allocation categories mapping from current state
  const totalInvestments = useMemo(() => {
    if (historicalNetWorth.length === 0) return 0;
    return historicalNetWorth[historicalNetWorth.length - 1]?.value || 0;
  }, [historicalNetWorth]);

  const allocationData = useMemo(() => {
    const investBase = totalInvestments > 0 ? totalInvestments : (totalSal * 12);
    return [
      { name: t('cash_reserves', 'Cash Reserves'), value: Math.round(investBase * 0.12), color: T.sky },
      { name: t('emergency_fund', 'Emergency Fund'), value: Math.round(investBase * 0.18), color: T.rose },
      { name: t('mutual_funds_equity', 'Mutual Funds / Equity'), value: Math.round(investBase * 0.40), color: T.goldMid },
      { name: t('retirement_corpus', 'Retirement Corpus'), value: Math.round(investBase * 0.22), color: T.sage },
      { name: t('alternative_assets', 'Alternative Assets'), value: Math.round(investBase * 0.08), color: T.violet }
    ];
  }, [totalInvestments, totalSal, t]);

  const totalAllocationValue = useMemo(() => {
    return allocationData.reduce((acc, curr) => acc + curr.value, 0);
  }, [allocationData]);

  // Framer Motion entry configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  // SVG Progress Ring Component (Inline helper)
  const ProgressRing = ({ percentage = 0, color = T.goldMid, size = 96, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <svg width={size} height={size} className="progress-ring-svg">
        <circle
          stroke="var(--border-mid)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    );
  };

  // SVG Semi-circular Gauge Gauge Needle (Inline helper)
  const SavingsGauge = ({ value = 0, level = 'Healthy' }) => {
    const angle = -180 + (Math.min(value, 50) / 50) * 180; // Map savings rate 0-50% to -180 to 0 degrees
    const needleRotation = Math.min(Math.max(angle, -180), 0);

    const gaugeColor = 
      level === 'Excellent' ? T.sage :
      level === 'Healthy' ? T.goldMid : T.rose;

    return (
      <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0 auto' }}>
        {/* Semi circle arc */}
        <svg width="200" height="100" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={T.rose} />
              <stop offset="50%" stopColor={T.goldMid} />
              <stop offset="100%" stopColor={T.sage} />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="transparent"
            stroke="var(--border-mid)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="transparent"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={251 - (Math.min(value, 50) / 50) * 251}
          />
        </svg>

        {/* Needle Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '100px',
          width: '6px',
          height: '70px',
          background: 'var(--text)',
          borderRadius: '3px',
          transformOrigin: '50% 100%',
          transform: `translateX(-50%) rotate(${needleRotation}deg)`,
          transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          {/* Needle cap */}
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'var(--text)',
            border: '2px solid var(--bg-card)'
          }} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontFamily: 'var(--fn)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text)'
        }}>
          {value}%
        </div>
      </div>
    );
  };

  // Recharts Custom Tooltip Styling
  const customTooltipStyle = {
    borderRadius: '16px',
    border: '1px solid var(--border-mid)',
    boxShadow: 'var(--shadow)',
    fontFamily: T.fontBody,
    fontSize: '12px',
    padding: '12px 16px',
    background: 'var(--bg-card)',
    color: 'var(--text)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  };

  const LockedStateCard = ({ title, desc, onConnect }) => {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        borderRadius: '18px',
        zIndex: 10,
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-mid)',
          borderRadius: '20px',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.08)',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* SVG Illustration */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="28" r="10" stroke={T.gold} strokeWidth="2.5" strokeDasharray="3 3" />
            <circle cx="30" cy="22" r="10" stroke={T.rose} strokeWidth="2.5" />
            <rect x="20" y="10" width="8" height="8" rx="1.5" fill="var(--bg-card)" stroke={T.gold} strokeWidth="2" />
          </svg>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', fontFamily: T.fontBody }}>
              {title || t('shared_wealth_locked', 'Shared Wealth Locked')}
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              {desc || t('connect_partner_desc', 'Connect your partner to unlock shared wealth planning.')}
            </p>
          </div>

          <button 
            onClick={onConnect}
            className="btn-primary"
            style={{
              width: 'auto',
              padding: '6px 16px',
              fontSize: '0.75rem',
              borderRadius: '100px',
              background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
              boxShadow: 'var(--sh-sm)'
            }}
          >
            {t('connect_partner_btn', 'Connect Partner')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="eb-page-header">
        <span className="page-eyebrow">{t('intelligence_insights', 'Intelligence & Insights')}</span>
        <h1 className="page-title">{t('insights', 'Wealth Insights')}</h1>
        <p className="page-desc">
          {t('wealth_insights_desc', 'Visual telemetry and algorithmic insights detailing your asset growth and financial path.')}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isDataInsufficient ? (
          /* Empty State Lock Page */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass text-center"
            style={{
              padding: '60px 24px',
              maxWidth: '560px',
              margin: '40px auto 0',
              border: '1px solid var(--border-mid)',
              borderRadius: T.radius,
              background: 'var(--bg-card)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.07) 0%, transparent 70%)',
              top: '-50px',
              right: '-50px',
              pointerEvents: 'none'
            }} />
            <div className="lock-icon-glow" style={{ marginBottom: '24px' }}>
              <Lock size={28} />
            </div>
            <h2 className="lock-title" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{t('insights_locked', 'Insights Locked')}</h2>
            <p className="lock-desc" style={{ maxWidth: '380px', margin: '0 auto 24px' }}>
              {t('insights_locked_desc', 'Wealth Insights require active income nodes to calculate growth trajectories, forecasts, and portfolio allocations.')}
            </p>
            <button
              onClick={() => {
                if (store.setPage) store.setPage('income');
              }}
              className="eb-btn-primary"
            >
              {t('add_income_node', 'Add Income Node')} <ChevronRight size={16} />
            </button>
          </motion.div>
        ) : (
          /* Actual Dashboard Ecosystem */
          <motion.div
            key="insights-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="eb-settings-grid"
            style={{ width: '100%' }}
          >
            {/* CHART 1 — NET WORTH GROWTH (span-8) */}
            <motion.div variants={itemVariants} className="span-8">
              <Card gold style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '16px' }}>
                  <div>
                    <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.goldMid }}>{t('asset_balances', 'Asset Balances')}</span>
                    <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px' }}>{t('net_worth_growth', 'Net Worth Growth')}</h3>
                  </div>

                  {/* Range selector */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--border)', borderRadius: '10px', padding: '3px' }}>
                    {['1M', '3M', '6M', '1Y', '5Y'].map(r => (
                      <button
                        key={r}
                        onClick={() => setNetWorthRange(r)}
                        style={{
                          padding: '4px 10px',
                          border: 'none',
                          background: netWorthRange === r ? 'var(--bg-card)' : 'transparent',
                          color: netWorthRange === r ? 'var(--text)' : 'var(--text-muted)',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: netWorthRange === r ? 'var(--shadow-card)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {t('range_' + r.toLowerCase(), r)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Growth metrics display */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{t('current_estimate', 'CURRENT ESTIMATE')}</span>
                    <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--fn)', color: 'var(--text)', lineHeight: '1.1' }}>
                      {fmt(netWorthMetrics.current)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{t('growth_rate', 'GROWTH RATE')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: netWorthMetrics.trend === 'up' ? T.sage : netWorthMetrics.trend === 'down' ? T.rose : T.gold }}>
                      {netWorthMetrics.trend === 'up' ? <TrendingUp size={16} /> : netWorthMetrics.trend === 'down' ? <TrendingDown size={16} /> : null}
                      <span style={{ fontSize: '1.2rem' }}>{netWorthMetrics.growthPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div style={{ height: '240px', width: '100%', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={slicedNetWorth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.sage} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={T.sage} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.rose} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={T.rose} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.goldMid} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={T.goldMid} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-faint)', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-faint)', fontSize: 10 }}
                        tickFormatter={(v) => cmpct(v)}
                      />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(v) => [fmt(v), t('net_worth', 'Net Worth')]}
                        cursor={{ stroke: 'var(--border-mid)', strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={netWorthMetrics.trend === 'up' ? T.sage : netWorthMetrics.trend === 'down' ? T.rose : T.goldMid}
                        strokeWidth={2.5}
                        fill={netWorthMetrics.trend === 'up' ? 'url(#sageGradient)' : netWorthMetrics.trend === 'down' ? 'url(#roseGradient)' : 'url(#goldGradient)'}
                        isAnimationActive={true}
                        animationDuration={1200}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Award size={18} style={{ color: T.gold, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_nw_growth', 'Your assets are growing {trend}. In the current {range} selection, net worth increased by {percent}%.')
                      .replace('{trend}', netWorthMetrics.trend === 'up' ? t('positively', 'positively') : t('neutrally', 'neutrally'))
                      .replace('{range}', t('range_' + netWorthRange.toLowerCase(), netWorthRange))
                      .replace('{percent}', netWorthMetrics.growthPct)}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 7 — SAVINGS HEALTH GAUGE (span-4) */}
            <motion.div variants={itemVariants} className="span-4">
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('financial_health', 'Financial Health')}</span>
                  <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '24px' }}>{t('savings_health', 'Savings Health')}</h3>

                  <SavingsGauge
                    value={savingsRate?.percentage || 30}
                    level={savingsRate?.level || 'Healthy'}
                  />

                  <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
                    <span className="stage-badge" style={{
                      background: 
                        savingsRate?.level === 'Excellent' ? 'var(--sage-lt)' :
                        savingsRate?.level === 'Healthy' ? 'var(--gold-pale)' : 'var(--rose-lt)',
                      color:
                        savingsRate?.level === 'Excellent' ? T.sage :
                        savingsRate?.level === 'Healthy' ? T.gold : T.rose,
                      border: '1px solid currentColor',
                      fontSize: '0.8rem',
                      padding: '4px 14px'
                    }}>
                      {t('savings_level_' + (savingsRate?.level || 'Healthy').toLowerCase(), savingsRate?.level || 'Healthy')} {t('rating', 'Rating')}
                    </span>
                  </div>
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '12px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {t(savingsRate?.description, savingsRate?.description || 'Your shared financial plan is healthy.')}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 2 — INCOME VS EXPENSES (span-6) */}
            <motion.div variants={itemVariants} className="span-6">
              <Card style={{ height: '100%' }}>
                <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('cash_flow', 'Cash Flow')}</span>
                <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '16px' }}>{t('income_vs_expenses', 'Income vs Expenses')}</h3>

                <div style={{ height: '220px', width: '100%', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={incomeHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} tickFormatter={(v) => cmpct(v)} />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const combinedInc = payload[0]?.value || 0;
                            // Need expense data for the matching month
                            const matchedExpense = expenseHistory.find(e => e.month === label);
                            const combinedExp = matchedExpense ? matchedExpense.combined : Math.round(combinedInc * 0.65);
                            const savingAmt = Math.max(0, combinedInc - combinedExp);
                            const rate = combinedInc > 0 ? ((savingAmt / combinedInc) * 100).toFixed(0) : 0;
                            return (
                              <div style={{ padding: '4px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid var(--border-mid)', paddingBottom: '4px' }}>{t('monthly_cashflow_title', '{label} Cashflow').replace('{label}', label)}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                  <span style={{ color: T.sage }}>{t('income_label', 'Income:')}</span>
                                  <span style={{ fontWeight: 600 }}>{fmt(combinedInc)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: '4px' }}>
                                  <span style={{ color: T.rose }}>{t('expenses_label', 'Expenses:')}</span>
                                  <span style={{ fontWeight: 600 }}>{fmt(combinedExp)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px dashed var(--border-mid)', paddingTop: '4px', fontWeight: 700 }}>
                                  <span>{t('savings_rate_label', 'Savings Rate:')}</span>
                                  <span style={{ color: T.gold }}>{rate}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="combined" stroke={T.sage} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name={t('income', 'Income')} />
                      {/* Read matching monthly expenses */}
                      <Line
                        type="monotone"
                        data={incomeHistory.map((inc, index) => ({
                          month: inc.month,
                          combined: expenseHistory[index]?.combined || Math.round(inc.combined * 0.65)
                        }))}
                        dataKey="combined"
                        stroke={T.rose}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name={t('expenses', 'Expenses')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Wallet size={16} style={{ color: T.sage, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_savings_average', 'Your saving rate averages {percent}%. Cash flow direction is positive; your surplus is safely allocated into wealth generators.').replace('{percent}', savingsRate?.percentage || 30)}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 5 — WEALTH FORECAST (span-6) */}
            <motion.div variants={itemVariants} className="span-6">
              <Card style={{ height: '100%' }}>
                <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('projections', 'Projections')}</span>
                <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '16px' }}>{t('future_wealth_projection', 'Future Wealth Projection')}</h3>

                <div style={{ height: '220px', width: '100%', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wealthForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="optimisticGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.sage} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={T.sage} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.goldMid} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={T.goldMid} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="conservativeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.rose} stopOpacity={0.10} />
                          <stop offset="95%" stopColor={T.rose} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} tickFormatter={(v) => cmpct(v)} />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ padding: '4px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid var(--border-mid)', paddingBottom: '4px' }}>{t('forecast_year', 'Forecast ({label})').replace('{label}', label)}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                  <span style={{ color: T.sage }}>{t('optimistic_rate', 'Optimistic (12%):')}</span>
                                  <span style={{ fontWeight: 600 }}>{fmt(data.optimistic)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                  <span style={{ color: T.gold }}>{t('base_rate', 'Base (10%):')}</span>
                                  <span style={{ fontWeight: 600 }}>{fmt(data.base)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: '4px' }}>
                                  <span style={{ color: T.rose }}>{t('conservative_rate', 'Conservative (7%):')}</span>
                                  <span style={{ fontWeight: 600 }}>{fmt(data.conservative)}</span>
                                </div>
                                {data.milestone && (
                                  <div style={{ borderTop: '1px dashed var(--border-mid)', paddingTop: '4px', fontSize: '10px', color: T.gold, fontWeight: 700 }}>
                                    🎯 {t('milestone', 'Milestone')}: {t(data.milestone, data.milestone)}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="optimistic" stroke={T.sage} strokeWidth={1} fill="url(#optimisticGrad)" name={t('optimistic', 'Optimistic')} />
                      <Area type="monotone" dataKey="base" stroke={T.goldMid} strokeWidth={2} fill="url(#baseGrad)" name={t('base_estimate', 'Base Estimate')} />
                      <Area type="monotone" dataKey="conservative" stroke={T.rose} strokeWidth={1} fill="url(#conservativeGrad)" name={t('conservative', 'Conservative')} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={16} style={{ color: T.gold, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_wealth_projection', 'In 10 Years, your projected portfolio base corpus is expected to compound to {amount}.').replace('{amount}', wealthForecast.length > 2 ? cmpct(wealthForecast[2].base) : '')}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 3 — ASSET ALLOCATION (span-6) */}
            <motion.div variants={itemVariants} className="span-6">
              <Card style={{ height: '100%', position: 'relative' }}>
                <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('diversification', 'Diversification')}</span>
                <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '12px' }}>{t('portfolio_allocation', 'Portfolio Allocation')}</h3>

                <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ height: '100%', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          innerRadius="65%"
                          outerRadius="85%"
                          paddingAngle={2}
                          dataKey="value"
                          strokeWidth={0}
                          onMouseMove={(e, i) => setHoveredAlloc(i)}
                          onMouseLeave={() => setHoveredAlloc(null)}
                        >
                          {allocationData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Centered Hover Info Panel */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    maxWidth: '120px'
                  }}>
                    {hoveredAlloc !== null ? (
                      <>
                        <span style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {allocationData[hoveredAlloc].name}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--fn)', display: 'block', margin: '2px 0' }}>
                          {cmpct(allocationData[hoveredAlloc].value)}
                        </span>
                        <span style={{ fontSize: '10px', color: allocationData[hoveredAlloc].color, fontWeight: 700 }}>
                          {((allocationData[hoveredAlloc].value / totalAllocationValue) * 100).toFixed(0)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                          {t('portfolio', 'Portfolio')}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--fn)', display: 'block', margin: '2px 0' }}>
                          {cmpct(totalAllocationValue)}
                        </span>
                        <span style={{ fontSize: '10px', color: T.gold, fontWeight: 700 }}>
                          {t('allocated', 'Allocated')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend display */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '12px 0 16px' }}>
                  {allocationData.map((item, index) => (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredAlloc(index)}
                      onMouseLeave={() => setHoveredAlloc(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: hoveredAlloc === index ? 'var(--bg-warm)' : 'transparent',
                        transition: 'background 0.2s ease',
                        color: hoveredAlloc === index ? 'var(--text)' : 'var(--text-muted)'
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span>{t(item.name, item.name)}</span>
                    </div>
                  ))}
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Sparkles size={16} style={{ color: T.violet, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_diversification', 'Emergency safety reserves form 18% of assets, satisfying standard diversification metrics.')}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 4 — GOAL PROGRESS PROGRESS RINGS (span-6) */}
            <motion.div variants={itemVariants} className="span-6">
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('milestones', 'Milestones')}</span>
                  <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '16px' }}>{t('goals_progress', 'Goals Progress')}</h3>

                  {goalProgress.length === 0 ? (
                    <div style={{ padding: '30px 0', textCenter: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }} className="ms-empty-state">
                      <Target size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                      {t('initialize_goals_prompt', 'Initialize dream goals in the Goals section to unlock ring tracking.')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {goalProgress.slice(0, 3).map((goal, idx) => {
                        const ringColor = 
                          goal.id === 'retirement' ? T.sage :
                          goal.id === 'child' ? T.goldMid :
                          goal.id === 'house' ? T.sky : T.rose;
                          
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '12px 14px', borderRadius: T.radiusSm, border: '1px solid var(--border)' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <ProgressRing percentage={goal.percentage} color={ringColor} size={64} strokeWidth={6} />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text)' }}>
                                {goal.percentage}%
                              </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(goal.name, goal.name)}</span>
                                <span style={{ fontSize: '0.75rem', color: ringColor, fontWeight: 700, flexShrink: 0 }}>{t('eta', 'ETA')}: {goal.estimatedCompletion}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>{t('saved_label', 'Saved')}: {cmpct(goal.current)}</span>
                                <span>{t('target_label', 'Target')}: {cmpct(goal.target)}</span>
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                                {t('remaining_label', 'Remaining')}: {fmt(goal.remaining)} ➔ {t('est_label', 'Est')}: {goal.completionDate}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center', marginTop: '16px' }}>
                  <Target size={16} style={{ color: T.rose, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {goalProgress[0] ? t('insight_goal_progress', 'Your {goalName} goal is {percent}% complete. Target completion: {date}.')
                      .replace('{goalName}', t(goalProgress[0].name, goalProgress[0].name))
                      .replace('{percent}', goalProgress[0].percentage)
                      .replace('{date}', goalProgress[0].completionDate) : t('set_targets_prompt', 'Set targets to evaluate milestones.')}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 6 — LIFE JOURNEY TIMELINE (span-6) */}
            <motion.div variants={itemVariants} className="span-6">
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.textFaint }}>{t('roadmap', 'Roadmap')}</span>
                  <h3 className="card-heading" style={{ fontSize: '1.25rem', marginTop: '2px', marginBottom: '24px' }}>{t('financial_journey_timeline', 'Financial Journey Timeline')}</h3>

                  {/* Horizontal visual line */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px 32px' }}>
                    
                    {/* Connecting line */}
                    <div style={{
                      position: 'absolute',
                      top: '25px',
                      left: '8%',
                      right: '8%',
                      height: '3px',
                      background: 'var(--border-mid)',
                      zIndex: 1
                    }}>
                      {/* Highlighted active portion */}
                      <div style={{
                        width: stage === 'Married' ? '66.6%' : stage === 'Committed' ? '33.3%' : '0%',
                        height: '100%',
                        background: `linear-gradient(90deg, ${T.sky}, ${T.rose}, ${T.gold})`,
                        transition: 'width 1.2s ease-in-out'
                      }} />
                    </div>

                    {/* Nodes */}
                    {[
                      { key: 'Single', label: t('single', 'Single'), color: T.sky, icon: '👤' },
                      { key: 'Committed', label: t('committed', 'Committed'), color: T.rose, icon: '💖' },
                      { key: 'Married', label: t('married', 'Married'), color: T.gold, icon: '💍' },
                      { key: 'Freedom', label: t('financial_freedom', 'Financial Freedom'), color: T.sage, icon: '🌴' }
                    ].map((node, index) => {
                      // Node is completed if we are at or past its stage
                      const stages = ['Single', 'Committed', 'Married', 'Freedom'];
                      const currentIdx = stages.indexOf(stage);
                      const nodeIdx = stages.indexOf(node.key);
                      const isCompleted = nodeIdx <= currentIdx;
                      const isActive = node.key === stage;

                      return (
                        <div key={node.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, width: '20%' }}>
                          {/* Circle dot */}
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isActive ? 'var(--bg-card)' : isCompleted ? node.color : 'var(--bg-card)',
                            border: isActive ? `3px solid ${node.color}` : isCompleted ? 'none' : '3px solid var(--border-mid)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'default',
                            boxShadow: isActive ? `0 0 16px ${node.color}` : 'none',
                            transition: 'all 0.4s ease'
                          }}>
                            {/* Inner active dot */}
                            {isActive && (
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: node.color,
                                animation: 'pulse 1.5s infinite alternate'
                              }} />
                            )}
                          </div>

                          {/* Node label */}
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: isActive || isCompleted ? 700 : 500,
                            color: isActive ? 'var(--text)' : isCompleted ? 'var(--text-muted)' : 'var(--text-faint)',
                            marginTop: '8px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {node.icon} {node.label}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                  {/* Journey stage items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('current_node', 'Current Node:')}</span>
                      <span style={{ fontWeight: 700, color: T.gold }}>{stage === 'Single' ? t('independent_builder', 'Independent Builder') : stage === 'Committed' ? t('committed_network', 'Committed Network') : t('married_dynasty', 'Married Dynasty')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('connection_link', 'Connection Link:')}</span>
                      <span style={{ fontWeight: 700 }}>{connectionStatus === 'connected' ? t('crypto_link_active', 'Cryptographic Link Active') : t('unlinked_solo_node', 'Unlinked Solo Node')}</span>
                    </div>
                  </div>
                </div>

                {/* Insight Engine */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center', marginTop: '16px' }}>
                  <Sparkles size={16} style={{ color: T.gold, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_journey_stage', 'You are currently at the {stage} stage of your planning journey. {extra}').replace('{stage}', t(stage.toLowerCase(), stage)).replace('{extra}', stage === 'Single' ? t('connect_partner_promo', 'Connect a partner to double allocations.') : t('nodes_merged_msg', 'Your nodes are merged and planning is fully synchronized.'))}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CHART 8 — COUPLE WEALTH INSIGHTS (span-6) */}
            <motion.div variants={itemVariants} className="span-6" style={{ position: 'relative' }}>
              {connectionStatus === 'connected' ? (
                <Card style={{ height: '100%', background: 'linear-gradient(135deg, rgba(208, 92, 114, 0.04) 0%, rgba(124, 107, 190, 0.04) 100%)', border: '1px solid var(--rose-border)' }}>
                  <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.rose }}>{t('relationship_dashboard', 'Relationship Dashboard')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', marginBottom: '16px' }}>
                    <Heart size={18} fill={T.rose} style={{ color: T.rose }} />
                    <h3 className="card-heading" style={{ fontSize: '1.25rem', margin: 0 }}>{t('couple_wealth_insights', 'Couple Wealth Insights')}</h3>
                  </div>

                  {/* Comparative Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: T.radiusSm, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{t('shared_monthly_income', 'SHARED MONTHLY INCOME')}</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>{fmt(totalSal)}</div>
                      <span style={{ fontSize: '0.7rem', color: T.sage, fontWeight: 700 }}>
                        {partner1}: {Math.round((p1Salary / totalSal) * 100)}% | {partner2}: {Math.round((p2Salary / totalSal) * 100)}%
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: T.radiusSm, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{t('combined_savings_rate', 'COMBINED SAVINGS RATE')}</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>{savingsRate?.percentage}%</div>
                      <span style={{ fontSize: '0.7rem', color: T.gold, fontWeight: 700 }}>
                        {t('partner_individual_savings', '{name}\'s individual: {rate}%').replace('{name}', partnerWealthData?.partnerName || '').replace('{rate}', partnerWealthData?.partnerSavingsRate || '')}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: T.radiusSm, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{t('partner_asset_share', 'PARTNER ASSET SHARE')}</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>{fmt(partnerWealthData?.p2NetWorthShare || 0)}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('contribution_index_45', '45% contribution index')}</span>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: T.radiusSm, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{t('active_shared_goals', 'ACTIVE SHARED GOALS')}</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>
                        {goalProgress.length} {goalProgress.length === 1 ? t('target', 'Target') : t('targets', 'Targets')}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: T.violet, fontWeight: 700 }}>{t('dual_ledger_sync', 'Dual ledger sync fully active')}</span>
                    </div>
                  </div>

                  {/* Insight Engine */}
                  <div style={{ padding: '10px 14px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, border: '1px solid var(--border-mid)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Heart size={16} style={{ color: T.rose, flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      <strong>{t('insight_engine', 'Insight Engine')}:</strong> {t('insight_couple_savings', 'Combined savings rate is {percent}%. Together, you are projected to reach your shared goals {years} years earlier than solo paths.').replace('{percent}', savingsRate?.percentage || '').replace('{years}', 1.4)}
                    </p>
                  </div>
                </Card>
              ) : (
                <Card style={{ height: '100%', position: 'relative' }}>
                  <span className="card-title" style={{ fontSize: '0.72rem', tracking: '0.08em', textTransform: 'uppercase', color: T.rose }}>{t('relationship_dashboard', 'Relationship Dashboard')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', marginBottom: '16px' }}>
                    <Heart size={18} fill={T.rose} style={{ color: T.rose }} />
                    <h3 className="card-heading" style={{ fontSize: '1.25rem', margin: 0 }}>{t('couple_wealth_insights', 'Couple Wealth Insights')}</h3>
                  </div>
                  <LockedStateCard 
                    title={t('couple_insights_locked', 'Couple Insights Locked')}
                    desc={t('connect_partner_desc', 'Connect your partner to unlock shared wealth planning.')}
                    onConnect={() => {
                      if (store.setPage) store.setPage('partner');
                    }}
                  />
                </Card>
              )}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Extra layout style block for keyframes */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        .progress-ring-svg {
          transform: rotate(0deg);
          transition: transform 0.3s ease;
        }
        .progress-ring-svg:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
