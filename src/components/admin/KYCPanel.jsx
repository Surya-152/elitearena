// src/components/admin/KYCPanel.jsx
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { approveKYC, rejectKYC } from '../../services/kycService';
import { notifyUser, NOTIF_TYPES } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function KYCPanel() {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState(null);
  const [rejectMsg, setRejectMsg] = useState('');
  const [rejecting, setRejecting] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'kyc_reviews'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleApprove = async (r) => {
    setActionId(r.id);
    try {
      await approveKYC(r.uid, r.id);
      await notifyUser(r.uid, '✅ KYC Approved!',
        'Aapki KYC verified ho gayi. Ab aap withdraw kar sakte ho!', NOTIF_TYPES.SYSTEM);
      toast.success(`KYC approved: ${r.fullName}`);
    } catch (e) { toast.error(e.message); }
    finally { setActionId(null); }
  };

  const handleReject = async (r) => {
    if (!rejectMsg.trim()) { toast.error('Rejection reason daalo.'); return; }
    setActionId(r.id);
    try {
      await rejectKYC(r.uid, r.id, rejectMsg);
      await notifyUser(r.uid, '❌ KYC Rejected',
        `Reason: ${rejectMsg}. Dobara submit karein.`, NOTIF_TYPES.SYSTEM);
      toast.success('KYC rejected.');
      setRejecting(null); setRejectMsg('');
    } catch (e) { toast.error(e.message); }
    finally { setActionId(null); }
  };

  if (loading) return (
    <div className="py-12 text-center"><Loader className="w-6 h-6 text-ea-cyan mx-auto animate-spin" /></div>
  );

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="bg-ea-card border border-ea-border rounded-2xl p-10 text-center">
          <CheckCircle className="w-10 h-10 text-ea-green mx-auto mb-3" />
          <p className="text-white font-bold">No pending KYC reviews!</p>
        </div>
      ) : reviews.map(r => {
        const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
        const busy = actionId === r.id;
        return (
          <div key={r.id} className="bg-ea-card border border-ea-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-ea-gold" />
                  <p className="text-white font-display font-bold">{r.fullName}</p>
                  <span className="bg-ea-gold/15 border border-ea-gold/30 text-ea-gold
                                   text-[10px] font-mono px-2 py-0.5 rounded-full">PENDING</span>
                </div>
                <p className="text-ea-muted text-xs font-mono">UID: {r.uid?.slice(0, 16)}…</p>
                <p className="text-ea-muted/60 text-xs mt-0.5">{formatDistanceToNow(date, { addSuffix: true })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'PAN', value: r.panNumber },
                { label: 'Aadhar (last 4)', value: `XXXX-XXXX-${r.aadharLast4}` },
                { label: 'DOB', value: r.dob },
                { label: 'City, State', value: `${r.city}, ${r.state}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-ea-deep/60 rounded-xl p-3">
                  <p className="text-ea-muted text-[10px] uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white text-xs font-mono font-medium">{value}</p>
                </div>
              ))}
            </div>

            {rejecting === r.id ? (
              <div className="space-y-2">
                <input value={rejectMsg} onChange={e => setRejectMsg(e.target.value)}
                  placeholder="Rejection reason (user ko batayega)…"
                  className="w-full bg-ea-deep border border-ea-border text-white rounded-xl
                             px-4 py-2.5 text-sm font-body focus:outline-none focus:border-ea-magenta/50
                             transition-all placeholder-ea-muted" />
                <div className="flex gap-2">
                  <button onClick={() => handleReject(r)} disabled={busy}
                    className="flex-1 py-2 bg-ea-magenta/20 border border-ea-magenta/40 text-ea-magenta
                               rounded-xl text-sm font-bold hover:bg-ea-magenta/30 transition-all
                               disabled:opacity-50 flex items-center justify-center gap-2">
                    {busy ? <Loader className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Confirm Reject
                  </button>
                  <button onClick={() => { setRejecting(null); setRejectMsg(''); }}
                    className="px-4 py-2 bg-ea-border/50 text-ea-muted rounded-xl text-sm hover:bg-ea-border transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleApprove(r)} disabled={busy}
                  className="flex-1 py-2.5 bg-ea-green/15 border border-ea-green/35 text-ea-green
                             rounded-xl text-sm font-bold hover:bg-ea-green/25 transition-all
                             disabled:opacity-50 flex items-center justify-center gap-2">
                  {busy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve KYC
                </button>
                <button onClick={() => setRejecting(r.id)} disabled={busy}
                  className="flex-1 py-2.5 bg-ea-magenta/10 border border-ea-magenta/30 text-ea-magenta
                             rounded-xl text-sm font-bold hover:bg-ea-magenta/20 transition-all
                             disabled:opacity-50 flex items-center justify-center gap-2">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
