import { useEffect, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import { copy } from './lib/content';
import { setAmbient } from './lib/ambient';
import { notify } from './lib/notify';
import { minutesOfDay, parseClock } from './lib/time';
import { isLockedToday, pendingUrge, urgeIsDue, useStore, useUi } from './store';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { SoloGame, Training } from './screens/Training';
import { Urge } from './screens/Urge';
import { Checkin } from './screens/Checkin';
import { Progress } from './screens/Progress';
import { Settings } from './screens/Settings';
import { About, Help, Why } from './screens/Pages';
import { Guide } from './screens/Guide';
import { Tutorial } from './screens/Tutorial';

/** Background duties: close stale sessions, announce a finished timer, send the daily reminder. */
function useWatchers() {
  const announced = useRef<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = useStore.getState();
      s.finalizeStale();

      const pending = pendingUrge(s.urges);
      if (pending && urgeIsDue(pending) && announced.current !== pending.startedAt) {
        announced.current = pending.startedAt;
        if (document.hidden) notify(copy.urge.notifyTitle, copy.urge.notifyBody);
      }

      if (
        s.onboarded &&
        s.settings.reminder &&
        !isLockedToday(s.sessions) &&
        s.lastReminderDate !== new Date().toDateString() &&
        minutesOfDay() >= parseClock(s.profile.practiceTime)
      ) {
        useStore.setState({ lastReminderDate: new Date().toDateString() });
        if (document.hidden) notify(copy.app.title, copy.home.itsTime);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
}

/** Ambient sound may only start after a tap, so it waits for the first one. */
function useAmbient() {
  const sound = useStore((s) => s.settings.sound);
  useEffect(() => {
    if (!sound) {
      setAmbient(false);
      return;
    }
    const start = () => setAmbient(true);
    start();
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, [sound]);
}

export default function App() {
  const onboarded = useStore((s) => s.onboarded);
  const screen = useUi((s) => s.screen);
  const tutorialGame = useUi((s) => s.tutorialGame);
  const go = useUi((s) => s.go);
  useWatchers();
  useAmbient();

  let view;
  if (!onboarded) view = <Onboarding />;
  else
    switch (screen) {
      case 'training':
        view = <Training />;
        break;
      case 'urge':
        view = <Urge />;
        break;
      case 'checkin':
        view = <Checkin />;
        break;
      case 'progress':
        view = <Progress />;
        break;
      case 'settings':
        view = <Settings />;
        break;
      case 'help':
        view = <Help />;
        break;
      case 'why':
        view = <Why />;
        break;
      case 'about':
        view = <About />;
        break;
      case 'guide':
        view = <Guide />;
        break;
      case 'tutorial':
        view = tutorialGame ? <Tutorial key={tutorialGame} game={tutorialGame} onDone={() => go('guide')} /> : <Guide />;
        break;
      case 'solo':
        view = <SoloGame />;
        break;
      default:
        view = <Home />;
    }

  return <MotionConfig reducedMotion="user">{view}</MotionConfig>;
}
