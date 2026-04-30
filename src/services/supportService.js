// src/services/supportService.js
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const TICKET_CATEGORIES = {
  DEPOSIT:    'deposit',
  WITHDRAWAL: 'withdrawal',
  TOURNAMENT: 'tournament',
  ACCOUNT:    'account',
  OTHER:      'other',
};

export const TICKET_STATUS = {
  OPEN:       'open',
  IN_REVIEW:  'in_review',
  RESOLVED:   'resolved',
  CLOSED:     'closed',
};

// User creates a ticket
export async function createTicket(uid, username, { category, subject, description }) {
  if (!subject?.trim())      throw new Error('Subject daalo.');
  if (!description?.trim())  throw new Error('Problem describe karo.');

  const ref = await addDoc(collection(db, 'support_tickets'), {
    uid,
    username,
    category:    category || TICKET_CATEGORIES.OTHER,
    subject:     subject.trim(),
    description: description.trim(),
    status:      TICKET_STATUS.OPEN,
    adminReply:  '',
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return ref.id;
}

// Real-time user tickets
export function subscribeUserTickets(uid, callback, onError) {
  const q = query(
    collection(db, 'support_tickets'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

// Admin: all open tickets
export function subscribeAllTickets(callback, onError) {
  const q = query(
    collection(db, 'support_tickets'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

// Admin: reply + update status
export async function replyToTicket(ticketId, reply, status = TICKET_STATUS.RESOLVED) {
  await updateDoc(doc(db, 'support_tickets', ticketId), {
    adminReply: reply.trim(),
    status,
    updatedAt:  serverTimestamp(),
  });
}
