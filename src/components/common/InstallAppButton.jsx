import React, { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { T } from '../../theme/tokens';
import { useToast } from '../common/Toast';

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    localStorage.getItem('pwa_installed') === 'true'
  );
  const toast = useToast();

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
      setIsStandalone(standalone);
      if (standalone) {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
      }
    };

    checkStandalone();

    const handleInstallable = () => {
      setDeferredPrompt(window.deferredPrompt);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      toast.success('EverBond Wealth successfully installed! Open from your home screen.');
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        if (outcome === 'accepted') {
          localStorage.setItem('pwa_installed', 'true');
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.deferredPrompt = null;
        }
      } catch (err) {
        console.error('Installation prompt failed:', err);
      }
    } else {
      toast.info('To install, open browser settings (three dots or share button) and choose "Add to Home Screen" or "Install App".');
    }
  };

  const handleOpenClick = () => {
    // Open the home page in a new window. Chrome will prompt or directly open in the standalone app if installed.
    window.open('/', '_blank');
  };

  if (isInstalled && !deferredPrompt) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <button
          onClick={handleOpenClick}
          className="btn-primary"
          style={{
            background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
            boxShadow: 'var(--sh-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            width: '100%',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.2s ease'
          }}
        >
          <ExternalLink size={18} /> Open EverBond
        </button>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center' }}>
          EverBond is installed on this device.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <button
        onClick={handleInstallClick}
        className="btn-primary"
        style={{
          background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
          boxShadow: 'var(--sh-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px',
          width: '100%',
          borderRadius: '12px',
          border: 'none',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '0.88rem',
          transition: 'all 0.2s ease'
        }}
      >
        <Download size={18} /> Install EverBond App
      </button>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        {deferredPrompt 
          ? 'Install EverBond on your device for quick standalone access and offline loading.' 
          : 'Install via your browser\'s "Add to Home Screen" or "Install" option.'}
      </span>
    </div>
  );
}
