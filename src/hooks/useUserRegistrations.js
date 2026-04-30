// src/hooks/useUserRegistrations.js
// ─────────────────────────────────────────────────────────────────────────────
// BUG FIX #8: Removed tournamentIds.join(',') from dependency array.
//             That caused infinite re-renders because:
//               1. Parent passes a new [] reference each render
//               2. join('') changes reference → effect re-runs
//               3. Effect triggers state update → parent re-renders → repeat
//
//             FIX: Hook now reads from /user_registrations/{uid}/tournaments
//             (a single O(1) query) rather than checking each tournament ID.
//             Uses onSnapshot for real-time updates.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }    from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db }                     from '../config/firebase';

export function useUserRegistrations(uid) {
  const [joinedIds, setJoinedIds] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!uid) {
      setJoinedIds([]);
      setLoading(false);
      return;
    }

    // Real-time listener on the user's personal registration collection
    // This is O(1) — no scanning all tournaments
    const unsubscribe = onSnapshot(
      collection(db, 'user_registrations', uid, 'tournaments'),
      (snap) => {
        setJoinedIds(snap.docs.map((d) => d.id));
        setLoading(false);
      },
      (err) => {
        console.error('[useUserRegistrations]', err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]); // ← FIX: only uid in deps, not tournamentIds array

  return { joinedIds, loading };
}
