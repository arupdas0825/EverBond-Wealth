import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Grid, Lock, ArrowRight } from 'lucide-react';

export function PlanningBoards({ searchQuery }) {
  const { workspaceBoards, stage, connectionStatus } = useFinanceStore();

  const filteredBoards = workspaceBoards.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const locked = stage === 'Single' || connectionStatus !== 'connected';

  if (locked) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={32} color="var(--text-faint)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Planning Boards Locked</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Connect with your partner to unlock shared visual boards for home planning, travel, and more.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {filteredBoards.map((board, i) => (
          <motion.div
            key={board.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
            style={{ 
              background: 'var(--bg-card)', 
              borderRadius: 20, 
              padding: 24, 
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--sky-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Grid size={24} color={T.sky} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{board.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
              Organize notes, tasks, and goals related to {board.title.toLowerCase()}.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: T.sky, display: 'flex', alignItems: 'center', gap: 4 }}>
                Open Board <ArrowRight size={14} />
              </span>
            </div>
          </motion.div>
        ))}

        <motion.div
          whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
          style={{ 
            background: 'var(--bg-warm)', 
            borderRadius: 20, 
            padding: 24, 
            border: '2px dashed var(--border-mid)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: 'var(--text-faint)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>+</div>
          <div style={{ fontWeight: 600 }}>Create New Board</div>
        </motion.div>
      </div>
    </div>
  );
}
