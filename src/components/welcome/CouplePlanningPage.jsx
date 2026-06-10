import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Heart, Sparkles, CheckSquare, ShieldCheck, Compass, Info, Lock } from 'lucide-react';
import { formatCurrency } from '../../utils/finance';

export function CouplePlanningPage() {
  const { partner1, partner2, currency, getTotalSalary, partnerAccepted } = useFinanceStore();
  const total = getTotalSalary();
  
  // Consensus Compromise Indices
  const [p1Weight, setP1Weight] = useState(50);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Consolidate distributed bank ledger API nodes', done: true },
    { id: 2, text: 'Upload couple portrait to biometric encryption keys', done: true },
    { id: 3, text: 'Confirm consensus allocation profile (Balanced Mode)', done: false },
    { id: 4, text: 'Set anniversary date & couple holiday milestones', done: false },
  ]);

  const toggleCheck = (id) => {
    if (!partnerAccepted) return; // Disable checklist toggling if not connected
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const fmt = val => formatCurrency(val, currency);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="stage-badge committed">Committed Workspace</span>
            <span>· Dynamic Shared Ledger</span>
          </div>
          <h1 className="page-title">Couple <em>Planning</em></h1>
          <p className="page-desc">
            Collaborative financial planner. Track consensus splits and joint lifestyle targets live.
          </p>
        </div>
      </div>

      {!partnerAccepted && (
        <div style={{
          background: 'rgba(208, 92, 114, 0.08)',
          border: `1.5px solid ${T.rose}30`,
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--sh-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.rose, boxShadow: `0 0 10px ${T.rose}` }} />
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose }}>
                Shared Workspace Preview
              </span>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                🔒 Collaborative Features Locked · Connect your partner to activate
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 mb-20">
        {/* Consensus compromise index */}
        <Card gold style={{ position: 'relative' }}>
          <div className="card-title">Decision Matrix</div>
          <div className="card-heading">Allocation Consensus Index</div>
          <div className="card-sub">Balance financial control weight between partners dynamically.</div>
          
          <div style={{ padding: '24px 0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
              <span style={{ color: T.sky }}>{partner1 || 'Partner 1'} ({p1Weight}%)</span>
              <span style={{ color: T.rose }}>{partner2 || 'Partner 2'} ({100 - p1Weight}%)</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="range"
                className="eb-slider"
                min="0"
                max="100"
                value={p1Weight}
                disabled={!partnerAccepted}
                onChange={e => setP1Weight(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div style={{
            background: 'var(--gold-pale)',
            border: '1px solid var(--gold-border)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Info size={14} style={{ color: T.goldMid, flexShrink: 0, marginTop: '2px' }} />
            <div>
              Consensus Index calculated at <strong>{(100 - Math.abs(50 - p1Weight) * 2)}% compatibility</strong>. Adjusting controls blends risk tolerances dynamically.
            </div>
          </div>

          {/* Glass Lock Screen Overlay */}
          {!partnerAccepted && (
            <div className="glass-lock-screen">
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.rose, background: 'var(--rose-lt)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Shared Couple Dashboard</h4>
                <p className="lock-desc">Connect your partner to unlock consensus adjustments and combined budgeting features.</p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.rose, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={() => alert("🔗 Go to the Dashboard and use the Partner Connection status widget to invite your partner!")}
                >
                  Invite Partner
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Shared holiday builder */}
        <Card style={{ position: 'relative' }}>
          <div className="card-title">Lifestyle Target</div>
          <div className="card-heading">Romantic Getaway Vault</div>
          <div className="card-sub">Automated monthly earmarks dedicated to lifestyle milestones.</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Maldives Anniversary Cruise</span>
            <span style={{ fontFamily: 'var(--fn)', fontWeight: 600, color: T.rose }}>{fmt(350000)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Target Date</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)', fontWeight: 600 }}>18-Dec-2027</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Required Monthly SIP</span>
            <span style={{ fontFamily: 'var(--fn)', fontWeight: 700, color: T.sage }}>{fmt(18500)}</span>
          </div>

          {/* Glass Lock Screen Overlay */}
          {!partnerAccepted && (
            <div className="glass-lock-screen">
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.rose, background: 'var(--rose-lt)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">🔒 Joint Financial Goals</h4>
                <p className="lock-desc">Invite your partner to plan together for future romantic getaways and milestones.</p>
                <button 
                  className="btn-primary" 
                  style={{ background: T.rose, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                  onClick={() => alert("🔗 Go to the Dashboard and use the Partner Connection status widget to invite your partner!")}
                >
                  Connect Partner
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Collaborative Checklist */}
      <Card style={{ position: 'relative' }}>
        <div className="card-title">Shared Milestones</div>
        <div className="card-heading mb-4">Partnership Integration Tasks</div>
        <p className="card-sub">Tasks that must be completed to maintain absolute financial cohesion.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          {checklist.map(item => (
            <div 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: item.done ? 'var(--bg-muted)' : 'rgba(255,255,255,0.6)',
                border: `1.5px solid ${item.done ? 'var(--border)' : 'var(--border-mid)'}`,
                cursor: partnerAccepted ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: `1.5px solid ${item.done ? T.sage : 'var(--text-faint)'}`,
                background: item.done ? T.sage : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {item.done && '✓'}
              </div>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: item.done ? 'var(--text-faint)' : 'var(--text)',
                textDecoration: item.done ? 'line-through' : 'none'
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Glass Lock Screen Overlay */}
        {!partnerAccepted && (
          <div className="glass-lock-screen">
            <div className="lock-screen-inner">
              <div className="lock-icon-glow" style={{ color: T.rose, background: 'var(--rose-lt)' }}>
                <Lock size={20} />
              </div>
              <h4 className="lock-title">🔒 Relationship Timeline</h4>
              <p className="lock-desc">Decrypt shared milestones and verify partnership checklist tasks together.</p>
              <button 
                className="btn-primary" 
                style={{ background: T.rose, fontSize: '0.78rem', padding: '8px 16px', width: 'auto' }}
                onClick={() => alert("🔗 Go to the Dashboard and use the Partner Connection status widget to invite your partner!")}
              >
                Connect Partner
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
