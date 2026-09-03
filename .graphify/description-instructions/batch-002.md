# Node Description Batch 3 of 6

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

- "concept_target_handles": "TARGET_HANDLES scrape list" | kind=entity | source=loop-scraper/scraper.py:L24 | neighbors=[scraper.py, IIT Delhi club & board Instagram direct…]
- "data_avatars_getclubavatar": "getClubAvatar()" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L46 | neighbors=[avatars.ts, clubs.ts]
- "data_directory_directoryitem": "DirectoryItem" | kind=code-symbol | source=loop-app/src/data/directory.ts:L1 | neighbors=[directory.ts, geminiAI.ts]
- "data_pulse_pulse": "PULSE" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L14 | neighbors=[pulse.ts, PulseScreen.tsx]
- "data_queue": "queue.ts" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[ScrapedItem, QueueScreen.tsx]
- "data_queue_scrapeditem": "ScrapedItem" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[queue.ts, QueueScreen.tsx]
- "deps_scraper_stack": "Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinar…" | kind=entity | source=loop-scraper/requirements.txt | neighbors=[scraper.py, Instagram → Gemini → Firestore ingestio…]
- "docs_insta_ids_directory": "IIT Delhi club & board Instagram directory" | kind=entity | source=docs/insta_ids.md | neighbors=[TARGET_HANDLES scrape list, insta_ids duplicate (skills/)]
- "loop_scraper_gemini_parser_parse_with_gemini": "parse_with_gemini()" | kind=code-symbol | source=loop-scraper/gemini_parser.py:L10 | neighbors=[gemini_parser.py, process()]
- "loop_scraper_gemini_parser_process": "process()" | kind=code-symbol | source=loop-scraper/gemini_parser.py:L58 | neighbors=[gemini_parser.py, parse_with_gemini()]
- "loop_scraper_harvest_avatars": "harvest_avatars.py" | kind=code-symbol | source=loop-scraper/harvest_avatars.py:L1 | neighbors=[harvest_avatars(), upload_avatar_to_cloudinary()]
- "loop_scraper_harvest_avatars_harvest_avatars": "harvest_avatars()" | kind=code-symbol | source=loop-scraper/harvest_avatars.py:L50 | neighbors=[harvest_avatars.py, upload_avatar_to_cloudinary()]
- "loop_scraper_puppeteer_scraper_downloadimage": "downloadImage()" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L29 | neighbors=[puppeteer_scraper.js, scrapeInstagram()]
- "loop_scraper_puppeteer_scraper_scrapeinstagram": "scrapeInstagram()" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L44 | neighbors=[puppeteer_scraper.js, downloadImage()]
- "loop_scraper_purge_and_reset": "purge_and_reset.py" | kind=code-symbol | source=loop-scraper/purge_and_reset.py:L1 | neighbors=[extract_cloudinary_public_id(), purge_all()]
- "loop_scraper_purge_and_reset_purge_all": "purge_all()" | kind=code-symbol | source=loop-scraper/purge_and_reset.py:L39 | neighbors=[purge_and_reset.py, extract_cloudinary_public_id()]
- "loop_scraper_scraper_get_avatar_for_handle": "get_avatar_for_handle()" | kind=code-symbol | source=loop-scraper/scraper.py:L66 | neighbors=[scraper.py, run_apify_pipeline()]
- "loop_scraper_scraper_upload_image": "upload_image()" | kind=code-symbol | source=loop-scraper/scraper.py:L91 | neighbors=[scraper.py, run_apify_pipeline()]
- "loop_scraper_stock_scraper": "stock_scraper.py" | kind=code-symbol | source=loop-scraper/stock_scraper.py:L1 | neighbors=[download_image(), parse_with_gemini()]
- "skills_frontend_design": "ck:frontend-design skill (vendored)" | kind=entity | source=skills/frontend-skill.md | neighbors=[Crimson & Onyx design system, ck:ui-ux-pro-max skill (vendored)]
- "skills_ui_ux_pro_max": "ck:ui-ux-pro-max skill (vendored)" | kind=entity | source=skills/ui-ux-skill.md | neighbors=[ck:frontend-design skill (vendored), Crimson & Onyx design system]
- "theme_colors_palette": "palette" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L10 | neighbors=[colors.ts, index.ts]
- "theme_spacing_radii": "radii" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L29 | neighbors=[index.ts, spacing.ts]
- "theme_spacing_shadows": "shadows" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L39 | neighbors=[index.ts, spacing.ts]
- "theme_spacing_spacing": "spacing" | kind=code-symbol | source=loop-app/src/theme/spacing.ts:L8 | neighbors=[index.ts, spacing.ts]
- "theme_themecontext_themeprovider": "ThemeProvider()" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L33 | neighbors=[index.ts, ThemeContext.tsx]
- "theme_themecontext_usetheme": "useTheme()" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L72 | neighbors=[index.ts, ThemeContext.tsx]
- "theme_typography_typography": "typography" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L23 | neighbors=[index.ts, typography.ts]
- "utils_auth_usestudentauth": "useStudentAuth()" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L42 | neighbors=[App.tsx, auth.ts]
- "utils_calendar_parsedateandtime": "parseDateAndTime()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L37 | neighbors=[calendar.ts, getGoogleCalendarUrl()]
- "utils_calendar_togooglecalendarformat": "toGoogleCalendarFormat()" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L106 | neighbors=[calendar.ts, getGoogleCalendarUrl()]
- "utils_geminiparser_getmodel": "getModel()" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L60 | neighbors=[geminiParser.ts, parseEventPoster()]
- "utils_geminiparser_parseeventposterfromurl": "parseEventPosterFromUrl()" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L142 | neighbors=[QueueScreen.tsx, geminiParser.ts]
- "utils_linking_openmaps": "openMaps()" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L47 | neighbors=[linking.ts, openExternalLink()]
- "utils_storage_hassetinterests": "hasSetInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L16 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadinterests": "loadInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L25 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadreminder": "loadReminder()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L52 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadsavedevents": "loadSavedEvents()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L39 | neighbors=[App.tsx, storage.ts]
- "utils_storage_saveinterests": "saveInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L34 | neighbors=[App.tsx, storage.ts]
- "utils_storage_savereminder": "saveReminder()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L61 | neighbors=[App.tsx, storage.ts]

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
