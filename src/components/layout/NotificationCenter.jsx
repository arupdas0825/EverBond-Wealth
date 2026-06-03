import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  Bell, 
  Heart, 
  DollarSign, 
  Award, 
  Settings, 
  Link, 
  Check, 
  Trash2, 
  X,
  Compass
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
  return `${diffDays}d ago`;
}

function getNotifIcon(type) {
  switch (type) {
    case 'partner':
      return <Link size={18} style={{ color: T.gold }} />;
    case 'financial':
      return <DollarSign size={18} style={{ color: T.sage }} />;
    case 'relationship':
      return <Heart size={18} style={{ color: T.rose }} fill={T.rose} />;
    case 'system':
      return <Settings size={18} style={{ color: T.sky }} />;
    default:
      return <Bell size={18} style={{ color: 'var(--text-faint)' }} />;
  }
}

function getNotifBadgeColor(type) {
  switch (type) {
    case 'partner':
      return 'var(--gold-pale)';
    case 'financial':
      return 'var(--sage-lt)';
    case 'relationship':
      return 'var(--rose-lt)';
    case 'system':
      return 'var(--sky-lt)';
    default:
      return 'var(--bg-warm)';
  }
}

function getNotifBorderColor(type) {
  switch (type) {
    case 'partner':
      return 'var(--gold-border)';
    case 'financial':
      return 'var(--sage-border)';
    case 'relationship':
      return 'var(--rose-border)';
    case 'system':
      return 'var(--sky-border)';
    default:
      return 'var(--border)';
  }
}

export function NotificationCenter() {
  const {
    notifications,
    markAsRead,
    markAllRead,
    clearAll,
    theme
  } = useFinanceStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'relationship') return n.type === 'relationship' || n.type === 'partner';
    if (activeTab === 'financial') return n.type === 'financial';
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  // Close drawer on click outside (Desktop)
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('.eb-notif-bell-btn')) {
        setIsOpen(false);
      }
    }

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Prevent scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const toggleOpen = () => setIsOpen(prev => !prev);

  // Framer Motion Variants
  const bellVariants = {
    initial: { scale: 1 },
    animate: unreadCount > 0 ? {
      rotate: [0, -12, 12, -12, 12, -6, 6, 0],
      transition: {
        repeat: Infinity,
        repeatDelay: 5,
        duration: 0.6,
        ease: 'easeInOut'
      }
    } : {}
  };

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 20 }
    },
    pulse: {
      boxShadow: [
        '0 0 0 0px rgba(208, 92, 114, 0.4)',
        '0 0 0 8px rgba(208, 92, 114, 0)'
      ],
      transition: {
        repeat: Infinity,
        duration: 1.6,
        ease: 'easeOut'
      }
    }
  };

  const drawerVariants = {
    hidden: { x: '100%', opacity: 0.9 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 26, stiffness: 220 }
    },
    exit: { 
      x: '100%', 
      opacity: 0.9,
      transition: { type: 'spring', damping: 26, stiffness: 220 }
    }
  };

  const bottomSheetVariants = {
    hidden: { y: '100%' },
    visible: { 
      y: 0,
      transition: { type: 'spring', damping: 28, stiffness: 240 }
    },
    exit: { 
      y: '100%',
      transition: { type: 'spring', damping: 28, stiffness: 240 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      {/* BELL BUTTON */}
      <motion.button
        className="eb-notif-bell-btn"
        onClick={toggleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        variants={bellVariants}
        initial="initial"
        animate="animate"
        aria-label={`Notifications, ${unreadCount} unread`}
        style={{
          position: 'fixed',
          top: '20px',
          right: '76px', // Offsets it neatly from the ThemeToggle (which is at right: 20px)
          zIndex: 1999,  // Just below ThemeToggle (zIndex 2000)
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: theme === 'light' ? 'rgba(255, 252, 248, 0.42)' : 'rgba(11, 15, 25, 0.42)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: theme === 'light' ? '1px solid rgba(184, 144, 42, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: theme === 'light' ? '0 8px 32px rgba(184, 144, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          color: theme === 'light' ? T.gold : '#f5f5f7',
          outline: 'none',
          transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease'
        }}
      >
        <Bell size={20} />
        
        {/* Unread Count Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="eb-notif-badge"
              variants={badgeVariants}
              initial="initial"
              animate={["animate", "pulse"]}
              exit="initial"
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: 'var(--rose)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                borderRadius: '50%',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: theme === 'light' ? '2px solid #fff' : '2px solid #000',
                boxShadow: '0 2px 6px rgba(208, 92, 114, 0.4)',
                pointerEvents: 'none'
              }}
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* MOBILE HEADER BELL INJECTION ANCHOR */}
      {/* On Mobile, we absolute position the bell overlay at the top left of App so it floats nicely inside the sticky top bar. */}
      {/* Alternatively, we can let App.jsx render this. This fixed bell works perfectly on mobile because it overlays at right: 76px and top: 20px, aligning neatly inside the mobile header! */}

      {/* DRAWER & OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: theme === 'light' ? 'rgba(26, 23, 20, 0.08)' : 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 2100 // High enough to cover main app
              }}
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Center Content */}
            <motion.div
              ref={drawerRef}
              className={`eb-notif-drawer ${isMobile ? 'mobile-sheet' : 'desktop-drawer'}`}
              variants={isMobile ? bottomSheetVariants : drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                background: theme === 'light' ? 'rgba(255, 252, 248, 0.88)' : 'rgba(10, 10, 10, 0.88)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                boxShadow: 'var(--sh-lg)',
                zIndex: 2200,
                display: 'flex',
                flexDirection: 'column',
                
                // Desktop vs Mobile Layout Rules
                ...(isMobile ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '82vh',
                  borderRadius: '32px 32px 0 0',
                  borderTop: theme === 'light' ? '1px solid rgba(184, 144, 42, 0.15)' : '1px solid rgba(255, 255, 255, 0.1)',
                } : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '420px',
                  height: '100vh',
                  borderLeft: theme === 'light' ? '1px solid rgba(184, 144, 42, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
                })
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px 24px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{
                      fontFamily: 'var(--fd)',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: 'var(--text)'
                    }}>Notifications</h2>
                    {unreadCount > 0 && (
                      <span style={{
                        background: 'var(--rose-lt)',
                        color: 'var(--rose)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '100px',
                        border: '1px solid var(--rose-border)'
                      }}>
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'var(--bg-warm)',
                      border: '1px solid var(--border-mid)',
                      color: 'var(--text-muted)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="notif-close-btn"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Mark all / Clear all links */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unreadCount > 0 ? T.gold : 'var(--text-faint)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: unreadCount > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Check size={14} />
                    Mark All Read
                  </button>

                  <button
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: notifications.length > 0 ? 'var(--rose)' : 'var(--text-faint)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: notifications.length > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{
                padding: '8px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'relationship', label: 'Relationship' },
                  { id: 'financial', label: 'Finance' },
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

              {/* Notification Cards List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px'
              }} className="eb-notif-list-container">
                <AnimatePresence mode="wait">
                  {filteredNotifications.length > 0 ? (
                    <motion.div
                      key={activeTab}
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      {filteredNotifications.map(n => (
                        <motion.div
                          key={n.id}
                          variants={cardVariants}
                          onClick={() => markAsRead(n.id)}
                          whileHover={{ scale: 1.01, translateY: -1 }}
                          whileTap={{ scale: 0.99 }}
                          style={{
                            background: n.isRead ? 'transparent' : (theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(18, 18, 18, 0.4)'),
                            borderRadius: '16px',
                            padding: '14px 16px',
                            border: `1px solid ${n.isRead ? 'var(--border)' : getNotifBorderColor(n.type)}`,
                            display: 'flex',
                            gap: '12px',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                            boxShadow: n.isRead ? 'none' : 'var(--sh-xs)',
                          }}
                          className={`eb-notif-card ${n.isRead ? 'read' : 'unread'}`}
                        >
                          {/* Unread Dot */}
                          {!n.isRead && (
                            <span style={{
                              position: 'absolute',
                              top: '16px',
                              right: '16px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--rose)',
                              boxShadow: '0 0 8px var(--rose)'
                            }} />
                          )}

                          {/* Category Icon Wrapper */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: getNotifBadgeColor(n.type),
                            border: `1px solid ${getNotifBorderColor(n.type)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {getNotifIcon(n.type)}
                          </div>

                          {/* Content */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, paddingRight: '12px' }}>
                            <div style={{
                              fontSize: '0.85rem',
                              fontWeight: n.isRead ? 600 : 750,
                              color: 'var(--text)',
                              lineHeight: 1.2
                            }}>{n.title}</div>
                            <div style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.45,
                              fontWeight: 500
                            }}>{n.description}</div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-faint)',
                              fontWeight: 600,
                              marginTop: '2px'
                            }}>{formatRelativeTime(n.createdAt)}</div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    /* Premium Empty State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '32px 16px',
                        gap: '16px'
                      }}
                    >
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: theme === 'light' ? 'rgba(184, 144, 42, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1.5px dashed var(--border-mid)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: T.gold,
                        opacity: 0.6
                      }}>
                        <Compass size={28} className="animate-pulse" />
                      </div>
                      <div>
                        <h3 style={{
                          fontFamily: 'var(--fd)',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>No Notifications Yet</h3>
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.45,
                          maxWidth: '240px',
                          margin: '0 auto'
                        }}>Your EverBond updates will appear here.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
