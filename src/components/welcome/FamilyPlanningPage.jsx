import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { 
  Crown, Sparkles, GraduationCap, Coins, Plus, Trash2, 
  ArrowUpRight, Lock, Key, ShieldCheck, FileText, 
  UserPlus, QrCode, ToggleLeft, ToggleRight, Info, Check, CheckCircle2, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatCompact } from '../../utils/finance';

export function FamilyPlanningPage({ setPage }) {
  const [dynastyConsentChecked, setDynastyConsentChecked] = useState(false);
  const { 
    partner1, 
    partner2, 
    currency, 
    getTotalSalary, 
    partnerAccepted,
    relationshipStage,
    stage,
    partnerLinked
  } = useFinanceStore();
  
  const total = getTotalSalary();
  const isLinked = partnerLinked || partnerAccepted;
  const currentStage = (relationshipStage || stage || 'Single').toLowerCase();
  
  if (!isLinked) {
    return (
      <div className="fade-in" style={{ paddingBottom: '40px', maxWidth: '560px', margin: '40px auto' }}>
        <Card style={{ padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
          {/* Animated background glows */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle at center, rgba(184, 144, 42, 0.04) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--gold-pale)',
              color: T.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: `1px solid ${T.gold}30`
            }}>
              <Crown size={24} style={{ color: T.gold }} />
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              Create a Family Dynasty Workspace
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Coordinate multi-generational planning across trusted family members.
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            {[
              "Shared family wealth planning",
              "Legacy tracking",
              "Family milestone management",
              "Role-based visibility"
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text)' }}>
                <span style={{ color: T.gold, fontWeight: 'bold' }}>✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <input
              type="checkbox"
              id="dynasty-consent-check"
              checked={dynastyConsentChecked}
              onChange={(e) => setDynastyConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="dynasty-consent-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I understand the Family Dynasty workspace structure.
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setPage('partner')}
              disabled={!dynastyConsentChecked}
              className="onb-btn-continue"
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '100px',
                fontSize: '0.85rem',
                opacity: dynastyConsentChecked ? 1 : 0.6
              }}
            >
              Continue
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              Back
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // States
  const [compoundingYears, setCompoundingYears] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(2500);
  const [expectedYield, setExpectedYield] = useState(8.5);
  const [initialCorpus, setInitialCorpus] = useState(250000);

  const [children, setChildren] = useState([
    { id: 1, name: 'Aarav', age: 14, allocation: 40, milestone: 'Graduation', locked: true, releaseAge: 25 },
    { id: 2, name: 'Ananya', age: 11, allocation: 40, milestone: 'Age Threshold', locked: true, releaseAge: 25 },
    { id: 3, name: 'Grandchildren Trust', age: 0, allocation: 20, milestone: 'Dynastic Multi-gen', locked: true, releaseAge: 35 }
  ]);

  const [selectedChildId, setSelectedChildId] = useState(1);
  const [newHeirName, setNewHeirName] = useState('');
  const [newHeirAge, setNewHeirAge] = useState(5);
  const [newHeirAllocation, setNewHeirAllocation] = useState(20);

  // Document Vault State
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Last Will & Testament.pdf', type: 'Will', size: '2.4 MB', date: '2026-05-12', signed: true },
    { id: 2, name: 'Family Living Trust Agreement.pdf', type: 'Trust', size: '4.8 MB', date: '2026-06-01', signed: true },
    { id: 3, name: 'Asset Distribution Ledger.xlsx', type: 'Ledger', size: '1.2 MB', date: '2026-06-08', signed: false },
    { id: 4, name: 'Multi-Gen Power of Attorney.pdf', type: 'POA', size: '3.1 MB', date: '2026-04-20', signed: true }
  ]);

  // Governance settings
  const [requireDualSignature, setRequireDualSignature] = useState(true);
  const [releaseTriggers, setReleaseTriggers] = useState({
    college: true,
    marriage: false,
    firstHome: true,
    age25: true
  });

  // QR Invite simulator
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInviteRole, setQrInviteRole] = useState('successor'); // 'successor' | 'co-trustee'
  const [invitationCode, setInvitationCode] = useState('');

  const generateCode = () => {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setInvitationCode(`EVDN-${qrInviteRole.toUpperCase()}-${randomHex}`);
  };

  useEffect(() => {
    generateCode();
  }, [qrInviteRole]);

  // Dynastic compounder projection math
  const calculateProjection = () => {
    const P = initialCorpus;
    const PMT = monthlyContribution;
    const r = expectedYield / 100;
    const n = 12;
    const t = compoundingYears;

    // Compound Formula: P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
    
    const futureValueInitial = P * compoundFactor;
    const futureValueAnnuity = ratePerPeriod > 0 
      ? PMT * ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod)
      : PMT * totalPeriods;

    return futureValueInitial + futureValueAnnuity;
  };

  const projectedValue = calculateProjection();

  // Allocation sliders normalization
  const handleAllocationChange = (id, newVal) => {
    const parsedVal = Math.min(100, Math.max(0, parseInt(newVal) || 0));
    setChildren(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, allocation: parsedVal } : c);
      
      // Keep sum close to 100% or just let it adjust
      const currentSum = updated.reduce((sum, curr) => sum + curr.allocation, 0);
      if (currentSum === 0) return updated;

      // Re-scale other nodes to sum to 100
      const activeIdx = updated.findIndex(c => c.id === id);
      const remainingWeight = 100 - parsedVal;
      const otherSum = updated.reduce((sum, curr, idx) => idx !== activeIdx ? sum + curr.allocation : sum, 0);

      if (otherSum === 0) {
        // distribute evenly
        const remainderCount = updated.length - 1;
        return updated.map((c, idx) => idx !== activeIdx ? { ...c, allocation: Math.round(remainingWeight / remainderCount) } : c);
      }

      return updated.map((c, idx) => {
        if (idx === activeIdx) return c;
        const scale = remainingWeight / otherSum;
        return { ...c, allocation: Math.round(c.allocation * scale) };
      });
    });
  };

  const addHeirNode = () => {
    if (!newHeirName.trim()) return;
    const newId = Date.now();
    const currentCount = children.length;
    
    // Distribute allocation evenly including new child
    const targetAllot = Math.round(100 / (currentCount + 1));
    const normalizedOldAllot = Math.round((100 - targetAllot) / currentCount);

    const updatedChildren = children.map(c => ({ ...c, allocation: normalizedOldAllot }));
    
    setChildren([
      ...updatedChildren,
      {
        id: newId,
        name: newHeirName.trim(),
        age: parseInt(newHeirAge) || 10,
        allocation: targetAllot,
        milestone: 'Age Threshold',
        locked: true,
        releaseAge: 25
      }
    ]);
    setSelectedChildId(newId);
    setNewHeirName('');
  };

  const removeHeirNode = (id) => {
    if (children.length <= 1) return; // Must have at least one heir
    const removedChild = children.find(c => c.id === id);
    const updated = children.filter(c => c.id !== id);
    const addedAllot = Math.round(removedChild.allocation / updated.length);

    setChildren(updated.map((c, idx) => ({ 
      ...c, 
      allocation: idx === 0 
        ? c.allocation + (100 - updated.reduce((s, curr) => s + curr.allocation, 0) - removedChild.allocation) + addedAllot
        : c.allocation + addedAllot
    })));

    if (selectedChildId === id) {
      setSelectedChildId(updated[0].id);
    }
  };

  const toggleDocumentSign = (id) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, signed: !doc.signed } : doc));
  };

  const totalAllocation = children.reduce((sum, c) => sum + c.allocation, 0);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const fmt = val => formatCurrency(val, currency);
  const cmpct = val => formatCompact(val, currency);

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="page-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="stage-badge married" style={{ background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`, color: '#fff' }}>Family Dynasty</span>
            <span style={{ color: 'var(--text-muted)' }}>· Multi-Generational Asset Command</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Dynasty <em>Command</em></h1>
          <p className="page-desc" style={{ color: 'var(--text-muted)' }}>
            Oversee trust fund allocations, successors inheritance metrics, secure vaults, and dynamic rule governance.
          </p>
        </div>
        
        {/* Apple Switch for Simulated Link State */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-muted)',
          padding: '6px 14px',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Simulate Active Partner:</span>
          <button 
            onClick={() => setIsSimulatedLinked(!isSimulatedLinked)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isSimulatedLinked ? T.gold : 'var(--text-faint)'
            }}
          >
            {isSimulatedLinked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
      </div>

      {/* Lock Banner if neither actual nor simulated is accepted */}
      {!isSimulatedLinked && (
        <div style={{
          background: 'rgba(184, 144, 42, 0.06)',
          border: `1.5px dashed ${T.gold}50`,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Lock size={20} style={{ color: T.gold }} />
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                Collaborative Dynasty Dashboard Restricted
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Invite a co-trustee or partner to lock in multi-generational governance rules and verify asset ledger changes.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.75rem', padding: '8px 16px', width: 'auto', borderRadius: '12px' }}
              onClick={() => setShowQRModal(true)}
            >
              <UserPlus size={14} style={{ marginRight: '6px' }} /> Invite Co-Trustee
            </button>
            <button 
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.75rem', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer' }}
              onClick={() => setIsSimulatedLinked(true)}
            >
              Bypass Demo Lock
            </button>
          </div>
        </div>
      )}

      {/* Main Multi-Gen Dashboard Grid */}
      <div className="grid-2" style={{ gap: '24px', alignItems: 'stretch' }}>
        
        {/* SECTION 1: DYNASTIC COMPOUNDER & VISUAL ESTATE */}
        <Card gold={isSimulatedLinked} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="card-title" style={{ color: T.gold, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={15} /> Dynastic Compounder
              </div>
              <span style={{ fontSize: '0.7rem', background: 'var(--gold-pale)', color: T.gold, padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                Projected Estate
              </span>
            </div>
            <div className="card-heading" style={{ fontSize: '1.3rem' }}>Generational Wealth Vault Projections</div>
            <div className="card-sub" style={{ marginBottom: '20px' }}>Compounding assets dedicated for family legacy inheritance.</div>

            {/* Projection Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Initial Trust Fund Corpus</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(initialCorpus)}</span>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="2000000" 
                  step="50000"
                  value={initialCorpus} 
                  onChange={e => setInitialCorpus(Number(e.target.value))}
                  style={{ width: '100%', accentColor: T.gold }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Monthly Contribution to Legacy Fund</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(monthlyContribution)}/mo</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="15000" 
                  step="500"
                  value={monthlyContribution} 
                  onChange={e => setMonthlyContribution(Number(e.target.value))}
                  style={{ width: '100%', accentColor: T.gold }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    <span>Target Horizon</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{compoundingYears} Yrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    step="5"
                    value={compoundingYears} 
                    onChange={e => setCompoundingYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: T.gold }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    <span>Estimated Annual Yield</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{expectedYield}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="4" 
                    max="15" 
                    step="0.5"
                    value={expectedYield} 
                    onChange={e => setExpectedYield(Number(e.target.value))}
                    style={{ width: '100%', accentColor: T.gold }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Big Result Card */}
          <div style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            marginTop: '10px'
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em' }}>
              Projected Dynastic Wealth Corpus
            </span>
            <div style={{ fontFamily: 'var(--fn)', fontSize: '2.4rem', fontWeight: 700, color: T.gold, letterSpacing: '-0.03em', margin: '4px 0' }}>
              {fmt(projectedValue)}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Monthly investment compounding at {expectedYield}% annually over {compoundingYears} years.
            </p>
          </div>

          {!isSimulatedLinked && (
            <div className="glass-lock-screen" style={{ borderRadius: '24px' }}>
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Dynastic Trust Calculator</h4>
                <p className="lock-desc">Please simulate active partner link or verify status to enable trust compounding metrics.</p>
              </div>
            </div>
          )}
        </Card>

        {/* SECTION 2: INTERACTIVE FAMILY TREE BUILDER */}
        <Card style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: T.gold }} /> Visual Heir Mapping
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Total: {totalAllocation}%
            </span>
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>Interactive Dynasty Tree</div>
          <div className="card-sub" style={{ marginBottom: '16px' }}>Click nodes to define successor parameters or adjust split.</div>

          {/* Visual Heir Nodes Canvas */}
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)',
            border: '1px dashed var(--border)',
            borderRadius: '18px',
            padding: '16px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '220px',
            position: 'relative'
          }}>
            {/* Parent Node */}
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-muted) 0%, var(--bg) 100%)',
              border: `2px solid ${T.gold}`,
              borderRadius: '16px',
              padding: '10px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--sh-sm)',
              zIndex: 2
            }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                Co-Trustee Root Node
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                {partner1?.name || 'You'} &amp; {isSimulatedLinked ? (partner2?.name || 'Sophia') : 'Sophia (Pending)'}
              </div>
            </div>

            {/* Tree Branch SVG Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {/* Vertical trunk line */}
              <line x1="50%" y1="52px" x2="50%" y2="92px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              {/* Horizontal branch line */}
              <line x1="15%" y1="92px" x2="85%" y2="92px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              {/* Connector drops */}
              <line x1="15%" y1="92px" x2="15%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              <line x1="50%" y1="92px" x2="50%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              <line x1="85%" y1="92px" x2="85%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
            </svg>

            {/* Successor Nodes Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: '8px', marginTop: '36px', zIndex: 2 }}>
              {children.map(child => {
                const isSelected = child.id === selectedChildId;
                return (
                  <div 
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    style={{
                      background: isSelected 
                        ? (theme === 'dark' ? 'rgba(184, 144, 42, 0.12)' : 'rgba(184, 144, 42, 0.06)')
                        : 'var(--bg-muted)',
                      border: isSelected 
                        ? `2px solid ${T.gold}`
                        : '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${T.gold}15` : 'none'
                    }}
                  >
                    <GraduationCap size={15} style={{ color: isSelected ? T.gold : 'var(--text-faint)', marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {child.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isSelected ? T.gold : 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                      {child.allocation}% Split
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add Heir Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 0.6fr auto', gap: '6px', marginTop: '12px' }}>
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="text" 
              placeholder="Name..." 
              value={newHeirName} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirName(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="number" 
              placeholder="Age" 
              value={newHeirAge} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirAge(Number(e.target.value))}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="number" 
              placeholder="%" 
              value={newHeirAllocation} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirAllocation(Number(e.target.value))}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 12px', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={addHeirNode}
              disabled={!isSimulatedLinked}
            >
              <Plus size={14} />
            </button>
          </div>

          {!isSimulatedLinked && (
            <div className="glass-lock-screen" style={{ borderRadius: '24px' }}>
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Family Heir Node Map</h4>
                <p className="lock-desc">Please simulate active partner link or verify status to enable trust compounding metrics.</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Succession Sliders & Rules Section */}
      <div className="grid-2 mt-20" style={{ gap: '24px', alignItems: 'stretch' }}>
        
        {/* SUCCESSOR PLANNING DETAILS */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={15} style={{ color: T.gold }} /> Successor Legacy Parameters
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>Allocation for: {selectedChild.name}</div>
          <div className="card-sub" style={{ marginBottom: '18px' }}>Manage locking thresholds and trust fund payouts.</div>

          {/* Allocation control */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Estate Split Allocation</span>
              <span style={{ fontWeight: 800, color: T.gold }}>{selectedChild.allocation}%</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={selectedChild.allocation}
                disabled={!isSimulatedLinked}
                onChange={e => handleAllocationChange(selectedChild.id, e.target.value)}
                style={{ flexGrow: 1, accentColor: T.gold }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Normalized (Total 100%)</span>
            </div>
          </div>

          {/* Rules and Lock thresholds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
            <div style={{ 
              background: 'var(--bg-muted)', 
              borderRadius: '14px', 
              padding: '12px 16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Vesting Age Lock Trigger</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Release funds to heir upon reaching target age.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={selectedChild.releaseAge} 
                    disabled={!isSimulatedLinked}
                    onChange={e => {
                      const ageVal = Number(e.target.value);
                      setChildren(children.map(c => c.id === selectedChild.id ? { ...c, releaseAge: ageVal } : c));
                    }}
                    style={{ width: '45px', padding: '4px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Years Old</span>
                </div>
              </div>
            </div>

            {/* Custom Milestone Release Rule */}
            <div style={{ 
              background: 'var(--bg-muted)', 
              borderRadius: '14px', 
              padding: '12px 16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Milestone Payout Qualifier</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Additional trigger conditions for early partial releases.</div>
                </div>
                <select
                  value={selectedChild.milestone}
                  disabled={!isSimulatedLinked}
                  onChange={e => {
                    const mVal = e.target.value;
                    setChildren(children.map(c => c.id === selectedChild.id ? { ...c, milestone: mVal } : c));
                  }}
                  style={{
                    padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)'
                  }}
                >
                  <option value="Graduation">Graduation Day</option>
                  <option value="Marriage">Marriage Deed</option>
                  <option value="First Home">First Home purchase</option>
                  <option value="Age Threshold">Age Threshold Only</option>
                </select>
              </div>
            </div>

            {/* Warning if allocations don't equal 100 */}
            {totalAllocation !== 100 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: T.rose, fontSize: '0.72rem', marginTop: '4px' }}>
                <Info size={12} />
                <span>Legacy Distribution sum is currently {totalAllocation}%. We recommend balancing to 100%.</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.75rem', padding: '8px 16px', flexGrow: 1, borderRadius: '12px' }}
              onClick={() => alert(`Locked estate instructions for ${selectedChild.name} updated. Triggers registered.`)}
              disabled={!isSimulatedLinked}
            >
              Lock Instructions
            </button>
            <button 
              style={{ background: 'transparent', border: `1px solid var(--border)`, color: T.rose, fontSize: '0.75rem', padding: '8px 12px', borderRadius: '12px', cursor: isSimulatedLinked ? 'pointer' : 'default' }}
              onClick={() => removeHeirNode(selectedChild.id)}
              disabled={!isSimulatedLinked || children.length <= 1}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </Card>

        {/* ESTATE VAULT & GOVERNANCE RULES */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} style={{ color: T.gold }} /> Trust Governance &amp; Estate Vault
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>Dynamic Estate Ledger Rules</div>
          <div className="card-sub" style={{ marginBottom: '16px' }}>Secure storage of verified documents with dual trustee approvals.</div>

          {/* Governance Rules Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', background: 'var(--bg-warm)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} style={{ color: T.gold }} />
                <span>Require Dual-Parent Signatures</span>
              </div>
              <button 
                onClick={() => setRequireDualSignature(!requireDualSignature)}
                disabled={!isSimulatedLinked}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: requireDualSignature ? T.gold : 'var(--text-faint)' }}
              >
                {requireDualSignature ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
            </div>
          </div>

          {/* Secure Document List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Encrypted Documents ({documents.length})
            </span>
            {documents.map(doc => (
              <div key={doc.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-muted)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>
                      {doc.size} · Saved {doc.date}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => toggleDocumentSign(doc.id)}
                    disabled={!isSimulatedLinked}
                    style={{
                      background: doc.signed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: 'none',
                      color: doc.signed ? '#10b981' : '#ef4444',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: isSimulatedLinked ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {doc.signed ? <Check size={10} strokeWidth={3} /> : <Lock size={10} />}
                    {doc.signed ? 'Signed' : 'Unlock'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.75rem', padding: '10px', borderRadius: '12px', marginTop: '12px' }}
            onClick={() => alert('Secure document upload initialized. Files will be locally encrypted.')}
            disabled={!isSimulatedLinked}
          >
            + Upload New Trust Agreement
          </button>
        </Card>
      </div>

      {/* Invite QR Code Modal Section */}
      <Card style={{ marginTop: '24px', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--bg-muted) 0%, var(--bg) 100%)', border: `1px solid var(--border)` }}>
        <div style={{ flex: '1 1 300px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} style={{ color: T.gold }} /> Multi-Generation Dynasty Linking
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Provide immediate legacy access to direct beneficiaries, co-trustees, or generational financial advisors by generating secure pairing invites.
          </p>
        </div>
        <div>
          <button 
            className="btn-primary" 
            style={{ background: T.gold, fontSize: '0.78rem', padding: '10px 20px', width: 'auto', borderRadius: '12px' }}
            onClick={() => setShowQRModal(true)}
          >
            Launch Invite Interface
          </button>
        </div>
      </Card>

      {/* QR MODAL DIALOG */}
      {showQRModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg)',
            border: `1px solid var(--border)`,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: 'var(--sh-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700
              }}
            >
              &times;
            </button>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
              Pair Legacy Node
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
              Scan to authorize read-only ledger pairing or co-trustee signature credentials.
            </p>

            {/* Invite Role Picker */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-muted)', padding: '4px', borderRadius: '10px', width: '100%', marginBottom: '16px' }}>
              <button 
                onClick={() => setQrInviteRole('successor')}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none',
                  background: qrInviteRole === 'successor' ? 'var(--bg)' : 'transparent',
                  color: qrInviteRole === 'successor' ? T.gold : 'var(--text-muted)',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Heir / Successor
              </button>
              <button 
                onClick={() => setQrInviteRole('co-trustee')}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none',
                  background: qrInviteRole === 'co-trustee' ? 'var(--bg)' : 'transparent',
                  color: qrInviteRole === 'co-trustee' ? T.gold : 'var(--text-muted)',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Co-Trustee
              </button>
            </div>

            {/* Visual Simulated QR Code Box */}
            <div style={{
              background: '#fff',
              border: `2px solid ${T.gold}`,
              borderRadius: '20px',
              padding: '16px',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
            }}>
              {/* Nice simulated SVG QR code */}
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ fill: '#0f141e' }}>
                <rect x="0" y="0" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="6" y="6" width="13" height="13" />
                <rect x="75" y="0" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="81" y="6" width="13" height="13" />
                <rect x="0" y="75" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="6" y="81" width="13" height="13" />
                
                {/* Random blocks to simulate QR */}
                <rect x="35" y="5" width="8" height="8" />
                <rect x="50" y="15" width="12" height="6" />
                <rect x="35" y="35" width="16" height="8" />
                <rect x="10" y="45" width="14" height="12" />
                <rect x="65" y="35" width="8" height="14" />
                <rect x="80" y="50" width="12" height="12" />
                <rect x="45" y="65" width="14" height="8" />
                <rect x="35" y="80" width="8" height="15" />
                <rect x="55" y="80" width="16" height="10" />
                
                {/* Center logo lock */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill={T.gold} />
                <path d="M47 53.5h6v-3h-6zm0-5v2h6v-2z" fill="#fff" />
              </svg>
            </div>

            {/* Invite Info */}
            <div style={{ marginTop: '16px', width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Invite Pairing Code
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: T.gold, marginTop: '2px', background: 'var(--bg-muted)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {invitationCode}
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.78rem', padding: '10px', width: '100%', borderRadius: '12px', marginTop: '16px' }}
              onClick={() => {
                alert(`Invite pairing code copied to clipboard: ${invitationCode}`);
                setShowQRModal(false);
              }}
            >
              Copy Link &amp; Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
