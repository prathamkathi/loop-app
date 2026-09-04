# Node Description Batch 7 of 8

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

- "screens_directoryscreen_animatedwrapper": "AnimatedWrapper()" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L21 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_directoryscreen": "DirectoryScreen()" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L58 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_filter_tabs": "FILTER_TABS" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L46 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L267 | neighbors=[DirectoryScreen.tsx]
- "screens_homescreen_homescreen": "HomeScreen()" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L37 | neighbors=[HomeScreen.tsx]
- "screens_homescreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L25 | neighbors=[HomeScreen.tsx]
- "screens_homescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L308 | neighbors=[HomeScreen.tsx]
- "screens_pulsescreen_animatedwrapper": "AnimatedWrapper()" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L11 | neighbors=[PulseScreen.tsx]
- "screens_pulsescreen_pulsescreen": "PulseScreen()" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L36 | neighbors=[PulseScreen.tsx]
- "screens_pulsescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L148 | neighbors=[PulseScreen.tsx]
- "screens_queuescreen_fieldrow": "FieldRow()" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L770 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_fieldstyles": "fieldStyles" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L789 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_queuescreen": "QueueScreen()" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L55 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L804 | neighbors=[QueueScreen.tsx]
- "screens_submitscreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L26 | neighbors=[SubmitScreen.tsx]
- "screens_submitscreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L488 | neighbors=[SubmitScreen.tsx]
- "screens_submitscreen_submitscreen": "SubmitScreen()" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L30 | neighbors=[SubmitScreen.tsx]
- "scripts_backfill_events_backfillevents": "backfillEvents()" | kind=code-symbol | source=loop-app/scripts/backfill_events.ts:L27 | neighbors=[backfill_events.ts]
- "scripts_backfill_events_db": "db" | kind=code-symbol | source=loop-app/scripts/backfill_events.ts:L25 | neighbors=[backfill_events.ts]
- "scripts_backfill_events_parse": "parse()" | kind=code-symbol | source=loop-app/scripts/backfill_events.py:L15 | neighbors=[backfill_events.ts]
- "scripts_backfill_events_rationale_1": "Backfill startsAt on events that predate the schema change (Phase 2, F-14). Dry-" | kind=entity | source=loop-app/scripts/backfill_events.py:L1 | neighbors=[backfill_events.ts]
- "scripts_backfill_events_serviceaccountpath": "serviceAccountPath" | kind=code-symbol | source=loop-app/scripts/backfill_events.ts:L9 | neighbors=[backfill_events.ts]
- "skills_insta_ids_copy": "insta_ids duplicate (skills/)" | kind=entity | source=loop-app/docs/insta_ids.md | neighbors=[IIT Delhi club & board Instagram direct…]
- "theme_themecontext_themecontext": "ThemeContext" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L25 | neighbors=[ThemeContext.tsx]
- "theme_themecontext_themecontextvalue": "ThemeContextValue" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L17 | neighbors=[ThemeContext.tsx]
- "theme_themecontext_thememode": "ThemeMode" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L15 | neighbors=[ThemeContext.tsx]
- "theme_typography_geistfamily": "geistFamily" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L18 | neighbors=[typography.ts]
- "theme_typography_outfitfamily": "outfitFamily" | kind=code-symbol | source=loop-app/src/theme/typography.ts:L13 | neighbors=[typography.ts]
- "utils_auth_clearstudentprofile": "clearStudentProfile()" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L33 | neighbors=[auth.ts]
- "utils_auth_getstoredstudentprofile": "getStoredStudentProfile()" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L15 | neighbors=[auth.ts]
- "utils_auth_savestudentprofile": "saveStudentProfile()" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L25 | neighbors=[auth.ts]
- "utils_calendar_calendarevent": "CalendarEvent" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L10 | neighbors=[calendar.ts]
- "utils_calendar_month_names": "MONTH_NAMES" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L19 | neighbors=[calendar.ts]
- "utils_session_authready": "authReady" | kind=code-symbol | source=loop-app/src/utils/session.ts:L26 | neighbors=[session.ts]
- "utils_session_coordinatorinfo": "CoordinatorInfo" | kind=code-symbol | source=loop-app/src/utils/session.ts:L56 | neighbors=[session.ts]
- "utils_session_not_coordinator": "NOT_COORDINATOR" | kind=code-symbol | source=loop-app/src/utils/session.ts:L58 | neighbors=[session.ts]
- "utils_storage_keys": "KEYS" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L9 | neighbors=[storage.ts]
- "utils_vercelclient_apierror_constructor": ".constructor()" | kind=code-symbol | source=loop-app/src/utils/vercelClient.ts:L17 | neighbors=[ApiError]
- "readme_scheduled_scraper": "Scheduled autonomous scraper (every 6h)" | kind=entity | source=README.md
- "scraper_generate_events_offline": "generate_events_offline.py" | kind=code-symbol | source=loop-app/scraper/generate_events_offline.py:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-006.json

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
