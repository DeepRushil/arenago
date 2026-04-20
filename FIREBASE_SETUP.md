# StadiumGo — Firebase Setup Guide

Get your free Firebase project running in **< 5 minutes**.

---

## Step 1 — Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it `stadiumgo` → Continue
4. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Enable Email/Password Auth

1. In your project, click **"Build" → "Authentication"** in the left sidebar
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password** → Save
4. *(Optional)* Also enable **Google** for one-tap sign-in

---

## Step 3 — Create Firestore Database

1. Click **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (fine for development)
4. Select a region → **Enable**

---

## Step 4 — Get Your Config Keys

1. In the left sidebar, click the **gear icon ⚙️ → "Project settings"**
2. Scroll down to **"Your apps"** → Click **"</> Web"**
3. Register your app (name: `stadiumgo-web`) → **Register app**
4. You'll see a `firebaseConfig` object like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "stadiumgo-xxx.firebaseapp.com",
  projectId: "stadiumgo-xxx",
  storageBucket: "stadiumgo-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Step 5 — Add Keys to Your `.env` File

Open (or create) `venue_flow/.env` and paste your values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=stadiumgo-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stadiumgo-xxx
VITE_FIREBASE_STORAGE_BUCKET=stadiumgo-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Step 6 — Restart Vite

```bash
npm run dev
```

The app will now use real Firebase auth + Firestore. 🎉

---

## Firestore Data Structure

```
users/{uid}
  ├── name, email, phone
  ├── seat, homeStadium
  ├── fanId, fanPoints, avatar
  └── createdAt

orders/{auto-id}
  ├── userId, id (order ref)
  ├── items[], total
  ├── stadium, seat
  ├── status, placedAt
  └── createdAt
```

---

> **Security note:** Before going to production, update Firestore Rules to restrict reads/writes to the authenticated user only.
