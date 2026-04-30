# 🔧 EliteArena — Environment Variables Complete Reference

Yeh file batati hai har `.env` variable kya hai, kahan se milega, aur kya value daalni hai.

---

## Kaise Use Karein

```bash
# Step 1: .env.example copy karo
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux

# Step 2: .env file mein values fill karo
# Step 3: KABHI .env ko Git mein commit mat karo!
```

---

## 🔥 Firebase Configuration

### VITE_FIREBASE_API_KEY
**Kya hai:** Firebase project ka API key — har request authenticate karta hai

**Kahan se milega:**
```
Firebase Console → Settings ⚙️ → Project settings → Your apps → Web app
→ firebaseConfig → apiKey value copy karo
```

**Format:** `AIzaSy` se shuru hoti hai
```
VITE_FIREBASE_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### VITE_FIREBASE_AUTH_DOMAIN
**Kya hai:** Authentication ke liye domain

**Format:** `{project-id}.firebaseapp.com`
```
VITE_FIREBASE_AUTH_DOMAIN=elitearena-prod.firebaseapp.com
```

---

### VITE_FIREBASE_PROJECT_ID
**Kya hai:** Aapke Firebase project ka unique ID

**Kahan se milega:** Firebase Console → Settings → Project ID
```
VITE_FIREBASE_PROJECT_ID=elitearena-prod
```

---

### VITE_FIREBASE_STORAGE_BUCKET
**Kya hai:** Firebase Storage ka bucket name

**Format:** `{project-id}.appspot.com`
```
VITE_FIREBASE_STORAGE_BUCKET=elitearena-prod.appspot.com
```

---

### VITE_FIREBASE_MESSAGING_SENDER_ID
**Kya hai:** Firebase Cloud Messaging ka sender ID (10-12 digit number)
```
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
```

---

### VITE_FIREBASE_APP_ID
**Kya hai:** Web app ka unique identifier

**Format:** `1:{sender_id}:web:{hex_string}`
```
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 👑 Admin Configuration

### VITE_ADMIN_UID
**Kya hai:** Admin user ka Firebase UID — is UID wale user ko `/admin` access milega

**Kahan se milega:**
```
Step 1: Website pe register karo + login karo
Step 2: Firebase Console → Authentication → Users
Step 3: Apni email ke saamne UID column mein value copy karo
```

**Format:** 28 character random string
```
VITE_ADMIN_UID=Kx7mN2pQrLvW4bYcDgHsU8oAe1fR3nJ5
```

---

## 💳 UPI Payment Configuration

### VITE_OWNER_UPI_ID
**Kya hai:** Aapka UPI ID — users is pe deposit bhejenge

**Kahan se milega:**
```
PhonePe: Home → Profile icon → UPI IDs
Paytm:   Profile → Payment Settings → UPI IDs
GPay:    Settings → Payment methods → UPI IDs
```

**Formats:**
```
VITE_OWNER_UPI_ID=yourname@paytm
VITE_OWNER_UPI_ID=9876543210@ybl
VITE_OWNER_UPI_ID=name@okicici
```

---

### VITE_OWNER_UPI_NAME
**Kya hai:** Payment screen pe dikhne wala naam
```
VITE_OWNER_UPI_NAME=EliteArena
```

---

### VITE_UPI_QR_URL
**Kya hai:** UPI QR code ki image URL (optional but recommended)

**Kaise banayein:**
```
Step 1: UPI app → Receive Money → QR code dikhega
Step 2: Screenshot lo
Step 3: cloudinary.com pe free account banao → Upload
Step 4: Image URL copy karo
```

**Leave empty if not available:**
```
VITE_UPI_QR_URL=https://res.cloudinary.com/xyz/image/upload/qr.png
VITE_UPI_QR_URL=   ← empty = text fallback dikhega
```

---

## 🪙 EliteCoins Settings

### VITE_EC_PER_RUPEE
**Kya hai:** ₹1 mein kitne EC milenge

```
VITE_EC_PER_RUPEE=1    ← ₹1 = 1 EC (recommended)
VITE_EC_PER_RUPEE=2    ← ₹1 = 2 EC (users ke liye better deal)
```

---

### VITE_MIN_DEPOSIT
**Kya hai:** Minimum deposit amount (INR)
```
VITE_MIN_DEPOSIT=50
```

### VITE_MAX_DEPOSIT
**Kya hai:** Maximum deposit amount (INR)
```
VITE_MAX_DEPOSIT=10000
```

### VITE_MIN_WITHDRAWAL
**Kya hai:** Minimum withdrawal (EC)
```
VITE_MIN_WITHDRAWAL=500
```

### VITE_MAX_WITHDRAWAL
**Kya hai:** Maximum withdrawal (EC)
```
VITE_MAX_WITHDRAWAL=50000
```

### VITE_WITHDRAWAL_DELAY_MINUTES
**Kya hai:** Kitne minute baad withdrawal auto-process hoga
```
VITE_WITHDRAWAL_DELAY_MINUTES=10
```

### VITE_WITHDRAWAL_FEE_PERCENT
**Kya hai:** Platform ka withdrawal fee percentage (0-20)
```
VITE_WITHDRAWAL_FEE_PERCENT=5
```
Example: User 1000 EC withdraw kare → 50 EC fee → User ko 950 EC (₹950)

---

## 📺 Ad Networks

### Google AdSense

**Apply karo:** [adsense.google.com](https://adsense.google.com) → 1-14 din approval

```
VITE_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
VITE_AD_SLOT_SIDEBAR=9876543210      ← Dashboard sidebar
VITE_AD_SLOT_BANNER=1234567890       ← Leaderboard banner
VITE_AD_SLOT_INFEED=0987654321       ← In-feed ads
```

**Kahan se milega:**
```
AdSense Console → Account → Account information → Publisher ID
AdSense Console → Ads → By ad unit → Create → data-ad-slot value
```

---

### Media.net

**Apply karo:** [media.net](https://media.net) → Publisher → 3-5 din approval

```
VITE_MEDIANET_SITE_ID=12345678
VITE_MEDIANET_SLOT_SIDEBAR=87654321
VITE_MEDIANET_SLOT_BANNER=12348765
```

---

### PropellerAds

**Register karo:** [propellerads.com](https://propellerads.com) → Turant approval!

```
VITE_PROPELLER_ZONE_ID=12345678
```

---

### Amazon Affiliate

**Register karo:** [affiliate-program.amazon.in](https://affiliate-program.amazon.in)

```
VITE_AMAZON_AFFILIATE_TAG=yourname-21
VITE_AMAZON_AD_INSTANCE_ID=          ← Optional
```

---

### Flipkart Affiliate

**Register karo:** [affiliate.flipkart.com](https://affiliate.flipkart.com)

```
VITE_FLIPKART_AFFILIATE_ID=yourflipkartid
```

---

## 🌐 Site Configuration

### VITE_SITE_URL
**Kya hai:** Deploy ke baad aapka actual URL — SEO canonical URLs ke liye

```
VITE_SITE_URL=https://elitearena-xyz.vercel.app
VITE_SITE_URL=https://yourdomain.com    ← Custom domain ke baad
```

---

### VITE_USE_EMULATOR
**Kya hai:** Firebase local emulator use karna hai?

```
VITE_USE_EMULATOR=false    ← Production
VITE_USE_EMULATOR=true     ← Local Firebase Emulators
```

---

## ✅ Complete .env Example

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=elitearena-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=elitearena-prod
VITE_FIREBASE_STORAGE_BUCKET=elitearena-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Admin
VITE_ADMIN_UID=Kx7mN2pQrLvW4bYcDgHsU8oAe1fR3nJ5

# UPI
VITE_OWNER_UPI_ID=yourname@paytm
VITE_OWNER_UPI_NAME=EliteArena
VITE_UPI_QR_URL=https://res.cloudinary.com/xyz/image/upload/qr.png

# EC Settings
VITE_EC_PER_RUPEE=1
VITE_MIN_DEPOSIT=50
VITE_MAX_DEPOSIT=10000
VITE_MIN_WITHDRAWAL=500
VITE_MAX_WITHDRAWAL=50000
VITE_WITHDRAWAL_DELAY_MINUTES=10
VITE_WITHDRAWAL_FEE_PERCENT=5

# AdSense (fill after approval)
VITE_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
VITE_AD_SLOT_SIDEBAR=xxxxxxxxxx
VITE_AD_SLOT_BANNER=xxxxxxxxxx
VITE_AD_SLOT_INFEED=xxxxxxxxxx

# Media.net (fill after approval)
VITE_MEDIANET_SITE_ID=xxxxxxxxx
VITE_MEDIANET_SLOT_SIDEBAR=xxxxxxxxxx
VITE_MEDIANET_SLOT_BANNER=xxxxxxxxxx

# PropellerAds (immediate)
VITE_PROPELLER_ZONE_ID=xxxxxxxxx

# Amazon Affiliate (immediate)
VITE_AMAZON_AFFILIATE_TAG=yourname-21

# Flipkart Affiliate
VITE_FLIPKART_AFFILIATE_ID=xxxxxxxxxx

# Site
VITE_SITE_URL=https://yourdomain.vercel.app
VITE_USE_EMULATOR=false
```

---

## ⚠️ Security Rules

1. **`.env` ko `.gitignore` mein daalo** (already included)
2. **Kisi ke saath share mat karo** ye values
3. **Vercel mein separately add karo** — `.env` file auto-upload nahi hoti
4. **Firebase API Key** public hoti hai but Firestore Rules se protected hai — safe hai
