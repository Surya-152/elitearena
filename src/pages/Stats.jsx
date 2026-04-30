// src/pages/Stats.jsx — Player Statistics & Analytics
import { useState, useEffect }   from 'react';
import { useSEO }                from '../hooks/useSEO';
import { useAuth }               from '../context/AuthContext';
import { useMatchHistory }       from '../hooks/useMatchHistory';
import { useLeaderboard }        from '../hooks/useLeaderboard';
import {
  Target, Trophy, Zap, TrendingUp, Calendar,
  Award, BarChart2, Star, Users,
} from 'lucide-react';

export default function Stats() {
  const { userProfile } = useAuth();
  useSEO({ title:'My Stats', description:'Apni gaming stats aur performance analytics dekho.', noIndex:true });

  const { matches } = useMatchHistory(userProfile?.uid);
  const { players } = useLeaderboard(100);

  if (!userProfile) return null;

  const rank = players.findIndex(p => p.id === userProfile.uid) + 1;
  const totalMatches  = userProfile.matches_played || 0;
  const totalWinnings = userProfile.total_winnings  || 0;
  const balance       = userProfile.elite_coins_balance || 0;
  const achievements  = (userProfile.achievements || []).length;
  const streak        = userProfile.loginStreak || 0;
  const winRate       = totalMatches > 0 ? Math.round((totalWinnings > 0 ? 1 : 0) / totalMatches * 100) : 0;

  const statCards = [
    { label:'Global Rank',      value: rank > 0 ? `#${rank}` : '—',            color:'gold',    icon:Award       },
    { label:'Tournaments',      value: totalMatches,                             color:'cyan',    icon:Target      },
    { label:'Total Winnings',   value: `${totalWinnings.toLocaleString()} EC`,  color:'magenta', icon:Trophy      },
    { label:'EC Balance',       value: `${balance.toLocaleString()} EC`,        color:'green',   icon:Zap         },
    { label:'Achievements',     value: `${achievements}/9`,                     color:'gold',    icon:Star        },
    { label:'Login Streak',     value: `${streak} days`,                        color:'cyan',    icon:Calendar    },
  ];

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto animate-fade-up space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Player{' '}
              <span style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Stats
              </span>
            </h1>
            <p className="font-body text-ea-muted text-sm mt-1">
              {userProfile.username} ka performance dashboard
            </p>
          </div>
          {rank > 0 && rank <= 10 && (
            <div className="px-4 py-2 rounded-xl font-display font-bold text-sm"
                 style={{ background:'rgba(255,184,0,0.1)', border:'1px solid rgba(255,184,0,0.3)', color:'#ffb800' }}>
              🏆 Top 10 Player!
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statCards.map(({ label, value, color, icon:Icon }) => (
            <div key={label} className={`stat-card ${color}`}>
              <Icon className={`w-5 h-5 mb-2
                ${color==='gold'?'text-ea-gold':color==='cyan'?'text-ea-cyan':color==='magenta'?'text-ea-magenta':'text-ea-green'}`} />
              <div className={`font-display font-bold text-2xl
                ${color==='gold'?'text-ea-gold':color==='cyan'?'text-ea-cyan':color==='magenta'?'text-ea-magenta':'text-ea-green'}`}>
                {value}
              </div>
              <div className="font-body text-xs text-ea-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Rank progress */}
        {rank > 0 && (
          <div className="rounded-2xl p-5"
               style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
            <h3 className="font-display font-bold text-white text-base mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-ea-cyan" /> Leaderboard Position
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                   style={{ background: rank<=3 ? 'linear-gradient(135deg,#ffb800,#ff6b00)' : 'rgba(0,245,255,0.1)',
                            border: rank<=3 ? 'none' : '1px solid rgba(0,245,255,0.2)' }}>
                <span className="font-display font-bold text-2xl text-white">#{rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-body text-ea-text text-sm mb-2">
                  {rank === 1 ? '🏆 Aap #1 hain! Sabse top!' :
                   rank <= 3  ? '🥉 Top 3 mein ho! Bahut acha!' :
                   rank <= 10 ? '⚡ Top 10 mein ho!' :
                                `${rank-1} players aapko beat kar rahe hain`}
                </p>
                {rank > 1 && players[rank-2] && (
                  <div className="flex items-center gap-2 text-xs text-ea-muted font-mono">
                    <span>#{rank-1} se peeche:</span>
                    <span className="text-ea-gold">
                      {players[rank-2].total_winnings - totalWinnings} EC
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent matches */}
        {matches.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
               style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
            <div className="px-5 py-4 border-b border-ea-border">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-ea-cyan" /> Recent Matches
              </h3>
            </div>
            <div className="divide-y divide-ea-border/40">
              {matches.slice(0, 5).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-ea-cyan flex-shrink-0"
                       style={{ background:'rgba(0,245,255,0.08)', border:'1px solid rgba(0,245,255,0.15)' }}>
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-ea-muted truncate">ID: {m.id.slice(0,12)}…</p>
                  </div>
                  {m.entry_fee === 0
                    ? <span className="badge-green text-xs">FREE</span>
                    : <span className="font-mono text-xs text-ea-gold">-{m.entry_fee} EC</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl p-5"
             style={{ background:'linear-gradient(145deg,#0c1012,#080c10)', border:'1px solid rgba(0,245,255,0.1)' }}>
          <h3 className="font-display font-bold text-ea-cyan text-sm mb-3">💡 Rank Improve Karne ke Tips</h3>
          <div className="space-y-2">
            {[
              'Har din login karo aur daily reward lo — streak bonus milta hai',
              'Free tournaments se shuru karo — risk nahi, experience milta hai',
              'Achievements complete karo — extra EC aur badges milte hain',
              'ElitePass lo — exclusive tournaments mein zyada winning chance',
            ].map((tip, i) => (
              <p key={i} className="font-body text-xs text-ea-muted flex gap-2">
                <span className="text-ea-cyan font-mono">{i+1}.</span>
                {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
