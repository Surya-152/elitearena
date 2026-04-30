// src/components/user/WithdrawalPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { Banknote, Loader, Clock, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { PAYMENT_CONFIG, ecToINR, formatINR } from '../../config/payments';
// Fee config imported via PAYMENT_CONFIG.withdrawalFeePercent
import {
  createWithdrawalRequest, subscribeUserWithdrawals,
  WITHDRAWAL_STATUS, isValidUpiId,
} from '../../services/paymentService';
import { useAuth }  from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast        from 'react-hot-toast';

const STATUS_CONFIG = {
  scheduled:  { label: 'Scheduled',   color: 'text-ea-gold',  dot: 'bg-ea-gold'  },
  processing: { label: 'Processing',  color: 'text-ea-cyan',  dot: 'bg-ea-cyan'  },
  completed:  { label: 'Completed',   color: 'text-ea-green', dot: 'bg-ea-green' },
  failed:     { label: 'Failed',      color: 'text-ea-magenta',  dot: 'bg-ea-magenta'  },
};

export default function WithdrawalPanel() {
  const { userProfile }          = useAuth();
  const [upiId,  setUpiId]       = useState('');
  const [amount, setAmount]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]      = useState({});
  const [withdrawals, setWithdrawals] = useState([]);
  const [showForm, setShowForm]  = useState(false);
  const mountedRef               = useRef(true);

  const MIN    = PAYMENT_CONFIG.minWithdrawal;
  const MAX    = PAYMENT_CONFIG.maxWithdrawal;
  const ecNum  = Number(amount);
  const feeEC      = Math.floor(ecNum * (PAYMENT_CONFIG.withdrawalFeePercent || 5) / 100);
  const netEC      = Math.max(0, ecNum - feeEC);
  const inrPreview = ecToINR(netEC);
  const balance= userProfile?.elite_coins_balance ?? 0;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Subscribe to user's withdrawal history
  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = subscribeUserWithdrawals(
      userProfile.uid,
      (data) => { if (mountedRef.current) setWithdrawals(data); },
      (err)  => console.error('[WithdrawalPanel]', err.message)
    );
    return unsub;
  }, [userProfile?.uid]);

  const validate = () => {
    const e = {};
    if (!upiId.trim())           e.upiId  = 'Enter your UPI ID.';
    else if (!isValidUpiId(upiId)) e.upiId = 'Invalid UPI format. Example: name@upi';
    if (!amount || isNaN(ecNum)) e.amount  = 'Enter amount in EC.';
    else if (ecNum < MIN)        e.amount  = `Minimum withdrawal is ${MIN} EC (₹${MIN}).`;
    else if (ecNum > balance)    e.amount  = `Insufficient EC. You have ${balance} EC.`;
    else if (inrPreview > MAX)   e.amount  = `Maximum withdrawal is ₹${MAX}.`;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // Check for any active withdrawal
    const active = withdrawals.find(w =>
      w.status === WITHDRAWAL_STATUS.SCHEDULED || w.status === WITHDRAWAL_STATUS.PROCESSING
    );
    if (active) {
      toast.error('You already have a pending withdrawal. Wait for it to complete.');
      return;
    }

    setSubmitting(true);
    try {
      await createWithdrawalRequest(userProfile.uid, upiId.trim(), ecNum);
      toast.success(`Withdrawal of ${formatINR(inrPreview)} scheduled! Processing in ${PAYMENT_CONFIG.withdrawalDelayMs / 60000} minutes.`);
      setUpiId(''); setAmount(''); setErrors({}); setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ea-border flex items-center gap-2">
        <Banknote className="w-5 h-5 text-ea-magenta" />
        <span className="font-display font-bold text-white text-base">Withdraw</span>
        <span className="ml-auto text-ea-muted text-xs font-mono">Min {MIN} EC</span>
        <button onClick={() => setShowForm(p => !p)}
          className={`ml-2 px-3 py-1 rounded-lg text-xs font-bold transition-all
            ${showForm
              ? 'bg-ea-border text-ea-muted'
              : 'bg-ea-magenta/20 border border-ea-magenta/40 text-ea-magenta hover:bg-ea-magenta/30'}`}>
          {showForm ? <X className="w-3.5 h-3.5" /> : '+ Request'}
        </button>
      </div>

      {/* Withdraw form */}
      {showForm && (
        <div className="p-5 border-b border-ea-border space-y-4 animate-slide-up">

          <div className="bg-ea-deep/60 border border-ea-border/50 rounded-xl p-3 flex gap-2">
            <Info className="w-4 h-4 text-ea-cyan flex-shrink-0 mt-0.5" />
            <p className="text-ea-muted text-xs font-body leading-relaxed">
              EliteCoins are deducted immediately. UPI transfer is processed automatically within{' '}
              <strong className="text-white">{PAYMENT_CONFIG.withdrawalDelayMs / 60000} minutes</strong>.
              Minimum: <strong className="text-white">{MIN} EC (₹{MIN})</strong>.
            </p>
          </div>

          <div>
            <label className="block text-ea-text text-sm font-medium mb-1.5">Your UPI ID</label>
            <input
              value={upiId} onChange={e => { setUpiId(e.target.value); setErrors(p => ({...p, upiId: undefined})); }}
              placeholder="yourname@upi or 9876543210@ybl"
              className={`w-full bg-ea-deep border ${errors.upiId ? 'border-ea-magenta' : 'border-ea-border'}
                          text-white rounded-xl px-4 py-2.5 text-sm font-mono
                          focus:outline-none focus:border-ea-magenta/60 transition-all placeholder-ea-muted`}
            />
            {errors.upiId && <p className="text-ea-magenta text-xs mt-1">{errors.upiId}</p>}
          </div>

          <div>
            <label className="block text-ea-text text-sm font-medium mb-1.5">
              Amount (EC) — Balance: <span className="text-ea-gold">{balance.toLocaleString()} EC</span>
            </label>
            <input
              type="number" value={amount} min={MIN} max={balance}
              onChange={e => { setAmount(e.target.value); setErrors(p => ({...p, amount: undefined})); }}
              placeholder={`Min ${MIN} EC`}
              className={`w-full bg-ea-deep border ${errors.amount ? 'border-ea-magenta' : 'border-ea-border'}
                          text-white rounded-xl px-4 py-2.5 text-sm font-mono
                          focus:outline-none focus:border-ea-magenta/60 transition-all placeholder-ea-muted`}
            />
            {errors.amount && <p className="text-ea-magenta text-xs mt-1">{errors.amount}</p>}
            {ecNum >= MIN && !errors.amount && (
              <p className="text-ea-green text-xs font-mono mt-1">
                <span className="text-ea-muted">Fee: -{feeEC} EC ({PAYMENT_CONFIG.withdrawalFeePercent}%)</span>
                {' · '}You receive: <strong className="text-ea-green">{formatINR(inrPreview)}</strong> via UPI
              </p>
            )}
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-ea-magenta text-white font-display font-bold text-sm
                       rounded-xl shadow-magenta hover:bg-pink-400 transition-all
                       active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
            {submitting ? 'Processing…' : `Withdraw ${ecNum >= MIN ? formatINR(inrPreview) : ''}`}
          </button>
        </div>
      )}

      {/* History */}
      <div>
        {withdrawals.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Banknote className="w-8 h-8 text-ea-border mx-auto mb-2" />
            <p className="text-ea-text text-sm font-bold">No withdrawals yet</p>
            <p className="text-ea-muted text-xs mt-1">
              Request your first withdrawal above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ea-border/50">
            {withdrawals.map(w => (
              <WithdrawalRow key={w.id} withdrawal={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Individual withdrawal row with live countdown ─────────────────────────────
function WithdrawalRow({ withdrawal: w }) {
  const cfg  = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.scheduled;
  const date = w.createdAt?.toDate ? w.createdAt.toDate() : new Date();
  const processAt = w.processAt?.toDate ? w.processAt.toDate() : null;

  const [remaining, setRemaining] = useState(() => {
    if (!processAt || w.status !== WITHDRAWAL_STATUS.SCHEDULED) return null;
    const diff = processAt - Date.now();
    return diff > 0 ? diff : null;
  });

  // Live countdown for scheduled withdrawals
  useEffect(() => {
    if (w.status !== WITHDRAWAL_STATUS.SCHEDULED || !processAt) return;
    const id = setInterval(() => {
      const diff = processAt - Date.now();
      setRemaining(diff > 0 ? diff : null);
      if (diff <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [w.status, processAt]);

  const formatRemaining = (ms) => {
    if (!ms) return null;
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="px-5 py-3.5 flex items-start gap-3 hover:bg-ea-deep/30 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white text-sm font-mono font-bold">
            {formatINR(w.amount_inr)}
          </span>
          <span className="text-ea-muted text-xs font-mono">→ {w.upi_id}</span>
        </div>
        <p className={`text-xs font-mono mt-0.5 ${cfg.color}`}>{cfg.label}</p>

        {/* Countdown for scheduled */}
        {w.status === WITHDRAWAL_STATUS.SCHEDULED && remaining && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-ea-gold" />
            <span className="text-ea-gold text-xs font-mono font-bold">
              Processing in {formatRemaining(remaining)}
            </span>
          </div>
        )}
        {w.status === WITHDRAWAL_STATUS.SCHEDULED && !remaining && (
          <p className="text-ea-cyan text-xs font-mono mt-1">Processing now…</p>
        )}

        {w.admin_note && (
          <p className="text-ea-muted text-[10px] mt-0.5">{w.admin_note}</p>
        )}
        <p className="text-ea-muted/60 text-[10px] font-mono mt-0.5">
          {formatDistanceToNow(date, { addSuffix: true })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-ea-magenta text-sm font-mono font-bold">-{w.ec_amount} EC</p>
        <p className="text-ea-muted text-[10px] font-mono">{formatINR(w.amount_inr)}</p>
      </div>
    </div>
  );
}
