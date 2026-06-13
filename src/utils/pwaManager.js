/**
 * production-grade PWA Installation State Manager
 * Handles state detection, event handling, platform detection, PWA launch, and diagnostics.
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = window.deferredPrompt || null;
    this.isStandalone = this.checkStandalone();
    
    // Initialize installed state: 
    // Start with standalone check, then verify with async APIs (getInstalledRelatedApps)
    this.isInstalled = this.isStandalone;
    
    // State can be: 'CHECKING' | 'INSTALLABLE' | 'INSTALLED' | 'MANUAL_INSTALL'
    this.installState = this.isStandalone ? 'INSTALLED' : 'CHECKING';
    
    this.subscribers = new Set();
    this.diagnosticsResult = null;

    // Set up event listeners
    this.init();
  }

  init() {
    // Check if standalone on boot
    this.isStandalone = this.checkStandalone();
    if (this.isStandalone) {
      this.isInstalled = true;
      this.installState = 'INSTALLED';
    }

    // Capture deferred prompt if it was already caught in index.html
    if (window.deferredPrompt) {
      this.deferredPrompt = window.deferredPrompt;
      this.isInstalled = false;
      this.installState = 'INSTALLABLE';
      // Clear localStorage stale installed flag if prompt is available
      localStorage.removeItem('pwa_installed');
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Cache the event so it can be triggered later
      window.deferredPrompt = e;
      this.deferredPrompt = e;
      this.isInstalled = false;
      this.installState = 'INSTALLABLE';
      
      // Clear stale flags
      localStorage.removeItem('pwa_installed');
      
      this.notifySubscribers();
      
      if (this.isDevMode()) {
        console.log('%c[PWA Manager] beforeinstallprompt fired. App is installable.', 'color: #B8902A; font-weight: bold;');
      }
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', (e) => {
      this.deferredPrompt = null;
      window.deferredPrompt = null;
      this.isInstalled = true;
      this.installState = 'INSTALLED';
      localStorage.setItem('pwa_installed', 'true');
      
      this.notifySubscribers();

      if (this.isDevMode()) {
        console.log('%c[PWA Manager] appinstalled event fired. Installation successful!', 'color: #2e7d32; font-weight: bold;');
      }
    });

    // Perform async installed checks
    this.checkInstalledState();

    // Run diagnostics in development mode
    if (this.isDevMode()) {
      // Run after a short delay to allow page resources to settle
      setTimeout(() => this.runDiagnostics(), 2000);
    }
  }

  // Check if currently running inside the PWA standalone window
  checkStandalone() {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
    return !!isStandaloneMode;
  }

  // Use modern getInstalledRelatedApps API to check if installed on system
  async checkInstalledState() {
    if (this.isStandalone) {
      this.isInstalled = true;
      this.installState = 'INSTALLED';
      this.notifySubscribers();
      return;
    }

    let detectedInstalledStatus = false;

    // 1. Check getInstalledRelatedApps (Chromium only)
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        // If relatedApps returns our app, it is installed
        if (relatedApps && relatedApps.length > 0) {
          detectedInstalledStatus = true;
        }
      } catch (err) {
        if (this.isDevMode()) {
          console.warn('[PWA Manager] getInstalledRelatedApps check failed:', err);
        }
      }
    }

    // 2. LocalStorage fallback check (only if browser does not support prompt or prompt has not fired)
    // If the browser supports prompt (onbeforeinstallprompt in window) but prompt hasn't fired yet,
    // we don't rely blindly on localStorage as the ground truth. 
    // We only use localStorage if prompt isn't supported, or as a secondary signal.
    const hasInstalledFlag = localStorage.getItem('pwa_installed') === 'true';
    
    if (detectedInstalledStatus) {
      this.isInstalled = true;
      this.installState = 'INSTALLED';
    } else if (this.deferredPrompt) {
      this.isInstalled = false;
      this.installState = 'INSTALLABLE';
    } else {
      // If prompt is not supported (e.g. Safari, Firefox)
      const supportsPrompt = 'onbeforeinstallprompt' in window;
      if (!supportsPrompt) {
        if (this.isStandalone) {
          this.isInstalled = true;
          this.installState = 'INSTALLED';
        } else {
          // Safari / iOS browser cannot trigger prompt, show manual instructions
          this.isInstalled = hasInstalledFlag; // Trust local flag only on Safari/iOS if not standalone
          this.installState = hasInstalledFlag ? 'INSTALLED' : 'MANUAL_INSTALL';
        }
      } else {
        // Chromium browser, but prompt hasn't fired yet
        // If getInstalledRelatedApps says false, it's not installed.
        // We'll wait a bit. If prompt fires, state becomes INSTALLABLE.
        // If it doesn't fire after a while, we assume it needs manual install or is installable via browser bar.
        setTimeout(() => {
          if (!this.deferredPrompt && !this.isInstalled) {
            // Check if we are still checking
            if (this.installState === 'CHECKING') {
              this.installState = 'MANUAL_INSTALL';
              this.notifySubscribers();
            }
          }
        }, 3000);
      }
    }

    this.notifySubscribers();
  }

  // Subscribe to state updates
  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediately call back with current state
    callback(this.getStateSnapshot());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = this.getStateSnapshot();
    this.subscribers.forEach((callback) => callback(state));
  }

  getStateSnapshot() {
    return {
      isStandalone: this.isStandalone,
      isInstalled: this.isInstalled,
      installState: this.installState,
      isInstallable: !!this.deferredPrompt,
      platform: this.getPlatformDetails()
    };
  }

  // Get OS and browser details for manual install UI
  getPlatformDetails() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isWindows = /Windows/i.test(ua);
    const isMac = /Macintosh/i.test(ua) && !isIOS;
    
    let browser = 'Unknown';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';

    return {
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isMobile: isIOS || isAndroid,
      isDesktop: !isIOS && !isAndroid,
      browser
    };
  }

  // Trigger PWA native install prompt
  async triggerInstall() {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (this.isDevMode()) {
          console.log(`[PWA Manager] User choice outcome: ${outcome}`);
        }
        if (outcome === 'accepted') {
          this.isInstalled = true;
          this.installState = 'INSTALLED';
          localStorage.setItem('pwa_installed', 'true');
          this.deferredPrompt = null;
          window.deferredPrompt = null;
          this.notifySubscribers();
          return { success: true, outcome };
        }
        return { success: false, outcome };
      } catch (err) {
        console.error('[PWA Manager] Installation prompt error:', err);
        return { success: false, error: err };
      }
    } else {
      // No prompt, return manual install request
      return { success: false, manual: true };
    }
  }

  // Try to open the PWA standalone app
  openApp() {
    // Attempt custom protocol launch
    const pwaUrl = window.location.origin + '/';
    
    if (this.isDevMode()) {
      console.log('[PWA Manager] Launching PWA. Scope:', pwaUrl);
    }
    
    // 1. Try launching using the protocol handler (registered in manifest)
    // Using an iframe to avoid browser navigate errors
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'web+everbond://open';
    document.body.appendChild(iframe);
    
    // Remove iframe after short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);

    // 2. Also open in new window. 
    // In Chromium, if the app is installed, window.open() to scoped URL will open the PWA standalone app automatically.
    // In iOS/Safari, it will open in a new tab, which serves as a graceful fallback.
    window.open(pwaUrl, '_blank');
  }

  // Clear stale install state (used in debugging or force-resetting)
  resetInstallState() {
    localStorage.removeItem('pwa_installed');
    this.isInstalled = false;
    this.installState = this.isStandalone ? 'INSTALLED' : 'CHECKING';
    this.checkInstalledState();
  }

  isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.port !== '';
  }

  // Run comprehensive diagnostic audit for PWA criteria
  async runDiagnostics() {
    const results = {
      serviceWorkerRegistered: false,
      serviceWorkerActive: false,
      manifestLinked: false,
      manifestParsed: false,
      iconsAvailable: false,
      displayModeValid: false,
      beforeInstallPromptFired: !!this.deferredPrompt,
      platform: this.getPlatformDetails()
    };

    // 1. Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs && regs.length > 0) {
          results.serviceWorkerRegistered = true;
          // Check if any is active
          results.serviceWorkerActive = regs.some(reg => reg.active && reg.active.state === 'activated');
        }
      } catch (e) {
        console.error('[PWA Diagnostics] Service worker list error:', e);
      }
    }

    // 2. Check Manifest Link
    const manifestEl = document.querySelector('link[rel="manifest"]');
    results.manifestLinked = !!manifestEl;

    // 3. Fetch and parse manifest
    if (manifestEl) {
      try {
        const res = await fetch(manifestEl.href);
        const text = await res.text();
        const json = JSON.parse(text);
        results.manifestParsed = true;
        
        // Check display mode
        results.displayModeValid = ['standalone', 'minimal-ui', 'fullscreen'].includes(json.display);

        // Check icons
        if (json.icons && json.icons.length > 0) {
          // Check if key sizes are available
          const has192 = json.icons.some(icon => icon.sizes === '192x192');
          const has512 = json.icons.some(icon => icon.sizes === '512x512');
          const hasMaskable = json.icons.some(icon => icon.purpose === 'maskable');
          results.iconsAvailable = has192 && has512 && hasMaskable;
        }
      } catch (e) {
        console.error('[PWA Diagnostics] Manifest fetch/parse error:', e);
      }
    }

    this.diagnosticsResult = results;

    // Log a beautiful developer dashboard
    console.log(
      `%c ━━━ EVERBOND PWA DIAGNOSTIC REPORT ━━━ `, 
      'background: #1C1A16; color: #B8902A; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
    );
    
    const logCheck = (label, pass, details = '') => {
      const color = pass ? '#2e7d32' : '#c62828';
      const icon = pass ? '✓' : '✗';
      console.log(
        `%c ${icon} ${label}: %c${pass ? 'PASS' : 'FAIL'} %c${details}`,
        'font-weight: 500;',
        `color: ${color}; font-weight: bold;`,
        'color: #6B6455; font-style: italic;'
      );
    };

    logCheck('Service Worker Registered', results.serviceWorkerRegistered, results.serviceWorkerRegistered ? 'Active sw.js found.' : 'No service worker registered.');
    logCheck('Service Worker ActiveStatus', results.serviceWorkerActive, results.serviceWorkerActive ? 'Active and running.' : 'SW registered but not active.');
    logCheck('Manifest Link in HTML', results.manifestLinked, results.manifestLinked ? manifestEl.getAttribute('href') : 'No <link rel="manifest"> found in head.');
    logCheck('Manifest JSON Valid', results.manifestParsed, results.manifestParsed ? 'Manifest parsed successfully.' : 'Failed to fetch/parse manifest.json.');
    logCheck('Standalone Display Mode', results.displayModeValid, results.displayModeValid ? 'Valid display mode.' : 'display mode must be standalone/minimal-ui.');
    logCheck('App Icons Configured', results.iconsAvailable, results.iconsAvailable ? 'Contains 192px, 512px, and maskable icons.' : 'Missing required icons in manifest.');
    logCheck('beforeinstallprompt Fired', results.beforeInstallPromptFired, results.beforeInstallPromptFired ? 'Prompt event captured.' : 'Prompt event pending or blocked.');
    
    console.log(`%c Current Install State: ${this.installState} `, 'background: #FAF6EE; color: #1C1A16; font-weight: 700; border: 1px solid var(--border); padding: 2px 4px;');
    console.log(
      `%c Platform: OS=${results.platform.isIOS ? 'iOS' : results.platform.isAndroid ? 'Android' : 'Desktop'}, Browser=${results.platform.browser}, Standalone=${this.isStandalone} `, 
      'color: #6B6455;'
    );
    console.log(
      `%c ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ `, 
      'color: #B8902A; font-weight: bold;'
    );

    return results;
  }
}

// Create a singleton instance
export const pwaManager = new PWAManager();
window.pwaManager = pwaManager; // Expose globally for debugging console
