// src/hooks/useNotifications.js
// Reads from /notifications/{uid}/items — admin writes alerts there,
// users see them in real time. Each doc: { title, body, type, read, createdAt }

import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, query, orderBy,
  limit, updateDoc, doc, writeBatch,
}                                             from 'firebase/firestore';
import { db }                                 from '../config/firebase';

const MAX_NOTIFS = 20;

export function useNotifications(uid) {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(MAX_NOTIFS)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single notification as read
  const markRead = useCallback(async (notifId) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, 'notifications', uid, 'items', notifId), { read: true });
    } catch (e) {
      console.warn('[useNotifications] markRead failed:', e.message);
    }
  }, [uid]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (!uid) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', uid, 'items', n.id), { read: true });
    });
    try { await batch.commit(); } catch (e) {
      console.warn('[useNotifications] markAllRead failed:', e.message);
    }
  }, [uid, notifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
