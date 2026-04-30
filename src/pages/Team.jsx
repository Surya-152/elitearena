// src/pages/Team.jsx — Team/Squad management page
import { useState, useEffect } from 'react';
import { useSEO }              from '../hooks/useSEO';
import { useAuth }             from '../context/AuthContext';
import {
  createTeam, joinTeamByCode, leaveTeam,
  generateInviteCode, subscribeTeam, fetchTopTeams,
} from '../services/teamService';
import {
  Users, Shield, Copy, UserPlus, LogOut,
  Trophy, Zap, Plus, Hash, Star, Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Team() {
  const { userProfile } = useAuth();
  useSEO({ title:'Team Management', description:'Apni esports team banao ya join karo EliteArena pe.', noIndex:true });

  const [team,      setTeam]    = useState(null);
  const [topTeams,  setTopTeams]= useState([]);
  const [tab,       setTab]     = useState(userProfile?.teamId ? 'my-team' : 'create');
  const [loading,   setLoading] = useState(true);
  const [teamName,  setTeamName]= useState('');
  const [invCode,   setInvCode] = useState('');
  const [genCode,   setGenCode] = useState('');
  const [busy,      setBusy]    = useState(false);

  useEffect(() => {
    if (!userProfile?.teamId) { setLoading(false); return; }
    const unsub = subscribeTeam(userProfile.teamId, data => { setTeam(data); setLoading(false); }, () => setLoading(false));
    return unsub;
  }, [userProfile?.teamId]);

  useEffect(() => {
    fetchTopTeams(10).then(setTopTeams).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    setBusy(true);
    try {
      await createTeam(userProfile.uid, userProfile.username, teamName);
      toast.success('Team create ho gayi! 🎉');
      setTab('my-team');
    } catch(e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handleJoin = async () => {
    if (!invCode.trim()) return;
    setBusy(true);
    try {
      await joinTeamByCode(userProfile.uid, userProfile.username, invCode);
      toast.success('Team join kar li! 🎮');
      setTab('my-team');
    } catch(e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handleLeave = async () => {
    if (!window.confirm('Kya aap sach mein team leave karna chahte hain?')) return;
    setBusy(true);
    try {
      await leaveTeam(userProfile.uid, team.id);
      toast.success('Team leave kar di.');
      setTeam(null); setTab('create');
    } catch(e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handleGenCode = async () => {
    setBusy(true);
    try {
      const code = await generateInviteCode(team.id, userProfile.uid);
      setGenCode(code);
      navigator.clipboard?.writeText(code);
      toast.success('Invite code generate hua aur copy ho gaya!');
    } catch(e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const isCaptain = team?.captainUid === userProfile?.uid;

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto animate-fade-up space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Team{' '}
            <span style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Management
            </span>
          </h1>
          <p className="font-body text-ea-muted text-sm mt-1">Squad banao, invite karo, saath khelo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Actions */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tabs */}
            {!userProfile?.teamId && (
              <div className="flex gap-1 p-1.5 rounded-2xl" style={{ background:'rgba(16,16,31,0.8)', border:'1px solid rgba(30,30,58,0.8)' }}>
                {[{k:'create',l:'Create Team'},{k:'join',l:'Join Team'}].map(({k,l}) => (
                  <button key={k} onClick={() => setTab(k)}
                    className={`flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all
                      ${tab===k ? 'text-ea-void shadow-cyan' : 'text-ea-muted hover:text-white'}`}
                    style={tab===k ? {background:'linear-gradient(135deg,#00f5ff,#0080ff)'} : {}}>
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* Create Team */}
            {tab === 'create' && !userProfile?.teamId && (
              <div className="rounded-2xl p-6" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-ea-cyan" /> Nayi Team Banao
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-body text-sm text-ea-text mb-1.5">Team Name</label>
                    <input value={teamName} onChange={e => setTeamName(e.target.value)}
                      placeholder="Aapki team ka naam…" maxLength={30}
                      className="input-cyber" />
                    <p className="text-ea-dim text-xs mt-1 font-mono">{teamName.length}/30</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ m:'SOLO', e:'🎯' },{ m:'DUO', e:'👥' },{ m:'SQUAD', e:'⚔️' }].map(({ m, e }) => (
                      <div key={m} className="rounded-xl p-3 text-center border border-ea-border bg-ea-surface/30">
                        <div className="text-2xl mb-1">{e}</div>
                        <div className="font-display font-bold text-xs text-white">{m}</div>
                        <div className="font-mono text-[10px] text-ea-muted">{m==='SOLO'?'1':m==='DUO'?'2':'4'} players</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleCreate} disabled={busy || !teamName.trim()}
                    className="btn-neon-cyan w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    {busy ? 'Creating…' : 'Create Team'}
                  </button>
                </div>
              </div>
            )}

            {/* Join Team */}
            {tab === 'join' && !userProfile?.teamId && (
              <div className="rounded-2xl p-6" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-ea-magenta" /> Team Join Karo
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-body text-sm text-ea-text mb-1.5">
                      Invite Code <span className="text-ea-dim text-xs">(captain se maango)</span>
                    </label>
                    <input value={invCode} onChange={e => setInvCode(e.target.value.toUpperCase())}
                      placeholder="6-digit code (e.g. ABC123)"
                      maxLength={6} className="input-cyber font-mono tracking-widest text-base sm:text-lg text-center" />
                  </div>
                  <button onClick={handleJoin} disabled={busy || invCode.length < 6}
                    className="btn-neon-magenta w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {busy ? 'Joining…' : 'Join Team'}
                  </button>
                </div>
              </div>
            )}

            {/* My Team */}
            {team && (
              <div className="rounded-2xl overflow-hidden" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(0,245,255,0.2)' }}>
                <div className="h-px bg-gradient-to-r from-ea-cyan/40 via-ea-magenta/40 to-ea-cyan/40" />
                <div className="p-6">
                  {/* Team header */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-2xl text-white">{team.name}</h3>
                        {isCaptain && <span className="badge-gold">Captain 👑</span>}
                      </div>
                      <p className="text-ea-muted text-sm font-mono">{team.memberIds.length}/4 members</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-xl text-ea-gold">{team.totalEarnings||0} EC</div>
                      <div className="font-mono text-[10px] text-ea-muted">Total Earnings</div>
                    </div>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2 mb-5">
                    {(team.members||[]).map(m => (
                      <div key={m.uid} className="flex items-center gap-3 p-3 rounded-xl"
                           style={{ background:'rgba(6,6,18,0.5)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                             style={{ background: m.role==='captain' ? 'linear-gradient(135deg,#ffb800,#ff6b00)' : 'rgba(0,245,255,0.1)',
                                      color: m.role==='captain' ? '#02020a' : '#00f5ff' }}>
                          {m.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm text-white font-medium">{m.username}</p>
                          <p className="font-mono text-[10px] text-ea-muted capitalize">{m.role}</p>
                        </div>
                        {m.uid === userProfile.uid && (
                          <span className="font-mono text-[10px] text-ea-cyan">You</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    {isCaptain && (
                      <button onClick={handleGenCode} disabled={busy}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-50"
                        style={{ background:'rgba(0,245,255,0.1)', border:'1px solid rgba(0,245,255,0.25)', color:'#00f5ff' }}>
                        <Hash className="w-4 h-4" />
                        {busy ? 'Generating…' : 'Generate Invite Code'}
                      </button>
                    )}
                    {genCode && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                           style={{ background:'rgba(255,184,0,0.1)', border:'1px solid rgba(255,184,0,0.3)' }}>
                        <span className="font-mono font-bold text-ea-gold tracking-widest">{genCode}</span>
                        <button onClick={() => { navigator.clipboard?.writeText(genCode); toast.success('Copied!'); }}>
                          <Copy className="w-3.5 h-3.5 text-ea-gold" />
                        </button>
                      </div>
                    )}
                    <button onClick={handleLeave} disabled={busy}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-sm transition-all
                                 text-ea-magenta hover:bg-ea-magenta/10 border border-ea-magenta/20">
                      <LogOut className="w-4 h-4" /> Leave Team
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Team Leaderboard */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <div className="px-4 py-3 border-b border-ea-border flex items-center gap-2">
                <Trophy className="w-4 h-4 text-ea-gold" />
                <span className="font-display font-bold text-white text-sm">Top Teams</span>
              </div>
              <div className="divide-y divide-ea-border/40">
                {topTeams.length === 0 && (
                  <p className="px-4 py-6 text-center text-ea-muted text-sm">No teams yet.</p>
                )}
                {topTeams.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold
                      ${i===0?'bg-ea-gold text-ea-void':i===1?'bg-ea-muted text-white':i===2?'bg-amber-700 text-white':'bg-ea-border text-ea-muted'}`}>
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white font-medium truncate">{t.name}</p>
                      <p className="font-mono text-[10px] text-ea-muted">{t.memberIds.length} members</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-ea-gold">{t.totalEarnings||0} EC</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="rounded-2xl p-4" style={{ background:'linear-gradient(145deg,#0c1012,#080c10)', border:'1px solid rgba(0,245,255,0.08)' }}>
              <p className="font-display font-bold text-ea-cyan text-sm mb-2">💡 Team Tips</p>
              <div className="space-y-1.5">
                {['Captain invite code generate karta hai', 'Max 4 members per team', 'Squad tournaments mein sirf teams join kar sakti hain', 'Team earnings leaderboard pe track hoti hain'].map((tip,i) => (
                  <p key={i} className="font-body text-xs text-ea-muted flex gap-1.5">
                    <span className="text-ea-cyan">•</span>{tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
