// src/hooks/useTournaments.js — memoised real-time tournament listener
import { useEffect, useState, useRef } from 'react';
import { subscribeTournaments }        from '../services/tournamentService';

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const mountedRef                    = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    const unsubscribe = subscribeTournaments(
      (data) => {
        if (!mountedRef.current) return;
        setTournaments(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (!mountedRef.current) return;
        console.error('[useTournaments]', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return { tournaments, loading, error };
}
