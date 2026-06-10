import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, AreaChart, Area, Sector
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, calculateHealthScore, 
  formatCurrency, formatCompact
} from '../../utils/finance';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { 
  TrendingUp, Wallet, Coins, Shield, Landmark, Sparkles, 
  Target, AlertCircle, CheckCircle2, ChevronRight, Activity, 
  FileText, Upload, Plus, Check, ArrowRight, X, Heart, Briefcase, Info
} from 'lucide-react';
import { useToast } from '../common/Toast';

const CHART_TOOLTIP_STYLE = {
  borderRadius: '16px',
  border: '1px solid var(--border-mid)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '10px 14px',
  background: 'var(--bg-card)',
  color: 'var(--text)',
};

const getGreetingTime = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'GOOD MORNING';
  if (hr < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
};

export function Dashboard() {
  const toast = useToast();
  const { 
    partner1, currency, getTotalSalary, mode, p1Salary, milestones, dreamGoals,
    setP1Salary, setMindset, addMilestone
  } = useFinanceStore();
  const theme = useFinanceStore(s => s.theme);
  const nameToUpper = (partner1 || 'Arup').toUpperCase();

  // States
  const [growthFilter, setGrowthFilter] = useState('1Y');
  const [activePieIndex, setActivePieIndex] = useState(-1);
  const [bottomSheetSlice, setBottomSheetSlice] = useState(null);

  // FTUX Inline Form States
  const [activeSetupTab, setActiveSetupTab] = useState(null); // 'income' | 'invest' | 'emergency' | 'goal' | 'import'
  const [incomeInput, setIncomeInput] = useState('');
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalTarget, setCustomGoalTarget] = useState('');
  const [isSpreadsheetUploading, setIsSpreadsheetUploading] = useState(false);

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

  // Setup Checklist Calculation
  const hasProfile = !!partner1;
  const hasCurrency = !!currency;
  const hasIncome = p1Salary > 0;
  
  // Calculate dynamic snapshot & health
  const salaryAmount = p1Salary || 0;
  const snap = useMemo(() => calculateFinancialSnapshot(salaryAmount, mode || 'Balanced'), [salaryAmount, mode]);
  const health = useMemo(() => calculateHealthScore(snap), [snap]);

  const hasInvestments = hasIncome && snap.budget.investments > 0;
  const hasEmergency = hasIncome && snap.budget.emergency > 0;
  const hasGoals = milestones.length > 0 || (dreamGoals && dreamGoals.length > 0);

  const completedCount = 
    (hasProfile ? 1 : 0) + 
    (hasCurrency ? 1 : 0) + 
    (hasIncome ? 1 : 0) + 
    (hasInvestments ? 1 : 0) + 
    (hasEmergency ? 1 : 0) + 
    (hasGoals ? 1 : 0);
  
  const setupPercent = Math.round((completedCount / 6) * 100);

  // Derived Financial Metrics for Active State
  const monthlyIncome = salaryAmount;
  const monthlyInvestments = snap.budget.investments || 0;
  const emergencyReserve = snap.budget.emergency || 0;
  const totalAssets = salaryAmount * 40; 
  const netWorth = totalAssets + emergencyReserve;

  // Sparkline data for Net Worth Hero Card
  const sparklineData = [{ value: 100 }, { value: 104 }, { value: 102 }, { value: 108 }, { value: 111 }, { value: 112.4 }];

  // Setup checklists submit handlers
  const saveIncome = () => {
    const val = Number(incomeInput);
    if (!val || val <= 0) {
      toast.error('Please enter a valid income amount');
      return;
    }
    setP1Salary(val);
    toast.success(`Salary recorded: ${fmt(val)}/month`);
    setIncomeInput('');
    setActiveSetupTab(null);
  };

  const saveMindset = (profile) => {
    setMindset(profile);
    toast.success(`Investment profile set to ${profile}`);
    setActiveSetupTab(null);
  };

  const createEmergencyFundGoal = () => {
    addMilestone({
      name: 'Emergency Reserve Locker',
      category: 'other',
      targetCost: 500000,
      monthlySaved: Math.round((p1Salary || 120000) * 0.1),
      targetDate: '2028-06-30'
    });
    toast.success('Emergency Fund Milestone registered successfully!');
    setActiveSetupTab(null);
  };

  const createCustomGoal = () => {
    const cost = Number(customGoalTarget);
    if (!customGoalName.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (!cost || cost <= 0) {
      toast.error('Please enter a valid target cost');
      return;
    }
    addMilestone({
      name: customGoalName.trim(),
      category: 'other',
      targetCost: cost,
      monthlySaved: Math.round(cost / 48), // 4-year default
      targetDate: '2030-06-30'
    });
    toast.success(`Goal "${customGoalName}" created successfully!`);
    setCustomGoalName('');
    setCustomGoalTarget('');
    setActiveSetupTab(null);
  };

  const simulateSpreadsheetImport = () => {
    setIsSpreadsheetUploading(true);
    setTimeout(() => {
      setP1Salary(150000);
      setMindset('Balanced');
      addMilestone({
        name: 'Spreadsheet Goal',
        category: 'other',
        targetCost: 600000,
        monthlySaved: 10000,
        targetDate: '2029-12-31'
      });
      setIsSpreadsheetUploading(false);
      toast.success('Excel spreadsheet imported! Staged: ₹1,50,000 salary & Balanced investments active.');
      setActiveSetupTab(null);
    }, 1500);
  };

  // Recharts interactive active slice donut drawer shape
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // expand outer slice radius by 8px
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  // Interactive Net Worth Growth Data Points
  const growthData = useMemo(() => {
    const base = netWorth;
    if (growthFilter === '1M') {
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const growthFactor = 0.985 + (day * 0.0005);
        return { name: `Day ${day}`, value: Math.round(base * growthFactor) };
      });
    }
    if (growthFilter === '6M') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((m, i) => {
        const growthFactor = 0.92 + (i * 0.016);
        return { name: m, value: Math.round(base * growthFactor) };
      });
    }
    if (growthFilter === '5Y') {
      const years = ['2022', '2023', '2024', '2025', '2026'];
      return years.map((y, i) => {
        const growthFactor = 0.65 + (i * 0.088);
        return { name: y, value: Math.round(base * growthFactor) };
      });
    }
    // Default 1Y
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => {
      const growthFactor = 0.89 + (i * 0.01);
      return { name: m, value: Math.round(base * growthFactor) };
    });
  }, [growthFilter, netWorth]);

  // Asset Allocation Donut Chart Data
  const assetAllocationData = useMemo(() => {
    const portfolioValue = salaryAmount * 24;
    return [
      { name: 'Equity', value: portfolioValue * 0.50, percent: 50, color: T.sky },
      { name: 'Debt', value: portfolioValue * 0.25, percent: 25, color: T.goldMid },
      { name: 'Gold', value: portfolioValue * 0.125, percent: 12.5, color: T.gold },
      { name: 'Cash', value: portfolioValue * 0.083, percent: 8.3, color: T.sage },
      { name: 'Crypto', value: portfolioValue * 0.042, percent: 4.2, color: T.rose }
    ];
  }, [salaryAmount]);

  // Income vs Expenses Monthly Side-by-Side Data
  const incomeVsExpensesData = useMemo(() => {
    const inc = monthlyIncome;
    const exp = snap.budget.needs || (monthlyIncome * 0.50);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((m, i) => {
      const fluctuationInc = 1 + (Math.sin(i * 1.5) * 0.02);
      const fluctuationExp = 0.95 + (Math.cos(i * 1.5) * 0.08);
      return {
        name: m,
        Income: Math.round(inc * fluctuationInc),
        Expenses: Math.round(exp * fluctuationExp)
      };
    });
  }, [monthlyIncome, snap.budget.needs]);

  // Goals list mapping
  const goalsData = [
    { name: 'House Fund', target: 8000000, progress: 42, color: T.sky },
    { name: 'Europe Education Fund', target: 5000000, progress: 28, color: T.rose },
    { name: 'Retirement Corpus', target: 30000000, progress: 15, color: T.gold },
    { name: 'Emergency Fund', target: 500000, progress: 85, color: T.sage }
  ];

  // Activities logs
  const activitiesData = [
    { id: 1, type: 'investment', title: 'Investment Added', desc: '₹25,000 SIP allocated to Nifty 50 Index Fund.', time: '2 hours ago', icon: <TrendingUp size={14} style={{ color: T.sage }} /> },
    { id: 2, type: 'salary', title: 'Salary Received', desc: 'Primary income node of ₹1,20,000 credited to core ledger.', time: '1 day ago', icon: <Coins size={14} style={{ color: T.gold }} /> },
    { id: 3, type: 'goal', title: 'Goal Updated', desc: 'Retirement Corpus target calibrated to ₹3,00,00,000.', time: '3 days ago', icon: <Target size={14} style={{ color: T.sky }} /> },
    { id: 4, type: 'reserve', title: 'Emergency Fund Topped Up', desc: '₹15,000 shifted to liquid reserve locker.', time: '5 days ago', icon: <Shield size={14} style={{ color: T.rose }} /> },
    { id: 5, type: 'portfolio', title: 'Portfolio Rebalanced', desc: 'Asset allocation synchronized to Balanced profile.', time: '1 week ago', icon: <Activity size={14} style={{ color: T.goldMid }} /> }
  ];

  // Smart engagement motivation calculators
  const emergencyFundGoalAmt = 500000;
  const emergencyFundMonthRatio = hasIncome ? '2.5 months' : '0.0 months';
  const consistencyRate = 78;
  const milestonesAverageProgress = milestones.length > 0
    ? Math.round(milestones.reduce((acc, curr) => acc + (curr.monthlySaved > 0 ? 30 : 0), 0) / milestones.length)
    : 34;

  const sipCompoundingValue = useMemo(() => {
    if (!hasIncome) return 0;
    const PMT = monthlyInvestments;
    const r = 0.105 / 12; // 10.5% return
    const n = 17 * 12; // Compounding for 17 years (approx age 45)
    return Math.round(PMT * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  }, [monthlyInvestments, hasIncome]);

  // Health Score circular gauge metrics
  const scoreColor = health.value >= 85 ? T.sage : health.value >= 70 ? T.gold : T.rose;
  const scorePercent = health.value / 100;
  const strokeDashoffset = 251.2 - (251.2 * scorePercent);

  // Conditional Rendering logic based on Rule #1
  if (!hasIncome) {
    return (
      <div className="fade-in" style={{ paddingBottom: '60px' }}>
        
        {/* welcome header */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: T.gold }}>
            WELCOME BACK, {(partner1 || 'Arup').toUpperCase()}
          </span>
          <h1 className="page-title" style={{ marginTop: '8px', fontSize: '2.1rem', fontWeight: 800 }}>
            Let's build your financial system.
          </h1>
          <p className="page-desc" style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>
            Complete your setup to unlock wealth analytics, projections, and dynastic asset command parameters.
          </p>
        </div>

        {/* ONBOARDING FTUX CONTAINER */}
        <div className={isMobile ? 'mobile-stack' : ''} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* LEFT COLUMN: Setup progress checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card className="apple-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Setup Progress</h3>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: T.gold, fontFamily: 'var(--fn)' }}>
                    {setupPercent}%
                  </span>
                </div>
                
                {/* Checklist items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Profile', ok: hasProfile },
                    { label: 'Currency', ok: hasCurrency },
                    { label: 'Income', ok: hasIncome },
                    { label: 'Investments', ok: hasInvestments },
                    { label: 'Emergency Fund', ok: hasEmergency },
                    { label: 'Goals', ok: hasGoals }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: item.ok ? 'var(--text)' : 'var(--text-muted)' }}>
                        {item.label}
                      </span>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: item.ok ? `${T.sage}15` : 'transparent',
                        border: `1.5px solid ${item.ok ? T.sage : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: T.sage
                      }}>
                        {item.ok ? <Check size={10} strokeWidth={3} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${setupPercent}%`, height: '100%', background: T.gold, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Interactive Setup actions grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Add Income Card */}
              <button 
                onClick={() => setActiveSetupTab(activeSetupTab === 'income' ? null : 'income')}
                style={{ 
                  textAlign: 'left', 
                  border: `1px solid ${activeSetupTab === 'income' ? T.gold : 'var(--border)'}`, 
                  outline: 'none',
                  cursor: 'pointer'
                }}
                className="apple-card"
              >
                <Wallet size={20} style={{ color: T.sky, marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Add Income</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Record your primary monthly salary ledger.
                </p>
              </button>

              {/* Add Investments Card */}
              <button 
                onClick={() => setActiveSetupTab(activeSetupTab === 'invest' ? null : 'invest')}
                style={{ 
                  textAlign: 'left', 
                  border: `1px solid ${activeSetupTab === 'invest' ? T.gold : 'var(--border)'}`, 
                  outline: 'none',
                  cursor: 'pointer'
                }}
                className="apple-card"
              >
                <TrendingUp size={20} style={{ color: T.goldMid, marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Add Investments</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Calibrate savings mindset split allocations.
                </p>
              </button>

              {/* Create Emergency Fund Card */}
              <button 
                onClick={() => setActiveSetupTab(activeSetupTab === 'emergency' ? null : 'emergency')}
                style={{ 
                  textAlign: 'left', 
                  border: `1px solid ${activeSetupTab === 'emergency' ? T.gold : 'var(--border)'}`, 
                  outline: 'none',
                  cursor: 'pointer'
                }}
                className="apple-card"
              >
                <Shield size={20} style={{ color: T.rose, marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Emergency Fund</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Set up a safety reserve target buffer.
                </p>
              </button>

              {/* Create Financial Goal Card */}
              <button 
                onClick={() => setActiveSetupTab(activeSetupTab === 'goal' ? null : 'goal')}
                style={{ 
                  textAlign: 'left', 
                  border: `1px solid ${activeSetupTab === 'goal' ? T.gold : 'var(--border)'}`, 
                  outline: 'none',
                  cursor: 'pointer'
                }}
                className="apple-card"
              >
                <Target size={20} style={{ color: T.gold, marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Create Goal</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Define custom milestones (Home, Education).
                </p>
              </button>
            </div>

            {/* Import Spreadsheet Card */}
            <button 
              onClick={() => setActiveSetupTab(activeSetupTab === 'import' ? null : 'import')}
              style={{ 
                textAlign: 'left', 
                border: `1px solid ${activeSetupTab === 'import' ? T.gold : 'var(--border)'}`, 
                outline: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
              className="apple-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Upload size={20} style={{ color: T.sage }} />
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Import Spreadsheet</h4>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Drag and drop spreadsheet to parse portfolios immediately.
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-faint)' }} />
              </div>
            </button>

            {/* Inline Setup Expandable Forms Panel */}
            <AnimatePresence mode="wait">
              {activeSetupTab && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="apple-card"
                  style={{ background: 'var(--bg-muted)', border: `1.5px solid ${T.gold}40` }}
                >
                  
                  {/* INCOME FORM */}
                  {activeSetupTab === 'income' && (
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px' }}>Add Monthly Income</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Enter your monthly salary to activate wealth calculation splits.</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="number"
                          placeholder="Monthly Salary (e.g. 120000)"
                          value={incomeInput}
                          onChange={e => setIncomeInput(e.target.value)}
                          className="goal-input"
                          style={{ marginBottom: 0, flexGrow: 1 }}
                        />
                        <button className="btn-primary" style={{ background: T.gold, width: 'auto', padding: '10px 20px', borderRadius: '12px' }} onClick={saveIncome}>
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MINDSET/INVESTMENTS FORM */}
                  {activeSetupTab === 'invest' && (
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px' }}>Choose Savings Profile</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Pick a risk profile to calibrate allocation ratios (mindset):</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {['Conservative', 'Balanced', 'Aggressive'].map(profile => (
                          <button 
                            key={profile}
                            onClick={() => saveMindset(profile)}
                            className="btn-primary"
                            style={{ 
                              background: mode === profile ? T.gold : 'var(--bg-card)', 
                              color: mode === profile ? '#fff' : 'var(--text)',
                              border: '1px solid var(--border)',
                              fontSize: '0.72rem',
                              borderRadius: '12px',
                              padding: '10px'
                            }}
                          >
                            {profile}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EMERGENCY FUND FORM */}
                  {activeSetupTab === 'emergency' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '6px' }}>Configure Emergency Reserve</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Generate a 6-month buffer milestone target of ₹5,00,000.</p>
                      <button className="btn-primary" style={{ background: T.rose, borderRadius: '12px' }} onClick={createEmergencyFundGoal}>
                        Create Emergency Reserve Target
                      </button>
                    </div>
                  )}

                  {/* GOAL FORM */}
                  {activeSetupTab === 'goal' && (
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px' }}>Create Financial Goal</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Define specific milestone target costs:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text"
                          placeholder="Goal Name (e.g. Home Downpayment)"
                          value={customGoalName}
                          onChange={e => setCustomGoalName(e.target.value)}
                          className="goal-input"
                          style={{ marginBottom: 0 }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="number"
                            placeholder="Target Cost (e.g. 1500000)"
                            value={customGoalTarget}
                            onChange={e => setCustomGoalTarget(e.target.value)}
                            className="goal-input"
                            style={{ marginBottom: 0, flexGrow: 1 }}
                          />
                          <button className="btn-primary" style={{ background: T.gold, width: 'auto', padding: '10px 20px', borderRadius: '12px' }} onClick={createCustomGoal}>
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPREADSHEET IMPORT FORM */}
                  {activeSetupTab === 'import' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Upload size={32} style={{ color: T.sage, marginBottom: '12px' }} />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '6px' }}>Upload Asset Spreadsheet</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Supports .xlsx or .csv parsed files.</p>
                      
                      <button 
                        className="btn-primary" 
                        style={{ background: T.sage, borderRadius: '12px', width: 'auto', padding: '10px 24px' }}
                        onClick={simulateSpreadsheetImport}
                        disabled={isSpreadsheetUploading}
                      >
                        {isSpreadsheetUploading ? 'Parsing Spreadsheet...' : 'Choose Spreadsheet File'}
                      </button>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    );
  }

  // ACTIVE FULL DYNAMICS WORKSPACE
  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* NEW HERO SECTION */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.4fr 1fr', 
          gap: '24px', 
          alignItems: 'stretch',
          marginBottom: '28px' 
        }}
      >
        {/* Left Welcome Block */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="page-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.gold }}>
              {getGreetingTime()}, {nameToUpper}
            </span>
          </div>
          <h1 className="page-title" style={{ marginTop: '8px', fontSize: '2.2rem', fontWeight: 800 }}>
            Financial Command Center
          </h1>
          <p className="page-desc" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', marginTop: '6px', lineHeight: 1.5 }}>
            Track assets, income, investments and long-term wealth growth in a single, focused environment.
          </p>
        </div>

        {/* Right Total Net Worth Card */}
        <div className="apple-card-gold" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em' }}>
                Total Net Worth
              </span>
              <div style={{ fontFamily: 'var(--fn)', fontSize: '2.1rem', fontWeight: 800, color: T.gold, letterSpacing: '-0.03em', marginTop: '4px' }}>
                {hasIncome ? fmt(netWorth) : 'Not Calculated Yet'}
              </div>
            </div>
            {hasIncome && (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: T.sage, 
                background: theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
                padding: '4px 10px', 
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <TrendingUp size={12} /> +12.4%
              </span>
            )}
          </div>

          {/* Sparkline line trend graph */}
          <div style={{ width: '100%', height: '40px', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.gold} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={T.gold} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={T.gold} strokeWidth={2} fillOpacity={1} fill="url(#sparklineGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* KPI 1: Total Assets */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Landmark size={18} style={{ color: T.sky }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.sage }}>+8.2%</span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Assets
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--fn)' }}>
              {cmpct(totalAssets)}
            </div>
          </div>
        </div>

        {/* KPI 2: Monthly Income */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Briefcase size={18} style={{ color: T.goldMid }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.sage }}>+6.5%</span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Monthly Income
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--fn)' }}>
              {fmt(monthlyIncome)}
            </div>
          </div>
        </div>

        {/* KPI 3: Monthly Investments */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Coins size={18} style={{ color: T.gold }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.sage }}>+10.2%</span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Monthly Invest
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--fn)' }}>
              {fmt(monthlyInvestments)}
            </div>
          </div>
        </div>

        {/* KPI 4: Emergency Reserve */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Shield size={18} style={{ color: T.rose }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.sage }}>+4.1%</span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Emergency Buffer
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--fn)' }}>
              {fmt(emergencyReserve)}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: CHARTS */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.4fr 1fr', 
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Net Worth Growth Interactive Area Chart */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                Long-Term Projection
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                Net Worth Growth
              </h3>
            </div>
            
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-muted)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              {['1M', '6M', '1Y', '5Y'].map(f => (
                <button
                  key={f}
                  onClick={() => setGrowthFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: growthFilter === f ? 'var(--bg-card)' : 'transparent',
                    color: growthFilter === f ? T.gold : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: growthFilter === f ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '220px', flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.gold} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={T.gold} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} stroke="var(--text-faint)" tickLine={false} />
                <YAxis tickFormatter={v => formatCompact(v, currency)} fontSize={10} stroke="var(--text-faint)" tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={v => [fmt(v), 'Net Worth']} />
                <Area type="monotone" dataKey="value" stroke={T.gold} strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Donut Chart with expanded hover slices & legend */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              Asset Split
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', marginBottom: '20px' }}>
              Asset Allocation
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, position: 'relative', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                  onMouseLeave={() => setActivePieIndex(-1)}
                  onClick={(data, idx) => onPieClick(data, idx)}
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={v => [fmt(v), 'Allocation']} />
              </PieChart>
            </ResponsiveContainer>

            {/* Portfolio Value in center of chart */}
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Portfolio Value
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--fn)' }}>
                {fmt(salaryAmount * 24)}
              </div>
            </div>
          </div>

          {/* Right Side Allocation Legend showing absolute value & percentage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            {assetAllocationData.map(item => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text)', marginRight: '6px' }}>{fmt(item.value)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: COMPARISON CHART & HEALTH SCORE */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.4fr 1fr', 
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Income vs Expenses side-by-side BarChart */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              Budget Split
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', marginBottom: '20px' }}>
              Income vs Expenses
            </h3>
          </div>

          <div style={{ width: '100%', height: '200px', flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpensesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={6}>
                <XAxis dataKey="name" fontSize={10} stroke="var(--text-faint)" tickLine={false} />
                <YAxis tickFormatter={v => formatCompact(v, currency)} fontSize={10} stroke="var(--text-faint)" tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={v => [fmt(v), '']} />
                <Bar dataKey="Income" fill={T.sky} radius={[6, 6, 0, 0]} maxBarSize={18} />
                <Bar dataKey="Expenses" fill={T.rose} radius={[6, 6, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score visual gauge */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              Financial Index
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              Financial Health Score
            </h3>
          </div>

          {/* Visual Gauge Component */}
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>

            {/* Score Centered Label */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', fontFamily: 'var(--fn)' }}>
                {health.value}
              </div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                / 100 Score
              </div>
            </div>
          </div>

          {/* Health Index Rating */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ 
              fontSize: '0.82rem', 
              fontWeight: 800, 
              color: scoreColor,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              {health.label}
            </span>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 12px', lineHeight: 1.4 }}>
              {health.tips[0]}
            </p>
          </div>
        </div>
      </div>

      {/* ROW 4: GOAL TRACKING */}
      <div className="apple-card" style={{ marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
            Wealth Milestones
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', marginBottom: '20px' }}>
            Financial Goals
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {goalsData.map(goal => {
            const currentSave = goal.target * (goal.progress / 100);
            return (
              <div key={goal.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '10px', 
                      background: `${goal.color}15`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: goal.color
                    }}>
                      <Target size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{goal.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Target: {fmt(goal.target)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{goal.progress}%</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Saved: {cmpct(currentSave)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${goal.progress}%`, 
                      height: '100%', 
                      background: goal.color, 
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 5: RECENT ACTIVITY & MOTIVATION INDICES GRID */}
      <div 
        className={isMobile ? 'mobile-stack' : ''} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr', 
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Row 5: Recent Activity (Timeline Card) */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              Transaction Logs
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              Recent Activity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: '17px', 
              top: '8px', 
              bottom: '8px', 
              width: '1px', 
              background: 'var(--border)' 
            }} />

            {activitiesData.map(activity => (
              <div key={activity.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-card)', 
                  border: '1.5px solid var(--border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                      {activity.title}
                    </h5>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>{activity.time}</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    {activity.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Motivation Indices Card */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
              System Indicators
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px', marginBottom: '20px' }}>
              Motivation Indices
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            
            {/* Index 1: Emergency Fund Coverage */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Emergency Fund Covers</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Target: 6.0 Months</div>
              </div>
              <strong style={{ fontSize: '0.88rem', color: T.rose, fontFamily: 'monospace' }}>
                {emergencyFundMonthRatio}
              </strong>
            </div>

            {/* Index 2: Investment Consistency */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Investment Consistency</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Rolling 12-Month deposits</div>
              </div>
              <strong style={{ fontSize: '0.88rem', color: T.gold, fontFamily: 'monospace' }}>
                {consistencyRate}%
              </strong>
            </div>

            {/* Index 3: Goal Completion Rate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Goal Completion Rate</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Average active milestone indices</div>
              </div>
              <strong style={{ fontSize: '0.88rem', color: T.sky, fontFamily: 'monospace' }}>
                {milestonesAverageProgress}%
              </strong>
            </div>

            {/* Index 4: Projected Corpus at Age 45 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Projected Corpus @ Age 45</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>SIP compounding at 10.5% return</div>
              </div>
              <strong style={{ fontSize: '0.88rem', color: T.sage, fontFamily: 'monospace' }}>
                {cmpct(sipCompoundingValue)}
              </strong>
            </div>

          </div>
        </div>
      </div>

      {/* ROW 6: AI FINANCIAL INSIGHTS */}
      <div className="apple-card" style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
            Smart Recommendations
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
            AI Financial Insights
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          
          {/* Recommendation 1 */}
          <div style={{ 
            background: 'var(--bg-muted)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: T.sage }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Emergency fund can sustain 8 months</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              Your liquid reserve of {fmt(emergencyReserve)} covers 8.2 months of essential lifestyle expenses. Outstanding security margin.
            </p>
          </div>

          {/* Recommendation 2 */}
          <div style={{ 
            background: 'var(--bg-muted)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: T.gold }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Increase SIP by 5%</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              A minor 5% raise in monthly equity SIP boosts your 20-year projected dynasty corpus by {cmpct(1840000)}.
            </p>
          </div>

          {/* Recommendation 3 */}
          <div style={{ 
            background: 'var(--bg-muted)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: T.sage }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Debt ratio is healthy</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              Allocating {cmpct(monthlyInvestments * (snap.presets ? snap.presets.debt : 0.25))} to secure short-term debt instruments reduces target portfolio volatility by 14%.
            </p>
          </div>

          {/* Recommendation 4 */}
          <div style={{ 
            background: 'var(--bg-muted)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} style={{ color: T.sky }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Diversification score: 82%</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              Your asset spread across Equity, Debt, Gold and Cash is highly optimized. Crypto exposure is maintained within safe risk parameters (5%).
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Sheet Drawer for mobile slice taps */}
      <AnimatePresence>
        {bottomSheetSlice && (
          <div 
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }} 
            onClick={() => setBottomSheetSlice(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                background: 'var(--bg-card)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                width: '100%',
                maxWidth: '430px',
                padding: '24px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
                border: '1px solid var(--border)'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Grab handle */}
              <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: bottomSheetSlice.color }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{bottomSheetSlice.name} Allocation</h4>
              </div>
              
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allocated Capital</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: T.gold, fontFamily: 'var(--fn)', marginTop: '4px' }}>
                  {fmt(bottomSheetSlice.value)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                  Ratio: {bottomSheetSlice.percent}% of total portfolio value.
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                {bottomSheetSlice.name === 'Equity' && 'Consists of index fund SIPs, large-cap growth stocks, and mid-cap compounding shares.'}
                {bottomSheetSlice.name === 'Debt' && 'Consists of secure government bonds, short-term debt mutual funds, and fixed-deposit reserves.'}
                {bottomSheetSlice.name === 'Gold' && 'Consists of physical Sovereign Gold Bonds (SGB) and gold ETFs acting as core inflation hedge.'}
                {bottomSheetSlice.name === 'Cash' && 'Liquid cash reserves held in your primary high-yield savings accounts and emergency buffer.'}
                {bottomSheetSlice.name === 'Crypto' && 'Diversified risk exposure restricted to highly liquid tokens (BTC & ETH).'}
              </p>

              <button 
                className="btn-primary" 
                style={{ background: T.gold, borderRadius: '12px', width: '100%', padding: '12px' }}
                onClick={() => setBottomSheetSlice(null)}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}