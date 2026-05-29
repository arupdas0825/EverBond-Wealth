import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { Sidebar, MobileNav } from './components/layout/Sidebar';
import { Logo } from './components/common/Logo';
import { Dashboard }    from './components/dashboard/Dashboard';
import { IncomePage }   from './components/income/IncomePage';
import { AllocationPage } from './components/allocation/AllocationPage';
import { GoalsPage }    from './components/goals/GoalsPage';
import { MilestonePage } from './components/milestones/MilestonePage';
import { SimulationPage } from './components/simulation/SimulationPage';
import { CouplePlanningPage } from './components/welcome/CouplePlanningPage';
import { FamilyPlanningPage } from './components/welcome/FamilyPlanningPage';
import { ThemeToggle } from './components/common/ThemeToggle';
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
  
  if (!onboardingComplete) {
    return (
      <>
        <ThemeToggle />
        <WelcomeScreen />
      </>
    );
  }

  return children;
}

export default function App() {
  const theme = useFinanceStore(s=>s.theme);
  const [page,setPage] = useState('dashboard');

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <OnboardingGuard>
      <div className="eb-app">
        <ThemeToggle />
        <div className="eb-mobile-header">
          <Logo size={32} />
        </div>
        <Sidebar page={page} setPage={setPage}/>
        <main className="eb-main">
          <div className="eb-page">
            {page==='dashboard'  && <Dashboard/>}
            {page==='income'     && <IncomePage/>}
            {page==='allocation' && <AllocationPage/>}
            {page==='goals'      && <GoalsPage/>}
            {page==='milestones' && <MilestonePage/>}
            {page==='simulation' && <SimulationPage/>}
            {page==='couple-planning' && <CouplePlanningPage/>}
            {page==='family-planning' && <FamilyPlanningPage/>}
          </div>
        </main>
        <MobileNav page={page} setPage={setPage}/>
      </div>
    </OnboardingGuard>
  );
}