// Visual walkthrough: drives the dev server in a real browser and saves screenshots of every screen.
// Usage: node scripts/shots.mjs <outDir> [mobile|desktop|all] [sceneFilter]
// Needs the dev server on http://localhost:5173 and Microsoft Edge installed.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'shots';
const which = process.argv[3] ?? 'all';
const filter = process.argv[4] ?? '';
const URL = 'http://localhost:5173/';
const VIEWPORTS = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function seedData() {
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    const p = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const sessions = [];
  for (let i = 30; i >= 1; i--) {
    if (i % 4 === 0) continue;
    const even = sessions.length % 2 === 0;
    sessions.push({
      date: day(i),
      effortRating: 1 + (i % 5),
      games: even
        ? [
            { id: 'oneRead', level: 2, rounds: 8, carriedOn: 8 },
            { id: 'sealedBox', level: 2, rounds: 4, carriedOn: 1 + (i % 4) },
          ]
        : [
            { id: 'thoughtSorter', level: 2, rounds: 10, carriedOn: 10 },
            { id: 'letItSit', level: 2, rounds: 4, carriedOn: 2 + (i % 3), whatifTaps: i % 5 },
          ],
    });
  }
  const urges = [];
  for (let i = 12; i >= 1; i--) {
    const start = Date.now() - i * 86_400_000;
    urges.push({
      startedAt: new Date(start).toISOString(),
      endsAt: new Date(start + 600_000).toISOString(),
      delayMinutes: 10,
      urgeType: ['check', 'reread', 'ask'][i % 3],
      ratingBefore: 5 + (i % 5),
      ratingAfter: 2 + ((i * 3) % 7),
      actedOn: ['no', 'partly', 'yes', 'no'][i % 4],
    });
  }
  const checkins = [38, 41, 36, 33, 35].map((total, k) => ({
    date: day(30 - k * 7),
    answers: Array(18).fill(2),
    total,
  }));
  return { sessions, urges, checkins };
}

async function run(name, vp) {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  const dir = join(outDir, name);
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const shot = async (label, opts = {}) => {
    n++;
    const file = join(dir, `${String(n).padStart(2, '0')}-${label}.png`);
    await page.screenshot({ path: file, fullPage: opts.full ?? false });
  };
  const fresh = async () => {
    await page.goto(URL);
    await page.evaluate(() => localStorage.clear());
    await page.goto(URL);
    await page.waitForFunction(() => window.__letitbe);
  };
  const store = (fn, arg) => page.evaluate(([f, a]) => new Function('s', 'ui', 'a', `return (${f})(s, ui, a)`)(window.__letitbe.useStore, window.__letitbe.useUi, a), [fn.toString(), arg]);
  const ready = async (sprouts = 0) => {
    await fresh();
    await store((s, ui, a) => {
      const seen = { oneRead: true, sealedBox: true, thoughtSorter: true, letItSit: true };
      s.setState({ onboarded: true, onboardingStep: 5, seenTutorials: seen, profile: { ...s.getState().profile, sprouts: a } });
    }, sprouts);
    await sleep(700);
  };
  const click = (text) => page.getByRole('button', { name: text, exact: false }).or(page.getByRole('radio', { name: text, exact: false })).first().click();

  const scenes = {
    async onboarding() {
      await fresh();
      await sleep(800);
      await shot('onboard-notice');
      await click('I understand');
      await sleep(900);
      await shot('onboard-demo-idle');
      await click('A Whatif');
      await sleep(600);
      await click('A Whatif');
      await sleep(900);
      await shot('onboard-demo-loud');
      await sleep(4200);
      await shot('onboard-demo-yawn');
      await sleep(3600);
      await shot('onboard-demo-asleep');
      await click('Continue');
      await sleep(900);
      await shot('onboard-idea');
      await click('Continue');
      await sleep(900);
      await shot('onboard-time');
      await click('Set time');
      await sleep(900);
      await shot('onboard-baseline');
      await click('Start check-in');
      await sleep(700);
      await shot('onboard-form');
      await page.getByRole('radio', { name: 'A little' }).nth(0).click();
      await page.getByRole('radio', { name: 'Moderately' }).nth(1).click();
      await sleep(300);
      await shot('onboard-form-answered');
    },
    async home() {
      for (const sprouts of [0, 14, 60, 130, 240]) {
        await ready(sprouts);
        await shot(`home-${sprouts}-sprouts`);
      }
      // locked state
      await ready(40);
      await store((s) => {
        const p = (x) => String(x).padStart(2, '0');
        const d = new Date();
        const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
        s.setState({ sessions: [{ date: today, games: [], effortRating: 3 }] });
      });
      await sleep(500);
      await shot('home-locked');
    },
    async training() {
      await ready(12);
      await click("Start today's practice");
      await sleep(1000);
      await shot('training-greeting');
      await click('Begin');
      await sleep(900);
      await shot('oneread-intro');
      await click('Show the first card');
      await sleep(900);
      await shot('oneread-card');
      await sleep(5800);
      await shot('oneread-gone');
      for (let i = 0; i < 8; i++) {
        const next = page.getByRole('button', { name: 'Next' });
        await next.waitFor({ timeout: 9000 });
        await next.click();
        await sleep(500);
        const option = page.locator('.chip').first();
        if (await page.getByText('About an earlier card').count()) {
          await shot(`oneread-question-${i}`);
          await option.click();
          await sleep(500);
          await shot(`oneread-answered-${i}`);
          await page.getByRole('button', { name: 'Next' }).click();
          await sleep(400);
        }
      }
      await sleep(800);
      await shot('oneread-end');
      await click('Continue');
      await sleep(900);
      await shot('sealedbox-intro');
      await click('Show the first list');
      await sleep(1200);
      await shot('sealedbox-memorise');
      await page.getByText('Tap what goes in the box').waitFor({ timeout: 9000 });
      await sleep(700);
      await shot('sealedbox-pack');
      for (let k = 0; k < 3; k++) {
        await page.locator('button.chip:not([disabled])').first().click();
        await sleep(350);
      }
      await sleep(500);
      await shot('sealedbox-packed');
      await click('Seal the box');
      await sleep(3200);
      await shot('sealedbox-travel');
      await sleep(2500);
      await shot('sealedbox-travel-2');
      await page.getByRole('button', { name: /Next box|Done/ }).waitFor({ timeout: 12000 });
      await sleep(700);
      await shot('sealedbox-delivered');
      await click('Next box');
      await page.getByText('Tap what goes in the box').waitFor({ timeout: 9000 });
      for (let k = 0; k < 3; k++) {
        await page.locator('button.chip:not([disabled])').first().click();
        await sleep(300);
      }
      await click('Seal the box');
      await sleep(2000);
      await click('Peek inside');
      await sleep(900);
      await shot('sealedbox-peeked');
      for (let b = 0; b < 2; b++) {
        await click('Next box');
        await page.getByText('Tap what goes in the box').waitFor({ timeout: 9000 });
        for (let k = 0; k < 3; k++) {
          await page.locator('button.chip:not([disabled])').first().click();
          await sleep(300);
        }
        await click('Seal the box');
        await page.getByRole('button', { name: /Next box|Done/ }).waitFor({ timeout: 12000 });
        await sleep(300);
      }
      await click('Done');
      await sleep(800);
      await shot('sealedbox-end');
      await click('Continue');
      await sleep(900);
      await shot('reflection');
      await click('Medium');
      await sleep(1100);
      await shot('session-end');
      await click('Back to the garden');
      await sleep(900);
      await shot('home-after-session');
    },
    async sorter() {
      await ready(20);
      await store((s, ui) => ui.getState().playSolo('thoughtSorter'));
      await sleep(900);
      await shot('sorter-intro');
      await click('Show the first leaf');
      await sleep(1000);
      await shot('sorter-leaf');
      await click('Keep');
      await sleep(450);
      await shot('sorter-keep-exit');
      await sleep(900);
      await shot('sorter-next-leaf');
      await click('Let go');
      await sleep(450);
      await shot('sorter-letgo-exit');
      await sleep(1000);
      // drag gesture
      const leaf = page.locator('.cursor-grab').first();
      const box = await leaf.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 6 });
        await sleep(200);
        await shot('sorter-dragging');
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 130, { steps: 6 });
        await page.mouse.up();
      }
      await sleep(1100);
      await shot('sorter-after-drag');
      // level 5 statements
      await store((s, ui) => {
        s.getState().devSetLevels(5);
        ui.getState().go('home');
      });
      await store((s, ui) => ui.getState().playSolo('thoughtSorter'));
      await sleep(600);
      await click('Show the first leaf');
      await sleep(1000);
      await shot('sorter-level5-leaf');
    },
    async letitsit() {
      for (const level of [1, 5]) {
        await ready(20);
        await store((s, ui, a) => {
          s.getState().devSetLevels(a);
          ui.getState().playSolo('letItSit');
        }, level);
        await sleep(900);
        if (level === 1) await shot('letitsit-intro');
        await click('Pick up the watering can');
        await sleep(5200);
        await shot(`letitsit-l${level}-first-whatif`);
        await click('Pot 1');
        await sleep(400);
        await click('Pot 2');
        await sleep(600);
        await shot(`letitsit-l${level}-watering`);
        await page.getByRole('button', { name: 'A Whatif' }).first().click();
        await sleep(900);
        await shot(`letitsit-l${level}-poked`);
        await sleep(9000);
        await shot(`letitsit-l${level}-settling`);
        await sleep(level === 1 ? 14000 : 22000);
        await shot(`letitsit-l${level}-later`);
      }
    },
    async hardgames() {
      await ready(20);
      await store((s, ui) => {
        s.getState().devSetLevels(5);
        ui.getState().playSolo('oneRead');
      });
      await sleep(700);
      await click('Show the first card');
      await sleep(900);
      await shot('oneread-l5-card');
      await sleep(2200);
      await shot('oneread-l5-gone-whatif');
      await store((s, ui) => ui.getState().go('home'));
      await store((s, ui) => ui.getState().playSolo('sealedBox'));
      await sleep(700);
      await click('Show the first list');
      await sleep(1500);
      await shot('sealedbox-l5-memorise');
      await page.getByText('Tap what goes in the box').waitFor({ timeout: 12000 });
      await sleep(600);
      await shot('sealedbox-l5-pack');
      for (let k = 0; k < 5; k++) {
        await page.locator('button.chip:not([disabled])').first().click();
        await sleep(300);
      }
      await click('Seal the box');
      await sleep(6000);
      await shot('sealedbox-l5-travel');
    },
    async urge() {
      await ready(20);
      await click('A Whatif showed up');
      await sleep(900);
      await shot('urge-setup');
      await page.getByRole('slider').fill('7');
      await click('Search online');
      await click('15 min');
      await sleep(300);
      await shot('urge-setup-chosen');
      await click('Start the wait');
      await sleep(1600);
      await shot('urge-timer');
      await click('Back to the garden');
      await sleep(800);
      await shot('home-timer-running');
      await store((s) => s.getState().devEndTimer());
      await sleep(1300);
      await shot('home-timer-ended');
      await click('Your timer ended');
      await sleep(900);
      await shot('urge-followup');
      await page.getByRole('slider').fill('4');
      await click('Partly');
      await sleep(300);
      await shot('urge-followup-chosen');
      await click('Save');
      await sleep(900);
      await shot('urge-logged');
      await click('Back to the garden');
      await sleep(600);
      await click('A Whatif showed up');
      await sleep(900);
      await shot('urge-cooldown');
      // busy day line
      await ready(20);
      await store((s) => {
        const p = (x) => String(x).padStart(2, '0');
        const d = new Date();
        s.setState({ urgeOpens: { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, count: 5, busyShown: false } });
      });
      await click('A Whatif showed up');
      await sleep(900);
      await shot('urge-busy-day');
    },
    async records() {
      await ready(96);
      await store((s, ui, a) => s.setState(a), seedData());
      await sleep(300);
      await click('Progress');
      await sleep(900);
      await shot('progress', { full: true });
      await store((s, ui) => ui.getState().go('checkin'));
      await sleep(900);
      await shot('checkin-locked', { full: true });
      await store((s) => s.setState({ checkins: s.getState().checkins.slice(0, 4) }));
      await sleep(500);
      await shot('checkin-open', { full: true });
      await click('Start the check-in');
      await sleep(700);
      const radios = page.getByRole('radio', { name: 'A lot' });
      const count = await radios.count();
      for (let i = 0; i < count; i++) await radios.nth(i).click();
      await sleep(300);
      await shot('checkin-form-complete');
      await click('Save check-in');
      await sleep(900);
      await shot('checkin-saved', { full: true });
      await store((s, ui) => ui.getState().go('progress'));
      await store((s) => s.setState({ sessions: [], urges: [] }));
      await sleep(700);
      await shot('progress-empty', { full: true });
    },
    async guide() {
      await ready(20);
      await click('Guide');
      await sleep(900);
      await shot('guide', { full: true });
      for (const id of ['oneRead', 'sealedBox', 'thoughtSorter', 'letItSit']) {
        await store((s, ui, a) => ui.getState().openTutorial(a), id);
        await sleep(900);
        for (let k = 0; k < 4; k++) {
          await sleep(k === 1 ? 2300 : 1100);
          await shot(`tutorial-${id}-${k + 1}`);
          if (k < 3) await click('Next');
        }
        await click('Got it');
        await sleep(500);
      }
      // first play of a game in Daily Training opens its tutorial
      await ready(20);
      await store((s) => s.setState({ seenTutorials: { oneRead: false, sealedBox: false, thoughtSorter: false, letItSit: false } }));
      await click("Start today's practice");
      await sleep(700);
      await click('Begin');
      await sleep(1000);
      await shot('training-first-play-tutorial');
      await click('Skip');
      await sleep(900);
      await shot('oneread-intro-with-help-link');
    },
    async settings() {
      await ready(20);
      await click('Settings');
      await sleep(900);
      await shot('settings', { full: true });
      await click('Delete all data');
      await sleep(700);
      await shot('settings-delete-confirm');
      await click('Keep my data');
      await sleep(400);
      await click('Find help');
      await sleep(800);
      await shot('help');
      await store((s, ui) => ui.getState().go('why'));
      await sleep(800);
      await shot('why');
      await store((s, ui) => ui.getState().go('about'));
      await sleep(800);
      await shot('about', { full: true });
      await store((s, ui) => ui.getState().showHelpForRise());
      await sleep(800);
      await shot('help-after-rise');
    },
  };

  for (const [key, scene] of Object.entries(scenes)) {
    if (filter && !filter.split(',').includes(key)) continue;
    try {
      await scene();
      console.log(`[${name}] ${key} ok`);
    } catch (err) {
      console.log(`[${name}] ${key} FAILED: ${String(err).split('\n').slice(0, 14).join(' | ')}`);
      await shot(`FAILED-${key}`).catch(() => {});
    }
  }
  if (errors.length) console.log(`[${name}] console errors:\n  ${[...new Set(errors)].join('\n  ')}`);
  await browser.close();
}

for (const [name, vp] of Object.entries(VIEWPORTS)) {
  if (which !== 'all' && which !== name) continue;
  await run(name, vp);
}
