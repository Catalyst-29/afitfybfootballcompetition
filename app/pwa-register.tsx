'use client';

import { useEffect, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const INSTALL_CONFIRMED_KEY = 'afit-cup-pwa-installed';

function isInstalled() {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

function wasInstallConfirmed() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(INSTALL_CONFIRMED_KEY) === 'true';
}

function rememberInstallation() {
  window.localStorage.setItem(INSTALL_CONFIRMED_KEY, 'true');
}

export default function PwaRegister() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    if (isInstalled()) {
      rememberInstallation();
      return;
    }
    if (wasInstallConfirmed()) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    const revealTimer = ios ? window.setTimeout(() => setVisible(true), 900) : undefined;
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      rememberInstallation();
      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    setInstalling(true);
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstalling(false);
    setInstallEvent(null);
    setVisible(false);
    if (choice.outcome === 'accepted') rememberInstallation();
  }

  if (pathname !== '/' || !visible || isInstalled() || wasInstallConfirmed()) return null;

  return <div className="pwa-install-backdrop" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
    <section className="pwa-install-dialog">
      <button className="pwa-install-close" type="button" onClick={() => setVisible(false)} aria-label="Close install prompt"><X /></button>
      <img src="/icons/afit-192.png" alt="AFIT Cup app icon" width="76" height="76" />
      <h2 id="pwa-install-title">Install AFIT Cup</h2>
      {installEvent ? <>
        <p>Install the AFIT Cup app on this device for quicker access and an app-like experience.</p>
        <button className="pwa-install-primary" type="button" onClick={install} disabled={installing}><Download />{installing ? 'Opening installer…' : 'Install App'}</button>
      </> : isIos ? <>
        <p>Install on your iPhone or iPad by tapping <b>Share</b>, then choosing <b>Add to Home Screen</b>.</p>
        <div className="pwa-install-instruction"><Share /><span>Share</span><b>→</b><Smartphone /><span>Add to Home Screen</span></div>
      </> : null}
    </section>
  </div>;
}
