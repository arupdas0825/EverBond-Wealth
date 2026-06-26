/**
 * QRScanPanel.jsx
 * Dedicated full-screen QR scanner for EverBond partner invitations.
 *
 * Validation chain (in order):
 *  1. Is it an EverBond QR? (ebInvite: prefix)  → QR_INVALID
 *  2. Can it be decoded?                          → QR_DECODE_FAILED
 *  3. Is version correct?                         → QR_VERSION_MISMATCH
 *  4. Is it the user's own QR?                    → QR_SELF
 *  5. Is it expired (local check)?                → QR_EXPIRED
 *  6. Fetch invite from Firestore + check status  → QR_ALREADY_USED / INVITE_CANCELLED
 *  7. Accept via acceptInviteByQR()
 *
 * Shows premium scan animation with laser line + corner brackets.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import { Camera, X, AlertCircle, CheckCircle, Loader, Shield, ArrowLeft } from 'lucide-react';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { useFinanceStore } from '../../store/useFinanceStore';
import { acceptInviteByQR } from '../../services/partnerService';
import { getPartnerErrorMessage } from '../../utils/partnerErrors';

const SCAN_STATE = {
  IDLE:       'idle',
  SCANNING:   'scanning',
  VALIDATING: 'validating',
  SUCCESS:    'success',
  ERROR:      'error',
};

/**
 * @param {Object} props
 * @param {Function} props.onSuccess   - called with { workspaceId, senderName }
 * @param {Function} props.onBack      - called when user closes scanner
 */
export function QRScanPanel({ onSuccess, onBack }) {
  const toast = useToast();
  const user      = useFinanceStore(s => s.user);
  const everBondId= useFinanceStore(s => s.everBondId);
  const userName  = useFinanceStore(s => s.userName);

  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const streamRef      = useRef(null);
  const rafRef         = useRef(null);
  const hasScannedRef  = useRef(false);

  const [scanState,  setScanState]  = useState(SCAN_STATE.IDLE);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cameraErr,  setCameraErr]  = useState('');

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanState(SCAN_STATE.SCANNING);
        hasScannedRef.current = false;
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      setCameraErr(err.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera access in your browser settings.'
        : 'Could not start camera. Please check your device settings.');
    }
  }, []);

  const tick = useCallback(() => {
    if (hasScannedRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code) {
      hasScannedRef.current = true;
      handleQRDetected(code.data);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const handleQRDetected = useCallback(async (raw) => {
    stopCamera();
    setScanState(SCAN_STATE.VALIDATING);
    setErrorMsg('');

    try {
      if (!user?.uid) throw new Error('UNAUTHENTICATED');

      const receiverUser = {
        uid:      user.uid,
        ebId:     everBondId || '',
        fullName: userName || user.name || '',
        photoURL: user.photoURL || '',
      };

      const result = await acceptInviteByQR(raw, receiverUser);

      setScanState(SCAN_STATE.SUCCESS);
      setSuccessMsg(`Connected with ${result.senderName || 'your partner'}!`);
      toast.success('Partner workspace connected! 🎉');

      setTimeout(() => onSuccess?.(result), 1800);
    } catch (err) {
      console.error('[QRScanPanel] scan error:', err.message);
      setScanState(SCAN_STATE.ERROR);
      setErrorMsg(getPartnerErrorMessage(err));
    }
  }, [user, everBondId, userName, stopCamera, onSuccess]);

  // Start camera when mounted
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleRetry = () => {
    setErrorMsg('');
    setScanState(SCAN_STATE.IDLE);
    hasScannedRef.current = false;
    startCamera();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <button onClick={() => { stopCamera(); onBack?.(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', padding: '6px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Scan Partner QR</h2>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>EverBond codes only</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', color: T.gold }}>
          <Shield size={11} />
          Encrypted
        </div>
      </div>

      {/* Camera viewport */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Video feed */}
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanState === SCAN_STATE.SCANNING ? 1 : 0.3 }}
          muted playsInline
        />

        {/* Scan overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Dimmed areas */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

          {/* Scan box */}
          <div style={{
            position: 'relative', width: '260px', height: '260px',
            zIndex: 1,
          }}>
            {/* Clear window */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'transparent',
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.55)',
              borderRadius: '16px',
            }} />

            {/* Corner brackets */}
            {[
              { top: -2, left: -2, borderTop: '3px solid', borderLeft: '3px solid', borderRadius: '12px 0 0 0' },
              { top: -2, right: -2, borderTop: '3px solid', borderRight: '3px solid', borderRadius: '0 12px 0 0' },
              { bottom: -2, left: -2, borderBottom: '3px solid', borderLeft: '3px solid', borderRadius: '0 0 0 12px' },
              { bottom: -2, right: -2, borderBottom: '3px solid', borderRight: '3px solid', borderRadius: '0 0 12px 0' },
            ].map((style, i) => (
              <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', borderColor: T.gold, ...style }} />
            ))}

            {/* Laser scan line */}
            {scanState === SCAN_STATE.SCANNING && (
              <motion.div
                animate={{ top: ['10%', '85%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', left: '5%', right: '5%', height: '2px',
                  background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
                  boxShadow: `0 0 8px ${T.gold}`,
                  borderRadius: '2px',
                  zIndex: 2,
                }}
              />
            )}

            {/* State overlays inside box */}
            <AnimatePresence>
              {scanState === SCAN_STATE.VALIDATING && (
                <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: 'rgba(10,10,10,0.7)', borderRadius: '16px',
                }}>
                  <Loader size={32} style={{ color: T.gold, animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Validating…</span>
                </motion.div>
              )}
              {scanState === SCAN_STATE.SUCCESS && (
                <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: 'rgba(10,10,10,0.85)', borderRadius: '16px',
                }}>
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 2, duration: 0.3 }}>
                    <CheckCircle size={48} style={{ color: '#4E9B78' }} />
                  </motion.div>
                  <span style={{ fontSize: '0.82rem', color: '#4E9B78', fontWeight: 600 }}>Connected!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        padding: '20px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {cameraErr ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(208,92,114,0.1)', border: '1px solid rgba(208,92,114,0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', textAlign: 'left' }}>
              <AlertCircle size={15} style={{ color: '#D9667A', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '0.8rem', color: '#D9667A', lineHeight: 1.4 }}>{cameraErr}</span>
            </div>
            <button onClick={handleRetry} className="onb-btn-continue" style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.86rem' }}>Try Again</button>
          </div>
        ) : scanState === SCAN_STATE.ERROR ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(208,92,114,0.1)', border: '1px solid rgba(208,92,114,0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', textAlign: 'left' }}>
              <AlertCircle size={15} style={{ color: '#D9667A', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '0.8rem', color: '#D9667A', lineHeight: 1.4 }}>{errorMsg}</span>
            </div>
            <button onClick={handleRetry} className="onb-btn-continue" style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Camera size={15} />Scan Again
            </button>
          </div>
        ) : scanState === SCAN_STATE.SUCCESS ? (
          <div style={{ textAlign: 'center', color: '#4E9B78', fontWeight: 600, fontSize: '0.9rem' }}>
            ✓ {successMsg}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              Point your camera at your partner's QR code
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
              Only accepts EverBond-generated QR codes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
