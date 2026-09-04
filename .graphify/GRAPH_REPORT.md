# Graph Report - .  (2026-09-04)

## Corpus Check
- 99 files · ~136,243 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 281 nodes · 432 edges · 18 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 190 · imports_from: 111 · imports: 72 · calls: 17 · re_exports: 10 · rationale_for: 9 · conceptually_related_to: 5 · references: 5 · implements: 4 · method: 4 · semantically_similar_to: 2 · shares_data_with: 2 · inherits: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: cli)
- Included files: 99 · Candidates: 213
- Excluded: 70 untracked · 82301 ignored · 1 sensitive · 17 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `050b4ef`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `EventItem` - 8 edges
2. `ErrorBoundary` - 6 edges
3. `openExternalLink()` - 6 edges
4. `guard()` - 5 edges
5. `auth` - 5 edges
6. `getOptimizedImageUrl()` - 5 edges
7. `run_apify_pipeline()` - 4 edges
8. `CATEGORIES` - 4 edges
9. `TabId` - 4 edges
10. `getGoogleCalendarUrl()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinary)` --conceptually_related_to--> `Instagram → Gemini → Firestore ingestion pipeline`  [INFERRED]
  loop-app/scraper/requirements.txt → README.md
- `ck:frontend-design skill (vendored)` --conceptually_related_to--> `Crimson & Onyx design system`  [INFERRED]
  loop-app/docs/skills/frontend-skill.md → README.md
- `ck:ui-ux-pro-max skill (vendored)` --rationale_for--> `Crimson & Onyx design system`  [INFERRED]
  loop-app/docs/skills/ui-ux-skill.md → README.md
- `Client-side Gemini concierge calls` --semantically_similar_to--> `Gemini flyer→structured-event extraction`  [INFERRED] [semantically similar]
  loop-app/src/utils/geminiAI.ts → loop-app/scraper/gemini_parser.py
- `IIT Delhi club & board Instagram directory` --references--> `TARGET_HANDLES scrape list`  [EXTRACTED]
  loop-app/docs/insta_ids.md → loop-app/scraper/scraper.py

## Hyperedges (group relationships)
- **Flyer-to-Firestore event ingestion flow** — loop_scraper_scraper, loop_scraper_puppeteer_scraper, loop_scraper_gemini_parser, concept_confidence_score, concept_firestore_contract [EXTRACTED 0.90]
- **Gemini touchpoints across both subsystems** — loop_scraper_gemini_parser, utils_geminiai, utils_geminiparser, components_aicampusconcierge [INFERRED 0.80]
- **Vendored design skills → theme tokens → UI** — skills_frontend_design, skills_ui_ux_pro_max, readme_crimson_onyx, theme_colors, theme_typography [INFERRED 0.70]

## Communities

### Community 0 - "App Shell & Student Identity"
Cohesion: 0.07
Nodes (24): INITIAL_NOTIFICATIONS, NotificationItem, Props, styles, HOSTELS, Props, styles, Props (+16 more)

### Community 1 - "Flyer Parsing & Curation Queue"
Cohesion: 0.10
Nodes (25): Client-side Gemini concierge calls, Event confidenceScore triage, Gemini flyer→structured-event extraction, auth, firebaseConfig, ScrapedItem, fieldStyles, styles (+17 more)

### Community 2 - "Firestore Client & Shared UI Primitives"
Cohesion: 0.10
Nodes (19): openWhatsApp(), Props, styles, detailStyles, Props, styles, Props, styles (+11 more)

### Community 3 - "Event Detail, Calendar & Deep Links"
Cohesion: 0.09
Nodes (18): Message, PROMPT_CHIPS, Props, styles, CLUB_AVATARS, getClubAvatar(), ClubItem, CLUBS (+10 more)

### Community 4 - "Crimson & Onyx Theme System"
Cohesion: 0.12
Nodes (20): Props, styles, Crimson & Onyx design system, ck:frontend-design skill (vendored), ck:ui-ux-pro-max skill (vendored), darkColors, lightColors, palette (+12 more)

### Community 5 - "AI Concierge & Club Directory"
Cohesion: 0.12
Nodes (10): Props, styles, Props, styles, CATEGORIES, DEFAULT_REMINDER_OPTS, Props, styles (+2 more)

### Community 6 - "Event Cards & Event Data Model"
Cohesion: 0.18
Nodes (10): Props, styles, Props, STUDENT_TABS, STUDIO_TABS, styles, Tab, TabId (+2 more)

### Community 7 - "Apify Instagram Ingestion Pipeline"
Cohesion: 0.19
Nodes (7): TEXT_MODELS, ALLOWED_CATEGORIES, config, ALLOWED_ORIGINS, Caller, guard(), initAdmin()

### Community 8 - "Navigation Shell (Tabs & Sidebar)"
Cohesion: 0.22
Nodes (9): downloadImage(), fs, HANDLES, https, IMAGES_DIR, OUTPUT_DIR, path, puppeteer (+1 more)

### Community 9 - "Puppeteer Instagram Fallback"
Cohesion: 0.22
Nodes (5): Component, ErrorBoundary, Props, State, styles

### Community 10 - "Pulse Feed"
Cohesion: 0.47
Nodes (5): get_avatar_for_handle(), load_target_handles(), Read handles dynamically from docs/insta_ids.md (F-44), Runs Apify Instagram Scraper and ingests validated events with status: 'pending', run_apify_pipeline()

### Community 11 - "Notifications Modal"
Cohesion: 0.33
Nodes (3): db, Backfill startsAt on events that predate the schema change (Phase 2, F-14). Dry-, serviceAccountPath

### Community 12 - "Database Seeding & Cloudinary Upload"
Cohesion: 0.60
Nodes (4): init(), list_coordinators(), main(), Grant or revoke Club Studio coordinator access.  The Firestore rules and the ser

### Community 13 - "Club Avatar Harvesting"
Cohesion: 0.40
Nodes (4): parse_with_gemini(), Upload a poster and return its secure URL, or None on failure.      Dual-mode: a, Parses poster images and caption using Gemini Vision with structured WhatsApp co, upload_image_to_cloudinary()

### Community 14 - "Cloudinary Purge & Reset"
Cohesion: 0.67
Nodes (3): extract_cloudinary_public_id(), purge_all(), Extracts the public_id from a Cloudinary secure_url.

### Community 15 - "Stock Flyer Scraper"
Cohesion: 0.67
Nodes (3): TARGET_HANDLES scrape list, IIT Delhi club & board Instagram directory, insta_ids duplicate (skills/)

### Community 16 - "Offline Real-Event Generation"
Cohesion: 1.00
Nodes (2): Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinary), Instagram → Gemini → Firestore ingestion pipeline

### Community 23 - "Community 23"
Cohesion: 1.00
Nodes (1): Scheduled autonomous scraper (every 6h)

## Knowledge Gaps
- **92 isolated node(s):** `ALLOWED_ORIGINS`, `Caller`, `TEXT_MODELS`, `config`, `ALLOWED_CATEGORIES` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Offline Real-Event Generation`** (2 nodes): `Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinary)`, `Instagram → Gemini → Firestore ingestion pipeline`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Scheduled autonomous scraper (every 6h)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ErrorBoundary` connect `Puppeteer Instagram Fallback` to `App Shell & Student Identity`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `EventItem` connect `Firestore Client & Shared UI Primitives` to `Event Detail, Calendar & Deep Links`, `App Shell & Student Identity`, `AI Concierge & Club Directory`, `Flyer Parsing & Curation Queue`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `ALLOWED_ORIGINS`, `Caller`, `TEXT_MODELS` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Student Identity` be split into smaller, more focused modules?**
  _Cohesion score 0.07051282051282051 - nodes in this community are weakly interconnected._
- **Should `Flyer Parsing & Curation Queue` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Firestore Client & Shared UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Should `Event Detail, Calendar & Deep Links` be split into smaller, more focused modules?**
  _Cohesion score 0.08602150537634409 - nodes in this community are weakly interconnected._