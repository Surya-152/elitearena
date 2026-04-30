// src/hooks/useMatchHistory.js
// Real-time listener for tournaments a user has joined
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useMatchHistory(uid, max = 20) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, 'user_registrations', uid, 'tournaments'),
      orderBy('joinedAt', 'desc'),
      limit(max)
    );

    const unsub = onSnapshot(
      q,
      snap => {
        setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => { console.error('[useMatchHistory]', err); setLoading(false); }
    );

    return unsub;
  }, [uid, max]);

  return { matches, loading };
}
