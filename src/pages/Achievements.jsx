// src/pages/Achievements.jsx — Badge & Achievement System
import { useState, useEffect }    from 'react';
import { useSEO }                 from '../hooks/useSEO';
import { useAuth }                from '../context/AuthContext';
import {
  checkAndGrantAchievements, getUserAchievementStatus,
} from '../services/achievementService';
import { Trophy, Star, Lock, CheckCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Achievements() {
  const { userProfile }       = useAuth();
  const [checking, setChecking] = useState(false);
  useSEO({ title:'Achievements', description:'Apne EliteArena badges aur achievements dekho.', noIndex:true });

  const status   = getUserAchievementStatus(userProfile);
  const earned   = status.filter(a => a.earned);
  const locked   = status.filter(a => !a.earned);
  const totalEC  = earned.reduce((s, a) => s + a.ec, 0);

  useEffect(() => {
    if (!userProfile?.uid) return;
    // Auto-check achievements on page load
    checkAndGrantAchievements(userProfile.uid)
      .then(newly => {
        if (newly.length > 0) {
          const names = newly.map(a => `${a.emoji} ${a.label}`).join(', ');
          toast.success(`New achievements! ${names}`, { duration: 5000 });
        }
      })
      .catch(() => {});
  }, [userProfile?.uid]);

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto animate-fade-up space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Achievements &{' '}
            <span style={{ background:'linear-gradient(135deg,#ffb800,#ff6b00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Badges
            </span>
          </h1>
          <p className="font-body text-ea-muted text-sm mt-1">Milestones complete karo — EC rewards kamao</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Earned',     value:`${earned.length}/${status.length}`, color:'text-ea-gold'  },
            { label:'EC Earned',  value:`${totalEC} EC`,                     color:'text-ea-cyan'  },
            { label:'Remaining',  value:`${locked.length} left`,             color:'text-ea-muted' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center"
                 style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
              <div className="font-mono text-[10px] text-ea-muted uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Earned achievements */}
        {earned.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-white text-lg mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-ea-gold" /> Earned ({earned.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {earned.map(ach => (
                <div key={ach.id} className="rounded-2xl p-4 flex items-center gap-4"
                     style={{ background:'rgba(255,184,0,0.06)', border:'1px solid rgba(255,184,0,0.2)' }}>
                  <div className="text-3xl flex-shrink-0">{ach.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm text-white">{ach.label}</p>
                      <CheckCircle className="w-3.5 h-3.5 text-ea-green flex-shrink-0" />
                    </div>
                    <p className="font-body text-xs text-ea-muted mt-0.5">{ach.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Zap className="w-3 h-3 text-ea-gold" />
                    <span className="font-mono font-bold text-xs text-ea-gold">+{ach.ec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked achievements */}
        {locked.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-white text-lg mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-ea-muted" /> Locked ({locked.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locked.map(ach => {
                const pct = Math.round((ach.progress / ach.threshold) * 100);
                return (
                  <div key={ach.id} className="rounded-2xl p-4"
                       style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl opacity-50">{ach.emoji}</div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-sm text-ea-text">{ach.label}</p>
                        <p className="font-body text-xs text-ea-muted">{ach.desc}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Zap className="w-3 h-3 text-ea-dim" />
                        <span className="font-mono text-xs text-ea-dim">+{ach.ec}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-ea-dim mb-1">
                        <span>{ach.progress}/{ach.threshold}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(30,30,58,0.8)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{ width:`${pct}%`, background:'linear-gradient(90deg,#00f5ff,#0080ff)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
