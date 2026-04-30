// src/pages/Register.jsx — with Terms checkbox + username uniqueness
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader, User } from 'lucide-react';
import { registerUser, loginWithGoogle }    from '../services/authService';
import { processReferral }                  from '../services/referralService';
import { useSEO, SEO_PAGES }            from '../hooks/useSEO';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const refUID         = searchParams.get('ref') || '';
  useSEO(SEO_PAGES.register);
  const [form,    setForm]    = useState({ email: '', username: '', password: '', confirm: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading,setGLoad]   = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email daalo.';
    if (!form.username.trim())            e.username = 'Username required.';
    else if (form.username.trim().length < 3)  e.username = 'Min 3 characters.';
    else if (form.username.trim().length > 20) e.username = 'Max 20 characters.';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers, underscore.';
    if (!form.password)                   e.password = 'Password required.';
    else if (form.password.length < 6)    e.password = 'Min 6 characters.';
    else if (!/[0-9]/.test(form.password))e.password = 'Ek number zaroori hai.';
    if (form.password !== form.confirm)   e.confirm  = 'Passwords match nahi ho rahe.';
    if (!agreed)                          e.terms    = 'Terms & Privacy accept karo.';
    return e;
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await registerUser(form.email, form.password, form.username);
      toast.success('Account bana gaya! Email check karo verify karne ke liye. 📧', { duration: 6000 });
      // Process referral bonus if ref param present
      if (refUID) { processReferral(user.uid, refUID).catch(() => {}); }
      navigate('/verify-email');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Yeh email already registered hai.'
        : err.message;
      toast.error(msg);
      if (err.code === 'auth/email-already-in-use') setErrors({ email: msg });
      else setErrors({ username: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!agreed) { setErrors({ terms: 'Terms & Privacy accept karo.' }); return; }
    setGLoad(true);
    try {
      await loginWithGoogle();
      toast.success('Google se account ban gaya! 🎮');
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error(err.message);
    } finally {
      setGLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-ea-magenta/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br
                          from-ea-magenta to-ea-cyan rounded-2xl shadow-magenta mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">
            Arena <span className="text-ea-magenta">Join Karo</span>
          </h1>
          <p className="text-ea-muted text-sm mt-1 font-body">Free account banao</p>
        </div>

        <div className="bg-ea-card border border-ea-border rounded-2xl p-8 shadow-card">

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-800
                       font-body font-semibold text-sm rounded-xl hover:bg-gray-100 transition-all
                       active:scale-95 disabled:opacity-60 mb-5">
            {gLoading
              ? <Loader className="w-5 h-5 animate-spin text-gray-500" />
              : <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            }
            {gLoading ? 'Connecting…' : 'Google se Register karo'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ea-border" />
            <span className="text-ea-muted text-xs font-mono">ya email se</span>
            <div className="flex-1 h-px bg-ea-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { label:'Email',     name:'email',    type:'email',    ph:'aapka@email.com',    ac:'email'        },
              { label:'Username',  name:'username', type:'text',     ph:'ProGamer_X',          ac:'username'     },
              { label:'Password',  name:'password', type:'password', ph:'••••••••',             ac:'new-password', toggle: true },
              { label:'Confirm',   name:'confirm',  type:'password', ph:'••••••••',             ac:'new-password' },
            ].map(({ label, name, type, ph, ac, toggle }) => (
              <div key={name}>
                <label className="block text-ea-text text-sm font-medium mb-1.5">{label}</label>
                <div className="relative">
                  <input type={toggle && show ? 'text' : type} name={name} autoComplete={ac}
                    value={form[name]} onChange={handleChange} placeholder={ph}
                    className={`w-full bg-ea-deep border ${errors[name] ? 'border-ea-magenta' : 'border-ea-border'}
                                text-white rounded-xl px-4 py-3 ${toggle ? 'pr-12' : ''} text-sm font-body
                                focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted`} />
                  {toggle && (
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ea-muted hover:text-white transition-colors">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[name] && <p className="text-ea-magenta text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(p => ({...p, terms: undefined})); }}
                  className="mt-1 w-4 h-4 accent-cyan-400 cursor-pointer" />
                <span className="text-ea-muted text-xs font-body leading-relaxed group-hover:text-ea-text transition-colors">
                  Main{' '}
                  <Link to="/terms" target="_blank" className="text-ea-cyan hover:underline">Terms of Service</Link>
                  {' '}aur{' '}
                  <Link to="/privacy" target="_blank" className="text-ea-cyan hover:underline">Privacy Policy</Link>
                  {' '}se agree karta/karti hoon. Meri age 18+ hai.
                </span>
              </label>
              {errors.terms && <p className="text-ea-magenta text-xs mt-1">{errors.terms}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-ea-magenta text-white font-display font-bold text-sm rounded-xl
                         shadow-magenta hover:bg-pink-400 transition-all active:scale-95
                         disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? 'Account ban raha hai…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-ea-muted text-sm mt-6 font-body">
            Already account hai?{' '}
            <Link to="/login" className="text-ea-cyan hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
