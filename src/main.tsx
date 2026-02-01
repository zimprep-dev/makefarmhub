import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { crashProtectionService } from './services/crashProtectionService'
import { dataProtectionService } from './services/dataProtectionService'
import './style.css'

// Initialize crash protection and auto-backup
crashProtectionService.init();
console.log('🛡️ Crash Protection: ACTIVE');
console.log('💾 Auto-Backup: ACTIVE (every 5 minutes)');

// Create initial backup on app start
dataProtectionService.createBackup('auto', 'App startup backup');

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
