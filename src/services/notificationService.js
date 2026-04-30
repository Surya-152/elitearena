// src/services/notificationService.js
// Admin utility to push notifications to user inboxes.
// Client-side (used in admin panel). Prod should move this to Cloud Functions.

import {
  collection, addDoc, serverTimestamp, getDocs, query, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Notification types
export const NOTIF_TYPES = {
  PRIZE_CREDITED:   'prize_credited',
  TOURNAMENT_LIVE:  'tournament_live',
  TOURNAMENT_FULL:  'tournament_full',
  BALANCE_ADJUSTED: 'balance_adjusted',
  SYSTEM:           'system',
};

/**
 * Push a notification to a single user's inbox.
 * @param {string} uid        — target user UID
 * @param {object} payload    — { title, body, type }
 */
export async function notifyUser(uid, { title, body, type = NOTIF_TYPES.SYSTEM }) {
  if (!uid || !title) throw new Error('uid and title are required.');
  await addDoc(collection(db, 'notifications', uid, 'items'), {
    title,
    body:      body || '',
    type,
    read:      false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Broadcast a notification to all registered users of a tournament.
 * Reads the tournament's registrations sub-collection and fans out.
 */
export async function broadcastToTournament(tournamentId, payload) {
  const regsSnap = await getDocs(
    query(collection(db, 'tournaments', tournamentId, 'registrations'), limit(200))
  );

  const promises = regsSnap.docs.map(d => notifyUser(d.id, payload));
  const results  = await Promise.allSettled(promises);
  const failed   = results.filter(r => r.status === 'rejected').length;

  if (failed > 0) {
    console.warn(`[notificationService] ${failed} notifications failed to send.`);
  }
  return { sent: results.length - failed, failed };
}
