# Loop — Deferred & Blocked Items

Last updated: 4 September 2026, after the security cleanup pass.

Items here require console access, a paid account, or a product decision.
**None of them block code. All of them block runtime verification.**

---

## 🔴 Blocking — do these before the pilot

- [ ] **Rotate the Gemini API key.** The old key was inlined in a deployed web bundle; treat it as
      public. Revoke in Google AI Studio, issue a new one.
      The stale build (`loop-app/dist/`) that contained it has been deleted, and
      `EXPO_PUBLIC_GEMINI_API_KEY` has been removed from `loop-app/.env` so it cannot be inlined
      again. CI now fails if that variable reappears in client code.
- [ ] **Set the Vercel environment variables** on the `loop-api` project:
      `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
      and `FIREBASE_SERVICE_ACCOUNT` (the full service-account JSON as one string — the API needs
      it to verify caller ID tokens).
- [ ] **Enable Firebase Authentication** → Console → Authentication → enable **Email/Password**
      *and* **Anonymous**. Anonymous is required: students are signed in silently so reads and
      concierge calls have a verifiable caller.
- [ ] **Create coordinator accounts** and set their claims:
      `{ coordinator: true, clubId: "brca" }` — use `loop-scraper/set_admin.py`.
      Without this nobody can approve events or submit them.
- [ ] **Deploy the Firestore rules**: `cd loop-app && firebase deploy --only firestore:rules`.
      The tightened rules are committed but not live until deployed.

## 🟡 Pilot prerequisites (code work, not blocked)

- [ ] **T—09 crash reporting.** Still missing, and this is the one that decides whether the pilot
      produces data or anecdotes. Needs a Sentry DSN from your account (open question #5).
- [ ] **T—11 scraper health check.** Alert when a run ingests zero events.

## Open Questions

- [ ] **Q3 (F—26):** `featured` / `day` / `fillingFast` — populate at write time or delete the UI?
      Deleting removes `FeaturedCard` and the "Featured Tonight" section from Home.
- [ ] **Q4 (T—24):** Scraping as primary ingestion, or clubs submit with scraping as backfill?
- [ ] **Q5:** Crash reporting vendor — Sentry or Crashlytics?
- [ ] **Q6:** Apple Developer / Play Console accounts created? (`bundleIdentifier` is set to
      `com.loop.iitd`.)

## Deferred findings — decided, not forgotten

- [ ] **F—12** reminders — needs `expo-notifications`.
- [ ] **F—26** — see Q3.
- [ ] **F—31** accessibility sweep — 12 labels / 138 controls. Post-pilot.
- [ ] **F—40** date/time picker — needs `@react-native-community/datetimepicker` and a dev build.
- [ ] **F—43** scraper consolidation — `cli.py` and `shared.py` exist, but the six original
      scripts remain. There are now 12 Python files, up from 10. Post-pilot.
- [ ] **T—13** `FlatList` virtualization. Post-pilot.
- [ ] **X—02** `expo-image` — supersedes F—30 when adopted; do not do both.

## Resolved since the last update

- [x] **F—09** — the LOOP root is a git repo; everything is in one repository.
- [x] **F—28** — fonts load via `@expo-google-fonts`.
- [x] **F—06** — signed Cloudinary uploads restored; the unsigned preset is gone from the client.
- [x] **F—24** — the dead `currentIndex` state is removed.
- [x] **F—27** — the shadowed second `MAX_EVENTS` declaration is removed.
- [x] **F—23** (partial) — the Home feed now shows a real error state instead of an empty campus.
- [x] **F—34** — Submit is gated on the coordinator claim instead of failing at the write.
- [x] **T—10** — Firestore persistent cache on web; AsyncStorage feed cache on native.
