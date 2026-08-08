import React, { useState } from 'react';
import { Trophy, Award, History, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
import { GameState, GlobalLeaderboardMap, MatchRecord } from '../types';
import { es } from '../i18n/es';
import { triggerHaptic } from '../lib/haptics';

interface ScoreboardProps {
  gameState?: GameState | null;
  globalLeaderboard: GlobalLeaderboardMap;
  matchHistory: MatchRecord[];
  onResetLeaderboard: () => void;
  onBackToGame?: () => void;
  vibrationEnabled: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  gameState,
  globalLeaderboard,
  matchHistory,
  onResetLeaderboard,
  onBackToGame,
  vibrationEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'global' | 'history'>('session');

  const sessionPlayers = gameState
    ? [...gameState.players].sort((a, b) => b.score - a.score)
    : [];

  const globalPlayersList = (Object.values(globalLeaderboard) as Array<{ name: string; avatar: string; wins: number; totalGames: number; score: number }>).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 max-w-sm mx-auto animate-fade-in py-2">
      {/* Navigation tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            setActiveTab('session');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'session'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Partida
        </button>
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            setActiveTab('global');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'global'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Histórico
        </button>
        <button
          onClick={() => {
            triggerHaptic(20, vibrationEnabled);
            setActiveTab('history');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Historial
        </button>
      </div>

      {/* SESSION SCOREBOARD TAB */}
      {activeTab === 'session' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Marcador de la Partida</h3>
            </div>
            {gameState && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Ronda {gameState.roundNumber}
              </span>
            )}
          </div>

          {sessionPlayers.length > 0 ? (
            <div className="space-y-2">
              {sessionPlayers.map((p, rank) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    rank === 0
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs w-4 text-center text-slate-500">
                      {rank === 0 ? '👑' : rank + 1}
                    </span>
                    <span className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-lg shadow-inner`}>
                      {p.avatar}
                    </span>
                    <span className="font-extrabold text-sm text-white">{p.name}</span>
                  </div>

                  <span className="text-sm font-black text-amber-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay ninguna partida activa en curso.
            </div>
          )}
        </div>
      )}

      {/* GLOBAL LEADERBOARD TAB */}
      {activeTab === 'global' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Puntuaciones Globales</h3>
            </div>
            {globalPlayersList.length > 0 && (
              <button
                onClick={() => {
                  triggerHaptic(40, vibrationEnabled);
                  onResetLeaderboard();
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                title={es.resetScores}
              >
                <Trash2 className="w-3 h-3" />
                <span>{es.resetScores}</span>
              </button>
            )}
          </div>

          {globalPlayersList.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {globalPlayersList.map((p, rank) => (
                <div
                  key={p.name}
                  className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black w-4 text-center text-slate-500">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                    </span>
                    <span className="text-xl">{p.avatar}</span>
                    <div>
                      <span className="font-extrabold text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {p.wins} victorias en {p.totalGames} partidas
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-amber-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Aún no hay puntuaciones acumuladas. ¡Juega una partida para empezar!
            </div>
          )}
        </div>
      )}

      {/* MATCH HISTORY LOG TAB */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Últimas Partidas</h3>
          </div>

          {matchHistory.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {matchHistory.map((m) => (
                <div key={m.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                      m.winningTeam === 'CREW' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {m.winningTeam === 'CREW' ? 'Ganan Tripulantes 🏆' : 'Gana Impostor 🕵️'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm">
                    {m.secretWord} <span className="text-slate-400 text-xs font-normal">({m.categoryName})</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Jugadores: {m.playersCount}</span>
                    <span>Impostor: {m.impostorNames.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay historial de partidas completadas.
            </div>
          )}
        </div>
      )}

      {/* Back button */}
      {onBackToGame && (
        <button
          onClick={onBackToGame}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú Principal</span>
        </button>
      )}
    </div>
  );
};
