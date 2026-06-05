import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Heart, Calendar, Star, TrendingUp } from 'lucide-react';

export function AnniversaryBoard() {
  const { partner1, partner2, relationshipDate, stage, milestones } = useFinanceStore();

  const relDate = relationshipDate ? new Date(relationshipDate) : new Date();
  const today = new Date();
  
  // Calculate days together roughly
  const diffTime = Math.abs(today - relDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = (diffDays / 365.25).toFixed(1);

  const completedMilestones = milestones.filter(m => m.monthlySaved >= m.targetCost);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
      {/* Memory Center Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: `linear-gradient(135deg, ${T.rose} 0%, #E66A81 100%)`, 
          borderRadius: 24, 
          padding: 40, 
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gridColumn: '1 / -1'
        }}
      >
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, backdropFilter: 'blur(10px)' }}>
          <Heart size={40} fill="#fff" />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>{partner1} & {partner2}</h2>
        <div style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: 24 }}>
          {stage === 'Married' ? 'Building a dynasty together.' : 'Planning a future together.'}
        </div>
        
        <div style={{ display: 'flex', gap: 40, background: 'rgba(255,255,255,0.1)', padding: '20px 40px', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: 4 }}>Started</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{relDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: 4 }}>Journey</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{diffYears} Years</div>
          </div>
        </div>
      </motion.div>

      {/* Shared Milestones */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 30, border: '1px solid var(--border)' }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={20} color={T.gold} /> Shared Milestones
        </h3>
        
        {completedMilestones.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {completedMilestones.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--gold-pale)', borderRadius: 16, border: `1px solid ${T.gold}40` }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-sm)' }}>
                  <TrendingUp size={20} color={T.gold} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Met!</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-faint)', background: 'var(--bg-warm)', borderRadius: 16 }}>
            Complete financial milestones together to see them appear here.
          </div>
        )}
      </motion.div>

      {/* Future Plans Teaser */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 30, border: '1px solid var(--border)' }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} color={T.sky} /> The Future
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '16px', background: 'var(--bg-warm)', borderRadius: 16, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Next Anniversary</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start planning a trip now?</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-warm)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Wealth Goal Review</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check joint allocation limits.</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
