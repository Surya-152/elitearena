/**
 * EliteArena — Firebase Cloud Functions v3 (Complete)
 * ====================================================
 * 1.  processScheduledWithdrawals  — Cron 1min, auto-complete due withdrawals
 * 2.  onWithdrawalCreated          — Trigger: notify user on new withdrawal
 * 3.  onDepositStatusChange        — Trigger: credit EC when deposit approved
 * 4.  onUserRegistered             — Auth trigger: welcome notification
 * 5.  onTournamentFull             — Trigger: notify all when slots fill
 * 6.  onTournamentGoesLive         — Trigger: notify all when match goes live
 * 7.  onPrizeCredited              — Trigger: audit log on prize
 * 8.  onKYCStatusChange            — Trigger: notify user on KYC decision
 * 9.  cleanupOldNotifications      — Cron daily 2AM: delete 30-day-old notifs
 * 10. validateWithdrawal           — HTTPS callable: server-side validation
 */

import * as functions from "firebase-functions";
import * as admin      from "firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

const MIN_WITHDRAWAL_INR   = 100;
const WITHDRAWAL_DELAY_MS  = 10 * 60 * 1000; // 10 minutes

// ── Helper: in-app notification ───────────────────────────────────────────────
async function notifyUser(uid: string, title: string, body: string, type: string) {
  await db.collection("notifications").doc(uid).collection("items").add({
    title, body, type, read: false, createdAt: FieldValue.serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WITHDRAWAL AUTO-PROCESSOR — every 1 minute
// ─────────────────────────────────────────────────────────────────────────────
export const processScheduledWithdrawals = functions
  .region("asia-south1")
  .pubsub.schedule("every 1 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async (_ctx) => {
    const now  = Timestamp.now();
    const snap = await db.collection("withdrawals")
      .where("status", "==", "scheduled")
      .where("processAt", "<=", now)
      .limit(50).get();

    if (snap.empty) return null;

    functions.logger.info(`[WithdrawalProcessor] Processing ${snap.size} withdrawal(s)`);

    const batch = db.batch();
    const notifs: Promise<void>[] = [];

    snap.docs.forEach(doc => {
      const w = doc.data();
      batch.update(doc.ref, {
        status: "completed",
        processedAt: FieldValue.serverTimestamp(),
        updatedAt:   FieldValue.serverTimestamp(),
        admin_note:  "Auto-processed by Cloud Function",
      });
      // Release hasPendingWithdrawal lock on user document
      const userRef = db.collection("users").doc(w.uid);
      batch.update(userRef, { hasPendingWithdrawal: false, updatedAt: FieldValue.serverTimestamp() });
      notifs.push(notifyUser(
        w.uid,
        `💸 ₹${w.amount_inr} aapke UPI pe bheja gaya!`,
        `Withdrawal ₹${w.amount_inr} → ${w.upi_id} successfully processed.`,
        "balance_adjusted"
      ));
    });

    await batch.commit();
    await Promise.allSettled(notifs);
    functions.logger.info(`[WithdrawalProcessor] ✅ ${snap.size} withdrawal(s) completed`);
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 2. ON WITHDRAWAL CREATED
// ─────────────────────────────────────────────────────────────────────────────
export const onWithdrawalCreated = functions
  .region("asia-south1")
  .firestore.document("withdrawals/{wId}")
  .onCreate(async (snap, ctx) => {
    const w = snap.data();
    if (!w.processAt) {
      await snap.ref.update({
        processAt: Timestamp.fromMillis(Date.now() + WITHDRAWAL_DELAY_MS),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await notifyUser(
      w.uid,
      `⏳ Withdrawal ₹${w.amount_inr} scheduled`,
      `10 minutes mein ${w.upi_id} pe ₹${w.amount_inr} process hoga.`,
      "balance_adjusted"
    );
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 3. ON DEPOSIT STATUS CHANGE — credit EC when admin approves
// ─────────────────────────────────────────────────────────────────────────────
export const onDepositStatusChange = functions
  .region("asia-south1")
  .firestore.document("deposits/{depId}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status !== "pending" || after.status !== "approved") return null;

    const userRef = db.collection("users").doc(after.uid);
    await db.runTransaction(async tx => {
      const uSnap = await tx.get(userRef);
      if (!uSnap.exists) throw new Error("User not found");
      const u = uSnap.data()!;
      tx.update(userRef, {
        elite_coins_balance: u.elite_coins_balance + after.ec_amount,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await db.collection("transactions").add({
      userId:    after.uid,
      delta:     after.ec_amount,
      reason:    `Deposit ₹${after.amount_inr} approved (UTR: ${after.utr_number})`,
      type:      "deposit",
      createdAt: FieldValue.serverTimestamp(),
    });

    await notifyUser(
      after.uid,
      `✅ Deposit ₹${after.amount_inr} approved!`,
      `${after.ec_amount} EliteCoins aapke wallet mein credit ho gaye.`,
      "balance_adjusted"
    );
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 4. ON NEW USER REGISTERED
// ─────────────────────────────────────────────────────────────────────────────
export const onUserRegistered = functions
  .region("asia-south1")
  .auth.user().onCreate(async user => {
    await new Promise(r => setTimeout(r, 3000)); // wait for Firestore doc
    await notifyUser(
      user.uid,
      "🎮 EliteArena mein welcome!",
      "Tournaments join karo, ads dekho EC kamao, prizes jeeto. Good luck champion!",
      "system"
    );
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 5. ON TOURNAMENT FULL
// ─────────────────────────────────────────────────────────────────────────────
export const onTournamentFull = functions
  .region("asia-south1")
  .firestore.document("tournaments/{tid}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    const justFilled = before.slots_filled < before.slots_total && after.slots_filled >= after.slots_total;
    if (!justFilled) return null;

    const regs = await db.collection("tournaments").doc(ctx.params.tid)
      .collection("registrations").limit(200).get();

    await Promise.allSettled(regs.docs.map(d => notifyUser(
      d.id,
      `⚔️ ${after.game_name} — Tournament Full!`,
      "Sabhi slots bhar gaye. Match jald start hoga. Room ID tab milega jab Admin LIVE mark kare.",
      "tournament_full"
    )));
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 6. ON TOURNAMENT GOES LIVE
// ─────────────────────────────────────────────────────────────────────────────
export const onTournamentGoesLive = functions
  .region("asia-south1")
  .firestore.document("tournaments/{tid}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status === after.status || after.status !== "live") return null;

    const regs = await db.collection("tournaments").doc(ctx.params.tid)
      .collection("registrations").limit(200).get();

    await Promise.allSettled(regs.docs.map(d => notifyUser(
      d.id,
      `🔴 ${after.game_name} LIVE ho gaya!`,
      "Tournament shuru! Match Room mein jaao — Room ID aur Password milega. Abhi khelo!",
      "tournament_live"
    )));
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 7. ON PRIZE CREDITED — audit log
// ─────────────────────────────────────────────────────────────────────────────
export const onPrizeCredited = functions
  .region("asia-south1")
  .firestore.document("tournaments/{tid}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.winner_uid || !after.winner_uid) return null;

    await db.collection("transactions").add({
      userId:    after.winner_uid,
      delta:     after.prize_pool,
      reason:    `Prize won — ${after.game_name} tournament`,
      type:      "prize",
      createdAt: FieldValue.serverTimestamp(),
    });
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 8. ON KYC STATUS CHANGE — notify user
// ─────────────────────────────────────────────────────────────────────────────
export const onKYCStatusChange = functions
  .region("asia-south1")
  .firestore.document("users/{uid}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.kycStatus === after.kycStatus) return null;

    const uid = ctx.params.uid;

    if (after.kycStatus === "approved") {
      await notifyUser(uid,
        "✅ KYC Approved! Ab aap withdraw kar sakte ho.",
        "Aapki KYC successfully verified ho gayi. Wallet mein jaao aur withdraw karo.",
        "system"
      );
    } else if (after.kycStatus === "rejected") {
      await notifyUser(uid,
        "❌ KYC Rejected",
        `Reason: ${after.kycRejectReason || "Details verify nahi ho payi."}. Profile mein jaao aur dobara submit karo.`,
        "system"
      );
    }
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 9. DAILY CLEANUP — 2 AM IST
// ─────────────────────────────────────────────────────────────────────────────
export const cleanupOldNotifications = functions
  .region("asia-south1")
  .pubsub.schedule("0 2 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userDocs = await db.collection("notifications").listDocuments();
    let deleted = 0;
    for (const userDoc of userDocs) {
      const old = await userDoc.collection("items")
        .where("createdAt", "<", cutoff).where("read", "==", true).limit(100).get();
      if (old.empty) continue;
      const batch = db.batch();
      old.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      deleted += old.size;
    }
    functions.logger.info(`[Cleanup] Deleted ${deleted} old notifications`);
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 10. VALIDATE WITHDRAWAL — HTTPS callable
// ─────────────────────────────────────────────────────────────────────────────
export const validateWithdrawal = functions
  .region("asia-south1")
  .https.onCall(async (data, ctx) => {
    if (!ctx.auth) throw new functions.https.HttpsError("unauthenticated", "Login karo pehle.");

    const uid      = ctx.auth.uid;
    const ecAmount = Number(data.ecAmount);
    const upiId    = String(data.upiId || "").trim();

    if (!/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId))
      return { valid: false, reason: "Invalid UPI ID format (e.g. name@upi)" };
    if (!ecAmount || ecAmount < MIN_WITHDRAWAL_INR)
      return { valid: false, reason: `Minimum ${MIN_WITHDRAWAL_INR} EC required.` };

    const uSnap = await db.collection("users").doc(uid).get();
    if (!uSnap.exists) return { valid: false, reason: "User profile nahi mila." };

    const u = uSnap.data()!;
    if (u.elite_coins_balance < ecAmount)
      return { valid: false, reason: `Balance insufficient. Aapke paas ${u.elite_coins_balance} EC hai.` };

    // KYC check
    if (u.kycStatus !== "approved")
      return { valid: false, reason: "Withdrawal ke liye KYC approval zaroori hai. Profile mein KYC complete karo." };

    const pending = await db.collection("withdrawals")
      .where("uid", "==", uid)
      .where("status", "in", ["scheduled", "processing"])
      .limit(1).get();
    if (!pending.empty)
      return { valid: false, reason: "Ek withdrawal already pending hai. Complete hone ka wait karo." };

    return { valid: true };
  });
