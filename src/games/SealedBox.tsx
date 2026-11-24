import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { boxSets, copy, fmt, type BoxSet } from '../lib/content';
import { mulberry32, shuffle, take } from '../lib/rng';
import { GameEnd, GameIntro, RoundDots, softSpring, spring } from '../ui/parts';
import { Whatif } from '../art/Whatif';
import { BoxArt, SproutIcon } from '../art/Bits';
import type { GameProps } from '../types';

const ROUNDS = 4;
const TRAVEL_S = [8, 10, 12, 14, 16];
const BUBBLE_S = [4.4, 3.8, 3.2, 2.6, 2.1];
const c = copy.games.sealedBox;
const INK = '#3b4a3f';

interface Plan {
  sets: BoxSet[];
  trays: string[][];
  /** At most one delivered box is opened at the door. Most never are. */
  revealRound: number;
}

function buildPlan(level: number, seed: number): Plan {
  const rng = mulberry32(seed ^ 0xb0c5);
  const sets = take(
    boxSets.filter((b) => b.level === level),
    ROUNDS,
    rng,
  );
  const trays = sets.map((s) => shuffle([...s.items, ...s.extras], rng));
  const revealRound = rng() < 0.55 ? Math.floor(rng() * ROUNDS) : -1;
  return { sets, trays, revealRound };
}

type Phase = 'intro' | 'memorise' | 'pack' | 'travel' | 'result' | 'end';
type Outcome = 'delivered' | 'opened' | 'revealed';

export function SealedBox({ level, seed, startRound, startCarried, resumed, onBegin, onHelp, onProgress, onDone }: GameProps) {
  const plan = useMemo(() => buildPlan(level, seed), [level, seed]);
  const [round, setRound] = useState(startRound);
  const [carried, setCarried] = useState(startCarried);
  const [phase, setPhase] = useState<Phase>(resumed ? (startRound >= ROUNDS ? 'end' : 'memorise') : 'intro');
  const [packed, setPacked] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome>('delivered');
  const [bubble, setBubble] = useState(0);
  const settled = useRef(false);

  const set = plan.sets[Math.min(round, ROUNDS - 1)];
  const tray = plan.trays[Math.min(round, ROUNDS - 1)];
  const need = set.items.length;
  const last = round + 1 >= ROUNDS;

  // The list shows once, then leaves.
  useEffect(() => {
    if (phase !== 'memorise') return;
    const id = window.setTimeout(() => setPhase('pack'), 2400 + need * 750);
    return () => window.clearTimeout(id);
  }, [phase, need, round]);

  function settle(result: Outcome) {
    if (settled.current) return;
    settled.current = true;
    const kept = result !== 'opened';
    const nextCarried = carried + (kept ? 1 : 0);
    setCarried(nextCarried);
    setOutcome(result);
    setPhase('result');
    onProgress({ rounds: round + 1, carriedOn: nextCarried });
  }

  // The walk. It ends in a delivery unless the player peeks first.
  useEffect(() => {
    if (phase !== 'travel') return;
    settled.current = false;
    setBubble(0);
    const done = window.setTimeout(
      () => settle(plan.revealRound === round ? 'revealed' : 'delivered'),
      TRAVEL_S[level - 1] * 1000,
    );
    const talk = window.setInterval(() => setBubble((b) => b + 1), BUBBLE_S[level - 1] * 1000);
    return () => {
      window.clearTimeout(done);
      window.clearInterval(talk);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  function nextBox() {
    setPacked([]);
    if (last) setPhase('end');
    else {
      setRound(round + 1);
      setPhase('memorise');
    }
  }

  if (phase === 'intro') {
    return (
      <GameIntro
        line={c.intro}
        button={c.ready}
        onHelp={onHelp}
        onStart={() => {
          onBegin();
          setPhase('memorise');
        }}
        art={<BoxArt size={120} />}
      />
    );
  }
  if (phase === 'end') return <GameEnd line={c.end} onDone={onDone} art={<BoxArt size={120} />} />;

  const insistent = level >= 3 && bubble % 2 === 1;
  const whatifSize = 54 + level * 4;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center pb-4">
        <RoundDots total={ROUNDS} done={phase === 'result' ? round + 1 : round} />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'memorise' && (
          <motion.div
            key={`mem-${round}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22, rotate: -3 }}
            transition={softSpring}
            className="flex flex-1 flex-col items-center justify-center gap-5"
          >
            <div className="card no-select w-full max-w-[24rem] px-6 py-6" style={{ transform: 'rotate(-0.7deg)' }}>
              <p className="mb-1 font-display text-[0.95rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{set.theme}</p>
              <h2 className="mb-4 text-[1.5rem]">{c.packTitle}</h2>
              <ul className="flex flex-col gap-2.5">
                {set.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...softSpring, delay: 0.15 + i * 0.12 }}
                    className="flex items-center gap-3 font-display text-[1.45rem] font-semibold"
                  >
                    <span className="h-3.5 w-3.5 flex-none rounded-full border-[2.5px] border-ink bg-peach" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <p className="text-center text-ink-soft">{c.memorise}</p>
          </motion.div>
        )}

        {phase === 'pack' && (
          <motion.div
            key={`pack-${round}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={softSpring}
            className="flex flex-1 flex-col items-center justify-between gap-5"
          >
            <p className="display text-center text-[1.35rem]">{c.choose}</p>
            <div className="flex min-h-[124px] flex-wrap content-start justify-center gap-2.5" role="group" aria-label={c.choose}>
              <AnimatePresence mode="popLayout">
                {tray
                  .filter((item) => !packed.includes(item))
                  .map((item) => (
                    <motion.button
                      layout
                      key={item}
                      type="button"
                      className="chip !min-h-[52px] !px-5 font-display !text-[1.15rem]"
                      exit={{ opacity: 0, scale: 0.4, y: 70, transition: { duration: 0.35 } }}
                      transition={spring}
                      disabled={packed.length >= need}
                      onClick={() => setPacked((p) => (p.length < need && !p.includes(item) ? [...p, item] : p))}
                    >
                      {item}
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.div key={packed.length} initial={{ scale: 0.92, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} transition={spring}>
                <BoxArt open size={132} />
              </motion.div>
              <p className="font-display text-[1.05rem] font-bold text-ink-soft" aria-live="polite">
                {fmt(c.packed, { n: packed.length, total: need })}
              </p>
            </div>
            <button type="button" className="btn btn-wide max-w-[22rem]" disabled={packed.length < need} onClick={() => setPhase('travel')}>
              {c.seal}
            </button>
          </motion.div>
        )}

        {phase === 'travel' && (
          <motion.div
            key={`travel-${round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center justify-between gap-5"
          >
            <p className="display text-center text-[1.35rem]">{c.onTheWay}</p>

            <div className="relative w-full overflow-hidden rounded-[28px] border-[3px] border-ink shadow-[var(--shadow-soft)]" style={{ aspectRatio: '5 / 4', maxHeight: '50vh' }}>
              <motion.div
                className="absolute inset-y-0 left-0 w-[300%]"
                initial={{ x: '0%' }}
                animate={{ x: '-66.666%' }}
                transition={{ duration: TRAVEL_S[level - 1], ease: 'linear' }}
              >
                <PathScene />
              </motion.div>
              <div className="absolute bottom-[12%] left-[7%] flex items-end">
                <div className="relative mr-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={bubble}
                      initial={{ opacity: 0, scale: 0.7, y: 8 }}
                      animate={{ opacity: 1, scale: insistent ? 1.1 : 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={spring}
                      className="bubble bubble-down absolute bottom-full left-0 mb-2.5 w-max max-w-[12.5rem] !text-[0.98rem]"
                      style={{ transformOrigin: '15% 100%', ['--tail' as string]: `${whatifSize / 2}px` }}
                    >
                      {c.whatifs[bubble % c.whatifs.length]}
                    </motion.span>
                  </AnimatePresence>
                  <Whatif mood={insistent ? 'loud' : 'alert'} size={whatifSize} />
                </div>
                <div className="anim-bob">
                  <Cart />
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`btn btn-paper btn-wide max-w-[22rem] ${level >= 5 ? 'anim-pulse' : ''}`}
              onClick={() => settle('opened')}
            >
              {c.peek}
            </button>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key={`res-${round}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={softSpring}
            className="flex flex-1 flex-col items-center justify-between gap-5"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <BoxArt open={outcome !== 'delivered'} size={150} />
              <p className="display text-center text-[1.5rem]" aria-live="polite">
                {outcome === 'opened' ? (last ? c.openedLast : c.opened) : last ? c.deliveredLast : c.delivered}
              </p>
              {outcome !== 'opened' && (
                <span className="inline-flex items-center gap-1.5 font-display font-bold text-ink-soft">
                  <SproutIcon size={22} /> 1 {copy.app.sproutOne}
                </span>
              )}
              {outcome !== 'delivered' && (
                <div className="panel w-full max-w-[22rem] px-4 py-3 text-center">
                  <p className="mb-2 font-display text-[0.95rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{c.inside}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {packed.map((item) => (
                      <span key={item} className="rounded-full border-2 border-ink bg-paper px-3 py-1 font-display font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="button" className="btn btn-wide max-w-[22rem]" onClick={nextBox}>
              {last ? c.finish : c.next}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Cart() {
  return (
    <div className="flex flex-col items-center">
      <BoxArt size={66} />
      <svg width="74" height="22" viewBox="0 0 74 22" aria-hidden style={{ marginTop: -12, display: 'block' }}>
        <rect x="4" y="1" width="66" height="8" rx="4" fill="#d3c7ea" stroke={INK} strokeWidth="2.5" />
        <circle cx="19" cy="13" r="7" fill="#fffdf7" stroke={INK} strokeWidth="2.5" />
        <circle cx="55" cy="13" r="7" fill="#fffdf7" stroke={INK} strokeWidth="2.5" />
        <circle cx="19" cy="13" r="1.8" fill={INK} />
        <circle cx="55" cy="13" r="1.8" fill={INK} />
      </svg>
    </div>
  );
}

function PathScene() {
  const trees = [60, 150, 290, 420, 545, 700, 815, 940];
  return (
    <svg viewBox="0 0 1200 250" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde6cc" />
          <stop offset="0.75" stopColor="#fbf2de" />
        </linearGradient>
      </defs>
      <rect width="1200" height="250" fill="url(#sb-sky)" />
      <circle cx="96" cy="50" r="26" fill="#f9d4ae" />
      {[250, 640, 1010].map((x) => (
        <g key={x} fill="#fffdf7" opacity="0.9">
          <ellipse cx={x} cy="48" rx="32" ry="10" />
          <ellipse cx={x - 16} cy="42" rx="16" ry="10" />
          <ellipse cx={x + 16} cy="40" rx="18" ry="11" />
        </g>
      ))}
      <path d="M0 150 Q80 100 170 136 T400 118 T640 140 T900 116 T1200 132 V250 H0Z" fill="#dce8d3" />
      <path d="M0 172 Q120 140 240 164 T500 152 T760 168 T1000 150 T1200 160 V250 H0Z" fill="#c9dcbd" />
      {trees.map((x, i) => {
        const y = 152 + (i % 3) * 5;
        return (
          <g key={x} stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
            <path d={`M${x} ${y + 28} v-16`} strokeLinecap="round" />
            <ellipse cx={x} cy={y} rx={14 + (i % 2) * 3} ry={18 + (i % 2) * 3} fill={i % 2 ? '#b7ceac' : '#a9c59f'} />
          </g>
        );
      })}
      {/* the house at the end of the path */}
      <g transform="translate(748 0)" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M316 198 V150 H380 V198 Z" fill="#fffdf7" />
        <path d="M306 152 L348 118 L390 152 Z" fill="#d3c7ea" />
        <path d="M340 198 V172 q8 -9 16 0 V198 Z" fill="#f6cdb0" />
        <rect x="362" y="160" width="12" height="12" rx="3" fill="#fbe0b0" />
        <path d="M294 200 v-22" />
        <rect x="285" y="166" width="18" height="12" rx="4" fill="#f6cdb0" />
      </g>
      {/* ground and path */}
      <path d="M0 196 Q300 184 600 194 T1200 192 V250 H0Z" fill="#b7ceac" />
      <path d="M-10 224 Q300 212 600 222 T1210 220" fill="none" stroke="#f3e9d2" strokeWidth="24" strokeLinecap="round" />
      <path d="M-10 224 Q300 212 600 222 T1210 220" fill="none" stroke="#fffdf7" strokeWidth="3" strokeDasharray="3 16" strokeLinecap="round" />
    </svg>
  );
}
