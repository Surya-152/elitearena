// src/pages/Support.jsx
import { useState, useEffect } from 'react';
import { HelpCircle, Send, Clock, CheckCircle, Loader, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useAuth }            from '../context/AuthContext';
import {
  createTicket, subscribeUserTickets,
  TICKET_CATEGORIES, TICKET_STATUS,
} from '../services/supportService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CAT_LABELS = {
  deposit:    '💰 Deposit Problem',
  withdrawal: '💸 Withdrawal Issue',
  tournament: '🎮 Tournament Problem',
  account:    '👤 Account Issue',
  other:      '❓ Other',
};
const STATUS_CFG = {
  open:      { label: 'Open',      color: 'text-ea-gold',  dot: 'bg-ea-gold'  },
  in_review: { label: 'In Review', color: 'text-ea-cyan',  dot: 'bg-ea-cyan'  },
  resolved:  { label: 'Resolved',  color: 'text-ea-green', dot: 'bg-ea-green' },
  closed:    { label: 'Closed',    color: 'text-ea-muted', dot: 'bg-ea-dim' },
};

export default function Support() {
  useSEO({ title:'Support Center', description:'Help chahiye? Ticket banao aur 24 ghante mein reply pao.', noIndex:true });
  const { userProfile }       = useAuth();
  const [tickets, setTickets] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm]       = useState({ category: 'other', subject: '', description: '' });
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = subscribeUserTickets(
      userProfile.uid,
      setTickets,
      e => console.error(e)
    );
    return unsub;
  }, [userProfile?.uid]);

  const set = (k, v) => { setForm(p => ({...p, [k]: v})); setErrors(p => ({...p, [k]: undefined})); };

  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject     = 'Subject required.';
    if (!form.description.trim()) e.description = 'Problem describe karo.';
    else if (form.description.trim().length < 20) e.description = 'Kam se kam 20 characters likhein.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSub(true);
    try {
      await createTicket(userProfile.uid, userProfile.username, form);
      toast.success('Ticket submit ho gaya! Hum 24 ghante mein reply karenge.');
      setForm({ category: 'other', subject: '', description: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto space-y-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-black text-3xl text-white">
              Support <span className="text-ea-cyan">Center</span>
            </h1>
            <p className="text-ea-muted text-sm mt-1 font-body">
              Problem hai? Hum 24 ghante mein reply karte hain.
            </p>
          </div>
          <button onClick={() => setShowForm(p => !p)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm
                        transition-all active:scale-95
              ${showForm
                ? 'bg-ea-border text-ea-muted'
                : 'bg-ea-cyan text-ea-void shadow-cyan hover:bg-cyan-300'}`}>
            {showForm ? '✕ Cancel' : '+ New Ticket'}
          </button>
        </div>

        {/* Quick FAQ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { q: 'Deposit verify nahi hua?', a: 'UTR sahi submit kiya? Admin 30 min mein approve karta hai. Agar zyada time ho toh ticket banao.' },
            { q: 'Withdrawal nahi aaya?', a: '10 min mein auto-process hota hai. Agar nahi aaya toh UPI ID check karo ya ticket banao.' },
            { q: 'Tournament join nahi ho raha?', a: 'Balance check karo. Agar balance hai phir bhi issue hai toh ticket banao.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-ea-card border border-ea-border rounded-xl p-4">
              <p className="text-white text-sm font-display font-bold mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-ea-cyan flex-shrink-0" />{q}
              </p>
              <p className="text-ea-muted text-xs font-body leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* New ticket form */}
        {showForm && (
          <form onSubmit={handleSubmit} noValidate
            className="bg-ea-card border border-ea-cyan/25 rounded-2xl p-6 space-y-4 animate-slide-up">
            <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ea-cyan" /> Naya Ticket
            </h2>

            <div>
              <label className="block text-ea-text text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-ea-deep border border-ea-border text-white rounded-xl
                           px-4 py-2.5 text-sm font-body focus:outline-none focus:border-ea-cyan/60
                           transition-all appearance-none">
                {Object.entries(CAT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ea-text text-sm font-medium mb-1.5">Subject</label>
              <input value={form.subject} onChange={e => set('subject', e.target.value)}
                placeholder="Problem ka short summary…"
                className={`w-full bg-ea-deep border ${errors.subject ? 'border-ea-magenta' : 'border-ea-border'}
                            text-white rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none
                            focus:border-ea-cyan/60 transition-all placeholder-ea-muted`} />
              {errors.subject && <p className="text-ea-magenta text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-ea-text text-sm font-medium mb-1.5">
                Poori Problem Describe Karo
              </label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={4} placeholder="Jitna detail de sako utna better — amount, date, UTR number etc…"
                className={`w-full bg-ea-deep border ${errors.description ? 'border-ea-magenta' : 'border-ea-border'}
                            text-white rounded-xl px-4 py-2.5 text-sm font-body resize-none
                            focus:outline-none focus:border-ea-cyan/60 transition-all placeholder-ea-muted`} />
              {errors.description && <p className="text-ea-magenta text-xs mt-1">{errors.description}</p>}
              <p className="text-ea-muted text-xs mt-1">{form.description.length} / min 20</p>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-ea-cyan text-ea-void font-display font-bold text-sm
                         rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                         active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submit ho raha hai…' : 'Ticket Submit Karo'}
            </button>
          </form>
        )}

        {/* Tickets list */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-white text-base">Aapke Tickets ({tickets.length})</h2>
          {tickets.length === 0 ? (
            <div className="bg-ea-card border border-ea-border rounded-2xl p-10 text-center">
              <MessageSquare className="w-10 h-10 text-ea-border mx-auto mb-3" />
              <p className="text-ea-text font-bold">Koi ticket nahi</p>
              <p className="text-ea-muted text-sm mt-1">Problem ho toh upar "+ New Ticket" banao.</p>
            </div>
          ) : (
            tickets.map(t => {
              const cfg  = STATUS_CFG[t.status] ?? STATUS_CFG.open;
              const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
              const isExp = expanded === t.id;
              return (
                <div key={t.id}
                  className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden
                             hover:border-ea-cyan/30 transition-all">
                  <button onClick={() => setExpanded(isExp ? null : t.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-display font-bold text-sm truncate">{t.subject}</p>
                      <p className="text-ea-muted text-xs font-mono mt-0.5">
                        {CAT_LABELS[t.category]} · {formatDistanceToNow(date, { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`text-xs font-mono flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                    {isExp ? <ChevronUp className="w-4 h-4 text-ea-muted flex-shrink-0" /> :
                              <ChevronDown className="w-4 h-4 text-ea-muted flex-shrink-0" />}
                  </button>
                  {isExp && (
                    <div className="px-5 pb-5 space-y-3 animate-slide-up border-t border-ea-border/50 pt-4">
                      <div>
                        <p className="text-ea-muted text-xs uppercase tracking-wider mb-1">Your Message</p>
                        <p className="text-ea-text text-sm font-body leading-relaxed">{t.description}</p>
                      </div>
                      {t.adminReply ? (
                        <div className="bg-ea-cyan/5 border border-ea-cyan/20 rounded-xl p-4">
                          <p className="text-ea-cyan text-xs uppercase tracking-wider mb-1 font-mono">Admin Reply</p>
                          <p className="text-white text-sm font-body leading-relaxed">{t.adminReply}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-ea-muted text-xs font-mono">
                          <Clock className="w-3.5 h-3.5" /> Reply awaited — usually within 24 hours
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
