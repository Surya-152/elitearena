// src/pages/Login.jsx — PREMIUM ESPORTS AUTH PAGE
import { useState }    from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader }       from 'lucide-react';
import { loginUser, loginWithGoogle }     from '../services/authService';
import { useSEO, SEO_PAGES }             from '../hooks/useSEO';
import toast                             from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/dashboard';
  useSEO(SEO_PAGES.login);

  const [form,    setForm]    = useState({ email:'', password:'' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoad,   setGLoad]   = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email daalo.';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters.';
    return e;
  };

  const change = ({ target: { name, value } }) => {
    setForm(p => ({...p,[name]:value})); setErrors(p => ({...p,[name]:undefined}));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await loginUser(form.email, form.password);
      if (!user.emailVerified && user.providerData?.[0]?.providerId !== 'google.com') {
        toast.error('Pehle email verify karo!', { duration:5000 });
        navigate('/verify-email'); return;
      }
      toast.success('Welcome back, Champion! 🎮');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = ['auth/invalid-credential','auth/wrong-password'].includes(err.code)
        ? 'Email ya password galat hai.' : err.message;
      toast.error(msg);
      setErrors({ password: msg });
    } finally { setLoading(false); }
  };

  const googleLogin = async () => {
    setGLoad(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome! 🎮');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error(err.message);
    } finally { setGLoad(false); }
  };

  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4 py-24 relative overflow-hidden">

      {/* Bg effects */}
      <div className="absolute inset-0 bg-cyber-grid opacity-15" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
           style={{ background: 'radial-gradient(#00f5ff, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
           style={{ background: 'radial-gradient(#ff0080, transparent)' }} />

      <div className="relative w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
                          bg-gradient-to-br from-ea-cyan to-ea-magenta shadow-cyan-lg">
            <Zap className="w-8 h-8 text-ea-void" fill="currentColor" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Elite<span className="grad-cyan">Arena</span>
          </h1>
          <p className="font-body text-sm text-ea-muted mt-1">Apne account mein sign in karo</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <div className="h-px bg-gradient-to-r from-ea-cyan/40 via-ea-magenta/40 to-ea-cyan/40" />
          <div className="p-8">

            {/* Google */}
            <button onClick={googleLogin} disabled={gLoad}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                         bg-white hover:bg-gray-100 text-gray-800 font-body font-semibold text-sm
                         transition-all active:scale-97 disabled:opacity-60 mb-6">
              {gLoad ? <Loader className="w-5 h-5 animate-spin text-gray-500" /> :
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
              {gLoad ? 'Connecting…' : 'Google se Login karo'}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-ea-border" />
              <span className="font-mono text-xs text-ea-muted">ya email se</span>
              <div className="flex-1 h-px bg-ea-border" />
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Email</label>
                <input type="email" name="email" autoComplete="email"
                  value={form.email} onChange={change} placeholder="aapka@email.com"
                  className={`input-cyber ${errors.email ? 'input-error' : ''}`} />
                {errors.email && <p className="font-mono text-[11px] text-ea-magenta mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-body text-sm font-medium text-ea-text">Password</label>
                  <Link to="/forgot-password" className="font-mono text-xs text-ea-cyan hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input type={show?'text':'password'} name="password" autoComplete="current-password"
                    value={form.password} onChange={change} placeholder="••••••••"
                    className={`input-cyber pr-12 ${errors.password?'input-error':''}`} />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ea-muted hover:text-ea-text transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="font-mono text-[11px] text-ea-magenta mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-neon-cyan w-full py-3 rounded-xl flex items-center justify-center gap-2">
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in…' : '⚡ Sign In'}
              </button>
            </form>

            <p className="font-body text-center text-sm text-ea-muted mt-6">
              Account nahi hai?{' '}
              <Link to="/register" className="text-ea-cyan hover:underline font-medium">Create karo →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
