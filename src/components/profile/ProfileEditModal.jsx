import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';
import { X, Upload, RotateCw, ZoomIn, Info } from 'lucide-react';

export function ProfileEditModal({ isOpen, onClose }) {
  const store = useFinanceStore();
  const toast = useToast();
  const { 
    partner1, country, currency, bio, profilePhoto, relationshipStage, everBondId, setProfile 
  } = store;

  // Form states
  const [nameVal, setNameVal] = useState(partner1 || '');
  const [countryVal, setCountryVal] = useState(country || 'India');
  const [currencyVal, setCurrencyVal] = useState(currency || 'INR');
  const [bioVal, setBioVal] = useState(bio || '');
  const [photoVal, setPhotoVal] = useState(profilePhoto || '');

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
      setNameVal(partner1 || '');
      setCountryVal(country || 'India');
      setCurrencyVal(currency || 'INR');
      setBioVal(bio || '');
      setPhotoVal(profilePhoto || '');
      setRawImageSrc(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, partner1, country, currency, bio, profilePhoto]);

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

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate dimensions to cover canvas (aspect fill)
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight;

    if (imgRatio > 1) {
      drawHeight = size * zoom;
      drawWidth = size * imgRatio * zoom;
    } else {
      drawWidth = size * zoom;
      drawHeight = (size / imgRatio) * zoom;
    }

    // Centered drawing coordinates + offset
    const x = (size - drawWidth) / 2 + offset.x;
    const y = (size - drawHeight) / 2 + offset.y;

    // Save context
    ctx.save();
    
    // Draw the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    
    // Restore
    ctx.restore();
  };

  // Dragging inside the canvas to reposition image
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

  const handleSave = () => {
    let finalBase64 = photoVal;

    // If a new raw image is uploaded, crop it into a circle
    if (rawImageSrc && canvasRef.current) {
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = 150;
      cropCanvas.height = 150;
      const cropCtx = cropCanvas.getContext('2d');

      // Draw the circular masked version on the output canvas
      cropCtx.beginPath();
      cropCtx.arc(75, 75, 75, 0, Math.PI * 2);
      cropCtx.clip();

      // Draw original canvas image onto this circular canvas
      cropCtx.drawImage(canvasRef.current, 0, 0, 150, 150);
      finalBase64 = cropCanvas.toDataURL('image/jpeg', 0.85); // Compress to base64
    }

    setProfile({
      partner1: nameVal.trim(),
      country: countryVal,
      currency: currencyVal,
      bio: bioVal.trim(),
      profilePhoto: finalBase64
    });

    toast.success('Profile saved successfully.');
    onClose();
  };

  const handleRemovePhoto = () => {
    setPhotoVal('');
    setRawImageSrc(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 5, 8, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="liquid-glass"
          style={{
            width: '100%',
            maxWidth: '540px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow)',
            padding: '28px',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Edit <em>Profile</em>
            </h3>
            <button 
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-warm)',
                border: '1px solid var(--border-mid)', color: 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Photo Upload System */}
          <div style={{ marginBottom: '24px' }}>
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
                  height: '110px',
                  borderRadius: '16px',
                  border: dragActive ? `2px dashed ${T.gold}` : '2px dashed var(--border-mid)',
                  background: dragActive ? 'var(--gold-pale)' : 'var(--bg-warm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: '12px'
                }}
              >
                <Upload size={24} style={{ color: dragActive ? T.gold : 'var(--text-faint)', marginBottom: '8px' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Drag & drop image here or <span style={{ color: T.gold }}>browse</span>
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                  PNG, JPG or WEBP up to 5MB
                </span>
              </div>
            ) : (
              // Image Canvas Crop Area or Existing Preview
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                {rawImageSrc ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
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
                    className="btn-reset"
                    style={{ padding: '6px 14px', fontSize: '0.78rem', width: 'auto', color: T.rose }}
                    onClick={handleRemovePhoto}
                  >
                    Remove Photo
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
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
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)' }}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Currency
                </label>
                <select 
                  className="onb-input-glow" 
                  value={currencyVal} 
                  onChange={(e) => setCurrencyVal(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', background: 'var(--bg-card)' }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>
                  Relationship Stage (Read-only)
                </label>
                <div 
                  className="onb-input-glow" 
                  style={{ padding: '10px 14px', fontSize: '0.88rem', background: 'var(--bg-warm)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {relationshipStage || 'Single'}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>
                EverBond ID (Read-only)
              </label>
              <div 
                className="onb-input-glow" 
                style={{ padding: '10px 14px', fontSize: '0.88rem', background: 'var(--bg-warm)', color: 'var(--text-faint)', border: '1px solid var(--border)', fontFamily: 'monospace' }}
              >
                {everBondId || 'EB-AWAITING-GEN'}
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
                style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px', resize: 'none' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-mid)', paddingTop: '20px' }}>
            <button 
              className="btn-reset" 
              style={{ width: 'auto', padding: '8px 18px' }} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 20px', background: T.gold }} 
              onClick={handleSave}
            >
              Save Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
