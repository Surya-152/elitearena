// src/hooks/useLeaderboard.js
import { useEffect, useState } from 'react';
import { subscribeLeaderboard } from '../services/leaderboardService';

export function useLeaderboard(topN = 50) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeLeaderboard(
      (data) => { setPlayers(data); setLoading(false); setError(null); },
      (err)  => { setError(err.message); setLoading(false); },
      topN
    );
    return unsub;
  }, [topN]);

  return { players, loading, error };
}
