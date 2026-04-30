# ⚡ EliteArena v7 — Production Esports Platform

**Zero Bugs • Zero Errors • Production Ready**

---

## 🚀 5-Minute Setup

```bash
# 1. Extract ZIP
# 2. Open terminal in project folder

# 3. Install dependencies
npm install
cd functions && npm install && cd ..

# 4. Copy and fill env
cp .env.example .env
# Open .env in any text editor and fill all values

# 5. Run locally
npm run dev
# Opens http://localhost:5173
```

---

## 📋 What to Fill — Complete Guide

### 1. Firebase Keys (Mandatory)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```
**Where:** console.firebase.google.com → Project → Settings ⚙️ → Your Apps → Web `</>` → Config

### 2. Admin UID (Mandatory)
```
VITE_ADMIN_UID=your_firebase_uid
```
**Where:** Register on site → Firebase Console → Authentication → Users → Your UID

**Also do:** Firestore → users → [your-uid] doc → Add field: `role = "admin"` (string)

### 3. UPI ID (Mandatory for deposits)
```
VITE_OWNER_UPI_ID=yourname@paytm
VITE_OWNER_UPI_NAME=EliteArena
```
**Where:** Any UPI app → Profile → Your UPI ID

### 4. QR Code Image (Recommended)
```
VITE_UPI_QR_URL=https://...
```
**How:** Cloudinary.com (free) → Upload QR screenshot → Copy URL

### 5. AdSense (After approval)
```
VITE_ADSENSE_PUBLISHER_ID=ca-pub-...
VITE_AD_SLOT_SIDEBAR=...
VITE_AD_SLOT_BANNER=...
```
**Where:** adsense.google.com → Account Info + Ads → By Ad Unit

---

## 🚢 One-Click Deploy

```bash
npm install -g firebase-tools vercel
firebase login && vercel login

cp .firebaserc.example .firebaserc
# Edit .firebaserc: replace YOUR_FIREBASE_PROJECT_ID

bash scripts/deploy-all.sh
```

After deploy: Vercel Dashboard → Project → Settings → Environment Variables → Add all VITE_* values → Redeploy

---

## 🔥 Cloud Functions

Requires **Firebase Blaze plan** (free tier is generous):
```bash
bash scripts/deploy-functions.sh
```

10 functions deployed:
- Auto-withdrawal processor (every 1 min)
- EC credit on deposit approval  
- Welcome notification on register
- Tournament full/live notifications
- KYC status notifications
- Daily cleanup

---

## 📁 Project Structure

```
EliteArena/
├── functions/           Firebase Cloud Functions (TypeScript)
├── public/              robots.txt, sitemap.xml, manifest.json
├── scripts/             deploy-all.sh, deploy-functions.sh, seed.mjs
├── src/
│   ├── components/      UI components (admin/, common/, user/)
│   ├── config/          firebase.js, payments.js
│   ├── context/         AuthContext.jsx
│   ├── hooks/           11 custom React hooks
│   ├── pages/           16 pages + admin/ + legal/
│   └── services/        9 Firebase service modules
├── .env.example         ← copy to .env and fill
├── .firebaserc.example  ← copy to .firebaserc and fill
├── firestore.rules      Security rules
└── vercel.json          Deploy config + security headers
```

---

## ✅ Post-Deploy Checklist

```
Firebase Console:
☐ Authentication → Email/Password → Enable
☐ Authentication → Google → Enable
☐ Authentication → Settings → Authorized Domains → Add Vercel domain
☐ Firestore → Create (Production mode)
☐ Upgrade to Blaze plan

Deploy:
☐ firebase deploy --only firestore:rules,firestore:indexes
☐ bash scripts/deploy-functions.sh
☐ npm run seed   (sample tournaments)
☐ vercel --prod

Manual:
☐ Firestore → users/[your-uid] → role: "admin"
☐ Vercel → Env Vars → All VITE_* values → Redeploy

SEO (replace yourdomain.com):
☐ public/sitemap.xml
☐ public/robots.txt
☐ public/og-image.svg
☐ index.html canonical URLs
```

---

MIT License • EliteArena © 2025
