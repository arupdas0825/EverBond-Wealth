import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from './store/useFinanceStore';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Logo } from './components/common/Logo';
import { Dashboard }    from './components/dashboard/Dashboard';
import { IncomePage }   from './components/income/IncomePage';
import { AllocationPage } from './components/allocation/AllocationPage';
import { GoalsPage }    from './components/goals/GoalsPage';
import { MilestonePage } from './components/milestones/MilestonePage';
import { SimulationPage } from './components/simulation/SimulationPage';
import { PartnerPage } from './components/partner/PartnerPage';
import { CouplePlanningPage } from './components/welcome/CouplePlanningPage';
import { FamilyPlanningPage } from './components/welcome/FamilyPlanningPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ThemeToggle } from './components/common/ThemeToggle';
import { ToastProvider } from './components/common/Toast';
import { CookieConsent } from './components/common/CookieConsent';
import { PrivacyDrawer } from './components/common/PrivacyDrawer';
import './index.css';

/**
 * Onboarding Guard & Protected Route System
 * Prepared for pluggable integrations with:
 * - Supabase Auth
 * - Firebase Auth
 * - Clerk
 * Without major layout refactoring.
 */
function OnboardingGuard({ children }) {
  const onboardingComplete = useFinanceStore(s => s.onboardingComplete);
  
  // Future Authentication Hook Connector:
  // const { user, isAuthenticated } = useAuth();
  // if (!isAuthenticated) return <AuthScreen />;
  
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
            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ThemeToggle />
          <WelcomeScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ width: '100%', height: '100%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const theme = useFinanceStore(s=>s.theme);
  const initEverBondId = useFinanceStore(s => s.initEverBondId);
  const [page,setPage] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [activePolicyDoc, setActivePolicyDoc] = useState(null);

  // Initialize EverBond ID on first load
  useEffect(() => { initEverBondId(); }, []);

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Track window width for clean conditional navigation rendering (removes from DOM)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <ToastProvider>
      <OnboardingGuard>
        <div className="eb-app">
          <ThemeToggle />
          {isMobile && (
            <div className="eb-mobile-header">
              <Logo size={32} />
            </div>
          )}
          {!isMobile && <Sidebar page={page} setPage={setPage}/>}
          <main className="eb-main">
            <div className="eb-page">
              {page==='dashboard'  && <Dashboard setPage={setPage}/>}
              {page==='income'     && <IncomePage/>}
              {page==='allocation' && <AllocationPage/>}
              {page==='goals'      && <GoalsPage/>}
              {page==='milestones' && <MilestonePage/>}
              {page==='simulation' && <SimulationPage/>}
              {page==='partner'    && <PartnerPage setPage={setPage}/>}
              {page==='couple-planning' && <CouplePlanningPage/>}
              {page==='family-planning' && <FamilyPlanningPage/>}
              {page==='settings' && <SettingsPage setActivePolicyDoc={setActivePolicyDoc} />}
            </div>
          </main>
          {isMobile && <MobileNav page={page} setPage={setPage}/>}
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
    </ToastProvider>
  );
}