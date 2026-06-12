import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme/tokens';

export function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1600); // 1.6 seconds display duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#12110E', // Deep premium brand dark color
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Subtle ambient lighting */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184, 144, 42, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        {/* Animated Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative' }}
        >
          <img
            src="/logo.png"
            alt="EverBond Wealth Logo"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 4px 12px rgba(184, 144, 42, 0.2))',
            }}
          />
        </motion.div>

        {/* Animated Text Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.fontDisplay,
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2DCCF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EverBond
          </motion.h1>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.fontBody,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#B8902A', // Brand Gold
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Wealth
          </motion.div>
        </div>

        {/* Premium Subtle Progress Indicator */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '100px',
            marginTop: '16px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.4, ease: 'easeInOut', repeat: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #B8902A, transparent)',
            }}
          />
        </div>

        {/* Subtitle / Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: T.fontBody,
            fontSize: '0.8rem',
            margin: '24px 0 0',
            color: '#E2DCCF',
            letterSpacing: '0.02em',
          }}
        >
          Building Financial Confidence
        </motion.p>
      </div>
    </motion.div>
  );
}
