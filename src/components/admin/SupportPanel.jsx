// src/components/admin/SupportPanel.jsx
import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, Loader, User } from 'lucide-react';
import {
  subscribeAllTickets, replyToTicket, TICKET_STATUS,
} from '../../services/supportService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  open:      { label: 'Open',      color: 'text-ea-gold',  bg: 'bg-ea-gold/15  border-ea-gold/30'  },
  in_review: { label: 'In Review', color: 'text-ea-cyan',  bg: 'bg-ea-cyan/10  border-ea-cyan/25'  },
  resolved:  { label: 'Resolved',  color: 'text-ea-green', bg: 'bg-ea-green/10 border-ea-green/25' },
  closed:    { label: 'Closed',    color: 'text-ea-muted', bg: 'bg-ea-dim/10 border-ea-dim/25' },
};

export default function SupportPanel() {
  const [tickets,  setTickets]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply,    setReply]    = useState('');
  const [status,   setStatus]   = useState(TICKET_STATUS.RESOLVED);
  const [sending,  setSending]  = useState(false);
  const [filter,   setFilter]   = useState('open');

  useEffect(() => {
    const unsub = subscribeAllTickets(setTickets, e => console.error(e));
    return unsub;
  }, []);

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await replyToTicket(selected.id, reply, status);
      toast.success('Reply bhej diya!');
      setReply('');
      setSelected(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

      {/* Ticket list */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-ea-cyan" />
            Tickets
            {openCount > 0 && (
              <span className="w-5 h-5 bg-ea-magenta rounded-full text-white text-[10px]
                               font-mono flex items-center justify-center">
                {openCount}
              </span>
            )}
          </h3>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-ea-deep border border-ea-border text-ea-muted rounded-lg
                       px-3 py-1.5 text-xs font-mono focus:outline-none appearance-none">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-ea-muted text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-ea-green" />
              No {filter} tickets!
            </div>
          ) : filtered.map(t => {
            const cfg  = STATUS_CFG[t.status] ?? STATUS_CFG.open;
            const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
            return (
              <button key={t.id} onClick={() => { setSelected(t); setReply(''); }}
                className={`w-full text-left p-4 rounded-xl border transition-all
                  ${selected?.id === t.id
                    ? 'bg-ea-cyan/10 border-ea-cyan/40'
                    : 'bg-ea-deep border-ea-border hover:border-ea-border/80'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm font-bold truncate flex-1 mr-2">{t.subject}</p>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-ea-muted text-xs flex items-center gap-1.5">
                  <User className="w-3 h-3" /> {t.username}
                  <span>·</span>
                  {formatDistanceToNow(date, { addSuffix: true })}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket detail + reply */}
      <div className="lg:col-span-3">
        {!selected ? (
          <div className="bg-ea-card border border-ea-border rounded-2xl p-10
                          text-center h-full flex flex-col items-center justify-center">
            <MessageSquare className="w-10 h-10 text-ea-border mb-3" />
            <p className="text-ea-text font-bold">Ticket select karo</p>
            <p className="text-ea-muted text-sm mt-1">Left side se ticket click karo</p>
          </div>
        ) : (
          <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">
            {/* Ticket header */}
            <div className="px-5 py-4 border-b border-ea-border">
              <p className="text-white font-display font-bold">{selected.subject}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-ea-muted text-xs font-mono flex items-center gap-1">
                  <User className="w-3 h-3" /> {selected.username}
                </span>
                <span className="text-ea-muted text-xs font-mono">
                  UID: {selected.uid?.slice(0, 12)}…
                </span>
              </div>
            </div>

            {/* User message */}
            <div className="px-5 py-4 border-b border-ea-border">
              <p className="text-ea-muted text-xs uppercase tracking-wider mb-2">User Ka Message</p>
              <p className="text-ea-text text-sm leading-relaxed">{selected.description}</p>
            </div>

            {/* Existing reply */}
            {selected.adminReply && (
              <div className="px-5 py-4 bg-ea-cyan/3 border-b border-ea-border">
                <p className="text-ea-cyan text-xs uppercase tracking-wider mb-2">Aapka Reply</p>
                <p className="text-white text-sm leading-relaxed">{selected.adminReply}</p>
              </div>
            )}

            {/* Reply form */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex gap-2">
                {Object.entries(TICKET_STATUS).map(([k, v]) => (
                  <button key={v} onClick={() => setStatus(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all
                      ${status === v
                        ? 'bg-ea-cyan text-ea-void'
                        : 'bg-ea-border/50 text-ea-muted hover:text-white border border-ea-border'}`}>
                    {k.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                placeholder="User ko reply likhein…"
                className="w-full bg-ea-deep border border-ea-border text-white rounded-xl
                           px-4 py-2.5 text-sm font-body resize-none focus:outline-none
                           focus:border-ea-cyan/60 transition-all placeholder-ea-muted" />

              <button onClick={handleReply} disabled={sending || !reply.trim()}
                className="w-full py-2.5 bg-ea-cyan text-ea-void font-display font-bold text-sm
                           rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                           active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Bhej rahe hain…' : 'Reply Bhejo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
