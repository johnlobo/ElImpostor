import React from 'react';
import { Play, Users, Settings, Layers, Trophy, RefreshCcw, Smartphone, Shield, Sparkles } from 'lucide-react';
import { GameState, GameConfig, Category, Player } from '../types';
import { es } from '../i18n/es';
import { triggerHaptic } from '../lib/haptics';

interface HomeProps {
  activeGame: GameState | null;
  players: Player[];
  config: GameConfig;
  selectedCategoryName: string;
  onStartNewGame: () => void;
  onResumeGame: () => void;
  onNavigate: (phase: 'SETUP' | 'RULES' | 'CATEGORIES' | 'SCOREBOARD') => void;
  onOpenPwaModal: () => void;
  vibrationEnabled: boolean;
}

export const Home: React.FC<HomeProps> = ({
  activeGame,
  players,
  config,
  selectedCategoryName,
  onStartNewGame,
  onResumeGame,
  onNavigate,
  onOpenPwaModal,
  vibrationEnabled
}) => {
  const canStart = players.length >= 3;

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Juego de Mesa PWA</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">{es.appName}</h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Descubre al impostor en tu grupo compartiendo un solo teléfono. ¡100% Offline!
          </p>
        </div>

        {/* Resume Active Game Prompt if exists */}
        {activeGame && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-left space-y-2 shadow-lg animate-pop-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <RefreshCcw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Partida en curso</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-bold">Ronda {activeGame.roundNumber}</span>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              Categoría: <strong>{activeGame.categoryName}</strong> ({activeGame.players.length} jugadores)
            </p>
            <button
              onClick={() => {
                triggerHaptic(40, vibrationEnabled);
                onResumeGame();
              }}
              id="resume-game-btn"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-98"
            >
              Reanudar Partida
            </button>
          </div>
        )}

        {/* Primary Start Game CTA */}
        <button
          onClick={() => {
            if (canStart) {
              triggerHaptic(50, vibrationEnabled);
              onStartNewGame();
            }
          }}
          disabled={!canStart}
          id="home-start-game-btn"
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl text-lg transition-all shadow-xl shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>{es.quickStart}</span>
        </button>

        {!canStart && (
          <p className="text-[11px] text-amber-300 font-medium">
            ⚠️ Se necesitan al menos 3 jugadores para comenzar.
          </p>
        )}
      </div>

      {/* Quick Setup Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Players Card */}
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            onNavigate('SETUP');
          }}
          id="home-nav-players-btn"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl text-left space-y-2 transition-all shadow-md active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white">{es.setupPlayers}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {players.length} configurado(s)
            </div>
          </div>
        </button>

        {/* Rules Card */}
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            onNavigate('RULES');
          }}
          id="home-nav-rules-btn"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl text-left space-y-2 transition-all shadow-md active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white">{es.configureRules}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {config.impostorCount === -1 ? 'Auto Impostores' : `${config.impostorCount} Impostor(es)`}
            </div>
          </div>
        </button>

        {/* Categories Card */}
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            onNavigate('CATEGORIES');
          }}
          id="home-nav-categories-btn"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl text-left space-y-2 transition-all shadow-md active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white">{es.selectCategories}</div>
            <div className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">
              {selectedCategoryName}
            </div>
          </div>
        </button>

        {/* Scoreboard Card */}
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            onNavigate('SCOREBOARD');
          }}
          id="home-nav-scoreboard-btn"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl text-left space-y-2 transition-all shadow-md active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white">{es.leaderboard}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Ver Puntuaciones
            </div>
          </div>
        </button>
      </div>

      {/* PWA Install Promo Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-200 block">¿Jugar sin internet?</span>
            <span className="text-[10px] text-slate-400">Instálala en la pantalla de inicio de tu móvil</span>
          </div>
        </div>
        <button
          onClick={onOpenPwaModal}
          className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-slate-700 shrink-0 text-xs"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};
