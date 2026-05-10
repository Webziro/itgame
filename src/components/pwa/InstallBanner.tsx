'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:w-96"
        >
          <div className="bg-primary text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-lg">
            <div className="bg-white/20 p-3 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg leading-tight">Install TriviaWin</h4>
              <p className="text-white/80 text-sm">Add to home screen for a better experience</p>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleInstall}
                className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm"
              >
                Install
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-white/60 text-xs font-medium hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
