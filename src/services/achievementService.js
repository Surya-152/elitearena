// src/services/achievementService.js — Achievement & Badge System
import {
  doc, getDoc, updateDoc, addDoc, collection,
  serverTimestamp, runTransaction, getDocs, query, where,
} from 'firebase/firestore';
import { db }          from '../config/firebase';
import { ACHIEVEMENTS } from '../config/payments';

// ── Check and grant new achievements for a user ────────────────────────────────
export async function checkAndGrantAchievements(uid) {
  if (!uid) return [];

  const userRef  = doc(db, 'users', uid);
  const uSnap    = await getDoc(userRef);
  if (!uSnap.exists()) return [];
  const u = uSnap.data();

  const earned = u.achievements || [];
  const newlyGranted = [];

  for (const ach of ACHIEVEMENTS) {
    if (earned.includes(ach.id)) continue; // already earned

    let value = 0;
    if (ach.trigger === 'matches_played')   value = u.matches_played   || 0;
    if (ach.trigger === 'total_winnings')   value = u.total_winnings   || 0;
    if (ach.trigger === 'login_streak')     value = u.loginStreak      || 0;
    if (ach.trigger === 'deposit_count')    value = u.depositCount     || 0;
    if (ach.trigger === 'referral_count')   value = u.referralCount    || 0;

    if (value >= ach.threshold) {
      newlyGranted.push(ach);
    }
  }

  if (newlyGranted.length === 0) return [];

  // Grant all newly earned achievements in one transaction
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    const u2   = snap.data();
    const newIds     = newlyGranted.map(a => a.id);
    const bonusTotal = newlyGranted.reduce((s, a) => s + a.ec, 0);

    tx.update(userRef, {
      achievements:        [...(u2.achievements || []), ...newIds],
      elite_coins_balance: u2.elite_coins_balance + bonusTotal,
      updatedAt:           serverTimestamp(),
    });
  });

  // Log each achievement
  for (const ach of newlyGranted) {
    await addDoc(collection(db, 'transactions'), {
      userId:    uid,
      delta:     ach.ec,
      reason:    `Achievement unlocked: ${ach.label} (+${ach.ec} EC)`,
      type:      'achievement',
      createdAt: serverTimestamp(),
    });
  }

  return newlyGranted;
}

// ── Get user achievements with status ──────────────────────────────────────────
export function getUserAchievementStatus(userProfile) {
  const earned = userProfile?.achievements || [];
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    earned:   earned.includes(ach.id),
    progress: (() => {
      const u = userProfile || {};
      if (ach.trigger === 'matches_played')  return Math.min(u.matches_played  || 0, ach.threshold);
      if (ach.trigger === 'total_winnings')  return Math.min(u.total_winnings  || 0, ach.threshold);
      if (ach.trigger === 'login_streak')    return Math.min(u.loginStreak     || 0, ach.threshold);
      if (ach.trigger === 'deposit_count')   return Math.min(u.depositCount    || 0, ach.threshold);
      if (ach.trigger === 'referral_count')  return Math.min(u.referralCount   || 0, ach.threshold);
      return 0;
    })(),
  }));
}
