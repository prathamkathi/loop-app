# Community Labeling

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the community listing below
and write 2-5 word plain-language names for each.

## Language

Write every name in English (en). Do not switch languages.

## Communities

Community 0: NotificationModal.tsx, INITIAL_NOTIFICATIONS, NotificationItem, NotificationModal(, Props, styles, StudentAuthModal.tsx, HOSTELS, StudentAuthModal(, TopBar.tsx, TopBar(, Firestore events collection (system contract
Community 1: auth, Client-side Gemini concierge calls, Event confidenceScore triage, Gemini flyer→structured-event extraction, firebase.ts, firebaseConfig, queue.ts, ScrapedItem, QueueScreen.tsx, FieldRow(, fieldStyles, QueueScreen(
Community 2: EventItem, getGoogleCalendarUrl(, getOptimizedImageUrl(, EventCard.tsx, EventCard(, openWhatsApp(, Props, PulseDot(, styles, EventDetailModal.tsx, DetailRow(, detailStyles
Community 3: openExternalLink(, AICampusConcierge.tsx, AICampusConcierge(, Message, PROMPT_CHIPS, Props, styles, avatars.ts, CLUB_AVATARS, getClubAvatar(, clubs.ts, ClubItem
Community 4: FloatingField.tsx, FloatingField(, Props, styles, Crimson & Onyx design system, ck:frontend-design skill (vendored, ck:ui-ux-pro-max skill (vendored, colors.ts, darkColors, lightColors, palette, ThemeColors
Community 5: CATEGORIES, EmptyState.tsx, EmptyState(, Props, styles, SectionLabel.tsx, SectionLabel(, categories.ts, CurateScreen.tsx, CurateScreen(, DEFAULT_REMINDER_OPTS, getCategoryIcon(
Community 6: TabId, AppNavigator.tsx, AppNavigator(, Props, styles, BottomTabBar.tsx, BottomTabBar(, STUDENT_TABS, STUDIO_TABS, Tab, Sidebar.tsx, Sidebar(
Community 7: guard(, callGemini.ts, handler(, TEXT_MODELS, getCloudinarySignature.ts, parseEventPoster.ts, ALLOWED_CATEGORIES, config, guard.ts, ALLOWED_ORIGINS, Caller, initAdmin(
Community 8: puppeteer_scraper.js, downloadImage(, fs, HANDLES, https, IMAGES_DIR, OUTPUT_DIR, path, puppeteer, scrapeInstagram(
Community 9: ErrorBoundary, ErrorBoundary.tsx, Component, .componentDidCatch(, .getDerivedStateFromError(, .render(, Props, State, styles
Community 10: run_apify_pipeline(, scraper.py, get_avatar_for_handle(, load_target_handles(, Read handles dynamically from docs/insta_ids.md (F-44, Runs Apify Instagram Scraper and ingests validated events wi
Community 11: backfill_events.ts, backfillEvents(, db, parse(, Backfill startsAt on events that predate the schema change (, serviceAccountPath
Community 12: set_admin.py, init(, list_coordinators(, main(, Grant or revoke Club Studio coordinator access.  The Firesto
Community 13: shared.py, parse_with_gemini(, Upload a poster and return its secure URL, or None on failur, Parses poster images and caption using Gemini Vision with st, upload_image_to_cloudinary(
Community 14: purge_and_reset.py, extract_cloudinary_public_id(, purge_all(, Extracts the public_id from a Cloudinary secure_url.
Community 15: TARGET_HANDLES scrape list, IIT Delhi club & board Instagram directory, insta_ids duplicate (skills/
Community 16: Scraper dependency stack (apify, firebase-admin, google-gene, Instagram → Gemini → Firestore ingestion pipeline
Community 17: cli.py, main(
Community 18: generate_real_events.py, generate_real_events(
Community 19: harvest_avatars.py, main(
Community 20: seed_data.py, seed_database(
Community 21: stock_scraper.py, download_image(
Community 22: wipe_db.py, wipe_events(
Community 23: Scheduled autonomous scraper (every 6h
Community 24: generate_events_offline.py
Community 25: wipe_events.py

## Instructions

Write a single JSON object mapping each community id (as a string) to its
2-5 word name to: /Users/prathamkathi/Downloads/LOOP/.graphify/label-instructions/communities.json

Example:
```json
{
  "0": "Authentication Flow",
  "1": "Authentication Flow",
  "2": "Authentication Flow"
}
```

Then re-run `graphify update` (or `graphify label`) to ingest the names.
