# Node Description Batch 6 of 8

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "navigation_appnavigator_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L56 | neighbors=[AppNavigator.tsx] | lang=en
- "navigation_bottomtabbar_bottomtabbar": "BottomTabBar()" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L36 | neighbors=[BottomTabBar.tsx] | lang=en
- "navigation_bottomtabbar_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L29 | neighbors=[BottomTabBar.tsx] | lang=en
- "navigation_bottomtabbar_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L106 | neighbors=[BottomTabBar.tsx] | lang=en
- "navigation_bottomtabbar_tab": "Tab" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L9 | neighbors=[BottomTabBar.tsx] | lang=en
- "navigation_sidebar_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L7 | neighbors=[Sidebar.tsx] | lang=en
- "navigation_sidebar_sidebar": "Sidebar()" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L14 | neighbors=[Sidebar.tsx] | lang=en
- "navigation_sidebar_styles": "styles" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L108 | neighbors=[Sidebar.tsx] | lang=en
- "readme_ingestion_pipeline": "Instagram → Gemini → Firestore ingestion pipeline" | kind=entity | source=README.md | neighbors=[Scraper dependency stack (apify, fireba…] | lang=en
- "readme_loop_platform": "Loop — Campus Concierge" | kind=entity | source=README.md | neighbors=[Two-subsystem monorepo (app + scraper)] | lang=en
- "scraper_cli": "cli.py" | kind=code-symbol | source=loop-app/scraper/cli.py:L1 | neighbors=[main()] | lang=en
- "scraper_cli_main": "main()" | kind=code-symbol | source=loop-app/scraper/cli.py:L4 | neighbors=[cli.py] | lang=en
- "scraper_generate_real_events": "generate_real_events.py" | kind=code-symbol | source=loop-app/scraper/generate_real_events.py:L1 | neighbors=[generate_real_events()] | lang=en
- "scraper_generate_real_events_generate_real_events": "generate_real_events()" | kind=code-symbol | source=loop-app/scraper/generate_real_events.py:L21 | neighbors=[generate_real_events.py] | lang=en
- "scraper_harvest_avatars": "harvest_avatars.py" | kind=code-symbol | source=loop-app/scraper/harvest_avatars.py:L1 | neighbors=[main()] | lang=en
- "scraper_harvest_avatars_main": "main()" | kind=code-symbol | source=loop-app/scraper/harvest_avatars.py:L11 | neighbors=[harvest_avatars.py] | lang=en
- "scraper_puppeteer_scraper_fs": "fs" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L2 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_handles": "HANDLES" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L7 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_https": "https" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L4 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_images_dir": "IMAGES_DIR" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L24 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_output_dir": "OUTPUT_DIR" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L23 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_path": "path" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L3 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_puppeteer_scraper_puppeteer": "puppeteer" | kind=code-symbol | source=loop-app/scraper/puppeteer_scraper.js:L1 | neighbors=[puppeteer_scraper.js] | lang=en
- "scraper_purge_and_reset_rationale_28": "Extracts the public_id from a Cloudinary secure_url." | kind=entity | source=loop-app/scraper/purge_and_reset.py:L28 | neighbors=[extract_cloudinary_public_id()] | lang=en
- "scraper_scraper_rationale_26": "Read handles dynamically from docs/insta_ids.md (F-44)" | kind=entity | source=loop-app/scraper/scraper.py:L26 | neighbors=[load_target_handles()] | lang=en
- "scraper_scraper_rationale_74": "Runs Apify Instagram Scraper and ingests validated events with status: 'pending'" | kind=entity | source=loop-app/scraper/scraper.py:L74 | neighbors=[run_apify_pipeline()] | lang=en
- "scraper_seed_data": "seed_data.py" | kind=code-symbol | source=loop-app/scraper/seed_data.py:L1 | neighbors=[seed_database()] | lang=en
- "scraper_seed_data_seed_database": "seed_database()" | kind=code-symbol | source=loop-app/scraper/seed_data.py:L28 | neighbors=[seed_data.py] | lang=en
- "scraper_set_admin_rationale_1": "Grant or revoke Club Studio coordinator access.  The Firestore rules and the ser" | kind=entity | source=loop-app/scraper/set_admin.py:L1 | neighbors=[set_admin.py] | lang=en
- "scraper_shared_rationale_37": "Upload a poster and return its secure URL, or None on failure.      Dual-mode: a" | kind=entity | source=loop-app/scraper/shared.py:L37 | neighbors=[upload_image_to_cloudinary()] | lang=pt
- "scraper_shared_rationale_72": "Parses poster images and caption using Gemini Vision with structured WhatsApp co" | kind=entity | source=loop-app/scraper/shared.py:L72 | neighbors=[parse_with_gemini()] | lang=en
- "scraper_stock_scraper": "stock_scraper.py" | kind=code-symbol | source=loop-app/scraper/stock_scraper.py:L1 | neighbors=[download_image()] | lang=en
- "scraper_stock_scraper_download_image": "download_image()" | kind=code-symbol | source=loop-app/scraper/stock_scraper.py:L45 | neighbors=[stock_scraper.py] | lang=en
- "scraper_wipe_db": "wipe_db.py" | kind=code-symbol | source=loop-app/scraper/wipe_db.py:L1 | neighbors=[wipe_events()] | lang=en
- "scraper_wipe_db_wipe_events": "wipe_events()" | kind=code-symbol | source=loop-app/scraper/wipe_db.py:L16 | neighbors=[wipe_db.py] | lang=en
- "screens_curatescreen_curatescreen": "CurateScreen()" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L52 | neighbors=[CurateScreen.tsx] | lang=en
- "screens_curatescreen_default_reminder_opts": "DEFAULT_REMINDER_OPTS" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L28 | neighbors=[CurateScreen.tsx] | lang=en
- "screens_curatescreen_getcategoryicon": "getCategoryIcon()" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L36 | neighbors=[CurateScreen.tsx] | lang=en
- "screens_curatescreen_props": "Props" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L21 | neighbors=[CurateScreen.tsx] | lang=en
- "screens_curatescreen_styles": "styles" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L248 | neighbors=[CurateScreen.tsx] | lang=en

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
