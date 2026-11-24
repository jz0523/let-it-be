import type { Data } from '../store';
import { dateKey } from './time';

function download(name: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Only the player's records, not interface state. */
function records(d: Data) {
  return {
    exportedAt: new Date().toISOString(),
    profile: d.profile,
    sessions: d.sessions,
    urges: d.urges,
    checkins: d.checkins,
  };
}

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = (header: string[], body: unknown[][]) => [header, ...body].map((r) => r.map(cell).join(',')).join('\n');

export function exportJson(d: Data) {
  download(`let-it-be-${dateKey()}.json`, JSON.stringify(records(d), null, 2), 'application/json');
}

export function exportCsv(d: Data) {
  const parts = [
    '# training sessions',
    rows(
      ['date', 'game', 'level', 'rounds', 'carried_on', 'whatif_taps', 'effort_rating'],
      d.sessions.flatMap((s) =>
        s.games.map((g) => [s.date, g.id, g.level, g.rounds, g.carriedOn, g.whatifTaps, s.effortRating]),
      ),
    ),
    '',
    '# urge delays',
    rows(
      ['started_at', 'ends_at', 'urge_type', 'delay_minutes', 'rating_before', 'rating_after', 'acted_on'],
      d.urges.map((u) => [u.startedAt, u.endsAt, u.urgeType, u.delayMinutes, u.ratingBefore, u.ratingAfter, u.actedOn]),
    ),
    '',
    '# weekly check-ins',
    rows(
      ['date', 'total', ...Array.from({ length: 18 }, (_, i) => `item_${i + 1}`)],
      d.checkins.map((c) => [c.date, c.total, ...c.answers]),
    ),
    '',
    '# profile',
    rows(
      ['created_at', 'practice_time', 'sprouts', 'level_one_read', 'level_sealed_box', 'level_thought_sorter', 'level_let_it_sit'],
      [
        [
          d.profile.createdAt,
          d.profile.practiceTime,
          d.profile.sprouts,
          d.profile.levels.oneRead,
          d.profile.levels.sealedBox,
          d.profile.levels.thoughtSorter,
          d.profile.levels.letItSit,
        ],
      ],
    ),
  ];
  download(`let-it-be-${dateKey()}.csv`, parts.join('\n'), 'text/csv');
}
