import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { copy, sentences, type Sentence } from '../lib/content';
import { mulberry32, pick, shuffle, take } from '../lib/rng';
import { GameEnd, GameIntro, RoundDots, softSpring, spring } from '../ui/parts';
import { Whatif } from '../art/Whatif';
import { SproutIcon } from '../art/Bits';
import type { GameProps } from '../types';

const ROUNDS = 8;
const SHOW_MS = [6000, 5000, 4000, 3000, 2000];
const c = copy.games.oneRead;

interface Plan {
  cards: Sentence[];
  /** For each round: index of the earlier card to ask about, or null. */
  asks: (number | null)[];
  /** Whether the result of that question is shown. Half are not. */
  feedback: boolean[];
}

function buildPlan(level: number, seed: number): Plan {
  const rng = mulberry32(seed ^ 0x51ed);
  const main = sentences.filter((s) => s.level === level);
  const lower = level > 1 ? sentences.filter((s) => s.level === level - 1) : [];
  const withQ = shuffle(main.filter((s) => s.question), rng);
  const noQ = shuffle(main.filter((s) => !s.question), rng);
  const cards = shuffle(
    [...withQ.slice(0, 5), ...noQ.slice(0, lower.length ? 1 : 3), ...take(lower, lower.length ? 2 : 0, rng)],
    rng,
  );

  const asks: (number | null)[] = Array(ROUNDS).fill(null);
  const feedback: boolean[] = Array(ROUNDS).fill(false);
  const askRounds = take([1, 2, 3, 4, 5, 6, 7], 3, rng).sort((a, b) => a - b);
  const asked = new Set<number>();
  let show = rng() < 0.5;
  for (const r of askRounds) {
    const pool = cards.map((_, i) => i).filter((i) => i < r && cards[i].question && !asked.has(i));
    if (pool.length === 0) continue;
    const idx = pick(pool, rng);
    asked.add(idx);
    asks[r] = idx;
    feedback[r] = show;
    show = !show;
  }
  return { cards, asks, feedback };
}

type Phase = 'intro' | 'showing' | 'gone' | 'question' | 'answered' | 'end';

export function OneRead({ level, seed, startRound, resumed, onBegin, onHelp, onProgress, onDone }: GameProps) {
  const plan = useMemo(() => buildPlan(level, seed), [level, seed]);
  const [round, setRound] = useState(startRound);
  const [phase, setPhase] = useState<Phase>(resumed ? (startRound >= ROUNDS ? 'end' : 'showing') : 'intro');
  const [choice, setChoice] = useState<number | null>(null);

  const card = plan.cards[Math.min(round, ROUNDS - 1)];
  const askIdx = plan.asks[round] ?? null;
  const asked = askIdx !== null ? plan.cards[askIdx] : null;
  const options = useMemo(() => {
    if (!asked?.options) return [];
    return shuffle(
      asked.options.map((text, i) => ({ text, right: i === 0 })),
      mulberry32(seed + round * 97),
    );
  }, [asked, seed, round]);

  // The card stays for a fixed time, then it is gone for good.
  useEffect(() => {
    if (phase !== 'showing') return;
    const id = window.setTimeout(() => setPhase('gone'), SHOW_MS[level - 1]);
    return () => window.clearTimeout(id);
  }, [phase, round, level]);

  function advance() {
    setChoice(null);
    if (round + 1 >= ROUNDS) setPhase('end');
    else {
      setRound(round + 1);
      setPhase('showing');
    }
  }

  function next() {
    onProgress({ rounds: round + 1, carriedOn: round + 1 });
    if (asked) setPhase('question');
    else advance();
  }

  if (phase === 'intro') {
    return (
      <GameIntro
        line={c.intro}
        button={c.ready}
        onHelp={onHelp}
        onStart={() => {
          onBegin();
          setPhase('showing');
        }}
        art={<CardBack small />}
      />
    );
  }
  if (phase === 'end') return <GameEnd line={c.practice} onDone={onDone} art={<CardBack small />} />;

  const words = card.text.split(' ').length;
  const size = words > 22 ? 'text-[1.28rem] sm:text-[1.5rem]' : words > 14 ? 'text-[1.45rem] sm:text-[1.7rem]' : 'text-[1.7rem] sm:text-[2rem]';
  const showWhatif = level >= 4 && phase === 'gone';

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center pb-4">
        <RoundDots total={ROUNDS} done={phase === 'showing' ? round : round + 1} />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait">
          {phase === 'showing' && (
            <motion.div
              key={`front-${round}`}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.3, 0.7, 0.3, 1] }}
              className="card no-select flex min-h-[250px] w-full max-w-[30rem] items-center justify-center px-6 py-8 sm:min-h-[280px] sm:px-9"
            >
              <p className={`display text-center ${size}`} style={{ fontWeight: 600, lineHeight: 1.3 }}>
                {card.text}
              </p>
            </motion.div>
          )}

          {phase === 'gone' && (
            <motion.div
              key={`back-${round}`}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.3, 0.7, 0.3, 1] }}
              className="flex w-full flex-col items-center gap-5"
            >
              <CardBack />
              <p className="display text-[1.3rem]" aria-live="polite">
                {c.gone}
              </p>
            </motion.div>
          )}

          {(phase === 'question' || phase === 'answered') && asked && (
            <motion.div
              key={`q-${round}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={softSpring}
              className="card w-full max-w-[30rem] px-5 py-6 sm:px-7"
            >
              <p className="mb-1 font-display text-[0.95rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{c.questionLead}</p>
              <h2 className="mb-5 text-[1.4rem]">{asked.question}</h2>
              <div className="flex flex-col gap-3" role="group" aria-label={asked.question}>
                {options.map((o, i) => (
                  <button
                    key={o.text}
                    type="button"
                    className="chip w-full !justify-start !rounded-2xl !px-5 text-left"
                    aria-pressed={choice === i}
                    disabled={phase === 'answered'}
                    onClick={() => {
                      setChoice(i);
                      setPhase('answered');
                    }}
                  >
                    {o.text}
                  </button>
                ))}
              </div>
              <p className="mt-5 min-h-[1.6rem] text-center font-display text-[1.15rem] font-bold" aria-live="polite">
                {phase === 'answered' && choice !== null
                  ? plan.feedback[round]
                    ? options[choice].right
                      ? c.match
                      : c.noMatch
                    : c.saved
                  : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWhatif && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.6 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ ...spring, delay: 0.5 }}
              className="pointer-events-none absolute -right-1 bottom-0 flex flex-col items-end sm:right-2"
            >
              <span className="bubble bubble-down mb-2 mr-1 max-w-[11rem] text-center">{c.whatif}</span>
              <Whatif mood={level >= 5 ? 'loud' : 'alert'} size={level >= 5 ? 86 : 72} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex min-h-[92px] items-end justify-center pt-5">
        {phase === 'gone' && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softSpring, delay: 0.35 }}
            type="button"
            className="btn btn-wide max-w-[22rem]"
            onClick={next}
          >
            {c.next}
            <SproutIcon size={22} />
          </motion.button>
        )}
        {phase === 'answered' && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={softSpring}
            type="button"
            className="btn btn-wide max-w-[22rem]"
            onClick={advance}
          >
            {c.next}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export function CardBack({ small }: { small?: boolean }) {
  const w = small ? 150 : 230;
  return (
    <svg width={w} height={w * 0.72} viewBox="0 0 230 166" aria-hidden style={{ display: 'block' }}>
      <rect x="3" y="3" width="224" height="160" rx="24" fill="#b7ceac" stroke="#3b4a3f" strokeWidth="4" />
      <rect x="16" y="16" width="198" height="134" rx="15" fill="none" stroke="#fffdf7" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <g transform="translate(115 86)" stroke="#3b4a3f" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M0 30 V-4" fill="none" />
        <path d="M0 4 Q-30 2 -34 -28 Q-4 -26 0 4 Z" fill="#dce8d3" />
        <path d="M0 -4 Q28 -8 32 -36 Q4 -32 0 -4 Z" fill="#fffdf7" />
      </g>
    </svg>
  );
}
