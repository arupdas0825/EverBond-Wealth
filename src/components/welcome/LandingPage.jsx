import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Lock, Shield, Heart, Check, X, 
  ChevronRight, Calendar, Users, DollarSign, Award, Compass, 
  TrendingUp, LayoutDashboard, Target, Milestone, RefreshCw,
  UserCheck, HelpCircle, Layers, Info, Download
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { T } from '../../theme/tokens';
import { useFinanceStore } from '../../store/useFinanceStore';
import { usePWA } from './usePWA';

// Premium luxury animation variants for landing page
const titleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15
    }
  }
};

const titleLineVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1] // Luxury cubic-bezier
    }
  }
};

const sectionScrollVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Simplified reveal component for quotes to prevent heavy DOM rendering
const QuoteReveal = ({ text }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {text}
    </motion.span>
  );
};

const line1Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1
    }
  }
};

const line2Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.25
    }
  }
};

// GPU-accelerated magnetic container for premium SaaS button feel
function MagneticContainer({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Subtle offset (max 8px) to keep it professional and feel premium
    const maxOffset = 8;
    const deltaX = (clientX - centerX) * 0.15;
    const deltaY = (clientY - centerY) * 0.15;
    
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: dx, y: dy, display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
}

// Micro-animation variants for the premium CTA arrow
const arrowVariants = {
  idle: {
    x: [0, 4, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
      ease: 'easeInOut'
    }
  },
  hover: {
    x: 6,
    transition: {
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  tap: {
    x: 12,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

export function LandingPage({ onStartJourney, onLoginClick, onOpenPolicy }) {
  const theme = useFinanceStore(s => s.theme);
  const [activeStage, setActiveStage] = useState('Single');
  const [imgFailed, setImgFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isInstalled,
    isInstallable,
    showPopup,
    setShowPopup,
    showMobileSuggest,
    dismissMobileSuggest,
    triggerInstallFlow,
  } = usePWA();

  const [hoveredSocial, setHoveredSocial] = useState(null);

  const socialLinks = [
    {
      name: 'github',
      label: 'GitHub',
      url: 'https://github.com/arupdas0825',
      svg: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      ),
      glow: 'rgba(28, 26, 22, 0.15)'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/arup-das-381bb02a1/',
      svg: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      glow: 'rgba(10, 102, 194, 0.25)'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/_arup_official_08/',
      svg: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      glow: 'rgba(225, 48, 108, 0.25)'
    },
    {
      name: 'facebook',
      label: 'Facebook',
      url: 'https://www.facebook.com/arupofficial08',
      svg: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      glow: 'rgba(24, 119, 242, 0.25)'
    },
    {
      name: 'email',
      label: 'Email',
      url: 'mailto:arupdas080425@gmail.com',
      svg: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      glow: 'rgba(184, 144, 42, 0.25)'
    }
  ];

  // Setup Framer Motion scroll hook for Hero parallax (reduced by 80% for scroll performance)
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 30]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 500ms loading screen for fast interaction
    return () => clearTimeout(timer);
  }, []);

  const stagesInfo = {
    Single: {
      title: 'Solo Wealth Generation',
      subtitle: 'Lay a sovereign financial foundation.',
      color: T.sky,
      icon: '⚡',
      bullets: [
        { label: 'Personal Wealth Allocation', desc: 'Calibrate your income for solo compounding.' },
        { label: 'Career Trajectory Indexing', desc: 'Align savings targets with professional growth milestones.' },
        { label: 'Investment Sandbox Simulations', desc: 'Test compound parameters risk-free before deployment.' }
      ]
    },
    Committed: {
      title: 'Synchronized Growth',
      subtitle: 'Merge accounts and dream collaboratively.',
      color: '#D05C72', // Rose
      icon: '💑',
      bullets: [
        { label: 'Shared Milestones Planner', desc: 'Co-design financial targets like weddings, homes, or trips.' },
        { label: 'Dual-Engine Income Ledger', desc: 'Consolidate multiple salaries into an elegant combined tracker.' },
        { label: 'Cryptographic Partner Sync', desc: 'Secure connection using peer-to-peer EverBond IDs.' }
      ]
    },
    Married: {
      title: 'Generational Dynasties',
      subtitle: 'Build robust safety nets for your legacy.',
      color: T.goldMid,
      icon: '💍',
      bullets: [
        { label: 'Multi-Generational Wealth Caps', desc: 'Design resilient trust structures and family parameters.' },
        { label: 'Child Launchpad Strategies', desc: 'Map future education, startup, and growth capital indexes.' },
        { label: 'Retirement Sovereign Milestones', desc: 'Simulate early exit targets with dual-life considerations.' }
      ]
    },
    Freedom: {
      title: 'Sovereign Financial Freedom',
      subtitle: 'Achieve true capital autonomy.',
      color: '#3E8E68', // Sage
      icon: '🌿',
      bullets: [
        { label: 'Passive Growth Dominance', desc: 'Watch your compounding capital fund your lifestyle.' },
        { label: 'Legacy & Trust Structuring', desc: 'Pass down wealth seamlessly across generations.' },
        { label: 'Venture & Endowment Planning', desc: 'Support meaningful projects and philanthropic goals.' }
      ]
    }
  };

  const stepDetails = [
    {
      num: '01',
      title: 'Calibrate Your Profile',
      badge: 'Profile Creation',
      desc: 'Define your relationship status (Single, Committed, or Married) and choose your preferred regional currency rules.'
    },
    {
      num: '02',
      title: 'Establish Secure Partner Sync',
      badge: 'Synergy Connection',
      desc: 'Generate a unique cryptographic EverBond ID. Connect securely with your partner to merge dashboards instantly.'
    },
    {
      num: '03',
      title: 'Compound & Prosper Together',
      badge: 'Wealth Acceleration',
      desc: 'Simulate multi-year compound trajectories, track milestones, and orchestrate joint savings dynamically.'
    }
  ];

  const features = [
    {
      title: 'Sovereign Dashboard',
      icon: <LayoutDashboard size={20} />,
      desc: 'Comprehensive visualizer for personal or joint cash flow, showing detailed compound parameters.'
    },
    {
      title: 'Dynamic Goal Tracking',
      icon: <Target size={20} />,
      desc: 'Define granular financial targets with intelligent progression meters and dynamic date-to-success metrics.'
    },
    {
      title: 'Milestone Architecture',
      icon: <Milestone size={20} />,
      desc: 'Map out major life events such as buying a home, starting a family, or launching a venture with smart alerts.'
    },
    {
      title: 'Compound Sandbox',
      icon: <TrendingUp size={20} />,
      desc: 'Project wealth growth up to 40 years. Test diverse asset classes and simulated market return scenarios.'
    },
    {
      title: 'Relationship Timeline',
      icon: <Calendar size={20} />,
      desc: 'A gorgeous chronological flow of milestones, savings targets, and financial achievements secured together.'
    },
    {
      title: 'Partner Link System',
      icon: <Users size={20} />,
      desc: 'P2P invite ledger for real-time synchronization. Exchange data securely with your partner.'
    },
    {
      title: 'Legacy Family Planning',
      icon: <Award size={20} />,
      desc: 'Orchestrate multi-generation wealth pools. Model child education and trust allocations in simple grids.'
    },
    {
      title: 'Financial Health Auditing',
      icon: <Shield size={20} />,
      desc: 'Gain instant feedback on asset distribution health and dynamic compound speed indexes.'
    }
  ];

  const futurePreviews = [
    { title: 'Shared Couple Dashboard', desc: 'Zero-knowledge combined ledger.' },
    { title: 'Joint Wealth Planning', desc: 'Co-simulate multi-asset portfolios.' },
    { title: 'Family Wealth Center', desc: 'Unified trust & minor account oversight.' },
    { title: 'Couple Verification', desc: 'Cryptographic validation of shared goals.' },
    { title: 'Shared Financial Goals', desc: 'Interactive split savings engines.' }
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.35, ease: 'easeInOut' }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--bg)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Logo size={80} showText={false} />
            </motion.div>
            <div style={{ width: '120px', height: '3px', background: 'var(--border-mid)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '0%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '100%',
                  background: 'linear-gradient(90deg, var(--gold-mid), var(--gold))'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="lp-container premium-bg-shift" 
        style={{
          color: 'var(--text)',
          width: '100%',
          minHeight: '100vh',
          fontFamily: T.fontBody,
          position: 'relative',
        }}
      >

        {/* Landing Page Sticky Header Navbar */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '70px',
            background: theme === 'dark' ? 'rgba(18, 17, 14, 0.75)' : 'rgba(250, 246, 238, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            zIndex: 100,
            transition: 'background 0.3s ease',
            gap: '16px'
          }}
          className="lp-header"
        >
          {isInstalled ? (
            <button
              disabled
              style={{
                padding: '8px 20px',
                borderRadius: '100px',
                border: '1.5px solid var(--border-mid)',
                background: 'transparent',
                color: 'var(--text-faint)',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'not-allowed',
                opacity: 0.6
              }}
              className="lp-header-install-btn"
            >
              <Check size={14} />
              <span className="install-btn-text">Installed</span>
            </button>
          ) : isInstallable ? (
            <motion.button
              whileHover={{ 
                scale: 1.02,
                borderColor: T.gold,
                boxShadow: '0 0 10px rgba(184, 144, 42, 0.15)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPopup(true)}
              style={{
                padding: '8px 20px',
                borderRadius: '100px',
                border: `1.5px solid ${T.goldMid}`,
                background: 'transparent',
                color: T.gold,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--sh-xs)'
              }}
              className="lp-header-install-btn"
            >
              <Download size={14} />
              <span className="install-btn-text">Install App</span>
            </motion.button>
          ) : null}

          <ThemeToggle />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoginClick}
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              border: '1.5px solid var(--border-mid)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--sh-xs)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Login
          </motion.button>
        </header>

      {/* ── SECTION 1: HERO SECTION ── */}
      <motion.section 
        style={{
          y: heroY,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        
        {/* Brand Header — Premium Page Load Fade-in + Upwards Motion & Subtle Scale */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={!isLoading ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '60px' }}
        >
          <Logo size={48} showText={true} />
        </motion.div>

        {/* Headline — Premium Staggered Luxury Line-by-Line Reveal */}
        <h1 
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 auto 24px',
            color: 'var(--text)'
          }}
        >
          <motion.span 
            variants={line1Variants} 
            initial="hidden" 
            animate={!isLoading ? "visible" : "hidden"} 
            style={{ display: 'block' }}
          >
            Build Wealth Through
          </motion.span>
          <motion.span 
            variants={line2Variants} 
            initial="hidden" 
            animate={!isLoading ? "visible" : "hidden"} 
            style={{ display: 'block' }}
          >
            Every Stage of{" "}
            <span style={{ position: 'relative', display: 'inline-block', fontStyle: 'italic', fontWeight: '400', fontFamily: T.fontDisplay }}>
              Life
              <svg style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '12px' }} viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path 
                  d="M0,7 C30,2 70,2 100,7" 
                  stroke={T.goldMid} 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round" 
                  initial={{ pathLength: 0 }}
                  animate={!isLoading ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                />
              </svg>
            </span>
          </motion.span>
        </h1>

        {/* Dynamic Selector Relationship Stage Chips with Soft Hover Glow, Scale, & 4-second Gold/Accent Pulse */}
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={!isLoading ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}
        >
          {['Single', 'Committed', 'Married'].map((stageName) => {
            const isActive = activeStage === stageName;
            const colors = {
              Single: T.sky,
              Committed: '#D05C72',
              Married: T.goldMid
            };
            const activeColor = colors[stageName];

            return (
              <motion.button 
                key={stageName}
                onClick={() => setActiveStage(stageName)}
                className={isActive ? "stage-badge-selected" : ""}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `0 2px 8px rgba(201, 168, 76, 0.1)`,
                  borderColor: T.goldMid
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isActive ? T.goldMid : 'var(--border)'}`,
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: isActive ? T.goldMid : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'color 0.3s ease, border-color 0.3s ease'
                }}
              >
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: activeColor
                }} />
                {stageName}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 48px'
          }}
        >
          A relationship-driven financial platform designed to help individuals, couples, and families align goals, project futures, and grow together.
        </motion.p>

        {/* CTAs */}
        <div 
          className="hero-ctas-container"
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <MagneticContainer>
            <motion.button 
              onClick={onStartJourney}
              className="btn-primary premium-btn-primary"
              initial={{ opacity: 0, y: 12 }}
              animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 1.0 }}
              whileHover="hover"
              whileTap="tap"
              variants={{
                idle: { y: 0 },
                hover: { 
                  y: -3, 
                  boxShadow: '0 10px 25px rgba(184, 144, 42, 0.25), 0 0 15px rgba(184, 144, 42, 0.15)' 
                },
                tap: { scale: 0.96 }
              }}
              style={{
                padding: '0 36px',
                fontSize: '0.98rem',
                borderRadius: '100px',
                height: '52px',
                boxSizing: 'border-box',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                width: 'auto',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--sh-gold)',
                outline: 'none',
                transition: 'box-shadow 0.2s ease, transform 0.1s ease'
              }}
            >
              Start Your Journey 
              <motion.span 
                variants={arrowVariants} 
                animate="idle" 
                style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </motion.button>
          </MagneticContainer>
          
          <MagneticContainer>
            <motion.a 
              href="#features"
              className="btn-secondary"
              initial={{ opacity: 0, y: 12 }}
              animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 1.15 }}
              whileHover={{
                y: -2,
                borderColor: T.goldMid,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04), 0 0 10px rgba(184, 144, 42, 0.08)',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(28, 26, 22, 0.04)'
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '0 32px',
                fontSize: '0.92rem',
                borderRadius: '100px',
                height: '52px',
                boxSizing: 'border-box',
                fontWeight: 700,
                border: '1.5px solid var(--border-mid)',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(28, 26, 22, 0.02)',
                color: 'var(--text)',
                textDecoration: 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--sh-xs)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              Explore Features
            </motion.a>
          </MagneticContainer>

          {isInstalled ? (
            <MagneticContainer>
              <button
                disabled
                style={{
                  padding: '0 32px',
                  fontSize: '0.92rem',
                  borderRadius: '100px',
                  height: '52px',
                  boxSizing: 'border-box',
                  fontWeight: 700,
                  border: '1.5px solid var(--border-mid)',
                  background: 'transparent',
                  color: 'var(--text-faint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  outline: 'none'
                }}
                className="btn-secondary"
              >
                <Check size={18} />
                Installed
              </button>
            </MagneticContainer>
          ) : isInstallable ? (
            <MagneticContainer>
              <motion.button 
                onClick={() => setShowPopup(true)}
                className="btn-secondary"
                initial={{ opacity: 0, y: 12 }}
                animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 1.3 }}
                whileHover={{
                  y: -2,
                  borderColor: T.goldMid,
                  boxShadow: '0 6px 16px rgba(184, 144, 42, 0.1), 0 0 10px rgba(184, 144, 42, 0.08)',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(28, 26, 22, 0.04)'
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '0 32px',
                  fontSize: '0.92rem',
                  borderRadius: '100px',
                  height: '52px',
                  boxSizing: 'border-box',
                  fontWeight: 700,
                  border: `1.5px solid ${T.goldBorder}`,
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(28, 26, 22, 0.02)',
                  color: 'var(--text)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: 'var(--sh-xs)',
                  outline: 'none'
                }}
              >
                <Download size={18} />
                Install App
              </motion.button>
            </MagneticContainer>
          ) : null}
        </div>

        {/* Animated Scroll Indicator (↓ Explore More with Luxury Pulse) */}
        <motion.div 
          animate={{ 
            y: [0, 6, 0],
            opacity: [0.35, 0.8, 0.35]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            marginTop: '48px',
            zIndex: 10,
            textAlign: 'center'
          }}
        >
          <a href="#journey" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
              ↓ Explore More
            </span>
            <div style={{ width: '1px', height: '32px', background: 'var(--border-str)', margin: '0 auto' }} />
          </a>
        </motion.div>
      </motion.section>

      {/* ── SECTION 2: LIFE JOURNEY VISUAL ── */}
      <motion.section
        id="journey"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionScrollVariants}
        style={{
        padding: '100px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Dynamic Pathing</span>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
            Your Financial Journey Evolves With You
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '540px', margin: '12px auto 0' }}>
            As your relationships expand and transition, EverBond calibrates a custom ledger and trajectory for your exact life stage.
          </p>
        </div>

        {/* Timeline Navigation */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto 48px',
          padding: '0 20px',
          zIndex: 2
        }}>
          {/* Connector Line Backdrop */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            height: '2px',
            background: 'var(--border-mid)',
            zIndex: -1
          }} />

          {/* Connected Highlight Line */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            height: '2px',
            background: `linear-gradient(90deg, ${T.sky}, #D05C72, ${T.goldMid}, #3E8E68)`,
            opacity: 0.35,
            zIndex: -1
          }} />

          {Object.keys(stagesInfo).map((stg) => {
            const isActive = activeStage === stg;
            const stgColor = stagesInfo[stg].color;
            return (
              <button
                key={stg}
                onClick={() => setActiveStage(stg)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: `2px solid ${isActive ? stgColor : 'var(--border-mid)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: isActive ? `0 0 15px ${stgColor}35` : 'var(--sh-xs)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {stagesInfo[stg].icon}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text)' : 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s ease'
                }}>
                  {stg}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Display Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-lg)' }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: T.radius,
              padding: '40px',
              maxWidth: '850px',
              margin: '0 auto',
              boxShadow: 'var(--sh-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glow accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: stagesInfo[activeStage].color
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: '2.5rem',
                  background: 'var(--bg-warm)',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '20px',
                  marginBottom: '20px'
                }}>
                  {stagesInfo[activeStage].icon}
                </span>
                <h3 style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  {stagesInfo[activeStage].title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}>
                  {stagesInfo[activeStage].subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {stagesInfo[activeStage].bullets.map((bullet, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ marginTop: '3px' }}>
                      <Check size={16} style={{ color: stagesInfo[activeStage].color }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                        {bullet.label}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {bullet.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ── SECTION 3: HOW EVERBOND WORKS ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionScrollVariants}
        style={{
        padding: '100px 24px',
        background: 'var(--bg-warm)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Clear Blueprint</span>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
              Three Simple Steps
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '500px', margin: '12px auto 0' }}>
              Setting up your family asset calibration takes less than four minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {stepDetails.map((step, idx) => (
              <motion.div
                whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: T.radius,
                  padding: '36px 30px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Big steps counter in background */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '20px',
                  fontFamily: T.fontDisplay,
                  fontSize: '5rem',
                  fontWeight: 800,
                  opacity: theme === 'dark' ? 0.04 : 0.06,
                  color: T.goldMid,
                  userSelect: 'none'
                }}>
                  {step.num}
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'var(--bg-warm)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  color: T.gold,
                  display: 'inline-block',
                  marginBottom: '16px'
                }}>
                  {step.badge}
                </span>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '12px',
                  lineHeight: 1.3
                }}>
                  {step.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </motion.section>

      {/* ── SECTION 4: FEATURE SHOWCASE (BENTO GRID) ── */}
      <section
        id="features"
        style={{
        padding: '100px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Product Capabilities</span>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
            Engineered for Luxury Financial Growth
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '500px', margin: '12px auto 0' }}>
            Every tool is designed to deliver absolute transparency and visual clarity to your shared wealth.
          </p>
        </div>

        {/* Premium Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px'
        }}>
          {/* Card 1: Wealth Dashboard (Double Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 8',
              minHeight: '260px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--sh-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.06) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <div>
              <div style={{ color: T.gold, marginBottom: '14px', background: 'var(--bg-warm)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {features[0].icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{features[0].title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '440px' }}>{features[0].desc}</p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: T.gold,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '20px'
            }}>
              <span>Live Engine Calibrated</span> <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: T.goldMid }} /> <span>Active UI</span>
            </div>
          </motion.div>

          {/* Card 2: Goal Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 4',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '32px',
              boxShadow: 'var(--sh-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div>
              <div style={{ color: '#D05C72', marginBottom: '14px', background: 'var(--bg-warm)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {features[1].icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{features[1].title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[1].desc}</p>
            </div>
          </motion.div>

          {/* Card 3: Milestone Planning */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 4',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '32px',
              boxShadow: 'var(--sh-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div>
              <div style={{ color: T.sky, marginBottom: '14px', background: 'var(--bg-warm)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {features[2].icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{features[2].title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[2].desc}</p>
            </div>
          </motion.div>

          {/* Card 4: Investment Simulation (Double Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 8',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--sh-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-20px',
              width: '160px',
              height: '160px',
              background: 'radial-gradient(circle, rgba(74, 140, 196, 0.06) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <div>
              <div style={{ color: T.gold, marginBottom: '14px', background: 'var(--bg-warm)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {features[3].icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{features[3].title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '440px' }}>{features[3].desc}</p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: T.sky,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '20px'
            }}>
              <span>40-Year Horizon Sandbox</span>
            </div>
          </motion.div>

          {/* Card 5: Relationship Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 3',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '24px',
              boxShadow: 'var(--sh-xs)',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ color: T.goldMid, marginBottom: '12px' }}>{features[4].icon}</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{features[4].title}</h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[4].desc}</p>
          </motion.div>

          {/* Card 6: Partner Connection */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 3',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '24px',
              boxShadow: 'var(--sh-xs)',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ color: '#D05C72', marginBottom: '12px' }}>{features[5].icon}</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{features[5].title}</h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[5].desc}</p>
          </motion.div>

          {/* Card 7: Family Wealth Planning */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 3',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '24px',
              boxShadow: 'var(--sh-xs)',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ color: '#3E8E68', marginBottom: '12px' }}>{features[6].icon}</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{features[6].title}</h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[6].desc}</p>
          </motion.div>

          {/* Card 8: Financial Growth Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
            style={{
              gridColumn: 'span 3',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: T.radius,
              padding: '24px',
              boxShadow: 'var(--sh-xs)',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ color: T.sky, marginBottom: '12px' }}>{features[7].icon}</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{features[7].title}</h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{features[7].desc}</p>
          </motion.div>
        </div>

        {/* CSS responsive bento fallback inline for mobile */}
        <style dangerouslySetInnerHTML={{__html: `
          @media(max-width: 850px) {
            .lp-container div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
            .lp-container div[style*="grid-column: span"] {
              grid-column: span 12 !important;
            }
          }
        `}} />
      </section>

      {/* ── SECTION 5: WHY EVERBOND IS DIFFERENT ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionScrollVariants}
        style={{
        padding: '100px 24px',
        background: 'var(--bg-warm)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Comparison Matrix</span>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
              Not Just Another Finance App
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '500px', margin: '12px auto 0' }}>
              Why generic spreadsheet planners fail relationship psychology.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '30px', alignItems: 'stretch' }}>
            {/* Traditional Apps Column */}
            <motion.div 
              whileHover={{ y: -2, scale: 1.005, boxShadow: 'var(--sh-md)' }}
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                borderRadius: T.radius,
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                opacity: 0.8,
                transition: 'all 0.3s ease'
              }}
            >
              <h3 style={{
                fontFamily: T.fontDisplay,
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#D9667A' }}>❌</span> Traditional Finance Apps
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Generic Budgeting', desc: 'Forces standard 50/30/20 buckets without respecting relationship dynamics.' },
                  { label: 'Identical UI Paradigms', desc: 'Treats a married family and a solo graduate with the exact same calculations.' },
                  { label: 'Zero Partner Synchronization', desc: 'No integrated cryptographic link, requiring manual entries or CSV trading.' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>{item.label}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* EverBond Wealth Column */}
            <motion.div 
              whileHover={{ y: -2, scale: 1.01, boxShadow: '0 8px 20px rgba(184,144,42,0.1)' }}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${T.goldMid}`,
                borderRadius: T.radius,
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                boxShadow: 'var(--sh-gold)',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Gold Ribbon tag */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: T.goldPale,
                border: `1px solid ${T.goldBorder}`,
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: T.gold,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Acoustic Standard
              </div>

              <h3 style={{
                fontFamily: T.fontDisplay,
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--text)',
                borderBottom: `1px solid ${T.goldBorder}`,
                paddingBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#3E8E68' }}>✅</span> EverBond Wealth
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Relationship-Driven Core', desc: 'Engineered specifically around shared savings psychology and combined financial goals.' },
                  { label: 'Life-Stage Adaptation', desc: 'Dynamically structures your ledger based on whether you are Single, Committed, or Married.' },
                  { label: 'Cryptographic Partner Sync', desc: 'Secure invitation linking lets you connect dashboards in one click with end-to-end sovereignty.' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{item.label}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </motion.section>

      {/* ── SECTION 6: FUTURE SHARED FEATURES ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionScrollVariants}
        style={{
        padding: '100px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Ecosystem Roadmap</span>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
            Unlock More Together
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '500px', margin: '12px auto 0' }}>
            Preview upcoming sovereign tools being engineered for couples and families.
          </p>
        </div>

        {/* Future Previews Flex Grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center'
        }}>
          {futurePreviews.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-md)' }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '280px',
                flex: '1 1 300px',
                maxWidth: '360px',
                opacity: 0.72,
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease, background-color 0.3s ease'
              }}
            >
              <div style={{
                background: 'var(--bg-warm)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.goldMid
              }}>
                <Lock size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── SECTION 7: CREATOR SECTION ── */}
      <section
        id="creator-vision"
        style={{
        padding: '100px 24px',
        background: 'var(--bg-warm)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.gold }}>Built With Vision</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: 'var(--sh-lg)' }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: T.radius,
              padding: '48px',
              boxShadow: 'var(--sh-md)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              textAlign: 'center'
            }}
          >
            {/* Soft backdrop radial light */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.08) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }} />

            {/* Profile Avatar placeholder with initials */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ display: 'inline-block', margin: '0 auto' }}
            >
              {!imgFailed ? (
                <img
                  src="/AD.jpeg"
                  alt="Arup Das"
                  className="vision-profile-img"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--sh-gold)',
                  border: '3px solid #fff'
                }}>
                  <span style={{ color: '#fff', fontSize: '1.8rem', fontFamily: T.fontDisplay, fontWeight: 700 }}>AD</span>
                </div>
              )}
            </motion.div>

            <div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Arup Das</h3>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Student Developer · UI/UX Enthusiast · Future Fintech Builder
              </p>
            </div>

            <p style={{
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
              fontFamily: T.fontDisplay
            }}>
              <QuoteReveal text='"I built EverBond Wealth to make financial planning more personal, relationship-driven, and meaningful. Before you commit your capital, align your dreams."' />
            </p>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 8: FINAL CTA ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionScrollVariants}
        style={{
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        
        {/* Soft background light */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(184, 144, 42, 0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        <h2 style={{
          fontFamily: T.fontDisplay,
          fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '24px'
        }}>
          Start Building Your Financial Future Today
        </h2>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          maxWidth: '520px',
          margin: '0 auto 40px'
        }}>
          Calibrate your personal trajectory, align with your partner, and compound family wealth safely.
        </p>

        <MagneticContainer>
          <motion.button 
            onClick={onStartJourney}
            className="btn-primary premium-btn-primary"
            whileHover="hover"
            whileTap="tap"
            variants={{
              idle: { y: 0 },
              hover: { 
                y: -3, 
                boxShadow: '0 10px 25px rgba(184, 144, 42, 0.25), 0 0 15px rgba(184, 144, 42, 0.15)' 
              },
              tap: { scale: 0.96 }
            }}
            style={{
              padding: '0 40px',
              fontSize: '1.02rem',
              borderRadius: '100px',
              height: '52px',
              boxSizing: 'border-box',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
              width: 'auto',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: 'var(--sh-gold)',
              outline: 'none',
              transition: 'box-shadow 0.2s ease, transform 0.1s ease'
            }}
          >
            Start Your Journey 
            <motion.span 
              variants={arrowVariants} 
              animate="idle" 
              style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}
            >
              <ArrowRight size={18} />
            </motion.span>
          </motion.button>
        </MagneticContainer>
      </motion.section>

      {/* ── SECTION 9: FOOTER ── */}
      <footer style={{
        padding: '60px 24px 80px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        background: 'var(--bg)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
          
          <Logo size={36} showText={true} />

          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-faint)',
            fontStyle: 'italic',
            fontFamily: T.fontDisplay,
            letterSpacing: '0.05em'
          }}>
            Plan Together. Grow Together. Prosper Together.
          </p>

          {/* Policy Links Row */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            marginBottom: '8px'
          }}>
            <button onClick={() => onOpenPolicy('terms')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Terms of Service</button>
            <span style={{ color: 'var(--border-mid)' }}>•</span>
            <button onClick={() => onOpenPolicy('privacy')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Privacy Policy</button>
            <span style={{ color: 'var(--border-mid)' }}>•</span>
            <button onClick={() => onOpenPolicy('cookie')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Cookie Policy</button>
            <span style={{ color: 'var(--border-mid)' }}>•</span>
            <button onClick={() => onOpenPolicy('data-handling')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Data Handling</button>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', maxWidth: '240px', height: '1px', background: 'var(--border-mid)', margin: '12px auto' }} />

          {/* Social Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              Follow Development Journey
            </span>

            <div 
              style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {socialLinks.map((social) => {
                const isHovered = hoveredSocial === social.name;

                return (
                  <div key={social.name} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      onMouseEnter={() => setHoveredSocial(social.name)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      onFocus={() => setHoveredSocial(social.name)}
                      onBlur={() => setHoveredSocial(null)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border-mid)',
                        background: isHovered ? 'var(--bg-card)' : 'transparent',
                        borderColor: isHovered ? T.goldMid : 'var(--border-mid)',
                        color: isHovered ? T.gold : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isHovered ? `0 0 16px ${social.glow}` : 'none',
                        transition: 'color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {social.svg}
                    </motion.a>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            marginBottom: '8px',
                            padding: '6px 12px',
                            background: 'var(--bg-card)',
                            border: '1.5px solid var(--border-mid)',
                            color: 'var(--text)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            boxShadow: 'var(--sh-md)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 10
                          }}
                        >
                          {social.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              margin: 0,
              fontFamily: T.fontBody
            }}>
              Built in India 🇮🇳 • Designed for Global Wealth Planning
            </p>
            <p style={{
              fontSize: '0.76rem',
              color: 'var(--text-faint)',
              margin: 0,
              fontFamily: T.fontBody
            }}>
              © 2026 EverBond Wealth. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Custom PWA Mini Install Prompt Popup */}
      <AnimatePresence>
        {showPopup && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'rgba(18, 17, 14, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            {/* Backdrop click closer */}
            <div 
              style={{ position: 'absolute', inset: 0 }} 
              onClick={() => setShowPopup(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: 'var(--sh-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Logo container */}
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--gold-pale)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  border: '1px solid var(--gold-border)'
                }}
              >
                <Logo size={32} showText={false} />
              </div>

              <h3 
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}
              >
                Install EverBond Wealth?
              </h3>

              <p 
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '28px',
                }}
              >
                Access your financial workspace directly from your desktop and mobile device.
              </p>

              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%'
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={triggerInstallFlow}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--sh-gold)'
                  }}
                >
                  Install
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPopup(false)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    border: '1.5px solid var(--border-mid)',
                    cursor: 'pointer'
                  }}
                >
                  Not Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Install Suggestion */}
      <AnimatePresence>
        {showMobileSuggest && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '16px',
              right: '16px',
              zIndex: 9999,
              background: 'var(--bg-card)',
              border: '1.5px solid var(--gold-border)',
              borderRadius: '18px',
              padding: '16px',
              boxShadow: 'var(--sh-lg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              pointerEvents: 'auto'
            }}
          >
            {/* App Mini Logo */}
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gold-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--gold-border)',
                flexShrink: 0
              }}
            >
              <Logo size={20} showText={false} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                EverBond App
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Install for quick standalone access.
              </p>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowPopup(true);
                dismissMobileSuggest();
              }}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '100px',
                background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Install
            </motion.button>

            {/* Close Button */}
            <button
              onClick={dismissMobileSuggest}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-faint)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
    </>
  );
}
