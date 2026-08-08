import React from 'react';
import { Shield, Eye, Clock, Vote, Volume2, HelpCircle, Vibrate } from 'lucide-react';
import { GameConfig, ImpostorKnowledge, ClueOrder, VotingMode } from '../types';
import { es } from '../i18n/es';
import { triggerHaptic } from '../lib/haptics';

interface RulesSettingsProps {
  config: GameConfig;
  onUpdateConfig: (config: GameConfig) => void;
  playerCount: number;
}

export const RulesSettings: React.FC<RulesSettingsProps> = ({
  config,
  onUpdateConfig,
  playerCount
}) => {
  const handleToggleBool = (key: keyof GameConfig) => {
    triggerHaptic(20, config.vibrationEnabled);
    onUpdateConfig({ ...config, [key]: !config[key] });
  };

  const handleSetVal = <K extends keyof GameConfig>(key: K, val: GameConfig[K]) => {
    triggerHaptic(20, config.vibrationEnabled);
    onUpdateConfig({ ...config, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Impostors Count */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Shield className="w-5 h-5" />
          <h3>{es.impostorCount}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Auto ⚙️', value: -1 },
            { label: '1 🕵️', value: 1 },
            { label: '2 🕵️‍♂️', value: 2 },
            { label: '3 🕵️‍♀️', value: 3 }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => handleSetVal('impostorCount', item.value)}
              id={`rule-impostors-${item.value}`}
              className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all border ${
                config.impostorCount === item.value
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          {config.impostorCount === -1
            ? `Se asignarán ${playerCount >= 8 ? 2 : 1} impostor(es) para ${playerCount} jugadores.`
            : `Se asignará(n) exactamente ${config.impostorCount} impostor(es).`}
        </p>
      </div>

      {/* Impostor Knowledge */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Eye className="w-5 h-5" />
          <h3>{es.knowledgeMode}</h3>
        </div>
        <div className="space-y-2">
          {[
            { id: 'none' as ImpostorKnowledge, title: 'Totalmente a Ciegas 🙈', desc: es.knowledgeNone },
            { id: 'category_only' as ImpostorKnowledge, title: 'Sabe la Categoría 📂', desc: es.knowledgeCategory },
            { id: 'fake_word' as ImpostorKnowledge, title: 'Palabra Falsa 🎭', desc: es.knowledgeFakeWord }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSetVal('impostorKnowledge', item.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                config.impostorKnowledge === item.id
                  ? 'bg-amber-500/10 border-amber-500/80 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-amber-300">{item.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Clue Order & Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Clock className="w-5 h-5" />
          <h3>{es.clueOrder}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'free' as ClueOrder, label: 'Libre 🗣️' },
            { id: 'turns' as ClueOrder, label: 'Por Turnos 🔄' },
            { id: 'timer' as ClueOrder, label: 'Temporizado ⏱️' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSetVal('clueOrder', item.id)}
              className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all border ${
                config.clueOrder === item.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {config.clueOrder === 'timer' && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>{es.timerSeconds}</span>
              <span className="text-amber-400 font-bold">{config.turnTimerSeconds} seg</span>
            </label>
            <div className="flex gap-2">
              {[30, 45, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleSetVal('turnTimerSeconds', sec)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    config.turnTimerSeconds === sec
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voting Mode */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Vote className="w-5 h-5" />
          <h3>{es.votingMode}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'secret' as VotingMode, title: 'Secreta 📱', desc: 'Pasando el móvil' },
            { id: 'verbal' as VotingMode, title: 'Verbal 🗣️', desc: 'En voz alta' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSetVal('votingMode', item.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                config.votingMode === item.id
                  ? 'bg-amber-500/10 border-amber-500/80 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-amber-300">{item.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles: Last Guess & Audio/Haptics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        {/* Impostor Last Guess */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{es.impostorLastGuess}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {es.impostorLastGuessHelp}
            </p>
          </div>
          <button
            onClick={() => handleToggleBool('impostorCanGuess')}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              config.impostorCanGuess ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 bg-slate-950 rounded-full absolute top-1 transition-transform ${
                config.impostorCanGuess ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{es.audioSettings}</span>
          </div>
          <button
            onClick={() => handleToggleBool('soundEnabled')}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              config.soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 bg-slate-950 rounded-full absolute top-1 transition-transform ${
                config.soundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Vibrate className="w-4 h-4 text-amber-400" />
            <span>{es.hapticSettings}</span>
          </div>
          <button
            onClick={() => handleToggleBool('vibrationEnabled')}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              config.vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 bg-slate-950 rounded-full absolute top-1 transition-transform ${
                config.vibrationEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
