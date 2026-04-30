// src/components/admin/TournamentForm.jsx — v2: Solo/Duo/Squad + Sponsor + Stream URL
import { useState }      from 'react';
import { createTournament, TOURNAMENT_MODES, GAME_LIST } from '../../services/tournamentService';
import { Timestamp }     from 'firebase/firestore';
import { Plus, Loader, Trophy, Zap, Users, Calendar, Shield, Youtube } from 'lucide-react';
import toast             from 'react-hot-toast';

const INITIAL = {
  game_name:       'BGMI',
  tournament_mode: 'solo',
  entry_fee:       0,
  prize_pool:      500,
  slots_total:     100,
  start_time:      '',
  rules:           '',
  stream_url:      '',
  stream_platform: 'youtube',
  sponsor_name:    '',
  sponsor_logo:    '',
};

export default function TournamentForm({ onCreated }) {
  const [form,   setForm]   = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab,    setTab]    = useState('basic'); // basic | advanced

  const selectedMode = TOURNAMENT_MODES[form.tournament_mode?.toUpperCase()] || TOURNAMENT_MODES.SOLO;
  const selectedGame = GAME_LIST.find(g => g.name === form.game_name) || GAME_LIST[0];

  const validate = () => {
    const e = {};
    if (!form.game_name)        e.game_name       = 'Game select karo.';
    if (!form.tournament_mode)  e.tournament_mode = 'Mode select karo.';
    if (form.entry_fee < 0)     e.entry_fee       = 'Entry fee negative nahi ho sakti.';
    if (form.prize_pool <= 0)   e.prize_pool      = 'Prize pool > 0 hona chahiye.';
    if (form.slots_total < 2)   e.slots_total     = 'Min 2 slots chahiye.';
    else if (selectedMode.size > 1 && form.slots_total % selectedMode.size !== 0) {
      e.slots_total = `${selectedMode.label} ke liye slots ${selectedMode.size} ka multiple hona chahiye.`;
    }
    if (!form.start_time)       e.start_time      = 'Start time required hai.';
    else if (new Date(form.start_time) <= new Date()) e.start_time = 'Future time daalo.';
    return e;
  };

  const handleChange = ({ target: { name, value, type } }) => {
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    // Auto-fix slots for team modes
    if (name === 'tournament_mode') {
      const m = TOURNAMENT_MODES[value.toUpperCase()];
      if (m && m.size > 1) {
        const fixed = Math.ceil(form.slots_total / m.size) * m.size;
        setForm(prev => ({ ...prev, [name]: value, slots_total: fixed }));
      }
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createTournament({
        ...form,
        start_time: Timestamp.fromDate(new Date(form.start_time)),
      });
      toast.success(`${form.game_name} ${selectedMode.emoji} ${selectedMode.label} tournament create ho gaya! 🏆`);
      setForm(INITIAL);
      onCreated?.();
    } catch (err) {
      toast.error(err.message || 'Tournament create karne mein problem aayi.');
    } finally {
      setSaving(false);
    }
  };

  // Revenue preview
  const totalEntries   = form.slots_total * form.entry_fee;
  const platformProfit = Math.max(0, totalEntries - form.prize_pool);
  const teamsCount     = selectedMode.size > 1 ? Math.floor(form.slots_total / selectedMode.size) : form.slots_total;

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>

      <div className="px-6 py-4 border-b border-ea-border flex items-center gap-2">
        <Plus className="w-5 h-5 text-ea-cyan" />
        <h2 className="font-display font-bold text-white text-lg">New Tournament Create Karo</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ea-border">
        {[{k:'basic',l:'Basic Info'},{k:'advanced',l:'Stream & Sponsor'}].map(({k,l}) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-3 font-display font-bold text-sm transition-all
              ${tab===k ? 'text-ea-cyan border-b-2 border-ea-cyan' : 'text-ea-muted hover:text-ea-text'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'basic' && (
          <div className="space-y-5">

            {/* ── Mode Selection — MOST IMPORTANT ─────────────────────────── */}
            <div>
              <label className="block font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-ea-cyan" /> Tournament Mode *
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3">
                {Object.values(TOURNAMENT_MODES).map(m => (
                  <button key={m.key}
                    type="button"
                    onClick={() => {
                      setForm(prev => {
                        const fixed = m.size > 1 ? Math.ceil(prev.slots_total / m.size) * m.size : prev.slots_total;
                        return { ...prev, tournament_mode: m.key, slots_total: fixed };
                      });
                      setErrors(prev => ({ ...prev, tournament_mode: undefined }));
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2
                                transition-all duration-200 font-body
                      ${form.tournament_mode === m.key
                        ? 'border-ea-cyan bg-ea-cyan/10 shadow-cyan'
                        : 'border-ea-border bg-ea-surface/30 hover:border-ea-rim'}`}>
                    <span className="text-3xl">{m.emoji}</span>
                    <div className="text-center">
                      <div className={`font-display font-bold text-sm
                        ${form.tournament_mode === m.key ? 'text-ea-cyan' : 'text-white'}`}>
                        {m.label}
                      </div>
                      <div className="text-ea-muted text-[10px] mt-0.5">{m.desc}</div>
                      <div className="text-ea-dim text-[10px]">{m.size} player{m.size>1?'s':''}</div>
                    </div>
                    {form.tournament_mode === m.key && (
                      <div className="w-2 h-2 rounded-full bg-ea-cyan" />
                    )}
                  </button>
                ))}
              </div>
              {errors.tournament_mode && (
                <p className="text-ea-magenta text-xs mt-1">{errors.tournament_mode}</p>
              )}
            </div>

            {/* ── Game Selection ──────────────────────────────────────────── */}
            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-2 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-ea-gold" /> Game *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GAME_LIST.map(g => (
                  <button key={g.name} type="button"
                    onClick={() => { setForm(prev => ({...prev, game_name:g.name})); setErrors(prev => ({...prev,game_name:undefined})); }}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all
                      ${form.game_name === g.name
                        ? 'border-ea-gold/50 bg-ea-gold/8 text-white'
                        : 'border-ea-border text-ea-muted hover:border-ea-rim hover:text-ea-text'}`}>
                    <span className="text-lg">{g.emoji}</span>
                    <span className="font-body text-xs font-medium truncate">{g.name}</span>
                  </button>
                ))}
              </div>
              {errors.game_name && <p className="text-ea-magenta text-xs mt-1">{errors.game_name}</p>}
            </div>

            {/* ── Entry Fee + Prize Pool ──────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <Fg label="Entry Fee (EC per player)" error={errors.entry_fee}
                  hint={form.entry_fee === 0 ? '0 = Free tournament' : `₹${form.entry_fee} per player`}>
                <input type="number" name="entry_fee" min="0" value={form.entry_fee}
                  onChange={handleChange} className={inp(errors.entry_fee)}
                  placeholder="0 for free" />
              </Fg>
              <Fg label="Prize Pool (EC)" error={errors.prize_pool}
                  hint={`₹${form.prize_pool} total prize`}>
                <input type="number" name="prize_pool" min="1" value={form.prize_pool}
                  onChange={handleChange} className={inp(errors.prize_pool)}
                  placeholder="e.g. 5000" />
              </Fg>
            </div>

            {/* ── Slots ──────────────────────────────────────────────────── */}
            <Fg label="Total Slots" error={errors.slots_total}
                hint={selectedMode.size > 1
                  ? `= ${teamsCount} teams × ${selectedMode.size} players each`
                  : `= ${form.slots_total} solo players`}>
              <input type="number" name="slots_total" min="2" max="1000"
                value={form.slots_total} onChange={handleChange}
                className={inp(errors.slots_total)} />
            </Fg>

            {/* ── Start Time ─────────────────────────────────────────────── */}
            <Fg label="Start Date & Time" error={errors.start_time}>
              <input type="datetime-local" name="start_time"
                value={form.start_time} onChange={handleChange}
                min={new Date(Date.now() + 5*60000).toISOString().slice(0,16)}
                className={inp(errors.start_time)} />
            </Fg>

            {/* ── Rules ──────────────────────────────────────────────────── */}
            <Fg label="Rules / Notes (optional)">
              <textarea name="rules" rows={3} value={form.rules} onChange={handleChange}
                placeholder="e.g. TPP mode only, no emulators, no lag hacks, kick on cheating…"
                className={`${inp()} resize-none`} />
            </Fg>

            {/* ── Revenue Preview ─────────────────────────────────────────── */}
            {form.entry_fee > 0 && (
              <div className="rounded-xl p-4"
                   style={{ background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.15)' }}>
                <p className="font-display font-bold text-ea-green text-sm mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Revenue Preview
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { l:'Total Collected', v:`${totalEntries.toLocaleString()} EC`, c:'text-white' },
                    { l:'Prize Pool',      v:`${form.prize_pool.toLocaleString()} EC`, c:'text-ea-gold' },
                    { l:'Your Profit',     v:`${platformProfit.toLocaleString()} EC`, c:'text-ea-green' },
                  ].map(({l,v,c}) => (
                    <div key={l}>
                      <div className={`font-display font-bold text-lg ${c}`}>{v}</div>
                      <div className="font-mono text-[10px] text-ea-muted mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'advanced' && (
          <div className="space-y-5">
            <div className="p-3 rounded-xl font-body text-xs text-ea-muted"
                 style={{ background:'rgba(0,245,255,0.04)', border:'1px solid rgba(0,245,255,0.1)' }}>
              💡 Ye fields optional hain. Stream aur sponsor details baad mein bhi add kar sakte ho "Manage" se.
            </div>

            <Fg label="YouTube / Twitch Stream URL (optional)"
                hint="Tournament live stream ka link — Match Room mein embed hoga">
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <input name="stream_url" value={form.stream_url} onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=... ya twitch.tv/channelname"
                  className={`${inp()} pl-10`} />
              </div>
            </Fg>

            <Fg label="Stream Platform">
              <div className="flex gap-2">
                {['youtube','twitch'].map(p => (
                  <button key={p} type="button"
                    onClick={() => setForm(prev => ({...prev, stream_platform:p}))}
                    className={`flex-1 py-2 rounded-xl font-mono text-sm font-bold transition-all
                      ${form.stream_platform === p
                        ? p==='youtube' ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                        : 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                        : 'border border-ea-border text-ea-muted hover:text-ea-text'}`}>
                    {p === 'youtube' ? '▶ YouTube' : '📺 Twitch'}
                  </button>
                ))}
              </div>
            </Fg>

            <Fg label="Sponsor Name (optional)"
                hint="e.g. boAt, Noise, Razer — dikhega tournament card pe">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-gold" />
                <input name="sponsor_name" value={form.sponsor_name} onChange={handleChange}
                  placeholder="Sponsor brand name"
                  className={`${inp()} pl-10`} />
              </div>
            </Fg>

            <Fg label="Sponsor Logo URL (optional)"
                hint="Sponsor ka logo image URL (Cloudinary ya ImgBB pe upload karo)">
              <input name="sponsor_logo" value={form.sponsor_logo} onChange={handleChange}
                placeholder="https://res.cloudinary.com/... .png"
                className={inp()} />
            </Fg>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={saving}
          className="mt-6 w-full py-3.5 rounded-xl font-display font-bold text-sm
                     flex items-center justify-center gap-2 transition-all active:scale-97
                     disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)',
                   color:'#02020a',
                   boxShadow: saving ? 'none' : '0 0 25px rgba(0,245,255,0.4)' }}>
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving
            ? 'Create ho raha hai…'
            : `${selectedGame.emoji} ${selectedMode.emoji} ${form.game_name} ${selectedMode.label} Tournament Create Karo`}
        </button>
      </div>
    </div>
  );
}

function Fg({ label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block font-body text-sm font-medium text-ea-text mb-1.5">{label}</label>
      {children}
      {hint  && !error && <p className="font-mono text-[10px] text-ea-dim mt-1">{hint}</p>}
      {error && <p className="font-mono text-[11px] text-ea-magenta mt-1">{error}</p>}
    </div>
  );
}
function inp(err) {
  return `w-full bg-ea-deep border ${err ? 'border-ea-magenta' : 'border-ea-border'}
    text-white rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none
    focus:border-ea-cyan/60 focus:ring-1 focus:ring-ea-cyan/20 transition-all
    placeholder-ea-muted [&>option]:bg-ea-deep`;
}
