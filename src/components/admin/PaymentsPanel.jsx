// src/components/admin/PaymentsPanel.jsx
// Admin view for approving deposits + monitoring withdrawals
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Banknote, QrCode,
  Clock, RefreshCw, AlertTriangle,
} from 'lucide-react';
import {
  subscribePendingDeposits,  approveDeposit,  rejectDeposit,
  subscribePendingWithdrawals, completeWithdrawal, failWithdrawal,
  WITHDRAWAL_STATUS,
}                            from '../../services/paymentService';
import { notifyUser, NOTIF_TYPES } from '../../services/notificationService';
import { formatINR }         from '../../config/payments';
import { formatDistanceToNow } from 'date-fns';
import toast                 from 'react-hot-toast';

const TABS = [
  { id: 'deposits',    label: 'Deposits',    icon: QrCode   },
  { id: 'withdrawals', label: 'Withdrawals', icon: Banknote },
];

export default function PaymentsPanel() {
  const [tab,         setTab]         = useState('deposits');
  const [deposits,    setDeposits]    = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState(null); // currently processing

  // Real-time listeners
  useEffect(() => {
    setLoading(true);
    const u1 = subscribePendingDeposits(
      (d) => { setDeposits(d); setLoading(false); },
      (e) => { console.error(e); setLoading(false); }
    );
    const u2 = subscribePendingWithdrawals(
      (d) => setWithdrawals(d),
      (e) => console.error(e)
    );
    return () => { u1(); u2(); };
  }, []);

  const handleApprove = useCallback(async (depositId, uid, ecAmount, inrAmount) => {
    setActionId(depositId);
    try {
      await approveDeposit(depositId, 'Approved by admin');
      await notifyUser(uid, {
        title: `✅ Deposit of ₹${inrAmount} approved!`,
        body:  `${ecAmount} EliteCoins have been credited to your wallet.`,
        type:  NOTIF_TYPES.BALANCE_ADJUSTED,
      }).catch(() => {});
      toast.success(`Deposit approved — +${ecAmount} EC credited`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionId(null);
    }
  }, []);

  const handleReject = useCallback(async (depositId, uid) => {
    setActionId(depositId);
    try {
      await rejectDeposit(depositId, 'Could not verify payment');
      await notifyUser(uid, {
        title: '❌ Deposit request rejected',
        body:  'We could not verify your payment. Contact support if this is an error.',
        type:  NOTIF_TYPES.SYSTEM,
      }).catch(() => {});
      toast.success('Deposit rejected');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionId(null);
    }
  }, []);

  const handleCompleteWithdrawal = useCallback(async (withdrawalId) => {
    setActionId(withdrawalId);
    try {
      await completeWithdrawal(withdrawalId, 'Manually confirmed by admin');
      toast.success('Withdrawal marked completed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionId(null);
    }
  }, []);

  const handleFailWithdrawal = useCallback(async (withdrawalId, uid, inrAmount) => {
    setActionId(withdrawalId);
    try {
      await failWithdrawal(withdrawalId, 'UPI transfer failed — EC refunded');
      await notifyUser(uid, {
        title: '⚠️ Withdrawal failed — EC refunded',
        body:  `Your withdrawal of ₹${inrAmount} could not be processed. EC has been refunded.`,
        type:  NOTIF_TYPES.BALANCE_ADJUSTED,
      }).catch(() => {});
      toast.success('Withdrawal failed — EC refunded to user');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionId(null);
    }
  }, []);

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">

      {/* Tab bar */}
      <div className="flex border-b border-ea-border">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = id === 'deposits' ? deposits.length : withdrawals.length;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm
                          font-display font-bold transition-all border-b-2
                ${tab === id
                  ? 'border-ea-cyan text-white bg-ea-cyan/5'
                  : 'border-transparent text-ea-muted hover:text-white'}`}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className="w-5 h-5 bg-ea-magenta rounded-full text-white text-[10px]
                                 font-mono flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Deposits tab ──────────────────────────────────────── */}
      {tab === 'deposits' && (
        <div>
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 text-ea-muted mx-auto animate-spin" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-ea-green mx-auto mb-3" />
              <p className="text-white font-bold">All deposits processed!</p>
              <p className="text-ea-muted text-xs mt-1">No pending deposit requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-ea-border/50">
              {deposits.map(d => {
                const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
                const busy = actionId === d.id;
                return (
                  <div key={d.id} className="p-4 hover:bg-ea-deep/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-mono font-bold text-base">
                            {formatINR(d.amount_inr)}
                          </span>
                          <span className="text-ea-green text-xs font-mono bg-ea-green/10
                                           border border-ea-green/25 px-2 py-0.5 rounded-full">
                            +{d.ec_amount} EC
                          </span>
                        </div>
                        <p className="text-ea-muted text-xs font-mono mt-0.5">
                          UTR: <span className="text-white">{d.utr_number}</span>
                        </p>
                        <p className="text-ea-muted text-xs font-mono">
                          UID: {d.uid?.slice(0,12)}…
                        </p>
                        <p className="text-ea-muted/60 text-[10px] font-mono mt-0.5">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(d.id, d.uid, d.ec_amount, d.amount_inr)}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-ea-green/15
                                     border border-ea-green/35 text-ea-green rounded-lg
                                     text-xs font-bold hover:bg-ea-green/25 transition-all
                                     disabled:opacity-50">
                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                                  <CheckCircle className="w-3 h-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(d.id, d.uid)}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-ea-magenta/10
                                     border border-ea-magenta/30 text-ea-magenta rounded-lg
                                     text-xs font-bold hover:bg-ea-magenta/20 transition-all
                                     disabled:opacity-50">
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Withdrawals tab ───────────────────────────────────── */}
      {tab === 'withdrawals' && (
        <div>
          {withdrawals.length === 0 ? (
            <div className="p-10 text-center">
              <Banknote className="w-10 h-10 text-ea-border mx-auto mb-3" />
              <p className="text-white font-bold">No pending withdrawals</p>
              <p className="text-ea-muted text-xs mt-1">Auto-processor handles them in 10 min.</p>
            </div>
          ) : (
            <div className="divide-y divide-ea-border/50">
              {withdrawals.map(w => {
                const date      = w.createdAt?.toDate ? w.createdAt.toDate() : new Date();
                const processAt = w.processAt?.toDate ? w.processAt.toDate() : null;
                const busy      = actionId === w.id;
                const isScheduled = w.status === WITHDRAWAL_STATUS.SCHEDULED;

                return (
                  <div key={w.id} className="p-4 hover:bg-ea-deep/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-mono font-bold text-base">
                            {formatINR(w.amount_inr)}
                          </span>
                          <span className="text-ea-magenta text-xs font-mono bg-ea-magenta/10
                                           border border-ea-magenta/25 px-2 py-0.5 rounded-full">
                            -{w.ec_amount} EC
                          </span>
                          {isScheduled && (
                            <span className="text-ea-gold text-[10px] font-mono bg-ea-gold/10
                                             border border-ea-gold/25 px-2 py-0.5 rounded-full
                                             flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> SCHEDULED
                            </span>
                          )}
                        </div>
                        <p className="text-ea-muted text-xs font-mono mt-0.5">
                          UPI: <span className="text-white">{w.upi_id}</span>
                        </p>
                        <p className="text-ea-muted text-xs font-mono">
                          UID: {w.uid?.slice(0,12)}…
                        </p>
                        {processAt && isScheduled && (
                          <p className="text-ea-gold text-[10px] font-mono mt-0.5">
                            Auto-processes: {formatDistanceToNow(processAt, { addSuffix: true })}
                          </p>
                        )}
                        <p className="text-ea-muted/60 text-[10px] font-mono mt-0.5">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleCompleteWithdrawal(w.id)}
                          disabled={busy}
                          className="flex items-center gap-1 px-3 py-1.5 bg-ea-green/15
                                     border border-ea-green/30 text-ea-green rounded-lg
                                     text-xs font-bold hover:bg-ea-green/25 transition-all
                                     disabled:opacity-50">
                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                                  <CheckCircle className="w-3 h-3" />}
                          Done
                        </button>
                        <button
                          onClick={() => handleFailWithdrawal(w.id, w.uid, w.amount_inr)}
                          disabled={busy}
                          className="flex items-center gap-1 px-3 py-1.5 bg-ea-magenta/10
                                     border border-ea-magenta/25 text-ea-magenta rounded-lg
                                     text-xs font-bold hover:bg-ea-magenta/20 transition-all
                                     disabled:opacity-50">
                          <AlertTriangle className="w-3 h-3" /> Fail+Refund
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
