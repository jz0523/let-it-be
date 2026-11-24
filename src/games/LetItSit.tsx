import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { copy, fmt, whatifLines } from '../lib/content';
import { mulberry32, type Rng } from '../lib/rng';
import { GameEnd, GameIntro, softSpring, spring } from '../ui/parts';
import { Whatif, type WhatifMood } from '../art/Whatif';
import { Plant } from '../art/Garden';
import type { GameProps } from '../types';

const ROUND_S = 90;
const ORIGINALS = [3, 4, 5, 6, 7];
const MAX_ON_SCREEN = 9;
const SIT_S = 5;
const YAWN_S = 7.5;
const SLEEP_S = 10;
const POTS = 5;
const c = copy.games.letItSit;
const INK = '#3b4a3f';

/** Where sleepers settle: along the bottom, corners first. */
const NAP_X = [8, 92, 18.5, 81.5, 29, 71, 39.5, 60.5, 50];

interface Creature {
  id: number;
  x: number;
  y: number;
  state: 'awake' | 'sitting' | 'yawn' | 'asleep';
  touched: boolean;
  quietSince: number;
  grown: number;
  line: string;
  open: boolean;
  original: boolean;
  nap: number;
}

function spawnPoint(rng: Rng, level: number): { x: number; y: number } {
  // Always on the grass (the horizon sits at 30%), so nobody stands in the sky.
  if (level >= 4 && rng() < 0.4) return { x: 28 + rng() * 44, y: 50 + rng() * 9 };
  const edge = rng();
  if (edge < 0.38) return { x: 8 + rng() * 10, y: 40 + rng() * 15 };
  if (edge < 0.76) return { x: 82 + rng() * 10, y: 40 + rng() * 15 };
  return { x: 26 + rng() * 48, y: 39 + rng() * 6 };
}

export function LetItSit({ level, seed, startCarried, startTaps, startElapsed, resumed, onBegin, onHelp, onProgress, onDone }: GameProps) {
  const total = ORIGINALS[level - 1];
  const spawnTimes = useMemo(() => Array.from({ length: total }, (_, i) => 3 + (i * 58) / total), [total]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>(resumed ? (startElapsed >= ROUND_S ? 'end' : 'play') : 'intro');
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [target, setTarget] = useState(0);
  const [growth, setGrowth] = useState<number[]>(() => Array(POTS).fill(0));
  const [pour, setPour] = useState(0);
  // Characters grow with the scene, so a wide desktop scene is not full of tiny creatures.
  const scene = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState(1);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const measure = () => setUnit(Math.max(1, Math.min(1.5, el.clientWidth / 360)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  // The simulation lives in a ref so the interval never sees stale state.
  const sim = useRef({
    elapsed: startElapsed,
    carried: startCarried,
    taps: startTaps,
    spawned: spawnTimes.filter((t) => t <= startElapsed).length,
    nextId: 1,
    naps: 0,
    list: [] as Creature[],
    rng: mulberry32(seed ^ 0x1e7),
    lastReport: startElapsed,
  });

  const report = () => {
    const s = sim.current;
    s.lastReport = s.elapsed;
    onProgress({ rounds: total, carriedOn: s.carried, whatifTaps: s.taps, elapsed: s.elapsed });
  };

  function addCreature(original: boolean) {
    const s = sim.current;
    if (s.list.length >= MAX_ON_SCREEN) return;
    // Try a few spots so a newcomer lands neither on another Whatif nor under its speech bubble.
    // Positions are percentages of the scene. A bubble sits above its owner and leans inward
    // from the edges, the same way it is drawn below.
    const blocked = (spot: { x: number; y: number }) =>
      s.list.some((w) => {
        if (w.state === 'asleep') return false;
        if (Math.hypot(w.x - spot.x, (w.y - spot.y) * 1.3) <= 24) return true;
        if (w.state !== 'awake') return false;
        const width = w.open ? 52 : 28;
        const left = w.x < 34 ? w.x - 9 : w.x > 66 ? w.x + 9 - width : w.x - width / 2;
        const top = w.y - (w.open ? 34 : 20);
        // The newcomer's body, and the small bubble above it, must both miss this bubble.
        return spot.x > left - 11 && spot.x < left + width + 11 && spot.y > top - 8 && spot.y < w.y + 12;
      });
    let p = spawnPoint(s.rng, level);
    for (let tries = 0; tries < 40 && blocked(p); tries++) p = spawnPoint(s.rng, level);
    s.list = [
      ...s.list,
      {
        id: s.nextId++,
        x: p.x,
        y: p.y,
        state: 'awake',
        touched: false,
        quietSince: s.elapsed,
        grown: 0,
        line: whatifLines[Math.floor(s.rng() * whatifLines.length)],
        open: false,
        original,
        nap: -1,
      },
    ];
  }

  useEffect(() => {
    if (phase !== 'play') return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const s = sim.current;
      const t = performance.now();
      s.elapsed += Math.min(1, (t - last) / 1000);
      last = t;

      while (s.spawned < total && s.elapsed >= spawnTimes[s.spawned]) {
        s.spawned++;
        addCreature(true);
      }

      let slept = false;
      s.list = s.list.map((w) => {
        if (w.state === 'asleep') return w;
        const quiet = s.elapsed - w.quietSince;
        if (quiet >= SLEEP_S) {
          if (w.original && !w.touched) {
            s.carried++;
            slept = true;
          }
          return { ...w, state: 'asleep', open: false, nap: s.naps++ % NAP_X.length };
        }
        const state = quiet >= YAWN_S ? 'yawn' : quiet >= SIT_S ? 'sitting' : 'awake';
        return state === w.state ? w : { ...w, state, open: state === 'awake' ? w.open : false };
      });

      if (slept || s.elapsed - s.lastReport >= 5) report();
      setCreatures(s.list);

      if (s.elapsed >= ROUND_S) {
        window.clearInterval(id);
        report();
        setPhase('end');
      }
    }, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Tapping a Whatif is the thing not to do: it wakes, grows, and brings a friend.
  function poke(id: number) {
    const s = sim.current;
    s.taps++;
    s.list = s.list.map((w) =>
      w.id === id
        ? { ...w, state: 'awake', touched: true, quietSince: s.elapsed, grown: Math.min(3, w.grown + 1), open: true, nap: -1 }
        : w,
    );
    addCreature(false);
    setCreatures(s.list);
    report();
  }

  function water(i: number) {
    if (i !== target) return;
    setGrowth((g) => g.map((v, k) => (k === i ? (v + 1) % 4 : v)));
    setPour((p) => p + 1);
    setTarget((t) => (t + 1) % POTS);
  }

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
        art={<WateringCan size={110} />}
      />
    );
  }
  if (phase === 'end') {
    return (
      <GameEnd
        line={c.end}
        onDone={onDone}
        art={
          <div className="flex items-end gap-1">
            <Whatif mood="asleep" size={74} />
            <Whatif mood="asleep" size={58} />
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="display pb-3 text-center text-[1.25rem]">{c.task}</p>
      <div
        ref={scene}
        className="relative w-full flex-1 overflow-hidden rounded-[28px] border-[3px] border-ink shadow-[var(--shadow-soft)]"
        style={{ minHeight: 'min(64vh, 520px)', background: 'linear-gradient(#fde9d2 0%, #fbf2de 30%, #c9dcbd 30%, #b7ceac 100%)' }}
      >
        {/* soft scenery */}
        <svg viewBox="0 0 400 500" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 152 Q100 104 200 136 T400 118 V180 H0Z" fill="#dce8d3" />
          <path d="M0 436 Q200 414 400 430 V500 H0Z" fill="#a9c59f" />
        </svg>
        <div className="pointer-events-none absolute left-[12%] top-[7%] h-[52px] w-[52px] rounded-full bg-[#f9d4ae]" aria-hidden />

        {/* the task: five pots */}
        <div className="absolute left-1/2 top-[70%] flex w-[94%] max-w-[40rem] -translate-x-1/2 -translate-y-1/2 items-end justify-between">
          {growth.map((g, i) => (
            <button
              key={i}
              type="button"
              onClick={() => water(i)}
              aria-label={fmt(c.potLabel, { n: i + 1 })}
              aria-current={i === target ? 'true' : undefined}
              className="relative flex w-[18%] flex-col items-center rounded-2xl pb-1 pt-2 outline-offset-0"
            >
              {i === target && <span className="anim-glow absolute inset-x-[-8%] bottom-[-4%] top-[18%] rounded-[40%] bg-[#fff3c9]" aria-hidden />}
              <AnimatePresence>
                {i === target && (
                  <motion.span
                    key="can"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, rotate: -32, transition: { duration: 0.35 } }}
                    transition={softSpring}
                    className="pointer-events-none absolute bottom-[86%] left-1/2 -translate-x-[30%]"
                    aria-hidden
                  >
                    <WateringCan size={Math.round(46 * unit)} />
                  </motion.span>
                )}
              </AnimatePresence>
              <Pot stage={g} type={i} splash={pour} wet={i === (target + POTS - 1) % POTS && pour > 0} />
            </button>
          ))}
        </div>

        {/* the Whatifs */}
        <AnimatePresence>
          {creatures.map((w) => {
            const asleep = w.state === 'asleep';
            const size = Math.round((asleep ? 34 : 62 * (1 + 0.3 * w.grown)) * unit);
            // Keep the whole body, and its wandering, inside the frame. Sleepers do not wander.
            const inset = size / 2 + (asleep ? 6 : 20);
            const x = asleep ? NAP_X[w.nap] : w.x;
            const mood: WhatifMood = asleep ? 'asleep' : w.state === 'awake' ? (w.grown > 0 ? 'loud' : 'alert') : w.state;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={softSpring}
                className="absolute"
                style={{
                  // Newer arrivals draw on top, so a body is never hidden behind an older bubble.
                  zIndex: asleep ? 1 : 5 + w.id,
                  left: `clamp(${inset}px, ${x}%, calc(100% - ${inset}px))`,
                  top: `${asleep ? 93.5 : w.y}%`,
                  transition: 'left 1.6s ease-in-out, top 1.6s ease-in-out',
                }}
              >
                <div className={`relative -translate-x-1/2 -translate-y-1/2 ${!asleep && level >= 3 && w.state === 'awake' ? 'anim-wander' : ''}`}>
                  {w.state === 'awake' && (
                    <motion.span
                      key={w.open ? 'open' : 'closed'}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={spring}
                      className={`bubble bubble-down pointer-events-none absolute bottom-full mb-1.5 w-max text-center ${
                        w.x < 34 ? 'left-0' : w.x > 66 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      } ${w.open ? 'max-w-[10.5rem] !text-[1rem]' : '!px-3 !py-1.5 !text-[0.92rem]'} ${level >= 4 ? '!text-[1.08rem]' : ''}`}
                      style={{
                        transformOrigin: w.x < 34 ? '20% 100%' : w.x > 66 ? '80% 100%' : '50% 100%',
                        ['--tail' as string]: w.x < 34 ? `${size / 2}px` : w.x > 66 ? `calc(100% - ${size / 2}px)` : '50%',
                      }}
                    >
                      {w.open ? w.line : copy.onboarding.demoBubble}
                    </motion.span>
                  )}
                  <button type="button" onClick={() => poke(w.id)} aria-label={c.whatifLabel} className="block rounded-full">
                    <motion.div animate={{ width: size, height: size }} transition={spring}>
                      <Whatif mood={mood} size={size} />
                    </motion.div>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Pot({ stage, type, wet, splash }: { stage: number; type: number; wet: boolean; splash: number }) {
  return (
    <svg viewBox="0 0 60 92" className="relative w-full max-w-[104px]" aria-hidden style={{ overflow: 'visible', display: 'block' }}>
      <g transform="translate(30 60)">
        <motion.g key={stage} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={spring} style={{ transformOrigin: '0px 0px' }}>
          <Plant type={type} stage={stage} />
        </motion.g>
      </g>
      {wet && (
        <motion.g key={splash} initial={{ opacity: 1, y: -6 }} animate={{ opacity: 0, y: 8 }} transition={{ duration: 0.9 }} fill="#a9cfe0" stroke={INK} strokeWidth="1.5">
          <path d="M22 44 q-3 5 0 7 q3 -2 0 -7 z" />
          <path d="M31 38 q-3 5 0 7 q3 -2 0 -7 z" />
          <path d="M39 45 q-3 5 0 7 q3 -2 0 -7 z" />
        </motion.g>
      )}
      <path d="M10 60 h40 l-5 28 h-30 z" fill="#f6cdb0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="6" y="54" width="48" height="10" rx="4" fill="#f3b995" stroke={INK} strokeWidth="3" />
    </svg>
  );
}

export function WateringCan({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 80 64" aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      <g stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M50 24 q22 -8 20 14 q-2 14 -18 12" fill="none" />
        <path d="M22 20 h34 l-3 38 h-28 z" fill="#d3c7ea" />
        <path d="M22 30 L6 14" fill="none" />
        <path d="M1 16 l8 -9 l5 5 l-8 9 z" fill="#d3c7ea" />
        <path d="M27 20 q12 -12 24 0" fill="none" />
      </g>
    </svg>
  );
}
