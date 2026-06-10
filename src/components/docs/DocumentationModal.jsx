import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Copy, Check, BookOpen, ChevronRight, 
  AlignLeft, Target, GitBranch, Shield, Zap, Lock, Map
} from 'lucide-react';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useToast } from '../common/Toast';

const DOC_SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: <BookOpen size={18} />,
    content: `
EverBond Wealth is a relationship-driven financial planning platform designed for individuals, couples, and families.

The platform evolves with a user's life journey:

**Single → Committed → Married → Financial Freedom**
    `
  },
  {
    id: 'core-philosophy',
    title: '2. Core Philosophy',
    icon: <Target size={18} />,
    content: `
EverBond is not a traditional finance tracker.

It focuses on:
• Financial alignment
• Shared goal planning
• Relationship-aware wealth growth
• Long-term milestone tracking
• Family wealth vision
    `
  },
  {
    id: 'relationship-stages',
    title: '3. Relationship Stages',
    icon: <GitBranch size={18} />,
    content: `
**Single**
Personal financial planning.

**Committed**
Collaborative planning with a partner.

**Married**
Family-oriented wealth management.

**Freedom**
Long-term financial independence roadmap.
    `
  },
  {
    id: 'platform-features',
    title: '4. Platform Features',
    icon: <Zap size={18} />,
    content: `
• Dashboard
• Income Tracking
• Wealth Allocation
• Goal Management
• Milestones
• Wealth Simulation
• Partner Linking
• Shared Notes
• Activity Timeline
• Notifications
• Achievement System
• Wealth Charts
• Settings Center
    `
  },
  {
    id: 'identity-system',
    title: '5. EverBond Identity System',
    icon: <AlignLeft size={18} />,
    content: `
**Personal ID**
Example: EB-ARUP-84F2

**Couple ID**
Example: EB-COUPLE-AS22-7K9X

**Family ID**
Example: EB-AS22-RUPTA

These identities help establish secure relationship-based connections.
    `
  },
  {
    id: 'partner-connection',
    title: '6. Partner Connection',
    icon: <Lock size={18} />,
    content: `
Users may connect with a partner through:
• EverBond ID
• QR Connect
• Anniversary Validation

After connection:
• Shared Workspace
• Shared Goals
• Couple Dashboard
• Activity Timeline

become available.
    `
  },
  {
    id: 'security-model',
    title: '7. Security Model',
    icon: <Shield size={18} />,
    content: `
**Current Version:**
• Local Data Storage
• Relationship Validation
• ID-Based Linking

**Future Versions:**
• Google Authentication
• Cloud Sync
• Encrypted Storage
• Verification System
    `
  },
  {
    id: 'roadmap',
    title: '8. Roadmap',
    icon: <Map size={18} />,
    content: `
**Upcoming:**
• Real-time Partner Chat
• Shared Wealth Center
• Couple Analytics
• Family Dashboard
• Cloud Synchronization
• AI Wealth Assistant
    `
  },
  {
    id: 'technology',
    title: '9. Technology',
    icon: <Target size={18} />,
    content: `
**Frontend:**
React
TypeScript
Tailwind CSS

**Deployment:**
Vercel

**Version:**
2.0
    `
  },
  {
    id: 'author',
    title: '10. Author',
    icon: <BookOpen size={18} />,
    content: `
**Arup Das**

**Project:**
EverBond Wealth

**Mission:**
Building a relationship-driven financial future.
    `
  }
];

export function DocumentationModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState(DOC_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const contentRef = useRef(null);
  const sectionRefs = useRef({});
  const toast = useToast();

  const theme = useFinanceStore((s) => s.theme);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll Spy Logic
  const handleScroll = (e) => {
    const target = e.target;
    // Calculate progress
    const scrollTotal = target.scrollHeight - target.clientHeight;
    if (scrollTotal > 0) {
      setScrollProgress((target.scrollTop / scrollTotal) * 100);
    }

    // Determine active section
    let currentActive = DOC_SECTIONS[0].id;
    for (let section of DOC_SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        // If the top of the section is near the top of the container
        if (rect.top <= 200) {
          currentActive = section.id;
        }
      }
    }
    setActiveSection(currentActive);
  };

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (el && contentRef.current) {
      // Get relative position
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      contentRef.current.scrollBy({ top: elTop - containerTop - 40, behavior: 'smooth' });
    }
  };

  const copySectionLink = (id, title) => {
    // In a real app with routing, this would be the actual URL. Here we simulate.
    navigator.clipboard.writeText(`https://everbond.wealth/docs#${id}`);
    setCopiedId(id);
    toast.success(`Copied link to "${title}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSections = DOC_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formatting content strings to simple JSX elements
  const renderMarkdownText = (text) => {
    return text.trim().split('\\n').map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={idx} style={{ display: 'block', marginTop: '12px', color: 'var(--text)' }}>{line.replace(/\\*\\*/g, '')}</strong>;
      }
      if (line.startsWith('•')) {
        return <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}><span style={{ color: T.gold }}>•</span> <span style={{ color: 'var(--text-muted)' }}>{line.replace('• ', '')}</span></div>;
      }
      return <p key={idx} style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>{line}</p>;
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: theme === 'dark' ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="liquid-glass"
        style={{
          width: '100%', maxWidth: '1100px', height: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}
      >
        {/* Progress Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--border)' }}>
          <div style={{ height: '100%', background: T.gold, width: `${scrollProgress}%`, transition: 'width 0.1s ease-out' }} />
        </div>

        {/* Header */}
        <div style={{ 
          padding: '24px 32px', borderBottom: '1px solid var(--border)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
              EverBond Wealth Documentation
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)', fontWeight: 600 }}>
              Relationship-Driven Financial Planning Platform · Created by Arup Das · Version 2.0
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-warm)',
              border: '1px solid var(--border-mid)', color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Area: Sidebar + Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* TOC Sidebar (Hidden on mobile) */}
          <div className="hide-on-mobile" style={{ 
            width: '280px', borderRight: '1px solid var(--border)', background: 'var(--bg-warm)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input 
                type="text" 
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px',
                  border: '1px solid var(--border-mid)', background: 'var(--bg)',
                  color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
                }}
              />
            </div>

            {/* TOC List */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }} className="hide-scrollbar">
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '12px' }}>
                Contents
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {DOC_SECTIONS.map(section => {
                  const isActive = activeSection === section.id && !searchQuery;
                  return (
                    <button
                      key={section.id}
                      onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection(section.id), 0); }}
                      style={{
                        padding: '10px 12px', borderRadius: '8px', textAlign: 'left',
                        background: isActive ? 'var(--gold-pale)' : 'transparent',
                        color: isActive ? T.gold : 'var(--text-muted)',
                        fontWeight: isActive ? 700 : 600, fontSize: '0.85rem',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {section.icon}
                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', scrollBehavior: 'smooth' }} 
            className="hide-scrollbar"
          >
            {filteredSections.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-faint)', marginTop: '60px' }}>
                <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3>No sections found for "{searchQuery}"</h3>
              </div>
            ) : (
              <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
                 {filteredSections.map(section => (
                  <motion.div 
                    key={section.id} 
                    ref={el => sectionRefs.current[section.id] = el}
                    className="doc-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }} className="group">
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
                        {section.title}
                      </h3>
                      <button 
                        onClick={() => copySectionLink(section.id, section.title)}
                        style={{ 
                          background: 'transparent', border: 'none', color: copiedId === section.id ? T.sage : 'var(--text-faint)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: copiedId === section.id ? 1 : 0.5, transition: 'opacity 0.2s'
                        }}
                        title="Copy section link"
                      >
                        {copiedId === section.id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                      {renderMarkdownText(section.content)}
                    </div>
                  </motion.div>
                ))}
                {/* Bottom spacer */}
                <div style={{ height: '60vh' }} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
}
