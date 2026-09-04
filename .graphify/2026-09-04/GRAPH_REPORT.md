# Graph Report - .  (2026-09-03)

## Corpus Check
- label mode - file stats not available

## Summary
- 239 nodes · 382 edges · 15 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 166 · imports_from: 95 · imports: 57 · calls: 18 · re_exports: 10 · implements: 9 · rationale_for: 8 · references: 8 · conceptually_related_to: 5 · semantically_similar_to: 3 · shares_data_with: 3

## God Nodes (most connected - your core abstractions)
1. `EventItem` - 8 edges
2. `openExternalLink()` - 6 edges
3. `db` - 5 edges
4. `CATEGORIES` - 5 edges
5. `run_apify_pipeline()` - 5 edges
6. `TabId` - 4 edges
7. `getGoogleCalendarUrl()` - 4 edges
8. `openGoogleCalendar()` - 4 edges
9. `callGeminiREST()` - 4 edges
10. `openInstagram()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Client-side Gemini concierge calls` --semantically_similar_to--> `Gemini flyer→structured-event extraction`  [INFERRED] [semantically similar]
  loop-app/src/utils/geminiAI.ts → loop-scraper/gemini_parser.py
- `insta_ids duplicate (skills/)` --semantically_similar_to--> `IIT Delhi club & board Instagram directory`  [INFERRED] [semantically similar]
  skills/insta_ids.md → docs/insta_ids.md
- `IIT Delhi club & board Instagram directory` --references--> `TARGET_HANDLES scrape list`  [EXTRACTED]
  docs/insta_ids.md → loop-scraper/scraper.py
- `Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinary)` --conceptually_related_to--> `Instagram → Gemini → Firestore ingestion pipeline`  [INFERRED]
  loop-scraper/requirements.txt → README.md
- `ck:frontend-design skill (vendored)` --conceptually_related_to--> `Crimson & Onyx design system`  [INFERRED]
  skills/frontend-skill.md → README.md

## Hyperedges (group relationships)
- **Flyer-to-Firestore event ingestion flow** — loop_scraper_scraper, loop_scraper_puppeteer_scraper, loop_scraper_gemini_parser, concept_confidence_score, concept_firestore_contract [EXTRACTED 0.90]
- **Gemini touchpoints across both subsystems** — loop_scraper_gemini_parser, utils_geminiai, utils_geminiparser, components_aicampusconcierge [INFERRED 0.80]
- **Vendored design skills → theme tokens → UI** — skills_frontend_design, skills_ui_ux_pro_max, readme_crimson_onyx, theme_colors, theme_typography [INFERRED 0.70]

## Communities

### Community 0 - "App Shell & Student Identity"
Cohesion: 0.10
Nodes (16): HOSTELS, Props, styles, Props, styles, Local-first student identity (AsyncStorage), StudentProfile, useStudentAuth() (+8 more)

### Community 1 - "Flyer Parsing & Curation Queue"
Cohesion: 0.10
Nodes (17): Client-side Gemini concierge calls, Event confidenceScore triage, Gemini flyer→structured-event extraction, CATEGORIES, ScrapedItem, parse_with_gemini(), process(), DEFAULT_REMINDER_OPTS (+9 more)

### Community 2 - "Firestore Client & Shared UI Primitives"
Cohesion: 0.10
Nodes (12): Props, styles, Props, styles, Props, styles, db, firebaseConfig (+4 more)

### Community 3 - "Event Detail, Calendar & Deep Links"
Cohesion: 0.13
Nodes (16): detailStyles, Props, styles, CLUB_AVATARS, getClubAvatar(), ClubItem, CLUBS, CalendarEvent (+8 more)

### Community 4 - "Crimson & Onyx Theme System"
Cohesion: 0.15
Nodes (18): Crimson & Onyx design system, ck:frontend-design skill (vendored), ck:ui-ux-pro-max skill (vendored), darkColors, lightColors, palette, ThemeColors, radii (+10 more)

### Community 5 - "AI Concierge & Club Directory"
Cohesion: 0.14
Nodes (13): Message, PROMPT_CHIPS, Props, styles, DIRECTORY, DirectoryItem, FILTER_TABS, styles (+5 more)

### Community 6 - "Event Cards & Event Data Model"
Cohesion: 0.15
Nodes (9): openWhatsApp(), Props, styles, Props, styles, Props, styles, EventContact (+1 more)

### Community 7 - "Apify Instagram Ingestion Pipeline"
Cohesion: 0.16
Nodes (15): Firestore events collection (system contract), TARGET_HANDLES scrape list, Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinary), IIT Delhi club & board Instagram directory, get_avatar_for_handle(), parse_with_gemini(), Parses poster images and caption using Gemini Vision with structured WhatsApp co, Runs Apify Instagram Scraper and ingests validated events with status: 'pending' (+7 more)

### Community 8 - "Navigation Shell (Tabs & Sidebar)"
Cohesion: 0.18
Nodes (10): Props, styles, Props, STUDENT_TABS, STUDIO_TABS, styles, Tab, TabId (+2 more)

### Community 9 - "Puppeteer Instagram Fallback"
Cohesion: 0.22
Nodes (9): downloadImage(), fs, HANDLES, https, IMAGES_DIR, OUTPUT_DIR, path, puppeteer (+1 more)

### Community 10 - "Pulse Feed"
Cohesion: 0.33
Nodes (3): PULSE, PulseItem, styles

### Community 11 - "Notifications Modal"
Cohesion: 0.33
Nodes (4): INITIAL_NOTIFICATIONS, NotificationItem, Props, styles

### Community 12 - "Database Seeding & Cloudinary Upload"
Cohesion: 0.47
Nodes (5): Uploads a local image file to Cloudinary unsigned preset., Uploads a remote image URL to Cloudinary unsigned preset., seed_database(), upload_local_to_cloudinary(), upload_url_to_cloudinary()

### Community 13 - "Club Avatar Harvesting"
Cohesion: 0.67
Nodes (3): harvest_avatars(), Uploads an avatar to Cloudinary in loop_avatars folder., upload_avatar_to_cloudinary()

### Community 14 - "Cloudinary Purge & Reset"
Cohesion: 0.67
Nodes (3): extract_cloudinary_public_id(), purge_all(), Extracts the public_id from a Cloudinary secure_url.

## Knowledge Gaps
- **79 isolated node(s):** `Message`, `Props`, `PROMPT_CHIPS`, `styles`, `Props` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Instagram → Gemini → Firestore ingestion pipeline` connect `Apify Instagram Ingestion Pipeline` to `Flyer Parsing & Curation Queue`, `Puppeteer Instagram Fallback`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `Firestore events collection (system contract)` connect `Apify Instagram Ingestion Pipeline` to `Firestore Client & Shared UI Primitives`, `App Shell & Student Identity`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Two-subsystem monorepo (app + scraper)` connect `Apify Instagram Ingestion Pipeline` to `App Shell & Student Identity`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `Message`, `Props`, `PROMPT_CHIPS` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Student Identity` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._
- **Should `Flyer Parsing & Curation Queue` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Should `Firestore Client & Shared UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._