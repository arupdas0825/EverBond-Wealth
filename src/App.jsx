import React, { useState } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { Sidebar, MobileNav } from './components/layout/Sidebar';
import { Logo } from './components/common/Logo';
import { Dashboard }    from './components/dashboard/Dashboard';
import { IncomePage }   from './components/income/IncomePage';
import { AllocationPage } from './components/allocation/AllocationPage';
import { GoalsPage }    from './components/goals/GoalsPage';
import { SimulationPage } from './components/simulation/SimulationPage';
import './index.css';
export default function App() {
  const started = useFinanceStore(s=>s.started);
  const [page,setPage] = useState('dashboard');
  if (!started) return <WelcomeScreen/>;
  return (
    <div className="eb-app">
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
          {page==='simulation' && <SimulationPage/>}
        </div>
      </main>
      <MobileNav page={page} setPage={setPage}/>
    </div>
  );
}