# Loop — Campus Concierge

A centralized campus event discovery, concierge, and aggregation platform for IIT Delhi.

## Architecture

This monorepo is organized into two primary subsystems:

```
LOOP/
├── .github/
│   └── workflows/
│       └── scraper.yml            # Scheduled GitHub Actions autonomous scraper pipeline
├── docs/
│   └── insta_ids.md               # Directory of 39 IIT Delhi club & board Instagram handles
├── loop-app/                      # Mobile & Web Frontend (React Native / Expo)
│   ├── src/
│   │   ├── components/            # Reusable UI components (EventCard, EmptyState, etc.)
│   │   ├── config/                # Firebase client initialization
│   │   ├── data/                  # Mock data and constants
│   │   ├── navigation/            # Bottom tabs (mobile) & side rail (web)
│   │   ├── screens/               # Home, Curate, Directory, Pulse, Queue, Submit
│   │   ├── theme/                 # Design tokens (Crimson & Onyx palette)
│   │   └── utils/                 # Utility functions & helpers
│   ├── App.tsx                    # Root React Native application
│   ├── app.json                   # Expo configuration
│   └── package.json               # Frontend dependencies & scripts
└── loop-scraper/                  # Event Ingestion Backend (Python & Node.js)
    ├── stock/                     # Offline seed events & fallback data
    ├── gemini_parser.py           # Gemini 2.5 Flash flyer OCR & event extraction
    ├── scraper.py                 # Core Instagram ingestion pipeline to Firestore
    ├── puppeteer_scraper.js       # Headless browser fallback for Instagram scraping
    ├── requirements.txt           # Python dependencies
    └── package.json               # Scraper Node dependencies
```

---

## Subsystems

### 1. `loop-app` (Frontend)
- **Framework**: React Native with Expo SDK 57 (`react-native-web` enabled)
- **Styling**: Strict custom theme tokens (`loop-app/src/theme/colors.ts`) adhering to the Crimson & Onyx design system
- **Backend**: Firebase Firestore (`loop-app/src/config/firebase.ts`)
- **Commands**:
  ```bash
  cd loop-app
  npm start         # Start Expo dev server
  npm run web       # Run in web browser
  npm run android   # Run in Android emulator
  npm run ios       # Run in iOS simulator
  ```

### 2. `loop-scraper` (Backend Ingestion)
- **Pipeline**:
  1. Scrapes latest posts from 39 IIT Delhi student body Instagram accounts (`scraper.py` / `puppeteer_scraper.js`).
  2. Runs flyer images and captions through **Gemini 2.5 Flash** (`gemini_parser.py`) to extract structured event data (title, host, date, time, venue, category, summary, confidence score).
  3. Deduplicates and upserts events into Firebase Firestore.
- **Automation**: Scheduled via `.github/workflows/scraper.yml` to run autonomously every 6 hours.
