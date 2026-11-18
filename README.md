# First Spike

A personal path of tiny spiking-network levels for one reader. Each level is a few swipeable cards, about three to five minutes. It is meant to feel like a calm game: a winding path, a small neuron that reacts, a streak flame, an XP ring, and three hearts. It is not a copy of anyone else's branding.

The same path can hold another subject later. A course is a folder of data files.

Progress stays on the phone. A new install opens on the November 17 save: levels 1–15 cleared, 220 XP, a one-day streak, delta encoding due for review, and reward-modulated STDP in progress. If the phone is wiped, enter `NOV17-220` under Profile → Restore.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open [http://127.0.0.1:47321/snn-daily/](http://127.0.0.1:47321/snn-daily/). The dev server is rooted at `/snn-daily/` so it matches GitHub Pages.

Offline check:

```bash
npm run build
npm run preview
```

Load the app once, then reload with the network off. The path, the open level, and review still work.

## A level

Three to six cards. One idea each, in big type. Numbers come before any name. A full equation is never shown. Level 1 is a leaky bucket: sliders for the hole and the brim, and buttons to pour or wait.

Questions are one tap: a choice, a number, yes or no, or a slider. The why is one line. A miss costs a heart and shows a simpler card. A slow correct answer does too. A fast correct answer can skip the next card. Misses and slow answers come back on a later day (SM-2). Papers sit behind Go deeper, only after the idea, and only in the level file's `deeper` field. The play screen keeps them out of the card stack. Profile and the level JSON are where the citation lives.

## Add a course

```
content/courses/robots/course.json
content/courses/robots/levels/001-reach.json
```

`course.json` names the units. Each level file is schema version 2: `course`, `unit`, `order`, `title`, `summary`, `cards` (3–6), `recall`, optional `deeper`, optional `bonus`. Card kinds are `say`, `numbers`, `piece`, `toy`, and `ask`. Question kinds are `choice`, `number`, `boolean`, and `slider`. A toy is a string id. `leaky-bucket` is built in. An unknown id does not crash the path.

Set `"widget": true` on the course that should feed `/today.json`.

## November 17 save

`src/seed/default-progress.json` is applied when the phone has no saved progress.

- Levels 1–15 are complete. After the first nine come spikes between layers, the refractory period, rate coding, time-to-first-spike, STDP, and the STDP window.
- Level 16, reward-modulated STDP, is in progress.
- Level 4 stays a weak spot. The change is measured from the last sent value, not the previous reading. Review replays a step-by-step animation.
- 220 XP. Streak 1, dated November 17, 2026. Restore code: `NOV17-220`.
- Finishing a level names the proper terms and files them in the Glossary. A missed word is sent to Review.

## Widget

`widget/snn-widget.js` is a Scriptable script. `BASE_URL` is `https://prxshxntray.github.io/snn-daily`. It reads `/today.json`, shows the day's level and a recall question, hides the answer, caches the last feed, and asks iOS to refresh at 7:05.

1. Install Scriptable.
2. Paste the script.
3. Run it once while online.
4. Add a small or medium Scriptable widget and pick the script.

## Deploy

GitHub Pages, project site `/snn-daily/`. Pushing `main` runs `.github/workflows/pages.yml`, which tests, builds, and deploys `dist/`. Asset URLs are prefixed with `/snn-daily/`.

For Vercel, set the project base to `/` in `vite.config.ts` and the manifest `start_url` / `scope` to match, then build. The Pages workflow is the path this repo is set up for.

There is no server and no web push. iOS cannot deliver push from a static site. The widget is the morning reminder.
