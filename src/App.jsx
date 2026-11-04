import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from './store/useFinanceStore';
import { FloatingNav } from './components/layout/FloatingNav';
import { ProfileChip } from './components/layout/ProfileChip';
import { MobileNav } from './components/layout/MobileNav';
import { Logo } from './components/common/Logo';
import { ThemeToggle } from './components/common/ThemeToggle';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { LanguageSelector } from './components/layout/LanguageSelector';
import { CurrencySelector } from './components/layout/CurrencySelector';
import { ToastProvider } from './components/common/Toast';
import { CookieConsent } from './components/common/CookieConsent';
import { PrivacyDrawer } from './components/common/PrivacyDrawer';
import { ResetModal } from './components/common/ResetModal';
import { RouteGuardScreen } from './components/common/RouteGuardScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SplashScreen } from './components/common/SplashScreen';
import './index.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initError } from './utils/firebase';
import { apiPost } from './services/apiClient';
import { connectSocket, disconnectSocket } from './services/socketService';
import { FirebaseConfigGuard } from './components/common/FirebaseConfigGuard';
import { OnboardingGuard } from './components/common/OnboardingGuard';


/* ═══════════════════════════════════════════════════════════
   LAZY-LOADED PAGE COMPONENTS WITH LOGGING AND RETRY
   Each page is loaded on-demand when first navigated to.
   Includes automated single-retry fallback for network/hash errors.
   ═══════════════════════════════════════════════════════════ */
function lazyWithLogAndRetry(name, importFunc, componentGetter) {
  return lazy(() => {
    console.log(`App: Loading page chunk [${name}]...`);
    return importFunc()
      .then(m => {
        console.log(`App: Page chunk [${name}] loaded successfully.`);
        return { default: componentGetter(m) };
      })
      .catch(err => {
        console.error(`App: Failed to load page chunk [${name}]:`, err);
        const hasRetried = sessionStorage.getItem('chunk_retry_' + name);
        if (!hasRetried) {
          sessionStorage.setItem('chunk_retry_' + name, 'true');
          console.warn(`App: Reloading page to fetch updated assets...`);
          window.location.reload();
          return new Promise(() => {});
        }
        throw err;
      });
  });
}

const Dashboard         = lazyWithLogAndRetry('Dashboard', () => import('./components/dashboard/Dashboard'), m => m.Dashboard);
const WealthInsightsPage = lazyWithLogAndRetry('WealthInsightsPage', () => import('./components/insights/WealthInsightsPage'), m => m.WealthInsightsPage);
const IncomePage        = lazyWithLogAndRetry('IncomePage', () => import('./components/income/IncomePage'), m => m.IncomePage);
const AllocationPage    = lazyWithLogAndRetry('AllocationPage', () => import('./components/allocation/AllocationPage'), m => m.AllocationPage);
const GoalsPage         = lazyWithLogAndRetry('GoalsPage', () => import('./components/goals/GoalsPage'), m => m.GoalsPage);
const MilestonePage     = lazyWithLogAndRetry('MilestonePage', () => import('./components/milestones/MilestonePage'), m => m.MilestonePage);
const SimulationPage    = lazyWithLogAndRetry('SimulationPage', () => import('./components/simulation/SimulationPage'), m => m.SimulationPage);
const PartnerPage       = lazyWithLogAndRetry('PartnerPage', () => import('./components/partner/PartnerPage'), m => m.PartnerPage);
const CouplePlanningPage = lazyWithLogAndRetry('CouplePlanningPage', () => import('./components/welcome/CouplePlanningPage'), m => m.CouplePlanningPage);
const FamilyPlanningPage = lazyWithLogAndRetry('FamilyPlanningPage', () => import('./components/welcome/FamilyPlanningPage'), m => m.FamilyPlanningPage);
const SettingsPage      = lazyWithLogAndRetry('SettingsPage', () => import('./components/settings/SettingsPage'), m => m.SettingsPage);
const ProfilePage       = lazyWithLogAndRetry('ProfilePage', () => import('./components/profile/ProfilePage'), m => m.ProfilePage);
const DocumentationPage = lazyWithLogAndRetry('DocumentationPage', () => import('./components/docs/DocumentationPage'), m => m.DocumentationPage);

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
  const { relationshipStatus, partnerLinked } = useFinanceStore();
  const status = relationshipStatus || 'Single';

  // 1. Single Mode Access Restrictions
  if (status === 'Single') {
    const isCommittedPage = ['couple-planning'].includes(page);
    
    if (isCommittedPage) {
      return (
        <RouteGuardScreen 
          title="Partner Workspace Locked"
          description="This workspace is locked for Single mode accounts. To plan with a partner, you must register a Committed account."
          onBack={() => setPage('dashboard')}
        />
      );
    }
  }

  // 2. Committed Mode Access Restrictions (Locks removed for Family Dynasty to allow onboarding/invite)
  
  // 3. Family Dynasty Mode Access Restrictions
  if (status === 'Married') {
    const isSinglePage = page === 'single';
    const isCommittedPage = ['couple-planning'].includes(page);
    
    if (isSinglePage) {
      return (
        <RouteGuardScreen 
          title="Single Workspace Locked"
          description="This account is calibrated permanently for Family Dynasty planning. Dedicated single workspace tools are locked."
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (isCommittedPage) {
      return (
        <RouteGuardScreen 
          title="Committed Workspace Locked"
          description="This account is calibrated permanently for Family Dynasty planning. Dedicated committed partner setup tools are locked."
          onBack={() => setPage('dashboard')}
        />
      );
    }
  }

  const renderPage = () => {
    if (typeof page === 'string' && page.startsWith('connect/')) {
      const code = page.split('/')[1];
      return <PartnerPage setPage={setPage} connectCode={code} />;
    }
    if (typeof page === 'string' && page.startsWith('join-dynasty/')) {
      const code = page.split('/')[1];
      return <FamilyPlanningPage setPage={setPage} joinCode={code} />;
    }
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
      'income': 'Income & Mode',
      'allocation': 'Asset Allocation',
      'goals': 'Financial Goals',
      'milestones': 'Milestones',
      'simulation': 'Future Simulation',
      'partner': 'Partner Workspace',
      'partner-committed': 'Partner Workspace',
      'couple-planning': 'Couple Planning',
      'family-planning': 'Family Dynasty',
      'partner-family': 'Family Dynasty',
      'settings': 'Settings',
      'profile': 'Profile',
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
  if (initError) {
    return <FirebaseConfigGuard error={initError} />;
  }

  const theme = useFinanceStore(s => s.theme);
  const isAuthenticated = useFinanceStore(s => s.isAuthenticated);
  const onboardingComplete = useFinanceStore(s => s.onboardingComplete);

  const [page, setPage] = useState(() => {
    const isAuth = useFinanceStore.getState().isAuthenticated;
    const isComplete = useFinanceStore.getState().onboardingComplete;
    if (!isAuth) return 'landing';
    if (!isComplete) return 'onboarding';
    return 'dashboard';
  });

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [activePolicyDoc, setActivePolicyDoc] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const handleConfirmReset = useCallback(() => {
    const storeReset = useFinanceStore.getState().reset;
    storeReset();
    localStorage.removeItem('eb_v6');
    setShowResetModal(false);
    window.location.reload();
  }, []);

  // Start live exchange rates scheduler on app mount
  useEffect(() => {
    import('./utils/currency').then(m => {
      m.startExchangeRateScheduler();
    });
  }, []);

  // Listen to Firebase Auth state changes and sync authoritatively with MongoDB
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AUTH USER:", firebaseUser ? firebaseUser.uid : null);
      if (!isMounted) return;

      if (firebaseUser) {
        const persistedState = useFinanceStore.getState();
        let mongoUser = null;

        try {
          // Authoritative MongoDB Sync via verified Firebase token
          const syncRes = await apiPost('/api/user/sync', {
            fullName: firebaseUser.displayName || persistedState.user?.name || '',
            photoURL: firebaseUser.photoURL || persistedState.profilePhoto || '',
            ebId: persistedState.everBondId || '',
          }, { timeoutMs: 8000 });

          if (syncRes?.user) {
            mongoUser = syncRes.user;
            console.log("[MongoDB Identity] Permanent EverBond ID resolved:", mongoUser.ebId);
          }
        } catch (syncErr) {
          console.warn("[MongoDB Identity] Sync error, using cached state:", syncErr.message);
        }

        if (!isMounted) return;

        // Connect real-time WebSocket for partner updates
        connectSocket();

        // Determine if onboarding is completed
        // Authoritative: mongoUser.onboardingCompleted. Fallback: persistedState.onboardingComplete
        const isCompleted = Boolean(mongoUser?.onboardingCompleted || persistedState.onboardingComplete);
        if (persistedState.onboardingComplete && mongoUser && !mongoUser.onboardingCompleted) {
          apiPost('/api/user/onboarding', {
            fullName: persistedState.user?.name || persistedState.userName || '',
            country: persistedState.country || 'India',
            currency: persistedState.currency || 'INR',
            mode: persistedState.relationshipMode || persistedState.stage || 'Single',
            termsAccepted: true,
            privacyAccepted: true,
            dataConsent: true,
          }).catch((err) => console.warn('[MongoDB Identity] Background onboarding sync failed:', err.message));
        }

        const authoritativeEbId = mongoUser?.ebId || persistedState.everBondId || '';
        const partnerLinked = Boolean(mongoUser && mongoUser.partnerStatus === 'connected' && mongoUser.partnerUid);
        const partnerName = (mongoUser && mongoUser.partnerName) || persistedState.partnerName || '';
        const partnerEbId = (mongoUser && mongoUser.partnerEbId) || persistedState.partnerEverBondId || '';
        const mappedStage = partnerLinked ? 'Committed' : (mongoUser?.mode || persistedState.stage || 'Single');

        useFinanceStore.setState({
          isAuthenticated: true,
          user: {
            uid: firebaseUser.uid,
            name: mongoUser?.fullName || firebaseUser.displayName || persistedState.user?.name || 'User',
            email: firebaseUser.email || '',
            authProvider: firebaseUser.providerData?.[0]?.providerId || 'google.com',
          },
          userId: authoritativeEbId,
          everBondId: authoritativeEbId,
          partnerId: (mongoUser && mongoUser.partnerUid) || (partnerLinked ? persistedState.partnerId : '') || '',
          partnerEverBondId: partnerEbId,
          partnerLinked,
          partner1: mongoUser?.fullName || firebaseUser.displayName || persistedState.userName || 'User',
          userName: mongoUser?.fullName || firebaseUser.displayName || persistedState.userName || 'User',
          partner2: partnerName,
          partnerName: partnerName,
          region: mongoUser?.country || persistedState.country || 'India',
          country: mongoUser?.country || persistedState.country || 'India',
          currency: mongoUser?.currency || persistedState.currency || 'INR',
          stage: mappedStage,
          relationshipStage: mappedStage,
          relationshipStatus: mappedStage,
          onboardingComplete: isCompleted,
          started: isCompleted,
          connectionStatus: partnerLinked ? 'connected' : 'none',
          workspaceId: (mongoUser && mongoUser.workspaceId) || persistedState.workspaceId || '',
          connectedAt: (mongoUser && mongoUser.connectedAt) ? new Date(mongoUser.connectedAt) : persistedState.connectedAt,
        });

        // Set route based on completion status
        setPage(prev => {
          if (isCompleted) {
            if (prev === 'landing' || prev === 'auth' || prev === 'onboarding' || (typeof prev === 'string' && prev.startsWith('onboarding/'))) {
              return 'dashboard';
            }
            return prev;
          } else {
            return 'onboarding';
          }
        });
      } else {
        // User logged out
        disconnectSocket();

        useFinanceStore.setState({
          isAuthenticated: false,
          user: null,
          onboardingComplete: false,
          started: false,
        });

        setPage('landing');
      }

      if (isMounted) {
        setAuthLoading(false);
        setShowSplash(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Reset scroll on initial load
  useEffect(() => {
    console.log("App: Root component mounted.");
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Reset scroll on page change
  useEffect(() => {
    console.log("App: Current page state synchronized:", page);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  // Route protection effect
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      if (page !== 'landing' && page !== 'auth') {
        setPage('landing');
      }
    } else if (!onboardingComplete) {
      if (page !== 'onboarding') {
        setPage('onboarding');
      }
    } else {
      if (page === 'landing' || page === 'auth' || page === 'onboarding' || (typeof page === 'string' && page.startsWith('onboarding/'))) {
        setPage('dashboard');
      }
    }
  }, [authLoading, isAuthenticated, onboardingComplete, page]);

  // Synchronize URL hash with page state for hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'login' || hash === 'auth') setPage('auth');
      else if (hash === 'landing') setPage('landing');
      else if (hash === 'onboarding') setPage('onboarding');
      else if (hash === 'single') setPage('single');
      else if (hash === 'partner' || hash === 'partner-committed') setPage('partner-committed');
      else if (hash === 'family-dynasty' || hash === 'partner-family') setPage('partner-family');
      else if (hash) setPage(hash);
      else {
        const isAuth = useFinanceStore.getState().isAuthenticated;
        setPage(isAuth ? 'dashboard' : 'landing');
      }
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
    
    if (page === 'landing') {
      if (window.location.hash !== '' && window.location.hash !== '#/') {
        window.location.hash = '#/';
      }
    } else {
      if (window.location.hash !== `#/${path}`) {
        window.location.hash = `#/${path}`;
      }
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
      <AnimatePresence>
        {(showSplash || authLoading) && (
          <SplashScreen onComplete={() => { if (!authLoading) setShowSplash(false); }} />
        )}
      </AnimatePresence>
      <CursorSpotlight />
      <OnboardingGuard page={page} setPage={setPage} onOpenPolicy={setActivePolicyDoc} authLoading={authLoading}>
        <div className="eb-app">
          {isMobile ? (
            <>
              <div className="eb-top-actions">
                <ErrorBoundary mini={true}>
                  <LanguageSelector />
                </ErrorBoundary>
                <ErrorBoundary mini={true}>
                  <CurrencySelector />
                </ErrorBoundary>
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
              <div className="eb-mobile-header" style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '16px' }}>
                <Logo size={28} showText={false} />
              </div>
            </>
          ) : (
            <header className="eb-top-navbar">
              <div className="eb-navbar-logo-card">
                <div className="eb-logo-glass-card">
                  <Logo size={28} showText={windowWidth >= 1150} />
                </div>
              </div>
              
              <div className="eb-desktop-nav-wrapper">
                <ErrorBoundary mini={true}>
                  <FloatingNav page={page} setPage={setPage} />
                </ErrorBoundary>
              </div>
              
              <div className="eb-navbar-right-section">
                <div className="eb-utility-icons">
                  <ErrorBoundary mini={true}>
                    <LanguageSelector />
                  </ErrorBoundary>
                  <ErrorBoundary mini={true}>
                    <CurrencySelector />
                  </ErrorBoundary>
                  <ErrorBoundary mini={true}>
                    <ThemeToggle />
                  </ErrorBoundary>
                  <ErrorBoundary mini={true}>
                    <NotificationCenter />
                  </ErrorBoundary>
                </div>
                
                <div className="eb-profile-pill-wrapper">
                  <ErrorBoundary mini={true}>
                    <ProfileChip setPage={setPage} onReset={() => setShowResetModal(true)} />
                  </ErrorBoundary>
                </div>
              </div>
            </header>
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