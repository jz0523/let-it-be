# Let It Be — Practice Game Design Doc

Nov 24, 2026 · @Jimmy

## Overview

Let It Be is a cute, chibi-style web game that turns evidence-based OCD self-help exercises into short daily tasks. The player does not learn to feel calm on demand. The player practises carrying on while a worry is still present, which is the skill that exposure and response prevention (ERP) trains.

**Working title:** Let It Be (placeholder).

**Who v1 is for:** people with checking, rereading, reassurance-seeking and health-worry patterns. Contamination, ordering and other subtypes are out of scope for v1.

**What it is not:** a treatment, a diagnostic tool, a chatbot, or a relaxation app. It is a practice aid that can sit alongside therapy or self-directed work.

| Decision | Choice |
| --- | --- |
| Scope | Checking, rereading, reassurance and health-worry patterns only |
| Content | Fixed, hand-written content bank. No model calls at runtime |
| Language | English |
| Platform | Responsive web, phone and desktop |
| Data | Stored on the device only. No account, no server |
| World | A small "what-if" creature the player learns to leave alone (proposed, not yet confirmed) |

## Clinical basis

Every mechanic maps to an established treatment principle, but the game itself is untested. The principles have evidence. This specific product has none until it is measured (see Progress and measurement).

| Principle | What it says | Where it shows up in the game |
| --- | --- | --- |
| Exposure and response prevention | Face the trigger and do not perform the ritual. Exposure without ritual prevention does not work | One Read, Sealed Box, Urge Mode |
| Reassurance and distraction maintain OCD | Reassurance works like a compulsion. Distraction during exposure is a known therapist error | No character ever reassures. Urge Mode offers nothing to do in the app |
| Inhibitory learning | The goal is learning "I can tolerate this and the feared outcome does not follow", not making anxiety drop in the session | Rewards go to carrying on, never to feeling better |
| Tolerance of uncertainty | The need to feel 100% sure drives checking and rereading | Sealed Box, rounds with no feedback |
| Cognitive training on appraisals | Brief daily practice choosing adaptive over catastrophic interpretations reduced OCD beliefs and symptoms in small trials (GGOC, GGRO) | Thought Sorter |
| Thought suppression backfires | Trying not to think a thought makes it return more | The creature is never fought or dismissed |
| Defusion (ACT) | Notice a thought as a thought and return to the task | Let It Sit |

**Limits of the evidence**

- The game-based and app-based studies are small, short, and mostly in students or community samples.
- A meta-analysis of unguided digital self-help for OCD found it beats waitlist, with stronger effects when ERP is included and when use lasts more than 4 weeks.
- ERP delivered by a trained therapist remains the first-line treatment. Nothing here replaces it.

## Design rules

These eight rules override every other design choice. Each exists because the obvious game-design default would turn the game into a new compulsion.

1. **Never reassure.** No text, character or result may tell the player that their feared outcome is false or that they are fine.
2. **Reward carrying on, not relief.** Points come from continuing without checking. They never come from accuracy, speed, or a lower anxiety rating.
3. **No streaks.** There is no consecutive-day counter and no penalty or guilt message for missed days. Progress is cumulative only.
4. **Daily cap.** Daily Training is one session of 3 to 5 minutes, then it locks until the next day. Mini-games cannot be replayed for more points.
5. **Deliberate imperfection.** Some results are never revealed. Some rounds have no correct answer. There is no 100% completion state and no perfect score.
6. **No undo and no review.** The player cannot go back to a previous item, replay a sentence, or review past answers.
7. **Urge Mode is not entertainment.** It contains nothing to do except rate, set a timer, and leave.
8. **Scheduled over reactive.** The home screen leads with Daily Training at a time the player chose. Urge Mode is one tap away but visually secondary.

## World and characters

The intrusive thought is a small creature called a Whatif, and the whole game is about leaving it alone. This turns "let it be" into something the player can see.

**Whatif.** A round, fuzzy, slightly anxious creature with big eyes. It pops up holding a speech bubble that starts with "What if...?". It is not a villain. It is annoying, persistent and harmless.

- If the player taps it, argues with it or feeds it, it grows larger and louder.
- If the player leaves it alone and keeps working, it sits down, yawns, shrinks and falls asleep.
- It never disappears for good. It comes back on other days, and that is expected.

**The player's space.** A small cosy garden with a desk. Completed practice earns Sprouts, which grow plants and add small objects to the garden. The garden never finishes and nothing in it can wilt or be lost.

**Guide character.** A calm older plant or snail named Moss who gives instructions in one short line. Moss never comforts and never predicts outcomes.

**Visual style**

- Chibi proportions, thick rounded outlines, flat fills, soft shadows.
- Pastel palette: sage green, cream, peach, dusty lavender. No red alerts and no warning colours.
- Rounded typeface such as Nunito or Baloo 2.
- Slow, springy animation. No countdown clocks in training, no flashing, no confetti bursts for correct answers.
- Optional soft ambient sound, off by default.

## Game structure

The game has four parts: a capped daily session, an on-demand Urge Mode, a garden that grows, and a weekly check-in.

| Part | When | Length | Purpose |
| --- | --- | --- | --- |
| Daily Training | Once a day, at a time the player sets | 3 to 5 minutes | Skill practice across the mini-games |
| Urge Mode | When an urge to check or seek reassurance appears | Under 1 minute in the app, then a 5 to 30 minute delay away from it | Practise delaying the response |
| Garden | Passive, visible on the home screen | n/a | Shows cumulative practice |
| Weekly Check-in | Once every 7 days | 3 minutes | Symptom scale and trend chart |

**Daily Training flow**

1. Moss greets the player in one line.
2. Two mini-games run back to back, chosen by rotation so each appears about every other day. Roughly 90 seconds each.
3. One reflection tap: "How hard was it to keep going?" on a 5-point scale. This is logged and not scored.
4. Sprouts are added to the garden. The session locks with the line "That's today's practice. See you tomorrow."

**Difficulty.** Each mini-game has 5 levels. A level rises after 3 sessions in which the player carried on without peeking or rereading in at least 70% of rounds. Levels never drop automatically. The player can lower a level by hand at any time.

**Onboarding (first launch, about 2 minutes)**

1. What this is and is not (see Safety and disclaimers).
2. Meet the Whatif. A 30-second interactive demo: tap it and it grows, leave it and it sleeps.
3. Pick a daily practice time. Optional reminder notification.
4. Baseline Weekly Check-in.

## Mini-games

Version 1 ships four mini-games, each targeting one habit. In all four, a Sprout is earned for continuing, never for being right.

### 1. One Read

**Targets:** rereading and the need to feel sure a sentence was understood.

- A sentence appears on a card for a fixed time, then the card flips away for good.
- The player taps "Next". There is no replay button.
- On about 1 round in 3, a simple question about an earlier card follows. On the other rounds nothing is asked.
- Feedback on questions is shown only half the time. The rest get "Answer saved" and no result.
- **Scoring:** 1 Sprout per card passed. Wrong answers cost nothing.
- **Levels:** display time shortens from about 6 seconds to about 2. Sentences grow from 8 words to about 25. At level 4 and above, a Whatif appears saying "What if you missed something?".
- **Rounds per session:** 8 cards.

### 2. Sealed Box

**Targets:** checking and intolerance of uncertainty.

- The player does a trivial task: pack 3 to 5 named items into a box from memory, then seal it.
- The box is carried along a path. A "Peek inside" button stays on screen the whole way. A Whatif walks alongside saying "What if you forgot one?".
- If the player does not peek, the box is delivered. Most boxes are never opened, so the player never learns whether the packing was right.
- If the player peeks, the box opens and shows its contents. No penalty message. That round earns no Sprout.
- **Scoring:** 1 Sprout per box delivered without peeking.
- **Levels:** longer path, more items, more insistent Whatif. At level 5, the peek button pulses gently.
- **Rounds per session:** 4 boxes.

### 3. Thought Sorter

**Targets:** catastrophic appraisals of intrusive thoughts. Modelled on the GGOC training format.

- A statement appears on a leaf. The player drags it toward themselves to keep it or flicks it away to let it drift off.
- Keep: statements that accept uncertainty or treat thoughts as thoughts. Example: "I can carry on without being sure."
- Let go: statements that demand certainty or inflate threat. Example: "I have to check until it feels right."
- **Content rule:** no statement may assert a factual outcome such as "I am healthy" or "Nothing bad will happen". Those are reassurance.
- **Scoring:** 1 Sprout per statement sorted, in either direction. If the direction does not match, Moss shows the intended one in a single line with no error styling.
- **Levels:** statements become subtler. Later levels include reassurance in disguise, such as "I checked, so I know it's fine", which belongs in the let-go pile.
- **Rounds per session:** 10 statements. Content bank for v1: at least 120 statements, tagged by theme and level.

### 4. Let It Sit

**Targets:** engaging with intrusive thoughts instead of returning to the task.

- The player does a simple, absorbing garden task, such as watering plants in sequence.
- Whatifs pop up at the edge of the screen with "What if...?" bubbles. Their content is generic: "What if you got it wrong?", "What if you should double-check?".
- Tapping a Whatif opens its bubble, makes it grow, and spawns a second one. Leaving it alone for about 10 seconds makes it sit down and doze.
- Whatifs never fully leave the screen during a round. The round ends with one or two asleep in the corner.
- **Scoring:** 1 Sprout per Whatif that falls asleep untouched.
- **Levels:** more Whatifs, more movement, bubbles that overlap the task area.
- **Round length:** 90 seconds.

## Urge Mode

Urge Mode does one thing: it puts a delay between an urge and the response. It is the only part of the game meant for moments of distress, and it is built to be left quickly.

**Flow**

1. The player taps "A Whatif showed up" on the home screen.
2. Rate the discomfort from 0 to 10 on a slider.
3. Pick the urge, optional: check, reread, search online, ask someone, other.
4. Pick a delay: 5, 10, 15 or 30 minutes. The default is the last one used.
5. A Whatif sits down on screen. Moss says: "It can stay. Go back to what you were doing." The screen dims and shows only the timer. The player is expected to leave the app.
6. When the timer ends, a notification or in-app prompt asks for a second 0 to 10 rating and one question: "Did you act on the urge?" Yes, no, or partly. All three answers get the same neutral response.
7. The two ratings are added to the player's delay chart.

**It must never**

- Offer facts, statistics or any answer about the feared topic.
- Offer games, breathing animations or other things to do while waiting.
- Praise a lower second rating or comment on a higher one.
- Allow more than one timer at a time, or a new timer within 10 minutes of the last one ending.

**Sprouts:** 1 for completing the second rating, whatever the answers. Acting on the urge does not forfeit it. Honest logging matters more than the outcome.

## Progress and measurement

The game tracks two things separately: practice, which it rewards, and symptoms, which it only records. Mixing them would teach the player to chase a lower score.

**What earns Sprouts**

- Passing a card, delivering an unopened box, sorting a statement, leaving a Whatif alone.
- Completing an Urge Mode second rating.
- Completing a Weekly Check-in, whatever the score.

Sprouts only accumulate. There are no levels to max out, no leaderboards, no badges for perfect sessions.

**Weekly Check-in**

- Uses the OCI-R, an 18-item self-report scale scored 0 to 72. It takes about 3 minutes.
- Available once every 7 days and locked in between, so it cannot become a checking ritual.
- Shows a simple line chart of the total over time. No colour coding, no "good" or "bad" labels.
- Confirm the scale's reuse terms before any public release. Item wording must be reproduced exactly.

**Behavioural data logged on the device**

| Measure | Source | Why it matters |
| --- | --- | --- |
| Peek rate | Sealed Box | Direct measure of checking under uncertainty |
| Whatif taps | Let It Sit | Engagement with intrusive prompts |
| Urge ratings, before and after delay | Urge Mode | Shows whether discomfort falls without the ritual |
| Acted on urge: yes, no, partly | Urge Mode | Response prevention in real life |
| Sessions completed per week | Daily Training | Adherence |

**Testing whether it works for one person**

- Take the baseline OCI-R at onboarding, then use the game for at least 4 weeks. The digital self-help evidence points to more than 4 weeks.
- One person's trend cannot prove the game works. Scores also drift with stress and life events.
- Before any public claim, run a small pilot with a clinician or a psychology research group.
- The settings screen offers a one-tap export of all data as JSON and CSV.

## Copy and tone guidelines

The voice is warm, brief and matter-of-fact, and it never comforts. Every line of copy must pass one test: would this sentence work as reassurance? If yes, cut it.

| Instead of | Write |
| --- | --- |
| "Don't worry, you're fine." | "The Whatif is here. You can keep going." |
| "Correct! Great job!" | "Done. Next one." |
| "You read it perfectly." | "You read it once. That's the practice." |
| "Feeling better?" | "How strong is it now, 0 to 10?" |
| "You broke your streak." | Nothing. Missed days are not mentioned. |
| "Oops, you peeked." | "Box opened. Next box." |

**Rules**

- One sentence per screen where possible. Twelve words or fewer.
- No exclamation marks on outcomes. Calm punctuation throughout.
- Never use "safe", "fine", "nothing to worry about", "definitely", "certainly" or "100%".
- Never name specific feared topics such as illnesses. Whatif bubbles stay generic.
- Praise effort in plain words, and rarely. "You kept going" is the strongest praise in the game.
- Use "practice", not "treatment", "therapy" or "cure".

## Safety and disclaimers

The game states plainly, at first launch and in settings, that it is a practice tool and not medical care.

**Onboarding notice (draft copy)**

> Let It Be is a practice game based on ideas from OCD therapy. It is not treatment and cannot diagnose anything. If worries or rituals take up more than an hour a day or get in the way of your life, a therapist trained in ERP can help.

**Always available in settings**

- A "Find help" page pointing to the International OCD Foundation's therapist directory.
- A crisis line: in the US, call or text 988. Other regions need their own number before release there.
- A "Why won't the game reassure me?" page explaining the design in 3 sentences.
- Export and delete-all-data buttons.

**Product safeguards**

- No free-text input anywhere in v1, so nothing sensitive is typed or stored.
- All data stays in the browser. No analytics, no third-party scripts.
- If the Weekly Check-in total rises for 3 check-ins in a row, show the "Find help" page once, in neutral wording.
- If Urge Mode is opened more than 5 times in a day, Moss says once: "Lots of Whatifs today. Practice still counts. A therapist can help with busy days."
- Minimum age and privacy wording to be settled before public release.

## Technical spec for Claude Code

Build a static, client-only web app with no backend. Everything below is a recommendation except the constraints marked as required.

**Stack**

- React, TypeScript and Vite. Tailwind CSS for styling. Framer Motion for animation.
- Characters and scenery drawn as inline SVG components, so no external art assets are needed for v1.
- State in Zustand or React context, persisted to IndexedDB or localStorage.
- Installable as a PWA. Web Notifications for the daily reminder and the Urge Mode timer, with an in-app fallback when permission is denied.
- Recharts or a hand-rolled SVG for the two charts.

**Required constraints**

- No network requests after load. No analytics. No accounts.
- Responsive from 360px phone width to desktop. Touch and mouse both work for drag gestures.
- Respect `prefers-reduced-motion`. Meet WCAG AA contrast with the pastel palette.
- All game copy and content live in JSON files under `/content`, never hard-coded in components.
- The Design rules section is enforced in code: daily lock, no replay, no back navigation inside a mini-game, Weekly Check-in lock, Urge Mode cooldown.

**Screens**

| Screen | Contents |
| --- | --- |
| Onboarding | Notice, Whatif demo, practice time, baseline check-in |
| Home | Garden, "Start today's practice" button, smaller "A Whatif showed up" button, Sprout count |
| Daily Training | Two mini-games in sequence, reflection tap, lock screen |
| Urge Mode | Rating, urge type, delay picker, timer, follow-up rating |
| Weekly Check-in | OCI-R form, total, trend chart |
| Progress | Peek-rate chart, urge delay chart, sessions per week |
| Settings | Practice time, sound, level overrides, Find help, export, delete data |

**Data model (sketch)**

```ts
type GameId = 'oneRead' | 'sealedBox' | 'thoughtSorter' | 'letItSit';

interface Profile {
  createdAt: string;
  practiceTime: string;          // "21:00"
  levels: Record<GameId, 1 | 2 | 3 | 4 | 5>;
  sprouts: number;
}

interface TrainingSession {
  date: string;                  // one per calendar day
  games: { id: GameId; level: number; rounds: number; carriedOn: number }[];
  effortRating: 1 | 2 | 3 | 4 | 5;
}

interface UrgeEntry {
  startedAt: string;
  urgeType?: 'check' | 'reread' | 'search' | 'ask' | 'other';
  delayMinutes: 5 | 10 | 15 | 30;
  ratingBefore: number;          // 0-10
  ratingAfter?: number;
  actedOn?: 'yes' | 'no' | 'partly';
}

interface WeeklyCheckin {
  date: string;
  answers: number[];             // 18 items, 0-4
  total: number;                 // 0-72
}
```

**Content files**

- `content/sentences.json`: One Read cards with `text`, `level`, optional `question` and `options`. Neutral everyday topics only. At least 150.
- `content/boxes.json`: Sealed Box item sets by level. At least 40.
- `content/statements.json`: Thought Sorter items with `text`, `keep: boolean`, `theme`, `level`. At least 120.
- `content/whatifs.json`: generic Whatif bubble lines. At least 30.
- `content/copy.json`: all interface and Moss lines.

**Build order**

1. App shell, routing, storage layer, design tokens, Whatif and Moss SVG components.
2. One Read and Sealed Box, with the daily lock.
3. Urge Mode with timer and notifications.
4. Thought Sorter and Let It Sit.
5. Garden and Sprout growth.
6. Weekly Check-in, Progress charts, export.
7. Onboarding, Settings, safety pages, accessibility pass.

## Open questions

Five decisions are still open, and the first two should be settled before the build starts.

- [ ] World concept: keep the Whatif creature and garden, or switch to another theme?
- [ ] Name: is "Let It Be" the title, or a placeholder?
- [ ] Who writes the content bank? The Thought Sorter statements need a clinician's review before public release.
- [ ] OCI-R reuse terms for a public app. If they are restrictive, pick another validated scale.
- [ ] Should One Read sentences come from neutral trivia, or from the player's own reading material in a later version?

**After v1**

- A personal exposure ladder, where the player builds and works through their own hierarchy. This is the core of real ERP and needs careful design and clinical input.
- Other subtypes: contamination, ordering, intrusive thoughts about harm.
- Model-generated content, reviewed offline before it enters the bank. Never live generation in response to a player's worry.
- A pilot study with a clinician or psychology research group.

## References

The first six sources were found by web search for this doc. The last five are cited from memory and should be verified before they appear in anything public.

**Found by search**

- Gillihan, Williams, Malcoun, Yadin and Foa (2012). Common pitfalls in exposure and response prevention for OCD. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC3423997)
- Roncero, Belloch and Doron (2019). Can brief, daily training using a mobile app help change maladaptive beliefs? Crossover randomized controlled trial. [JMIR mHealth](https://mhealth.jmir.org/2019/2/e11443)
- GGOC-AD randomized controlled trial in adolescents (2026). [Abstract](https://ifp.nyu.edu/2026/journal-article-abstracts/camh-70110/)
- Investigation of a mobile "serious game" in the treatment of OCD: a pilot study (2018). [PubMed](https://www.pubmed.gov/30129775/)
- Unguided computer-assisted self-help interventions without human contact in patients with OCD: systematic review and meta-analysis (2022). [JMIR](https://www.jmir.org/2022/4/e35940/)
- American Psychological Association, Monitor on Psychology (2026). OCD diagnosis and treatment. [Article](https://www.apa.org/monitor/2026/04-05/obsessive-compulsive-disorder-diagnosis-treatment)

**From memory, to verify**

- Craske et al. (2014). Maximizing exposure therapy: an inhibitory learning approach. Behaviour Research and Therapy.
- Wegner et al. (1987). Paradoxical effects of thought suppression. Journal of Personality and Social Psychology.
- Foa et al. (2002). The Obsessive-Compulsive Inventory: development and validation of a short version (OCI-R). Psychological Assessment.
- Twohig et al. (2010). A randomized clinical trial of acceptance and commitment therapy versus progressive relaxation training for OCD. Journal of Consulting and Clinical Psychology.
- Rachman and de Silva (1978). Abnormal and normal obsessions. Behaviour Research and Therapy.
