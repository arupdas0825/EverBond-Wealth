import { useState, useEffect } from 'react';
import { useToast } from '../common/Toast';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showMobileSuggest, setShowMobileSuggest] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
      const hasInstalledFlag = localStorage.getItem('pwa_installed') === 'true';
      
      if (isStandalone || hasInstalledFlag) {
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
      setShowPopup(false);
      setShowMobileSuggest(false);
      toast.success('✓ EverBond Wealth installed successfully. Welcome to the native experience.');
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.deferredPrompt && !deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast, deferredPrompt]);

  // Mobile suggestion logic
  useEffect(() => {
    const checkMobileAndSuggest = () => {
      const isMobile = window.innerWidth < 768;
      const dismissedThisSession = sessionStorage.getItem('pwa_mobile_suggest_dismissed') === 'true';
      
      if (isMobile && !isInstalled && deferredPrompt && !dismissedThisSession) {
        setShowMobileSuggest(true);
      } else {
        setShowMobileSuggest(false);
      }
    };

    const timer = setTimeout(checkMobileAndSuggest, 1500);

    const handleResize = () => {
      checkMobileAndSuggest();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isInstalled, deferredPrompt]);

  const dismissMobileSuggest = () => {
    sessionStorage.setItem('pwa_mobile_suggest_dismissed', 'true');
    setShowMobileSuggest(false);
  };

  const triggerInstallFlow = async () => {
    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
        setDeferredPrompt(null);
        window.deferredPrompt = null;
      }
      setShowPopup(false);
    } catch (err) {
      console.error('Installation prompt failed:', err);
    }
  };

  return {
    isInstalled,
    isInstallable: !!deferredPrompt,
    showPopup,
    setShowPopup,
    showMobileSuggest,
    dismissMobileSuggest,
    triggerInstallFlow,
  };
}
