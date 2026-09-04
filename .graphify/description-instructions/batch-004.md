# Node Description Batch 5 of 8

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

- "components_eventdetailmodal_eventdetailmodal": "EventDetailModal()" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L34 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L27 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L365 | neighbors=[EventDetailModal.tsx]
- "components_featuredcard_featuredcard": "FeaturedCard()" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L20 | neighbors=[FeaturedCard.tsx]
- "components_featuredcard_props": "Props" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L13 | neighbors=[FeaturedCard.tsx]
- "components_featuredcard_styles": "styles" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L148 | neighbors=[FeaturedCard.tsx]
- "components_floatingfield_floatingfield": "FloatingField()" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L12 | neighbors=[FloatingField.tsx]
- "components_floatingfield_props": "Props" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L5 | neighbors=[FloatingField.tsx]
- "components_floatingfield_styles": "styles" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L89 | neighbors=[FloatingField.tsx]
- "components_notificationmodal_notificationitem": "NotificationItem" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L7 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_notificationmodal": "NotificationModal()" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L58 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L50 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L179 | neighbors=[NotificationModal.tsx]
- "components_savebutton_props": "Props" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L6 | neighbors=[SaveButton.tsx]
- "components_savebutton_savebutton": "SaveButton()" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L12 | neighbors=[SaveButton.tsx]
- "components_savebutton_styles": "styles" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L43 | neighbors=[SaveButton.tsx]
- "components_sectionlabel_props": "Props" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L5 | neighbors=[SectionLabel.tsx]
- "components_sectionlabel_sectionlabel": "SectionLabel()" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L7 | neighbors=[SectionLabel.tsx]
- "components_sectionlabel_styles": "styles" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L22 | neighbors=[SectionLabel.tsx]
- "components_studentauthmodal_hostels": "HOSTELS" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L28 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L18 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_studentauthmodal": "StudentAuthModal()" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L34 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L270 | neighbors=[StudentAuthModal.tsx]
- "components_topbar_props": "Props" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L7 | neighbors=[TopBar.tsx]
- "components_topbar_styles": "styles" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L192 | neighbors=[TopBar.tsx]
- "components_topbar_topbar": "TopBar()" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L19 | neighbors=[TopBar.tsx]
- "concept_target_handles": "TARGET_HANDLES scrape list" | kind=entity | source=loop-app/scraper/scraper.py:L24 | neighbors=[IIT Delhi club & board Instagram direct…]
- "config_firebase_firebaseconfig": "firebaseConfig" | kind=code-symbol | source=loop-app/src/config/firebase.ts:L11 | neighbors=[firebase.ts]
- "data_avatars_club_avatars": "CLUB_AVATARS" | kind=code-symbol | source=loop-app/src/data/avatars.ts:L1 | neighbors=[avatars.ts]
- "data_clubs_clubitem": "ClubItem" | kind=code-symbol | source=loop-app/src/data/clubs.ts:L3 | neighbors=[clubs.ts]
- "data_events_eventcontact": "EventContact" | kind=code-symbol | source=loop-app/src/data/events.ts:L1 | neighbors=[events.ts]
- "data_pulse_pulse": "PULSE" | kind=code-symbol | source=loop-app/src/data/pulse.ts:L14 | neighbors=[pulse.ts]
- "deps_scraper_stack": "Scraper dependency stack (apify, firebase-admin, google-generativeai, cloudinar…" | kind=entity | source=loop-app/scraper/requirements.txt | neighbors=[Instagram → Gemini → Firestore ingestio…]
- "lib_guard_allowed_origins": "ALLOWED_ORIGINS" | kind=code-symbol | source=api/_lib/guard.ts:L16 | neighbors=[guard.ts]
- "lib_guard_caller": "Caller" | kind=code-symbol | source=api/_lib/guard.ts:L33 | neighbors=[guard.ts]
- "loop_app_app_app": "App()" | kind=code-symbol | source=loop-app/App.tsx:L290 | neighbors=[App.tsx]
- "loop_app_app_appcontent": "AppContent()" | kind=code-symbol | source=loop-app/App.tsx:L36 | neighbors=[App.tsx]
- "loop_app_index": "index.ts" | kind=code-symbol | source=loop-app/index.ts:L1 | neighbors=[App.tsx]
- "navigation_appnavigator_appnavigator": "AppNavigator()" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L16 | neighbors=[AppNavigator.tsx]
- "navigation_appnavigator_props": "Props" | kind=code-symbol | source=loop-app/src/navigation/AppNavigator.tsx:L7 | neighbors=[AppNavigator.tsx]

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
