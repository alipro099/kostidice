import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

export type GameMode = 'timed' | 'shots';

export type ShotResult = 'score' | 'swish' | 'miss';

export interface GameRun {
  id: string;
  mode: GameMode;
  score: number;
  timestamp: number;
  duration: number;
  shots: number;
  bestCombo: number;
  swishCount: number;
}

interface GameState {
  mode: GameMode;
  isRunning: boolean;
  score: number;
  combo: number;
  timeLeft: number;
  shotsLeft: number | null;
  shotsTaken: number;
  sessionBestCombo: number;
  sessionSwishCount: number;
  sessionStartedAt?: number;
  lastShot?: { result: ShotResult; points: number; combo: number };
  bestScores: Record<GameMode, number>;
  recentRuns: GameRun[];
  isSoundEnabled: boolean;
  startGame: (mode?: GameMode) => void;
  endGame: () => void;
  registerShot: (result: ShotResult) => void;
  tick: (dt: number) => void;
  setMode: (mode: GameMode) => void;
  toggleSound: () => void;
  resetRecords: () => void;
}

const DEFAULT_TIME = 60;
const DEFAULT_SHOTS = 5;

const initialState = {
  mode: 'timed' as GameMode,
  isRunning: false,
  score: 0,
  combo: 0,
  timeLeft: DEFAULT_TIME,
  shotsLeft: null as number | null,
  shotsTaken: 0,
  sessionBestCombo: 0,
  sessionSwishCount: 0,
  bestScores: { timed: 0, shots: 0 } as Record<GameMode, number>,
  recentRuns: [] as GameRun[],
  isSoundEnabled: true,
};

const fallbackStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      startGame: (mode) =>
        set((state) => {
          const nextMode = mode ?? state.mode;
          return {
            ...state,
            mode: nextMode,
            isRunning: true,
            score: 0,
            combo: 0,
            lastShot: undefined,
            sessionBestCombo: 0,
            sessionSwishCount: 0,
            shotsTaken: 0,
            sessionStartedAt: Date.now(),
            timeLeft: nextMode === 'timed' ? DEFAULT_TIME : state.timeLeft,
            shotsLeft: nextMode === 'shots' ? DEFAULT_SHOTS : null,
          };
        }),
      endGame: () => {
        const state = get();
        if (!state.isRunning) {
          return;
        }

        const now = Date.now();
        const duration = state.sessionStartedAt ? (now - state.sessionStartedAt) / 1000 : DEFAULT_TIME;
        const run: GameRun = {
          id: `run-${now}`,
          mode: state.mode,
          score: state.score,
          timestamp: now,
          duration,
          shots: state.shotsTaken,
          bestCombo: state.sessionBestCombo,
          swishCount: state.sessionSwishCount,
        };

        const bestScores = { ...state.bestScores };
        if (state.score > bestScores[state.mode]) {
          bestScores[state.mode] = state.score;
        }

        const recentRuns = [run, ...state.recentRuns].slice(0, 10);

        set({
          isRunning: false,
          combo: 0,
          timeLeft: DEFAULT_TIME,
          shotsLeft: state.mode === 'shots' ? DEFAULT_SHOTS : null,
          lastShot: undefined,
          recentRuns,
          bestScores,
          sessionBestCombo: state.sessionBestCombo,
          sessionSwishCount: state.sessionSwishCount,
          shotsTaken: state.shotsTaken,
          sessionStartedAt: undefined,
        });
      },
      registerShot: (result) => {
        let shouldEnd = false;
        set((state) => {
          if (!state.isRunning) {
            return state;
          }

          let combo = state.combo;
          let score = state.score;
          let sessionBestCombo = state.sessionBestCombo;
          let sessionSwishCount = state.sessionSwishCount;
          let shotsLeft = state.shotsLeft;
          const shotsTaken = state.shotsTaken + 1;

          let points = 0;
          if (result === 'miss') {
            combo = 0;
          } else {
            combo = combo + 1;
            const base = result === 'swish' ? 2 : 1;
            points = base * Math.max(combo, 1);
            score += points;
            sessionBestCombo = Math.max(sessionBestCombo, combo);
            if (result === 'swish') {
              sessionSwishCount += 1;
            }
          }

          if (shotsLeft !== null) {
            shotsLeft = Math.max(shotsLeft - 1, 0);
          }

          shouldEnd = shotsLeft === 0;

          return {
            ...state,
            combo,
            score,
            sessionBestCombo,
            sessionSwishCount,
            shotsLeft,
            shotsTaken,
            lastShot: { result, points, combo },
          };
        });

        if (shouldEnd) {
          get().endGame();
        }
      },
      tick: (dt) => {
        const state = get();
        if (!state.isRunning || state.mode !== 'timed') {
          return;
        }

        const timeLeft = Math.max(state.timeLeft - dt, 0);
        set({ timeLeft });
        if (timeLeft <= 0.01) {
          get().endGame();
        }
      },
      setMode: (mode) =>
        set((state) => {
          if (state.isRunning) {
            return state;
          }
          return {
            ...state,
            mode,
            timeLeft: mode === 'timed' ? DEFAULT_TIME : state.timeLeft,
            shotsLeft: mode === 'shots' ? DEFAULT_SHOTS : null,
          };
        }),
      toggleSound: () =>
        set((state) => ({
          ...state,
          isSoundEnabled: !state.isSoundEnabled,
        })),
      resetRecords: () =>
        set((state) => ({
          ...state,
          bestScores: { timed: 0, shots: 0 },
          recentRuns: [],
        })),
    }),
    {
      name: 'media-basket-mini:game',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : createJSONStorage(() => fallbackStorage),
      partialize: (state) => ({
        mode: state.mode,
        bestScores: state.bestScores,
        recentRuns: state.recentRuns,
        isSoundEnabled: state.isSoundEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        state.timeLeft = state.mode === 'timed' ? DEFAULT_TIME : state.timeLeft;
        state.shotsLeft = state.mode === 'shots' ? DEFAULT_SHOTS : null;
        state.isRunning = false;
        state.score = 0;
        state.combo = 0;
        state.sessionBestCombo = 0;
        state.sessionSwishCount = 0;
        state.shotsTaken = 0;
        state.lastShot = undefined;
      },
    },
  ),
);
