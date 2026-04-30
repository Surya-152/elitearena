// src/services/leaderboardService.js
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Real-time top-N leaderboard by total_winnings ────────────────────────────
export function subscribeLeaderboard(callback, onError, topN = 50) {
  const q = query(
    collection(db, 'users'),
    orderBy('total_winnings', 'desc'),
    limit(topN)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() }))),
    onError
  );
}

// ── One-time fetch for static contexts ───────────────────────────────────────
export async function fetchLeaderboard(topN = 50) {
  const q = query(
    collection(db, 'users'),
    orderBy('total_winnings', 'desc'),
    limit(topN)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() }));
}
