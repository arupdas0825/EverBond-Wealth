import React from 'react';
import { ShieldAlert, RefreshCw, Server, HelpCircle, AlertTriangle } from 'lucide-react';
import { T } from '../../theme/tokens';

export function FirebaseConfigGuard({ error }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#12110e', // Premium dark background
      color: '#f5f5f7',
      fontFamily: T.fontBody,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient glowing spots */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(184,144,42,0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(184,144,42,0.06) 0%, transparent 70%)',
        zIndex: 0
      }} />

      {/* Main Glassmorphic Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '580px',
        background: 'rgba(30, 28, 24, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        padding: '40px',
        textAlign: 'center'
      }}>
        {/* Brand Icon / Logo */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(184, 144, 42, 0.1)',
          border: '1px solid rgba(184, 144, 42, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <ShieldAlert size={32} style={{ color: T.goldMid }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: T.fontDisplay,
          fontSize: '2rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '12px'
        }}>
          Connection Guard Active
        </h1>
        
        <p style={{
          color: '#a19c91',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginBottom: '32px'
        }}>
          EverBond Wealth could not establish a connection to your secure database backend. Please resolve the environment configuration issues below.
        </p>

        {/* Error Details Card */}
        <div style={{
          background: 'rgba(18, 17, 14, 0.8)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={18} style={{ color: '#d9667a' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d9667a' }}>
              {error.type === 'MISSING_ENV_VARS' ? 'Missing Environment Variables' : error.type === 'MALFORMED_ENV_VARS' ? 'Malformed Configuration' : 'Initialization Failure'}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#e5e1d8', lineHeight: 1.5, marginBottom: '16px', whiteSpace: 'pre-line' }}>
            {error.message}
          </p>

          {error.details && error.details.length > 0 && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.8rem',
              color: '#d0c9bc',
              maxHeight: '150px',
              overflowY: 'auto',
              borderLeft: '3px solid #d9667a'
            }}>
              {error.details.map((detail, idx) => (
                <div key={idx} style={{ marginBottom: idx < error.details.length - 1 ? '6px' : 0 }}>
                  • {detail}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          textAlign: 'left',
          fontSize: '0.88rem',
          color: '#a19c91',
          lineHeight: 1.5,
          padding: '0 8px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <Server size={18} style={{ flexShrink: 0, color: T.goldMid, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Vercel Deployments:</strong> Configure these keys in the project settings under <span style={{ color: '#fff', textDecoration: 'underline' }}>Settings &gt; Environment Variables</span>, then trigger a new deployment.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <HelpCircle size={18} style={{ flexShrink: 0, color: T.goldMid, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Local Server:</strong> Ensure you have a valid <code style={{ color: T.goldMid }}>.env</code> file in your root folder with all VITE_FIREBASE_* parameters defined.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleRetry}
            style={{
              padding: '12px 28px',
              background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(184, 144, 42, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'none'}
          >
            <RefreshCw size={16} />
            Retry Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
