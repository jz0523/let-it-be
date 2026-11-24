import { useState } from 'react';
import { checkin, copy, fmt } from '../lib/content';
import { formatDay, formatShortDay } from '../lib/time';
import { checkinOpensOn, useStore, useUi } from '../store';
import { LineChart } from '../ui/charts';
import { MossLine, Shell } from '../ui/parts';
import { SproutIcon } from '../art/Bits';
import type { WeeklyCheckin } from '../types';

const c = copy.checkin;
const MAX = checkin.items.length * 4;

/** The 18-item form. Used at onboarding and once every seven days. */
export function CheckinForm({ onSubmit }: { onSubmit: (answers: number[]) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(checkin.items.length).fill(null));
  const answered = answers.filter((a) => a !== null).length;
  const complete = answered === checkin.items.length;

  return (
    <div className="flex flex-col gap-4">
      {!checkin.validated && (
        <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-2 text-center text-[0.95rem] text-ink-soft">{c.standInNotice}</p>
      )}
      <p className="display text-[1.25rem]">{checkin.instruction}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.92rem] text-ink-soft" aria-hidden>
        {checkin.labels.map((label, v) => (
          <li key={label}>
            <span className="font-display font-bold text-ink">{v}</span> {label}
          </li>
        ))}
      </ul>

      <ol className="flex flex-col gap-3">
        {checkin.items.map((text, i) => (
          <li key={i} className="panel px-4 py-4">
            <fieldset>
              <legend className="mb-3 flex gap-2 text-[1.05rem] leading-snug">
                <span className="font-display font-bold text-ink-soft">{i + 1}.</span>
                <span>{text}</span>
              </legend>
              <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={text}>
                {checkin.labels.map((label, v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={answers[i] === v}
                    aria-label={label}
                    className="chip !min-h-[48px] !px-0 font-display !text-[1.15rem] tabular-nums"
                    onClick={() => setAnswers((a) => a.map((x, k) => (k === i ? v : x)))}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="mt-2 min-h-[1.3rem] text-[0.92rem] text-ink-soft" aria-hidden>
                {answers[i] !== null ? checkin.labels[answers[i] as number] : ''}
              </p>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-3 z-10 flex flex-col items-center gap-2 rounded-[26px] border-[2.5px] border-ink bg-paper px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="font-display font-bold text-ink-soft" aria-live="polite">
          {fmt(c.progress, { n: answered, total: checkin.items.length })}
        </p>
        <button type="button" className="btn btn-wide" disabled={!complete} onClick={() => complete && onSubmit(answers as number[])}>
          {c.submit}
        </button>
      </div>
    </div>
  );
}

export function TrendChart({ checkins }: { checkins: WeeklyCheckin[] }) {
  if (checkins.length === 0) return <p className="py-6 text-center text-ink-soft">{c.chartNone}</p>;
  return (
    <div>
      <LineChart
        label={c.chartTitle}
        max={MAX}
        ticks={[MAX / 4, MAX / 2, (MAX * 3) / 4, MAX]}
        points={checkins.map((x) => ({ label: formatShortDay(x.date), value: x.total }))}
      />
      {checkins.length === 1 && <p className="mt-1 text-center text-[0.95rem] text-ink-soft">{c.chartEmpty}</p>}
    </div>
  );
}

export function Checkin() {
  const checkins = useStore((s) => s.checkins);
  const submitCheckin = useStore((s) => s.submitCheckin);
  const go = useUi((s) => s.go);
  const showHelpForRise = useUi((s) => s.showHelpForRise);
  const [filling, setFilling] = useState(false);
  const [saved, setSaved] = useState<{ total: number; showHelp: boolean } | null>(null);

  const opensOn = checkinOpensOn(checkins);

  if (filling && !saved) {
    return (
      <Shell title={c.title} onBack={() => setFilling(false)}>
        <CheckinForm
          onSubmit={(answers) => {
            setSaved(submitCheckin(answers));
            window.scrollTo(0, 0);
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell title={c.title} onBack={() => go('home')}>
      <div className="flex flex-col gap-5">
        {saved && (
          <>
            <MossLine line={copy.moss.checkinDone} />
            <p className="display text-center text-[1.5rem]">{fmt(c.total, { n: saved.total, max: MAX })}</p>
            <p className="flex items-center justify-center gap-2 font-display font-bold text-ink-soft">
              <SproutIcon size={22} /> {c.sprout}
            </p>
          </>
        )}

        <section className="card px-4 py-4">
          <h2 className="mb-2 text-[1.2rem]">{c.chartTitle}</h2>
          <TrendChart checkins={checkins} />
        </section>

        {saved ? (
          <button type="button" className="btn btn-wide" onClick={() => (saved.showHelp ? showHelpForRise() : go('home'))}>
            {copy.app.continue}
          </button>
        ) : opensOn ? (
          <p className="panel px-4 py-4 text-center font-display text-[1.1rem] font-bold">{fmt(c.locked, { date: formatDay(opensOn) })}</p>
        ) : (
          <button type="button" className="btn btn-wide" onClick={() => setFilling(true)}>
            {c.open}
          </button>
        )}
      </div>
    </Shell>
  );
}
