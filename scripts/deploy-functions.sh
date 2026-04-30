#!/bin/bash
# ============================================================
# EliteArena — Cloud Functions Deploy Script
# Run: bash scripts/deploy-functions.sh
# ============================================================

set -e  # Exit on any error

echo ""
echo "🔥 EliteArena — Cloud Functions Deploy"
echo "======================================="
echo ""

# Step 1: Build TypeScript
echo "📦 Step 1: Building TypeScript..."
cd functions
npm install --silent
npm run build
cd ..
echo "   ✅ Build successful"
echo ""

# Step 2: Deploy functions
echo "🚀 Step 2: Deploying to Firebase..."
firebase deploy --only functions
echo ""

echo "✅ All Cloud Functions deployed!"
echo ""
echo "Deployed Functions:"
echo "  ⏰ processScheduledWithdrawals  — cron every 1 min (auto-withdrawal)"
echo "  📥 onWithdrawalCreated          — schedule + notify on new withdrawal"
echo "  ✅ onDepositStatusChange        — credit EC when admin approves deposit"
echo "  👤 onUserRegistered             — welcome notification on signup"
echo "  🎮 onTournamentFull             — notify all players when tournament fills"
echo "  🏆 onPrizeCredited              — audit log when prize is given"
echo "  🔴 onTournamentGoesLive         — notify all players when match goes live"
echo "  🧹 cleanupOldNotifications      — daily 2AM: delete 30-day-old notifs"
echo "  📞 validateWithdrawal           — HTTPS callable for pre-validation"
echo ""
echo "View logs: firebase functions:log"
