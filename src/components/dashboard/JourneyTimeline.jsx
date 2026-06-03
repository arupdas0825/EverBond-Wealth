import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  Heart, 
  DollarSign, 
  Settings, 
  Target, 
  User, 
  Award, 
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { T } from '../../theme/tokens';

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getEventIcon(type, isMilestone) {
  if (isMilestone) {
    return <Award size={16} style={{ color: T.gold }} />;
  }
  switch (type) {
    case 'profile':
      return <User size={15} style={{ color: T.sky }} />;
    case 'financial':
      return <DollarSign size={15} style={{ color: T.sage }} />;
    case 'relationship':
      return <Heart size={15} style={{ color: T.rose }} fill={T.rose} />;
    case 'system':
      return <Settings size={15} style={{ color: 'var(--text-faint)' }} />;
    case 'goal':
      return <Target size={15} style={{ color: T.goldMid }} />;
    default:
      return <Sparkles size={15} style={{ color: T.gold }} />;
  }
}

function getEventBadgeBg(type, isMilestone) {
  if (isMilestone) return 'var(--gold-pale)';
  switch (type) {
    case 'profile': return 'var(--sky-lt)';
    case 'financial': return 'var(--sage-lt)';
    case 'relationship': return 'var(--rose-lt)';
    case 'system': return 'var(--bg-warm)';
    case 'goal': return 'var(--gold-pale)';
    default: return 'var(--bg-warm)';
  }
}

function getEventBorderColor(type, isMilestone) {
  if (isMilestone) return 'var(--gold-border)';
  switch (type) {
    case 'profile': return 'var(--sky-border)';
    case 'financial': return 'var(--sage-border)';
    case 'relationship': return 'var(--rose-border)';
    case 'system': return 'var(--border)';
    case 'goal': return 'var(--gold-border)';
    default: return 'var(--border)';
  }
}

export function JourneyTimeline() {
  const {
    timelineEvents,
    connectionStatus,
    partner1,
    partner2,
    simulatePartnerActivity,
    theme
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('all');
  const [showSimControls, setShowSimControls] = useState(false);

  // Filter events
  const filteredEvents = timelineEvents.filter(ev => {
    if (activeTab === 'all') return true;
    if (activeTab === 'relationship') return ev.type === 'relationship' || ev.type === 'profile' && (ev.title.includes('Partner') || ev.title.includes('Stage'));
    if (activeTab === 'financial') return ev.type === 'financial';
    if (activeTab === 'goals') return ev.type === 'goal';
    if (activeTab === 'system') return ev.type === 'system';
    return true;
  });

  const getInitials = (name) => {
    if (!name || name === 'System') return 'SY';
    if (name === 'Solo Builder') return 'SB';
    return name.trim().slice(0, 2).toUpperCase();
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '28px',
      boxShadow: 'var(--sh-sm)',
      position: 'relative',
      overflow: 'hidden'
    }} className="eb-timeline-widget">
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold }}>Consolidated Chronicle</span>
          <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>Journey Timeline</h3>
        </div>

        {/* Partner Simulation Controls */}
        {connectionStatus === 'connected' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSimControls(prev => !prev)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                background: theme === 'light' ? 'rgba(184, 144, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-mid)',
                borderRadius: '100px',
                color: T.gold,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>⚙️ Simulate Partner Action</span>
            </button>

            <AnimatePresence>
              {showSimControls && (
                <>
                  <div 
                    onClick={() => setShowSimControls(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '8px',
                      width: '220px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: '14px',
                      boxShadow: 'var(--sh-md)',
                      padding: '8px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {[
                      { id: 'profile_updated', label: 'Updated Profile', icon: '👤' },
                      { id: 'goal_added', label: 'Added Travel Goal', icon: '✈️' },
                      { id: 'allocation_updated', label: 'Changed Allocation', icon: '📊' },
                      { id: 'milestone_completed', label: 'Completed Milestone', icon: '🏆' }
                    ].map(act => (
                      <button
                        key={act.id}
                        onClick={() => {
                          simulatePartnerActivity(act.id);
                          setShowSimControls(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          textAlign: 'left',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        className="sim-action-btn"
                        onMouseEnter={e => e.target.style.background = 'var(--bg-warm)'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                      >
                        <span>{act.icon}</span> {act.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '10px',
        marginBottom: '24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: 'all', label: 'All Events' },
          { id: 'relationship', label: 'Relationship' },
          { id: 'financial', label: 'Finance' },
          { id: 'goals', label: 'Goals' },
          { id: 'system', label: 'System' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                border: 'none',
                background: isActive ? (theme === 'light' ? 'rgba(26,23,20,0.08)' : 'rgba(255,255,255,0.08)') : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Timeline Events List */}
      <div style={{ position: 'relative' }} className="eb-timeline-events-list">
        <AnimatePresence mode="wait">
          {filteredEvents.length > 0 ? (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative',
                paddingLeft: '24px'
              }}
            >
              {/* Vertical timeline connector line */}
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'var(--border-mid)',
                zIndex: 0
              }} />

              {filteredEvents.map((ev, index) => {
                const initials = getInitials(ev.createdBy);
                const isPartner = ev.createdBy === partner2 && ev.createdBy !== '';

                return (
                  <motion.div
                    key={ev.eventId}
                    variants={itemVariants}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {/* Node Dot / Icon */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: ev.isMilestone ? T.gold : (theme === 'light' ? '#fff' : '#000'),
                      border: `2.5px solid ${ev.isMilestone ? T.gold : 'var(--border-str)'}`,
                      boxShadow: ev.isMilestone ? '0 0 10px rgba(184, 144, 42, 0.4)' : 'none',
                      position: 'absolute',
                      left: '-24px',
                      top: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {ev.isMilestone && (
                        <div style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: '#fff'
                        }} />
                      )}
                    </div>

                    {/* Event Card Container */}
                    <div
                      className={`eb-timeline-card ${ev.isMilestone ? 'milestone-card' : ''}`}
                      style={{
                        flex: 1,
                        background: ev.isMilestone 
                          ? (theme === 'light' ? 'linear-gradient(150deg, #FFFFFF 0%, #FDFAF0 100%)' : 'linear-gradient(150deg, #18150f 0%, #0c0b08 100%)')
                          : (theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.02)'),
                        border: `1px solid ${ev.isMilestone ? 'var(--gold-border)' : 'var(--border)'}`,
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        boxShadow: ev.isMilestone ? 'var(--sh-gold)' : 'var(--sh-xs)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* Avatar indicator (Who triggered) */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: ev.createdBy === 'System'
                          ? 'var(--bg-muted)'
                          : isPartner ? 'var(--rose-lt)' : 'var(--gold-pale)',
                        border: `1px solid ${ev.createdBy === 'System' ? 'var(--border)' : isPartner ? 'var(--rose-border)' : 'var(--gold-border)'}`,
                        color: ev.createdBy === 'System'
                          ? 'var(--text-muted)'
                          : isPartner ? T.rose : T.gold,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'var(--sh-xs)'
                      }}
                      title={`Performed by ${ev.createdBy}`}
                      >
                        {initials}
                      </div>

                      {/* Content column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <h4 style={{
                            fontSize: '0.85rem',
                            fontWeight: 750,
                            color: 'var(--text)',
                            lineHeight: 1.2
                          }}>
                            {ev.isMilestone && '🏆 '}
                            {ev.title}
                          </h4>
                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-faint)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            {formatRelativeTime(ev.createdAt)}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.42,
                          fontWeight: 500
                        }}>{ev.description}</p>
                      </div>

                      {/* Small Type Badge */}
                      <div style={{
                        padding: '3px 8px',
                        borderRadius: '100px',
                        background: getEventBadgeBg(ev.type, ev.isMilestone),
                        border: `1px solid ${getEventBorderColor(ev.type, ev.isMilestone)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}
                      title={`Category: ${ev.type}`}
                      >
                        {getEventIcon(ev.type, ev.isMilestone)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '48px 16px',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>🌱</div>
              <h4 style={{
                fontFamily: 'var(--fd)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '2px'
              }}>Your Journey Starts Here</h4>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                maxWidth: '280px',
                margin: '0 auto'
              }}>Complete actions (add income, create goals, adjust Mindset) to build your timeline.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
