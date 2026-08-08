import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { GameState, Player, WordItem } from '../types';
import { es } from '../i18n/es';
import { triggerHaptic } from '../lib/haptics';

interface LastGuessPhaseProps {
  gameState: GameState;
  categoryWords: WordItem[];
  onCompleteLastGuess: (guessedWord: string, isCorrect: boolean) => void;
}

export const LastGuessPhase: React.FC<LastGuessPhaseProps> = ({
  gameState,
  categoryWords,
  onCompleteLastGuess
}) => {
  const [selectedGuess, setSelectedGuess] = useState<string>('');

  const eliminatedPlayer: Player | undefined = gameState.players.find(
    p => p.id === gameState.eliminatedPlayerId
  );

  // Generate 4 multiple choice options including the real secret word!
  const getGuessOptions = (): string[] => {
    const realWord = gameState.secretWord.word;
    const choices = new Set<string>([realWord]);

    const shuffledCategoryWords = [...categoryWords]
      .map(w => w.word)
      .filter(w => w !== realWord)
      .sort(() => 0.5 - Math.random());

    for (const w of shuffledCategoryWords) {
      if (choices.size >= 4) break;
      choices.add(w);
    }

    return Array.from(choices).sort(() => 0.5 - Math.random());
  };

  const [options] = useState<string[]>(getGuessOptions());

  const handleSubmit = () => {
    if (!selectedGuess) return;
    triggerHaptic(40, gameState.config.vibrationEnabled);
    const isCorrect = selectedGuess.trim().toLowerCase() === gameState.secretWord.word.trim().toLowerCase();
    onCompleteLastGuess(selectedGuess, isCorrect);
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
        {/* Header Badge */}
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-amber-400">{es.lastGuessTitle}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {es.lastGuessInstructions.replace('{name}', eliminatedPlayer?.name || 'El Impostor')}
          </p>
        </div>

        {/* Options grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
            {es.guessTheWord}
          </label>

          <div className="grid grid-cols-1 gap-2">
            {options.map((word) => {
              const isSelected = selectedGuess === word;
              return (
                <button
                  key={word}
                  onClick={() => {
                    triggerHaptic(20, gameState.config.vibrationEnabled);
                    setSelectedGuess(word);
                  }}
                  className={`p-4 rounded-2xl border font-extrabold text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-102'
                      : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{word}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedGuess}
          id="submit-last-guess-btn"
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base"
        >
          <Sparkles className="w-5 h-5" />
          <span>{es.submitGuess}</span>
        </button>
      </div>
    </div>
  );
};
