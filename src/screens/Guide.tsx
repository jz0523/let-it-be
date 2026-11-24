import type { ReactNode } from 'react';
import { copy, gameName } from '../lib/content';
import { GAME_IDS, useUi } from '../store';
import { Shell } from '../ui/parts';
import { Whatif, type WhatifMood } from '../art/Whatif';
import { BoxArt, LeafShape, SproutIcon } from '../art/Bits';
import { Plant } from '../art/Garden';
import { CardBack } from '../games/OneRead';
import { WateringCan } from '../games/LetItSit';
import type { GameId } from '../types';

const g = copy.guide;
const INK = '#3b4a3f';

/** The three-step idea behind the whole game. Also shown during onboarding. */
export function IdeaSteps({ compact }: { compact?: boolean }) {
  return (
    <ol className={compact ? 'flex flex-col gap-3' : 'grid gap-3 md:grid-cols-3'}>
      {g.idea.map((step, i) => (
        <li
          key={step.title}
          className={`panel flex items-center gap-4 px-4 py-4 ${compact ? '' : 'md:flex-col md:items-center md:px-5 md:py-6 md:text-center'}`}
        >
          <div className="flex-none">
            <Whatif mood={step.mood as WhatifMood} size={compact ? 66 : 84} still />
          </div>
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-[1.15rem] md:justify-center">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-[2.5px] border-ink bg-lav text-[0.95rem]">{i + 1}</span>
              {step.title}
            </h3>
            <p className="text-[1rem] leading-snug text-ink-soft">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const DAY_ART: Record<string, ReactNode> = {
  training: <SproutIcon size={30} />,
  urge: <Whatif mood="alert" size={36} still />,
  garden: (
    <svg width="34" height="40" viewBox="-17 -48 34 52" aria-hidden>
      <Plant type={0} stage={3} />
    </svg>
  ),
  checkin: (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="16" height="18" rx="4" />
      <path d="M9.5 10 h7 M9.5 15 h5" />
    </svg>
  ),
};

const GAME_ART: Record<GameId, ReactNode> = {
  oneRead: (
    <div className="scale-[0.5]">
      <CardBack small />
    </div>
  ),
  sealedBox: <BoxArt size={72} />,
  thoughtSorter: (
    <div className="h-[58px] w-[84px]">
      <LeafShape className="h-full w-full" />
    </div>
  ),
  letItSit: <WateringCan size={70} />,
};

function Section({ title, body, children }: { title: string; body?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 text-[1.4rem]">{title}</h2>
      {body && <p className="mb-3 text-ink-soft">{body}</p>}
      <div className={body ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

export function Guide() {
  const go = useUi((s) => s.go);
  const openTutorial = useUi((s) => s.openTutorial);
  return (
    <Shell title={g.title} onBack={() => go('home')} wide>
      <div className="flex flex-col gap-8">
        <Section title={g.ideaTitle}>
          <IdeaSteps />
        </Section>

        <Section title={g.dayTitle}>
          <ul className="card divide-y-2 divide-ink/10 px-4 sm:px-5">
            {g.day.map((row) => (
              <li key={row.key} className="flex items-center gap-4 py-3.5">
                <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cream">{DAY_ART[row.key]}</span>
                <div>
                  <h3 className="text-[1.12rem]">{row.title}</h3>
                  <p className="text-[1rem] leading-snug text-ink-soft">{row.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={g.gamesTitle} body={g.gamesBody}>
          <ul className="grid gap-3 md:grid-cols-2">
            {GAME_IDS.map((id) => (
              <li key={id} className="card flex flex-col gap-3 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-[84px] w-[96px] flex-none items-center justify-center overflow-hidden rounded-2xl border-[2.5px] border-ink bg-cream">{GAME_ART[id]}</span>
                  <h3 className="text-[1.3rem]">{gameName(id)}</h3>
                </div>
                <dl className="flex flex-col gap-1.5 text-[1rem] leading-snug">
                  <div>
                    <dt className="font-display text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{g.youDo}</dt>
                    <dd>{g.games[id].does}</dd>
                  </div>
                  <div>
                    <dt className="font-display text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink-soft">{g.practises}</dt>
                    <dd>{g.games[id].practises}</dd>
                  </div>
                </dl>
                <button type="button" className="btn btn-paper btn-sm mt-auto self-start" onClick={() => openTutorial(id)}>
                  {g.showMe}
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={g.knowTitle}>
          <ul className="panel flex flex-col gap-2.5 px-5 py-4">
            {g.know.map((line) => (
              <li key={line} className="flex gap-3 text-[1.02rem] leading-snug">
                <span className="mt-[0.45rem] h-2.5 w-2.5 flex-none rounded-full border-2 border-ink bg-peach" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-paper btn-sm" onClick={() => go('why')}>
              {copy.settings.why}
            </button>
            <button type="button" className="btn btn-paper btn-sm" onClick={() => go('help')}>
              {copy.settings.findHelp}
            </button>
          </div>
        </Section>
      </div>
    </Shell>
  );
}
