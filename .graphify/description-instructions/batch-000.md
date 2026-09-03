# Node Description Batch 1 of 6

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

- "loop_app_app": "App.tsx" | kind=code-symbol | source=loop-app/App.tsx:L1 | neighbors=[AICampusConcierge.tsx, EventDetailModal.tsx, NotificationModal.tsx, StudentAuthModal.tsx, TopBar.tsx, Firestore events collection (system con…]
- "theme_index": "index.ts" | kind=code-symbol | source=loop-app/src/theme/index.ts:L1 | neighbors=[AICampusConcierge.tsx, EmptyState.tsx, EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx, FloatingField.tsx]
- "components_eventdetailmodal": "EventDetailModal.tsx" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L1 | neighbors=[EventCard.tsx, openWhatsApp(), DetailRow(), detailStyles, EventDetailModal(), Props]
- "screens_homescreen": "HomeScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/HomeScreen.tsx:L1 | neighbors=[App.tsx, EmptyState.tsx, EventCard.tsx, FeaturedCard.tsx, SectionLabel.tsx, firebase.ts]
- "components_aicampusconcierge": "AICampusConcierge.tsx" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L1 | neighbors=[AICampusConcierge(), Message, PROMPT_CHIPS, Props, styles, Client-side Gemini concierge calls]
- "screens_directoryscreen": "DirectoryScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/DirectoryScreen.tsx:L1 | neighbors=[App.tsx, SectionLabel.tsx, clubs.ts, CLUBS, directory.ts, DIRECTORY]
- "screens_queuescreen": "QueueScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/QueueScreen.tsx:L1 | neighbors=[Event confidenceScore triage, App.tsx, SectionLabel.tsx, firebase.ts, db, queue.ts]
- "screens_submitscreen": "SubmitScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/SubmitScreen.tsx:L1 | neighbors=[App.tsx, FloatingField.tsx, SectionLabel.tsx, firebase.ts, db, Props]
- "utils_geminiai": "geminiAI.ts" | kind=code-symbol | source=loop-app/src/utils/geminiAI.ts:L1 | neighbors=[AICampusConcierge.tsx, EventDetailModal.tsx, Client-side Gemini concierge calls, SubmitScreen.tsx, directory.ts, DirectoryItem]
- "components_eventcard": "EventCard.tsx" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L1 | neighbors=[EventCard(), openWhatsApp(), Props, PulseDot(), styles, SaveButton.tsx]
- "components_featuredcard": "FeaturedCard.tsx" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L1 | neighbors=[EventCard.tsx, openWhatsApp(), FeaturedCard(), Props, styles, SaveButton.tsx]
- "navigation_bottomtabbar": "BottomTabBar.tsx" | kind=code-symbol | source=loop-app/src/navigation/BottomTabBar.tsx:L1 | neighbors=[App.tsx, AppNavigator.tsx, BottomTabBar(), Props, STUDENT_TABS, STUDIO_TABS]
- "screens_curatescreen": "CurateScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/CurateScreen.tsx:L1 | neighbors=[Event confidenceScore triage, App.tsx, SectionLabel.tsx, categories.ts, CATEGORIES, CurateScreen()]
- "components_sectionlabel": "SectionLabel.tsx" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L1 | neighbors=[Props, SectionLabel(), styles, index.ts, CurateScreen.tsx, DirectoryScreen.tsx]
- "loop_scraper_puppeteer_scraper": "puppeteer_scraper.js" | kind=code-symbol | source=loop-scraper/puppeteer_scraper.js:L1 | neighbors=[downloadImage(), fs, HANDLES, https, IMAGES_DIR, OUTPUT_DIR]
- "loop_scraper_scraper": "scraper.py" | kind=code-symbol | source=loop-scraper/scraper.py:L1 | neighbors=[TARGET_HANDLES scrape list, Scraper dependency stack (apify, fireba…, Firestore events collection (system con…, get_avatar_for_handle(), parse_with_gemini(), run_apify_pipeline()]
- "navigation_appnavigator": "AppNavigator.tsx" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L1 | neighbors=[App.tsx, AppNavigator(), Props, styles, BottomTabBar.tsx, STUDENT_TABS]
- "screens_pulsescreen": "PulseScreen.tsx" | kind=code-symbol | source=loop-app/src/screens/PulseScreen.tsx:L1 | neighbors=[App.tsx, SectionLabel.tsx, pulse.ts, PULSE, AnimatedWrapper(), PulseScreen()]
- "theme_themecontext": "ThemeContext.tsx" | kind=code-symbol | source=loop-app/src/theme/ThemeContext.tsx:L1 | neighbors=[index.ts, colors.ts, darkColors, lightColors, ThemeColors, ThemeContext]
- "utils_calendar": "calendar.ts" | kind=code-symbol | source=loop-app/src/utils/calendar.ts:L1 | neighbors=[EventDetailModal.tsx, FeaturedCard.tsx, CalendarEvent, getGoogleCalendarUrl(), MONTH_NAMES, openGoogleCalendar()]
- "utils_geminiparser": "geminiParser.ts" | kind=code-symbol | source=loop-app/src/utils/geminiParser.ts:L1 | neighbors=[Gemini flyer→structured-event extraction, QueueScreen.tsx, SubmitScreen.tsx, categories.ts, CATEGORIES, ALLOWED_CATEGORIES]
- "utils_storage": "storage.ts" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L1 | neighbors=[Local-first student identity (AsyncStor…, App.tsx, hasSetInterests(), KEYS, loadInterests(), loadReminder()]
- "components_studentauthmodal": "StudentAuthModal.tsx" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L1 | neighbors=[HOSTELS, Props, StudentAuthModal(), styles, Local-first student identity (AsyncStor…, index.ts]
- "data_events": "events.ts" | kind=code-symbol | source=loop-app/src/data/events.ts:L1 | neighbors=[AICampusConcierge.tsx, EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx, EventContact, EventItem]
- "navigation_sidebar": "Sidebar.tsx" | kind=code-symbol | source=loop-app/src/navigation/Sidebar.tsx:L1 | neighbors=[AppNavigator.tsx, BottomTabBar.tsx, STUDENT_TABS, STUDIO_TABS, TabId, Props]
- "utils_auth": "auth.ts" | kind=code-symbol | source=loop-app/src/utils/auth.ts:L1 | neighbors=[StudentAuthModal.tsx, TopBar.tsx, Local-first student identity (AsyncStor…, App.tsx, clearStudentProfile(), getStoredStudentProfile()]
- "data_events_eventitem": "EventItem" | kind=code-symbol | source=loop-app/src/data/events.ts:L7 | neighbors=[AICampusConcierge.tsx, EventCard.tsx, EventDetailModal.tsx, FeaturedCard.tsx, events.ts, App.tsx]
- "components_notificationmodal": "NotificationModal.tsx" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L1 | neighbors=[INITIAL_NOTIFICATIONS, NotificationItem, NotificationModal(), Props, styles, index.ts]
- "components_topbar": "TopBar.tsx" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L1 | neighbors=[Props, styles, TopBar(), index.ts, auth.ts, StudentProfile]
- "config_firebase": "firebase.ts" | kind=code-symbol | source=loop-app/src/config/firebase.ts:L1 | neighbors=[Firestore events collection (system con…, db, firebaseConfig, App.tsx, HomeScreen.tsx, QueueScreen.tsx]
- "theme_colors": "colors.ts" | kind=code-symbol | source=loop-app/src/theme/colors.ts:L1 | neighbors=[Crimson & Onyx design system, darkColors, lightColors, palette, ThemeColors, index.ts]
- "utils_linking": "linking.ts" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L1 | neighbors=[EventDetailModal.tsx, DirectoryScreen.tsx, PulseScreen.tsx, calendar.ts, openExternalLink(), openInstagram()]
- "components_savebutton": "SaveButton.tsx" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L1 | neighbors=[EventCard.tsx, FeaturedCard.tsx, Props, SaveButton(), styles, index.ts]
- "data_clubs": "clubs.ts" | kind=code-symbol | source=loop-app/src/data/clubs.ts:L1 | neighbors=[EventDetailModal.tsx, avatars.ts, getClubAvatar(), ClubItem, CLUBS, DirectoryScreen.tsx]
- "utils_linking_openexternallink": "openExternalLink()" | kind=code-symbol | source=loop-app/src/utils/linking.ts:L6 | neighbors=[DirectoryScreen.tsx, PulseScreen.tsx, calendar.ts, linking.ts, openInstagram(), openMaps()]
- "components_emptystate": "EmptyState.tsx" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L1 | neighbors=[EmptyState(), Props, styles, index.ts, HomeScreen.tsx]
- "components_floatingfield": "FloatingField.tsx" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L1 | neighbors=[FloatingField(), Props, styles, index.ts, SubmitScreen.tsx]
- "config_firebase_db": "db" | kind=code-symbol | source=loop-app/src/config/firebase.ts:L16 | neighbors=[firebase.ts, App.tsx, HomeScreen.tsx, QueueScreen.tsx, SubmitScreen.tsx]
- "data_categories": "categories.ts" | kind=code-symbol | source=loop-app/src/data/categories.ts:L1 | neighbors=[CATEGORIES, App.tsx, CurateScreen.tsx, HomeScreen.tsx, geminiParser.ts]
- "data_categories_categories": "CATEGORIES" | kind=code-symbol | source=loop-app/src/data/categories.ts:L1 | neighbors=[categories.ts, App.tsx, CurateScreen.tsx, HomeScreen.tsx, geminiParser.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-000.json

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
