# Loop — Master Engineering Brief

**Supersedes `LOOP_REMEDIATION_BRIEF.md`.** This is the complete brief: a finished audit of the
codebase, a two-tier roadmap from "doesn't work" to "shippable product," and the operating rules
for executing it.

Audit date: 3 September 2026 · 51 source files · 9,665 lines · 74 findings.

Read this file completely before touching code. **Do not re-audit.** Every finding below was
confirmed by reading the cited line. Re-deriving them wastes effort and risks contradicting work
already in flight.

---

# §0 · Operating contract

These rules are what separate a useful engineering session from a plausible-looking one. Follow
them literally.

## 0.1 Ground every claim

- **Never state that something works unless you ran it.** If you did not execute the check, write
  "NOT VERIFIED" instead of implying success.
- **Cite `file:line` for every claim about the code.** If you cannot cite it, you have not
  confirmed it — go read the file.
- **Report failures verbatim.** Paste the actual output. Never summarise a failure as a success,
  never write "should now work," never move on silently.
- **If you skip part of a task, say so explicitly and say why.** Partial work reported as complete
  is worse than no work.
- **Do not agree reflexively.** If the user proposes something you believe is wrong, say so once,
  clearly, with your reasoning — then follow their decision if they reaffirm it.

## 0.2 Minimal, surgical diffs

- **Change only what the finding names.** No drive-by reformatting, renaming, or "improvements"
  next to your edit. A 400-line diff for a 6-line fix is a failed fix — it cannot be reviewed.
- **Never rewrite a whole file** when editing a few lines will do. If you find yourself
  regenerating a file, stop: you are about to silently drop code you never read.
- **Never delete code you do not understand.** If something looks dead, prove it with a repo-wide
  search, quote the search, then remove it.
- **Match the surrounding style.** Functional React components, `StyleSheet.create` at the bottom
  of each file, theme tokens via `useTheme()`, named exports for utils. Stay inside that.

## 0.3 Do not invent

- **No new dependencies** unless a finding requires one. Name it, justify it, confirm before
  installing.
- **No guessed APIs.** If unsure how a Firebase, Expo, or Gemini call behaves, read the installed
  package in `node_modules` or say you are unsure. Never invent a method name.
- **No fabricated test results, screenshots, or data.**
- **No placeholder identities.** This project already ships a bug caused by demo personas (F—38).
  Never introduce "John Doe", "Acme", "test@example.com", or invented round numbers.

## 0.4 Ask vs. assume

Make routine judgment calls yourself. Stop and ask **only** when the answer changes what you build
and the repo cannot tell you — see §11 for the questions already known to need answers. When you
proceed on an assumption, state it in one line and continue. Do not stall an entire task on a
question you could flag and move past.

## 0.5 Scope discipline

- Work **one phase at a time**, in order. The phases are dependency-ordered: P—03 is unverifiable
  without P—01's auth, and P—04 is wasted before P—02 settles the schema.
- Within a phase, work **one finding at a time** and state the ID you are on.
- If you find a new problem mid-phase, **record it as a new finding (F—48+, T—28+) and keep
  going.** Do not expand the current fix to absorb it.

## 0.6 Reporting format

After each finding:

```
F—NN  <short title>
Changed:  path/to/file.ts:120-134  (+8 / -3)
What:     one sentence on the actual change
Verified: <command run and its real result, or "NOT VERIFIED — reason">
```

At phase end: every ID as `fixed` / `partial` / `skipped`, with a reason for anything unfixed.

---

# §1 · The project

**Loop** is a campus event discovery and concierge app for IIT Delhi. Students otherwise track
~39 club and board Instagram accounts by hand; Loop aggregates them into one feed.

A monorepo of two subsystems joined by exactly one contract: the Firestore `events` collection.

```
LOOP/
├── loop-app/          React Native + Expo SDK 57, react-native-web. TypeScript strict.
│   ├── App.tsx                 root; nav state, modals, one of two event fetches
│   ├── src/screens/            Home, Pulse, Directory, Curate, Submit, Queue
│   ├── src/components/         EventCard, EventDetailModal, TopBar, StudentAuthModal, …
│   ├── src/theme/              "Crimson & Onyx" tokens — colors, typography, spacing
│   ├── src/utils/              auth, storage, calendar, linking, geminiAI, geminiParser
│   ├── src/data/               static seed data + TypeScript types
│   ├── src/config/firebase.ts  Firestore client init
│   ├── firestore.rules         ← centre of gravity for phase 1
│   ├── app.json / eas.json     Expo + build config
│   └── firebase.json           Hosting + rules deploy config
└── loop-scraper/      Python + Node ingestion
    ├── scraper.py              PRIMARY: Apify → Gemini Vision → Cloudinary → Firestore
    ├── puppeteer_scraper.js    fallback Instagram scraper
    ├── gemini_parser.py        second, drifted parser (see F—45)
    └── seed_data.py, stock_scraper.py, generate_*.py, wipe_db.py, purge_and_reset.py
```

**Data flow.** The scraper writes events with `status: 'pending'`. A coordinator approves them in
the Queue screen, flipping `status` to `'approved'`. The Home feed reads only `'approved'`.

**Baseline.** `npx tsc --noEmit` passes clean under `strict`. Keep it that way — it is the
cheapest regression net you have. There are no tests and no linter.

**Repo layout warning.** `loop-app` is its own git repo (`git@github.com:prathamkathi/loop-app.git`)
and is clean of secrets. **The LOOP root is not a git repository at all.** Do not assume one repo.

## 1.1 The knowledge graph

A `graphify` graph of this repo exists at `.graphify/graph.json` — 239 nodes, 382 edges, 19 named
communities — with a browsable studio at `.graphify/studio/studio.html`.

```bash
graphify summary --graph .graphify/graph.json     # ~400 tokens vs ~97K to read the tree
graphify explain "QueueScreen.tsx"
graphify update .                                  # after each phase; AST-only, no API key
```

It is **structural only** (imports, calls, containment). It locates code; it does not review it.
Every bug fix still requires reading the real file.

---

# §2 · Design constraints

This project has an existing design system. Do not replace it. Do not add a second one.

- **Colors** come from `src/theme/colors.ts` via `useTheme()`. Light: alabaster `#FDFCF8` ground,
  crimson `#8A1538` primary, onyx `#18181B` accent. Dark: obsidian `#0A0A0C`, crimson lifts to
  `#C44D6A`. **Never hardcode a hex in a component** — there are already 32 violations outside the
  theme layer; do not add a 33rd.
- **Typography** is Outfit (display) + Geist (body), declared in `src/theme/typography.ts`. They
  are declared and never loaded — see F—28.
- **Spacing and radii** come from `src/theme/spacing.ts`.
- **The repo vendors two design skills** at `skills/frontend-skill.md` and `skills/ui-ux-skill.md`.
  Read both before any UI work. Their rules are binding here: no Inter/Roboto, inputs ≥16px to
  avoid iOS zoom, accessibility is the top-priority category, mobile-first, no placeholder content.

---

# §3 · The roadmap

Two tiers with a pilot between them. **The pilot is not optional** — it is what tells you which
half of tier 2 you actually need.

```
TIER 1 — make it work and make it safe            74 findings total
  P—01  Close the identity hole            F—01…F—09      ← blocked on user
  P—02  Settle the event contract          F—14,15,20,26,40
  P—03  Make the dead features live        F—10…F—13, F—16…F—27
  ────────────────────────────────────────────────────────
  ▶ PILOT GATE — one club, ~20 students, two weeks
  ────────────────────────────────────────────────────────
  P—04  UI, UX & accessibility             F—28…F—42
  P—05  Consolidate & put a net under it   F—43…F—47

TIER 2 — make it shippable
  P—06  Release engineering                T—01…T—07     ← blocked on user
  P—07  Resilience & observability         T—08…T—11
  P—08  Scale & cost control               T—12…T—16
  P—09  Product completeness               T—17…T—22
  P—10  Compliance & quality               T—23…T—27     ← blocked on user
```

**What each tier buys you.** Tier 1 takes the app from "core flows broken and anyone can publish
to the campus feed" to "works as described, safe to put in front of students." Tier 2 takes it
from "a good app you can pilot" to "a product you can list on an app store and operate."

Do not attempt tier 2 before the pilot. Half of it is speculative until real users touch the app.

---

# §4 · Tier 1 — make it work and make it safe

## P—01 · Close the identity hole
**Findings:** F—01 … F—09
**Files:** `firestore.rules`, `QueueScreen.tsx`, `SubmitScreen.tsx`, `geminiAI.ts`,
`geminiParser.ts`, `App.tsx`, root `.gitignore`, new Cloud Function

**Core problem:** there is no server-side identity anywhere in Loop. Every permission check in the
app is a React state variable. That one gap causes F—01 through F—07.

**Do:**
1. Add Firebase Auth. Coordinators get a custom claim (e.g. `coordinator: true`). An allowlist of
   club emails is an acceptable first implementation — note in your report that institute SSO is
   the real answer.
2. Rewrite `firestore.rules`: reading `pending` requires the coordinator claim; the update rule
   requires that claim **in addition to** the existing status-transition check; create requires an
   authenticated user and validates the full field set, not two strings.
3. Replace `password.length >= 4` and the demo-login button with real Firebase Auth sign-in.
4. Move every Gemini call into a Cloud Function. The client must never hold the key.
5. Switch Cloudinary to signed uploads issued by that same function.
6. Add `loop-scraper/serviceAccountKey.json` and `loop-scraper/session.json` to the root
   `.gitignore` **before any `git init`**. Do this first — it is free and it is the only
   irreversible risk in the repo.

**Exit criteria:**
- Against the Firestore emulator: an unauthenticated client cannot read a pending doc, cannot
  update any doc, cannot create a doc. An authenticated coordinator can read pending and can
  approve/reject. Paste the emulator output.
- `grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src` returns nothing.
- `npx tsc --noEmit` still clean.

**Blocked on user:** rotate the Gemini key (treat the current one as public), enable Firebase Auth,
enable billing for Cloud Functions.

## P—02 · Settle the event contract
**Findings:** F—14, F—15, F—20, F—26, F—40

**Core problem:** the two writers disagree about the document shape. The scraper writes
`date: "21 Apr"` (no year) and `confidence: 0.87`; the app writes `date: "2026-04-21"` and
`confidence: 87`. Neither writes `featured`, `day`, or `fillingFast` — all three of which the UI
renders. Nothing writes a sortable timestamp.

**Do:**
1. Define **one** canonical event document, including a real `startsAt` Firestore `Timestamp`
   alongside the human-readable `date` string the UI shows.
2. One confidence scale (recommend 0–1); convert at both writers.
3. `createdAt` as a Firestore `Timestamp` on both paths — the ISO string is why F—15 renders
   "Invalid Date".
4. Either populate `featured` / `day` / `fillingFast` at write time, or remove the UI bound to
   them. Do not leave UI reading fields nothing writes.
5. An idempotent, dry-run-by-default backfill script for existing documents.
6. Create `firestore.indexes.json`, register it in `firebase.json`, and add the composite indexes
   the sorted queries in P—03 will need. (Neither file exists today — see T—06.)

**Exit criteria:** one TypeScript type imported by every app-side reader and writer; the Python
writer's fields and types match it exactly — list them side by side in your report; backfill runs
dry and only writes behind an explicit flag.

## P—03 · Make the dead features live
**Findings:** F—10 … F—13, F—16 … F—27

**Core problem:** several features have finished UI and no data path. Users can operate them and
change nothing.

**Do, in this order:**
1. **F—10 first — the highest-impact bug in the app.** Trace it end to end: the system prompt at
   `geminiParser.ts:38` demands a category from one vocabulary (`"BRCA Cultural"`,
   `"CAIC Technical"`, …); the validation at `geminiParser.ts:128` checks against
   `ALLOWED_CATEGORIES`, derived from a completely different list in `src/data/categories.ts`; so
   it nulls **every** category; so `SubmitScreen` falls back to `'Independent'`, absent from
   `CATEGORIES`; so no filter chip on Home can ever match. Fix by making the prompt emit the
   `CATEGORIES` vocabulary. One vocabulary, defined once.
2. Make `interests` actually filter the feed. State the semantics you chose — recommended:
   interests filter the "All" view; an explicit category chip overrides them.
3. Wire reminders. Needs `expo-notifications` (not currently a dependency — confirm first).
   Schedule on save, cancel on unsave, pass the offset through to `calendar.ts`.
4. Sort by `startsAt`; filter out past events.
5. Point Pulse at Firestore instead of the hardcoded array.
6. Replace the two independent one-shot `getDocs` calls with **one** shared `onSnapshot`
   subscription lifted to a context or hook.
7. Give every `catch` a user-visible outcome. Twelve currently only `console.error`, which is why
   a denied approve is indistinguishable from a card that refused to move.
8. Fix the stale-closure queue advance and delete the unused `currentIndex`.

**Exit criteria:** submitting an event through the app produces a doc whose `category` is one of
`CATEGORIES`, and that event appears under its chip on Home — demonstrate end to end. Toggling an
interest visibly changes the feed. A failed write shows the user something.

---

# §5 · ▶ THE PILOT GATE

**Stop here. Do not continue to P—04 until this has run.**

After P—03 the app works and is safe. Everything after this point is quality, scale, and
shipping — and which of it you need depends on what real use reveals.

**The pilot:** one club (BRCA is the obvious candidate — it is the apex cultural body and feeds
the most events), roughly 20 students, two weeks.

**What it is designed to surface,** none of which a static audit can find:
- Runtime and device bugs — layout on small Android screens, behaviour under real network latency,
  memory with a full feed of posters.
- Whether the approve/reject loop survives contact with actual coordinators.
- Whether Gemini's extraction accuracy on real current posters is good enough to trust, and where
  the confidence threshold should actually sit.
- Which tier-2 items are real and which are theoretical.

**Instrument it before you start:** T—09 (crash reporting) is a prerequisite for the pilot, not a
tier-2 nicety. Running a pilot blind wastes the pilot. Pull that one item forward.

**Exit criteria:** a written list of what broke, ranked. That list re-prioritises everything below.

---

# §6 · Tier 2 — make it shippable

## P—04 · UI, UX & accessibility
**Findings:** F—28 … F—42 · ~20 files

Read `skills/ui-ux-skill.md` and `skills/frontend-skill.md` first. They are binding.

1. **F—28 — load the fonts.** Outfit and Geist are declared, `expo-font` is a registered plugin,
   and nothing calls `useFonts`. The entire typographic identity is silently falling back to system
   faces on both platforms. Highest visual impact in the app.
2. **F—31 — accessibility.** 12 labels across 136 `Pressable` elements. One systematic pass:
   labels, roles, states. Not opportunistic.
3. **F—29 — tap-through.** `e.stopPropagation()` is a no-op in RN touch handling, so WhatsApp
   pills also open the detail modal. Restructure so the pill is outside the card's press target.
4. **F—30** — one `Image` per card, not two of the same URL.
5. **F—32** — inputs to ≥16px.
6. **F—33** — a themed splash instead of `null` while AsyncStorage resolves.
7. **F—38** — remove demo personas from production sign-in.
8. Then F—34 … F—37, F—39 … F—42.

**Exit criteria:** fonts visibly render as Outfit/Geist — state how you confirmed it. Report the
new accessibility ratio. Hardcoded-hex count outside the theme must not exceed 32 and should fall.

## P—05 · Consolidate & put a net under it
**Findings:** F—43 … F—47

1. Collapse six near-duplicate Python entry points into one CLI with subcommands; the duplicated
   `parse_with_gemini` and Cloudinary helpers become one shared module.
2. One source of truth for club handles. `docs/insta_ids.md` (45) is canonical; `skills/insta_ids.md`
   (41, disagreeing on `@enactus_iitd` vs `@enactus_iitdelhi`) goes; `scraper.py:24`'s hardcoded 27
   is parsed from the docs file at runtime.
3. Remove `react-native-svg` (zero references) and `@google/generative-ai` (superseded, and P—01
   moved Gemini server-side anyway).
4. CI: `tsc --noEmit`, a linter, tests around both parsers and the pure date parser in
   `calendar.ts`.
5. `git init` the LOOP root so `.github/workflows/scraper.yml` can run — it never has (F—09).

## P—06 · Release engineering
**Findings:** T—01 … T—07

The app cannot currently be built for iOS or updated without a store review. Fix the config before
you need it under time pressure.

1. **T—01** — add `ios.bundleIdentifier`. Without it EAS cannot build or submit for iOS at all.
2. **T—02** — remove `userInterfaceStyle: "light"` (or set `"automatic"`). It currently pins native
   to light appearance, so `useColorScheme()` always returns light and the app's entire dark theme
   plus its `mode: 'system'` path are dead on device. The splash is already obsidian `#0A0A0C`,
   so today a dark splash hands off to a forced-light app.
3. **T—03** — add a `scheme`. No deep linking today, which blocks shareable event links (T—19) and
   any OAuth redirect.
4. **T—04** — add `expo-updates` so fixes ship without a store cycle.
5. **T—05** — fill in the empty `eas.json` production profile: channel, env, `autoIncrement`.
6. **T—06** — create `firestore.indexes.json` and register it in `firebase.json` so indexes deploy
   as code rather than being clicked into the console.
7. **T—07** — cache headers in `firebase.json` hosting config; hashed assets get a long max-age,
   `index.html` does not.

**Blocked on user:** Apple Developer and Play Console accounts; the iOS bundle identifier they want.

## P—07 · Resilience & observability
**Findings:** T—08 … T—11

You cannot operate what you cannot see.

1. **T—09 first — crash reporting.** Pull this before the pilot. Sentry or Crashlytics; confirm
   which with the user.
2. **T—08** — an `ErrorBoundary` at the root. Today a single render error white-screens the whole
   app with no recovery.
3. **T—10** — Firestore offline persistence. `getFirestore()` is called with no cache config, so
   the app is dead on a weak connection.
4. **T—11** — a health check on the scraper. A silent ingestion failure is indistinguishable from
   a quiet week on campus. Alert on zero events ingested across N consecutive runs.

## P—08 · Scale & cost control
**Findings:** T—12 … T—16

Every metered service in this stack is currently unbounded.

1. **T—12** — no `limit()` exists anywhere. Every query fetches the entire collection. Paginate.
2. **T—13** — the feed is `ScrollView` + `.map()`; there is no `FlatList` in the codebase, so every
   card mounts at once. Combined with F—30's double image decode, this is the scale ceiling.
3. **T—14** — no Cloudinary transformation params anywhere. Full-resolution posters are being sent
   to phones. Adding `f_auto,q_auto,w_800` to delivery URLs is the single cheapest performance win
   available.
4. **T—15** — budget alarms on Apify, Gemini, Cloudinary and Firestore.
5. **T—16** — archival or TTL for past events. Nothing is ever deleted (F—25), so both the
   `approved` and `pending` queries grow forever.

## P—09 · Product completeness
**Findings:** T—17 … T—22

Capabilities the product implies but does not have. Re-rank these against the pilot's findings.

1. **T—17** — push notification infrastructure. F—12 fixes *local* reminders only; "BRCA just
   posted an event" needs FCM/APNs, a token store, and a sender. This is a project, not a fix.
2. **T—18** — first-run onboarding. Interests currently default to everything selected, silently.
3. **T—19** — event sharing. Needs T—03's scheme plus web fallback URLs.
4. **T—20** — a report/abuse path. You are publishing third-party content to a campus.
5. **T—21** — search is a client-side substring match over already-loaded events. It cannot find
   anything outside the current page once T—12 lands.
6. **T—22** — no club identity model. A coordinator is not tied to a club, which is why every
   submission is hosted by "Campus Club" (F—19). P—01's custom claim should carry a club ID.

## P—10 · Compliance & quality
**Findings:** T—23 … T—27

1. **T—23** — privacy policy and terms. Hard blockers for both the App Store and Play Store. The
   app collects a name, a Kerberos ID, and a hostel.
2. **T—24** — **decide the ingestion posture.** Automated Instagram scraping is against Meta's
   terms of service, and club posters are the clubs' copyright. For a private project this is
   noise; for a public app store listing that names 39 organisations it is real exposure. The
   lower-risk architecture is clubs submitting through the Studio you already built, with scraping
   as backfill — which is close to what you have. Raise this with the user; do not decide it
   yourself.
3. **T—25** — a data deletion path for the student profile. India's DPDP Act 2023 applies, and both
   stores require it independently.
4. **T—26** — a real accessibility pass beyond labels: contrast ratios against both themes,
   dynamic type, `prefers-reduced-motion` for the several `Animated.loop` uses.
5. **T—27** — Firestore backup and restore. There is none, and `wipe_db.py` and
   `purge_and_reset.py` both exist in the repo.

---

# §7 · Finding register A — the 47 audit findings

Severity: **P0** blocking · **P1** broken flow · **P2** UI/UX · **P3** hygiene.
Line numbers verified 2026-09-03.

## P0 — blocking

| ID | Finding | Location |
|----|---------|----------|
| F—01 | The update rule checks only the status transition, never `request.auth`. Any anonymous visitor can approve any pending event into the campus feed, or reject every real submission. | `firestore.rules:14-17` |
| F—02 | The read rule permits only `status == 'approved'`, but the Queue queries `status == 'pending'`. That query is denied in production and the catch only logs — coordinators see a permanent "All Caught Up" while events pile up. | `firestore.rules:6` · `QueueScreen.tsx:70,94` |
| F—03 | Studio login is `if (password.length >= 4)`, setting client state only. Any 4-character password works. | `QueueScreen.tsx:255-269` |
| F—04 | A "Demo Coordinator 1-Tap Login" button grants full moderation access with no credential, on the production sign-in screen. | `QueueScreen.tsx:271-276,352-365` |
| F—05 | The Gemini key is inlined into the web bundle via `EXPO_PUBLIC_`. Extractable from the deployed build, billable by anyone. The parser's own header says it "is NOT safe to call from the React Native client directly" — and two screens call it from the client. | `geminiAI.ts:4` · `geminiParser.ts:9-11,94` |
| F—06 | Cloudinary cloud name and unsigned preset are public in the bundle, making the upload endpoint an open image host on your quota. | `SubmitScreen.tsx:119-145` |
| F—07 | The create rule validates only that `title` and `image` are strings. No auth, no rate limit, no size cap, no field whitelist. | `firestore.rules:9-11` |
| F—08 | `serviceAccountKey.json` and `session.json` exist on disk and match no ignore pattern. That key bypasses every security rule. Uncommitted only because the root is not yet a repo. | root `.gitignore` |
| F—09 | `.github/workflows/scraper.yml` sits at the LOOP root, which is not a git repository. The six-hourly ingestion the product depends on has never run. | `.github/workflows/scraper.yml` |

## P1 — broken flows

| ID | Finding | Location |
|----|---------|----------|
| F—10 | Every user-submitted event is invisible in the feed. Prompt vocabulary ≠ validation list → category nulled → default `'Independent'` → absent from `CATEGORIES` → no chip matches. | `geminiParser.ts:38,30,128` · `SubmitScreen.tsx:44,174` |
| F—11 | Interest tags change nothing. `interests` is passed to Home and sits in the filter's dependency array, but is never read in the filter body. | `HomeScreen.tsx:79-104` |
| F—12 | Reminders are never scheduled. Full UI writes to AsyncStorage, nothing reads it back, `expo-notifications` isn't a dependency. | `CurateScreen.tsx:128-242` · `storage.ts:52` |
| F—13 | The feed is unsorted and never expires. Firestore order under a heading reading "Upcoming Feed"; past events stay forever. | `HomeScreen.tsx:52-71,106` |
| F—14 | Two date formats and two confidence scales in one collection. | `scraper.py:304,373` · `SubmitScreen.tsx:169,175` |
| F—15 | "Invalid Date" on every scraped queue item — a Firestore `Timestamp` passed to `new Date()`. | `QueueScreen.tsx:87` · `scraper.py:378` |
| F—16 | Pulse is a hardcoded array with frozen relative timestamps — "2h ago" forever. | `src/data/pulse.ts:14` |
| F—17 | Every queue card reads "Submitted via App", hardcoded, including scraped ones — though the doc carries the real `host` handle. | `QueueScreen.tsx:86` |
| F—18 | Submissions without a poster fall back to a specific Ankahi flyer — an unrelated club's poster on someone else's event. | `SubmitScreen.tsx:157` |
| F—19 | `host` and `hostAvatar` are hardcoded to "Campus Club" at submit time. | `SubmitScreen.tsx:177-178` |
| F—20 | With Cloudinary unconfigured, the whole image is written into the Firestore doc as a base64 data URI — past the 1 MB limit for most photos. | `SubmitScreen.tsx:123-126` |
| F—21 | The same approved-events query runs twice on every cold start, from `App.tsx` and `HomeScreen` independently. | `App.tsx:72-82` · `HomeScreen.tsx:52-71` |
| F—22 | Nothing refreshes. One-shot `getDocs` on mount; no `onSnapshot`, no pull-to-refresh, no refetch on focus. | `App.tsx:52` · `HomeScreen.tsx:52` |
| F—23 | Twelve catch blocks log to console and show the user nothing. | `HomeScreen.tsx:63` · `QueueScreen.tsx:94,140,155` |
| F—24 | `handleNext` slices the queue then indexes the pre-slice array from the same closure; `currentIndex` is never incremented despite `remaining` depending on it. | `QueueScreen.tsx:111-122` |
| F—25 | Rejected events accumulate forever — client deletes denied by rule, no cleanup job. | `firestore.rules:20` |
| F—26 | `featured`, `day`, `fillingFast` are written only by the offline seed script but rendered by the live UI. | `seed_data.py:147,155,166` · `HomeScreen.tsx:106` |
| F—27 | Ingestion silently caps at 2 posts per handle and `MAX_EVENTS = 15` per run — drops real events during fest weeks. | `scraper.py:219,245` |

## P2 — UI & UX

| ID | Finding | Location |
|----|---------|----------|
| F—28 | The app's typefaces are never loaded. Outfit and Geist declared, `expo-font` a registered plugin, no `useFonts` call anywhere. | `theme/typography.ts:14,19` · `app.json:32` |
| F—29 | `e.stopPropagation()` is a no-op in RN touch handling, so WhatsApp pills also open the detail modal. | `EventCard.tsx:202-206` |
| F—30 | Each card downloads and decodes its poster twice — blur backdrop plus contained foreground. | `EventCard.tsx:135-154` |
| F—31 | 12 `accessibilityLabel` props across 136 `Pressable` elements. | `loop-app/src/` |
| F—32 | `fontSize: 14` on text inputs causes iOS zoom-on-focus. | `HomeScreen.tsx:312` · `QueueScreen.tsx:752` |
| F—33 | `ThemeProvider` returns `null` until AsyncStorage resolves — blank frame on every web load. | `theme/ThemeContext.tsx:62-63` |
| F—34 | The Studio mode toggle sits ungated in the student top bar. | `TopBar.tsx:127-149` |
| F—35 | Studio mode opens on the student home screen — both tab sets share a `home` id. | `BottomTabBar.tsx:22-27` · `App.tsx:128-139` |
| F—36 | `notificationCount` is declared and never passed, so the unread dot can never render; the modal lists a hardcoded array. | `TopBar.tsx:16,164` |
| F—37 | Directory open/closed dots come from a static field, not opening hours. | `DirectoryScreen.tsx:160-167` |
| F—38 | Demo personas ("Aarav Sharma", "coordinator@brca.iitd.ac.in") are one tap away on shipped sign-in flows. | `StudentAuthModal.tsx:74-85` · `QueueScreen.tsx:271` |
| F—39 | Host avatars and Directory club images have no `onError` fallback. | `EventCard.tsx:183` · `DirectoryScreen.tsx:233-236` |
| F—40 | Free-text date/time entry, no picker, no validation — the upstream cause of F—13 and F—14. | `SubmitScreen.tsx:299-304` |
| F—41 | The saved-events filter uses rendered display text as its state value, matched by `startsWith`. A copy change breaks it. | `HomeScreen.tsx:74-86` |
| F—42 | `onToggleTheme` and `isDark` are passed into the desktop Sidebar and never used; a `themeToggle` style exists with nothing rendering it. | `Sidebar.tsx:11-13,181-188` |

## P3 — hygiene

| ID | Finding | Location |
|----|---------|----------|
| F—43 | Six near-duplicate scraper entry points with `parse_with_gemini` and Cloudinary helpers copy-pasted between them. | `loop-scraper/*.py` |
| F—44 | Three competing copies of the club handle list: 45 in docs, 41 in skills (disagreeing on one handle), 27 hardcoded in the scraper. | `docs/insta_ids.md` · `skills/insta_ids.md` · `scraper.py:24` |
| F—45 | `gemini_parser.py` duplicates the extraction `scraper.py` now does inline, still using the abandoned free-text category vocabulary — the Python twin of F—10. | `gemini_parser.py:38` |
| F—46 | `react-native-svg` has zero references; `@google/generative-ai` is Google's superseded SDK. | `loop-app/package.json` |
| F—47 | No tests, no lint, no CI type-check. Baseline is good: `tsc --noEmit` passes clean under `strict`. | `package.json` · `tsconfig.json` |

---

# §8 · Finding register B — production readiness

Config claims verified against the files on 2026-09-03.

## Release engineering

| ID | Finding | Location |
|----|---------|----------|
| T—01 | No `ios.bundleIdentifier`. EAS cannot build or submit for iOS at all. Android has `com.loop.iitd`; iOS has only `supportsTablet`. | `app.json:9-11` |
| T—02 | `userInterfaceStyle: "light"` pins native to light appearance, so `useColorScheme()` always returns light and the entire dark theme plus the `mode: 'system'` path are dead on device — while the splash is obsidian `#0A0A0C`. | `app.json:8` · `theme/ThemeContext.tsx:57` |
| T—03 | No `scheme` declared. No deep linking, which blocks shareable event links and any OAuth redirect. | `app.json` |
| T—04 | `expo-updates` is not installed. Every fix requires a full store review cycle. | `package.json` |
| T—05 | `eas.json`'s production build profile is an empty object — no channel, no env, no `autoIncrement`. | `eas.json` |
| T—06 | `firestore.indexes.json` does not exist and `firebase.json` does not reference one. Indexes are not deployed as code. | `firebase.json` |
| T—07 | Hosting config has an SPA rewrite but no cache headers, so hashed assets are revalidated on every load. | `firebase.json` |

## Resilience & observability

| ID | Finding | Location |
|----|---------|----------|
| T—08 | No `ErrorBoundary` and no `componentDidCatch` anywhere. A single render error white-screens the entire app with no recovery. | `loop-app/src/`, `App.tsx` |
| T—09 | No crash reporting and no analytics — no Sentry, Crashlytics, or Bugsnag. Failures in the field are invisible. **Prerequisite for the pilot.** | `package.json` |
| T—10 | No Firestore offline persistence. `getFirestore(app)` is called with no cache configuration. | `config/firebase.ts:16` |
| T—11 | No health check on the scraper. A silent ingestion failure looks exactly like a quiet week on campus. | `.github/workflows/scraper.yml` |

## Scale & cost

| ID | Finding | Location |
|----|---------|----------|
| T—12 | Zero `limit()` calls in the entire app. Every query fetches the whole collection. | `App.tsx:73` · `HomeScreen.tsx:55` · `QueueScreen.tsx:70` |
| T—13 | No `FlatList` or `VirtualizedList` anywhere — feeds are `ScrollView` + `.map()`, so every card mounts at once. Compounds F—30. | `HomeScreen.tsx:262` · `DirectoryScreen.tsx:214` |
| T—14 | No Cloudinary transformation parameters anywhere. Full-resolution posters are delivered to phones. Adding `f_auto,q_auto,w_800` is the cheapest performance win available. | `loop-app/src/` |
| T—15 | No budget alarms on Apify, Gemini, Cloudinary or Firestore — all metered, all currently unbounded. | infra |
| T—16 | No archival or TTL for past events; nothing is ever deleted, so both queries grow without limit. | `firestore.rules:20` |

## Product completeness

| ID | Finding | Location |
|----|---------|----------|
| T—17 | No push notification infrastructure. F—12 covers local reminders only; campus-wide push needs FCM/APNs, a token store and a sender. | — |
| T—18 | No first-run onboarding. Interests silently default to everything selected. | `App.tsx:63-68` |
| T—19 | No event sharing. Depends on T—03. | — |
| T—20 | No report or abuse path, on a product that republishes third-party content to a campus. | — |
| T—21 | Search is a client-side substring match over already-loaded events; it finds nothing outside the current page once T—12 lands. | `HomeScreen.tsx:91-101` |
| T—22 | No club identity model. A coordinator is not tied to a club — the root cause of F—19. P—01's custom claim should carry a club ID. | `QueueScreen.tsx:263` |

## Compliance & quality

| ID | Finding | Location |
|----|---------|----------|
| T—23 | No privacy policy and no terms. Hard blockers for both stores; the app collects name, Kerberos ID and hostel. | repo-wide |
| T—24 | Ingestion posture undecided: automated Instagram scraping is against Meta's ToS and club posters are the clubs' copyright. Material for a public listing naming 39 organisations. **User decision — see §11.** | `scraper.py` |
| T—25 | No data deletion path for the student profile. India's DPDP Act 2023 applies, and both stores require it independently. | `utils/auth.ts` |
| T—26 | No contrast audit against either theme, no dynamic type support, no `prefers-reduced-motion` handling for the several `Animated.loop` uses. | `EventCard.tsx:19` and others |
| T—27 | No Firestore backup or restore, in a repo that contains both `wipe_db.py` and `purge_and_reset.py`. | infra |

---

# §9 · Traps

Things that will actively mislead you.

1. **`gemini_parser.py` is not the live parser.** `scraper.py` has its own inline
   `parse_with_gemini` at line 100 with a *different, correct* category enum. Do not fix the
   category bug in the wrong file.
2. **The scraper's category enum is already correct.** `scraper.py:134-146` matches
   `src/data/categories.ts`. Only the client-side `geminiParser.ts` is wrong. Do not "align" the
   Python enum to the broken TypeScript one.
3. **`loop-app` is its own git repo; the LOOP root is not a repo at all.** Do not assume one.
4. **`tsc --noEmit` passes today.** If it starts failing, you broke it.
5. **`interests` appears in a `useMemo` dependency array in `HomeScreen`,** which makes it look
   wired up. It is not used in the body. Read the whole hook.
6. **`calendar.ts:37` defaults a missing year to the current year,** so an event scraped in
   December for January lands twelve months early. Fix as part of P—02, not as a separate
   date-parsing rewrite.
7. **`aspectRatio` is written by the scraper but `aspect` is not,** and `EventCard` reads both with
   different fallbacks. Check `EventCard.tsx:93-99` before touching either.
8. **The `light` value in `app.json` is not a theme default — it is a lock.** See T—02 before
   debugging why dark mode "doesn't work on my phone."

---

# §10 · Verification

Run these. Paste real output.

```bash
# Type check — must stay clean
cd loop-app && npx tsc --noEmit

# Client must not hold the Gemini key (P—01 exit criterion)
grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src

# Hardcoded colors outside the theme layer (currently 32 — must not grow)
grep -rn "#[0-9A-Fa-f]\{6\}" loop-app/src --include='*.tsx' | grep -v 'src/theme/' | wc -l

# Accessibility ratio (currently 12 / 136)
grep -ro 'accessibilityLabel' loop-app/src | wc -l
grep -ro 'Pressable' loop-app/src | wc -l

# Unbounded queries (currently 0 limit() calls — must become > 0 in P—08)
grep -rn 'limit(' loop-app/src loop-app/App.tsx | wc -l

# Rules — test against the emulator, never by reading them
firebase emulators:start --only firestore

# Refresh the knowledge graph after each phase
graphify update .
```

---

# §11 · Decisions the user must make

Do not decide these yourself. Ask, then record the answer in this file.

| # | Decision | Blocks | Why it cannot be inferred |
|---|----------|--------|---------------------------|
| 1 | How is a club coordinator verified? Email allowlist, institute SSO, or manual approval? | P—01 | Determines the whole auth model. An allowlist ships this week; SSO is correct but needs institute cooperation. |
| 2 | Is scraping staying, or do clubs submit and scraping becomes backfill? | T—24, P—09 | ToS and copyright exposure scale with public distribution. This is a risk-appetite call, not a technical one. |
| 3 | Which crash reporting vendor? | T—09, pilot | Free tiers differ; Sentry is the usual default for Expo. |
| 4 | iOS bundle identifier, and are the Apple/Play accounts created? | T—01, P—06 | Cannot be guessed; the Android package is `com.loop.iitd`. |
| 5 | Who operates the moderation queue day to day? | P—03, T—22 | Determines whether the club identity model is per-club or one central team. |

**Already known blockers,** all outside the code and all gating P—01:
1. Rotate the Gemini API key — treat the deployed one as public.
2. Enable Firebase Auth.
3. Enable billing for Cloud Functions.
4. `git init` the LOOP root — **after** the `.gitignore` fix in P—01 step 6, never before.

---

# §12 · How to start

Reply with:

1. One paragraph, in your own words, on what you understand the core problem to be.
2. Which phase you are starting and the first finding ID you will fix.
3. Any question from §11 you need answered before you can proceed.

Then begin. One finding at a time, with the §0.6 report block after each.

Do not summarise this brief back. Do not produce a plan document — this is the plan. Start fixing.
