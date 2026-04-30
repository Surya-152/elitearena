// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { Mail, Zap, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { sendPasswordReset }       from '../services/authService';
import { useSEO }                   from '../hooks/useSEO';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  useSEO({ title:'Password Reset', description:'Apna EliteArena account password reset karo.' });
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const validate = () => {
    if (!email.trim()) return 'Email required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email daalo.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success('Reset link bheja gaya! Email check karo.');
    } catch (e) {
      const msg = e.code === 'auth/user-not-found'
        ? 'Is email pe koi account nahi hai.'
        : e.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-ea-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br
                          from-ea-cyan to-ea-magenta rounded-2xl shadow-cyan mb-4">
            <Zap className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">Password Reset</h1>
          <p className="text-ea-muted text-sm mt-1 font-body">
            Apna email daalo — link bhejenge
          </p>
        </div>

        <div className="bg-ea-card border border-ea-border rounded-2xl p-8 shadow-card">

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-ea-text text-sm font-medium mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-muted" />
                  <input
                    type="email" value={email} autoComplete="email"
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="aapka@email.com"
                    className={`w-full bg-ea-deep border ${error ? 'border-ea-magenta' : 'border-ea-border'}
                                text-white rounded-xl pl-10 pr-4 py-3 text-sm font-body
                                focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted`}
                  />
                </div>
                {error && <p className="text-ea-magenta text-xs mt-1">{error}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-ea-cyan text-ea-void font-display font-bold text-sm
                           rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                           active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? 'Bhej rahe hain…' : 'Reset Link Bhejo'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 animate-slide-up">
              <div className="w-16 h-16 bg-ea-green/20 border border-ea-green/40 rounded-full
                              flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-ea-green" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Email Bheja Gaya!</h3>
              <p className="text-ea-muted text-sm font-body mb-1">
                <span className="text-white">{email}</span> pe reset link bheja gaya hai.
              </p>
              <p className="text-ea-muted text-xs mt-3">
                Email na aaye toh Spam folder check karo.
              </p>
              <button onClick={() => { setSent(false); setEmail(''); }}
                className="mt-5 text-ea-cyan text-sm hover:underline font-mono">
                Dobara try karo
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-ea-border text-center">
            <Link to="/login"
              className="flex items-center justify-center gap-1.5 text-ea-muted text-sm
                         hover:text-white transition-colors group font-body">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Login pe wapas jao
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
