// src/components/common/Navbar.jsx
import { useState, useEffect }     from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Trophy, User, LogOut, Shield, Wallet,
  BarChart2, HelpCircle, Zap, Crown, Star, TrendingUp, Users,
} from 'lucide-react';
import { useAuth }                  from '../../context/AuthContext';
import { logoutUser }               from '../../services/authService';
import { isPassActive }             from '../../services/elitePassService';
import NotificationBell             from './NotificationBell';
import LanguageSelector             from './LanguageSelector';
import toast                        from 'react-hot-toast';

export default function Navbar() {
  const { isLoggedIn, userProfile, isAdmin } = useAuth();
  const [open,     setOpen]    = useState(false);
  const [scrolled, setScrolled]= useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const hasPass = isPassActive(userProfile);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { setOpen(false); }, [location]);

  const logout = async () => {
    try { await logoutUser(); toast.success('Logged out!'); navigate('/'); }
    catch { toast.error('Logout failed.'); }
  };

  const mainLinks = isLoggedIn ? [
    { to:'/dashboard',    label:'Matches',      icon:Trophy     },
    { to:'/leaderboard',  label:'Rankings',     icon:BarChart2  },
    { to:'/stats',        label:'Stats',        icon:TrendingUp },
    { to:'/achievements', label:'Badges',       icon:Star       },
    { to:'/wallet',       label:'Wallet',       icon:Wallet     },
    { to:'/team',         label:'Team',         icon:Users      },
    { to:'/support',      label:'Support',      icon:HelpCircle },
    { to:'/profile',      label:'Profile',      icon:User       },
    ...(isAdmin ? [{ to:'/admin', label:'Admin', icon:Shield }] : []),
  ] : [
    { to:'/leaderboard', label:'Rankings', icon:BarChart2 },
    { to:'/login',       label:'Sign In',  icon:null },
    { to:'/register',    label:'Register', icon:null },
  ];

  const active = (to) => location.pathname === to || location.pathname.startsWith(to+'/');

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-ea-abyss/95 backdrop-blur-xl border-b border-ea-border shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'bg-transparent'}`}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-ea-cyan to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center
                            bg-gradient-to-br from-ea-cyan to-ea-magenta shadow-cyan
                            group-hover:shadow-cyan-lg transition-all duration-300 group-hover:scale-105">
              <Zap className="w-5 h-5 text-ea-void" fill="currentColor" />
              <div className="absolute -top-px -right-px w-2 h-2 bg-ea-cyan rounded-bl-md" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-bold text-xl tracking-tight text-white">Elite</span>
              <span className="font-display font-bold text-xl tracking-tight text-ea-cyan">Arena</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {mainLinks.map(({ to, label, icon:Icon }) => (
              <Link key={to} to={to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg
                            text-sm font-body font-medium transition-all duration-200
                  ${active(to)
                    ? 'text-ea-cyan bg-ea-cyan/8'
                    : 'text-ea-muted hover:text-ea-text hover:bg-ea-surface/60'}`}>
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
                {active(to) && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-ea-cyan" />}
              </Link>
            ))}

            <div className="w-px h-5 bg-ea-border mx-1" />

            {/* ElitePass link */}
            {isLoggedIn && (
              <Link to="/elite-pass"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-bold
                            transition-all duration-200
                  ${hasPass
                    ? 'text-ea-gold bg-ea-gold/8 border border-ea-gold/20'
                    : 'text-ea-muted hover:text-ea-gold hover:bg-ea-gold/5'}`}>
                <Crown className="w-3.5 h-3.5" />
                {hasPass ? '👑 Active' : 'ElitePass'}
              </Link>
            )}

            {isLoggedIn && <div className="mx-1"><NotificationBell /></div>}

            {isLoggedIn && userProfile && (
              <Link to="/wallet"
                className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-lg
                           bg-ea-gold/10 border border-ea-gold/25 hover:bg-ea-gold/18 hover:border-ea-gold/45
                           transition-all duration-200 group">
                <span className="text-base leading-none">⚡</span>
                <span className="font-mono font-bold text-sm text-ea-gold">
                  {(userProfile.elite_coins_balance ?? 0).toLocaleString()}
                </span>
              </Link>
            )}

            <LanguageSelector />

            {isLoggedIn && (
              <button onClick={logout}
                className="ml-1 p-2 rounded-lg text-ea-muted hover:text-ea-magenta hover:bg-ea-magenta/8 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            {isLoggedIn && userProfile && (
              <Link to="/wallet" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ea-gold/10 border border-ea-gold/25">
                <span className="text-sm">⚡</span>
                <span className="font-mono text-xs font-bold text-ea-gold">{(userProfile.elite_coins_balance??0).toLocaleString()}</span>
              </Link>
            )}
            {isLoggedIn && <NotificationBell />}
            <button onClick={() => setOpen(!open)} className="p-2 rounded-lg text-ea-text hover:text-white hover:bg-ea-surface transition-all">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-ea-abyss/98 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] border-t border-ea-border animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {mainLinks.map(({ to, label, icon:Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                  ${active(to) ? 'bg-ea-cyan/10 text-ea-cyan border border-ea-cyan/20' : 'text-ea-text hover:text-white hover:bg-ea-surface'}`}>
                {Icon && <Icon className="w-4 h-4" />}
                <span className="font-body font-medium">{label}</span>
                {active(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ea-cyan" />}
              </Link>
            ))}
            {isLoggedIn && (
              <Link to="/elite-pass"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                  ${hasPass ? 'bg-ea-gold/8 text-ea-gold border border-ea-gold/20' : 'text-ea-text hover:text-ea-gold hover:bg-ea-gold/5'}`}>
                <Crown className="w-4 h-4" />
                <span className="font-body font-medium">{hasPass ? '👑 ElitePass Active' : 'ElitePass'}</span>
              </Link>
            )}
            <div className="px-2 py-1"><LanguageSelector /></div>
            {isLoggedIn && (
              <button onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-ea-magenta hover:bg-ea-magenta/8 transition-all mt-2">
                <LogOut className="w-4 h-4" />
                <span className="font-body font-medium">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
