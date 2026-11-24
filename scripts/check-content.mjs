// Checks the content bank against the design doc: minimum counts and the copy rules.
import { readFileSync } from 'node:fs';

const load = (name) => JSON.parse(readFileSync(new URL(`../content/${name}.json`, import.meta.url), 'utf8'));
const problems = [];
const need = (ok, msg) => ok || problems.push(msg);

const sentences = load('sentences').items;
const statements = load('statements').items;
const boxes = load('boxes').items;
const whatifs = load('whatifs').items;
const checkin = load('checkin');
const copy = load('copy');

need(sentences.length >= 150, `sentences: ${sentences.length} < 150`);
need(statements.length >= 120, `statements: ${statements.length} < 120`);
need(boxes.length >= 40, `boxes: ${boxes.length} < 40`);
need(whatifs.length >= 30, `whatifs: ${whatifs.length} < 30`);
need(checkin.items.length === 18, `checkin: ${checkin.items.length} items, expected 18`);
need(checkin.labels.length === 5, 'checkin: expected 5 labels');

for (let level = 1; level <= 5; level++) {
  const s = sentences.filter((x) => x.level === level);
  need(s.filter((x) => x.question).length >= 5, `sentences level ${level}: fewer than 5 with questions`);
  need(s.filter((x) => !x.question).length >= 3, `sentences level ${level}: fewer than 3 without questions`);
  need(statements.filter((x) => x.level === level).length >= 10, `statements level ${level}: fewer than 10`);
  need(boxes.filter((x) => x.level === level).length >= 4, `boxes level ${level}: fewer than 4`);
}
for (const s of sentences) need(!s.question || (s.options && s.options.length >= 2), `sentence missing options: ${s.text}`);
for (const b of boxes) {
  const all = [...b.items, ...b.extras];
  need(new Set(all).size === all.length, `box "${b.theme}" repeats an item`);
}

// Copy rules. The onboarding notice is the doc's own draft wording and is exempt.
const banned = /\b(safe|fine|nothing to worry about|definitely|certainly|100%)\b/i;
const outcomeBang = /!/;
const walk = (node, path) => {
  if (typeof node === 'string') {
    if (path === 'onboarding.notice' || path.startsWith('help.directoryUrl')) return;
    need(!banned.test(node), `copy.${path}: banned word in "${node}"`);
    need(!outcomeBang.test(node), `copy.${path}: exclamation mark in "${node}"`);
    need(!/\b(treatment|cure)\b/i.test(node) || path.startsWith('about.') || path.startsWith('guide.know'), `copy.${path}: use "practice" in "${node}"`);
  } else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
};
walk(copy, '');
for (const w of whatifs) need(!banned.test(w), `whatif: banned word in "${w}"`);

if (problems.length) {
  console.error(`Content check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Content OK: ${sentences.length} sentences, ${statements.length} statements, ${boxes.length} box sets, ${whatifs.length} Whatif lines, ${checkin.items.length} check-in items.`,
);
