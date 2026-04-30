// src/pages/admin/AdminDashboard.jsx — 8 tabs: Payments, Matches, Create, KYC, Balances, Notify, Support, Analytics
import { useState }                from 'react';
import { Shield, Trophy, Zap, AlertTriangle, Bell, CreditCard, MessageSquare, BarChart2, CheckCircle, Users, FileText } from 'lucide-react';
import { useTournaments }          from '../../hooks/useTournaments';
import TournamentForm              from '../../components/admin/TournamentForm';
import WinnerForm                  from '../../components/admin/WinnerForm';
import BalanceManager              from '../../components/admin/BalanceManager';
import NotifyPanel                 from '../../components/admin/NotifyPanel';
import PaymentsPanel               from '../../components/admin/PaymentsPanel';
import KYCPanel                    from '../../components/admin/KYCPanel';
import SupportPanel                from '../../components/admin/SupportPanel';
import BlogPanel                   from '../../components/admin/BlogPanel';
import AnalyticsPanel              from '../../components/admin/AnalyticsPanel';
import { TableRowSkeleton }        from '../../components/common/LoadingSkeleton';
import { formatDistanceToNow }     from 'date-fns';

const TABS = [
  { id: 'payments',    label: 'Payments', icon: CreditCard    },
  { id: 'kyc',         label: 'KYC',      icon: Shield        },
  { id: 'support',     label: 'Support',  icon: MessageSquare },
  { id: 'tournaments', label: 'Matches',  icon: Trophy        },
  { id: 'create',      label: 'Create',   icon: Users         },
  { id: 'balance',     label: 'Balances', icon: Zap           },
  { id: 'notify',      label: 'Notify',   icon: Bell          },
  { id: 'blog',        label: 'Blog',     icon: FileText      },
  { id: 'analytics',   label: 'Analytics',icon: BarChart2     },
];

export default function AdminDashboard() {
  const { tournaments, loading, error } = useTournaments();
  const [activeTab, setActiveTab]       = useState('payments');
  const [managing,  setManaging]        = useState(null);

  const totals = {
    total:    tournaments.length,
    live:     tournaments.filter(t => t.status === 'live').length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    players:  tournaments.reduce((a, t) => a + (t.slots_filled || 0), 0),
  };

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto space-y-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ea-magenta/20 border border-ea-magenta/40
                            flex items-center justify-center shadow-magenta">
              <Shield className="w-5 h-5 text-ea-magenta" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-white">Admin Panel</h1>
              <p className="text-ea-muted text-xs font-mono">Protected — Admins only</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-ea-green/10 border border-ea-green/25
                          rounded-xl px-3 py-2 text-xs font-mono text-ea-green">
            <CheckCircle className="w-3.5 h-3.5" />
            Cloud Functions Active
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Matches', value: totals.total,    color: 'text-white'       },
            { label: 'Live Now',      value: totals.live,     color: 'text-ea-magenta'  },
            { label: 'Upcoming',      value: totals.upcoming, color: 'text-ea-green' },
            { label: 'Total Players', value: totals.players,  color: 'text-ea-cyan'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-ea-card border border-ea-border rounded-2xl p-4">
              <p className={`font-mono font-black text-3xl ${color}`}>{value}</p>
              <p className="text-ea-muted text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-1 bg-ea-card border border-ea-border rounded-2xl p-1.5 w-fit min-w-full sm:min-w-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm
                            font-display font-bold transition-all duration-200 whitespace-nowrap
                  ${activeTab === id
                    ? 'bg-ea-magenta text-white shadow-magenta'
                    : 'text-ea-muted hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'payments'  && <PaymentsPanel />}
        {activeTab === 'kyc'       && <div className="space-y-4"><KYCPanel /></div>}
        {activeTab === 'support'   && <SupportPanel />}
        {activeTab === 'create'    && <TournamentForm onCreated={() => setActiveTab('tournaments')} />}
        {activeTab === 'balance'   && <BalanceManager />}
        {activeTab === 'notify'    && <NotifyPanel />}
        {activeTab === 'blog'      && <BlogPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}

        {activeTab === 'tournaments' && (
          <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-ea-border flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">All Matches</h2>
              <span className="text-ea-green text-xs font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-ea-green rounded-full animate-pulse" />
                Real-time
              </span>
            </div>
            {error && (
              <div className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-ea-magenta mx-auto mb-2" />
                <p className="text-ea-magenta text-sm">{error}</p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ea-border">
                    {['Game','Status','Entry/Prize','Slots','Starts','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-ea-muted text-xs
                                             font-mono uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? <TableRowSkeleton rows={4} /> :
                   tournaments.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-ea-muted text-sm">
                      No tournaments yet. "Create" tab mein banao.
                    </td></tr>
                   ) : tournaments.map(t => {
                    const startDate = t.start_time?.toDate ? t.start_time.toDate() : new Date(t.start_time);
                    const fillPct   = Math.round(((t.slots_filled||0)/Math.max(1,t.slots_total))*100);
                    return (
                      <tr key={t.id} className="border-b border-ea-border/50 hover:bg-ea-deep/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium text-sm">{t.game_name}</p>
                          <p className="text-ea-muted text-xs font-mono">{t.id.slice(0,8)}…</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono border
                            ${t.status==='live'?'bg-ea-magenta/15 border-ea-magenta/30 text-ea-magenta'
                             :t.status==='upcoming'?'bg-ea-green/15 border-ea-green/30 text-ea-green'
                             :'bg-ea-dim/15 border-ea-dim/30 text-ea-muted'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-ea-gold font-mono text-sm whitespace-nowrap">
                            {t.entry_fee} / {t.prize_pool} EC
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-ea-border rounded-full overflow-hidden">
                              <div className="h-full bg-ea-cyan" style={{width:`${fillPct}%`}} />
                            </div>
                            <span className="text-white text-xs font-mono whitespace-nowrap">
                              {t.slots_filled}/{t.slots_total}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ea-muted text-xs font-mono whitespace-nowrap">
                          {formatDistanceToNow(startDate, { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setManaging(managing===t.id?null:t.id)}
                            className="px-3 py-1.5 bg-ea-border/50 border border-ea-border
                                       text-white text-xs font-mono rounded-lg hover:bg-ea-border
                                       transition-all whitespace-nowrap">
                            {managing===t.id ? 'Close' : 'Manage'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {managing && (() => {
              const t = tournaments.find(x => x.id === managing);
              return t ? (
                <div className="border-t border-ea-border p-6 animate-slide-up">
                  <WinnerForm tournament={t} onUpdated={() => setManaging(null)} />
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
