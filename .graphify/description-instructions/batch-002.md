# Node Description Batch 3 of 8

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

- "utils_geminiai_askcampusai": "askCampusAI()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L19 | neighbors=[AICampusConcierge.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_geminiai_enhanceeventdraft": "enhanceEventDraft()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L87 | neighbors=[SubmitScreen.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_geminiai_generateeventpitch": "generateEventPitch()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L70 | neighbors=[EventDetailModal.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_session_ensuresignedin": "ensureSignedIn()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L39 | neighbors=[App.tsx, session.ts, vercelClient.ts]
- "utils_session_getcoordinatorinfo": "getCoordinatorInfo()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L78 | neighbors=[session.ts, readClaims(), isCoordinator()]
- "utils_session_oncoordinatorchange": "onCoordinatorChange()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L93 | neighbors=[QueueScreen.tsx, SubmitScreen.tsx, session.ts]
- "components_notificationmodal_initial_notifications": "INITIAL_NOTIFICATIONS" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L16 | neighbors=[NotificationModal.tsx, App.tsx]
- "concept_firestore_contract": "Firestore events collection (system contract)" | kind=entity | source=loop-app/src/config/firebase.ts | neighbors=[firebase.ts, App.tsx]
- "concept_gemini_vision_extraction": "Gemini flyer→structured-event extraction" | kind=entity | source=loop-app/scraper/gemini_parser.py:L10 | neighbors=[Client-side Gemini concierge calls, Event confidenceScore triage]
- "data_avatars_getclubavatar": "getClubAvatar()" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L46 | neighbors=[avatars.ts, clubs.ts]
- "data_directory_directoryitem": "DirectoryItem" | kind=code-symbol | source=loop-app/src/data/directory.ts:L1 | neighbors=[directory.ts, geminiAI.ts]
- "data_pulse_pulseitem": "PulseItem" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L1 | neighbors=[pulse.ts, PulseScreen.tsx]
- "data_queue": "queue.ts" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[ScrapedItem, QueueScreen.tsx]
- "data_queue_scrapeditem": "ScrapedItem" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[queue.ts, QueueScreen.tsx]
- "docs_insta_ids_directory": "IIT Delhi club & board Instagram directory" | kind=entity | source=loop-app/docs/insta_ids.md | neighbors=[TARGET_HANDLES scrape list, insta_ids duplicate (skills/)]
- "lib_guard_initadmin": "initAdmin()" | kind=code-symbol | source=api/_lib/guard.ts:L24 | neighbors=[guard.ts, guard()]
- "readme_monorepo_split": "Two-subsystem monorepo (app + scraper)" | kind=entity | source=README.md | neighbors=[Loop — Campus Concierge, App.tsx]
- "scraper_puppeteer_scraper_downloadimage": "downloadImage()" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L29 | neighbors=[puppeteer_scraper.js, scrapeInstagram()]
- "scraper_puppeteer_scraper_scrapeinstagram": "scrapeInstagram()" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L44 | neighbors=[puppeteer_scraper.js, downloadImage()]
- "scraper_purge_and_reset": "purge_and_reset.py" | kind=code-symbol | source=loop-app/scraper/purge_and_reset.py:L1 | neighbors=[extract_cloudinary_public_id(), purge_all()]
- "scraper_purge_and_reset_purge_all": "purge_all()" | kind=code-symbol | source=loop-app/scraper/purge_and_reset.py:L39 | neighbors=[purge_and_reset.py, extract_cloudinary_public_id()]
- "scraper_scraper_get_avatar_for_handle": "get_avatar_for_handle()" | kind=code-symbol | source=loop-app/scraper/scraper.py:L56 | neighbors=[scraper.py, run_apify_pipeline()]
- "scraper_set_admin_init": "init()" | kind=code-symbol | source=loop-app/scraper/set_admin.py:L23 | neighbors=[set_admin.py, main()]
- "scraper_set_admin_list_coordinators": "list_coordinators()" | kind=code-symbol | source=loop-app/scraper/set_admin.py:L30 | neighbors=[set_admin.py, main()]
- "scraper_shared": "shared.py" | kind=code-symbol | source=loop-app/scraper/shared.py:L1 | neighbors=[parse_with_gemini(), upload_image_to_cloudinary()]
- "scraper_shared_parse_with_gemini": "parse_with_gemini()" | kind=code-symbol | source=loop-app/scraper/shared.py:L71 | neighbors=[shared.py, Parses poster images and caption using …]
- "scraper_shared_upload_image_to_cloudinary": "upload_image_to_cloudinary()" | kind=code-symbol | source=loop-app/scraper/shared.py:L36 | neighbors=[shared.py, Upload a poster and return its secure U…]
- "skills_frontend_design": "ck:frontend-design skill (vendored)" | kind=entity | source=loop-app/docs/skills/frontend-skill.md | neighbors=[Crimson & Onyx design system, ck:ui-ux-pro-max skill (vendored)]
- "skills_ui_ux_pro_max": "ck:ui-ux-pro-max skill (vendored)" | kind=entity | source=loop-app/docs/skills/ui-ux-skill.md | neighbors=[ck:frontend-design skill (vendored), Crimson & Onyx design system]
- "theme_colors_palette": "palette" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L10 | neighbors=[colors.ts, index.ts]
- "theme_spacing_radii": "radii" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L29 | neighbors=[index.ts, spacing.ts]
- "theme_spacing_shadows": "shadows" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L39 | neighbors=[index.ts, spacing.ts]
- "theme_spacing_spacing": "spacing" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L8 | neighbors=[index.ts, spacing.ts]
- "theme_themecontext_themeprovider": "ThemeProvider()" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L33 | neighbors=[index.ts, ThemeContext.tsx]
- "theme_themecontext_usetheme": "useTheme()" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L85 | neighbors=[index.ts, ThemeContext.tsx]
- "theme_typography_typography": "typography" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L23 | neighbors=[index.ts, typography.ts]
- "utils_auth_usestudentauth": "useStudentAuth()" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L42 | neighbors=[App.tsx, auth.ts]
- "utils_calendar_parsedateandtime": "parseDateAndTime()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L37 | neighbors=[calendar.ts, getGoogleCalendarUrl()]
- "utils_calendar_togooglecalendarformat": "toGoogleCalendarFormat()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L118 | neighbors=[calendar.ts, getGoogleCalendarUrl()]
- "utils_linking_openmaps": "openMaps()" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L47 | neighbors=[linking.ts, openExternalLink()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-002.json

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
