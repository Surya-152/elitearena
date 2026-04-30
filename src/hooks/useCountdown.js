// src/hooks/useCountdown.js
// Returns a live countdown string to a target date.
// Updates every second. Automatically stops when time is up.

import { useState, useEffect } from 'react';

export function useCountdown(targetDate) {
  const getRemaining = () => {
    if (!targetDate) return null;
    const target = targetDate instanceof Date ? targetDate : targetDate.toDate?.() ?? new Date(targetDate);
    const diff = target - Date.now();
    if (diff <= 0) return null;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}
