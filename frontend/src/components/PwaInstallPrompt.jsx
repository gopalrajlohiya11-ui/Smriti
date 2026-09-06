import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Smartphone, Share2, PlusSquare, X, Sparkles } from 'lucide-react';

export default function PwaInstallPrompt() {
  const { currentLanguage } = useApp();
  const isHindi = (currentLanguage?.code || '').startsWith('hi');
  const isAssamese = (currentLanguage?.code || '').startsWith('as');

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('smriti_pwa_banner_dismissed_v2') === 'true';
  });

  useEffect(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    if (isIosDevice && !isStandalone) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      window.__smriti_pwa_prompt = e;
      window.dispatchEvent(new CustomEvent('smriti_pwa_ready'));
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      window.__smriti_pwa_prompt = null;
      localStorage.removeItem('smriti_pwa_banner_dismissed_v2');
      console.log('Smriti PWA installed successfully');
    };

    const handleManualTrigger = () => {
      if (window.__smriti_pwa_prompt) {
        window.__smriti_pwa_prompt.prompt();
      } else {
        setShowIOSModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('smriti_trigger_pwa_install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('smriti_trigger_pwa_install', handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptEvent = deferredPrompt || window.__smriti_pwa_prompt;
    if (!promptEvent) {
      setShowIOSModal(true);
      return;
    }

    try {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      window.__smriti_pwa_prompt = null;
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('smriti_pwa_banner_dismissed_v2', 'true');
  };

  if (isInstalled) return null;
  if (isDismissed && !showIOSModal) return null;

  return (
    <>
      {!isDismissed && (
        <aside 
          aria-label={isHindi ? 'स्मृति ऐप इंस्टॉल करें' : 'Install Smriti App'}
          className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-[#9a3412]/30 shadow-2xl shadow-stone-900/15 flex flex-col gap-3 relative">
            
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-[#9a3412] text-white flex items-center justify-center shrink-0 shadow-md border border-amber-800/30 overflow-hidden">
                <img 
                  src="/pwa-192x192.png" 
                  alt="Smriti Icon" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/favicon.svg';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    {isHindi ? 'त्वरित ऐप' : isAssamese ? 'দ্ৰুত এপ্প' : 'Instant App'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-stone-900 truncate mt-0.5">
                  {isHindi ? 'स्मृति ऐप इंस्टॉल करें' : isAssamese ? 'স্মৃতি এপ্প ইনষ্টল কৰক' : 'Install Smriti App'}
                </h3>
                <p className="text-xs text-stone-600 font-medium line-clamp-1">
                  {isHindi 
                    ? '1-टैप उपयोग और ऑफलाइन काम के लिए होम स्क्रीन पर जोड़ें 📲' 
                    : isAssamese
                    ? 'দ্ৰুত ব্যৱহাৰৰ বাবে হোম স্ক্ৰীণত যোগ কৰক 📲'
                    : 'Add to home screen for 1-tap fast access & offline use 📲'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#9a3412] to-[#c2410c] hover:from-[#7c2d12] hover:to-[#9a3412] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isHindi ? '📲 होम स्क्रीन पर जोड़ें' : isAssamese ? '📲 স্ক্ৰীণত যোগ কৰক' : '📲 Add to Home Screen'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {isHindi ? 'बाद में' : 'Later'}
              </button>
            </div>

          </div>
        </aside>
      )}

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 border border-stone-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF7ED] border-2 border-[#9a3412]/30 text-[#9a3412] mx-auto flex items-center justify-center shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {isHindi ? 'होम स्क्रीन पर कैसे जोड़ें' : 'How to Add to Home Screen'}
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                {isHindi 
                  ? 'सफारी या किसी भी ब्राउज़र से ऐप को अपनी होम स्क्रीन पर आसानी से जोड़ें:'
                  : 'Follow these quick steps in your browser to install Smriti:'}
              </p>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs font-semibold text-stone-800">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#9a3412] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p>
                  {isHindi ? 'ब्राउज़र के नीचे ' : 'Tap the '}
                  <strong className="text-[#9a3412] inline-flex items-center gap-1 font-bold"><Share2 className="w-3.5 h-3.5 inline" /> Share</strong>
                  {isHindi ? ' बटन को स्पर्श करें।' : ' button in the browser toolbar.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#9a3412] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p>
                  {isHindi ? 'नीचे स्क्रॉल करें और ' : 'Scroll down and tap '}
                  <strong className="text-[#9a3412] inline-flex items-center gap-1 font-bold"><PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</strong>
                  {isHindi ? ' चुनें।' : '.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#9a3412] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p>
                  {isHindi ? 'ऊपर दाईं ओर ' : 'Tap '}
                  <strong className="text-emerald-700 font-bold">Add (जोड़ें)</strong>
                  {isHindi ? ' पर टैप करें। ऐप तैयार है!' : ' in the top right. You are ready!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full min-h-[48px] rounded-2xl bg-[#9a3412] hover:bg-[#7c2d12] text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-98"
            >
              {isHindi ? 'समझ गया 👍' : 'Got it 👍'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
