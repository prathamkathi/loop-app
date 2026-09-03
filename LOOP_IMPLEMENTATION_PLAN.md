# Loop Remediation Implementation Plan

End-to-end execution of the remediation brief for the Loop campus event discovery app.
Companion to `LOOP_MASTER_BRIEF.md` — the brief holds the evidence and the operating contract,
this file holds the execution order.

**Coverage: 47 audit findings (F—01…F—47) + 27 production-readiness findings (T—01…T—27) + 4
quality upgrades (X—01…X—04). Every ID is assigned to exactly one phase. See the coverage matrix
at the end.**

**Rollout strategy.** Execute Phases 1–3 to secure the app and fix the core loop, then Phase 3B to
instrument it, then **pause** for a 2-week pilot with a single club. Phases 4–9 follow, re-ranked
by what the pilot actually reveals.

> [!CAUTION]
> **The cloud console tasks cannot be done by an AI agent.** Correct code will still fail at
> runtime until the backend services are configured. Read "User Review Required" before Phase 1.

---

## User Review Required

Complete these before Phase 1 begins. They gate everything.

1. **Rotate the Gemini API key.** The current key is inlined in the deployed web bundle — treat it
   as public. Revoke it in Google AI Studio, issue a new one, and hold it for the Cloud Function
   environment. Do not put it in any `EXPO_PUBLIC_` variable.
2. **Enable Firebase Authentication** → Console → Authentication → Email/Password provider.
3. **Enable Blaze billing** — Cloud Functions require pay-as-you-go.
4. **`git init` the LOOP root and add the Actions secrets** (F—09). This must happen *after* the
   `.gitignore` fix in Phase 1 step 1, never before. **This is on the critical path for the
   pilot, not a cleanup task** — the six-hourly scraper has never run, so without it there is no
   event data to pilot with.

## Open Questions

Answer these before the phase that depends on them. See §11 of the brief.

| # | Question | Blocks |
|---|----------|--------|
| 1 | Coordinator verification: email allowlist, institute SSO, or manual approval? Allowlist ships this week; SSO is correct but needs institute cooperation. | Phase 1 |
| 2 | Is the Cloudinary API secret available for the Cloud Function environment (signed uploads, F—06)? | Phase 1 |
| 3 | **F—26:** `featured` / `day` / `fillingFast` are rendered but never written. Populate them at write time, or delete the UI? Deleting removes the `FeaturedCard` component and the "Featured Tonight" section from Home — a visible product decision, not a cleanup. | Phase 2 |
| 4 | Is scraping staying as primary ingestion, or do clubs submit with scraping as backfill? (T—24 — ToS and copyright exposure scales with a public listing.) | Phase 9 |
| 5 | Crash reporting vendor — Sentry is the usual Expo default. | Phase 3B |
| 6 | iOS bundle identifier, and are the Apple / Play accounts created? Android is `com.loop.iitd`. | Phase 6 |

---

## Reporting format

After each finding, output exactly:

```
F—NN  <short title>
Changed:  path/to/file.ts:120-134  (+8 / -3)
What:     one sentence on the actual change
Verified: <command run and its real result, or "NOT VERIFIED — reason">
```

At phase end, list every ID in that phase as `fixed` / `partial` / `skipped` with a reason for
anything unfixed. A phase is not complete until its exit criteria are pasted with real output.

---

# Phase 1 — Close the Identity Hole
**Findings:** F—01 … F—09

There is no server-side identity anywhere in Loop. Every permission check is a React state
variable. That single gap causes F—01 through F—07.

### Changes
- **root `.gitignore`** — exclude `loop-scraper/serviceAccountKey.json` and
  `loop-scraper/session.json` **(F—08)**. Do this first; it is free and it is the only
  irreversible risk in the repo.
- **`loop-app/firestore.rules`** — require `request.auth != null` plus a `coordinator` custom claim
  for reading `pending` **(F—02)** and for the approve/reject update **(F—01)**; require an
  authenticated user and a full field whitelist for create **(F—07)**.
- **`loop-app/src/screens/QueueScreen.tsx`** — replace the `password.length >= 4` check **(F—03)**
  and remove the demo-login button **(F—04)** with real Firebase Auth sign-in.
- **`loop-app/functions/`** (new) — Cloud Functions for Gemini calls **(F—05)** and Cloudinary
  signed upload tokens **(F—06)**. **Add a `functions` key to `loop-app/firebase.json`** — it has
  none today.
- **`loop-app/src/utils/geminiAI.ts`, `geminiParser.ts`, `SubmitScreen.tsx`** — swap client-side
  keys for Cloud Function invocations.
- **User action** — `git init` the LOOP root so `.github/workflows/scraper.yml` can run **(F—09)**.

### Forward compatibility
Design the custom claim to carry a **club ID**, not just `coordinator: true`. T—22 (club identity)
depends on it, and it is the root cause of F—19. Adding the field now costs nothing; retrofitting
it later means re-issuing every claim.

### Exit criteria
- Firestore emulator: unauthenticated client **cannot** read a pending doc, **cannot** update any
  doc, **cannot** create a doc. Authenticated coordinator **can** read pending and **can**
  approve/reject. Paste the emulator output.
- `grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src` returns nothing.
- `npx tsc --noEmit` clean.

---

# Phase 2 — Settle the Event Contract
**Findings:** F—14, F—15, F—20, F—26, F—40 · **T—06**

The two writers disagree about the document shape. The scraper writes `date: "21 Apr"` (no year)
and `confidence: 0.87`; the app writes `date: "2026-04-21"` and `confidence: 87`.

### Changes
- **`loop-app/src/data/events.ts`** — extend the **existing** `EventItem` type into the single
  source of truth. **Do not create `src/types/events.ts`** — seven files already import from
  `src/data/events`, and a second type file recreates F—44's exact failure mode. If you move it,
  update all seven importers in the same commit.
- Add a real **`startsAt` Firestore `Timestamp`** alongside the human-readable `date` string the
  UI displays. This is what makes sorting and expiry possible in Phase 3.
- **`loop-scraper/scraper.py`** — standardise `confidence` to 0–1 and `createdAt` to a Firestore
  `Timestamp` **(F—14, F—15)**.
- **`SubmitScreen.tsx`** — same two conversions on the app side; remove the base64-into-Firestore
  fallback that breaches the 1 MB document limit **(F—20)**; replace free-text date/time entry with
  a real picker **(F—40)** — this is the upstream cause of F—13 and F—14, so fixing the symptom
  without it leaves the source intact.
- **`featured` / `day` / `fillingFast` (F—26)** — populate at write time or remove the UI. **This
  is open question #3; get an answer before acting.**
- **`scripts/backfill_events.ts`** (new) — migrate existing documents. **Idempotent, and dry-run by
  default**: it must print what it would change and only write behind an explicit `--apply` flag.
  This is the one script that rewrites live data.
- **`loop-app/firestore.indexes.json`** (new) — composite indexes for the Phase 3 sorted queries,
  registered in `firebase.json` **(T—06)**. Neither file exists today, so indexes are currently
  not deployed as code.

### Exit criteria
- One TypeScript type imported by every app-side reader and writer of an event.
- The Python writer's field names and types listed side by side against that type in your report.
- Backfill runs dry, prints its diff, and refuses to write without `--apply`.

---

# Phase 3 — Make the Dead Features Live
**Findings:** F—10 … F—13, F—16 … F—19, F—21 … F—25, F—27

Several features have finished UI and no data path. Users can operate them and change nothing.

### Changes, in this order
- **`geminiParser.ts` (F—10) — do this first, it is the highest-impact bug in the app.** The
  system prompt demands one category vocabulary, the validation checks a different one, so every
  category is nulled, so Submit falls back to `'Independent'`, which is absent from `CATEGORIES`,
  so no filter chip can ever match. Make the prompt emit the `CATEGORIES` vocabulary. One
  vocabulary, defined once.
- **`HomeScreen.tsx`** — wire `interests` into the filter body **(F—11)**; sort by `startsAt` and
  drop past events **(F—13)**; fix the display-text filter key **(F—41 is Phase 4, leave it)**.
- **`App.tsx` + `HomeScreen.tsx`** — replace two independent one-shot `getDocs` calls with **one**
  shared `onSnapshot` subscription lifted to a context or hook **(F—21, F—22)**.
- **`CurateScreen.tsx`** — integrate `expo-notifications` (new dependency — confirm first), schedule
  on save, cancel on unsave, pass the offset to `calendar.ts` **(F—12)**.
- **`PulseScreen.tsx`** — fetch from Firestore instead of the hardcoded array **(F—16)**.
- **`QueueScreen.tsx`** — show the real source handle instead of the hardcoded "Submitted via App"
  **(F—17)**; give every `catch` a user-visible outcome **(F—23)**; fix the `handleNext` stale
  closure and delete the unused `currentIndex` **(F—24)**.
- **`SubmitScreen.tsx`** — remove the hardcoded Ankahi fallback poster **(F—18)**; carry the real
  club identity instead of `host: 'Campus Club'` **(F—19)**, using the club ID from the Phase 1
  claim.
- **Rejected-event cleanup (F—25)** — a scheduled function or TTL policy; client deletes are denied
  by rule and nothing prunes today.
- **`scraper.py`** — raise or remove the silent `MAX_EVENTS = 15` and 2-posts-per-handle caps, or
  make exceeding them a logged alert rather than a silent drop **(F—27)**.

### Exit criteria
- Submitting an event end to end produces a document whose `category` is one of `CATEGORIES`, and
  that event appears under its chip on Home. Demonstrate the whole path.
- Toggling an interest visibly changes the feed.
- A failed write shows the user something.

---

# Phase 3B — Pilot Instrumentation
**Findings:** T—08, T—09, T—10, T—11

> [!IMPORTANT]
> These were originally scheduled after the pilot. That is backwards. **A pilot with no crash
> reporting tells you almost nothing** when something breaks on a student's phone at 11pm — you
> get "it didn't work" and no stack trace. This is a small phase and it is the difference between
> a pilot that produces data and one that produces anecdotes.

### Changes
- **`ErrorBoundary` at the app root (T—08)** — there is no `ErrorBoundary` and no
  `componentDidCatch` anywhere today, so a single render error white-screens the entire app with
  no recovery path.
- **Crash reporting (T—09)** — Sentry or Crashlytics; see open question #5.
- **Firestore offline persistence (T—10)** — `getFirestore(app)` is called with no cache config,
  so the app is dead on a weak connection. Campus wifi will find this immediately.
- **Scraper health check (T—11)** — alert on zero events ingested across N consecutive runs. A
  silent ingestion failure is indistinguishable from a quiet week on campus, and during a 2-week
  pilot you cannot afford to confuse the two.

### Exit criteria
- A deliberate thrown error surfaces in the crash dashboard and the app shows a recovery screen
  rather than a white one.
- Airplane mode still renders the last-loaded feed.

---

> [!TIP]
> ## ▶ PAUSE POINT — 2-Week Pilot
>
> One club (BRCA is the obvious candidate — apex cultural body, highest event volume), ~20
> students, two weeks.
>
> At this stage the app is **secure, and its core loop works end to end.** It is not yet polished:
> 14 UI/UX findings remain open in Phase 4, so expect rough edges — that is the point. You are
> testing whether the loop holds, not whether it looks finished.
>
> **What the pilot surfaces that no audit can:** runtime and device bugs, layout on cheap Android
> screens, behaviour under real latency, whether coordinators actually use the approve/reject
> queue, whether Gemini's extraction is accurate enough on this month's real posters, and where
> the confidence threshold should sit.
>
> **Exit criterion:** a written, ranked list of what broke. That list re-prioritises every phase
> below.

---

# Phase 4 — UI, UX and Accessibility
**Findings:** F—28 … F—39, F—41, F—42 (14 findings)

Read `skills/ui-ux-skill.md` and `skills/frontend-skill.md` first — they are this project's own
design rules and they are binding.

### Changes, in impact order
- **Load the fonts (F—28)** — Outfit and Geist are declared in `theme/typography.ts`, `expo-font`
  is a registered plugin, and nothing calls `useFonts`. The entire typographic identity is silently
  falling back to system faces on both platforms. Highest visual impact in the app.
- **Accessibility pass (F—31)** — 12 `accessibilityLabel` props across 136 `Pressable` elements.
  One systematic sweep: labels, roles, states. Not opportunistic.
- **WhatsApp tap-through (F—29)** — `e.stopPropagation()` is a no-op in RN touch handling, so the
  pill also opens the detail modal. Restructure so it sits outside the card's press target.
- **Double image decode (F—30)** — one `Image` per card, not two of the same URL. *See X—02: if
  `expo-image` is adopted, that supersedes this fix — do not do both.*
- **Input font size (F—32)** — ≥16px to stop iOS zoom-on-focus.
- **Theme boot (F—33)** — a themed splash instead of `null` while AsyncStorage resolves.
- **Gate Studio mode (F—34)** — the toggle currently sits ungated in the student top bar.
- **Studio home (F—35)** — both tab sets share a `home` id, so switching modes appears to do
  nothing.
- **Notification badge (F—36)** — `notificationCount` is declared and never passed; the modal
  behind it lists a hardcoded array.
- **Directory status dots (F—37)** — "Open/Closed" comes from a static field, not opening hours.
  Either wire it to real hours or remove the badge; a wrong "Open" sends someone across campus.
- **Remove demo personas (F—38)** — "Aarav Sharma" and "coordinator@brca.iitd.ac.in" are one tap
  away on shipped sign-in flows.
- **Image fallbacks (F—39)** — host avatars and Directory club images have no `onError`.
- **Filter state (F—41)** — the saved-events chip uses rendered display text as its state value,
  matched by `startsWith`. A copy change breaks the filter.
- **Dead sidebar props (F—42)** — `onToggleTheme` and `isDark` are passed in and never used; a
  `themeToggle` style exists with nothing rendering it.

### Exit criteria
- Fonts visibly render as Outfit/Geist — state how you confirmed it.
- Report the new accessibility ratio (from 12/136).
- `grep -rn "#[0-9A-Fa-f]\{6\}" loop-app/src --include='*.tsx' | grep -v 'src/theme/' | wc -l`
  must not exceed 32 and should fall.

---

# Phase 5 — Consolidate and Put a Net Under It
**Findings:** F—43 … F—47

### Changes
- **`loop-scraper/`** — collapse six near-duplicate entry points into one CLI with subcommands;
  the copy-pasted `parse_with_gemini` and Cloudinary helpers become one shared module **(F—43)**.
- **Handle list (F—44)** — `docs/insta_ids.md` (45 handles) is canonical; delete
  `skills/insta_ids.md` (41, and it disagrees on `@enactus_iitd` vs `@enactus_iitdelhi`); parse the
  list at runtime instead of `scraper.py:24`'s hardcoded 27.
- **`gemini_parser.py` (F—45)** — delete or rewrite. It duplicates the extraction `scraper.py` now
  does inline and still uses the abandoned free-text category vocabulary. **This is the Python twin
  of F—10** — fixing only the TypeScript side leaves the same bug alive here.
- **Dependencies (F—46)** — remove `react-native-svg` (zero references) and
  `@google/generative-ai` (superseded SDK; Phase 1 moved Gemini server-side anyway).
- **CI (F—47)** — `tsc --noEmit`, a linter, and tests around both parsers and the pure date parser
  in `calendar.ts`. The baseline is good: `tsc` passes clean under `strict` today.

### Exit criteria
- One Python entry point; `grep -rn "def parse_with_gemini" loop-scraper/` returns one result.
- CI runs `tsc --noEmit` on every push and fails the build on error.

---

# Phase 6 — Release Engineering
**Findings:** T—01 … T—05, T—07

The app cannot currently be built for iOS or updated without a store review. Fix the config before
you need it under time pressure.

- **T—01** — add `ios.bundleIdentifier`. Without it **EAS cannot build or submit for iOS at all.**
  Android has `com.loop.iitd`; iOS has only `supportsTablet`.
- **T—02** — remove `userInterfaceStyle: "light"` or set it to `"automatic"`. It currently pins
  native to light appearance, so `useColorScheme()` always returns light and **the entire dark
  theme plus the `mode: 'system'` path are dead on device** — while the splash is obsidian
  `#0A0A0C`. Today a dark splash hands off to a forced-light app.
- **T—03** — add a `scheme`. No deep linking today, which blocks X—01 and any OAuth redirect.
- **T—04** — add `expo-updates` so fixes ship without a full store cycle.
- **T—05** — fill in `eas.json`'s empty production profile: channel, env, `autoIncrement`.
- **T—07** — cache headers in `firebase.json` hosting. Hashed assets get a long max-age;
  `index.html` does not.

*(T—06 was completed in Phase 2 alongside the composite indexes.)*

---

# Phase 7 — Scale and Cost Control
**Findings:** T—12 … T—16

Every metered service in this stack is currently unbounded.

- **T—12** — there are **zero `limit()` calls in the entire app.** Every query fetches the whole
  collection. Paginate all three call sites.
- **T—13** — there is **no `FlatList` or `VirtualizedList` anywhere**; feeds are `ScrollView` +
  `.map()`, so every card mounts at once. Combined with F—30's double decode this is the scale
  ceiling.
- **T—14** — no Cloudinary transformation parameters anywhere; full-resolution posters are being
  delivered to phones. Adding `f_auto,q_auto,w_800` to delivery URLs is the **cheapest performance
  win in this entire document.**
- **T—15** — budget alarms on Apify, Gemini, Cloudinary and Firestore.
- **T—16** — archival or TTL for past events, so both queries stop growing without limit.

---

# Phase 8 — Product Completeness
**Findings:** T—17 … T—22

Capabilities the product implies but does not have. **Re-rank these against the pilot's findings
before starting** — this is the phase most likely to change shape.

- **T—17** — push notification infrastructure. F—12 covers *local* reminders only; campus-wide
  push needs FCM/APNs, a token store and a sender. This is a project, not a fix.
- **T—18** — first-run onboarding. Interests currently default to everything selected, silently.
- **T—19** — event sharing. **Depends on T—03 (Phase 6).**
- **T—20** — a report/abuse path, on a product that republishes third-party content to a campus.
- **T—21** — search is a client-side substring match over already-loaded events; once T—12 lands it
  will find nothing outside the current page.
- **T—22** — the club identity model, using the club ID designed into the Phase 1 claim. Root cause
  of F—19.

---

# Phase 9 — Compliance and Quality
**Findings:** T—23 … T—27

- **T—23** — privacy policy and terms. **Hard blockers for both the App Store and Play Store.** The
  app collects a name, a Kerberos ID and a hostel.
- **T—24** — **decide the ingestion posture (open question #4).** Automated Instagram scraping is
  against Meta's terms and club posters are the clubs' copyright. Material exposure for a public
  listing naming 39 organisations. The lower-risk architecture is clubs submitting through the
  Studio you already built, with scraping as backfill. **This is a user decision, not an
  engineering one.**
- **T—25** — a data deletion path for the student profile. India's DPDP Act 2023 applies, and both
  stores require it independently.
- **T—26** — real accessibility beyond labels: contrast ratios against both themes, dynamic type,
  and `prefers-reduced-motion` for the several `Animated.loop` uses.
- **T—27** — Firestore backup and restore, in a repo that contains both `wipe_db.py` and
  `purge_and_reset.py`.

---

# Phase 10 — Exceptional Quality
**Items:** X—01 … X—04

Beyond the audit — genuine upgrades from "works well" to "feels premium." All optional, all
post-pilot.

- **X—01 · Deep linking and sharing.** Universal links (`loop.iitd.ac.in/event/123`) so a shared
  WhatsApp link opens the app directly to that event. **Hard dependency on T—03 (Phase 6) — the
  app has no `scheme` today.** Overlaps T—19; do them together.
- **X—02 · `expo-image`.** Memory caching, blurhash placeholders, faster feed scrolling.
  **This supersedes F—30 and pairs with T—14** — adopt it *instead of* the manual double-image
  fix, not in addition. Best value item in this phase.
- **X—03 · Haptics.** `expo-haptics` on save and on approve/reject. Cheap, and it lands well on the
  swipe-to-moderate gesture that already exists in the Queue.
- **X—04 · Optimistic UI — in the Queue, not on save.** Approve/reject currently blocks on a
  Firestore round-trip before the card advances; that is where optimism helps.
  **Note: saving an event already has no network call** — `toggleSave` at `App.tsx:93` writes only
  to AsyncStorage, so there is nothing to optimise there.

> [!NOTE]
> **`react-native-reanimated` is deliberately excluded.** The app uses RN `Animated` consistently
> across ~6 components and it works. Migrating means rewriting all of them for smoothness nobody
> has reported as a problem. If scroll performance is a real pilot complaint, X—02 plus T—13
> (virtualization) will fix more of it than reanimated would, at a fraction of the risk.

---

## Verification Plan

Run these. Paste real output — a claim without output is "NOT VERIFIED."

```bash
# Type check — must stay clean, every phase
cd loop-app && npx tsc --noEmit

# Phase 1 exit: client must not hold the Gemini key
grep -rn "EXPO_PUBLIC_GEMINI_API_KEY" loop-app/src

# Phase 1 exit: rules tested against the emulator, never by reading them
firebase emulators:start --only firestore

# Phase 4 exit: hardcoded colors outside the theme (currently 32 — must not grow)
grep -rn "#[0-9A-Fa-f]\{6\}" loop-app/src --include='*.tsx' | grep -v 'src/theme/' | wc -l

# Phase 4 exit: accessibility ratio (currently 12 / 136)
grep -ro 'accessibilityLabel' loop-app/src | wc -l
grep -ro 'Pressable' loop-app/src | wc -l

# Phase 5 exit: one parser, not two
grep -rn "def parse_with_gemini" loop-scraper/

# Phase 7 exit: unbounded queries (currently 0 limit() calls — must become > 0)
grep -rn 'limit(' loop-app/src loop-app/App.tsx | wc -l

# After every phase: keep the knowledge graph current
graphify update .
```

---

## Coverage matrix

Every ID appears exactly once. Check against this before declaring a phase complete.

| Phase | Findings | Count |
|-------|----------|-------|
| 1 · Identity | F—01, F—02, F—03, F—04, F—05, F—06, F—07, F—08, F—09 | 9 |
| 2 · Event contract | F—14, F—15, F—20, F—26, F—40 · T—06 | 6 |
| 3 · Dead features | F—10, F—11, F—12, F—13, F—16, F—17, F—18, F—19, F—21, F—22, F—23, F—24, F—25, F—27 | 14 |
| 3B · Pilot instrumentation | T—08, T—09, T—10, T—11 | 4 |
| **▶ PILOT** | — | — |
| 4 · UI / UX / a11y | F—28, F—29, F—30, F—31, F—32, F—33, F—34, F—35, F—36, F—37, F—38, F—39, F—41, F—42 | 14 |
| 5 · Consolidation | F—43, F—44, F—45, F—46, F—47 | 5 |
| 6 · Release engineering | T—01, T—02, T—03, T—04, T—05, T—07 | 6 |
| 7 · Scale & cost | T—12, T—13, T—14, T—15, T—16 | 5 |
| 8 · Product completeness | T—17, T—18, T—19, T—20, T—21, T—22 | 6 |
| 9 · Compliance & quality | T—23, T—24, T—25, T—26, T—27 | 5 |
| 10 · Exceptional quality | X—01, X—02, X—03, X—04 | 4 |
| | **Total** | **78** |

**F: 47/47 · T: 27/27 · X: 4/4.**

> [!WARNING]
> **`F—48` and above are reserved for newly discovered findings**, per §0.5 of the brief. Do not
> reuse them for production-readiness items — those carry the `T—` prefix. Renumbering breaks
> traceability between commits and the audit.
