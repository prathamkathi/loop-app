# Node Description Batch 2 of 6

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

- "data_directory": "directory.ts" | kind=code-symbol | source=loop-app/src/data/directory.ts:L1 | neighbors=[AICampusConcierge.tsx, DIRECTORY, DirectoryItem, DirectoryScreen.tsx, geminiAI.ts]
- "loop_scraper_scraper_run_apify_pipeline": "run_apify_pipeline()" | kind=code-symbol | source=loop-scraper/scraper.py:L208 | neighbors=[scraper.py, Runs Apify Instagram Scraper and ingest…, get_avatar_for_handle(), parse_with_gemini(), upload_image()]
- "concept_gemini_vision_extraction": "Gemini flyer→structured-event extraction" | kind=entity | source=loop-scraper/gemini_parser.py:L10 | neighbors=[Client-side Gemini concierge calls, Event confidenceScore triage, gemini_parser.py, geminiParser.ts]
- "loop_scraper_gemini_parser": "gemini_parser.py" | kind=code-symbol | source=loop-scraper/gemini_parser.py:L1 | neighbors=[Gemini flyer→structured-event extraction, parse_with_gemini(), process(), Instagram → Gemini → Firestore ingestio…]
- "navigation_bottomtabbar_tabid": "TabId" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L7 | neighbors=[App.tsx, AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "readme_ingestion_pipeline": "Instagram → Gemini → Firestore ingestion pipeline" | kind=entity | source=README.md | neighbors=[Scraper dependency stack (apify, fireba…, gemini_parser.py, puppeteer_scraper.js, scraper.py]
- "theme_spacing": "spacing.ts" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L1 | neighbors=[index.ts, radii, shadows, spacing]
- "theme_typography": "typography.ts" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L1 | neighbors=[index.ts, geistFamily, outfitFamily, typography]
- "utils_calendar_getgooglecalendarurl": "getGoogleCalendarUrl()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L114 | neighbors=[calendar.ts, parseDateAndTime(), toGoogleCalendarFormat(), openGoogleCalendar()]
- "utils_calendar_opengooglecalendar": "openGoogleCalendar()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L133 | neighbors=[EventDetailModal.tsx, FeaturedCard.tsx, calendar.ts, getGoogleCalendarUrl()]
- "utils_geminiai_callgeminirest": "callGeminiREST()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L9 | neighbors=[geminiAI.ts, askCampusAI(), enhanceEventDraft(), generateEventPitch()]
- "utils_linking_openinstagram": "openInstagram()" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L39 | neighbors=[EventDetailModal.tsx, DirectoryScreen.tsx, linking.ts, openExternalLink()]
- "components_eventcard_openwhatsapp": "openWhatsApp()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L57 | neighbors=[EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx]
- "concept_client_side_gemini": "Client-side Gemini concierge calls" | kind=entity | source=loop-app/src/utils/geminiAI.ts:L4 | neighbors=[AICampusConcierge.tsx, Gemini flyer→structured-event extraction, geminiAI.ts]
- "concept_confidence_score": "Event confidenceScore triage" | kind=entity | source=loop-scraper/gemini_parser.py:L38 | neighbors=[Gemini flyer→structured-event extraction, CurateScreen.tsx, QueueScreen.tsx]
- "concept_firestore_contract": "Firestore events collection (system contract)" | kind=entity | source=loop-app/src/config/firebase.ts | neighbors=[firebase.ts, App.tsx, scraper.py]
- "concept_local_first_identity": "Local-first student identity (AsyncStorage)" | kind=entity | source=loop-app/src/utils/auth.ts | neighbors=[StudentAuthModal.tsx, auth.ts, storage.ts]
- "data_avatars": "avatars.ts" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L1 | neighbors=[CLUB_AVATARS, getClubAvatar(), clubs.ts]
- "data_clubs_clubs": "CLUBS" | kind=code-symbol | source=loop-app/src/data/clubs.ts:L13 | neighbors=[EventDetailModal.tsx, clubs.ts, DirectoryScreen.tsx]
- "data_directory_directory": "DIRECTORY" | kind=code-symbol | source=loop-app/src/data/directory.ts:L18 | neighbors=[AICampusConcierge.tsx, directory.ts, DirectoryScreen.tsx]
- "data_pulse": "pulse.ts" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L1 | neighbors=[PULSE, PulseItem, PulseScreen.tsx]
- "loop_scraper_harvest_avatars_upload_avatar_to_cloudinary": "upload_avatar_to_cloudinary()" | kind=code-symbol | source=loop-scraper/harvest_avatars.py:L39 | neighbors=[harvest_avatars.py, harvest_avatars(), Uploads an avatar to Cloudinary in loop…]
- "loop_scraper_purge_and_reset_extract_cloudinary_public_id": "extract_cloudinary_public_id()" | kind=code-symbol | source=loop-scraper/purge_and_reset.py:L27 | neighbors=[purge_and_reset.py, purge_all(), Extracts the public_id from a Cloudinar…]
- "loop_scraper_scraper_parse_with_gemini": "parse_with_gemini()" | kind=code-symbol | source=loop-scraper/scraper.py:L100 | neighbors=[scraper.py, Parses poster images and caption using …, run_apify_pipeline()]
- "loop_scraper_seed_data": "seed_data.py" | kind=code-symbol | source=loop-scraper/seed_data.py:L1 | neighbors=[seed_database(), upload_local_to_cloudinary(), upload_url_to_cloudinary()]
- "loop_scraper_seed_data_seed_database": "seed_database()" | kind=code-symbol | source=loop-scraper/seed_data.py:L50 | neighbors=[seed_data.py, upload_local_to_cloudinary(), upload_url_to_cloudinary()]
- "loop_scraper_seed_data_upload_local_to_cloudinary": "upload_local_to_cloudinary()" | kind=code-symbol | source=loop-scraper/seed_data.py:L32 | neighbors=[seed_data.py, Uploads a local image file to Cloudinar…, seed_database()]
- "loop_scraper_seed_data_upload_url_to_cloudinary": "upload_url_to_cloudinary()" | kind=code-symbol | source=loop-scraper/seed_data.py:L41 | neighbors=[seed_data.py, Uploads a remote image URL to Cloudinar…, seed_database()]
- "navigation_bottomtabbar_student_tabs": "STUDENT_TABS" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L15 | neighbors=[AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "navigation_bottomtabbar_studio_tabs": "STUDIO_TABS" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L22 | neighbors=[AppNavigator.tsx, BottomTabBar.tsx, Sidebar.tsx]
- "readme_crimson_onyx": "Crimson & Onyx design system" | kind=entity | source=README.md | neighbors=[colors.ts, ck:frontend-design skill (vendored), ck:ui-ux-pro-max skill (vendored)]
- "readme_monorepo_split": "Two-subsystem monorepo (app + scraper)" | kind=entity | source=README.md | neighbors=[Loop — Campus Concierge, App.tsx, scraper.py]
- "theme_colors_darkcolors": "darkColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L111 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "theme_colors_lightcolors": "lightColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L80 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "theme_colors_themecolors": "ThemeColors" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L49 | neighbors=[colors.ts, index.ts, ThemeContext.tsx]
- "utils_auth_studentprofile": "StudentProfile" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L4 | neighbors=[StudentAuthModal.tsx, TopBar.tsx, auth.ts]
- "utils_geminiai_askcampusai": "askCampusAI()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L56 | neighbors=[AICampusConcierge.tsx, geminiAI.ts, callGeminiREST()]
- "utils_geminiai_enhanceeventdraft": "enhanceEventDraft()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L124 | neighbors=[SubmitScreen.tsx, geminiAI.ts, callGeminiREST()]
- "utils_geminiai_generateeventpitch": "generateEventPitch()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L107 | neighbors=[EventDetailModal.tsx, geminiAI.ts, callGeminiREST()]
- "utils_geminiparser_parseeventposter": "parseEventPoster()" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L88 | neighbors=[SubmitScreen.tsx, geminiParser.ts, getModel()]

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
