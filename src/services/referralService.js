// src/services/referralService.js
// Simple referral system: user shares their UID as ref code
// When new user registers with ?ref=UID, both get bonus EC
import {
  doc, getDoc, updateDoc, addDoc, collection,
  serverTimestamp, runTransaction, query, where, getDocs, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const REFERRER_BONUS = 50;  // EC for the person who referred
const REFEREE_BONUS  = 25;  // EC for the new person who signed up

// Called after new user registers - processes referral bonus
export async function processReferral(newUserUid, referrerUid) {
  if (!newUserUid || !referrerUid || newUserUid === referrerUid) return;

  // Check referrer exists
  const refSnap = await getDoc(doc(db, 'users', referrerUid));
  if (!refSnap.exists()) return;

  // Check not already processed
  const existing = await getDocs(
    query(collection(db, 'referrals'),
      where('newUserUid',  '==', newUserUid),
      where('referrerUid', '==', referrerUid),
      limit(1))
  );
  if (!existing.empty) return;

  await runTransaction(db, async (tx) => {
    const [refSnap, newSnap] = await Promise.all([
      tx.get(doc(db, 'users', referrerUid)),
      tx.get(doc(db, 'users', newUserUid)),
    ]);
    if (!refSnap.exists() || !newSnap.exists()) return;
    const refData = refSnap.data();
    const newData = newSnap.data();

    tx.update(doc(db, 'users', referrerUid), {
      elite_coins_balance: refData.elite_coins_balance + REFERRER_BONUS,
      updatedAt: serverTimestamp(),
    });
    tx.update(doc(db, 'users', newUserUid), {
      elite_coins_balance: newData.elite_coins_balance + REFEREE_BONUS,
      updatedAt: serverTimestamp(),
    });
  });

  // Log referral
  await addDoc(collection(db, 'referrals'), {
    referrerUid, newUserUid,
    referrerBonus: REFERRER_BONUS,
    refereeBonus:  REFEREE_BONUS,
    createdAt:     serverTimestamp(),
  });
}

// Get user's referral stats
export async function getReferralStats(uid) {
  const snap = await getDocs(
    query(collection(db, 'referrals'), where('referrerUid', '==', uid))
  );
  return {
    totalReferrals:   snap.size,
    totalEarned:      snap.size * REFERRER_BONUS,
    referralCode:     uid,
    bonusPerReferral: REFERRER_BONUS,
  };
}

export const REFERRAL_CONFIG = { REFERRER_BONUS, REFEREE_BONUS };
