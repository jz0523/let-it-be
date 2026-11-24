import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { OneRead } from '../games/OneRead';
import { SealedBox } from '../games/SealedBox';
import { ThoughtSorter } from '../games/ThoughtSorter';
import { LetItSit } from '../games/LetItSit';
import { Garden } from '../art/Garden';
import { Moss } from '../art/Moss';
import { SproutIcon } from '../art/Bits';
import { copy, fmt, gameName } from '../lib/content';
import { useStore, useUi, type SessionSummary } from '../store';
import { MossLine, Stage, softSpring, spring } from '../ui/parts';
import { Tutorial } from './Tutorial';
import type { GameId, GameProps, InProgress, Level } from '../types';

const GAMES: Record<GameId, ComponentType<GameProps>> = {
  oneRead: OneRead,
  sealedBox: SealedBox,
  thoughtSorter: ThoughtSorter,
  letItSit: LetItSit,
};

/** Frame for a mini-game. There is no way back out of a game once it starts. */
export function GameFrame({ id, sub, children }: { id: GameId; sub: string; children: ReactNode }) {
  return (
    <Stage wide={id === 'letItSit'}>
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="text-[1.55rem]">{gameName(id)}</h1>
        <span className="font-display text-[0.95rem] font-bold text-ink-soft">{sub}</span>
      </header>
      {children}
    </Stage>
  );
}

export function Training() {
  const ip = useStore((s) => s.inProgress);
  const summary = useUi((s) => s.summary);
  const go = useUi((s) => s.go);

  useEffect(() => {
    if (!ip && !summary) go('home');
  }, [ip, summary, go]);

  if (summary) return <SessionEnd summary={summary} />;
  if (!ip) return null;
  if (ip.stage === 0) return <Greeting ip={ip} />;
  if (ip.stage === 3) return <Reflection />;
  return <ActiveGame key={ip.stage} ip={ip} />;
}

function Greeting({ ip }: { ip: InProgress }) {
  const beginGames = useStore((s) => s.beginGames);
  const go = useUi((s) => s.go);
  const line = copy.moss.greetings[ip.seed % copy.moss.greetings.length];
  return (
    <Stage className="items-center justify-center gap-7">
      <motion.p
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...spring, delay: 0.25 }}
        className="bubble bubble-down max-w-[20rem] text-center !text-[1.3rem]"
        style={{ transformOrigin: '50% 100%' }}
      >
        {line}
      </motion.p>
      <Moss size={190} />
      <ul className="flex flex-wrap justify-center gap-2.5">
        {ip.gameIds.map((id) => (
          <li key={id} className="rounded-full border-[2.5px] border-ink bg-paper px-4 py-1.5 font-display text-[1.05rem] font-bold">
            {gameName(id)}
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-wide max-w-[22rem]" onClick={beginGames}>
        {copy.training.begin}
      </button>
      <button type="button" className="link-btn" onClick={() => go('home')}>
        {copy.app.back}
      </button>
    </Stage>
  );
}

function ActiveGame({ ip }: { ip: InProgress }) {
  const id = ip.gameIds[ip.stage - 1];
  const level = useStore((s) => s.profile.levels[id]);
  const markGameStarted = useStore((s) => s.markGameStarted);
  const recordProgress = useStore((s) => s.recordProgress);
  const finishGame = useStore((s) => s.finishGame);
  // Captured once: where this game stood when the screen opened (non-zero after a reload).
  const [start] = useState(() => ({ ...ip.current, level }));
  // The first time a game comes up, show how it is played. Not scored, and reopenable.
  const [teaching, setTeaching] = useState(() => !useStore.getState().seenTutorials[id] && !ip.current.started);
  const Game = GAMES[id];
  if (teaching) {
    return (
      <Tutorial
        game={id}
        onDone={() => {
          useStore.getState().markTutorialSeen(id);
          setTeaching(false);
        }}
      />
    );
  }
  return (
    <GameFrame id={id} sub={`${fmt(copy.training.gameOf, { n: ip.stage })} · ${copy.app.level} ${start.level}`}>
      <Game
        level={start.level}
        seed={ip.seed + ip.stage * 7919}
        startRound={start.rounds}
        startCarried={start.carriedOn}
        startTaps={start.whatifTaps}
        startElapsed={start.elapsed}
        resumed={start.started}
        onBegin={markGameStarted}
        onHelp={() => setTeaching(true)}
        onProgress={recordProgress}
        onDone={finishGame}
      />
    </GameFrame>
  );
}

function Reflection() {
  const finishTraining = useStore((s) => s.finishTraining);
  const setSummary = useUi((s) => s.setSummary);
  return (
    <Stage className="justify-center gap-6">
      <h1 className="text-center text-[1.8rem]">{copy.training.reflectTitle}</h1>
      <div className="flex flex-col gap-3" role="group" aria-label={copy.training.reflectTitle}>
        {copy.training.reflectScale.map((label, i) => (
          <motion.button
            key={label}
            type="button"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...softSpring, delay: 0.08 * i }}
            className="chip !min-h-[58px] !justify-start gap-4 !rounded-[22px] !px-4 font-display !text-[1.2rem]"
            onClick={() => setSummary(finishTraining((i + 1) as 1 | 2 | 3 | 4 | 5))}
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border-[2.5px] border-ink bg-cream-deep tabular-nums">
              {i + 1}
            </span>
            {label}
          </motion.button>
        ))}
      </div>
      <p className="text-center text-ink-soft">{copy.training.reflectNote}</p>
    </Stage>
  );
}

function SessionEnd({ summary }: { summary: SessionSummary }) {
  const sprouts = useStore((s) => s.profile.sprouts);
  const setSummary = useUi((s) => s.setSummary);
  const go = useUi((s) => s.go);
  const line =
    summary.sprouts === 0
      ? copy.training.sproutsAddedNone
      : summary.sprouts === 1
        ? copy.training.sproutsAddedOne
        : fmt(copy.training.sproutsAdded, { n: summary.sprouts });
  return (
    <Stage className="justify-center gap-6">
      <div className="card aspect-[3/2] w-full overflow-hidden">
        <Garden sprouts={sprouts} characters={false} label={copy.home.gardenLabel} />
      </div>
      <p className="flex items-center justify-center gap-2 text-center font-display text-[1.3rem] font-bold">
        <SproutIcon size={28} />
        {line}
      </p>
      {summary.levelUps.map((up) => (
        <p key={up.id} className="text-center text-ink-soft">
          {fmt(copy.training.levelUp, { game: gameName(up.id), level: up.level })}
        </p>
      ))}
      <MossLine line={copy.moss.sessionEnd} />
      <button
        type="button"
        className="btn btn-wide"
        onClick={() => {
          setSummary(null);
          go('home');
        }}
      >
        {copy.training.toGarden}
      </button>
    </Stage>
  );
}

/** Development only: play one game outside the daily session. Nothing is saved. */
export function SoloGame() {
  const id = useUi((s) => s.soloGame);
  const go = useUi((s) => s.go);
  const level = useStore((s) => (id ? s.profile.levels[id] : 1)) as Level;
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  if (!id) return null;
  const Game = GAMES[id];
  return (
    <GameFrame id={id} sub={`${copy.app.level} ${level}`}>
      <Game
        level={level}
        seed={seed}
        startRound={0}
        startCarried={0}
        startTaps={0}
        startElapsed={0}
        resumed={false}
        onBegin={() => {}}
        onProgress={() => {}}
        onDone={() => go('settings')}
      />
    </GameFrame>
  );
}
