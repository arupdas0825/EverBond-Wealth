import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { 
  BookOpen, Search, Copy, Check, ChevronRight, Info, Shield, 
  Map, Sparkles, Target, Zap, Users, ShieldAlert
} from 'lucide-react';

const DOC_SECTIONS = [
  {
    id: 'about',
    title: 'About EverBond',
    icon: <Sparkles size={18} />,
    content: `
EverBond Wealth is a premium, relationship-driven financial alignment platform built for individuals, couples, and families.

Unlike traditional budgeting tools that focus purely on transactional tracking, EverBond is designed around the core philosophy of financial intimacy, consensus planning, and multi-generational capital compounding. We believe that shared wealth is built on shared goals, transparency, and a mutual understanding of cash flows.
    `
  },
  {
    id: 'lifestages',
    title: 'Life Stages',
    icon: <Users size={18} />,
    content: `
EverBond dynamically calibrates its workspace based on your current relationship stage:

• **Single Stage**
Focuses on individual capital compounding, Raise Projections, and personal SIP sandboxes. Helps you establish your solo sovereign wealth foundation.

• **Committed Stage**
Introduces collaborative dual-salary pools, shared property fund simulations (such as a Home Deposit tracker), and romantic milestone alignment.

• **Married Dynasty Stage**
Consolidates multi-locker asset portfolios, generational launchpads (like a Child Education Trust), and long-term passive income coverage index mapping.
    `
  },
  {
    id: 'identity',
    title: 'Identity System',
    icon: <Target size={18} />,
    content: `
EverBond uses a secure, decentralized identity architecture to allow private networking between nodes:

• **EverBond ID (EB-[NAME]-[HEX])**
A permanent, personalized identity key generated for your solo user node. It acts as your public routing address for partner syncing.

• **Couple ID (EB-COUPLE-XXXX-XXXX)**
A secure cryptographic ID generated once two nodes establish a consensus link, creating a joint balance ledger.

• **Family ID (EB-[FAMILY_NAME]-[HEX])**
A multi-node family dynasty key generated for tracking generational trusts, children's portfolios, and family inheritances.
    `
  },
  {
    id: 'connection',
    title: 'Partner Connection',
    icon: <Zap size={18} />,
    content: `
To establish a connection and unlock shared financial planning, navigate to the **Partner** screen and share your EverBond ID.

• **Cryptographic Invitation**
Share your ID code with your partner. They can copy this code and request a handshake.

• **Anniversary Validation**
To prevent incorrect connections, requests require entering the relationship anniversary date as a cryptographic validator.

• **Consolidated Sync**
Once connected, the combined income pool, joint net worth charts, shared workspace notes, and synchronized timelines immediately activate.
    `
  },
  {
    id: 'simulation',
    title: 'Wealth Simulation',
    icon: <Map size={18} />,
    content: `
Our Sandbox Compounding Engine allows you to run multi-decade simulations:

• **Interactive SIP Simulator**
Adjust monthly contributions and time horizons to calculate future compound values at different return rates.

• **Raises & Inflows**
Simulate personal raise rates (e.g. 7% per annum) to project raises in monthly income over 5, 10, and 20-year horizons.

• **Multi-Decade Forecasts**
Examine area charts showing Conservative (7%), Base (10%), and Optimistic (12%) growth projections over 30 years.
    `
  },
  {
    id: 'security',
    title: 'Privacy & Security',
    icon: <Shield size={18} />,
    content: `
Your financial data is sovereign and secure.

• **Local-First Storage**
All budget splits, personal bios, and base64 cropped profile photos are stored directly in your browser's Local Storage. No databases store your passwords.

• **Private Handshake**
Data syncing between partner nodes is managed via secure cryptographic keys.

• **Security Audits**
Inspect active sessions, device parameters, and data logs directly on the Settings Page. You can export or clear your ledger at any time.
    `
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    icon: <Info size={18} />,
    content: `
EverBond is continuously expanding:

• **Q3 2026: Real-time Ledger Sync**
Enable background cloud synchronization for real-time portfolio updates between partners.

• **Q4 2026: AI Wealth Assistant**
Algorithm-driven feedback to optimize monthly splits and flag underperforming allocations.

• **Q1 2027: Direct Bank Feeds**
Read-only bank connections to automate income categorization while maintaining client privacy.
    `
  },
  {
    id: 'version',
    title: 'Version History',
    icon: <ShieldAlert size={18} />,
    content: `
• **v2.5 (Current)**
UX architecture refactor separating Personal Profile details from System Settings. Built circular canvas crop editor and scrollable internal documentation page.

• **v2.0**
Handshake update adding EverBond IDs, anniversary validation, and stage-specific bento layouts.

• **v1.0**
Initial release with local finance engine, theme controls, and basic dashboard widgets.
    `
  }
];

export function DocumentationPage() {
  const [activeSection, setActiveSection] = useState(DOC_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  const contentRef = useRef(null);
  const sectionRefs = useRef({});
  const toast = useToast();
  const theme = useFinanceStore(s => s.theme);

  // Scroll spy to highlight current section
  const handleScroll = (e) => {
    const target = e.target;
    let currentActive = DOC_SECTIONS[0].id;
    
    for (let section of DOC_SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        // If section header is visible near the top of the scrolling viewport
        if (rect.top <= 220) {
          currentActive = section.id;
        }
      }
    }
    setActiveSection(currentActive);
  };

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (el && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      contentRef.current.scrollBy({ 
        top: elTop - containerTop - 20, 
        behavior: 'smooth' 
      });
    }
  };

  const copySectionLink = (id, title) => {
    const link = `${window.location.origin}/docs#${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success(`Link to "${title}" copied.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSections = DOC_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDocContent = (text) => {
    return text.trim().split('\n').map((line, idx) => {
      if (line.startsWith('• **') && line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={idx} style={{ marginTop: '16px', marginBottom: '8px' }}>
            <strong style={{ fontSize: '0.98rem', color: 'var(--text)' }}>
              • {parts[1]}
            </strong>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {parts.slice(2).join('**').trim()}
            </p>
          </div>
        );
      }
      if (line.startsWith('•')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '0.92rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>
            <span style={{ color: T.gold }}>•</span>
            <span>{line.replace('• ', '').replace('•', '')}</span>
          </div>
        );
      }
      return <p key={idx} style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{line}</p>;
    });
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-eyebrow">User Manual & Specifications</div>
        <h1 className="page-title">Internal <em>Documentation</em></h1>
        <p className="page-desc">Complete scrollable reference detailing system stages, security models, and compound math parameters.</p>
      </div>

      {/* Reader Layout */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: '24px',
        height: 'calc(100vh - 220px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)'
      }}>
        {/* TOC Sidebar */}
        <div className="hide-on-mobile" style={{
          width: '280px',
          borderRight: '1px solid var(--border-mid)',
          background: 'var(--bg-warm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input 
              type="text" 
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px',
                border: '1px solid var(--border-mid)', background: 'var(--bg-card)',
                color: 'var(--text)', fontSize: '0.82rem', outline: 'none'
              }}
            />
          </div>

          {/* List of sections */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }} className="hide-scrollbar">
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', display: 'block', marginBottom: '12px' }}>
              Sections
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {DOC_SECTIONS.map(s => {
                const isActive = activeSection === s.id && !searchQuery;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection(s.id), 0); }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: isActive ? 'var(--gold-pale)' : 'transparent',
                      color: isActive ? T.gold : 'var(--text-muted)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ color: isActive ? T.gold : 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                      {s.icon}
                    </span>
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Viewer Panel */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '36px 48px', scrollBehavior: 'smooth' }}
          className="hide-scrollbar"
        >
          {filteredSections.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-faint)', marginTop: '80px' }}>
              <Search size={44} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3>No specifications match "{searchQuery}"</h3>
            </div>
          ) : (
            <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {filteredSections.map(s => (
                <div 
                  key={s.id}
                  ref={el => sectionRefs.current[s.id] = el}
                  style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '36px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-warm)', color: T.gold }}>
                      {s.icon}
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      {s.title}
                    </h3>
                    
                    <button 
                      onClick={() => copySectionLink(s.id, s.title)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === s.id ? T.sage : 'var(--text-faint)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease'
                      }}
                      title="Copy section link"
                    >
                      {copiedId === s.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div style={{ paddingLeft: '44px' }}>
                    {formatDocContent(s.content)}
                  </div>
                </div>
              ))}
              
              {/* Bottom Spacer to allow scrolling past the final section */}
              <div style={{ height: '30vh' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
