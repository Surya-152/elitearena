// src/pages/VerifyEmail.jsx
// Shown after registration — prompts user to check email
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, Zap, LogOut } from 'lucide-react';
import { resendVerificationEmail, logoutUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const { firebaseUser }    = useAuth();
  const navigate            = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking,  setChecking]  = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email dobara bheja gaya!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setResending(false);
    }
  };

  // Reload Auth user to check if email is now verified
  const handleCheckVerified = async () => {
    setChecking(true);
    try {
      await firebaseUser.reload();
      if (firebaseUser.emailVerified) {
        toast.success('Email verified! Welcome to the Arena! 🎮');
        navigate('/dashboard');
      } else {
        toast.error('Email abhi verified nahi hai. Link pe click karo email mein.');
      }
    } catch (e) {
      toast.error('Check failed. Dobara try karo.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-ea-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-ea-card border border-ea-cyan/25 rounded-2xl p-8 shadow-cyan text-center">

          {/* Icon */}
          <div className="w-20 h-20 bg-ea-cyan/15 border border-ea-cyan/30 rounded-full
                          flex items-center justify-center mx-auto mb-5">
            <Mail className="w-10 h-10 text-ea-cyan" />
          </div>

          <h1 className="font-display font-black text-2xl text-white mb-2">
            Email Verify Karo
          </h1>
          <p className="text-ea-muted text-sm font-body mb-1">
            Verification link bheja gaya hai:
          </p>
          <p className="text-ea-cyan font-mono text-sm font-bold mb-6">
            {firebaseUser?.email}
          </p>

          <div className="bg-ea-deep/60 border border-ea-border/50 rounded-xl p-4 text-left mb-6">
            <p className="text-white text-sm font-display font-bold mb-2">Steps:</p>
            <ol className="space-y-1.5 text-ea-muted text-sm font-body">
              <li className="flex gap-2"><span className="text-ea-cyan font-mono">1.</span> Apna email inbox kholo</li>
              <li className="flex gap-2"><span className="text-ea-cyan font-mono">2.</span> EliteArena ka email dhundo</li>
              <li className="flex gap-2"><span className="text-ea-cyan font-mono">3.</span> "Verify Email" link pe click karo</li>
              <li className="flex gap-2"><span className="text-ea-cyan font-mono">4.</span> Neeche "Main ne verify kar liya" click karo</li>
            </ol>
            <p className="text-ea-muted text-xs mt-3">Spam/Junk folder bhi check karo.</p>
          </div>

          <div className="space-y-3">
            <button onClick={handleCheckVerified} disabled={checking}
              className="w-full py-3 bg-ea-cyan text-ea-void font-display font-bold text-sm
                         rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                         active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
              {checking && <RefreshCw className="w-4 h-4 animate-spin" />}
              {checking ? 'Check kar rahe hain…' : '✓ Main ne Verify Kar Liya'}
            </button>

            <button onClick={handleResend} disabled={resending}
              className="w-full py-2.5 bg-ea-card border border-ea-border text-ea-text
                         font-body font-medium text-sm rounded-xl hover:bg-ea-deep transition-all
                         flex items-center justify-center gap-2">
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {resending ? 'Bhej rahe hain…' : 'Email Dobara Bhejo'}
            </button>

            <button onClick={handleLogout}
              className="w-full py-2 text-ea-muted hover:text-ea-magenta text-sm font-body
                         transition-colors flex items-center justify-center gap-1.5">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
