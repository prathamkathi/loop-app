# Node Description Batch 9 of 18

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

- "assets_index_cu5cxrnl_zp": "zp()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js, qr(), Yl()]
- "assets_index_cu5cxrnl_zs": "zs()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, Aa(), qa()]
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
- "utils_geminiai_askcampusai": "askCampusAI()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L19 | neighbors=[AICampusConcierge.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_geminiai_enhanceeventdraft": "enhanceEventDraft()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L87 | neighbors=[SubmitScreen.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_geminiai_generateeventpitch": "generateEventPitch()" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L70 | neighbors=[EventDetailModal.tsx, geminiAI.ts, callGeminiViaFunction()]
- "utils_session_ensuresignedin": "ensureSignedIn()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L39 | neighbors=[App.tsx, session.ts, vercelClient.ts]
- "utils_session_getcoordinatorinfo": "getCoordinatorInfo()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L78 | neighbors=[session.ts, readClaims(), isCoordinator()]
- "utils_session_oncoordinatorchange": "onCoordinatorChange()" | kind=code-symbol | source=loop-app/src/utils/session.ts:L93 | neighbors=[QueueScreen.tsx, SubmitScreen.tsx, session.ts]
- "assets_index_cu5cxrnl_au": "au()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, ou()]
- "assets_index_cu5cxrnl_av": "av()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, lv()]
- "assets_index_cu5cxrnl_bc": "bc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, z()]
- "assets_index_cu5cxrnl_bh": "bh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, _t()]
- "assets_index_cu5cxrnl_ca": "ca" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, pt()]
- "assets_index_cu5cxrnl_cg": "Cg()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L55 | neighbors=[index-CU5cXRnL.js, kg()]
- "assets_index_cu5cxrnl_dc": "dc()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, eu()]
- "assets_index_cu5cxrnl_de": "De()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L2 | neighbors=[index-CU5cXRnL.js, Rf()]
- "assets_index_cu5cxrnl_di": "Di()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, _t()]
- "assets_index_cu5cxrnl_dp": "dp()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L57 | neighbors=[index-CU5cXRnL.js, fp()]
- "assets_index_cu5cxrnl_du": "du()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, Mn()]
- "assets_index_cu5cxrnl_eh": "eh()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L52 | neighbors=[index-CU5cXRnL.js, th()]
- "assets_index_cu5cxrnl_ei": "ei()" | kind=code-symbol | source=.graphify/studio/assets/index-CU5cXRnL.js:L1 | neighbors=[index-CU5cXRnL.js, su()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-008.json

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
