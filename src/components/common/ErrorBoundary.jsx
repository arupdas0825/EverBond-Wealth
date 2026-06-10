import React from 'react';
import { Card } from './Card';
import { AlertCircle } from 'lucide-react';
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

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '24px',
          width: '100%',
        }}>
          <Card style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '40px 24px',
            border: '1.5px solid var(--rose-border)',
            boxShadow: '0 20px 50px rgba(208, 92, 114, 0.15)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--rose-lt, rgba(208,92,114,0.1))',
              border: '1px solid var(--rose-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--rose)',
            }}>
              <AlertCircle size={28} />
            </div>
            <h2 style={{
              fontFamily: T.fontDisplay,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
            }}>
              {this.props.title || "Something went wrong"}
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: '28px',
              lineHeight: 1.5,
            }}>
              {this.props.message || "An error occurred while loading this workspace page."}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                className="btn-primary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  border: 'none',
                  color: '#fff'
                }}
              >
                Retry
              </button>
              <button
                onClick={() => {
                  if (typeof this.props.onBackToDashboard === 'function') {
                    this.props.onBackToDashboard();
                  }
                }}
                className="btn-secondary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border-mid)',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
