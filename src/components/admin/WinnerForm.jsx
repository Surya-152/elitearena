// src/components/admin/WinnerForm.jsx — v2: Solo/Duo/Squad prize split support
import { useState }     from 'react';
import {
  updateTournament, creditPrize, TOURNAMENT_MODES,
} from '../../services/tournamentService';
import { Trophy, Loader, CheckCircle, Zap, Users, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['upcoming','live','completed'];

export default function WinnerForm({ tournament, onUpdated }) {
  const {
    id, status, prize_pool, game_name,
    tournament_mode = 'solo', mode_size = 1,
  } = tournament;

  const modeInfo  = TOURNAMENT_MODES[tournament_mode?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
  const isTeam    = modeInfo.size > 1;
  const perMember = Math.floor(prize_pool / modeInfo.size);

  const [newStatus,     setNewStatus]     = useState(status);
  const [roomId,        setRoomId]        = useState(tournament.room_id        || '');
  const [roomPass,      setRoomPass]      = useState(tournament.room_password  || '');
  const [winnerUid,     setWinnerUid]     = useState('');
  const [teamMemberUids,setTeamMemberUids]= useState(Array(modeInfo.size).fill(''));
  const [savingStatus,  setSavingStatus]  = useState(false);
  const [savingWinner,  setSavingWinner]  = useState(false);

  const handleStatusUpdate = async () => {
    setSavingStatus(true);
    try {
      await updateTournament(id, {
        status:        newStatus,
        room_id:       roomId.trim(),
        room_password: roomPass.trim(),
      });
      toast.success(`Status → ${newStatus} ✅`);
      onUpdated?.();
    } catch (err) { toast.error(err.message); }
    finally { setSavingStatus(false); }
  };

  const handleCreditPrize = async () => {
    const captain = isTeam ? teamMemberUids[0].trim() : winnerUid.trim();
    if (!captain) { toast.error('Winner UID daalo.'); return; }

    const members = isTeam
      ? teamMemberUids.map(u => u.trim()).filter(Boolean)
      : [captain];

    if (isTeam && members.length !== modeInfo.size) {
      toast.error(`${modeInfo.label} tournament mein ${modeInfo.size} winners chahiye.`);
      return;
    }

    setSavingWinner(true);
    try {
      await creditPrize(captain, prize_pool, id, isTeam ? members : []);
      toast.success(
        isTeam
          ? `🏆 ${modeInfo.label} Prize Split! ${modeInfo.size} winners ko ${perMember} EC each milega.`
          : `🏆 ${prize_pool} EC winner ko credit ho gaya!`,
        { duration: 5000 }
      );
      onUpdated?.();
    } catch (err) { toast.error(err.message); }
    finally { setSavingWinner(false); }
  };

  return (
    <div className="space-y-5">

      {/* Tournament info bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-display font-bold text-white text-base">{game_name}</span>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full"
              style={{ background:`rgba(0,245,255,0.1)`, border:'1px solid rgba(0,245,255,0.2)', color:'#00f5ff' }}>
          {modeInfo.emoji} {modeInfo.label}
        </span>
        <span className="font-mono text-xs text-ea-gold">Prize: {prize_pool} EC</span>
        {isTeam && (
          <span className="font-mono text-xs text-ea-muted">
            ({perMember} EC per player × {modeInfo.size})
          </span>
        )}
      </div>

      {/* Status + Room */}
      <div className="rounded-2xl p-5 space-y-4"
           style={{ background:'rgba(6,6,18,0.6)', border:'1px solid rgba(30,30,58,0.8)' }}>
        <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-ea-cyan" /> Status & Room Details
        </h3>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setNewStatus(s)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all
                ${newStatus === s
                  ? s==='live' ? 'bg-ea-magenta text-white shadow-magenta'
                    : s==='completed' ? 'bg-ea-green/20 border border-ea-green/40 text-ea-green'
                    : 'bg-ea-cyan/15 border border-ea-cyan/30 text-ea-cyan'
                  : 'border border-ea-border text-ea-muted hover:text-ea-text'}`}>
              {s==='live' ? '🔴 LIVE' : s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-xs text-ea-muted mb-1">Room ID</label>
            <input value={roomId} onChange={e => setRoomId(e.target.value)}
              placeholder="Room ID (BGMI/FF app se copy karo)"
              className="w-full input-cyber text-sm font-mono" />
          </div>
          <div>
            <label className="block font-body text-xs text-ea-muted mb-1">Room Password</label>
            <input value={roomPass} onChange={e => setRoomPass(e.target.value)}
              placeholder="Room Password"
              className="w-full input-cyber text-sm font-mono" />
          </div>
        </div>

        <button onClick={handleStatusUpdate} disabled={savingStatus}
          className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                     flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-50"
          style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', color:'#02020a' }}>
          {savingStatus ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {savingStatus ? 'Saving…' : 'Status & Room Update Karo'}
        </button>
      </div>

      {/* Winner / Prize */}
      {status !== 'upcoming' && (
        <div className="rounded-2xl p-5 space-y-4"
             style={{ background:'rgba(255,184,0,0.04)', border:'1px solid rgba(255,184,0,0.2)' }}>
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-ea-gold" />
            Prize Credit — {modeInfo.emoji} {modeInfo.label}
            {isTeam && <span className="text-ea-muted font-normal text-xs">({perMember} EC each)</span>}
          </h3>

          {isTeam ? (
            // Team mode: collect all member UIDs
            <div className="space-y-2">
              <p className="font-mono text-[11px] text-ea-muted">
                Winning team ke sabhi {modeInfo.size} members ke Firebase UID daalo:
              </p>
              {Array.from({ length: modeInfo.size }).map((_, i) => (
                <div key={i}>
                  <label className="block font-mono text-[10px] text-ea-dim mb-1">
                    Player {i+1} UID {i===0 ? '(Team Captain)' : ''}
                  </label>
                  <input
                    value={teamMemberUids[i]}
                    onChange={e => {
                      const next = [...teamMemberUids];
                      next[i] = e.target.value;
                      setTeamMemberUids(next);
                    }}
                    placeholder={`Player ${i+1} Firebase UID`}
                    className="w-full input-cyber text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Solo mode: single winner UID
            <div>
              <label className="block font-mono text-[11px] text-ea-muted mb-1">
                Winner ka Firebase UID daalo (Profile page pe milega)
              </label>
              <input value={winnerUid} onChange={e => setWinnerUid(e.target.value)}
                placeholder="Firebase UID (Profile → UID field se copy karo)"
                className="w-full input-cyber text-sm font-mono" />
            </div>
          )}

          {/* Prize preview */}
          <div className="rounded-xl p-3 flex items-center justify-between"
               style={{ background:'rgba(255,184,0,0.06)' }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-ea-gold" />
              <span className="font-body text-sm text-ea-muted">
                {isTeam ? `Each player ko:` : 'Winner ko:'}
              </span>
            </div>
            <span className="font-display font-bold text-ea-gold text-lg">
              {isTeam ? `${perMember} EC` : `${prize_pool} EC`}
            </span>
          </div>

          <button onClick={handleCreditPrize} disabled={savingWinner || !!tournament.winner_uid}
            className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                       flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-50"
            style={{
              background: tournament.winner_uid
                ? 'rgba(0,255,136,0.1)'
                : 'linear-gradient(135deg,#ffb800,#ff6b00)',
              border: tournament.winner_uid ? '1px solid rgba(0,255,136,0.3)' : 'none',
              color: tournament.winner_uid ? '#00ff88' : '#02020a',
            }}>
            {savingWinner
              ? <Loader className="w-4 h-4 animate-spin" />
              : tournament.winner_uid
              ? <CheckCircle className="w-4 h-4" />
              : <Trophy className="w-4 h-4" />}
            {savingWinner
              ? 'Credit ho raha hai…'
              : tournament.winner_uid
              ? '✅ Prize Already Credited'
              : `Prize Credit Karo — ${prize_pool} EC`}
          </button>
        </div>
      )}
    </div>
  );
}
