import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

console.log("main.jsx: Bootstrapping EverBond Wealth React App...");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary 
      title="Application Crash Guard" 
      description="A critical error occurred at the root level of EverBond Wealth. Please click reload to try again."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
