// src/pages/TournamentDetail.jsx — v3: Solo/Duo/Squad join, optimized, responsive
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link }  from 'react-router-dom';
import {
  CheckCircle, Clock, Users, Lock, RefreshCw,
  Share2, Copy, Zap, ArrowLeft, Trophy, Shield,
} from 'lucide-react';
import { useTournamentDetail }    from '../hooks/useTournamentDetail';
import { useUserRegistrations }   from '../hooks/useUserRegistrations';
import { useCountdown }           from '../hooks/useCountdown';
import {
  joinTournament, joinTournamentAsTeam, TOURNAMENT_MODES,
} from '../services/tournamentService';
import { useAuth }                from '../context/AuthContext';
import StreamEmbed                from '../components/stream/StreamEmbed';
import TournamentChat             from '../components/chat/TournamentChat';
import { TournamentAffiliateAd, StreamPageAd } from '../components/common/AdManager';
import toast                      from 'react-hot-toast';

// ── Per-game colour config ─────────────────────────────────────────────────────
const GAME_CONFIG = {
  'BGMI':         { emoji:'🎯', accent:'#00f5ff', btn:'linear-gradient(135deg,#00f5ff,#0080ff)', btnTxt:'#02020a', border:'rgba(0,245,255,0.2)'  },
  'Free Fire MAX':{ emoji:'🔥', accent:'#ff0080', btn:'linear-gradient(135deg,#ff0080,#8b2fff)', btnTxt:'#fff',    border:'rgba(255,0,128,0.2)'  },
  'COD Mobile':   { emoji:'💥', accent:'#00ff88', btn:'linear-gradient(135deg,#00ff88,#00c8ff)', btnTxt:'#02020a', border:'rgba(0,255,136,0.2)'  },
};
const DEFAULT_CFG = GAME_CONFIG['BGMI'];

function PageSpinner() {
  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-ea-cyan/20 border-t-ea-cyan animate-spin" />
    </div>
  );
}

function PageError({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-ea-magenta font-bold mb-3">{message}</p>
        <button onClick={onRetry} className="btn-ghost px-6 py-2 rounded-xl text-sm flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );
}

export default function TournamentDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { userProfile } = useAuth();

  // ── 1. ALL HOOKS FIRST (no early returns before this) ─────────────────────
  const { tournament, registrations, loading, error } = useTournamentDetail(id);
  const { joinedIds }   = useUserRegistrations(userProfile?.uid);
  const countdown       = useCountdown(tournament?.start_time);

  const [joining,    setJoining]    = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [teamUIDs,   setTeamUIDs]   = useState([]);
  const mountedRef                  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!tournament) return;
    const mode     = tournament.tournament_mode || 'solo';
    const modeInfo = TOURNAMENT_MODES[mode?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
    if (modeInfo.size > 1) {
      setTeamUIDs(Array(modeInfo.size).fill(''));
    }
  }, [tournament?.tournament_mode]);

  // ── 2. useCallback HOOKS (use optional chaining — tournament may be null) ──
  const handleSoloJoin = useCallback(async () => {
    if (!userProfile) { toast.error('Login karo pehle.'); return; }
    setJoining(true);
    try {
      await joinTournament(userProfile.uid, id);
      if (mountedRef.current) toast.success(`${tournament?.game_name} join kar liya! 🎮`);
    } catch (err) {
      if (mountedRef.current) toast.error(err.message);
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  }, [userProfile, id, tournament?.game_name]);

  const handleTeamJoin = useCallback(async () => {
    if (!userProfile) { toast.error('Login karo pehle.'); return; }
    const modeKey  = tournament?.tournament_mode || 'solo';
    const modeInfo = TOURNAMENT_MODES[modeKey?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
    const filled   = teamUIDs.filter(u => u.trim());
    if (filled.length !== modeInfo.size) {
      toast.error(`Sabhi ${modeInfo.size} team members ke UIDs daalo.`); return;
    }
    setJoining(true);
    try {
      await joinTournamentAsTeam(userProfile.teamId || 'solo-team', filled, id);
      if (mountedRef.current) toast.success(`${modeInfo.label} team join ho gayi! 🎮`);
    } catch (err) {
      if (mountedRef.current) toast.error(err.message);
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  }, [userProfile, teamUIDs, id, tournament?.tournament_mode]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title:`${tournament?.game_name} Tournament`, url });
    else { navigator.clipboard?.writeText(url); toast.success('Link copied!'); }
  }, [tournament?.game_name]);

  const handleCopyCode = useCallback(() => {
    const roomId   = tournament?.room_id       || '';
    const roomPass = tournament?.room_password || '';
    navigator.clipboard?.writeText(`${roomId} | ${roomPass}`).catch(() => {});
    setCodeCopied(true);
    toast.success('Room details copied!');
    setTimeout(() => { if (mountedRef.current) setCodeCopied(false); }, 2000);
  }, [tournament?.room_id, tournament?.room_password]);

  // ── 3. EARLY RETURNS (after ALL hooks) ────────────────────────────────────
  if (loading)     return <PageSpinner />;
  if (error)       return <PageError message={error} onRetry={() => navigate(0)} />;
  if (!tournament) return null;

  // ── 4. DERIVED VARIABLES (tournament is guaranteed non-null here) ──────────
  const cfg      = GAME_CONFIG[tournament.game_name] ?? DEFAULT_CFG;
  const mode     = tournament.tournament_mode || 'solo';
  const modeInfo = TOURNAMENT_MODES[mode?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
  const isTeam   = modeInfo.size > 1;

  const isJoined  = joinedIds.includes(id);
  const isFull    = (tournament.slots_filled || 0) >= tournament.slots_total;
  const isDone    = tournament.status === 'completed';
  const isLive    = tournament.status === 'live';
  const canAfford = (userProfile?.elite_coins_balance ?? 0) >= (tournament.entry_fee || 0);
  const fillPct   = Math.min(100, ((tournament.slots_filled || 0) / Math.max(1, tournament.slots_total)) * 100);

  const roomId   = tournament.room_id       || '';
  const roomPass = tournament.room_password || '';
  const showRoom = isJoined && isLive && roomId;

  const perMemberPrize = isTeam
    ? Math.floor(tournament.prize_pool / modeInfo.size)
    : tournament.prize_pool;

  // ── 5. JSX RETURN ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-5 animate-fade-up">

        {/* ── Back + Share ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-ea-muted hover:text-white text-sm
                       transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Arena</span>
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-ea-muted
                       hover:text-ea-text hover:bg-ea-surface text-sm transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
             style={{ background:`linear-gradient(145deg,rgba(10,10,20,0.95),#08080f)`, border:`1px solid ${cfg.border}` }}>
          {/* Top gradient */}
          <div className="h-1" style={{ background:`linear-gradient(90deg,transparent,${cfg.accent},transparent)` }} />

          <div className="p-5 sm:p-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <span className="text-4xl sm:text-5xl flex-shrink-0">{cfg.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                      {tournament.game_name}
                    </h1>
                    {/* Mode badge */}
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background:`${cfg.accent}15`, border:`1px solid ${cfg.accent}30`, color:cfg.accent }}>
                      {modeInfo.emoji} {modeInfo.label}
                    </span>
                    {/* Status badge */}
                    {isLive ? (
                      <span className="badge-live text-xs">● LIVE</span>
                    ) : isDone ? (
                      <span className="badge-magenta opacity-60 text-xs">ENDED</span>
                    ) : (
                      <span className="badge-green text-xs">UPCOMING</span>
                    )}
                  </div>

                  {/* Sponsor */}
                  {tournament.sponsor_name && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Shield className="w-3 h-3 text-ea-gold" />
                      <span className="font-mono text-[11px] text-ea-gold">Powered by {tournament.sponsor_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Countdown */}
              {!isDone && (
                <div className="flex-shrink-0 text-right sm:text-right">
                  <div className="font-mono text-[10px] text-ea-muted uppercase tracking-wider mb-0.5">
                    {isLive ? 'Status' : 'Starts in'}
                  </div>
                  <div className={`font-mono font-bold text-xl sm:text-2xl
                    ${isLive ? 'text-ea-magenta animate-pulse' : 'text-white'}`}>
                    {isLive ? '🔴 LIVE' : (countdown || 'Starting soon')}
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label:'Entry Fee',  val: tournament.entry_fee===0 ? 'FREE' : `${tournament.entry_fee} EC`, color:'gold'    },
                { label:'Prize Pool', val: `${tournament.prize_pool} EC`,                                     color:'cyan'    },
                { label:'Players',    val: `${tournament.slots_filled}/${tournament.slots_total}`,            color:'green'   },
                { label:'Per Member', val: `${perMemberPrize} EC`,                                            color:'magenta' },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                     style={{ background:'rgba(6,6,18,0.7)' }}>
                  <div className={`font-display font-bold text-lg
                    ${color==='gold'?'text-ea-gold':color==='cyan'?'text-ea-cyan':color==='magenta'?'text-ea-magenta':'text-ea-green'}`}>
                    {val}
                  </div>
                  <div className="font-mono text-[10px] text-ea-muted uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Fill bar */}
            <div className="mb-5">
              <div className="flex justify-between font-mono text-[11px] text-ea-muted mb-1.5">
                <span>{tournament.slots_filled} / {tournament.slots_total} players</span>
                <span>{Math.round(fillPct)}% filled</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(30,30,58,0.8)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width:`${fillPct}%`,
                       background: fillPct>=90 ? 'linear-gradient(90deg,#ff0080,#8b2fff)'
                                 : fillPct>=60 ? 'linear-gradient(90deg,#ffb800,#ff6b00)'
                                 : `linear-gradient(90deg,${cfg.accent},${cfg.accent}99)`,
                     }} />
              </div>
            </div>

            {/* ── JOIN SECTION ─────────────────────────────────────────── */}
            {isJoined ? (
              <div className="rounded-xl p-4 flex items-center gap-3"
                   style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)' }}>
                <CheckCircle className="w-5 h-5 text-ea-green flex-shrink-0" />
                <div>
                  <p className="font-display font-bold text-ea-green">Aap Registered Hain! ✓</p>
                  <p className="font-body text-xs text-ea-muted">
                    {isLive ? 'Tournament live hai — Room details neeche dekhein' : 'Tournament live hone ka wait karo'}
                  </p>
                </div>
              </div>
            ) : isDone ? (
              <div className="rounded-xl p-4 text-center text-ea-muted font-display font-bold border border-ea-border">
                Tournament Khatam Ho Gaya
              </div>
            ) : !isFull && !canAfford && tournament.entry_fee > 0 ? (
              <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
                   style={{ background:'rgba(255,0,128,0.06)', border:'1px solid rgba(255,0,128,0.2)' }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-ea-magenta" />
                  <div>
                    <p className="font-display font-bold text-ea-magenta text-sm">Balance Kam Hai</p>
                    <p className="font-mono text-[11px] text-ea-muted">
                      Need {tournament.entry_fee} EC • Aapke paas {userProfile?.elite_coins_balance||0} EC
                    </p>
                  </div>
                </div>
                <Link to="/wallet" className="btn-neon-magenta px-4 py-2 rounded-xl text-sm">
                  Deposit Karo →
                </Link>
              </div>
            ) : isFull ? (
              <div className="rounded-xl p-4 text-center font-display font-bold border border-ea-magenta/20 text-ea-magenta"
                   style={{ background:'rgba(255,0,128,0.06)' }}>
                Tournament Full Hai — Koi Slot Nahi
              </div>
            ) : isTeam ? (
              /* ── TEAM JOIN UI ─────────────────────────────────────── */
              <div className="rounded-xl p-4 space-y-3"
                   style={{ background:'rgba(0,245,255,0.04)', border:'1px solid rgba(0,245,255,0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-ea-cyan" />
                  <p className="font-display font-bold text-ea-cyan text-sm">
                    {modeInfo.emoji} {modeInfo.label} Join — Sabhi {modeInfo.size} Members ke UID Daalo
                  </p>
                </div>
                <p className="font-mono text-[11px] text-ea-muted">
                  Har member ka Firebase UID chahiye (Profile page → UID copy button se milega).
                  Har member ke wallet se {tournament.entry_fee} EC deduct hogi.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Array.from({ length: modeInfo.size }).map((_, i) => (
                    <div key={i}>
                      <label className="block font-mono text-[10px] text-ea-dim mb-1">
                        Player {i+1} UID {i===0 ? '(You/Captain)' : ''}
                      </label>
                      <input
                        value={teamUIDs[i] || ''}
                        onChange={e => {
                          const next = [...teamUIDs];
                          next[i] = e.target.value;
                          setTeamUIDs(next);
                        }}
                        placeholder={i===0 ? 'Aapka UID (Profile pe milega)' : `Player ${i+1} ka UID`}
                        className="w-full input-cyber text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-ea-muted">
                  <span>Total cost: {modeInfo.size} × {tournament.entry_fee} EC = {modeInfo.size * tournament.entry_fee} EC</span>
                  <span>Each wins: {perMemberPrize} EC</span>
                </div>
                <button onClick={handleTeamJoin} disabled={joining}
                  className="w-full py-3 rounded-xl font-display font-bold text-sm
                             flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
                  style={{ background: cfg.btn, color: cfg.btnTxt }}>
                  {joining
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Joining…</>
                    : <><Zap className="w-4 h-4" /> {modeInfo.emoji} {modeInfo.label} Join — {modeInfo.size * tournament.entry_fee} EC</>}
                </button>
              </div>
            ) : (
              /* ── SOLO JOIN BUTTON ─────────────────────────────────── */
              <button onClick={handleSoloJoin} disabled={joining}
                className="w-full py-3.5 rounded-xl font-display font-bold text-sm
                           flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
                style={{ background: cfg.btn, color: cfg.btnTxt,
                         boxShadow: joining ? 'none' : `0 0 25px ${cfg.accent}40` }}>
                {joining
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Joining…</>
                  : <><Zap className="w-4 h-4" />
                      {tournament.entry_fee === 0 ? '⚡ Free Mein Join Karo' : `⚡ Join — ${tournament.entry_fee} EC`}
                    </>}
              </button>
            )}
          </div>
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left col — Room + Rules + Players */}
          <div className="lg:col-span-2 space-y-4">

            {/* Room code — shown only to registered + live */}
            {showRoom ? (
              <div className="rounded-2xl p-5"
                   style={{ background:'rgba(0,245,255,0.06)', border:'1px solid rgba(0,245,255,0.25)' }}>
                <h3 className="font-display font-bold text-ea-cyan text-base mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Room Details — Match Shuru Karo!
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl p-3" style={{ background:'rgba(6,6,18,0.8)' }}>
                    <p className="font-mono text-[10px] text-ea-muted uppercase tracking-wider mb-1">Room ID</p>
                    <p className="font-mono font-bold text-xl text-white tracking-wider">{roomId}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background:'rgba(6,6,18,0.8)' }}>
                    <p className="font-mono text-[10px] text-ea-muted uppercase tracking-wider mb-1">Password</p>
                    <p className="font-mono font-bold text-xl text-white tracking-wider">{roomPass}</p>
                  </div>
                </div>
                <button onClick={handleCopyCode}
                  className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                             flex items-center justify-center gap-2 transition-all active:scale-97"
                  style={{ background: codeCopied ? 'rgba(0,255,136,0.12)' : cfg.btn,
                           color: codeCopied ? '#00ff88' : cfg.btnTxt,
                           border: codeCopied ? '1px solid rgba(0,255,136,0.3)' : 'none' }}>
                  {codeCopied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Room Details Copy Karo</>}
                </button>
              </div>
            ) : isJoined && !isLive ? (
              <div className="rounded-2xl p-5 text-center"
                   style={{ background:'rgba(30,30,58,0.3)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <Clock className="w-8 h-8 text-ea-muted mx-auto mb-2" />
                <p className="font-display font-bold text-ea-text">Room ID tab milega jab Admin LIVE kare</p>
                <p className="font-body text-xs text-ea-muted mt-1">Notification aayegi — miss mat karna!</p>
              </div>
            ) : null}

            {/* Rules */}
            {tournament.rules && (
              <div className="rounded-2xl p-5"
                   style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <h3 className="font-display font-bold text-white text-sm mb-3">📋 Tournament Rules</h3>
                <p className="font-body text-sm text-ea-muted leading-relaxed whitespace-pre-wrap">{tournament.rules}</p>
              </div>
            )}

            {/* Registered players */}
            {registrations.length > 0 && (
              <div className="rounded-2xl overflow-hidden"
                   style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <div className="px-5 py-3.5 border-b border-ea-border flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-ea-cyan" /> Players
                  </h3>
                  <span className="badge-cyan text-[10px]">{registrations.length} registered</span>
                </div>
                <div className="divide-y divide-ea-border/30 max-h-48 overflow-y-auto no-scrollbar">
                  {registrations.slice(0,20).map((reg, i) => (
                    <div key={reg.id} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0"
                           style={{ background: i<3 ? `${cfg.accent}20` : 'rgba(30,30,58,0.6)',
                                    color: i<3 ? cfg.accent : '#5a5a8a' }}>
                        {i+1}
                      </div>
                      <span className="font-body text-sm text-ea-text flex-1 truncate">
                        {reg.username || reg.userId?.slice(0,8)+'…'}
                      </span>
                      {reg.teamId && (
                        <span className="font-mono text-[9px] text-ea-muted badge-cyan">{modeInfo.emoji}</span>
                      )}
                    </div>
                  ))}
                  {registrations.length > 20 && (
                    <div className="px-5 py-2.5 text-center">
                      <span className="font-mono text-[11px] text-ea-muted">
                        +{registrations.length - 20} more players
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Winner */}
            {isDone && tournament.winner_uid && (
              <div className="rounded-2xl p-5 text-center"
                   style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.3)' }}>
                <Trophy className="w-10 h-10 text-ea-gold mx-auto mb-2" />
                <p className="font-display font-bold text-ea-gold text-xl mb-1">🏆 Winner!</p>
                <p className="font-mono text-sm text-white">{tournament.winner_uid.slice(0,12)}…</p>
                <p className="font-mono text-ea-gold text-sm mt-1">{tournament.prize_pool} EC</p>
              </div>
            )}
          </div>

          {/* Right col — Stream + Chat + Ads */}
          <div className="space-y-4">
            <StreamEmbed tournament={tournament} />
            <TournamentChat tournamentId={id} isRegistered={isJoined} />
            <StreamPageAd />
          </div>
        </div>

        {/* Affiliate cards full-width */}
        <TournamentAffiliateAd />
      </div>
    </div>
  );
}