# LOOP Roadmap & Inspiration Backlog ("Garam Khoon" Analysis)

This backlog captures the best concepts, UX enhancements, and campus operating features analyzed from the **IIT Delhi Campus Hub ("Garam Khoon")** reference platform, organized for phased planning and implementation.

---

## 🎯 Top High-Impact Feature Candidates

### 1. Priority Pass & Fast-Track Gate Entry System
- **Dynamic Gate QR Pass**:
  - Automatically generated for RSVP'd events.
  - Generates a unique token string (e.g., `RDV-VIP-1034`).
  - Includes gate instructions (e.g. *Main Ground OAT Gate 2* vs *General Walk-in*).
  - Walking duration estimation based on registered student hostel (e.g., *"5 min walk from Girnar"*).
- **Live Gate Headcount & Capacity Meter**:
  - Live progress bar showing venue capacity (e.g., `2,280 / 2,500 Inside (91%)`).
  - Visual warnings: `Filling Fast` (amber) & `Nearly Full` (crimson).
- **Volunteer Check-in Scanner (Studio Mode)**:
  - Mobile camera scanner for organizers and coordinators to scan attendee passes at the door, incrementing headcount live in Firestore.

### 2. 1-Click Fast Filters in Home Feed
- **"Happening Today"**: Quickly narrows down to events starting within the next 24 hours.
- **"Free Food / Refreshments"**: Highlights events offering snacks, high tea, or pizza (detected by Gemini or tagged by organizers).
- **"Fast-Track Pass Available"**: Filters to events with enabled gate entry tokens.
- **"Certified Workshop"**: Filters to events issuing certificates of participation.

### 3. Campus Bazaar (Peer-to-Peer Hostel Marketplace)
- **Zero-Commission Student Exchange**:
  - Categories: `Appliances` (Coolers, kettles), `Cycles`, `Academics` (Books, drafters, lab coats), `Room Essentials` (Mattresses, laundry hampers), `Electronics`.
  - Item details: Price vs. original retail price, condition (`Like New`, `Good`, `Fair`), hostel wing & room number (`Girnar D-204`).
  - **1-Click WhatsApp Seller Connect**: Direct deep-link launching pre-filled WhatsApp chat to negotiate and arrange immediate hostel room handoff.
  - Image uploads using Cloudinary via our existing serverless upload endpoint.

### 4. 24x7 BSW Emergency SOS Quick-Access
- Quick-access button in TopBar or floating shield:
  - Instant one-tap phone dialers:
    - **IIT Hospital Ambulance**: `011-2659-6100` / Ext `6100`
    - **BSW Student Counselor Desk**
    - **Main Gate Security & Control Room**
    - **Hostel Warden Emergency Contacts**

### 5. Campus Celebrations & Culture in PulseScreen
- **Major Fest Countdowns**:
  - Dynamic countdown timers for `Rendezvous`, `Tryst`, `Sportech`, `Literati`, etc.
- **Campus Birthday Alerts**:
  - Daily birthday alerts for students with an interactive **"Send Cake 🎂"** applause/slice counter.
- **Placement & Academic Kudos Feed**:
  - Celebrating students securing dream placements, GSoC, or research publications with an applause/kudos button.
- **BSW Positivity & Gratitude Wall**:
  - Anonymous or signed appreciation notes for campus unsung heroes (e.g., *LHC Chai Bhaiya*, night mess staff, library caretakers).

### 6. Hostel Lounges & Verified Kerberos Identity
- **Kerberos Decoding**:
  - Automatically derive graduation batch, department, and degree from entry number (e.g., `2022CS10450` &rarr; Computer Science '26).
- **Hostel Common Rooms / Wing Lounges**:
  - Dedicated group discussion channels for each hostel (Girnar, Nilgiri, Himadri, Karakoram, etc.) backed by Firestore `onSnapshot`.

---

## 🛠️ Architectural Advantages of LOOP over Reference App

| Flaw in Reference App | LOOP Architecture Solution |
|---|---|
| **Chat wipes out on reload** (local `useState` only) | Firestore persistent `/chats` and `/lounges` with live offline cache via AsyncStorage |
| **Cosmetic 4-letter auth** (no verification) | Firebase Auth with custom claims (`coordinator`, student verification) |
| **Static screenshot-able SVG QR** (forgery risk) | Time-synced token with anti-screenshot visual watermarks |
| **Countdown date drift** (hardcoded 2025 strings) | Firestore-backed dynamic fest calendar with recurring fallbacks |
| **Mobile viewport clipping** under bottom bar | Universal React Native safe area insets (`SafeAreaView` + `edges=['top', 'bottom']`) |
| **Mock images only** | Enterprise Cloudinary integration with signed uploads & automatic image optimization (`w_1600,f_auto,q_auto`) |
