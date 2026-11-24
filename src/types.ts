export type GameId = 'oneRead' | 'sealedBox' | 'thoughtSorter' | 'letItSit';
export type Level = 1 | 2 | 3 | 4 | 5;
export type DelayMinutes = 5 | 10 | 15 | 30;
export type UrgeType = 'check' | 'reread' | 'search' | 'ask' | 'other';
export type ActedOn = 'yes' | 'no' | 'partly';

export interface Profile {
  createdAt: string;
  practiceTime: string; // "21:00"
  levels: Record<GameId, Level>;
  sprouts: number;
}

export interface GameResult {
  id: GameId;
  level: number;
  rounds: number;
  carriedOn: number;
  /** Let It Sit only: taps on Whatifs during the round. */
  whatifTaps?: number;
}

export interface TrainingSession {
  date: string; // one per calendar day
  games: GameResult[];
  /** Missing when the session was left before the reflection tap. */
  effortRating?: 1 | 2 | 3 | 4 | 5;
}

export interface UrgeEntry {
  startedAt: string;
  endsAt: string;
  urgeType?: UrgeType;
  delayMinutes: DelayMinutes;
  ratingBefore: number; // 0-10
  ratingAfter?: number;
  actedOn?: ActedOn;
}

export interface WeeklyCheckin {
  date: string;
  answers: number[]; // 18 items, 0-4
  total: number; // 0-72
}

/** A Daily Training session that has started but not finished. */
export interface InProgress {
  date: string;
  seed: number;
  gameIds: [GameId, GameId];
  /** 0 = greeting, 1 = first game, 2 = second game, 3 = reflection */
  stage: 0 | 1 | 2 | 3;
  results: GameResult[];
  /** Progress inside the current game, so a reload cannot replay rounds. */
  current: { rounds: number; carriedOn: number; whatifTaps: number; elapsed: number; started: boolean };
}

export interface GameProps {
  level: Level;
  seed: number;
  /** Rounds already played before a reload. */
  startRound: number;
  startCarried: number;
  startTaps: number;
  startElapsed: number;
  /** Skip the intro card when resuming mid-game. */
  resumed: boolean;
  onBegin: () => void;
  /** Reopens the how-to-play tutorial from the intro card. */
  onHelp?: () => void;
  onProgress: (p: { rounds: number; carriedOn: number; whatifTaps?: number; elapsed?: number }) => void;
  onDone: () => void;
}
