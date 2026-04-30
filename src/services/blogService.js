// src/services/blogService.js — Blog/News management via Firestore
// Admin creates articles → users read them in real-time
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, query,
  orderBy, limit, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const BLOG_CATEGORIES = [
  { id:'bgmi',        label:'BGMI Tips',        emoji:'🎯', color:'cyan'    },
  { id:'freefire',    label:'Free Fire MAX',     emoji:'🔥', color:'magenta' },
  { id:'codmobile',   label:'COD Mobile',        emoji:'💥', color:'green'   },
  { id:'earning',     label:'Earning Guide',     emoji:'💰', color:'gold'    },
  { id:'career',      label:'Career',            emoji:'🚀', color:'purple'  },
  { id:'tournament',  label:'Tournament Guide',  emoji:'🏆', color:'cyan'    },
  { id:'news',        label:'Esports News',      emoji:'📰', color:'magenta' },
  { id:'other',       label:'Other',             emoji:'📝', color:'muted'   },
];

// ── Real-time articles listener (public) ──────────────────────────────────────
export function subscribeArticles(callback, onError) {
  const q = query(
    collection(db, 'blog_articles'),
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError || (() => {})
  );
}

// ── Fetch single article ──────────────────────────────────────────────────────
export async function fetchArticle(id) {
  const snap = await getDoc(doc(db, 'blog_articles', id));
  if (!snap.exists()) throw new Error('Article not found.');
  return { id: snap.id, ...snap.data() };
}

// ── Admin: Get all articles (including drafts) ────────────────────────────────
export function subscribeAllArticles(callback) {
  const q = query(
    collection(db, 'blog_articles'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    () => {}
  );
}

// ── Admin: Create article ─────────────────────────────────────────────────────
export async function createArticle(data) {
  if (!data.title?.trim())   throw new Error('Title required hai.');
  if (!data.content?.trim()) throw new Error('Content required hai.');
  if (!data.category)        throw new Error('Category select karo.');

  const ref = await addDoc(collection(db, 'blog_articles'), {
    title:       data.title.trim(),
    excerpt:     data.excerpt?.trim() || data.content.trim().slice(0, 150) + '…',
    content:     data.content.trim(),
    category:    data.category,
    tags:        data.tags || [],
    author:      data.author || 'EliteArena Team',
    coverEmoji:  data.coverEmoji || '📰',
    readMin:     data.readMin || Math.ceil(data.content.trim().split(' ').length / 200) || 3,
    published:   data.published !== false,
    publishedAt: serverTimestamp(),
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    views:       0,
    likes:       0,
  });
  return ref.id;
}

// ── Admin: Update article ─────────────────────────────────────────────────────
export async function updateArticle(id, data) {
  const updates = { updatedAt: serverTimestamp() };
  if (data.title   !== undefined) updates.title   = data.title.trim();
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt.trim();
  if (data.content !== undefined) {
    updates.content = data.content.trim();
    updates.readMin = Math.ceil(data.content.trim().split(' ').length / 200) || 3;
  }
  if (data.category    !== undefined) updates.category    = data.category;
  if (data.tags        !== undefined) updates.tags        = data.tags;
  if (data.author      !== undefined) updates.author      = data.author;
  if (data.coverEmoji  !== undefined) updates.coverEmoji  = data.coverEmoji;
  if (data.published   !== undefined) {
    updates.published = data.published;
    if (data.published) updates.publishedAt = serverTimestamp();
  }
  await updateDoc(doc(db, 'blog_articles', id), updates);
}

// ── Admin: Delete article ─────────────────────────────────────────────────────
export async function deleteArticle(id) {
  await deleteDoc(doc(db, 'blog_articles', id));
}

// ── Increment view count ──────────────────────────────────────────────────────
export async function incrementViews(id) {
  try {
    const snap = await getDoc(doc(db, 'blog_articles', id));
    if (snap.exists()) {
      await updateDoc(doc(db, 'blog_articles', id), {
        views: (snap.data().views || 0) + 1,
      });
    }
  } catch {} // non-critical
}
