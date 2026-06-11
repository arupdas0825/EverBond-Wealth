import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from './store/useFinanceStore';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { FloatingNav } from './components/layout/FloatingNav';
import { ProfileChip } from './components/layout/ProfileChip';
import { MobileNav } from './components/layout/MobileNav';
import { Logo } from './components/common/Logo';
import { ThemeToggle } from './components/common/ThemeToggle';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { ToastProvider } from './components/common/Toast';
import { CookieConsent } from './components/common/CookieConsent';
import { PrivacyDrawer } from './components/common/PrivacyDrawer';
import { ResetModal } from './components/common/ResetModal';
import { RouteGuardScreen } from './components/common/RouteGuardScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

/* ═══════════════════════════════════════════════════════════
   LAZY-LOADED PAGE COMPONENTS
   Each page is loaded on-demand when first navigated to.
   This cuts the initial JS bundle by ~60% (from 1.3MB to ~520KB).
   Subsequent navigations are near-instant from browser cache.
═══════════════════════════════════════════════════════════ */
const Dashboard         = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const WealthInsightsPage = lazy(() => import('./components/insights/WealthInsightsPage').then(m => ({ default: m.WealthInsightsPage })));
const IncomePage        = lazy(() => import('./components/income/IncomePage').then(m => ({ default: m.IncomePage })));
const AllocationPage    = lazy(() => import('./components/allocation/AllocationPage').then(m => ({ default: m.AllocationPage })));
const GoalsPage         = lazy(() => import('./components/goals/GoalsPage').then(m => ({ default: m.GoalsPage })));
const MilestonePage     = lazy(() => import('./components/milestones/MilestonePage').then(m => ({ default: m.MilestonePage })));
const SimulationPage    = lazy(() => import('./components/simulation/SimulationPage').then(m => ({ default: m.SimulationPage })));
const PartnerPage       = lazy(() => import('./components/partner/PartnerPage').then(m => ({ default: m.PartnerPage })));
const WorkspacePage     = lazy(() => import('./components/workspace/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const CouplePlanningPage = lazy(() => import('./components/welcome/CouplePlanningPage').then(m => ({ default: m.CouplePlanningPage })));
const FamilyPlanningPage = lazy(() => import('./components/welcome/FamilyPlanningPage').then(m => ({ default: m.FamilyPlanningPage })));
const SettingsPage      = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage       = lazy(() => import('./components/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DocumentationPage = lazy(() => import('./components/docs/DocumentationPage').then(m => ({ default: m.DocumentationPage })));

/* ═══════════════════════════════════════════════════════════
   LIGHTWEIGHT SUSPENSE FALLBACK
   Shows a subtle shimmer skeleton while lazy chunks load.
   No layout shift, no spinner — just a gentle fade.
═══════════════════════════════════════════════════════════ */
function PageSkeleton() {
  return (
    <div style={{
      width: '100%',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      opacity: 0.4,
      animation: 'fadeUp 0.2s ease both',
    }}>
      <div style={{ width: '200px', height: '28px', borderRadius: '8px', background: 'var(--bg-muted)' }} />
      <div style={{ width: '320px', height: '16px', borderRadius: '6px', background: 'var(--bg-muted)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginTop: '8px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: '120px', borderRadius: '18px', background: 'var(--bg-muted)' }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Onboarding Guard & Protected Route System
 */
function OnboardingGuard({ children }) {
  const onboardingComplete = useFinanceStore(s => s.onboardingComplete);
  
  return (
    <AnimatePresence mode="wait">
      {!onboardingComplete ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            filter: 'blur(10px)',
            scale: 0.96,
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ThemeToggle />
          <WelcomeScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.02 }}
          style={{ width: '100%', height: '100%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CursorSpotlight — GPU-accelerated, zero React re-renders.
 * Uses refs + requestAnimationFrame to update a DOM element directly.
 * No setState on mousemove = no virtual DOM diffing on every pixel.
 */
function CursorSpotlight() {
  const spotRef = useRef(null);
  const posRef = useRef({ x: -200, y: -200 });
  const visibleRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    const tick = () => {
      if (spotRef.current && visibleRef.current) {
        spotRef.current.style.transform = 
          `translate3d(${posRef.current.x - 150}px, ${posRef.current.y - 150}px, 0)`;
        spotRef.current.style.opacity = '1';
      }
      rafRef.current = null;
    };

    const handleMouseMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
      }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      if (spotRef.current) spotRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201, 168, 76, 0.035) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0,
        willChange: 'transform',
        transform: 'translate3d(-200px, -200px, 0)',
        transition: 'opacity 0.2s ease',
      }}
    />
  );
}

/**
 * Renders the active page component. Wrapped in Suspense so
 * lazy-loaded chunks show the skeleton fallback during load.
 */
function PageRenderer({ page, setPage, setActivePolicyDoc, setShowResetModal }) {
  const { relationshipStatus, partnerLinked, setStage } = useFinanceStore();
  const status = relationshipStatus || 'Single';

  // 1. Guard against Single Journey
  if (page === 'single') {
    if (status === 'Committed') {
      return (
        <RouteGuardScreen 
          title="Single Journey Locked"
          description="Committed accounts cannot access Single Journey mode. Downgrades are not permitted."
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (status === 'Married') {
      return (
        <RouteGuardScreen 
          title="Single Journey Unavailable"
          description="This account is configured for Family Dynasty planning."
          onBack={() => setPage('dashboard')}
        />
      );
    }
  }

  // 2. Guard against Committed Partner page
  if (page === 'partner' || page === 'partner-committed') {
    if (status === 'Single') {
      return (
        <RouteGuardScreen 
          title="Committed Partner Locked"
          description="Upgrade your financial journey to a verified partner experience to unlock shared planning and dual-income wealth management."
          onAction={() => {
            setStage('Committed');
            setPage('partner-committed');
          }}
          actionText="Upgrade Journey"
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (status === 'Married') {
      return (
        <RouteGuardScreen 
          title="Committed Partner Unavailable"
          description="This account is configured for Family Dynasty planning."
          onBack={() => setPage('dashboard')}
        />
      );
    }
  }

  // 3. Guard against Family Dynasty page
  if (page === 'partner-family' || page === 'family-planning') {
    if (status === 'Single') {
      return (
        <RouteGuardScreen 
          title="Family Dynasty Locked"
          description="Build a verified family connection to unlock multi-generational wealth planning and legacy management."
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (status === 'Committed') {
      if (!partnerLinked) {
        return (
          <RouteGuardScreen 
            title="Family Dynasty Locked"
            description="Build a verified family connection to unlock multi-generational wealth planning and legacy management."
            lockReason="Connect your partner to unlock Family Dynasty."
            onAction={() => setPage('partner-committed')}
            actionText="Connect Partner"
            onBack={() => setPage('dashboard')}
          />
        );
      }
    }
    if (status === 'Married') {
      if (!partnerLinked) {
        return (
          <RouteGuardScreen 
            title="Family Dynasty Locked"
            description="Build a verified family connection to unlock multi-generational wealth planning and legacy management."
            lockReason="Please connect a spouse node to activate Family Dynasty."
            onBack={() => setPage('dashboard')}
          />
        );
      }
    }
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':       return <Dashboard setPage={setPage} />;
      case 'insights':        return <WealthInsightsPage />;
      case 'income':          return <IncomePage />;
      case 'allocation':      return <AllocationPage />;
      case 'goals':           return <GoalsPage />;
      case 'milestones':      return <MilestonePage />;
      case 'simulation':      return <SimulationPage />;
      case 'partner':         return <PartnerPage setPage={setPage} />;
      case 'partner-committed': return <PartnerPage setPage={setPage} />;
      case 'workspace':       return <WorkspacePage />;
      case 'couple-planning': return <CouplePlanningPage />;
      case 'family-planning': return <FamilyPlanningPage setPage={setPage} />;
      case 'partner-family':    return <FamilyPlanningPage setPage={setPage} />;
      case 'settings':        return <SettingsPage setActivePolicyDoc={setActivePolicyDoc} setPage={setPage} />;
      case 'profile':         return <ProfilePage />;
      case 'documentation':   return <DocumentationPage />;
      default:                return <Dashboard setPage={setPage} />;
    }
  };

  const getPageTitle = (p) => {
    const mapping = {
      'dashboard': 'Dashboard',
      'insights': 'Wealth Insights',
      'income': 'Income Ledger',
      'allocation': 'Asset Allocation',
      'goals': 'Financial Goals',
      'milestones': 'Milestones & Targets',
      'simulation': 'Wealth Simulation',
      'partner': 'Committed Partner Journey',
      'partner-committed': 'Committed Partner Journey',
      'workspace': 'Family Dynasty Workspace',
      'couple-planning': 'Couple Planning',
      'family-planning': 'Family Dynasty',
      'partner-family': 'Family Dynasty',
      'settings': 'Settings & Policy',
      'profile': 'Profile & Identity',
      'documentation': 'Documentation'
    };
    return mapping[p] || 'EverBond Section';
  };

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ErrorBoundary
        key={page}
        title={`${getPageTitle(page)} Unavailable`}
        description={`The ${getPageTitle(page)} module encountered an unexpected error. You can continue using the rest of the application.`}
        showDashboardButton={page !== 'dashboard'}
        setPage={setPage}
      >
        {renderPage()}
      </ErrorBoundary>
    </Suspense>
  );
}

export default function App() {
  const theme = useFinanceStore(s => s.theme);
  const initEverBondId = useFinanceStore(s => s.initEverBondId);
  const [page, setPage] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [activePolicyDoc, setActivePolicyDoc] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleConfirmReset = useCallback(() => {
    const storeReset = useFinanceStore.getState().reset;
    storeReset();
    localStorage.removeItem('eb_v6');
    setShowResetModal(false);
    window.location.reload();
  }, []);

  // Initialize EverBond ID on first load
  useEffect(() => { initEverBondId(); }, []);

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Reset scroll on initial load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Reset scroll on page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  // Synchronize URL hash with page state for hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'single') setPage('single');
      else if (hash === 'partner' || hash === 'partner-committed') setPage('partner-committed');
      else if (hash === 'family-dynasty' || hash === 'partner-family') setPage('partner-family');
      else if (hash) setPage(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Sync initial hash
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when state changes
  useEffect(() => {
    let path = page;
    if (page === 'partner-committed') path = 'partner';
    else if (page === 'partner-family') path = 'family-dynasty';
    if (window.location.hash !== `#/${path}`) {
      window.location.hash = `#/${path}`;
    }
  }, [page]);

  // Throttled resize listener (1 update per animation frame max)
  useEffect(() => {
    let raf = null;
    const handleResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
        raf = null;
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <ToastProvider>
      <CursorSpotlight />
      <OnboardingGuard>
        <div className="eb-app">
          {!isMobile && (
            <div className="eb-desktop-brand" style={{
              position: 'fixed',
              top: '20px',
              left: '24px',
              zIndex: 100
            }}>
              <Logo size={36} showText={true} />
            </div>
          )}
          <div className="eb-top-actions">
            <ErrorBoundary mini={true}>
              <ThemeToggle />
            </ErrorBoundary>
            <ErrorBoundary mini={true}>
              <NotificationCenter />
            </ErrorBoundary>
            <ErrorBoundary mini={true}>
              <ProfileChip setPage={setPage} onReset={() => setShowResetModal(true)} />
            </ErrorBoundary>
          </div>
          {isMobile && (
            <div className="eb-mobile-header" style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '16px' }}>
              <Logo size={28} showText={false} />
            </div>
          )}
          {!isMobile && (
            <ErrorBoundary mini={true}>
              <FloatingNav page={page} setPage={setPage} />
            </ErrorBoundary>
          )}
          <main className="eb-main">
            <div className="eb-page">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ width: '100%' }}
                >
                  <PageRenderer
                    page={page}
                    setPage={setPage}
                    setActivePolicyDoc={setActivePolicyDoc}
                    setShowResetModal={setShowResetModal}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          {isMobile && (
            <ErrorBoundary mini={true}>
              <MobileNav page={page} setPage={setPage} onReset={() => setShowResetModal(true)} />
            </ErrorBoundary>
          )}
        </div>
      </OnboardingGuard>

      {/* Global Floating Cookie Consent Banner */}
      <CookieConsent onOpenPolicy={(doc) => setActivePolicyDoc(doc)} />

      {/* Global Slide-out Privacy & Terms Drawer */}
      <AnimatePresence>
        {activePolicyDoc && (
          <PrivacyDrawer 
            activeDoc={activePolicyDoc} 
            onClose={() => setActivePolicyDoc(null)} 
          />
        )}
      </AnimatePresence>

      {/* Global Premium Reset Workspace Modal */}
      <ResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
        onConfirm={handleConfirmReset} 
        theme={theme}
      />
    </ToastProvider>
  );
}