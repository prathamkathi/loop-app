# Node Description Batch 13 of 18

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

- "api_getcloudinarysignature_handler": "handler()" | kind=code-symbol | source=api/getCloudinarySignature.ts:L4 | neighbors=[getCloudinarySignature.ts]
- "api_parseeventposter_allowed_categories": "ALLOWED_CATEGORIES" | kind=code-symbol | source=api/parseEventPoster.ts:L6 | neighbors=[parseEventPoster.ts]
- "api_parseeventposter_config": "config" | kind=code-symbol | source=api/parseEventPoster.ts:L1 | neighbors=[parseEventPoster.ts]
- "api_parseeventposter_handler": "handler()" | kind=code-symbol | source=api/parseEventPoster.ts:L25 | neighbors=[parseEventPoster.ts]
- "assets_index_cu5cxrnl_al": "al" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_ao": "Ao" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_cc": "cc" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_dh": "dh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_eg": "eg()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_fc": "fc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_gr": "gr" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_gs_constructor": ".constructor()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[gs]
- "assets_index_cu5cxrnl_gt": "Gt" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_gv": "gv" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_hv": "hv" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_i": "_i()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_ic": "ic()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_ii": "ii" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_il": "il" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_ir": "ir" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_j": "j()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_jf": "jf()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_jr": "Jr" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_jv": "Jv()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_kh": "kh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_ki": "ki" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_li": "Li" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_mc": "mc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_mt": "mt()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_na": "na()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_nf": "Nf()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_nh": "nh" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_nr": "Nr()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_oa": "oa()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_oi": "Oi()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_op": "Op()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_or": "or" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_pd": "Pd()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_qc": "Qc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js]
- "assets_index_cu5cxrnl_qf": "qf()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-012.json

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
