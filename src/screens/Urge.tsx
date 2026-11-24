import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Whatif } from '../art/Whatif';
import { ArrowIcon, SproutIcon } from '../art/Bits';
import { copy, fmt } from '../lib/content';
import { useNow } from '../lib/hooks';
import { askToNotify } from '../lib/notify';
import { formatClock } from '../lib/time';
import { DELAYS, URGE_TYPES, isBusyDay, pendingUrge, urgeCooldownUntil, useStore, useUi } from '../store';
import { MossLine, RatingSlider, Shell, Stage } from '../ui/parts';
import type { ActedOn, DelayMinutes, UrgeType } from '../types';

const c = copy.urge;
const ACTED: ActedOn[] = ['yes', 'no', 'partly'];

export function Urge() {
  const t = useNow(1000);
  const urges = useStore((s) => s.urges);
  const go = useUi((s) => s.go);
  const [logged, setLogged] = useState(false);

  const pending = pendingUrge(urges);
  const cooldown = urgeCooldownUntil(urges);

  if (logged) return <Logged onBack={() => go('home')} />;
  if (pending) {
    const left = new Date(pending.endsAt).getTime() - t;
    return left > 0 ? <Timer msLeft={left} onBack={() => go('home')} /> : <FollowUp onSaved={() => setLogged(true)} />;
  }
  if (cooldown) {
    return (
      <Stage className="items-center justify-center gap-6">
        <Whatif mood="sitting" size={120} />
        <p className="display max-w-[22rem] text-center text-[1.35rem]">{fmt(c.cooldown, { time: formatClock(cooldown) })}</p>
        <button type="button" className="btn btn-paper btn-wide max-w-[22rem]" onClick={() => go('home')}>
          {copy.app.back}
        </button>
      </Stage>
    );
  }
  return <Setup onBack={() => go('home')} />;
}

function Setup({ onBack }: { onBack: () => void }) {
  const lastDelay = useStore((s) => s.lastDelay);
  const startUrge = useStore((s) => s.startUrge);
  const markBusyShown = useStore((s) => s.markBusyShown);
  const [busy] = useState(() => isBusyDay(useStore.getState().urgeOpens));
  const [novice] = useState(() => useStore.getState().urges.filter((u) => u.ratingAfter !== undefined).length < 1);
  const [rating, setRating] = useState<number | null>(null);
  const [type, setType] = useState<UrgeType | undefined>();
  const [delay, setDelay] = useState<DelayMinutes>(lastDelay);

  // Moss says the busy-day line once per day.
  useEffect(() => {
    if (busy) markBusyShown();
  }, [busy, markBusyShown]);

  return (
    <Shell title={c.title} onBack={onBack} wide>
      <div className="grid gap-5 md:grid-cols-2 md:items-start md:gap-7">
        <div className="flex flex-col gap-5">
        {busy && <MossLine line={copy.moss.busyDay} size={64} />}

        <section className="panel px-4 py-4">
          <p className="text-[1.05rem] leading-snug">{c.intro}</p>
          <details className="group mt-2" open={novice}>
            <summary className="link-btn !min-h-[40px] cursor-pointer list-none !px-0 text-[0.98rem] [&::-webkit-details-marker]:hidden">
              {c.stepsTitle}
              <span className="transition-transform duration-300 group-open:rotate-180" aria-hidden>
                <ArrowIcon dir="down" size={16} />
              </span>
            </summary>
          <ol className="mt-1 flex flex-col gap-2" aria-label={c.stepsTitle}>
            {c.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-[1rem] leading-snug">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-[2.5px] border-ink bg-lav font-display text-[0.92rem] font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 font-display text-[1.02rem] font-bold text-ink-soft">{c.why}</p>
          </details>
        </section>
        <div className="hidden justify-center pt-2 md:flex" aria-hidden>
          <Whatif mood="alert" size={132} />
        </div>
        </div>

        <div className="flex flex-col gap-5">
        <section className="card px-5 py-5">
          <h2 className="mb-2 text-center text-[1.3rem]">{c.rateBefore}</h2>
          <RatingSlider value={rating} onChange={setRating} label={c.ratingLabel} low={c.scaleLow} high={c.scaleHigh} />
          {rating === null && <p className="mt-1 text-center text-[0.92rem] text-ink-soft">{c.rateHint}</p>}
        </section>

        <section>
          <h2 className="mb-2.5 flex items-baseline gap-2 text-[1.15rem]">
            {c.typeTitle}
            <span className="font-body text-[0.9rem] font-semibold text-ink-soft">{c.optional}</span>
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label={c.typeTitle}>
            {URGE_TYPES.map((u) => (
              <button key={u} type="button" className="chip" aria-pressed={type === u} onClick={() => setType(type === u ? undefined : u)}>
                {c.types[u]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2.5 text-[1.15rem]">{c.delayTitle}</h2>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={c.delayTitle}>
            {DELAYS.map((d) => (
              <button key={d} type="button" role="radio" className="chip !px-1 font-display" aria-checked={delay === d} onClick={() => setDelay(d)}>
                {fmt(c.minutes, { n: d })}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="btn btn-wide mt-1"
          disabled={rating === null}
          onClick={() => {
            if (rating === null) return;
            void askToNotify();
            startUrge({ ratingBefore: rating, urgeType: type, delayMinutes: delay });
          }}
        >
          {c.start}
        </button>
        </div>
      </div>
    </Shell>
  );
}

/** The wait. Nothing to do here on purpose: the player is meant to leave. */
function Timer({ msLeft, onBack }: { msLeft: number; onBack: () => void }) {
  const total = Math.ceil(msLeft / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-7 overflow-y-auto bg-dusk px-6 py-8 text-cream"
    >
      <div className="flex h-[176px] w-[176px] items-center justify-center rounded-full bg-[#55655c]">
        <Whatif mood="sitting" size={124} label={copy.games.letItSit.whatifLabel} />
      </div>
      <p className="display max-w-[20rem] text-center text-[1.45rem]">{copy.moss.urgeStay}</p>
      <div className="text-center" role="timer" aria-label={c.remaining}>
        <p className="font-display text-[0.95rem] font-bold uppercase tracking-[0.1em] text-cream/75">{c.remaining}</p>
        <p className="font-display text-[4.2rem] font-bold leading-none tabular-nums">
          {mm}:{ss}
        </p>
      </div>
      <p className="max-w-[20rem] text-center text-cream/85">{c.leave}</p>
      <button type="button" className="link-btn !text-cream !decoration-cream/50" onClick={onBack}>
        {copy.app.back}
      </button>
    </motion.main>
  );
}

function FollowUp({ onSaved }: { onSaved: () => void }) {
  const completeUrge = useStore((s) => s.completeUrge);
  const [rating, setRating] = useState<number | null>(null);
  const [acted, setActed] = useState<ActedOn | null>(null);
  return (
    <Stage className="justify-center">
      <h1 className="mb-5 text-[1.75rem]">{c.timerDone}</h1>
      <div className="flex flex-col gap-5">
        <section className="card px-5 py-5">
          <h2 className="mb-2 text-center text-[1.3rem]">{c.rateAfter}</h2>
          <RatingSlider value={rating} onChange={setRating} label={c.ratingLabel} low={c.scaleLow} high={c.scaleHigh} />
          {rating === null && <p className="mt-1 text-center text-[0.92rem] text-ink-soft">{c.rateHint}</p>}
        </section>
        <section>
          <h2 className="text-[1.15rem]">{c.actedTitle}</h2>
          <p className="mb-2.5 text-[0.95rem] text-ink-soft">{c.actedHint}</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={c.actedTitle}>
            {ACTED.map((a) => (
              <button key={a} type="button" role="radio" className="chip font-display !text-[1.1rem]" aria-checked={acted === a} onClick={() => setActed(a)}>
                {c.acted[a]}
              </button>
            ))}
          </div>
        </section>
        <button
          type="button"
          className="btn btn-wide mt-1"
          disabled={!acted || rating === null}
          onClick={() => {
            if (!acted || rating === null) return;
            completeUrge(rating, acted);
            onSaved();
          }}
        >
          {c.save}
        </button>
      </div>
    </Stage>
  );
}

/** The same plain response whatever was answered. */
function Logged({ onBack }: { onBack: () => void }) {
  return (
    <Stage className="items-center justify-center gap-7">
      <MossLine line={copy.moss.urgeNeutral} size={96} />
      <p className="flex items-center gap-2 font-display font-bold text-ink-soft">
        <SproutIcon size={24} /> 1 {copy.app.sproutOne}
      </p>
      <button type="button" className="btn btn-wide max-w-[22rem]" onClick={onBack}>
        {copy.app.back}
      </button>
    </Stage>
  );
}
