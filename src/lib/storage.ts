import { Category, GameConfig, GameState, MatchRecord, PlayerGroup } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';

const KEYS = {
  CATEGORIES: 'impostor_custom_categories_v1',
  GROUPS: 'impostor_groups_v1',
  CONFIG: 'impostor_config_v1',
  ACTIVE_GAME: 'impostor_active_game_v1',
  HISTORY: 'impostor_match_history_v1',
  LEADERBOARD: 'impostor_leaderboard_v1'
};

export const DEFAULT_CONFIG: GameConfig = {
  impostorCount: 1,
  impostorKnowledge: 'none',
  clueOrder: 'turns',
  turnTimerSeconds: 45,
  votingMode: 'secret',
  eliminationMode: 'successive',
  impostorCanGuess: true,
  soundEnabled: true,
  vibrationEnabled: true,
  categoryId: 'random'
};

// Safe localStorage wrapper
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

export function loadCategories(): Category[] {
  const custom = getItem<Category[]>(KEYS.CATEGORIES, []);
  return [...DEFAULT_CATEGORIES, ...custom];
}

export function saveCustomCategory(category: Category): Category[] {
  const custom = getItem<Category[]>(KEYS.CATEGORIES, []);
  const existingIdx = custom.findIndex(c => c.id === category.id);
  let updated: Category[];
  if (existingIdx >= 0) {
    updated = [...custom];
    updated[existingIdx] = category;
  } else {
    updated = [...custom, { ...category, isCustom: true }];
  }
  setItem(KEYS.CATEGORIES, updated);
  return loadCategories();
}

export function deleteCustomCategory(categoryId: string): Category[] {
  const custom = getItem<Category[]>(KEYS.CATEGORIES, []);
  const updated = custom.filter(c => c.id !== categoryId);
  setItem(KEYS.CATEGORIES, updated);
  return loadCategories();
}

export function loadPlayerGroups(): PlayerGroup[] {
  return getItem<PlayerGroup[]>(KEYS.GROUPS, [
    {
      id: 'default-friends',
      name: 'Grupo Básico',
      createdAt: Date.now(),
      players: [
        { name: 'Ana', avatar: '🐱', color: 'bg-emerald-500' },
        { name: 'Carlos', avatar: '🐶', color: 'bg-blue-500' },
        { name: 'Elena', avatar: '🦊', color: 'bg-amber-500' },
        { name: 'David', avatar: '🦁', color: 'bg-purple-500' }
      ]
    }
  ]);
}

export function savePlayerGroup(group: PlayerGroup): PlayerGroup[] {
  const groups = loadPlayerGroups();
  const existingIndex = groups.findIndex(g => g.id === group.id);
  let updated: PlayerGroup[];
  if (existingIndex >= 0) {
    updated = [...groups];
    updated[existingIndex] = group;
  } else {
    updated = [group, ...groups];
  }
  setItem(KEYS.GROUPS, updated);
  return updated;
}

export function deletePlayerGroup(groupId: string): PlayerGroup[] {
  const groups = loadPlayerGroups();
  const updated = groups.filter(g => g.id !== groupId);
  setItem(KEYS.GROUPS, updated);
  return updated;
}

export function loadGameConfig(): GameConfig {
  // Merge over DEFAULT_CONFIG so a config saved by an older version of the
  // app (missing a field added since, e.g. eliminationMode) doesn't come
  // back with that field undefined.
  return { ...DEFAULT_CONFIG, ...getItem<Partial<GameConfig>>(KEYS.CONFIG, DEFAULT_CONFIG) };
}

export function saveGameConfig(config: GameConfig): void {
  setItem(KEYS.CONFIG, config);
}

// NOT encryption -- base64 is trivially reversible, and true encryption
// isn't possible here anyway (the same device has to decrypt and render
// "you are the impostor" to the player, so any key would live in this same
// client code). This only raises the bar above "glance at the Application
// tab and read the secret word as formatted JSON" -- it stops the casual
// spoiler, not a determined one.
type SealedFields = Pick<GameState, 'secretWord' | 'impostorIds' | 'fakeWord'>;
type SealedActiveGame = Omit<GameState, keyof SealedFields> & { _sealed: string };

function seal(fields: SealedFields): string {
  return btoa(encodeURIComponent(JSON.stringify(fields)));
}

function unseal(sealed: string): SealedFields {
  return JSON.parse(decodeURIComponent(atob(sealed)));
}

export function loadActiveGame(): GameState | null {
  const stored = getItem<SealedActiveGame | null>(KEYS.ACTIVE_GAME, null);
  if (!stored) return null;
  const { _sealed, ...rest } = stored;
  return { ...rest, ...unseal(_sealed) } as GameState;
}

export function saveActiveGame(state: GameState | null): void {
  if (!state) {
    setItem(KEYS.ACTIVE_GAME, null);
    return;
  }
  const { secretWord, impostorIds, fakeWord, ...rest } = state;
  const sealed: SealedActiveGame = {
    ...rest,
    _sealed: seal({ secretWord, impostorIds, fakeWord })
  };
  setItem(KEYS.ACTIVE_GAME, sealed);
}

export function clearActiveGame(): void {
  localStorage.removeItem(KEYS.ACTIVE_GAME);
}

export function loadMatchHistory(): MatchRecord[] {
  return getItem<MatchRecord[]>(KEYS.HISTORY, []);
}

export function saveMatchRecord(record: MatchRecord): MatchRecord[] {
  const history = loadMatchHistory();
  const updated = [record, ...history].slice(0, 50); // Keep last 50 matches
  setItem(KEYS.HISTORY, updated);
  return updated;
}

export type GlobalLeaderboardMap = Record<string, { name: string; avatar: string; wins: number; totalGames: number; score: number }>;

export function loadLeaderboard(): GlobalLeaderboardMap {
  return getItem<GlobalLeaderboardMap>(KEYS.LEADERBOARD, {});
}

export function updateLeaderboard(players: Array<{ name: string; avatar: string; won: boolean; scoreDelta: number }>): GlobalLeaderboardMap {
  const current = loadLeaderboard();
  players.forEach(p => {
    const key = p.name.trim().toLowerCase();
    const existing = current[key] || { name: p.name, avatar: p.avatar, wins: 0, totalGames: 0, score: 0 };
    current[key] = {
      name: p.name,
      avatar: p.avatar,
      wins: existing.wins + (p.won ? 1 : 0),
      totalGames: existing.totalGames + 1,
      score: existing.score + p.scoreDelta
    };
  });
  setItem(KEYS.LEADERBOARD, current);
  return current;
}

export function resetLeaderboard(): void {
  localStorage.removeItem(KEYS.LEADERBOARD);
}
