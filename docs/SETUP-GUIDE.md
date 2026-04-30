# ⚡ EliteArena — PC Setup se Deploy Tak Complete Guide

**Version:** v12 | **Stack:** React 18 + Vite + Firebase + Tailwind CSS

---

## 📋 Table of Contents

1. [PC Setup](#1-pc-setup)
2. [Project Download & Install](#2-project-download--install)
3. [Firebase Setup](#3-firebase-setup)
4. [Environment Variables](#4-environment-variables)
5. [Admin Account Banao](#5-admin-account-banao)
6. [Local Development](#6-local-development)
7. [Deploy to Vercel](#7-deploy-to-vercel)
8. [Cloud Functions Deploy](#8-cloud-functions-deploy)
9. [Post-Deploy Checklist](#9-post-deploy-checklist)
10. [Ad Networks Setup](#10-ad-networks-setup)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. PC Setup

### Windows pe Required Software Install Karo

**Step 1 — Node.js (Mandatory)**
```
1. https://nodejs.org kholo
2. "LTS" version pe click karo (v20 ya v22)
3. .msi file download hogi
4. Install karo — "Add to PATH" checkbox ZAROR tick karo
```

**Step 2 — Git**
```
1. https://git-scm.com kholo
2. Download → Install
3. Sab options default rakho (Next → Next → Finish)
```

**Step 3 — VS Code (Code editor)**
```
1. https://code.visualstudio.com kholo
2. Download → Install
```

**Verify karo (terminal mein type karo):**

Windows: `Win + R` → `cmd` → Enter

```bash
node --version    # v20.x.x dikhna chahiye
npm --version     # 10.x.x dikhna chahiye
git --version     # git version 2.x.x dikhna chahiye
```

Agar kuch nahi dikha → PC restart karo aur dobara try karo.

---

## 2. Project Download & Install

**Step 1 — ZIP Extract Karo**
```
EliteArena-v12-FINAL.zip
→ Right click → "Extract All"
→ C:\Projects\EliteArena\
```

**Step 2 — VS Code mein open karo**
```
VS Code → File → Open Folder → C:\Projects\EliteArena → Select Folder
```

**Step 3 — Terminal kholo**

VS Code mein: `Ctrl + backtick (`)`

```bash
# Frontend dependencies
npm install

# Firebase Cloud Functions dependencies
cd functions
npm install
cd ..
```

> **Time:** 2-5 minutes lag sakta hai first time

---

## 3. Firebase Setup

### 3.1 Firebase Account

1. [console.firebase.google.com](https://console.firebase.google.com) kholo
2. Gmail se login karo
3. **"Add project"** button click karo
4. Project name: `EliteArena` (ya apna naam)
5. Google Analytics: **Enable** karo → Continue
6. **"Create project"** → 30 second wait → **"Continue"**

---

### 3.2 Authentication Enable

```
Firebase Console → Left sidebar → Build → Authentication → Get Started

"Sign-in method" tab pe:
→ Email/Password row click karo → Enable toggle ON → Save ✅
→ Google row click karo → Enable toggle ON
  → Project support email: apna Gmail select karo
  → Save ✅
```

---

### 3.3 Firestore Database

```
Firebase Console → Build → Cloud Firestore → Create database

→ "Start in production mode" → Next
→ Location: asia-south1    ← India ke liye best
→ Enable
```

> **Wait 30-60 seconds** — database ban raha hai

---

### 3.4 Firebase Web App Register

```
Firebase Console → Settings ⚙️ (top-left gear) → Project settings

Scroll down → "Your apps" section:
→ </> (Web) icon click karo
→ App nickname: "EliteArena Web"
→ "Register app"
```

Ek code box dikhega. **Yeh 6 values copy karo:**

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy_COPY_KARO",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123:web:abcdef123456"
};
```

---

### 3.5 Firestore Rules Deploy

Firestore rules deploy karne ke baad hi website kaam karegi:

```bash
# Pehle Firebase Tools install karo
npm install -g firebase-tools

# Login karo
firebase login
# Browser mein Google account se login → Allow

# .firebaserc setup karo
copy .firebaserc.example .firebaserc
```

`.firebaserc` file mein `YOUR_FIREBASE_PROJECT_ID` replace karo apne Project ID se.

**Project ID kahan milega:**
```
Firebase Console → Settings ⚙️ → General → Project ID
(Example: elitearena-prod)
```

```bash
# Rules aur indexes deploy karo
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 4. Environment Variables

**Step 1 — .env file banao:**

```bash
copy .env.example .env
```

**Step 2 — .env file VS Code mein kholo** (`Ctrl+P` → `.env` → Enter)

**Step 3 — Yeh values fill karo:**

```env
# ── Firebase Keys (Step 3.4 se copy karo) ──────────────────────
VITE_FIREBASE_API_KEY=AIzaSy_jo_copy_kiya_tha
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123:web:abcdef123456

# ── Admin (Step 5 mein fill karo) ──────────────────────────────
VITE_ADMIN_UID=BAAD_MEIN_FILL_KARO

# ── UPI Payment ─────────────────────────────────────────────────
VITE_OWNER_UPI_ID=yourname@paytm
VITE_OWNER_UPI_NAME=EliteArena
VITE_UPI_QR_URL=

# ── EC Settings ─────────────────────────────────────────────────
VITE_EC_PER_RUPEE=1
VITE_MIN_DEPOSIT=50
VITE_MAX_DEPOSIT=10000
VITE_MIN_WITHDRAWAL=500
VITE_MAX_WITHDRAWAL=50000
VITE_WITHDRAWAL_DELAY_MINUTES=10
VITE_WITHDRAWAL_FEE_PERCENT=5

# ── Site URL (deploy ke baad fill karo) ─────────────────────────
VITE_SITE_URL=https://yourdomain.vercel.app
```

**Save: `Ctrl + S`**

---

## 5. Admin Account Banao

**Step 1 — Local server start karo:**

```bash
npm run dev
```

Browser mein khulega: `http://localhost:5173`

---

**Step 2 — Register karo:**

```
/register pe jaao
→ Email, username, password daalo
→ Submit
→ Email check karo → Verification link click karo
→ Wapas aake login karo
```

---

**Step 3 — Apna Firebase UID copy karo:**

```
Firebase Console → Authentication → Users tab
→ Apni email ke row mein UID column
→ Lambi random string copy karo
  Example: Kx7mN2pQrLvW4bYcDgHsU8oAe1fR3nJ5
```

---

**Step 4 — .env mein daalo:**

```env
VITE_ADMIN_UID=Kx7mN2pQrLvW4bYcDgHsU8oAe1fR3nJ5
```

Server restart karo: `Ctrl+C` → `npm run dev`

---

**Step 5 — Firestore mein Admin role set karo:**

```
Firebase Console → Firestore Database → users collection
→ Apna UID wala document click karo
→ "+ Add field" button:
   Field: role | Type: string | Value: admin
→ Save
```

Ab `/admin` page access hoga! ✅

---

## 6. Local Development

```bash
npm run dev
```

**Available URLs:**
- `http://localhost:5173` — Main website
- `http://localhost:5173/admin` — Admin panel

**Hot Reload:** File save karo → browser automatically update ho jaata hai.

**Build test:**
```bash
npm run build
npm run preview
```

---

## 7. Deploy to Vercel

### 7.1 Vercel Account

```
https://vercel.com → Sign Up → GitHub se login (free)
```

### 7.2 Vercel CLI Install

```bash
npm install -g vercel
vercel login
```

Browser mein Vercel account se login → Authorize → Terminal mein success message.

### 7.3 Deploy

```bash
# Build karo
npm run build

# Deploy
vercel --prod
```

**Pehli baar yeh questions aayenge:**

```
Set up and deploy? → Y → Enter
Which scope? → Apna username select karo → Enter
Link to existing project? → N → Enter
Project name? → elitearena → Enter
In which directory is your code? → . → Enter
Want to override settings? → N → Enter
```

**Deploy complete!** URL milega:
```
✅ Production: https://elitearena-xyz.vercel.app
```

### 7.4 Environment Variables Vercel pe Add Karo

> **ZAROORI:** Bina iske site kaam nahi karegi!

```
vercel.com/dashboard → Apna project → Settings → Environment Variables
```

`.env` file ke saari `VITE_` values ek-ek karke add karo:

| Key | Value |
|-----|-------|
| VITE_FIREBASE_API_KEY | AIzaSy... |
| VITE_FIREBASE_AUTH_DOMAIN | xyz.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | xyz |
| VITE_FIREBASE_STORAGE_BUCKET | xyz.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | 123... |
| VITE_FIREBASE_APP_ID | 1:123:web:abc |
| VITE_ADMIN_UID | Kx7mN2p... |
| VITE_OWNER_UPI_ID | name@paytm |
| VITE_OWNER_UPI_NAME | EliteArena |
| VITE_EC_PER_RUPEE | 1 |
| VITE_MIN_DEPOSIT | 50 |
| VITE_MIN_WITHDRAWAL | 500 |
| VITE_WITHDRAWAL_DELAY_MINUTES | 10 |
| VITE_WITHDRAWAL_FEE_PERCENT | 5 |
| VITE_SITE_URL | https://elitearena-xyz.vercel.app |

Phir:
```
Deployments tab → Latest → "..." (three dots) → Redeploy
```

### 7.5 Firebase mein Vercel Domain Add Karo

```
Firebase Console → Authentication → Settings → Authorized domains
→ Add domain button
→ elitearena-xyz.vercel.app daalo (apna actual URL)
→ Add
```

---

## 8. Cloud Functions Deploy

Cloud Functions ke liye **Firebase Blaze Plan** required hai.

### 8.1 Blaze Plan Upgrade

```
Firebase Console → Bottom left → "Spark" → Upgrade to Blaze
→ Billing details daalo (debit/credit card)
```

> **Note:** Small platforms ke liye monthly ₹0-100 charge hota hai. Free tier generous hai.

### 8.2 Functions Deploy

```bash
bash scripts/deploy-functions.sh
```

Ya manually:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

**9 functions deploy hongi:**

| Function | Kya karta hai |
|----------|---------------|
| processScheduledWithdrawals | Har 1 minute — withdrawal auto-process |
| onWithdrawalCreated | Withdrawal pe notification |
| onDepositStatusChange | EC credit on deposit approve |
| onUserRegistered | Welcome notification |
| onTournamentFull | Tournament full alert |
| onTournamentGoesLive | Tournament live alert |
| onKYCStatusChange | KYC approve/reject notification |
| cleanupOldNotifications | Daily cleanup |
| validateWithdrawal | Server-side validation |

### 8.3 Sample Data

```bash
npm run seed
```

5 sample tournaments create hote hain database mein.

---

## 9. Post-Deploy Checklist

Website live hone ke baad yeh sab test karo:

### Authentication Tests
- [ ] `/register` → Account banao → Email aata hai?
- [ ] Email verify link click karo → Dashboard pe redirect?
- [ ] `/login` → Email+password se login?
- [ ] Google se login karo?
- [ ] `/forgot-password` → Reset email aata hai?
- [ ] `/admin` → Admin panel dikh raha hai?

### Wallet Tests
- [ ] Deposit request banao → Admin panel mein dikh raha hai?
- [ ] Admin approve karo → EC credit hua?
- [ ] Withdrawal request submit karo → EC deduct hua?

### Tournament Tests
- [ ] Admin → Create tab → Tournament banao?
- [ ] Dashboard pe tournament dikh raha hai?
- [ ] Join karo → Slot fill hua?

### Mobile Tests
- [ ] Chrome → F12 → Toggle device toolbar → Mobile view?
- [ ] Navbar hamburger menu kaam karta hai?
- [ ] All pages mobile pe readable hain?
- [ ] Touch targets large enough?

### Features Tests
- [ ] `/news` → Articles dikh rahe hain?
- [ ] `/achievements` → Badges dikh rahe hain?
- [ ] `/elite-pass` → Page load?
- [ ] `/team` → Team create?
- [ ] Language selector kaam karta hai?
- [ ] Ambient sound button bottom-right mein?
- [ ] Notifications bell mein test notification?

---

## 10. Ad Networks Setup

### PropellerAds (Aaj Se Shuru — No Approval)

```
1. propellerads.com → Sign Up → Publisher account
2. Sites → Add Site → apna Vercel URL
3. Zones → Create Zone → Banner → Zone ID copy karo
4. .env mein: VITE_PROPELLER_ZONE_ID=xxxxxxxxx
5. index.html mein PropellerAds script uncomment karo
6. Vercel → Redeploy
```

**Revenue:** ₹50-500/day depending on traffic

---

### Google AdSense (1-14 Din — Apply Karo)

```
1. adsense.google.com → Apply
2. Website URL daalo → Submit
3. 1-14 din mein approval email aayega
4. Approved hone ke baad:
   → Publisher ID copy karo (ca-pub-xxxx)
   → 3 Ad Units create karo (Sidebar, Banner, Infeed)
   → Slot IDs copy karo
5. .env mein:
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-xxxx
   VITE_AD_SLOT_SIDEBAR=xxxx
   VITE_AD_SLOT_BANNER=xxxx
   VITE_AD_SLOT_INFEED=xxxx
6. index.html mein AdSense script uncomment karo
7. Vercel → Redeploy
```

**Revenue:** ₹500-5000/day depending on traffic

---

### Amazon Affiliate (Turant Shuru)

```
1. affiliate-program.amazon.in → Register
2. Tracking ID milega (yourname-21)
3. .env mein: VITE_AMAZON_AFFILIATE_TAG=yourname-21
4. Vercel → Redeploy
```

Gaming gear cards tournament page pe automatically dikhenge.

---

### Media.net (3-5 Din)

```
1. media.net → Publisher → Apply
2. 3-5 din mein approval
3. Site ID copy karo
4. .env mein:
   VITE_MEDIANET_SITE_ID=xxxxxxxxx
   VITE_MEDIANET_SLOT_SIDEBAR=xxxx
5. index.html mein Media.net script uncomment karo
6. Vercel → Redeploy
```

---

## 11. Troubleshooting

### ❌ "Firebase: Error (auth/configuration-not-found)"
**Fix:** `.env` mein Firebase keys galat hain ya missing hain.

### ❌ "Missing or insufficient permissions"
**Fix:** Firestore rules deploy nahi ki:
```bash
firebase deploy --only firestore:rules
```

### ❌ Website login ke baad blank page
**Fix:** Email verification pending hai. Email check karo.

### ❌ Admin panel nahi dikh raha
**Fix:** 
1. `VITE_ADMIN_UID` correct hai?
2. Firestore mein `users/{uid}/role = "admin"` set hai?
3. Server restart karo: `Ctrl+C` → `npm run dev`

### ❌ Cloud Functions error
**Fix:** Blaze plan upgrade ki?
```bash
firebase deploy --only functions --debug
```

### ❌ Vercel pe website kaam nahi karta
**Fix:** Environment Variables add ki? Redeploy kiya?

### ❌ UPI QR nahi dikh raha
**Fix:** `VITE_UPI_QR_URL` mein direct image URL daalo (Cloudinary pe upload karo)

---

## 📞 Support

Koi problem aaye toh:
1. Browser console kholo (`F12` → Console tab) — error dekho
2. Firebase Console → Logs check karo
3. Vercel → Functions → Logs check karo

---

*EliteArena v12 — India's #1 Esports Tournament Platform*
