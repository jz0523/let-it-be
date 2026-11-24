import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dateKey, now, daysBetween, addDays } from './lib/time';
import type {
  ActedOn,
  DelayMinutes,
  GameId,
  GameResult,
  InProgress,
  Level,
  Profile,
  TrainingSession,
  UrgeEntry,
  UrgeType,
  WeeklyCheckin,
} from './types';

export const GAME_IDS: GameId[] = ['oneRead', 'sealedBox', 'thoughtSorter', 'letItSit'];
export const DELAYS: DelayMinutes[] = [5, 10, 15, 30];
export const URGE_TYPES: UrgeType[] = ['check', 'reread', 'search', 'ask', 'other'];

const LEVEL_UP_SESSIONS = 3;
const LEVEL_UP_RATIO = 0.7;
const URGE_COOLDOWN_MS = 10 * 60 * 1000;
const CHECKIN_GAP_DAYS = 7;
const BUSY_DAY_OPENS = 5;

const emptyCurrent = (): InProgress['current'] => ({
  rounds: 0,
  carriedOn: 0,
  whatifTaps: 0,
  elapsed: 0,
  started: false,
});

const perGame = <T,>(value: T): Record<GameId, T> => ({
  oneRead: value,
  sealedBox: value,
  thoughtSorter: value,
  letItSit: value,
});

export interface Data {
  onboarded: boolean;
  onboardingStep: number;
  profile: Profile;
  /** Highest level reached per game, so a lowered level can be raised again. */
  maxLevels: Record<GameId, Level>;
  /** Sessions at the current level in which the player carried on in 70% of rounds. */
  levelCredits: Record<GameId, number>;
  sessions: TrainingSession[];
  inProgress: InProgress | null;
  urges: UrgeEntry[];
  urgeOpens: { date: string; count: number; busyShown: boolean };
  lastDelay: DelayMinutes;
  checkins: WeeklyCheckin[];
  /** Number of check-ins on record when the Find help page was last shown. */
  helpNudgeAt: number;
  settings: { sound: boolean; reminder: boolean };
  lastReminderDate: string | null;
  /** Games whose how-to-play tutorial has been shown. */
  seenTutorials: Record<GameId, boolean>;
}

export interface SessionSummary {
  sprouts: number;
  levelUps: { id: GameId; level: Level }[];
}

interface Actions {
  setOnboardingStep: (step: number) => void;
  finishOnboarding: () => void;
  setPracticeTime: (hhmm: string) => void;
  setReminder: (on: boolean) => void;
  setSound: (on: boolean) => void;
  markReminded: () => void;
  markTutorialSeen: (id: GameId) => void;

  startTraining: () => void;
  beginGames: () => void;
  markGameStarted: () => void;
  recordProgress: (p: { rounds: number; carriedOn: number; whatifTaps?: number; elapsed?: number }) => void;
  finishGame: () => void;
  finishTraining: (effort?: 1 | 2 | 3 | 4 | 5) => SessionSummary;
  finalizeStale: () => void;

  noteUrgeOpen: () => void;
  markBusyShown: () => void;
  startUrge: (entry: { ratingBefore: number; urgeType?: UrgeType; delayMinutes: DelayMinutes }) => boolean;
  completeUrge: (ratingAfter: number, actedOn: ActedOn) => void;

  submitCheckin: (answers: number[]) => { total: number; showHelp: boolean };

  lowerLevel: (id: GameId) => void;
  raiseLevel: (id: GameId) => void;
  deleteAll: () => void;

  devAddSprouts: (n: number) => void;
  devUnlockToday: () => void;
  devEndTimer: () => void;
  devSetLevels: (level: Level) => void;
  devResetTutorials: () => void;
}

export type Store = Data & Actions;

function fresh(): Data {
  return {
    onboarded: false,
    onboardingStep: 0,
    profile: {
      createdAt: new Date(now()).toISOString(),
      practiceTime: '20:00',
      levels: perGame<Level>(1),
      sprouts: 0,
    },
    maxLevels: perGame<Level>(1),
    levelCredits: perGame(0),
    sessions: [],
    inProgress: null,
    urges: [],
    urgeOpens: { date: '', count: 0, busyShown: false },
    lastDelay: 10,
    checkins: [],
    helpNudgeAt: 0,
    settings: { sound: false, reminder: false },
    lastReminderDate: null,
    seenTutorials: perGame(false),
  };
}

/** Turn finished game results into a stored session, Sprouts and level changes. */
function closeSession(
  state: Data,
  date: string,
  games: GameResult[],
  effort?: 1 | 2 | 3 | 4 | 5,
): { patch: Partial<Data>; summary: SessionSummary } {
  const sprouts = games.reduce((sum, g) => sum + g.carriedOn, 0);
  const levels = { ...state.profile.levels };
  const maxLevels = { ...state.maxLevels };
  const credits = { ...state.levelCredits };
  const levelUps: SessionSummary['levelUps'] = [];

  for (const g of games) {
    if (g.rounds === 0) continue;
    if (g.carriedOn / g.rounds >= LEVEL_UP_RATIO) credits[g.id] += 1;
    if (credits[g.id] >= LEVEL_UP_SESSIONS) {
      credits[g.id] = 0;
      if (levels[g.id] < 5) {
        levels[g.id] = (levels[g.id] + 1) as Level;
        if (levels[g.id] > maxLevels[g.id]) maxLevels[g.id] = levels[g.id];
        levelUps.push({ id: g.id, level: levels[g.id] });
      }
    }
  }

  const session: TrainingSession = { date, games, ...(effort ? { effortRating: effort } : {}) };
  return {
    patch: {
      sessions: [...state.sessions, session],
      inProgress: null,
      profile: { ...state.profile, levels, sprouts: state.profile.sprouts + sprouts },
      maxLevels,
      levelCredits: credits,
    },
    summary: { sprouts, levelUps },
  };
}

function resultFor(state: Data, ip: InProgress): GameResult {
  const id = ip.gameIds[ip.stage - 1];
  return {
    id,
    level: state.profile.levels[id],
    rounds: ip.current.rounds,
    carriedOn: ip.current.carriedOn,
    ...(id === 'letItSit' ? { whatifTaps: ip.current.whatifTaps } : {}),
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...fresh(),

      setOnboardingStep: (step) => set({ onboardingStep: step }),
      finishOnboarding: () => set({ onboarded: true }),
      setPracticeTime: (hhmm) => set((s) => ({ profile: { ...s.profile, practiceTime: hhmm } })),
      setReminder: (on) => set((s) => ({ settings: { ...s.settings, reminder: on } })),
      setSound: (on) => set((s) => ({ settings: { ...s.settings, sound: on } })),
      markReminded: () => set({ lastReminderDate: dateKey() }),
      markTutorialSeen: (id) => set((s) => ({ seenTutorials: { ...s.seenTutorials, [id]: true } })),

      startTraining: () => {
        const s = get();
        const today = dateKey();
        if (s.sessions.some((x) => x.date === today)) return;
        if (s.inProgress?.date === today) return;
        // Rotation: the two pairs alternate, so each game appears every other session.
        const pair: [GameId, GameId] =
          s.sessions.length % 2 === 0 ? ['oneRead', 'sealedBox'] : ['thoughtSorter', 'letItSit'];
        set({
          inProgress: {
            date: today,
            seed: Math.floor(Math.random() * 2_147_483_647),
            gameIds: pair,
            stage: 0,
            results: [],
            current: emptyCurrent(),
          },
        });
      },

      beginGames: () =>
        set((s) => (s.inProgress && s.inProgress.stage === 0 ? { inProgress: { ...s.inProgress, stage: 1 } } : {})),

      markGameStarted: () =>
        set((s) =>
          s.inProgress ? { inProgress: { ...s.inProgress, current: { ...s.inProgress.current, started: true } } } : {},
        ),

      recordProgress: (p) =>
        set((s) => {
          if (!s.inProgress) return {};
          const cur = s.inProgress.current;
          return {
            inProgress: {
              ...s.inProgress,
              current: {
                ...cur,
                rounds: p.rounds,
                carriedOn: p.carriedOn,
                whatifTaps: p.whatifTaps ?? cur.whatifTaps,
                elapsed: p.elapsed ?? cur.elapsed,
                started: true,
              },
            },
          };
        }),

      finishGame: () =>
        set((s) => {
          const ip = s.inProgress;
          if (!ip || ip.stage < 1 || ip.stage > 2) return {};
          return {
            inProgress: {
              ...ip,
              results: [...ip.results, resultFor(s, ip)],
              stage: (ip.stage + 1) as InProgress['stage'],
              current: emptyCurrent(),
            },
          };
        }),

      finishTraining: (effort) => {
        const s = get();
        if (!s.inProgress) return { sprouts: 0, levelUps: [] };
        const { patch, summary } = closeSession(s, s.inProgress.date, s.inProgress.results, effort);
        set(patch);
        return summary;
      },

      // A session left unfinished on an earlier day is closed with whatever was played.
      finalizeStale: () => {
        const s = get();
        const ip = s.inProgress;
        if (!ip || ip.date === dateKey()) return;
        const games = [...ip.results];
        if ((ip.stage === 1 || ip.stage === 2) && ip.current.started) games.push(resultFor(s, ip));
        if (games.length === 0) {
          set({ inProgress: null });
          return;
        }
        set(closeSession(s, ip.date, games).patch);
      },

      noteUrgeOpen: () =>
        set((s) => {
          const today = dateKey();
          const same = s.urgeOpens.date === today;
          return {
            urgeOpens: {
              date: today,
              count: (same ? s.urgeOpens.count : 0) + 1,
              busyShown: same ? s.urgeOpens.busyShown : false,
            },
          };
        }),

      markBusyShown: () => set((s) => ({ urgeOpens: { ...s.urgeOpens, busyShown: true } })),

      startUrge: ({ ratingBefore, urgeType, delayMinutes }) => {
        const s = get();
        if (pendingUrge(s.urges) || urgeCooldownUntil(s.urges)) return false;
        const start = now();
        const entry: UrgeEntry = {
          startedAt: new Date(start).toISOString(),
          endsAt: new Date(start + delayMinutes * 60_000).toISOString(),
          delayMinutes,
          ratingBefore,
          ...(urgeType ? { urgeType } : {}),
        };
        set({ urges: [...s.urges, entry], lastDelay: delayMinutes });
        return true;
      },

      completeUrge: (ratingAfter, actedOn) =>
        set((s) => {
          const idx = s.urges.findIndex((u) => u.ratingAfter === undefined);
          if (idx < 0) return {};
          const urges = s.urges.slice();
          urges[idx] = { ...urges[idx], ratingAfter, actedOn };
          return { urges, profile: { ...s.profile, sprouts: s.profile.sprouts + 1 } };
        }),

      submitCheckin: (answers) => {
        const s = get();
        const total = answers.reduce((a, b) => a + b, 0);
        const checkins = [...s.checkins, { date: dateKey(), answers, total }];
        const n = checkins.length;
        const rising =
          n >= 4 &&
          checkins[n - 1].total > checkins[n - 2].total &&
          checkins[n - 2].total > checkins[n - 3].total &&
          checkins[n - 3].total > checkins[n - 4].total;
        const showHelp = rising && (s.helpNudgeAt === 0 || n - s.helpNudgeAt >= 3);
        set({
          checkins,
          profile: { ...s.profile, sprouts: s.profile.sprouts + 1 },
          helpNudgeAt: showHelp ? n : s.helpNudgeAt,
        });
        return { total, showHelp };
      },

      lowerLevel: (id) =>
        set((s) =>
          s.profile.levels[id] > 1
            ? {
                profile: { ...s.profile, levels: { ...s.profile.levels, [id]: s.profile.levels[id] - 1 } },
                levelCredits: { ...s.levelCredits, [id]: 0 },
              }
            : {},
        ),

      raiseLevel: (id) =>
        set((s) =>
          s.profile.levels[id] < s.maxLevels[id]
            ? { profile: { ...s.profile, levels: { ...s.profile.levels, [id]: s.profile.levels[id] + 1 } } }
            : {},
        ),

      deleteAll: () => set({ ...fresh() }),

      devAddSprouts: (n) => set((s) => ({ profile: { ...s.profile, sprouts: s.profile.sprouts + n } })),
      devUnlockToday: () =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.date !== dateKey()), inProgress: null })),
      devEndTimer: () =>
        set((s) => {
          const idx = s.urges.findIndex((u) => u.ratingAfter === undefined);
          if (idx < 0) return {};
          const urges = s.urges.slice();
          urges[idx] = { ...urges[idx], endsAt: new Date(now() - 1000).toISOString() };
          return { urges };
        }),
      devSetLevels: (level) =>
        set((s) => ({
          profile: { ...s.profile, levels: perGame(level) },
          maxLevels: perGame(level),
        })),
      devResetTutorials: () => set({ seenTutorials: perGame(false) }),
    }),
    { name: 'letitbe-v1', version: 1 },
  ),
);

/* ---------- derived helpers ---------- */

export function isLockedToday(sessions: TrainingSession[]): boolean {
  const today = dateKey();
  return sessions.some((s) => s.date === today);
}

/** The one urge entry still waiting for its second rating, if any. */
export function pendingUrge(urges: UrgeEntry[]): UrgeEntry | null {
  return urges.find((u) => u.ratingAfter === undefined) ?? null;
}

export function urgeIsDue(entry: UrgeEntry): boolean {
  return now() >= new Date(entry.endsAt).getTime();
}

/** Timestamp before which no new timer may start, or null when one may. */
export function urgeCooldownUntil(urges: UrgeEntry[]): number | null {
  let lastEnd = 0;
  for (const u of urges) {
    if (u.ratingAfter !== undefined) lastEnd = Math.max(lastEnd, new Date(u.endsAt).getTime());
  }
  const until = lastEnd + URGE_COOLDOWN_MS;
  return lastEnd > 0 && now() < until ? until : null;
}

export function isBusyDay(opens: Data['urgeOpens']): boolean {
  return opens.date === dateKey() && opens.count > BUSY_DAY_OPENS && !opens.busyShown;
}

/** Day on which the next check-in opens, or null when it is open now. */
export function checkinOpensOn(checkins: WeeklyCheckin[]): string | null {
  const last = checkins[checkins.length - 1];
  if (!last) return null;
  return daysBetween(last.date, dateKey()) >= CHECKIN_GAP_DAYS ? null : addDays(last.date, CHECKIN_GAP_DAYS);
}

/* ---------- screen routing (not persisted) ---------- */

export type Screen =
  | 'home'
  | 'training'
  | 'urge'
  | 'checkin'
  | 'progress'
  | 'settings'
  | 'help'
  | 'why'
  | 'about'
  | 'guide'
  | 'tutorial'
  | 'solo';

interface Ui {
  screen: Screen;
  /** The screen before this one, so information pages can go back to it. */
  prev: Screen;
  helpRise: boolean;
  soloGame: GameId | null;
  tutorialGame: GameId | null;
  summary: SessionSummary | null;
  go: (screen: Screen) => void;
  showHelpForRise: () => void;
  playSolo: (id: GameId) => void;
  openTutorial: (id: GameId) => void;
  setSummary: (summary: SessionSummary | null) => void;
}

export const useUi = create<Ui>()((set) => ({
  screen: 'home',
  prev: 'home',
  helpRise: false,
  soloGame: null,
  tutorialGame: null,
  summary: null,
  go: (screen) => {
    set((u) => ({ screen, prev: u.screen, helpRise: false }));
    window.scrollTo(0, 0);
  },
  showHelpForRise: () => {
    set({ screen: 'help', helpRise: true });
    window.scrollTo(0, 0);
  },
  playSolo: (id) => set({ screen: 'solo', soloGame: id }),
  openTutorial: (id) => {
    set({ screen: 'tutorial', tutorialGame: id });
    window.scrollTo(0, 0);
  },
  setSummary: (summary) => set({ summary }),
}));
