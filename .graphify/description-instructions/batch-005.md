# Node Description Batch 6 of 6

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

- "readme_scheduled_scraper": "Scheduled autonomous scraper (every 6h)" | kind=entity | source=README.md | neighbors=[scraper.py]
- "screens_curatescreen_curatescreen": "CurateScreen()" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L52 | neighbors=[CurateScreen.tsx]
- "screens_curatescreen_default_reminder_opts": "DEFAULT_REMINDER_OPTS" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L28 | neighbors=[CurateScreen.tsx]
- "screens_curatescreen_getcategoryicon": "getCategoryIcon()" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L36 | neighbors=[CurateScreen.tsx]
- "screens_curatescreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L21 | neighbors=[CurateScreen.tsx]
- "screens_curatescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L248 | neighbors=[CurateScreen.tsx]
- "screens_directoryscreen_animatedwrapper": "AnimatedWrapper()" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L21 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_directoryscreen": "DirectoryScreen()" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L58 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_filter_tabs": "FILTER_TABS" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L46 | neighbors=[DirectoryScreen.tsx]
- "screens_directoryscreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L262 | neighbors=[DirectoryScreen.tsx]
- "screens_homescreen_homescreen": "HomeScreen()" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L34 | neighbors=[HomeScreen.tsx]
- "screens_homescreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L25 | neighbors=[HomeScreen.tsx]
- "screens_homescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L288 | neighbors=[HomeScreen.tsx]
- "screens_pulsescreen_animatedwrapper": "AnimatedWrapper()" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L9 | neighbors=[PulseScreen.tsx]
- "screens_pulsescreen_pulsescreen": "PulseScreen()" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L34 | neighbors=[PulseScreen.tsx]
- "screens_pulsescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L114 | neighbors=[PulseScreen.tsx]
- "screens_queuescreen_fieldrow": "FieldRow()" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L651 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_fieldstyles": "fieldStyles" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L670 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_queuescreen": "QueueScreen()" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L39 | neighbors=[QueueScreen.tsx]
- "screens_queuescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L685 | neighbors=[QueueScreen.tsx]
- "screens_submitscreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L25 | neighbors=[SubmitScreen.tsx]
- "screens_submitscreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L434 | neighbors=[SubmitScreen.tsx]
- "screens_submitscreen_submitscreen": "SubmitScreen()" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L29 | neighbors=[SubmitScreen.tsx]
- "skills_insta_ids_copy": "insta_ids duplicate (skills/)" | kind=entity | source=skills/insta_ids.md | neighbors=[IIT Delhi club & board Instagram direct…]
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
- "utils_geminiai_models": "MODELS" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L7 | neighbors=[geminiAI.ts]
- "utils_geminiparser_allowed_categories": "ALLOWED_CATEGORIES" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L29 | neighbors=[geminiParser.ts]
- "utils_geminiparser_parsedevent": "ParsedEvent" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L17 | neighbors=[geminiParser.ts]
- "utils_storage_keys": "KEYS" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L9 | neighbors=[storage.ts]
- "loop_scraper_generate_events_offline": "generate_events_offline.py" | kind=code-symbol | source=loop-scraper/generate_events_offline.py:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-005.json

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
