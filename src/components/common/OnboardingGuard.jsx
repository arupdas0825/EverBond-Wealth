import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { AuthPage } from '../welcome/AuthPage';
import { LandingPage } from '../welcome/LandingPage';
import { OnboardingSystem } from '../welcome/OnboardingSystem';

export function OnboardingGuard({ children, page, setPage, onOpenPolicy, authLoading }) {
  const isAuthenticated = useFinanceStore(s => s.isAuthenticated);
  const onboardingComplete = useFinanceStore(s => s.onboardingComplete);

  // 10. Show loading screen while auth/profile state is loading.
  // We return null here because App.jsx renders the global SplashScreen overlay.
  if (authLoading) {
    return null;
  }

  const isOnboardingPage = page === 'onboarding' || (typeof page === 'string' && page.startsWith('onboarding/'));

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        page === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <AuthPage 
              onAuthSuccess={() => setPage('onboarding')} 
              onBackToLanding={() => setPage('landing')} 
              onOpenPolicy={onOpenPolicy}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <LandingPage 
              onStartJourney={() => setPage('auth')} 
              onLoginClick={() => setPage('auth')} 
              onOpenPolicy={onOpenPolicy}
            />
          </motion.div>
        )
      ) : !onboardingComplete ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ width: '100%', height: '100%' }}
        >
          <OnboardingSystem onComplete={() => setPage('dashboard')} onOpenPolicy={onOpenPolicy} />
        </motion.div>
      ) : isOnboardingPage ? (
        // 7. Prevent authenticated users with completed onboarding from ever seeing onboarding pages.
        // Return null here to prevent flashing. The router will redirect them to dashboard.
        null
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
