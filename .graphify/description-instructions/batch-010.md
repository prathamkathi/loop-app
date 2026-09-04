# Node Description Batch 11 of 18

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

- "assets_index_cu5cxrnl_rc": "Rc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, Rs()]
- "assets_index_cu5cxrnl_rl": "rl()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, .has()]
- "assets_index_cu5cxrnl_rv": "Rv()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, bv()]
- "assets_index_cu5cxrnl_sc": "sc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, ma()]
- "assets_index_cu5cxrnl_si": "Si()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, xv()]
- "assets_index_cu5cxrnl_tp": "Tp()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js, Vt()]
- "assets_index_cu5cxrnl_tv": "Tv()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, Ov()]
- "assets_index_cu5cxrnl_uc": "Uc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, re()]
- "assets_index_cu5cxrnl_ui": "Ui()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, ng()]
- "assets_index_cu5cxrnl_uo": "Uo()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js, _u()]
- "assets_index_cu5cxrnl_us": "us" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, lh()]
- "assets_index_cu5cxrnl_v": "_v()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, xv()]
- "assets_index_cu5cxrnl_vf": "Vf()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, xs()]
- "assets_index_cu5cxrnl_vs": "Vs()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js, Np()]
- "assets_index_cu5cxrnl_wa": "wa()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, xa()]
- "assets_index_cu5cxrnl_wc": "wc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, ma()]
- "assets_index_cu5cxrnl_wv": "wv()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, xv()]
- "assets_index_cu5cxrnl_xh": "xh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, _t()]
- "assets_index_cu5cxrnl_xl": "xl()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, qr()]
- "assets_index_cu5cxrnl_xu": "xu()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, ku()]
- "assets_index_cu5cxrnl_yi": "yi()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, fv()]
- "assets_index_cu5cxrnl_yo": "Yo()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js, wr()]
- "assets_index_cu5cxrnl_yu": "yu()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, ku()]
- "assets_index_cu5cxrnl_zc_constructor": ".constructor()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[zc(), to()]
- "assets_index_cu5cxrnl_zc_get_effect_pending": ".get_effect_pending()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[zc(), s()]
- "assets_index_cu5cxrnl_zc_is_rendered": ".is_rendered()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[Ia(), zc()]
- "assets_index_cu5cxrnl_zc_m": ".#m()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[zc(), Yt()]
- "assets_index_cu5cxrnl_zc_v": ".#v()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[zc(), .transfer_effects()]
- "assets_index_cu5cxrnl_zf": "Zf()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, fv()]
- "assets_index_cu5cxrnl_zh": "Zh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, ji()]
- "assets_index_cu5cxrnl_zv": "zv()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, dv()]
- "components_notificationmodal_initial_notifications": "INITIAL_NOTIFICATIONS" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L16 | neighbors=[NotificationModal.tsx, App.tsx]
- "concept_firestore_contract": "Firestore events collection (system contract)" | kind=entity | source=loop-app/src/config/firebase.ts | neighbors=[firebase.ts, App.tsx]
- "concept_gemini_vision_extraction": "Gemini flyer→structured-event extraction" | kind=entity | source=loop-app/scraper/gemini_parser.py:L10 | neighbors=[Client-side Gemini concierge calls, Event confidenceScore triage]
- "data_avatars_getclubavatar": "getClubAvatar()" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L46 | neighbors=[avatars.ts, clubs.ts]
- "data_directory_directoryitem": "DirectoryItem" | kind=code-symbol | source=loop-app/src/data/directory.ts:L1 | neighbors=[directory.ts, geminiAI.ts]
- "data_pulse_pulseitem": "PulseItem" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L1 | neighbors=[pulse.ts, PulseScreen.tsx]
- "data_queue": "queue.ts" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[ScrapedItem, QueueScreen.tsx]
- "data_queue_scrapeditem": "ScrapedItem" | kind=code-symbol | source=loop-app/src/data/queue.ts:L1 | neighbors=[queue.ts, QueueScreen.tsx]
- "docs_insta_ids_directory": "IIT Delhi club & board Instagram directory" | kind=entity | source=loop-app/docs/insta_ids.md | neighbors=[TARGET_HANDLES scrape list, insta_ids duplicate (skills/)]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-010.json

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
