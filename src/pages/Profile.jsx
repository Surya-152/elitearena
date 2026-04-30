// src/pages/Profile.jsx — Profile + Match History + Referral (with WhatsApp share)
import { useState, useEffect }    from 'react';
import { Link }                   from 'react-router-dom';
import { useAuth }                from '../context/AuthContext';
import { useSEO }                 from '../hooks/useSEO';
import { useMatchHistory }        from '../hooks/useMatchHistory';
import { updateUsername, changePassword } from '../services/authService';
import { getReferralStats }       from '../services/referralService';
import {
  User, Zap, Trophy, Save, Loader, Shield, Lock,
  Eye, EyeOff, CheckCircle, Clock, XCircle, ChevronRight,
  Copy, Users, Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const KYC_CFG = {
  pending:  { label:'KYC Required — Withdrawal blocked', color:'text-ea-muted',   icon:Clock,       bg:'bg-ea-dim/10 border-ea-border'          },
  submitted:{ label:'KYC Under Review (24-48 hrs)',      color:'text-ea-gold',    icon:Clock,       bg:'bg-ea-gold/10 border-ea-gold/20'         },
  approved: { label:'KYC Verified ✓',                   color:'text-ea-green',   icon:CheckCircle, bg:'bg-ea-green/10 border-ea-green/20'       },
  rejected: { label:'KYC Rejected — Resubmit karo',     color:'text-ea-magenta', icon:XCircle,     bg:'bg-ea-magenta/10 border-ea-magenta/20'   },
};
const TABS = ['Profile', 'Matches', 'Referral'];

export default function Profile() {
  const { userProfile, isAdmin } = useAuth();
  useSEO({ title:'My Profile', description:'Apna EliteArena profile manage karo.', noIndex:true });

  const { matches, loading: matchLoading } = useMatchHistory(userProfile?.uid);

  const [tab,      setTab]    = useState('Profile');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [saving,   setSaving] = useState(false);
  const [usrErr,   setUsrErr] = useState('');

  const [pw,      setPw]      = useState({ current:'', newPw:'', confirm:'' });
  const [pwErr,   setPwErr]   = useState({});
  const [pwSaving,setPwSaving]= useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const [refStats, setRefStats] = useState(null);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    getReferralStats(userProfile.uid).then(setRefStats).catch(() => {});
  }, [userProfile?.uid]);

  if (!userProfile) return null;

  const kycStatus = userProfile.kycStatus || 'pending';
  const kycCfg    = KYC_CFG[kycStatus] ?? KYC_CFG.pending;
  const KycIcon   = kycCfg.icon;

  const handleSave = async () => {
    const u = username.trim();
    if (!u || u.length < 3 || u.length > 20 || !/^[a-zA-Z0-9_]+$/.test(u)) {
      setUsrErr('3-20 chars, letters/numbers/underscore only.');
      return;
    }
    setSaving(true);
    try {
      await updateUsername(userProfile.uid, u);
      toast.success('Username updated! ✅');
      setUsrErr('');
    } catch (e) { setUsrErr(e.message); }
    finally { setSaving(false); }
  };

  const handlePwChange = async () => {
    const e = {};
    if (!pw.current)              e.current = 'Current password daalo.';
    if (!pw.newPw || pw.newPw.length < 6) e.newPw = 'Min 6 characters.';
    else if (!/[0-9]/.test(pw.newPw)) e.newPw = 'Ek number zaroori hai.';
    if (pw.newPw !== pw.confirm)  e.confirm = 'Passwords match nahi karte.';
    if (Object.keys(e).length) { setPwErr(e); return; }
    setPwSaving(true);
    try {
      await changePassword(pw.current, pw.newPw);
      toast.success('Password changed! 🔒');
      setPw({ current:'', newPw:'', confirm:'' });
      setPwErr({});
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' ? 'Current password galat hai.' : e.message;
      setPwErr({ current: msg });
    }
    finally { setPwSaving(false); }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${userProfile.uid}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🎮 EliteArena pe join karo aur free +25 EC pao! India ka #1 BGMI & Free Fire tournament platform.\n${window.location.origin}/register?ref=${userProfile.uid}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const joined = userProfile.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
    year:'numeric', month:'short', day:'numeric',
  }) || '—';

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-5 animate-fade-up">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-ea-cyan/30 via-ea-magenta/30 to-ea-cyan/30" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-white"
                   style={{ background:'linear-gradient(135deg,rgba(0,245,255,0.2),rgba(255,0,128,0.2))', border:'1px solid rgba(0,245,255,0.3)' }}>
                {(userProfile.username || 'U')[0].toUpperCase()}
              </div>
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ea-magenta rounded-lg flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-white truncate">{userProfile.username}</h1>
                {isAdmin && <span className="badge-magenta">Admin</span>}
                {userProfile.emailVerified && <span className="badge-green">Verified</span>}
              </div>
              <p className="text-ea-muted text-sm mt-0.5 truncate">{userProfile.email}</p>
              <p className="text-ea-dim font-mono text-xs mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3 h-3" /> Member since {joined}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label:'EC Balance',  value:`${(userProfile.elite_coins_balance??0).toLocaleString()} EC`, color:'text-ea-gold'    },
              { label:'Winnings',    value:`${(userProfile.total_winnings??0).toLocaleString()} EC`,       color:'text-ea-cyan'    },
              { label:'Matches',     value: userProfile.matches_played ?? 0,                              color:'text-ea-magenta' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-2.5 sm:p-3 text-center"
                   style={{ background:'rgba(6,6,18,0.6)' }}>
                <div className={`font-display font-bold text-base sm:text-lg ${color}`}>{value}</div>
                <div className="font-body text-[9px] sm:text-[10px] text-ea-muted uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KYC link ─────────────────────────────────────────────────── */}
        <Link to="/kyc"
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:opacity-90 ${kycCfg.bg}`}>
          <KycIcon className={`w-5 h-5 flex-shrink-0 ${kycCfg.color}`} />
          <div className="flex-1 min-w-0">
            <p className={`font-display font-bold text-sm ${kycCfg.color} truncate`}>{kycCfg.label}</p>
            {kycStatus !== 'approved' && (
              <p className="text-ea-muted text-xs mt-0.5">Withdrawal ke liye KYC complete karo →</p>
            )}
            {kycStatus === 'rejected' && userProfile.kycRejectReason && (
              <p className="text-ea-magenta text-xs mt-0.5 truncate">Reason: {userProfile.kycRejectReason}</p>
            )}
          </div>
          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${kycCfg.color}`} />
        </Link>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1.5 rounded-2xl"
             style={{ background:'rgba(16,16,31,0.8)', border:'1px solid rgba(30,30,58,0.8)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all duration-200
                ${tab === t ? 'text-ea-void shadow-cyan' : 'text-ea-muted hover:text-ea-text'}`}
              style={tab === t ? { background:'linear-gradient(135deg,#00f5ff,#0080ff)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* ── TAB: Profile ─────────────────────────────────────────────── */}
        {tab === 'Profile' && (
          <div className="space-y-5 animate-fade-in">

            {/* Username edit */}
            <div className="rounded-2xl p-5 sm:p-6"
                 style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <h2 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-ea-cyan" /> Edit Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Username</label>
                  <input value={username}
                    onChange={e => { setUsername(e.target.value); setUsrErr(''); }}
                    placeholder="Your username" maxLength={20}
                    className={`input-cyber ${usrErr ? 'input-error' : ''}`} />
                  {usrErr && <p className="font-mono text-[11px] text-ea-magenta mt-1">{usrErr}</p>}
                  <p className="text-ea-dim text-xs mt-1 font-mono">{username.length}/20</p>
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Email (read-only)</label>
                  <input value={userProfile.email} disabled
                    className="input-cyber opacity-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ea-text mb-1.5">
                    Firebase UID <span className="text-ea-dim text-xs">(Admin balance adjustment ke liye)</span>
                  </label>
                  <div className="relative">
                    <input value={userProfile.uid} readOnly
                      className="input-cyber pr-10 font-mono text-xs opacity-60 cursor-default" />
                    <button
                      onClick={() => { navigator.clipboard?.writeText(userProfile.uid); toast.success('UID copied!'); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ea-muted hover:text-ea-cyan transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button onClick={handleSave}
                  disabled={saving || username.trim() === userProfile.username}
                  className="btn-neon-cyan w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl p-5 sm:p-6"
                 style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <h2 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-ea-magenta" /> Change Password
              </h2>
              <div className="space-y-4">
                {[
                  { label:'Current Password', key:'current', ac:'current-password' },
                  { label:'New Password',      key:'newPw',  ac:'new-password'     },
                  { label:'Confirm New',       key:'confirm',ac:'new-password'     },
                ].map(({ label, key, ac }) => (
                  <div key={key}>
                    <label className="block font-body text-sm font-medium text-ea-text mb-1.5">{label}</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} autoComplete={ac}
                        value={pw[key]}
                        onChange={e => { setPw(p => ({...p,[key]:e.target.value})); setPwErr(p => ({...p,[key]:undefined})); }}
                        placeholder="••••••••"
                        className={`input-cyber pr-12 ${pwErr[key] ? 'input-error' : ''}`} />
                      {key === 'current' && (
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ea-muted hover:text-ea-text transition-colors">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    {pwErr[key] && <p className="font-mono text-[11px] text-ea-magenta mt-1">{pwErr[key]}</p>}
                  </div>
                ))}
                <p className="text-ea-dim text-xs font-body">Google se login kiya hai toh password change nahi hoga.</p>
                <button onClick={handlePwChange} disabled={pwSaving}
                  className="btn-neon-magenta w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Match History ────────────────────────────────────────── */}
        {tab === 'Matches' && (
          <div className="animate-fade-in rounded-2xl overflow-hidden"
               style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
            <div className="px-5 py-4 border-b border-ea-border flex items-center gap-2">
              <Trophy className="w-4 h-4 text-ea-gold" />
              <span className="font-display font-bold text-white">Match History</span>
              <span className="ml-auto font-mono text-xs text-ea-muted">{matches.length} matches</span>
            </div>

            {matchLoading ? (
              <div className="divide-y divide-ea-border/40">
                {[0,1,2].map(i => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 skeleton rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 skeleton rounded w-2/3 mb-1" />
                      <div className="h-3 skeleton rounded w-1/3" />
                    </div>
                    <div className="w-14 h-4 skeleton rounded" />
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="w-10 h-10 text-ea-border mx-auto mb-3" />
                <p className="font-display font-bold text-ea-text">Koi match nahi khela abhi</p>
                <p className="text-ea-muted text-sm mt-1">Dashboard se tournament join karo!</p>
                <Link to="/dashboard"
                  className="btn-neon-cyan inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm mt-4">
                  Browse Tournaments →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-ea-border/40">
                {matches.map((m, i) => {
                  const date = m.joinedAt?.toDate ? m.joinedAt.toDate() : new Date();
                  return (
                    <Link to={`/tournament/${m.id}`} key={m.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-ea-surface/40 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                           style={{ background:'rgba(0,245,255,0.1)', border:'1px solid rgba(0,245,255,0.2)', color:'#00f5ff' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-body text-sm font-medium truncate">
                          Tournament {m.id.slice(0,8)}…
                        </p>
                        <p className="text-ea-muted text-xs font-mono">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                      </div>
                      {m.entry_fee === 0
                        ? <span className="badge-green flex-shrink-0">FREE</span>
                        : <span className="font-mono text-xs text-ea-gold flex-shrink-0">-{m.entry_fee} EC</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Referral ─────────────────────────────────────────────── */}
        {tab === 'Referral' && (
          <div className="space-y-4 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card cyan p-4">
                <Users className="w-4 h-4 text-ea-cyan mb-2" />
                <div className="font-display font-bold text-2xl text-ea-cyan">
                  {refStats?.totalReferrals ?? 0}
                </div>
                <div className="text-ea-muted text-xs mt-1">Friends Referred</div>
              </div>
              <div className="stat-card gold p-4">
                <Zap className="w-4 h-4 text-ea-gold mb-2" />
                <div className="font-display font-bold text-2xl text-ea-gold">
                  {refStats?.totalEarned ?? 0} EC
                </div>
                <div className="text-ea-muted text-xs mt-1">EC Earned</div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl p-5"
                 style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <h3 className="font-display font-bold text-white text-base mb-4">🤝 Refer & Earn</h3>
              <div className="space-y-3 mb-5">
                {[
                  { n:'01', text:`Apna referral link share karo`,             color:'cyan'    },
                  { n:'02', text:`Dost register kare toh unhe +25 EC milta`, color:'gold'    },
                  { n:'03', text:`Aapko +50 EC bonus milega`,                 color:'magenta' },
                ].map(({ n, text, color }) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0
                      ${color==='cyan'?'bg-ea-cyan/10 text-ea-cyan border border-ea-cyan/20':
                        color==='gold'?'bg-ea-gold/10 text-ea-gold border border-ea-gold/20':
                                       'bg-ea-magenta/10 text-ea-magenta border border-ea-magenta/20'}`}>
                      {n}
                    </div>
                    <p className="font-body text-sm text-ea-text">{text}</p>
                  </div>
                ))}
              </div>

              {/* Referral link */}
              <div>
                <label className="block font-body text-xs text-ea-muted mb-1.5 uppercase tracking-wider">
                  Your Referral Link
                </label>
                <input readOnly
                  value={`${window.location.origin}/register?ref=${userProfile.uid}`}
                  className="input-cyber text-xs font-mono opacity-70 cursor-default mb-2" />

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={copyReferralLink}
                    className="flex-1 btn-neon-cyan py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={shareWhatsApp}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5
                               font-display font-bold text-sm text-white transition-all hover:opacity-90"
                    style={{ background:'#25D366' }}>
                    📱 WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
