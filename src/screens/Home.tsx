import { motion } from 'framer-motion';
import { Garden } from '../art/Garden';
import { Whatif } from '../art/Whatif';
import { copy, fmt } from '../lib/content';
import { useNow } from '../lib/hooks';
import { dateKey, formatPracticeTime, minutesOfDay, parseClock } from '../lib/time';
import { checkinOpensOn, isLockedToday, pendingUrge, urgeIsDue, useStore, useUi, type Screen } from '../store';
import { SproutCount, softSpring } from '../ui/parts';

const INK = '#3b4a3f';

const NAV: { screen: Screen; label: string; icon: React.ReactNode }[] = [
  {
    screen: 'guide',
    label: copy.nav.guide,
    icon: (
      <>
        <circle cx="13" cy="13" r="10" />
        <path d="M9.8 10.2 q0.4 -3.2 3.4 -3.2 q3 0 3 2.8 q0 2 -3 3.2 v1.4" />
        <circle cx="13.2" cy="18.6" r="0.6" fill="#3b4a3f" />
      </>
    ),
  },
  {
    screen: 'progress',
    label: copy.nav.progress,
    icon: <path d="M4 20 V11 M10 20 V5 M16 20 V13 M22 20 V8" />,
  },
  {
    screen: 'checkin',
    label: copy.nav.checkin,
    icon: (
      <>
        <rect x="5" y="4" width="16" height="18" rx="4" />
        <path d="M9.5 10 h7 M9.5 15 h5" />
      </>
    ),
  },
  {
    screen: 'settings',
    label: copy.nav.settings,
    icon: (
      <>
        <path d="M4 8 h18 M4 18 h18" />
        <circle cx="10" cy="8" r="3" fill="#fffdf7" />
        <circle cx="17" cy="18" r="3" fill="#fffdf7" />
      </>
    ),
  },
];

export function Home() {
  const t = useNow(1000);
  const profile = useStore((s) => s.profile);
  const sessions = useStore((s) => s.sessions);
  const inProgress = useStore((s) => s.inProgress);
  const urges = useStore((s) => s.urges);
  const checkins = useStore((s) => s.checkins);
  const startTraining = useStore((s) => s.startTraining);
  const noteUrgeOpen = useStore((s) => s.noteUrgeOpen);
  const go = useUi((s) => s.go);

  const locked = isLockedToday(sessions);
  const resuming = inProgress?.date === dateKey(t);
  const pending = pendingUrge(urges);
  const due = pending ? urgeIsDue(pending) : false;
  const practiceDue = !locked && minutesOfDay(t) >= parseClock(profile.practiceTime);
  const checkinOpen = checkinOpensOn(checkins) === null;

  const urgeLabel = pending ? (due ? copy.home.urgePending : copy.home.urgeRunning) : copy.home.urge;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex min-h-dvh w-full max-w-[1100px] flex-col px-4 pb-6 pt-4 sm:px-6 lg:justify-center lg:py-10"
    >
      <header className="mb-3 flex items-center justify-between gap-3 lg:mb-6">
        <div>
          <h1 className="text-[2.1rem] leading-none lg:text-[2.6rem]">{copy.app.title}</h1>
          <p className="mt-1 text-[0.98rem] text-ink-soft">{copy.app.tagline}</p>
        </div>
        <SproutCount n={profile.sprouts} />
      </header>

      <div className="grid flex-1 content-start gap-5 lg:flex-none lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-10">
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={softSpring}
          className="card relative aspect-[3/2] w-full overflow-hidden"
        >
          <Garden sprouts={profile.sprouts} label={copy.home.gardenLabel} />
          {profile.sprouts === 0 && (
            <p className="absolute left-3 top-3 rounded-full border-2 border-ink/25 bg-paper/85 px-3 py-1 text-[0.9rem] text-ink-soft">
              {copy.home.gardenEmpty}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...softSpring, delay: 0.08 }}
          className="flex flex-col gap-4"
        >
          {locked ? (
            <div className="panel px-5 py-5 text-center">
              <p className="display text-[1.35rem]">{copy.home.locked}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {practiceDue && !resuming && <p className="text-center font-display text-[1.05rem] font-bold text-ink-soft">{copy.home.itsTime}</p>}
              <button
                type="button"
                className="btn btn-wide !min-h-[68px] !text-[1.4rem]"
                onClick={() => {
                  startTraining();
                  go('training');
                }}
              >
                {resuming ? copy.home.resume : copy.home.start}
              </button>
            </div>
          )}

          <button
            type="button"
            className={`btn btn-sm self-center !rounded-[26px] !py-2 !pl-3 !pr-5 text-left ${due ? 'btn-lav' : 'btn-paper'}`}
            onClick={() => {
              if (!pending) noteUrgeOpen();
              go('urge');
            }}
          >
            <Whatif mood={pending && !due ? 'sitting' : 'alert'} size={40} still />
            <span className="flex flex-col">
              <span>{urgeLabel}</span>
              {!pending && <span className="font-body text-[0.86rem] font-semibold leading-tight text-ink-soft">{copy.home.urgeHint}</span>}
            </span>
          </button>

          <p className="text-center text-[0.95rem] text-ink-soft">{fmt(copy.home.practiceTime, { time: formatPracticeTime(profile.practiceTime) })}</p>

          <nav className="mt-1 grid grid-cols-4 gap-2" aria-label={copy.app.title}>
            {NAV.map((item) => (
              <button
                key={item.screen}
                type="button"
                onClick={() => go(item.screen)}
                className="relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-[20px] border-[2.5px] border-ink bg-paper px-0.5 py-2 font-display text-[0.9rem] font-bold sm:text-[0.98rem] transition-shadow duration-300 hover:shadow-[0_5px_0_-1px_rgb(59_74_63/0.16)] active:translate-y-0.5"
              >
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {item.icon}
                </svg>
                {item.label}
                {item.screen === 'checkin' && checkinOpen && (
                  <span className="absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-ink bg-peach" aria-label={copy.home.checkinDue} role="img" />
                )}
              </button>
            ))}
          </nav>
        </motion.div>
      </div>
    </motion.main>
  );
}
