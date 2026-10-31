import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, RefreshCw, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as installed standalone app
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isWindowStandalone || isNavStandalone);
    };
    checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Custom PWA update event
    const handleUpdateReady = () => setUpdateAvailable(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-ready', handleUpdateReady);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-ready', handleUpdateReady);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Update ready banner */}
      {updateAvailable && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-full shadow-2xl border-2 border-emerald-300 animate-bounce">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="font-bold text-sm">Update ready! Tap to refresh</span>
          <button
            onClick={handleReload}
            className="bg-white text-emerald-800 font-bold px-3 py-1 rounded-full text-xs shadow hover:bg-emerald-50 active:scale-95 transition"
          >
            Update Now
          </button>
        </div>
      )}

      {/* Offline toast */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold border border-amber-400">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline Mode Active - Studio Works 100%!</span>
        </div>
      )}

      {/* In-App Install Button (Hidden if already standalone) */}
      {!isStandalone && (deferredPrompt || isIOS) && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold px-3.5 py-2 rounded-2xl shadow-lg border-2 border-amber-200 text-xs md:text-sm active:scale-95 transition cursor-pointer"
          title="Install Table Magic Studio App"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-pink-400/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-300">Install Table Magic</h3>
                <p className="text-xs text-slate-300">On iPhone or iPad Safari</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-200 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white font-bold text-xs shrink-0">1</span>
                <p>
                  Tap the <strong className="text-pink-300 inline-flex items-center gap-1">Share <Share2 className="w-3.5 h-3.5" /></strong> button in Safari's bottom toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs shrink-0">2</span>
                <p>
                  Scroll down the menu and tap <strong className="text-amber-300 inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5" /></strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs shrink-0">3</span>
                <p>
                  Tap <strong className="text-emerald-300">Add</strong> at the top right. Done! Full screen magic offline!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white shadow-lg active:scale-98 transition"
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
