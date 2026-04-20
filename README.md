# 🏟️ ArenaGO — ISL Fan Experience Platform [Live Link](https://arenago-nu.vercel.app/)

> **The ultimate in-stadium companion app for Indian Super League fans.**  
> Order food, navigate the arena, track live scores, and verify your seat — all from your phone.

---

##  Features

| Feature | Description |
|--------|-------------|
| 🎟️ **Ticket Verification** | Verify your match ticket to unlock in-seat food ordering and your seat location on the arena map |
| 🍔 **In-Seat Food Ordering** | Browse the stadium menu by category and add items to your cart without leaving your seat |
| 🗺️ **Interactive Arena Map** | Visual stadium map with live stand locations, restrooms, gates, and "You Are Here" marker post-verification |
| ⚽ **ISL Match Hub** | Live match scores, upcoming fixtures, and past results — with real-time status for the Indian Super League |
| 📊 **Live Venue Stats** | Real-time attendance count, concession wait times, restroom queue estimates, and gate congestion data |
| 👤 **Fan Profile** | Personal profile with order history, favourite team, fan ID, and quick sign-out |
| 📢 **In-Stadium Announcements** | Live venue-specific alerts (gate congestion, parking, express pickup) |
| 🎬 **Animated Background** | ISL hype animation plays silently in the background for an immersive experience |

---

## ☁️ Google Services

ArenaGO is built entirely on Google's Firebase ecosystem:

| Service | SDK Package | Usage |
|---------|-------------|-------|
| **Firebase Authentication** | `firebase/auth` | Email/Password + Google OAuth |
| **Cloud Firestore** | `firebase/firestore` | User profiles, orders, fan points |
| **Firebase Storage** | `firebase/storage` | User avatar photo uploads |
| **Firebase Analytics (GA4)** | `firebase/analytics` | Page views, cart events, purchases |
| **Firebase App Check** | `firebase/app-check` | reCAPTCHA v3 backend protection |

All Firebase config values are injected at build time via `VITE_FIREBASE_*` environment variables — no keys are hardcoded in source code.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Vanilla CSS (custom design system, no Tailwind)
- **Auth:** Google Firebase Authentication (Email/Password + Google Sign-In)
- **Database:** Google Cloud Firestore (real-time NoSQL)
- **Deployment:** Google Firebase Hosting / Vercel
- **Fonts:** Inter (Google Fonts)
- **Testing:** Vitest + React Testing Library (31 tests)

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/DeepRushil/arenago.git
cd arenago
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Create a project or use an existing one
- Enable **Email/Password** and **Google** under Authentication → Sign-in method
- Create a **Cloud Firestore Database** (start in test mode)
- Go to Project Settings → Your Apps → add a Web App → copy the config

### 4. Add environment variables
Create a `.env` file in the root of the project:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 5. Run the dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

ArenaGO ships with a full test suite powered by **Vitest** and **React Testing Library**:

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-runs on file save)
npm run test:ui       # Visual test browser UI
```

**Current coverage: 31 tests across 3 suites — all passing ✅**

| Suite | Tests | Covers |
|-------|-------|--------|
| `islApi.test.js` | 6 | API shape, status enums, score validation |
| `stadiums.test.js` | 6 | STADIUMS data integrity, bounds, uniqueness |
| `appLogic.test.js` | 19 | Cart logic, auth helpers, navigation, ISL teams |

---

## 📦 Build for Production
```bash
npm run build
```
The output will be in the `dist/` folder.

---

## ☁️ Deployment

### Option A — Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set public dir to: dist, SPA: yes
npm run build
firebase deploy
```

### Option B — Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Add all `VITE_FIREBASE_*` environment variables in the Vercel dashboard
4. Click **Deploy** — done!

---

## 🔐 Security Notes

- **Never commit your `.env` file** — it is listed in `.gitignore`
- All Firebase keys are read via `import.meta.env.VITE_*` — never hardcoded
- Cloud Firestore Security Rules should be configured before production launch

---

## 📱 Responsive Design

ArenaGO is fully responsive across all screen sizes:

| Breakpoint | Layout |
|-----------|--------|
| 📱 Mobile (`< 768px`) | Bottom navigation bar, single-column layout |
| 📲 Tablet (`768px – 1023px`) | Bottom navigation bar, wider single column |
| 🖥️ Desktop (`1024px+`) | Full left sidebar, 2-column grid layout |

Semantic HTML5 elements (`<main>`, `<nav>`, `<header>`, `<section>`, `<article>`) are used throughout all page components for accessibility and SEO compliance.

---

## 🧩 Project Structure

```
venue_flow/
├── public/               # Static assets
├── src/
│   ├── components/
│   │   ├── auth/         # Login, Signup, SetupRequired
│   │   ├── AnimatedBackground.jsx
│   │   ├── CartPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MapPage.jsx
│   │   ├── OrderPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── StadiumSelector.jsx
│   │   ├── TicketVerify.jsx
│   │   └── ToastManager.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Firebase Auth + Cloud Firestore
│   ├── services/
│   │   └── islApi.js        # ISL match data service
│   ├── tests/
│   │   ├── setup.js         # Vitest global setup + Firebase mocks
│   │   ├── islApi.test.js   # API service tests
│   │   ├── stadiums.test.js # Stadium data integrity tests
│   │   └── appLogic.test.js # Cart, auth, navigation logic tests
│   ├── App.jsx              # Root component + routing
│   ├── firebase.js          # Firebase initialization
│   ├── index.css            # Global design system
│   └── main.jsx
├── .env.example             # Environment variable template
├── .gitignore
└── vite.config.js
```

---

## 🗺️ App Flow

```
Landing → [Guest explores] → Profile → Sign In / Sign Up
                           ↓
              Home → Verify Ticket (auto-popup)
                           ↓
         Stadium Auto-Assigned → Background Animation Loads
                           ↓
         Order Food | View Map | Check Live Scores | Fan Stats
```

---

## 📌 Demo Ticket Codes

For testing the ticket verification flow, use any of these codes (or any 4+ character string):

```
ISL2024   MCFC001   KBFC007   FAN2024   TICKET1   VIP0001
```

---

## 👨‍💻 Author

**Rushil** — [LinkedIn](https://www.linkedin.com/in/deeprushil/).

---
## 📄 License

This project is open source and available under the [MIT License](LICENSE).
This Project is made for Google Dev PromptWars competition and is not intended to be used as a service/product.