import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { FileText, CheckSquare, Clock, ArrowRight, Grid } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';

export function WorkspaceDashboard({ setActiveTab, searchQuery }) {
  const { workspaceNotes, workspaceTasks, workspaceBoards, stage } = useFinanceStore();

  const recentNotes = workspaceNotes
    .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 3);
  
  const pendingTasks = workspaceTasks
    .filter(t => t.status !== 'Completed')
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 4);

  const pinnedNotes = workspaceNotes.filter(n => n.isPinned);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Pinned Plans Widget */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
          style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', color: 'var(--text)' }}>
              <span style={{ color: T.gold }}>📌</span> Pinned Plans
            </h3>
            <button onClick={() => setActiveTab('notes')} style={{ background: 'none', border: 'none', color: T.sky, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {pinnedNotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pinnedNotes.map(note => (
                <div key={note.id} style={{ padding: 14, background: 'var(--bg-warm)', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{note.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{note.type}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
              No pinned plans yet.
            </div>
          )}
        </motion.div>

        {/* Pending Tasks Widget */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
          style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', color: 'var(--text)' }}>
              <CheckSquare size={18} color={T.sage} /> Pending Tasks
            </h3>
            <button onClick={() => setActiveTab('tasks')} style={{ background: 'none', border: 'none', color: T.sky, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {pendingTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 6, border: '2px solid var(--border-mid)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.assignedTo}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
              All caught up!
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Recent Notes Widget */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
          style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', color: 'var(--text)' }}>
              <FileText size={18} color={T.sky} /> Recent Notes
            </h3>
            <button onClick={() => setActiveTab('notes')} style={{ background: 'none', border: 'none', color: T.sky, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {recentNotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentNotes.map(note => (
                <div key={note.id} style={{ padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{note.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
              No recent notes.
            </div>
          )}
        </motion.div>

        {/* Activity Feed Widget */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
          style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 16 }}>
            <Clock size={18} color={T.rose} /> Workspace Activity
          </h3>
          <ActivityFeed limit={4} />
        </motion.div>
      </div>

    </div>
  );
}
