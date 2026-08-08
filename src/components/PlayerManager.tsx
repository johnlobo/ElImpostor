import React, { useState } from 'react';
import { Plus, Trash2, Users, Save, Download, Sparkles, Check } from 'lucide-react';
import { Player, PlayerGroup } from '../types';
import { es } from '../i18n/es';
import { AVATARS, COLOR_OPTIONS } from '../data/playerOptions';
import { triggerHaptic } from '../lib/haptics';

interface PlayerManagerProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  savedGroups: PlayerGroup[];
  onSaveGroup: (name: string, players: Player[]) => void;
  onLoadGroup: (group: PlayerGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  vibrationEnabled: boolean;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  onUpdatePlayers,
  savedGroups,
  onSaveGroup,
  onLoadGroup,
  onDeleteGroup,
  vibrationEnabled
}) => {
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [showSaveGroupModal, setShowSaveGroupModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');

  const isDuplicateName = (name: string, excludeId?: string): boolean =>
    players.some(p => p.id !== excludeId && p.name.trim().toLowerCase() === name.trim().toLowerCase());

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (players.length >= 20) return;
    if (isDuplicateName(trimmed)) {
      setNameError(true);
      return;
    }

    triggerHaptic(30, vibrationEnabled);
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const colorObj = COLOR_OPTIONS[players.length % COLOR_OPTIONS.length];

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      avatar: randomAvatar,
      color: colorObj.class,
      score: 0,
      isAlive: true
    };

    onUpdatePlayers([...players, newPlayer]);
    setNewName('');
    setNameError(false);
  };

  const handleRemovePlayer = (id: string) => {
    triggerHaptic(40, vibrationEnabled);
    onUpdatePlayers(players.filter(p => p.id !== id));
  };

  const handleCycleAvatar = (id: string) => {
    triggerHaptic(20, vibrationEnabled);
    onUpdatePlayers(players.map(p => {
      if (p.id !== id) return p;
      const currentIdx = AVATARS.indexOf(p.avatar);
      const nextIdx = (currentIdx + 1) % AVATARS.length;
      return { ...p, avatar: AVATARS[nextIdx] };
    }));
  };

  const handleCycleColor = (id: string) => {
    triggerHaptic(20, vibrationEnabled);
    onUpdatePlayers(players.map(p => {
      if (p.id !== id) return p;
      const currentIdx = COLOR_OPTIONS.findIndex(c => c.class === p.color);
      const nextIdx = (currentIdx + 1) % COLOR_OPTIONS.length;
      return { ...p, color: COLOR_OPTIONS[nextIdx].class };
    }));
  };

  const handleSaveGroupConfirm = () => {
    if (!groupNameInput.trim() || players.length < 3) return;
    onSaveGroup(groupNameInput.trim(), players);
    setGroupNameInput('');
    setShowSaveGroupModal(false);
    triggerHaptic([30, 30], vibrationEnabled);
  };

  return (
    <div className="space-y-6">
      {/* Group Presets bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Grupos Guardados</span>
          </h3>
          {players.length >= 3 && (
            <button
              onClick={() => setShowSaveGroupModal(true)}
              id="open-save-group-btn"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Grupo</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {savedGroups.map(g => (
            <div
              key={g.id}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 pr-2 shrink-0"
            >
              <button
                onClick={() => {
                  triggerHaptic(40, vibrationEnabled);
                  onLoadGroup(g);
                }}
                className="text-xs font-medium text-slate-200 hover:text-amber-400 flex items-center gap-1.5 px-2 py-1"
                title={`Cargar ${g.name}`}
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{g.name}</span>
                <span className="text-[10px] text-slate-500">({g.players.length})</span>
              </button>
              {savedGroups.length > 1 && (
                <button
                  onClick={() => onDeleteGroup(g.id)}
                  className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-900 transition-all"
                  title="Eliminar grupo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Player Input */}
      <form onSubmit={handleAddPlayer} className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
          <span>{es.playersCount.replace('{count}', players.length.toString())}</span>
          <span>(Min. 3, Máx. 20)</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNameError(false);
            }}
            placeholder={es.playerNamePlaceholder}
            maxLength={18}
            className={`flex-1 bg-slate-900 border rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
              nameError ? 'border-rose-500' : 'border-slate-800 focus:border-amber-500'
            }`}
          />
          <button
            type="submit"
            disabled={!newName.trim() || players.length >= 20}
            id="add-player-btn"
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 p-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {nameError && (
          <p className="text-[11px] text-rose-400 font-medium px-1">{es.duplicateNameNotice}</p>
        )}
      </form>

      {/* Players List */}
      <div className="space-y-2.5">
        {players.map((p, index) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-slate-500 w-4 text-center shrink-0">
                {index + 1}
              </span>

              {/* Avatar button */}
              <button
                onClick={() => handleCycleAvatar(p.id)}
                className={`w-11 h-11 rounded-2xl ${p.color} flex items-center justify-center text-xl shadow-inner hover:scale-105 active:scale-95 transition-all shrink-0`}
                title="Toca para cambiar avatar"
              >
                {p.avatar}
              </button>

              <div className="min-w-0">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    onUpdatePlayers(players.map(x => x.id === p.id ? { ...x, name } : x));
                  }}
                  className={`bg-transparent font-bold text-slate-100 text-sm focus:outline-none border-b w-full truncate ${
                    isDuplicateName(p.name, p.id) ? 'border-rose-500' : 'border-transparent focus:border-amber-400'
                  }`}
                  maxLength={18}
                  title={isDuplicateName(p.name, p.id) ? es.duplicateNameNotice : undefined}
                />
                <button
                  onClick={() => handleCycleColor(p.id)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 mt-0.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Cambiar color</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => handleRemovePlayer(p.id)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all shrink-0"
              title="Eliminar jugador"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {players.length < 3 && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-amber-300 text-xs text-center font-medium">
          ⚠️ {es.minPlayersNotice}
        </div>
      )}

      {/* Save Group Modal */}
      {showSaveGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Guardar Grupo de Jugadores</h3>
            <p className="text-xs text-slate-400">
              Guarda este conjunto de {players.length} jugadores para volver a cargarlo en futuras partidas.
            </p>
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder={es.groupNamePlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveGroupModal(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 font-semibold rounded-2xl hover:bg-slate-700"
              >
                {es.cancel}
              </button>
              <button
                onClick={handleSaveGroupConfirm}
                disabled={!groupNameInput.trim()}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-2xl"
              >
                {es.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
