import React, { useState } from 'react';
import { Vote, ArrowRight, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { GameState, Player, VoteTally } from '../types';
import { es } from '../i18n/es';
import { audioManager } from '../lib/audio';
import { triggerHaptic } from '../lib/haptics';

interface VotingPhaseProps {
  gameState: GameState;
  onConfirmElimination: (eliminatedPlayerId: string, votesRecord?: Record<string, string>) => void;
}

export const VotingPhase: React.FC<VotingPhaseProps> = ({ gameState, onConfirmElimination }) => {
  // Verbal voting state
  const [selectedVerbalTargetId, setSelectedVerbalTargetId] = useState<string | null>(null);

  // Secret voting state (pass-the-phone)
  const [voterIndex, setVoterIndex] = useState(0);
  const [votesMap, setVotesMap] = useState<Record<string, string>>({}); // voterId -> targetId
  const [currentSelectedTargetId, setCurrentSelectedTargetId] = useState<string | null>(null);
  const [showTallyResult, setShowTallyResult] = useState(false);

  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const totalVoters = alivePlayers.length;
  const currentVoter: Player = alivePlayers[voterIndex];

  // Record secret vote and move to next voter or tally
  const handleSecretVoteSubmit = () => {
    if (!currentSelectedTargetId) return;

    triggerHaptic(30, gameState.config.vibrationEnabled);
    audioManager.playVote(gameState.config.soundEnabled);

    const updatedMap = { ...votesMap, [currentVoter.id]: currentSelectedTargetId };
    setVotesMap(updatedMap);
    setCurrentSelectedTargetId(null);

    if (voterIndex + 1 < totalVoters) {
      setVoterIndex(prev => prev + 1);
    } else {
      // All votes in! Show tally
      setShowTallyResult(true);
    }
  };

  // Calculate vote tallies for secret mode
  const getTallies = (): { tallies: VoteTally[]; topPlayerId: string | null; isTie: boolean } => {
    const counts: Record<string, { count: number; voters: string[] }> = {};
    alivePlayers.forEach(p => {
      counts[p.id] = { count: 0, voters: [] };
    });

    Object.entries(votesMap).forEach(([voterId, targetId]) => {
      const target = counts[String(targetId)];
      if (target) {
        target.count += 1;
        target.voters.push(voterId);
      }
    });

    const talliesList: VoteTally[] = Object.entries(counts).map(([playerId, data]) => ({
      playerId,
      votesReceived: data.count,
      voters: data.voters
    })).sort((a, b) => b.votesReceived - a.votesReceived);

    if (talliesList.length === 0) return { tallies: [], topPlayerId: null, isTie: false };

    const highestVotes = talliesList[0].votesReceived;
    const topTied = talliesList.filter(t => t.votesReceived === highestVotes);
    const isTie = topTied.length > 1 && highestVotes > 0;

    return {
      tallies: talliesList,
      topPlayerId: isTie ? null : talliesList[0].playerId,
      isTie
    };
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      {/* VERBAL VOTING MODE */}
      {gameState.config.votingMode === 'verbal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
              <Vote className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">{es.votingTitle}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {es.verbalVotingInstructions}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Selecciona al jugador a eliminar:
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {alivePlayers.map(p => {
                const isSelected = selectedVerbalTargetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      triggerHaptic(20, gameState.config.vibrationEnabled);
                      setSelectedVerbalTargetId(p.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-slate-950 border-rose-400 font-bold shadow-lg scale-102'
                        : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-lg`}>
                        {p.avatar}
                      </span>
                      <span className="font-extrabold text-sm">{p.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-slate-950" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedVerbalTargetId) {
                triggerHaptic(40, gameState.config.vibrationEnabled);
                onConfirmElimination(selectedVerbalTargetId);
              }
            }}
            disabled={!selectedVerbalTargetId}
            id="confirm-verbal-vote-btn"
            className="w-full py-4 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 text-base"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Confirmar Eliminación</span>
          </button>
        </div>
      )}

      {/* SECRET PASS-PHONE VOTING MODE */}
      {gameState.config.votingMode === 'secret' && !showTallyResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2">
            <span>Voto {voterIndex + 1} de {totalVoters}</span>
            <span className="text-amber-400">Votación Secreta</span>
          </div>

          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {es.passPhoneToVote.replace('{name}', '')}
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className={`w-12 h-12 rounded-2xl ${currentVoter.color} flex items-center justify-center text-2xl shadow-lg`}>
                {currentVoter.avatar}
              </span>
              <h2 className="text-2xl font-black text-white">{currentVoter.name}</h2>
            </div>
          </div>

          {/* Suspects selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block text-center">
              {es.selectSuspect}
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {alivePlayers
                .filter(p => p.id !== currentVoter.id) // Can't vote for self
                .map(p => {
                  const isSelected = currentSelectedTargetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        triggerHaptic(20, gameState.config.vibrationEnabled);
                        setCurrentSelectedTargetId(p.id);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg scale-102'
                          : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-lg`}>
                          {p.avatar}
                        </span>
                        <span className="font-extrabold text-sm">{p.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-slate-950" />}
                    </button>
                  );
                })}
            </div>
          </div>

          <button
            onClick={handleSecretVoteSubmit}
            disabled={!currentSelectedTargetId}
            id="confirm-secret-vote-btn"
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{es.confirmVote}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* SECRET VOTING TALLY RESULT SCREEN */}
      {gameState.config.votingMode === 'secret' && showTallyResult && (() => {
        const { tallies, topPlayerId, isTie } = getTallies();

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-pop-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
                <Vote className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-white">{es.voteTallyTitle}</h2>
              {isTie && (
                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-amber-300 text-xs font-semibold">
                  ⚠️ {es.tieNotice}
                </div>
              )}
            </div>

            {/* Tallies list */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tallies.map(t => {
                const p = gameState.players.find(x => x.id === t.playerId);
                if (!p) return null;
                const isWinner = topPlayerId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isWinner
                        ? 'bg-rose-950/80 border-rose-500/80 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-lg`}>
                        {p.avatar}
                      </span>
                      <span className="font-extrabold text-sm">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-amber-400">
                        {t.votesReceived} voto(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action button */}
            {topPlayerId ? (
              <button
                onClick={() => {
                  triggerHaptic(40, gameState.config.vibrationEnabled);
                  onConfirmElimination(topPlayerId, votesMap);
                }}
                id="tally-confirm-elimination-btn"
                className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Eliminar a {gameState.players.find(p => p.id === topPlayerId)?.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic(30, gameState.config.vibrationEnabled);
                  setVoterIndex(0);
                  setVotesMap({});
                  setCurrentSelectedTargetId(null);
                  setShowTallyResult(false);
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Repetir Votación por Empate</span>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
};
