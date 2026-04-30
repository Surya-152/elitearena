// src/pages/Leaderboard.jsx
import { useState }        from 'react';
import { Trophy, Medal, Crown, Zap, Target, TrendingUp, Search } from 'lucide-react';
import { LeaderboardBannerAd } from '../components/common/AdManager';
import { useSEO, SEO_PAGES } from '../hooks/useSEO';
import { useLeaderboard }  from '../hooks/useLeaderboard';
import { useAuth }         from '../context/AuthContext';

const RANK_CONFIG = {
  1: { icon: Crown,  color: 'text-ea-gold',  bg: 'bg-ea-gold/15 border-ea-gold/40',  size: 'text-2xl' },
  2: { icon: Medal,  color: 'text-slate-300',   bg: 'bg-slate-300/10 border-slate-300/30',    size: 'text-xl'  },
  3: { icon: Medal,  color: 'text-amber-600',   bg: 'bg-amber-700/10 border-amber-700/30',    size: 'text-xl'  },
};

export default function Leaderboard() {
  const { players, loading, error } = useLeaderboard(100);
  useSEO(SEO_PAGES.leaderboard);
  const { userProfile }             = useAuth();
  const [search, setSearch]         = useState('');
  const [tab,    setTab]            = useState('winnings'); // winnings | matches

  const sorted = [...players].sort((a, b) =>
    tab === 'winnings'
      ? (b.total_winnings || 0) - (a.total_winnings || 0)
      : (b.matches_played || 0) - (a.matches_played || 0)
  );

  const filtered = sorted.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const myRank = sorted.findIndex(p => p.uid === userProfile?.uid) + 1;

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                      bg-ea-gold/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-gradient-to-br from-ea-gold/30 to-ea-magenta/20
                          border border-ea-gold/30 rounded-2xl mb-4 shadow-gold">
            <Trophy className="w-8 h-8 text-ea-gold" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-1">
            Hall of <span className="text-ea-gold">Champions</span>
          </h1>
          <p className="text-ea-muted text-sm font-body">
            Top players by EliteCoins earned · Updates live
          </p>
        </div>

        {/* My rank callout */}
        {userProfile && myRank > 0 && (
          <div className="mb-6 bg-ea-cyan/8 border border-ea-cyan/25 rounded-2xl p-4
                          flex items-center justify-between animate-slide-up"
               style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ea-cyan/20 border border-ea-cyan/30
                              flex items-center justify-center font-display font-black text-white">
                {(userProfile.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-display font-bold text-sm">{userProfile.username}</p>
                <p className="text-ea-muted text-xs font-mono">Your current ranking</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-ea-cyan font-mono font-bold text-xl">#{myRank}</p>
              <p className="text-ea-muted text-xs">{userProfile.total_winnings || 0} EC won</p>
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up"
             style={{ animationDelay: '0.08s' }}>
          <div className="flex gap-1 bg-ea-card border border-ea-border rounded-xl p-1">
            {[
              { id: 'winnings', label: 'Top Earners',  icon: Trophy  },
              { id: 'matches',  label: 'Most Active',  icon: Target  },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm
                            font-display font-bold transition-all duration-200
                  ${tab === id
                    ? 'bg-ea-gold/20 border border-ea-gold/40 text-ea-gold'
                    : 'text-ea-muted hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player…"
              className="w-full bg-ea-card border border-ea-border text-white rounded-xl
                         pl-10 pr-4 py-2.5 text-sm font-body placeholder-ea-muted
                         focus:outline-none focus:border-ea-cyan/50 transition-all"
            />
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && !search && tab === 'winnings' && filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up"
               style={{ animationDelay: '0.1s' }}>
            {[filtered[1], filtered[0], filtered[2]].map((p, i) => {
              const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
              const cfg  = RANK_CONFIG[rank];
              return (
                <div key={p.id}
                  className={`${cfg.bg} border rounded-2xl p-4 text-center
                    ${rank === 1 ? 'transform scale-105 shadow-gold' : ''}`}>
                  <cfg.icon className={`w-6 h-6 mx-auto mb-2 ${cfg.color}`} />
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-2
                                   bg-gradient-to-br from-ea-card to-ea-deep
                                   border border-ea-border flex items-center justify-center
                                   font-display font-black text-lg text-white`}>
                    {(p.username || '?')[0].toUpperCase()}
                  </div>
                  <p className={`font-display font-bold text-sm truncate ${cfg.color}`}>
                    {p.username || 'Player'}
                  </p>
                  <p className="text-ea-muted text-xs font-mono mt-0.5">
                    {(p.total_winnings || 0).toLocaleString()} EC
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden
                        animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <div className="px-5 py-3.5 border-b border-ea-border flex items-center gap-2">
            <span className="w-2 h-2 bg-ea-green rounded-full animate-pulse" />
            <span className="text-white font-display font-bold text-sm">Live Rankings</span>
            <span className="ml-auto text-ea-muted text-xs font-mono">
              {filtered.length} players
            </span>
          </div>

          {error && (
            <div className="p-8 text-center text-ea-magenta text-sm">{error}</div>
          )}

          {loading ? (
            <div className="divide-y divide-ea-border/50">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-4 bg-ea-border rounded" />
                  <div className="w-10 h-10 bg-ea-border rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-ea-border rounded w-32 mb-1.5" />
                    <div className="h-3 bg-ea-border rounded w-20" />
                  </div>
                  <div className="w-20 h-5 bg-ea-border rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="w-10 h-10 text-ea-border mx-auto mb-3" />
              <p className="text-ea-text font-bold">No players found</p>
              <p className="text-ea-muted text-sm mt-1">
                {players.length === 0 ? 'No one has won yet. Be the first!' : 'Try a different search.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ea-border/50">
              {filtered.map((p, idx) => {
                const isMe  = p.uid === userProfile?.uid;
                const rank  = idx + 1;
                const cfg   = RANK_CONFIG[rank];
                const value = tab === 'winnings'
                  ? `${(p.total_winnings || 0).toLocaleString()} EC`
                  : `${p.matches_played || 0} matches`;

                return (
                  <div key={p.id}
                    className={`px-5 py-3.5 flex items-center gap-4 transition-colors
                      ${isMe ? 'bg-ea-cyan/5 border-l-2 border-ea-cyan' : 'hover:bg-ea-deep/40'}`}>

                    {/* Rank */}
                    <div className="w-8 text-right flex-shrink-0">
                      {cfg ? (
                        <cfg.icon className={`w-5 h-5 ml-auto ${cfg.color}`} />
                      ) : (
                        <span className="text-ea-muted font-mono text-sm font-bold">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                     font-display font-black text-base flex-shrink-0
                                     border transition-all
                      ${isMe
                        ? 'bg-ea-cyan/20 border-ea-cyan/40 text-ea-cyan'
                        : 'bg-ea-deep border-ea-border text-white'}`}>
                      {(p.username || '?')[0].toUpperCase()}
                    </div>

                    {/* Name + stats */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-bold text-sm truncate
                        ${isMe ? 'text-ea-cyan' : 'text-white'}`}>
                        {p.username || 'Anonymous'}
                        {isMe && <span className="text-ea-muted font-body font-normal text-xs ml-1.5">(you)</span>}
                      </p>
                      <p className="text-ea-muted text-xs font-mono">
                        {p.matches_played || 0} matches played
                      </p>
                    </div>

                    {/* Value */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-mono font-bold text-sm
                        ${tab === 'winnings' ? 'text-ea-gold' : 'text-ea-magenta'}`}>
                        {value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-ea-muted text-xs font-mono mt-4 animate-fade-in">
          Rankings update in real time via Firestore onSnapshot
        </p>
      </div>
    </div>
  );
}
