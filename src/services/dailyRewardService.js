// src/services/dailyRewardService.js — Daily login reward system
import {
  doc, getDoc, updateDoc, addDoc, collection,
  serverTimestamp, runTransaction, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const DAILY_REWARD_EC = 5;
const STREAK_BONUS    = [0, 5, 5, 5, 10, 10, 10, 25]; // index = streak day (1-7, then 25 for 7+)

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function yesterdayStart() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Claim daily reward ─────────────────────────────────────────────────────────
export async function claimDailyReward(uid) {
  if (!uid) throw new Error('Not logged in.');

  const userRef = doc(db, 'users', uid);
  let rewardInfo = {};

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('User not found.');
    const u = snap.data();

    const lastClaim = u.lastDailyClaim?.toDate ? u.lastDailyClaim.toDate() : null;
    const today     = todayStart();
    const yesterday = yesterdayStart();

    // Already claimed today?
    if (lastClaim && lastClaim >= today) {
      const nextClaim = new Date(today);
      nextClaim.setDate(nextClaim.getDate() + 1);
      const hoursLeft = Math.ceil((nextClaim - new Date()) / 3600000);
      throw new Error(`Aaj ka reward le chuke ho! ${hoursLeft} ghante baad wapas aao.`);
    }

    // Calculate streak
    let streak = u.loginStreak || 0;
    if (lastClaim && lastClaim >= yesterday) {
      streak = Math.min(streak + 1, 30); // max 30 day streak
    } else {
      streak = 1; // reset streak
    }

    const bonus  = STREAK_BONUS[Math.min(streak, 7)] || 25;
    const total  = DAILY_REWARD_EC + bonus;

    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance + total,
      lastDailyClaim:      serverTimestamp(),
      loginStreak:         streak,
      updatedAt:           serverTimestamp(),
    });

    rewardInfo = { ec: total, base: DAILY_REWARD_EC, bonus, streak };
  });

  // Log transaction
  await addDoc(collection(db, 'transactions'), {
    userId:    uid,
    delta:     rewardInfo.ec,
    reason:    `Daily reward (Day ${rewardInfo.streak} streak) +${rewardInfo.ec} EC`,
    type:      'daily_reward',
    createdAt: serverTimestamp(),
  });

  return rewardInfo;
}

// ── Check if reward available ─────────────────────────────────────────────────
export function getDailyRewardStatus(userProfile) {
  if (!userProfile) return { available: false, streak: 0, hoursLeft: 0 };

  const lastClaim = userProfile.lastDailyClaim?.toDate
    ? userProfile.lastDailyClaim.toDate()
    : null;
  const today = todayStart();

  if (!lastClaim || lastClaim < today) {
    return {
      available:  true,
      streak:     userProfile.loginStreak || 0,
      nextReward: DAILY_REWARD_EC + (STREAK_BONUS[Math.min((userProfile.loginStreak||0)+1, 7)] || 25),
    };
  }

  const nextClaim = new Date(today);
  nextClaim.setDate(nextClaim.getDate() + 1);
  const hoursLeft = Math.ceil((nextClaim - new Date()) / 3600000);

  return {
    available:  false,
    streak:     userProfile.loginStreak || 0,
    hoursLeft,
    nextReward: DAILY_REWARD_EC + (STREAK_BONUS[Math.min((userProfile.loginStreak||0)+1, 7)] || 25),
  };
}
