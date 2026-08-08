import React, { useState, useEffect } from 'react';
import {
  Category,
  GameConfig,
  GamePhase,
  GameState,
  GlobalLeaderboardMap,
  MatchRecord,
  Player,
  PlayerGroup,
  WordItem
} from './types';
import {
  clearActiveGame,
  deleteCustomCategory,
  deletePlayerGroup,
  loadActiveGame,
  loadCategories,
  loadGameConfig,
  loadLeaderboard,
  loadMatchHistory,
  loadPlayerGroups,
  resetLeaderboard,
  saveActiveGame,
  saveCustomCategory,
  saveGameConfig,
  saveMatchRecord,
  savePlayerGroup,
  updateLeaderboard
} from './lib/storage';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { PlayerManager } from './components/PlayerManager';
import { RulesSettings } from './components/RulesSettings';
import { CategoryManager } from './components/CategoryManager';
import { RoleReveal } from './components/RoleReveal';
import { CluePhase } from './components/CluePhase';
import { VotingPhase } from './components/VotingPhase';
import { LastGuessPhase } from './components/LastGuessPhase';
import { ResolutionPhase } from './components/ResolutionPhase';
import { Scoreboard } from './components/Scoreboard';
import { PwaInstallModal } from './components/PwaInstallModal';
import { audioManager } from './lib/audio';
import { shuffle } from './lib/random';
import { es } from './i18n/es';

export default function App() {
  // PWA Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  // Persistent States
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [savedGroups, setSavedGroups] = useState<PlayerGroup[]>(loadPlayerGroups());
  const [config, setConfig] = useState<GameConfig>(loadGameConfig());
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(loadMatchHistory());
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardMap>(loadLeaderboard());

  // Active Game State
  const [gameState, setGameState] = useState<GameState | null>(loadActiveGame());
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(gameState ? gameState.phase : 'HOME');

  // Active Setup Players List
  const [setupPlayers, setSetupPlayers] = useState<Player[]>(
    gameState ? gameState.players : savedGroups[0]?.players.map((p, i) => ({
      id: `p-init-${i}`,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: 0,
      isAlive: true
    })) || []
  );

  // Modals
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);

  // Sync config on change
  const handleUpdateConfig = (newConfig: GameConfig) => {
    setConfig(newConfig);
    saveGameConfig(newConfig);
  };

  // Sync active game on change
  useEffect(() => {
    if (gameState) {
      saveActiveGame({ ...gameState, phase: currentPhase });
    }
  }, [gameState, currentPhase]);

  // Categories Handlers
  const handleSaveCategory = (cat: Category) => {
    const updated = saveCustomCategory(cat);
    setCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = deleteCustomCategory(id);
    setCategories(updated);
    if (config.categoryId === id) {
      handleUpdateConfig({ ...config, categoryId: 'random' });
    }
  };

  // Groups Handlers
  const handleSaveGroup = (groupName: string, playersList: Player[]) => {
    const newGroup: PlayerGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      createdAt: Date.now(),
      players: playersList.map(p => ({ name: p.name, avatar: p.avatar, color: p.color }))
    };
    const updated = savePlayerGroup(newGroup);
    setSavedGroups(updated);
  };

  const handleLoadGroup = (group: PlayerGroup) => {
    const loaded: Player[] = group.players.map((p, i) => ({
      id: `p-load-${i}-${Date.now()}`,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: 0,
      isAlive: true
    }));
    setSetupPlayers(loaded);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updated = deletePlayerGroup(groupId);
    setSavedGroups(updated);
  };

  // START NEW GAME / NEXT ROUND
  const startNewMatchOrRound = (isNextRound: boolean = false) => {
    if (setupPlayers.length < 3) return;

    // Pick Category
    let targetCat: Category;
    if (config.categoryId === 'random') {
      targetCat = categories[Math.floor(Math.random() * categories.length)];
    } else {
      targetCat = categories.find(c => c.id === config.categoryId) || categories[0];
    }

    // Pick Secret Word
    const randomWordItem: WordItem = targetCat.words[Math.floor(Math.random() * targetCat.words.length)];

    // Calculate Impostors Count
    let numImpostors = config.impostorCount;
    if (numImpostors === -1) {
      numImpostors = setupPlayers.length >= 8 ? 2 : 1;
    }
    numImpostors = Math.min(numImpostors, Math.floor((setupPlayers.length - 1) / 2) || 1);

    // Randomly assign Impostor IDs
    const shuffledPlayerIds = shuffle<string>(setupPlayers.map(p => p.id));
    const impostorIds = shuffledPlayerIds.slice(0, numImpostors);

    // Pick fake word if knowledge mode is fake_word
    let fakeWordStr: string | undefined = undefined;
    if (config.impostorKnowledge === 'fake_word') {
      const otherWords = targetCat.words.map(w => w.word).filter(w => w !== randomWordItem.word);
      if (otherWords.length > 0) {
        fakeWordStr = otherWords[Math.floor(Math.random() * otherWords.length)];
      }
    }

    // Prepare fresh player list for round
    const updatedPlayers: Player[] = setupPlayers.map(p => ({
      ...p,
      isAlive: true,
      score: isNextRound ? p.score : 0,
      role: impostorIds.includes(p.id) ? 'IMPOSTOR' : 'CREW',
      voteTargetId: undefined
    }));

    const roundNum = isNextRound && gameState ? gameState.roundNumber + 1 : 1;

    const newGameState: GameState = {
      id: `game-${Date.now()}`,
      phase: 'ROLES',
      config,
      players: updatedPlayers,
      secretWord: randomWordItem,
      categoryName: targetCat.name,
      fakeWord: fakeWordStr,
      impostorIds,
      currentTurnIndex: 0,
      votes: {},
      secretVoterIndex: 0,
      roundNumber: roundNum,
      matchHistory
    };

    setGameState(newGameState);
    setCurrentPhase('ROLES');
  };

  // VOTING ELIMINATION RESOLUTION
  const handleConfirmElimination = (eliminatedId: string, votesRecord?: Record<string, string>) => {
    if (!gameState) return;

    const eliminatedPlayer = gameState.players.find(p => p.id === eliminatedId);
    const isImpostor = gameState.impostorIds.includes(eliminatedId);

    const updatedPlayers = gameState.players.map(p =>
      p.id === eliminatedId ? { ...p, isAlive: false } : p
    );

    if (isImpostor) {
      // Impostor was voted off! With 2-3 impostors, catching one doesn't
      // end the match on its own -- the rest are still hidden among crew.
      const impostorsStillAlive = gameState.impostorIds.some(
        id => id !== eliminatedId && updatedPlayers.find(p => p.id === id)?.isAlive
      );

      if (impostorsStillAlive) {
        // Round continues: back to clues so the group can keep hunting.
        setGameState({
          ...gameState,
          players: updatedPlayers,
          eliminatedPlayerId: undefined,
          votes: {},
          secretVoterIndex: 0,
          roundNotice: es.impostorCaughtMoreRemain,
          phase: 'CLUES'
        });
        setCurrentPhase('CLUES');
      } else if (gameState.config.impostorCanGuess) {
        // Last impostor caught -- give them a chance to guess the word.
        setGameState({
          ...gameState,
          players: updatedPlayers,
          eliminatedPlayerId: eliminatedId,
          votes: votesRecord || {},
          phase: 'LAST_GUESS'
        });
        setCurrentPhase('LAST_GUESS');
      } else {
        // Last impostor caught, no guess allowed: Crewmate Victory.
        finishMatch('CREW', '¡Los tripulantes descubrieron al impostor!', updatedPlayers, eliminatedId);
      }
    } else {
      // Crewmate was voted off! Impostor wins!
      finishMatch('IMPOSTOR', `¡Eliminaron a ${eliminatedPlayer?.name} (Tripulante)! El Impostor ha ganado.`, updatedPlayers, eliminatedId);
    }
  };

  // LAST GUESS RESOLUTION
  const handleCompleteLastGuess = (guessedWord: string, isCorrect: boolean) => {
    if (!gameState) return;

    if (isCorrect) {
      finishMatch(
        'IMPOSTOR',
        `¡El Impostor adivinó correctamente la palabra "${gameState.secretWord.word}" y robó la victoria!`,
        gameState.players,
        gameState.eliminatedPlayerId,
        guessedWord,
        true
      );
    } else {
      finishMatch(
        'CREW',
        `¡El Impostor intentó adivinar "${guessedWord}" pero falló! La palabra era "${gameState.secretWord.word}".`,
        gameState.players,
        gameState.eliminatedPlayerId,
        guessedWord,
        false
      );
    }
  };

  // FINISH MATCH & COMPUTE SCORES
  const finishMatch = (
    winningTeam: 'CREW' | 'IMPOSTOR',
    reason: string,
    playersList: Player[],
    eliminatedId?: string,
    guessedWord?: string,
    guessCorrect?: boolean
  ) => {
    if (!gameState) return;

    // Calculate Scores & Leaderboards
    const leaderboardUpdates: Array<{ name: string; avatar: string; won: boolean; scoreDelta: number }> = [];

    const scoredPlayers = playersList.map(p => {
      const isImpostor = gameState.impostorIds.includes(p.id);
      let delta = 0;
      let won = false;

      if (winningTeam === 'CREW' && !isImpostor) {
        won = true;
        delta = p.isAlive ? 100 : 50;
      } else if (winningTeam === 'IMPOSTOR' && isImpostor) {
        won = true;
        delta = 150 + (guessCorrect ? 100 : 0);
      }

      leaderboardUpdates.push({
        name: p.name,
        avatar: p.avatar,
        won,
        scoreDelta: delta
      });

      return {
        ...p,
        score: p.score + delta
      };
    });

    // Update Global Leaderboard in localStorage
    const updatedLeaderboard = updateLeaderboard(leaderboardUpdates);
    setGlobalLeaderboard(updatedLeaderboard);

    // Save Match Record
    const impostorNames = gameState.players
      .filter(p => gameState.impostorIds.includes(p.id))
      .map(p => p.name);

    const record: MatchRecord = {
      id: `match-${Date.now()}`,
      timestamp: Date.now(),
      categoryName: gameState.categoryName,
      secretWord: gameState.secretWord.word,
      playersCount: gameState.players.length,
      impostorNames,
      winningTeam,
      reason
    };

    const updatedHistory = saveMatchRecord(record);
    setMatchHistory(updatedHistory);

    // Update Game State to RESOLUTION
    const finishedState: GameState = {
      ...gameState,
      players: scoredPlayers,
      eliminatedPlayerId: eliminatedId,
      impostorGuessedWord: guessedWord,
      impostorGuessCorrect: guessCorrect,
      winningTeam,
      winningReason: reason,
      phase: 'RESOLUTION'
    };

    setGameState(finishedState);
    setSetupPlayers(scoredPlayers); // Keep scores in setup list for next round
    setCurrentPhase('RESOLUTION');
  };

  // Selected Category Name for Home Card
  const activeCategoryObj = categories.find(c => c.id === config.categoryId);
  const selectedCatName = config.categoryId === 'random' ? es.allRandom : activeCategoryObj?.name || 'Comida';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-8">
      {/* App Header */}
      <Header
        soundEnabled={config.soundEnabled}
        onToggleSound={() => handleUpdateConfig({ ...config, soundEnabled: !config.soundEnabled })}
        onGoHome={() => setCurrentPhase('HOME')}
        onOpenPwaModal={() => setShowPwaModal(true)}
        showHomeBtn={currentPhase !== 'HOME'}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-4 max-w-md mx-auto w-full">
        {/* PHASE: HOME */}
        {currentPhase === 'HOME' && (
          <Home
            activeGame={gameState}
            players={setupPlayers}
            config={config}
            selectedCategoryName={selectedCatName}
            onStartNewGame={() => startNewMatchOrRound(false)}
            onResumeGame={() => {
              if (gameState) setCurrentPhase(gameState.phase);
            }}
            onNavigate={(phase) => setCurrentPhase(phase)}
            onOpenPwaModal={() => setShowPwaModal(true)}
            vibrationEnabled={config.vibrationEnabled}
          />
        )}

        {/* PHASE: SETUP (Players & Groups) */}
        {currentPhase === 'SETUP' && (
          <PlayerManager
            players={setupPlayers}
            onUpdatePlayers={setSetupPlayers}
            savedGroups={savedGroups}
            onSaveGroup={handleSaveGroup}
            onLoadGroup={handleLoadGroup}
            onDeleteGroup={handleDeleteGroup}
            vibrationEnabled={config.vibrationEnabled}
          />
        )}

        {/* PHASE: RULES */}
        {currentPhase === 'RULES' && (
          <RulesSettings
            config={config}
            onUpdateConfig={handleUpdateConfig}
            playerCount={setupPlayers.length}
          />
        )}

        {/* PHASE: CATEGORIES */}
        {currentPhase === 'CATEGORIES' && (
          <CategoryManager
            categories={categories}
            selectedCategoryId={config.categoryId}
            onSelectCategory={(id) => handleUpdateConfig({ ...config, categoryId: id })}
            onSaveCustomCategory={handleSaveCategory}
            onDeleteCustomCategory={handleDeleteCategory}
            vibrationEnabled={config.vibrationEnabled}
          />
        )}

        {/* PHASE: ROLES (Secret Assignment Pass-the-phone) */}
        {currentPhase === 'ROLES' && gameState && (
          <RoleReveal
            gameState={gameState}
            onAllRolesRevealed={() => setCurrentPhase('CLUES')}
          />
        )}

        {/* PHASE: CLUES */}
        {currentPhase === 'CLUES' && gameState && (
          <CluePhase
            gameState={gameState}
            onFinishClues={() => {
              setGameState({ ...gameState, roundNotice: undefined });
              setCurrentPhase('VOTING');
            }}
          />
        )}

        {/* PHASE: VOTING */}
        {currentPhase === 'VOTING' && gameState && (
          <VotingPhase
            gameState={gameState}
            onConfirmElimination={handleConfirmElimination}
            onVoteCast={(voterIndex, votesMap) => {
              setGameState({ ...gameState, secretVoterIndex: voterIndex, votes: votesMap });
            }}
          />
        )}

        {/* PHASE: LAST_GUESS */}
        {currentPhase === 'LAST_GUESS' && gameState && (
          <LastGuessPhase
            gameState={gameState}
            categoryWords={
              categories.find(c => c.name === gameState.categoryName)?.words || categories[0].words
            }
            onCompleteLastGuess={handleCompleteLastGuess}
          />
        )}

        {/* PHASE: RESOLUTION */}
        {currentPhase === 'RESOLUTION' && gameState && (
          <ResolutionPhase
            gameState={gameState}
            onNextRound={() => startNewMatchOrRound(true)}
            onViewScoreboard={() => setCurrentPhase('SCOREBOARD')}
            onNewMatch={() => {
              clearActiveGame();
              setGameState(null);
              setCurrentPhase('HOME');
            }}
          />
        )}

        {/* PHASE: SCOREBOARD */}
        {currentPhase === 'SCOREBOARD' && (
          <Scoreboard
            gameState={gameState}
            globalLeaderboard={globalLeaderboard}
            matchHistory={matchHistory}
            onResetLeaderboard={() => {
              resetLeaderboard();
              setGlobalLeaderboard({});
            }}
            onBackToGame={() => setCurrentPhase('HOME')}
            vibrationEnabled={config.vibrationEnabled}
          />
        )}
      </main>

      {/* PWA Install Guide Modal */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </div>
  );
}
