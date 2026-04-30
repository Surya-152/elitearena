// src/hooks/useAdRewards.js — ElitePass aware (10 or 15 per day)
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db }            from '../config/firebase';
import { isPassActive }  from '../services/elitePassService';
import { AD_LIMIT_REGULAR, AD_LIMIT_ELITEPASS } from '../services/walletService';

export function useAdRewards(uid, userProfile) {
  const [claimedToday, setClaimedToday] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const dailyLimit = useMemo(
    () => isPassActive(userProfile) ? AD_LIMIT_ELITEPASS : AD_LIMIT_REGULAR,
    [userProfile?.elitePassActive, userProfile?.elitePassExpiry]
  );

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'ad_rewards'),
      where('userId',    '==', uid),
      where('claimedAt', '>=', Timestamp.fromDate(today)),
      orderBy('claimedAt', 'desc'),
      limit(dailyLimit)
    );

    const unsub = onSnapshot(q,
      snap => { setClaimedToday(snap.size); setLoading(false); },
      ()    => { setLoading(false); }
    );
    return unsub;
  }, [uid, dailyLimit]);

  return {
    claimedToday,
    dailyLimit,
    remaining:    Math.max(0, dailyLimit - claimedToday),
    limitReached: claimedToday >= dailyLimit,
    hasElitePass: isPassActive(userProfile),
    loading,
  };
}
