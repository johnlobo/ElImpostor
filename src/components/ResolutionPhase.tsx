import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldAlert, Sparkles, RefreshCw, ArrowRight, Award } from 'lucide-react';
import { GameState } from '../types';
import { es } from '../i18n/es';
import { audioManager } from '../lib/audio';
import { triggerHaptic } from '../lib/haptics';

interface ResolutionPhaseProps {
  gameState: GameState;
  onNextRound: () => void;
  onViewScoreboard: () => void;
  onNewMatch: () => void;
}

export const ResolutionPhase: React.FC<ResolutionPhaseProps> = ({
  gameState,
  onNextRound,
  onViewScoreboard,
  onNewMatch
}) => {
  const isCrewVictory = gameState.winningTeam === 'CREW';

  useEffect(() => {
    // Sound & Confetti celebration
    audioManager.playVictory(gameState.config.soundEnabled);
    triggerHaptic([100, 50, 100, 50, 200], gameState.config.vibrationEnabled);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: isCrewVictory ? ['#10b981', '#3b82f6', '#f59e0b'] : ['#f43f5e', '#a855f7', '#38bdf8']
      });
    } catch {
      // Confetti fallback if disabled
    }
  }, [isCrewVictory, gameState.config]);

  const impostorPlayers = gameState.players.filter(p => gameState.impostorIds.includes(p.id));

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      {/* Victory Header Banner */}
      <div
        className={`rounded-3xl p-6 border shadow-2xl text-center space-y-4 ${
          isCrewVictory
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/80 shadow-emerald-950/50'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 border-rose-500/80 shadow-rose-950/50'
        }`}
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xl ${
            isCrewVictory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          {isCrewVictory ? <Trophy className="w-10 h-10 text-amber-400" /> : <ShieldAlert className="w-10 h-10 text-rose-400" />}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isCrewVictory ? es.crewmateVictory : es.impostorVictory}
          </h2>
          <p className="text-xs text-slate-300 font-medium px-2">
            {gameState.winningReason}
          </p>
        </div>
      </div>

      {/* Secret Word & Impostors Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 text-xs">
        {/* Secret word box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest block">
            {es.revealedWord.split(':')[0]}
          </span>
          <span className="text-2xl font-black text-white block tracking-wide">
            {gameState.secretWord.word}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Categoría: <strong className="text-amber-300">{gameState.categoryName}</strong>
          </span>
        </div>

        {/* Impostor Identity list */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            {es.impostorsWere.split(':')[0]}
          </span>
          <div className="space-y-1.5">
            {impostorPlayers.map(p => (
              <div key={p.id} className="bg-slate-950 p-2.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg ${p.color} flex items-center justify-center text-sm`}>
                    {p.avatar}
                  </span>
                  <span className="font-extrabold text-white">{p.name}</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-md">
                  IMPOSTOR 🕵️
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Guess outcome if applicable */}
        {gameState.impostorGuessedWord && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 space-y-1 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">Último Intento del Impostor</span>
            <div className="font-bold">
              Palabra probada: <strong className="text-amber-300">"{gameState.impostorGuessedWord}"</strong>
            </div>
            <div className={`text-[11px] font-extrabold ${gameState.impostorGuessCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gameState.impostorGuessCorrect ? '¡Correcto! Robó la victoria 🏆' : '¡Incorrecto! No logró adivinar ❌'}
            </div>
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="space-y-2.5">
        <button
          onClick={onNextRound}
          id="resolution-next-round-btn"
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-98 flex items-center justify-center gap-2 text-base"
        >
          <RefreshCw className="w-5 h-5" />
          <span>{es.playAgain} (Ronda {gameState.roundNumber + 1})</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onViewScoreboard}
            id="resolution-scoreboard-btn"
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 text-xs flex items-center justify-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Ver Marcador</span>
          </button>
          <button
            onClick={onNewMatch}
            id="resolution-new-match-btn"
            className="py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl border border-slate-800 text-xs"
          >
            <span>{es.newMatch}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
