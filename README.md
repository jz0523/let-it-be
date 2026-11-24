# Let It Be

A static, client-only practice game built from `Let It Be — Practice Game Design Doc.md`.
No backend, no accounts, no analytics. Everything is stored in the browser.

**Play it:** https://jz0523.github.io/let-it-be/

It is a practice aid, not treatment. See "Before any public release" below for what is still a draft.

## Run it

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then build to dist/
npm run check:content
```

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the content bank, builds
with `BASE_PATH=/<repo name>/` and publishes `dist/` to GitHub Pages.

## Where things live

| Path | What |
| --- | --- |
| `content/*.json` | All game copy and the content bank. Nothing is hard-coded in components. |
| `src/store.ts` | State, persistence (localStorage), and the design rules enforced in code: daily lock, no replay, check-in lock, Urge Mode cooldown. |
| `src/games/` | The four mini-games. |
| `src/screens/` | Onboarding, Home, Daily Training, Urge Mode, Check-in, Progress, Settings, safety pages. |
| `src/art/` | Whatif, Moss, the garden and other inline SVG. |
| `scripts/shots.mjs` | Drives the dev server in Edge and saves a screenshot of every screen. |

## Development tools

In a dev build, Settings ends with a "Developer tools" box: jump the clock a day or a week,
unlock today's practice, end a running timer, open any game alone, set levels.
None of it exists in a production build.

## Before any public release

- **Weekly Check-in items are stand-ins.** `content/checkin.json` holds 18 original draft items,
  not the OCI-R. The OCI-R's reuse terms for a public app are unconfirmed, so its wording is not
  included. Once a licensed scale is chosen, replace the items and set `"validated": true`.
- **Thought Sorter statements need a clinician's review.** They are a first draft.
- **Reminders only fire while the game is open or installed and running.** A static site has no
  server to send push notifications.
- Crisis line, minimum age and privacy wording are US-only or unset, as in the design doc.
