# Loop — Deferred Items (Tackle at the End)

Items that require manual action, cloud console access, or user decisions.
None of these block code changes — they block **runtime verification**.

---

## Cloud Console / Manual Setup
- [ ] **Rotate Gemini API key** — current key is leaked in deployed bundle. Revoke in Google AI Studio, issue new one, set as Cloud Function env var `GEMINI_API_KEY`.
- [ ] **Enable Firebase Authentication** — Console → Authentication → Email/Password provider.
- [ ] **Enable Blaze billing** — Cloud Functions require pay-as-you-go.
- [ ] **Set Cloudinary secrets** on Cloud Function env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- [ ] **`git init` the LOOP root** (F—09) — do this *after* `.gitignore` fix (done). Add GitHub Actions secrets so `.github/workflows/scraper.yml` can run.
- [ ] **Install `firebase` CLI** and run `firebase emulators:start --only firestore` to verify security rules.
- [ ] **Deploy Cloud Functions** — `cd loop-app && firebase deploy --only functions`.
- [ ] **Deploy Firestore rules** — `cd loop-app && firebase deploy --only firestore:rules`.
- [ ] **Create coordinator accounts** — use Firebase Auth to create email/password users, then set custom claims via Admin SDK: `{ coordinator: true, clubId: "brca" }`.

## Open Questions (User Decisions)
- [ ] **Q1:** Coordinator verification method — email allowlist, institute SSO, or manual approval?
- [ ] **Q2:** Is the Cloudinary API secret ready?
- [ ] **Q3 (F—26):** `featured` / `day` / `fillingFast` — populate at write time or delete the UI? Deleting removes FeaturedCard + "Featured Tonight" from Home.
- [ ] **Q4:** Scraping as primary ingestion or clubs submit + scraping as backfill?
- [ ] **Q5:** Crash reporting vendor — Sentry or Crashlytics?
- [ ] **Q6:** iOS bundle identifier + Apple/Play accounts created?

## Deferred Findings
- [ ] **F—40:** Replace free-text date/time with a real picker. (Requires new dependencies e.g., `@react-native-community/datetimepicker` and potentially an Expo dev build).
- [ ] **F—26:** Handled via Open Question 3.
- [ ] **F—12:** Wire reminders with `expo-notifications` (Requires new dependency `expo-notifications`).

## Unverified Phase 1 Items
- [ ] Firestore rules tested against emulator (rules are written, not runtime-tested)
- [ ] Cloud Functions deploy and respond correctly
- [ ] End-to-end auth flow: coordinator signs in → reads pending → approves
- [x] **F—28:** Load Fonts (Outfit, Geist). (Requires `@expo-google-fonts` packages).
- [ ] **F—30 / X—02:** Double image decode / `expo-image` adoption. (Requires `expo-image` package).
