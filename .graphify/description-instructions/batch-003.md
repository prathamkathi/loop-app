# Node Description Batch 4 of 6

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

- "utils_storage_savesavedevents": "saveSavedEvents()" | kind=code-symbol | source=loop-app/src/utils/storage.ts:L48 | neighbors=[App.tsx, storage.ts]
- "components_aicampusconcierge_aicampusconcierge": "AICampusConcierge()" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L41 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_message": "Message" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L20 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_prompt_chips": "PROMPT_CHIPS" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L33 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_props": "Props" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L27 | neighbors=[AICampusConcierge.tsx]
- "components_aicampusconcierge_styles": "styles" | kind=code-symbol | source=loop-app/src/components/AICampusConcierge.tsx:L255 | neighbors=[AICampusConcierge.tsx]
- "components_emptystate_emptystate": "EmptyState()" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L11 | neighbors=[EmptyState.tsx]
- "components_emptystate_props": "Props" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L6 | neighbors=[EmptyState.tsx]
- "components_emptystate_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EmptyState.tsx:L63 | neighbors=[EmptyState.tsx]
- "components_eventcard_eventcard": "EventCard()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L70 | neighbors=[EventCard.tsx]
- "components_eventcard_props": "Props" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L8 | neighbors=[EventCard.tsx]
- "components_eventcard_pulsedot": "PulseDot()" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L16 | neighbors=[EventCard.tsx]
- "components_eventcard_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EventCard.tsx:L227 | neighbors=[EventCard.tsx]
- "components_eventdetailmodal_detailrow": "DetailRow()" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L327 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_detailstyles": "detailStyles" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L339 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_eventdetailmodal": "EventDetailModal()" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L33 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L26 | neighbors=[EventDetailModal.tsx]
- "components_eventdetailmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/EventDetailModal.tsx:L356 | neighbors=[EventDetailModal.tsx]
- "components_featuredcard_featuredcard": "FeaturedCard()" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L19 | neighbors=[FeaturedCard.tsx]
- "components_featuredcard_props": "Props" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L12 | neighbors=[FeaturedCard.tsx]
- "components_featuredcard_styles": "styles" | kind=code-symbol | source=loop-app/src/components/FeaturedCard.tsx:L130 | neighbors=[FeaturedCard.tsx]
- "components_floatingfield_floatingfield": "FloatingField()" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L12 | neighbors=[FloatingField.tsx]
- "components_floatingfield_props": "Props" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L5 | neighbors=[FloatingField.tsx]
- "components_floatingfield_styles": "styles" | kind=code-symbol | source=loop-app/src/components/FloatingField.tsx:L89 | neighbors=[FloatingField.tsx]
- "components_notificationmodal_initial_notifications": "INITIAL_NOTIFICATIONS" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L16 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_notificationitem": "NotificationItem" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L7 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_notificationmodal": "NotificationModal()" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L56 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L51 | neighbors=[NotificationModal.tsx]
- "components_notificationmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/NotificationModal.tsx:L174 | neighbors=[NotificationModal.tsx]
- "components_savebutton_props": "Props" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L6 | neighbors=[SaveButton.tsx]
- "components_savebutton_savebutton": "SaveButton()" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L12 | neighbors=[SaveButton.tsx]
- "components_savebutton_styles": "styles" | kind=code-symbol | source=loop-app/src/components/SaveButton.tsx:L43 | neighbors=[SaveButton.tsx]
- "components_sectionlabel_props": "Props" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L5 | neighbors=[SectionLabel.tsx]
- "components_sectionlabel_sectionlabel": "SectionLabel()" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L7 | neighbors=[SectionLabel.tsx]
- "components_sectionlabel_styles": "styles" | kind=code-symbol | source=loop-app/src/components/SectionLabel.tsx:L22 | neighbors=[SectionLabel.tsx]
- "components_studentauthmodal_hostels": "HOSTELS" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L26 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_props": "Props" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L18 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_studentauthmodal": "StudentAuthModal()" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L32 | neighbors=[StudentAuthModal.tsx]
- "components_studentauthmodal_styles": "styles" | kind=code-symbol | source=loop-app/src/components/StudentAuthModal.tsx:L280 | neighbors=[StudentAuthModal.tsx]
- "components_topbar_props": "Props" | kind=code-symbol | source=loop-app/src/components/TopBar.tsx:L7 | neighbors=[TopBar.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/prathamkathi/Downloads/LOOP/.graphify/description-instructions/batch-003.json

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
