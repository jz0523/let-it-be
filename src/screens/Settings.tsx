import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { copy, fmt, gameName } from '../lib/content';
import { exportCsv, exportJson } from '../lib/exportData';
import { askToNotify } from '../lib/notify';
import { devOffsetMs, setDevOffsetMs } from '../lib/time';
import { GAME_IDS, useStore, useUi } from '../store';
import { Shell, Toggle, spring } from '../ui/parts';
import type { Level } from '../types';

const c = copy.settings;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card px-4 py-4 sm:px-5">
      <h2 className="mb-3 text-[1.25rem]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[56px] items-center justify-between gap-4 border-t-2 border-ink/10 py-2.5 first:border-t-0">
      <div>
        <p className="leading-snug">{label}</p>
        {hint && <p className="text-[0.9rem] text-ink-soft">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const profile = useStore((s) => s.profile);
  const maxLevels = useStore((s) => s.maxLevels);
  const settings = useStore((s) => s.settings);
  const { setPracticeTime, setReminder, setSound, lowerLevel, raiseLevel, deleteAll } = useStore.getState();
  const go = useUi((s) => s.go);
  const [confirming, setConfirming] = useState(false);
  const [denied, setDenied] = useState(false);

  return (
    <Shell title={c.title} onBack={() => go('home')} wide>
      <div className="flex flex-col gap-4 md:block md:columns-2 md:gap-4 md:[&>*]:mb-4 md:[&>*]:break-inside-avoid">
        <Section title={c.dailyTitle}>
          <Row label={c.practiceTime}>
            <input
              type="time"
              value={profile.practiceTime}
              aria-label={c.practiceTime}
              onChange={(e) => e.target.value && setPracticeTime(e.target.value)}
              className="!min-h-[48px] !text-[1.25rem]"
            />
          </Row>
          <Row label={c.reminder} hint={denied ? copy.onboarding.reminderDenied : copy.onboarding.reminderHint}>
            <Toggle
              checked={settings.reminder}
              label={c.reminder}
              onChange={async (on) => {
                setReminder(on);
                if (on) setDenied(!(await askToNotify()));
              }}
            />
          </Row>
          <Row label={c.sound}>
            <Toggle checked={settings.sound} label={c.sound} onChange={setSound} />
          </Row>
        </Section>

        <Section title={c.levelsTitle}>
          <p className="mb-2 text-[0.95rem] text-ink-soft">{c.levelsBody}</p>
          {GAME_IDS.map((id) => (
            <Row key={id} label={gameName(id)}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="chip !min-h-[44px] !w-[44px] !px-0 font-display !text-[1.3rem]"
                  disabled={profile.levels[id] <= 1}
                  aria-label={fmt(c.lower, { game: gameName(id) })}
                  onClick={() => lowerLevel(id)}
                  style={{ opacity: profile.levels[id] <= 1 ? 0.4 : 1 }}
                >
                  −
                </button>
                <span className="w-8 text-center font-display text-[1.35rem] font-bold tabular-nums" aria-label={`${copy.app.level} ${profile.levels[id]}`}>
                  {profile.levels[id]}
                </span>
                <button
                  type="button"
                  className="chip !min-h-[44px] !w-[44px] !px-0 font-display !text-[1.3rem]"
                  disabled={profile.levels[id] >= maxLevels[id]}
                  aria-label={fmt(c.raise, { game: gameName(id) })}
                  onClick={() => raiseLevel(id)}
                  style={{ opacity: profile.levels[id] >= maxLevels[id] ? 0.4 : 1 }}
                >
                  +
                </button>
              </div>
            </Row>
          ))}
        </Section>

        <Section title={c.helpTitle}>
          <div className="flex flex-col gap-2.5">
            <button type="button" className="btn btn-paper btn-sm btn-wide" onClick={() => go('help')}>
              {c.findHelp}
            </button>
            <button type="button" className="btn btn-paper btn-sm btn-wide" onClick={() => go('why')}>
              {c.why}
            </button>
            <button type="button" className="btn btn-paper btn-sm btn-wide" onClick={() => go('about')}>
              {c.about}
            </button>
          </div>
        </Section>

        <Section title={c.dataTitle}>
          <p className="mb-3 text-[0.95rem] text-ink-soft">{c.dataBody}</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button type="button" className="btn btn-paper btn-sm" onClick={() => exportJson(useStore.getState())}>
              {c.exportJson}
            </button>
            <button type="button" className="btn btn-paper btn-sm" onClick={() => exportCsv(useStore.getState())}>
              {c.exportCsv}
            </button>
          </div>
          <div className="mt-3 border-t-2 border-ink/10 pt-3">
            <button type="button" className="link-btn" onClick={() => setConfirming(true)}>
              {c.delete}
            </button>
          </div>
        </Section>

        {import.meta.env.DEV && <DevTools />}
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-dusk/45 p-5"
            onClick={() => setConfirming(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="del-title"
              aria-describedby="del-body"
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="card w-full max-w-[24rem] px-5 py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="del-title" className="mb-2 text-[1.4rem]">
                {c.deleteConfirmTitle}
              </h2>
              <p id="del-body" className="mb-5 text-ink-soft">
                {c.deleteConfirmBody}
              </p>
              <div className="flex flex-col gap-2.5">
                <button type="button" className="btn btn-sm" autoFocus onClick={() => setConfirming(false)}>
                  {c.deleteNo}
                </button>
                <button
                  type="button"
                  className="btn btn-paper btn-sm"
                  onClick={() => {
                    setDevOffsetMs(0);
                    deleteAll();
                    go('home');
                  }}
                >
                  {c.deleteYes}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

/** Development build only. Lets a tester move the clock and open games directly. */
function DevTools() {
  const d = copy.dev;
  const { devAddSprouts, devUnlockToday, devEndTimer, devSetLevels, devResetTutorials } = useStore.getState();
  const playSolo = useUi((s) => s.playSolo);
  const [offset, setOffset] = useState(devOffsetMs());
  const jump = (days: number) => {
    const next = offset + days * 86_400_000;
    setDevOffsetMs(next);
    setOffset(next);
    useStore.getState().finalizeStale();
  };
  return (
    <section className="rounded-[22px] border-2 border-dashed border-ink/40 px-4 py-4 md:[column-span:all]">
      <h2 className="text-[1.1rem]">{d.title}</h2>
      <p className="mb-3 text-[0.9rem] text-ink-soft">
        {d.note} {fmt(d.offset, { n: Math.round(offset / 86_400_000) })}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="chip" onClick={() => jump(1)}>
          {d.nextDay}
        </button>
        <button type="button" className="chip" onClick={() => jump(7)}>
          {d.nextWeek}
        </button>
        <button type="button" className="chip" onClick={devUnlockToday}>
          {d.unlock}
        </button>
        <button type="button" className="chip" onClick={() => devAddSprouts(25)}>
          {d.addSprouts}
        </button>
        <button type="button" className="chip" onClick={devEndTimer}>
          {d.endTimer}
        </button>
        <button type="button" className="chip" onClick={devResetTutorials}>
          {d.resetTutorials}
        </button>
        {GAME_IDS.map((id) => (
          <button key={id} type="button" className="chip" onClick={() => playSolo(id)}>
            {fmt(d.playGame, { game: gameName(id) })}
          </button>
        ))}
        {([1, 3, 5] as Level[]).map((n) => (
          <button key={n} type="button" className="chip" onClick={() => devSetLevels(n)}>
            {fmt(d.setLevel, { n })}
          </button>
        ))}
      </div>
    </section>
  );
}
