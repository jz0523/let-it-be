import { copy } from '../lib/content';
import { useUi } from '../store';
import { Shell } from '../ui/parts';
import { Whatif } from '../art/Whatif';

export function Help() {
  const go = useUi((s) => s.go);
  const rise = useUi((s) => s.helpRise);
  const prev = useUi((s) => s.prev);
  const c = copy.help;
  return (
    <Shell title={c.title} onBack={() => go(rise ? 'home' : prev === 'guide' ? 'guide' : 'settings')}>
      <div className="flex flex-col gap-4">
        {rise && <p className="panel px-4 py-3 text-[1.02rem]">{c.riseNote}</p>}
        <section className="card px-5 py-5">
          <p className="mb-4 text-[1.08rem]">{c.body}</p>
          <a className="btn btn-wide !text-[1.05rem]" href={c.directoryUrl} target="_blank" rel="noopener noreferrer">
            {c.directoryLabel}
          </a>
          <p className="mt-2 text-center text-[0.9rem] text-ink-soft">{c.directoryNote}</p>
        </section>
        <section className="card px-5 py-5">
          <h2 className="mb-2 text-[1.25rem]">{c.crisisTitle}</h2>
          <p className="text-[1.08rem]">{c.crisis}</p>
          <p className="text-ink-soft">{c.crisisOther}</p>
        </section>
      </div>
    </Shell>
  );
}

export function Why() {
  const go = useUi((s) => s.go);
  const prev = useUi((s) => s.prev);
  const c = copy.why;
  return (
    <Shell title={c.title} onBack={() => go(prev === 'guide' ? 'guide' : 'settings')}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-center py-2">
          <Whatif mood="sitting" size={110} />
        </div>
        <ol className="card flex flex-col gap-4 px-5 py-6">
          {c.lines.map((line, i) => (
            <li key={i} className="flex gap-3 text-[1.1rem] leading-snug">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-[2.5px] border-ink bg-lav font-display font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{line}</span>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}

export function About() {
  const go = useUi((s) => s.go);
  const c = copy.about;
  return (
    <Shell title={c.title} onBack={() => go('settings')}>
      <div className="flex flex-col gap-4">
        <section className="card px-5 py-5">
          <h2 className="mb-2 text-[1.25rem]">{c.isTitle}</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[1.05rem]">
            {c.isLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
        <section className="card px-5 py-5">
          <h2 className="mb-2 text-[1.25rem]">{c.isNotTitle}</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[1.05rem]">
            {c.isNotLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
        <section className="panel px-5 py-4">
          <p className="text-[1.02rem] leading-relaxed">{copy.onboarding.notice}</p>
        </section>
      </div>
    </Shell>
  );
}
