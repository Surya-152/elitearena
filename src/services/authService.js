// src/services/authService.js
// SECURITY FIXES:
//   - Generic error messages (no account enumeration)
//   - Username uniqueness enforced
//   - Email verification on register
//   - Google OAuth support
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, sendEmailVerification,
  sendPasswordResetEmail, EmailAuthProvider,
  reauthenticateWithCredential, updatePassword,
  GoogleAuthProvider, signInWithPopup,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
  query, collection, where, getDocs, limit,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerUser(email, password, username) {
  // Username uniqueness check before creating Auth user (saves rollback)
  // ✅ NAYA - /usernames collection check karta hai (public read allowed)
const usernameRef = doc(db, 'usernames', username.trim().toLowerCase());
const usernameSnap = await getDoc(usernameRef);
if (usernameSnap.exists()) throw new Error('Username already taken. Choose another.');

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = cred;
  await updateProfile(user, { displayName: username.trim() });

  // Send email verification
  await sendEmailVerification(user, { url: `${window.location.origin}/login?verified=true` });

  await setDoc(doc(db, 'users', user.uid), {
    uid:                 user.uid,
    email:               email.toLowerCase().trim(),
    username:            username.trim(),
    elite_coins_balance: 0,
    matches_played:      0,
    total_winnings:      0,
    role:                'user',
    emailVerified:       false,
    kycStatus:           'pending',
    kycData:             null,
    phone:               null,
    createdAt:           serverTimestamp(),
    updatedAt:           serverTimestamp(),
  });
  await setDoc(doc(db, 'usernames', username.trim().toLowerCase()), {
    uid: user.uid,
    createdAt: serverTimestamp(),
  });
  return user;
}

// ── Login — SECURITY: generic message, no account enumeration ─────────────────
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err) {
    // SECURITY: Never reveal whether email exists or not
    const genericMsg = 'Email ya password galat hai.';
    if (['auth/user-not-found','auth/wrong-password','auth/invalid-credential',
         'auth/invalid-email','auth/user-disabled'].includes(err.code)) {
      throw new Error(genericMsg);
    }
    throw err;
  }
}

// ── Google Sign-In ─────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const { user } = cred;

  // Create profile if first sign-in
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) {
    const raw      = user.displayName?.replace(/\s+/g, '_') || `player_${user.uid.slice(0,6)}`;
    const username = raw.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || `player_${user.uid.slice(0,6)}`;
    await setDoc(doc(db, 'users', user.uid), {
      uid:                 user.uid,
      email:               user.email,
      username,
      elite_coins_balance: 0,
      matches_played:      0,
      total_winnings:      0,
      role:                'user',
      emailVerified:       true,
      kycStatus:           'pending',
      kycData:             null,
      phone:               user.phoneNumber || null,
      createdAt:           serverTimestamp(),
      updatedAt:           serverTimestamp(),
    });
  }
  return user;
}

// ── Password reset — SECURITY: same response whether email exists or not ───────
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim(), {
      url: `${window.location.origin}/login?reset=true`,
    });
  } catch (err) {
    // SECURITY: Silently ignore user-not-found — attacker can't enumerate emails
    if (err.code === 'auth/user-not-found') return;
    throw err;
  }
}

// ── Change password ────────────────────────────────────────────────────────────
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in.');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ── Resend verification ────────────────────────────────────────────────────────
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in.');
  if (user.emailVerified) throw new Error('Email already verified!');
  await sendEmailVerification(user, { url: `${window.location.origin}/login?verified=true` });
}

// ── Update username ────────────────────────────────────────────────────────────
export async function updateUsername(uid, newUsername) {
  const trimmed = newUsername.trim();
  const check = await getDocs(
    query(collection(db, 'users'), where('username', '==', trimmed), limit(1))
  );
  if (check.docs.find(d => d.id !== uid)) throw new Error('Username already taken.');
  await updateDoc(doc(db, 'users', uid), { username: trimmed, updatedAt: serverTimestamp() });
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: trimmed });
}

// ── Sign out ───────────────────────────────────────────────────────────────────
export async function logoutUser() { await signOut(auth); }

// ── Fetch profile ──────────────────────────────────────────────────────────────
export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw new Error('Profile not found.');
  return { id: snap.id, ...snap.data() };
}


// ── Update game UIDs (BGMI, Free Fire, COD) ──────────────────────────────────
export async function updateGameUID(uid, gameUids) {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  await updateDoc(doc(db, 'users', uid), {
    game_uids: gameUids,
    updatedAt: serverTimestamp(),
  });
}
