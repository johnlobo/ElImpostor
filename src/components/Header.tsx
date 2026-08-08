import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Smartphone, WifiOff, RefreshCw, Home as HomeIcon } from 'lucide-react';
import { es } from '../i18n/es';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
  onOpenPwaModal?: () => void;
  showHomeBtn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onGoHome,
  onOpenPwaModal,
  showHomeBtn = false
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showHomeBtn && onGoHome ? (
            <button
              onClick={onGoHome}
              id="header-home-btn"
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              title={es.back}
              aria-label={es.back}
            >
              <HomeIcon className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="impostor">🕵️‍♂️</span>
              <div>
                <h1 className="font-extrabold text-lg text-amber-400 tracking-tight leading-none">
                  {es.appName}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Local-First PWA</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3 h-3 text-emerald-400" />
              <span>{es.offlineBadge}</span>
            </div>
          )}

          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              id="header-pwa-btn"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 active:scale-95 transition-all"
              title={es.pwaInstall}
              aria-label={es.pwaInstall}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleSound}
            id="header-sound-btn"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 active:scale-95 transition-all"
            title={soundEnabled ? "Silenciar" : "Activar sonido"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
