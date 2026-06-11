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

  return (
    <Suspense fallback={<PageSkeleton />}>
      {renderPage()}
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
            <ThemeToggle />
            <NotificationCenter />
            <ProfileChip setPage={setPage} onReset={() => setShowResetModal(true)} />
          </div>
          {isMobile && (
            <div className="eb-mobile-header" style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '16px' }}>
              <Logo size={28} showText={false} />
            </div>
          )}
          {!isMobile && (
            <FloatingNav page={page} setPage={setPage} />
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
          {isMobile && <MobileNav page={page} setPage={setPage} onReset={() => setShowResetModal(true)}/>}
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