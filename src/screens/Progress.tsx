import type { ReactNode } from 'react';
import { copy, fmt } from '../lib/content';
import { addDays, dateKey, formatShortDay, weekStart } from '../lib/time';
import { useStore, useUi } from '../store';
import { BarChart, LegendDot, LineChart, PairChart } from '../ui/charts';
import { Shell } from '../ui/parts';

const c = copy.progress;

function Block({ title, body, children, empty }: { title: string; body: string; children: ReactNode; empty: boolean }) {
  return (
    <section className="card px-4 py-4 sm:px-5">
      <h2 className="text-[1.25rem]">{title}</h2>
      <p className="mb-2 text-[0.95rem] text-ink-soft">{body}</p>
      {empty ? <p className="py-6 text-center text-ink-soft">{c.empty}</p> : children}
    </section>
  );
}

export function Progress() {
  const sessions = useStore((s) => s.sessions);
  const urges = useStore((s) => s.urges);
  const go = useUi((s) => s.go);

  const boxes = sessions.flatMap((s) =>
    s.games.filter((g) => g.id === 'sealedBox' && g.rounds > 0).map((g) => ({
      label: formatShortDay(s.date),
      value: Math.round(((g.rounds - g.carriedOn) / g.rounds) * 100),
    })),
  );
  const taps = sessions.flatMap((s) =>
    s.games.filter((g) => g.id === 'letItSit').map((g) => ({ label: formatShortDay(s.date), value: g.whatifTaps ?? 0 })),
  );
  const done = urges.filter((u) => u.ratingAfter !== undefined).slice(-14);
  const pairs = done.map((u) => ({
    label: formatShortDay(dateKey(new Date(u.startedAt).getTime())),
    before: u.ratingBefore,
    after: u.ratingAfter as number,
  }));
  const acted = { yes: 0, no: 0, partly: 0 };
  for (const u of urges) if (u.actedOn) acted[u.actedOn]++;

  const thisWeek = weekStart(dateKey());
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, (i - 7) * 7));
  const perWeek = weeks.map((w) => ({
    label: formatShortDay(w),
    value: sessions.filter((s) => weekStart(s.date) === w).length,
  }));
  const maxTaps = Math.max(4, ...taps.map((t) => t.value));

  return (
    <Shell title={c.title} onBack={() => go('home')} wide>
      <p className="mb-4 text-ink-soft">{c.intro}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Block title={c.sessionsTitle} body={c.sessionsBody} empty={sessions.length === 0}>
          <BarChart label={c.sessionsTitle} points={perWeek} max={7} ticks={[7]} />
          <p className="mt-1 text-center text-[0.95rem] text-ink-soft">{fmt(c.totalSessions, { n: sessions.length })}</p>
        </Block>

        <Block title={c.peekTitle} body={c.peekBody} empty={boxes.length === 0}>
          <LineChart label={c.peekTitle} points={boxes.slice(-14)} max={100} ticks={[50, 100]} />
        </Block>

        <Block title={c.urgeTitle} body={c.urgeBody} empty={pairs.length === 0}>
          <PairChart label={c.urgeTitle} pairs={pairs} />
          <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
            <LegendDot>{c.urgeBefore}</LegendDot>
            <LegendDot filled>{c.urgeAfter}</LegendDot>
          </div>
          <p className="mt-2 text-center text-[0.95rem] text-ink-soft">{fmt(c.acted, acted)}</p>
        </Block>

        <Block title={c.tapTitle} body={c.tapBody} empty={taps.length === 0}>
          <BarChart label={c.tapTitle} points={taps.slice(-14)} max={maxTaps} ticks={[maxTaps]} />
        </Block>
      </div>
      <div className="mt-5 flex justify-center">
        <button type="button" className="btn btn-paper btn-sm" onClick={() => go('checkin')}>
          {c.checkinLink}
        </button>
      </div>
    </Shell>
  );
}
