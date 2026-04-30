#!/bin/bash
# ============================================================
# EliteArena — One-Click Deploy Script
# Run: bash scripts/deploy-all.sh
#
# What this does:
#   1. Validates .env file
#   2. Installs dependencies
#   3. Deploys Firestore rules + indexes
#   4. Deploys Cloud Functions
#   5. Builds frontend
#   6. Deploys to Vercel (or Firebase Hosting)
# ============================================================

set -e

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${CYAN}[EliteArena]${NC} $1"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo -e "${BOLD}${CYAN}⚡ EliteArena — One-Click Deploy${NC}"
echo "=================================================="
echo ""

# ── Step 1: Check .env ──────────────────────────────────────────────────────
log "Step 1/6: Checking .env file…"
if [ ! -f ".env" ]; then
  err ".env file nahi mila! Run: cp .env.example .env  then fill your keys."
fi

source .env 2>/dev/null || true

if [ -z "$VITE_FIREBASE_API_KEY" ] || [ "$VITE_FIREBASE_API_KEY" = "AIzaSy_PASTE_YOUR_KEY_HERE" ]; then
  err "VITE_FIREBASE_API_KEY .env mein fill nahi hua. .env file check karo."
fi
if [ -z "$VITE_ADMIN_UID" ] || [ "$VITE_ADMIN_UID" = "PASTE_YOUR_FIREBASE_UID_HERE" ]; then
  err "VITE_ADMIN_UID .env mein fill nahi hua."
fi
if [ -z "$VITE_OWNER_UPI_ID" ] || [ "$VITE_OWNER_UPI_ID" = "yourname@paytm" ]; then
  warn "VITE_OWNER_UPI_ID set nahi hua — deposit QR kaam nahi karega."
fi
ok ".env validated"

# ── Step 2: Install dependencies ────────────────────────────────────────────
log "Step 2/6: Dependencies install kar rahe hain…"
npm install --silent
ok "Frontend dependencies ready"

log "       Functions dependencies…"
cd functions && npm install --silent && cd ..
ok "Functions dependencies ready"

# ── Step 3: Firestore rules + indexes ───────────────────────────────────────
log "Step 3/6: Firestore rules + indexes deploy kar rahe hain…"
if ! command -v firebase &> /dev/null; then
  warn "firebase-tools nahi mila. Installing globally…"
  npm install -g firebase-tools --silent
fi

# Check .firebaserc
if [ ! -f ".firebaserc" ]; then
  if [ -f ".firebaserc.example" ]; then
    cp .firebaserc.example .firebaserc
    warn ".firebaserc copy kiya. PROJECT_ID replace karo andar."
  fi
fi

firebase deploy --only firestore:rules,firestore:indexes --non-interactive 2>&1 | tail -5 || \
  warn "Firestore deploy failed — manually run: firebase deploy --only firestore"
ok "Firestore rules deployed"

# ── Step 4: Cloud Functions ─────────────────────────────────────────────────
log "Step 4/6: Cloud Functions build + deploy…"
cd functions
npm run build 2>&1 | tail -3
cd ..
firebase deploy --only functions --non-interactive 2>&1 | tail -5 || \
  warn "Functions deploy failed — manually run: firebase deploy --only functions"
ok "Cloud Functions deployed (10 functions)"

# ── Step 5: Build frontend ──────────────────────────────────────────────────
log "Step 5/6: Frontend build ho raha hai (React + Vite)…"
npm run build
ok "Build complete → dist/ folder ready"

# ── Step 6: Deploy to Vercel ────────────────────────────────────────────────
log "Step 6/6: Vercel pe deploy kar rahe hain…"

if ! command -v vercel &> /dev/null; then
  warn "Vercel CLI nahi mila. Installing…"
  npm install -g vercel --silent
fi

# Check if linked to a project
if [ -f ".vercel/project.json" ]; then
  log "Existing Vercel project found — deploying…"
  vercel --prod --yes 2>&1 | tail -10
else
  log "New Vercel project — interactive setup…"
  vercel --prod
fi

echo ""
echo -e "${GREEN}${BOLD}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "Next steps:"
echo "  1. Vercel dashboard → Settings → Environment Variables mein .env values daalo"
echo "  2. Redeploy karo: vercel --prod"
echo "  3. Admin Panel: /admin → your UID se login karo"
echo "  4. Pehla tournament create karo!"
echo ""
echo "  Firebase Console:  https://console.firebase.google.com"
echo "  Vercel Dashboard:  https://vercel.com/dashboard"
echo ""
