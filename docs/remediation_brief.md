# Loop — Remediation Brief

You are working on **Loop**, a campus event discovery app for IIT Delhi. This file is your
complete brief. It contains a finished audit of the codebase (47 findings, each traced to a
file and line), a five-phase remediation plan, and the operating rules you must follow while
executing it.

Read this file completely before touching any code. Do not re-audit — the findings below were
confirmed by reading the cited lines, and re-deriving them wastes effort and risks contradicting
work already done.

---

## 0. Operating contract

These rules exist because they are what separates a useful engineering session from a plausible-
looking one. Follow them literally.

### 0.1 Ground every claim

- **Never state that something works unless you ran it.** If you did not execute the check, say
  "not verified" instead of implying success.
- **Cite `file:line` for every claim about the code.** If you cannot cite it, you have not
  confirmed it — go read the file.
- **Report failures verbatim.** If a command fails, paste the actual output. Do not summarise a
  failure as a success, do not say "should now work", and do not move on silently.
- **If you skip part of a task, say so explicitly** and say why. Partial work reported as
  complete is worse than no work.

### 0.2 Minimal, surgical diffs

- **Change only what the finding names.** Do not reformat, do not rename, do not "improve" code
  adjacent to your edit. A 400-line diff for a 6-line fix is a failed fix, because it cannot be
  reviewed.
- **Never rewrite a whole file** when an edit to a few lines will do. If you find yourself
  regenerating a file from scratch, stop — you are about to silently drop code you did not read.
- **Never delete code you do not understand.** If something looks dead, prove it with a
  repo-wide search first, quote the search, then remove it.
- **Preserve existing style.** Match the surrounding naming, comment density, and idiom. This
  codebase uses functional React components, `StyleSheet.create` at the bottom of each file,
  theme tokens via `useTheme()`, and named exports for utils. Stay inside that.

### 0.3 Do not invent

- **Do not add dependencies** that are not required by a finding. If a fix needs a new package,
  name it, say why, and confirm before installing.
- **Do not invent API shapes.** If you are unsure how a Firebase, Expo, or Gemini API behaves,
  read the installed package in `node_modules` or say you are unsure. Do not guess a method name.
- **Do not fabricate test results, screenshots, or user data.**
- **No placeholder identities.** This project already has a bug (F—38) caused by demo personas
  shipping to production. Never introduce "John Doe", "Acme", "test@example.com", or round
  invented numbers.

### 0.4 Ask vs. assume

Make routine judgment calls yourself. Stop and ask the user only when the answer changes what you
build and you cannot determine it from the repo — for example, how a club coordinator should be
verified, or whether to keep an existing Firestore document shape for backward compatibility.
When you do proceed on an assumption, state the assumption in one line and continue; do not stall
the whole task on a question you can flag and move past.

### 0.5 Scope discipline

- Work **one phase at a time**, in the order given. The phases are dependency-ordered; P—03 fixes
  are unverifiable without P—01's auth, and P—04 is wasted effort before P—02 settles the schema.
- Within a phase, work **one finding at a time**, and state which finding ID you are on.
- If you discover a new problem mid-phase, **write it down as a new finding (F—48, F—49, …) and
  keep going**. Do not expand the current fix to cover it.

### 0.6 Reporting format

After each finding you fix, output exactly this block:

```
F—NN  <short title>
Changed:  path/to/file.ts:120-134  (+8 / -3)
What:     one sentence on the actual change
Verified: <the command you ran and its result, or "NOT VERIFIED — reason">
```

At the end of a phase, list every finding ID as `fixed` / `partial` / `skipped` with a reason for
anything not fixed.

---

## 1. The project

A monorepo with two subsystems joined by exactly one contract: the Firestore `events` collection.

```
LOOP/
├── loop-app/          React Native + Expo SDK 57, react-native-web enabled. TypeScript strict.
│   ├── App.tsx                 root, holds nav + modal state
│   ├── src/screens/            Home, Pulse, Directory, Curate, Submit, Queue
│   ├── src/components/         EventCard, EventDetailModal, TopBar, StudentAuthModal, …
│   ├── src/theme/              "Crimson & Onyx" design tokens — colors, typography, spacing
│   ├── src/utils/              auth, storage, calendar, linking, geminiAI, geminiParser
│   ├── src/data/               static seed data + TypeScript types
│   ├── src/config/firebase.ts  Firestore client init
│   └── firestore.rules         security rules  ← the centre of gravity for phase 1
└── loop-scraper/      Python + Node ingestion
    ├── scraper.py              PRIMARY: Apify → Gemini Vision → Cloudinary → Firestore
    ├── puppeteer_scraper.js    fallback Instagram scraper
    ├── gemini_parser.py        second, drifted parser (see F—45)
    └── seed_data.py, stock_scraper.py, generate_*.py, wipe_db.py, purge_and_reset.py
```

**Data flow:** the scraper writes events with `status: 'pending'`. A coordinator approves them in
the app's Queue screen, flipping `status` to `'approved'`. The Home feed reads only `'approved'`.

**Scale:** 51 source files, 9,665 lines. `npx tsc --noEmit` currently passes clean under `strict` —
keep it that way; it is your cheapest regression net.

### 1.1 Optional: the knowledge graph

A `graphify` knowledge graph of this repo already exists at `.graphify/graph.json` (239 nodes,
382 edges, 19 named communities), with a browsable studio at `.graphify/studio/studio.html`.

If your harness supports it, install the skill and use it to orient instead of reading the tree:

```bash
graphify install gemini
graphify summary --graph .graphify/graph.json     # ~400 tokens vs ~97K to read everything
graphify explain "QueueScreen.tsx"
graphify update .                                  # run after each phase; AST-only, no API key
```

The graph is **structural only** (imports, calls, containment). It locates code. It does not
review it — every bug fix still requires reading the actual file.

---

## 2. Design constraints you must respect

This project has an existing design system. Do not replace it, do not introduce a second one.

- **Colors come from `loop-app/src/theme/colors.ts`** via `useTheme()`. Light: alabaster ground
  `#FDFCF8`, crimson primary `#8A1538`, onyx accent `#18181B`. Dark: obsidian `#0A0A0C`, crimson
  lifts to `#C44D6A`. **Never hardcode a hex value in a component** — there are already 32
  violations outside the theme layer; do not add a 33rd.
- **Typography** is Outfit (display) + Geist (body), declared in `src/theme/typography.ts`.
  See F—28 — the fonts are declared but never loaded.
- **The repo vendors two design skills** in `skills/frontend-skill.md` and `skills/ui-ux-skill.md`.
  Read them before any UI work in phase 4. Their rules are binding here: no Inter/Roboto, inputs
  must be ≥16px to avoid iOS zoom, accessibility is the top-priority rule category, mobile-first,
  and no placeholder content.
- **Spacing and radii** come from `src/theme/spacing.ts`. Use the tokens.

---

## 3. The five phases

Execute in this order. Do not start a phase until the previous one is verified.
**Strategy Note:** Pause after Phase 3 (when the app is "safe to put in front of students") and run a 2-week pilot with one club before proceeding to Phases 4–5 and Tier 2. This surfaces runtime issues early.

### P—01 · Close the identity hole
**Findings:** F—01 … F—09
**Files:** `firestore.rules`, `QueueScreen.tsx`, `SubmitScreen.tsx`, `geminiAI.ts`,
`geminiParser.ts`, `App.tsx`, root `.gitignore`, new Cloud Function

**The core problem:** there is no server-side identity anywhere in Loop. Every permission check
in the app is a React state variable. That single gap causes F—01 through F—07.

**Do:**
1. Add Firebase Auth. Coordinators get a custom claim (e.g. `coordinator: true`). An allowlist of
   club emails is an acceptable first implementation; note in your report that institute SSO is
   the real answer.
2. Rewrite `firestore.rules` so that: reading `pending` requires the coordinator claim; the update
   rule requires the coordinator claim **in addition to** the existing status-transition check;
   create requires an authenticated user and validates the full field set, not just two strings.
3. Replace the `password.length >= 4` check and the demo-login button with real Firebase Auth
   sign-in.
4. Move all Gemini calls to a Cloud Function. The client must never hold the key. Note in your
   report that the existing key must be treated as compromised and rotated by the user.
5. Switch Cloudinary to signed uploads issued by that same function.
6. Add `loop-scraper/serviceAccountKey.json` and `loop-scraper/session.json` to the root
   `.gitignore` **before any `git init`**.

**Acceptance criteria:**
- With the Firebase emulator, an unauthenticated client **cannot** read a pending doc, **cannot**
  update any doc, and **cannot** create a doc.
- An authenticated coordinator **can** read pending and **can** approve/reject.
- `grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src` returns nothing.
- `npx tsc --noEmit` still passes.

**Blocked on the user:** rotating the Gemini key, enabling Firebase Auth, enabling billing for
Cloud Functions. Ask them to confirm these are done before you start; do the `.gitignore` fix
regardless, it is free and it is the only irreversible risk.

---

### P—02 · Settle the event contract
**Findings:** F—14, F—15, F—20, F—26, F—40
**Files:** shared type module (new), `scraper.py`, `SubmitScreen.tsx`, `QueueScreen.tsx`,
`src/data/events.ts`, `firestore.indexes.json`

**The core problem:** the two writers disagree about the document shape. The scraper writes
`date: "21 Apr"` (no year) and `confidence: 0.87`; the app writes `date: "2026-04-21"` and
`confidence: 87`. Neither writes `featured`, `day`, or `fillingFast` — all three of which the UI
renders. Nothing writes a sortable timestamp.

**Do:**
1. Define **one** canonical event document. It must include a real `startsAt` timestamp
   (Firestore `Timestamp`) alongside the human-readable `date` string the UI shows.
2. Pick one confidence scale (recommend 0–1) and convert at both writers.
3. Make `createdAt` a Firestore `Timestamp` on both paths — the app currently writes an ISO
   string, which is why F—15 renders "Invalid Date".
4. Either populate `featured` / `day` / `fillingFast` at write time, or remove the UI that
   depends on them. Do not leave UI bound to fields nothing writes.
5. Write a one-off backfill script for existing documents. Make it idempotent and dry-run by
   default.
6. Add the composite indexes the sorted queries in P—03 will need.

**Acceptance criteria:**
- A single TypeScript type is imported by every app-side reader/writer of an event.
- The Python writer's field names and types match that type exactly — list them side by side in
  your report.
- The backfill script runs dry, prints what it would change, and only writes with an explicit flag.

---

### P—03 · Make the dead features live
**Findings:** F—10, F—11, F—12, F—13, F—16 … F—25, F—27
**Files:** `HomeScreen.tsx`, `App.tsx`, `CurateScreen.tsx`, `PulseScreen.tsx`, `QueueScreen.tsx`,
`SubmitScreen.tsx`, `geminiParser.ts`, `storage.ts`, `calendar.ts`, `scraper.py`

**The core problem:** several features have finished UI and no data path. Users can operate them
and change nothing.

**Do:**
1. **F—10 first — it is the highest-impact bug in the app.** Trace it end to end: the system
   prompt in `geminiParser.ts:38` demands a category from one vocabulary (`"BRCA Cultural"`,
   `"CAIC Technical"`, …), the validation at `geminiParser.ts:128` checks the answer against
   `ALLOWED_CATEGORIES` (derived from `src/data/categories.ts`, a completely different list), so
   it nulls **every** category, so `SubmitScreen` falls back to its default `'Independent'`, which
   is absent from `CATEGORIES`, so no filter chip on Home can ever match the event. Fix by making
   the prompt emit the `CATEGORIES` vocabulary. One vocabulary, defined once.
2. Make `interests` actually filter the Home feed. Decide and state the semantics — recommend:
   interests filter the "All" view, explicit category chips override them.
3. Wire reminders. This needs `expo-notifications`, which is not currently a dependency — confirm
   before adding. Schedule on save, cancel on unsave, and pass the offset through to
   `calendar.ts`.
4. Sort the feed by `startsAt` and filter out past events.
5. Point Pulse at Firestore instead of the hardcoded array in `src/data/pulse.ts`.
6. Replace the two independent one-shot `getDocs` calls (`App.tsx:72`, `HomeScreen.tsx:52`) with
   **one** shared `onSnapshot` subscription, lifted to a context or hook.
7. Give every `catch` a user-visible outcome. Twelve of them currently only `console.error`, which
   is why a denied approve looks identical to a card that just refused to move.
8. Fix the stale-closure queue advance at `QueueScreen.tsx:111-122` and delete the unused
   `currentIndex` state.

**Acceptance criteria:**
- Submitting an event through the app produces a document whose `category` is one of `CATEGORIES`,
  and that event appears under its chip on Home. Demonstrate this end to end.
- Toggling an interest visibly changes the feed.
- A failed write shows the user something.

---

### P—04 · UI, UX and accessibility
**Findings:** F—28 … F—42
**Files:** ~20 across `src/components`, `src/screens`, `src/theme`

**Read `skills/ui-ux-skill.md` and `skills/frontend-skill.md` before starting.** They are this
project's own design rules and they are binding.

**Do, in this order:**
1. **F—28 — load the fonts.** The theme names Outfit and Geist, `expo-font` is installed and
   registered as a plugin in `app.json:32`, and nothing anywhere calls `useFonts`. The entire
   typographic identity is silently falling back to system faces on both web and native. This is
   the single highest-visual-impact fix in the app.
2. **F—31 — accessibility labels.** 12 `accessibilityLabel` props across 136 `Pressable`
   elements. Add labels, roles, and states. Do this as one systematic pass, not opportunistically.
3. **F—29 — tap-through.** `e.stopPropagation()` at `EventCard.tsx:202` is a no-op in React
   Native's touch system, so WhatsApp pills also open the detail modal. Restructure so the pill
   is not inside the card's press target.
4. **F—30** — one `Image` per card, not two of the same URL.
5. **F—32** — inputs to ≥16px (`HomeScreen.tsx:312`, `QueueScreen.tsx:752`).
6. **F—33** — render a themed splash instead of `null` while AsyncStorage resolves.
7. **F—38** — remove the demo personas from production sign-in surfaces.
8. Then F—34 … F—37, F—39 … F—42.

**Acceptance criteria:**
- Fonts visibly render as Outfit/Geist on web; state how you confirmed it.
- Every interactive element has a label. Report the new ratio.
- No new hardcoded hex values: `grep -rn "#[0-9A-Fa-f]\{6\}" loop-app/src --include='*.tsx' | grep -v 'src/theme/'`
  must not exceed the current count of 32, and should be lower.

---

### P—05 · Consolidate and put a net under it
**Findings:** F—43 … F—47

**Do:**
1. Collapse the six near-duplicate Python entry points into one CLI with subcommands. The
   duplicated `parse_with_gemini` and Cloudinary helpers become one shared module.
2. One source of truth for the club handle list. `docs/insta_ids.md` (45 handles) is canonical;
   `skills/insta_ids.md` (41, and disagrees on `@enactus_iitd` vs `@enactus_iitdelhi`) should go;
   `scraper.py:24`'s hardcoded 27 should be parsed from the docs file at runtime.
3. Remove `react-native-svg` (zero references). Remove `@google/generative-ai` once P—01 has moved
   Gemini server-side.
4. Add CI: `tsc --noEmit`, a linter, and tests around the two parsers and the date parser in
   `calendar.ts` (which is pure and trivially testable).
5. Tell the user to `git init` the LOOP root so `.github/workflows/scraper.yml` can actually run —
   it never has (F—09).

---

## 4. The finding register

Severity: **P0** blocking · **P1** broken flow · **P2** UI/UX · **P3** hygiene.
All line numbers were verified on 2026-09-03.

### P0 — blocking

| ID | Finding | Location |
|----|---------|----------|
| F—01 | The update rule checks only the status transition, never `request.auth`. Any anonymous visitor can approve any pending event into the campus feed, or reject every real submission. | `loop-app/firestore.rules:14-17` |
| F—02 | The read rule permits only `status == 'approved'`, but the Queue screen queries `status == 'pending'`. That query is denied in production, and the catch only logs — so coordinators see a permanent "All Caught Up" while events pile up. | `firestore.rules:6` · `QueueScreen.tsx:70,94` |
| F—03 | Studio login is `if (password.length >= 4)`, setting client state only. Any 4-character password works. | `QueueScreen.tsx:255-269` |
| F—04 | A "Demo Coordinator 1-Tap Login" button grants full moderation access with no credential, on the production sign-in screen. | `QueueScreen.tsx:271-276,352-365` |
| F—05 | The Gemini API key is inlined into the web bundle via `EXPO_PUBLIC_`. Extractable from the deployed build and billable by anyone. The parser's own header comment says it "is NOT safe to call from the React Native client directly" — and two screens call it from the client. | `geminiAI.ts:4` · `geminiParser.ts:9-11,94` |
| F—06 | Cloudinary cloud name and unsigned upload preset are both public in the bundle, making the upload endpoint an open image host on your quota. | `SubmitScreen.tsx:119-145` |
| F—07 | The create rule validates only that `title` and `image` are strings. No auth, no rate limit, no size cap, no field whitelist. | `firestore.rules:9-11` |
| F—08 | `loop-scraper/serviceAccountKey.json` and `session.json` exist on disk and match no ignore pattern. That key bypasses every security rule. Nothing is committed only because the root is not yet a repo. | root `.gitignore` |
| F—09 | `.github/workflows/scraper.yml` sits at the LOOP root, which is not a git repository. `loop-app` is the only initialised repo and its workflows only deploy hosting. The six-hourly ingestion the product depends on has never run. | `.github/workflows/scraper.yml` |

### P1 — broken flows

| ID | Finding | Location |
|----|---------|----------|
| F—10 | Every user-submitted event is invisible in the feed. Prompt vocabulary ≠ validation list → category nulled → default `'Independent'` → absent from `CATEGORIES` → no chip matches. | `geminiParser.ts:38,30,128` · `SubmitScreen.tsx:44,174` |
| F—11 | Interest tags change nothing. `interests` is passed to Home and listed in the filter's dependency array, but never read by it. | `HomeScreen.tsx:79-104` |
| F—12 | Reminders are never scheduled. Full UI writes to AsyncStorage; nothing reads it back; `expo-notifications` isn't a dependency. | `CurateScreen.tsx:128-242` · `storage.ts:52` |
| F—13 | Feed is unsorted and never expires. Events render in Firestore order under a heading reading "Upcoming Feed"; past events stay forever. | `HomeScreen.tsx:52-71,106` |
| F—14 | Two date formats and two confidence scales in one collection. | `scraper.py:304,373` · `SubmitScreen.tsx:169,175` |
| F—15 | "Invalid Date" on every scraped queue item — a Firestore `Timestamp` passed to `new Date()`. | `QueueScreen.tsx:87` · `scraper.py:378` |
| F—16 | Pulse is a hardcoded array with frozen relative timestamps ("2h ago" forever). | `src/data/pulse.ts:14` |
| F—17 | Every queue card is labelled "Submitted via App", hardcoded, including scraped ones — even though the doc carries the real `host` handle. | `QueueScreen.tsx:86` |
| F—18 | Submissions without a poster get a specific Ankahi event flyer as fallback — an unrelated club's poster published on someone else's event. | `SubmitScreen.tsx:157` |
| F—19 | `host` and `hostAvatar` are hardcoded to "Campus Club" at submit time. | `SubmitScreen.tsx:177-178` |
| F—20 | If Cloudinary is unconfigured, the entire image is written into the Firestore document as a base64 data URI — past the 1 MB doc limit for most photos. | `SubmitScreen.tsx:123-126` |
| F—21 | The same approved-events query runs twice on every cold start, from `App.tsx` and `HomeScreen` independently. | `App.tsx:72-82` · `HomeScreen.tsx:52-71` |
| F—22 | Nothing refreshes. One-shot `getDocs` on mount, no `onSnapshot`, no pull-to-refresh, no refetch on focus. | `App.tsx:52` · `HomeScreen.tsx:52` |
| F—23 | Twelve catch blocks log to console and show the user nothing. | `HomeScreen.tsx:63` · `QueueScreen.tsx:94,140,155` |
| F—24 | `handleNext` slices the queue then indexes the pre-slice array from the same closure; `currentIndex` is never incremented despite `remaining` depending on it. | `QueueScreen.tsx:111-122` |
| F—25 | Rejected events accumulate forever — client deletes denied by rule, no cleanup job. | `firestore.rules:20` |
| F—26 | `featured`, `day` and `fillingFast` are written only by the offline seed script, but rendered by the live UI. | `seed_data.py:147,155,166` · `HomeScreen.tsx:106` |
| F—27 | Ingestion silently caps at 2 posts per handle and `MAX_EVENTS = 15` per run — will drop real events during fest weeks. | `scraper.py:219,245` |

### P2 — UI & UX

| ID | Finding | Location |
|----|---------|----------|
| F—28 | The app's typefaces are never loaded. Outfit and Geist are declared, `expo-font` is a registered plugin, and no `useFonts` call exists anywhere. | `theme/typography.ts:14,19` · `app.json:32` |
| F—29 | `e.stopPropagation()` is a no-op in RN touch handling, so WhatsApp pills also open the detail modal. | `EventCard.tsx:202-206` |
| F—30 | Each card downloads and decodes its poster twice (blur backdrop + contained foreground). | `EventCard.tsx:135-154` |
| F—31 | 12 `accessibilityLabel` props across 136 `Pressable` elements. | `loop-app/src/` |
| F—32 | `fontSize: 14` on text inputs causes iOS zoom-on-focus. | `HomeScreen.tsx:312` · `QueueScreen.tsx:752` |
| F—33 | `ThemeProvider` returns `null` until AsyncStorage resolves — blank frame on every web load. | `theme/ThemeContext.tsx:62-63` |
| F—34 | The Studio mode toggle sits ungated in the student top bar. | `TopBar.tsx:127-149` |
| F—35 | Studio mode opens on the student home screen — both tab sets share a `home` id. | `BottomTabBar.tsx:22-27` · `App.tsx:128-139` |
| F—36 | `notificationCount` is declared and never passed, so the unread dot can never render; the modal lists a hardcoded array. | `TopBar.tsx:16,164` |
| F—37 | Directory open/closed status dots come from a static field, not opening hours. | `DirectoryScreen.tsx:160-167` |
| F—38 | Demo personas ("Aarav Sharma", "coordinator@brca.iitd.ac.in") are one tap away on shipped sign-in flows. | `StudentAuthModal.tsx:74-85` · `QueueScreen.tsx:271` |
| F—39 | Host avatars and Directory club images have no `onError` fallback. | `EventCard.tsx:183` · `DirectoryScreen.tsx:233-236` |
| F—40 | Free-text date/time entry with no picker and no validation — the upstream cause of F—13 and F—14. | `SubmitScreen.tsx:299-304` |
| F—41 | The saved-events filter uses rendered display text as its state value, matched by `startsWith`. A copy change breaks the filter. | `HomeScreen.tsx:74-86` |
| F—42 | `onToggleTheme` and `isDark` are passed into the desktop Sidebar and never used; a `themeToggle` style exists with nothing rendering it. | `Sidebar.tsx:11-13,181-188` |

### P3 — hygiene

| ID | Finding | Location |
|----|---------|----------|
| F—43 | Six near-duplicate scraper entry points with `parse_with_gemini` and Cloudinary helpers copy-pasted between them. | `loop-scraper/*.py` |
| F—44 | Three competing copies of the club handle list: 45 in docs, 41 in skills (disagreeing on one handle), 27 hardcoded in the scraper. | `docs/insta_ids.md` · `skills/insta_ids.md` · `scraper.py:24` |
| F—45 | `gemini_parser.py` duplicates the extraction `scraper.py` now does inline, and still uses the abandoned free-text category vocabulary — the Python twin of F—10. | `gemini_parser.py:38` |
| F—46 | `react-native-svg` has zero references; `@google/generative-ai` is Google's superseded SDK. | `loop-app/package.json` |
| F—47 | No tests, no lint, no CI type-check. Baseline is good though: `tsc --noEmit` passes clean under `strict`. | `package.json` · `tsconfig.json` |

### Tier 2 — Production & Scale (What's missing)

| ID | Finding | Location |
|----|---------|----------|
| F—48 | Zero `limit()` calls. | `App.tsx:74`, `HomeScreen.tsx:56`, `QueueScreen.tsx:71` |
| F—49 | No offline persistence. `getFirestore()` has no cache config. | `src/config/firebase.ts:16` |
| F—50 | No crash reporting or analytics (e.g., Sentry, Crashlytics). | |
| F—51 | No privacy policy or terms (required for App/Play Store). | |
| F—52 | Push notifications are server work (FCM/APNs, token store). | |
| F—53 | No cost controls or budget alarms for Firebase/Apify/Gemini. | |
| F—54 | Legal exposure on Instagram scraping. | |

---

## 5. Traps specific to this repo

Things that will silently mislead you if you are not warned:

1. **`gemini_parser.py` is not the live parser.** `scraper.py` has its own inline
   `parse_with_gemini` at line 100 with a *different, correct* category enum. Do not "fix" the
   category bug in the wrong file.
2. **The scraper's category enum is already correct.** `scraper.py:134-146` matches
   `src/data/categories.ts`. Only the *client-side* `geminiParser.ts` is wrong. Do not change the
   Python enum to match the broken TypeScript one.
3. **`loop-app` is its own git repo** (`git@github.com:prathamkathi/loop-app.git`) and is clean of
   secrets. The **LOOP root is not a repo at all**. Do not assume one repo.
4. **`tsc --noEmit` passes today.** If it starts failing, you broke it. Run it after every phase.
5. **`interests` appears in a dependency array in `HomeScreen`**, which makes it look wired up.
   It is not used in the filter body. Read the whole `useMemo`.
6. **Two `parseDateAndTime` behaviours silently disagree.** `calendar.ts:37` defaults a missing
   year to the *current* year, so an event scraped in December for January lands 12 months early.
   Fix this as part of P—02, not as a separate date-parsing rewrite.
7. **`aspectRatio` is written by the scraper but `aspect` is not**, and `EventCard` reads both
   with different fallbacks. Check `EventCard.tsx:93-99` before touching either.

---

## 6. Verification commands

Run these. Paste real output.

```bash
# Type check — must stay clean
cd loop-app && npx tsc --noEmit

# Client must not hold the Gemini key (phase 1 exit criterion)
grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src

# Hardcoded colors outside the theme layer (currently 32 — must not grow)
grep -rn "#[0-9A-Fa-f]\{6\}" loop-app/src --include='*.tsx' | grep -v 'src/theme/' | wc -l

# Accessibility ratio (currently 12 / 136)
grep -ro 'accessibilityLabel' loop-app/src | wc -l
grep -ro 'Pressable' loop-app/src | wc -l

# Firestore rules — test against the emulator, not by reading them
firebase emulators:start --only firestore

# Refresh the knowledge graph after each phase
graphify update .
```

---

## 7. How to start

Reply with:

1. A one-paragraph statement of what you understand the core problem to be, in your own words.
2. Which phase you are starting and which finding ID you will fix first.
3. Any blocking question you need answered before you can proceed.

Then begin. One finding at a time, with the report block from §0.6 after each.
