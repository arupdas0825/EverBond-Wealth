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

export default function App() {
  const started = useFinanceStore(s=>s.started);
  const theme = useFinanceStore(s=>s.theme);
  const [page,setPage] = useState('dashboard');

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!started) return (
    <>
      <ThemeToggle />
      <WelcomeScreen/>
    </>
  );

  return (
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
  );
}