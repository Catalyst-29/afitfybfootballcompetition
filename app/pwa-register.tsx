'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const mobileDevice = iosDevice || /android|mobile/i.test(navigator.userAgent);
    setIsInstalled(standalone);
    setIsIos(iosDevice);
    setIsMobile(mobileDevice);

    let helpTimer: ReturnType<typeof setTimeout> | undefined;
    if (!standalone && mobileDevice && !sessionStorage.getItem('afit-install-help-seen')) {
      helpTimer = setTimeout(() => {
        setShowIosHelp(true);
        sessionStorage.setItem('afit-install-help-seen', '1');
      }, 1200);
    }

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setIsInstalled(false);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      if (helpTimer) clearTimeout(helpTimer);
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setIsInstalled(true);
      setInstallPrompt(null);
      return;
    }
    setShowIosHelp(true);
  }

  if (isInstalled || (!installPrompt && !isMobile)) return null;

  return (
    <>
      <button className="pwa-install-button" type="button" onClick={installApp} aria-label="Install AFIT Football app">
        <span aria-hidden="true">↓</span> Install App
      </button>
      {showIosHelp && (
        <div className="pwa-install-backdrop" role="presentation" onClick={() => setShowIosHelp(false)}>
          <section className="pwa-install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(event) => event.stopPropagation()}>
            <button className="pwa-install-close" type="button" onClick={() => setShowIosHelp(false)} aria-label="Close">×</button>
            <img src="/icons/afit-192.png" width="72" height="72" alt="AFIT Football" />
            <h2 id="install-title">Install AFIT Football</h2>
            {isIos
              ? <p>In Safari, tap the <strong>Share</strong> button, then choose <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.</p>
              : <p>Tap <strong>Install App</strong> when your browser offers it. If it does not appear, open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>}
          </section>
        </div>
      )}
    </>
  );
}
