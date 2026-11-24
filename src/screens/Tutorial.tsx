import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { copy, fmt, gameName } from '../lib/content';
import { Stage, softSpring, spring } from '../ui/parts';
import { Whatif, type WhatifMood } from '../art/Whatif';
import { Moss } from '../art/Moss';
import { ArrowIcon, BoxArt, LeafShape, SproutIcon } from '../art/Bits';
import { CardBack } from '../games/OneRead';
import { Cart } from '../games/SealedBox';
import { Basket } from '../games/ThoughtSorter';
import { Pot, WateringCan } from '../games/LetItSit';
import type { GameId } from '../types';

const t = copy.tutorial;
const loop = (duration: number, repeatDelay = 0.6) => ({ duration, repeat: Infinity, repeatDelay, ease: 'easeInOut' as const });

/** Steps through a number on a timer, for small looping demonstrations. */
function useCycle(length: number, ms: number): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms]);
  return i;
}

/** A soft ring that shows where a tap goes. */
function TapRing({ className = '' }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute ${className}`} aria-hidden>
      <motion.span
        className="block h-12 w-12 rounded-full border-[3px] border-ink/50 bg-paper/40"
        animate={{ scale: [0.5, 1.15, 1.15], opacity: [0, 0.9, 0] }}
        transition={loop(1.5, 0.5)}
      />
    </span>
  );
}

function MiniLeaf({ text }: { text: string }) {
  return (
    <div className="relative flex aspect-[34/24] w-[64%] max-w-[15rem] items-center justify-center">
      <LeafShape className="absolute inset-0 h-full w-full" />
      <p className="display relative max-w-[66%] text-center text-[0.8rem] sm:text-[0.9rem]" style={{ fontWeight: 600, lineHeight: 1.2, transform: 'rotate(-5deg)' }}>
        {text}
      </p>
    </div>
  );
}

function MockButton({ children, paper }: { children: ReactNode; paper?: boolean }) {
  return (
    <span className={`btn btn-sm ${paper ? 'btn-paper' : ''} pointer-events-none`} aria-hidden>
      {children}
    </span>
  );
}

function OneReadArt({ step }: { step: number }) {
  const sample = t.oneRead.sample;
  const front = (
    <div className="card flex h-[62%] w-[80%] max-w-[19rem] items-center justify-center px-5">
      <p className="display text-center text-[1.15rem] sm:text-[1.3rem]" style={{ fontWeight: 600, lineHeight: 1.3 }}>
        {sample}
      </p>
    </div>
  );
  if (step === 0) return front;
  if (step === 1) {
    return (
      <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: 900 }}>
        <motion.div
          className="absolute flex h-full w-full items-center justify-center"
          animate={{ rotateY: [0, 0, 90, 90], opacity: [1, 1, 0, 0] }}
          transition={{ ...loop(3.6, 0.8), times: [0, 0.38, 0.5, 1] }}
        >
          {front}
        </motion.div>
        <motion.div
          className="absolute"
          animate={{ rotateY: [-90, -90, 0, 0], opacity: [0, 0, 1, 1] }}
          transition={{ ...loop(3.6, 0.8), times: [0, 0.5, 0.62, 1] }}
        >
          <CardBack small />
        </motion.div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-5">
      <CardBack small />
      <div className="relative">
        <MockButton>
          {copy.games.oneRead.next}
          <SproutIcon size={20} />
        </MockButton>
        <TapRing className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <motion.span className="absolute -right-9 top-0" animate={{ y: [8, -22], opacity: [0, 1, 0] }} transition={loop(1.5, 0.5)} aria-hidden>
          <SproutIcon size={26} />
        </motion.span>
      </div>
    </div>
  );
}

function SealedBoxArt({ step }: { step: number }) {
  const sample = t.sealedBox.sample;
  if (step === 0) {
    return (
      <div className="flex w-full items-center justify-center gap-4 px-4">
        <div className="card px-4 py-3" style={{ transform: 'rotate(-2deg)' }}>
          <ul className="flex flex-col gap-1.5">
            {sample.map((item) => (
              <li key={item} className="flex items-center gap-2 font-display text-[1.05rem] font-semibold">
                <span className="h-2.5 w-2.5 flex-none rounded-full border-2 border-ink bg-peach" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          {sample.map((item, i) => (
            <motion.span
              key={item}
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 font-display text-[0.85rem] font-semibold"
              animate={{ y: [-46, 18], opacity: [0, 1, 1, 0], scale: [1, 1, 0.6] }}
              transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 2.3, delay: i * 1.2, ease: 'easeIn' }}
              aria-hidden
            >
              {item}
            </motion.span>
          ))}
          <BoxArt open size={104} />
        </div>
      </div>
    );
  }
  const walkers = (
    <motion.div className="flex items-end" animate={{ x: [-26, 26] }} transition={{ duration: 3.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}>
      <div className="relative mr-1">
        <span className="bubble bubble-down absolute bottom-full left-0 mb-2 w-max max-w-[7.5rem] !text-[0.85rem]" style={{ ['--tail' as string]: '26px' }}>
          {copy.games.sealedBox.whatifs[0]}
        </span>
        <Whatif mood="alert" size={52} />
      </div>
      <div className="anim-bob">
        <Cart />
      </div>
    </motion.div>
  );
  if (step === 1) return <div className="mt-12">{walkers}</div>;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="mt-10">{walkers}</div>
      <div className="flex items-center gap-2.5">
        <MockButton paper>{copy.games.sealedBox.peek}</MockButton>
        <span className="flex items-center gap-1 font-display text-[0.98rem] font-bold italic text-ink-soft" style={{ transform: 'rotate(-3deg)' }}>
          <ArrowIcon dir="left" size={18} />
          {t.leaveIt}
        </span>
      </div>
    </div>
  );
}

function SorterArt({ step }: { step: number }) {
  if (step === 0) {
    return (
      <motion.div className="flex w-full justify-center" animate={{ rotate: [-2, 2] }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}>
        <MiniLeaf text={t.thoughtSorter.sampleKeep} />
      </motion.div>
    );
  }
  if (step === 1) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-between py-4">
        <motion.div
          className="flex w-full justify-center"
          animate={{ y: [0, 0, 78], scale: [1, 1, 0.3], opacity: [1, 1, 0] }}
          transition={{ ...loop(2.8, 0.7), times: [0, 0.4, 1] }}
        >
          <MiniLeaf text={t.thoughtSorter.sampleKeep} />
        </motion.div>
        <div className="flex items-center gap-2 font-display font-bold">
          <ArrowIcon dir="down" />
          {copy.games.thoughtSorter.keep}
          <Basket />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-4">
      <div className="flex items-center gap-2 font-display font-bold">
        <ArrowIcon dir="up" />
        {copy.games.thoughtSorter.letGo}
      </div>
      <motion.div
        className="flex w-full justify-center"
        animate={{ y: [0, 0, -96], x: [0, 0, 56], rotate: [0, 0, 26], opacity: [1, 1, 0] }}
        transition={{ ...loop(3, 0.7), times: [0, 0.4, 1] }}
      >
        <MiniLeaf text={t.thoughtSorter.sampleLetGo} />
      </motion.div>
    </div>
  );
}

/** The pots stay in view in every Let It Sit demo: the task carries on whatever the Whatif does. */
function MiniPots() {
  return (
    <div className="flex w-[40%] max-w-[9rem] items-end justify-between">
      {[2, 1].map((stage, i) => (
        <div key={i} className="w-[44%]">
          <Pot stage={stage} type={i + 1} wet={false} splash={0} />
        </div>
      ))}
    </div>
  );
}

function LetItSitArt({ step }: { step: number }) {
  const phase = useCycle(4, 1400);
  if (step === 0) {
    return (
      <div className="flex w-[78%] max-w-[17rem] items-end justify-between pt-10">
        {[1, 0, 2].map((stage, i) => (
          <div key={i} className="relative flex w-[26%] flex-col items-center">
            {i === 1 && (
              <>
                <span className="anim-glow absolute inset-x-[-18%] bottom-[-6%] top-[30%] rounded-[40%] bg-[#fff3c9]" aria-hidden />
                <motion.span className="absolute -top-[30px] left-1/2 -translate-x-[25%]" animate={{ rotate: [0, -30, 0] }} transition={loop(1.6, 0.5)} aria-hidden>
                  <WateringCan size={44} />
                </motion.span>
                <TapRing className="bottom-0 left-1/2 -translate-x-1/2" />
              </>
            )}
            <Pot stage={stage} type={i + 1} wet={false} splash={0} />
          </div>
        ))}
      </div>
    );
  }
  if (step === 1) {
    // One beat of tapping, then three beats of the result: bigger, louder, and not alone.
    const grown = phase > 0;
    return (
      <div className="flex w-full items-end justify-center gap-4 px-4 pt-8">
        <div className="relative flex items-end gap-1">
          <div className="relative">
            <motion.div animate={{ scale: grown ? 1.35 : 1 }} transition={softSpring} style={{ transformOrigin: '50% 100%' }}>
              <Whatif mood={grown ? 'loud' : 'alert'} size={70} />
            </motion.div>
            {!grown && <TapRing className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
          </div>
          <motion.div animate={{ scale: grown ? 1 : 0, opacity: grown ? 1 : 0 }} transition={{ ...spring, delay: grown ? 0.25 : 0 }} style={{ transformOrigin: '50% 100%' }}>
            <Whatif mood="alert" size={52} />
          </motion.div>
        </div>
        <MiniPots />
      </div>
    );
  }
  const moods: WhatifMood[] = ['sitting', 'yawn', 'asleep', 'asleep'];
  return (
    <div className="flex w-full items-end justify-center gap-5 px-4 pt-8">
      <Whatif mood={moods[phase]} size={96} />
      <MiniPots />
    </div>
  );
}

function Art({ game, step }: { game: GameId; step: number }) {
  if (step >= 3) {
    return (
      <div className="flex items-end gap-3">
        <Moss size={132} />
        <Whatif mood="sitting" size={70} />
      </div>
    );
  }
  if (game === 'oneRead') return <OneReadArt step={step} />;
  if (game === 'sealedBox') return <SealedBoxArt step={step} />;
  if (game === 'thoughtSorter') return <SorterArt step={step} />;
  return <LetItSitArt step={step} />;
}

/** Three short demonstrations and one line on why. Nothing here is scored. */
export function Tutorial({ game, onDone }: { game: GameId; onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const c = t[game];
  const last = slide === 3;

  return (
    <Stage>
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-[0.9rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{t.title}</p>
          <h1 className="text-[1.6rem]">{gameName(game)}</h1>
        </div>
        {!last && (
          <button type="button" className="link-btn" onClick={onDone}>
            {t.skip}
          </button>
        )}
      </header>

      <div
        className="relative w-full overflow-hidden rounded-[28px] border-[3px] border-ink shadow-[var(--shadow-soft)]"
        style={{ aspectRatio: '4 / 3', maxHeight: 'min(38vh, 290px)', background: 'linear-gradient(#fde9d2 0%, #fbf2de 66%, #c9dcbd 66%, #b7ceac 100%)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -26 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Art game={game} step={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex min-h-[8.5rem] flex-1 flex-col items-center justify-center gap-2 px-1 py-3 text-center" aria-live="polite">
        <p className="font-display text-[0.9rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
          {last ? t.whyLabel : fmt(t.step, { n: slide + 1, total: 3 })}
        </p>
        <p className="display max-w-[26rem] text-[1.35rem] sm:text-[1.5rem]" style={{ lineHeight: 1.25 }}>
          {last ? c.why : c.steps[slide]}
        </p>
        {last && <p className="max-w-[24rem] text-ink-soft">{c.note}</p>}
      </div>

      <div className="mb-4 flex justify-center gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 rounded-full border-2 border-ink transition-all duration-500 ${i === slide ? 'w-6 bg-peach' : 'w-2.5 bg-paper'}`} />
        ))}
      </div>

      <div className="flex gap-3">
        {slide > 0 && (
          <button type="button" className="btn btn-paper" onClick={() => setSlide(slide - 1)}>
            {t.back}
          </button>
        )}
        <button type="button" className="btn flex-1" onClick={() => (last ? onDone() : setSlide(slide + 1))}>
          {last ? t.done : t.next}
        </button>
      </div>
    </Stage>
  );
}
