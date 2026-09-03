# Node Description Batch 5 of 6

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

- "components_topbar_styles": "styles" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L192 | neighbors=[TopBar.tsx]
- "components_topbar_topbar": "TopBar()" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L19 | neighbors=[TopBar.tsx]
- "config_firebase_firebaseconfig": "firebaseConfig" | kind=code-symbol | source=loop-app/src/config/firebase.ts:L3 | neighbors=[firebase.ts]
- "data_avatars_club_avatars": "CLUB_AVATARS" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L1 | neighbors=[avatars.ts]
- "data_clubs_clubitem": "ClubItem" | kind=code-symbol | source=loop-app/src/data/clubs.ts:L3 | neighbors=[clubs.ts]
- "data_events_eventcontact": "EventContact" | kind=code-symbol | source=loop-app/src/data/events.ts:L1 | neighbors=[events.ts]
- "data_pulse_pulseitem": "PulseItem" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L1 | neighbors=[pulse.ts]
- "loop_app_app_app": "App()" | kind=code-symbol | source=loop-app/App.tsx:L229 | neighbors=[App.tsx]
- "loop_app_app_appcontent": "AppContent()" | kind=code-symbol | source=loop-app/App.tsx:L33 | neighbors=[App.tsx]
- "loop_app_index": "index.ts" | kind=code-symbol | source=loop-app/index.ts:L1 | neighbors=[App.tsx]
- "loop_scraper_generate_real_events": "generate_real_events.py" | kind=code-symbol | source=loop-scraper/generate_real_events.py:L1 | neighbors=[generate_real_events()]
- "loop_scraper_generate_real_events_generate_real_events": "generate_real_events()" | kind=code-symbol | source=loop-scraper/generate_real_events.py:L21 | neighbors=[generate_real_events.py]
- "loop_scraper_harvest_avatars_rationale_40": "Uploads an avatar to Cloudinary in loop_avatars folder." | kind=entity | source=loop-scraper/harvest_avatars.py:L40 | neighbors=[upload_avatar_to_cloudinary()]
- "loop_scraper_puppeteer_scraper_fs": "fs" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L2 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_handles": "HANDLES" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L7 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_https": "https" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L4 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_images_dir": "IMAGES_DIR" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L24 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_output_dir": "OUTPUT_DIR" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L23 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_path": "path" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L3 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_puppeteer_scraper_puppeteer": "puppeteer" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L1 | neighbors=[puppeteer_scraper.js]
- "loop_scraper_purge_and_reset_rationale_28": "Extracts the public_id from a Cloudinary secure_url." | kind=entity | source=loop-scraper/purge_and_reset.py:L28 | neighbors=[extract_cloudinary_public_id()]
- "loop_scraper_scraper_rationale_101": "Parses poster images and caption using Gemini Vision with structured WhatsApp co" | kind=entity | source=loop-scraper/scraper.py:L101 | neighbors=[parse_with_gemini()]
- "loop_scraper_scraper_rationale_209": "Runs Apify Instagram Scraper and ingests validated events with status: 'pending'" | kind=entity | source=loop-scraper/scraper.py:L209 | neighbors=[run_apify_pipeline()]
- "loop_scraper_seed_data_rationale_33": "Uploads a local image file to Cloudinary unsigned preset." | kind=entity | source=loop-scraper/seed_data.py:L33 | neighbors=[upload_local_to_cloudinary()]
- "loop_scraper_seed_data_rationale_42": "Uploads a remote image URL to Cloudinary unsigned preset." | kind=entity | source=loop-scraper/seed_data.py:L42 | neighbors=[upload_url_to_cloudinary()]
- "loop_scraper_stock_scraper_download_image": "download_image()" | kind=code-symbol | source=loop-scraper/stock_scraper.py:L92 | neighbors=[stock_scraper.py]
- "loop_scraper_stock_scraper_parse_with_gemini": "parse_with_gemini()" | kind=code-symbol | source=loop-scraper/stock_scraper.py:L29 | neighbors=[stock_scraper.py]
- "loop_scraper_wipe_db": "wipe_db.py" | kind=code-symbol | source=loop-scraper/wipe_db.py:L1 | neighbors=[wipe_events()]
- "loop_scraper_wipe_db_wipe_events": "wipe_events()" | kind=code-symbol | source=loop-scraper/wipe_db.py:L16 | neighbors=[wipe_db.py]
- "navigation_appnavigator_appnavigator": "AppNavigator()" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L16 | neighbors=[AppNavigator.tsx]
- "navigation_appnavigator_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L7 | neighbors=[AppNavigator.tsx]
- "navigation_appnavigator_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L58 | neighbors=[AppNavigator.tsx]
- "navigation_bottomtabbar_bottomtabbar": "BottomTabBar()" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L36 | neighbors=[BottomTabBar.tsx]
- "navigation_bottomtabbar_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L29 | neighbors=[BottomTabBar.tsx]
- "navigation_bottomtabbar_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L106 | neighbors=[BottomTabBar.tsx]
- "navigation_bottomtabbar_tab": "Tab" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L9 | neighbors=[BottomTabBar.tsx]
- "navigation_sidebar_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L7 | neighbors=[Sidebar.tsx]
- "navigation_sidebar_sidebar": "Sidebar()" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L16 | neighbors=[Sidebar.tsx]
- "navigation_sidebar_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L112 | neighbors=[Sidebar.tsx]
- "readme_loop_platform": "Loop — Campus Concierge" | kind=entity | source=README.md | neighbors=[Two-subsystem monorepo (app + scraper)]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-004.json

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
