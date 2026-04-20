import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary — catches unhandled render errors in the React tree
 * and shows a graceful fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ArenaGO] Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            background: '#0d0f1a',
            color: '#fff',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#8892b0', marginBottom: 28, maxWidth: 340, lineHeight: 1.6 }}>
            ArenaGO hit an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#0057b8,#a855f7)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh App
          </button>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: 24, fontSize: 11, color: '#ff4d6d', textAlign: 'left', maxWidth: 600, overflowX: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </main>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
