import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { T } from '../../theme/tokens';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // If a mini-fallback is requested (e.g. for header widgets), return a minimal UI or null
      if (this.props.mini) {
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--rose-lt, rgba(208,92,114,0.08))',
            border: '1.5px solid var(--rose-border, rgba(208,92,114,0.25))',
            borderRadius: '100px',
            color: T.rose,
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }} onClick={this.handleReset}>
            <AlertTriangle size={14} />
            <span>Widget Error</span>
          </div>
        );
      }

      return (
        <div style={{
          padding: '48px 24px',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '60px auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          fontFamily: T.fontBody
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--rose-lt, rgba(208,92,114,0.08))',
            border: '1.5px solid var(--rose-border, rgba(208,92,114,0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.rose
          }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <h3 style={{
              fontFamily: T.fontDisplay,
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: '10px'
            }}>
              {this.props.title || "Section Unavailable"}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: '0 auto',
              maxWidth: '400px'
            }}>
              {this.props.description || "This module encountered an unexpected error. You can continue using other parts of EverBond Wealth."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '100px',
                border: 'none',
                background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`,
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(184, 144, 42, 0.25)',
                transition: 'transform 0.2s',
              }}
            >
              <RefreshCw size={14} />
              Reload Section
            </button>
            {this.props.showDashboardButton && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.setPage) this.props.setPage('dashboard');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  border: '1.5px solid var(--border-mid)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <LayoutDashboard size={14} />
                Go to Dashboard
              </button>
            )}
          </div>

          {this.state.error && (
            <details style={{
              width: '100%',
              textAlign: 'left',
              marginTop: '16px',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px'
            }}>
              <summary style={{
                fontSize: '0.78rem',
                color: 'var(--text-faint)',
                cursor: 'pointer',
                outline: 'none',
                userSelect: 'none',
                fontWeight: 600
              }}>
                View Technical Details
              </summary>
              <pre style={{
                marginTop: '12px',
                padding: '16px',
                background: 'var(--bg-warm)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                fontSize: '0.78rem',
                color: T.rose,
                overflowX: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {this.state.error.stack || this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
