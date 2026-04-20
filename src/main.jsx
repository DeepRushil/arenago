import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

/** Full-screen loading spinner shown while lazy-loaded pages hydrate */
function AppLoader() {
  return (
    <div role="status" aria-label="Loading ArenaGO" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0d0f1a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
        <div style={{ fontSize: 14, color: '#8892b0', fontFamily: 'Inter, sans-serif' }}>
          Loading ArenaGO…
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<AppLoader />}>
          <App />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
