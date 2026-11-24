import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Whatif, type WhatifMood } from '../art/Whatif';
import { Moss } from '../art/Moss';
import { copy, fmt } from '../lib/content';
import { askToNotify } from '../lib/notify';
import { useStore } from '../store';
import { MossLine, Stage, Toggle, softSpring, spring } from '../ui/parts';
import { CheckinForm } from './Checkin';
import { IdeaSteps } from './Guide';

const c = copy.onboarding;
const STEPS = 5;

export function Onboarding() {
  const step = useStore((s) => s.onboardingStep);
  const setStep = useStore((s) => s.setOnboardingStep);
  const next = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  return (
    <Stage>
      <header className="mb-4 flex items-center justify-between">
        <p className="font-display text-[1.35rem] font-bold">{copy.app.title}</p>
        <div className="flex items-center gap-1.5" role="img" aria-label={fmt(c.step, { n: step + 1, total: STEPS })}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`h-2.5 rounded-full border-2 border-ink transition-all duration-500 ${i === step ? 'w-6 bg-peach' : i < step ? 'w-2.5 bg-sage-deep' : 'w-2.5 bg-paper'}`} />
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={softSpring}
          className="flex flex-1 flex-col"
        >
          {step === 0 && <Notice onNext={next} />}
          {step === 1 && <Demo onNext={next} />}
          {step === 2 && <Idea onNext={next} />}
          {step === 3 && <PracticeTime onNext={next} />}
          {step >= 4 && <Baseline />}
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}

function Notice({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="flex justify-center gap-2">
        <Moss size={130} />
        <div className="self-end">
          <Whatif mood="alert" size={84} />
        </div>
      </div>
      <div className="card px-5 py-6 sm:px-7">
        <h1 className="mb-3 text-[1.7rem]">{c.noticeTitle}</h1>
        <p className="text-[1.08rem] leading-relaxed">{c.notice}</p>
      </div>
      <button type="button" className="btn btn-wide" onClick={onNext}>
        {c.noticeButton}
      </button>
    </div>
  );
}

/** Tap it and it grows. Leave it and it sleeps. */
function Demo({ onNext }: { onNext: () => void }) {
  const [taps, setTaps] = useState(0);
  const [quiet, setQuiet] = useState(0);
  const lastTap = useRef(0);

  useEffect(() => {
    if (taps === 0) return;
    lastTap.current = performance.now();
    setQuiet(0);
    const id = window.setInterval(() => setQuiet((performance.now() - lastTap.current) / 1000), 250);
    return () => window.clearInterval(id);
  }, [taps]);

  const asleep = taps > 0 && quiet >= 7;
  const mood: WhatifMood = taps === 0 ? 'alert' : quiet < 2.5 ? 'loud' : quiet < 4.5 ? 'sitting' : quiet < 7 ? 'yawn' : 'asleep';
  const scale = asleep ? 0.8 : 1 + Math.min(taps, 4) * 0.22;
  const line =
    taps === 0 ? c.demoIntro : asleep ? c.demoAsleep : quiet >= 2.5 ? c.demoWaiting : taps === 1 ? c.demoGrew : c.demoGrewMore;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-[1.7rem]">{c.demoTitle}</h1>
      <div className="relative flex min-h-[330px] flex-1 items-center justify-center overflow-hidden rounded-[28px] border-[3px] border-ink bg-[linear-gradient(#fde9d2_0%,#fbf2de_62%,#b7ceac_62%)] shadow-[var(--shadow-soft)]">
        <button
          type="button"
          onClick={() => !asleep && setTaps((n) => n + 1)}
          aria-label={copy.games.letItSit.whatifLabel}
          className="relative mt-16 rounded-full"
          disabled={asleep}
        >
          <AnimatePresence>
            {(mood === 'alert' || mood === 'loud') && (
              <motion.span
                key={mood}
                initial={{ opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: mood === 'loud' ? 1.15 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={spring}
                className="bubble bubble-down pointer-events-none absolute bottom-full left-1/2 z-10 w-max -translate-x-1/2 !text-[1.15rem]"
                style={{ transformOrigin: '50% 100%', marginBottom: 14 + (scale - 1) * 130, transition: 'margin-bottom 500ms ease' }}
              >
                {mood === 'loud' ? c.demoBubbleLoud : c.demoBubble}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div animate={{ scale }} transition={softSpring} style={{ transformOrigin: '50% 100%' }}>
            <Whatif mood={mood} size={130} />
          </motion.div>
        </button>
      </div>
      <MossLine line={line} />
      <div className="min-h-[88px]">
        {asleep && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={softSpring} className="flex flex-col gap-2">
            <p className="text-center text-ink-soft">{c.demoNote}</p>
            <button type="button" className="btn btn-wide" onClick={onNext}>
              {copy.app.continue}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Idea({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <h1 className="text-[1.7rem]">{copy.guide.onboardTitle}</h1>
      <IdeaSteps compact />
      <p className="text-center text-[0.95rem] text-ink-soft">{copy.guide.onboardNote}</p>
      <button type="button" className="btn btn-wide" onClick={onNext}>
        {copy.app.continue}
      </button>
    </div>
  );
}

function PracticeTime({ onNext }: { onNext: () => void }) {
  const practiceTime = useStore((s) => s.profile.practiceTime);
  const reminder = useStore((s) => s.settings.reminder);
  const { setPracticeTime, setReminder } = useStore.getState();
  const [denied, setDenied] = useState(false);
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="flex justify-center">
        <Moss size={130} />
      </div>
      <div className="card px-5 py-6 sm:px-7">
        <h1 className="mb-2 text-[1.7rem]">{c.timeTitle}</h1>
        <p className="mb-5 text-ink-soft">{c.timeBody}</p>
        <label className="flex flex-col items-start gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-4">
          <span className="font-display text-[1.1rem] font-bold">{c.timeLabel}</span>
          <input type="time" value={practiceTime} onChange={(e) => e.target.value && setPracticeTime(e.target.value)} />
        </label>
        <div className="mt-5 flex items-center justify-between gap-4 border-t-2 border-ink/10 pt-4">
          <div>
            <p>{c.reminderLabel}</p>
            <p className="text-[0.9rem] text-ink-soft">{denied ? c.reminderDenied : c.reminderHint}</p>
          </div>
          <Toggle
            checked={reminder}
            label={c.reminderLabel}
            onChange={async (on) => {
              setReminder(on);
              if (on) setDenied(!(await askToNotify()));
            }}
          />
        </div>
      </div>
      <button type="button" className="btn btn-wide" onClick={onNext}>
        {c.timeButton}
      </button>
    </div>
  );
}

function Baseline() {
  const submitCheckin = useStore((s) => s.submitCheckin);
  const finishOnboarding = useStore((s) => s.finishOnboarding);
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="card px-5 py-6 sm:px-7">
          <h1 className="mb-2 text-[1.7rem]">{c.baselineTitle}</h1>
          <p className="text-[1.08rem]">{c.baselineBody}</p>
        </div>
        <button type="button" className="btn btn-wide" onClick={() => setStarted(true)}>
          {c.baselineButton}
        </button>
      </div>
    );
  }
  return (
    <div>
      <h1 className="mb-3 text-[1.7rem]">{c.baselineTitle}</h1>
      <CheckinForm
        onSubmit={(answers) => {
          submitCheckin(answers);
          finishOnboarding();
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}
