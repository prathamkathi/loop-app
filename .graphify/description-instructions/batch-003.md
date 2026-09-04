# Node Description Batch 4 of 8

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "utils_session_iscoordinator": "isCoordinator()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L84 | neighbors=[session.ts, getCoordinatorInfo()]
- "utils_session_readclaims": "readClaims()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L60 | neighbors=[session.ts, getCoordinatorInfo()]
- "utils_storage_hassetinterests": "hasSetInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L16 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadinterests": "loadInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L25 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadreminder": "loadReminder()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L52 | neighbors=[App.tsx, storage.ts]
- "utils_storage_loadsavedevents": "loadSavedEvents()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L39 | neighbors=[App.tsx, storage.ts]
- "utils_storage_saveinterests": "saveInterests()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L34 | neighbors=[App.tsx, storage.ts]
- "utils_storage_savereminder": "saveReminder()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L61 | neighbors=[App.tsx, storage.ts]
- "utils_storage_savesavedevents": "saveSavedEvents()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L48 | neighbors=[App.tsx, storage.ts]
- "utils_usefonts": "useFonts.ts" | kind=code-symbol | source=loop-app/src/utils/useFonts.ts:L1 | neighbors=[App.tsx, useCustomFonts()]
- "utils_usefonts_usecustomfonts": "useCustomFonts()" | kind=code-symbol | source=loop-app/src/utils/useFonts.ts:L4 | neighbors=[App.tsx, useFonts.ts]
- "utils_vercelclient_apierror": "ApiError" | kind=code-symbol | source=loop-app/src/utils/vercelClient.ts:L15 | neighbors=[vercelClient.ts, .constructor()]
- "utils_vercelclient_apierrormessage": "apiErrorMessage()" | kind=code-symbol | source=loop-app/src/utils/vercelClient.ts:L25 | neighbors=[SubmitScreen.tsx, vercelClient.ts]
- "api_callgemini_handler": "handler()" | kind=code-symbol | source=api/callGemini.ts:L6 | neighbors=[callGemini.ts]
- "api_callgemini_text_models": "TEXT_MODELS" | kind=code-symbol | source=api/callGemini.ts:L4 | neighbors=[callGemini.ts]
- "api_getcloudinarysignature_handler": "handler()" | kind=code-symbol | source=api/getCloudinarySignature.ts:L4 | neighbors=[getCloudinarySignature.ts]
- "api_parseeventposter_allowed_categories": "ALLOWED_CATEGORIES" | kind=code-symbol | source=api/parseEventPoster.ts:L6 | neighbors=[parseEventPoster.ts]
- "api_parseeventposter_config": "config" | kind=code-symbol | source=api/parseEventPoster.ts:L1 | neighbors=[parseEventPoster.ts]
- "api_parseeventposter_handler": "handler()" | kind=code-symbol | source=api/parseEventPoster.ts:L25 | neighbors=[parseEventPoster.ts]
- "components_aicampusconcierge_aicampusconcierge": "AICampusConcierge()" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L41 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_message": "Message" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L20 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_prompt_chips": "PROMPT_CHIPS" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L33 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_props": "Props" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L27 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_styles": "styles" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L255 | neighbors=[AICampusConcierge.tsx]
- "components_emptystate_emptystate": "EmptyState()" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L11 | neighbors=[EmptyState.tsx]
- "components_emptystate_props": "Props" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L6 | neighbors=[EmptyState.tsx]
- "components_emptystate_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L63 | neighbors=[EmptyState.tsx]
- "components_errorboundary_component": "Component" | kind=code-symbol | neighbors=[ErrorBoundary]
- "components_errorboundary_errorboundary_componentdidcatch": ".componentDidCatch()" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L26 | neighbors=[ErrorBoundary]
- "components_errorboundary_errorboundary_getderivedstatefromerror": ".getDerivedStateFromError()" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L22 | neighbors=[ErrorBoundary]
- "components_errorboundary_errorboundary_render": ".render()" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L49 | neighbors=[ErrorBoundary]
- "components_errorboundary_props": "Props" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L5 | neighbors=[ErrorBoundary.tsx]
- "components_errorboundary_state": "State" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L11 | neighbors=[ErrorBoundary.tsx]
- "components_errorboundary_styles": "styles" | kind=code-symbol | source=loop-app/src/components/ErrorBoundary.tsx:L95 | neighbors=[ErrorBoundary.tsx]
- "components_eventcard_eventcard": "EventCard()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L72 | neighbors=[EventCard.tsx]
- "components_eventcard_props": "Props" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L10 | neighbors=[EventCard.tsx]
- "components_eventcard_pulsedot": "PulseDot()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L18 | neighbors=[EventCard.tsx]
- "components_eventcard_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L256 | neighbors=[EventCard.tsx]
- "components_eventdetailmodal_detailrow": "DetailRow()" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L336 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_detailstyles": "detailStyles" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L348 | neighbors=[EventDetailModal.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-003.json

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
