import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: 'var(--sage-lt, rgba(78,155,120,0.1))', border: 'var(--sage, #4E9B78)', icon: 'var(--sage, #4E9B78)' },
  error:   { bg: 'var(--rose-lt, rgba(217,102,122,0.1))', border: 'var(--rose, #D9667A)', icon: 'var(--rose, #D9667A)' },
  info:    { bg: 'var(--gold-pale, rgba(184,144,42,0.08))', border: 'var(--gold, #B8902A)', icon: 'var(--gold, #B8902A)' },
};

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const IconComp = ICONS[type] || ICONS.info;
  const colors = COLORS[type] || COLORS.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3200);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: `1.5px solid ${colors.border}40`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        minWidth: '280px',
        maxWidth: '420px',
        pointerEvents: 'auto',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onDismiss(id)}
    >
      {/* Accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '3px',
        background: colors.border,
        borderRadius: '3px 0 0 3px',
      }} />

      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconComp size={16} style={{ color: colors.icon }} />
      </div>

      <span style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text)',
        lineHeight: 1.4,
        flex: 1,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {message}
      </span>

      <X size={14} style={{ color: 'var(--text-faint)', flexShrink: 0, opacity: 0.6 }} />

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.2, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: colors.border,
          transformOrigin: 'left',
          opacity: 0.4,
        }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }, [addToast]);

  // Fix: wrap object in useMemo-like pattern via ref
  const toastRef = React.useRef(toast);
  toastRef.current = toast;

  return (
    <ToastContext.Provider value={toastRef.current}>
      {children}

      {/* Toast container — fixed bottom-center */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem
              key={t.id}
              id={t.id}
              message={t.message}
              type={t.type}
              onDismiss={dismissToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to trigger toast notifications
 * @returns {{ success: (msg: string) => void, error: (msg: string) => void, info: (msg: string) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider — won't crash
    return {
      success: (msg) => console.log('[Toast]', msg),
      error: (msg) => console.error('[Toast]', msg),
      info: (msg) => console.info('[Toast]', msg),
    };
  }
  return ctx;
}
