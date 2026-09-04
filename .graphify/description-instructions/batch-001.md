# Node Description Batch 2 of 8

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "components_floatingfield": "FloatingField.tsx" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L1 | neighbors=[FloatingField(), Props, styles, index.ts, SubmitScreen.tsx]
- "config_firebase_auth": "auth" | kind=code-symbol | source=loop-app/src/config/firebase.ts:L36 | neighbors=[firebase.ts, QueueScreen.tsx, SubmitScreen.tsx, session.ts, vercelClient.ts]
- "data_directory": "directory.ts" | kind=code-symbol | source=loop-app/src/data/directory.ts:L1 | neighbors=[AICampusConcierge.tsx, DIRECTORY, DirectoryItem, DirectoryScreen.tsx, geminiAI.ts]
- "lib_guard_guard": "guard()" | kind=code-symbol | source=api/_lib/guard.ts:L46 | neighbors=[callGemini.ts, getCloudinarySignature.ts, parseEventPoster.ts, guard.ts, initAdmin()]
- "scripts_backfill_events": "backfill_events.ts" | kind=code-symbol | source=loop-app/scripts/backfill_events.ts:L1 | neighbors=[backfillEvents(), db, parse(), serviceAccountPath, Backfill startsAt on events that predat…]
- "utils_cloudinary": "cloudinary.ts" | kind=code-symbol | source=loop-app/src/utils/cloudinary.ts:L1 | neighbors=[EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx, QueueScreen.tsx, getOptimizedImageUrl()]
- "utils_cloudinary_getoptimizedimageurl": "getOptimizedImageUrl()" | kind=code-symbol | source=loop-app/src/utils/cloudinary.ts:L1 | neighbors=[EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx, QueueScreen.tsx, cloudinary.ts]
- "api_callgemini": "callGemini.ts" | kind=code-symbol | source=api/callGemini.ts:L1 | neighbors=[handler(), TEXT_MODELS, guard.ts, guard()]
- "data_categories": "categories.ts" | kind=code-symbol | source=loop-app/src/data/categories.ts:L1 | neighbors=[CATEGORIES, App.tsx, CurateScreen.tsx, HomeScreen.tsx]
- "data_categories_categories": "CATEGORIES" | kind=code-symbol | source=loop-app/src/data/categories.ts:L1 | neighbors=[categories.ts, App.tsx, CurateScreen.tsx, HomeScreen.tsx]
- "navigation_bottomtabbar_tabid": "TabId" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L7 | neighbors=[App.tsx, AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "scraper_scraper_run_apify_pipeline": "run_apify_pipeline()" | kind=code-symbol | source=loop-app/scraper/scraper.py:L73 | neighbors=[scraper.py, Runs Apify Instagram Scraper and ingest…, get_avatar_for_handle(), load_target_handles()]
- "scraper_set_admin": "set_admin.py" | kind=code-symbol | source=loop-app/scraper/set_admin.py:L1 | neighbors=[init(), list_coordinators(), main(), Grant or revoke Club Studio coordinator…]
- "theme_spacing": "spacing.ts" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L1 | neighbors=[index.ts, radii, shadows, spacing]
- "theme_typography": "typography.ts" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L1 | neighbors=[index.ts, geistFamily, outfitFamily, typography]
- "utils_calendar_getgooglecalendarurl": "getGoogleCalendarUrl()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L126 | neighbors=[calendar.ts, parseDateAndTime(), toGoogleCalendarFormat(), openGoogleCalendar()]
- "utils_calendar_opengooglecalendar": "openGoogleCalendar()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L145 | neighbors=[EventDetailModal.tsx, FeaturedCard.tsx, calendar.ts, getGoogleCalendarUrl()]
- "utils_geminiai_callgeminiviafunction": "callGeminiViaFunction()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L9 | neighbors=[geminiAI.ts, askCampusAI(), enhanceEventDraft(), generateEventPitch()]
- "utils_linking_openinstagram": "openInstagram()" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L39 | neighbors=[EventDetailModal.tsx, DirectoryScreen.tsx, linking.ts, openExternalLink()]
- "utils_vercelclient_httpscallable": "httpsCallable()" | kind=code-symbol | source=loop-app/src/utils/vercelClient.ts:L35 | neighbors=[QueueScreen.tsx, SubmitScreen.tsx, geminiAI.ts, vercelClient.ts]
- "api_getcloudinarysignature": "getCloudinarySignature.ts" | kind=code-symbol | source=api/getCloudinarySignature.ts:L1 | neighbors=[handler(), guard.ts, guard()]
- "components_eventcard_openwhatsapp": "openWhatsApp()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L59 | neighbors=[EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx]
- "concept_client_side_gemini": "Client-side Gemini concierge calls" | kind=entity | source=loop-app/src/utils/geminiAI.ts:L4 | neighbors=[AICampusConcierge.tsx, Gemini flyer→structured-event extraction, geminiAI.ts]
- "concept_confidence_score": "Event confidenceScore triage" | kind=entity | source=loop-app/scraper/gemini_parser.py:L38 | neighbors=[Gemini flyer→structured-event extraction, CurateScreen.tsx, QueueScreen.tsx]
- "concept_local_first_identity": "Local-first student identity (AsyncStorage)" | kind=entity | source=loop-app/src/utils/auth.ts | neighbors=[StudentAuthModal.tsx, auth.ts, storage.ts]
- "data_avatars": "avatars.ts" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L1 | neighbors=[CLUB_AVATARS, getClubAvatar(), clubs.ts]
- "data_clubs_clubs": "CLUBS" | kind=code-symbol | source=loop-app/src/data/clubs.ts:L13 | neighbors=[EventDetailModal.tsx, clubs.ts, DirectoryScreen.tsx]
- "data_directory_directory": "DIRECTORY" | kind=code-symbol | source=loop-app/src/data/directory.ts:L18 | neighbors=[AICampusConcierge.tsx, directory.ts, DirectoryScreen.tsx]
- "data_pulse": "pulse.ts" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L1 | neighbors=[PULSE, PulseItem, PulseScreen.tsx]
- "navigation_bottomtabbar_student_tabs": "STUDENT_TABS" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L15 | neighbors=[AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "navigation_bottomtabbar_studio_tabs": "STUDIO_TABS" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L22 | neighbors=[AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "readme_crimson_onyx": "Crimson & Onyx design system" | kind=entity | source=README.md | neighbors=[colors.ts, ck:frontend-design skill (vendored), ck:ui-ux-pro-max skill (vendored)]
- "scraper_purge_and_reset_extract_cloudinary_public_id": "extract_cloudinary_public_id()" | kind=code-symbol | source=loop-app/scraper/purge_and_reset.py:L27 | neighbors=[purge_and_reset.py, purge_all(), Extracts the public_id from a Cloudinar…]
- "scraper_scraper": "scraper.py" | kind=code-symbol | source=loop-app/scraper/scraper.py:L1 | neighbors=[get_avatar_for_handle(), load_target_handles(), run_apify_pipeline()]
- "scraper_scraper_load_target_handles": "load_target_handles()" | kind=code-symbol | source=loop-app/scraper/scraper.py:L25 | neighbors=[scraper.py, Read handles dynamically from docs/inst…, run_apify_pipeline()]
- "scraper_set_admin_main": "main()" | kind=code-symbol | source=loop-app/scraper/set_admin.py:L44 | neighbors=[set_admin.py, init(), list_coordinators()]
- "theme_colors_darkcolors": "darkColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L111 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "theme_colors_lightcolors": "lightColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L80 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "theme_colors_themecolors": "ThemeColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L49 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "utils_auth_studentprofile": "StudentProfile" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L4 | neighbors=[StudentAuthModal.tsx, TopBar.tsx, auth.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-001.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
