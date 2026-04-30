// src/components/user/TournamentCard.jsx — v3: Mode badge + Sponsor + Team join
import { useState, useRef, useEffect, memo } from 'react';
import { Link }                        from 'react-router-dom';
import { Users, Trophy, Clock, Zap, Lock, CheckCircle, Shield } from 'lucide-react';
import { formatDistanceToNow }         from 'date-fns';
import { joinTournament, TOURNAMENT_MODES } from '../../services/tournamentService';
import { useAuth }                     from '../../context/AuthContext';
import toast                           from 'react-hot-toast';

const GAME_CFG = {
  'BGMI':         { emoji:'🎯', bg:'linear-gradient(145deg,rgba(0,60,140,0.25),rgba(0,245,255,0.05))', accent:'#00f5ff', btn:'linear-gradient(135deg,#00f5ff,#0080ff)', btnTxt:'#02020a' },
  'Free Fire MAX':{ emoji:'🔥', bg:'linear-gradient(145deg,rgba(120,0,50,0.25),rgba(255,0,128,0.05))', accent:'#ff0080', btn:'linear-gradient(135deg,#ff0080,#8b2fff)', btnTxt:'#fff' },
  'COD Mobile':   { emoji:'💥', bg:'linear-gradient(145deg,rgba(0,60,30,0.25),rgba(0,255,136,0.05))', accent:'#00ff88', btn:'linear-gradient(135deg,#00ff88,#00c8ff)', btnTxt:'#02020a' },
};
const DEFAULT_CFG = GAME_CFG['BGMI'];

const TournamentCard = memo(function TournamentCard({ tournament, isJoined }) {
  const { userProfile }       = useAuth();
  const [joining, setJoining] = useState(false);
  const mountedRef            = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const {
    id, game_name, entry_fee, prize_pool,
    slots_total, slots_filled, start_time, status,
    tournament_mode = 'solo',
    sponsor_name = '', sponsor_logo = '',
  } = tournament;

  const cfg      = GAME_CFG[game_name] ?? DEFAULT_CFG;
  const modeInfo = TOURNAMENT_MODES[tournament_mode?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
  const slotsLeft= Math.max(0, (slots_total||0) - (slots_filled||0));
  const isFull   = slotsLeft <= 0;
  const fillPct  = Math.min(100, ((slots_filled||0) / Math.max(1,slots_total)) * 100);
  const canAfford= (userProfile?.elite_coins_balance ?? 0) >= (entry_fee||0);
  const isDone   = status === 'completed';
  const isLive   = status === 'live';
  const isSolo   = tournament_mode === 'solo';

  let timeLabel = 'Soon';
  try {
    const d = start_time?.toDate ? start_time.toDate() : new Date(start_time);
    timeLabel = isDone ? 'Ended' : isLive ? '🔴 LIVE NOW' : formatDistanceToNow(d, { addSuffix:true });
  } catch {}

  const handleSoloJoin = async (e) => {
    e.preventDefault();
    if (!userProfile) { toast.error('Login karo pehle.'); return; }
    setJoining(true);
    try {
      await joinTournament(userProfile.uid, id);
      if (mountedRef.current) toast.success(`${game_name} join kar liya! 🎮`);
    } catch (err) {
      if (mountedRef.current) toast.error(err.message || 'Join failed.');
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  };

  // Team modes: redirect to tournament detail page for team join flow
  const isTeamMode   = !isSolo;
  const btnDisabled  = joining || isFull || isJoined || isDone || (!canAfford && entry_fee > 0);

  return (
    <Link to={`/tournament/${id}`}
      className="block rounded-2xl overflow-hidden transition-all duration-300
                 hover:-translate-y-1 group animate-fade-up"
      style={{ background:cfg.bg, border:`1px solid ${cfg.accent}33`,
               boxShadow:`0 4px 24px ${cfg.accent}15` }}>

      {/* Top accent line */}
      <div className="h-0.5 w-full"
           style={{ background:`linear-gradient(90deg,transparent,${cfg.accent},transparent)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{cfg.emoji}</span>
            <div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">{game_name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Clock className="w-3 h-3 text-ea-muted" />
                <span className="font-mono text-xs text-ea-muted">{timeLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {/* Status badge */}
            {isLive ? (
              <span className="badge-live text-[10px]">● LIVE</span>
            ) : isDone ? (
              <span className="badge-magenta opacity-60 text-[10px]">ENDED</span>
            ) : (
              <span className="badge-green text-[10px]">UPCOMING</span>
            )}
            {/* Mode badge */}
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background:`${cfg.accent}15`, border:`1px solid ${cfg.accent}30`,
                           color: cfg.accent }}>
              {modeInfo.emoji} {modeInfo.label}
            </span>
          </div>
        </div>

        {/* Sponsor banner */}
        {sponsor_name && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg"
               style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.2)' }}>
            {sponsor_logo
              ? <img src={sponsor_logo} alt={sponsor_name} className="w-4 h-4 rounded object-contain" />
              : <Shield className="w-3.5 h-3.5 text-ea-gold" />}
            <span className="font-mono text-[10px] text-ea-gold">Powered by {sponsor_name}</span>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
          {[
            { label:'Entry',  val: entry_fee===0 ? 'FREE' : `${entry_fee} EC`, icon:Zap,    col:entry_fee===0?'green':'gold' },
            { label:'Prize',  val: `${prize_pool} EC`,                          icon:Trophy, col:'cyan'                        },
            { label:'Slots',  val: isFull ? 'FULL' : slotsLeft,                 icon:Users,  col:isFull?'magenta':'green'       },
          ].map(({ label, val, icon:Icon, col }) => (
            <div key={label} className="rounded-xl p-2.5 text-center"
                 style={{ background:'rgba(6,6,18,0.5)' }}>
              <Icon className={`w-3.5 h-3.5 mx-auto mb-1
                ${col==='gold'?'text-ea-gold':col==='cyan'?'text-ea-cyan':col==='magenta'?'text-ea-magenta':'text-ea-green'}`} />
              <div className={`font-mono font-bold text-xs sm:text-sm
                ${col==='gold'?'text-ea-gold':col==='cyan'?'text-ea-cyan':col==='magenta'?'text-ea-magenta':'text-ea-green'}`}>
                {val}
              </div>
              <div className="font-body text-[9px] text-ea-muted uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Fill bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[10px] text-ea-muted mb-1.5">
            <span>{slots_filled}/{slots_total} players</span>
            <span>{Math.round(fillPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(30,30,58,0.8)' }}>
            <div className="h-full rounded-full transition-all duration-700"
                 style={{
                   width:`${fillPct}%`,
                   background: fillPct>=90 ? 'linear-gradient(90deg,#ff0080,#8b2fff)'
                             : fillPct>=60 ? 'linear-gradient(90deg,#ffb800,#ff6b00)'
                             : `linear-gradient(90deg,${cfg.accent},${cfg.accent}99)`,
                 }} />
          </div>
        </div>

        {/* CTA Button */}
        {isJoined ? (
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                          flex items-center justify-center gap-2
                          bg-ea-green/10 border border-ea-green/25 text-ea-green">
            <CheckCircle className="w-4 h-4" /> Registered ✓
          </div>
        ) : isDone ? (
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm text-center
                          bg-ea-dim/20 text-ea-dim border border-ea-border">Ended</div>
        ) : isFull ? (
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm text-center
                          bg-ea-magenta/10 text-ea-magenta border border-ea-magenta/25">Full</div>
        ) : isTeamMode ? (
          // Team mode: show info + click goes to detail page
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                          flex items-center justify-center gap-2"
               style={{ background:`${cfg.accent}18`, border:`1px solid ${cfg.accent}35`,
                        color: cfg.accent }}>
            {modeInfo.emoji} View & Join as {modeInfo.label}
          </div>
        ) : !canAfford && entry_fee > 0 ? (
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                          flex items-center justify-center gap-2
                          bg-ea-dim/20 text-ea-muted border border-ea-border cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" /> Need {entry_fee} EC
          </div>
        ) : (
          <button onClick={handleSoloJoin} disabled={joining}
            className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                       flex items-center justify-center gap-2 transition-all duration-200
                       active:scale-97 disabled:opacity-60 group-hover:scale-[1.01]"
            style={{ background:cfg.btn, color:cfg.btnTxt }}>
            {joining ? '⏳ Joining…' : entry_fee===0 ? '⚡ Join Free' : `⚡ Join — ${entry_fee} EC`}
          </button>
        )}
      </div>
    </Link>
  );
}
);

export default TournamentCard;