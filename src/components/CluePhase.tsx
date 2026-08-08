import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { GameState, Player } from '../types';
import { es } from '../i18n/es';
import { audioManager } from '../lib/audio';
import { triggerHaptic } from '../lib/haptics';

interface CluePhaseProps {
  gameState: GameState;
  onFinishClues: () => void;
}

export const CluePhase: React.FC<CluePhaseProps> = ({ gameState, onFinishClues }) => {
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameState.config.turnTimerSeconds || 45);
  const [isTimerRunning, setIsTimerRunning] = useState(gameState.config.clueOrder === 'timer');

  // Guards against the manual "next turn" click and the timer's auto-advance
  // firing within the same tick, which would otherwise skip a player's turn.
  const isAdvancingRef = useRef(false);

  const totalPlayers = gameState.players.length;
  const currentTurnPlayer: Player = gameState.players[activeTurnIndex % totalPlayers];

  // Ticking interval: created once per run (start/pause), not recreated
  // every second, so it doesn't depend on timeLeft.
  useEffect(() => {
    if (gameState.config.clueOrder !== 'timer' || !isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 0;
        if (prev <= 5) {
          audioManager.playTick(gameState.config.soundEnabled);
          triggerHaptic(30, gameState.config.vibrationEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, gameState.config.clueOrder, gameState.config.soundEnabled, gameState.config.vibrationEnabled]);

  // Reacts once the ticking interval above brings timeLeft to 0.
  useEffect(() => {
    if (gameState.config.clueOrder !== 'timer' || !isTimerRunning) return;
    if (timeLeft !== 0) return;

    audioManager.playBeepAlert(gameState.config.soundEnabled);
    triggerHaptic([100, 50, 100], gameState.config.vibrationEnabled);
    handleNextTurn();
  }, [timeLeft]);

  const handleNextTurn = () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setTimeout(() => { isAdvancingRef.current = false; }, 0);

    triggerHaptic(30, gameState.config.vibrationEnabled);
    setActiveTurnIndex(prev => prev + 1);
    setTimeLeft(gameState.config.turnTimerSeconds || 45);
    setIsTimerRunning(gameState.config.clueOrder === 'timer');
  };

  const handleToggleTimer = () => {
    triggerHaptic(20, gameState.config.vibrationEnabled);
    setIsTimerRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    triggerHaptic(20, gameState.config.vibrationEnabled);
    setTimeLeft(gameState.config.turnTimerSeconds || 45);
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      {/* Round continues: an impostor was caught but more remain */}
      {gameState.roundNotice && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/70 rounded-2xl text-emerald-300 text-xs font-medium text-center">
          {gameState.roundNotice}
        </div>
      )}

      {/* Category Reminder Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase tracking-wider">{es.categoryIs}</span>
          <span className="font-extrabold text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            {gameState.categoryName}
          </span>
        </div>
        <span className="text-slate-400 font-medium">Fase 2 de 4</span>
      </div>

      {/* Mode-specific view */}
      {gameState.config.clueOrder === 'free' ? (
        /* Free Discussion Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
            <MessageSquare className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">{es.orderFree}</h2>
            <p className="text-xs text-slate-300 leading-relaxed px-2">
              Todos los jugadores pueden hablar libremente en cualquier orden. Cada uno debe dar una pista sutil sobre la palabra secreta.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-left">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Consejos de juego</span>
            </h3>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>No seas demasiado específico o el Impostor sabrá la palabra.</li>
              <li>No seas demasiado vago o los demás sospecharán de ti.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Turn-Based / Timer Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
          {/* Active Turn Player Highlight */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              {es.turnOf.replace('{name}', '')}
            </span>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex items-center justify-center gap-4 shadow-inner">
              <span className={`w-14 h-14 rounded-2xl ${currentTurnPlayer.color} flex items-center justify-center text-3xl shadow-lg`}>
                {currentTurnPlayer.avatar}
              </span>
              <div className="text-left">
                <h2 className="text-2xl font-black text-white">{currentTurnPlayer.name}</h2>
                <span className="text-[11px] text-slate-400 font-medium">¡Danos tu pista!</span>
              </div>
            </div>
          </div>

          {/* Optional Timer Section */}
          {gameState.config.clueOrder === 'timer' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{es.timeRemaining}</span>
                </span>
                <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  {timeLeft}s
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${(timeLeft / (gameState.config.turnTimerSeconds || 45)) * 100}%` }}
                />
              </div>

              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={handleToggleTimer}
                  className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title={isTimerRunning ? "Pausar" : "Iniciar"}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Reiniciar temporizador"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Next Turn Button */}
          <button
            onClick={handleNextTurn}
            id="clue-next-turn-btn"
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <span>{es.nextTurn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Finish Clues -> Go to Voting */}
      <button
        onClick={() => {
          triggerHaptic(40, gameState.config.vibrationEnabled);
          audioManager.playBeepAlert(gameState.config.soundEnabled);
          onFinishClues();
        }}
        id="finish-clues-btn"
        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-98 flex items-center justify-center gap-2 text-base"
      >
        <span>{es.finishClues}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
