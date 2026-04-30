// src/hooks/usePlatformStats.js
// Fetches REAL live stats from Firestore for Home page
import { useState, useEffect } from 'react';
import {
  collection, getDocs, query,
  where, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Cache for 5 minutes so we don't hammer Firestore on every home page visit
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export function usePlatformStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use cache if fresh
    if (_cache && Date.now() - _cacheTime < CACHE_MS) {
      setStats(_cache);
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const [userSnap, tourneySnap, liveSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'tournaments')),
          getCountFromServer(query(
            collection(db, 'tournaments'),
            where('status', '==', 'live')
          )),
        ]);

        // Get total prize pool from upcoming+live tournaments
        const activeTourneys = await getDocs(query(
          collection(db, 'tournaments'),
          where('status', 'in', ['upcoming', 'live'])
        ));
        const totalPrize = activeTourneys.docs.reduce(
          (sum, d) => sum + (d.data().prize_pool || 0), 0
        );

        const result = {
          totalUsers:    userSnap.data().count     || 0,
          totalTourneys: tourneySnap.data().count  || 0,
          liveTourneys:  liveSnap.data().count     || 0,
          totalPrizeEC:  totalPrize,
          activeTourneys:activeTourneys.size       || 0,
        };

        _cache     = result;
        _cacheTime = Date.now();
        setStats(result);
      } catch {
        // On error, set zero stats (no fake data)
        setStats({ totalUsers:0, totalTourneys:0, liveTourneys:0, totalPrizeEC:0, activeTourneys:0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
