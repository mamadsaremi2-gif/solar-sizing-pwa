import React, { useEffect, useMemo, useState } from "react";
import { Download, WifiOff, CheckCircle2, Smartphone } from "lucide-react";
import SolarEnergySizingApp from "./SolarEnergySizingApp";

function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isOffline,
    install,
  };
}

function PwaStatusBar() {
  const { canInstall, install, isInstalled, isOffline } = usePwaInstall();

  const status = useMemo(() => {
    if (isOffline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: "اپ در حالت آفلاین اجرا شده است. داده های قبلی و پوسته برنامه در دسترس هستند.",
        className: "border-amber-200 bg-amber-50 text-amber-900",
      };
    }
    if (isInstalled) {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: "نسخه نصب شده PWA فعال است.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      };
    }
    return {
      icon: <Smartphone className="h-4 w-4" />,
      text: "این نسخه برای نصب روی موبایل و دسکتاپ به صورت PWA آماده شده است.",
      className: "border-violet-200 bg-violet-50 text-violet-900",
    };
  }, [isInstalled, isOffline]);

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 text-sm">
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${status.className}`}>
          {status.icon}
          <span>{status.text}</span>
        </div>
        {canInstall ? (
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-white transition hover:bg-violet-800"
          >
            <Download className="h-4 w-4" />
            نصب اپ
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <PwaStatusBar />
      <SolarEnergySizingApp />
    </div>
  );
}
