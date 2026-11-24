import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { copy, statements, type Statement } from '../lib/content';
import { mulberry32, shuffle, take } from '../lib/rng';
import { GameEnd, GameIntro, RoundDots, softSpring, spring } from '../ui/parts';
import { ArrowIcon, LeafShape } from '../art/Bits';
import { Moss } from '../art/Moss';
import type { GameProps } from '../types';

const ROUNDS = 10;
const c = copy.games.thoughtSorter;
const INK = '#3b4a3f';

function buildPlan(level: number, seed: number): Statement[] {
  const rng = mulberry32(seed ^ 0x7e4f);
  const main = statements.filter((s) => s.level === level);
  const lower = statements.filter((s) => s.level < level);
  const fromLower = lower.length ? 4 : 0;
  return shuffle([...take(main, ROUNDS - fromLower, rng), ...take(lower, fromLower, rng)], rng);
}

type Dir = 'keep' | 'letGo';

const leafExit = {
  keep: { y: 250, scale: 0.25, opacity: 0, rotate: -8, transition: { duration: 0.55, ease: [0.4, 0, 0.7, 0.4] as const } },
  letGo: { y: -380, x: 140, scale: 0.7, opacity: 0, rotate: 32, transition: { duration: 0.9, ease: [0.3, 0, 0.6, 1] as const } },
};

export function ThoughtSorter({ level, seed, startRound, resumed, onBegin, onHelp, onProgress, onDone }: GameProps) {
  const plan = useMemo(() => buildPlan(level, seed), [level, seed]);
  const [index, setIndex] = useState(startRound);
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>(resumed ? (startRound >= ROUNDS ? 'end' : 'play') : 'intro');
  const [dir, setDir] = useState<Dir>('keep');
  const [line, setLine] = useState<{ text: string; id: number } | null>(null);
  const [kept, setKept] = useState(0);
  const busy = useRef(false);

  // Moss's line is about the leaf that just left. It fades before it can be read as advice on the next.
  useEffect(() => {
    if (!line) return;
    const id = window.setTimeout(() => setLine(null), 2400);
    return () => window.clearTimeout(id);
  }, [line]);

  const sort = useCallback(
    (choice: Dir) => {
      if (busy.current || phase !== 'play' || index >= ROUNDS) return;
      busy.current = true;
      const st = plan[index];
      const matches = (choice === 'keep') === st.keep;
      setDir(choice);
      setLine({ text: matches ? c.sorted : st.keep ? c.intendedKeep : c.intendedLetGo, id: index });
      if (choice === 'keep') setKept((k) => k + 1);
      onProgress({ rounds: index + 1, carriedOn: index + 1 });
      // Let the exit direction reach the leaf before it unmounts.
      window.setTimeout(() => setIndex((i) => i + 1), 0);
      window.setTimeout(
        () => {
          busy.current = false;
          if (index + 1 >= ROUNDS) setPhase('end');
        },
        index + 1 >= ROUNDS ? 1700 : 650,
      );
    },
    [index, phase, plan, onProgress],
  );

  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        sort('letGo');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sort('keep');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, sort]);

  if (phase === 'intro') {
    return (
      <GameIntro
        line={c.intro}
        button={c.ready}
        onHelp={onHelp}
        onStart={() => {
          onBegin();
          setPhase('play');
        }}
        art={
          <div className="h-[110px] w-[170px]">
            <LeafShape className="h-full w-full" />
          </div>
        }
      />
    );
  }
  if (phase === 'end') return <GameEnd line={c.end} onDone={onDone} />;

  const st = plan[index];

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 70 || info.velocity.y > 600) sort('keep');
    else if (info.offset.y < -70 || info.velocity.y < -600) sort('letGo');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center pb-3">
        <RoundDots total={ROUNDS} done={index} />
      </div>

      <div className="relative flex flex-1 flex-col items-stretch">
        {/* let go: the open sky */}
        <button
          type="button"
          onClick={() => sort('letGo')}
          className="group relative flex h-[84px] flex-none items-center justify-center gap-2 overflow-hidden rounded-[24px] border-[2.5px] border-dashed border-ink/45 bg-lav-light/70 font-display text-[1.15rem] font-bold transition-colors duration-300 hover:bg-lav-light"
        >
          <svg viewBox="0 0 300 80" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
            <path d="M20 30 q30 -14 60 0 t60 0 M170 54 q26 -12 52 0 t52 0" fill="none" stroke={INK} strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <ArrowIcon dir="up" />
          <span>{c.letGo}</span>
          <span className="sr-only">. {c.letGoHint}</span>
        </button>

        {/* the leaf */}
        <div className="relative flex min-h-[250px] flex-1 items-center justify-center py-3">
          <AnimatePresence mode="wait" custom={dir}>
            {st && (
              <motion.div
                key={index}
                custom={dir}
                variants={{
                  enter: { opacity: 0, scale: 0.6, rotate: -10, y: 0 },
                  rest: { opacity: 1, scale: 1, rotate: 0, y: 0, x: 0 },
                  exit: (d: Dir) => leafExit[d],
                }}
                initial="enter"
                animate="rest"
                exit="exit"
                transition={spring}
                drag="y"
                dragSnapToOrigin
                dragElastic={0.9}
                dragConstraints={{ top: 0, bottom: 0 }}
                whileDrag={{ scale: 1.04, rotate: 2 }}
                onDragEnd={onDragEnd}
                className="no-select relative flex aspect-[34/24] w-full max-w-[25rem] cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              >
                <LeafShape className="absolute inset-0 h-full w-full drop-shadow-[0_10px_10px_rgb(59_74_63/0.18)]" />
                <p
                  className="display relative max-w-[66%] -translate-y-1 text-center text-[1.12rem] sm:text-[1.3rem]"
                  style={{ fontWeight: 600, lineHeight: 1.25, transform: 'rotate(-5deg)' }}
                >
                  {st.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* keep: the basket */}
        <button
          type="button"
          onClick={() => sort('keep')}
          className="relative flex h-[84px] flex-none items-center justify-center gap-2 rounded-[24px] border-[2.5px] border-dashed border-ink/45 bg-sage-light/80 font-display text-[1.15rem] font-bold transition-colors duration-300 hover:bg-sage-light"
        >
          <ArrowIcon dir="down" />
          <span>{c.keep}</span>
          <span className="sr-only">. {c.keepHint}</span>
          <motion.span key={kept} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={spring} className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden>
            <Basket />
          </motion.span>
        </button>
      </div>

      {/* Moss's single line. Same styling whichever way the leaf went. */}
      <div className="flex min-h-[76px] items-end gap-3 pt-3" aria-live="polite">
        <div className="flex-none">
          <Moss size={58} />
        </div>
        <AnimatePresence mode="wait">
          {line && (
            <motion.p
              key={line.id}
              initial={{ opacity: 0, x: -8, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={softSpring}
              className="bubble bubble-left mb-2"
            >
              {line.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Basket() {
  return (
    <svg width="30" height="26" viewBox="0 0 30 26" aria-hidden style={{ display: 'block' }}>
      <path d="M5 11 q10 -13 20 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 11 h26 l-3.5 13 h-19 z" fill="#f6cdb0" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 15 v6 M15 15 v6 M22 15 v6" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
