import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { X, Upload, RotateCw, ZoomIn, Loader2, Check, Trash2 } from 'lucide-react';
import { db, storage } from '../../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function ProfileEditModal({ isOpen, onClose }) {
  const store = useFinanceStore();
  const toast = useToast();
  const { 
    partner1, userName, country, currency, bio, profilePhoto, relationshipStage, everBondId, 
    email, user, setProfile, theme, language, timezone, verificationStatus, partnerId
  } = store;

  // Form states
  const [nameVal, setNameVal] = useState(partner1 || userName || '');
  const [countryVal, setCountryVal] = useState(country || 'India');
  const [currencyVal, setCurrencyVal] = useState(currency || 'INR');
  const [languageVal, setLanguageVal] = useState(language || 'English');
  const [timezoneVal, setTimezoneVal] = useState(timezone || 'GMT+5:30');
  const [bioVal, setBioVal] = useState(bio || '');
  const [photoVal, setPhotoVal] = useState(profilePhoto || '');
  
  // Custom button states
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'loading' | 'success'

  // Drag & drop & crop canvas states
  const [dragActive, setDragActive] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNameVal(partner1 || userName || '');
      setCountryVal(country || 'India');
      setCurrencyVal(currency || 'INR');
      setLanguageVal(language || 'English');
      setTimezoneVal(timezone || 'GMT+5:30');
      setBioVal(bio || '');
      setPhotoVal(profilePhoto || '');
      setRawImageSrc(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setSaveState('idle');
    }
  }, [isOpen, partner1, userName, country, currency, language, timezone, bio, profilePhoto]);

  // Body Scroll Lock implementation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper to convert dataURI/base64 to Blob for Storage upload
  const dataURLtoBlob = (dataurl) => {
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Base64 parsing error:", e);
      return null;
    }
  };

  // Handle file selection
  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawImageSrc(e.target.result);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload an image file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Canvas drawing & crop simulation
  useEffect(() => {
    if (!rawImageSrc) return;

    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [rawImageSrc, zoom, offset]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = 200; // Fixed square size for crop box
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight;

    if (imgRatio > 1) {
      drawHeight = size * zoom;
      drawWidth = size * imgRatio * zoom;
    } else {
      drawWidth = size * zoom;
      drawHeight = (size / imgRatio) * zoom;
    }

    const x = (size - drawWidth) / 2 + offset.x;
    const y = (size - drawHeight) / 2 + offset.y;

    ctx.save();
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    ctx.restore();
  };

  const handleCanvasMouseDown = (e) => {
    if (!rawImageSrc) return;
    setIsDraggingCanvas(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingCanvas || !rawImageSrc) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleCanvasMouseUpOrLeave = () => {
    setIsDraggingCanvas(false);
  };

  const handleSave = async () => {
    if (!nameVal.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSaveState('loading');

    try {
      let finalPhotoURL = photoVal;

      // 1. Process and upload profile image if cropped in canvas
      if (rawImageSrc && canvasRef.current && user?.uid) {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = 150;
        cropCanvas.height = 150;
        const cropCtx = cropCanvas.getContext('2d');

        cropCtx.beginPath();
        cropCtx.arc(75, 75, 75, 0, Math.PI * 2);
        cropCtx.clip();

        cropCtx.drawImage(canvasRef.current, 0, 0, 150, 150);
        const croppedBase64 = cropCanvas.toDataURL('image/jpeg', 0.85);
        
        // Convert to Blob and upload to Firebase Storage
        const blob = dataURLtoBlob(croppedBase64);
        if (blob) {
          const fileRef = ref(storage, `users/${user.uid}/profile_photo.jpg`);
          const uploadSnap = await uploadBytes(fileRef, blob);
          finalPhotoURL = await getDownloadURL(uploadSnap.ref);
        }
      }

      // 2. Persist to Firestore users/{uid} document
      if (user?.uid && db) {
        const userRef = doc(db, 'users', user.uid);
        const mappedMode = relationshipStage === 'Married' ? 'Family Dynasty' : (relationshipStage === 'Committed' ? 'Partner' : 'Single');
        const finalVerificationStatus = verificationStatus || (partnerId ? 'Verified' : 'Pending');

        await setDoc(userRef, {
          fullName: nameVal.trim(),
          country: countryVal,
          currency: currencyVal,
          language: languageVal,
          timezone: timezoneVal,
          bio: bioVal.trim(),
          photoURL: finalPhotoURL,
          relationshipMode: mappedMode,
          verificationStatus: finalVerificationStatus
        }, { merge: true });
      }

      // 3. Update local Zustand store
      setProfile({
        partner1: nameVal.trim(),
        country: countryVal,
        currency: currencyVal,
        bio: bioVal.trim(),
        profilePhoto: finalPhotoURL,
        language: languageVal,
        timezone: timezoneVal,
        verificationStatus: verificationStatus || (partnerId ? 'Verified' : 'Pending')
      });

      setSaveState('success');
      toast.success('Profile saved successfully.');
      
      // Delay closing to show success checkmark
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving profile details:", err);
      toast.error('Failed to save profile changes. Please try again.');
      setSaveState('idle');
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoVal('');
    setRawImageSrc(null);
    toast.success('Photo removed. Click save to apply changes.');
  };

  // Apple-style open/close variants: 220ms ease-out, scale 0.96 -> 1, no bounce
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.22, ease: 'easeIn' } }
  };

  const isDark = theme === 'dark';
  const footerBg = isDark ? 'rgba(35, 33, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000, // Z-INDEX: 100000 ABOVE NAVBAR
            background: 'rgba(10, 10, 10, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="liquid-glass"
            style={{
              width: '100%',
              maxWidth: '700px', // DESKTOP WIDTH: 700PX
              position: 'relative',
              maxHeight: '90vh', // MAX HEIGHT: 90VH
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 100001
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px 28px 18px', 
              borderBottom: '1px solid var(--border-mid)'
            }}>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Edit <em>Profile</em>
              </h3>
              <button 
                onClick={onClose}
                disabled={saveState !== 'idle'}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-warm)',
                  border: '1px solid var(--border-mid)', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }} className="hide-scrollbar">
              
              {/* Photo Upload System */}
              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '10px' }}>
                  Profile Photo
                </span>

                {!rawImageSrc && !photoVal ? (
                  // Drag & Drop Area
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      height: '120px',
                      borderRadius: '16px',
                      border: dragActive ? `2px dashed ${T.gold}` : '2px dashed var(--border-mid)',
                      background: dragActive ? 'var(--gold-pale)' : 'var(--bg-warm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      padding: '16px'
                    }}
                  >
                    <Upload size={24} style={{ color: dragActive ? T.gold : 'var(--text-faint)', marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Drag & drop image here or <span style={{ color: T.gold }}>browse</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                      PNG, JPG or WEBP up to 5MB
                    </span>
                  </div>
                ) : (
                  // Image Canvas Crop Area or Preview
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {rawImageSrc ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--bg-card)', boxShadow: 'var(--shadow)', cursor: 'move' }}>
                          <canvas 
                            ref={canvasRef} 
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUpOrLeave}
                            onMouseLeave={handleCanvasMouseUpOrLeave}
                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px' }}>
                          <ZoomIn size={14} style={{ color: 'var(--text-faint)' }} />
                          <input 
                            type="range" 
                            min={1} 
                            max={3} 
                            step={0.05} 
                            value={zoom} 
                            onChange={(e) => setZoom(parseFloat(e.target.value))} 
                            style={{ flex: 1, height: '4px' }}
                            className="eb-slider"
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={photoVal} 
                          alt="Crop Preview" 
                          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-card)', boxShadow: 'var(--shadow)' }} 
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', width: 'auto', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <RotateCw size={12} /> Replace Image
                      </button>
                      <button 
                        onClick={handleRemovePhoto}
                        className="btn-reset"
                        style={{
                          padding: '6px 14px', fontSize: '0.78rem', width: 'auto', color: 'var(--rose)',
                          borderColor: 'var(--rose-border)', border: '1px solid', background: 'transparent',
                          borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', gap: '6px', alignItems: 'center'
                        }}
                      >
                        <Trash2 size={12} /> Remove Photo
                      </button>
                    </div>
                  </div>
                )}
                
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFile(e.target.files[0])} 
                  style={{ display: 'none' }} 
                />
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="onb-input-glow" 
                      value={nameVal} 
                      onChange={(e) => setNameVal(e.target.value)} 
                      placeholder="Enter your name"
                      style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Country
                    </label>
                    <select 
                      className="onb-input-glow" 
                      value={countryVal} 
                      onChange={(e) => setCountryVal(e.target.value)}
                      style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)', boxSizing: 'border-box' }}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Currency
                    </label>
                    <select 
                      className="onb-input-glow" 
                      value={currencyVal} 
                      onChange={(e) => setCurrencyVal(e.target.value)}
                      style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)', boxSizing: 'border-box' }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Language
                    </label>
                    <select 
                      className="onb-input-glow" 
                      value={languageVal} 
                      onChange={(e) => setLanguageVal(e.target.value)}
                      style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)', boxSizing: 'border-box' }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Timezone
                    </label>
                    <select 
                      className="onb-input-glow" 
                      value={timezoneVal} 
                      onChange={(e) => setTimezoneVal(e.target.value)}
                      style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)', boxSizing: 'border-box' }}
                    >
                      <option value="GMT+5:30">GMT+5:30 (IST)</option>
                      <option value="GMT-5:00">GMT-5:00 (EST)</option>
                      <option value="GMT+0:00">GMT+0:00 (UTC/GMT)</option>
                      <option value="GMT+8:00">GMT+8:00 (SGT)</option>
                      <option value="GMT+1:00">GMT+1:00 (CET)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>
                      Relationship Stage (Read-only)
                    </label>
                    <div 
                      className="onb-input-glow" 
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: 'var(--bg-warm)', color: 'var(--text-faint)', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                    >
                      {relationshipStage || 'Single'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>
                      Account Email (Read-only)
                    </label>
                    <div 
                      className="onb-input-glow" 
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: 'var(--bg-warm)', color: 'var(--text-faint)', border: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxSizing: 'border-box' }}
                    >
                      {email || user?.email || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>
                      EverBond ID (Read-only)
                    </label>
                    <div 
                      className="onb-input-glow" 
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: 'var(--bg-warm)', color: 'var(--text-faint)', border: '1px solid var(--border)', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    >
                      {everBondId || 'EB-XXXXXX'}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Bio
                  </label>
                  <textarea 
                    className="onb-input-glow" 
                    rows={3}
                    value={bioVal} 
                    onChange={(e) => setBioVal(e.target.value)} 
                    placeholder="Share a short bio about yourself..."
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              borderTop: '1px solid var(--border-mid)', 
              padding: '18px 28px 24px',
              background: footerBg,
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              <button 
                className="btn-secondary" 
                disabled={saveState !== 'idle'}
                style={{ width: 'auto', padding: '10px 24px', cursor: 'pointer', borderRadius: '100px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-mid)', background: 'transparent', color: 'var(--text)' }} 
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button 
                className="btn-primary" 
                disabled={saveState !== 'idle'}
                style={{ 
                  width: 'auto', 
                  padding: '10px 26px', 
                  background: saveState === 'success' ? T.sage : `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`, 
                  cursor: saveState === 'idle' ? 'pointer' : 'default',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fff',
                  border: 'none',
                  boxShadow: saveState === 'success' ? 'none' : 'var(--sh-gold)',
                  transition: 'all 0.2s ease'
                }} 
                onClick={handleSave}
              >
                {saveState === 'loading' && <Loader2 size={16} className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} />}
                {saveState === 'success' && <Check size={16} />}
                {saveState === 'idle' && 'Save Changes'}
                {saveState === 'loading' && 'Saving...'}
                {saveState === 'success' && 'Saved!'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
