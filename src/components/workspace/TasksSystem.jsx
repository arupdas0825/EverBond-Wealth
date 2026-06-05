import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Plus, Check, Clock, Trash2 } from 'lucide-react';

export function TasksSystem({ searchQuery }) {
  const { workspaceTasks, addWorkspaceTask, updateWorkspaceTask, deleteWorkspaceTask, partner1, partner2 } = useFinanceStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('Unassigned');

  const filteredTasks = workspaceTasks.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addWorkspaceTask({ title: newTaskTitle, assignedTo: assignee, status: 'Pending', dueDate: '' });
    setNewTaskTitle('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return T.sage;
      case 'In Progress': return T.sky;
      default: return 'var(--text-faint)';
    }
  };

  const renderTask = (task) => (
    <motion.div 
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', 
        background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
        marginBottom: 12
      }}
    >
      <button 
        onClick={() => updateWorkspaceTask(task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })}
        style={{ 
          width: 24, height: 24, borderRadius: 8, border: `2px solid ${getStatusColor(task.status)}`, 
          background: task.status === 'Completed' ? T.sage : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}
      >
        {task.status === 'Completed' && <Check size={14} color="#fff" />}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: task.status === 'Completed' ? 'var(--text-faint)' : 'var(--text)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            👤 {task.assignedTo}
          </span>
          {task.status === 'In Progress' && (
            <span style={{ fontSize: '0.75rem', color: T.sky, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> In Progress
            </span>
          )}
        </div>
      </div>

      <select 
        value={task.status} 
        onChange={(e) => updateWorkspaceTask(task.id, { status: e.target.value })}
        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.8rem', outline: 'none' }}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button 
        onClick={() => deleteWorkspaceTask(task.id)}
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 8 }}
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );

  return (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 20, border: '1px solid var(--border)', marginBottom: 30 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Create New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 12 }}>
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem' }}
          />
          <select 
            value={assignee} 
            onChange={e => setAssignee(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem' }}
          >
            <option value="Unassigned">Unassigned</option>
            {partner1 && <option value={partner1}>{partner1}</option>}
            {partner2 && <option value={partner2}>{partner2}</option>}
          </select>
          <button 
            type="submit"
            style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 12, padding: '0 24px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} /> Add Task
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Pending Tasks
        </h2>
        {filteredTasks.filter(t => t.status !== 'Completed').length > 0 ? (
          filteredTasks.filter(t => t.status !== 'Completed').map(renderTask)
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>No pending tasks.</div>
        )}

        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, marginTop: 40 }}>
          Completed
        </h2>
        {filteredTasks.filter(t => t.status === 'Completed').length > 0 ? (
          filteredTasks.filter(t => t.status === 'Completed').map(renderTask)
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>No completed tasks yet.</div>
        )}
      </div>
    </div>
  );
}
