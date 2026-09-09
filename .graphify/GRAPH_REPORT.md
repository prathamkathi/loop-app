# Graph Report - .  (2026-09-09)

## Corpus Check
- 114 files · ~152,813 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 681 nodes · 1137 edges · 68 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 267 · imports_from: 162 · imports: 129 · MODIFIES: 119 · ON_BRANCH: 103 · PARENT_OF: 102 · references: 53 · lists: 45 · calls: 24 · documented_affiliation: 24 · documents: 14 · method: 13 · rationale_for: 12 · re_exports: 10 · proposes: 8 · runs: 8 · described_as_using: 7 · declares: 6 · includes: 4 · planned_dependency: 4 · documented_dependency: 2 · specifies: 2 · audits: 1 · conceptually_related_to: 1 · defines: 1 · deploys: 1 · described_as_approving: 1 · described_as_having: 1 · described_as_reading_approved: 1 · described_as_writing_pending: 1 · documented_canonical_source: 1 · has_independent_trigger: 1 · hosts_root: 1 · inherits: 1 · installs: 1 · loads_google_fonts: 1 · recommends: 1 · requires_cross_check_with: 1 · revises: 1 · supports: 1 · uses: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 114 · Candidates: 185
- Excluded: 59 untracked · 87712 ignored · 1 sensitive · 3 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `8c94699`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Documented campus Instagram handle registry` - 46 edges
2. `Execution roadmap revised 5 September 2026` - 16 edges
3. `BRCA` - 13 edges
4. `TestCompletenessGate` - 10 edges
5. `EventItem` - 10 edges
6. `openExternalLink()` - 9 edges
7. `docs/roadmap_inspiration_backlog.md` - 9 edges
8. `Firebase Admin SDK` - 9 edges
9. `CAIC` - 7 edges
10. `Apify → Gemini → Cloudinary → Firestore ingestion` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Unpinned scraper Python dependencies` --declares--> `Apify Instagram ingestion`  [EXTRACTED]
  scraper/requirements.txt → docs/remediation_brief.md
- `Daily scraper workflow at 02:00 UTC` --installs--> `Unpinned scraper Python dependencies`  [EXTRACTED]
  .github/workflows/scraper.yml → scraper/requirements.txt
- `Daily scraper workflow at 02:00 UTC` --runs--> `Apify → Gemini → Cloudinary → Firestore ingestion`  [EXTRACTED]
  .github/workflows/scraper.yml → docs/remediation_brief.md
- `Documents disagree on prior provider-key exposure` --requires_cross_check_with--> `Execution roadmap revised 5 September 2026`  [INFERRED]
  docs/deferred_items.md → docs/master_todo_roadmap_report.md
- `Vendored frontend design guidance` --recommends--> `Outfit display and Geist body typography`  [EXTRACTED]
  docs/skills/frontend-skill.md → web/index.html

## Hyperedges (group relationships)
- **Documented ingestion and moderation lifecycle** — scraper_ingestion, firestore_events, moderation_queue, approved_feed [EXTRACTED 1.00]

## Communities

### Community 2 - "Application State and Profiles"
Cohesion: 0.06
Nodes (25): Props, State, ErrorBoundary, Component, styles, Props, styles, Props (+17 more)

### Community 8 - "Coordinator Submission and Sessions"
Cohesion: 0.14
Nodes (18): PRODUCTION_ORIGINS, DEV_ORIGINS, initAdmin(), Caller, guard(), checkRateLimit(), TEXT_MODELS, config (+10 more)

### Community 9 - "Adaptive App Navigation"
Cohesion: 0.14
Nodes (12): PRODUCTION_ORIGINS, DEV_ORIGINS, 30e9ff6 refactor(events): unify event contract with CanonicalCategory union and fold ScrapedItem (X2, X5, U6, U7, T3.4, T3.5), 32be075 feat(telemetry): adapt ErrorBoundary to theme and add crash telemetry endpoint (U18, Pilot Gate), 420d8e3 fix(scraper): configure daily schedule and on-demand dispatch (T2.8), 4781760 feat(scraper): add isEvent and postKind to poster extraction schema (A1), 9a04d55 fix(scraper): add host and title composite dedup index (X4, T2.5), be1ec4e feat(auth): implement admin and coordinator role security rules (B4, T3.2) (+4 more)

### Community 5 - "Shared Design System"
Cohesion: 0.05
Nodes (26): fs, path, rootDir, distDir, indexHtmlPath, assetsDir, distAssetsDir, manifest (+18 more)

### Community 26 - "Campus Poster Archive"
Cohesion: 0.40
Nodes (5): usable(), evaluate_completeness(), completeness_gate.py Canonical event completeness evaluation gate for the LOOP I, Returns True if a string is non-empty and not a known placeholder string., Evaluates whether an extracted event has all mandatory attributes to auto-publis

### Community 41 - "Application Icon Image"
Cohesion: 0.67
Nodes (1): Canonical date and time parsing for LOOP scraper.

### Community 0 - "Event Discovery and Moderation"
Cohesion: 0.06
Nodes (55): Props, styles, Props, detailStyles, styles, Props, styles, CLUB_AVATARS (+47 more)

### Community 23 - "Campus Poster Archive"
Cohesion: 0.32
Nodes (2): Requests HTTP client, Python dotenv

### Community 18 - "Hosting Deployment Workflow"
Cohesion: 0.22
Nodes (9): puppeteer, fs, path, https, HANDLES, OUTPUT_DIR, IMAGES_DIR, downloadImage() (+1 more)

### Community 22 - "Crash Report Endpoint"
Cohesion: 0.36
Nodes (7): load_target_handles(), get_avatar_for_handle(), run_apify_pipeline(), Read handles dynamically from docs/insta_ids.md (F-44), Runs Apify Instagram Scraper and ingests validated events with deterministic com, a180266 feat(scraper): add force-pending and timeframe-days cli flags, eb65162 fix(maintenance): chunk batch operations in db maintenance and standardize scraper model list

### Community 19 - "Event Completeness Gate"
Cohesion: 0.22
Nodes (4): Backfill startsAt on events that predate the schema change (Phase 2, F-14). Dry-, serviceAccountPath, db, Firebase Admin SDK

### Community 29 - "Campus Celebration Photos"
Cohesion: 0.60
Nodes (4): init(), list_users(), main(), Grant or revoke Club Studio coordinator and admin access.  The Firestore rules a

### Community 24 - "Campus Poster Archive"
Cohesion: 0.29
Nodes (6): get_image_aspect_ratio(), upload_image_to_cloudinary(), parse_with_gemini(), Calculate the aspect ratio (width / height) of an image file using Pillow., Upload a poster using signed API credentials and return its secure URL., Parses poster images and caption using Gemini Vision with structured WhatsApp co

### Community 15 - "Scraper Completeness Tests"
Cohesion: 0.17
Nodes (2): TestCompletenessGate, test_completeness_gate.py Unit tests for the scraper completeness evaluation gat

### Community 14 - "Web Export Packaging"
Cohesion: 0.17
Nodes (10): path, fs, searchPaths, serviceAccountPath, admin, serviceAccount, db, args (+2 more)

### Community 17 - "Browser Scraper Fallback"
Cohesion: 0.18
Nodes (7): fs, path, assert, ts, { parseDateAndTimeString }, { normalizeCategory, getCategoryMeta }, { CANONICAL_CATEGORIES }

### Community 20 - "Continuous Integration Checks"
Cohesion: 0.22
Nodes (7): admin, path, fs, serviceAccountPath, serviceAccount, db, PULSE_ITEMS

### Community 4 - "Database Administration Tools"
Cohesion: 0.07
Nodes (30): Message, Props, PROMPT_CHIPS, styles, firebaseConfig, auth, ClubItem, DirectoryItem (+22 more)

### Community 3 - "Scraper Ingestion Pipeline"
Cohesion: 0.07
Nodes (29): Props, styles, Props, styles, Props, styles, TabId, Tab (+21 more)

### Community 7 - "Campus Directory and Concierge"
Cohesion: 0.15
Nodes (26): 050b4ef chore(ci): set PYTHONUNBUFFERED=1 to stream scraper logs in real time, 0aa1fd9 feat: category-adaptive card UI, poster lightbox, queue undo/editing, and dynamic notifications, 15147ff fix(ui): cross-platform avatar fallback, category normalization, and verified Cloudinary flyers, 1e660f2 feat(events): Luma-style past events architecture, wipe & rescrape with clean upcoming/past sets, 1ff9bba feat: complete active sprint — F-35 unique tab IDs, F-29 touch decoupling, DB cleanup runner, AI fallback alignment, and cache headers, 2adac01 feat: add quick horizon filters, pulse live seeding with fallback, and UTC calendar sync, 4030aba fix(scraper): remove unused google-generativeai from requirements to resolve pip backtracking, 6009896 chore: add startsAt backfill to cleanup script (+18 more)

### Community 16 - "Client Utility Tests"
Cohesion: 0.18
Nodes (11): 0d4f418 Repair scraper.py, broken since the shared.py consolidation, 28dc4b3 feat(repo): consolidate api, scraper, and docs cleanly into loop-app, 57f8988 build: provide root package.json for Vercel serverless function runtime, 6ac2398 Use signed Cloudinary uploads in the scraper and skip posterless events, 7dd77e5 Ignore Vercel CLI link artifacts, a0ab880 fix(security): protect /loop-app/* from static serving and enable dual-mode scraper upload, a5253d6 Stop publishing API source as static files on Vercel, b7c8ee0 fix(security): return 404 on /loop-app/* routes in vercel.json (+3 more)

### Community 12 - "Future Campus Features"
Cohesion: 0.17
Nodes (12): 17e366f fix(linking): correct WhatsApp 91 phone prefixing (U8), 566cb48 fix(ui): eliminate fake pull-to-refresh timeouts (D1), 5ecb4f2 fix(feed): add orderBy startsAt with resilient unordered fallback (B3), 61cce67 fix(notifications): remove fabricated campus notice injections (F4), 987683a ci: add python compileall and AST unresolved symbol checks (CI-GATE), aaf4dea fix(curate): remove dead notification reminder controls (D2), bdc1350 docs(directory): flag unverified phone numbers and duplicates (F7), c880e3b fix(submit): render dash for unparseable date preview (F6) (+4 more)

### Community 13 - "Calendar and Date Parsing"
Cohesion: 0.17
Nodes (12): 20bc038 chore(cleanliness): untrack graphify cache, delete scraper pid and api symlink, 371bc99 fix(feed): fix weekend horizon, accurate featured label, and web focus ring (U5, U11, U12), 44c36a3 fix(ui): hoist PlatformBlur and apply mobile web safe area insets (U1, U2), 4ba7cd1 refactor(theme): align stray colors with design system tokens, 516e8c9 fix(web): align splash background with theme tokens and fix favicon links (U13, U14), 7647cf9 feat(a11y): add accessibility roles and labels to interactive controls, 783ae20 fix(scripts): collapse destructive wipe scripts into safe db_maintenance with mandatory --confirm, 9c387e2 fix(cleanliness): remove tracked macOS Icon resource fork files (+4 more)

### Community 28 - "Dance Production Poster"
Cohesion: 0.40
Nodes (5): 22d7598 fix(deps): declare react-native-svg in package.json (PHANTOM-DEP), 248283a fix(ui): unify Outfit & Geist typography, enable bottom drawer glassmorphism, and smoothen drawer animations, 2c2887a fix(scraper): define get_image_aspect_ratio and prevent temp file leak (B1), 8e14729 fix(gemini): update model list to include gemini-3.5-flash-lite and gemini-3.1-flash-lite to prevent 429 quota exhaustion, adde689 fix(ui): replace no-op Alert.alert with cross-platform showAlert (B2)

### Community 21 - "Hostel Sports Pools"
Cohesion: 0.25
Nodes (8): 4a08e39 Increase Vercel payload size limit, 78043bd Move API to root for zero-config Vercel deployment, 875cab6 Fix firestore rules for pulse, 987cc35 Fix Cloudinary upload by using unsigned preset, d083a1c Initial commit: Loop App with Vercel API backend, d36e2dd Include loop-app, d9ac38c Update Vercel URL to production domain, f17e05e Add vercel.json for root deployment routing

### Community 57 - "User Experience Guidance"
Cohesion: 1.00
Nodes (1): .github/workflows/ci.yml

### Community 27 - "Music Performance Poster"
Cohesion: 0.40
Nodes (5): GitHub Actions CI, App and API TypeScript checks, Client unit test command, Python compilation, completeness tests, AST unresolved calls and Ruff, Client provider-secret and tracked-credential scans

### Community 58 - "Python Dependency Manifest"
Cohesion: 1.00
Nodes (1): .github/workflows/firebase-hosting-merge.yml

### Community 25 - "Campus Poster Archive"
Cohesion: 0.33
Nodes (6): Firebase Hosting deployment on main pushes, Expo web bundle build, Built bundle API-key scan, Best-effort Firestore rules and index deployment, Firebase Hosting live channel, Hosting workflow independent of CI checks

### Community 59 - "Web Shell Template"
Cohesion: 1.00
Nodes (1): .github/workflows/scraper.yml

### Community 10 - "Interests and Campus Pulse"
Cohesion: 0.18
Nodes (13): Daily scraper workflow at 02:00 UTC, Manual scraper dry-run and maximum-events inputs, Python 3.11 workflow runtime, Firestore events contract, Apify → Gemini → Cloudinary → Firestore ingestion, Coordinator moderation queue, Approved event feed, Gemini AI (+5 more)

### Community 11 - "Protected AI Services"
Cohesion: 0.19
Nodes (13): docs/campus_hub_audit_reference.md, Reference app localStorage persistence limitations, Planned social-product moderation and data governance, docs/roadmap_inspiration_backlog.md, Garam Khoon reference app (external inspiration), Proposed gate priority passes, Proposed volunteer gate scanner, Proposed live venue headcount (+5 more)

### Community 60 - "Firebase Authentication Service"
Cohesion: 1.00
Nodes (1): docs/deferred_items.md

### Community 6 - "Delivery Roadmap and Constraints"
Cohesion: 0.07
Nodes (31): Deferred account work: enable email/password and anonymous authentication, Deferred account work: provision coordinator custom claims, Deferred account work: deploy Firestore rules, Deferred account work: configure server provider environment, Documents disagree on prior provider-key exposure, Execution roadmap revised 5 September 2026, Vercel serverless API, Roadmap claim: scraper writes pending by default (+23 more)

### Community 61 - "Offline Event Generator"
Cohesion: 1.00
Nodes (1): docs/insta_ids.md

### Community 1 - "Campus Organizations Registry"
Cohesion: 0.05
Nodes (52): Documented campus Instagram handle registry, Board for Hostel Management (BHM), Board for Recreational and Creative Activities (BRCA), Board for Sports Activities (BSA), Board for Student Publications (BSP), Board for Student Welfare (BSW), Ankahi - Dramatics Society, BRCA (+44 more)

### Community 62 - "Community 62"
Cohesion: 1.00
Nodes (1): docs/master_todo_roadmap_report.md

### Community 67 - "Community 67"
Cohesion: 1.00
Nodes (1): Firebase Authentication

### Community 63 - "Community 63"
Cohesion: 1.00
Nodes (1): docs/skills/frontend-skill.md

### Community 64 - "Community 64"
Cohesion: 1.00
Nodes (1): docs/skills/ui-ux-skill.md

### Community 65 - "Community 65"
Cohesion: 1.00
Nodes (1): scraper/requirements.txt

### Community 66 - "Community 66"
Cohesion: 1.00
Nodes (1): web/index.html

### Community 44 - "Street Theatre Poster"
Cohesion: 1.00
Nodes (2): Android icon background, Pale blue geometric icon construction guides

### Community 45 - "Seagull Theatre Poster"
Cohesion: 1.00
Nodes (2): Android icon foreground, Burgundy white infinity and gold dot branding

### Community 46 - "Formula Racing Promotion"
Cohesion: 1.00
Nodes (2): Android monochrome icon, Gray angular chevron mark

### Community 47 - "Formula Racing Team"
Cohesion: 1.00
Nodes (2): PNG favicon, Burgundy white infinity and gold dot branding

### Community 48 - "Racing Electronics Captain"
Cohesion: 1.00
Nodes (2): SVG favicon, Burgundy white infinity and gold dot vector branding

### Community 49 - "Scraper Command Interface"
Cohesion: 1.00
Nodes (2): PNG application icon, Burgundy white infinity and gold dot branding

### Community 50 - "CI Workflow Source"
Cohesion: 1.00
Nodes (2): SVG application icon, Burgundy white infinity and gold dot vector branding

### Community 51 - "Hosting Workflow Source"
Cohesion: 1.00
Nodes (2): Splash icon, Burgundy white infinity and gold dot branding

### Community 52 - "Scraper Workflow Source"
Cohesion: 1.00
Nodes (2): Ankahi and Kshitij street play poster, Street theatre collaboration poster

### Community 53 - "Deferred Work Notes"
Cohesion: 1.00
Nodes (2): Ankahi The Seagull poster, The Seagull theatre performance poster

### Community 54 - "Instagram Registry Notes"
Cohesion: 1.00
Nodes (2): AXLR8R racing promotional image, Formula racing promotional imagery

### Community 55 - "Execution Roadmap Document"
Cohesion: 1.00
Nodes (2): AXLR8R meet the team image, Formula Bharat 2026 team introduction

### Community 56 - "Frontend Design Guidance"
Cohesion: 1.00
Nodes (2): AXLR8R electronics captain introduction, 2025-26 electronics leadership profile

### Community 31 - "Badminton Pool Poster"
Cohesion: 0.50
Nodes (4): AXLR8R silver sponsor acknowledgement, Bender silver sponsorship, Bender, AXLR8R Formula Racing

### Community 32 - "Womens Sports Championship"
Cohesion: 0.50
Nodes (4): Kailash Night Mess tender notice, Campus service tender, Kailash Night Mess, Student Affairs Council IIT Delhi

### Community 33 - "Python Date Parser"
Cohesion: 0.50
Nodes (4): Independence Day Parbhat Pheri invitation, Campus procession, Nalanda Ground, Biotech Lawn

### Community 34 - "Campus Award Photos"
Cohesion: 0.50
Nodes (4): BHM web developer recruitment poster, Hostel web app recruitment, Board for Hostel Management, React and Express JS recruitment criteria

### Community 35 - "Sports Board Advisors"
Cohesion: 0.50
Nodes (4): Overdrive band performances poster, Music performance, IITD Music Club, Seminar Hall

### Community 36 - "Android Icon Background"
Cohesion: 0.50
Nodes (4): Institute Dance Production 2026 poster, Dance performance, Institute Dance Production 2026, LH121

### Community 37 - "Android Icon Foreground"
Cohesion: 0.50
Nodes (4): All Boards Night celebration collage, Campus cultural celebration, Student Affairs Council IIT Delhi, All Boards Night

### Community 42 - "Application Icon Vector"
Cohesion: 0.67
Nodes (3): Award presentation photo collage, Campus awards imagery, Trophy presentations

### Community 43 - "Launch Splash Image"
Cohesion: 0.67
Nodes (3): BSA 2026–27 advisors poster, Sports board team announcement, BSA Team 2026–27 Advisors

### Community 38 - "Android Monochrome Icon"
Cohesion: 0.50
Nodes (4): Men's freshers general championship poster, Inter-hostel sports championship, Board for Sports Activities, Men's freshers general championship 2026

### Community 39 - "Browser Favicon Image"
Cohesion: 0.50
Nodes (4): Badminton hostel pools poster, Tournament pool allocation, Board for Sports Activities, Badminton pool allocation

### Community 40 - "Browser Favicon Vector"
Cohesion: 0.50
Nodes (4): Women's freshers general championship poster, Inter-hostel sports championship, Board for Sports Activities, Women's freshers general championship 2026

### Community 30 - "Mens Sports Championship"
Cohesion: 0.40
Nodes (5): Women's volleyball and basketball hostel pools poster, Tournament pool allocation, Board for Sports Activities, Volleyball pool allocation, Basketball pool allocation

## Knowledge Gaps
- **270 isolated node(s):** `PRODUCTION_ORIGINS`, `DEV_ORIGINS`, `Caller`, `TEXT_MODELS`, `config` (+265 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Application Icon Image`** (1 nodes): `Canonical date and time parsing for LOOP scraper.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Campus Poster Archive`** (2 nodes): `Requests HTTP client`, `Python dotenv`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scraper Completeness Tests`** (2 nodes): `TestCompletenessGate`, `test_completeness_gate.py Unit tests for the scraper completeness evaluation gat`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Experience Guidance`** (1 nodes): `.github/workflows/ci.yml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Python Dependency Manifest`** (1 nodes): `.github/workflows/firebase-hosting-merge.yml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Web Shell Template`** (1 nodes): `.github/workflows/scraper.yml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Firebase Authentication Service`** (1 nodes): `docs/deferred_items.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Offline Event Generator`** (1 nodes): `docs/insta_ids.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `docs/master_todo_roadmap_report.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `Firebase Authentication`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `docs/skills/frontend-skill.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `docs/skills/ui-ux-skill.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `scraper/requirements.txt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `web/index.html`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Street Theatre Poster`** (2 nodes): `Android icon background`, `Pale blue geometric icon construction guides`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Seagull Theatre Poster`** (2 nodes): `Android icon foreground`, `Burgundy white infinity and gold dot branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Formula Racing Promotion`** (2 nodes): `Android monochrome icon`, `Gray angular chevron mark`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Formula Racing Team`** (2 nodes): `PNG favicon`, `Burgundy white infinity and gold dot branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Racing Electronics Captain`** (2 nodes): `SVG favicon`, `Burgundy white infinity and gold dot vector branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scraper Command Interface`** (2 nodes): `PNG application icon`, `Burgundy white infinity and gold dot branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CI Workflow Source`** (2 nodes): `SVG application icon`, `Burgundy white infinity and gold dot vector branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hosting Workflow Source`** (2 nodes): `Splash icon`, `Burgundy white infinity and gold dot branding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scraper Workflow Source`** (2 nodes): `Ankahi and Kshitij street play poster`, `Street theatre collaboration poster`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Deferred Work Notes`** (2 nodes): `Ankahi The Seagull poster`, `The Seagull theatre performance poster`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Instagram Registry Notes`** (2 nodes): `AXLR8R racing promotional image`, `Formula racing promotional imagery`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Execution Roadmap Document`** (2 nodes): `AXLR8R meet the team image`, `Formula Bharat 2026 team introduction`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Design Guidance`** (2 nodes): `AXLR8R electronics captain introduction`, `2025-26 electronics leadership profile`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Apify → Gemini → Cloudinary → Firestore ingestion` connect `Interests and Campus Pulse` to `Delivery Roadmap and Constraints`, `Campus Organizations Registry`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `Cloudinary image storage` connect `Interests and Campus Pulse` to `Coordinator Submission and Sessions`, `Campus Poster Archive`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `Documented campus Instagram handle registry` connect `Campus Organizations Registry` to `Interests and Campus Pulse`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `PRODUCTION_ORIGINS`, `DEV_ORIGINS`, `Caller` to the rest of the system?**
  _270 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application State and Profiles` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._
- **Should `Coordinator Submission and Sessions` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._
- **Should `Adaptive App Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._