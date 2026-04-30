// src/components/admin/AnalyticsPanel.jsx — Revenue & User Analytics
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db }          from '../../config/firebase';
import { ecToINR, formatINR } from '../../config/payments';
import { TrendingUp, Users, Zap, Trophy, CreditCard, Award } from 'lucide-react';

async function fetchStats() {
  const [users, deposits, withdrawals, tournaments, transactions] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(query(collection(db, 'deposits'),     where('status','==','approved'))),
    getDocs(query(collection(db, 'withdrawals'),  where('status','==','completed'))),
    getDocs(collection(db, 'tournaments')),
    getDocs(query(collection(db, 'transactions'), orderBy('createdAt','desc'), limit(20))),
  ]);

  const totalUsers     = users.size;
  const totalDepositsEC = deposits.docs.reduce((s,d) => s + (d.data().ec_amount||0), 0);
  const totalWithdrawEC = withdrawals.docs.reduce((s,d) => s + (d.data().ec_amount||0), 0);
  const platformFeeEC  = withdrawals.docs.reduce((s,d) => s + (d.data().fee_ec||Math.floor((d.data().ec_amount||0)*0.05)), 0);
  const totalTourneys  = tournaments.size;
  const liveTourneys   = tournaments.docs.filter(d => d.data().status === 'live').length;
  const completedTours = tournaments.docs.filter(d => d.data().status === 'completed').length;
  const kycApproved    = users.docs.filter(d => d.data().kycStatus === 'approved').length;
  const recentTxns     = transactions.docs.map(d => ({ id:d.id, ...d.data() }));

  return {
    totalUsers, totalDepositsEC, totalWithdrawEC, platformFeeEC,
    totalTourneys, liveTourneys, completedTours, kycApproved, recentTxns,
  };
}

export default function AnalyticsPanel() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-ea-cyan/20 border-t-ea-cyan animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-ea-muted">Loading analytics…</p>
      </div>
    );
  }

  if (!stats) return <p className="text-ea-muted text-sm">Could not load analytics.</p>;

  const cards = [
    { label:'Total Users',    value: stats.totalUsers.toLocaleString(),       icon:Users,      color:'cyan'    },
    { label:'KYC Verified',   value: stats.kycApproved.toLocaleString(),      icon:Award,      color:'green'   },
    { label:'Total Deposits', value: formatINR(ecToINR(stats.totalDepositsEC)),icon:CreditCard, color:'gold'    },
    { label:'Total Withdrawals',value:formatINR(ecToINR(stats.totalWithdrawEC)),icon:Zap,       color:'magenta' },
    { label:'Platform Revenue',value: formatINR(ecToINR(stats.platformFeeEC)), icon:TrendingUp, color:'green'   },
    { label:'Tournaments',    value: `${stats.completedTours} / ${stats.totalTourneys}`, icon:Trophy, color:'cyan' },
  ];

  const colorCls = {
    cyan:   'text-ea-cyan   bg-ea-cyan/8   border-ea-cyan/20',
    gold:   'text-ea-gold   bg-ea-gold/8   border-ea-gold/20',
    magenta:'text-ea-magenta bg-ea-magenta/8 border-ea-magenta/20',
    green:  'text-ea-green  bg-ea-green/8  border-ea-green/20',
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-ea-cyan" /> Platform Analytics
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(({ label, value, icon:Icon, color }) => (
          <div key={label} className={`rounded-2xl p-4 border ${colorCls[color]}`}>
            <Icon className={`w-4 h-4 mb-2 ${color==='cyan'?'text-ea-cyan':color==='gold'?'text-ea-gold':color==='magenta'?'text-ea-magenta':'text-ea-green'}`} />
            <div className={`font-display font-bold text-xl ${color==='cyan'?'text-ea-cyan':color==='gold'?'text-ea-gold':color==='magenta'?'text-ea-magenta':'text-ea-green'}`}>
              {value}
            </div>
            <div className="font-body text-xs text-ea-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl overflow-hidden"
           style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
        <div className="px-5 py-4 border-b border-ea-border">
          <h3 className="font-display font-bold text-white text-sm">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-ea-border/40 max-h-64 overflow-y-auto no-scrollbar">
          {stats.recentTxns.map(tx => {
            const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
            return (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.delta > 0 ? 'bg-ea-green' : 'bg-ea-magenta'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-ea-text truncate">{tx.reason || tx.type}</p>
                  <p className="font-mono text-[10px] text-ea-dim">{date.toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`font-mono text-sm font-bold flex-shrink-0 ${tx.delta > 0 ? 'text-ea-green' : 'text-ea-magenta'}`}>
                  {tx.delta > 0 ? '+' : ''}{tx.delta} EC
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue summary */}
      <div className="rounded-2xl p-5"
           style={{ background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.15)' }}>
        <h3 className="font-display font-bold text-ea-green text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Revenue Summary
        </h3>
        <div className="space-y-2">
          {[
            { label:'Total EC Deposited',   value:`${stats.totalDepositsEC.toLocaleString()} EC = ${formatINR(ecToINR(stats.totalDepositsEC))}` },
            { label:'Total EC Withdrawn',   value:`${stats.totalWithdrawEC.toLocaleString()} EC = ${formatINR(ecToINR(stats.totalWithdrawEC))}` },
            { label:'Platform Fee Earned',  value:`${stats.platformFeeEC.toLocaleString()} EC = ${formatINR(ecToINR(stats.platformFeeEC))}`, highlight:true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex items-center justify-between font-mono text-xs py-1.5 border-b border-ea-border/30 last:border-0
              ${highlight ? 'text-ea-green' : 'text-ea-muted'}`}>
              <span>{label}</span>
              <span className={highlight ? 'font-bold' : ''}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
