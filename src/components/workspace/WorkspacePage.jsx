import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { WorkspaceDashboard } from './WorkspaceDashboard';
import { NotesSystem } from './NotesSystem';
import { TasksSystem } from './TasksSystem';
import { PlanningBoards } from './PlanningBoards';
import { AnniversaryBoard } from './AnniversaryBoard';
import { T } from '../../theme/tokens';
import { FileText, CheckSquare, Grid, Heart, LayoutDashboard, Search, Bell } from 'lucide-react';

export function WorkspacePage() {
  const { stage, connectionStatus, partner1, partner2 } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine Workspace Title based on stage and connection
  let workspaceTitle = "Personal Workspace";
  let workspaceSubtitle = `${partner1}'s Private Hub`;
  let themeColor = T.sky;

  if (stage === 'Committed' && connectionStatus === 'connected') {
    workspaceTitle = "Shared Couple Workspace";
    workspaceSubtitle = `${partner1} & ${partner2}'s Planning Hub`;
    themeColor = T.sage;
  } else if (stage === 'Married' && connectionStatus === 'connected') {
    workspaceTitle = "Family Workspace";
    workspaceSubtitle = `The ${partner1} & ${partner2} Dynasty`;
    themeColor = T.gold;
  }

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'boards', label: 'Planning Boards', icon: Grid },
    ...(stage !== 'Single' && connectionStatus === 'connected' ? [{ id: 'anniversary', label: 'Relationship', icon: Heart }] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <WorkspaceDashboard setActiveTab={setActiveTab} searchQuery={searchQuery} />;
      case 'notes': return <NotesSystem searchQuery={searchQuery} />;
      case 'tasks': return <TasksSystem searchQuery={searchQuery} />;
      case 'boards': return <PlanningBoards searchQuery={searchQuery} />;
      case 'anniversary': return <AnniversaryBoard />;
      default: return <WorkspaceDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="eb-workspace-page" style={{ paddingBottom: 100 }}>
      {/* Workspace Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="workspace-header"
        style={{ 
          marginBottom: 30, 
          padding: '24px 30px', 
          background: 'var(--bg-card)', 
          borderRadius: 24, 
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            {workspaceTitle}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{workspaceSubtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input 
              type="text" 
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 16px 10px 40px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                width: 240,
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button style={{ 
            width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
          }}>
            <Bell size={18} />
          </button>
        </div>
      </motion.div>

      {/* Workspace Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 30, overflowX: 'auto', paddingBottom: 5 }} className="hide-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: 16,
                border: isActive ? `1px solid ${themeColor}` : '1px solid var(--border)',
                background: isActive ? (stage === 'Married' ? 'var(--gold-pale)' : stage === 'Committed' ? 'var(--sage-lt)' : 'var(--sky-lt)') : 'var(--bg-card)',
                color: isActive ? themeColor : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
