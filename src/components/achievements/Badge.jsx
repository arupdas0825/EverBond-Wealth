import React from 'react';
import { motion } from 'framer-motion';

export const Badge = ({ achievement, isUnlocked }) => {
  return (
    <motion.div 
      className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : { scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        background: 'var(--surface)',
        border: `1px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.75rem',
        opacity: isUnlocked ? 1 : 0.6,
        filter: isUnlocked ? 'none' : 'grayscale(100%)',
        boxShadow: isUnlocked ? '0 8px 32px rgba(212, 175, 55, 0.15)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Shine effect for unlocked badges */}
      {isUnlocked && (
        <motion.div 
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: Math.random() * 2 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'skewX(-20deg)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      )}

      <div style={{
        fontSize: '3rem',
        filter: isUnlocked ? 'drop-shadow(0 0 12px rgba(212,175,55,0.6))' : 'none',
        marginBottom: '0.5rem',
        zIndex: 2
      }}>
        {achievement.icon}
      </div>
      <h4 style={{ 
        margin: 0, 
        color: isUnlocked ? 'var(--gold)' : 'var(--text-secondary)',
        fontWeight: 600,
        zIndex: 2
      }}>
        {achievement.title}
      </h4>
      <p style={{
        margin: 0,
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.4,
        zIndex: 2
      }}>
        {achievement.description}
      </p>
      <div style={{
        marginTop: 'auto',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: isUnlocked ? 'var(--gold)' : 'var(--text-tertiary)',
        background: 'var(--bg-primary)',
        padding: '4px 12px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        zIndex: 2
      }}>
        +{achievement.xp} XP
      </div>
    </motion.div>
  );
};
