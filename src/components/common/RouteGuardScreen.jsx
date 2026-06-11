import React from 'react';
import { T } from '../../theme/tokens';
import { ShieldAlert } from 'lucide-react';

export function RouteGuardScreen({ 
  title, 
  description, 
  lockReason, 
  actionText, 
  onAction, 
  onBack 
}) {
  return (
    <div className="fade-in" style={{ paddingBottom: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="liquid-glass" style={{
        padding: '40px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        {/* Animated background glows */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at center, rgba(184, 144, 42, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Visual Vector */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184, 144, 42, 0.12) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: '8px'
          }}>
            {/* Outer rotating ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px dashed ${T.gold}40`,
              animation: 'scanRotate 20s linear infinite'
            }} />
            
            {/* Icon */}
            {actionText ? (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(184, 144, 42, 0.4))' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="9" y="11" width="6" height="4" rx="1" fill="rgba(184,144,42,0.2)" />
                <path d="M10 11V9a2 2 0 0 1 4 0v2" />
              </svg>
            ) : (
              <ShieldAlert size={50} style={{ color: T.gold, filter: 'drop-shadow(0 0 8px rgba(184, 144, 42, 0.4))' }} />
            )}
          </div>

          {/* Title & Description */}
          <h1 style={{
            fontFamily: T.fontDisplay,
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--onb-title)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            {title}
          </h1>
          
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--onb-desc)',
            lineHeight: '1.6',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {description}
          </p>

          {/* lockReason badge */}
          {lockReason && (
            <div style={{
              background: 'rgba(184, 144, 42, 0.08)',
              border: `1px solid ${T.gold}30`,
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: T.gold,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              <span>🔒</span> <span>{lockReason}</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            maxWidth: '360px',
            justifyContent: 'center',
            marginTop: '12px',
            flexWrap: 'wrap'
          }}>
            {onAction && actionText && (
              <button 
                onClick={onAction}
                className="onb-btn-continue"
                style={{ 
                  flex: 1, 
                  minWidth: '160px', 
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: T.gold,
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--sh-gold)'
                }}
              >
                {actionText}
              </button>
            )}
            {onBack && (
              <button 
                onClick={onBack}
                className="btn-secondary"
                style={{ 
                  flex: 1, 
                  minWidth: '160px', 
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-mid)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
