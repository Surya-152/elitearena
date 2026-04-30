// src/components/user/TransactionHistory.jsx
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Zap } from 'lucide-react';
import { fetchTransactions } from '../../services/walletService';
import { useAuth }           from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const TX_TYPES = {
  admin_adjustment: { label: 'Admin Adjustment', icon: Zap,          color: 'text-ea-gold'  },
  ad_reward:        { label: 'Ad Reward',         icon: ArrowUpRight, color: 'text-ea-green' },
  join_tournament:  { label: 'Joined Tournament', icon: ArrowDownLeft,color: 'text-ea-magenta'  },
  prize:            { label: 'Prize Won',          icon: ArrowUpRight, color: 'text-ea-cyan'  },
};

export default function TransactionHistory() {
  const { userProfile }          = useAuth();
  const [txs,     setTxs]        = useState([]);
  const [loading, setLoading]    = useState(true);
  const [error,   setError]      = useState(null);

  useEffect(() => {
    if (!userProfile) return;
    setLoading(true);
    fetchTransactions(userProfile.uid, 30)
      .then(data => { setTxs(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  }, [userProfile?.uid]);

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ea-border flex items-center gap-2">
        <Clock className="w-4 h-4 text-ea-muted" />
        <h3 className="font-display font-bold text-white text-sm">Transaction History</h3>
        <span className="ml-auto text-ea-muted text-xs font-mono">Last 30</span>
      </div>

      {loading && (
        <div className="divide-y divide-ea-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-ea-border rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-ea-border rounded w-36 mb-1.5" />
                <div className="h-3 bg-ea-border rounded w-24" />
              </div>
              <div className="w-16 h-4 bg-ea-border rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="px-5 py-6 text-ea-magenta text-sm text-center">{error}</p>
      )}

      {!loading && !error && txs.length === 0 && (
        <div className="px-5 py-10 text-center">
          <Clock className="w-8 h-8 text-ea-border mx-auto mb-2" />
          <p className="text-ea-text text-sm font-bold">No transactions yet</p>
          <p className="text-ea-muted text-xs mt-1">Join a tournament or earn ad rewards to see history.</p>
        </div>
      )}

      {!loading && txs.length > 0 && (
        <div className="divide-y divide-ea-border/50">
          {txs.map(tx => {
            const cfg  = TX_TYPES[tx.type] || TX_TYPES.admin_adjustment;
            const Icon = cfg.icon;
            const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
            const isCredit = (tx.delta || 0) > 0;

            return (
              <div key={tx.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-ea-deep/40 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isCredit ? 'bg-ea-green/10 border border-ea-green/20' : 'bg-ea-magenta/10 border border-ea-magenta/20'}`}>
                  <Icon className={`w-4 h-4 ${isCredit ? 'text-ea-green' : 'text-ea-magenta'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-body font-medium truncate">
                    {tx.reason || cfg.label}
                  </p>
                  <p className="text-ea-muted text-xs font-mono">
                    {formatDistanceToNow(date, { addSuffix: true })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-mono font-bold text-sm
                    ${isCredit ? 'text-ea-green' : 'text-ea-magenta'}`}>
                    {isCredit ? '+' : ''}{tx.delta} EC
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
