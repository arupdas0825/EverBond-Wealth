import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { ProfileEditModal } from './ProfileEditModal';
import { User, Shield, MapPin, DollarSign, Calendar, Target, Edit3, ArrowRight, Heart, Activity, Percent } from 'lucide-react';
import { calculateFinancialSnapshot, calculateHealthScore } from '../../utils/finance';

export function ProfilePage() {
  const store = useFinanceStore();
  const { 
    partner1, partner2, stage, country, currency, joinDate, bio, profilePhoto,
    everBondId, p1Salary, p2Salary, connectionStatus, milestones = []
  } = store;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'EB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper to format values
  const fmt = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculate mock net worth for stats display
  const soloNetWorth = (p1Salary || 100000) * 12 + 150000;
  const combinedNetWorth = ((p1Salary || 100000) + (p2Salary || 80000)) * 15 + 350000;
  const netWorth = connectionStatus === 'connected' ? combinedNetWorth : soloNetWorth;

  // Metric computations for Financial Health Indicators
  const mode = store.mode || 'Balanced';
  const totalSalary = (p1Salary || 0) + (connectionStatus === 'connected' ? (p2Salary || 0) : 0);
  const snap = calculateFinancialSnapshot(totalSalary || 100000, mode);
  const health = calculateHealthScore(snap);

  const savingsRatePct = totalSalary > 0 
    ? Math.round((snap.budget.investments / totalSalary) * 100)
    : 30;

  const emergencyCoverage = connectionStatus === 'connected' ? '5.2 Months' : '3.5 Months';

  const goalCompletionRate = milestones.length > 0
    ? Math.round(milestones.reduce((acc, m) => acc + (Math.min(100, (m.monthlySaved / m.targetCost) * 100) || 0), 0) / milestones.length)
    : 45;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">Identity Workspace</div>
          <h1 className="page-title">Personal <em>Profile</em></h1>
          <p className="page-desc">Manage your digital EverBond node, relationship parameters, and identity tokens.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ 
            width: 'auto', 
            padding: '10px 20px', 
            background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
            boxShadow: 'var(--sh-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '100px'
          }}
          onClick={() => setIsEditModalOpen(true)}
        >
          <Edit3 size={15} /> Edit Profile
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="eb-settings-grid"
      >
        {/* PROFILE CARD */}
        <motion.div variants={itemVariants} className="span-12">
          <Card gold style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', position: 'relative' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '24px' }}>EverBond Identity Node</span>
            
            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Profile image upload or Initials avatar fallback */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={partner1 || 'User'} 
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--bg-card)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    fontFamily: T.fontDisplay,
                    boxShadow: 'var(--sh-gold)',
                    border: '3px solid var(--bg-card)'
                  }}>
                    {getInitials(partner1)}
                  </div>
                )}
                
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-mid)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit3 size={12} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    {partner1 || 'Sovereign User'}
                  </h2>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: stage === 'Married' ? 'rgba(184, 144, 42, 0.12)' : stage === 'Committed' ? 'rgba(208, 92, 114, 0.12)' : 'rgba(74, 140, 196, 0.12)', 
                    padding: '4px 12px', 
                    borderRadius: '100px', 
                    color: stage === 'Married' ? T.gold : stage === 'Committed' ? T.rose : T.sky, 
                    fontWeight: 700 
                  }}>
                    {stage} Stage
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)', fontWeight: 600, marginTop: '6px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {everBondId || 'EB-AWAITING-GEN'}
                </div>

                {bio ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginTop: '16px', marginBottom: 0, fontStyle: 'italic' }}>
                    "{bio}"
                  </p>
                ) : (
                  <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem', marginTop: '16px', marginBottom: 0 }}>
                    No biography written. Click edit to add a personal bio.
                  </p>
                )}
              </div>
            </div>

            {/* Profile Meta Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-mid)', paddingTop: '24px', marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justify: 'center', color: T.gold, flexShrink: 0 }}>
                  <MapPin size={16} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>Country</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{country || 'Not Set'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justify: 'center', color: T.gold, flexShrink: 0 }}>
                  <DollarSign size={16} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>Currency</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{currency || 'Not Set'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justify: 'center', color: T.gold, flexShrink: 0 }}>
                  <Calendar size={16} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>Member Since</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{joinDate || 'June 2026'}</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
