import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { es } from '../i18n/es';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold text-white">{es.pwaInstall}</h2>
          </div>
          <button
            onClick={onClose}
            id="close-pwa-modal-btn"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            Esta app está diseñada como una <strong>Progressive Web App (PWA) local-first</strong>. Tras abrirla una primera vez, ¡puedes usarla totalmente offline en cualquier lugar!
          </p>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>📱</span> iPhone / iPad (Safari)
            </h3>
            <ol className="text-xs space-y-2 list-decimal list-inside text-slate-300">
              <li className="flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Toca el botón <strong>Compartir</strong> en Safari</span>
              </li>
              <li className="flex items-center gap-2">
                <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Selecciona <strong>Añadir a la pantalla de inicio</strong></span>
              </li>
            </ol>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🤖</span> Android (Chrome)
            </h3>
            <ol className="text-xs space-y-2 list-decimal list-inside text-slate-300">
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Toca el menú (3 puntos) o la ventana emergente</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Selecciona <strong>Instalar aplicación</strong></span>
              </li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          id="pwa-understand-btn"
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-98"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};
