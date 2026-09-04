# Node Description Batch 18 of 18

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

- "utils_calendar_month_names": "MONTH_NAMES" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L19 | neighbors=[calendar.ts]
- "utils_session_authready": "authReady" | kind=code-symbol | source=loop-app/src/utils/session.ts:L26 | neighbors=[session.ts]
- "utils_session_coordinatorinfo": "CoordinatorInfo" | kind=code-symbol | source=loop-app/src/utils/session.ts:L56 | neighbors=[session.ts]
- "utils_session_not_coordinator": "NOT_COORDINATOR" | kind=code-symbol | source=loop-app/src/utils/session.ts:L58 | neighbors=[session.ts]
- "utils_storage_keys": "KEYS" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L9 | neighbors=[storage.ts]
- "utils_vercelclient_apierror_constructor": ".constructor()" | kind=code-symbol | source=loop-app/src/utils/vercelClient.ts:L17 | neighbors=[ApiError]
- "readme_scheduled_scraper": "Scheduled autonomous scraper (every 6h)" | kind=entity | source=README.md
- "scraper_generate_events_offline": "generate_events_offline.py" | kind=code-symbol | source=loop-app/scraper/generate_events_offline.py:L1
- "scraper_wipe_events": "wipe_events.py" | kind=code-symbol | source=loop-app/scraper/wipe_events.py:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-017.json

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
