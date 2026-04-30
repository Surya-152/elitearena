// src/services/elitePassService.js — ElitePass premium subscription
import {
  doc, getDoc, updateDoc, addDoc, collection,
  serverTimestamp, runTransaction, query,
  where, getDocs, limit, Timestamp,
} from 'firebase/firestore';
import { db }            from '../config/firebase';
import { ELITE_PASS }    from '../config/payments';

// ── Buy ElitePass (deducts EC from balance) ───────────────────────────────────
export async function purchaseElitePass(uid) {
  if (!uid) throw new Error('Not logged in.');

  const userRef = doc(db, 'users', uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('User not found.');
    const u = snap.data();

    // Check already active
    if (u.elitePassExpiry) {
      const expiry = u.elitePassExpiry.toDate ? u.elitePassExpiry.toDate() : new Date(u.elitePassExpiry);
      if (expiry > new Date()) throw new Error(`ElitePass already active! Expires: ${expiry.toLocaleDateString('en-IN')}`);
    }

    if (u.elite_coins_balance < ELITE_PASS.priceEC)
      throw new Error(`ElitePass ke liye ${ELITE_PASS.priceEC} EC chahiye. Aapke paas ${u.elite_coins_balance} EC hai.`);

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance - ELITE_PASS.priceEC,
      elitePassActive:     true,
      elitePassExpiry:     Timestamp.fromDate(expiryDate),
      updatedAt:           serverTimestamp(),
    });
  });

  // Grant monthly bonus EC
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    const u    = snap.data();
    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance + ELITE_PASS.monthlyBonusEC,
      updatedAt:           serverTimestamp(),
    });
  });

  // Log transaction
  await addDoc(collection(db, 'transactions'), {
    userId:    uid,
    delta:     -ELITE_PASS.priceEC,
    reason:    `ElitePass purchased — 1 month`,
    type:      'elite_pass',
    createdAt: serverTimestamp(),
  });
}

// ── Check if user's pass is active ────────────────────────────────────────────
export function isPassActive(userProfile) {
  if (!userProfile?.elitePassActive || !userProfile?.elitePassExpiry) return false;
  const expiry = userProfile.elitePassExpiry?.toDate
    ? userProfile.elitePassExpiry.toDate()
    : new Date(userProfile.elitePassExpiry);
  return expiry > new Date();
}

// ── Days remaining ────────────────────────────────────────────────────────────
export function passExpiryInfo(userProfile) {
  if (!isPassActive(userProfile)) return null;
  const expiry = userProfile.elitePassExpiry?.toDate
    ? userProfile.elitePassExpiry.toDate()
    : new Date(userProfile.elitePassExpiry);
  const days = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
  return { expiry, days };
}
