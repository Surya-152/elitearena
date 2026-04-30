// src/services/paymentService.js
// SECURITY FIX: Withdrawal race condition fixed with hasPendingWithdrawal lock field
import {
  collection, doc, addDoc, updateDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, runTransaction, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db }           from '../config/firebase';
import { PAYMENT_CONFIG, inrToEC, ecToINR } from '../config/payments';

export const DEPOSIT_STATUS = { PENDING:'pending', APPROVED:'approved', REJECTED:'rejected' };
export const WITHDRAWAL_STATUS = { SCHEDULED:'scheduled', PROCESSING:'processing', COMPLETED:'completed', FAILED:'failed' };

export function isValidUpiId(upi) {
  return /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim());
}

// ── CREATE DEPOSIT ────────────────────────────────────────────────────────────
export async function createDepositRequest(uid, amountINR, utrNumber) {
  if (!uid) throw new Error('User not logged in.');
  if (amountINR < PAYMENT_CONFIG.minDeposit)  throw new Error(`Minimum deposit ₹${PAYMENT_CONFIG.minDeposit}.`);
  if (amountINR > PAYMENT_CONFIG.maxDeposit)  throw new Error(`Maximum deposit ₹${PAYMENT_CONFIG.maxDeposit}.`);
  if (!utrNumber || utrNumber.trim().length < 6) throw new Error('Valid UTR number daalo (min 6 chars).');

  // Duplicate UTR check
  const dup = await getDocs(query(collection(db, 'deposits'), where('utr_number','==',utrNumber.trim().toUpperCase())));
  if (!dup.empty) throw new Error('Yeh UTR already submit hua hai.');

  const ecAmount = inrToEC(amountINR);
  const ref = await addDoc(collection(db, 'deposits'), {
    uid, amount_inr: amountINR, ec_amount: ecAmount,
    utr_number: utrNumber.trim().toUpperCase(),
    status: DEPOSIT_STATUS.PENDING,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), admin_note: '',
  });
  return ref.id;
}

export async function approveDeposit(depositId, adminNote='') {
  const depositRef = doc(db, 'deposits', depositId);
  await runTransaction(db, async (tx) => {
    const dSnap = await tx.get(depositRef);
    if (!dSnap.exists())                      throw new Error('Deposit not found.');
    const d = dSnap.data();
    if (d.status !== DEPOSIT_STATUS.PENDING)  throw new Error('Not a pending deposit.');
    const userRef = doc(db, 'users', d.uid);
    const uSnap   = await tx.get(userRef);
    if (!uSnap.exists())                      throw new Error('User not found.');
    const u = uSnap.data();
    tx.update(userRef, { elite_coins_balance: u.elite_coins_balance + d.ec_amount, updatedAt: serverTimestamp() });
    tx.update(depositRef, { status: DEPOSIT_STATUS.APPROVED, admin_note: adminNote, updatedAt: serverTimestamp() });
  });
}

export async function rejectDeposit(depositId, adminNote='') {
  await updateDoc(doc(db, 'deposits', depositId), {
    status: DEPOSIT_STATUS.REJECTED, admin_note: adminNote||'Rejected by admin', updatedAt: serverTimestamp(),
  });
}

export function subscribeUserDeposits(uid, callback, onError) {
  const q = query(collection(db,'deposits'), where('uid','==',uid), orderBy('createdAt','desc'), limit(20));
  return onSnapshot(q, s => callback(s.docs.map(d=>({id:d.id,...d.data()}))), onError);
}
export function subscribePendingDeposits(callback, onError) {
  const q = query(collection(db,'deposits'), where('status','==',DEPOSIT_STATUS.PENDING), orderBy('createdAt','asc'));
  return onSnapshot(q, s => callback(s.docs.map(d=>({id:d.id,...d.data()}))), onError);
}

// ── CREATE WITHDRAWAL — RACE CONDITION FIXED ──────────────────────────────────
// Uses hasPendingWithdrawal flag inside transaction to prevent double withdrawal
export async function createWithdrawalRequest(uid, upiId, ecAmount) {
  if (!uid)               throw new Error('User not logged in.');
  const inrAmount       = ecToINR(ecAmount);
  const feePercent      = PAYMENT_CONFIG.withdrawalFeePercent || 5;
  const feeEC           = Math.floor(ecAmount * feePercent / 100);
  const ecAfterFee      = ecAmount - feeEC;
  const inrAfterFee     = ecToINR(ecAfterFee);
  if (inrAmount < PAYMENT_CONFIG.minWithdrawal) throw new Error(`Minimum withdrawal ${PAYMENT_CONFIG.minWithdrawal} EC (₹${PAYMENT_CONFIG.minWithdrawal}).`);
  if (inrAmount > PAYMENT_CONFIG.maxWithdrawal) throw new Error(`Maximum withdrawal ₹${PAYMENT_CONFIG.maxWithdrawal}.`);
  if (!isValidUpiId(upiId)) throw new Error('Invalid UPI ID format. Example: name@upi');

  const processAt   = Timestamp.fromMillis(Date.now() + PAYMENT_CONFIG.withdrawalDelayMs);
  const userRef     = doc(db, 'users', uid);

  // SECURITY FIX: All checks + EC deduction in single transaction with lock flag
  await runTransaction(db, async (tx) => {
    const uSnap = await tx.get(userRef);
    if (!uSnap.exists())       throw new Error('User not found.');
    const u = uSnap.data();

    // FIX: Check hasPendingWithdrawal flag atomically inside transaction
    if (u.hasPendingWithdrawal) throw new Error('Ek withdrawal already pending hai. Complete hone ka wait karo.');
    if (u.elite_coins_balance < ecAmount) throw new Error(`Insufficient balance. Aapke paas ${u.elite_coins_balance} EC hai, ${ecAmount} EC chahiye.`);
    
    // KYC check
    if (u.kycStatus !== 'approved') throw new Error('Withdrawal ke liye KYC approval zaroori hai. Profile → KYC pe jaao.');

    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance - ecAmount,
      hasPendingWithdrawal: true,  // LOCK: prevents concurrent withdrawals
      updatedAt: serverTimestamp(),
    });
  });

  // Create withdrawal doc after successful transaction
  let wRef;
  try {
    wRef = await addDoc(collection(db, 'withdrawals'), {
      uid, upi_id: upiId.trim(), ec_amount: ecAmount, amount_inr: inrAmount,
      fee_ec: feeEC, fee_percent: feePercent, amount_inr_after_fee: inrAfterFee,
      status: WITHDRAWAL_STATUS.SCHEDULED, processAt,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), admin_note: '',
    });
  } catch (e) {
    // Rollback: release lock and refund EC if doc creation fails
    await runTransaction(db, async (tx) => {
      const uSnap = await tx.get(userRef);
      const u = uSnap.data();
      tx.update(userRef, {
        elite_coins_balance: u.elite_coins_balance + ecAmount,
        hasPendingWithdrawal: false,
        updatedAt: serverTimestamp(),
      });
    });
    throw new Error('Withdrawal create failed. EC refund ho gaya. Dobara try karo.');
  }

  return { withdrawalId: wRef.id, processAt: processAt.toDate() };
}

export function subscribeUserWithdrawals(uid, callback, onError) {
  const q = query(collection(db,'withdrawals'), where('uid','==',uid), orderBy('createdAt','desc'), limit(20));
  return onSnapshot(q, s => callback(s.docs.map(d=>({id:d.id,...d.data()}))), onError);
}
export function subscribePendingWithdrawals(callback, onError) {
  const q = query(collection(db,'withdrawals'), where('status','in',[WITHDRAWAL_STATUS.SCHEDULED,WITHDRAWAL_STATUS.PROCESSING]), orderBy('processAt','asc'));
  return onSnapshot(q, s => callback(s.docs.map(d=>({id:d.id,...d.data()}))), onError);
}

// ── COMPLETE WITHDRAWAL — also releases hasPendingWithdrawal lock ─────────────
export async function completeWithdrawal(withdrawalId, adminNote='') {
  const wRef = doc(db, 'withdrawals', withdrawalId);
  await runTransaction(db, async (tx) => {
    const wSnap = await tx.get(wRef);
    if (!wSnap.exists()) throw new Error('Withdrawal not found.');
    const w = wSnap.data();
    // Release lock on user doc
    tx.update(doc(db,'users',w.uid), { hasPendingWithdrawal: false, updatedAt: serverTimestamp() });
    tx.update(wRef, { status: WITHDRAWAL_STATUS.COMPLETED, admin_note: adminNote, processedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
}

// ── FAIL WITHDRAWAL — refund EC + release lock ─────────────────────────────────
export async function failWithdrawal(withdrawalId, reason='') {
  const wRef = doc(db, 'withdrawals', withdrawalId);
  await runTransaction(db, async (tx) => {
    const wSnap = await tx.get(wRef);
    if (!wSnap.exists()) throw new Error('Withdrawal not found.');
    const w = wSnap.data();
    if (w.status === WITHDRAWAL_STATUS.COMPLETED) throw new Error('Cannot fail a completed withdrawal.');
    const uRef  = doc(db,'users',w.uid);
    const uSnap = await tx.get(uRef);
    if (!uSnap.exists()) throw new Error('User not found.');
    const u = uSnap.data();
    // Refund EC + release lock
    tx.update(uRef, {
      elite_coins_balance:  u.elite_coins_balance + w.ec_amount,
      hasPendingWithdrawal: false,
      updatedAt: serverTimestamp(),
    });
    tx.update(wRef, { status: WITHDRAWAL_STATUS.FAILED, admin_note: reason||'Failed — EC refunded', updatedAt: serverTimestamp() });
  });
}
