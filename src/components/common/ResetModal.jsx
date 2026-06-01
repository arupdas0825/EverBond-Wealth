import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { T } from '../../theme/tokens';

export function ResetModal({ isOpen, onClose, onConfirm, theme }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: theme === 'dark' ? 'rgba(13, 13, 13, 0.4)' : 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              boxShadow: 'var(--sh-lg)',
              borderRadius: '24px',
              textAlign: 'center'
            }}
          >
            {/* Soft circle icon container */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--rose-lt)',
              border: '1px solid var(--rose-border)',
              color: 'var(--rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ 
              fontFamily: T.fontDisplay, 
              fontSize: '1.6rem', 
              fontWeight: 700, 
              color: 'var(--text)', 
              marginBottom: '12px' 
            }}>
              Reset EverBond Workspace
            </h3>
            
            <p style={{ 
              fontSize: '0.88rem', 
              color: 'var(--text-muted)', 
              lineHeight: 1.5, 
              marginBottom: '28px',
              padding: '0 8px'
            }}>
              This action will remove all locally stored financial data, partner connections, goals, simulations and preferences. This cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button 
                className="btn-secondary" 
                style={{ 
                  flex: 1, 
                  padding: '12px 20px', 
                  borderRadius: T.radiusPill, 
                  fontSize: '0.85rem', 
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border-mid)'
                }}
                onClick={onClose}
              >
                Keep My Data
              </button>
              
              <motion.button 
                className="btn-primary" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  flex: 1.2, 
                  padding: '12px 20px', 
                  borderRadius: T.radiusPill, 
                  fontSize: '0.85rem', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #e05c72 0%, #b33951 100%)',
                  border: 'none',
                  color: '#fff',
                  boxShadow: '0 6px 20px rgba(208, 92, 114, 0.25)',
                  cursor: 'pointer'
                }}
                onClick={onConfirm}
              >
                Reset Everything
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
