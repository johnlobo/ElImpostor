import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Check, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { GameState, Player } from '../types';
import { es } from '../i18n/es';
import { audioManager } from '../lib/audio';
import { triggerHaptic } from '../lib/haptics';

interface RoleRevealProps {
  gameState: GameState;
  onAllRolesRevealed: () => void;
}

export const RoleReveal: React.FC<RoleRevealProps> = ({
  gameState,
  onAllRolesRevealed
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasRevealedCurrent, setHasRevealedCurrent] = useState(false);

  const totalPlayers = gameState.players.length;
  const currentPlayer: Player = gameState.players[currentPlayerIndex];
  const isImpostor = gameState.impostorIds.includes(currentPlayer.id);

  const handleTouchStart = () => {
    triggerHaptic(40, gameState.config.vibrationEnabled);
    audioManager.playReveal(gameState.config.soundEnabled);
    setIsHolding(true);
    setHasRevealedCurrent(true);
  };

  const handleTouchEnd = () => {
    setIsHolding(false);
  };

  const handleNextPlayer = () => {
    triggerHaptic(30, gameState.config.vibrationEnabled);
    if (currentPlayerIndex + 1 < totalPlayers) {
      setCurrentPlayerIndex(prev => prev + 1);
      setIsHolding(false);
      setHasRevealedCurrent(false);
    } else {
      audioManager.playBeepAlert(gameState.config.soundEnabled);
      onAllRolesRevealed();
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto text-center animate-fade-in py-2">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5">
        <span>Jugador {currentPlayerIndex + 1} de {totalPlayers}</span>
        <div className="flex gap-1">
          {gameState.players.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentPlayerIndex
                  ? 'w-6 bg-amber-400'
                  : i < currentPlayerIndex
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Pass-Phone Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Pass to player banner */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
            {es.passPhoneTo}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className={`w-12 h-12 rounded-2xl ${currentPlayer.color} flex items-center justify-center text-2xl shadow-lg`}>
              {currentPlayer.avatar}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">{currentPlayer.name}</h2>
          </div>
        </div>

        {/* Secret Privacy Box */}
        <div className="relative">
          <div
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`w-full min-h-[220px] rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 border ${
              isHolding
                ? isImpostor
                  ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 border-rose-500/80 shadow-rose-900/40 shadow-2xl scale-102'
                  : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/80 shadow-emerald-900/40 shadow-2xl scale-102'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-inner'
            }`}
          >
            {isHolding ? (
              /* REVEALED CONTENT WHILE HOLDING */
              <div className="space-y-4 animate-pop-in">
                {isImpostor ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-rose-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg">
                      <Shield className="w-4 h-4" />
                      <span>{es.impostorRole}</span>
                    </div>

                    <p className="text-xs text-rose-200 font-medium px-2 leading-relaxed">
                      {es.impostorHint}
                    </p>

                    {gameState.config.impostorKnowledge === 'category_only' && (
                      <div className="bg-slate-900/90 border border-rose-500/30 p-3 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{es.categoryIs}</span>
                        <span className="text-base font-extrabold text-amber-300">{gameState.categoryName}</span>
                      </div>
                    )}

                    {gameState.config.impostorKnowledge === 'fake_word' && gameState.fakeWord && (
                      <div className="bg-slate-900/90 border border-rose-500/30 p-3 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{es.fakeWordIs}</span>
                        <span className="text-lg font-black text-rose-300">{gameState.fakeWord}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-emerald-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      <span>{es.crewmateRole}</span>
                    </div>

                    <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block tracking-wider">
                        {es.secretWordIs}
                      </span>
                      <span className="text-2xl font-black text-white tracking-wide block">
                        {gameState.secretWord.word}
                      </span>
                      {gameState.secretWord.hint && (
                        <span className="text-[11px] text-slate-400 block italic">
                          "{gameState.secretWord.hint}"
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-emerald-200/80 font-medium px-2">
                      Categoría: <strong className="text-amber-300">{gameState.categoryName}</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* HIDDEN COVER WHEN NOT HOLDING */
              <div className="space-y-3 text-center">
                <div className="w-14 h-14 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">
                    {es.pressAndHoldToSee}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {es.releaseToHide}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation & Next Button */}
        {hasRevealedCurrent && !isHolding && (
          <button
            onClick={handleNextPlayer}
            id="role-reveal-next-btn"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 animate-bounce-short"
          >
            <span>{es.nextPlayer}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
