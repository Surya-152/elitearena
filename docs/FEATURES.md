# ⚡ EliteArena v12 — Complete Features Guide

---

## 🗺️ Website Map

```
Public Pages (Bina login ke):
├── /               → Home (landing page)
├── /login          → Sign in
├── /register       → Account banao
├── /forgot-password→ Password reset
├── /verify-email   → Email verification
├── /leaderboard    → Global rankings
├── /news           → Esports news & blog
├── /news/:id       → Article detail page
├── /compliance     → Indian legal info (TDS, GST)
├── /privacy        → Privacy policy
└── /terms          → Terms of service

Protected Pages (Login zaroori):
├── /dashboard      → Tournament arena (main page)
├── /tournament/:id → Match room + chat + stream
├── /wallet         → Deposit, withdraw, earn EC
├── /profile        → Account settings + referral
├── /kyc            → Identity verification
├── /support        → Help tickets
├── /elite-pass     → Premium membership
├── /achievements   → Badges & rewards
├── /stats          → Player analytics
└── /team           → Squad management

Admin Only:
└── /admin          → Admin dashboard (8 tabs)
```

---

## 👤 Authentication System

### Register
- Email + Password + Username (3-20 chars, only letters/numbers/_)
- Terms & Privacy checkbox mandatory
- Email verification link automatically jaata hai
- Google One-Click login bhi supported
- Referral system: `?ref=UID` URL param se

### Login Security
- Generic error messages — "Email ya password galat hai" (hacker ko pata nahi chalega)
- Google login — email verification skip
- "Remember me" — Firebase handles session

### Password Management
- Forgot password → reset email
- Change password → re-authentication required
- Google accounts → password change not supported

---

## 💰 Wallet & Payments

### EliteCoins (EC)
- `1 EC = ₹1` (configurable)
- Balance real-time update (Firestore onSnapshot)
- All transactions logged in `transactions` collection

### Deposit (₹ → EC)
```
Step 1: Amount choose karo (₹50 – ₹10,000)
Step 2: UPI QR scan karo → exact amount bhejo
Step 3: UTR number paste karo → Submit
Admin approves → EC automatically credited (Cloud Function)
```
- Duplicate UTR blocked
- Minimum: ₹50

### Withdrawal (EC → ₹)
```
UPI ID daalo → EC amount daalo → Submit
→ EC turant deduct
→ 5% platform fee
→ 10 minutes mein auto-process (Cloud Function)
→ UPI pe paisa aata hai
→ Notification aati hai
```
- Double withdrawal impossible (atomic lock)
- KYC approved hona zaroori
- Minimum: 500 EC

### Earning EC
| Method | Amount | Limit |
|--------|--------|-------|
| Watch Ads | +1 EC/ad | 10/day (15 with ElitePass) |
| Daily Login | +5-30 EC | 1/day (streak bonus) |
| Tournament Win | Prize amount | — |
| Achievement | 10-300 EC | Once per badge |
| Referral | +50 EC | Per friend |
| Referred | +25 EC | Once |

---

## 🎮 Tournament System

### Tournament Modes

| Mode | Players | Slots Example | Join Process |
|------|---------|---------------|--------------|
| 🎯 Solo | 1 | 100 slots = 100 players | Direct join |
| 👥 Duo | 2 | 100 slots = 50 teams × 2 | Team join (2 UIDs) |
| ⚔️ Squad | 4 | 100 slots = 25 teams × 4 | Team join (4 UIDs) |

### Admin Tournament Create Karta Hai
1. Mode select (Solo/Duo/Squad)
2. Game select (BGMI/Free Fire MAX/COD Mobile)
3. Entry fee (0 = Free)
4. Prize pool
5. Total slots
6. Start time
7. Rules text
8. Stream URL (Optional)
9. Sponsor name (Optional)

**Revenue Preview** automatically: Total Collected - Prize = Profit

### Join Flow
**Solo:** Join button → EC deduct → Registered ✅

**Duo/Squad:** Saare members ke UIDs daalo → Sab ke wallet se EC deduct → Sab registered

### Match Day
1. Admin BGMI/Free Fire mein room create karta hai
2. Admin Panel → Matches → Manage → Room ID + Password set karta hai
3. Status "LIVE" karta hai → Cloud Function sabhi players ko notification
4. Players → Match Room → Room ID + Password copy → Game mein join

### Winner Declaration
**Solo:** 1 UID → Full prize credit

**Duo:** 2 UIDs → Prize ÷ 2 each

**Squad:** 4 UIDs → Prize ÷ 4 each

---

## 🗞️ Blog System

### User Side
- `/news` → Published articles list (Firestore se real-time)
- Category filters (BGMI, Free Fire, Earning, Career, etc.)
- `/news/:id` → Full article with markdown rendering
- View count automatic

### Admin Side
**Admin Panel → Blog tab:**
- Naya article likho (with live word count + read time)
- Markdown supported: `## Heading`, `- bullet list`, `1. numbered`
- Category, emoji, tags select karo
- Published/Draft toggle
- Edit existing articles
- Delete articles

> **Note:** Agar koi article Firestore mein nahi hai, 6 built-in seed articles dikhte hain. Admin panel se article add karo → woh dikhenge.

---

## 🏆 Achievements

| Badge | Trigger | EC Reward |
|-------|---------|-----------|
| 🎮 First Blood | Pehla tournament join | +10 EC |
| ⚔️ Veteran | 5 matches | +25 EC |
| 🏆 Champion | Pehli win | +50 EC |
| 🤝 Recruiter | Pehla referral | +25 EC |
| 💰 Investor | Pehla deposit | +15 EC |
| 🔥 Loyal Soldier | 7 din streak | +70 EC |
| 👑 Elite Legend | 30 din streak | +300 EC |
| 💎 Money Maker | 1000 EC earn | +50 EC |
| 🚀 War Machine | 10 matches | +100 EC |

Auto-check on page load. Toast notification pe new achievement.

---

## 👑 ElitePass Premium

**Price:** 99 EC/month (≈ ₹99)

**Features:**
- +50 EC activation bonus (turant)
- 15 ads/day (instead of 10)
- Exclusive tournaments
- Priority registration
- 👑 Profile badge
- Navbar mein "👑 Active" badge

**Purchase:** Wallet → `/elite-pass` → Button dabao → EC se pay → Activate

**Expiry:** 1 month baad automatic. Manual renew karna hoga.

---

## 🌍 Multi-Language

**6 Languages:** English, हिंदी, தமிழ், తెలుగు, বাংলা, मराठी

- Navbar mein 🌐 Globe icon → Language dropdown
- Selection localStorage mein save hoti hai
- Next visit pe same language

---

## 🔔 Notifications

**Triggers:**
- Register → Welcome notification
- Deposit approved → EC credited notification
- Withdrawal processed → UPI bheja notification
- Tournament full → All registered players
- Tournament live → All registered players (with room ID hint)
- KYC approve → Approved notification
- KYC reject → Reject reason ke saath
- Achievement unlock → Badge name

**UI:** Navbar bell icon → Red badge unread count → Dropdown inbox → Click to read → "All read" button

---

## 💬 Tournament Chat

- Real-time Firestore
- Registered players only can chat
- Profanity filter (Hindi + English bad words)
- ElitePass badge 👑 username ke saath
- 200 character limit
- Emoji picker (10 emojis)

---

## 📺 Live Stream

- YouTube + Twitch embed support
- Admin stream URL set karta hai (tournament create/edit mein)
- Match Room pe embed dikhta hai
- User manually bhi URL paste kar sakta hai

---

## 🛡️ Security

| Layer | Protection |
|-------|-----------|
| Firestore Rules | 14 collections, server-side enforcement |
| Role Immutability | User khud admin nahi ban sakta |
| Balance Protection | Client-side balance change blocked |
| Withdrawal Lock | Atomic `hasPendingWithdrawal` flag |
| Email Enumeration | Generic error messages |
| KYC Gate | Withdrawal = KYC approved only |
| Email Verification | Dashboard access gated |
| Banned User | Can't join/create/message |
| CSP Headers | XSS attacks blocked |
| HSTS | HTTPS enforced |
| X-Frame-Options | Clickjacking blocked |

---

## 📺 Ad System

| Page | Network | Placement |
|------|---------|-----------|
| Dashboard | AdSense | Right sidebar |
| Leaderboard | AdSense | Top banner |
| Tournament Detail | Media.net | Below stream |
| Tournament Detail | Flipkart + Amazon | Bottom (gaming gear) |
| News/Blog | PropellerAds | Between articles |

**Loading:** 5-second defer + IntersectionObserver = zero CLS, zero LCP impact

---

## ⚙️ Admin Panel (8 Tabs)

| Tab | Function |
|-----|----------|
| Payments | Deposits approve/reject, withdrawals manage |
| KYC | User verification review |
| Support | Ticket replies |
| Matches | Tournament status + Room ID + Winner |
| Create | New tournament create |
| Balances | Manual EC adjustment |
| Notify | Custom notifications push |
| Blog | Articles create/edit/delete/publish |

---

## ☁️ Cloud Functions (9)

Auto-run on Firebase — no manual action needed.

| Function | Trigger | Action |
|----------|---------|--------|
| processScheduledWithdrawals | Every 1 minute | Due withdrawals complete karo |
| onWithdrawalCreated | New withdrawal | Notification bhejo |
| onDepositStatusChange | Admin approves | EC credit karo |
| onUserRegistered | New signup | Welcome notification |
| onTournamentFull | Tournament fills | All players alert |
| onTournamentGoesLive | Status = live | All players alert |
| onKYCStatusChange | KYC decision | User notify karo |
| cleanupOldNotifications | Daily 2 AM | 30+ day old notifications delete |
| validateWithdrawal | On withdrawal | Server-side KYC + balance check |

---

## ⚡ Performance

- **React.lazy + Suspense** — 23 routes, each separate JS chunk
- **Vite Terser** — console.log remove, 2-pass minify
- **Firebase chunk** — separate cacheable bundle
- **Ads: 5s defer** — main content loads first
- **IntersectionObserver** — ads load only when visible
- **Firebase persistence** — offline cache, instant reload
- **DNS Prefetch** — Firebase, AdSense, Media.net, PropellerAds pre-resolved

---

*EliteArena v12 — 80 source files, 105 total files, 37/37 checks passed*
