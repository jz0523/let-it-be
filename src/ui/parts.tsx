import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Moss } from '../art/Moss';
import { ArrowIcon, SproutIcon } from '../art/Bits';
import { copy, fmt } from '../lib/content';

export const spring = { type: 'spring', stiffness: 170, damping: 20, mass: 1 } as const;
export const softSpring = { type: 'spring', stiffness: 110, damping: 18, mass: 1 } as const;

/**
 * Frame for games and other one-thing-at-a-time screens. On a phone it fills the screen.
 * On a wide screen it becomes a board in the middle, so buttons stay near their content.
 */
export function Stage({ children, wide, className = '' }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className="flex min-h-dvh w-full justify-center md:items-center md:py-8">
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={softSpring}
        className={`flex min-h-dvh w-full ${wide ? 'max-w-[880px]' : 'max-w-[620px]'} flex-col px-4 pb-6 pt-4 sm:px-6 sm:pt-6 md:min-h-[min(700px,calc(100dvh-4rem))] md:rounded-[36px] md:border-2 md:border-ink/15 md:bg-paper/60 md:px-9 md:py-8 md:shadow-[0_30px_60px_-34px_rgb(59_74_63/0.4)] ${className}`}
      >
        {children}
      </motion.main>
    </div>
  );
}

/** Page frame for the non-game screens. */
export function Shell({
  title,
  onBack,
  children,
  wide,
}: {
  title: string;
  onBack?: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className={`mx-auto w-full ${wide ? 'max-w-[880px]' : 'max-w-[580px]'} px-4 pb-12 pt-4 sm:px-6 sm:pt-8`}
    >
      <header className="mb-5 flex items-center gap-3">
        {onBack && (
          <button type="button" className="btn btn-paper btn-sm !min-h-[48px] !w-[48px] flex-none !px-0" onClick={onBack} aria-label={copy.app.back}>
            <ArrowIcon />
          </button>
        )}
        <h1 className="text-[1.75rem] sm:text-[2rem]">{title}</h1>
      </header>
      {children}
    </motion.main>
  );
}

/** Moss with a single line in a speech bubble. */
export function MossLine({ line, size = 76, dusk }: { line: string; size?: number; dusk?: boolean }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-none">
        <Moss size={size} />
      </div>
      <motion.p
        key={line}
        initial={{ opacity: 0, scale: 0.9, x: -8 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={spring}
        className={`bubble bubble-left mb-3 max-w-[22rem] !text-[1.08rem] ${dusk ? '!border-cream' : ''}`}
        style={{ transformOrigin: '0% 80%' }}
      >
        {line}
      </motion.p>
    </div>
  );
}

export function SproutCount({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-paper py-1 pl-2 pr-3.5 font-display text-[1.05rem] font-bold leading-none ${className ?? ''}`}
      aria-label={fmt(copy.home.sproutCount, { n })}
    >
      <SproutIcon size={24} />
      <span aria-hidden>{n}</span>
    </span>
  );
}

/** Small row of dots: which round the player is on. Never shows a score. */
export function RoundDots({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 rounded-full border-2 border-ink transition-all duration-500 ${
            i < done ? 'w-2.5 bg-sage-deep' : i === done ? 'w-5 bg-peach' : 'w-2.5 bg-paper'
          }`}
        />
      ))}
    </div>
  );
}

/** 0 to 10 rating with a large number and plain labels. No colour coding. */
export function RatingSlider({
  value,
  onChange,
  label,
  dusk,
  low,
  high,
}: {
  /** null until the player has set it, so an untouched default is never logged. */
  value: number | null;
  onChange: (v: number) => void;
  label: string;
  dusk?: boolean;
  /** Plain words for the two ends of the scale. */
  low?: string;
  high?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-end justify-center">
        <span className={`font-display text-[3.4rem] font-bold leading-none tabular-nums ${value === null ? 'opacity-35' : ''}`}>{value ?? '–'}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 5}
        aria-label={label}
        aria-valuetext={value === null ? copy.urge.rateHint : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        onClick={(e) => onChange(Number(e.currentTarget.value))}
        onKeyUp={(e) => onChange(Number(e.currentTarget.value))}
        className={`slider ${dusk ? 'slider-dusk' : ''} ${value === null ? 'slider-unset' : ''}`}
        style={{ ['--fill' as string]: `${value === null ? 0 : value * 10}%` }}
      />
      <div className={`flex justify-between px-1 font-display text-sm font-bold ${dusk ? 'text-cream/80' : 'text-ink-soft'}`} aria-hidden>
        <span>0{low ? ` · ${low}` : ''}</span>
        {!low && <span>5</span>}
        <span>{high ? `${high} · ` : ''}10</span>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)} />
  );
}

/** The opening card every mini-game shows before its first round. */
export function GameIntro({
  line,
  button,
  onStart,
  onHelp,
  art,
}: {
  line: string;
  button: string;
  onStart: () => void;
  onHelp?: () => void;
  art?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className="flex flex-1 flex-col items-center justify-center gap-7 py-6"
    >
      {art}
      <MossLine line={line} />
      <div className="flex w-full flex-col items-center gap-2">
        <button type="button" className="btn btn-wide max-w-[22rem]" onClick={onStart}>
          {button}
        </button>
        {onHelp && (
          <button type="button" className="link-btn" onClick={onHelp}>
            {copy.tutorial.link}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** The closing card of a mini-game: one plain line, then on. */
export function GameEnd({ line, onDone, art }: { line: string; onDone: () => void; art?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className="flex flex-1 flex-col items-center justify-center gap-7 py-6"
    >
      {art}
      <MossLine line={line} />
      <button type="button" className="btn btn-wide max-w-[22rem]" onClick={onDone}>
        {copy.app.continue}
      </button>
    </motion.div>
  );
}
