import { useState, useEffect } from 'react';
import { pwaManager } from '../../utils/pwaManager';
import { useToast } from '../common/Toast';

export function usePWA() {
  const [pwaState, setPwaState] = useState(pwaManager.getStateSnapshot());
  const [showPopup, setShowPopup] = useState(false);
  const [showMobileSuggest, setShowMobileSuggest] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Subscribe to central PWA Manager updates
    const unsubscribe = pwaManager.subscribe((newState) => {
      setPwaState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Mobile suggestion banner auto-display logic
  useEffect(() => {
    const checkMobileAndSuggest = () => {
      const isMobile = window.innerWidth < 768;
      const dismissedThisSession = sessionStorage.getItem('pwa_mobile_suggest_dismissed') === 'true';
      
      // Suggest if on mobile, app not installed, and either installable or requires manual install
      const canInstall = pwaState.installState === 'INSTALLABLE' || pwaState.installState === 'MANUAL_INSTALL';
      
      if (isMobile && !pwaState.isInstalled && canInstall && !dismissedThisSession) {
        setShowMobileSuggest(true);
      } else {
        setShowMobileSuggest(false);
      }
    };

    // Run after a short delay on mount/state change
    const timer = setTimeout(checkMobileAndSuggest, 2000);

    const handleResize = () => {
      checkMobileAndSuggest();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [pwaState.isInstalled, pwaState.installState]);

  const dismissMobileSuggest = () => {
    sessionStorage.setItem('pwa_mobile_suggest_dismissed', 'true');
    setShowMobileSuggest(false);
  };

  const triggerInstallFlow = async () => {
    const result = await pwaManager.triggerInstall();
    
    if (result.success) {
      toast.success('✓ Welcome to EverBond Wealth PWA experience!');
      setShowPopup(false);
    } else if (result.manual) {
      // If native prompt is not supported, this triggers showing the manual install guide.
      // This is handled in the UI by opening the manual guide modal.
      setShowPopup(true);
    } else if (result.error) {
      toast.error('Installation could not be started. Please try installing from browser menu.');
    }
  };

  const openApp = () => {
    pwaManager.openApp();
  };

  return {
    isInstalled: pwaState.isInstalled,
    isInstallable: pwaState.isInstallable,
    installState: pwaState.installState,
    platform: pwaState.platform,
    isStandalone: pwaState.isStandalone,
    showPopup,
    setShowPopup,
    showMobileSuggest,
    dismissMobileSuggest,
    triggerInstallFlow,
    openApp
  };
}
