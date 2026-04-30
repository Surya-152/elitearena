// src/context/AuthContext.jsx — memoised context value prevents unnecessary re-renders
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged }                from 'firebase/auth';
import { doc, onSnapshot }                   from 'firebase/firestore';
import { auth, db, ADMIN_UID }               from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [userProfile,  setUserProfile]  = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) { setUserProfile(null); setProfileError(null); }
    });
    return unsub;
  }, []);

  // Real-time Firestore profile — only when logged in
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setUserProfile({ id: snap.id, ...snap.data() });
          setProfileError(null);
        } else {
          setProfileError('Profile document missing.');
        }
      },
      (err) => {
        console.error('[AuthContext]', err);
        setProfileError(err.message);
      }
    );
    return unsub;
  }, [firebaseUser]);

  // Memoised value — prevents every consumer from re-rendering on unrelated changes
  const value = useMemo(() => ({
    firebaseUser,
    userProfile,
    profileError,
    isAdmin:   firebaseUser?.uid === ADMIN_UID || userProfile?.role === 'admin',
    isLoggedIn: !!firebaseUser,
    loading:    firebaseUser === undefined,
  }), [firebaseUser, userProfile, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
