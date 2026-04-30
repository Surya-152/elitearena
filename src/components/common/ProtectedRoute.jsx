// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth }               from '../../context/AuthContext';
import { Zap }                   from 'lucide-react';

function Spinner({ color = 'ea-cyan' }) {
  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className={`absolute inset-0 rounded-full border-2 border-${color}/20`} />
          <div className={`absolute inset-0 rounded-full border-2 border-t-${color} border-transparent animate-spin`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className={`w-4 h-4 text-${color}`} />
          </div>
        </div>
        <p className="font-mono text-xs text-ea-muted animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isLoggedIn, firebaseUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (firebaseUser && !firebaseUser.emailVerified &&
      firebaseUser.providerData?.[0]?.providerId !== 'google.com') {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { isAdmin, isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner color="ea-magenta" />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
