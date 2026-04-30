// src/components/admin/NotifyPanel.jsx
// Admin panel for sending notifications to individual users or tournament participants
import { useState }          from 'react';
import { Bell, Loader, Send, Radio } from 'lucide-react';
import { notifyUser, broadcastToTournament, NOTIF_TYPES } from '../../services/notificationService';
import { useTournaments }    from '../../hooks/useTournaments';
import toast                 from 'react-hot-toast';

const MODES = [
  { id: 'user',       label: 'Single User',       icon: Bell  },
  { id: 'broadcast',  label: 'Tournament Blast',  icon: Radio },
];

export default function NotifyPanel() {
  const { tournaments }   = useTournaments();
  const [mode, setMode]   = useState('user');
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    uid:          '',
    tournamentId: '',
    type:         NOTIF_TYPES.SYSTEM,
    title:        '',
    body:         '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (mode === 'user' && !form.uid.trim())         e.uid         = 'UID required.';
    if (mode === 'broadcast' && !form.tournamentId)  e.tournamentId = 'Select a tournament.';
    if (!form.title.trim())                           e.title       = 'Title required.';
    return e;
  };

  const handleSend = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSending(true);
    try {
      const payload = { title: form.title.trim(), body: form.body.trim(), type: form.type };

      if (mode === 'user') {
        await notifyUser(form.uid.trim(), payload);
        toast.success('Notification sent to user! 🔔');
      } else {
        const result = await broadcastToTournament(form.tournamentId, payload);
        toast.success(`Blast sent to ${result.sent} players!`);
      }

      setForm(p => ({ ...p, uid: '', title: '', body: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl p-6">
      <h2 className="font-display font-bold text-white text-xl mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5 text-ea-cyan" />
        Push Notifications
      </h2>

      {/* Mode selector */}
      <div className="flex gap-1 bg-ea-deep border border-ea-border rounded-xl p-1 mb-5 w-fit">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-display font-bold
                        transition-all duration-200
              ${mode === id
                ? 'bg-ea-cyan text-ea-void shadow-cyan'
                : 'text-ea-muted hover:text-white'}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Target */}
        {mode === 'user' ? (
          <div>
            <label className="block text-ea-text text-sm font-medium mb-1.5">Target User UID</label>
            <input
              value={form.uid} onChange={e => set('uid', e.target.value)}
              placeholder="Firebase UID of recipient…"
              className={`w-full bg-ea-deep border ${errors.uid ? 'border-ea-magenta' : 'border-ea-border'}
                          text-white rounded-xl px-4 py-2.5 text-sm font-mono
                          focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted`}
            />
            {errors.uid && <p className="text-ea-magenta text-xs mt-1">{errors.uid}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-ea-text text-sm font-medium mb-1.5">Target Tournament</label>
            <select
              value={form.tournamentId} onChange={e => set('tournamentId', e.target.value)}
              className={`w-full bg-ea-deep border ${errors.tournamentId ? 'border-ea-magenta' : 'border-ea-border'}
                          text-white rounded-xl px-4 py-2.5 text-sm font-body
                          focus:outline-none focus:border-ea-cyan/60 transition-all appearance-none`}>
              <option value="">Select tournament…</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.game_name} — {t.slots_filled}/{t.slots_total} players ({t.status})
                </option>
              ))}
            </select>
            {errors.tournamentId && <p className="text-ea-magenta text-xs mt-1">{errors.tournamentId}</p>}
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">Notification Type</label>
          <select
            value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full bg-ea-deep border border-ea-border text-white rounded-xl
                       px-4 py-2.5 text-sm font-body focus:outline-none focus:border-ea-cyan/60
                       transition-all appearance-none">
            {Object.entries(NOTIF_TYPES).map(([k, v]) => (
              <option key={v} value={v}>{k.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">Title</label>
          <input
            value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Your prize has been credited!"
            className={`w-full bg-ea-deep border ${errors.title ? 'border-ea-magenta' : 'border-ea-border'}
                        text-white rounded-xl px-4 py-2.5 text-sm font-body
                        focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted`}
          />
          {errors.title && <p className="text-ea-magenta text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Body */}
        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">Body (optional)</label>
          <textarea
            value={form.body} onChange={e => set('body', e.target.value)}
            rows={2} placeholder="Additional details…"
            className="w-full bg-ea-deep border border-ea-border text-white rounded-xl
                       px-4 py-2.5 text-sm font-body resize-none
                       focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted"
          />
        </div>

        <button
          onClick={handleSend} disabled={sending}
          className="w-full py-3 bg-ea-cyan text-ea-void font-display font-bold text-sm
                     rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                     active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending…' : mode === 'user' ? 'Send Notification' : 'Broadcast to Players'}
        </button>
      </div>
    </div>
  );
}
