'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after delay if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS prompt after delay
    if (ios && !standalone) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1a1a2e] border border-[#e94560]/30 rounded-xl p-4 shadow-2xl z-50 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="text-4xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">Install Casino Demo</h3>
          <p className="text-gray-400 text-sm mb-3">
            {isIOS 
              ? 'Tap the share button and "Add to Home Screen" for the best experience!'
              : 'Install our app for quick access and offline play!'}
          </p>
          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="btn btn-primary text-sm py-2 px-4"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white text-sm py-2 px-4"
            >
              {isIOS ? 'Got it!' : 'Not now'}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
