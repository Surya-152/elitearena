// src/services/walletService.js
// FIXED: ElitePass holders get 15 ads/day instead of 10
import {
  doc, addDoc, collection, query, where, orderBy,
  limit, getDocs, serverTimestamp, runTransaction, Timestamp,
} from 'firebase/firestore';
import { db }          from '../config/firebase';
import { isPassActive } from './elitePassService';

export const AD_LIMIT_REGULAR  = 10;
export const AD_LIMIT_ELITEPASS= 15;

// Get dynamic daily limit based on ElitePass status
export function getDailyAdLimit(userProfile) {
  return isPassActive(userProfile) ? AD_LIMIT_ELITEPASS : AD_LIMIT_REGULAR;
}

// ── Ad Reward: +1 EC after watching ad ────────────────────────────────────────
export async function claimAdReward(uid, userProfile) {
  const userRef    = doc(db, 'users', uid);
  const dailyLimit = getDailyAdLimit(userProfile);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = Timestamp.fromDate(todayStart);

  const snap = await getDocs(query(
    collection(db, 'ad_rewards'),
    where('userId',    '==', uid),
    where('claimedAt', '>=', todayTs),
    orderBy('claimedAt', 'desc'),
    limit(dailyLimit)
  ));

  if (snap.size >= dailyLimit) {
    const passStr = isPassActive(userProfile) ? ' (ElitePass limit)' : '';
    throw new Error(`Daily limit (${dailyLimit}/day${passStr}) reached. Kal wapas aao!`);
  }

  await runTransaction(db, async tx => {
    const uSnap = await tx.get(userRef);
    if (!uSnap.exists()) throw new Error('User not found.');
    const u = uSnap.data();
    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance + 1,
      updatedAt:           serverTimestamp(),
    });
  });

  await addDoc(collection(db, 'ad_rewards'), {
    userId:    uid,
    amount:    1,
    claimedAt: serverTimestamp(),
  });

  return { earned: 1, claimedToday: snap.size + 1, dailyLimit };
}

// ── Fetch transaction history ─────────────────────────────────────────────────
export async function fetchTransactions(uid, limitCount = 30) {
  const q = query(
    collection(db, 'transactions'),
    where('userId',    '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Admin: Manual balance adjustment ─────────────────────────────────────────
export async function adminAdjustBalance(targetUid, delta, reason) {
  if (!targetUid) throw new Error('Target UID is required.');
  if (delta === 0) throw new Error('Delta cannot be zero.');

  const userRef = doc(db, 'users', targetUid);
  await runTransaction(db, async tx => {
    const uSnap = await tx.get(userRef);
    if (!uSnap.exists()) throw new Error('Target user not found. UID check karo.');
    const u = uSnap.data();
    tx.update(userRef, {
      elite_coins_balance: Math.max(0, u.elite_coins_balance + delta),
      updatedAt: serverTimestamp(),
    });
  });

  await addDoc(collection(db, 'transactions'), {
    userId:    targetUid,
    delta,
    reason:    reason?.trim() || 'Admin adjustment',
    type:      'admin_adjustment',
    createdAt: serverTimestamp(),
  });
}
