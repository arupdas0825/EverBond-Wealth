import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, AreaChart, Area 
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  calculateFinancialSnapshot, calculateHealthScore, 
  formatCurrency, formatCompact, simulateGrowth, calculateGoalTimeline 
} from '../../utils/finance';
import { totalMilestoneContribution, requiredMonthlySaving, parseMilestoneDate } from '../../utils/milestones';
import { T } from '../../theme/tokens';
import { Card, StatCard } from '../common/Card';
import { FutureVerification } from '../welcome/FutureVerification';
import { 
  ShieldAlert, Heart, Users, Coins, Sparkles, Flame, UserCheck, 
  Crown, Lock, RefreshCw, Copy, Check, Link, ArrowRight, User, 
  Smartphone, Send, Key, Calendar, TrendingUp, Target, Milestone, 
  Shield, Award, Landmark, GraduationCap, Briefcase, ChevronRight,
  TrendingDown, PlusCircle, Compass, HelpCircle, BarChart3, Info
} from 'lucide-react';
import { Logo } from '../common/Logo';

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
    return [`${text}, ${name || 'Solo Builder'}`, emoji];
  } else if (stage === 'Committed') {
    return [`${text}, ${name} & ${partner2 || 'Partner'}`, `💑`];
  } else {
    return [`${text}, The Dynasty`, `👑`];
  }
}

export function Dashboard() {
  const { 
    partner1, 
    partner2, 
    stage, 
    region, 
    mode, 
    currency, 
    milestones, 
    getTotalSalary,
    partnerLinked,
    partnerAccepted,
    verificationStatus,
    invitationCode,
    partnerId,
    relationshipId,
    setVerificationState,
    setProfile,
    setStage,
    onboardingSingle,
    onboardingCommitted,
    onboardingMarried,
    goalTargets,
    setGoalTargets,
    addMilestone
  } = useFinanceStore();

  const theme = useFinanceStore(s => s.theme);

  // Invitation Modal Flow Local State
  const [localStep, setLocalStep] = useState(1);
  const [pName, setPName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [partnerEnteredCode, setPartnerEnteredCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const [isUpgradingStage, setIsUpgradingStage] = useState(false);
  const [selectedUpgradeStage, setSelectedUpgradeStage] = useState('Committed');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Interactive Widgets State
  const [simYearsSolo, setSimYearsSolo] = useState(15);
  const [simInvestSolo, setSimInvestSolo] = useState(25000);
  const [homeTargetCost, setHomeTargetCost] = useState(8000000);
  const [homeDownpaymentPct, setHomeDownpaymentPct] = useState(20);
  const [homeMonthlySavings, setHomeMonthlySavings] = useState(40000);
  const [weddingCost, setWeddingCost] = useState(2000000);
  const [weddingGuests, setWeddingGuests] = useState(150);

  // Sync invitation state on load
  useEffect(() => {
    if (invitationCode) {
      setGeneratedCode(invitationCode);
      if (partnerAccepted) {
        setLocalStep(7);
      } else if (partnerLinked) {
        setLocalStep(4);
      } else {
        setLocalStep(2);
      }
    } else {
      setLocalStep(1);
    }
  }, [invitationCode, partnerLinked, partnerAccepted]);

  const totalSalary = getTotalSalary();
  const mContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  const snap = useMemo(() => calculateFinancialSnapshot(totalSalary, mode), [totalSalary, mode]);
  const health = useMemo(() => calculateHealthScore(snap), [snap]);
  
  const fmt = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);
  const [greet, emoji] = greeting(stage, partner1, partner2);
  const scoreColor = health.value >= 75 ? T.sage : health.value >= 50 ? T.goldMid : T.rose;
  const deg = (health.value / 100) * 360;

  // Invitation Event Handlers
  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!pName.trim()) return;
    
    const prefix = stage === 'Married' ? 'EB-MRD' : 'EB-CPL';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalCode = `${prefix}-${code}`;
    
    setGeneratedCode(finalCode);
    setVerificationState({
      invitationCode: finalCode,
      partnerName: pName.trim(),
      partner2: pName.trim(),
      verificationStatus: 'awaiting'
    });
    setLocalStep(2);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePartnerSubmitCode = () => {
    if (partnerEnteredCode.trim().toUpperCase() !== generatedCode.toUpperCase()) {
      alert('Invalid security invitation code handshake sequence. Please verify.');
      return;
    }
    
    setVerificationState({
      partnerLinked: true,
      verificationStatus: 'connected'
    });
    setLocalStep(4);
  };

  const handlePartnerAccept = () => {
    setLocalStep(5);
    setIsLinking(true);
    setLinkingProgress(0);
    
    const interval = setInterval(() => {
      setLinkingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLinking(false);
          setLocalStep(6);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  const handleCompleteVerification = () => {
    setLocalStep(7);
  };

  const handleUnlockWorkspace = () => {
    setVerificationState({
      partnerAccepted: true,
      partnerLinked: true,
      verificationStatus: 'verified',
      partner2: partner2 || pName || 'Partner',
      partnerName: partner2 || pName || 'Partner',
      relationshipId: `REL-${Math.floor(100000 + Math.random() * 900000)}`,
      partnerId: `USR-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setIsInviteModalOpen(false);
  };

  const handleStageUpgrade = (targetStage) => {
    setStage(targetStage);
    setVerificationState({
      partnerAccepted: false,
      partnerLinked: false,
      verificationStatus: 'unverified',
      invitationCode: '',
      partner2: '',
      partnerName: ''
    });
    setIsUpgradingStage(false);
    setLocalStep(1);
    setPName('');
    setIsInviteModalOpen(true);
  };

  const createMockGoal = () => {
    addMilestone({
      name: 'Initial Sovereignty Asset',
      category: 'other',
      targetCost: 500000,
      monthlySaved: 5000,
      targetDate: '2028-12-31'
    });
  };

  // Reusable Shared Widgets
  const LifeJourneyWidget = () => {
    const steps = [
      { name: 'Single', icon: '⚡', color: T.sky, desc: 'Solo Autonomy' },
      { name: 'Committed', icon: '💑', color: '#D05C72', desc: 'Sync Ledger' },
      { name: 'Married', icon: '💍', color: T.goldMid, desc: 'Dynasty Shield' },
      { name: 'Freedom', icon: '🌿', color: T.sage, desc: 'Sovereignty' }
    ];

    const currentIdx = steps.findIndex(s => s.name === stage);
    
    return (
      <Card style={{ marginBottom: '24px', padding: '20px 24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Ecosystem Status</span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>Life Journey Navigation Blueprint</h4>
          </div>
          {stage === 'Single' && (
            <button 
              onClick={() => setIsUpgradingStage(true)}
              style={{ padding: '6px 14px', fontSize: '0.75rem', background: 'rgba(184, 144, 42, 0.08)', border: `1.5px solid ${T.goldBorder}`, color: T.gold, fontWeight: 700, cursor: 'pointer', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Heart size={12} /> Sync Partner Node
            </button>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 0', zIndex: 1 }}>
          <div style={{ position: 'absolute', left: '20px', right: '20px', height: '2px', background: 'var(--border-mid)', zIndex: -1 }} />
          <div style={{ position: 'absolute', left: '20px', right: `${100 - (Math.min(currentIdx, 2) / 2) * 100}%`, height: '2px', background: `linear-gradient(90deg, ${T.sky}, #D05C72, ${T.goldMid})`, zIndex: -1 }} />

          {steps.map((st, idx) => {
            const isActive = stage === st.name || (stage === 'Married' && st.name === 'Freedom' && false);
            const isPassed = idx < currentIdx;
            const isLocked = idx > currentIdx && st.name !== 'Freedom';
            
            return (
              <div key={st.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isActive ? st.color : 'var(--bg-card)',
                  border: `2px solid ${isActive ? st.color : isPassed ? T.sage : 'var(--border-str)'}`,
                  color: isActive ? '#fff' : isPassed ? T.sage : 'var(--text-faint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  boxShadow: isActive ? `0 0 12px ${st.color}45` : 'none',
                  transition: 'all 0.3s ease',
                  cursor: isLocked ? 'pointer' : 'default'
                }}
                onClick={() => isLocked && setIsUpgradingStage(true)}
                >
                  {isPassed ? '✓' : isLocked ? <Lock size={12} /> : st.icon}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 800 : 500, color: isActive ? 'var(--text)' : 'var(--text-faint)' }}>{st.name}</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const PremiumInsightsPanel = () => {
    const stageTips = {
      Single: [
        "⚡ Compounding Alert: Solo builders see personal ledgers compound 2x faster by shifting an extra 5% of monthly salary into highly aggressive assets.",
        "📊 Career Indexing: A 7% annual salary raise compounds your 20-year career wealth cap by an additional 1.8X. Preserve solo compounding anchors.",
        "🛡️ Sovereignty Vault: Your solo emergency buffer score is Excellent. Consider mapping milestone targets next to lock in core capital growth."
      ],
      Committed: [
        "💑 Dual-Income Synergy: Consolidating dual ledgers yields a 38% increase in unified safety vault resilience and cuts down mortgage ETA by 14 months.",
        "🏡 Target Deposit: Allocating 40,000 INR monthly compounds your Home Deposit pool 12% faster. Consider shifting guest margins to Home Fund.",
        "💍 Wedding Alignment: Setting consensus weight sliders on relationship timeline targets stabilizes risk profiles by balancing lifestyle and asset growth."
      ],
      Married: [
        "👑 Dynasty Resilience: Consolidated family net worth features an outstanding Emergency Shield coverage index, ensuring 18 months of security.",
        "🎓 Kid Compounding: Starting college allocations at age 1 compounds overall childhood education trusts by 3.2X by graduation. Maximize SIP speeds.",
        "🌅 Passive Sovereignty: Systematic 4% retirement withdrawals secure 125% of passive coverage index over essential needs. Family legacy remains robust."
      ]
    };

    return (
      <Card style={{ marginBottom: '24px', background: 'var(--bg-warm)', border: '1.5px solid var(--border-mid)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={16} style={{ color: T.gold }} />
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Premium Stage Insights</h4>
        </div>
        <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stageTips[stage].map((tip, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              <div style={{ color: T.goldMid, marginTop: '2px' }}>•</div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const PartnerStatusCard = () => {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-mid)',
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--sh-xs)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {partnerAccepted ? (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: stage === 'Married' ? T.gold : T.rose }}>Ecosystem Connection</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '8px' }}>
                Linked with {partner2 || 'Partner'}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{ color: T.sage }}>🟢 Connected</strong>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)',
                fontSize: '0.85rem',
                padding: '10px 20px',
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Users size={16} /> Manage Node Connection
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: stage === 'Married' ? T.gold : T.rose }}>Ecosystem Connection</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '12px' }}>
                Partner Status: <span style={{ color: T.rose }}>Not Connected</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Benefits unlocked after connecting:</span>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: T.sage }}>✓</span> Shared Goals
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: T.sage }}>✓</span> Joint Planning
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: T.sage }}>✓</span> Couple Dashboard
                  </span>
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                background: `linear-gradient(135deg, ${stage === 'Married' ? T.gold : T.rose} 0%, ${stage === 'Married' ? '#9e7b24' : '#a33b52'} 100%)`,
                boxShadow: 'var(--sh-sm)',
                fontSize: '0.85rem',
                padding: '12px 24px',
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '100px'
              }}
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Users size={16} /> Connect Partner
            </button>
          </div>
        )}
      </div>
    );
  };

  // 1. SINGLE WORKSPACE LAYOUT
  const renderSingleWorkspace = () => {
    const career5y = totalSalary * Math.pow(1.07, 5);
    const career10y = totalSalary * Math.pow(1.07, 10);
    const career20y = totalSalary * Math.pow(1.07, 20);

    const activeInvestments = snap.budget.investments;
    const compoundSolo = simulateGrowth(simInvestSolo, simYearsSolo, 10);

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Header Block */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="stage-badge single" style={{ background: T.sky, color: '#fff', padding: '3px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 }}>Single Stage</span>
              <span>· Personal Growth Engine</span>
            </div>
            <h1 className="page-title">Build Your Future With Confidence</h1>
            <p className="page-desc">Sovereign planning workspace calibrated for individual capital compounding.</p>
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: 'auto', background: `linear-gradient(135deg, ${T.sky} 0%, #205c96 100%)`, boxShadow: `0 6px 20px ${T.sky}30`, display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsUpgradingStage(true)}
          >
            <Heart size={16} /> Sync Partner Ledger
          </button>
        </div>

        {/* Common Widgets */}
        <LifeJourneyWidget />
        <PremiumInsightsPanel />

        {/* Bento Grid Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* Card 1: Net Worth and Income Overview */}
          <Card gold style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Net Worth Valuation</span>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'var(--text)', margin: '12px 0 6px' }}>
                {cmpct(snap.budget.emergency + mContribution * 36)}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: T.sage, fontWeight: 700 }}>
                <TrendingUp size={14} /> Compounding Compound Score: {health.value}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-mid)', paddingTop: '16px', marginTop: '20px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)' }}>Income Overview</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Solo Monthly Income</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>{cmpct(totalSalary)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Sovereign Compounding Cap</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: T.gold }}>{cmpct(activeInvestments)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Career Growth Tracker */}
          <Card>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Career Compounding</span>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Solo Raise Projection</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Estimated Raise Rate', value: '7.0% p.a.' },
                { label: 'Projected Monthly Salary (5Y)', value: fmt(career5y) },
                { label: 'Projected Monthly Salary (10Y)', value: fmt(career10y) },
                { label: 'Projected Monthly Salary (20Y)', value: fmt(career20y) }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid var(--border)' : 'none', paddingBottom: idx < 3 ? '10px' : '0' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <strong style={{ fontSize: '0.88rem', color: idx === 0 ? T.sky : 'var(--text)' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bento Grid Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* Card 3: Investment Simulation */}
          <Card>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Compound Sandbox</span>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Interactive Investment Simulator</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Monthly SIP Contribution</span>
                  <strong style={{ color: T.gold }}>{fmt(simInvestSolo)}</strong>
                </div>
                <input 
                  type="range" min={5000} max={100000} step={5000}
                  className="eb-slider"
                  value={simInvestSolo} 
                  onChange={e => setSimInvestSolo(parseInt(e.target.value))}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Simulation Duration</span>
                  <strong style={{ color: T.gold }}>{simYearsSolo} Years</strong>
                </div>
                <input 
                  type="range" min={5} max={40} step={1}
                  className="eb-slider"
                  value={simYearsSolo} 
                  onChange={e => setSimYearsSolo(parseInt(e.target.value))}
                />
              </div>

              <div style={{ background: 'var(--bg-warm)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Projected Value (@ 10% returns)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: T.goldMid, fontFamily: T.fontDisplay, marginTop: '4px' }}>
                  {fmt(compoundSolo.fv)}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4: Personal Goals & Empty States */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Target Indexing</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Personal Goals</h3>
            </div>

            {milestones.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', marginBottom: '12px' }}>🌱</span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Your Financial Journey Has Just Begun</h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '240px', marginBottom: '16px' }}>
                  No active milestones. Calibrate your first savings goal parameter.
                </p>
                <button 
                  onClick={createMockGoal}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '6px 16px', fontSize: '0.78rem', background: T.sky }}
                >
                  Create First Goal
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {milestones.slice(0, 3).map(m => {
                  const req = requiredMonthlySaving(m.targetCost, m.monthlySaved, m.targetDate);
                  return (
                    <div key={m.id} className="alloc-row" style={{ padding: '8px 0' }}>
                      <div className="alloc-name">
                        <span style={{ fontSize: '1.1rem' }}>🏁</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Target: {m.targetDate}</div>
                        </div>
                      </div>
                      <div className="alloc-amount" style={{ fontSize: '0.85rem' }}>{fmt(req)} / mo</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Locked SaaS Previews */}
        <div style={{ marginTop: '24px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', display: 'block', marginBottom: '12px' }}>🔒 Ecosystem Previews</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { title: '🔒 Couple Dashboard', desc: 'Consolidate multiple ledgers securely.', col: '#D05C72' },
              { title: '🔒 Shared Financial Goals', desc: 'Co-plan for weddings, homes, or travel.', col: T.rose },
              { title: '🔒 Family Wealth Center', desc: 'Orchestrate multi-generation legacy reserves.', col: T.goldMid }
            ].map((p, idx) => (
              <Card key={idx} style={{ position: 'relative', overflow: 'hidden', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: p.col }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{p.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.desc}</p>
                <div style={{ fontSize: '0.65rem', color: T.gold, fontWeight: 700, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your future journey awaits</div>
              </Card>
            ))}
          </div>
        </div>

      </motion.div>
    );
  };

  const renderCommittedWorkspace = () => {
    // Math checks for Home Fund
    const downpaymentTarget = homeTargetCost * (homeDownpaymentPct / 100);
    const monthsToHome = calculateGoalTimeline(homeMonthlySavings, downpaymentTarget, 8);
    const { p1Salary, p2Salary } = useFinanceStore();

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Header Block */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="stage-badge committed" style={{ background: '#D05C72', color: '#fff', padding: '3px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 }}>Committed Stage</span>
              <span>· Collaboration Workspace</span>
            </div>
            <h1 className="page-title">Plan Your Future Together</h1>
            <p className="page-desc">Shared ledgers mapped for dual-income compromises and romantic milestones.</p>
          </div>
        </div>

        {/* Common Widgets */}
        <LifeJourneyWidget />
        <PremiumInsightsPanel />

        {/* Redesigned Partner Connection Status Card */}
        <PartnerStatusCard />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Bento Grid Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Card 1: Personal Wealth and Shared Pool */}
            <Card style={{ position: 'relative' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose }}>Asset Segregation</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Personal Wealth Splits</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Your In-hand Salary', value: fmt(p1Salary || 100000) },
                  { label: `${partner2 || 'Partner'}'s Salary`, value: partnerAccepted ? fmt(p2Salary || 80000) : "Not Connected (🔒)" },
                  { label: 'Combined Income Pool', value: partnerAccepted ? fmt(totalSalary) : `${fmt(p1Salary || 100000)} (🔒 Solo)` },
                  { label: 'Consensual Savings Target', value: partnerAccepted ? fmt(snap.budget.investments) : `${fmt((p1Salary || 100000) * (snap.presets ? snap.presets.invest : 0.35))} (🔒 Solo)` }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid var(--border)' : 'none', paddingBottom: idx < 3 ? '10px' : '0' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                    <strong style={{ fontSize: '0.88rem', color: idx === 2 && partnerAccepted ? T.rose : 'var(--text)' }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card 2: Interactive Future Home Fund Simulator */}
            <Card>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose }}>Property Calibration</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Future Home Fund</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Home Value</span>
                    <strong style={{ color: T.rose }}>{cmpct(homeTargetCost)}</strong>
                  </div>
                  <input 
                    type="range" min={3000000} max={25000000} step={500000}
                    className="eb-slider"
                    value={homeTargetCost} 
                    onChange={e => setHomeTargetCost(parseInt(e.target.value))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-warm)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Downpayment (20%)</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{cmpct(downpaymentTarget)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-warm)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Months to target</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: T.rose, marginTop: '2px' }}>
                      {isFinite(monthsToHome) ? `${monthsToHome} mo` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bento Grid Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Card 3: Marriage Planning Bento */}
            <Card>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose }}>Lifestyle Strategy</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Marriage Budget Calibration</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Wedding Budget Cap</span>
                    <strong style={{ color: T.rose }}>{fmt(weddingCost)}</strong>
                  </div>
                  <input 
                    type="range" min={500000} max={6000000} step={100000}
                    className="eb-slider"
                    value={weddingCost}
                    onChange={e => setWeddingCost(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Guest Volume Limit</span>
                    <strong style={{ color: T.rose }}>{weddingGuests} Guests</strong>
                  </div>
                  <input 
                    type="range" min={50} max={500} step={10}
                    className="eb-slider"
                    value={weddingGuests}
                    onChange={e => setWeddingGuests(parseInt(e.target.value))}
                  />
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  *Calculated averages allocate approx. {fmt(weddingCost / weddingGuests)} per guest package inclusive of banquet reserves.
                </div>
              </div>
            </Card>

            {/* Card 4: Relationship Timeline */}
            <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose }}>Anniversary Calibration</span>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Relationship Timeline</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, paddingLeft: '12px', position: 'relative', marginTop: '10px', filter: !partnerAccepted ? 'blur(1.5px)' : 'none', opacity: !partnerAccepted ? 0.6 : 1 }}>
                <div style={{ position: 'absolute', left: '4px', top: '8px', bottom: '8px', width: '1.5px', background: T.rose }} />

                {[
                  { label: 'Sovereign Ledger Synced', date: 'Active Consensus', ok: true },
                  { label: 'First Shared Goal Acquired', date: 'Projected 2026', ok: milestones.length > 0 && partnerAccepted },
                  { label: 'Future Home Deposit Met', date: `Projected in ${isFinite(monthsToHome) ? Math.ceil(monthsToHome/12) : 3} Years`, ok: false }
                ].map((node, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '16px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-16px',
                      top: '4px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: node.ok ? T.rose : 'var(--bg-muted)',
                      border: `1.5px solid ${node.ok ? T.rose : 'var(--border-str)'}`
                    }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: node.ok ? 'var(--text)' : 'var(--text-faint)' }}>{node.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{node.date}</div>
                  </div>
                ))}
              </div>
              {!partnerAccepted && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: 'var(--r-lg)', zIndex: 10 }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', boxShadow: 'var(--sh-sm)', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>🔒 Shared Timeline Sync Requires Partner Connection</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    );
  };

  // 3. MARRIED WORKSPACE LAYOUT
  const renderMarriedWorkspace = () => {
    // Dynamic forecasts
    const annualContrib = snap.budget.investments * 12;
    const rPct = snap.blendedReturn * 100;
    
    // Child education projection age 1 to 18
    const childCorpus18y = simulateGrowth(snap.goalSplit.child, 18, 10).fv;

    // Retirement indicators
    const retirementGoal = goalTargets.retirement || 20000000;
    const systematicRetireVal = retirementGoal * 0.04 / 12;
    const passiveCoveragePct = Math.round((systematicRetireVal / Math.max(snap.budget.needs, 1)) * 100);

    // Dynamic 30-year projections data source
    const projections = simulateGrowth(snap.budget.investments, 30, rPct).dataPoints;

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Header Block */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="stage-badge married" style={{ background: T.goldMid, color: '#fff', padding: '3px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 }}>Married Dynasty</span>
              <span>· Family Legacy Shield</span>
            </div>
            <h1 className="page-title">Grow Wealth As A Family</h1>
            <p className="page-desc">Consolidated multi-locker portfolios structured for trust allocations and retirement exit caps.</p>
          </div>
        </div>

        {/* Common Widgets */}
        <LifeJourneyWidget />
        <PremiumInsightsPanel />

        {/* Redesigned Partner Connection Status Card */}
        <PartnerStatusCard />

        {/* Bento Grid Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* Card 1: Family Net Worth Consolidated Ledger */}
          <Card gold style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Consolidated Family Net Worth</span>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', fontWeight: 700, color: 'var(--text)', margin: '12px 0 6px' }}>
                {cmpct(5000000 + mContribution * 48)}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: T.sage, fontWeight: 700 }}>
                <Shield size={14} style={{ color: T.sage }} /> Multi-Generational Trust Lock Active
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-mid)', paddingTop: '16px', marginTop: '20px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)' }}>Family Ledger Metrics</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Combined Salaries</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{cmpct(totalSalary)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Emergency Vault</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{cmpct(snap.budget.emergency)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Child SIP rate</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: T.gold }}>{cmpct(snap.goalSplit.child)}</div>
                </div>
              </div>
            </div>

            {!partnerAccepted && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(2.5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: 'var(--r-lg)', zIndex: 10 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', boxShadow: 'var(--sh-sm)', maxWidth: '280px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>🔒 Combined Wealth View Locked</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Connect your partner to unlock consolidated family net worth ledger.</span>
                </div>
              </div>
            )}
          </Card>

          {/* Card 2: Child Education Planning trust */}
          <Card style={{ position: 'relative' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Generational Launchpad</span>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Child Education Trust</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Education Fund</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{fmt(goalTargets.child || 5000000)}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dynamic Monthly Allocation</span>
                <strong style={{ fontSize: '0.88rem', color: T.gold }}>{fmt(snap.goalSplit.child)}</strong>
              </div>

              <div style={{ background: 'var(--bg-warm)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Projected Value at Age 18 (@ 10% returns)</span>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: T.goldMid, fontFamily: T.fontDisplay, marginTop: '4px' }}>
                  {fmt(childCorpus18y)}
                </div>
              </div>
            </div>

            {!partnerAccepted && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(2.5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: 'var(--r-lg)', zIndex: 10 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', boxShadow: 'var(--sh-sm)', maxWidth: '280px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>🔒 Family Sync Features Locked</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Connect your partner to unlock child planning trust sync.</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Bento Grid Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* Card 3: Retirement Strategy Widget */}
          <Card>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Autonomy Calibration</span>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>Retirement Strategy</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Corpus Target</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{fmt(retirementGoal)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Systematic Outflow (4%)</span>
                <strong style={{ fontSize: '0.88rem', color: T.sage }}>{fmt(systematicRetireVal)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passive Coverage index</span>
                <strong style={{ fontSize: '1.15rem', color: T.sage, fontFamily: T.fontDisplay }}>{passiveCoveragePct}%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--onb-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(passiveCoveragePct, 100)}%`, height: '100%', background: T.sage }} />
              </div>
              
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', lineHeight: 1.35 }}>
                *A coverage index exceeding 100% means systematically withdrawn interest funds family needs without touching principal core.
              </div>
            </div>
          </Card>

          {/* Card 4: Multi-Decade Wealth Forecasting Chart */}
          <Card>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Dynamic Foresight</span>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', marginBottom: '16px' }}>30-Year Wealth Forecast</h3>
            
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="year" fontSize={10} stroke="var(--text-faint)" />
                  <YAxis tickFormatter={v => formatCompact(v, currency)} fontSize={10} stroke="var(--text-faint)" />
                  <Tooltip contentStyle={TT} formatter={v => [fmt(v), 'Projected Wealth']} />
                  <defs>
                    <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.goldMid} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={T.goldMid} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="corpus" stroke={T.gold} strokeWidth={2} fillOpacity={1} fill="url(#colorCorpus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

      </motion.div>
    );
  };

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      
      {/* INVITATION & CONNECTION MODAL */}
      {isInviteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(5, 5, 8, 0.65)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '36px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              boxShadow: 'var(--sh-lg)',
              borderRadius: '24px',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsInviteModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-faint)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>

            {/* Status chip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {localStep < 4 ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'var(--gold-pale)',
                  border: '1px solid var(--gold-border)',
                  color: T.gold,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟡 Awaiting Partner Acceptance
                </div>
              ) : localStep < 7 ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'rgba(78, 155, 120, 0.1)',
                  border: `1px solid ${T.sage}40`,
                  color: T.sage,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟢 Partner Connected
                </div>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'rgba(78, 155, 120, 0.1)',
                  border: `1px solid ${T.sage}40`,
                  color: T.sage,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🟢 Couple Verified
                </div>
              )}
            </div>

            {/* Lock messages */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: stage === 'Married' ? 'var(--gold-pale)' : 'var(--rose-lt)',
                color: stage === 'Married' ? T.gold : T.rose,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: 'var(--sh-xs)'
              }}>
                <Lock size={24} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Secure Partnership Sync
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto' }}>
                {stage === 'Married' 
                  ? "Connect with your partner to unlock Combined Family Planning." 
                  : "Connect with your partner to unlock Couple Planning."}
              </p>
            </div>

            {/* Progress Bullet Steps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', background: 'var(--bg-warm)', padding: '8px 12px', borderRadius: '12px', border: '1.5px solid var(--border)', marginBottom: '28px' }}>
              {[
                { s: 1, label: 'Details' },
                { s: 2, label: 'Code' },
                { s: 3, label: 'Enter' },
                { s: 4, label: 'Accept' },
                { s: 5, label: 'Link' },
                { s: 6, label: 'Verify' },
                { s: 7, label: 'Unlock' }
              ].map(step => (
                <div key={step.s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: localStep === step.s ? T.gold : localStep > step.s ? T.sage : 'var(--bg-muted)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    boxShadow: localStep === step.s ? `0 0 8px ${T.gold}50` : 'none'
                  }}>
                    {localStep > step.s ? '✓' : step.s}
                  </div>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: localStep === step.s ? 'var(--text)' : 'var(--text-faint)', textTransform: 'uppercase' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Contents */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PARTNER DETAILS */}
              {localStep === 1 && (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleGenerateCode}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Partner's Name
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow"
                      placeholder="Enter partner name..."
                      value={pName}
                      onChange={e => setPName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Anniversary Date (Optional)
                      </label>
                      <input
                        type="date"
                        className="onb-input-glow"
                        value={anniversary}
                        onChange={e => setAnniversary(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Partner ID (Optional)
                      </label>
                      <input
                        type="text"
                        className="onb-input-glow"
                        placeholder="E.g., EB-USR-928"
                        value={pEmail}
                        onChange={e => setPEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                      boxShadow: 'var(--sh-gold)',
                      marginTop: '8px'
                    }}
                    disabled={!pName.trim()}
                  >
                    Generate Invitation Code &amp; Proceed
                  </button>
                </motion.form>
              )}

              {/* STEP 2: GENERATED CODE DISPLAY */}
              {localStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
                    Provide this invitation key to your partner. They must enter it on their terminal to link your portfolios.
                  </p>

                  <div style={{
                    background: 'rgba(184, 144, 42, 0.05)',
                    border: '1.5px dashed var(--gold-border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    boxShadow: 'var(--sh-xs)',
                    width: '100%',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1.65rem',
                      fontWeight: 700,
                      color: T.gold,
                      letterSpacing: '0.08em'
                    }}>
                      {generatedCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-mid)',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: copied ? T.sage : 'var(--text)',
                        boxShadow: 'var(--sh-xs)'
                      }}
                      title="Copy invitation code"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)',
                      border: '1px solid var(--gold-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onClick={() => setLocalStep(3)}
                  >
                    <Send size={16} /> Simulate Partner Entry Link
                  </button>
                </motion.div>
              )}

              {/* STEP 3: MOCK PARTNER CODE ENTRY */}
              {localStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    border: '1.5px solid var(--border-mid)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    fontFamily: 'monospace',
                    color: '#62ca98',
                    fontSize: '0.72rem',
                    textAlign: 'left'
                  }}>
                    <div>&gt; INITIATING PARTNER LEDGER WORKSPACE SIMULATOR...</div>
                    <div style={{ color: 'var(--text-faint)', marginTop: '4px' }}>&gt; Authenticating partner node... SUCCESS</div>
                    <div style={{ color: T.gold }}>&gt; Enter the generated invitation packet code to establish secure handshake:</div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Partner Invitation Key (EB-XXX-XXXXX)
                    </label>
                    <input
                      type="text"
                      className="onb-input-glow"
                      placeholder="Paste EB-... code here"
                      value={partnerEnteredCode}
                      onChange={e => setPartnerEnteredCode(e.target.value.toUpperCase())}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        onClick={() => setPartnerEnteredCode(generatedCode)}
                        style={{ background: 'none', border: 'none', color: T.gold, fontSize: '0.65rem', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Auto-fill code for simulation
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ background: T.sage }}
                    onClick={handlePartnerSubmitCode}
                    disabled={!partnerEnteredCode.trim()}
                  >
                    Establish Secure Handshake Connection
                  </button>
                </motion.div>
              )}

              {/* STEP 4: MOCK PARTNER ACCEPTANCE */}
              {localStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(78, 155, 120, 0.1)', color: T.sage, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <UserCheck size={20} />
                  </div>
                  
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    Handshake Link Accepted
                  </h4>
                  
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '20px' }}>
                    Your partner ({partner2 || pName || 'Beloved'}) has decrypted the packet. Click below to execute the cryptographically signed linkage.
                  </p>

                  <button
                    className="btn-primary"
                    style={{ background: T.sage, width: '100%' }}
                    onClick={handlePartnerAccept}
                  >
                    Accept Handshake &amp; Link Accounts
                  </button>
                </motion.div>
              )}

              {/* STEP 5: LEDGER SYNCHRONIZATION */}
              {localStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{ position: 'relative', width: '160px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-muted)',
                      border: '1.5px solid var(--border-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      YOU
                    </div>
                    
                    <div style={{ flex: 1, height: '2px', background: `linear-gradient(90deg, ${T.gold}, ${T.sage})`, position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '10px',
                        height: '100%',
                        background: '#fff',
                        boxShadow: '0 0 10px #fff',
                        animation: 'laserSweep 1s linear infinite'
                      }} />
                    </div>

                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-muted)',
                      border: '1.5px solid var(--border-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      PTNR
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Synchronizing Portfolios
                  </h4>

                  <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: T.gold, marginBottom: '6px' }}>
                      <span>Compiling Ledger Matrix...</span>
                      <span>{linkingProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--onb-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${linkingProgress}%`, height: '100%', background: T.gold, transition: 'width 0.2s ease' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                    Unifying combined risk parameters and SIP asset split index...
                  </div>
                </motion.div>
              )}

              {/* STEP 6: FUTURE VERIFICATION PREVIEW */}
              {localStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '12px', textAlign: 'center' }}>
                    Decentralized ledger consolidated. Authenticate dynamic consensus to map estate targets:
                  </p>

                  <FutureVerification />

                  <button
                    className="btn-primary"
                    style={{
                      background: `linear-gradient(135deg, ${T.sage} 0%, #3e8e68 100%)`,
                      boxShadow: '0 6px 20px rgba(78, 155, 120, 0.3)',
                      marginTop: '16px'
                    }}
                    onClick={handleCompleteVerification}
                  >
                    Finalize Connection &amp; Authenticate
                  </button>
                </motion.div>
              )}

              {/* STEP 7: ALL SYSTEMS ACTIVE */}
              {localStep === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{
                    display: 'inline-flex',
                    padding: '16px',
                    borderRadius: '50%',
                    background: 'rgba(78, 155, 120, 0.1)',
                    border: `1.5px solid ${T.sage}`,
                    color: T.sage,
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <UserCheck size={36} />
                    <Sparkles size={16} style={{ position: 'absolute', top: 0, right: 0, color: T.gold }} className="animate-bounce" />
                  </div>

                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Handshake Complete!
                  </h3>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px', maxWidth: '400px' }}>
                    Ledgers successfully synchronized. Multi-locker system and dynamic SIP profiles are now active.
                  </p>

                  <div style={{
                    background: 'var(--bg-warm)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    width: '100%',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Status:</span>
                      <strong style={{ color: T.sage }}>🟢 Couple Verified</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-faint)' }}>Partner:</span>
                      <strong style={{ color: 'var(--text)' }}>{partner2 || pName || 'Linked Partner'}</strong>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #1c1a16 0%, #111 100%)',
                      border: '1px solid var(--gold-border)',
                      boxShadow: 'var(--sh-gold)',
                      width: '100%'
                    }}
                    onClick={handleUnlockWorkspace}
                  >
                    Enter Dynamic Shared Workspace →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* DYNAMIC BACKDROP STYLING */}
      <div>
        
        {/* Render Workspace Conditionally based on Active Life Stage */}
        {stage === 'Single' && renderSingleWorkspace()}
        {stage === 'Committed' && renderCommittedWorkspace()}
        {stage === 'Married' && renderMarriedWorkspace()}

      </div>

      {/* DIALOG: SINGLE UPGRADE SELECTOR */}
      {isUpgradingStage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(5, 5, 8, 0.55)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="liquid-glass" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: 'var(--bg-card)', position: 'relative' }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
              Secure Partnership Upgrade
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '24px', textAlign: 'center' }}>
              Ready to link financial ledgers? Choose your partnership stage to configure identity &amp; initiate cryptographic synchronization:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => setSelectedUpgradeStage('Committed')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedUpgradeStage === 'Committed' ? T.rose : 'var(--border)'}`,
                  background: selectedUpgradeStage === 'Committed' ? 'rgba(208, 92, 114, 0.05)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💑</span>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: selectedUpgradeStage === 'Committed' ? T.rose : 'var(--text)' }}>Committed Partners</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Consolidate dual portfolios with romantic lifestyle targets.</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedUpgradeStage('Married')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedUpgradeStage === 'Married' ? T.gold : 'var(--border)'}`,
                  background: selectedUpgradeStage === 'Married' ? 'rgba(184, 144, 42, 0.05)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💍</span>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: selectedUpgradeStage === 'Married' ? T.gold : 'var(--text)' }}>Family Dynasty</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Multi-generation estate reserves &amp; child launchpads.</div>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 16px' }}
                onClick={() => setIsUpgradingStage(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2, padding: '10px 16px', background: selectedUpgradeStage === 'Married' ? T.gold : T.rose }}
                onClick={() => handleStageUpgrade(selectedUpgradeStage)}
              >
                Initiate Linkage Flow
              </button>
            </div>
            
            <button
              onClick={() => setIsUpgradingStage(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}