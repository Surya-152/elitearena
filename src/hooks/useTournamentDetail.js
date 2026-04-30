// src/hooks/useTournamentDetail.js
// Real-time listener for a single tournament + its registration list
import { useState, useEffect }    from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db }                     from '../config/firebase';

export function useTournamentDetail(tournamentId) {
  const [tournament,     setTournament]     = useState(null);
  const [registrations,  setRegistrations]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  // Real-time tournament doc
  useEffect(() => {
    if (!tournamentId) return;
    setLoading(true);

    const unsubT = onSnapshot(
      doc(db, 'tournaments', tournamentId),
      (snap) => {
        if (snap.exists()) {
          setTournament({ id: snap.id, ...snap.data() });
          setError(null);
        } else {
          setError('Tournament not found.');
        }
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );

    return unsubT;
  }, [tournamentId]);

  // Real-time registrations sub-collection (shows live player count)
  useEffect(() => {
    if (!tournamentId) return;

    const unsubR = onSnapshot(
      collection(db, 'tournaments', tournamentId, 'registrations'),
      (snap) => {
        setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      () => {} // soft fail — registrations are non-critical
    );

    return unsubR;
  }, [tournamentId]);

  return { tournament, registrations, loading, error };
}
