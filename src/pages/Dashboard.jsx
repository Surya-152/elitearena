// src/pages/Dashboard.jsx — with AdSense sidebar + KYC warning banner
import { useState }              from 'react';
import { Search, Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link }                  from 'react-router-dom';
import { useTournaments }        from '../hooks/useTournaments';
import { useUserRegistrations }  from '../hooks/useUserRegistrations';
import { useSEO } from '../hooks/useSEO';
import { useAuth }               from '../context/AuthContext';
import TournamentCard            from '../components/user/TournamentCard';
import WalletPanel               from '../components/user/WalletPanel';
import AdRewardPanel             from '../components/user/AdRewardPanel';
import { DashboardSidebarAd, DashboardBannerAd } from '../components/common/AdManager';
import DailyRewardPanel          from '../components/user/DailyRewardPanel';
import SpinWheel                 from '../components/user/SpinWheel';
import { TournamentCardSkeleton } from '../components/common/LoadingSkeleton';


const STATUS_FILTERS = ['All', 'upcoming', 'live', 'completed'];
const GAME_FILTERS   = ['All Games', 'BGMI', 'Free Fire MAX', 'COD Mobile'];

export default function Dashboard() {
  useSEO({ title:'Tournament Arena', description:'Live BGMI aur Free Fire MAX tournaments. Real prizes.', noIndex:true });
  const { userProfile , isNewUser }                 = useAuth();
  const { tournaments, loading, error } = useTournaments();
  const { joinedIds }                   = useUserRegistrations(userProfile?.uid);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gameFilter,   setGameFilter]   = useState('All Games');

  const filtered = tournaments.filter(t => {
    const q  = search.toLowerCase();
    const hit = t.game_name.toLowerCase().includes(q) || t.status.includes(q);
    const st  = statusFilter === 'All' || t.status === statusFilter;
    const gm  = gameFilter   === 'All Games' || t.game_name === gameFilter;
    return hit && st && gm;
  });

  const kycStatus = userProfile?.kycStatus || 'pending';

  if (error) return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4 pt-20">
      <div className="text-center">
        <p className="text-ea-magenta text-lg font-bold mb-2">Tournaments load nahi hue</p>
        <p className="text-ea-muted text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-2 mx-auto px-6 py-2 bg-ea-border rounded-xl text-white text-sm hover:bg-ea-border/80 transition-all">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
            Tournament <span className="text-ea-cyan">Arena</span>
          </h1>
          <p className="text-ea-muted font-body mt-1">
            Live tournaments · Real prizes · Zero excuses
          </p>
        </div>

        {/* KYC Warning banner — only if not approved */}
        {kycStatus !== 'approved' && (
          <Link to="/kyc"
            className={`flex items-center gap-3 p-3.5 rounded-xl mb-5 border transition-all
                        hover:opacity-90 animate-slide-up
              ${kycStatus === 'rejected'
                ? 'bg-ea-magenta/10 border-ea-magenta/30'
                : kycStatus === 'submitted'
                ? 'bg-ea-gold/10 border-ea-gold/30'
                : 'bg-ea-dim/10 border-ea-dim/25'}`}>
            <AlertTriangle className={`w-4 h-4 flex-shrink-0
              ${kycStatus === 'rejected' ? 'text-ea-magenta' : kycStatus === 'submitted' ? 'text-ea-gold' : 'text-ea-muted'}`} />
            <p className={`text-sm font-body flex-1
              ${kycStatus === 'rejected' ? 'text-ea-magenta' : kycStatus === 'submitted' ? 'text-ea-gold' : 'text-ea-muted'}`}>
              {kycStatus === 'submitted'
                ? 'KYC review mein hai — 24-48 hrs mein approve ho jayega.'
                : kycStatus === 'rejected'
                ? 'KYC rejected! Dobara submit karo withdrawal ke liye.'
                : 'Withdrawal ke liye KYC zaruri hai — abhi complete karo →'}
            </p>
          </Link>
        )}

        {/* Wallet stats */}
        <div className="mb-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <WalletPanel />
        </div>


        {/* ── New user welcome banner ─────────────────────────────────── */}
        {isNewUser && (
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in mb-2"
               style={{ background:'linear-gradient(145deg,rgba(0,245,255,0.08),rgba(0,128,255,0.05))', border:'1px solid rgba(0,245,255,0.2)' }}>
            <div className="text-3xl flex-shrink-0">👋</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white text-sm">Welcome to EliteArena!</p>
              <p className="font-body text-xs text-ea-muted mt-0.5">
                Shuru karo: <span className="text-ea-cyan">Spin karo → EC pao → Tournament join karo!</span>
              </p>
            </div>
            <a href="/wallet"
               className="flex-shrink-0 px-3 py-2 rounded-xl font-display font-bold text-xs text-ea-void"
               style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)' }}>
              💰 Free EC Kamao
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tournaments…"
                className="w-full bg-ea-card border border-ea-border text-white rounded-xl
                           pl-10 pr-4 py-2.5 text-sm font-body focus:outline-none
                           focus:border-ea-cyan/50 transition-all placeholder-ea-muted" />
            </div>

            {/* Status pills */}
            <div className="flex gap-2 flex-wrap animate-slide-up" style={{ animationDelay: '0.12s' }}>
              {STATUS_FILTERS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all
                    ${statusFilter === s
                      ? 'bg-ea-cyan text-ea-void shadow-cyan'
                      : 'bg-ea-card border border-ea-border text-ea-muted hover:text-white'}`}>
                  {s === 'All' ? 'All' : s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Game pills */}
            <div className="flex gap-2 flex-wrap animate-slide-up" style={{ animationDelay: '0.14s' }}>
              {GAME_FILTERS.map(g => (
                <button key={g} onClick={() => setGameFilter(g)}
                  className={`px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all border
                    ${gameFilter === g
                      ? 'bg-ea-magenta/20 border-ea-magenta/50 text-ea-magenta'
                      : 'bg-ea-card border-ea-border text-ea-muted hover:text-white'}`}>
                  {g}
                </button>
              ))}
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <TournamentCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <Trophy className="w-12 h-12 text-ea-border mb-4" />
                <p className="text-ea-text font-bold text-lg">Koi tournament nahi mila</p>
                <p className="text-ea-muted text-sm mt-1">
                  {tournaments.length === 0 ? 'Abhi koi tournament nahi hai.' : 'Filters adjust karo.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((t, i) => (
                  <div key={t.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-slide-up">
                    <TournamentCard tournament={t} isJoined={joinedIds.includes(t.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-slide-up order-last lg:order-none" style={{ animationDelay: '0.2s' }}>
            <DailyRewardPanel />

            <SpinWheel />

            <AdRewardPanel />

            {/* Live Stats */}
            <div className="bg-ea-card border border-ea-border rounded-2xl p-5">
              <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-ea-green rounded-full animate-pulse" />
                Live Stats
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Active Tournaments', value: tournaments.filter(t => t.status === 'live').length },
                  { label: 'Upcoming',           value: tournaments.filter(t => t.status === 'upcoming').length },
                  { label: 'Total Prize Pool',   value: `${tournaments.reduce((a,t) => a+(t.prize_pool||0), 0).toLocaleString()} EC`, gold: true },
                ].map(({ label, value, gold }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-ea-border/50 last:border-0">
                    <span className="text-ea-muted text-xs">{label}</span>
                    <span className={`font-mono font-bold text-sm ${gold ? 'text-ea-gold' : 'text-white'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AdSense sidebar ad */}
            <DashboardSidebarAd />
          </div>
        </div>
      </div>
    </div>
  );
}
